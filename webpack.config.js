const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.tsx',
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
        extensions: ['.webpack.js', '.web.js', '.ts', '.js', '.tsx', '.tsx']
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
            { test: /\.jsx?$/, enforce: 'pre', loader: 'source-map-loader' }
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
