# React 19 Migration Implementation Plan

## Executive Summary

This document outlines the complete migration strategy for upgrading **coh3-stats** from React 18.3.1 to React 19, while maintaining Next.js 15.5.19. The migration will be performed in a dedicated feature branch with comprehensive testing before merging to main.

## Project Context

- **Current Stack:**
  - React: 18.3.1
  - React DOM: 18.3.1
  - Next.js: 15.5.19
  - Mantine UI: 8.3.18
  - Node.js: 20+
- **Target Stack:**
  - React: 19.x (latest stable)
  - React DOM: 19.x (latest stable)
  - Next.js: 15.5.19 (no change)
  - Mantine UI: 8.x (update to latest 8.x with React 19 support)

## Migration Strategy

### Phase 1: Preparation & Research (Day 1)

#### 1.1 Dependency Compatibility Research

Research and verify React 19 compatibility for all critical dependencies:

**Critical Dependencies to Verify:**

- ✅ `@mantine/*` packages (v8.3.10+ supports React 19)
- ✅ `@sentry/nextjs` (v10.59.0+ supports React 19)
- ⚠️ `@nivo/*` packages (needs verification - client-side only)
- ⚠️ `firebase` (v11.10.0 - needs verification)
- ⚠️ `next-i18next` (v16.0.7 - needs verification)
- ⚠️ `next-seo` (v6.8.0 - needs verification)
- ⚠️ `@scalar/api-reference-react` (v0.8.57 - needs verification)
- ⚠️ `react-chartjs-2` / `chart.js` (needs verification)
- ⚠️ `@bbob/react` (needs verification)
- ⚠️ `embla-carousel-react` (needs verification)
- ⚠️ `@testing-library/react` (v16.3.2 should support React 19)

**Action Items:**

1. Check npm/GitHub for React 19 compatibility statements
2. Review release notes and changelogs
3. Check for known issues in GitHub Issues
4. Document any required package updates
5. Identify packages that may need workarounds

#### 1.2 Code Audit for Breaking Changes

Scan codebase for React 19 breaking changes:

**Known Breaking Changes to Check:**

- ❌ No `defaultProps` in function components (use default parameters instead)
- ❌ No string refs (must use `useRef` or callback refs)
- ❌ No legacy context API
- ❌ No `findDOMNode` usage
- ✅ `forwardRef` usage (found in `LinkWithOutPrefetch.tsx` - should work)
- ⚠️ Ref callback timing changes
- ⚠️ Changes to hydration error handling

**Codebase Scan Results:**

- Found: `React.forwardRef` in `components/LinkWithOutPrefetch.tsx` (should be compatible)
- No class components detected (good - using hooks everywhere)
- No obvious `defaultProps` usage in function components
- Using modern patterns (hooks, functional components)

#### 1.3 Create Migration Branch

```bash
git checkout -b feat/react-19-migration
```

### Phase 2: Core React Upgrade (Day 1-2)

#### 2.1 Update React Core Packages

Update React and React DOM to version 19:

```bash
# Remove old versions
yarn remove react react-dom @types/react @types/react-dom

# Install React 19 with exact versions
yarn add -E react@19.0.0 react-dom@19.0.0

# Install React 19 TypeScript types
yarn add -E -D @types/react@19.0.0 @types/react-dom@19.0.0
```

**Note:** Adjust version numbers to latest stable React 19 release at time of migration.

#### 2.2 Update Mantine Packages

Mantine 8.3.10+ officially supports React 19. Update all Mantine packages:

```bash
# Update Mantine to latest 8.x version with React 19 support
yarn add -E @mantine/core@8.3.18 @mantine/hooks@8.3.18 @mantine/dates@8.3.18 \
  @mantine/notifications@8.3.18 @mantine/spotlight@8.3.18 @mantine/carousel@8.3.18
yarn add -E mantine-datatable@8.3.13
```

**Check for newer 8.x versions** at migration time and use those instead.

#### 2.3 Update Testing Library

Update React Testing Library to ensure React 19 compatibility:

```bash
yarn add -E -D @testing-library/react@16.3.2
```

(Version 16.3.2 already installed - verify it works with React 19)

### Phase 3: Third-Party Dependencies Update (Day 2)

#### 3.1 Research & Update Each Critical Dependency

**Priority 1 - Must Update:**

1. **@sentry/nextjs**: Update to latest v10.x

   ```bash
   yarn add -E @sentry/nextjs@latest
   ```

