// Vue.prototype._update方法实现了将vnode，通过patch方法，生成与之对应的dom元素

/**
 * patch方法的几种情况:
 * 1.新vnode不存在而旧vnode存在，执行销毁旧vnode
 * 2.旧vnode不存在，根据新vnode创建新元素
 * 3.旧vnode存在、新vnode也存在的情况
 *  3.1新旧vnode的类型一样，执行patchVnode方法进行比对vnode
 *  3.2新旧vnode不一样，创建新dom插入旧节点旁边，然后将就节点删除
 */

// 1.__patch__方法见于platforms/web/runtime/index.js
Vue.prototype.__patch__ = inBrowser ? patch : noop

// 2.patch
import * as nodeOps from 'web/runtime/node-ops' // dom操作的方法集合
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index' // 自定义指令、ref
import platformModules from 'web/runtime/modules/index' // attr, class, style, transition, events, props,
// 推测是vnode标签上的属性，一个属性一个模块
const modules = platformModules.concat(baseModules)
export const patch: Function = createPatchFunction({ nodeOps, modules })

// 3.createPatchFunction，该方法700多行代码，大体结构如下
export function createPatchFunction(backend) {
    let i, j
    // 1.用于存放函数回调
    const cbs = {}
    const { modules, nodeOps } = backend
    // 2.hooks = ['create', 'activate', 'update', 'remove', 'destroy']
    // 3.循环遍历hooks
    for (i = 0; i < hooks.length; ++i) {
      cbs[hooks[i]] = []
      // 4.循环遍历模块，将模块暴露出的属性，与当前循环的hooks名相同的，追加到cbs里面
      for (j = 0; j < modules.length; ++j) {
        if (isDef(modules[j][hooks[i]])) {
          cbs[hooks[i]].push(modules[j][hooks[i]])
        }
      }
    }
    // ....
    // 返回patch函数，也就是说，反面生成dom的patch方法，实质就是这个方法
    return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
      // 1.如果实例得新vnode不存在
      if (isUndef(vnode)) {
        // 1.1斌且旧的vnode存在，那么就调用销毁钩子函数
        if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
        return
      }
  
      //2.推测为是否是新创建得vnode，也就是说实例没有旧的vnode
      let isInitialPatch = false
      // 3.插入vnode的队列
      const insertedVnodeQueue = []
  
      if (isUndef(oldVnode)) { // 4.如果实例旧的vnode不存在
        // empty mount (likely as component), create new root element
        isInitialPatch = true
        // 4.1创建元素，并挂载到父元素上
        createElm(vnode, insertedVnodeQueue, parentElm, refElm)
      } else { // 5.如果实例新旧的vnode都存在
        // isRealElement：这个有无nodeType有什么区别，暂时不知道
        const isRealElement = isDef(oldVnode.nodeType)
        if (!isRealElement && sameVnode(oldVnode, vnode)) { // 5.1如果旧vnode是克隆生成的，且新旧vnode一样
          // patch existing root node
          // 比对新旧node
          patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
        } else { // 5.2实例的新旧vnode存在，但是不相同
          if (isRealElement) {
            // mounting to a real element
            // check if this is server-rendered content and if we can perform
            // a successful hydration.
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
              oldVnode.removeAttribute(SSR_ATTR)
              hydrating = true
            }
            if (isTrue(hydrating)) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true)
                return oldVnode
              } else if (process.env.NODE_ENV !== 'production') {
                warn(
                  'The client-side rendered virtual DOM tree is not matching ' +
                  'server-rendered content. This is likely caused by incorrect ' +
                  'HTML markup, for example nesting block-level elements inside ' +
                  '<p>, or missing <tbody>. Bailing hydration and performing ' +
                  'full client-side render.'
                )
              }
            }
            // either not server-rendered, or hydration failed.
            // create an empty node and replace it
            // 创建一个空属性的vnode
            oldVnode = emptyNodeAt(oldVnode)
          }
  
          // replacing existing element
          // 获取旧vnode的dom结构
          const oldElm = oldVnode.elm
          // 找出旧vnode的dom结构的父级dom
          const parentElm = nodeOps.parentNode(oldElm)
  
          // create new node
          // 创建新的dom
          createElm(
            vnode,
            insertedVnodeQueue,
            // extremely rare edge case: do not insert if old element is in a
            // leaving transition. Only happens when combining transition +
            // keep-alive + HOCs. (#4590)
            oldElm._leaveCb ? null : parentElm,
            nodeOps.nextSibling(oldElm)
          )
  
          // update parent placeholder node element, recursively
          // vnode具有parent属性，是否就证明这个vnode就是自定义组件的vnode？
          // 如果是自定义组件的vnode，那么vnode.parent其实就是自定义组件的占位节点
          if (isDef(vnode.parent)) {
            let ancestor = vnode.parent
            // 查看当前vnode是否是元素节点
            const patchable = isPatchable(vnode)
            while (ancestor) {
              // 推测是销毁占位节点的elm属性
              for (let i = 0; i < cbs.destroy.length; ++i) {
                cbs.destroy[i](ancestor)
              }
              // 重新给占位节点的elm赋值，值为新vnode的elm
              ancestor.elm = vnode.elm
              if (patchable) { // 如果vnode是元素节点
                // 推测就是执行创建
                for (let i = 0; i < cbs.create.length; ++i) {
                  cbs.create[i](emptyNode, ancestor)
                }
                // #6513
                // invoke insert hooks that may have been merged by create hooks.
                // e.g. for directives that uses the "inserted" hook.
                const insert = ancestor.data.hook.insert
                if (insert.merged) {
                  // start at index 1 to avoid re-invoking component mounted hook
                  for (let i = 1; i < insert.fns.length; i++) {
                    insert.fns[i]()
                  }
                }
              } else {
                registerRef(ancestor)
              }
              // 递归
              ancestor = ancestor.parent
            }
          }
  
          // destroy old node
          if (isDef(parentElm)) {
            removeVnodes(parentElm, [oldVnode], 0, 0)
          } else if (isDef(oldVnode.tag)) {
            invokeDestroyHook(oldVnode)
          }
        }
      }
  
      // 调用插入钩子
      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
      // 返回vnode.elm
      return vnode.elm
    }
}

