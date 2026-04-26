## 1. Data And Contract Audit

- [x] 1.1 Verify `packages/db/src/schema/monetization.ts`, `packages/db/src/schema/sponsors.ts`, migrations `0006`/`0007` and `packages/validators/src/monetization.ts` cover every field used by admin and public monetization flows.
- [x] 1.2 Add any missing incremental migration instead of editing historical migrations.
- [x] 1.3 Align public lead API validation with shared validators where practical, keeping current support/commercial required fields.
- [x] 1.4 Confirm `DATABASE_URL` failure states are handled cleanly in optional public monetization reads.
- [x] 1.5 Document or seed minimal test data for one support lead, one commercial lead, one offer, one add-on, one offering, one campaign and one premium partner page.

## 2. Leads Admin Operations

- [x] 2.1 Add server-side query support for lead filters: status, journey, source, period and text search.
- [x] 2.2 Update `apps/admin/src/app/(admin)/leads/page.tsx` to read filter/search params and pass filtered data to the UI.
- [x] 2.3 Add desktop filter/search controls and preserve selected filters in URL or stable page state.
- [x] 2.4 Add mobile-friendly filter/search controls without hiding status and WhatsApp actions.
- [x] 2.5 Add a lead detail drawer, modal or detail route showing all persisted lead fields, raw interest context, source and timestamps.
- [x] 2.6 Harden `updateLeadStatus` with id validation, structured error return and unchanged data on invalid status.
- [x] 2.7 Show inline success/error feedback when lead status changes instead of relying only on refresh/alert.
- [x] 2.8 Keep WhatsApp follow-up URL generation aligned with active templates and safe fallback messages.
- [x] 2.9 Ensure leads metrics and event summaries respect the same definitions used by the specs.
- [x] 2.10 Verify empty, loading/error, desktop and mobile states for the leads module.

## 3. Commercial Admin Operations

- [x] 3.1 Split the large commercial page into smaller components for dashboard, offers, offerings, follow-ups, campaigns, premium pages, experiments and reports.
- [x] 3.2 Add section navigation with tabs, anchors or equivalent so operators can jump between commercial areas.
- [x] 3.3 Convert commercial forms to show validation, success and failure feedback inline while preserving submitted values on recoverable errors.
- [x] 3.4 Confirm offer base/add-on save, update, activate/deactivate and delete flows revalidate `/comercial`, `/seja-parceiro` and related public surfaces.
- [x] 3.5 Confirm editorial offering save/delete validates URLs and remains available for post/editorial usage.
- [x] 3.6 Confirm follow-up automation save/delete affects lead WhatsApp template selection.
- [x] 3.7 Confirm campaign package save/delete handles sponsor relation, active status and dashboard placement counts.
- [x] 3.8 Confirm premium partner page save/delete supports valid slugs, publish/unpublish behavior and `/parceiros/[slug]` rendering.
- [x] 3.9 Confirm copy/CTA experiment save/delete respects active state, date window and partner page hero usage.
- [x] 3.10 Keep low-confidence report messaging for partners with insufficient click volume.

## 4. Public Integration And Analytics

- [x] 4.1 Audit all `data-monetization-event` usages and ensure they map to supported analytics events.
- [x] 4.2 Verify partner click payloads persist `partner_name`, source and destination consistently.
- [x] 4.3 Verify offer/add-on CTA clicks persist as `plan_cta_click` with plan/offer name.
- [x] 4.4 Verify FAQ interactions persist as `faq_expand` only when a question is opened.
- [x] 4.5 Verify `/seja-parceiro` uses active admin offer/add-on records and falls back safely when none exist.
- [x] 4.6 Verify `/patrocinadores` and partner cards display relationship labels consistently for club sponsor, site partner, supporter and both.
- [x] 4.7 Verify `/parceiros/[slug]` only renders active premium pages and returns not-found behavior for inactive/missing pages.
- [x] 4.8 Verify public lead forms keep entered data on failure and create admin-visible records on success.

## 5. Verification

- [x] 5.1 Add or update focused tests for lead validation and status transitions.
- [x] 5.2 Add or update focused tests for analytics event normalization and persistence payloads.
- [x] 5.3 Add or update focused tests for commercial offer fallback versus active DB content.
- [x] 5.4 Run `pnpm --filter web lint` and fix regressions.
- [x] 5.5 Run `pnpm --filter admin lint` and fix regressions.
- [x] 5.6 Run `pnpm test` or targeted package tests affected by the change.
- [x] 5.7 Run build or targeted Next builds for affected apps if time/resources allow.
- [x] 5.8 Perform manual validation: submit public lead, see it in admin, change status, open WhatsApp follow-up, save offer, verify public page, click CTA, verify report event.
