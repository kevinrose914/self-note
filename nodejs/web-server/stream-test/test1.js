// demo1 标准输入输出
// process.stdin.pipe(process.stdout)

// demo2 http
// const http = require('http')

// const server = http.createServer((req, res) => {
//     if (req.method === 'POST') {
//         req.pipe(res)
//     }
// })

// server.listen(8003)

// demo3 复制文件
const path = require('path')
const fs = require('fs')

const fileName1 = path.resolve(__dirname, 'data.txt')
// const fileName2 = path.resolve(__dirname, 'data-bak.txt')

// const readStream = fs.createReadStream(fileName1)
// const writeStream = fs.createWriteStream(fileName2)

// readStream.pipe(writeStream)

// readStream.on('data', chunk => {
//     console.log('chunk:', chunk.toString())
// })

// readStream.on('end', () => {
//     console.log('copy done')
// })

// demo4 通过http读取文件
const http = require('http')

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        const readStream = fs.createReadStream(fileName1)
        readStream.pipe(res)
        readStream.on('end', () => {
            console.log('read over!')
        })
    }
})

server.listen(8003)