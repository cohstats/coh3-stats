# End-to-End Tests

This directory contains end-to-end (e2e) tests for the COH3 Stats application using Playwright.

## Setup

### Install Playwright

First, install Playwright and its dependencies:

```bash
yarn add -E -D @playwright/test
```

Then install the Playwright browsers:

```bash
npx playwright install
```

Or install with dependencies (recommended for CI):

```bash
npx playwright install --with-deps
```

## Running Tests

### Run all tests

```bash
yarn test:e2e
```

### Run tests in UI mode (interactive)

```bash
yarn test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
yarn test:e2e:headed
```

### Run specific test file

```bash
npx playwright test e2e/regression/home-new.spec.ts
```

### Run tests for specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run the data mapping tests

```bash
yarn test:e2e:data
# On Windows
yarn test:e2e:data:windows
```

These are the tests in `e2e/data` - see [Data mapping tests](#data-mapping-tests) below.

## Test Structure

```
e2e/
├── data/
│   └── mp-maps.spec.ts          # Integration tests of the mp maps mapping (no browser, no app)
├── fixtures/
│   ├── test-data.ts             # Pinned real player / match / map / unit ids used by the specs
│   └── page-issues.ts           # console-error + failed-request collector fixture
├── helpers/
│   └── test-utils.ts            # Common test utilities and helper functions
├── page-objects/                # One page object per tested area (see page-objects/README.md)
├── regression/
│   ├── home-new.spec.ts         # Home page
│   ├── site-chrome.spec.ts      # Header / footer, nav menus, theme + language switcher, burger menu
│   ├── i18n.spec.ts             # Locale sweep, hreflang, language switcher round trip
│   ├── leaderboards.spec.ts     # 1v1 - 4v4 leaderboards
│   ├── team-leaderboards.spec.ts # Team leaderboards
│   ├── player-page.spec.ts      # Player profile - all tabs, deep links, error paths
│   ├── match-detail.spec.ts     # Match detail - rosters, charts, profileIDs, error paths
│   ├── search.spec.ts           # Search - player / unit / map results + header search
│   ├── stats-filters.spec.ts    # /stats/* - shared filter bar, url sync, charts
│   ├── live-games.spec.ts       # Live games - filters, table, chart, error states
│   ├── explorer-maps.spec.ts    # Map explorer - cards, table, detail, view switch
│   ├── explorer-tools.spec.ts   # Explorer index, challenges, weapons, unit browser, admin
│   ├── explorer-unit-view.spec.ts # Unit detail pages
│   ├── dps.spec.ts              # DPS benchmark tool + compare mode
│   ├── dynamic-routes.spec.ts   # Explorer faction / unit routes
│   ├── final-stand.spec.ts      # Final Stand DLC gating
│   ├── desktop-app.spec.ts      # Desktop app page
│   ├── about.spec.ts            # About / FAQ
│   ├── news.spec.ts             # News page
│   ├── other-pages.spec.ts      # /other/* + privacy policy
│   ├── error-paths.spec.ts      # Unknown routes, malformed params, upstream failures
│   ├── seo.spec.ts              # Title / description / canonical / OG sweep
│   ├── api-routes.spec.ts       # appUpdateRouteV2, getBattlegroupInfo, getLatestPatchMapStats
│   └── player-export-api.spec.ts # Player export API route
└── README.md                    # This file
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";
import { navigateAndWait, checkPageLoaded } from "../helpers/test-utils";

test.describe("Feature Name", () => {
  test("should do something", async ({ page }) => {
    await navigateAndWait(page, "/path");
    await checkPageLoaded(page);

    // Your test assertions
    await expect(page.locator("selector")).toBeVisible();
  });
});
```

## Data mapping tests

`e2e/data` contains integration tests of our data mapping functions (eg. `src/explorer/mp-maps.ts`).
They call the functions **directly in Node** - no browser, no running app and no API endpoint
involved. They live in the e2e suite because they download the real data packages from the coh3-data
CDN, which is too heavy for the Jest unit tests.

Things to know when adding tests there:

- Only the `data` Playwright project runs them (`testMatch: data/**/*.spec.ts`), the browser projects
  ignore that folder, so the downloads don't happen four times.
- The `data` project doesn't need the Next.js server. The `yarn test:e2e:data` script sets
  `PLAYWRIGHT_SKIP_WEBSERVER=1`, which turns off the `webServer` option of the config.
- Tests have a 180s timeout - the data packages are heavy.
- Use `test.skip(...)` when the tested data file isn't part of the data tag of a given patch yet,
  and remember to clear the mapping caches (eg. `clearMpMapsCache()`) in `beforeEach`.
- In CI they run in their own `data-mapping-tests` job, which doesn't build the app or install
  browsers.

### Helper Functions

- `navigateAndWait(page, path)` - Navigate to a path and wait for page load
- `checkPageLoaded(page)` - Verify page loaded without errors
- `checkFooterPresent(page)` - Verify footer is present

## Test data (`e2e/fixtures/test-data.ts`)

The player, match, map and unit pages render live data, so their tests need **real** ids. Never
invent one (`/players/1`, `/matches/1`) - a nonexistent id renders an error card, which makes the
test pass while telling you nothing.

Import the pinned entities instead:

```typescript
import { TEST_PLAYER, TEST_MATCH, TEST_MAP, TEST_UNIT, MISSING } from "../fixtures/test-data";
```

`MISSING` holds ids that are guaranteed _not_ to resolve - use them for the error-path tests.
`test-data.ts` documents how to refresh each entity if one ever disappears upstream.

Two things worth knowing about the pinned data:

- Matches are indexed per participating profile, so a match route needs the `?profileIDs=[...]`
  param that `getMatchDetailRoute` produces. Use the `matchRoute()` helper.
- The COH3 Stats API rejects very low match ids with a `400` (error card) and answers `404` for
  well-formed but unknown ones ("No match found"). Both states are covered separately.

## Page issues fixture (`e2e/fixtures/page-issues.ts`)

`checkPageLoaded()` only asserts that a header is visible - it passes on a page whose body failed
to hydrate. When a spec needs to prove a page rendered _cleanly_, use the `pageIssues` fixture:

```typescript
import { test, expect } from "../fixtures/page-issues";

test("renders cleanly", async ({ page, pageIssues }) => {
  await page.goto("/");
  expect(pageIssues.errors()).toEqual([]);
});
```

It records console errors, uncaught exceptions, failed requests and 5xx responses, filtering out
known third-party noise (analytics, embeds, Steam avatars).

## Live API vs mocking

Most of the site renders live data from the COH3 Stats API. The policy the suite follows:

- **Live calls** for the happy paths - they double as an "upstream is alive" check. Assert the
  structure (a table has rows, a chart has an `svg`), never a concrete number that changes hourly.
- **`page.route` interception** whenever a test needs a _specific_ state: an upstream 500, an empty
  result set, or a row with known values. Intercept with a **predicate**
  (`(url) => url.href.includes("...")`), not a glob - the glob form does not reliably match the
  query strings these endpoints use.
- Interception only works for requests the **browser** makes. The leaderboards, the player profile
  and the match detail fetch in `getServerSideProps`, so their failure paths have to be provoked
  with invalid input instead.
- When a live endpoint can legitimately have nothing to show (no live games right now, no stats for
  the current patch), `test.skip(true, "...")` inside the test with a reason - do not weaken the
  assertion for everyone else.

## Locales and `build:slim`

`next-i18next.config.js` ships **English only** when `FULL_BUILD=false`, which is what
`yarn build:slim` (used locally and by the CI e2e job) does. `next start` re-reads the config
without that env var, so the localized routes are usually still served - but `i18n.spec.ts` does not
assume it: every locale-specific test probes the route first and skips itself when the locale is not
part of the build.

## Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the project.

Key settings:

- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL` env var)
- **Test Directory**: `./e2e`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 2 workers on CI, parallel locally
- **Web Server**: Automatically starts `yarn start` before tests

## CI/CD Integration

Tests are automatically run in GitHub Actions on:

- Pull requests to master
- Pushes to master

See `.github/workflows/tests.yaml` for the CI configuration.

## Debugging

### View test report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Debug specific test

```bash
npx playwright test --debug e2e/regression/home-new.spec.ts
```

### View traces

Traces are automatically captured on first retry. View them with:

```bash
npx playwright show-trace trace.zip
```

## Best Practices

1. **Use data-testid sparingly** - Prefer semantic selectors (role, text, label)
2. **Wait for elements** - Use Playwright's auto-waiting features
3. **Keep tests independent** - Each test should be able to run in isolation
4. **Use descriptive test names** - Make it clear what the test is checking
5. **Group related tests** - Use `test.describe()` to organize tests
6. **Handle dynamic content** - Use appropriate timeouts for API-dependent content

## Troubleshooting

### Tests timing out

- Increase timeout in test: `test.setTimeout(60000)`
- Check if the dev server is running
- Verify network connectivity

### Flaky tests

- Add explicit waits for dynamic content
- Use `waitForLoadState('networkidle')`
- Check for race conditions

### Browser not installed

Run: `npx playwright install`
