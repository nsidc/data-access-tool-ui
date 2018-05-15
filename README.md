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

TBD

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

## Deployment

If you want to deploy to the current environment from a VM:

        $ npm run deploy-drupal

If you're on a dev or CI VM with `/share/apps/hermes-all` mounted, you can deploy to any environment by passing an argument. For example:

        $ npm run deploy-drupal -- integration
