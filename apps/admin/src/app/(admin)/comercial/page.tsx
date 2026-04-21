import { Badge, Button, Card } from "@resenha/ui";
import { db } from "@resenha/db";
import {
    commercialCampaignPackages,
    commercialOfferContents,
    copyCtaExperiments,
    editorialOfferings,
    leadFollowUpAutomations,
    monetizationEvents,
    monetizationLeads,
    premiumPartnerPages,
    sponsors
} from "@resenha/db/schema";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { Bot, FileText, Flag, Megaphone, MousePointerClick, Sparkles, Target, Trash2, TrendingUp } from "lucide-react";
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
    savePremiumPartnerPage
} from "@/actions/commercial";

export const dynamic = "force-dynamic";

const fieldClassName = "h-10 w-full rounded-md border border-navy-800 bg-navy-950 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
const textareaClassName = "min-h-24 w-full rounded-md border border-navy-800 bg-navy-950 px-3 py-3 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
const labelClassName = "text-sm font-medium leading-none text-cream-100";

const leadStatusLabels = {
    NEW: "Novo",
    CONTACTED: "Contatado",
    QUALIFIED: "Qualificado",
    WON: "Ganho",
    LOST: "Perdido"
} as const;

function toDateTimeLocal(value?: Date | null) {
    if (!value) {
        return "";
    }

    const localDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
}

function Field({
    label,
    name,
    defaultValue,
    placeholder,
    type = "text"
}: {
    label: string;
    name: string;
    defaultValue?: string | number | null;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div className="space-y-2">
            <label htmlFor={name} className={labelClassName}>{label}</label>
            <input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} placeholder={placeholder} className={fieldClassName} />
        </div>
    );
}

