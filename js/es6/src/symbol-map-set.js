export const newType = {
    symbols() {
        (function() {
            var f = Symbol('a')
            console.log(f) // Symbol(a)
            console.log(Symbol('b') === Symbol('b')) // false
        })();
        (function() {
            var f = Symbol.for('a')
            var g = Symbol.for('a')
            console.log(f === g) // true, Symbol.for会在全局环境中登记传入传入的字符串，可以在不同的 iframe 或 service worker 中取到同一个值
            // 如果发现字符串被登记过，那么就直接返回那个symbol，否则创建一个新的symbol
        })();
        (function() {
            var g = Symbol('a')
            var f = Symbol.for('b')
            console.log(Symbol.keyFor(g), Symbol.keyFor(f)) //undefined, b
            // 必须要通过Symbol.for(xx)登记后，才能用Symbol.keyFor查找
        })();
        (function() {
            class Person {
                static [Symbol.hasInstance](obj){
                    return obj instanceof Array
                }
            }
            var a = {}
            var b = new Array()
            console.log(a instanceof Person) // false
            console.log(b instanceof Person) // true
        })()
    },
    sets() {
        (function() {
            let s = new Set()
            s.add('11')
            s.add('res')
            s.add('11as')
            s.add(14)
            console.log(s) // Set(4) {"11", "res", "11as", 14}

            var arr = [...s]
            console.log(arr) // ["11", "res", "11as", 14]
        })();
        (function() {
            var s = new Set([1,2,2,3,4,3,5,6])
            console.log([...s]) // [1, 2, 3, 4, 5, 6] 数组去重

            var s = new Set('aasdsfg')
            console.log(s) // {"a", "s", "d", "f", "g"}
            console.log([...s].join('')) // asdfg  字符串去重
        })();
        (function() {
            var s = new Set([1,'s',3,4,5])
            for(let i of s.keys()) {
                console.log(i) // 1 s 3 4 5
            }
            for(let i of s.values()) {
                console.log(i) // 1 s 3 4 5
            }
            for(let i of s.entries()) {
                console.log(i) // [1,1] [s,s] [3,3] [4,4] [5,5]
            }
        })();
        (function() {
            var s = new Set([1,'w',3,4])
            s.forEach((k, i) => {
                console.log(k) // 1 w 3 4
                console.log(i) // 1 w 3 4
            })
        })();
        (function() {
            var arr = [1,2,3,4]
            var arr2 = [5,6,2,3,7]
            var arr3 = [7,8,2,3]
            var bing = [...new Set([...arr,...arr2,...arr3])]
            console.log(bing) // [1, 2, 3, 4, 5, 6, 7, 8] 求三个的并集

            var arr_s = new Set(arr)
            var arr2_s = new Set(arr2)
            var arr3_s = new Set(arr3)
            var jiao = [...new Set([...arr_s].filter(i => arr2_s.has(i) && arr3_s.has(i)))]
            console.log(jiao) // [2, 3] 求交集

            var cha = [...new Set([...arr_s].filter(i => !arr2_s.has(i) && !arr3_s.has(i)))]
            console.log(cha) // [1, 4] 求差集
        })();
    },
    maps() {
        (function() {
            var m = new Map()
            m.set(name, 'rose')
            m.set({p: 'a'}, 'obj')
            console.log(m) // {"" => "rose", {…} => "obj"}
            console.log(m.get(name)) // rose
            console.log(m.has(name)) // true
            m.delete(name)
            console.log(m) // {{…} => "obj"}

            var m2 = new Map([
                ['name', '111'],
                [1,2]
            ])
            console.log(m2) // {"name" => "111", 1 => 2}
        })();
        (function() {
            var m = new Map()
            m.set(['a'], 1)
            console.log(m.get(['a'])) // undefined, 两次['a']不是指向内存中的同一个地址

            var arr = ['b']
            m.set(arr, 22)
            console.log(m.get(arr)) // 22
        })();
        (function() {
            var m = new Map([[1,2], [3,4]])
            console.log([...m]) // [Array(2), Array(2)]
            console.log([...m].flat(Infinity)) // [1, 2, 3, 4]
        })();
    }
}