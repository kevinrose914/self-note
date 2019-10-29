## vue实例的生命周期
1. 初始化阶段[new Vue() -> (初始化events、lifecycle)beforeCreate -> (inject、响应式构建)created]
2. 模板编译阶段[el -> 模板 -> render函数]
3. 挂载阶段[beforeMount -> (执行render函数))mounted -> beforeUpdate -> updated]
4. 卸载阶段[beforeDestory -> destroyed]

### callHook的原理
```js
// 所有定义的钩子函数都会合并到$options中，这儿钩子为什么是数组呢？是因为在合并options的过程中做了处理
export function callHook (vm: Component, hook: string) {
  pushTarget()
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      try {
        handlers[i].call(vm)
      } catch (e) {
        handleError(e, vm, `${hook} hook`)
      }
    }
  }
  // ...
  popTarget()
}
// 合并的处理
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}
LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook //这儿返回的就是一个数组
})

// 为什么要返回数据呢？
// 是因为有可能在该组建内定义了一个created钩子函数。但是在全局又通过Vue.mixin也定义了created钩子函数。要同时触发这两个回调，就需要用数组封装，循环调用
```

### 初始化事件
vue组件实例化时，初始化事件的作用是将父组件在模板中用v-on注册的事件添加到该组件的事件系统中
```js
// _init中
initEvents(vm)

export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // 父组件用v-on注册的事件
  const listeners = vm.$options._parentListeners
  if (listeners) {
    updateComponentListeners(vm, listeners)
  }
}

export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm
  // 比对正在实例化的组件的事件系统
  // 如果listeners中有，oldListeners无，代表新增事件
  // 如果listeners和oldListeners均有，则代表更新，更新事件的回调
  // 如果listeners无，oldListeners有，代表删除事件
  // 事件的新增和删除，通过$on,$remove进行
  updateListeners(listeners, oldListeners || {}, add, remove, vm)
  target = undefined
}
```
vue模板中支持事件修饰符,在模板编译阶段，会将修饰符修改成对应的符号放到事件名称前面，最后通过updateListeners方法中的normalizeEvent方法进行解析
```html
<child-component v-on:update.once="xxx"></child-component>
```
```js
const normalizeEvent = cached((name: string): {
  name: string,
  once: boolean,
  capture: boolean,
  passive: boolean,
  handler?: Function,
  params?: Array<any>
} => {
  const passive = name.charAt(0) === '&'
  name = passive ? name.slice(1) : name
  const once = name.charAt(0) === '~' // Prefixed last, checked first
  name = once ? name.slice(1) : name
  const capture = name.charAt(0) === '!'
  name = capture ? name.slice(1) : name
  return {
    name,
    once,
    capture,
    passive
  }
})
```

### 初始化computed
计算属性的返回值是否发生变化，是结合Watcher的dirty属性来分辨的
初始化：先争对每个计算属性new一个watcher，new这个watcher的过程中，会读取计算属性所依赖的数据，并收集数据的Dep。此后，每当数据变化都会通知这个watcher
再将computed对象里面的属性通过Object.defineProperty(vm, key, object)的形式与组件关联，其中object里面的get函数里面首先判断dirty，再执行watcher.depend（将计算属性的全部依赖deps循环添加到Dep.target中，Dep.target实际应该是组件的watcher，因为只有在组件渲染的时候new了一个组件的watcher，然后才会读取计算属性，调用计算属性的get函数），这一步的作用就是为了以后计算属性所依赖的数据发生变化时，会通知组件重新渲染。
综上所诉：计算属性所依赖的数据发生变化时，会通知计算属性的watcher以及组件的watcher。
```js
function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}
```