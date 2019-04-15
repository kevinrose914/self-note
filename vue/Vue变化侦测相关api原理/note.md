# $watch实现原理
先看Vue.$watch函数，其可以传三个参数（变量，回调，可选参数）,其中第一个参数可以为字符串，也可以为函数
```js
Vue.$watch('a.b', function(oldVal, newVal) {
    // xxx
}, {
    deep: true // 深度监测
})
```
```js
Vue.$watch(function() {
    return this.a.b
}, function(oldVal, newVal) {
    // xxx
}, {
    deep: true // 深度监测
})
```
$watch其作用就是让变量在发生变化时，及时反馈给回调函数。如何才能让他变化时去反馈呢？其实就是用一个watcher处理
```js
class MVVM {
    construtor(options) {
        // xxxx
    }
    $watch(expOrFn, cb, options) {
        return new Watcher(this, expOrFn, cb, options)
    }
}
```
```js
class Watcher {
    constructor(target, excep, cb, options) {
        this.target = target
        this.cb = cb
        // 这儿处理excep字符串和函数得两种情况, this.getter()调用后，就能得到value
        if (typeof excep === 'function') {
            this.getter = excep
        } else {
            this.getter = parsePath(excep)
        }
        if (options) {
            // 是否深度订阅
            this.deep = !!options.deep
        } else {
            this.deep = false
        }
        this.deps = [] // 用来存储watcher订阅的dep，用于取消订阅
        this.depIds = new Set() // 用来存储watcher订阅的dep的id，避免重复订阅
        this.value = this.get()
        this.originValue = this.value
        // 通知回调
        this.cb.call(this.target, this.originValue, this.value)
    }
    get() {
        Dep.target = this
        let value = this.getter.call(this.target)
        /**
         * 如果是深度订阅，就要在Dep.target = null之前，将value子级的属性get一遍，让他们的dep订阅这个watcher，如此以来，子级属性变化，也会通知这个wactcher
        */
        if (this.deep) {
            traverse(value) // 见最后
        }
        Dep.target = null
        return value
    }
    addDep(dep) {
        /***
         * 这儿避免重复订阅。有些情况下会出现重复订阅，比如excep时函数的时候，函数里面如果有用到多个属性，
         * 就会造成多个dep订阅这个watcher，同理这个watcher订阅多个dep
        */
        const depId = dep.id
        if (!this.depIds.has(depId)) {
            this.deps.push(dep)
            this.depIds.push(depId)
            dep.addSubs(this)
        }
    }
    update() {
        this.value = this.getter.call(this.target)
        // 通知回调
        this.cb.call(this.target, this.originValue, this.value)
        this.originValue = value
    }
}
let uid = 0
class Dep {
    constructor() {
        this.id = uid++
        this.subs = []
    }
    depend() {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }
    addSubs(watcher) {
        this.subs.push(watcher)
    }
}
```
```js
function parsePath(excep) {
    return function() {
        let value = this
        // 循环取值
        excep.split('.').forEach(k => {
            value = value[k]
        })
        return value
    }
}
```
```js
function traverse(value) {
    let seenObject = new Set() // 用于处理重复订阅
    _traverse(value, seenObject)
    seenObject.clear() // 清空
}
function _traverse(value, seen) {
    const isA = Array.isArray(value)
    if (!isA && typeof value !== 'object') {
        return
    }
    if (value.__ob__) {
        /**
         * 这一步就是为了避免重复订阅
        */
        const depId = value.__ob__.dep.id
        if (seen.has(depId)) {
            return
        }
        seen.add(depId)
    }
    if (isA) {
        let i = value.length
        while(i--) {
            // 递归订阅
            _traverse(value[i], seen)
        }
    } else {
        const ary = Object.keys(value)
        let k = ary.length
        while(k--) {
            // 递归订阅
            _traverse(value[ary[k]], seen)
        }
    }
}
```