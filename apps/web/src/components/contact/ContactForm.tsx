"use client";

import * as React from "react";
import { Badge, Button, Card, CardContent, FormField, cn } from "@resenha/ui";
import { AlertCircle, CheckCircle2, Mail, MessageCircle, Send } from "lucide-react";
import {
    CONTACT_INTENTS,
    type ContactChannelId,
    buildMailtoHref,
    buildWhatsAppHref,
    resolveContactChannelForSubject
} from "@/lib/contact";
import { trackMonetizationEvent } from "@/lib/analytics";

type PreferredChannel = "whatsapp" | "email";

type ContactFormValues = {
    name: string;
    whatsapp: string;
    email: string;
    subject: string;
    message: string;
    preferredChannel: PreferredChannel;
    contactConsent: boolean;
};

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

type GeneratedAction = {
    channel: PreferredChannel;
    href: string;
    label: string;
    destination: string;
    displayDestination: string;
    contactChannelId: ContactChannelId;
};

const initialValues: ContactFormValues = {
    name: "",
    whatsapp: "",
    email: "",
    subject: "",
    message: "",
    preferredChannel: "whatsapp",
    contactConsent: false
};

const fieldOrder: Array<keyof ContactFormValues> = [
    "name",
    "whatsapp",
    "email",
    "subject",
    "message",
    "preferredChannel",
    "contactConsent"
];

const subjectOptions = CONTACT_INTENTS.map((intent) => intent.title);

function getDigits(value: string) {
    return value.replace(/\D/g, "");
}

function isValidWhatsApp(value: string) {
    const digits = getDigits(value);

    return digits.length >= 10 && digits.length <= 13;
}

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validateValues(values: ContactFormValues): ContactFormErrors {
    const errors: ContactFormErrors = {};
    const hasWhatsAppValue = values.whatsapp.trim().length > 0;
    const hasEmailValue = values.email.trim().length > 0;
    const hasValidWhatsApp = hasWhatsAppValue && isValidWhatsApp(values.whatsapp);
    const hasValidEmail = hasEmailValue && isValidEmail(values.email);

    if (values.name.trim().length < 2) {
        errors.name = "Informe seu nome para o Resenha saber com quem falar.";
    }

    if (hasWhatsAppValue && !hasValidWhatsApp) {
        errors.whatsapp = "Informe um WhatsApp valido com DDD.";
    }

    if (hasEmailValue && !hasValidEmail) {
        errors.email = "Informe um e-mail valido.";
    }

    if (!hasValidWhatsApp && !hasValidEmail && !errors.whatsapp && !errors.email) {
        errors.whatsapp = "Informe pelo menos um WhatsApp ou e-mail valido para retorno.";
    }

    if (!values.subject) {
        errors.subject = "Escolha o assunto da conversa.";
    }

    if (values.message.trim().length < 10) {
        errors.message = "Escreva uma mensagem com pelo menos 10 caracteres.";
    }

    if (values.message.length > 900) {
        errors.message = "Use no maximo 900 caracteres.";
    }

    if (!values.contactConsent) {
        errors.contactConsent = "Confirme que o Resenha pode entrar em contato sobre esta mensagem.";
    }

    return errors;
}

function getFirstInvalidField(errors: ContactFormErrors) {
    return fieldOrder.find((field) => errors[field]);
}

function getReturnContact(values: ContactFormValues) {
    const contacts = [];

    if (isValidWhatsApp(values.whatsapp)) {
        contacts.push(`WhatsApp: ${values.whatsapp.trim()}`);
    }

    if (isValidEmail(values.email)) {
        contacts.push(`E-mail: ${values.email.trim()}`);
    }

    return contacts.join(" | ");
}

function buildGeneratedMessage(values: ContactFormValues) {
    return [
        "Oi, Resenha!",
        "",
        "Vim pelo formulario de contato do site.",
        "",
        `Nome: ${values.name.trim()}`,
        `Contato de retorno: ${getReturnContact(values)}`,
        `Assunto: ${values.subject}`,
        "",
        "Mensagem:",
        values.message.trim()
    ].join("\n");
}

