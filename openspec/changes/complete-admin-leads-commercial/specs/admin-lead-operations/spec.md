## ADDED Requirements

### Requirement: Lead inbox displays captured support and commercial leads
The admin SHALL display monetization leads captured from public support and commercial forms with enough information for an operator to understand the request without querying the database.

#### Scenario: Lead appears after public submission
- **WHEN** a valid support or commercial lead is submitted through the public API
- **THEN** the lead SHALL appear in the admin leads inbox with journey, source, status, name, contact, interest and received date

#### Scenario: Empty inbox is actionable
- **WHEN** no leads exist
- **THEN** the admin SHALL show an empty state explaining that public support and partnership forms will populate the inbox

### Requirement: Leads can be filtered, searched and sorted
The admin SHALL provide operational controls to narrow the leads list by status, journey, source, received period and text search.

#### Scenario: Filter by status and journey
- **WHEN** an operator filters leads by `NEW` and `commercial`
- **THEN** the inbox SHALL show only new commercial leads and preserve the selected filters in the URL or page state

#### Scenario: Search by contact fields
- **WHEN** an operator searches by name, company, WhatsApp or email
- **THEN** matching leads SHALL remain visible and non-matching leads SHALL be hidden

### Requirement: Lead detail is readable and actionable
The admin SHALL expose a lead detail view or drawer containing all persisted lead fields, raw interest context, source, timestamps and next-step actions.

#### Scenario: Open lead detail
- **WHEN** an operator selects a lead from the inbox
- **THEN** the admin SHALL show the lead journey, status, contact data, company, city, support fields, commercial fields, message, raw source and timestamps

#### Scenario: Contact lead through WhatsApp
- **WHEN** an operator clicks the WhatsApp action for a lead
- **THEN** the admin SHALL open a WhatsApp URL using the normalized phone number and a template appropriate for the lead journey and status

### Requirement: Lead status can be advanced safely
The admin SHALL allow changing a lead status across `NEW`, `CONTACTED`, `QUALIFIED`, `WON` and `LOST` with validation and visible feedback.

#### Scenario: Successful status update
- **WHEN** an operator changes a lead from `NEW` to `CONTACTED`
- **THEN** the system SHALL persist the new status, update `updatedAt`, revalidate the leads page and show the updated value

#### Scenario: Invalid status rejected
- **WHEN** an invalid status is submitted
- **THEN** the system SHALL reject the update and show an error without changing the lead

### Requirement: Follow-up templates are applied to lead actions
The admin SHALL use active follow-up automation templates when building contact actions for leads.

#### Scenario: Journey-specific template exists
- **WHEN** an active WhatsApp follow-up template matches the lead journey and current status
- **THEN** the WhatsApp action SHALL use that template with lead placeholders filled

#### Scenario: No template exists
- **WHEN** no active template matches the lead
- **THEN** the WhatsApp action SHALL use a safe default Resenha message

### Requirement: Lead metrics summarize operational state
The admin SHALL summarize total leads, new leads, commercial leads, support leads and relevant conversion events.

#### Scenario: Metrics reflect current data
- **WHEN** the leads page loads
- **THEN** the metric cards SHALL count persisted leads and monetization events from the database

#### Scenario: No event data exists
- **WHEN** no tracked monetization events exist
- **THEN** the report section SHALL show a neutral empty state instead of failing or showing misleading zeros as performance insight

### Requirement: Lead UI works on mobile and desktop
The leads module SHALL be usable on desktop tables and mobile card layouts without losing critical actions.

#### Scenario: Desktop inbox
- **WHEN** the admin is opened on a desktop viewport
- **THEN** leads SHALL be shown in a scan-friendly table with status, source, date and follow-up action

#### Scenario: Mobile inbox
- **WHEN** the admin is opened on a mobile viewport
- **THEN** leads SHALL be shown as cards with journey, status, source, message summary, status control and WhatsApp action
