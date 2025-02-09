// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "coh3-stats",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        cloudflare: "5.49.0",
        aws: {
          region: "us-east-2",
        },
      },
    };
  },
  async run() {
    new sst.aws.Nextjs("coh3-stats", {
      domain: {
        name:
          $app.stage === "staging"
            ? "dev.coh3stats.com"
            : $app.stage === "production"
              ? "coh3stats.com"
              : undefined,
        dns: sst.cloudflare.dns({
          proxy: true,
          override: true,
        }),
      },
      transform: {
        cdn: (args) => {
          args.transform = {
            distribution: (distArgs) => {
              // Only US and EU
              distArgs.priceClass = "PriceClass_100";
            },
          };
        },
      },
    });
  },
});
