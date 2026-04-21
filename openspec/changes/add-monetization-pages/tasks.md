## 1. Content And Routing Setup

- [x] 1.1 Create `apps/web/src/app/(public)/apoiar-o-resenha/page.tsx` with metadata, semantic page shell, and route-level content structure.
- [x] 1.2 Create `apps/web/src/app/(public)/seja-parceiro/page.tsx` with metadata, semantic page shell, and route-level content structure.
- [x] 1.3 Define local content arrays for support value blocks, support types, partner placements, partnership benefits, commercial offer/add-ons, credibility items, and FAQs.
- [x] 1.4 Confirm page copy follows the Resenha tone: local, sporting, professional, direct, and free of unsupported reach or ROI promises.

## 2. Reusable Monetization Components

- [x] 2.1 Create `apps/web/src/components/monetization/CtaStrip.tsx` for discreet dual-journey calls to action.
- [x] 2.2 Create `apps/web/src/components/monetization/CommercialOfferCard.tsx` or adapt `PlanCard.tsx` to support one simple base offer plus optional add-ons.
- [x] 2.3 Create `apps/web/src/components/monetization/FaqBlock.tsx` with accessible mobile-friendly question and answer rendering.
- [x] 2.4 Create `apps/web/src/components/monetization/LeadForm.tsx` with `support` and `commercial` variants.
- [x] 2.5 Create `apps/web/src/components/monetization/PartnerCard.tsx` or extend sponsor card patterns for logo, fallback, badge, description, link, and premium display.
- [x] 2.6 Create `apps/web/src/components/monetization/OfferBlock.tsx` for future editorial offering labels.
- [x] 2.7 Create `apps/web/src/components/monetization/CommercialInviteBanner.tsx` for low-pressure commercial discovery in editorial/listing contexts.
- [x] 2.8 Reuse `@resenha/ui` Button, Card, Badge, Container, Input, and FormField patterns wherever possible instead of introducing unrelated styles.

## 3. Club Support Page

- [x] 3.1 Implement the support page hero with badge, headline, subtitle, primary CTA, secondary CTA, and Resenha-native visual treatment.
- [x] 3.2 Implement support value blocks covering structure, field/court, content/memory, and community.
- [x] 3.3 Implement support type cards for punctual support, recurring support, institutional sponsorship, product/service support, and conversation-first support.
- [x] 3.4 Implement supporter recognition content that frames visibility as recognition rather than advertising inventory.
- [x] 3.5 Implement institutional credibility section using current club context such as official portal, founded in 2023, field and court, calendar, content, and gallery.
- [x] 3.6 Add the support form variant with required fields for name, WhatsApp, support type, support description, and contact consent.
- [x] 3.7 Add optional support fields for company/project, e-mail, city/region, and additional message.
- [x] 3.8 Add support FAQ entries that explicitly explain the difference between supporting the club and advertising on the site.
- [x] 3.9 Add a final support CTA that repeats the support intent without adding a competing commercial offer.

## 4. Commercial Partnership Page

- [x] 4.1 Implement the partner page hero for local business owners with badge `Para comercios da regiao`, headline `Divulgue sua empresa no site do Resenha`, short subtitle, WhatsApp primary CTA, and Resenha-native visual treatment.
- [x] 4.2 Configure the hero primary CTA to open WhatsApp or a WhatsApp contact path with a prefilled message about advertising the business on the site.
- [x] 4.3 Implement the first post-hero section `Veja onde sua empresa pode aparecer` with visual examples or component-based mockups before long explanatory copy.
- [x] 4.4 Add visual placement examples for article offering, partner page card, and match/round content using native Resenha card, badge, border, and color patterns.
- [x] 4.5 Implement the refined value proposition with concrete copy about appearing in Resenha articles, games, and partner pages.
- [x] 4.6 Implement the `Quem vai ver sua empresa` section with honest local audience language and no invented metrics.
- [x] 4.7 Implement the `Por que isso faz sentido para comercio local` section with concrete benefits such as link to WhatsApp/Instagram, official partner page, and real club content.
- [x] 4.8 Implement the simple base offer `Aparecer no Resenha` instead of opening with three plan cards.
- [x] 4.9 Implement optional add-on cards for `Materia com oferecimento`, `Parceiro da rodada`, and `Destaque maior`.
- [x] 4.10 Add example ad copy inside the previews, such as `Oferecimento: Pizzaria Boa Massa`, `Parceiro da rodada`, `Abrir WhatsApp`, and `Ver Instagram`.
- [x] 4.11 Add a comparison block that clearly separates `Apoiar o time` from `Anunciar no site`.
- [x] 4.12 Implement credibility/proof section using concrete current assets: articles, interviews, chronicles, games, gallery, and partner page.
- [x] 4.13 Add the secondary commercial form with required fields for name, company, WhatsApp, desired advertising option, and contact consent.
- [x] 4.14 Add optional secondary form fields for business type, Instagram or site, and message.
- [x] 4.15 Add commercial FAQ entries that answer where the company appears, who sees it, whether a large plan is required, whether WhatsApp/Instagram can be linked, and how to enter.
- [x] 4.16 Add repeated WhatsApp CTAs after visual examples, offer section, FAQ, and final CTA without making the page feel like a generic sales page.

