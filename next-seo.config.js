/** @type {import('next-seo').DefaultSeoProps} */
const defaultSEO = {
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
        alt: "COH3 Stats logo",
      },
    ],
  },
  twitter: {
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    {
      name: "viewport",
      content: "minimum-scale=1, initial-scale=1, width=device-width",
    },
    {
      name: "keywords",
      content: "coh3, coh3stats, company of heroes 3, coh3 statistics, coh3 data",
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
    {
      rel: "apple-touch-icon",
      sizes: "60x60",
      href: "/logo/apple-icon-60x60.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "72x72",
      href: "/logo/apple-icon-72x72.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "76x76",
      href: "/logo/apple-icon-76x76.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "114x114",
      href: "/logo/apple-icon-114x114.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "120x120",
      href: "/logo/apple-icon-120x120.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "144x144",
      href: "/logo/apple-icon-144x144.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "152x152",
      href: "/logo/apple-icon-152x152.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/logo/apple-icon-180x180.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "192x192",
      href: "/logo/android-icon-192x192.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/logo/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "96x96",
      href: "/logo/favicon-96x96.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/logo/favicon-16x16.png",
    },
    {
  {
    rel: "icon",
    type: "image/x-icon",
    sizes: "16x16",
    href: "/logo/favicon.ico",
  },
  ],
};

module.exports = defaultSEO;
