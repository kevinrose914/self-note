## vue源码架构设计

跨平台代码：
第一层：web、weex的平台入口
第二层：服务端渲染、编译器
第三层：web特有的内容、weex特有的内容

核心代码：
第一层：全局API，vue.use、vue.delete...
第二层：prototype扩展
第三层：vue构造函数

公共代码：

vue编译后的版本：
完整版：构建后的文件包含编译器和运行时
运行时：负责创建vue实例
编译器：将模板编译成render函数
注意：当使用vue-loader或者vueify处理.vue文件时，最终打包后的文件不需要编译器

## 公共API

### $set, $delete, $watch

### $on, $once, $off, $emit
$on: 将回调函数收集起来后，循环通知

### $mount, $forceUpdate, $nextTick, $destroy
$forceUpdate: 强制实例重新生成vnode
$nextTick: 将回调函数延迟到下一次dom更新周期之后执行
vue的异步更新队列：vue将收到通知的watcher添加到队列中缓存起来，在添加之前检查是否已经添加。然后在下一次事件循环中，vue让队列中的watcher触发渲染并清空队列，这样保证同一个事件循环中，即使有多个状态改变，也只触发一次渲染。
事件循环：js是单线程非阻塞的语言。单线程意味着只有一个主线程处理所有任务，非阻塞指代码需要处理异步任务时，主线程会挂起这个异步任务，直到这个任务完成时，主线程再根据一定规则去执行回调函数。这个规则就是，当任务完成时，js会将回调函数加入到事件队列中，事件队列中的事件不会立即执行，而是等待执行栈中的所有任务执行完毕以后，主线程才去查找事件队列中是否有任务。
异步任务两种类型：微任务、宏任务。微任务优先级高于宏任务
微任务：promise、mutationObserver、Object.observer、process.nextTick
宏任务：setTimeout、setInterval、setImmediate、MessageChannel、requestAnimationFrame

### Vue.extend(), Vue.directive(), Vue.filter(), Vue.component(), Vue.use(), Vue.mixin()
```js
// Vue.extend()
// 使用基础Vue的构造函数创建一个子类，该方法返回一个继承于Vue的构造函数

// Vue.directive()
// 注册指令，只是注册，不是使用
// 保存到Vue.options.directives[指令名称]

// Vue.filter()
// 注册过滤器，只是注册，不是使用
// 保存到Vue.options.filters[过滤器名称]

// Vue.component()
// 注册组件
// 使用vue.extend()将组件继承于vue，生成构造函数
// 将生成的构造函数保存到Vue.options.comopnents[组件名称]

// Vue.use()
// 注册插件
// 传入对象或者函数，若是对象则必须拥有install属性
// 保存到vue._installedPlugins中

// Vue.mixin()
// 注册全局混入，注册后，会影响所有的vue实例
```