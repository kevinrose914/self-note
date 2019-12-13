const fs = require('fs')
const path = require('path')

// cb
function getFileContent(filename, cb) {
    const fullFileName = path.resolve(__dirname, 'files', filename)
    fs.readFile(fullFileName, (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        cb(JSON.parse(data.toString()))
    })
}
// 通过回调的方式获取
// getFileContent('a.json', adata => {
//     console.log('adata:', adata)
//     getFileContent(adata.next, bData => {
//         console.log('bData:', bData)
//         getFileContent(bData.next, cdata => {
//             console.log('cdata:', cdata)
//         })
//     })
// })

// promise获取文件内容
function getFileContentByPromise(filename) {
    const promise = new Promise((resolve, reject) => {
        const fullFileName = path.resolve(__dirname, 'files', filename)
        fs.readFile(fullFileName, (err, data) => {
            if (err) {
                reject(err)
                return
            }
            resolve(JSON.parse(data.toString()))
        })
    })
    return promise;
}
getFileContentByPromise('a.json').then(adata => {
    console.log('adata:', adata)
    return getFileContentByPromise(adata.next)
}).then(bdata => {
    console.log('bdata:', bdata)
    return getFileContentByPromise(bdata.next)
}).then(cdata => {
    console.log('cdata:', cdata)
})