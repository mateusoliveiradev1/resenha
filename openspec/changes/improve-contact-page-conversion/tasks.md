## 1. Contact Configuration

- [x] 1.1 Create `apps/web/src/lib/contact.ts` with the official display phone `17 99673-5427`, WhatsApp number `5517996735427`, e-mail `warface01031999@gmail.com`, and helpers for WhatsApp/mailto hrefs.
- [x] 1.2 Define contact intent data for commercial partnership, club support, friendlies/games, press/content, institutional matters, and general questions.
- [x] 1.3 Update `/contato` metadata with contact-focused title, description, canonical path, and keywords for WhatsApp, partnership, support, sponsorship, friendlies, and Resenha RFC.

## 2. Contact Page Layout

- [x] 2.1 Replace the current `/contato` page shell with a Resenha-native hero that explains the page as the official contact center.
- [x] 2.2 Add primary WhatsApp and e-mail CTAs in the first visible area, showing `17 99673-5427` and `warface01031999@gmail.com`.
- [x] 2.3 Add direct contact cards for WhatsApp and e-mail with short copy, icons, accessible labels, and safe external-link attributes.
- [x] 2.4 Add intent routing cards that send commercial users to `/seja-parceiro`, support users to `/apoiar-o-resenha`, credibility seekers to `/patrocinadores`, and general/game/institutional contacts to WhatsApp or e-mail.
- [x] 2.5 Add concise expectation copy explaining that WhatsApp/e-mail are the fastest ways to start the conversation and that no commercial result or response time is guaranteed.

## 3. Contact Form

- [x] 3.1 Create a small client contact form component for `/contato`, colocated with the route or under `apps/web/src/components/contact`.
- [x] 3.2 Implement fields for name, WhatsApp, e-mail, subject, message, preferred send channel if needed, and contact consent.
- [x] 3.3 Validate name, subject, message, contact consent, and at least one valid return channel before opening any generated action.
- [x] 3.4 Generate a prefilled WhatsApp or e-mail message containing name, return contact, subject, and message on valid submit.
- [x] 3.5 Show field-level errors, preserve entered values after validation failure, and move focus or scroll to the first invalid field.
- [x] 3.6 Show a clear post-submit state explaining that the user must send the generated WhatsApp/e-mail message in the external app to complete contact.

## 4. Analytics And Tracking

- [x] 4.1 Add `data-monetization-event="cta_click"` metadata to WhatsApp, e-mail, internal journey, sponsor, and routed contact links on `/contato`.
- [x] 4.2 Track valid contact form actions with `trackMonetizationEvent("monetization_cta_click", ...)` using `source: "contact_form"` and descriptive label/destination/context fields.
- [x] 4.3 Reuse existing analytics event names only; do not add a new database migration or new `monetization_events.event_name` enum value for this change.

## 5. Accessibility, SEO, And Responsive QA

- [x] 5.1 Verify `/contato` has exactly one H1, useful H2 section headings, visible form labels, accessible error text, and keyboard-visible focus states.
- [x] 5.2 Verify WhatsApp and external links use `target="_blank"` and `rel="noopener noreferrer"` where appropriate.
- [x] 5.3 Verify mobile layout stacks hero, contact cards, intent cards, and form controls without overlap or horizontal scrolling.
- [x] 5.4 Verify desktop layout keeps contact channels and form balanced without nesting cards inside cards unnecessarily.
- [x] 5.5 Run `pnpm --filter web lint` and fix regressions.
- [x] 5.6 Run `pnpm --filter web build` or the closest available web build check and fix regressions.
