const webpack = require('webpack')
const path = require('path')
const autoprefixer = require('autoprefixer')
const htmlWebpackPlugin = require('html-webpack-plugin')
const extractTextPlugin = require('extract-text-webpack-plugin')

const env = process.env.env_config
function resolve(filepath) {
    return path.resolve(__dirname, filepath)
}

module.exports = {
    mode: 'development',
    entry: {
        app: env === 'vm' ? resolve('src/vm.js') : resolve('src/flexible.js')
    },
    output: {
        filename: '[name].[bundle].js',
        chunkFilename: '[name].[chunkhash:5].js',
        publicPath: '/',
        path: path.resolve(__dirname, '/')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                use: extractTextPlugin.extract({
                    use:[
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => [autoprefixer({
                                    browsers: ['last 3 versions']
                                })]
                            }
                        },
                        'less-loader'
                    ],
                    fallback: 'style-loader'
                })
            }
        ]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new extractTextPlugin({
            filename: '[name].[chunkhash:5].css'
        }),
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: env === 'vm' ? 'vm.html' : 'flexible.html',
            inject: true
        })
    ],
    devServer: {
        hot: true,
        port: 8086
    }
}