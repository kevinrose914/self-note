### 1.利用vue.use注册vue-router
> vue.use(router)其实就是调用了router的install方法,传入vue构造函数
```js
// install function code
export function install (Vue) {
  // 1.如果已经注册，return
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue

  const isDef = v => v !== undefined

  // 注册router-view以来的那个vue实例到当前路由的instances属性中
  const registerInstance = (vm, callVal) => {
    // i如果存在，说明vm是自定义组件
    let i = vm.$options._parentVnode
    // 在_parentVnode中有data属性，data属性中有registerRouteInstance属性，则执行registerRouteInstance
    // 具有这个registerRouteInstance属性的，其实就是router-view对应的那个组件
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  // 扩展vue的beforeCreate以及destroyed钩子函数
  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) { // 如果当前vue组件的options中具有router实例，也就是vue入口实例
        // _routerRoot就是为了保存入口vue实例，以便子vue实例能够通过这个实例获得路由属性，获得的方式就是下面那个代理
        this._routerRoot = this
        // 将router实例赋值给当前vue组件实例的_router属性
        this._router = this.$options.router
        // 执行router实例的init方法，入参为当前vue组件实例
        this._router.init(this)
        // 让当前vue组件实例的具有_route属性，属性值为router实例的history.current，并将其构建依赖追踪
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else { // 如果当前vue组件的options中没有router实例，其实就是子vue实例或者自定义组件
        // 这里其实就是一层一层的构建来的，深层的子vue实例，也可以获得入口vue实例
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      // 看看当前实例是否是router-view依赖的组件，如果是则向当前路由route.instances中追加这个实例
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  /**
   * 这儿为啥要代理，原因就是，只有入口vue实例的$options才有router属性。也就是说，上面那个beforeCreate函数里面
   * isDef(this.$options.router)内部的代码只有入口vue实例才会去执行，其他vue实例都不得执行
   * 这儿代理后，就可以让其他vue实例也能获得_router,_route属性
   */
  // 代理一下，然后vue实例中就可以通过this.$router去访问this._routerRoot._router的属性
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  // 代理一下，然后vue实例中就可以通过this.$route去访问this._routerRoot._route的属性
  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  // 注册两个与路由相关的自定义组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  // 合并策略
  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```

### 2.new router(options)
> 传入路由配置，实例化router
> 在router构造函数中，执行this.matcher = createMatcher(options.routes || [], false)。执行后this.matcher = {match: fucntion, addRoutes: function}
> 继续在router构造函数中，根据options.mode来实例化对应的路由模式，并把实例赋值给this.history

### 3.入口vue实例化
> 由于在install函数中，有对vue实例的beforeCreate钩子函数进行了扩展。且入口vue组件传入了router属性，属性值为router的实例。故在beforeCreate函数中，需要执行this._router.init(this)，也就是router的init方法

### router.init(app)
> router中首先保存当前入口vue实例
> 为这个vue实例绑定一个destroyed事件，事件触发后，从router中移除保存的vue实例
> 执行this.history.transitionTo方法，去更新this.history.current的值
> 更新后，再把这个this.history.current的值，赋给vue根实例的_route属性