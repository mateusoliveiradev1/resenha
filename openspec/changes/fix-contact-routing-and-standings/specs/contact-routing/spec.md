## ADDED Requirements

### Requirement: Official contact channels by purpose
The system SHALL maintain distinct public contact channels for team-related messages and site-related messages.

#### Scenario: Team channel is resolved for club matters
- **WHEN** a user chooses a team-related contact intent such as support, team sponsorship, games, press, institutional, or general club questions
- **THEN** the generated WhatsApp destination MUST be `5517996582337` and the generated e-mail destination MUST be `warface01031999@gmail.com`

#### Scenario: Site channel is resolved for site matters
- **WHEN** a user chooses a commercial partnership to appear on the site, maintenance, portal support, or technical website contact intent
- **THEN** the generated WhatsApp destination MUST be `5517996735427`

### Requirement: Contact links use explicit destinations
The system SHALL generate WhatsApp and e-mail links with explicit destinations instead of destinationless or stale links.

#### Scenario: WhatsApp CTA includes destination number
- **WHEN** a public CTA opens WhatsApp for any contact journey
- **THEN** the `href` MUST include a `wa.me` number matching the resolved contact channel

#### Scenario: E-mail CTA includes valid address
- **WHEN** a public CTA opens an e-mail client
- **THEN** the `href` MUST use `mailto:warface01031999@gmail.com` for team-related messages

### Requirement: Contact UI communicates routing clearly
The system SHALL show enough context for users to know whether they are contacting the team or the site.

#### Scenario: Team contact is displayed
- **WHEN** a page presents a team-related channel
- **THEN** it MUST display `17 99658-2337` as the team WhatsApp number and `warface01031999@gmail.com` as the e-mail

#### Scenario: Site contact is displayed
- **WHEN** a page presents a site-related channel
- **THEN** it MUST display `17 99673-5427` as the site contact number

### Requirement: Contact form routes by selected subject
The contact form SHALL resolve its destination from the selected subject before generating the outgoing message.

#### Scenario: Team subject opens team channel
- **WHEN** the form subject is related to the club, team support, team sponsorship, games, press, institutional contact, or general club questions
- **THEN** the generated outgoing message MUST open through the team channel

#### Scenario: Site subject opens site channel
- **WHEN** the form subject is related to commercial partnership for appearing on the site, website support, or site maintenance
- **THEN** the generated outgoing message MUST open through the site channel

### Requirement: Contact destinations remain consistent across public pages
The system SHALL avoid hardcoded contact values that diverge from the central contact registry.

#### Scenario: Public page uses contact registry
- **WHEN** a public page, form, CTA, metadata description, or analytics destination references a contact channel
- **THEN** the value MUST come from the central contact registry or a builder that uses it
