import { createAuth } from "@resenha/auth";
import { getRuntimeEnv } from "@/lib/runtimeEnv";

const authSecret = getRuntimeEnv("AUTH_SECRET") ?? getRuntimeEnv("NEXTAUTH_SECRET");

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = createAuth(authSecret);
