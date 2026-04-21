## ADDED Requirements

### Requirement: Monetization discovery in navigation
The system SHALL expose the support and commercial partnership journeys through existing navigation surfaces without overcrowding the editorial experience.

#### Scenario: Desktop header is rendered
- **WHEN** the desktop header is visible
- **THEN** it provides a clear commercial partnership path while preserving the main editorial and sporting navigation

#### Scenario: Mobile menu is opened
- **WHEN** a user opens the mobile menu
- **THEN** the menu presents both `Apoiar o Resenha` and `Seja parceiro` as distinct actions after the main navigation links

#### Scenario: Footer is rendered
- **WHEN** the footer is visible
- **THEN** it includes discoverable links for supporting the club, becoming a partner, viewing sponsors/partners, and general contact

### Requirement: Home monetization entry points
The home page SHALL include monetization entry points only where they complement existing editorial and sporting content.

#### Scenario: User views the first home viewport
- **WHEN** the home hero is rendered
- **THEN** sport and club CTAs remain visually prioritized over monetization CTAs

#### Scenario: User reaches sponsor or post sections
- **WHEN** a user reaches a sponsor showcase or selected lower home section
- **THEN** the page may present a discreet CTA strip or commercial invitation without inserting multiple commercial blocks in the same viewport

### Requirement: Sponsor showcase evolution
The existing sponsor page SHALL evolve into a credibility showcase that distinguishes institutional support from commercial site partnership.

#### Scenario: User opens sponsor page
- **WHEN** a user navigates to `/patrocinadores`
- **THEN** the page displays existing sponsors/partners and provides separate paths for `Apoiar o time` and `Divulgar minha marca`

#### Scenario: Sponsor groups are displayed
- **WHEN** sponsor groups are rendered
- **THEN** the system preserves current tier grouping while allowing copy or labels to clarify whether a relationship is institutional support, commercial partnership, or both

#### Scenario: No sponsors exist
- **WHEN** no active sponsors are available
- **THEN** the page displays an empty state inviting first partners without implying that existing data is broken

### Requirement: Reusable monetization components
The system SHALL define reusable components for monetization surfaces that follow the existing Resenha visual system.

#### Scenario: Partner card is used
- **WHEN** a partner or sponsor is shown as a card
- **THEN** the card supports logo, fallback initials, name, relationship badge, short description, optional link, hover state, and premium variation

#### Scenario: Offer block is used in editorial content
- **WHEN** a commercial offer block appears near editorial content
- **THEN** it clearly labels the relationship as an offering or partnership and does not obscure the article title or main content

#### Scenario: Plan card is used
- **WHEN** a plan card is rendered
- **THEN** it includes plan name, audience, inclusions, flexibility note, and CTA using Resenha-native card styling

#### Scenario: FAQ block is used
- **WHEN** a FAQ block is rendered on support or partner pages
- **THEN** it presents questions and answers in a compact mobile-friendly format with accessible headings or controls

### Requirement: Partner links and click tracking readiness
The system SHALL make partner links accessible and ready for analytics tracking.

#### Scenario: Partner has an external link
- **WHEN** a user activates a partner card or logo with an external URL
- **THEN** the link opens safely with appropriate external-link attributes and exposes enough metadata for a partner click event

#### Scenario: Partner has no external link
- **WHEN** a partner card has no URL
- **THEN** the card remains readable and does not render as a broken or misleading link

### Requirement: SEO metadata for monetization pages
The system SHALL configure semantic headings and metadata for support, partnership, and sponsor-discovery pages.

#### Scenario: Support page metadata is generated
- **WHEN** metadata for `/apoiar-o-resenha` is requested
- **THEN** it includes a support-focused title, description, canonical path, and relevant keywords

#### Scenario: Partner page metadata is generated
- **WHEN** metadata for `/seja-parceiro` is requested
- **THEN** it includes a commercial partnership-focused title, description, canonical path, and relevant keywords

#### Scenario: Page headings are inspected
- **WHEN** a monetization page is rendered
- **THEN** it contains one primary H1 and section headings that match the page intent

### Requirement: Analytics events for monetization validation
The system SHALL define analytics events to validate monetization discovery, lead generation, partner engagement, and content interaction.

#### Scenario: User clicks monetization CTA
- **WHEN** a user clicks a support or partnership CTA
- **THEN** the system records or exposes an event with label, source, destination, and journey

#### Scenario: User submits a monetization form
- **WHEN** a support or commercial form is started, submitted, succeeds, or fails
- **THEN** the system records or exposes separate events for each form journey and state

#### Scenario: User clicks partner logo
- **WHEN** a user clicks a partner logo or partner card link
- **THEN** the system records or exposes the partner name, source surface, and destination URL

### Requirement: Responsive monetization experience
The monetization pages and components SHALL be mobile-first and SHALL remain usable on small screens.

#### Scenario: User views support page on mobile
- **WHEN** `/apoiar-o-resenha` is rendered on a small viewport
- **THEN** hero content, cards, CTAs, form fields, and FAQ stack cleanly with readable spacing and touch-friendly controls

#### Scenario: User views partner page on mobile
- **WHEN** `/seja-parceiro` is rendered on a small viewport
- **THEN** placements, plan cards, CTAs, form fields, and FAQ stack cleanly without horizontal scrolling or text overlap

### Requirement: Editorial-commercial balance
The system SHALL ensure monetization elements are integrated into the editorial product without competing with core content.

#### Scenario: Monetization appears on editorial surfaces
- **WHEN** a commercial banner, offer block, or CTA appears near posts, match content, or gallery content
- **THEN** it is visually secondary to the editorial content and clearly labeled

#### Scenario: Multiple monetization elements could appear together
- **WHEN** a page already contains a sponsor showcase or commercial CTA in the current viewport
- **THEN** additional commercial elements are avoided or moved lower on the page to prevent clutter
