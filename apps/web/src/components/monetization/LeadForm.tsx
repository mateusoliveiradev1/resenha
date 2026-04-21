"use client";

import * as React from "react";
import { Badge, Button, Card, CardContent, FormField, cn } from "@resenha/ui";
import { AlertCircle, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { trackMonetizationEvent, type MonetizationEventName } from "@/lib/analytics";

export type LeadFormVariant = "support" | "commercial";

export interface LeadFormValues {
    name: string;
    company: string;
    whatsapp: string;
    email: string;
    city: string;
    supportType: string;
    supportDescription: string;
    advertisingOption: string;
    businessType: string;
    instagramOrSite: string;
    message: string;
    contactConsent: boolean;
}

type LeadFormErrors = Partial<Record<keyof LeadFormValues, string>>;

interface LeadFormProps {
    variant: LeadFormVariant;
    source?: string;
    className?: string;
    onSubmitLead?: (values: LeadFormValues) => Promise<void> | void;
}

const initialValues: LeadFormValues = {
    name: "",
    company: "",
    whatsapp: "",
    email: "",
    city: "",
    supportType: "",
    supportDescription: "",
    advertisingOption: "",
    businessType: "",
    instagramOrSite: "",
    message: "",
    contactConsent: false
};

const supportTypeOptions = [
    "Apoio pontual",
    "Apoio recorrente",
    "Patrocinio institucional",
    "Produto ou servico",
    "Quero conversar antes"
];

const advertisingOptions = [
    "Aparecer no Resenha",
    "Materia com oferecimento",
    "Parceiro da rodada",
    "Destaque maior",
    "Quero conversar antes"
];

function getDigits(value: string) {
    return value.replace(/\D/g, "");
}

function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateInstagramOrSite(value: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return true;
    }

    if (/^@[a-zA-Z0-9._]{2,30}$/.test(trimmedValue)) {
        return true;
    }

    try {
        const url = new URL(trimmedValue);

        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function validateValues(values: LeadFormValues, variant: LeadFormVariant): LeadFormErrors {
    const errors: LeadFormErrors = {};

    if (values.name.trim().length < 2) {
        errors.name = "Informe seu nome para sabermos com quem falar.";
    }

    if (variant === "commercial" && values.company.trim().length < 2) {
        errors.company = "Informe o nome da empresa ou marca.";
    }

    if (getDigits(values.whatsapp).length < 10) {
        errors.whatsapp = "Informe um WhatsApp valido com DDD.";
    }

    if (values.email.trim() && !validateEmail(values.email.trim())) {
        errors.email = "Informe um e-mail valido ou deixe o campo em branco.";
    }

    if (variant === "support") {
        if (!values.supportType) {
            errors.supportType = "Escolha uma forma de apoio ou selecione Quero conversar antes.";
        }

        if (values.supportDescription.trim().length < 8) {
            errors.supportDescription = "Escreva em poucas palavras como voce imagina o apoio.";
        }
    }

    if (variant === "commercial" && !values.advertisingOption) {
        errors.advertisingOption = "Escolha uma opcao de divulgacao ou selecione Quero conversar antes.";
    }

    if (values.instagramOrSite.trim() && !validateInstagramOrSite(values.instagramOrSite)) {
        errors.instagramOrSite = "Informe um @perfil ou uma URL completa com https://.";
    }

    if (values.supportDescription.length > 800) {
        errors.supportDescription = "Use no maximo 800 caracteres.";
    }

    if (values.message.length > 800) {
        errors.message = "Use no maximo 800 caracteres.";
    }

    if (!values.contactConsent) {
        errors.contactConsent = "Confirme que podemos entrar em contato sobre este interesse.";
    }

    return errors;
}

function getCopy(variant: LeadFormVariant) {
    if (variant === "support") {
        return {
            eyebrow: "Apoio ao clube",
            title: "Fale com o Resenha sobre apoio ao clube",
            description: "Conte rapidamente como voce quer ajudar. A gente retorna pelo WhatsApp para entender o melhor formato.",
            button: "Enviar interesse de apoio",
            success: "Recebemos seu interesse em apoiar o Resenha. Em breve vamos chamar no WhatsApp para conversar com calma sobre o melhor formato.",
            unavailable: "O formulario esta temporariamente indisponivel. Chame o Resenha pelo WhatsApp ou use a pagina de contato para continuar a conversa."
        };
    }

    return {
        eyebrow: "Contato comercial",
        title: "Prefere deixar seus dados?",
        description: "Envie um contato curto e o Resenha chama voce no WhatsApp para mostrar onde sua empresa pode aparecer.",
        button: "Enviar interesse comercial",
        success: "Recebemos seu interesse comercial. Em breve vamos chamar no WhatsApp para mostrar os espacos e combinar um formato simples.",
        unavailable: "O formulario esta temporariamente indisponivel. Chame o Resenha pelo WhatsApp ou use a pagina de contato para continuar a conversa."
    };
}

function SelectField({
    id,
    label,
    value,
    options,
    error,
    onFocus,
    onChange
}: {
    id: keyof LeadFormValues;
    label: string;
    value: string;
    options: string[];
    error?: string;
    onFocus?: () => void;
    onChange: (name: keyof LeadFormValues, value: string) => void;
}) {
    const describedBy = error ? `${id}-error` : undefined;

    return (
        <div className="space-y-2">
            <label htmlFor={id} className={cn("text-sm font-medium leading-none", error ? "text-red-500" : "text-cream-100")}>
                {label}
            </label>
            <select
                id={id}
                name={id}
                value={value}
                onFocus={onFocus}
                onChange={(event) => onChange(id, event.target.value)}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={describedBy}
                className={cn(
                    "flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 ring-offset-navy-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    error && "border-red-500 focus-visible:ring-red-500"
                )}
            >
                <option value="">Selecione uma opcao</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            {error && (
                <p id={`${id}-error`} className="text-[0.8rem] font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

function TextareaField({
    id,
    label,
    value,
    error,
    placeholder,
    required,
    onFocus,
    onChange
}: {
    id: keyof LeadFormValues;
    label: string;
    value: string;
    error?: string;
    placeholder?: string;
    required?: boolean;
    onFocus?: () => void;
    onChange: (name: keyof LeadFormValues, value: string) => void;
}) {
    const describedBy = error ? `${id}-error` : undefined;

    return (
        <div className="space-y-2">
            <label htmlFor={id} className={cn("text-sm font-medium leading-none", error ? "text-red-500" : "text-cream-100")}>
                {label}
            </label>
            <textarea
                id={id}
                name={id}
                value={value}
                onFocus={onFocus}
                onChange={(event) => onChange(id, event.target.value)}
                rows={4}
                maxLength={800}
                required={required}
                placeholder={placeholder}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={describedBy}
                className={cn(
                    "min-h-28 w-full resize-y rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 placeholder:text-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    error && "border-red-500 focus-visible:ring-red-500"
                )}
            />
            {error && (
                <p id={`${id}-error`} className="text-[0.8rem] font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

function getFormEventName(variant: LeadFormVariant, state: "start" | "submit" | "success" | "error"): MonetizationEventName {
    return `${variant === "support" ? "support" : "partner"}_form_${state}` as MonetizationEventName;
}

async function submitLeadToApi(variant: LeadFormVariant, source: string, values: LeadFormValues) {
    const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            variant,
            source,
            values
        })
    });

    if (!response.ok) {
        throw new Error("Lead submission failed.");
    }
}

export function LeadForm({ variant, source = "lead_form", className, onSubmitLead }: LeadFormProps) {
    const formRef = React.useRef<HTMLFormElement>(null);
    const didTrackStartRef = React.useRef(false);
    const [values, setValues] = React.useState<LeadFormValues>(initialValues);
    const [errors, setErrors] = React.useState<LeadFormErrors>({});
    const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
    const [statusMessage, setStatusMessage] = React.useState("");
    const copy = getCopy(variant);

    function trackFormEvent(state: "start" | "submit" | "success" | "error", extra: Record<string, string | number | boolean> = {}) {
        trackMonetizationEvent(getFormEventName(variant, state), {
            journey: variant,
            source,
            ...extra
        });
    }

    function trackStartOnce() {
        if (didTrackStartRef.current) {
            return;
        }

        didTrackStartRef.current = true;
        trackFormEvent("start");
    }

    function updateValue(name: keyof LeadFormValues, value: string | boolean) {
        trackStartOnce();
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => {
            if (!current[name]) {
                return current;
            }

            const next = { ...current };
            delete next[name];
            return next;
        });
        setStatus("idle");
        setStatusMessage("");
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nextErrors = validateValues(values, variant);
        setErrors(nextErrors);

        const firstError = Object.keys(nextErrors)[0] as keyof LeadFormValues | undefined;
        if (firstError) {
            trackFormEvent("error", {
                reason: "validation",
                field: firstError
            });
            window.requestAnimationFrame(() => {
                const firstErrorElement = formRef.current?.querySelector<HTMLElement>(`[name="${firstError}"]`);

                firstErrorElement?.scrollIntoView({ behavior: "smooth", block: "center" });
                firstErrorElement?.focus({ preventScroll: true });
            });
            return;
        }

        setStatus("submitting");
        setStatusMessage("");
        trackFormEvent("submit");

        try {
            if (onSubmitLead) {
                await onSubmitLead(values);
            } else {
                await submitLeadToApi(variant, source, values);
            }

            setStatus("success");
            setStatusMessage(copy.success);
            trackFormEvent("success");
        } catch (error) {
            setStatus("error");
            setStatusMessage("Nao conseguimos enviar agora. Seus dados continuam no formulario para tentar novamente.");
            trackFormEvent("error", {
                reason: error instanceof Error ? error.message : "submission_failed"
            });
        }
    }

    return (
        <Card variant="glass" className={cn("border-cream-100/8", className)}>
            <CardContent className="p-6 lg:p-8">
                <Badge variant={variant === "support" ? "gold" : "accent"} className="mb-4">
                    {copy.eyebrow}
                </Badge>
                <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">{copy.title}</h2>
                <p className="mt-3 text-sm leading-7 text-cream-300">{copy.description}</p>

                <form
                    ref={formRef}
                    className="mt-6 space-y-5"
                    noValidate
                    onSubmit={handleSubmit}
                    data-monetization-event="lead_form"
                    data-journey={variant}
                    data-source={source}
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <FormField
                            id={`${variant}-lead-name`}
                            name="name"
                            label="Nome"
                            value={values.name}
                            onChange={(event) => updateValue("name", event.target.value)}
                            errorMessage={errors.name}
                            placeholder="Seu nome"
                            autoComplete="name"
                            required
                            onFocus={trackStartOnce}
                        />
                        <FormField
                            id={`${variant}-lead-whatsapp`}
                            name="whatsapp"
                            label="WhatsApp"
                            type="tel"
                            value={values.whatsapp}
                            onChange={(event) => updateValue("whatsapp", event.target.value)}
                            errorMessage={errors.whatsapp}
                            placeholder="(11) 99999-9999"
                            autoComplete="tel"
                            required
                            onFocus={trackStartOnce}
                        />
                    </div>

                    {variant === "support" ? (
                        <>
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    id="support-lead-company"
                                    name="company"
                                    label="Empresa ou projeto"
                                    value={values.company}
                                    onChange={(event) => updateValue("company", event.target.value)}
                                    placeholder="Opcional"
                                    onFocus={trackStartOnce}
                                />
                                <FormField
                                    id="support-lead-email"
                                    name="email"
                                    label="E-mail"
                                    type="email"
                                    value={values.email}
                                    onChange={(event) => updateValue("email", event.target.value)}
                                    errorMessage={errors.email}
                                    placeholder="voce@email.com"
                                    autoComplete="email"
                                    onFocus={trackStartOnce}
                                />
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    id="support-lead-city"
                                    name="city"
                                    label="Cidade/regiao"
                                    value={values.city}
                                    onChange={(event) => updateValue("city", event.target.value)}
                                    placeholder="Opcional"
                                    onFocus={trackStartOnce}
                                />
                                <SelectField
                                    id="supportType"
                                    label="Tipo de apoio"
                                    value={values.supportType}
                                    options={supportTypeOptions}
                                    error={errors.supportType}
                                    onFocus={trackStartOnce}
                                    onChange={updateValue}
                                />
                            </div>
                            <TextareaField
                                id="supportDescription"
                                label="Como quer apoiar?"
                                value={values.supportDescription}
                                error={errors.supportDescription}
                                placeholder="Ex: Tenho interesse em apoiar materiais de jogo ou conversar sobre patrocinio do time."
                                required
                                onFocus={trackStartOnce}
                                onChange={updateValue}
                            />
                            <TextareaField
                                id="message"
                                label="Mensagem adicional"
                                value={values.message}
                                placeholder="Opcional"
                                error={errors.message}
                                onFocus={trackStartOnce}
                                onChange={updateValue}
                            />
                        </>
                    ) : (
                        <>
                            <div className="grid gap-5 md:grid-cols-2">
                                <FormField
                                    id="commercial-lead-company"
                                    name="company"
                                    label="Empresa"
                                    value={values.company}
                                    onChange={(event) => updateValue("company", event.target.value)}
                                    errorMessage={errors.company}
                                    placeholder="Nome da empresa"
                                    required
                                    onFocus={trackStartOnce}
                                />
                                <FormField
                                    id="commercial-lead-business-type"
                                    name="businessType"
                                    label="Tipo de negocio"
                                    value={values.businessType}
                                    onChange={(event) => updateValue("businessType", event.target.value)}
                                    placeholder="Ex: pizzaria, loja, academia"
                                    onFocus={trackStartOnce}
                                />
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                <SelectField
                                    id="advertisingOption"
                                    label="Opcao desejada"
                                    value={values.advertisingOption}
                                    options={advertisingOptions}
                                    error={errors.advertisingOption}
                                    onFocus={trackStartOnce}
                                    onChange={updateValue}
                                />
                                <FormField
                                    id="commercial-lead-instagram"
                                    name="instagramOrSite"
                                    label="Instagram ou site"
                                    value={values.instagramOrSite}
                                    onChange={(event) => updateValue("instagramOrSite", event.target.value)}
                                    placeholder="@empresa ou https://..."
                                    errorMessage={errors.instagramOrSite}
                                    onFocus={trackStartOnce}
                                />
                            </div>
                            <TextareaField
                                id="message"
                                label="Mensagem"
                                value={values.message}
                                error={errors.message}
                                placeholder="Ex: Quero entender onde minha empresa pode aparecer no site do Resenha."
                                onFocus={trackStartOnce}
                                onChange={updateValue}
                            />
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="flex items-start gap-3 rounded-2xl border border-cream-100/8 bg-navy-950/50 p-4 text-sm leading-6 text-cream-300">
                            <input
                                name="contactConsent"
                                type="checkbox"
                                checked={values.contactConsent}
                                onChange={(event) => updateValue("contactConsent", event.target.checked)}
                                aria-invalid={errors.contactConsent ? "true" : "false"}
                                aria-describedby={errors.contactConsent ? "contactConsent-error" : undefined}
                                className="mt-1 h-4 w-4 rounded border-navy-700 bg-navy-900 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Confirmo que o Resenha pode entrar em contato sobre este interesse.</span>
                        </label>
                        {errors.contactConsent && (
                            <p id="contactConsent-error" className="text-[0.8rem] font-medium text-red-500">
                                {errors.contactConsent}
                            </p>
                        )}
                    </div>

                    {statusMessage && (
                        <div
                            role="status"
                            className={cn(
                                "flex gap-3 rounded-2xl border p-4 text-sm leading-7",
                                status === "success"
                                    ? "border-green-400/20 bg-green-500/10 text-green-200"
                                    : "border-red-400/20 bg-red-500/10 text-red-200"
                            )}
                        >
                            {status === "success" ? (
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                            ) : (
                                <AlertCircle className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                            )}
                            <span>{statusMessage}</span>
                        </div>
                    )}

                    <Button type="submit" size="lg" className="w-full rounded-full" disabled={status === "submitting"}>
                        {status === "submitting" ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                Enviando
                            </>
                        ) : (
                            <>
                                {copy.button}
                                <MessageCircle className="ml-2 h-4 w-4" aria-hidden="true" />
                            </>
                        )}
                    </Button>
                    <p className="text-xs leading-6 text-cream-300">
                        Sem compromisso. A conversa serve para entender o melhor formato antes de qualquer combinacao.
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
