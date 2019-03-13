(function(context) {
    class MVVM {
        constructor(options) {
            this.$options = options
            let data = this._data = options.data
            // 数据劫持，创建dep，首次get的时候，搜集watcher；每次set的时候，通知watcher更新
            observe(data)
            // 数据代理，访问this.person就等于访问this._data.person
            proxy(data, this)
            // 编译，将{{person.name}}替换成真正的值
            new Compiler(options.el, this)
        }
    }

    // 包装一层让this.a = this._data.a
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

    // 创建响应式数据,每次数据被get的时候，会向dep中增加一次watcher；每次数据set的时候，保存的watcher都要去更新一次
    class Observer {
        constructor(data) {
            this.walk(data)
        }
        walk(data) {
            for (let i in data) {
                let value = data[i]
                this.defineReactive(data, i, value)
                // 如果value是对象，还要继续去创建响应式
                observe(value)
            }
        }
        defineReactive(obj, key, value) {
            let dep = new Dep() // 每个键都会有一个dep，里面包含了其值的所有watcher
            Object.defineProperty(obj, key, {
                configurable: true,
                get: function() {
                    // 在new Watcher后，就会pushTarget一个当前正在执行的watcher，把这个watcher装进dep的里面
                    Dep.target && dep.addSub(Dep.target)
                    return value
                },
                set: function(newVal) {
                    if (newVal === value) {
                        return
                    }
                    value = newVal
                    // 新的value，也要继续去创建响应式
                    observe(newVal)
                    // 发布，所有watcher去更新
                    dep.notify()
                }
            })
        }
    }

    class Dep {
        constructor() {
            this.subs = [] // 搜集watcher
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

    // 首次把数据映射到dom上时，需要建立watcher，并把watcher扔进当前查询的键值对的dep上去
    class Watcher {
        constructor(mvvm, excepssion, cb) {
            this.mvvm = mvvm
            this.excepssion = excepssion // eg: person.name, person.age
            this.cb = cb
            this.newDeps = []
            this.value = this.getVal()
            // 执行以下更新，第一次dom取数据渲染的时候
            this.cb(this.value)
        }
        getVal() {
            pushTarget(this)
            let val = this.mvvm
            // 循环取值
            this.excepssion.split('.').forEach(key => {
                // 这里每次执行val[key]的时候，就回去执行proxy里面的getter方法
                val = val[key]
            })
            popTarget()
            return val
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

    context.MVVM = MVVM


})(this)