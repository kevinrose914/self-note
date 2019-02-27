export const enhancer = {
    stringProto: () => {
        function f1() {
            let s = 'qwerfwefwg'
            console.log(s.startsWith('qwer')) // true
            console.log(s.includes('rfwe')) // true
            console.log(s.endsWith('fwg')) // true
            console.log(s.startsWith('qwer', 2)) // false
            console.log(s.includes('rfwe', 0)) // true
            console.log(s.endsWith('fwg', 1)) // false
        }
        f1()
        function f2() {
            let a = 'qwe'
            console.log(a.repeat(2)) // qweqwe
        }
        f2()
        function f3() {
            let a = 'x'
            console.log(a.padStart(5, 'qwe')) // qweqx
            console.log(a.padEnd(5,'qwe')) // xqweq
        }
        f3()
    },
    numberProto: () => {
        function f1() {
            console.log(Number.isFinite(15)) // true
            console.log(Number.isFinite(Infinity)) // false
            console.log(Number.isFinite(-Infinity)) // false
            console.log(Number.isFinite('15')) // false
            console.log(Number.isNaN(NaN)) // true
        }
        function f2() {
            console.log(Number.isInteger(15)) // true
            console.log(Number.isInteger('15')) // false
        }
        function f3() {
            let a = 0.1 + 0.2
            let b = 0.3
            console.log(a == b) // false
            console.log(Math.abs(a-b) < Number.EPSILON) // true
            function widthinErrorMargin(left, right) {
                return Math.abs(left-right) < Number.EPSILON * Math.pow(2, 2) // 误差范围设为 2 的-50 次方
            }
            console.log(widthinErrorMargin(a, b)) // true
        }
        function f4() {
            console.log(Math.trunc(2.31)) // 2
        }
        function f5() {
            console.log(Math.sign(2)) // 1
            console.log(Math.sign(-2)) // -1
            console.log(Math.sign(0)) // 0
            console.log(Math.sign(0.23)) // 1
            console.log(Math.sign('0.23')) // 1
            console.log(Math.sign('aaa')) // NaN
        }
        f1()
        f2()
        f3()
        f4()
        f5()
    },
    functionProto: () => {
        function f1() {
            function a(q,w,e,r) {

            }
            console.log(a.length) // 4
            function b(q,w,e,r=3) {

            }
            console.log(b.length) // 3
        }
        function f2() {
            function a(...rest) {
                console.log(rest) // [1,2,3,4]
            }
            a(1,2,3,4)
        }
        function f3() {
            console.log(this, 'qwe')
            const cat = {
                lives: 9,
                jumps: () => {
                    console.log(this) // 没有指向cat,其指向的是定义cat时候的this
                }
            }
            cat.jumps()
        }
        function f4(a,b) {
            let slice = Array.prototype.slice
            return () => {
                console.log(slice.call(arguments)) // [1,2],这里并不是[3,4]
            }
        }
        function f5(n) {
            if (n === 1) {
                return 1
            } else {
                return n * f5(n-1)
            }
        }
        function f6(n, total) {
            if (n === 1) {
                return total 
            } 
            return f6(n - 1, n * total)
        }
        function count(n) {
            return f6(n, 1)
        }
        function currying(fn, total) {
            return function(n) {
                return fn.call(this, n, total)
            }
        }
        f1()
        f2()
        f3()
        f4(1,2)(3,4)
        console.log(f5(5))
        console.log(f6(5, 1))
        console.log(count(5))
        var c = currying(f6, 1)
        console.log(c(5))
    }
}