module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    ["component", { // 组建的按需加载
      "libraryName": "mint-ui",
      "style": true
    }, "mint-ui"]
  ]
}
