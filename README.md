Main branch: [![CircleCI](https://circleci.com/bb/nsidc/everest-ui.svg?style=svg&circle-token=05777f28b61b63d37438d50af8c951a8c2789b1d)](https://circleci.com/bb/nsidc/everest-ui)
Release candidate: [![CircleCI](https://circleci.com/bb/nsidc/everest-ui/src/da-64.svg?style=shield&circle-token=05777f28b61b63d37438d50af8c951a8c2789b1d)](https://circleci.com/bb/nsidc/everest-ui/src/da-64)

# Data Access Tools

A "data orders" user interface that can be embedded into dataset landing pages.

**tl;dr:** See the end of this document for the sequence of steps involved in
deploying the application to QA.

## Prerequisites

[Node Version Manager (nvm)](https://github.com/creationix/nvm)

To upgrade nvm (needed for install-latest-npm flag):

        $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash

## Development as a standalone application (not integrated into a Drupal page)

### Use the version of NodeJS set in the project's .nvmrc file:

        $ nvm use

### Upgrade npm to the latest so we can use `npm audit`

        $ nvm install-latest-npm

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
