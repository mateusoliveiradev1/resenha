import { HeroSection } from "@/components/home/HeroSection";
import { LatestPosts, type PostPreview } from "@/components/home/LatestPosts";
import { LatestResults, type MatchResult } from "@/components/home/LatestResults";
import { NextMatchBanner } from "@/components/home/NextMatchBanner";
import { SponsorsMarquee } from "@/components/home/SponsorsMarquee";
import { toLatestResult, toNextMatch } from "@/lib/matches";
import { SITE_NAME, getAbsoluteUrl } from "@/lib/seo";
import { pickFeaturedMatch, presentMatches } from "@resenha/db";
import { db } from "@resenha/db";
import { championshipGroups, championshipParticipants, championships, clubs, matches, posts, sponsors } from "@resenha/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [matchRows, clubsData, championshipsData, participantRows, groupRows, latestPosts, activeSponsors] = await Promise.all([
    db.select().from(matches).orderBy(desc(matches.date)),
    db.query.clubs.findMany({
      orderBy: [asc(clubs.name)],
    }),
    db.query.championships.findMany({
      orderBy: [desc(championships.startsAt), asc(championships.name)],
    }),
    db.query.championshipParticipants.findMany(),
    db.query.championshipGroups.findMany({
      orderBy: [asc(championshipGroups.displayOrder), asc(championshipGroups.name)],
    }),
    db.query.posts.findMany({
      where: eq(posts.isPublished, true),
      orderBy: [desc(posts.publishedAt)],
      limit: 2
    }),
    db.query.sponsors.findMany({
      where: eq(sponsors.isActive, true),
      orderBy: [asc(sponsors.displayOrder), asc(sponsors.name)],
      limit: 12
    })
  ]);

  const presentedMatches = presentMatches({
    matches: matchRows,
    clubs: clubsData,
    championships: championshipsData,
    participants: participantRows,
    groups: groupRows,
  });
  const featuredMatch = pickFeaturedMatch(presentedMatches);
  const mappedLatestResults: MatchResult[] = presentedMatches
    .filter((match) => match.isResenhaMatch && match.status === "FINISHED" && match.scoreHome != null && match.scoreAway != null)
    .sort((left, right) => right.date.getTime() - left.date.getTime())
    .slice(0, 3)
    .map(toLatestResult);

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

      {featuredMatch && (
        <div className="relative">
          <NextMatchBanner match={toNextMatch(featuredMatch)} />
        </div>
      )}

      {featuredSponsors.length > 0 && <SponsorsMarquee sponsors={featuredSponsors} />}

      {mappedLatestResults.length > 0 && <LatestResults results={mappedLatestResults} />}

      <div className="my-8" />

      {mappedLatestPosts.length > 0 && <LatestPosts posts={mappedLatestPosts} />}
    </div>
  );
}
