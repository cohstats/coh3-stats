# Player Export API E2E Tests

## Overview

Created comprehensive Playwright e2e tests for the `/api/playerExport` endpoint.

## Test File Location

`e2e/regression/player-export-api.spec.ts`

## Test Coverage

### Error Handling Tests (6 tests)

1. **Missing profileIDs parameter** - Validates 400 error when profileIDs is not provided
2. **Invalid JSON in profileIDs** - Validates 500 error when profileIDs contains malformed JSON
3. **Invalid types parameter** - Validates 400 error when types contains invalid game types (e.g., "5v5")
4. **Invalid JSON in types** - Validates 400 error when types contains malformed JSON
5. **Invalid game types** - Validates 400 error when types contains values other than "1v1", "2v2", "3v3", "4v4"
6. **Too many records** - Validates 400 error when requesting more than 50 profile IDs

### Successful Request Tests (5 tests)

Uses real player IDs: `[3705, 871, 6219, 108833, 61495, 1287]`

1. **Valid profileIDs** - Tests successful CSV export with 6 real player IDs
   - Validates CSV structure with headers
   - Checks for "alias" and "relic_id" columns
2. **Valid profileIDs with types filter** - Tests CSV export with specific game types (1v1, 2v2)
   - Validates that only requested types appear in headers
   - Confirms 3v3 and 4v4 are excluded when filtered
3. **Single profileID** - Tests handling of a single profile ID
   - Validates CSV has exactly 2 lines (header + 1 data row)
4. **Maximum allowed profileIDs** - Tests handling of exactly 50 profile IDs (boundary test)
   - Uses real IDs padded with additional IDs to reach 50
5. **All valid game types** - Tests with all four game types specified
   - Validates all game types (1v1, 2v2, 3v3, 4v4) appear in headers

## Key Features

### Resilient Testing

The successful request tests handle both scenarios:

- **200 Success**: When the Relic API is available and returns data
  - Validates CSV content-type header
  - Validates cache-control header
  - Validates CSV data is returned
- **500 Error**: When the external Relic API is unavailable
  - Validates appropriate error message

### Test Approach

- Uses Playwright's `request` fixture for API testing
- Tests all validation paths in the API handler
- Covers boundary conditions (0, 1, 50, 51 profile IDs)
- Validates response headers and content types
- Tests both with and without optional `types` parameter

## Running the Tests

```bash
# Run all e2e tests
yarn playwright test

# Run only player export API tests
yarn playwright test e2e/regression/player-export-api.spec.ts

# Run in UI mode
yarn playwright test e2e/regression/player-export-api.spec.ts --ui

# Run in headed mode
yarn playwright test e2e/regression/player-export-api.spec.ts --headed

# Run specific browser
yarn playwright test e2e/regression/player-export-api.spec.ts --project=chromium
```

## API Endpoint Details

### Endpoint

`GET /api/playerExport`

### Query Parameters

- `profileIDs` (required): JSON stringified array of player profile IDs (max 50)
- `types` (optional): JSON stringified array of game types ["1v1", "2v2", "3v3", "4v4"]

### Response

- **Success (200)**: CSV file with player statistics
- **Error (400)**: JSON with error message for validation failures
- **Error (500)**: JSON with error message for server/external API errors

### Example Usage

```
GET /api/playerExport?profileIDs=[1,2,3]
GET /api/playerExport?profileIDs=[1,2,3]&types=["1v1","2v2"]
```

## Test Results

All 11 tests passed successfully in Chromium:

- ✅ 6 error handling tests
- ✅ 5 successful request tests

The tests successfully validated:

- CSV content-type headers
- Cache-control headers (public, max-age=60)
- CSV structure with proper headers (alias, relic_id, steam_id, faction stats, etc.)
- Filtering by game types (1v1, 2v2, 3v3, 4v4)
- Proper error messages for all validation failures

## Test Maintenance Notes

- Tests are designed to be resilient to external API availability
- Uses real player IDs: `[3705, 871, 6219, 108833, 61495, 1287]`
- If Relic API changes, update the expected CSV structure validation
- Monitor test flakiness due to external API dependencies
- All tests passed in ~7.7 seconds on Chromium
