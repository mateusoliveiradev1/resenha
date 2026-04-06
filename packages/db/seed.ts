import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashSync } from "bcryptjs";
import { users } from "./src/schema/users";

const DATABASE_URL = process.env.DATABASE_URL!;

async function seed() {
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql);

    console.log("🌱 Seeding admin account...");

    const passwordHash = hashSync("admin123", 12);

    const [admin] = await db
        .insert(users)
        .values({
            email: "admin@resenharfc.com.br",
            passwordHash,
            name: "Admin",
            role: "ADMIN",
        })
        .onConflictDoUpdate({
            target: users.email,
            set: { passwordHash, name: "Admin", role: "ADMIN" },
        })
        .returning();

    console.log("✅ Admin account created:");
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log("\n🔐 Login credentials:");
    console.log("   Email: admin@resenharfc.com.br");
    console.log("   Password: admin123");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
