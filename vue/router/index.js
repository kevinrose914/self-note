function match(path, routeMap) {
    let match = {}
    if (typeof path === 'string' || path.name === undefined) {
        for (let route of routeMap) {
            if (route.path === path || route.path === path.path) {
                match = route
                break
            }
        }
    } else {
        for (let route of routeMap) {
            if (route.name === path.name) {
                match = route
                if (path.query) {
                    match.query = path.query
                }
                break
            }
        }
    }
    return match
}
function stringifyQuery(obj) {
    const res = obj ? Object.keys(obj).map(key => {
      const val = obj[key]
  
      if (val === undefined) {
        return ''
      }
  
      if (val === null) {
        return key
      }
  
      if (Array.isArray(val)) {
        const result = []
        val.forEach(val2 => {
          if (val2 === undefined) {
            return
          }
          if (val2 === null) {
            result.push(key)
          } else {
            result.push(key + '=' + val2)
          }
        })
        return result.join('&')
      }
  
      return key + '=' + val
    }).filter(x => x.length > 0).join('&') : null
    return res ? `?${res}` : ''
}
function getFullPath({ path, query = {}, hash = '' }) {
    return (path || '/') + stringifyQuery(query) + hash
}
function getQuery() {
    const hash = location.hash
    const queryStr = hash.indexOf('?') !== -1 ? hash.substring(hash.indexOf('?') + 1) : ''
    const queryArray = queryStr ? queryStr.split('&') : []
    let query = {}
    queryArray.forEach((q) => {
        let qArray = q.split('=')
        query[qArray[0]] = qArray[1]
    })
    return query
}
function getLocation (base = '') {
    let path = window.location.pathname
    if (base && path.indexOf(base) === 0) {
        path = path.slice(base.length)
    }
    return (path || '/') + window.location.search + window.location.hash
}

class Base {
    constructor(router) {
        this.router = router
        this.current = {
            path: '/',
            query: {},
            params: {},
            name: '',
            fullPath: '/',
            route: {}
        }
    }
    transitionTo(target, cb) {
        // 找到匹配的路由配置
        const targetRoute = match(target, this.router.routes)
        this.confirmTransition(targetRoute, () => {
            // 这儿在每次赋值时，就会出发watcher进行更新
            this.current.route = targetRoute
            this.current.name = targetRoute.name
            this.current.path = targetRoute.path
            this.current.query = targetRoute.query || getQuery()
            this.current.fullPath = getFullPath(this.current)
            cb && cb()
        })
    }
    // 执行路由钩子函数，然后执行跳转后的回调函数
    confirmTransition(route, cb) {
        // 暂时不加钩子函数
        cb && cb()
    }
}

class HTML5Hisotry extends Base {
    constructor(router) {
        super(router)
        window.addEventListener('popstate', () => {
            console.log('pop state..')
            this.transitionTo(getLocation())
        })
    }
    push(location) {
        const targetRoute = match(location, this.router.routes)

        this.transitionTo(targetRoute, () => {
            this.changeUrl(this.router.base, this.current.fullPath)
        })
    }
    replace(location) {
        const targetRoute = match(location, this.router.routes)

        this.transitionTo(targetRoute, () => {
            this.changeUrl(this.router.base, this.current.fullPath, true)
        })
    }
    go(n) {
        window.history.go(n)
    }
    getCurrentPath () {
        return getLocation(this.router.base)
    }
    changeUrl(base, path, replace) {
        if (replace) {
          window.history.replaceState({}, '', (base + path).replace(/\/\//g, '/'))
        } else {
          window.history.pushState({}, '', (base + path).replace(/\/\//g, '/'))
        }
    }
}

class HashHistroy extends Base {
    constructor (router) {
        super(router)
        this.ensureSlash()
        window.addEventListener('hashchange', () => {
            this.transitionTo(this.getCurrentLocation())
        })
    }
  
    push (location) {
        const targetRoute = match(location, this.router.routes)
    
        this.transitionTo(targetRoute, () => {
            this.changeUrl(this.current.fullPath.substring(1))
        })
    }
  
    replaceState (location) {
        const targetRoute = match(location, this.router.routes)
    
        this.transitionTo(targetRoute, () => {
            this.changeUrl(this.current.fullPath.substring(1), true)
        })
    }
  
    // 确保以#开头
    ensureSlash () {
        const path = this.getCurrentPath()
        if (path.charAt(0) === '/') {
            return true
        }
        this.changeUrl(path)
        return false
    }
  
    getCurrentPath() {
        const href = window.location.href
        const index = href.indexOf('#')
        return index === -1 ? '' : href.slice(index + 1)
    }
    changeUrl(path, replace) {
        const href = window.location.href
        const index = href.indexOf('#')
        const base = index > -1 ? href.slice(0, index) : href
        if (replace) {
            window.history.replaceState({}, '', `${base}#/${path}`)
        } else {
            window.history.pushState({}, '', `${base}#/${path}`)
        }
    }
}

class Router {
    constructor(options) {
        this.base = options.base || ''
        this.routes = options.routes
        this.container = options.id
        this.mode = options.mode || 'hash'
        this.history = this.mode == 'history' ? new HTML5Hisotry(this) : new HashHistroy(this)
        Object.defineProperty(this, 'route', {
            get: function() {
                return this.history.current
            }
        })
        this.init()
    }

    push(location) {
        this.history.push(location)
    }

    replace(location) {
        this.history.replace(location)
    }

    go(n) {
        this.history.go(n)
    }

    render() {
        let i
        if ((i = this.history.current) && (i = i.route) && (i = i.component)) {
            document.getElementById(this.container).innerHTML = i
        }
    }

    init() {
        const history = this.history
        new window.Observer(this.history.current)
        // 监听this.history.current.route的变化，改变视图，要用hash模式才能看得出来变化，history模式需要服务端支持
        new window.Watcher(this.history.current, 'route', this.render.bind(this))
        history.transitionTo(history.getCurrentPath())
    }
}

window.Router = Router