# COH3 Stats

![GitHub release (latest by date)](https://img.shields.io/github/v/release/cohstats/coh3-stats)
[![DeepScan grade](https://deepscan.io/api/teams/15780/projects/22550/branches/667770/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=15780&pid=22550&bid=667770)
![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m795263234-6c03132c5b21b08d1534fe1d?label=uptime%2030%20days)
[![Discord](https://img.shields.io/discord/959118129240350740?style=flat&label=Chat%20on%20Discord)](https://discord.gg/jRrnwqMfkr)

Website https://coh3stats.com/

We are looking not only for developers but anyone who would like to contribute
in building the best site with most info for Company of Heroes 3. All the data will
be open source for anyone to use! We need people to get the data from the game
/ organize the data. Come up with layouts and much more.

Anyone can put a hand in building this site. Please consider joining our [Discord](https://discord.gg/jRrnwqMfkr).

We have open sourced our underlying data https://coh3stats.com/other/open-data

- Leaderboards, Matches << which we scrape and get from Relic API
- Data (definitions / images ) which << which we get from the game files

## Localization

The website supports multiple languages through locale files located in `public/locales`. English (EN) is the source of truth for all translations.

To contribute translations:

1. Check the current status of translations in our [localization issues](https://github.com/cohstats/coh3-stats/issues?q=label%3Alocalization%20)
2. Find the locale files in `public/locales` directory
3. Compare your target language files with the English versions in `public/locales/en`
4. Submit translations through a pull request or Discord

## Getting Started with development

Master branch is deployed to https://dev.coh3stats.com/

First install dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

Before making an MR please create an issue describing what you want to change and how you want to change it so we can have some discussion. Furthermore, it avoids multiple people working on the same thing.

Feel free to create a fork and make an MR. Before PR you can test your code with `yarn build` to make sure it builds.
You can also run `yarn build:slim` to build the app without prerendering all the pages. This is useful for faster development.

Also make sure the prettier is right `yarn fix` and `yarn test`

Development conventions:

- Name the files with `-` instead of camelCase. Eg `color-scheme-toggle.tsx`
- Try not to add any more eslint warnings (Don't worry if you don't know how to solve it though, we can solve on MR)
- Prettier and eslint should cover the rest (Don't forget to run it)
- We are using [Mantine](https://mantine.dev/) component library
- You can find the routing for pages in the folder `pages` (includes SSR code, data fetching, etc)
- You can find the implementation of the React code for each page in the folder `screens` (includes the UI code)
- You can find the components in the folder `components` (includes the UI code which is reused across the app)

## Development approach

### How to:

#### Add new map image and name

Maps are specified in https://github.com/cohstats/coh3-stats/blob/master/src/coh3/coh3-data.ts#L284

#### Utilize images from the game

You can use the function getIconsPathOnCDN where you can pass the image name or the full path and it should automatically
resolve it on our hosting
https://github.com/cohstats/coh3-stats/blob/master/src/utils.ts#L22
If the image is not found there, you can always add it to the /public folder.

### How to update the data after a new game patch

1. Go to https://github.com/cohstats/coh3-data and generate the new data as per readme
2. Create a new tag in coh3-data as per readme
3. Update config.ts in the root
4. Add the patch into object patches
5. Update latestPatch variable with the key of the new patch
6. If new maps has been added - fix them in src/coh3/coh3-data.ts
7. Run the project and verify that all pages work as expected

### How to update the sitemap after adding new pages

You can run the [automated workflow](https://github.com/cohstats/coh3-stats/actions/workflows/sitemap.yml) in GitHub for this.

Or manually you can do the following:

1. Run `yarn build`
2. Run `yarn sitemap`
3. Check changes in `public/sitemap.xml`
4. If the pages are not there, you can add them manually in `next-sitemap.config.js`
5. Commit the changes

For more info see readme at https://www.npmjs.com/package/next-sitemap

##### Generating the links to all units:

We have a special script for that.

1. You need Node 19+
2. Run

```
npx --yes ts-node --compiler-options "{\"module\":\"commonjs\"}" scripts/unit-paths.ts > unit-paths.txt
```

### NextJS development

#### We would like to have most of the pages which require some data SSR ( Server Side Rendered).

https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props.

Example pages:

- Home Page
- Player Cards
- Leaderboards
- ...
- Generally any page which loads data from DB or API

#### The rest of the pages should be SSG (Static Site Generation).

Example pages:

- Unit Stats
- ...
- Generally any page which doesn't load any data from API

#### Reasons:

- Because it's a public website, SSR pages will be much better read by search engines and it will provide an overall better experience.
- All the data fetching (from DB, cloud functions and other) should happen in SSR, so that we can offer site avaliabily everywhere, as GCP services are blocked in
  some countries ( China, Russia).
- The SSR functions have the capability to connect to public APIs, retrieve data from Firestore, and invoke cloud functions when necessary.
- The SSR functions should remain lightweight. For extensive data computations, utilize Cloud Functions on GCP, enabling performance control.
- The complete source code for our Next.js frontend will be available in this repository and will be open source.
- The BE of the CF will be closed source because, we will most likely connect to sensitive APIs.

![image](https://user-images.githubusercontent.com/8086995/217599315-ff660c70-e9d6-4e99-88b9-c4ea21892433.png)

## COH3 Stats technology stack

App platform:

- Firebase

Frontend:

- NextJS (React) as main technology used
- Edgio as a hosting platform
- Mantine as a component library

Backend:

- GCP Cloud
- Firebase Cloud Functions - in TypeScript
- Database:
  - Firestore - stats, players, matches
  - GCP Storage (leaderboards, matches)

### Additional domains

- cdn.coh3stats.com - Contains all the images | hosted on Firebase hosting
- storage.coh3stats.com - Contains matches and leaderboards | hosted on GCP Storage
- cache.coh3stats.com - Cache for API calls
- data.coh3stats.com - CDN for the data files hosted at Github - coh3-data repo

### History of deployments

#### NextJS App

- Edgio - for many years - ended because edgio ended their sites services
- Vercel - briefly - ended, because they are counting ISR as SSR, we have a LOT of ISR content, it was becoming really expensive,
  also we have quite high traffic over the world and vercel was not caching from single resource.
- Netlify - briefly - it was better than Vercel, but it ended, because they are become quite expensive
- AWS - SST deployment - this work quite well, we were able to nicely integrate with other services at AWS, however we
  added localization support for many languages. This moved the amount of unique pages to millions and google / bing and LLM bots are keen
  on visiting them all - one day we got quite big Lambda bill from AWS.
- Self Hosted Docker with Coolify - currently setup, flat rate

### High level architecture - outdated

![image](https://user-images.githubusercontent.com/8086995/217594185-93c7d83a-cb5f-4b93-a26d-bcc32d805d41.png)
