mysql下载地址：https://dev.mysql.com/downloads/mysql/
mysql workbench下载地址：https://downloads.mysql.com/archives/workbench/


### sql语句
use myblog;

-- 展示所有表
-- show tables;

-- 插入操作
-- insert into users (username,`password`,realname) values ('lisi','123','李四');

-- 从表里面选择
-- select * from users;
-- select id, username from users

-- 按条件查询
-- select * from users where username='zhangsan' and `password`='123';
-- select * from users where username='zhangsan' or `password`='123';
-- 模糊查询
-- select * from users where username like '%zhang%';
-- 排序
-- select * from users where `password` like '%1%' order by id;
-- 逆序
-- select * from users where `password` like '%1%' order by id desc;
-- 更新
-- update users set realname='李四2' where username='lisi';
-- 解决更新时报错的问题
-- SET SQL_SAFE_UPDATES = 0;
-- 删除
-- delete from users where username='lisi';
-- 查询state等于0
-- select * from users where state='1';
-- 查询state不等于0
-- select * from users where state<>'0';
-- 用改变状态来代替删除，不是真正的删除
-- update users set state='0' where username='lisi';
-- 查看mysql版本
select version();

### 解决链接mysql报错Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client
起因：mysql8.0加密方式的原因报错。
解决办法：
cmd中执行指令
1. 改密码：mysql -u root -p
2. use mysql;
3. alter user 'root'@'localhost' identified with mysql_native_password by '123456'; 123456为密码
4. flush privileges;