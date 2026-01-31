# End-to-End Tests

This directory contains end-to-end (e2e) tests for the COH3 Stats application using Playwright.

## Setup

### Install Playwright

First, install Playwright and its dependencies:

```bash
yarn add -E -D @playwright/test@1.49.1
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
npx playwright test e2e/smoke/home.spec.ts
```

### Run tests for specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

```
e2e/
├── helpers/
│   └── test-utils.ts       # Common test utilities and helper functions
├── smoke/
│   ├── home.spec.ts        # Home page tests
│   ├── leaderboards.spec.ts # Leaderboards tests
│   ├── search.spec.ts      # Search page tests
│   ├── about.spec.ts       # About page tests
│   ├── news.spec.ts        # News page tests
│   ├── stats.spec.ts       # Stats pages tests
│   ├── explorer.spec.ts    # Explorer pages tests
│   ├── other-pages.spec.ts # Other static pages tests
│   └── dynamic-routes.spec.ts # Dynamic route tests
└── README.md               # This file
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

### Helper Functions

- `navigateAndWait(page, path)` - Navigate to a path and wait for page load
- `checkPageLoaded(page)` - Verify page loaded without errors
- `checkFooterPresent(page)` - Verify footer is present

## Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the project.

Key settings:

- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL` env var)
- **Test Directory**: `./e2e`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 retries on CI, 0 locally
- **Workers**: 1 worker on CI, parallel locally
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
npx playwright test --debug e2e/smoke/home.spec.ts
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
