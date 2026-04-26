"use client";

import { useActionState, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Badge, Button, Card } from "@resenha/ui";
import { Bot, FileText, Flag, Sparkles, Trash2 } from "lucide-react";
import {
    deleteCommercialCampaignPackage,
    deleteCommercialOfferContent,
    deleteCopyCtaExperiment,
    deleteEditorialOffering,
    deleteLeadFollowUpAutomation,
    deletePremiumPartnerPage,
    saveCommercialCampaignPackage,
    saveCommercialOfferContent,
    saveCopyCtaExperiment,
    saveEditorialOffering,
    saveLeadFollowUpAutomation,
    savePremiumPartnerPage,
    type CommercialActionState
} from "@/actions/commercial";
import type {
    CampaignPackageRow,
    CopyCtaExperimentRow,
    EditorialOfferingRow,
    FollowUpAutomationRow,
    OfferRow,
    PremiumPartnerPageRow,
    SponsorRow
} from "./types";

const fieldClassName = "h-10 w-full rounded-md border border-navy-800 bg-navy-950 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
const textareaClassName = "min-h-24 w-full rounded-md border border-navy-800 bg-navy-950 px-3 py-3 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
const labelClassName = "text-sm font-medium leading-none text-cream-100";
const emptyActionState: CommercialActionState = { status: "idle", message: "" };

const leadStatusLabels = {
    NEW: "Novo",
    CONTACTED: "Contatado",
    QUALIFIED: "Qualificado",
    WON: "Ganho",
    LOST: "Perdido"
} as const;

