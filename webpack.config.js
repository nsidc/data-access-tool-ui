const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    devtool: 'source-map',

    devServer: {
        contentBase: './dist',
        host: '0.0.0.0',
        port: 80,
        disableHostCheck: true,
    },

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.js']
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
            { test: /\.ts$/, loader: 'ts-loader' },
            { test: /\.js$/, enforce: 'pre', loader: 'source-map-loader' }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Development',
            inject: false,
            template: require('html-webpack-template'),
            appMountId: 'everest-ui'
        })
    ]
};
