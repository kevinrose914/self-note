// 在Vue实例内部，可以实例化其他component组件
// 在Vue源码中，Vue实例可以用一个listeners属性去接收并处理这个component组件向外$emit的事件
// 虽然listeners属性是挂在到Vue实例上的，但是其事件最终是绑定到component组件上的
// 这儿对listeners在component组件内部的绑定做一个分析

// 1.首先在内部组件实例化时，也就是调用Vue.prototype._init函数时, 会有下面一个判断，推测应该就是判断是否为内部组件
if (options && options._isComponent) {
    // 4.1如果当前有传入_isComponent属性值
    // 推测是，此时的实例是一个内部组件
    initInternalComponent(vm, options)
}

// 2.如果是内部组件，就会把其父实例的listeners取出来，赋值给当前内部组件
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
    // 1.继承Vue构造函数上的options属性
    const opts = vm.$options = Object.create(vm.constructor.options)
    // doing this because it's faster than dynamic enumeration.
    // 2.做这个是因为它比动态枚举更快？
    const parentVnode = options._parentVnode
    opts.parent = options.parent
    opts._parentVnode = parentVnode
    // 省略代码xxx
    const vnodeComponentOptions = parentVnode.componentOptions
    opts._parentListeners = vnodeComponentOptions.listeners
    // 省略代码xxx
}

// 3.取出来后，对当前内部组件实例进行initEvents
export function initEvents (vm: Component) {
    // 1.初始化_events属性，其是一个没有原型的对象
    vm._events = Object.create(null)
    // 2._hasHookEvent：是否有周期钩子事件，初始化为false
    vm._hasHookEvent = false
    // init parent attached events
    // 3._parentListeners应该是针对内部组件，如果实例化的是内部组件，则需要获取其父实例的listeners
    const listeners = vm.$options._parentListeners
    // 4.如果listeners存在
    if (listeners) {
      updateComponentListeners(vm, listeners)
    }
}

// 4.在判断有listeners后，执行listeners的绑定
export function updateComponentListeners (
    vm: Component,
    listeners: Object,
    oldListeners: ?Object
) {
    // 保存当前实例化的内部组件
    target = vm
    // 更新父实例的listeners操作，并对当前实例化的内部组件，将listeners相应的事件绑定到内部组件上
    // 这儿的add, remove, 分别对应($once, $on), $off，下面会说这三个方法
    updateListeners(listeners, oldListeners || {}, add, remove, vm)
    target = undefined
}
function add (event, fn, once) {
    if (once) {
      target.$once(event, fn)
    } else {
      target.$on(event, fn)
    }
  }
  
// 移除事件
function remove (event, fn) {
    target.$off(event, fn)
}
export function updateListeners (
    on: Object, // 父实例的listeners
    oldOn: Object, // 旧的listeners
    add: Function,
    remove: Function,
    vm: Component // 当前实例化的内部组件
) {
    let name, def, cur, old, event
    // 1.for-in获取父实例传入内部组件的各个listener
    for (name in on) {
      // 1.1推测应该是获取listener的响应函数
      def = cur = on[name]
      // 1.2推测是获取旧的响应函数
      old = oldOn[name]
      // 1.3normalizeEvent缓存事件的相关配置：name, once, capture, passive
      event = normalizeEvent(name)
      /* istanbul ignore if */
      if (__WEEX__ && isPlainObject(def)) {
        cur = def.handler
        event.params = def.params
      }
      // 1.4容错判断：如果没有响应函数，警告
      if (isUndef(cur)) {
        process.env.NODE_ENV !== 'production' && warn(
          `Invalid handler for event "${event.name}": got ` + String(cur),
          vm
        )
      } else if (isUndef(old)) { // 1.5如果旧的响应函数没有
        if (isUndef(cur.fns)) { // 1.6并且新的不具备fns属性时
          // 1.7将响应函数包装了一下，重新赋值给cur，此时cur就具备了fns属性，属性值就为当前响应函数，或者响应函数数组
          cur = on[name] = createFnInvoker(cur)
        }
        // 为当前实例化的内部组件绑定上这个事件
        add(event.name, cur, event.once, event.capture, event.passive, event.params)
      } else if (cur !== old) { // 1.8如果旧的也有，且旧的响应函数不等于新的
        old.fns = cur // 1.9将旧的fns替换成新的响应函数
        on[name] = old // 1.10把改变后的重新赋值给父实例的listener
      }
    }
    // 2.0for-in循环父实例的旧listeners
    // 这儿其实就是把之前旧的事件，但是新的没有这个事件，就删掉
    for (name in oldOn) {
      // 2.1如果父实例新的listeners中不包含有旧的某个listener
      if (isUndef(on[name])) {
        // 2.2先把其之前缓存的事件配置找出来
        event = normalizeEvent(name)
        // 2.3找出来后，根据配置，直接remove掉
        remove(event.name, oldOn[name], event.capture)
      }
    }
}

