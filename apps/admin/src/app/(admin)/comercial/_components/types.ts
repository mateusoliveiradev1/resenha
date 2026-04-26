import type {
    commercialCampaignPackages,
    commercialOfferContents,
    copyCtaExperiments,
    editorialOfferings,
    leadFollowUpAutomations,
    premiumPartnerPages,
    sponsors
} from "@resenha/db/schema";
import type { LucideIcon } from "lucide-react";

export type OfferRow = typeof commercialOfferContents.$inferSelect;
export type EditorialOfferingRow = typeof editorialOfferings.$inferSelect;
export type FollowUpAutomationRow = typeof leadFollowUpAutomations.$inferSelect;
export type CampaignPackageRow = typeof commercialCampaignPackages.$inferSelect;
export type PremiumPartnerPageRow = typeof premiumPartnerPages.$inferSelect;
export type CopyCtaExperimentRow = typeof copyCtaExperiments.$inferSelect;
export type SponsorRow = typeof sponsors.$inferSelect;

export type DashboardCard = {
    label: string;
    value: string | number;
    helper: string;
    icon: LucideIcon;
};

export type PartnerReport = {
    partnerName: string;
    clicks: number;
    sourceCount: number;
    latest: Date;
    url?: string | null;
};
