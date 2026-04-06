import { HeroSection } from "@/components/home/HeroSection";
import { LatestPosts, type PostPreview } from "@/components/home/LatestPosts";
import { LatestResults, type MatchResult } from "@/components/home/LatestResults";
import { NextMatchBanner } from "@/components/home/NextMatchBanner";
import { SponsorsMarquee } from "@/components/home/SponsorsMarquee";
import { SITE_NAME, getAbsoluteUrl } from "@/lib/seo";
import { db } from "@resenha/db";
import { matches, posts, sponsors } from "@resenha/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const nextMatch = await db.query.matches.findFirst({
    where: eq(matches.status, "SCHEDULED"),
    orderBy: [asc(matches.date)]
  });

  const latestResults = await db.query.matches.findMany({
    where: eq(matches.status, "FINISHED"),
    orderBy: [desc(matches.date)],
    limit: 3
  });

  const latestPosts = await db.query.posts.findMany({
    where: eq(posts.isPublished, true),
    orderBy: [desc(posts.publishedAt)],
    limit: 2
  });

  const activeSponsors = await db.query.sponsors.findMany({
    where: eq(sponsors.isActive, true),
    orderBy: [asc(sponsors.displayOrder), asc(sponsors.name)],
    limit: 12
  });

  const mappedLatestResults: MatchResult[] = latestResults
    .filter((match) => match.scoreHome != null && match.scoreAway != null)
    .map((match) => ({
      id: match.id,
      opponent: match.opponent,
      opponentLogo: match.opponentLogo,
      date: match.date,
      scoreHome: match.scoreHome ?? 0,
      scoreAway: match.scoreAway ?? 0
    }));

  const mappedLatestPosts: PostPreview[] = latestPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    publishedAt: post.publishedAt ?? post.createdAt,
    readingTimeMin: post.readingTimeMin,
    coverImage: post.coverImage
  }));

  const featuredSponsors = activeSponsors.filter((sponsor) => sponsor.featuredOnHome);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: getAbsoluteUrl("/"),
      inLanguage: "pt-BR"
    },
    {
      "@context": "https://schema.org",
      "@type": "SportsTeam",
      name: SITE_NAME,
      url: getAbsoluteUrl("/"),
      logo: getAbsoluteUrl("/logo2.png"),
      foundingDate: "2023",
      sport: "Futebol",
      description:
        "Clube de futebol amador com presença no campo e na quadra, conteúdo institucional, jogos, elenco, estatísticas e parceiros oficiais."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HeroSection />

      {nextMatch && (
        <div className="relative">
          <NextMatchBanner match={nextMatch} />
        </div>
      )}

      {featuredSponsors.length > 0 && <SponsorsMarquee sponsors={featuredSponsors} />}

      {mappedLatestResults.length > 0 && <LatestResults results={mappedLatestResults} />}

      <div className="my-8" />

      {mappedLatestPosts.length > 0 && <LatestPosts posts={mappedLatestPosts} />}
    </div>
  );
}