function toDateTimeLocal(value?: Date | string | null) {
    if (!value) {
        return "";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
}

function hasActionValue(state: CommercialActionState, name: string) {
    return state.status === "error" && Boolean(state.values) && Object.prototype.hasOwnProperty.call(state.values, name);
}

function getActionValue(
    state: CommercialActionState,
    name: string,
    defaultValue?: string | number | null
) {
    if (hasActionValue(state, name)) {
        return state.values?.[name] ?? "";
    }

    return defaultValue ?? "";
}

function getActionChecked(state: CommercialActionState, name: string, defaultChecked: boolean) {
    if (hasActionValue(state, name)) {
        return state.values?.[name] === "on";
    }

    return defaultChecked;
}

function ActionNotice({ state }: { state: CommercialActionState }) {
    if (state.status === "idle" || !state.message) {
        return null;
    }

    return (
        <div
            role={state.status === "error" ? "alert" : "status"}
            className={state.status === "error"
                ? "rounded-md border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm text-red-100"
                : "rounded-md border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100"}
        >
            {state.message}
        </div>
    );
}

function FieldError({ state, name }: { state: CommercialActionState; name: string }) {
    const error = state.fieldErrors?.[name];

    if (!error) {
        return null;
    }

    return <p className="text-xs text-red-200">{error}</p>;
}

function Field({
    label,
    name,
    state,
    defaultValue,
    placeholder,
    type = "text"
}: {
    label: string;
    name: string;
    state: CommercialActionState;
    defaultValue?: string | number | null;
    placeholder?: string;
    type?: string;
}) {
    const error = state.fieldErrors?.[name];

    return (
        <div className="space-y-2">
            <label htmlFor={name} className={labelClassName}>{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                defaultValue={getActionValue(state, name, defaultValue)}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                className={fieldClassName}
            />
            <FieldError state={state} name={name} />
        </div>
    );
}

function SelectField({
    label,
    name,
    state,
    defaultValue,
    options
}: {
    label: string;
    name: string;
    state: CommercialActionState;
    defaultValue?: string | null;
    options: Array<{ value: string; label: string }>;
}) {
    const error = state.fieldErrors?.[name];

    return (
        <div className="space-y-2">
            <label htmlFor={name} className={labelClassName}>{label}</label>
            <select
                id={name}
                name={name}
                defaultValue={getActionValue(state, name, defaultValue)}
                aria-invalid={Boolean(error)}
                className={fieldClassName}
            >
                {options.map((option) => (
                    <option key={option.value || "empty"} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <FieldError state={state} name={name} />
        </div>
    );
}

function TextArea({
    label,
    name,
    state,
    defaultValue,
    placeholder
}: {
    label: string;
    name: string;
    state: CommercialActionState;
    defaultValue?: string | null;
    placeholder?: string;
}) {
    const error = state.fieldErrors?.[name];

    return (
        <div className="space-y-2">
            <label htmlFor={name} className={labelClassName}>{label}</label>
            <textarea
                id={name}
                name={name}
                defaultValue={getActionValue(state, name, defaultValue)}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                className={textareaClassName}
            />
            <FieldError state={state} name={name} />
        </div>
    );
}

function ActiveCheckbox({
    label,
    state,
    defaultChecked
}: {
    label: string;
    state: CommercialActionState;
    defaultChecked: boolean;
}) {
    return (
        <label className="flex items-center gap-2 rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100">
            <input type="hidden" name="isActive" value="off" />
            <input
                name="isActive"
                type="checkbox"
                value="on"
                defaultChecked={getActionChecked(state, "isActive", defaultChecked)}
                className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500"
            />
            {label}
        </label>
    );
}

function SponsorSelect({
    state,
    defaultValue,
    sponsorsList
}: {
    state: CommercialActionState;
    defaultValue?: string | null;
    sponsorsList: SponsorRow[];
}) {
    return (
        <SelectField
            label="Patrocinador vinculado"
            name="sponsorId"
            state={state}
            defaultValue={defaultValue}
            options={[
                { value: "", label: "Sem vinculo direto" },
                ...sponsorsList.map((sponsor) => ({ value: sponsor.id, label: sponsor.name }))
            ]}
        />
    );
}

function SubmitButton({
    children,
    pendingLabel,
    variant = "primary",
    formAction
}: {
    children: ReactNode;
    pendingLabel: string;
    variant?: ComponentProps<typeof Button>["variant"];
    formAction?: ComponentProps<"button">["formAction"];
}) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" variant={variant} formAction={formAction} disabled={pending}>
            {pending ? pendingLabel : children}
        </Button>
    );
}

function CommercialOfferForm({ offer }: { offer?: OfferRow }) {
    const [saveState, saveAction] = useActionState(saveCommercialOfferContent, emptyActionState);
    const [deleteState, deleteAction] = useActionState(deleteCommercialOfferContent, emptyActionState);

    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveAction} className="space-y-5">
                <input type="hidden" name="id" defaultValue={offer?.id ?? ""} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Badge variant={offer?.slot === "base_offer" ? "gold" : "accent"}>
                            {offer?.slot === "base_offer" ? "Oferta base" : "Extra"}
                        </Badge>
                        <h3 className="mt-3 font-display text-xl text-cream-100">
                            {offer?.title ?? "Novo formato comercial"}
                        </h3>
                    </div>
                    <ActiveCheckbox label="Ativo" state={saveState} defaultChecked={offer?.isActive ?? true} />
                </div>

                <ActionNotice state={saveState} />
                <ActionNotice state={deleteState} />

                <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Chave" name="offerKey" state={saveState} defaultValue={offer?.offerKey} placeholder="base-aparecer-resenha" />
                    <SelectField
                        label="Tipo"
                        name="slot"
                        state={saveState}
                        defaultValue={offer?.slot ?? "addon"}
                        options={[
                            { value: "base_offer", label: "Oferta base" },
                            { value: "addon", label: "Extra" }
                        ]}
                    />
                    <Field label="Ordem" name="displayOrder" state={saveState} type="number" defaultValue={offer?.displayOrder ?? 0} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Titulo" name="title" state={saveState} defaultValue={offer?.title} placeholder="Aparecer no Resenha" />
                    <Field label="Badge" name="badge" state={saveState} defaultValue={offer?.badge} placeholder="Comece simples" />
                    <Field label="Publico" name="audience" state={saveState} defaultValue={offer?.audience} placeholder="Para comercio local" />
                    <Field label="CTA" name="ctaLabel" state={saveState} defaultValue={offer?.ctaLabel} placeholder="Quero aparecer no Resenha" />
                </div>

                <TextArea label="Descricao" name="description" state={saveState} defaultValue={offer?.description} />
                <TextArea
                    label="Inclusoes, uma por linha"
                    name="inclusions"
                    state={saveState}
                    defaultValue={(offer?.inclusions ?? []).join("\n")}
                    placeholder="Card da empresa na pagina de parceiros"
                />
                <TextArea label="Nota" name="note" state={saveState} defaultValue={offer?.note} />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {offer?.id ? (
                        <SubmitButton variant="destructive" formAction={deleteAction} pendingLabel="Removendo...">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </SubmitButton>
                    ) : null}
                    <SubmitButton pendingLabel="Salvando...">
                        Salvar formato
                    </SubmitButton>
                </div>
            </form>
        </Card>
    );
}

function EditorialOfferingForm({ offering }: { offering?: EditorialOfferingRow }) {
    const [saveState, saveAction] = useActionState(saveEditorialOffering, emptyActionState);
    const [deleteState, deleteAction] = useActionState(deleteEditorialOffering, emptyActionState);

    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveAction} className="space-y-5">
                <input type="hidden" name="id" defaultValue={offering?.id ?? ""} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Badge variant="outline">{offering?.id ? offering.id : "Novo oferecimento"}</Badge>
                        <h3 className="mt-3 font-display text-xl text-cream-100">
                            {offering?.partnerName ?? "Parceiro editorial"}
                        </h3>
                    </div>
                    <ActiveCheckbox label="Ativo" state={saveState} defaultChecked={offering?.isActive ?? true} />
                </div>

                <ActionNotice state={saveState} />
                <ActionNotice state={deleteState} />

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Label" name="label" state={saveState} defaultValue={offering?.label ?? "Oferecimento"} />
                    <Field label="Parceiro" name="partnerName" state={saveState} defaultValue={offering?.partnerName} placeholder="Nome do parceiro" />
                    <Field label="Titulo" name="title" state={saveState} defaultValue={offering?.title} placeholder="Conteudo com apoio de..." />
                    <Field label="Link" name="href" state={saveState} defaultValue={offering?.href} placeholder="https://..." />
                    <Field label="Texto do link" name="linkLabel" state={saveState} defaultValue={offering?.linkLabel ?? "Conhecer parceiro"} />
                    <Field label="Ordem" name="displayOrder" state={saveState} type="number" defaultValue={offering?.displayOrder ?? 0} />
                </div>

                <TextArea label="Descricao" name="description" state={saveState} defaultValue={offering?.description} />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {offering?.id ? (
                        <SubmitButton variant="destructive" formAction={deleteAction} pendingLabel="Removendo...">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </SubmitButton>
                    ) : null}
                    <SubmitButton pendingLabel="Salvando...">
                        Salvar oferecimento
                    </SubmitButton>
                </div>
            </form>
        </Card>
    );
}

