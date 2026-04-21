## ADDED Requirements

### Requirement: Dedicated club support page
The system SHALL provide a public `/apoiar-o-resenha` page dedicated to institutional and sporting support for Resenha RFC.

#### Scenario: User opens support page
- **WHEN** a user navigates to `/apoiar-o-resenha`
- **THEN** the page displays a Resenha-native support experience focused on strengthening the club, not buying advertising

#### Scenario: Support page explains purpose quickly
- **WHEN** the support page hero is visible
- **THEN** the user can understand that supporting the Resenha helps the team, structure, sporting routine, community, and club project

### Requirement: Club support page information architecture
The support page SHALL include a hero, value blocks, support types, supporter recognition, credibility context, support form, FAQ, and final CTA.

#### Scenario: User scans support page
- **WHEN** a user scrolls through `/apoiar-o-resenha`
- **THEN** the page presents support motivation before asking for form submission

#### Scenario: User reviews support options
- **WHEN** a user reaches the support types section
- **THEN** the page shows flexible options including punctual support, recurring support, institutional sponsorship, product/service support, and conversation-first support

### Requirement: Support journey copy and CTAs
The support journey SHALL use emotional, local, sporting, and institutional copy with CTAs that clearly signal support for the club.

#### Scenario: User sees support CTAs
- **WHEN** support CTAs are rendered
- **THEN** the primary CTA uses language equivalent to `Quero apoiar o Resenha` and does not imply buying ad inventory

#### Scenario: User reads supporter recognition
- **WHEN** the page describes supporter benefits
- **THEN** the copy frames visibility as recognition and SHALL NOT promise guaranteed reach, business return, sporting results, or fixed advertising placements

### Requirement: Support form fields
The support page SHALL include a lead form with fields appropriate to institutional support.

#### Scenario: Support form is displayed
- **WHEN** a user views the support form
- **THEN** the form includes required fields for name, WhatsApp, support type, support description, and contact consent

#### Scenario: Optional support form fields are displayed
- **WHEN** a user views the support form
- **THEN** the form includes optional fields for company/project, e-mail, city/region, and additional message

### Requirement: Support form validation
The support form SHALL validate required fields and provide field-level error messages.

#### Scenario: Required support fields are missing
- **WHEN** a user submits the support form without required data
- **THEN** the system displays clear errors near the affected fields and does not submit the lead

#### Scenario: WhatsApp is invalid
- **WHEN** a user submits a support form with an invalid WhatsApp value
- **THEN** the system asks for a valid WhatsApp with area code

### Requirement: Support form completion feedback
The support form SHALL provide clear submitting, success, and failure states.

#### Scenario: Support form submits successfully
- **WHEN** a valid support form is submitted successfully
- **THEN** the system confirms that the Resenha received the support interest and will return via WhatsApp

#### Scenario: Support form fails
- **WHEN** a support form submission fails
- **THEN** the system shows a non-destructive error message and keeps the entered data available for retry

### Requirement: Support journey differentiation
The support page SHALL explicitly differentiate supporting the club from commercial advertising on the site.

#### Scenario: User reads support FAQ
- **WHEN** a user reaches the FAQ on `/apoiar-o-resenha`
- **THEN** the page explains that support strengthens the club and that commercial visibility belongs to the partner journey

#### Scenario: User wants commercial visibility
- **WHEN** a user indicates interest in brand exposure rather than institutional support
- **THEN** the page provides a secondary path to `/seja-parceiro`

### Requirement: Support page visual integration
The support page SHALL follow the current Resenha RFC visual language and SHALL NOT introduce a generic fundraising or SaaS landing-page aesthetic.

#### Scenario: Support page is reviewed visually
- **WHEN** the support page is rendered on desktop or mobile
- **THEN** it uses the existing dark sporting visual system, Resenha colors, card patterns, badges, spacing, hierarchy, and button language

#### Scenario: Support page uses imagery
- **WHEN** imagery or visual highlights appear on the support page
- **THEN** they use Resenha assets, club context, match/quadra/campo references, or shield-based compositions rather than generic corporate stock visuals
