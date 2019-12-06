/**
 * slots: 在父vue实例内部使用component自定义组件时，除了写出自定义组件的占位符以外
 * 还可以在占位符内部书写slots节点，甚至具名的slots节点
 * 这些slots节点最终会体现到自定义组件的$slots属性上面
 */

 // 1.自定义组件何时初始化这些slots？
 // 在Vue.prototype._init函数中，beforeCreate钩子函数前，执行initRender(vm)函数
 export function initRender (vm: Component) {
    // 1.初始化属性
    vm._vnode = null // the root of the child tree
    vm._staticTrees = null // v-once cached trees
    const options = vm.$options
    // 2.获取父实例中的占位符节点
    const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
    // 3.推测为：获取占位符节点所在的作用域，也就是当前内部组件实例
    const renderContext = parentVnode && parentVnode.context
    // 4.options._renderChildren：占位节点下面的子节点
    // 5.这儿就是通过获取占位节点的子节点，生成slots对象，赋值给vm.$slots
    vm.$slots = resolveSlots(options._renderChildren, renderContext)
    // 6.vm.$scopedSlots是一个不可扩展，修改的空对象
    vm.$scopedSlots = emptyObject
    // 省略代码xxx
}

// 2.上述代码中的resolveSlots怎么执行的？
export function resolveSlots (
    children: ?Array<VNode>, // 父实例中，当前内部组件的占位节点下面的子节点
    context: ?Component // 推测为当前内部组件实例，因为其为占位节点的context属性值
): { [key: string]: Array<VNode> } {
    const slots = {}
    // 1.如果占位几点里面没有任何子节点，直接返回{}
    if (!children) {
      return slots
    }
    // 2.循环遍历父占位节点的子节点
    for (let i = 0, l = children.length; i < l; i++) {
      // 2.1取得子节点
      const child = children[i]
      // 2.2取得子节点的data属性
      const data = child.data
      // remove slot attribute if the node is resolved as a Vue slot node
      // 2.3如果data里面有slot属性，要把这个slot属性移除
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot
      }
      // named slots should only be respected if the vnode was rendered in the
      // same context.
      // 2.4如果data的slot不为null，为具名插槽
      if ((child.context === context || child.fnContext === context) &&
        data && data.slot != null
      ) {
        // 2.4.1获取具名插槽的名称
        const name = data.slot
        const slot = (slots[name] || (slots[name] = []))
        // 2.4.2判断子节点标签，执行push操作
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children || [])
        } else {
          slot.push(child)
        }
      } else {
        // 2.4.3为默认插槽
        (slots.default || (slots.default = [])).push(child)
      }
    }
    // ignore slots that contains only whitespace
    // 3.将slots里面的名称只含空格的插槽给移除，这儿相当于时做了一个容错边界处理
    // 4.isWhitespace判断是否是不符合规范的节点
    for (const name in slots) {
      if (slots[name].every(isWhitespace)) {
        delete slots[name]
      }
    }
    // 5.返回slots，其是一个对象，对象里面属性的属性值为数组
    return slots
}

// 3.$slots属性里面的内容是如何去添加到自定义组件的节点里面的？