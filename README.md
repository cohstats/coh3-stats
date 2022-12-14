# COH3 Stats

We are looking not only for developers but anyone who would like to contribute
in building the best site with most info for Company of Heroes 3. All the data will
be open source for anyone to use! We need people to get the data from the game
/ organize the data. Come up with layouts and much more.

Anyone can put a hand in building this site. Please consider joining our [Discord](https://discord.gg/jRrnwqMfkr).

## Getting Started

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
  - Other DB? We might need a different DB for storing the info - as we might expect high amount of reads / writes -- not perfect for FireStore
  - Big Query - for stored matches (we need to do pricing calculations on this)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
