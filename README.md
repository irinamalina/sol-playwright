# Solstice Solar — Playwright Automation

End-to-end (browser) and API tests for the client/server apps in this repo.

## Structure

```
automation-slcsolar/
├── tests/
│   ├── e2e/          # browser tests (chromium/firefox/webkit projects)
│   └── api/          # direct REST API tests (api project)
├── pages/             # page objects (one per route) + NavbarComponent
├── fixtures/
│   ├── base.ts        # custom test with apiClient / registeredUser / authenticatedPage fixtures
│   └── test-data.ts   # faker-backed factories for users & quotes
├── api/
│   └── api-client.ts  # typed wrapper over the /api/* endpoints
├── scripts/
│   ├── reset-test-data.js
│   └── triage-results.js  # classifies failures for the test-maintenance agent (see below)
├── config.ts           # BASE_URL / API_URL, shared by config + fixtures
├── global-setup.ts      # pre-flight health check for client & server
└── playwright.config.ts
```

## Setup

```bash
npm install
npm run install:browsers   # downloads browser binaries once
cp .env.example .env       # only needed if ports differ from the defaults
```

## Running

```bash
npm test              # everything, all projects
npm run test:e2e      # chromium + firefox + webkit
npm run test:api      # API-only project
npm run test:chromium # fastest inner-loop during development
npm run test:ui       # Playwright's interactive UI mode
npm run report        # open the last HTML report
```

By default Playwright boots `../server` and `../client` for you (`webServer`
in `playwright.config.ts`) and waits on them via `global-setup.ts`. If
something else already owns those processes (a supervisor, docker-compose,
an agent), set `SKIP_WEB_SERVER=1` to skip the auto-start and let
`global-setup.ts` just verify they're reachable.

## State: the API has no test-data cleanup

`server/db/data.json` is a flat file the API appends to forever — there's no
delete endpoint. Test data factories (`fixtures/test-data.ts`) generate a
unique email per run so re-running the suite never collisions on "already
exists" errors, but the file will still grow indefinitely. Run
`npm run test:reset-db` between runs (e.g. at the start of a scheduled job)
to wipe it back to empty.

## For agents / CI

- Reporters: `list` (stdout), `html` → `playwright-report/`, `json` →
  `test-results/results.json`, `junit` → `test-results/results.xml`. Parse
  the JSON or JUnit output rather than scraping stdout.
- **Don't pass `--reporter=...` on the CLI in scripts/CI.** It *replaces*
  the `reporter` array from `playwright.config.ts` instead of adding to it,
  which silently kills the json/junit writers `test:triage` depends on. Let
  the config's reporters run and use `npx playwright test --project=X`
  without a `--reporter` flag.
- Exit code is non-zero on any failed test — safe to gate a pipeline on.
- `npm run test:ci` sets `SKIP_WEB_SERVER=1`; pair it with whatever process
  manager the agent uses to start `server` and `client` first.
- Prefer the `registeredUser` / `authenticatedPage` fixtures over driving the
  signup form when a test only needs *a* logged-in account — they hit the API
  directly and are much faster/more reliable for unattended runs.
- Known product quirk worth knowing about before writing new tests: `POST
  /api/quotes` never attaches the submitting quote to a user account (no auth
  middleware on that route), so `/api/quotes/mine` will always come back
  empty regardless of who submitted a quote.

## Test-maintenance agents (in progress)

The goal is agents that keep this suite in sync with app changes without
silently masking real regressions. Plan:

1. **Detection (done)** — run the suite, then `npm run test:triage` parses
   `test-results/results.json` and buckets every failure into a category:
   - `selector-not-found` — a `data-testid` a test depends on disappeared or
     never resolved (covers both `toBeVisible()`-style assertions *and* raw
     `.click()`/`.fill()` timeouts against a missing locator, which is the
     most common real-world shape). **Only** this category is ever
     considered auto-fixable.
   - `assertion-mismatch`, `timeout-navigation`, `infra`, `unknown` — always
     routed to a human; these can just as easily mean a real regression as
     an intentional change, and guessing wrong is expensive.
   - Writes `test-results/triage.json` (structured) and exits `0` (green),
     `2` (failures, but all auto-fixable), or `1` (at least one needs a
     human) — an orchestrator can branch on the exit code without parsing
     JSON if that's all it needs.
2. **Fix agent (not built yet)** — for `selector-not-found` findings only,
   spawn a scoped agent with write access limited to `pages/`, `tests/`,
   `fixtures/` to patch the page object/test, re-run to confirm green, then
   open a PR for review. Never auto-merges.
3. **Trigger** — still deciding between GitHub Actions on PRs touching
   `client/src/**`/`server/routes/**`, and/or a nightly scheduled sweep.
