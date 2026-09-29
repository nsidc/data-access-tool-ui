module.exports = {
  verbose: true,
  "automock": false,
  "roots": [
    "<rootDir>/src",
    "<rootDir>/tests"
  ],
  "testEnvironment": "jsdom",
  "transform": {
    "^.+\\.tsx?$": ["ts-jest", {
    "tsconfig": {
           "jsx": "react",
           "esModuleInterop": true,
           "allowSyntheticDefaultImports": true,
         }
       }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(cheerio)/)',
  ],
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
    "cesium": "<rootDir>/__mocks__/cesium/cesium.tsx"
  }
}
