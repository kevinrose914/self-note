// Vue.set
export function set (target: Array<any> | Object, key: any, val: any): any {
    // 1.边界容错处理
    if (process.env.NODE_ENV !== 'production' &&
      (isUndef(target) || isPrimitive(target))
    ) {
      warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
    }
    // 2.如果target是数组，且key是正确的数组下标
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      // 2.1改变数组长度
      target.length = Math.max(target.length, key)
      // 2.2通过splice赋值，这儿由于数组的默认方法已被拦截，故可以提醒试图进行刷新
      target.splice(key, 1, val)
      // 2.3返回val
      return val
    }
    // 3.如果target是对象，且key是target的实例属性，并非原型属性
    if (key in target && !(key in Object.prototype)) {
      // 3.1赋值，这儿由于setter函数的缘故，也会提醒试图更新
      target[key] = val
      // 3.2返回val
      return val
    }
    // 4.获取target的__ob__属性值
    const ob = (target: any).__ob__
    // 5.如果target是Vue实例，且是Vue跟组件，直接警告
    if (target._isVue || (ob && ob.vmCount)) {
      process.env.NODE_ENV !== 'production' && warn(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
        'at runtime - declare it upfront in the data option.'
      )
      return val
    }
    // 6.如果ob不存在，说明target不是响应式数据，故直接进行赋值操作
    if (!ob) {
      target[key] = val
      return val
    }
    // 7.如果taget中没有key属性，将这个key构建响应式
    defineReactive(ob.value, key, val)
    // 8.通知视图更新
    ob.dep.notify()
    // 9.返回val
    return val
}


// Vue.del
export function del (target: Array<any> | Object, key: any) {
    // 1.边界容错处理
    if (process.env.NODE_ENV !== 'production' &&
      (isUndef(target) || isPrimitive(target))
    ) {
      warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
    }
    // 2.数组类型，直接调用splice删除，由于splice方法已被拦截，故可以更新视图
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.splice(key, 1)
      return
    }
    const ob = (target: any).__ob__
    // 3.如果target是Vue实例，且是根组件，警告
    if (target._isVue || (ob && ob.vmCount)) {
      process.env.NODE_ENV !== 'production' && warn(
        'Avoid deleting properties on a Vue instance or its root $data ' +
        '- just set it to null.'
      )
      return
    }
    // 如果key不在target的属性中，直接返回
    if (!hasOwn(target, key)) {
      return
    }
    // 执行删除
    delete target[key]
    // 如果ob不存在，说明不是响应式数据，不用管
    if (!ob) {
      return
    }
    // 否则就要通知视图进行更新
    ob.dep.notify()
}