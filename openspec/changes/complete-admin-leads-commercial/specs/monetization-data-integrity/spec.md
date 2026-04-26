## ADDED Requirements

### Requirement: Public lead API validates and persists normalized leads
The public lead API SHALL validate support and commercial submissions before persisting them to `monetization_leads`.

#### Scenario: Valid commercial lead
- **WHEN** a commercial lead includes name, company, valid WhatsApp with DDD, advertising option and contact consent
- **THEN** the API SHALL create a `commercial` lead with status `NEW`, source, contact fields and raw payload

#### Scenario: Invalid support lead
- **WHEN** a support lead is missing support type, support description, valid WhatsApp or contact consent
- **THEN** the API SHALL return validation errors and SHALL NOT create a lead

### Requirement: Analytics events use supported names and normalized payload fields
The public analytics flow SHALL map UI data attributes to supported monetization event names and persist normalized fields used by admin reports.

#### Scenario: CTA click tracked
- **WHEN** a public element with `data-monetization-event="cta_click"` is clicked
- **THEN** the system SHALL persist a `monetization_cta_click` event with label, source, destination and journey when present

#### Scenario: Partner click tracked
- **WHEN** a partner logo/card link is clicked
- **THEN** the system SHALL persist a `partner_logo_click` event with partner name, source and destination URL

#### Scenario: Unsupported event rejected
- **WHEN** the analytics API receives an unsupported event name
- **THEN** it SHALL reject the request without inserting an event

### Requirement: Database schema and migrations match runtime usage
The database schema, Drizzle migrations and validators SHALL cover every table, enum and field used by the public site and admin modules.

#### Scenario: Schema field used by admin
- **WHEN** an admin form writes a monetization field
- **THEN** that field SHALL exist in `packages/db/src/schema`, be represented in migrations and be validated or normalized by `@resenha/validators` where applicable

#### Scenario: New database need discovered
- **WHEN** implementation requires a table or column not present in applied migrations
- **THEN** a new incremental migration SHALL be created instead of editing historical migrations

### Requirement: Public monetization surfaces fall back safely
Public monetization pages SHALL render safe fallback content when dynamic commercial records are absent, inactive or temporarily unavailable.

#### Scenario: No active offer records
- **WHEN** no active commercial offer content exists
- **THEN** `/seja-parceiro` SHALL render the default offer and add-ons from code without failing

#### Scenario: Database read fails on public page
- **WHEN** a public page cannot read optional commercial configuration
- **THEN** the page SHALL render a safe fallback instead of throwing a user-facing error

### Requirement: Admin changes revalidate affected surfaces
Admin changes to monetization content SHALL revalidate affected admin and public routes so saved content becomes visible where expected.

#### Scenario: Offer saved
- **WHEN** an offer or add-on is saved in the commercial admin
- **THEN** `/comercial`, `/seja-parceiro` and related sponsor/partner surfaces SHALL be revalidated

#### Scenario: Premium page saved
- **WHEN** a premium partner page slug or active state changes
- **THEN** the relevant `/parceiros/[slug]` route SHALL reflect the new state on the next request

### Requirement: Public and admin labels stay semantically aligned
The system SHALL keep support, commercial, sponsor, partner and offering labels consistent across public pages, admin modules, statuses and reports.

#### Scenario: Lead journey labels
- **WHEN** a lead is shown in admin
- **THEN** `support` SHALL be labeled as `Apoio` and `commercial` SHALL be labeled as `Comercial` consistently across table, cards, detail and follow-up templates

#### Scenario: Sponsor relationship labels
- **WHEN** a sponsor relationship type is shown publicly or in admin
- **THEN** `CLUB_SPONSOR`, `SITE_PARTNER`, `SUPPORTER` and `BOTH` SHALL be presented with user-facing labels that distinguish support to the club from commercial site partnership

### Requirement: Critical monetization flows are verified
The implementation SHALL include repeatable verification for the lead and commercial admin flows.

#### Scenario: Lead flow verification
- **WHEN** checks run for the monetization flow
- **THEN** they SHALL cover public lead submission, admin visibility, status update and WhatsApp follow-up URL generation

#### Scenario: Commercial content verification
- **WHEN** checks run for commercial content
- **THEN** they SHALL cover saving an offer, rendering it publicly, tracking an event and preserving fallback behavior
