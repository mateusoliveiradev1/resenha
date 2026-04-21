## ADDED Requirements

### Requirement: Official Placarsoft source configuration
The system SHALL support configuring an official Placarsoft source for a competition page.

#### Scenario: Configured competition uses official source
- **WHEN** a competition page has Placarsoft source identifiers for competition, phase, and group
- **THEN** the page MUST fetch official data from the configured Placarsoft backend or a discovered backend before rendering the official standings and games

#### Scenario: Discovery resolves backend
- **WHEN** the system needs to resolve the Placarsoft backend for `pirangi.portal.placarsoft.com.br`
- **THEN** it MUST be able to use the discovery endpoint `GET /api/v1/placarsoft/client?host=pirangi.portal.placarsoft.com.br&portal=1`

### Requirement: Official standings order is preserved
The system SHALL render the official standings order returned by Placarsoft when official data is available.

#### Scenario: Current top three order is preserved
- **WHEN** the official group `19` response lists Roseta Cravada FC, Veteranos PAC, and Real Alagoas in positions 1, 2, and 3
- **THEN** the site MUST render those teams in that same order even if local generic tiebreakers would produce another order

#### Scenario: Resenha official row is preserved
- **WHEN** the official group `19` response lists Resenha FC with index `7`, 3 games, 3 points, 1 win, 2 losses, 13 goals for, and 10 goals against
- **THEN** the site MUST render Resenha FC with those same official values

### Requirement: Official schedule and results are mapped from Placarsoft
The system SHALL map official Placarsoft rounds and duels into the competition schedule UI.

#### Scenario: Finished duel shows official score
- **WHEN** a Placarsoft duel has `done: true` and formatted home/away scores
- **THEN** the site MUST render it as a finished game with the official teams, date, location, and score

#### Scenario: Pending duel remains scheduled
- **WHEN** a Placarsoft duel has `done: false` and empty score fields
- **THEN** the site MUST render it as scheduled without inventing a score

### Requirement: Official data freshness is visible
The system SHALL expose the freshness of official competition data when it is available.

#### Scenario: Official update timestamp is available
- **WHEN** the Placarsoft group response includes `updated_at`
- **THEN** the competition page MUST make the official update timestamp available in the rendered data or supporting UI state

### Requirement: External source failure has a safe fallback
The system SHALL handle Placarsoft fetch failures without silently presenting stale local data as official.

#### Scenario: Official source fails
- **WHEN** the Placarsoft API times out or returns an error
- **THEN** the site MAY render local fallback data, but it MUST indicate that official data could not be refreshed

#### Scenario: No official source configured
- **WHEN** a competition does not have a Placarsoft source configured
- **THEN** the site MUST continue using the existing local database standings and schedule behavior

### Requirement: Official data normalization is testable
The system SHALL normalize Placarsoft data through a testable function before rendering.

#### Scenario: Fixture validates standings mapping
- **WHEN** a fixture based on `GET /portal/competitions/groups/19` is normalized
- **THEN** tests MUST verify the official order, Resenha FC row, and at least one finished and one scheduled duel

