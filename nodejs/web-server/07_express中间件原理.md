### express中间件
```分析```
> 1. app.use用来注册中间件，先收集起来
> 2. 遇到http请求，根据path和method判断触发哪些
> 3. 实现next机制，即上一个通过next触发下一个

```express中间件原理```
> 1. 先用一个对象收集use、get、post注册的中间件
> 2. 在createServer的入参函数中，通过method和url获得相关的中间件
> 3. 最后执行中间件

```javascript
const http = require('http')
const slice = Array.prototype.slice

class LikeExpress {
    constructor() {
        // 存放中间件列表
        this.routes = {
            all: [],
            get: [],
            post: []
        }
    }

    register(path) {
        const info = {}
        if (typeof path === 'string') {
            info.path = path
            info.stack = slice.call(arguments, 1)
        } else {
            info.path = '/'
            info.stack = slice.call(arguments, 0)
        }
        return info
    }

    use() {
        const info = this.register.apply(this, arguments)
        this.routes.all.push(info)
    }

    get() {
        const info = this.register.apply(this, arguments)
        this.routes.get.push(info)
    }

    post() {
        const info = this.register.apply(this, arguments)
        this.routes.post.push(info)
    }

    match(method, url) {
        let stack = []
        if (url === '/favicon.ico') {
            return stack
        }
        // 获取routes,先通过method获取routes
        let curRoutes = []
        curRoutes = curRoutes.concat(this.routes.all)
        curRoutes = curRoutes.concat(this.routes[method])
        // 再通过path过滤routes
        curRoutes.forEach(routeInfo => {
            if (url.indexOf(routeInfo.path) === 0) {
                stack = stack.concat(routeInfo.stack)
            }
        })
        return stack
    }

    // 核心next机制
    handle(req, res, stack) {
        const next = () => {
            // 拿到第一个匹配的中间件
            const middleware = stack.shift()
            if (middleware) {
                // 执行中间件函数
                middleware(req, res, next)
            }
        }
        next()
    }

    callback() {
        return (req, res) => {
            res.json = (data) => {
                res.setHeader('Content-type', 'application/json')
                res.end(JSON.stringify(data))
            }
            const url = req.url
            const method = req.method.toLowerCase()
            const resultList = this.match(method, url)
            this.handle(req, res, resultList)
        }
    }

    listen(...args) {
        const server = http.createServer(this.callback)
        server.listen(...args)
    }
}

module.exports = () => {
    return new LikeExpress()
}
```