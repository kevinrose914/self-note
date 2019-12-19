const redis = require('redis')

// 创建客户端
const redisClient = redis.createClient(6379, '127.0.0.1')
redisClient.on('error', err => {
    console.error(err)
})

// 测试
redisClient.set('fuck', '123', redis.print) // redis.print查询是否设置成功
redisClient.get('fuck', (err, val) => {
    if (!err) {
        console.log('val:', val)
    }

    // 退出
    redisClient.quit();
})