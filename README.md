# Everest UI

A user interface for placing Hermes data orders on a dataproduct landing page.

## Requirements

NodeJS 8.x (and npm!)

## Install dependencies:
With npm:

        $ npm install

## Development

### Option 1: Continuously build & deploy independently

1. You can run the webpack-dev-server so the app is served up
   by a web server.

        $ npm start

2. Now you can [open the app and see live
   changes](http://localhost:8080/). Make changes to the code and see
   them live. The page will refresh automatically.

### Option 2: Continuously build & deploy in Drupal

On a [drupal](https://bitbucket.org/nsidc/drupal/src/landing-page-module/) dev
VM with `/share/apps/everest-ui` mounted and a symlink at
`/var/www/drupal/apps/everest-ui` pointing to the mounted share dir (like step 1
under "Custom module development" in the drupal README), this command will build
and deploy the webapp to the share dir when source files change, clearing the
Drupal css-js cache on each build:

        $ npm dev-drupal

To debug the app, use the files under `webpack://` in the Sources tab of the
Developer Tools.

### Testing

    npm test

To see extra detail:

    npm test -- --debug

### Linting

    npm run lint

## Build

### Production

To build the app:

        $ npm run build

Verify the build by opening the output `dist/index.html` in a browser.

### For Drupal

In order for the app to work in Drupal, we need to set `CESIUM_BASE_URL` to a drupal-relative location where Cesium's assets can be found:

        $ npm run build-drupal

### Development

To build the app without minification for easier debugging (this is useful for
deploying to Drupal):

        $ npm run build-dev

Verify the build by opening the output `dist/index.html` in a browser.

## Versioning

When `master`\* is in a releasable state, [`npm
version`](https://docs.npmjs.com/cli/version) can be used to bump the version. A
tag and commit will automatically be created, which should then be pushed to
`origin/master`\*, then the released version should be ready for deployment to
QA.

\* or another branch, if a special circumstance requires releasing from a
non-`master` branch

## Deployment

If you want to deploy to the current environment from a VM:

        $ npm run deploy-drupal

If you're on a dev or CI VM with `/share/apps/hermes-all` mounted, you can
deploy to any environment by passing an argument. This command will additionally
update the git tag for the environment. For example:

        $ npm run deploy-drupal -- integration
