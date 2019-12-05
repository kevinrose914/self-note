// 分析keep-alive组件源码：keepalive组件实质就是通过组件对应的key缓存组件的vnode

/* @flow */

import { isRegExp, remove } from 'shared/util'
import { getFirstComponentChild } from 'core/vdom/helpers/index'

type VNodeCache = { [key: string]: ?VNode };

// 获取组件名称的方法
function getComponentName (opts: ?VNodeComponentOptions): ?string {
  return opts && (opts.Ctor.options.name || opts.tag)
}
// 查看组件名称是否符合
function matches (pattern: string | RegExp | Array<string>, name: string): boolean {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}
// 当存在include或者exclude时，要去过滤掉相应的组件
function pruneCache (keepAliveInstance: any, filter: Function) {
  // 1.获取keepalive实例的cache，keys，_vnode属性值，_vnode是keepalive组件的vnode
  const { cache, keys, _vnode } = keepAliveInstance
  // 2.遍历cache
  for (const key in cache) {
    // 2.1获取cache里面报错的key对应的值，推测值就是组件对应的VNode
    const cachedNode: ?VNode = cache[key]
    if (cachedNode) {
      // 2.2如果VNode存在，获取组件名称
      const name: ?string = getComponentName(cachedNode.componentOptions)
      // 2.3查看名称是否在include或者exclude里面
      if (name && !filter(name)) {
        // 如果不在，就要去销毁组件
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}
// 销毁组件
function pruneCacheEntry (
  cache: VNodeCache,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  // 获取当前key对应的组件vnode
  const cached = cache[key]
  // 组件对应的vnode存在，但是当前keepalive组件的vnode不存在、或者keepalive组件对应的vnode不是cached
  // 此时就是销毁组件
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}

const patternTypes: Array<Function> = [String, RegExp, Array]

export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created () {
    this.cache = Object.create(null)
    this.keys = []
  },

  destroyed () {
    // 循环销毁缓存的组件
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted () {
    // 监听include、exlude的数据变化，实时进行组件过滤筛选,该销毁的销毁
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render () {
    const slot = this.$slots.default
    // 1.推测是获取第一个子组件
    const vnode: VNode = getFirstComponentChild(slot)
    // 2.获取子组件的options
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      // 2.1获取组件的名称
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      // 3.如果组件不在include中，或者在exclude中，直接return
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      const { cache, keys } = this
      // 4.赋值vnode.key
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        // 同一个构造函数可能注册为不同的本地组件，所以单独用cid是不够的，还要加上组件的标签
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      // 5.查询当前keepalive是否缓存有当前组件的key对应的vnode
      if (cache[key]) {
        // 5.1如果有缓存，则直接把vnode的组件实例，替换成缓存的组件实例，也就减少了重新创建组件实例的步骤
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        // 5.2为了确保key是最新的，需要先移除，在重新赋值
        remove(keys, key)
        keys.push(key)
      } else {
        // 5.3如果没有缓存当前组件的vnode，则需要缓存起来
        cache[key] = vnode
        keys.push(key)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      // 将当前组件vnode的data属性增加keepAlive属性
      vnode.data.keepAlive = true
    }
    // 返回vnode
    return vnode || (slot && slot[0])
  }
}
