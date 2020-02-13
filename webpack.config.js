const path = require('path');
const webpack = require('webpack');

const CopywebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

// To understand the magic used to include CesiumJS in the project,
// see: https://cesiumjs.org/tutorials/cesium-and-webpack/
// Also: https://github.com/AnalyticalGraphicsInc/cesium-webpack-example

// TODO: Can JQuery go away? We'd have to rewrite some code that uses JQuery.
links = ["https://cdn.earthdata.nasa.gov/eui/1.1.7/stylesheets/application.css"];
scripts = ["https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"];

module.exports = {
    entry: {
      index: ['./src/index.ts'],
      profile: ['./src/profile.ts'],
    },
    output: {
        filename: '[name].bundle.js',
        path: process.env.WEBPACK_OUTPUT_PATH || path.resolve(__dirname, 'dist'),
        // for Cesium
        sourcePrefix: ''
    },
    amd: {
        // Enable webpack-friendly use of require in Cesium
        toUrlUndefined: true
    },

    node: {
        // Resolve node module use of fs
        fs: 'empty'
    },

    devtool: 'source-map',

    devServer: {
        historyApiFallback: {
          disableDotRule: true,
          rewrites: [ { from: /^\/profile.html/, to: '/profile.html'} ],
        },
        contentBase: ['./dist', '/share'],
        host: '0.0.0.0',
        disableHostCheck: true,
        hot: false,
        inline: false,
    },

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js', '.tsx'],
        alias: {
            // Cesium module name
            cesium: path.resolve(__dirname, cesiumSource, "Cesium.js"),
            "cesium-widgets": path.resolve(__dirname, cesiumSource, "Widgets"),
        }
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [{
                  loader: 'style-loader'
                }, {
                  loader: 'css-loader', options: {
                    sourceMap: true
                  }
                }, {
                  loader: 'less-loader', options: {
                    sourceMap: true
                  }
                }]
            },
            { test: /\.tsx?$/, loader: 'ts-loader' },
            {
              test: /\.tsx?$/,
              loader: 'tslint-loader',
              enforce: 'pre',
              options: {
                configFile: 'tslint.json',
                emitErrors: true,
                fix: true,
              }
            },
            {
              test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
              loader: 'url-loader',
              options: {}
            },
            { test: /\.jsx?$/, enforce: 'pre', loader: 'source-map-loader' }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Order Interface',
            chunks: ['index'],
            inject: false,
            template: require('html-webpack-template'),
            appMountId: 'everest-ui',
            links,
            scripts
        }),
        new HtmlWebpackPlugin({
            title: 'Profile Page',
            chunks: ['profile'],
            inject: false,
            template: require('html-webpack-template'),
            filename: 'profile.html',
            appMountId: 'everest-ui-profile',
            links,
            scripts
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopywebpackPlugin([ { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' } ]),
        new CopywebpackPlugin([ { from: path.join(cesiumSource, 'Assets'), to: 'Assets' } ]),
        new CopywebpackPlugin([ { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' } ]),
        new webpack.DefinePlugin({
            EVEREST_UI_VERSION: JSON.stringify(require("./package.json").version),
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify(process.env.CESIUM_BASE_URL || '')
        }),
        new WriteFilePlugin(),
        new StyleLintPlugin({
          configFile: ".stylelintrc",
          context: "src/styles",
          files: "**/*.less",
        })
    ]
};

// clear the Drupal JS/CSS cache so that source changes can be immediately
// picked up
if (process.env.DRUSH_CACHE_CLEAR_ON_BUILD) {
  module.exports.plugins.push(new WebpackShellPlugin({
    onBuildEnd: ['./scripts/clear-drush-cache.sh'],
    dev: false  // without this, the command only runs on the first build with --watch
  }));
}
