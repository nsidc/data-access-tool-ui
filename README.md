# Everest UI

A "data orders" user interface that can be embedded into dataset landing pages.

**tl;dr:** See the end of this document for the sequence of steps involved in
deploying the application to QA.

## Prerequisites

[Node Version Manager (nvm)](https://github.com/creationix/nvm)

## Development as a standalone application (not integrated into a Drupal page)

This is not recommended. For best dev results, see "Development with Drupal
integration".

### Use the version of NodeJS set in the project's .nvmrc file:

        $ nvm use

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

See the app running at `<vm-url>/data/nsidc-0642?qt-data_set_tabs=1#`.

This also starts the app in "standalone" mode; to see the app there, navigate to
`<vm-url>:8080`.

To debug the app (in either environment), use the files under `webpack://` in
the Sources tab of the Developer Tools.

## Testing

    npm test

To see extra detail:

    npm test -- --debug

## Linting

    npm run lint

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

The CI job
[everest-ui_Deploy](http://ci.everest-ui.apps.int.nsidc.org:8080/job/everest-ui_Deploy/)
can be used to build and deploy the app to integration, qa, or staging. It is
configured to run automatically for integration for every new push on
master. The app is built and deployed to the appropriate share, a git tag
matching the chosen environment is updated, then the cache on the corresponding
Drupal VM is cleared with `drush cache-clear css-js`.

You can inspect the [everest-ui_Deploy job
configuration](http://ci.everest-ui.apps.int.nsidc.org:8080/job/everest-ui_Deploy/configure)
to see the specific commands used to build and deploy the app. Running those
commands individually, you can deploy the app from a dev VM (assuming
`/share/apps/everest-ui-all` is mounted) to any environment.


While using the CI job is preferred, you can also deploy to the current
environment from a VM (e.g., if the VM was built for the `integration`
environment, and you want to deploy to `integration`):

        $ npm run deploy-drupal

However, this option will not add a git tag, nor will it automatically refresh
the Drupal cache.

A full deployment of the app may include changes to Drupal modules not covered
above. For details on that part of the project, see the [drupal project
README](https://bitbucket.org/nsidc/drupal/src/landing-page-module/README.md).
