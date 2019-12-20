const http = require('http')
const slice = Array.prototype.slice

class LikeExpress {
    constructor() {
        this.routes = {
            all: [],
            get: [],
            post: []
        };
    }

    register(path) {
        const info = {}
        if (path) {
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
        let stacks = []
        if (url === '/favicon.ico') {
            return stack
        }
        let results = []
        results = result.concat(this.routes.all)
        results = result.concat(this.routes[method])
        results.forEach(r => {
            if (url.indexOf(r.path) === 0) {
                stacks = stacks.concat(r.stack)
            }
        })
        return stacks
    }

    callback() {
        return (req, res) => {
            res.json = (data) => {
                res.setHeader('Content-type', 'application/json')
                res.end(JSON.stringify(data))
            }
            const method = req.method.toLowerCase()
            const url = req.url
            const stacks = this.match(method, url)
            this.handler(req, res, stacks)
        }
    }

    handler(req, res, stacks) {
        const next = () => {
            const middleware = stacks.shift()
            if (middleware) {
                middleware(req, res, next)
            }
        }
        next()
    }

    listen(...args) {
        const server = http.createServer(this.callback)
        server.listen(...args)
    }
}

module.exports = () => {
    return new LikeExpress()
}