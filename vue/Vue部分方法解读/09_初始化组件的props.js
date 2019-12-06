// 自定义组件的props有其type属性，也可以有default默认值
// props真正的值通过父实例在自定义组件的占位节点上传入
// 故首先需要获取占位节点上的props数据

// 1.获取占位节点上的props数据，赋值给当前组件实例的propsData属性
// 在initInternalComponent函数中
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
    // 1.继承Vue构造函数上的options属性
    const opts = vm.$options = Object.create(vm.constructor.options)
    // 2.做这个是因为它比动态枚举更快？
    const parentVnode = options._parentVnode // 这玩儿推测应该是，当前内部组件在父实例中的的占位vnode
    opts._parentVnode = parentVnode
  
    const vnodeComponentOptions = parentVnode.componentOptions
    opts.propsData = vnodeComponentOptions.propsData
    // ...
}

// 2.propsData拿到后，在Vue.prototype._init函数中调用initState(vm)函数
export function initState (vm: Component) {
    // 1.初始化_watchers属性值
    vm._watchers = []
    const opts = vm.$options
    // 2.初始化props
    if (opts.props) initProps(vm, opts.props)
    // ...
}

// 3.开始initProps
function initProps (vm: Component, propsOptions: Object) {
    // 1.propsData，对于自定义组件来说，propsData其实就是通过父实例去获得的
    // 可以在initInternalComponent函数内部观察到propsData的初始化
    const propsData = vm.$options.propsData || {}
    // 2.初始化实例的_props属性值
    const props = vm._props = {}
    // cache prop keys so that future props updates can iterate using Array
    // instead of dynamic object key enumeration.
    // 3.用于缓存props的键
    const keys = vm.$options._propKeys = []
    // 4.是否是根，推测意思是：是否是自定义组件，因为只有自定义组件才有$parent属性
    const isRoot = !vm.$parent
    // root instance props should be converted
    // 5.?
    if (!isRoot) {
      // 让shouldObserve变为false，但是false时，在observe的时候就不会去new Observer()
      // 这儿为什么要做这个处理？
      toggleObserving(false)
    }
    // 6.for-in遍历实例的props
    for (const key in propsOptions) {
      // 6.1保存各个props的key
      keys.push(key)
      // 6.2通过validateProp函数拿到prop的值
      const value = validateProp(key, propsOptions, propsData, vm)
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        //...
      } else {
        // 6.3构建浅度依赖追踪，因为value自身已经进行了observe了
        defineReactive(props, key, value)
      }
      // static props are already proxied on the component's prototype
      // during Vue.extend(). We only need to proxy props defined at
      // instantiation here.
      // 把当前key在实例中的访问，代理一下
      // eg: vm[key] === vm._props[key]
      if (!(key in vm)) {
        proxy(vm, `_props`, key)
      }
    }
    // 将shouldObserve置为true
    toggleObserving(true)
}
// 获取prop的值，返回给上面那个函数
export function validateProp (
    key: string, // props的键
    propOptions: Object, // 实例的props对象，包含键，值为一个对象{type:'',defautl:''}
    propsData: Object, // 通过父实例获取到的props键和其值组成的数据
    vm?: Component // 当前实例
  ): any {
    // 1.按key获取当前props的配置，保存到变量prop
    const prop = propOptions[key]
    // 2.判断key是否是propsData的属性，adsent为true时表示不是propsData的属性
    const absent = !hasOwn(propsData, key)
    // 3.获取propsData[key]的值，并赋值给value变量，这儿其实就是查看父实例有没有赋值
    let value = propsData[key]
    // boolean casting
    // props.type = 'Bool' | ['String', 'Bool']
    // 4.通过阅读getTypeIndex函数，推测这儿的意思是：看看prop.type是否是布尔值，如果不是布尔值，booleanIndex等于-1
    const booleanIndex = getTypeIndex(Boolean, prop.type)
    // 这个if语句主要是处理有props.type可以为布尔值的情况
    // 这儿多做的处理是要处理那种key和value相等的情况，eg: <component propA="propA"></component>
    if (booleanIndex > -1) { // 5.当前prop.type是布尔值
      if (absent && !hasOwn(prop, 'default')) { // 5.1如果propsData没有key，且当前prop没有default默认值
        // 5.2 直接赋值为false
        value = false
      } else if (value === '' || value === hyphenate(key)) { // 5.3如果value为空串，或者value等于hyphenate(key)
        // hyphenate函数是将驼峰字符串转成用-连接的字符串
        // only cast empty string / same name to boolean if
        // boolean has higher priority
        // 5.4如果stringIndex=-1，说明prop.type不是String类型
        const stringIndex = getTypeIndex(String, prop.type)
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          /**
           * 这儿应该是有这三种情况
           * 1. prop.type = 'bool'
           * 2. prop.type = ['bool', 'string']
           * 3. prop.type = ['string', 'bool']
           * 前两种情况走这个if区间，最后一种情况，说明value就直接可以为字符串，不需要转成布尔值
           * 第二种情况就是<component propA="propA"></component>这种的时候，prop.type = ['bool', 'string'],会转成布尔值
           */
          value = true
        }
      }
    }
    // check default value
    // 6.如果value不存在
    if (value === undefined) {
      // 6.1获得默认值，赋给value变量
      value = getPropDefaultValue(vm, prop, key)
      // since the default value is a fresh copy,
      // make sure to observe it.
      // 6.2因为这个value是最新的拷贝，需要observe它。这儿先保存上一次的shouldObserve值
      const prevShouldObserve = shouldObserve
      // 6.3再将shouldObserve设为true
      toggleObserving(true)
      // 6.4执行observe
      observe(value)
      // 6.5再把shouldObserve回复到保存的状态
      toggleObserving(prevShouldObserve)
    }
    // 7.断言这个prop是否有效
    if (
      process.env.NODE_ENV !== 'production' &&
      // skip validation for weex recycle-list child component props
      !(__WEEX__ && isObject(value) && ('@binding' in value))
    ) {
      assertProp(prop, key, value, vm, absent)
    }
    // 8.返回prop的值
    return value
}
// 通过prop的key获取其默认值
function getPropDefaultValue (vm: ?Component, prop: PropOptions, key: string): any {
    // 1.如果没有默认值，直接返回undefined
    if (!hasOwn(prop, 'default')) {
      return undefined
    }
    const def = prop.default
    // warn against non-factory defaults for Object & Array
    // 2.对于object和array来说，要用function来返回其默认值
    if (process.env.NODE_ENV !== 'production' && isObject(def)) {
      warn('xxx')
    }
    // the raw prop value was also undefined from previous render,
    // return previous default value to avoid unnecessary watcher trigger
    // 3.如果父实例没有定义prop的值，且当前实例的props已经存在其值（相当于就是重复prop了），则返回这个值
    if (vm && vm.$options.propsData &&
      vm.$options.propsData[key] === undefined &&
      vm._props[key] !== undefined
    ) {
      return vm._props[key]
    }
    // call factory function for non-Function types
    // a value is Function if its prototype is function even across different execution context
    // 4.区分default是否是函数类型，如果是，则需运行函数，返回函数的返回值。否则直接返回default的值
    return typeof def === 'function' && getType(prop.type) !== 'Function'
      ? def.call(vm)
      : def
}