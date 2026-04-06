"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, FormField } from "@resenha/ui";
import { LoginSchema } from "@resenha/validators";
import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
    });

    const router = useRouter();

    const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                console.error("Login failed", result.error);
                setLoading(false);
                return;
            }

            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Unexpected login error", error);
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-y-auto bg-navy-950 px-4 py-6 sm:flex sm:items-center sm:justify-center sm:py-10">
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-[100px] sm:h-96 sm:w-96" />
                <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-gold-400/5 blur-[100px] sm:h-96 sm:w-96" />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[22rem] sm:max-w-md">
                <div className="mb-6 flex flex-col items-center sm:mb-8">
                    <div className="relative mb-5 h-20 w-20 sm:mb-6 sm:h-24 sm:w-24">
                        <Image src="/logo2.png" alt="Resenha FC" fill sizes="96px" className="object-contain drop-shadow-2xl" />
                    </div>

                    <h1 className="text-center font-display text-3xl font-extrabold uppercase tracking-wide text-cream-100 sm:text-4xl">
                        RESENHA<span className="text-blue-500">FC</span>
                    </h1>
                    <p className="mt-2 text-center text-xs font-medium uppercase tracking-[0.35em] text-cream-300 sm:text-sm">
                        Admin System
                    </p>
                </div>

                <Card className="border-navy-800 bg-navy-900/85 p-2 shadow-2xl backdrop-blur-md">
                    <CardHeader className="mx-2 mb-4 border-b border-navy-800/50 px-4 pb-6 pt-5 text-center sm:mx-4 sm:mb-6 sm:px-6 sm:pb-8">
                        <CardTitle className="text-2xl text-cream-100 sm:text-[2rem]">Acesso Restrito</CardTitle>
                        <CardDescription className="mx-auto max-w-sm text-sm leading-6 text-cream-300">
                            Insira suas credenciais para entrar no sistema.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                            <FormField
                                id="email"
                                label="E-mail"
                                type="email"
                                placeholder="admin@resenharfc.com.br"
                                {...register("email")}
                                error={!!errors.email}
                                errorMessage={errors.email?.message}
                            />

                            <FormField
                                id="password"
                                label="Senha"
                                type="password"
                                placeholder="********"
                                {...register("password")}
                                error={!!errors.password}
                                errorMessage={errors.password?.message}
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="mt-2 min-h-12 w-full rounded-xl font-bold tracking-wide shadow-[0_0_18px_rgba(37,99,235,0.25)]"
                                disabled={loading}
                            >
                                {loading ? (
                                    "Autenticando..."
                                ) : (
                                    <>
                                        Acessar Painel <LogIn className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="mt-6 text-center text-xs font-medium text-cream-300/55 sm:mt-8">
                    Duvidas? Fale com o diretor de tecnologia.
                </p>
            </div>
        </div>
    );
}
