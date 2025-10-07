# Copilot Telemetry Analyzer (Local-First)

A local-first Next.js app to anonymize GitHub Copilot telemetry JSON files and visualize KPIs, aligned with GitHub’s Metrics Viewer guidance.

## Quick start

1. Place raw telemetry files in `./telemetry` (workspace root, sibling of the Next.js app). Each file is an array of day objects matching the schema described below.
2. Install and run:

```bash
cd copilot-telemetry
npm install
npm run dev
```

3. Visit `/tools` to anonymize. This reads `../telemetry` and writes `../telemetry_anonymized`. You can also download a ZIP of the output.
4. Visit `/` for the dashboard. Use the period picker (7/28/90/100 days) to change the window and see comparison deltas vs the previous period.

Environment:
- Optional: `ANON_SALT` to control deterministic hashing. If not set, a `.anonymizer-salt` file is generated in the app root on first run.

## Schema (DayMetrics)
- `date` (YYYY-MM-DD)
- `total_active_users`
- `total_engaged_users`
- `copilot_ide_code_completions` with editors/models/languages per the GitHub Copilot Metrics API example
- `copilot_ide_chat` (totals per editor and model)
- `copilot_dotcom_chat`
- `copilot_dotcom_pull_requests` (repositories may contain sensitive slugs)

See `src/types/copilot.ts` for strong types.

## Anonymization
- Deterministic pseudonyms using SHA-256(`salt + value`) (hex, 8-char prefix)
- Repository names: `org/repo` → `repo-<hash8>`
- Custom model names (`is_custom_model===true`): `model-<hash8>`, removes `custom_model_training_date`
- Preserves editor names (vscode, neovim, jetbrains) and language names
- Strips unknown fields by reconstructing the typed shape
- Run at `/tools` with the Anonymize button; ZIP download available

## Dashboard metrics
Top KPIs (with tooltips):
- Active users: users with an active Copilot license using Copilot that day.
- Engaged users: users who engaged with a Copilot feature that day (e.g., accepted a suggestion, used chat). Breakdowns by IDE and language.
- IDE code completions engaged users: sum of `copilot_ide_code_completions.total_engaged_users` over the period.
- Chat engaged users: sum of `copilot_ide_chat.total_engaged_users` over the period.
- Acceptance rate (suggestions) = accepted suggestions / total suggestions.
- Acceptance rate (lines) = accepted lines / suggested lines.

Charts:
- Acceptance rate trend (7-day moving average)
- Suggestions vs Acceptances stacked bars
- Breakdowns: By IDE and by Language (top items with Others bucket)

Note: Acceptance rate is a usefulness indicator, not a direct productivity measure.

## Tests
- Run `npm test` to execute Jest tests for anonymization and metrics aggregation.

## Screenshots
- Add screenshots of `/tools` and `/` here after first run.
