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
    entry: {
      index: ['./src/index.tsx'],
      profile: ['./src/profile.tsx'],
    },
    output: {
        filename: '[name].bundle.js',
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
        historyApiFallback: {
          disableDotRule: true,
          rewrites: [ { from: /^\/profile.html/, to: '/profile.html'} ],
        },
        contentBase: './dist',
        host: '0.0.0.0',
        disableHostCheck: true,
        hot: false,
        inline: false,
    },

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js', '.tsx'],
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
              test: /\.tsx?$/,
              loader: 'tslint-loader',
              enforce: 'pre',
              options: {
                configFile: 'tslint.json',
                emitErrors: true
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
            appMountId: 'everest-ui'
        }),
        new HtmlWebpackPlugin({
            title: 'Profile Page',
            chunks: ['profile'],
            inject: false,
            template: require('html-webpack-template'),
            filename: 'profile.html',
            appMountId: 'everest-ui-profile'
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopywebpackPlugin([ { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' } ]),
        new CopywebpackPlugin([ { from: path.join(cesiumSource, 'Assets'), to: 'Assets' } ]),
        new CopywebpackPlugin([ { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' } ]),
        new webpack.DefinePlugin({
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify(process.env.CESIUM_BASE_URL || '')
        })
    ]
};
