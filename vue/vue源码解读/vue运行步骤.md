# 下面是每到一步后，在Vue或者Vue.prototype上增加的属性

## initMixins(Vue)
```js
Vue.prototype = {
    _init: function(){}
}
```

## stateMixin(Vue)
```js
Vue.prototype = {
    $data: ,
    $props: ,
    $delete: ,
    $set: ,
    $watch: function(){}
}
```

## eventsMixin(Vue)
```js
Vue.prototype = {
    $on: function() {},
    $off: function(){},
    $once: function(){},
    $emit: function(){}
}
```

## lifecycleMixin(Vue)
```js
Vue.prototype = {
    _update: function() {},
    $forceUpdate: function(){},
    $destroy: function(){}
}
```

## renderMixin(Vue)
```js
Vue.prototype = {
    $nextTick: function() {},
    _render: function() {},
    _o:,
    _n,
    _s... // 一些运行时的方法
}
```

## initGlobalAPI()
```js
Vue = {
    config: {},
    util: {warn, extend, mergeOptions, defineReactive},
    set: ,
    delete: ,
    nextTick: ,
    options: {components: {keepalive:{}}, directives: {}, filters: {}},
    _base: Vue,
    use: function(){},
    mixin: function(){},
    extend: function(){},
    component: function(){},
    directive: function(){},
    filter: function(){}
}
```

## 最后输出的Vue
```js
Vue = {
    config: {},
    util: {warn, extend, mergeOptions, defineReactive},
    set: ,
    delete: ,
    nextTick: ,
    options: {components: {keepalive:{}}, directives: {}, filters: {}},
    _base: Vue,
    use: function(){},
    mixin: function(){},
    extend: function(){},
    component: function(){},
    directive: function(){},
    filter: function(){}
}
Vue.prototype = {
    _init: function(){},
    $data: ,
    $props: ,
    $delete: ,
    $set: ,
    $watch: function(){},
    $on: function() {},
    $off: function(){},
    $once: function(){},
    $emit: function(){},
    _update: function() {},
    $forceUpdate: function(){},
    $destroy: function(){},
    $nextTick: function() {},
    _render: function() {},
    _o:,
    _n,
    _s... // 一些运行时的方法
}
```

# 下面着重的是，在初始化vue实例的时候，往Vue实例里面增加的属性,这儿实例统一用Vm表示
## Vue.prototype._init(options)
```js
Vm = {
    _uid: '', // 唯一标识
    _isVue: true, // 
    $options: {...Vue.options, ...options, _propKeys: []}, // 包含Vue构造函数的options以及传入的options
    _renderProxy: function() {}, // 如果是生产环境，这个就是Vm
    _self: Vm, // 自己
    $parent: ,
    $root: ,
    $children: [],
    $refs: {},
    _watcher: null,
    _inactive: null,
    _directInactive: false,
    _isMounted: false,
    _isDestroyed: false,
    _isBeingDestroyed: false,
    _events: {},
    _hasHookEvent: false,
    _vnode: null,
    _staticTrees: null,
    $vnode: ,
    $slots: ,
    $scopedSlots: ,
    _c: function() {},
    $createElement: function() {}，
    _watchers: []，
    _data: {},
    _props: {},
    // vm[key] = methods[key],将options里面的methods方法挂载到vm上
    _computedWatchers： {}
}
```


## Vue.prototype.$mount(el)
```js
// 生成render方法
vue = {
    $options: {
        render: function() {},
        staticRenderFns: []
    }
}
```

## 接着调用mountComponent(vm, el, hydrating)方法

