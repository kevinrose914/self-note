const jwt = require('jsonwebtoken');
const config = require('../config/index.js');
const router = require('../router');

// token verify
const verify = () => {
    return async (ctx, next) => {
        const { url, header } = ctx.request;
        let arr = /\/api\/([a-zA-Z]+)\/([a-zA-Z]+)/.exec(ctx.url);
		let key = arr ? arr[2]:'';
        let obj = router.routes[key];
        // 需要进行token校验的才检验
        if (!obj.varify) {
            await next();
        } else {
            let msg = '';
            await jwt.verify(ctx.request.header.auth, config.JWTs.secret, (err, decoded) => {
                if (err) {
                    msg = 'token验证错误！';
                } else {
                    if (!Number.isInteger(decoded.id)) {
                        msg = 'token无效！';
                    }
                }
            });
            if (!msg) {
                await next();
            } else {
                ctx.body = {
                    susccess: false,
                    message: msg
                };
            }
        }
    }
}

module.exports = (app) => {
    app.use(verify());
}