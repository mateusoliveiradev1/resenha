import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, users } from "@resenha/db";
import { createAuthConfig } from "./config";
import "./types";

export function createAuth(secret?: string) {
    return NextAuth({
        ...createAuthConfig(secret),
        trustHost: true,
        session: { strategy: "jwt" },
        providers: [
            CredentialsProvider({
                name: "credentials",
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" },
                },
                async authorize(credentials) {
                    if (!credentials?.email || !credentials?.password) return null;

                    const [user] = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, credentials.email as string))
                        .limit(1);

                    if (!user) return null;

                    const isValid = await compare(
                        credentials.password as string,
                        user.passwordHash
                    );

                    if (!isValid) return null;

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                },
            }),
        ],
    });
}
