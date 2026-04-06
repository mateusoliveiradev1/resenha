import type { NextAuthConfig } from "next-auth";
import "./types";

type AuthToken = {
    id?: string;
    role?: "ADMIN" | "EDITOR";
};

export function createAuthConfig(secret?: string) {
    return {
        secret,
        trustHost: true,
        providers: [],
        pages: {
            signIn: "/login",
        },
        callbacks: {
            authorized({ auth, request: { nextUrl } }) {
                const isLoggedIn = !!auth?.user;
                const isOnLogin = nextUrl.pathname.startsWith("/login");

                if (isOnLogin) {
                    if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
                    return true;
                }

                return isLoggedIn; // All other pages require auth in admin
            },
            jwt({ token, user }) {
                const authToken = token as typeof token & AuthToken;

                if (user) {
                    authToken.id = user.id! as string;
                    authToken.role = (user as any).role as "ADMIN" | "EDITOR";
                }
                return authToken;
            },
            session({ session, token }) {
                const authToken = token as typeof token & AuthToken;

                if (token && session.user) {
                    session.user.id = authToken.id as string;
                    session.user.role = authToken.role as "ADMIN" | "EDITOR";
                }
                return session;
            },
        },
    } satisfies NextAuthConfig;
}
