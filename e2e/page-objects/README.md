# Page Object Model (POM)

This directory contains Page Object Model implementations for Playwright tests.

## What is Page Object Model?

Page Object Model is a design pattern that creates an object repository for web UI elements. The main advantages are:

1. **Maintainability**: Changes to UI only require updates in one place
2. **Reusability**: Page objects can be reused across multiple tests
3. **Readability**: Tests are more readable and easier to understand
4. **Separation of Concerns**: Test logic is separated from page structure

## Structure

```
e2e/page-objects/
├── base-page.ts       # Base class with common functionality
├── home-page.ts       # HomePage specific selectors and methods
├── index.ts           # Export all page objects
└── README.md          # This file
```

## Base Page

`BasePage` is the parent class that all page objects should extend. It provides:

- Common navigation methods (`goto`, `waitForPageLoad`)
- Common element getters (`header`, `footer`)
- Common assertions (`checkPageLoaded`, `checkFooterPresent`)
- Utility methods (`getByTestId`, `clickByTestId`, etc.)

## Creating a New Page Object

1. Create a new file in `e2e/page-objects/` (e.g., `leaderboards-page.ts`)
2. Extend the `BasePage` class
3. Define locators as getters
4. Define interaction methods
5. Export the class in `index.ts`

Example:

```typescript
import { Locator, expect } from "@playwright/test";
import { BasePage } from "./base-page";

export class LeaderboardsPage extends BasePage {
  // Locators
  get leaderboardTable(): Locator {
    return this.page.locator("table");
  }

  get searchInput(): Locator {
    return this.getByTestId("search-input");
  }

  // Methods
  async navigate(): Promise<void> {
    await this.goto("/leaderboards");
  }

  async searchPlayer(name: string): Promise<void> {
    await this.searchInput.fill(name);
    await this.searchInput.press("Enter");
  }

  async checkTableHasData(): Promise<void> {
    const rows = this.leaderboardTable.locator("tbody tr");
    await expect(rows.first()).toBeVisible();
  }
}
```

## Using Page Objects in Tests

```typescript
import { test, expect } from "@playwright/test";
import { HomePage } from "../page-objects/home-page";

test.describe("Home Page Tests", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate();
  });

  test("should display main sections", async () => {
    await homePage.checkMainSectionsVisible();
  });

  test("should navigate to DPS calculator", async () => {
    await homePage.clickDPSCalculatorCard();
    // Add assertions
  });
});
```

## Best Practices

1. **Use data-testid attributes**: Add `data-testid` to components for reliable selectors
2. **Keep selectors in page objects**: Never use selectors directly in tests
3. **Use meaningful method names**: Methods should describe what they do, not how
4. **Return page objects for chaining**: Methods can return `this` or other page objects
5. **Keep tests simple**: Tests should read like user stories
6. **Use getters for locators**: Define locators as getters, not properties
7. **Add JSDoc comments**: Document complex methods and their parameters

## Adding data-testid to Components

When creating new page objects, you may need to add `data-testid` attributes to components:

```tsx
// In your React component
<div data-testid="my-component">
  <button data-testid="submit-button">Submit</button>
</div>
```

Then in your page object:

```typescript
get myComponent(): Locator {
  return this.getByTestId("my-component");
}

get submitButton(): Locator {
  return this.getByTestId("submit-button");
}
```

## Running Tests

```bash
# Run all tests
yarn playwright test

# Run specific test file
yarn playwright test e2e/smoke/home.spec.ts

# Run in UI mode
yarn playwright test --ui

# Run in headed mode
yarn playwright test --headed

# Run specific browser
yarn playwright test --project=chromium
```

## Debugging

```bash
# Debug mode
yarn playwright test --debug

# Show report
yarn playwright show-report
```
