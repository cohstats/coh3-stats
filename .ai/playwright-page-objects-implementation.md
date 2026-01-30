# Playwright Page Object Pattern Implementation

## Summary

Implemented a comprehensive Page Object Model (POM) pattern for Playwright tests, starting with the homepage. This provides a maintainable, reusable, and scalable testing framework.

## What Was Created

### 1. Page Object Infrastructure

#### `e2e/page-objects/base-page.ts`
- Base class that all page objects extend
- Common functionality:
  - Navigation methods (`goto`, `waitForPageLoad`)
  - Common element getters (`header`, `footer`)
  - Assertion helpers (`checkPageLoaded`, `checkFooterPresent`)
  - Utility methods (`getByTestId`, `clickByTestId`, `screenshot`)

#### `e2e/page-objects/home-page.ts`
- HomePage specific implementation
- Organized selectors for all homepage sections:
  - News carousel
  - Info cards (DPS Calculator, Unit Browser)
  - Leaderboards section with faction tabs
  - Reddit panel
  - YouTube panel
  - Twitch panel
- Interaction methods:
  - `navigate()` - Navigate to homepage
  - `checkMainSectionsVisible()` - Verify main sections
  - `clickDPSCalculatorCard()` - Click DPS calculator
  - `clickUnitBrowserCard()` - Click unit browser
  - `switchLeaderboardTab()` - Switch faction tabs
  - `checkLeaderboardsTableHasData()` - Verify table data
  - And more...

#### `e2e/page-objects/index.ts`
- Central export file for all page objects
- Simplifies imports in test files

#### `e2e/page-objects/README.md`
- Comprehensive documentation
- Best practices guide
- Examples for creating new page objects
- Usage instructions

### 2. Test Files

#### `e2e/smoke/home-new.spec.ts` (New comprehensive tests)
- 25+ test cases covering:
  - Page loading and basic functionality
  - News section (carousel/fallback)
  - Info cards (DPS Calculator, Unit Browser)
  - Leaderboards (all 4 factions, tab switching, navigation)
  - Reddit panel
  - YouTube panel
  - Twitch panel (with lazy loading)
  - Responsive design (mobile, tablet, desktop)
  - Header and footer

#### `e2e/smoke/home.spec.ts` (Updated)
- Refactored to use page object pattern
- Simplified and more maintainable
- Removed direct DOM selectors

### 3. Component Updates (Added data-testid attributes)

Updated the following components with `data-testid` attributes for reliable testing:

1. **`screens/home/info-cards.tsx`**
   - `dps-calculator-card`
   - `unit-browser-card`

2. **`screens/home/news-section/news-section.tsx`**
   - `news-carousel`

3. **`screens/home/leaderboards-section/top-leaderboards-section.tsx`**
   - `leaderboards-section`

4. **`screens/home/reddit-panel/index.tsx`**
   - `reddit-panel`
   - `reddit-post-{index}` (for each post)

5. **`screens/home/youtube-panel/youtube-panel.tsx`**
   - `youtube-panel`
   - `youtube-video-{index}` (for each video)

6. **`screens/home/twitch-panel/index.tsx`**
   - `twitch-panel`

7. **`screens/home/twitch-panel/channel-list.tsx`**
   - `twitch-stream-{index}` (for each stream)

## Benefits

### 1. Maintainability
- UI changes only require updates in page objects, not in every test
- Centralized selectors make updates easier
- Clear separation between test logic and page structure

### 2. Reusability
- Page object methods can be reused across multiple tests
- Common functionality inherited from BasePage
- Reduces code duplication

### 3. Readability
- Tests read like user stories
- Clear, descriptive method names
- Easy to understand test intent

### 4. Scalability
- Easy to add new page objects following the same pattern
- Consistent structure across all tests
- Well-documented for team collaboration

## Test Coverage

The homepage tests now cover:

✅ Page loading and error handling
✅ News carousel with indicators
✅ Info cards (DPS Calculator, Unit Browser)
✅ Navigation from info cards
✅ Leaderboards section with 4 faction tabs
✅ Tab switching functionality
✅ Leaderboards table data validation
✅ Navigation to full leaderboards
✅ Reddit panel with posts
✅ YouTube panel with videos
✅ Twitch panel with streams (lazy loaded)
✅ Responsive design (mobile, tablet, desktop)
✅ Header and footer presence

## Running the Tests

```bash
# Run all tests
yarn playwright test

# Run only homepage tests
yarn playwright test e2e/smoke/home

# Run the new comprehensive tests
yarn playwright test e2e/smoke/home-new.spec.ts

# Run in UI mode for debugging
yarn playwright test --ui

# Run in headed mode to see browser
yarn playwright test --headed

# Run specific browser
yarn playwright test --project=chromium
```

## Next Steps

To extend this pattern to other pages:

1. Create a new page object file (e.g., `leaderboards-page.ts`)
2. Extend `BasePage`
3. Add `data-testid` attributes to components as needed
4. Define locators as getters
5. Create interaction methods
6. Export from `index.ts`
7. Write tests using the page object

Example pages to implement next:
- Leaderboards page
- Player profile page
- Stats page
- Search page
- News page
- DPS Calculator page
- Unit Browser page

## File Structure

```
e2e/
├── page-objects/
│   ├── base-page.ts           # Base class
│   ├── home-page.ts           # HomePage implementation
│   ├── index.ts               # Exports
│   └── README.md              # Documentation
├── smoke/
│   ├── home.spec.ts           # Updated tests
│   └── home-new.spec.ts       # Comprehensive tests
└── helpers/
    └── test-utils.ts          # Helper functions (still available)
```

## Best Practices Applied

1. ✅ Used `data-testid` for reliable selectors
2. ✅ Separated test logic from page structure
3. ✅ Created reusable methods
4. ✅ Used meaningful method names
5. ✅ Organized tests into logical groups
6. ✅ Added comprehensive documentation
7. ✅ Followed TypeScript best practices
8. ✅ Used arrow functions consistently
9. ✅ Added proper typing throughout

