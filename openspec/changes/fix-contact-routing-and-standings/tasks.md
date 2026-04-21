## 1. Contact Routing

- [x] 1.1 Refactor `apps/web/src/lib/contact.ts` to define team and site contact channels with display phone, normalized WhatsApp number, e-mail, and href builders.
- [x] 1.2 Update contact intents so team-related subjects resolve to `17 99658-2337` and site/technical subjects resolve to `17 99673-5427`.
- [x] 1.3 Update `apps/web/src/components/contact/ContactForm.tsx` to route generated WhatsApp/e-mail messages by selected subject and display the resolved destination.
- [x] 1.4 Update `apps/web/src/app/(public)/contato/page.tsx` metadata, direct channels, labels, analytics destinations, and copy to show the correct contact for each purpose.
- [x] 1.5 Audit public pages and monetization components for stale contact values or destinationless `wa.me/?text=` links, then replace them with central contact builders.

## 2. Official Placarsoft Data

- [x] 2.1 Add a source configuration for the Pirangi Placarsoft competition `544099817090171200`, phase `28`, group `19`, and source page URL.
- [x] 2.2 Implement a Placarsoft fetch/normalization module using `fetch`, discovery fallback, timeout handling, and typed return values for standings, freshness, rounds, and games.
- [x] 2.3 Normalize standings from `table[].index` and `table[].data` so official order and official values are preserved.
- [x] 2.4 Normalize rounds/duels from the Placarsoft group response into the existing competition schedule presentation shape or a compatible page view model.
- [x] 2.5 Add a reduced fixture based on `GET /portal/competitions/groups/19` and tests for top-three order, Resenha FC row, one finished duel, and one scheduled duel.

## 3. Championship Page Integration

- [x] 3.1 Update `apps/web/src/app/campeonatos/[slug]/page.tsx` to prefer official Placarsoft data when a source is configured and fetch succeeds.
- [x] 3.2 Preserve existing local database standings and schedule behavior for competitions without an official source configured.
- [x] 3.3 Add fallback UI state for official-source failures so local data is not presented as freshly official.
- [x] 3.4 Render or expose the official `updated_at` freshness timestamp from Placarsoft on the competition page.
- [x] 3.5 Ensure the current official table renders Resenha FC as 7o with 3 jogos, 3 pontos, 1 vitoria, 2 derrotas, 13 gols pro, and 10 gols contra.

## 4. Verification

- [x] 4.1 Run the relevant football/contact unit tests and add missing coverage where behavior changed.
- [x] 4.2 Run lint/typecheck/build commands used by the affected apps/packages.
- [x] 4.3 Manually compare the local competition page against the official Placarsoft URL for standings order, Resenha row, finished games, and upcoming games.
- [x] 4.4 Manually test WhatsApp and e-mail links for team and site purposes without sending real messages.
