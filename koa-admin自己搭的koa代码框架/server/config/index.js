const privateFunc = require('./function');
const constant = require('./contant');

module.exports = {
    privateFunc,
    constant,
    mysqlDB: {
		host:'localhost',
        user: 'root',
        password:'123456',
        database: 'study'
    },
    //token 配置
    JWTs : {
        secret : 'zwhww', // 指定密钥
        expiresIn:'1m'  //超时设置 m分钟 h小时 d天数
    },
    //公用：获取客户端IP
    getClientIP:function(ctx) {
        let req = ctx.request;
        let ip = ctx.ip ||
            req.headers['x-forwarded-for'] ||
            req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress || '';
        let arr = ip.match(/(\d{1,3}\.){3}\d{1,3}/);
        return arr ? arr[0] : '';
    }
};