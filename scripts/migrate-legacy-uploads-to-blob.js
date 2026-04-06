const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { createRequire } = require("node:module");

const repoRoot = path.resolve(__dirname, "..");
const storageRoot = path.join(repoRoot, "storage", "uploads");

const adminRequire = createRequire(path.join(repoRoot, "apps", "admin", "package.json"));
const dbRequire = createRequire(path.join(repoRoot, "packages", "db", "package.json"));

const { put } = adminRequire("@vercel/blob");
const { neon } = dbRequire("@neondatabase/serverless");

const contentTypes = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp"
};

const sources = [
    {
        key: "sponsors",
        selectSql: "select id, name, logo_url as url from sponsors where logo_url like '/uploads/%' order by name",
        countSql: "select count(*)::int as count from sponsors where logo_url like '/uploads/%'",
        updateSql: "update sponsors set logo_url = $1 where id = $2"
    },
    {
        key: "players",
        selectSql: "select id, name, photo_url as url from players where photo_url like '/uploads/%' order by name",
        countSql: "select count(*)::int as count from players where photo_url like '/uploads/%'",
        updateSql: "update players set photo_url = $1 where id = $2"
    },
    {
        key: "posts",
        selectSql: "select id, title as name, cover_image as url from posts where cover_image like '/uploads/%' order by title",
        countSql: "select count(*)::int as count from posts where cover_image like '/uploads/%'",
        updateSql: "update posts set cover_image = $1 where id = $2"
    },
    {
        key: "matches",
        selectSql: "select id, opponent as name, opponent_logo as url from matches where opponent_logo like '/uploads/%' order by opponent",
        countSql: "select count(*)::int as count from matches where opponent_logo like '/uploads/%'",
        updateSql: "update matches set opponent_logo = $1 where id = $2"
    },
    {
        key: "gallery",
        selectSql: "select id, caption as name, url from gallery where url like '/uploads/%' order by caption",
        countSql: "select count(*)::int as count from gallery where url like '/uploads/%'",
        updateSql: "update gallery set url = $1 where id = $2"
    }
];

function loadEnvFile(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
        return {};
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const pairs = raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
            const separatorIndex = line.indexOf("=");
            const key = line.slice(0, separatorIndex);
            let value = line.slice(separatorIndex + 1);

            if (value.startsWith("\"") && value.endsWith("\"")) {
                value = value.slice(1, -1);
            }

            return [key, value];
        });

    return Object.fromEntries(pairs);
}

function resolveBlobToken() {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
        return process.env.BLOB_READ_WRITE_TOKEN;
    }

    const candidateFiles = [
        path.join(repoRoot, "apps", "admin", ".vercel", ".env.preview.local"),
        path.join(repoRoot, ".vercel-prune", "admin", ".vercel", ".env.preview.local"),
        path.join(repoRoot, ".vercel", ".env.preview.local")
    ];

    for (const filePath of candidateFiles) {
        const env = loadEnvFile(filePath);

        if (env.BLOB_READ_WRITE_TOKEN) {
            return env.BLOB_READ_WRITE_TOKEN;
        }
    }

    return undefined;
}

function resolveDatabaseUrl() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }

    const env = loadEnvFile(path.join(repoRoot, ".env"));
    return env.DATABASE_URL;
}

function getContentType(filePath) {
    return contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function toBlobPath(legacyUrl) {
    return legacyUrl.replace(/^\/uploads\//, "");
}

function toLocalPath(legacyUrl) {
    return path.join(storageRoot, toBlobPath(legacyUrl));
}

async function migrateSource(sql, source, blobToken, options) {
    const rows = await sql(source.selectSql);
    const summary = {
        source: source.key,
        found: rows.length,
        migrated: 0,
        missing: [],
        failed: []
    };

    for (const row of rows) {
        const localPath = toLocalPath(row.url);
        const blobPath = toBlobPath(row.url);

        if (!fs.existsSync(localPath)) {
            summary.missing.push({ id: row.id, name: row.name, path: blobPath });
            continue;
        }

        try {
            if (options.dryRun) {
                summary.migrated += 1;
                continue;
            }

            const buffer = await fsp.readFile(localPath);
            const blob = await put(blobPath, buffer, {
                access: "public",
                addRandomSuffix: false,
                allowOverwrite: true,
                contentType: getContentType(localPath),
                token: blobToken
            });

            await sql(source.updateSql, [blob.url, row.id]);
            summary.migrated += 1;
        } catch (error) {
            summary.failed.push({
                id: row.id,
                name: row.name,
                path: blobPath,
                message: error instanceof Error ? error.message : String(error)
            });
        }
    }

    return summary;
}

async function main() {
    const dryRun = process.argv.includes("--dry-run");
    const databaseUrl = resolveDatabaseUrl();
    const blobToken = resolveBlobToken();

    if (!databaseUrl) {
        throw new Error("DATABASE_URL nao encontrado. Defina a variavel ou mantenha o .env na raiz do projeto.");
    }

    if (!blobToken) {
        throw new Error(
            "BLOB_READ_WRITE_TOKEN nao encontrado. Rode `vercel pull --environment=preview` no projeto admin ou exporte a variavel antes de executar."
        );
    }

    const sql = neon(databaseUrl);
    const results = [];

    for (const source of sources) {
        results.push(await migrateSource(sql, source, blobToken, { dryRun }));
    }

    const remaining = {};
    for (const source of sources) {
        const countResult = await sql(source.countSql);
        remaining[source.key] = countResult[0]?.count ?? 0;
    }

    console.log(
        JSON.stringify(
            {
                dryRun,
                results,
                remainingLegacyUrls: remaining
            },
            null,
            2
        )
    );
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
