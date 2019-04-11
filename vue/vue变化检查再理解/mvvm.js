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
        this.value = this.get()
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

class Observe {
    constructor(data) {
        this.walk(data)
    }
    walk(object) {
        for(let i in object) {
            this.defineReactive(object, i, object[i])
            observe(object[i])
        }
    }
    defineReactive(target, key, value) {
        let dep = new Dep()
        Object.defineProperty(target, key, {
            enumerable: true,
            configurable: true,
            get: function() {
                dep.depend()
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
    if (!data || typeof object !== 'object') {
        return
    }
    new Observe(data)
}

class MVVM {
    constructor(options) {
        let data = this._data = options.data
        observe(data)
        this.proxy(data, this)
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