function FollowUpAutomationForm({ automation }: { automation?: FollowUpAutomationRow }) {
    const [saveState, saveAction] = useActionState(saveLeadFollowUpAutomation, emptyActionState);
    const [deleteState, deleteAction] = useActionState(deleteLeadFollowUpAutomation, emptyActionState);

    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveAction} className="space-y-5">
                <input type="hidden" name="id" defaultValue={automation?.id ?? ""} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Badge variant={automation?.channel === "email" ? "accent" : automation?.channel === "crm" ? "outline" : "gold"}>
                            {automation?.channel ?? "whatsapp"}
                        </Badge>
                        <h3 className="mt-3 font-display text-xl text-cream-100">
                            {automation?.name ?? "Nova automacao de follow-up"}
                        </h3>
                    </div>
                    <ActiveCheckbox label="Ativa" state={saveState} defaultChecked={automation?.isActive ?? true} />
                </div>

                <ActionNotice state={saveState} />
                <ActionNotice state={deleteState} />

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nome" name="name" state={saveState} defaultValue={automation?.name} placeholder="Follow-up WhatsApp para lead novo" />
                    <SelectField
                        label="Canal"
                        name="channel"
                        state={saveState}
                        defaultValue={automation?.channel ?? "whatsapp"}
                        options={[
                            { value: "whatsapp", label: "WhatsApp" },
                            { value: "email", label: "E-mail" },
                            { value: "crm", label: "CRM" },
                        ]}
                    />
                    <SelectField
                        label="Jornada"
                        name="journey"
                        state={saveState}
                        defaultValue={automation?.journey}
                        options={[
                            { value: "", label: "Todas as jornadas" },
                            { value: "support", label: "Apoio" },
                            { value: "commercial", label: "Comercial" },
                        ]}
                    />
                    <SelectField
                        label="Disparar quando status for"
                        name="triggerStatus"
                        state={saveState}
                        defaultValue={automation?.triggerStatus ?? "NEW"}
                        options={Object.entries(leadStatusLabels).map(([value, label]) => ({ value, label }))}
                    />
                </div>

                <Field label="Destino ou dica operacional" name="destinationHint" state={saveState} defaultValue={automation?.destinationHint} placeholder="WhatsApp do responsavel, lista ou CRM" />
                <TextArea
                    label="Modelo de mensagem"
                    name="messageTemplate"
                    state={saveState}
                    defaultValue={automation?.messageTemplate}
                    placeholder="Oi, {name}! Aqui e o Resenha. Recebemos seu interesse em {journey}..."
                />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {automation?.id ? (
                        <SubmitButton variant="destructive" formAction={deleteAction} pendingLabel="Removendo...">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </SubmitButton>
                    ) : null}
                    <SubmitButton pendingLabel="Salvando...">
                        Salvar automacao
                    </SubmitButton>
                </div>
            </form>
        </Card>
    );
}

