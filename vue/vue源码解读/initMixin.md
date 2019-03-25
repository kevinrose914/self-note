# initMixin源码解读(定义Vue.prototype._init = function(){})
```js
let uid = 0
export function initMixin (Vue: Class<Component>) {
    // options: data, render, mixin, props, watch, methods, computed, components, name, 生命周期钩子函数// abstract...
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // 为组建创建唯一标识
    vm._uid = uid++

    // 似乎是与检查性能有关系？
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed 避免被观察？？
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // 优化内部组件实例化，因为动态选项合并非常缓慢，并且没有内部组件选项需要特殊处理。
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        // 解析vue构造器上的属性
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化组建层架关系
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
// vue.constructor = {
//     cid?
//     options?
//     super? 就是vue
//     superOptions? 父级的属性
//     extendOptions? 扩展属性
//     sealedOptions? 自己备份的属性
//     extend?
//     mixin?
//     use?
// }
// 解析vue构造器上的属性
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) { // 判断是否是vue的子类，这个可以参考vue.extend函数里面的封装，现在还不清楚怎么运行的
    const superOptions = resolveConstructorOptions(Ctor.super) // 获取父级属性
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) { 
      // super option changed,
      // need to resolve new options.
      // 比较父级属性有没有发生变化，比如extend，mixin这些扩展造成父级变化
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      // 将该组件的属性与其最开始的备份属性进行比较
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions) // 合并到extendOptions
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}
// 将组件的属性与其最开始的备份属性进行比较，返回变化了的
function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options // 现在的属性
  const extended = Ctor.extendOptions // 扩展属性
  const sealed = Ctor.sealedOptions // Ctor构造初始备份的属性
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = dedupe(latest[key], extended[key], sealed[key])
    }
  }
  return modified
}

function dedupe (latest, extended, sealed) {
  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
  // 比较现在的和以前保存的，以确保不会重复合并生命周期钩子
  if (Array.isArray(latest)) {
    const res = []
    sealed = Array.isArray(sealed) ? sealed : [sealed]
    extended = Array.isArray(extended) ? extended : [extended]
    for (let i = 0; i < latest.length; i++) {
      // push original options and not sealed options to exclude duplicated options
      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i])
      }
    }
    return res
  } else {
    return latest
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
export function mergeOptions (
  parent: Object, 
  child: Object,
  vm?: Component
): Object {
    // 校验组建名称
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

 //将所有props选项的语法规范成对象的格式
  normalizeProps(child, vm)
  //将所有inject选项的语法规范成对象的格式
  normalizeInject(child, vm)
  //将所有directive选项的语法规范成对象的格式
  normalizeDirectives(child)
  const extendsFrom = child.extends
  if (extendsFrom) {
      // 如果有继承，合并到parent
    parent = mergeOptions(parent, extendsFrom, vm)
  }
  if (child.mixins) {
      // 如果有mixins，合并到parent
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 * 将所有props选项的语法规范成对象的格式
 */
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}

/**
 * Default strategy.
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal
}
```