// 5.注意一下上面函数内部的createFnInvoker方法，其就是将事件处理函数包装了一下，便于处理多个事件
export function createFnInvoker (fns: Function | Array<Function>): Function {
    function invoker () {
      // 1.拿到响应函数，赋值给fns变量
      const fns = invoker.fns
      // 2.如果这玩意儿是一个数组
      if (Array.isArray(fns)) {
        // 2.1循环遍历，挨个执行
        const cloned = fns.slice()
        for (let i = 0; i < cloned.length; i++) {
          cloned[i].apply(null, arguments)
        }
      } else {
        // return handler return value for single handlers
        // 2.2否则单独运行，且返回其运行值
        return fns.apply(null, arguments)
      }
    }
    invoker.fns = fns
    return invoker
}

// 6. Vue.prototype.$on为实例绑定内部事件
Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    const vm: Component = this
    // 1.如果event是数组，循环遍历，挨个绑定上fn
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.$on(event[i], fn)
      }
    } else {
      // 否则，给实例的_events属性追加上当前事件
      (vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      // 判断hi是否为hook事件，如果是，更改实例的_hasHookEvent属性值为true
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
}

// 7.Vue.prototype.$once
Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    // 这里巧妙地将fn方法包装了一层，以到达once的效果
    function on () {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    // 将包装后的fn，重新用$on绑定到内部组件实例上
    vm.$on(event, on)
    return vm
}

// 8.Vue.prototype.$off解绑事件
Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
    const vm: Component = this
    // 1.如果没有传入任何参数，直接把该实例内部所有事件清空
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // 2.event为数组时，循环递归执行
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.$off(event[i], fn)
      }
      return vm
    }
    // 3.获得当前实例下的event对应的响应函数
    const cbs = vm._events[event]
    // 4.如果没有响应函数，直接return
    if (!cbs) {
      return vm
    }
    // 5.如果fn不存在，则清空vm._events[event]
    if (!fn) {
      vm._events[event] = null
      return vm
    }
    // 6.如果fn存在，循环删除
    if (fn) {
      // specific handler
      let cb
      let i = cbs.length
      while (i--) {
        cb = cbs[i]
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1)
          break
        }
      }
    }
    return vm
}

// 9.Vue.prototype.$emit内部组件向父实例抛出事件
Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    // 1.容错处理
    if (process.env.NODE_ENV !== 'production') {
      const lowerCaseEvent = event.toLowerCase()
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
        )
      }
    }
    // 2.获取到当前内部组件中_events属性里面对应的event下面的值
    let cbs = vm._events[event]
    // 3.如果有值
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      // 把emit的数据取出来
      const args = toArray(arguments, 1)
      // 挨个执行相应的函数
      for (let i = 0, l = cbs.length; i < l; i++) {
        try {
          cbs[i].apply(vm, args)
        } catch (e) {
          handleError(e, vm, `event handler for "${event}"`)
        }
      }
    }
    return vm
}