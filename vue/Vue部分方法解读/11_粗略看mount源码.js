// mount源码涉及vnode、render函数的生成、vnode对应的dom元素的生成

/**
 * 简要概述：
 * 1.首先根据模板，构建vue实例的render函数
 * 2.通过render函数构建vnode
 * 3.创建renderWatcher，让依赖收集当前watcher，以便通过数据更新dom
 * 4.更新dom：通过vnode构建真正与之对应的dom元素，并将其挂载到相应的位置
 */

// 源码中有两个版本提供：运行时版本和完整版

// 1.运行时版本
Vue.prototype.$mount = function (
    el?: string | Element,
    hydrating?: boolean
  ): Component {
    el = el && inBrowser ? query(el) : undefined
    // mountComponent来源于lifecycle.js
    return mountComponent(this, el, hydrating)
}

// 2.完整版本
const mount = Vue.prototype.$mount
// 重写$mount方法，新方法为实例创建render函数
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    // 编译相关
    if (template) {

      const { render, staticRenderFns } = compileToFunctions(template, {
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns
    }
  }
  return mount.call(this, el, hydrating)
}

// 3.mountComponent方法
export function mountComponent (
    vm: Component, // 当前实例
    el: ?Element, // 当前实例需要挂在到哪个元素下
    hydrating?: boolean // 这个有啥用？在__patch__函数里面要用
  ): Component {
    // 1.元素赋值给$el属性
    vm.$el = el
    // 2.判断render函数是否已生成
    if (!vm.$options.render) {
      // 2.1如果没有生成，则将其等于创建空标签
      vm.$options.render = createEmptyVNode
    }
    // 3.抛出beforeMount钩子函数
    callHook(vm, 'beforeMount')
  
    // 4.定义更新实例的函数
    let updateComponent
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      updateComponent = () => {
        const vnode = vm._render()
  
        vm._update(vnode, hydrating)
      }
    } else {
      // 5.更新实例的函数赋值
      updateComponent = () => {
        // 5.1vm.render()函数的作用为生成实例的vnode
        // 5.2执行vm.prototype._update函数
        vm._update(vm._render(), hydrating)
      }
    }

    // 6.创建一个renderWatcher
    // 6.1这个watcher创建后，Dep.target就为这个watcher，同时会在watcher中调用get方法
    // 6.2get方法会执行updateComponent方法，updateComponent方法里会去执行一些属性的getter
    // 6.3当遇到需要依赖追踪的数据时，就会用他的dep去收集当前watcher
    // 6.4以后数据发生变化时，dep会去通知这个watcher执行更新操作，也就是调用updateComponent方法
    // updateComponent方法是根据vnode构建对应的dom结构，这样就实现了数据操作dom更新
    new Watcher(vm, updateComponent, noop, null, true /* isRenderWatcher */)
    hydrating = false
  
    // 7.$vnode代表该实例在父实例中的占位符，如果占位符不存在，则抛出mounted钩子函数
    if (vm.$vnode == null) {
      // 7.1执行mounted钩子函数
      vm._isMounted = true
      callHook(vm, 'mounted')
    }
    return vm
}

// 4.生成vnode的方法：Vue.prototype._render
Vue.prototype._render = function (): VNode {
    // 1.备份当前实例
    const vm: Component = this
    // 2.获取实例的render函数，以前实例在父实例中的占位符
    const { render, _parentVnode } = vm.$options

    // reset _rendered flag on slots for duplicate slot check
    // 3.重置插槽上的_rendered标志以进行重复的插槽检查
    // 3.1这儿具体有啥用，还不知道
    if (process.env.NODE_ENV !== 'production') {
      for (const key in vm.$slots) {
        // $flow-disable-line
        vm.$slots[key]._rendered = false
      }
    }

    // 4.如果有占位符，说明该实例是一个自定义组件
    if (_parentVnode) {
      vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject
    }

    // 5.这一步不是在initRender的时候做了吗？
    vm.$vnode = _parentVnode
    // 6.render自己
    let vnode
    // 7.执行render函数，生成vnode
    vnode = render.call(vm._renderProxy, vm.$createElement)
    // 容错处理
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    // 8..将vnode的parent设置为实例的占位节点
    vnode.parent = _parentVnode
    // 9.返回vnode
    return vnode
}

// 5.通过vnode生成对应的dom节点：Vue.prototype._update
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    // 1.备份当前实例
    const vm: Component = this
    // 2.如果当前实例已经抛出过mounted钩子函数后，就要抛出beforeUpdate
    // 3.也就是说，本次更新不是当前实例的第一次更新
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
    // 4.获取当前实例，在更新前的元素，vnode以及实例
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const prevActiveInstance = activeInstance
    // 5.将当前实例赋值给activeInstance变量
    activeInstance = vm
    // 6.将入参新的vnode赋值给当前实例
    vm._vnode = vnode
    // 7.如果实例在更新之前不存在vnode，这里先不忙研究__patch__方法的执行
    if (!prevVnode) {
      // 7.1生成dom元素，赋值给$el属性
      vm.$el = vm.__patch__(
        vm.$el, vnode, hydrating, false /* removeOnly */,
        vm.$options._parentElm,
        vm.$options._refElm
      )
      // no need for the ref nodes after initial patch
      // this prevents keeping a detached DOM tree in memory (#5851)
      vm.$options._parentElm = vm.$options._refElm = null
    } else { // 8.如果实例在更新之前存在vnode
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    // 9.这儿的意思是，再次将变化前的实例赋值给activeInstance？为何要这样处理呢？
    activeInstance = prevActiveInstance
    // update __vue__ reference
    // 10.如果更新前，有dom元素，则将其__vue__指针指向null
    if (prevEl) {
      prevEl.__vue__ = null
    }
    // 11.如果新的$el存在，则将其__vue__指针指向当前实例
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    // 12.如果实例存在占位vnode，拥有父实例，并且占位vnode等于父实例的vnode
    // 12.1推测意思就是，父实例的dom元素中就只有一个当前实例的占位节点
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
        // 12.2直接将当前实例的dom节点，赋值给父实例的dom节点即可
        vm.$parent.$el = vm.$el
    }
}
