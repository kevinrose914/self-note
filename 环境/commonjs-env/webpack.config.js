const path = require('path')
const webpack = require('webpack')

module.exports = {
    mode: 'development',
    entry: {
        redux: path.join(__dirname, './store.js')
    },
    output: {
        filename: 'bundle.js',
        chunkFilename: '[name].bundle.js',
        publicPath: '/',
        path: path.join(__dirname, '/')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),//报错时不退出webpack进程
    ],
    devServer: {
        port: 8085
    }
}