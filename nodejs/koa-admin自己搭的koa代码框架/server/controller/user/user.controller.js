const mysql = require('mysql2/promise');
const config = require('../../config/index.js');
const { constant, privateFunc } = config;
const jwt = require('jsonwebtoken');

const user = {
    /** login */
    login: async (ctx, next) => {
        const body = ctx.request.body;
        if (!body.name) {
            privateFunc._errorResponse(400, constant.name_txt);
        }
        if (!body.password) {
            privateFunc._errorResponse(400, constant.pass_txt);
        }
        // 查询数据库里是否存在当前名称
        const connection = await mysql.createConnection(config.mysqlDB);
        const [list] = await connection.execute("SELECT * FROM `user`WHERE `name`='"+ body.name +"'");
        if (!list || list.length === 0) {
            privateFunc._successResponse(ctx, false, '用户名不存在！');
            return;
        } else {
            if (body.password !== list[0].password) {
                privateFunc._successResponse(ctx, false, '密码输入有误！');
                return;
            }
        }
        const userInfo = list[0];
        let ip = config.getClientIP(ctx);
        delete userInfo.password;
        await connection.end();
        privateFunc._successResponse(ctx, true, '', {
            userInfo,
            token: jwt.sign(Object.assign({}, userInfo), config.JWTs.secret, {expiresIn: config.JWTs.expiresIn})
        });
    },
    /** user list table */
    list: async (ctx, next) => {
        const connection = await mysql.createConnection(config.mysqlDB);
        const [list] = await connection.execute("SELECT * FROM `user`");
        await connection.end();
        privateFunc._successResponse(ctx, true, list);
    }
};

module.exports = user;