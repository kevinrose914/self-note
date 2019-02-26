const webpack = require('webpack');
const path = require('path');

let buildType = 'dev';
if (process.env.NODE_ENV === 'production') {
    buildType = 'prod';
} else if (process.env.NODE_ENV === 'test') {
    buildType = 'test';
}
const commonPlugin = [
]
if (buildType !== 'prod') {
    commonPlugin.push(new webpack.HotModuleReplacementPlugin())
}
module.exports = {
    configureWebpack: {
        // mode: 'production', 
        plugins: commonPlugin,
        resolve: {
            alias: {
                // 'vue': path.resolve(__dirname, './node_modules/vue/dist/vue.esm.js'),
                '@': path.resolve(__dirname, './src')
            }
        }
    },
    devServer: {
        hot: true,
        port: 8084,
        disableHostCheck: true
    }
}