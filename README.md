# COH3 Stats

![GitHub release (latest by date)](https://img.shields.io/github/v/release/cohstats/coh3-stats)

Website https://coh3stats.com/

We are looking not only for developers but anyone who would like to contribute
in building the best site with most info for Company of Heroes 3. All the data will
be open source for anyone to use! We need people to get the data from the game
/ organize the data. Come up with layouts and much more.

Anyone can put a hand in building this site. Please consider joining our [Discord](https://discord.gg/jRrnwqMfkr).

## Getting Started with development

Master branch is deployed to https://dev.coh3stats.com/

First install dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn next:dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

Before making an MR please create an issue describing what you want to change / how you want to change it.
So we can have some discussion, also it avoids multiple people working on the same thing.

## Development aproach

### High level architecture

![image](https://user-images.githubusercontent.com/8086995/217594185-93c7d83a-cb5f-4b93-a26d-bcc32d805d41.png)

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

- Because it's public website, SSR pages will be much better readed by search engines and generally it will provide
  better experience
- All the data fetching (from DB, cloud functions and other) should happen in SSR, because GCP services are blocked in
  some countries ( China, Russia), that way we can offer site avaliabily everywhere.
- The SSR functions can connect to some public APIs and will fetch the data from Firestore and may call some cloud
  functions
- The SSR functions should be "light weight" if we need to run some big data computations we should do so Cloud
  Functions on GCP where we can control the performance
- The whole source code for NextJS will be in this repo and will be open source
- The BE of the CF will be closed source because, we will most likely connect to sensitive APIs

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
    - Firestore - for basic data
    - Other DB? We might need a different DB for storing the info - as we might expect high amount of reads / writes --
      not perfect for FireStore
    - Big Query - for stored matches (we need to do pricing calculations on this)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions
are welcome!
