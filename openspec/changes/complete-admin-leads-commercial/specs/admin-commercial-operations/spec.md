## ADDED Requirements

### Requirement: Commercial dashboard summarizes funnel health
The admin SHALL provide a commercial dashboard with current commercial leads, won conversion rate, partner clicks and active placements.

#### Scenario: Dashboard loads with persisted data
- **WHEN** the commercial page loads
- **THEN** it SHALL calculate dashboard cards from monetization leads, monetization events, sponsors, offers, offerings, campaigns and premium pages

#### Scenario: Low-confidence partner reports are withheld
- **WHEN** a partner has fewer than the configured minimum number of clicks
- **THEN** the admin SHALL avoid presenting that partner as a reliable report and SHALL show a low-data message

### Requirement: Offers and add-ons are editable
The admin SHALL allow creating, updating, activating, deactivating and deleting commercial offer content for the public partner page.

#### Scenario: Save active base offer
- **WHEN** an operator saves an active record with slot `base_offer`
- **THEN** `/seja-parceiro` SHALL use it as the public base offer instead of the fallback copy

#### Scenario: Save add-on
- **WHEN** an operator saves an active record with slot `addon`
- **THEN** `/seja-parceiro` SHALL show it as an optional commercial add-on ordered by display order

#### Scenario: Delete offer
- **WHEN** an operator deletes an offer record
- **THEN** the record SHALL be removed, relevant admin/public routes SHALL be revalidated, and the public page SHALL fall back safely if needed

### Requirement: Editorial offerings are manageable
The admin SHALL allow managing editorial offering blocks that can be attached to posts or editorial surfaces.

#### Scenario: Create editorial offering
- **WHEN** an operator saves an offering with partner name, label, description and link
- **THEN** the offering SHALL be persisted and available for editorial use

#### Scenario: Invalid offering link
- **WHEN** an offering link is not empty and is not a valid URL
- **THEN** the admin SHALL reject the save with a visible validation error

### Requirement: Follow-up automations are manageable
The admin SHALL allow managing follow-up templates for WhatsApp, email or CRM hints.

#### Scenario: Active WhatsApp automation
- **WHEN** an active WhatsApp automation is saved for commercial leads with status `NEW`
- **THEN** the leads module SHALL be able to use that template for matching lead contact actions

#### Scenario: Delete automation
- **WHEN** an operator deletes a follow-up automation
- **THEN** it SHALL no longer be used by lead contact actions

### Requirement: Campaign packages are manageable
The admin SHALL allow managing commercial packages for rounds or seasonal campaigns.

#### Scenario: Active campaign
- **WHEN** an operator saves an active campaign with status `ACTIVE`
- **THEN** the commercial dashboard SHALL count it as an active placement and the data SHALL be available for public or future editorial use

#### Scenario: Campaign linked to sponsor
- **WHEN** a campaign is linked to an existing sponsor
- **THEN** the relation SHALL persist and remain safe if the sponsor is later removed

### Requirement: Premium partner pages are manageable and publishable
The admin SHALL allow creating, editing, activating and deactivating premium partner pages.

#### Scenario: Publish premium partner page
- **WHEN** an operator saves a premium page with `isActive=true`, valid slug, title, summary and partner name
- **THEN** `/parceiros/[slug]` SHALL render that page publicly

#### Scenario: Unpublished premium partner page
- **WHEN** a premium page is inactive
- **THEN** `/parceiros/[slug]` SHALL not expose it as an active public partner page

### Requirement: Copy and CTA experiments are manageable
The admin SHALL allow configuring copy/CTA experiments for eligible monetization surfaces.

#### Scenario: Active hero experiment in valid window
- **WHEN** an active commercial experiment targets `partner_page_hero` and the current date is within its window
- **THEN** `/seja-parceiro` SHALL use its headline, supporting copy, CTA label and destination where provided

#### Scenario: Experiment outside window
- **WHEN** an experiment is inactive or outside its date window
- **THEN** the public page SHALL ignore it and use the default or next valid content

### Requirement: Commercial forms provide feedback and preserve data
The admin SHALL show validation, success and failure feedback for commercial saves and SHALL avoid losing operator input on recoverable errors.

#### Scenario: Validation error
- **WHEN** an operator submits invalid commercial content
- **THEN** the admin SHALL show the validation problem near the relevant form and keep the submitted values available

#### Scenario: Successful save
- **WHEN** an operator saves valid commercial content
- **THEN** the admin SHALL persist the record, revalidate affected pages and show confirmation or refreshed saved state

### Requirement: Commercial module remains navigable
The commercial module SHALL be organized so operators can find dashboard, offers, offerings, follow-up, campaigns, premium pages, experiments and reports without scanning a single unstructured page.

#### Scenario: Navigate commercial sections
- **WHEN** the commercial page contains multiple management sections
- **THEN** the admin SHALL expose clear section headings, anchors, tabs or equivalent navigation for the operator
