// This file was automatically added by edgio init.
// You should commit this file to source control.
// Learn more about this file at https://docs.edg.io/guides/edgio_config
module.exports = {
  connector: "@edgio/next",

  // The name of the site in Edgio to which this app should be deployed.
  name: "coh3-stats",

  //The name of the team in Edgio to which this app should be deployed.
  team: "coh-stats",

  next: {
    enforceTrailingSlash: true,
    generateSourceMaps: true,
    disableEdgioDevTools: false,
  },

  environments: {
    prod: {
      hostnames: [{ hostname: "coh3stats.com" }],
    },
    dev: {
      hostnames: [{ hostname: "dev.coh3stats.com" }],
    },
    preview: {
      hostnames: [{ hostname: "preview.coh3stats.com" }],
    },
  },

  // Specifies the node version for the cloud
  cloudRuntime: "nodejs20.x",

  // Overrides the default path to the routes file. The path should be relative to the root of your app.
  // routes: 'routes.js',

  // The maximum number of URLs that will be concurrently prerendered during deployment when static prerendering is enabled.
  // Defaults to 200, which is the maximum allowed value.
  // prerenderConcurrency: 200,

  // A list of glob patterns identifying which source files should be uploaded when running edgio deploy --includeSources.
  // This option is primarily used to share source code with Edgio support personnel for the purpose of debugging. If omitted,
  // edgio deploy --includeSources will result in all files which are not gitignored being uploaded to Edgio.
  //
  // sources : [
  //   '**/*', // include all files
  //   '!(**/secrets/**/*)', // except everything in the secrets directory
  // ],

  // Allows you to include additional resources in the bundle that is deployed to Edgio’s serverless JS workers.
  // Keys are globs, value can be a boolean or string. This is typically used to ensure that resources
  // that need to be dynamically required at runtime such as build manifests for server-side rendering
  // or other config files are present in the cloud.
  //
  // includeFiles: {
  //   'lang/**/*': true, // Just includes the specified files
  //   'content/**/*': 'another/dir/in/edgio/lambda', // Copies the files into specific directory within Edgio build
  // },

  // Set to true to include all packages listed in the dependencies property of package.json when deploying to Edgio.
  // This option generally isn't needed as Edgio automatically includes all modules imported by your code in the bundle that
  // is uploaded during deployment
  //
  // includeNodeModules: true,
};
