const path = require('path');
const webpack = require('webpack');

const CopywebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

// To understand the magic used to include CesiumJS in the project,
// see: https://cesiumjs.org/tutorials/cesium-and-webpack/
// Also: https://github.com/AnalyticalGraphicsInc/cesium-webpack-example

module.exports = {
    entry: './src/index.tsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
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
        contentBase: './dist',
        host: '0.0.0.0',
        port: 80,
        disableHostCheck: true,
    },

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js', '.tsx', '.tsx'],
	alias: {
	    // Cesium module name
	    cesium: path.resolve(__dirname, cesiumSource)
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
            { test: /\.tsx?$/, loader: 'ts-loader' },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            },
            { test: /\.jsx?$/, enforce: 'pre', loader: 'source-map-loader' }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Development',
            inject: false,
            template: require('html-webpack-template'),
            appMountId: 'everest-ui'
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopywebpackPlugin([ { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' } ]),
        new CopywebpackPlugin([ { from: path.join(cesiumSource, 'Assets'), to: 'Assets' } ]),
        new CopywebpackPlugin([ { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' } ]),
        new webpack.DefinePlugin({
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify('')
        })
    ]
};