function buildGeneratedAction(values: ContactFormValues): GeneratedAction {
    const body = buildGeneratedMessage(values);
    const contactChannel = resolveContactChannelForSubject(values.subject);

    if (values.preferredChannel === "email") {
        return {
            channel: "email",
            href: buildMailtoHref({
                subject: `${values.subject} - contato pelo site do Resenha RFC`,
                body,
                channelId: contactChannel.id
            }),
            label: "Abrir e-mail novamente",
            destination: contactChannel.email,
            displayDestination: contactChannel.email,
            contactChannelId: contactChannel.id
        };
    }

    return {
        channel: "whatsapp",
        href: buildWhatsAppHref(body, contactChannel.id),
        label: "Abrir WhatsApp novamente",
        destination: contactChannel.whatsappNumber,
        displayDestination: contactChannel.displayPhone,
        contactChannelId: contactChannel.id
    };
}

function getGeneratedActionLabel(action: GeneratedAction) {
    return action.channel === "whatsapp" ? "Formulario de contato - WhatsApp" : "Formulario de contato - e-mail";
}

function trackGeneratedAction(action: GeneratedAction, values: ContactFormValues) {
    trackMonetizationEvent("monetization_cta_click", {
        label: getGeneratedActionLabel(action),
        source: "contact_form",
        destination: action.destination,
        context: values.subject,
        journey: "general",
        channel: action.channel,
        contact_channel: action.contactChannelId,
        preferred_channel: values.preferredChannel,
        has_whatsapp: isValidWhatsApp(values.whatsapp),
        has_email: isValidEmail(values.email)
    });
}

function openGeneratedAction(action: GeneratedAction) {
    if (action.channel === "whatsapp") {
        const openedWindow = window.open(action.href, "_blank", "noopener,noreferrer");

        if (openedWindow) {
            openedWindow.opener = null;
        }

        return;
    }

    window.location.href = action.href;
}

function SelectField({
    id,
    label,
    value,
    options,
    error,
    onChange
}: {
    id: keyof ContactFormValues;
    label: string;
    value: string;
    options: string[];
    error?: string;
    onChange: (name: keyof ContactFormValues, value: string) => void;
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
            {error ? (
                <p id={`${id}-error`} className="text-[0.8rem] font-medium text-red-500">
                    {error}
                </p>
            ) : null}
        </div>
    );
}

function TextareaField({
    id,
    label,
    value,
    error,
    placeholder,
    onChange
}: {
    id: keyof ContactFormValues;
    label: string;
    value: string;
    error?: string;
    placeholder?: string;
    onChange: (name: keyof ContactFormValues, value: string) => void;
}) {
    const describedBy = error ? `${id}-error` : `${id}-description`;

    return (
        <div className="space-y-2">
            <label htmlFor={id} className={cn("text-sm font-medium leading-none", error ? "text-red-500" : "text-cream-100")}>
                {label}
            </label>
            <textarea
                id={id}
                name={id}
                value={value}
                onChange={(event) => onChange(id, event.target.value)}
                rows={5}
                maxLength={900}
                required
                placeholder={placeholder}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={describedBy}
                className={cn(
                    "min-h-36 w-full resize-y rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 placeholder:text-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    error && "border-red-500 focus-visible:ring-red-500"
                )}
            />
            {error ? (
                <p id={`${id}-error`} className="text-[0.8rem] font-medium text-red-500">
                    {error}
                </p>
            ) : (
                <p id={`${id}-description`} className="text-[0.8rem] text-cream-300">
                    Ate 900 caracteres.
                </p>
            )}
        </div>
    );
}

