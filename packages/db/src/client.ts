import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { getRuntimeEnv } from "./runtimeEnv";

function createDb() {
    const url = getRuntimeEnv("DATABASE_URL");

    if (!url) {
        throw new Error("DATABASE_URL environment variable is required.");
    }

    const sql = neon(url);
    return drizzle(sql, { schema });
}

let cachedDb: ReturnType<typeof createDb> | null = null;

export function getDb() {
    if (!cachedDb) {
        cachedDb = createDb();
    }

    return cachedDb;
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
    get(_target, prop, receiver) {
        const target = getDb() as unknown as Record<PropertyKey, unknown>;
        const value = Reflect.get(target, prop, receiver);

        return typeof value === "function" ? value.bind(target) : value;
    },
});
