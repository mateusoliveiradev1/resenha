"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, FormField, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@resenha/ui";
import { LoginSchema } from "@resenha/validators";
import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [loading, setLoading] = React.useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof LoginSchema>>({
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
                // Should show error toast here natively
                console.error("Login failed", result.error);
                setLoading(false);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            console.error("Unexpected login error", error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-navy-950 relative p-4">
            {/* Decorative background */}
            <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-gold-400/5 blur-[100px]" />
            </div>

            <div className="w-full max-w-md z-10 relative">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative h-24 w-24 mb-6">
                        <Image src="/logo2.png" alt="Resenha FC" fill sizes="96px" className="object-contain drop-shadow-2xl" />
                    </div>
                    <h1 className="font-display text-4xl font-extrabold text-cream-100 uppercase tracking-wide">
                        RESENHA<span className="text-blue-500">FC</span>
                    </h1>
                    <p className="text-sm font-medium text-cream-300 mt-2 tracking-widest uppercase">Admin System</p>
                </div>

                <Card className="border-navy-800 bg-navy-900/80 backdrop-blur-md shadow-2xl p-2">
                    <CardHeader className="text-center pb-8 border-b border-navy-800/50 mb-6 mx-4">
                        <CardTitle className="text-2xl text-cream-100">Acesso Restrito</CardTitle>
                        <CardDescription>Insira suas credenciais para entrar no sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                                placeholder="••••••••"
                                {...register("password")}
                                error={!!errors.password}
                                errorMessage={errors.password?.message}
                            />

                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full mt-8 font-bold tracking-wide shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                disabled={loading}
                            >
                                {loading ? "Autenticando..." : (
                                    <>
                                        Acessar Painel <LogIn className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-navy-700 mt-8 font-medium">
                    Dúvidas? Fale com o diretor de tecnologia.
                </p>
            </div>
        </div>
    );
}