2. **firebase**: Verify React 19 compatibility, update if needed
   ```bash
   # Check compatibility first, then update
   yarn add -E firebase@latest
   ```

**Priority 2 - Verify Compatibility:**

1. **@nivo/\*** packages: Test with React 19 (client-side rendering only)
   - These are dynamically imported, should work fine
   - No update needed unless issues arise

2. **next-i18next**: Verify React 19 compatibility
   - Check for updates if issues occur
   - May need to wait for official support

3. **next-seo**: Verify React 19 compatibility
   - Consider migrating to Next.js 15 built-in metadata API (future task)

4. **react-chartjs-2 & chart.js**: Verify compatibility
   - Update if needed

5. **embla-carousel-react**: Update to latest

   ```bash
   yarn add -E embla-carousel-react@8.6.0 embla-carousel@8.6.0 embla-carousel-autoplay@8.6.0
   ```

6. **@bbob/react**: Verify compatibility

7. **@scalar/api-reference-react**: Verify compatibility

#### 3.2 Create Dependency Compatibility Report

Document findings in a markdown file:

- `.ai/react-19-dependency-report.md`
- List each dependency with version, React 19 status, and notes
- Include any workarounds or known issues

### Phase 4: Code Changes (Day 2-3)

#### 4.1 Fix Breaking Changes (if any found)

**Default Props Migration** (if found):

```typescript
// ❌ Old Pattern (if found)
MyComponent.defaultProps = {
  value: "default",
};

// ✅ New Pattern
const MyComponent = ({ value = "default" }) => {
  // component code
};
```

**Ref Handling** (verify existing code):

- Check `LinkWithOutPrefetch.tsx` - should work as-is
- Verify no ref-related console warnings

**TypeScript Type Updates**:

- Update React type imports if needed
- Fix any new TypeScript errors from React 19 types

#### 4.2 Code Audit Checklist

- [ ] No console warnings about deprecated React features
- [ ] All TypeScript errors resolved
- [ ] ESLint passes without new warnings
- [ ] Prettier formatting maintained

### Phase 5: Build & Development Testing (Day 3-4)

#### 5.1 Development Build

Test the app in development mode:

```bash
# Clean build
yarn clean
yarn install

# Start dev server
yarn dev
```

**Test Checklist:**

- [ ] Dev server starts without errors
- [ ] No React warnings in console
- [ ] Hot reload works correctly
- [ ] Pages load without errors
- [ ] No hydration mismatches

#### 5.2 Production Build

Test production build:

```bash
# Slim build (faster)
yarn build:slim:windows

# Full build
yarn build
```

**Test Checklist:**

- [ ] Build completes successfully
- [ ] No build warnings or errors
- [ ] Bundle size hasn't increased significantly
- [ ] All pages build correctly

#### 5.3 Manual Testing

Test critical user flows:

**Pages to Test:**

- [ ] Home page (`/`)
- [ ] Player search (`/search`)
- [ ] Player profiles (`/players/*`)
- [ ] Leaderboards (`/leaderboards`)
- [ ] Live games (`/live-games`)
- [ ] Unit explorer (`/explorer/*`)
- [ ] DPS calculator (`/stats/dps-calculator`)
- [ ] Desktop app page (`/desktop-app`)

**Features to Test:**

- [ ] Search functionality
- [ ] Data tables (Mantine DataTable)
- [ ] Charts (Nivo, Chart.js)
- [ ] Modals and drawers
- [ ] Forms and inputs
- [ ] i18n language switching
- [ ] Dark/light theme toggle
- [ ] Responsive design (mobile/desktop)
- [ ] Image loading and fallbacks
- [ ] Firebase analytics events

### Phase 6: Automated Testing (Day 4-5)

#### 6.1 Unit Tests (Jest)

Run all unit tests:

```bash
yarn test
```

**Expected Issues:**

- React Testing Library may need updates
- Snapshot tests may need regeneration
- Mock adjustments for React 19 behavior changes

**Action Items:**

- [ ] Fix failing unit tests
- [ ] Update snapshots if needed
- [ ] Ensure coverage stays the same or improves
- [ ] No new warnings in test output

#### 6.2 E2E Tests (Playwright)

Run Playwright end-to-end tests:

```bash
# Run all e2e tests
yarn test:e2e

# Run in UI mode for debugging
yarn test:e2e:ui

# Run specific browsers
yarn test:e2e:chromium
yarn test:e2e:firefox
yarn test:e2e:webkit
```

