import type { MetadataRoute } from "next";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/area-restrita"]
            }
        ],
        sitemap: getAbsoluteUrl("/sitemap.xml"),
        host: getSiteUrl().origin
    };
}
