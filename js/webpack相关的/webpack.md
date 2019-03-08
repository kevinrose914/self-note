# extract-text-webpack-plugin: 将css从js中分离出来
# mini-css-extract-plugin: 将css从js中分离出来，但是比上面那个好用
```mini-css-extract-plugin```较```extract-text-webpack-plugin```的优势：
> 异步加载
> 没有重复编译(性能)
> 用起来更方便
> 专门争对css
> 为每个js文件创建一个css文件
> 注意：webpack v4 以上， 不能使用```extract-text-webpack-plugin```来处理css
> 疑问：在这个webpack配置中增加```mini-css-extract-plugin```,会报错tap undefined。不知为何

```style-loader```和```extract-text-webpack-plugin```的区别:
> 如果只是用了style-loader，那么css会打包到js中，打开页面会看到，css会被style标签包裹放到head中
> 如果用了extract-text-webpack-plugin，那么css就会与js独立开，并且，打开页面会看到，css以link的形式存在于head中

```mini-css-extract-plugin```配合```splitChunks```使用:
```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
module.exports = {
    entry: {},
    output: {},
    module: {
        rules: [
            {
                test: /\.(le|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'less-loader'
                ]
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                styles: { // 将所有的css单独抽离出来成一个文件
                    name: 'styles',
                    test: /\.(le|c)ss/,
                    chunks: 'all',
                    enforce: true // 不管splitChunks那些属性（minSize,minChunks...），强行合并成一个包
                }
            }
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ]
}
```

# optimize-css-assets-webpack-plugin：压缩css文件
```js
optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({}) // 这儿写了后，一定要指定js的压缩，因为这儿是覆盖了默认的minimizer
    ]
}
```

# uglifyjs-webpack-plugin: 这个插件只有在mode为production下，才生效
```js
optimizaion: {
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
}
```

# eslint：npm安装eslint, eslint-loader, babel-eslint, eslint-plugin-import, eslint-friendly-formatter等
# babel: npm安装@babel/core, @babel/preset-env, @babel/runtime, babel-loader, @babel/plugin-transform-runtime,@babel/polyfill等

```@babel/runtime```：在使用新的es6方法时，自动调用babel-runtime俩民的内置函数来进行替换

```@babel/polyfill```与```@babel/plugin-transform-runtime```的区别：
> 两个都是可以将js新语法中的全局变量或者原生方法转成es5类型
> ```@babel/plugin-transform-runtime```不会污染全局变量，多次使用只打包一次，依赖按需引入，但不支持实例方法，一般用于第三方开发
> ```@babel/polyfill```会污染全局变量，因为他是通过改写全局prototype的方式实现，适合独立的项目