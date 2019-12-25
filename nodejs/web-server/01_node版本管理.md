### node版本管理

使用```nvm```进行node版本管理

windows下安装nvm，在github中搜索nvm-windows进行下载

安装完成后，用nvm install v10.15.0安装node
查询安装好的所有node版本：nvm list
切换node版本：nvm use --delete-prefix 8.0.0

nvm命令报错解决：https://www.cnblogs.com/cencenyue/p/10430618.html

快速删除node_modules: 
> 1.npm install rimraf -g
> 2.rimraf node_modules