function CampaignPackageForm({ campaign, sponsorsList }: { campaign?: CampaignPackageRow; sponsorsList: SponsorRow[] }) {
    const [saveState, saveAction] = useActionState(saveCommercialCampaignPackage, emptyActionState);
    const [deleteState, deleteAction] = useActionState(deleteCommercialCampaignPackage, emptyActionState);

    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveAction} className="space-y-5">
                <input type="hidden" name="id" defaultValue={campaign?.id ?? ""} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Badge variant={campaign?.status === "ACTIVE" ? "success" : campaign?.status === "PAUSED" ? "warning" : "outline"}>
                            {campaign?.status ?? "DRAFT"}
                        </Badge>
                        <h3 className="mt-3 font-display text-xl text-cream-100">
                            {campaign?.title ?? "Novo pacote de campanha"}
                        </h3>
                    </div>
                    <ActiveCheckbox label="Ativo" state={saveState} defaultChecked={campaign?.isActive ?? true} />
                </div>

                <ActionNotice state={saveState} />
                <ActionNotice state={deleteState} />

                <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Chave" name="campaignKey" state={saveState} defaultValue={campaign?.campaignKey} placeholder="rodada-01-2026" />
                    <SelectField
                        label="Tipo"
                        name="packageType"
                        state={saveState}
                        defaultValue={campaign?.packageType ?? "round"}
                        options={[
                            { value: "round", label: "Por rodada" },
                            { value: "seasonal", label: "Sazonal" },
                        ]}
                    />
                    <SelectField
                        label="Status"
                        name="status"
                        state={saveState}
                        defaultValue={campaign?.status ?? "DRAFT"}
                        options={[
                            { value: "DRAFT", label: "Rascunho" },
                            { value: "ACTIVE", label: "Ativo" },
                            { value: "PAUSED", label: "Pausado" },
                            { value: "FINISHED", label: "Encerrado" },
                        ]}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Titulo" name="title" state={saveState} defaultValue={campaign?.title} placeholder="Parceiro da rodada 3" />
                    <Field label="Parceiro" name="partnerName" state={saveState} defaultValue={campaign?.partnerName} placeholder="Nome do parceiro" />
                    <SponsorSelect state={saveState} defaultValue={campaign?.sponsorId} sponsorsList={sponsorsList} />
                    <Field label="Ordem" name="displayOrder" state={saveState} type="number" defaultValue={campaign?.displayOrder ?? 0} />
                    <Field label="Rodada" name="roundLabel" state={saveState} defaultValue={campaign?.roundLabel} placeholder="Rodada 3" />
                    <Field label="Temporada" name="seasonLabel" state={saveState} defaultValue={campaign?.seasonLabel} placeholder="Temporada 2026" />
                    <Field label="Inicio" name="startsAt" state={saveState} type="datetime-local" defaultValue={toDateTimeLocal(campaign?.startsAt)} />
                    <Field label="Fim" name="endsAt" state={saveState} type="datetime-local" defaultValue={toDateTimeLocal(campaign?.endsAt)} />
                </div>

                <TextArea label="Descricao" name="description" state={saveState} defaultValue={campaign?.description} />
                <TextArea
                    label="Entregas, uma por linha"
                    name="placements"
                    state={saveState}
                    defaultValue={(campaign?.placements ?? []).join("\n")}
                    placeholder="Card na pagina de parceiros"
                />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {campaign?.id ? (
                        <SubmitButton variant="destructive" formAction={deleteAction} pendingLabel="Removendo...">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </SubmitButton>
                    ) : null}
                    <SubmitButton pendingLabel="Salvando...">
                        Salvar campanha
                    </SubmitButton>
                </div>
            </form>
        </Card>
    );
}

