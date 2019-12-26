### 概述
> 1.切换路由后，首先更新路由route属性
> 2.router-view组件render方法，会去获取父组件的$route方法，父组件的$route方法实质是去取父组件的this._routerRoot._route
> 3.this._routerRoot._route又是去取router.history.current
> 4.由于this._routerRoot._route已经构建了依赖追踪。故该依赖会去收集router-view的watcher
> 5.后续更新，dep会通知router-view的watcher执行视图更新

### router.push
> 1.push后调用transitionTo方法
> 2.在transitionTo方法中，首先调用match方法，根据当前push的路由路径以及该路径对应的record去创建route对象
> 3.route对象创建后，再调用confirmTransition方法，包装路由钩子函数，并将这些钩子函数按顺序依次执行
> 4.上述钩子函数执行完毕后，执行传入confirmTransition中的回调函数onComplete
> 5.在onComplete函数中执行了updateRoute方法，该方法更新了this.current的值。且执行了index.js中init方法内history.listen中的回调函数
> 6.执行回调函数后，改变了vue根实例的_route属性，由于该属性早已构建了依赖追踪。故该dep回去通知他所收集的watcher执行更新。正好router-view在初始化的时候，其watcher已经被这个dep收集了。所以router-view重新执行了render函数，重新根据route.current去获取路由的components属性，components属性就是vue的options。最后根据options重新createElement更新视图
```js
// html5.js
push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(location, route => {
        pushState(cleanPath(this.base + route.fullPath))
        handleScroll(this.router, route, fromRoute, false)
        onComplete && onComplete(route)
    }, onAbort)
}
```

```js
// base.js
transitionTo (
    location: RawLocation,
    onComplete?: Function,
    onAbort?: Function
  ) {
    // 调用VueRouter实例里面的match方法,该方法根据location返回相应的route对象
    const route = this.router.match(location, this.current)
    this.confirmTransition(
      route,
      () => {
        // 更新this.current
        // 触发vue-router的init函数中的history.listen回调函数
        this.updateRoute(route)
        onComplete && onComplete(route)
        this.ensureURL()

        // fire ready cbs once
        if (!this.ready) {
          this.ready = true
          this.readyCbs.forEach(cb => {
            cb(route)
          })
        }
      },
      err => {
        if (onAbort) {
          onAbort(err)
        }
        if (err && !this.ready) {
          this.ready = true
          this.readyErrorCbs.forEach(cb => {
            cb(err)
          })
        }
      }
    )
  }
```

```js
// base.js
// 这个方法主要是去包装路由钩子函数，让其拥有三个参数to,from,next，并让其有序执行
confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
    const current = this.current
    const abort = err => {
      // after merging https://github.com/vuejs/vue-router/pull/2771 we
      // When the user navigates through history through back/forward buttons
      // we do not want to throw the error. We only throw it if directly calling
      // push/replace. That's why it's not included in isError
      if (!isExtendedError(NavigationDuplicated, err) && isError(err)) {
        if (this.errorCbs.length) {
          this.errorCbs.forEach(cb => {
            cb(err)
          })
        } else {
          warn(false, 'uncaught error during route navigation:')
          console.error(err)
        }
      }
      onAbort && onAbort(err)
    }
    // 如果上一次保存的路由route和本次的相同，说明路由重复了
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      route.matched.length === current.matched.length
    ) {
      this.ensureURL()
      return abort(new NavigationDuplicated(route))
    }

    // updated：所有要执行更新的record
    // deactivated：所有要执行leave的record
    // activated：所有要执行beforeenter的record
    const { updated, deactivated, activated } = resolveQueue(
      this.current.matched,
      route.matched
    )

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

    this.pending = route
    // next为执行下一个queue的函数
    // 这个iterator函数就是包装了一下路由的钩子函数，让其有三个参数传入：to, from, next
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

    // runQueue:
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
  }
```

```js
// base.js
updateRoute (route: Route) {
    const prev = this.current
    // 更新current
    this.current = route
    // 这儿就是去执行history.listen的回调
    // 因为history.listen函数就是去让this.cb=入参函数
    this.cb && this.cb(route)
    this.router.afterHooks.forEach(hook => {
      hook && hook(route, prev)
    })
}
```

```js
// index.js
history.listen(route => {
    this.apps.forEach((app) => {
        // 这儿就把当前路由的route对象，赋值给了vue实例的_route属性
        app._route = route
    })
})
```





