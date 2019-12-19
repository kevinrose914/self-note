### redis
1. 数据保存在内存中
2. 数据断电后会丢失
3. 保存操作频率高的数据
4. 能够保存数据量不大

### mysql
1. 数据保存到硬盘中
2. 断电后，数据不会丢失
3. 能够保存大量数据

### 安装redis
[参考文章](http://www.runoob.com/redis/redis-install.html)

### redis命令
1. set key val 设值
2. get key 取值
3. keys * 查询所有键
4. del key 删除对应键值
5. redis-server.exe redis.windows.conf 在redis目录下启动redis服务
6. redis-cli.exe -h 127.0.0.1 -p 6379 启动redis客户端