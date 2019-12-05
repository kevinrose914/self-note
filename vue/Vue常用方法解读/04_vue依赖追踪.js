// defineReactive
// Dep, Observer, Watcher

/**
 * Dep: 每一个需要响应式的、且是引用类型的数据，都具有一个dep
 * dep用于收集代码执行时的watcher。每当数据发生变化时，提醒各个watcher执行试图更新操作
 * 在数据getter函数中收集watcher，尤其注意数组类型的收集，其需要遍历递归，查找拥有dep属性的值，每个dep都要收集watcher
 * 在数据setter函数中通知watcher进行更新，如果setter函数生成的新value是引用类型，也需要进行响应式
 */

/**
 * Observer：相当于拦截器，针对object和array两种类型数据分别处理响应式
 * object类型，for-in循环遍历，依次将值进行响应式
 * array类型：首先把数组默认的几种方法给拦截下来，进行重写，在方法中增加对新插入的数据的响应式，以及提醒试图更新的操作
 */

/**
 * Watcher: 暂时理解为做视图更新操作
 */

  import Dep from './dep'
  import VNode from '../vdom/vnode'
  import { arrayMethods } from './array'
  import {
    def,
    warn,
    hasOwn,
    hasProto,
    isObject,
    isPlainObject,
    isPrimitive,
    isUndef,
    isValidArrayIndex,
    isServerRendering
  } from '../util/index'
  
  const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
  
  /**
   * In some cases we may want to disable observation inside a component's
   * update computation.
   */
  export let shouldObserve: boolean = true
  
  export function toggleObserving (value: boolean) {
    shouldObserve = value
  }
  
  /**
   * Observer class that is attached to each observed
   * object. Once attached, the observer converts the target
   * object's property keys into getter/setters that
   * collect dependencies and dispatch updates.
   */
  export class Observer {
    value: any;
    dep: Dep;
    vmCount: number; // number of vms that has this object as root $data
  
    constructor (value: any) {
      this.value = value
      this.dep = new Dep()
      this.vmCount = 0
      // 给value增加__ob__属性，属性值为当前Observer实例
      def(value, '__ob__', this)
      if (Array.isArray(value)) {
        // value是数组时
        // 把拦截好的数据方法，这里有两种方式把这些方法增加到value的属性上
        const augment = hasProto
          ? protoAugment
          : copyAugment
        // 把拦截好的数组方法增加到value的属性上，让value具有那些方法
        augment(value, arrayMethods, arrayKeys)
        this.observeArray(value)
      } else {
        // value是对象时
        this.walk(value)
      }
    }
  
    /**
     * Walk through each property and convert them into
     * getter/setters. This method should only be called when
     * value type is Object.
     */
    walk (obj: Object) {
      const keys = Object.keys(obj)
      // 循环取值，挨个去响应式
      for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i])
      }
    }
  
    /**
     * Observe a list of Array items.
     */
    observeArray (items: Array<any>) {
      // 循环遍历，再次执行observer
      for (let i = 0, l = items.length; i < l; i++) {
        observe(items[i])
      }
    }
  }
  
  // helpers
  
  /**
   * Augment an target Object or Array by intercepting
   * the prototype chain using __proto__
   */
  function protoAugment (target, src: Object, keys: any) {
    /* eslint-disable no-proto */
    target.__proto__ = src
    /* eslint-enable no-proto */
  }
  
  /**
   * Augment an target Object or Array by defining
   * hidden properties.
   */
  /* istanbul ignore next */
  function copyAugment (target: Object, src: Object, keys: Array<string>) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i]
      def(target, key, src[key])
    }
  }
  
  /**
   * Attempt to create an observer instance for a value,
   * returns the new observer if successfully observed,
   * or the existing observer if the value already has one.
   */
  export function observe (value: any, asRootData: ?boolean): Observer | void {
    // 如果value不是引用类型的数据，或者value时VNode的实例，直接return
    if (!isObject(value) || value instanceof VNode) {
      return
    }
    let ob: Observer | void
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      // 如果value拥有__ob__属性，且属性值是Observer的实例，直接赋值给ob
      ob = value.__ob__
    } else if (
      shouldObserve &&
      !isServerRendering() &&
      (Array.isArray(value) || isPlainObject(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
    ) {
      // new一个Observer实例出来，赋值给ob
      ob = new Observer(value)
    }
    // asRootData暂时不知道有啥作用
    if (asRootData && ob) {
      ob.vmCount++
    }
    // 返回ob
    return ob
  }
  
  /**
   * Define a reactive property on an Object.
   * 定义一个响应式属性到一个对象上
   */
  export function defineReactive (
    obj: Object,
    key: string,
    val: any,
    customSetter?: ?Function,
    shallow?: boolean // 浅：推测意思是否需要深度响应式
  ) {
    // 1.实例化dep
    const dep = new Dep()
  
    // 2.获取key在obj里的属性（数据属性后者访问器属性）
    const property = Object.getOwnPropertyDescriptor(obj, key)
    // 3.如果key在obj中不能被delete，不能更改属性类型，则return
    if (property && property.configurable === false) {
      return
    }
  
    // cater for pre-defined getter/setters
    // 4.将key属性的get函数赋值给getter变量
    const getter = property && property.get
    // 5.如果getter函数不存在，则直接把key对应的值赋值给val
    if (!getter && arguments.length === 2) {
      val = obj[key]
    }
    // 6.将key属性对应的set函数赋值给setter变量
    const setter = property && property.set
  
    // 7.对val进行响应式处理，返回val的dep
    let childOb = !shallow && observe(val)
    // 8.开始进行响应式处理
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        const value = getter ? getter.call(obj) : val
        // 8.1判断当前Watcher是否存在
        if (Dep.target) {
          // 8.1.1如果watcher存在，让当前dep收集当前watcher
          dep.depend()
          // 8.1.2如果子dep存在
          if (childOb) {
            // 8.1.2.1当前子dep收集当前watcher
            childOb.dep.depend()
            // 8.1.2.2如果value时数组，则循环去除数组元素，将具有dep的，让其dep收集当前watcher，以便以后试图更新
            if (Array.isArray(value)) {
              dependArray(value)
            }
          }
        }
        // 8.2返回值
        return value
      },
      set: function reactiveSetter (newVal) {
        const value = getter ? getter.call(obj) : val
        /* eslint-disable no-self-compare */
        // 对比value，没有变化，直接return
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        /* eslint-enable no-self-compare */
        // customSetter，暂时不知道有什么用
        if (process.env.NODE_ENV !== 'production' && customSetter) {
          customSetter()
        }
        if (setter) { // 如果setter存在，直接调用setter函数进行赋值
          setter.call(obj, newVal)
        } else { // 否则直接赋值
          val = newVal
        }
        // 如果是深入响应式，重新把value进行响应式，并将childob指针指向observe(newVal)
        childOb = !shallow && observe(newVal)
        // 通知当前dep收集的watcher执行更新操作
        dep.notify()
      }
    })
  }