// 5.比对新旧vnode的方法patchVnode
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    // 1.如果新旧vnode完全一样，return
    if (oldVnode === vnode) {
      return
    }

    // 2.将旧vnode的dom结构赋值给新vnode
    const elm = vnode.elm = oldVnode.elm

    // 3.静态节点，不需要更新操作
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      // 3.1这儿主要是考虑到这种<child></child>静态节点
      vnode.componentInstance = oldVnode.componentInstance
      return
    }

    // 4.？
    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }

    // 5.推测就是将节点属性在新旧节点的对比之下，进行更新操作
    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    if (isUndef(vnode.text)) { // 6.新vnode不是文本节点
      if (isDef(oldCh) && isDef(ch)) { // 6.1旧节点具有子节点，新节点也有
        // 6.2新旧节点的子节点不一致
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
      } else if (isDef(ch)) { // 6.3旧节点无子节点，新节点有子节点
        // 6.4旧节点是文本节点，将dom的文本内容清空
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        // 6.5再将新节点的子节点，插入到dom里面
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) { // 6.4旧节点有子节点，新节点无子节点
        // 6.5直接将dom的子元素全部移除
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) { // 6.6就节点是文本节点，新节点无子节点
        // 6.5直接将dom的文本内容清空
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) { // 7.新vnode是文本节点
      // 7.1更新文本内容
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
}

// 根据vnode创建dom
function createElm (
    vnode, // 实例新的vnode
    insertedVnodeQueue, // 插入vnode的队列，来源于上一个函数的闭包
    parentElm, // 占位父dom元素
    refElm, // ？
    nested, // ？
    ownerArray, // ？
    index // ？
  ) {
    // 1.vnode对应的dom结构存在，就要在vnode的基础上，克隆一份vnode出来
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      vnode = ownerArray[index] = cloneVNode(vnode)
    }
    
    // 2.？
    vnode.isRootInsert = !nested // for transition enter check
    // 3.如果是组件节点，就要去创建组件
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) { // 4.tag存在，说明是元素节点

      // 4.1ns属性推测是创建svg相关的元素
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode)
      // 4.2推测是设置css的作用域，暂时不管
      setScope(vnode)

      /* istanbul ignore if */
      if (__WEEX__) {
          // xxx
      } else {
        // 4.3当前节点创建后，需要创建子节点
        createChildren(vnode, children, insertedVnodeQueue)
        if (isDef(data)) {
          // 4.4
          invokeCreateHooks(vnode, insertedVnodeQueue)
        }
        // 4.5 把当前vnode的dom结构插入到父dom上
        insert(parentElm, vnode.elm, refElm)
      }

      if (process.env.NODE_ENV !== 'production' && data && data.pre) {
        creatingElmInVPre--
      }
    } else if (isTrue(vnode.isComment)) { // 5.注释节点
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else { // 文本节点
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
}


