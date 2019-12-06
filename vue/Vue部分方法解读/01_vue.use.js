/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 如果插件存在，则不添加
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // toArray: 将类数组转成数组
    // arguments从下标1后面保存为数组
    const args = toArray(arguments, 1)
    // 数组头部追加Vue构造函数
    args.unshift(this)
    // 判断plugin.install后，执行扩展
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    // 将插件追加到Vue._installedPlugins上面
    installedPlugins.push(plugin)
    return this
  }
}