**Test Strategy:**

- [ ] Run full test suite (desktop + mobile)
- [ ] Fix any failing tests
- [ ] Check for new console errors/warnings in browser
- [ ] Verify no visual regressions

#### 6.3 Test Coverage Report

```bash
yarn test
# Check coverage report in coverage/lcov-report/index.html
```

Ensure test coverage remains above thresholds:

- Project: target auto, threshold 10%
- Patch: target auto, threshold 25%

### Phase 7: Performance & Quality Checks (Day 5)

#### 7.1 Bundle Analysis

```bash
yarn build:analyze
```

**Check:**

- [ ] Bundle sizes haven't increased significantly
- [ ] No unexpected dependencies in bundle
- [ ] Code splitting still works correctly

#### 7.2 Lighthouse Scores

Test performance metrics:

- [ ] Run Lighthouse on key pages
- [ ] Compare scores with pre-migration baseline
- [ ] Ensure no significant regression

#### 7.3 Sentry Error Monitoring

- [ ] Verify Sentry integration still works
- [ ] Test error reporting in dev
- [ ] Check source maps are uploaded correctly

### Phase 8: Documentation & CI/CD (Day 6)

#### 8.1 Update Documentation

Update relevant documentation:

**Files to Update:**

- [ ] `README.md` - Update React version in tech stack
- [ ] `package.json` - Verify all version constraints
- [ ] `.ai/react-19-dependency-report.md` - Document findings
- [ ] Add migration notes to this file

#### 8.2 GitHub Actions / CI Pipeline

Verify CI passes:

**Workflows to Monitor:**

- [ ] `.github/workflows/tests.yaml` - Unit + E2E tests
- [ ] `.github/workflows/deploy.yml` - Deployment
- [ ] `.github/workflows/preview.yml` - Preview deployments

**Expected Changes:**

- No changes needed to CI configuration
- All tests should pass
- Deployments should work as before

#### 8.3 Renovate Configuration

Update `.github/renovate.json` if needed:

- Ensure React 19 is allowed
- Update any version constraints

### Phase 9: Pre-Merge Checklist (Day 6)

#### 9.1 Final Verification

- [ ] All unit tests passing
- [ ] All e2e tests passing
- [ ] All manual testing completed
- [ ] No console warnings or errors
- [ ] Build succeeds (both slim and full)
- [ ] CI/CD pipeline green
- [ ] Code reviewed by team
- [ ] Documentation updated
- [ ] Migration notes documented

#### 9.2 Deployment Strategy

1. **Merge to main branch**
2. **Deploy to preview/dev environment first**
3. **Monitor for 24-48 hours**
4. **Deploy to production**

#### 9.3 Rollback Plan

If critical issues arise:

1. Revert the merge commit
2. Redeploy previous version
3. Document issues in GitHub issue
4. Create fix plan

### Phase 10: Post-Migration Monitoring (Week 1-2)

#### 10.1 Monitoring Checklist

- [ ] Monitor Sentry for new errors
- [ ] Check analytics for user behavior changes
- [ ] Monitor performance metrics
- [ ] Check server logs for issues
- [ ] Gather user feedback

#### 10.2 Known Limitations & Future Work

- **Not Using React 19 New Features**: This migration maintains compatibility without adopting new React 19 features (Actions, `use()` hook, etc.)
- **Future Optimization Opportunities**:
  - Consider React Compiler for automatic memoization
  - Migrate from `next-seo` to Next.js 15 metadata API
  - Explore Server Actions for form handling
  - Evaluate new concurrent features

## Appendix A: Package Versions

### Before Migration

```json
{
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "@types/react": "18.3.31",
  "@types/react-dom": "18.3.7"
}
```

### After Migration (Target)

```json
{
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "@types/react": "19.0.0",
  "@types/react-dom": "19.0.0"
}
```

## Appendix B: Useful Resources

- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React 19 Changelog](https://github.com/facebook/react/blob/main/CHANGELOG.md)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Mantine React 19 Support](https://github.com/mantinedev/mantine/issues/8461)

## Appendix C: Team Contacts & Review

**Migration Owner**: [TBD]
**Code Reviewers**: [TBD]
**QA Testing**: [TBD]
**Deployment Approver**: [TBD]

---

**Document Version**: 1.0
**Last Updated**: 2026-06-26
**Status**: Ready for Implementation
