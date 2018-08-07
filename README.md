# Everest UI

A user interface for placing Hermes data orders on a dataproduct landing page.

## Requirements

NodeJS 8.x (and npm!)

## Install dependencies:
With npm:

        $ npm install

## Development

### Option 1: Continuously build & deploy locally

1. You can run the webpack-dev-server to both build the application and serve it
   up:

        $ npm start

2. Now you can [open the app](http://localhost:8080/), make changes, and the
   page will be refreshed automatically.

### Option 2: Continuously build & deploy in Drupal

On a [drupal](https://bitbucket.org/nsidc/drupal/src/landing-page-module/) dev
VM with `/share/apps/everest-ui` mounted and a symlink at
`/var/www/drupal/apps/everest-ui` pointing to the mounted share dir (like step 1
under "Custom module development" in the drupal README), this command will build
and deploy the webapp to the share dir when source files change, clearing the
Drupal css-js cache on each build:

        $ npm run build-dev-drupal

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

Currently, the application is only deployed to production in a Drupal
environment, and for this reason only a `build-drupal` option is configured.
**This may change in the future.** In order for the app to work in Drupal,
`CESIUM_BASE_URL` must be set to a Drupal-relative location where Cesium's
assets can be found.

To build the app:

        $ npm run build-drupal

Verify the build by opening the output `dist/index.html` in a browser.

## Versioning

When `master`\* is in a releasable state, [`npm
version`](https://docs.npmjs.com/cli/version) can be used to bump the version. A
tag and commit will automatically be created, which should then be pushed to
`origin/master`\*, then the released version should be ready for deployment to
QA.

\* or another branch, if a special circumstance requires releasing from a
non-`master` branch

Because we display the version to the user, after release, the version should be
incremented and `-dev` appended to the version string, so that subsequent builds
indicate that it is a new version.

## Deployment

No CI machine exists for `everest-ui` (yet), so use a
[drupal](https://bitbucket.org/nsidc/drupal/src/landing-page-module/) VM to
deploy the application.

### Build the app:

        $ npm run build-drupal

### Deploy the app:

If you're on a dev VM with `/share/apps/everest-ui-all` mounted, you can
deploy to any environment by passing an argument. This command **will additionally
update the git tag for the environment, and should be used to deploy to all
non-dev environments until we configure a CI machine for this application.**
For example:

        $ npm run deploy-drupal -- integration

You can also deploy to the current environment from a VM (e.g., if the VM was
built for the `integration` environment, and you want to deploy to `integration`):

        $ npm run deploy-drupal

However, this option will not add a git tag.

### Refresh Drupal!

If you deployed to an environment that differs from the environment on which you
built the app (e.g., you're working on your dev VM and deployed to integration),
`ssh` to the target environment VM and do `drush cache-clear css-js`. If that
doesn't work, you may also need to disable/re-enable the module: `cd /vagrant; ./reload_mods.sh`.