function PremiumPartnerPageForm({ page, sponsorsList }: { page?: PremiumPartnerPageRow; sponsorsList: SponsorRow[] }) {
    const [saveState, saveAction] = useActionState(savePremiumPartnerPage, emptyActionState);
    const [deleteState, deleteAction] = useActionState(deletePremiumPartnerPage, emptyActionState);

    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveAction} className="space-y-5">
                <input type="hidden" name="id" defaultValue={page?.id ?? ""} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Badge variant={page?.isActive ? "gold" : "outline"}>
                            {page?.isActive ? "Publica" : "Rascunho"}
                        </Badge>
                        <h3 className="mt-3 font-display text-xl text-cream-100">
                            {page?.title ?? "Nova pagina premium"}
                        </h3>
                    </div>
                    <ActiveCheckbox label="Ativa" state={saveState} defaultChecked={page?.isActive ?? false} />
                </div>

                <ActionNotice state={saveState} />
                <ActionNotice state={deleteState} />

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Slug" name="slug" state={saveState} defaultValue={page?.slug} placeholder="nome-do-parceiro" />
                    <Field label="Parceiro" name="partnerName" state={saveState} defaultValue={page?.partnerName} placeholder="Nome do parceiro" />
                    <SponsorSelect state={saveState} defaultValue={page?.sponsorId} sponsorsList={sponsorsList} />
                    <Field label="Ordem" name="displayOrder" state={saveState} type="number" defaultValue={page?.displayOrder ?? 0} />
                    <Field label="Titulo" name="title" state={saveState} defaultValue={page?.title} placeholder="Parceiro caminha com o Resenha" />
                    <Field label="Imagem hero" name="heroImageUrl" state={saveState} defaultValue={page?.heroImageUrl} placeholder="https://..." />
                    <Field label="CTA" name="ctaLabel" state={saveState} defaultValue={page?.ctaLabel ?? "Conhecer parceiro"} />
                    <Field label="Link do CTA" name="ctaHref" state={saveState} defaultValue={page?.ctaHref} placeholder="https://..." />
                    <Field label="Publicado em" name="publishedAt" state={saveState} type="datetime-local" defaultValue={toDateTimeLocal(page?.publishedAt)} />
                </div>

                <TextArea label="Resumo" name="summary" state={saveState} defaultValue={page?.summary} />
                <TextArea label="Corpo da pagina" name="body" state={saveState} defaultValue={page?.body} />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {page?.id ? (
                        <SubmitButton variant="destructive" formAction={deleteAction} pendingLabel="Removendo...">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </SubmitButton>
                    ) : null}
                    <SubmitButton pendingLabel="Salvando...">
                        Salvar pagina
                    </SubmitButton>
                </div>
            </form>
        </Card>
    );
}

