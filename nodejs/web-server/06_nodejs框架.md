### express
安装：使用脚手架express-generator
npm install express-generator -g
express express-test

#### 使用express做登录
> 使用express-session和connect-redis
> req.session保存登录信息，登录校验做成express中间件


### koa2
> express中间件是异步回调, koa2原生支持async/await
> npm install koa-generator -g安装脚手架
> koa2 project-name

#### async和await要点
> 1. await后面可以追加promise对象, 获取resolve的值
> 2. await必须包裹在async函数里面
> 3. async函数执行返回的也是一个promise对象
> 4. try-catch截获promise中reject的值

#### koa2实现登录
> 基于koa-generic-session和koa-redis