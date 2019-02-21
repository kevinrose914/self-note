const Router = require('koa-router');
const router = new Router();
const user = require('./user.controller');

const routes = {
    login: {
        method: 'post',
        varify: false // true: 需要token验证
    },
    list: {
        method: 'get',
        varify: true
    }
};

Object.getOwnPropertyNames(routes).forEach(k => {
    const obj = routes[k];
    const url = '/' + k + (obj.url || '');
    router[obj.method ? obj.method : 'post'](url, user[k]);
});

module.exports = {
    router,
    routes
};