# symbol
```Symbol(xx)```: 创建一个独一无二的值
```Symbol.for(xx)```: 首先检查全局环境中有无xx被登记，若没有，创建一个独一无二的symbol值，并将xx登记到全局环境；如果xx被登记，则返回登记了xx的symbol值
```Symbol.keyFor(xx)```: 返回用Symbol.for(xx)生成的symbol值得登记名
```js
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
})()
```
```Symbol.hasInstance```: 指向一个内部方法。当其他对象使用instanceof运算符时，会调用这个方法
```js
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
```

# set
```js
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
})()
```
```Set.prototype.size```： 返回实例成员总数
```Set.prototype.add```： 添加某个值，返回 Set 结构本身
```Set.prototype.delete```： 删除某个值，返回一个布尔值，表示删除是否成功
```Set.prototype.has```： 返回一个布尔值，表示该值是否为Set的成员
```Set.prototype.clear```： 清除所有成员，没有返回值
```Set```的遍历方法：keys(),values(),entries(),forEach(),...,for...of
```js
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
})()
```
```js
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
```

# map
```map```是类似于对象的键值对，但比对象强大，键可以是任意类型
```js
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
```
```js
(function() {
    var m = new Map()
    m.set(['a'], 1)
    console.log(m.get(['a'])) // undefined, 两次['a']不是指向内存中的同一个地址

    var arr = ['b']
    m.set(arr, 22)
    console.log(m.get(arr)) // 22
})();
```
```Map```的遍历方法：keys(),values(),entries(),forEach(),for...of,同Set
```js
(function() {
    var m = new Map([[1,2], [3,4]])
    console.log([...m]) // [Array(2), Array(2)]
    console.log([...m].flat(Infinity)) // [1, 2, 3, 4]
})();
```