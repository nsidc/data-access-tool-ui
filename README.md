# Everest UI

A "data orders" user interface that can be embedded into dataset landing pages.

tl;dr: See the end of this document for the sequence of steps involved in
deploying the application to QA.

## Requirements

NodeJS 8.x (and npm!)

## Development as a standalone application (not integrated into a Drupal page)

### Install dependencies:

        $ npm install

### Build and serve the application via webpack-dev-server

        $ npm start

[Open the app](http://localhost:8080/), make changes, and the page will be refreshed automatically.

## Development with Drupal integration

Clone the [drupal repository (landing-page-module branch)](https://bitbucket.org/nsidc/drupal/src/landing-page-module/),
including the submodules.
(See the `Quickstart` section in the [drupal project README](https://bitbucket.org/nsidc/drupal/src/landing-page-module/README.md)
for information about cloning the drupal project with its associated submodules.)

`cd` to the drupal working directory and provision a `dev` VM:

    vagrant nsidc up --env=dev

Assuming it builds successfully, you should now have a dev VM with
`/share/apps/everest-ui` mounted from `/share/apps/everest-ui-all/dev/<your-login>`,
and a symlink at `/var/www/drupal/apps/everest-ui` pointing to `/share/apps/everest-ui`.
In other words, step 1 under "Custom module development" in the 
[drupal project README](https://bitbucket.org/nsidc/drupal/src/landing-page-module/README.md) 
will be automatically handled when the VM is provisioned. The provisioning
process will also clone the `everest-ui` project and install `npm`. You can then
`ssh` to the VM, check out the desired branch or tag, and run the app in a
"watch" mode which will build and deploy the webapp to `/share/apps/everest-ui` when
source files change. This method will also clear Drupal's css-js cache on each build.
Do:

    $ vagrant nsidc ssh --env=dev
    $ cd ~vagrant/everest-ui
    $ git checkout my-development-branch # If you want to work on a branch besides master
    $ npm install
    $ npm run build-dev-drupal

To debug the app, use the files under `webpack://` in the Sources tab of the Developer Tools.

## Testing

    npm test

To see extra detail:

    npm test -- --debug

## Linting

    npm run lint

## Building for deployment to a non-development location

No CI machine exists for `everest-ui` (yet), so use a
[drupal](https://bitbucket.org/nsidc/drupal/src/landing-page-module/) VM to
build the application if you intend to deploy it somewhere besides your local
working environment.  See "Development with Drupal integration," above, for
notes regarding VM setup.

The `production` deployment assumes eventual Drupal integration, and for this
reason only a `build-drupal` "production" build option is configured for the
application.  **This may change in the future.** The `build-drupal` target sets
the value of `CESIUM_BASE_URL` to a Drupal-relative location where Cesium's
assets can be found.  **NOTE: Until we add environment-specific configuration,
before building the app for the staging or production environments, manually confirm that
the value of `CMR_URL` in `src/utils/CMR.ts` is set to `https://cmr.earthdata.nasa.gov`.**

To build the app (minified):

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

Deploy the application from the same [drupal](https://bitbucket.org/nsidc/drupal/src/landing-page-module/)
VM that you used to build the application.

### Move the build content

If you're on a `dev` VM with `/share/apps/everest-ui-all` mounted (which should
be the case, if the VM provisioned successfully), you can deploy to any
environment by passing it as an argument. This command **will additionally
update the git tag for the environment, and should be used to deploy to all
non-dev environments until we configure a CI machine for this application.** For
example:

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

## Example sequence of events for deploying to QA

  * Clone the [drupal repository (landing-page-module branch)](https://bitbucket.org/nsidc/drupal/src/landing-page-module/),
  including the submodules. `cd` to that working directory.
  * Provision a `dev` VM: `vagrant nsidc up --env=dev`
  * `ssh` to the VM and check out the desired version (tag)
      $ vagrant nsidc ssh --env=dev
      $ cd ~vagrant/everest-ui
      $ git checkout branch-to-deploy
  * Confirm that `CMR_URL` in `src/utils/CMR.ts` is set to
    the desired value (either `https://cmr.earthdata.nasa.gov` or `https://cmr.uat.earthdata.nasa.gov/`)
  * Install packages and build the app:
      *  $ npm install
      *  $ npm run build-drupal
  * Move the app to the right place so the QA Drupal machine can find it:
      *  $ npm run deploy-drupal -- qa
  * Exit the VM and refer to the
    [drupal project README](https://bitbucket.org/nsidc/drupal/src/landing-page-module/README.md) 
    for the Drupal portion of the deployment.
