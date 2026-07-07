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
│   └── reset-test-data.js
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
