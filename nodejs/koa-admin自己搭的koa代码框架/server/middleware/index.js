const config = require('../config/index.js');
const fs = require('fs');
const logger = require('koa-logger');
const json = require('koa-json');
const koaBody = require('koa-body');
// other middleware
const verify = require('./varify');
// private function
const _writeLog = (data) => {
    fs.appendFile('./log.txt',data,'utf8',e=>{});
}

// middleware
const http = () => {
    return async (ctx, next) => {
        const start = new Date;
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Headers', '*');
        ctx.set('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
        ctx.set('Content-Type', 'application/json');
        // 让options请求快速返回
        if (ctx.request.method === 'OPTIONS') {
            ctx.response.status = 200;
        }
        await next();
        const ms = new Date - start;
        _writeLog(ctx.method + ' ' + ctx.response.status + ' ' + ctx.header.host + ctx.url + ' ' + ms + 'ms \r\n');
    }
}

module.exports = (app) => {
    app.on('error', (err, ctx) => {
        _writeLog('server error' + err + '\n' + JSON.stringify(ctx) + '\r\n');
        ctx.body = {
            success: false,
            data:ctx,
            message: err
        };
    });
    app.use(json());
    app.use(koaBody());
    app.use(logger((str, args) => {
        // _writeLog(str);
    }));
    app.use(http());
    verify(app);
}