function ChannelOption({
    value,
    selected,
    icon: Icon,
    title,
    description,
    onChange
}: {
    value: PreferredChannel;
    selected: boolean;
    icon: typeof MessageCircle;
    title: string;
    description: string;
    onChange: (value: PreferredChannel) => void;
}) {
    return (
        <label
            className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors",
                selected
                    ? "border-blue-400/50 bg-blue-500/10 text-cream-100"
                    : "border-navy-800 bg-navy-900/70 text-cream-300 hover:border-navy-700"
            )}
        >
            <input
                type="radio"
                name="preferredChannel"
                value={value}
                checked={selected}
                onChange={() => onChange(value)}
                className="mt-1 h-4 w-4 border-navy-700 bg-navy-900 text-blue-600 focus:ring-blue-500"
            />
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", selected ? "text-blue-300" : "text-cream-300")} aria-hidden="true" />
            <span>
                <span className="block font-semibold text-cream-100">{title}</span>
                <span className="mt-1 block leading-6">{description}</span>
            </span>
        </label>
    );
}

export function ContactForm() {
    const formRef = React.useRef<HTMLFormElement>(null);
    const [values, setValues] = React.useState<ContactFormValues>(initialValues);
    const [errors, setErrors] = React.useState<ContactFormErrors>({});
    const [generatedAction, setGeneratedAction] = React.useState<GeneratedAction | null>(null);
    const selectedContactChannel = resolveContactChannelForSubject(values.subject);

    function updateValue(name: keyof ContactFormValues, value: string | boolean) {
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => {
            if (!current[name] && name !== "whatsapp" && name !== "email") {
                return current;
            }

            const next = { ...current };
            delete next[name];

            if (name === "whatsapp" || name === "email") {
                delete next.whatsapp;
                delete next.email;
            }

            return next;
        });
        setGeneratedAction(null);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const nextErrors = validateValues(values);
        setErrors(nextErrors);

        const firstInvalidField = getFirstInvalidField(nextErrors);

        if (firstInvalidField) {
            window.requestAnimationFrame(() => {
                const firstInvalidElement = formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`);

                firstInvalidElement?.scrollIntoView({ behavior: "smooth", block: "center" });
                firstInvalidElement?.focus({ preventScroll: true });
            });
            return;
        }

        const nextGeneratedAction = buildGeneratedAction(values);

        setGeneratedAction(nextGeneratedAction);
        trackGeneratedAction(nextGeneratedAction, values);
        openGeneratedAction(nextGeneratedAction);
    }

    return (
        <Card className="border-navy-800 bg-navy-900/85">
            <CardContent className="p-6 lg:p-8">
                <Badge variant="accent" className="mb-4">
                    Mensagem guiada
                </Badge>
                <h3 className="font-display text-2xl font-bold text-cream-100">Monte o contato antes de enviar.</h3>
                <p className="mt-3 text-sm leading-7 text-cream-300">
                    O formulario cria uma mensagem pronta. O envio final acontece no WhatsApp ou no e-mail que abrir em seguida.
                </p>

                <form ref={formRef} className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
                    <div className="grid gap-5 md:grid-cols-2">
                        <FormField
                            id="contact-form-name"
                            name="name"
                            label="Nome"
                            value={values.name}
                            onChange={(event) => updateValue("name", event.target.value)}
                            errorMessage={errors.name}
                            placeholder="Seu nome"
                            autoComplete="name"
                            required
                        />
                        <FormField
                            id="contact-form-whatsapp"
                            name="whatsapp"
                            label="WhatsApp"
                            type="tel"
                            value={values.whatsapp}
                            onChange={(event) => updateValue("whatsapp", event.target.value)}
                            errorMessage={errors.whatsapp}
                            placeholder="(17) 99999-9999"
                            autoComplete="tel"
                        />
                    </div>

                    <FormField
                        id="contact-form-email"
                        name="email"
                        label="E-mail"
                        type="email"
                        value={values.email}
                        onChange={(event) => updateValue("email", event.target.value)}
                        errorMessage={errors.email}
                        placeholder="voce@email.com"
                        autoComplete="email"
                    />

                    <SelectField
                        id="subject"
                        label="Assunto"
                        value={values.subject}
                        options={subjectOptions}
                        error={errors.subject}
                        onChange={updateValue}
                    />

                    <TextareaField
                        id="message"
                        label="Mensagem"
                        value={values.message}
                        error={errors.message}
                        placeholder="Conte em poucas linhas o que voce quer falar com o Resenha."
                        onChange={updateValue}
                    />

                    <fieldset className="space-y-3">
                        <legend className="text-sm font-medium text-cream-100">Canal para abrir a mensagem</legend>
                        <div className="grid gap-3 md:grid-cols-2">
                            <ChannelOption
                                value="whatsapp"
                                selected={values.preferredChannel === "whatsapp"}
                                icon={MessageCircle}
                                title="WhatsApp"
                                description={`Abrir conversa com ${selectedContactChannel.displayPhone} (${selectedContactChannel.shortLabel}).`}
                                onChange={(nextValue) => updateValue("preferredChannel", nextValue)}
                            />
                            <ChannelOption
                                value="email"
                                selected={values.preferredChannel === "email"}
                                icon={Mail}
                                title="E-mail"
                                description={`Criar e-mail para ${selectedContactChannel.email}.`}
                                onChange={(nextValue) => updateValue("preferredChannel", nextValue)}
                            />
                        </div>
                        <p className="rounded-xl border border-cream-100/8 bg-navy-950/50 px-4 py-3 text-xs leading-6 text-cream-300">
                            Destino pelo assunto: <strong className="font-semibold text-cream-100">{selectedContactChannel.label}</strong>
                            {" - "}
                            {values.preferredChannel === "whatsapp" ? selectedContactChannel.displayPhone : selectedContactChannel.email}
                        </p>
                    </fieldset>

                    <div className="space-y-2">
                        <label className="flex items-start gap-3 rounded-xl border border-cream-100/8 bg-navy-950/50 p-4 text-sm leading-6 text-cream-300">
                            <input
                                name="contactConsent"
                                type="checkbox"
                                checked={values.contactConsent}
                                onChange={(event) => updateValue("contactConsent", event.target.checked)}
                                aria-invalid={errors.contactConsent ? "true" : "false"}
                                aria-describedby={errors.contactConsent ? "contactConsent-error" : undefined}
                                className="mt-1 h-4 w-4 rounded border-navy-700 bg-navy-900 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Confirmo que o Resenha pode entrar em contato usando os dados informados.</span>
                        </label>
                        {errors.contactConsent ? (
                            <p id="contactConsent-error" className="text-[0.8rem] font-medium text-red-500">
                                {errors.contactConsent}
                            </p>
                        ) : null}
                    </div>

                    {generatedAction ? (
                        <div
                            role="status"
                            className="flex flex-col gap-4 rounded-xl border border-green-400/20 bg-green-500/10 p-4 text-sm leading-7 text-green-100 sm:flex-row sm:items-start sm:justify-between"
                        >
                            <span className="flex gap-3">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                                <span>
                                    Abrimos a mensagem preenchida. Revise e envie no aplicativo externo para concluir o contato; o site nao envia automaticamente.
                                    <span className="mt-1 block font-semibold">Destino: {generatedAction.displayDestination}</span>
                                </span>
                            </span>
                            <a
                                href={generatedAction.href}
                                target={generatedAction.channel === "whatsapp" ? "_blank" : undefined}
                                rel={generatedAction.channel === "whatsapp" ? "noopener noreferrer" : undefined}
                                data-monetization-event="cta_click"
                                data-label={generatedAction.label}
                                data-source="contact_form_status"
                                data-destination={generatedAction.destination}
                                data-context={values.subject || generatedAction.channel}
                                data-journey="general"
                                className="inline-flex shrink-0 items-center justify-center rounded-full border border-green-300/25 px-4 py-2 font-semibold text-green-50 transition-colors hover:bg-green-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                            >
                                {generatedAction.label}
                            </a>
                        </div>
                    ) : null}

                    {Object.keys(errors).length > 0 ? (
                        <div role="alert" className="flex gap-3 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-7 text-red-100">
                            <AlertCircle className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>Revise os campos destacados antes de abrir a mensagem.</span>
                        </div>
                    ) : null}

                    <Button type="submit" size="lg" className="h-auto min-h-12 w-full whitespace-normal rounded-full px-5 py-3">
                        Abrir mensagem para envio
                        <Send className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
