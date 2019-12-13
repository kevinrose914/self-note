const http = require('http');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
    // 请求方式
    const method = req.method;
    // 请求路径
    const url = req.url;
    // 路由
    const path = url.split('?')[0];
    // 路径后面的参数
    const query = querystring.parse(url.split('?')[1]);
    console.log('url:', url);
    console.log('method:', method);
    console.log('path:', path); // 路由
    if (method === 'POST') {
        console.log('content-type:', req.headers['content-type']);
        // 接收数据
        let postdata = '';
        req.on('data', (chunk) => { // chunk是二进制
            console.log('chunk:', chunk, chunk.toString());
            postdata += chunk.toString();
        })
        req.on('end', () => {
            console.log('postdata:', postdata);
            res.end('hellow world');
        })
    } else if (method === 'GET') {
        req.query = query;
        console.log('query:', req.query);
        res.end(JSON.stringify(req.query));
    }
});

server.listen(3000, () => {
    console.log('listening on 3000 port');
});