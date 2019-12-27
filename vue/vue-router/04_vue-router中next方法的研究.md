## vue-router路由守卫函数中的next方法
> 1. 将路由守卫的入参包装了
> 2. next如果不传值，实质是进入下一步的路由守卫
> 3. next如果传path，则会触发push或者replace方法
> 4. next如果传false，或者其他不允许的类型，会走abort方法抛出异常

```js
// 首先这儿将各类守卫函数，按顺序组合起来
const queue: Array<?NavigationGuard> = [].concat(
    // in-component leave guards
    // 返回数组，数组里面时所有要执行beforeRouteLeave的vue实例
    extractLeaveGuards(deactivated),
    // global before hooks
    // vuerouter实例的beforeHooks,也就是router.beforeEach注册的回调函数
    // 这样就可以理解为啥beforeEach回调函数是有to,from,next三个参数了
    this.router.beforeHooks,
    // in-component update hooks
    // 返回数组，数组里面时所有要执行beforeRouteUpdate的vue实例
    extractUpdateHooks(updated),
    // in-config enter guards
    // 返回所有要执行beforeenter的实例的beforeenter函数数组
    activated.map(m => m.beforeEnter),
    // async components
    // 返回一个函数，函数形参是:to, from, next
    // 解析需要新加载的vue实例
    resolveAsyncComponents(activated)
)
```

```js
// 这里将路由守卫函数包装一下执行，并且统一化路由守卫函数的入参
const iterator = (hook: NavigationGuard, next) => {
    if (this.pending !== route) {
        return abort()
    }
    try {
        hook(route, current, (to: any) => {
            if (to === false || isError(to)) {
                // next(false) -> abort navigation, ensure current URL
                this.ensureURL(true)
                abort(to)
            } else if (
                typeof to === 'string' ||
                (typeof to === 'object' &&
                (typeof to.path === 'string' || typeof to.name === 'string'))
            ) {
                // next('/') or next({ path: '/' }) -> redirect
                // 如果有参数，其实就是去执行路由的push或者replace
                abort()
                if (typeof to === 'object' && to.replace) {
                this.replace(to)
                } else {
                this.push(to)
                }
            } else {
                // confirm transition and pass on the value
                next(to)
            }
        })
    } catch (e) {
        abort(e)
    }
}
```

```js
// 循环队列执行取出queue中的某一项，作为入参传入iterator，并执行
// 所有queue取完后，执行第三个参数回调函数
runQueue(queue, iterator, () => {
    const postEnterCbs = []
    const isValid = () => this.current === route
    // wait until async components are resolved before
    // extracting in-component enter guards
    // 提取组件内部的beforeRouteEnter的函数
    const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid)
    const queue = enterGuards.concat(this.router.resolveHooks)
    // 执行组件内部的beforeRouteEnter的函数
    runQueue(queue, iterator, () => {
        if (this.pending !== route) {
            return abort()
        }
        this.pending = null
        onComplete(route)
        if (this.router.app) {
            this.router.app.$nextTick(() => {
            postEnterCbs.forEach(cb => {
                cb()
            })
            })
        }
    })
})
```

```js
// 将守卫函数按顺序依次执行
// 一步一步的执行fn，fn入参是queue的某一项，执行完成后再执行cb
export function runQueue (queue: Array<?NavigationGuard>, fn: Function, cb: Function) {
  const step = index => {
    if (index >= queue.length) {
      cb()
    } else {
      if (queue[index]) {
        fn(queue[index], () => {
          step(index + 1)
        })
      } else {
        step(index + 1)
      }
    }
  }
  step(0)
}
```

### 流程
> 1.runQueue()执行
> 2.挨个提取queue中的守卫函数
> 3.调用iterator函数，第一个入参为提取出来的守卫函数；第二个参数为一个函数，该函数执行后，可以提取下一个守卫函数再次走第3步
> 4.iterator函数中，执行提取出来的守卫函数，并为传入三个参数，其中第三个参数就是next函数
> 5.next函数可以根据其入参判断这个流程该如何执行
> 6.如果next函数什么都没传，那么就执行iterator函数的第二个参数，也就是继续提取下一个守卫函数，再继续调用一次iterator函数
> 7.如果next函数传入path，那么就停止本次流程，触发push或者replace方法，跳转路由
> 8.如果next函数传入false获取其他不允许的数据类型，中断流程
