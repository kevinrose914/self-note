const recast = require('recast');

recast.run(function(ast, printSource) {
    // printSource(ast); // 打印源码
    recast.visit(ast, {
        visitExpressionStatement: function({node}) {
            printSource(node)
            return false
        }
    })
})