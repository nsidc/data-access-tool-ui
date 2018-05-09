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

To build the app:

        $ npm run build

Verify the build by opening the output `dist/index.html` in a browser.

### For Drupal

In order for the app to work in Drupal, we need to set `CESIUM_BASE_URL` to a drupal-relative location where Cesium's assets can be found:

        $ npm run build-drupal

## Deployment

TBD: This currently manual process is a proof of concept.

To avoid dealing with mount dependencies, run the following on a dev VM after building for Drupal:

        cp -R ./dist/* /share/apps/hermes-all/<env>/ui/*
