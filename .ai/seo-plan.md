# COH3 Stats - Comprehensive SEO Overhaul Plan

## Executive Summary

This document outlines a comprehensive SEO overhaul for the COH3 Stats application using the next-seo package. The plan standardizes SEO metadata across all pages, implements proper localization for SEO content, and ensures consistent branding while maintaining "coh3stats" as the non-translatable site identifier.

## Current State Analysis

### Existing SEO Implementation

**✅ Currently Implemented:**

- Basic Head components with titles and descriptions on key pages
- Custom head-utils.tsx with keyword generation and alternate language links
- Some localized SEO content in translation files (home.json, search.json, news.json, etc.)
- Open Graph images on some pages
- Robots.txt with proper crawling restrictions
- Sitemap generation

**❌ Issues Identified:**

1. **Inconsistent Implementation**: Mix of hardcoded and localized SEO content
2. **Missing next-seo Usage**: Currently using basic Next.js Head components
3. **Incomplete Coverage**: Many pages lack proper SEO metadata
4. **Inconsistent Branding**: Some pages use "COH3 Stats", others use "coh3stats"
5. **Limited Open Graph/Twitter Cards**: Basic implementation without comprehensive social media optimization
6. **No Structured Data**: Missing JSON-LD for enhanced search results

### Pages with Current SEO Implementation

**✅ Pages with SEO:**

- Home page (`/`) - Localized via home.json
- Search page (`/search`) - Localized via search.json
- Desktop App (`/desktop-app`) - Localized via desktopapp.json
- News page (`/news`) - Localized via news.json
- Explorer pages (`/explorer/*`) - Partial localization
- Player pages (`/players/*`) - Dynamic SEO with player data
- About page (`/about`) - Hardcoded SEO
- Open Data page (`/other/open-data`) - Hardcoded SEO
- Live Games (`/live-games`) - Localized via live-games.json
- Challenges (`/explorer/challenges`) - Hardcoded SEO

**❌ Pages Missing SEO:**

- Leaderboards (`/leaderboards`) - No Head component found
- Team Leaderboards (`/leaderboards-teams`) - No Head component found
- Match Details (`/matches/[matchId]`) - Basic hardcoded SEO
- Stats pages (`/stats/*`) - Likely missing comprehensive SEO
- Unit/Weapon explorer pages - Partial implementation
- 404 page - No custom SEO

## SEO Standardization Requirements

### Branding Guidelines

- **Site Name**: Always use "COH3 Stats" (lowercase, no spaces) - NOT translatable
- **Page Titles**: Format as "Page Title | COH3 Stat"
- **Descriptions**: Translatable, gaming/statistics focused
- **Keywords**: Consistent core keywords + page-specific terms

### Core Keywords Strategy

**Primary Keywords (Always Include):**

- coh3
- coh3stats
- company of heroes 3
- coh3 statistics
- coh3 data

**Secondary Keywords (Page-Specific):**

- Leaderboards: rankings, ladder, competitive
- Players: player stats, profiles, matches
- Explorer: units, factions, weapons, buildings
- Live Games: real-time, current matches
- News: updates, patches, announcements

## Proposed SEO Structure

### 1. Default SEO Configuration (next-seo.config.js)

```javascript
export default {
  titleTemplate: "%s | COH3 Stats",
  defaultTitle: "COH3 Stats - Company of Heroes 3 Statistics",
  description: "Company of Heroes 3 statistics, leaderboards, player profiles, and game data.",
  canonical: "https://coh3stats.com",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://coh3stats.com",
    siteName: "COH3 Stats",
    images: [
      {
        url: "https://coh3stats.com/logo/android-icon-192x192.png",
        width: 192,
        height: 192,
        alt: "coh3stats logo",
      },
    ],
  },
  additionalMetaTags: [
    {
      name: "viewport",
      content: "minimum-scale=1, initial-scale=1, width=device-width",
    },
  ],
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/logo/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      sizes: "57x57",
      href: "/logo/apple-icon-57x57.png",
    },
  ],
};
```

### 2. Localization Key Structure

**New SEO section in each locale file:**

```json
{
  "seo": {
    "siteName": "COH3 Stats",
    "defaultTitle": "COH3 Stats - Company of Heroes 3 Statistics",
    "defaultDescription": "Company of Heroes 3 statistics, leaderboards, player profiles, and game data.",
    "keywords": {
      "core": ["coh3", "coh3stats", "company of heroes 3", "coh3 statistics"],
      "leaderboards": ["rankings", "ladder", "competitive"],
      "players": ["player stats", "profiles", "matches"],
      "explorer": ["units", "factions", "weapons", "buildings"],
      "liveGames": ["real-time", "current matches"],
      "news": ["updates", "patches", "announcements"]
    }
  }
}
```

### 3. Page-Specific SEO Implementation

**Home Page:**

