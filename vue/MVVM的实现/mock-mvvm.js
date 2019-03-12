(function(context) {
    class MVVM {
        constructor(options) {
            this.$options = options
            let data = this._data = options.data
            observe(data)
            proxy(data, this)
            new Compiler(options.el, this)
        }
    }

    function proxy(data, mvvm) {
        for(let i in data) {
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

    function observe(data) {
        if (!data || typeof data !== 'object') {
            return 
        }
        return new Observer(data)
    }

    class Observer {
        constructor(data) {
            this.walk(data)
        }
        walk(data) {
            let dep = new Dep()
            for (let i in data) {
                let value = data[i]
                observe(value)
                this.defineReactive(data, i, value, dep)
            }
        }
        defineReactive(obj, key, value, dep) {
            Object.defineProperty(obj, key, {
                configurable: true,
                get: function() {
                    Dep.target && dep.addSub(Dep.target)
                    return value
                },
                set: function(newVal) {
                    if (newVal === value) {
                        return
                    }
                    value = newVal
                    observe(newVal)
                    dep.notify()
                }
            })
        }
    }

    class Dep {
        constructor() {
            this.subs = []
        }
        addDepend() {
            if(Dep.target) {
                Dep.target.addDep(this)
            }
        }
        addSub(watcher) {
            this.subs.push(watcher)
        }
        notify() {
            this.subs.forEach(s => s.update())
        }
    }
    Dep.target = null
    Dep.watcherStack = []
    function pushTarget(watcher) {
        if (Dep.target) {
            Dep.watcherStack.push(Dep.target)
        }
        Dep.target = watcher
    }
    function popTarget() {
        Dep.target = Dep.watcherStack.pop()
    }

    class Watcher {
        constructor(mvvm, excepssion, cb) {
            this.mvvm = mvvm
            this.excepssion = excepssion
            this.cb = cb
            this.newDeps = []
            pushTarget(this)
        }
        addDep(dep) {
            this.newDeps.push(dep)
        }
        update() {
            let arr = this.excepssion.split('.')
            let val = this.mvvm
            arr.forEach(k => {
                val = val[k]
            })
            this.cb(val)
        }
    }


    class Compiler {
        constructor(el, mvvm) {
            this.init(el, mvvm)
        }
        init(el, mvvm) {
            mvvm.$el = document.querySelector(el)
            let fragment = document.createDocumentFragment()
            var child = mvvm.$el.firstChild
            if (child) {
                fragment.appendChild(child)
            }
            this.replace(fragment, mvvm)
            mvvm.$el.appendChild(fragment)
        }
        replace(frag, mvvm) {
            Array.from(frag.childNodes).forEach(node => {
                let txt = node.textContent
                let reg = /\{\{(.*?)\}\}/g
                if (node.nodeType === 3 && reg.test(txt)) {
                    let arr = RegExp.$1.split('.')
                    let val = mvvm
                    arr.forEach(key => {
                        val = val[key]
                    })
                    console.log(val)
                    node.textContent = txt.replace(reg, val).trim()
                    new Watcher(mvvm, RegExp.$1, (newval) => {
                        node.textContent = txt.replace(reg, newval).trim()
                    })
                } else if (node.nodeType === 1) {
                    let nodeAttr = node.attributes
                    Array.from(nodeAttr).forEach(attr => {
                        let name = attr.name, exp = attr.value
                        if (name.includes('v-') || name.includes(':')) {
                            let arr = exp.split('.')
                            let val = mvvm
                            arr.forEach(k => {
                                val = val[k]
                            })
                            node.value = val
                        }
                        new Watcher(mvvm, exp, (newVal) => {
                            node.value = newVal
                        })
                        node.addEventListener('input', e => {
                            let newval = e.target.value
                            mvvm[exp] = newval
                        })
                    })
                }
                if (node.childNodes && node.childNodes.length) {
                    this.replace(node, mvvm)
                }
            })
        }
    }

    context.MVVM = MVVM


})(this)