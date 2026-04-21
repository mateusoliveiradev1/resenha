import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { sponsors } from "./sponsors";

export const monetizationLeads = pgTable(
    "monetization_leads",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        journey: text("journey", { enum: ["support", "commercial"] }).notNull(),
        source: text("source").default("lead_form").notNull(),
        status: text("status", { enum: ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] }).default("NEW").notNull(),
        name: text("name").notNull(),
        company: text("company"),
        whatsapp: text("whatsapp").notNull(),
        email: text("email"),
        city: text("city"),
        supportType: text("support_type"),
        supportDescription: text("support_description"),
        advertisingOption: text("advertising_option"),
        businessType: text("business_type"),
        instagramOrSite: text("instagram_or_site"),
        message: text("message"),
        rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        journeyIdx: index("monetization_leads_journey_idx").on(table.journey),
        statusIdx: index("monetization_leads_status_idx").on(table.status),
        createdAtIdx: index("monetization_leads_created_at_idx").on(table.createdAt),
    })
);

export const monetizationEvents = pgTable(
    "monetization_events",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        eventName: text("event_name", {
            enum: [
                "monetization_cta_click",
                "support_form_start",
                "support_form_submit",
                "support_form_success",
                "support_form_error",
                "partner_form_start",
                "partner_form_submit",
                "partner_form_success",
                "partner_form_error",
                "partner_logo_click",
                "plan_cta_click",
                "faq_expand",
            ],
        }).notNull(),
        source: text("source"),
        journey: text("journey", { enum: ["support", "commercial"] }),
        label: text("label"),
        destination: text("destination"),
        partnerName: text("partner_name"),
        url: text("url"),
        planName: text("plan_name"),
        offerName: text("offer_name"),
        page: text("page"),
        question: text("question"),
        rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
        eventSourceIdx: index("monetization_events_event_source_idx").on(table.eventName, table.source),
        createdAtIdx: index("monetization_events_created_at_idx").on(table.createdAt),
    })
);

export const commercialOfferContents = pgTable(
    "commercial_offer_contents",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        offerKey: text("offer_key").notNull(),
        slot: text("slot", { enum: ["base_offer", "addon"] }).default("addon").notNull(),
        title: text("title").notNull(),
        badge: text("badge"),
        audience: text("audience"),
        description: text("description").notNull(),
        inclusions: jsonb("inclusions").$type<string[]>(),
        note: text("note"),
        ctaLabel: text("cta_label"),
        displayOrder: integer("display_order").default(0).notNull(),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        offerKeyUnique: uniqueIndex("commercial_offer_contents_offer_key_unique").on(table.offerKey),
        activeOrderIdx: index("commercial_offer_contents_active_order_idx").on(table.isActive, table.displayOrder),
    })
);

export const editorialOfferings = pgTable(
    "editorial_offerings",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        label: text("label").default("Oferecimento").notNull(),
        partnerName: text("partner_name").notNull(),
        title: text("title"),
        description: text("description"),
        href: text("href"),
        linkLabel: text("link_label").default("Conhecer parceiro").notNull(),
        displayOrder: integer("display_order").default(0).notNull(),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        activeOrderIdx: index("editorial_offerings_active_order_idx").on(table.isActive, table.displayOrder),
    })
);

export const leadFollowUpAutomations = pgTable(
    "lead_follow_up_automations",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        channel: text("channel", { enum: ["whatsapp", "email", "crm"] }).default("whatsapp").notNull(),
        journey: text("journey", { enum: ["support", "commercial"] }),
        triggerStatus: text("trigger_status", { enum: ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] }).default("NEW").notNull(),
        destinationHint: text("destination_hint"),
        messageTemplate: text("message_template").notNull(),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        activeTriggerIdx: index("lead_follow_up_automations_active_trigger_idx").on(table.isActive, table.journey, table.triggerStatus),
    })
);

export const commercialCampaignPackages = pgTable(
    "commercial_campaign_packages",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        campaignKey: text("campaign_key").notNull(),
        title: text("title").notNull(),
        packageType: text("package_type", { enum: ["round", "seasonal"] }).default("round").notNull(),
        status: text("status", { enum: ["DRAFT", "ACTIVE", "PAUSED", "FINISHED"] }).default("DRAFT").notNull(),
        sponsorId: uuid("sponsor_id").references(() => sponsors.id, { onDelete: "set null" }),
        partnerName: text("partner_name"),
        roundLabel: text("round_label"),
        seasonLabel: text("season_label"),
        description: text("description").notNull(),
        placements: jsonb("placements").$type<string[]>(),
        startsAt: timestamp("starts_at"),
        endsAt: timestamp("ends_at"),
        displayOrder: integer("display_order").default(0).notNull(),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        campaignKeyUnique: uniqueIndex("commercial_campaign_packages_campaign_key_unique").on(table.campaignKey),
        activeStatusIdx: index("commercial_campaign_packages_active_status_idx").on(table.isActive, table.status, table.displayOrder),
    })
);

export const premiumPartnerPages = pgTable(
    "premium_partner_pages",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        slug: text("slug").notNull(),
        sponsorId: uuid("sponsor_id").references(() => sponsors.id, { onDelete: "set null" }),
        partnerName: text("partner_name").notNull(),
        title: text("title").notNull(),
        summary: text("summary").notNull(),
        body: text("body"),
        heroImageUrl: text("hero_image_url"),
        ctaLabel: text("cta_label").default("Conhecer parceiro").notNull(),
        ctaHref: text("cta_href"),
        displayOrder: integer("display_order").default(0).notNull(),
        isActive: boolean("is_active").default(false).notNull(),
        publishedAt: timestamp("published_at"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        slugUnique: uniqueIndex("premium_partner_pages_slug_unique").on(table.slug),
        activeOrderIdx: index("premium_partner_pages_active_order_idx").on(table.isActive, table.displayOrder),
    })
);

export const copyCtaExperiments = pgTable(
    "copy_cta_experiments",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        experimentKey: text("experiment_key").notNull(),
        surface: text("surface").notNull(),
        journey: text("journey", { enum: ["support", "commercial"] }).notNull(),
        variantLabel: text("variant_label").notNull(),
        headline: text("headline"),
        supportingCopy: text("supporting_copy"),
        ctaLabel: text("cta_label"),
        destination: text("destination"),
        trafficWeight: integer("traffic_weight").default(100).notNull(),
        minSampleSize: integer("min_sample_size").default(100).notNull(),
        startsAt: timestamp("starts_at"),
        endsAt: timestamp("ends_at"),
        notes: text("notes"),
        isActive: boolean("is_active").default(false).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        experimentKeyUnique: uniqueIndex("copy_cta_experiments_experiment_key_unique").on(table.experimentKey),
        activeSurfaceIdx: index("copy_cta_experiments_active_surface_idx").on(table.isActive, table.surface, table.journey),
    })
);