```json
{
  "meta": {
    "title": "Company of Heroes 3 Statistics & Leaderboards",
    "description": "Complete Company of Heroes 3 statistics including leaderboards, player profiles, unit data, live games, and match history.",
    "keywords": ["leaderboards", "player cards", "unit stats", "live games"]
  }
}
```

**Leaderboards:**

```json
{
  "meta": {
    "title": "COH3 Leaderboards - {{faction}} {{mode}}",
    "description": "Company of Heroes 3 {{faction}} {{mode}} leaderboards with player rankings, ELO ratings, and competitive statistics.",
    "keywords": ["{{faction}} leaderboards", "{{mode}} rankings", "competitive ladder"]
  }
}
```

**Player Profiles:**

```json
{
  "meta": {
    "title": "{{playerName}} - COH3 Player Profile",
    "description": "{{playerName}}'s Company of Heroes 3 statistics, match history, faction performance, and competitive rankings.",
    "keywords": ["{{playerName}} stats", "player profile", "match history"]
  }
}
```

## Implementation Plan

### Phase 1: Foundation Setup (Priority: High)

1. ✅ Install next-seo package (COMPLETED)
2. Create next-seo.config.js with default configuration
3. Update \_app.tsx to use DefaultSeo component
4. Create SEO utility functions for dynamic content

### Phase 2: Core Pages (Priority: High)

1. Update home page to use NextSeo
2. Implement leaderboards SEO with dynamic faction/mode
3. Add comprehensive SEO to player profile pages
4. Update search page SEO implementation

### Phase 3: Secondary Pages (Priority: Medium)

1. Team leaderboards SEO implementation
2. Explorer pages (units, weapons, factions)
3. Live games page optimization
4. Match detail pages with dynamic data

### Phase 4: Advanced Features (Priority: Low)

1. JSON-LD structured data for key pages
2. Enhanced Open Graph for social sharing
3. Twitter Card optimization
4. Breadcrumb structured data

### Phase 5: Localization & Testing (Priority: High)

1. Add SEO keys to all locale files
2. Test SEO across all supported languages
3. Validate Open Graph and Twitter Cards
4. SEO audit and performance testing

## Technical Implementation Details

### 1. SEO Utility Functions

Create `src/seo-utils.tsx`:

```typescript
import { NextSeoProps } from "next-seo";
import { TFunction } from "next-i18next";

export const createPageSEO = (
  t: TFunction,
  pageKey: string,
  dynamicData?: Record<string, string>,
): NextSeoProps => {
  // Implementation details
};

export const createPlayerSEO = (t: TFunction, playerData: PlayerData): NextSeoProps => {
  // Implementation details
};
```

### 2. Component Integration Pattern

```typescript
import { NextSeo } from 'next-seo';
import { createPageSEO } from '../src/seo-utils';

const PageComponent = () => {
  const { t } = useTranslation(['common', 'pageNamespace']);
  const seoProps = createPageSEO(t, 'pageName');

  return (
    <>
      <NextSeo {...seoProps} />
      {/* Page content */}
    </>
  );
};
```

## Expected Outcomes

### SEO Improvements

- **Consistency**: Unified SEO implementation across all pages
- **Localization**: Proper multi-language SEO support
- **Social Media**: Enhanced Open Graph and Twitter Card support
- **Search Visibility**: Better search engine optimization
- **User Experience**: Improved social sharing and search result appearance

### Technical Benefits

- **Maintainability**: Centralized SEO configuration
- **Scalability**: Easy to add new pages with proper SEO
- **Performance**: Optimized meta tag generation
- **Standards Compliance**: Following SEO best practices

## Detailed Page Analysis

### Current Localization Files with SEO Content

**✅ Files with existing meta sections:**

- `public/locales/en/home.json` - Complete meta section
- `public/locales/en/search.json` - Complete meta section
- `public/locales/en/news.json` - Complete meta section with keywords array
- `public/locales/en/desktopapp.json` - Complete meta section
- `public/locales/en/live-games.json` - Complete meta section with keywords array
- `public/locales/en/stats.json` - Has players.meta section

**❌ Files missing meta sections:**

- `public/locales/en/common.json` - No meta section
- `public/locales/en/leaderboards.json` - No meta section
- `public/locales/en/explorer.json` - No meta section
- `public/locales/en/players.json` - No meta section
- `public/locales/en/ranking-tiers.json` - No meta section

### Dynamic Pages Requiring Special SEO Handling

**Player Pages (`/players/[...playerID]`):**

- Current: Dynamic SEO with player name and stats
- Needs: Enhanced Open Graph with player avatars
- Template: "{{playerName}} - COH3 Player Profile | coh3stats"

**Match Pages (`/matches/[matchId]`):**

- Current: Basic hardcoded SEO
- Needs: Dynamic match data in meta description
- Template: "COH3 Match {{matchId}} - {{map}} {{mode}} | coh3stats"

**Explorer Unit Pages (`/explorer/races/[raceId]/units/[unitId]`):**

