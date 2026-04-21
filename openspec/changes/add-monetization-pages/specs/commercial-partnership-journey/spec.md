## ADDED Requirements

### Requirement: Dedicated local commerce advertising page
The system SHALL provide a public `/seja-parceiro` page focused on helping small and medium local businesses advertise on the Resenha RFC site.

#### Scenario: Local business owner opens partner page
- **WHEN** a business owner navigates to `/seja-parceiro`
- **THEN** the page explains in plain language that the business can appear on the Resenha site, in content, and in the partner area

#### Scenario: Page avoids technical marketing language
- **WHEN** commercial copy is rendered
- **THEN** it uses concrete language such as company, site, articles, games, partners, WhatsApp, Instagram, and region instead of technical marketing jargon

### Requirement: Immediate answer to buying questions
The partner page SHALL answer where the business appears, who can see it, why it matters, and how to enter within the first scan.

#### Scenario: User scans first screen
- **WHEN** the hero and first visual proof section are visible
- **THEN** the user can understand where the company can appear and how to contact the Resenha

#### Scenario: User wants the next action
- **WHEN** the user sees the primary CTA
- **THEN** the action is clear and contact-oriented, preferably opening WhatsApp

### Requirement: Visual proof before long explanation
The partner page SHALL show visual examples of advertising placements before relying on longer explanatory text.

#### Scenario: User reaches visual examples
- **WHEN** the user scrolls below the hero
- **THEN** the page shows previews or screenshots of placements such as an article offering block, partner card, and match/round content

#### Scenario: Real screenshots are unavailable
- **WHEN** final screenshots are not available
- **THEN** the page uses mockups built from actual Resenha components and visual style rather than generic marketing layouts

### Requirement: Plain value proposition for local businesses
The commercial journey SHALL use a direct value proposition tailored to owners of local businesses.

#### Scenario: Value proposition is displayed
- **WHEN** the value proposition appears
- **THEN** it communicates that the company can appear in Resenha articles, games, and partner pages watched by the club community

#### Scenario: Benefits are listed
- **WHEN** commercial benefits are rendered
- **THEN** they describe concrete outcomes such as appearing in articles, linking to WhatsApp or Instagram, and being listed on the official partner page

### Requirement: WhatsApp-first conversion
The commercial page SHALL make WhatsApp the primary conversion path and SHALL treat the form as secondary.

#### Scenario: User clicks primary CTA
- **WHEN** the user clicks the primary commercial CTA
- **THEN** the system opens WhatsApp or a WhatsApp contact path with a prefilled message about advertising the business on the site

#### Scenario: User prefers not to message immediately
- **WHEN** the user does not want to open WhatsApp
- **THEN** the page offers a secondary form path labeled as an alternative to leaving contact details

### Requirement: Simple initial offer
The partner page SHALL present one simple entry offer before optional add-ons or advanced commercial formats.

#### Scenario: User views offer section
- **WHEN** the commercial offer section is displayed
- **THEN** it presents a simple base offer equivalent to `Aparecer no Resenha`

#### Scenario: User reviews base offer
- **WHEN** the user reads the base offer
- **THEN** it explains that the business can have a card on the partner page with logo or name, short description, and link to WhatsApp, Instagram, or site

#### Scenario: User reviews optional add-ons
- **WHEN** optional add-ons are shown
- **THEN** they are presented as simple extras such as article offering, round partner, or larger highlight rather than a complex pricing table

### Requirement: Concrete placement examples
The partner page SHALL describe placements using concrete examples that local business owners can picture.

#### Scenario: Placement examples are displayed
- **WHEN** the placement section is rendered
- **THEN** it includes examples such as `Nas materias do Resenha`, `Na pagina de parceiros`, and `Em conteudos de jogo`

#### Scenario: Example copy is rendered
- **WHEN** example placement cards are rendered
- **THEN** they may show sample labels such as `Oferecimento`, `Parceiro da rodada`, `Abrir WhatsApp`, or `Ver Instagram`

### Requirement: Clear audience explanation
The partner page SHALL explain who may see the business without overstating numbers.

#### Scenario: Audience section is displayed
- **WHEN** the user reaches the `Quem vai ver` section
- **THEN** the page mentions players, family, friends, supporters, local community, and people viewing games, articles, photos, and partner information

#### Scenario: No reliable metrics exist
- **WHEN** validated audience metrics are unavailable
- **THEN** the page SHALL NOT invent visits, reach, impressions, or guaranteed results

### Requirement: Support versus advertising differentiation
The commercial page SHALL clearly distinguish advertising on the site from supporting the team.

#### Scenario: Difference block is displayed
- **WHEN** the user views the comparison between support and advertising
- **THEN** the page explains that supporting the team helps the club while advertising on the site promotes the business in agreed site placements

#### Scenario: User chooses support instead
- **WHEN** the user wants to help the team rather than advertise the business
- **THEN** the page provides a path to `/apoiar-o-resenha`

### Requirement: Secondary short form
The commercial page SHALL provide a short secondary form for users who prefer to leave contact information.

#### Scenario: Commercial form is displayed
- **WHEN** the secondary form is visible
- **THEN** it includes required fields for name, company, WhatsApp, desired advertising option, and contact consent

#### Scenario: Optional commercial form fields are displayed
- **WHEN** the secondary form is visible
- **THEN** it includes optional fields for business type, Instagram or site, and message

### Requirement: Secondary form validation and feedback
The secondary commercial form SHALL validate required fields and provide clear completion feedback.

#### Scenario: Required commercial fields are missing
- **WHEN** a user submits the secondary form without required data
- **THEN** the system displays clear field-level errors and does not submit the lead

#### Scenario: Commercial form submits successfully
- **WHEN** a valid secondary form is submitted successfully
- **THEN** the system confirms that the Resenha will contact the user on WhatsApp to show where the company can appear

### Requirement: Commercial page visual integration
The partner page SHALL follow the current Resenha RFC visual language and SHALL NOT look like a generic marketing landing page.

#### Scenario: Partner page is reviewed visually
- **WHEN** the page is rendered on desktop or mobile
- **THEN** it uses the existing dark sporting visual system, Resenha colors, cards, badges, spacing, hierarchy, and button language

#### Scenario: Commercial examples are rendered
- **WHEN** placement examples are displayed
- **THEN** they look like native Resenha site sections, article cards, sponsor cards, or match content rather than unrelated mockups