## 5. Navigation, Home, And Sponsor Showcase

- [x] 5.1 Update `PublicHeader` desktop navigation/CTA so the commercial partnership path is discoverable without overcrowding main editorial links.
- [x] 5.2 Update `PublicHeader` mobile menu to show distinct `Apoiar o Resenha` and `Seja parceiro` actions after the main navigation.
- [x] 5.3 Update `packages/ui/src/layout/Footer.tsx` to include support, partner, sponsor, and contact links under an `Apoio e parcerias` concept.
- [x] 5.4 Update the home hero or lower home sections with at most one discreet monetization CTA surface that does not reduce priority of club/sport CTAs.
- [x] 5.5 Update `SponsorsMarquee` copy and CTAs to distinguish viewing partners from becoming a commercial partner or supporting the club.
- [x] 5.6 Update `/patrocinadores` hero copy to position the page as a credibility showcase for brands that strengthen the Resenha.
- [x] 5.7 Add two journey cards to `/patrocinadores`: one for `Apoiar o time` and one for `Divulgar minha marca`.
- [x] 5.8 Preserve current sponsor tier grouping while adding copy or badges that can clarify institutional support, commercial partnership, or both.
- [x] 5.9 Update the empty sponsor state to invite first partners without suggesting missing or broken data.

## 6. Forms, Lead Handling, And Analytics

- [x] 6.1 Implement client-side validation for support form and the secondary commercial form with field-level errors and first-error focus/scroll behavior.
- [x] 6.2 Implement submitting, success, and failure states for both lead form variants while preserving entered data on failure.
- [x] 6.3 Add a Fase 1 lead destination: no-op handler, API endpoint, e-mail hook, or WhatsApp prefilled fallback according to existing project constraints.
- [x] 6.4 Create or reuse an analytics helper that can safely no-op when no analytics provider is configured.
- [x] 6.5 Track CTA clicks with label, source, destination, and journey metadata, including WhatsApp-specific commercial CTA clicks.
- [x] 6.6 Track form start, submit, success, and error events separately for support and commercial journeys.
- [x] 6.7 Track partner card/logo clicks with partner name, source surface, and destination URL.
- [x] 6.8 Track base offer and add-on CTA clicks with offer/add-on name metadata.
- [x] 6.9 Track FAQ expansion or FAQ interaction if the FAQ component is interactive.

## 7. SEO, Accessibility, And Responsive QA

- [ ] 7.1 Add `createPageMetadata` configuration for `/apoiar-o-resenha` with support-focused title, description, canonical path, and keywords.
- [ ] 7.2 Add `createPageMetadata` configuration for `/seja-parceiro` with commercial partnership-focused title, description, canonical path, and keywords.
- [ ] 7.3 Verify each monetization page has exactly one H1 and meaningful H2 section structure.
- [ ] 7.4 Verify all form controls have visible labels, valid input types, and accessible error messaging.
- [ ] 7.5 Verify partner logos and visual assets have useful alt text.
- [ ] 7.6 Verify external partner links use safe external-link attributes.
- [ ] 7.7 Verify mobile layouts for support page, partner page, sponsor page, header menu, footer, forms, commercial offer cards, visual examples, and CTA strips.
- [ ] 7.8 Verify desktop layouts preserve current spacing, card language, dark palette, badges, hierarchy, and editorial balance.
- [ ] 7.9 Run lint/build checks for affected workspaces and fix regressions.

## 8. Fase 2 Backlog

- [ ] 8.1 Add database persistence for support and commercial leads with source, journey, status, and timestamps.
- [ ] 8.2 Add admin view for leads with status transitions such as new, contacted, qualified, won, and lost.
- [ ] 8.3 Add partner relationship type fields for club sponsor, site partner, supporter, and both.
- [ ] 8.4 Add configurable plan content in admin if plan copy needs non-developer editing.
- [ ] 8.5 Add editorial offering configuration for posts or match content.
- [ ] 8.6 Add reporting for partner logo clicks and CTA conversion by source.

## 9. Fase 3 Backlog

- [ ] 9.1 Add CRM, e-mail, or WhatsApp automation for lead follow-up.
- [ ] 9.2 Add commercial dashboard with lead volume, conversion, partner clicks, and active placements.
- [ ] 9.3 Add simple partner reports when reliable metrics are available.
- [ ] 9.4 Add campaign-by-round or seasonal package management.
- [ ] 9.5 Add optional premium partner detail page if commercial demand justifies it.
- [ ] 9.6 Add copy and CTA experiments once the baseline funnel has enough traffic.
