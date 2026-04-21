## ADDED Requirements

### Requirement: Contact page as conversion hub
The system SHALL provide a public `/contato` page that acts as a contact and routing hub for Resenha RFC instead of only rendering a generic form.

#### Scenario: User opens contact page
- **WHEN** a user navigates to `/contato`
- **THEN** the page presents a complete contact experience with direct channels, reasons to contact, routed next steps, and a fallback form

#### Scenario: User scans first screen
- **WHEN** the hero and primary contact area are visible
- **THEN** the user can identify how to call the Resenha by WhatsApp, how to send e-mail, and which action to take next

### Requirement: Official contact channels
The contact page SHALL display the official WhatsApp/phone and e-mail provided for Resenha RFC.

#### Scenario: Official channels are rendered
- **WHEN** the contact page loads
- **THEN** it displays `17 99673-5427` as the WhatsApp/phone and `warface01031999@gmail.com` as the e-mail

#### Scenario: User clicks WhatsApp
- **WHEN** the user activates a WhatsApp CTA
- **THEN** the system opens a WhatsApp link for `5517996735427` with a relevant prefilled message

#### Scenario: User clicks e-mail
- **WHEN** the user activates an e-mail CTA
- **THEN** the system opens a `mailto:` link addressed to `warface01031999@gmail.com` with a relevant subject or body when context is available

### Requirement: Contact intent routing
The contact page SHALL route common contact intents to the most relevant action or page.

#### Scenario: User wants commercial partnership
- **WHEN** the user chooses an intent equivalent to partnership, sponsorship, advertising, or brand visibility
- **THEN** the page provides a path to `/seja-parceiro` and a WhatsApp CTA with commercial context

#### Scenario: User wants to support the club
- **WHEN** the user chooses an intent equivalent to supporting the club
- **THEN** the page provides a path to `/apoiar-o-resenha`

#### Scenario: User wants match or friendly contact
- **WHEN** the user chooses an intent equivalent to amistoso, jogo, agenda, or desafio
- **THEN** the page provides a WhatsApp CTA with a prefilled message about arranging a match

#### Scenario: User wants institutional or editorial contact
- **WHEN** the user chooses an intent equivalent to institutional, press, content, or general communication
- **THEN** the page provides e-mail and/or WhatsApp actions with the selected context reflected in the message

### Requirement: Actionable contact form
The contact page SHALL include a fallback contact form that validates user input and produces an actionable WhatsApp or e-mail message.

#### Scenario: Contact form is displayed
- **WHEN** the user views the fallback form
- **THEN** it includes fields for name, return contact, subject, message, and contact consent

#### Scenario: User submits valid contact form
- **WHEN** the user submits valid form data
- **THEN** the system creates a prefilled WhatsApp or e-mail message containing the submitted name, return contact, subject, and message

#### Scenario: Form clarifies final send step
- **WHEN** the form action opens WhatsApp or e-mail
- **THEN** the page makes clear that the user must send the generated message in the external app to complete contact

### Requirement: Contact form validation
The contact form SHALL validate required fields and provide accessible field-level errors.

#### Scenario: Required fields are missing
- **WHEN** the user submits the form without name, subject, message, or contact consent
- **THEN** the form displays clear field-level errors and does not open WhatsApp or e-mail

#### Scenario: Return contact is missing
- **WHEN** the user submits the form without a valid WhatsApp or e-mail return channel
- **THEN** the form asks for at least one valid return contact

#### Scenario: First invalid field exists
- **WHEN** validation fails
- **THEN** focus moves to the first invalid field or the first invalid field is scrolled into view

### Requirement: Integration with monetization journeys
The contact page SHALL connect general contact traffic to the existing support and commercial monetization journeys when those journeys match the user's intent.

#### Scenario: User selects advertising intent
- **WHEN** the user selects an advertising or commercial partnership option
- **THEN** the page presents `/seja-parceiro` as the recommended next step rather than hiding it behind a generic form

#### Scenario: User selects support intent
- **WHEN** the user selects a club support option
- **THEN** the page presents `/apoiar-o-resenha` as the recommended next step

#### Scenario: User reviews sponsor credibility
- **WHEN** a user wants to see existing partners before contacting
- **THEN** the page offers a path to `/patrocinadores`

### Requirement: Honest contact expectations
The contact page SHALL set realistic expectations and SHALL NOT promise immediate response, commercial reach, ROI, or guaranteed outcomes.

#### Scenario: User reads contact copy
- **WHEN** copy describes response or partnership possibilities
- **THEN** it uses direct, local, professional language without promising response time, revenue, reach, or sporting results

#### Scenario: User sees commercial contact copy
- **WHEN** commercial contact text is displayed
- **THEN** it describes conversation and available site paths without claiming guaranteed business return

### Requirement: Contact page SEO metadata
The contact page SHALL provide route metadata aligned with contact, WhatsApp, partnership, sponsorship, and Resenha RFC discovery.

#### Scenario: Metadata is generated
- **WHEN** metadata for `/contato` is resolved
- **THEN** it includes a contact-focused title, description, canonical path, and relevant keywords

#### Scenario: Search result description is read
- **WHEN** a search user sees the contact page description
- **THEN** it communicates that the page is for contacting Resenha RFC about partnerships, support, friendlies, sponsorships, and institutional matters

### Requirement: Contact page accessibility and responsiveness
The contact page SHALL be accessible and responsive across mobile and desktop layouts.

#### Scenario: Form fields are reviewed
- **WHEN** assistive technology or keyboard users interact with the form
- **THEN** all controls have visible labels, valid names, focus states, and accessible error descriptions

#### Scenario: Page is viewed on mobile
- **WHEN** the page is rendered on a narrow viewport
- **THEN** cards, CTAs, and form controls stack cleanly without text overlap or horizontal scrolling

#### Scenario: External links are rendered
- **WHEN** WhatsApp or external links are present
- **THEN** they use safe attributes such as `target="_blank"` and `rel="noopener noreferrer"` when opening a new tab

### Requirement: Contact analytics
The contact page SHALL instrument important contact actions using the existing analytics approach without requiring a new database migration.

#### Scenario: User clicks contact CTA
- **WHEN** the user clicks WhatsApp, e-mail, support, commercial, sponsor, or routed contact CTAs
- **THEN** the action is trackable with source, label, destination, and relevant journey/context metadata

#### Scenario: User submits contact form
- **WHEN** the user submits a valid contact form and the generated WhatsApp or e-mail action is opened
- **THEN** the action is trackable using the existing `monetization_cta_click` event with `source` equal to `contact_form` or equivalent

#### Scenario: Analytics provider is unavailable
- **WHEN** no external analytics provider is configured
- **THEN** tracking does not block navigation, form behavior, or contact actions

### Requirement: Resenha-native visual treatment
The contact page SHALL follow the current Resenha RFC visual language and SHALL NOT look like an unrelated corporate contact page.

#### Scenario: Contact page is reviewed visually
- **WHEN** `/contato` renders on desktop or mobile
- **THEN** it uses the existing dark sporting visual system, Resenha colors, cards, badges, spacing, hierarchy, buttons, and icons

#### Scenario: Contact channels are displayed
- **WHEN** WhatsApp, e-mail, and contact intent cards are shown
- **THEN** they are visually prominent enough to act on but do not overpower the site's editorial and institutional identity
