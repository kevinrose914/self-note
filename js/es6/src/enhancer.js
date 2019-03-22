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
        function f7() {
            function tco(f) {
                var value;
                var active = false;
                var accumulated = [];
              
                return function accumulator() {
                    accumulated.push(arguments);
                    if (!active) {
                        active = true;
                        while (accumulated.length) {
                            value = f.apply(this, accumulated.shift());
                        }
                        active = false;
                        return value;
                    }
                };
            }
              
            var sum = tco(function(x, y) {
                if (y > 0) {
                    return sum(x + 1, y - 1)
                }
                else {
                    return x
                }
            });
            console.log(sum(1, 5), 'f7')
        }
        function f8(fn) {
            let currentArgs = [], active = false, value
            return function() {
                currentArgs.push(arguments)
                if (!active) {
                    active = true
                    while(currentArgs.length) {
                        value = fn.apply(this, currentArgs.shift())
                    }
                    active = false
                    return value
                }
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
        f7()
        var d = f8(function(n, total = 1) {
            if (n === 1) {
                return total
            }
            return d(n-1, n * total)
        })
        // console.log(d(5), 'asdf') // 120
        var e = f8(function(n) {
            if (n === 1) {
                return 1
            }
            return n * e(n-1) // 不能这样去写，因为尾递归函数中的value要到最后一步才return出来
        })
        console.log(e(5), '111')
    },
    arrayProto: () => {
        (function f1() {
            let arr = [1,2,3]
            console.log(...arr) // 1,2,3
            let arr1 = [4,5]
            arr1.push(...arr)
            console.log(arr1) // [4,5,1,2,3]
        })();
        (function(){
            var set = new Set([1,2,3,4])
            var [...arr] = set 
            var arr2 = [...set]
            console.log(arr, arr2) // [1,2,3,4],[1,2,3,4]
            
            var map = new Map([
                ['name', 'qwer'],
                ['age', 18]
            ])
            console.log(...map.keys()) // name, age
        })();
        (function() {
            console.log(Array.of(1,2,3)) // [1,2,3]
        })();
        (function() {
            var arr = [1,2,3,4,5]
            var value = arr.find(i => i > 3)
            console.log(value) // 4
            var value2 = arr.find(function(i) {
                return i > this.number
            }, {number: 4})
            console.log(value2) // 5
        })();
        (function() {
            var arr = [1,2,NaN,3]
            console.log(arr.indexOf(NaN)) // -1, indexOf找不到
            var index = arr.findIndex(i => Object.is(NaN, i))
            console.log(index) // 2,借助于findIndex以及Object.is可以找到NaN
        })();
        (function() {
            var arr = [4,5,6,7]
            console.log(arr.keys()) // Interator{}
            for (let index of arr.keys()) {
                console.log(index); // 0 1 2 3
            }
            for (let index of arr.values()) {
                console.log(index); // 4 5 6 7
            }
            for (let item of arr.entries()) {
                console.log(item); // [0, 4] [1, 5] [2, 6] [3, 7]
            }
        })();
        (function() {
            var arr = [1,2,[3,4],[5,6,[7,8,[9,10]]]]
            console.log(arr.flat(Infinity)) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        })()
    },
    objectProto: () => {
        (function() {
            let obj = {
                name: 'sd'
            }
            console.log(Object.getOwnPropertyDescriptor(obj, 'name')) 
            // {value: "sd", writable: true, enumerable: true, configurable: true}
        })();
        (function() {
            var person = {
                say: function() {
                    return this.name
                }
            }
            var foo = {
                name: 'qwer',
                say() { // 只能这样书写，super才能用
                    return super.say()
                }
            }
            Object.setPrototypeOf(foo, person) // 设置原型
            console.log(foo.say()) // qwer
        })();
        (function() {
            var obj = { name: 'qwe', age: 18 }
            var obj2 = { ...obj }
            console.log(obj2) // { name: 'qwe', age: 18 }
        })()
    }
}