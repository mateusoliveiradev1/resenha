import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

let didLoadLocalEnv = false;
const ENV_FILENAMES = [
    ".env.local",
    ".env.development.local",
    ".env.development",
    ".env",
] as const;
const APP_NAMES = ["admin", "web"] as const;

function parseEnvValue(rawValue: string) {
    const trimmed = rawValue.trim();

    if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1);
    }

    return trimmed;
}

function loadLocalEnvFiles() {
    if (didLoadLocalEnv) {
        return;
    }

    didLoadLocalEnv = true;
    const workspaceRoot = findWorkspaceRoot();
    const appNames = getAppSearchOrder();

    const candidates = Array.from(
        new Set([
            ...appNames.flatMap((appName) =>
                ENV_FILENAMES.map((fileName) =>
                    resolve(workspaceRoot, "apps", appName, fileName)
                )
            ),
            ...ENV_FILENAMES.map((fileName) => resolve(workspaceRoot, fileName)),
        ])
    );

    for (const filePath of candidates) {
        if (!existsSync(filePath)) {
            continue;
        }

        const content = readFileSync(filePath, "utf8");

        for (const line of content.split(/\r?\n/)) {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith("#")) {
                continue;
            }

            const separatorIndex = trimmed.indexOf("=");

            if (separatorIndex <= 0) {
                continue;
            }

            const key = trimmed.slice(0, separatorIndex).trim();

            if (!key || process.env[key]) {
                continue;
            }

            process.env[key] = parseEnvValue(trimmed.slice(separatorIndex + 1));
        }
    }
}

function findWorkspaceRoot() {
    let currentDir = resolve(process.cwd());

    while (true) {
        const hasWorkspaceFile = existsSync(resolve(currentDir, "pnpm-workspace.yaml"));
        const hasAppsDir = existsSync(resolve(currentDir, "apps"));
        const hasPackagesDir = existsSync(resolve(currentDir, "packages"));

        if (hasWorkspaceFile && hasAppsDir && hasPackagesDir) {
            return currentDir;
        }

        const parentDir = dirname(currentDir);

        if (parentDir === currentDir) {
            return resolve(process.cwd());
        }

        currentDir = parentDir;
    }
}

function getAppSearchOrder() {
    const normalizedCwd = resolve(process.cwd()).replaceAll("\\", "/").toLowerCase();
    const preferredApp = APP_NAMES.find((appName) =>
        normalizedCwd.includes(`/apps/${appName}`)
    );

    if (!preferredApp) {
        return [...APP_NAMES];
    }

    return [preferredApp, ...APP_NAMES.filter((appName) => appName !== preferredApp)];
}

export function getRuntimeEnv(name: string) {
    if (!process.env[name]) {
        loadLocalEnvFiles();
    }

    return process.env[name];
}
