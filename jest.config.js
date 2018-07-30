const fetch = require("whatwg-fetch");

module.exports = {
  verbose: true,
  "automock": false,
  "roots": [
    "<rootDir>/src",
    "<rootDir>/tests"
  ],
  "setupTestFrameworkScriptFile": "jest-enzyme",
  "testEnvironment": "enzyme",
  "testEnvironmentOptions": {
    "enzymeAdapter": "react16"
  },
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "(/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  "moduleNameMapper": {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
        "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
    "cesium/Cesium": "<rootDir>/__mocks__/cesium/cesium.tsx"
  },
  testURL: "http://localhost/",
  globals: {
    Headers: fetch.Headers
  }
}
