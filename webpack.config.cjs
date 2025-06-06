const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

// To understand the magic used to include CesiumJS in the project,
// see: https://cesium.com/learn/cesiumjs-learn/cesiumjs-webpack/
// Also: https://github.com/AnalyticalGraphicsInc/cesium-webpack-example
// https://github.com/CesiumGS/cesium-webpack-example/blob/main/webpack.config.js

// TODO: Can JQuery go away? We'd have to rewrite some code that uses JQuery.
links = ["https://cdn.earthdata.nasa.gov/eui/1.1.7/stylesheets/application.css"];
scripts = ["https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"];

const devConfig = {
    plugins: [
        new webpack.EnvironmentPlugin({
            APPLICATION_ENVIRONMENT: 'development'
        }),

    ],

    devtool: 'cheap-module-source-map',

    devServer : {
        server: "https",
    },
};

const prodConfig = {
    plugins: [
        new webpack.EnvironmentPlugin({
            APPLICATION_ENVIRONMENT: 'production'
        })
    ]
};

const config = {
    entry: {
      "order-data": ['./src/index.ts'],
    },
    output: {
        filename: '[name].bundle.js',
        path: process.env.WEBPACK_OUTPUT_PATH || path.resolve(__dirname, 'dist'),
        // for Cesium
        sourcePrefix: '',
    },
    amd: {
        // Enable webpack-friendly use of require in Cesium
        toUrlUndefined: true
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
                test: /\.less$/i,
                use : [
                    {
                        loader : "style-loader",
                    },
                    {
                        loader : "css-loader",
                        options: {
                            sourceMap: true,
                        }
                    },
                    {
                        loader : "less-loader",
                        options : {
                            sourceMap: true,
                        },
                    },
                ],
            },
            { test: /\.tsx?$/, loader: 'ts-loader' },
            {
              test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
              type: 'asset/inline'
            },
            { test: /\.jsx?$/, enforce: 'pre', loader: 'source-map-loader' }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Order Data Interface',
            chunks: ['order-data'],
            inject: 'body',
            template: './public/order-data.html',
            filename: 'order-data.html',
            appMountId: 'order-data',
            links,
            scripts
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopyWebpackPlugin({
            patterns: [
                { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
                { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }
            ]
        }),
        new webpack.EnvironmentPlugin({
            VERSION: JSON.stringify(require("./package.json").version),
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: process.env.CESIUM_BASE_URL || '/'
        }),
        new WriteFilePlugin(),
    ]
};

module.exports = (env, argv) => {
    let mergedConfig = {};

    if (argv.mode !== 'production') {
        mergedConfig = merge(devConfig, config);
    }
    else {
        mergedConfig = merge(prodConfig, config);
    }

    return mergedConfig;
};
