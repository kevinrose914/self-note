const Router = require('koa-router');
const router = new Router();

// child router
const userRouter = require('./controller/user/user.router');
const childRouter = {
    '/api/user': userRouter
};

let routes = {}; // 组件一个具有层级关系路由对象
Object.getOwnPropertyNames(childRouter).forEach(path => {
    const temp = childRouter[path];
    routes = { ...routes, ...temp.routes };
    router.use(path, temp.router.routes());
});

const root = (app) => {
    app.use(router.routes());
    app.use(router.allowedMethods());
}

module.exports = {
    root,
    routes
};