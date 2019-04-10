(function(context){
    function MVVM(options) {
        this.$options = options
        let data = this._data = this.$options.data
        proxy(this, data)
        observe(data)
        new Compiler(options.el, this)
    }

    function proxy(vm, data) {
        for(let i in data) {
            Object.defineProperty(vm, i, {
                configurable: true,
                get: function() {
                    return vm._data[i]
                },
                set: function(newVal) {
                    vm._data[i] = newVal
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

    function Observer(data) {
        let dep = new Dep()
        for(let i in data) {
            let val = data[i]
            observe(val)
            defineReactive(data, i, val, dep)
        }
    }
    function defineReactive(obj, key, val, dep) {
        Object.defineProperty(obj, key, {
            configurable: true,
            get: function() {
                Dep.target && dep.addSub(Dep.target)
                return val
            },
            set: function(newVal) {
                if (newVal === val) {
                    return
                }
                val = newVal
                observe(newVal)
                dep.notify()
            }
        })
    }

    function Compiler(el, vm) {
        debugger;
        vm.$el = document.querySelector(el)
        let fragment = document.createDocumentFragment()
        while (child = vm.$el.firstChild) {
            fragment.appendChild(child)
        }
        this.replace(fragment, vm)
        vm.$el.appendChild(fragment)
    }
    Compiler.prototype.replace = function(frag, vm) {
        Array.from(frag.childNodes).forEach(node => {
            let txt = node.textContent
            let reg = /\{\{(.*?)\}\}/g
            if (node.nodeType === 3 && reg.test(txt)) {
                let arr = RegExp.$1.split('.')
                let val = vm
                arr.forEach(key => {
                    val = val[key]
                })
                node.textContent = txt.replace(reg, val).trim()
                new Watcher(vm, RegExp.$1, (newval) => {
                    node.textContent = txt.replace(reg, newval).trim()
                })
            } else if (node.nodeType === 1) {
                let nodeAttr = node.attributes
                Array.from(nodeAttr).forEach(attr => {
                    let name = attr.name, exp = attr.value
                    if (name.includes('v-') || name.includes(':')) {
                        let arr = exp.split('.')
                        let val = vm
                        arr.forEach(k => {
                            val = val[k]
                        })
                        node.value = val
                    }
                    new Watcher(vm, exp, (newVal) => {
                        node.value = newVal
                    })
                    node.addEventListener('input', e => {
                        let newval = e.target.value
                        vm[exp] = newval
                    })
                })
            }
            if (node.childNodes && node.childNodes.length) {
                this.replace(node, vm)
            }
        })
    }

    function Dep() {
        this.subs = []
    }
    Dep.prototype.addSub = function(watcher) {
        this.subs.push(watcher)
    }
    Dep.prototype.notify = function() {
        this.subs.forEach(s => s.update())
    }


    function Watcher(vm, exp ,cb) {
        this.cb = cb
        this.exp = exp
        this.vm = vm
        Dep.target = this
    }
    Watcher.prototype.update = function() {
        let arr = this.exp.split('.')
        let val = this.vm
        arr.forEach(k => {
            val = val[k]
        })
        this.cb(val)
    }

    context.MVVM = MVVM
})(this);