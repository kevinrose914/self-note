### http-server
1. 全局安装: npm install http-server -g
2. http-server的启动：在目标文件目录下，http-server -p 8001


### nginx
> 一般用于静态服务、负载均衡
> 反向代理

### nginx下载
[windows下nginx下载地址](http://nginx.org/en/download.html)
Mac: brew install nginx

### nginx配置
windows: C:\nginx\conf\nginx.conf
mac: /usr/local/etc/nginx/nginx.conf

### nginx命令
```mac下```
1. 测试配置文件格式是否正确：nginx -t
2. 启动：nginx
3. 重启：nginx -s reload
4. 停止：nginx -s stop
```windows```：在nginx根目录下
1. 启动：nginx.exe
2. 停止：nginx.exe -s stop 或者 nginx.exe -s quit
3. 重启：nginx.exe -s reload
4. 重新打开日志文件：nginx.exe -s reopen