## Prerequisites

* [Node](http://nodejs.org/) and [npm](https://www.npmjs.org/)
* [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm), >= v0.35.1.

## Development

1. Install [node.js](http://nodejs.org/)
2. Use the version of NodeJS set in the project's .nvmrc file:

        $ nvm use

Note! The versions of `node` and `npm` are also specified in `package.json`.
These all need to be in sync (or ideally, only maintained in one place).

3. Install dependencies:

        $ npm install

### Build and serve the application via webpack-dev-server

        $ npm start

[Open the app](https://localhost:8080/), make changes, and the page will be
refreshed automatically. Note that the webapp is served with a self-signed cert,
so accept the risk and continue if your web browser blocks the request.

You also need to run a proxy to Hermes: npx http-server -p 3000 -P https://nsidc.org/apps/orders/api
See the config in webpack.config.cjs. Would like to proxy directly to Hermes URL, but couldn't get that to work.

## Developer VM (no Drupal)

     $ npm run build:dev # Build with source maps for development environment, and development
                         # settings.
                         # Do "npm run build" if you don't need source maps.
     $ rsync -av dist/ vagrant@dev.data-access-tools.USERNAME.dev.int.nsidc.org:/var/www/html/data-access-tools

On VM:

     $ sudo systemctl status nginx
     $ sudo systemctl restart nginx


## Development with Drupal integration

NOTE: these development instructions are out of date. Consider looking at the
[search-interface dev
docs](https://github.com/nsidc/search-interface/blob/main/DEVELOPMENT.md#deploying-to-a-developer-drupal-vm)
for information about how to work with drupal.

TODO: update the information here as much as possible, or remove it.

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
