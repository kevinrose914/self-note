const koa = require('koa');
const rootRouter = require('./router');
const middleware = require('./middleware/index');

const app = new koa();

middleware(app);
rootRouter.root(app);

app.listen(3040, () => {
    console.log('server is running at http://localhost:3040');
})