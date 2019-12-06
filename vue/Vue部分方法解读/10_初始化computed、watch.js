/**
 * computed: 根据某一个或多个实例的具有响应式的值，返回一个新的值
 * watch：观察实例的某个响应式的值，值变化后，出发回调函数
 */

 // 1.initComputed函数
 // 其拿到computed里面各个值得getter函数，去new新的Watcher，
 function initComputed (vm: Component, computed: Object) {
    // $flow-disable-line
    // 1.看样子与computed相关的，都放到了_computedWatchers属性里面了？
    const watchers = vm._computedWatchers = Object.create(null)
    // computed properties are just getters during SSR
    // 2.ssr服务端渲染暂时不考虑
    const isSSR = isServerRendering()
  
    // 3.for-in循环拿出各个computed
    for (const key in computed) {
      // 3.1当前循环computed的值，赋给userDef
      const userDef = computed[key]
      // 3.2获取getter函数。如果userDef是函数，则直接作为getter函数。否则要拿到userDef.get属性
      const getter = typeof userDef === 'function' ? userDef : userDef.get
      // 3.3如果getter函数没有，直接警告
      if (process.env.NODE_ENV !== 'production' && getter == null) {
        warn(
          `Getter is missing for computed property "${key}".`,
          vm
        )
      }
  
      // 3.4如果不是SSR渲染
      if (!isSSR) {
        // create internal watcher for the computed property.
        // 3.4.1直接_computedWatchers中存放键为当前key，值为watcher的数据
        // computedWatcherOptions = {lazy:true}
        // lazy为true意思是不会立刻获取这个computed得值
        // 等到真正去getter的时候再获取值
        watchers[key] = new Watcher(
          vm,
          getter || noop,
          noop,
          computedWatcherOptions
        )
      }
  
      // component-defined computed properties are already defined on the
      // component prototype. We only need to define computed properties defined
      // at instantiation here.
      // 3.4如果当前computed的key不是当前实例的属性时
      if (!(key in vm)) {
        // 3.5 将key绑定到实例上，并包装其setter、getter函数
        defineComputed(vm, key, userDef)
      } else if (process.env.NODE_ENV !== 'production') {
        // 3.6容错处理，避免computed的key与data或者props里面的属性重复
        if (key in vm.$data) {
          warn(`The computed property "${key}" is already defined in data.`, vm)
        } else if (vm.$options.props && key in vm.$options.props) {
          warn(`The computed property "${key}" is already defined as a prop.`, vm)
        }
      }
    }
}
// 这个函数包装computed属性得getter或者setter函数
export function defineComputed (
    target: any, // 当前实例
    key: string, // computed的key
    userDef: Object | Function // computed的值
  ) {
    // 1.如果不是SSR渲染，shouldCache就是为true
    const shouldCache = !isServerRendering()
    // 2.设置当前key的setter、getter函数
    // createComputedGetter函数就是把getter函数重写一遍，便于收集依赖
    if (typeof userDef === 'function') {
      sharedPropertyDefinition.get = shouldCache
        ? createComputedGetter(key)
        : userDef
      sharedPropertyDefinition.set = noop
    } else {
      sharedPropertyDefinition.get = userDef.get
        ? shouldCache && userDef.cache !== false
          ? createComputedGetter(key)
          : userDef.get
        : noop
      sharedPropertyDefinition.set = userDef.set
        ? userDef.set
        : noop
    }
    if (process.env.NODE_ENV !== 'production' &&
        sharedPropertyDefinition.set === noop) {
      sharedPropertyDefinition.set = function () {
        warn(
          `Computed property "${key}" was assigned to but it has no setter.`,
          this
        )
      }
    }
    // 将当前的key设置给当前实例
    Object.defineProperty(target, key, sharedPropertyDefinition)
}
// 这个函数就是具体包装cumputed得getter函数得
// 包装后得函数，在实例中获取computed属性时，会触发watcher得get方法，get方法又会触发响应式数据得getter函数
// 响应式数据得getter函数中，就回去收集这个watcher，以便以后数据便后，通知watcher更新
function createComputedGetter (key) {
    return function computedGetter () {
      // 按key拿到当前的watcher
      const watcher = this._computedWatchers && this._computedWatchers[key]
      if (watcher) {
        if (watcher.dirty) {
          // 执行取值操作，让取值过程中的dep收集当前的watcher
          watcher.evaluate()
        }
        // 取值完后，如果Dep.target还存在，则让这个与这个watcher相关的dep再去收集此时的Dep.target
        // 这儿不清楚为啥还要去收集？
        if (Dep.target) {
          watcher.depend()
        }
        // 返回取出来的值
        return watcher.value
      }
    }
}


// 2.initWatch
function initWatch (vm: Component, watch: Object) {
    // 1.遍历当前实例的watch属性
    for (const key in watch) {
      // 1.1拿到循环的watch子属性值
      const handler = watch[key]
      // 1.2如果这玩意儿是数组
      if (Array.isArray(handler)) {
        // 1.2.1循环这个数组，去创建watcher
        for (let i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i])
        }
      } else {
        // 1.2.2否则是直接通过这个玩意儿创建watcher
        createWatcher(vm, key, handler)
      }
    }
}
// 创建watcher
function createWatcher (
    vm: Component, // 当前实例
    expOrFn: string | Function, // 可以是字符串，也可以是函数，当在watch中使用时，就是一个字符串，eg:'name'，'person.name'
    handler: any, // 回调函数
    options?: Object // 额外配置
  ) {
    // 当前函数参数的更替
    if (isPlainObject(handler)) {
      options = handler
      handler = handler.handler
    }
    // 如果handler是一个字符串，则通过这个字符串去当前实例中寻找名为这个字符串的函数
    if (typeof handler === 'string') {
      handler = vm[handler]
    }
    // 绑定watcher
    return vm.$watch(expOrFn, handler, options)
}
// $watch
Vue.prototype.$watch = function (
    expOrFn: string | Function, // 可以是取值，也可以是函数
    cb: any, // 回调函数
    options?: Object // 其他配置
  ): Function {
    const vm: Component = this
    // cb是对象的时候，要去把函数参数矫正
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    // 这个user有啥用，暂时不知道
    options.user = true
    // 创建watcher
    // 同时让依赖收集这个watcher，原理同上面得computedwatcher
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) { // 是否立即要获取值
      cb.call(vm, watcher.value)
    }
    // 返回一个可以移除一个watcher的函数
    return function unwatchFn () {
      watcher.teardown()
    }
}