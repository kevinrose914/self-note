/********************let ,const****************************/ 
var a = []
for (let i = 0; i < 10; i++) {
    a[i] = function() {
        console.log(i)
    }
}
a[6]() // 6

var temp = new Date()
function f() {
    console.log(temp)
    if (false) {
        var temp = 'asd'
    }
}
f() // undefined, if内部的temp变量提升覆盖了外部

function f1() {
    let a = 1
    let b = 2
    if (true) {
        console.log(b) // 2  [由于作用域链的原因，可以拿到b的值]
        let a = 2
    }
    console.log(a)
}
f1() // 1  [if里面的a和外面的a由于是被let声明，固不在同一个作用域]

function f2() {
    const a = []
    a[0] = 1
    // a = [1,2] // 报错
    console.log(a)
}
f2()

function f3() {
    var a = 3
    // let a = 4 // 报错，重复声明
    console.log(a)
}
f3()



/********************变量的解构赋值****************************/ 
import { resolve } from './es6-02.js'
resolve()

/********************扩展****************************/ 
import { enhancer } from './enhancer.js'
// enhancer.stringProto()
// enhancer.numberProto()
// enhancer.functionProto()
// enhancer.arrayProto()
// enhancer.objectProto()

/********************symbol，set， map结构****************************/ 
import { newType } from './symbol-map-set'
// newType.symbols()
// newType.sets()
newType.maps()