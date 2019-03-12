(function() {
    class Watcher {
        constructor(cb) {
            this.cb = cb
        }
        addDep(dep) {
            this.newDeps.push(dep) 
        }
        update() {
            this.cb()
        }
    }

    class Dep {
        constructor() {
            this.subs = []
        }
        addDepend() {
            if (Dep.target) {
                Dep.target.addDep(this)
            }
        }
        addSubs(watcher) {
            this.subs.push(watcher)
        }
        notify() {
            this.subs.forEach(s => s.update())
        }
    }
    let watcher = new Watcher(() => { console.log(111) })
    let dep = new Dep()
    dep.addSubs(watcher)
    dep.addSubs(watcher)
    dep.notify()
})(this)