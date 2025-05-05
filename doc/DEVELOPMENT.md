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

> [!WARNING]
> In a local development environment, the DAT currently points to the
> integration data-access-tool-backend. To change this, manually modify the
> `dev` section of the `getEnvironmentDependentURLs` function in
> `environment.ts`. When deployed to a VM, the path will be based on the current
> URL (e.g., in `qa`, the DAT backend API url would be
> `https://qa.nsidc.org/apps/data-access-tool/api/`. Eventually, we may want to
> get the API URL from a drupal-provided variable to support injection of the
> current URL in non-NSIDC hosted DAT (when we move to earthdata landing pages)

## Development with Drupal integration

This application relies on NSIDC drupal-set parameters that provide dataset
information (dataset ID and version) that drives CMR requests that populate
items like the granules list and bounding box in the cesium map.

Most importantly, Drupal provides CSS that the app relies on to look correct. To
fully test style changes, it must be tested in Drupal.

In order to test integration with drupal, create a dev VM from the
`ansible_drupal_nsidc_org` repository, hosted on NSIDC's `gitsrv` server. To
clone `ansible_drupal_nsidc_org`:

```
git clone ssh://gitsrv.nsidc.org/gitsrv/webteam/ansible_drupal_nsidc_org.git
```

Note that you should be able to log into `gitsrv.nsidc.org` with LDAP login
credentials. It's reccomended to login and setup ssh keys. If you have trouble
logging into `gitsrv.nsidc.org`, create an SA ticket for support.

Follow the `ansible_drupal_nsidc_org` repository's `README.md` for instructions
on how to bring up a dev VM.

Once a VM has been brought up, run a
[garrision](https://bitbucket.org/nsidc/garrison) deployment of
[nsidc-drupal8](https://bitbucket.org/nsidc/nsidc-drupal8/) on the VM as
described in the README, using e.g., the `staging` ref, or one that has updated
the `web/libraries/package.json` with a new version of the `data-access-tools`
(this project).

To test code that has not yet been released to npmjs, use e.g,. `rsync` to copy
the built application into the expected installation location on the drupal VM. E.g.:

```
$ npm run build
$ rsync -a --progress ./dist/* dev.nsidc.org.docker-drupal8.{YOUR_USERNAME}.dev.int.nsidc.org:/home/vagrant/drupal/web/libraries/node_modules/@nsidc/data-access-tools/dist/
```


## Testing

    npm test

To see extra detail:

    npm test -- --debug

## Linting

    npm run lint

## Versioning and releasing

When starting a new feature for that will eventually end up in production, bump
the version using `npm version`. E.g.,:

```
npm version v4.0.1-rc.1 --no-git-tag-version
```

> [!NOTE]
> Use `-rc` or `-alpha` to indicate a WIP version. It can be handy to release
> multiple versions of the same planned release to integration and QA for
> stakeholder testing and feedback. Once the software is ready for release to
> production, drop the prerelease `-rc` tag.

Update the CHANGELOG with the new version and the changes it includes.

Once a ready for a release (for prod or testing purposes), create a tag with the
version and push it to GitHub. E.g.,:

```
git tag v4.0.1-rc.1
git push origin refs/tags/v4.0.1-rc.1
```

Once the a version tag is pushed to GitHub, an NPM package is built and pushed
to
[https://www.npmjs.com/package/@nsidc/data-access-tools](https://www.npmjs.com/package/@nsidc/data-access-tools)
via the
[../.github/workflows/publish_npm.yml](../.github/workflows/publish_npm.yml)
GitHub action.

Once published to npmjs, you should be ready for deployment to integration and
qa. See the Deployment section below for more info.

> [!NOTE]
> The `release`, `setup:prerelease`, and `bump:prerelease` npm scripts are
> available to assist with the process of preparing a release. See the
> `package.json` for details.


## Deployment


See [this confluence page on how to deploy a Javascript application to nsidc.org
Drupal](https://nsidc.atlassian.net/wiki/spaces/PROG/pages/50364633/How+to+deploy+a+Javascript+application+into+nsidc.org+Drupal)
