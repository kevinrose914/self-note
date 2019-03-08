const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyjsPlugin = require('uglifyjs-webpack-plugin')

const resolve = (filepath) => path.resolve(__dirname, filepath)
// 静态资源的存储路径
const join = (filepath) => path.posix.join('static', filepath)

// 生成样式相关的loader
const generalStyleLoader = (options) => {
    const { sourceMap, extract, usePostCSS, preprocessor } = options
    const cssLoader = {
        loader: 'css-loader',
        options: {
            sourceMap
        }
    }
    const postCssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap,
            plugins: () => [
                autoprefixer({
                    browsers: ['last 3 versions']
                })
            ]
        }
    }
    const styleLoader = {
        loader: 'style-loader'
    }
    let loaders = usePostCSS ? [cssLoader, postCssLoader] : [cssLoader]
    if (preprocessor) {
        loaders.push({
            loader: `${preprocessor.name}-loader`,
            options: Object.assign({}, preprocessor.option, { sourceMap })
        })
    }
    if (!extract) {
        loaders = [styleLoader].concat(loaders)
    }
    // sass, less, stylus, styl
    return {
        test: new RegExp('\\.(' + preprocessor.name + '|css)$'),
        use: loaders,
        exclude: /node_modules/
    }
}

module.exports = {
    mode: 'production',
    entry: {
        polyfill: '@babel/polyfill',
        app: [resolve('src/main.js')]
    },
    output: {
        path: resolve('dist'),
        publicPath: '/',
        filename: './static/js/[name].js',
        chunkFilename: './static/js/[name].[chunkhash:5].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            formatter: require('eslint-friendly-formatter'),
                            emitWarning: true
                        }
                    }
                ],
                include: [resolve('src')],
                enforce: 'pre'
            },
            {
                test: /\.js$/,
                use: ['babel-loader?cacheDirectory'],
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            generalStyleLoader({
                sourceMap: true,
                extract: false,
                usePostCSS: true,
                preprocessor: { name: 'less' }
            }),
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: join('/img/[name].[hash:7].[ext]')
                        }
                    }
                ]
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: join('/media/[name].[hash:7].[ext]')
                        }
                    }
                ]
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            name: join('/fonts/[name].[hash:7].[ext]')
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, './dist/index.html'),
            template: './index.html',
            inject: true,
            chunksSortMode: 'none'
        })
    ],
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        splitChunks: {
            chunks: 'all',
            minSize: 1,
            minChunks: 2,
            name: true,
            cacheGroups: {
                commons: {
                    name: 'commons',
                    chunks: 'all',
                    minChunks: 2,
                    minSize: 1,
                    priority: -10
                },
                styles: {
                    name: 'styles',
                    test: /\.less$/,
                    chunks: 'all',
                    enforce: true
                },
                vendors: {
                    name: 'vendors',
                    test: /[\\/]node_modules[\\/]/
                },
                // default: false
            }
        },
        minimizer: [
            new UglifyjsPlugin({
                test: /\.js$/,
                chunkFilter: (chunk) => {
                    if (chunk.name === 'vendors') {
                        return false
                    }
                    return true
                },
                sourceMap: true,
                uglifyOptions: {

                }
            })
        ]
    },
    // devtool: 'cheap-module-eval-source-map'
}