function CopyCtaExperimentForm({ experiment }: { experiment?: CopyCtaExperimentRow }) {
    const [saveState, saveAction] = useActionState(saveCopyCtaExperiment, emptyActionState);
    const [deleteState, deleteAction] = useActionState(deleteCopyCtaExperiment, emptyActionState);

    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveAction} className="space-y-5">
                <input type="hidden" name="id" defaultValue={experiment?.id ?? ""} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Badge variant={experiment?.isActive ? "accent" : "outline"}>
                            {experiment?.variantLabel ?? "Nova variante"}
                        </Badge>
                        <h3 className="mt-3 font-display text-xl text-cream-100">
                            {experiment?.experimentKey ?? "Experimento de copy e CTA"}
                        </h3>
                    </div>
                    <ActiveCheckbox label="Ativo" state={saveState} defaultChecked={experiment?.isActive ?? false} />
                </div>

                <ActionNotice state={saveState} />
                <ActionNotice state={deleteState} />

                <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Chave" name="experimentKey" state={saveState} defaultValue={experiment?.experimentKey} placeholder="partner-hero-whatsapp-a" />
                    <Field label="Superficie" name="surface" state={saveState} defaultValue={experiment?.surface ?? "partner_page_hero"} />
                    <SelectField
                        label="Jornada"
                        name="journey"
                        state={saveState}
                        defaultValue={experiment?.journey ?? "commercial"}
                        options={[
                            { value: "support", label: "Apoio" },
                            { value: "commercial", label: "Comercial" },
                        ]}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Variante" name="variantLabel" state={saveState} defaultValue={experiment?.variantLabel} placeholder="WhatsApp direto" />
                    <Field label="Peso" name="trafficWeight" state={saveState} type="number" defaultValue={experiment?.trafficWeight ?? 100} />
                    <Field label="Amostra minima" name="minSampleSize" state={saveState} type="number" defaultValue={experiment?.minSampleSize ?? 100} />
                    <Field label="Destino" name="destination" state={saveState} defaultValue={experiment?.destination} placeholder="/seja-parceiro#contato-comercial ou https://..." />
                    <Field label="Inicio" name="startsAt" state={saveState} type="datetime-local" defaultValue={toDateTimeLocal(experiment?.startsAt)} />
                    <Field label="Fim" name="endsAt" state={saveState} type="datetime-local" defaultValue={toDateTimeLocal(experiment?.endsAt)} />
                </div>

                <TextArea label="Headline" name="headline" state={saveState} defaultValue={experiment?.headline} />
                <TextArea label="Texto de apoio" name="supportingCopy" state={saveState} defaultValue={experiment?.supportingCopy} />
                <Field label="CTA" name="ctaLabel" state={saveState} defaultValue={experiment?.ctaLabel} placeholder="Falar no WhatsApp" />
                <TextArea label="Notas" name="notes" state={saveState} defaultValue={experiment?.notes} />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {experiment?.id ? (
                        <SubmitButton variant="destructive" formAction={deleteAction} pendingLabel="Removendo...">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </SubmitButton>
                    ) : null}
                    <SubmitButton pendingLabel="Salvando...">
                        Salvar experimento
                    </SubmitButton>
                </div>
            </form>
        </Card>
    );
}

export function OffersSection({ offers }: { offers: OfferRow[] }) {
    return (
        <section id="offers" className="scroll-mt-6 space-y-4" aria-labelledby="offer-content-heading">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 id="offer-content-heading" className="font-display text-2xl text-cream-100">Oferta e extras</h2>
                    <p className="mt-1 text-sm text-cream-300">A primeira oferta base ativa substitui o texto fixo da pagina publica.</p>
                </div>
                <Badge variant="accent">Admin editavel</Badge>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                {offers.map((offer) => (
                    <CommercialOfferForm key={offer.id} offer={offer} />
                ))}
                <CommercialOfferForm />
            </div>
        </section>
    );
}

