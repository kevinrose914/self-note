class Dep {
    constructor() {
        this.subs = []
    }
    depend() {
        if (Dep.target) {
            this.subs.push(Dep.target)
        }
    }
    notify() {
        for (let i = 0, len = this.subs.length; i < len; i++) {
            this.subs[i].update()
        }
    }
}
Dep.target = null


class Watcher {
    constructor(target, excep, cb) {
        this.target = target
        this.excep = excep
        this.cb = cb
        this.value = this.get()
        // 首次渲染
        this.cb.call(this.target, this.value)
    }
    get() {
        Dep.target = this
        let value = this.target
        this.excep.split('.').forEach(k => {
            value = value[k]
        })
        Dep.target = null
        return value
    }
    update() {
        // 这儿获取数据，不能直接调用上面的get，因为get函数里面会给Dep.target赋值，然后在取值的时候会导致页面死循环
        let value = this.target
        this.excep.split('.').forEach(k => {
            value = value[k]
        })
        this.value = value
        this.cb.call(this.target, this.value)
    }
}

class Compiler {
    constructor(el, mvvm) {
        this.init(el, mvvm)
    }
    init(el, mvvm) {
        mvvm.$el = document.querySelector(el)
        // 创建一个文档碎片，这样处理更高效
        let fragment = document.createDocumentFragment()
        let child
        while (child = mvvm.$el.firstChild) {
            fragment.appendChild(child)
        }
        this.replace(fragment, mvvm)
        mvvm.$el.appendChild(fragment)
    }
    replace(frag, mvvm) {
        Array.from(frag.childNodes).forEach(node => {
            let txt = node.textContent
            let reg = /\{\{(.*?)\}\}/g // 识别{{xx.xx}}的正则
            if (node.nodeType === 3 && reg.test(txt)) { // 文本节点
                // 首次渲染要为数据创建watcher，后面就直接用update更新
                debugger;
                new Watcher(mvvm, RegExp.$1, (newVal) => {
                    // 替换
                    node.textContent = txt.replace(reg, newVal).trim()
                })
            } else if (node.nodeType === 1) { // 元素节点，这儿只做了v-model双向绑定的情况
                let nodeAttr = node.attributes
                Array.from(nodeAttr).forEach(attr => {
                    let name = attr.name, exp = attr.value
                    if (name.includes('v-') || name.includes(':')) {
                        // 首次渲染要为数据创建watcher，后面就直接用update更新
                        new Watcher(mvvm, exp, (newVal) => {
                            node.value = newVal
                        })
                        node.addEventListener('input', e => {
                            // 只能监听简单数据类型，不能监听对象
                            let newval = e.target.value
                            mvvm[exp] = newval
                        })
                    }
                })
            }
            if (node.childNodes && node.childNodes.length) {
                this.replace(node, mvvm)
            }
        })
    }
}

const arrayProto = Array.prototype
const arrayMethod = Object.create(arrayProto)
const arrayConstructorMethod = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
arrayConstructorMethod.forEach(function(method) {
    const original = arrayProto[method]
    Object.defineProperty(arrayMethod, method, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(...args) {
            debugger;
            const result = original.apply(this, args)
            const ob = this.__ob__
            let inserted
            switch(method) {
                case 'push':
                case 'unshift':
                    inserted = args
                    break
                case 'splice':
                    inserted = args.slice(2)
                    break
            }
            if (inserted) {
                ob.observeArray(inserted)
            }
            ob.dep.notify()
            return result
        }
    })
})

function def(target, key, value, enumerable) {
    Object.defineProperty(target, key, {
        enumerable: !!enumerable,
        configurable: true,
        writable: true,
        value
    })
}

function dependArray (value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i]
        e && e.__ob__ && e.__ob__.dep.depend()
        if (Array.isArray(e)) {
            dependArray(e)
        }
    }
}

class Observe {
    constructor(data) {
        def(data, '__ob__', this)
        this.dep = new Dep() // key的dep
        if (Array.isArray(data)) {
            data.__proto__ = arrayMethod
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }
    observeArray(data) {
        for(let i = 0, len = data.length; i < len; i++) {
            observe(data[i])
        }
    }
    walk(object) {
        for(let i in object) {
            const val = object[i] // 这儿先备份下来，避免在observe()的时候，出发了get，影响效率
            this.defineReactive(object, i, val)
        }
    }
    defineReactive(target, key, value) {
        let dep = new Dep() // value的dep
        let childOb = observe(value) // key 的 dep
        Object.defineProperty(target, key, {
            // enumerable: true,
            configurable: true,
            get: function() {
                dep.depend()
                if (childOb) { // 如果有引用类型的子属性，则在子属性的observe的dep上收集当前依赖
                    childOb.dep.depend()
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
                return value
            },
            set: function(newVal) {
                if (value === newVal) {
                    return
                }
                value = newVal
                observe(newVal)
                dep.notify()
            }
        })
    }
}

function observe(data) {
    if (!data || typeof data !== 'object') {
        return
    }
    return new Observe(data)
}

class MVVM {
    constructor(options) {
        let data = this._data = options.data
        this.proxy(data, this)
        observe(data)
        new Compiler(options.el, this)
    }
    proxy(data, mvvm) {
        for (let i in data) {
            Object.defineProperty(mvvm, i, {
                configurable: true,
                enumerable: true,
                get: function() {
                    return mvvm._data[i]
                },
                set: function(newVal) {
                    mvvm._data[i] = newVal
                }
            })
        }
    }
}

window.MVVM = MVVM
window.Dep = Dep
window.Watcher = Watcher