- Current: Dynamic SEO implementation exists
- Needs: Standardization with next-seo
- Template: "{{unitName}} - {{faction}} Unit Stats | coh3stats"

**Leaderboard Pages (`/leaderboards`):**

- Current: No SEO implementation found
- Needs: Dynamic faction/mode in SEO
- Template: "{{faction}} {{mode}} Leaderboards | coh3stats"

## Before/After Examples

### Home Page - Before

```typescript
// Current implementation in screens/home/index.tsx
<Head>
  <title>{t("meta.title")}</title>
  <meta name="description" content={t("meta.description")} />
  <meta property="og:image" content={`/logo/android-icon-192x192.png`} />
  {generateAlternateLanguageLinks("")}
</Head>
```

### Home Page - After

```typescript
// New implementation with next-seo
import { NextSeo } from 'next-seo';
import { createHomeSEO } from '../src/seo-utils';

const Home = () => {
  const { t } = useTranslation(['common', 'home']);
  const seoProps = createHomeSEO(t);

  return (
    <>
      <NextSeo
        title={t('home:meta.title')}
        description={t('home:meta.description')}
        canonical="https://coh3stats.com"
        openGraph={{
          title: t('home:meta.title'),
          description: t('home:meta.description'),
          url: 'https://coh3stats.com',
          images: [
            {
              url: 'https://coh3stats.com/logo/android-icon-192x192.png',
              width: 192,
              height: 192,
              alt: 'coh3stats logo',
            },
          ],
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: generateKeywordsString(t('home:meta.keywords', { returnObjects: true })),
          },
        ]}
        languageAlternates={generateLanguageAlternates('')}
      />
      {/* Page content */}
    </>
  );
};
```

### Player Page - Before

```typescript
// Current implementation in screens/players/index.tsx
<Head>
  <title>{pageTitle}</title>
  <meta name="description" content={description} />
  <meta name="keywords" content={metaKeywords} />
  {platform === "steam" && (
    <meta property="og:image" content={playerData.steamData?.avatarmedium} />
  )}
</Head>
```

### Player Page - After

```typescript
// New implementation with next-seo
<NextSeo
  title={t('players:meta.title', { name: playerData.info.name })}
  description={createPlayerDescription(playerData, playerSummary, t)}
  canonical={`https://coh3stats.com/players/${playerData.info.profile_id}`}
  openGraph={{
    title: t('players:meta.title', { name: playerData.info.name }),
    description: createPlayerDescription(playerData, playerSummary, t),
    url: `https://coh3stats.com/players/${playerData.info.profile_id}`,
    type: 'profile',
    images: platform === 'steam' && playerData.steamData?.avatarmedium ? [
      {
        url: playerData.steamData.avatarmedium,
        width: 184,
        height: 184,
        alt: `${playerData.info.name} Steam avatar`,
      },
    ] : undefined,
  }}
  additionalMetaTags={[
    {
      name: 'keywords',
      content: generateKeywordsString([
        t('players:meta.keywords.stats', { name: playerData.info.name }),
        t('players:meta.keywords.matches', { name: playerData.info.name }),
      ]),
    },
  ]}
/>
```

## Implementation Checklist

### Phase 1: Foundation ✅

- [x] Install next-seo package
- [ ] Create next-seo.config.js
- [ ] Update \_app.tsx with DefaultSeo
- [ ] Create seo-utils.tsx helper functions
- [ ] Update head-utils.tsx for next-seo compatibility

### Phase 2: Core Pages

- [ ] Home page (`/`)
- [ ] Search page (`/search`)
- [ ] Player pages (`/players/*`)
- [ ] Leaderboards (`/leaderboards`)
- [ ] About page (`/about`)

### Phase 3: Secondary Pages

- [ ] Team leaderboards (`/leaderboards-teams`)
- [ ] Explorer pages (`/explorer/*`)
- [ ] Live games (`/live-games`)
- [ ] News page (`/news`)
- [ ] Desktop app (`/desktop-app`)

### Phase 4: Dynamic Pages

- [ ] Match details (`/matches/[matchId]`)
- [ ] Unit pages (`/explorer/races/[raceId]/units/[unitId]`)
- [ ] Faction pages (`/explorer/races/[raceId]`)
- [ ] Stats pages (`/stats/*`)

### Phase 5: Localization

- [ ] Add seo sections to all locale files
- [ ] Test all supported languages (16 locales)
- [ ] Validate translations for SEO content
- [ ] Update translation workflow documentation

## Next Steps

1. **Review and Approve Plan**: Stakeholder review of this comprehensive plan
2. **Begin Implementation**: Start with Phase 1 foundation setup
3. **Iterative Development**: Implement phases in priority order
4. **Testing and Validation**: Comprehensive SEO testing across all pages
5. **Monitoring**: Set up SEO monitoring and analytics

---

_This plan provides a roadmap for implementing comprehensive SEO across the COH3 Stats application while maintaining consistency, localization support, and technical best practices._