function SelectField({
    label,
    name,
    defaultValue,
    options
}: {
    label: string;
    name: string;
    defaultValue?: string | null;
    options: Array<{ value: string; label: string }>;
}) {
    return (
        <div className="space-y-2">
            <label htmlFor={name} className={labelClassName}>{label}</label>
            <select id={name} name={name} defaultValue={defaultValue ?? ""} className={fieldClassName}>
                {options.map((option) => (
                    <option key={option.value || "empty"} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function TextArea({
    label,
    name,
    defaultValue,
    placeholder
}: {
    label: string;
    name: string;
    defaultValue?: string | null;
    placeholder?: string;
}) {
    return (
        <div className="space-y-2">
            <label htmlFor={name} className={labelClassName}>{label}</label>
            <textarea id={name} name={name} defaultValue={defaultValue ?? ""} placeholder={placeholder} className={textareaClassName} />
        </div>
    );
}

type OfferRow = typeof commercialOfferContents.$inferSelect;
type EditorialOfferingRow = typeof editorialOfferings.$inferSelect;
type FollowUpAutomationRow = typeof leadFollowUpAutomations.$inferSelect;
type CampaignPackageRow = typeof commercialCampaignPackages.$inferSelect;
type PremiumPartnerPageRow = typeof premiumPartnerPages.$inferSelect;
type CopyCtaExperimentRow = typeof copyCtaExperiments.$inferSelect;
type SponsorRow = typeof sponsors.$inferSelect;

function SponsorSelect({ defaultValue, sponsorsList }: { defaultValue?: string | null; sponsorsList: SponsorRow[] }) {
    return (
        <SelectField
            label="Patrocinador vinculado"
            name="sponsorId"
            defaultValue={defaultValue}
            options={[
                { value: "", label: "Sem vinculo direto" },
                ...sponsorsList.map((sponsor) => ({ value: sponsor.id, label: sponsor.name }))
            ]}
        />
    );
}

function CommercialOfferForm({ offer }: { offer?: OfferRow }) {
    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveCommercialOfferContent} className="space-y-5">
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
                    <label className="flex items-center gap-2 rounded-xl border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100">
                        <input name="isActive" type="checkbox" defaultChecked={offer?.isActive ?? true} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500" />
                        Ativo
                    </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Chave" name="offerKey" defaultValue={offer?.offerKey} placeholder="base-aparecer-resenha" />
                    <div className="space-y-2">
                        <label htmlFor="slot" className={labelClassName}>Tipo</label>
                        <select id="slot" name="slot" defaultValue={offer?.slot ?? "addon"} className={fieldClassName}>
                            <option value="base_offer">Oferta base</option>
                            <option value="addon">Extra</option>
                        </select>
                    </div>
                    <Field label="Ordem" name="displayOrder" type="number" defaultValue={offer?.displayOrder ?? 0} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Titulo" name="title" defaultValue={offer?.title} placeholder="Aparecer no Resenha" />
                    <Field label="Badge" name="badge" defaultValue={offer?.badge} placeholder="Comece simples" />
                    <Field label="Publico" name="audience" defaultValue={offer?.audience} placeholder="Para comercio local" />
                    <Field label="CTA" name="ctaLabel" defaultValue={offer?.ctaLabel} placeholder="Quero aparecer no Resenha" />
                </div>

                <TextArea label="Descricao" name="description" defaultValue={offer?.description} />
                <TextArea
                    label="Inclusoes, uma por linha"
                    name="inclusions"
                    defaultValue={(offer?.inclusions ?? []).join("\n")}
                    placeholder="Card da empresa na pagina de parceiros"
                />
                <TextArea label="Nota" name="note" defaultValue={offer?.note} />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {offer?.id ? (
                        <Button type="submit" variant="destructive" formAction={deleteCommercialOfferContent}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </Button>
                    ) : null}
                    <Button type="submit" variant="primary">
                        Salvar formato
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function EditorialOfferingForm({ offering }: { offering?: EditorialOfferingRow }) {
    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveEditorialOffering} className="space-y-5">
                <input type="hidden" name="id" defaultValue={offering?.id ?? ""} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Badge variant="outline">{offering?.id ? offering.id : "Novo oferecimento"}</Badge>
                        <h3 className="mt-3 font-display text-xl text-cream-100">
                            {offering?.partnerName ?? "Parceiro editorial"}
                        </h3>
                    </div>
                    <label className="flex items-center gap-2 rounded-xl border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100">
                        <input name="isActive" type="checkbox" defaultChecked={offering?.isActive ?? true} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500" />
                        Ativo
                    </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Label" name="label" defaultValue={offering?.label ?? "Oferecimento"} />
                    <Field label="Parceiro" name="partnerName" defaultValue={offering?.partnerName} placeholder="Pizzaria Boa Massa" />
                    <Field label="Titulo" name="title" defaultValue={offering?.title} placeholder="Conteudo com apoio de..." />
                    <Field label="Link" name="href" defaultValue={offering?.href} placeholder="https://..." />
                    <Field label="Texto do link" name="linkLabel" defaultValue={offering?.linkLabel ?? "Conhecer parceiro"} />
                    <Field label="Ordem" name="displayOrder" type="number" defaultValue={offering?.displayOrder ?? 0} />
                </div>

                <TextArea label="Descricao" name="description" defaultValue={offering?.description} />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {offering?.id ? (
                        <Button type="submit" variant="destructive" formAction={deleteEditorialOffering}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </Button>
                    ) : null}
                    <Button type="submit" variant="primary">
                        Salvar oferecimento
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function FollowUpAutomationForm({ automation }: { automation?: FollowUpAutomationRow }) {
    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveLeadFollowUpAutomation} className="space-y-5">
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
                    <label className="flex items-center gap-2 rounded-xl border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100">
                        <input name="isActive" type="checkbox" defaultChecked={automation?.isActive ?? true} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500" />
                        Ativa
                    </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nome" name="name" defaultValue={automation?.name} placeholder="Follow-up WhatsApp para lead novo" />
                    <SelectField
                        label="Canal"
                        name="channel"
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
                        defaultValue={automation?.triggerStatus ?? "NEW"}
                        options={Object.entries(leadStatusLabels).map(([value, label]) => ({ value, label }))}
                    />
                </div>

                <Field label="Destino ou dica operacional" name="destinationHint" defaultValue={automation?.destinationHint} placeholder="WhatsApp do responsavel, lista ou CRM" />
                <TextArea
                    label="Modelo de mensagem"
                    name="messageTemplate"
                    defaultValue={automation?.messageTemplate}
                    placeholder="Oi, {name}! Aqui e o Resenha. Recebemos seu interesse em {journey}..."
                />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {automation?.id ? (
                        <Button type="submit" variant="destructive" formAction={deleteLeadFollowUpAutomation}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </Button>
                    ) : null}
                    <Button type="submit" variant="primary">
                        Salvar automacao
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function CampaignPackageForm({ campaign, sponsorsList }: { campaign?: CampaignPackageRow; sponsorsList: SponsorRow[] }) {
    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveCommercialCampaignPackage} className="space-y-5">
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
                    <label className="flex items-center gap-2 rounded-xl border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100">
                        <input name="isActive" type="checkbox" defaultChecked={campaign?.isActive ?? true} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500" />
                        Ativo
                    </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Chave" name="campaignKey" defaultValue={campaign?.campaignKey} placeholder="rodada-01-2026" />
                    <SelectField
                        label="Tipo"
                        name="packageType"
                        defaultValue={campaign?.packageType ?? "round"}
                        options={[
                            { value: "round", label: "Por rodada" },
                            { value: "seasonal", label: "Sazonal" },
                        ]}
                    />
                    <SelectField
                        label="Status"
                        name="status"
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
                    <Field label="Titulo" name="title" defaultValue={campaign?.title} placeholder="Parceiro da rodada 3" />
                    <Field label="Parceiro" name="partnerName" defaultValue={campaign?.partnerName} placeholder="Pizzaria Boa Massa" />
                    <SponsorSelect defaultValue={campaign?.sponsorId} sponsorsList={sponsorsList} />
                    <Field label="Ordem" name="displayOrder" type="number" defaultValue={campaign?.displayOrder ?? 0} />
                    <Field label="Rodada" name="roundLabel" defaultValue={campaign?.roundLabel} placeholder="Rodada 3" />
                    <Field label="Temporada" name="seasonLabel" defaultValue={campaign?.seasonLabel} placeholder="Temporada 2026" />
                    <Field label="Inicio" name="startsAt" type="datetime-local" defaultValue={toDateTimeLocal(campaign?.startsAt)} />
                    <Field label="Fim" name="endsAt" type="datetime-local" defaultValue={toDateTimeLocal(campaign?.endsAt)} />
                </div>

                <TextArea label="Descricao" name="description" defaultValue={campaign?.description} />
                <TextArea
                    label="Entregas, uma por linha"
                    name="placements"
                    defaultValue={(campaign?.placements ?? []).join("\n")}
                    placeholder="Card na pagina de parceiros"
                />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {campaign?.id ? (
                        <Button type="submit" variant="destructive" formAction={deleteCommercialCampaignPackage}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </Button>
                    ) : null}
                    <Button type="submit" variant="primary">
                        Salvar campanha
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function PremiumPartnerPageForm({ page, sponsorsList }: { page?: PremiumPartnerPageRow; sponsorsList: SponsorRow[] }) {
    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={savePremiumPartnerPage} className="space-y-5">
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
                    <label className="flex items-center gap-2 rounded-xl border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100">
                        <input name="isActive" type="checkbox" defaultChecked={page?.isActive ?? false} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500" />
                        Ativa
                    </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Slug" name="slug" defaultValue={page?.slug} placeholder="boa-massa-pizzaria" />
                    <Field label="Parceiro" name="partnerName" defaultValue={page?.partnerName} placeholder="Boa Massa Pizzaria" />
                    <SponsorSelect defaultValue={page?.sponsorId} sponsorsList={sponsorsList} />
                    <Field label="Ordem" name="displayOrder" type="number" defaultValue={page?.displayOrder ?? 0} />
                    <Field label="Titulo" name="title" defaultValue={page?.title} placeholder="Boa Massa caminha com o Resenha" />
                    <Field label="Imagem hero" name="heroImageUrl" defaultValue={page?.heroImageUrl} placeholder="https://..." />
                    <Field label="CTA" name="ctaLabel" defaultValue={page?.ctaLabel ?? "Conhecer parceiro"} />
                    <Field label="Link do CTA" name="ctaHref" defaultValue={page?.ctaHref} placeholder="https://..." />
                    <Field label="Publicado em" name="publishedAt" type="datetime-local" defaultValue={toDateTimeLocal(page?.publishedAt)} />
                </div>

                <TextArea label="Resumo" name="summary" defaultValue={page?.summary} />
                <TextArea label="Corpo da pagina" name="body" defaultValue={page?.body} />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {page?.id ? (
                        <Button type="submit" variant="destructive" formAction={deletePremiumPartnerPage}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </Button>
                    ) : null}
                    <Button type="submit" variant="primary">
                        Salvar pagina
                    </Button>
                </div>
            </form>
        </Card>
    );
}

function CopyCtaExperimentForm({ experiment }: { experiment?: CopyCtaExperimentRow }) {
    return (
        <Card className="border-navy-800 bg-navy-950/65 p-5">
            <form action={saveCopyCtaExperiment} className="space-y-5">
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
                    <label className="flex items-center gap-2 rounded-xl border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100">
                        <input name="isActive" type="checkbox" defaultChecked={experiment?.isActive ?? false} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500" />
                        Ativo
                    </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Chave" name="experimentKey" defaultValue={experiment?.experimentKey} placeholder="partner-hero-whatsapp-a" />
                    <Field label="Superficie" name="surface" defaultValue={experiment?.surface ?? "partner_page_hero"} />
                    <SelectField
                        label="Jornada"
                        name="journey"
                        defaultValue={experiment?.journey ?? "commercial"}
                        options={[
                            { value: "support", label: "Apoio" },
                            { value: "commercial", label: "Comercial" },
                        ]}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Variante" name="variantLabel" defaultValue={experiment?.variantLabel} placeholder="WhatsApp direto" />
                    <Field label="Peso" name="trafficWeight" type="number" defaultValue={experiment?.trafficWeight ?? 100} />
                    <Field label="Amostra minima" name="minSampleSize" type="number" defaultValue={experiment?.minSampleSize ?? 100} />
                    <Field label="Destino" name="destination" defaultValue={experiment?.destination} placeholder="/seja-parceiro#contato-comercial ou https://..." />
                    <Field label="Inicio" name="startsAt" type="datetime-local" defaultValue={toDateTimeLocal(experiment?.startsAt)} />
                    <Field label="Fim" name="endsAt" type="datetime-local" defaultValue={toDateTimeLocal(experiment?.endsAt)} />
                </div>

                <TextArea label="Headline" name="headline" defaultValue={experiment?.headline} />
                <TextArea label="Texto de apoio" name="supportingCopy" defaultValue={experiment?.supportingCopy} />
                <Field label="CTA" name="ctaLabel" defaultValue={experiment?.ctaLabel} placeholder="Falar no WhatsApp" />
                <TextArea label="Notas" name="notes" defaultValue={experiment?.notes} />

                <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                    {experiment?.id ? (
                        <Button type="submit" variant="destructive" formAction={deleteCopyCtaExperiment}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                        </Button>
                    ) : null}
                    <Button type="submit" variant="primary">
                        Salvar experimento
                    </Button>
                </div>
            </form>
        </Card>
    );
}

export default async function ComercialPage() {
    const [
        offers,
        offerings,
        followUps,
        campaigns,
        premiumPages,
        experiments,
        sponsorsList,
        [commercialLeadTotal],
        [wonCommercialLeadTotal],
        [partnerClickTotal],
        [activeSponsorTotal],
        partnerClickEvents
    ] = await Promise.all([
        db.query.commercialOfferContents.findMany({
            orderBy: [asc(commercialOfferContents.slot), asc(commercialOfferContents.displayOrder)]
        }),
        db.query.editorialOfferings.findMany({
            orderBy: [asc(editorialOfferings.displayOrder), asc(editorialOfferings.partnerName)]
        }),
        db.query.leadFollowUpAutomations.findMany({
            orderBy: [desc(leadFollowUpAutomations.isActive), asc(leadFollowUpAutomations.triggerStatus), asc(leadFollowUpAutomations.name)]
        }),
        db.query.commercialCampaignPackages.findMany({
            orderBy: [desc(commercialCampaignPackages.isActive), asc(commercialCampaignPackages.displayOrder), asc(commercialCampaignPackages.title)]
        }),
        db.query.premiumPartnerPages.findMany({
            orderBy: [desc(premiumPartnerPages.isActive), asc(premiumPartnerPages.displayOrder), asc(premiumPartnerPages.partnerName)]
        }),
        db.query.copyCtaExperiments.findMany({
            orderBy: [desc(copyCtaExperiments.isActive), asc(copyCtaExperiments.surface), asc(copyCtaExperiments.variantLabel)]
        }),
        db.query.sponsors.findMany({
            orderBy: [asc(sponsors.displayOrder), asc(sponsors.name)]
        }),
        db.select({ value: count() }).from(monetizationLeads).where(eq(monetizationLeads.journey, "commercial")),
        db.select({ value: count() }).from(monetizationLeads).where(and(eq(monetizationLeads.journey, "commercial"), eq(monetizationLeads.status, "WON"))),
        db.select({ value: count() }).from(monetizationEvents).where(eq(monetizationEvents.eventName, "partner_logo_click")),
        db.select({ value: count() }).from(sponsors).where(eq(sponsors.isActive, true)),
        db.query.monetizationEvents.findMany({
            where: eq(monetizationEvents.eventName, "partner_logo_click"),
            orderBy: [desc(monetizationEvents.createdAt)],
            limit: 200
        })
    ]);

    const conversionRate = commercialLeadTotal.value > 0
        ? Math.round((wonCommercialLeadTotal.value / commercialLeadTotal.value) * 100)
        : 0;
    const activeCampaigns = campaigns.filter((campaign) => campaign.isActive && campaign.status === "ACTIVE").length;
    const activePlacements =
        activeSponsorTotal.value +
        offerings.filter((offering) => offering.isActive).length +
        premiumPages.filter((page) => page.isActive).length +
        activeCampaigns;
    const dashboardCards = [
        { label: "Leads comerciais", value: commercialLeadTotal.value, helper: "Volume total capturado", icon: Target },
        { label: "Conversao ganha", value: `${conversionRate}%`, helper: `${wonCommercialLeadTotal.value} lead${wonCommercialLeadTotal.value === 1 ? "" : "s"} ganho${wonCommercialLeadTotal.value === 1 ? "" : "s"}`, icon: TrendingUp },
        { label: "Cliques em parceiros", value: partnerClickTotal.value, helper: "Eventos partner_logo_click", icon: MousePointerClick },
        { label: "Placements ativos", value: activePlacements, helper: "Parceiros, ofertas, paginas e campanhas", icon: Flag },
    ];
    const partnerReportMap = new Map<string, { clicks: number; sources: Set<string>; latest: Date; url?: string | null }>();

    partnerClickEvents.forEach((event) => {
        if (!event.partnerName) {
            return;
        }

        const current = partnerReportMap.get(event.partnerName) ?? {
            clicks: 0,
            sources: new Set<string>(),
            latest: event.createdAt,
            url: event.url ?? event.destination
        };

        current.clicks += 1;

        if (event.source) {
            current.sources.add(event.source);
        }

        if (event.createdAt > current.latest) {
            current.latest = event.createdAt;
            current.url = event.url ?? event.destination ?? current.url;
        }

        partnerReportMap.set(event.partnerName, current);
    });

    const reliablePartnerReports = Array.from(partnerReportMap.entries())
        .map(([partnerName, report]) => ({ partnerName, ...report, sourceCount: report.sources.size }))
        .filter((report) => report.clicks >= 3)
        .sort((left, right) => right.clicks - left.clicks)
        .slice(0, 6);

    return (
        <div className="space-y-8">
            <div>
                <Badge variant="gold">Comercial</Badge>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-cream-100">
                    Operacao comercial
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-cream-300">
                    Configure oferta, oferecimentos, follow-up, campanhas, paginas premium e experimentos de copy sem tirar o Resenha do eixo editorial.
                </p>
            </div>

            <Card className="overflow-hidden border-navy-800 bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(8,15,29,1))] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-2xl border border-gold-400/20 bg-gold-400/10 p-3 text-gold-300">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl text-cream-100">Conteudo comercial editavel</h2>
                            <p className="mt-2 text-sm text-cream-300">
                                Se nao houver registros ativos, o site usa a copy padrao definida na primeira fase.
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline">{offers.length} formato{offers.length === 1 ? "" : "s"}</Badge>
                </div>
            </Card>

            <section className="space-y-4" aria-labelledby="commercial-dashboard-heading">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 id="commercial-dashboard-heading" className="font-display text-2xl text-cream-100">Dashboard comercial</h2>
                        <p className="mt-1 text-sm text-cream-300">Leitura rapida de volume, conversao, cliques e placements ativos.</p>
                    </div>
                    <Badge variant="accent">Fase 3</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {dashboardCards.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Card key={item.label} className="border-navy-800 bg-navy-900/90 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-cream-300">{item.label}</p>
                                        <p className="mt-3 font-display text-3xl text-cream-100">{item.value}</p>
                                        <p className="mt-2 text-xs text-cream-300/70">{item.helper}</p>
                                    </div>
                                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>

            <Card className="border-navy-800 bg-navy-900/90 p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">
                            Relatorios simples
                        </p>
                        <h2 className="mt-2 font-display text-2xl text-cream-100">
                            Parceiros com metricas confiaveis
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-cream-300">
                            Um parceiro aparece aqui quando ja tem pelo menos 3 cliques registrados. Antes disso, o painel evita mostrar leitura fraca como relatorio.
                        </p>
                    </div>
                    <Badge variant="outline">Minimo 3 cliques</Badge>
                </div>

                {reliablePartnerReports.length > 0 ? (
                    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {reliablePartnerReports.map((report) => (
                            <div key={report.partnerName} className="rounded-2xl border border-navy-800 bg-navy-950/70 p-4">
                                <p className="font-display text-lg text-cream-100">{report.partnerName}</p>
                                <p className="mt-3 font-display text-3xl text-cream-100">{report.clicks}</p>
                                <p className="mt-2 text-sm text-cream-300">
                                    clique{report.clicks === 1 ? "" : "s"} em {report.sourceCount} origem{report.sourceCount === 1 ? "" : "s"}
                                </p>
                                <p className="mt-2 text-xs text-cream-300/65">
                                    Ultimo clique: {report.latest.toLocaleDateString("pt-BR")}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-6 rounded-2xl border border-dashed border-navy-800 bg-navy-950/70 px-4 py-8 text-center text-sm text-cream-300">
                        Ainda nao ha parceiro com volume suficiente para relatorio simples.
                    </div>
                )}
            </Card>

            <section className="space-y-4" aria-labelledby="offer-content-heading">
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

            <section className="space-y-4" aria-labelledby="editorial-offerings-heading">
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

            <section className="space-y-4" aria-labelledby="follow-up-heading">
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

            <section className="space-y-4" aria-labelledby="campaign-packages-heading">
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

            <section className="space-y-4" aria-labelledby="premium-pages-heading">
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

            <section className="space-y-4" aria-labelledby="experiments-heading">
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
        </div>
    );
}