export function EditorialOfferingsSection({ offerings }: { offerings: EditorialOfferingRow[] }) {
    return (
        <section id="offerings" className="scroll-mt-6 space-y-4" aria-labelledby="editorial-offerings-heading">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 id="editorial-offerings-heading" className="font-display text-2xl text-cream-100">Oferecimentos editoriais</h2>
                    <p className="mt-1 text-sm text-cream-300">Use o ID do oferecimento no cadastro do post para exibir o bloco no artigo.</p>
                </div>
                <Badge variant="gold">Posts</Badge>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                {offerings.map((offering) => (
                    <EditorialOfferingForm key={offering.id} offering={offering} />
                ))}
                <EditorialOfferingForm />
            </div>
        </section>
    );
}

export function FollowUpsSection({ followUps }: { followUps: FollowUpAutomationRow[] }) {
    return (
        <section id="follow-ups" className="scroll-mt-6 space-y-4" aria-labelledby="follow-up-heading">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 id="follow-up-heading" className="font-display text-2xl text-cream-100">Automacoes de follow-up</h2>
                    <p className="mt-1 text-sm text-cream-300">Modelos para WhatsApp, e-mail ou CRM usados no retorno dos leads.</p>
                </div>
                <Badge variant="gold"><Bot className="mr-1 h-3 w-3" /> Follow-up</Badge>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                {followUps.map((automation) => (
                    <FollowUpAutomationForm key={automation.id} automation={automation} />
                ))}
                <FollowUpAutomationForm />
            </div>
        </section>
    );
}

export function CampaignPackagesSection({
    campaigns,
    sponsorsList
}: {
    campaigns: CampaignPackageRow[];
    sponsorsList: SponsorRow[];
}) {
    return (
        <section id="campaigns" className="scroll-mt-6 space-y-4" aria-labelledby="campaign-packages-heading">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 id="campaign-packages-heading" className="font-display text-2xl text-cream-100">Campanhas por rodada ou temporada</h2>
                    <p className="mt-1 text-sm text-cream-300">Pacotes comerciais simples para rodada, campeonato ou periodo sazonal.</p>
                </div>
                <Badge variant="accent"><Flag className="mr-1 h-3 w-3" /> Campanhas</Badge>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                {campaigns.map((campaign) => (
                    <CampaignPackageForm key={campaign.id} campaign={campaign} sponsorsList={sponsorsList} />
                ))}
                <CampaignPackageForm sponsorsList={sponsorsList} />
            </div>
        </section>
    );
}

export function PremiumPagesSection({
    premiumPages,
    sponsorsList
}: {
    premiumPages: PremiumPartnerPageRow[];
    sponsorsList: SponsorRow[];
}) {
    return (
        <section id="premium-pages" className="scroll-mt-6 space-y-4" aria-labelledby="premium-pages-heading">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 id="premium-pages-heading" className="font-display text-2xl text-cream-100">Paginas premium de parceiro</h2>
                    <p className="mt-1 text-sm text-cream-300">Use apenas quando houver demanda real por um destaque maior em `/parceiros/[slug]`.</p>
                </div>
                <Badge variant="gold"><FileText className="mr-1 h-3 w-3" /> Premium</Badge>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                {premiumPages.map((page) => (
                    <PremiumPartnerPageForm key={page.id} page={page} sponsorsList={sponsorsList} />
                ))}
                <PremiumPartnerPageForm sponsorsList={sponsorsList} />
            </div>
        </section>
    );
}

export function ExperimentsSection({ experiments }: { experiments: CopyCtaExperimentRow[] }) {
    return (
        <section id="experiments" className="scroll-mt-6 space-y-4" aria-labelledby="experiments-heading">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 id="experiments-heading" className="font-display text-2xl text-cream-100">Experimentos de copy e CTA</h2>
                    <p className="mt-1 text-sm text-cream-300">Ative variantes quando a jornada ja tiver trafego suficiente para comparar com cuidado.</p>
                </div>
                <Badge variant="accent"><Sparkles className="mr-1 h-3 w-3" /> Experimentos</Badge>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                {experiments.map((experiment) => (
                    <CopyCtaExperimentForm key={experiment.id} experiment={experiment} />
                ))}
                <CopyCtaExperimentForm />
            </div>
        </section>
    );
}
