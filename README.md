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

### Development

To build the app without minification for easier debugging (this is useful for
deploying to Drupal):

        $ npm run build-dev

Verify the build by opening the output `dist/index.html` in a browser.

## Deployment

TBD -- Where will the build artifacts be deployed to?
