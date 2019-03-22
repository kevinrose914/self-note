const koa = require('koa');
const static = require('koa-static');
const fs = require('fs');
const path  =require('path');
const router = require('koa-router');

const app = new koa();
const route = new router();

app.use(static('./dist'));

app.use(async function(ctx) {
    await new Promise(function(resolve, reject) {
        fs.readFile(path.join(`${__dirname}/dist/index.html`), (err, data) => {
            if (!err) {
                ctx.type = 'text/html;charset=utf-8'
                ctx.body = data.toString()
                resolve(data.toString())
            }
        })
    })
})

app.listen(8088, () => {
    console.log('start at: http://localhost:8088');
})