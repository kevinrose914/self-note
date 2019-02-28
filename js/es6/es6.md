# let const
*let: 
> 只作用于当前作用域
> 不存在变量提升,必须声明后才能用
> 相同作用域内，不允许重复声明同一个变量
> 为js新增了块级作用域
块级作用域的出现，可以取代自执行函数
```js
(function(){
    var temp = 'xxx'
}());
// 被取代为
{
    let temp = 'xxx'
}
```
*const：
> 声明一个只读的常量，其保证的并不是变量的值不得改动，而是变量指向的那个内存地址所保存的数据不得改动
> > 对于简单类型数据（数值、布尔值、字符串），值就保存在内存中，而对于复合类型数据，变量指向的内存地址保存的是一个指针
> 作用域与let相同
> 不存在变量提升
> 相同作用域内，不允许重复声明同一个变量
*Object.freeze({}): 冻结对象
```js
const foo = Object.freeze({})
foo.name = 'a' // 常规模式下不起作用，严格模式下会报错
```
除了将一个对象本身冻结，对象的属性也应该冻结
```js
var freeze = (obj) => {
    Object.freeze(obj)
    Object.keys(obj).forEach((k, i) => {
        if (typeof obj[k] === 'object') {
            freeze(pbj[k])
        }
    })
}
```
*es6声明变量的6种方法：var, function, let, const, import, class

# 变量的解构赋值,及扩展
*字符串的扩展
```includes()```, ```startsWith()```, ```endsWith()```, ```repeat()```, ```padStart()```, ```padEnd()```
```js
function f1() {
    let s = 'qwerfwefwg'
    console.log(s.startsWith('qwer')) // true
    console.log(s.includes('rfwe')) // true
    console.log(s.endsWith('fwg')) // true
    console.log(s.startsWith('qwer', 2)) // false
    console.log(s.includes('rfwe', 0)) // true
    console.log(s.endsWith('fwg', 1)) // false
}
function f2() {
    let a = 'qwe'
    console.log(a.repeat(2)) // qweqwe
}
function f3() {
    let a = 'x'
    console.log(a.padStart(5, 'qwe')) // qweqx
    console.log(a.padEnd(5,'qwe')) // xqweq
}
```
# 数值的扩展
```isFinite()```是否有限， ```isNaN()```是否不是一个数
```js
function f1() {
    console.log(Number.isFinite(15)) // true
    console.log(Number.isFinite(Infinity)) // false
    console.log(Number.isFinite(-Infinity)) // false
    console.log(Number.isFinite('15')) // false
    console.log(Number.isNaN(NaN)) // true

    isFinite(25) // true
    isFinite("25") // true
    Number.isFinite(25) // true
    Number.isFinite("25") // false

    isNaN(NaN) // true
    isNaN("NaN") // true
    Number.isNaN(NaN) // true
    Number.isNaN("NaN") // false
    Number.isNaN(1) // false
}
```
它们与传统的全局方法```isFinite()```和```isNaN()```的区别在于，传统方法先调用Number()将非数值的值转为数值，再进行判断，而这两个新方法只对数值有效，```Number.isFinite()```对于非数值一律返回false, Number.isNaN()只有对于NaN才返回true，非NaN一律返回false
```isInteger()``` 是否为整数，参数必须为数值，否则一律返回false
```js
function f2() {
    console.log(Number.isInteger(15)) // true
    console.log(Number.isInteger('15')) // false
}
```
```Number.EPSILON```: javascript能够表示的最小精度，一般作用：两个浮点数的差值如果小于这个值，那么就认为这两个浮点数相等
由于0.1 + 0.2 === 0.3 这个值为false，故可以用这个最小精度，再次加以判断
```js
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
```
```Number.isSafeInteger()```: 是否为安全的整数<br/>
整数上下限[```Number.MAX_SAFE_INTEGER```, ```Number.MIN_SAFE_INTEGER```]<br/>
```Math.trunc()```: 去除一个数的小数部分<br/>
对于非数值，Math.trunc内部使用Number方法将其先转为数值<br/>
对于空值和无法截取整数的值，返回NaN<br/>
```js
function f4() {
    console.log(Math.trunc(2.31)) // 2
}
```
```Math.sign```方法用来判断一个数到底是正数、负数、还是零。对于非数值，会先将其转换为数值<br/>
参数为正数：返回+1，负数：-1，0： 0，-0： -0， 其他值： NaN
```js
function f5() {
    console.log(Math.sign(2)) // 1
    console.log(Math.sign(-2)) // -1
    console.log(Math.sign(0)) // 0
    console.log(Math.sign(0.23)) // 1
    console.log(Math.sign('0.23')) // 1
    console.log(Math.sign('aaa')) // NaN
}
```
# 函数的扩展
函数的```length属性```，形参的个数
```js
function f1() {
    function a(q,w,e,r) {

    }
    console.log(a.length) // 4
    function a(q,w,e,r=3) {

    }
    console.log(a.length) // 3, 函数参数值有默认值时，该参数不参与计算length
}
```
es6中引入```rest参数```，用于获取函数的多余参数,同样这个rest参数不参与计算函数的length
```js
function f2() {
    function a(...rest) {
        console.log(rest) // [1,2,3,4]
    }
    console.log(a(1,2,3,4))
}
```
函数的```name属性```，返回该函数的函数名<br />
```箭头函数```的使用注意点：
1. 函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象，任何采用call,bind,apply该变其运行时的this指向都没用
2. 不可以当作构造函数，也就是说，不可以使用new命令，否则会抛出一个错误
3. 不可以使用arguments对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替
4. 不可以使用yield命令，因此箭头函数不能用作 Generator 函数
箭头函数中，```this```始终指向创建时的作用域，箭头函数自己没有this
```js
// ES6
function foo() {
  setTimeout(() => {
    console.log('id:', this.id);
  }, 100);
}

// ES5
function foo() {
  var _this = this;

  setTimeout(function () {
    console.log('id:', _this.id);
  }, 100);
}
```
除了this，以下三个变量在箭头函数之中也是不存在的，指向外层函数的对应变量：```arguments```、```super```、```new.target```
```js
function f4(a,b) {
    let slice = Array.prototype.slice
    return () => {
        console.log(slice.call(arguments)) // [1,2],这里并不是[3,4]
    }
}
f4(1,2)(3,4)
```
```js
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
```
```双冒号运算符```提案：双冒号左边是一个对象，右边是一个函数。该运算符会自动将左边的对象，作为上下文环境（即this对象），绑定到右边的函数上面
```尾调用```：某个函数最后一步调用另一个函数
```js
function f1() {
    return g(x) // 必须满足这样的格式
}
```
一下格式的都不是尾调用
```js
// 情况一
function f(x){
  let y = g(x);
  return y;
}

// 情况二
function f(x){
  return g(x) + 1;
}

// 情况三
function f(x){
  g(x);
}
```
```尾调用优化```：每个函数调用时，会生成调用帧，当一个函数完了后，该调用帧就会自行销毁。当存在嵌套函数调用时，会形成一系列调用帧。故把嵌套函数放在外层函数的最后一步，用内层函数的调用帧取代外层函数，避免暂用更多内存。如果外层函数的某个变量，在内存函数中有引用，则不会形成优化。ES6 的尾调用优化只在严格模式下开启，正常模式是无效的,这是因为在正常模式下，函数内部有两个变量，可以跟踪函数的调用栈(arguments, caller)
```尾递归```：在递归函数中用尾调用
```js
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}

factorial(5) // 120， 此时复杂度为O(n)
```
```js
function factorial(n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5, 1) // 120, 此时复杂度为O(1)
```
求阶乘函数的改写
```js
// 没有用尾递归
function f5(n) {
    if (n === 1) {
        return 1
    } else {
        return n * f5(n-1)
    }
}
console.log(f5(5)) // 120
// 用了尾递归
function f6(n, total) {
    if (n === 1) {
        return total 
    } 
    return f6(n - 1, n * total)
}
console.log(f6(5， 1)) // 120
// 包装一下尾递归
function count(n) {
    return f6(n, 1)
}
console.log(count(5)) // 120
// 利用函数柯里化包装尾递归
function currying(fn, total) {
    return function(n) {
        return fn.call(this, n, total)
    }
}
var c = currying(f6, 1)
console.log(c(5)) // 120
// 利用es6的函数默认值
function f6(n, total=1) {
    if (n === 1) {
        return total 
    } 
    return f6(n - 1, n * total)
}
console.log(f6(5)) // 120
```
在普通模式下通过函数包装实现尾递归
```js
var optimiz = function(fn, returnValue?) {
    let currentArgs = [], active = false, value
    return function() {
        currentArgs.push(arguments)
        if (!active) { // active是关键
            active = true
            while(currentArgs.length > 0) {
                value = fn.apply(this, currentArgs.shift())
            }
            active = false
            returnValue && return value
        }
    }
}
var count = optimiz(function(n, total) {
    if (n === 1) {
        return total
    }
    return count(n-1, n*total)
})
// optimiz函数的最后造成count()的执行不到最后一次，是没有返回值的，这样就将递归执行变成了循环执行。只有到了最后一次循环，count()才会有返回值
```
不能想下面那样去用optimiz函数
```js
var e = f8(function(n) {
    if (n === 1) {
        return 1
    }
    return n * e(n-1) // 不能这样去写，因为尾递归函数中的value要到最后一步才return出来
})
console.log(e(5), '111') // 1
// 所以这个函数必须也是一个尾调用函数，才能正常运行
```

# 数组的扩展
```扩展运算符```: 将数组转换成用逗号分隔的参数序列， 其可以替代es5的apply分割数组参数的方法
```js
(function f1() {
    let arr = [1,2,3]
    console.log(...arr) // 1,2,3
    let arr1 = [4,5]
    arr1.push(...arr)
    console.log(arr1) // [4,5,1,2,3]
})()
// es5
function a(x, y, z) {...}
var arr = [1,2,3]
a.apply(null, arr)
// 替代es5
a(...arr)
```
```扩展运算符```的运用
1. 复制数组
```js
//es5
var arr = [1,2]
var arr2 = arr.concat()
// now,两种写法都可以
arr2 = [...arr]
[...arr2] = arr
```
2. 合并数组
```js
var arr = [1,2]
var arr2 = [3,4]
var arr3 = arr.concat(arr2)
// now
var arr3 = [...arr, ...arr2]
```
3. map,set结构也可以用扩展运算符
```js
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
})()
```
```Array.from```: 将类数组的对象和可遍历的对象转为真正的数组,一般用于dom对象，或者函数arguments，或者Set结构，可以用Array.prototype.slice来代替
```Array.of```：用于将一组值，转换为数组
```js
(function() {
    console.log(Array.of(1,2,3)) // [1,2,3]
})()
```
```find(),findIndex()```: find()返回第一个符合条件的成员, findIndex()返回第一个符合条件的成员位置
```js
(function() {
    var arr = [1,2,3,4,5]
    var value = arr.find(i => i > 3)
    console.log(value) // 4
    var value2 = arr.find(function(i) {
        return i > this.number
    }, {number: 4})
    console.log(value2) // 5
})()
```
```查找数组中是否存在NaN```
```js
(function() {
    var arr = [1,2,NaN,3]
    console.log(arr.indexOf(NaN)) // -1, indexOf找不到
    var index = arr.findIndex(i => Object.is(NaN, i))
    console.log(index) // 2,借助于findIndex以及Object.is可以找到NaN
})()
```
```keys(), values(), entries()```
```js
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
})()
```
```includes()```: 返回一个布尔值，表示某个数组是否包含给定的值, 与字符串的includes方法类似, 该方法的第二个参数表示搜索的起始位置
```flat()```: 多维数组转一维数组
```js
(function() {
    var arr = [1,2,[3,4],[5,6,[7,8,[9,10]]]]
    console.log(arr.flat(Infinity)) // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
})()
```

# 对象的扩展
```Object.getOwnPropertyDescriptor(target, key)```: 获取属性的描述对象
```js
(function() {
    let obj = {
        name: 'sd'
    }
    console.log(Object.getOwnPropertyDescriptor(obj, 'name')) 
    // {value: "sd", writable: true, enumerable: true, configurable: true}
})()
// 有四个操作会忽略enumerable为false的属性
// for...in, Object.keys(), JSON.stingify(), Object.assign()
```
```Object.getOwnPropertyNames(target)```: 返回一个数组，包含对象自身的所有属性（不含 Symbol 属性，但是包括不可枚举属性）的键名
```Object.keys(target)```: 返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含 Symbol 属性）的键名
```Object.getOwnPropertySymbols(target)```: 返回一个数组，包含对象自身的所有 Symbol 属性的键名
```Reflect.ownKeys(target)```: 返回一个数组，包含对象自身的所有键名，不管键名是Symbol或字符串，也不管是否可枚举
```super关键字```: 指向当前对象的原型对象
```js
(function() {
    var person = {
        say: function() {
            return this.name
        }
    }
    var foo = {
        name: 'qwer',
        say() {// 只能这样书写，super才能用
            return super.say()
        }
    }
    Object.setPrototypeOf(foo, person) // 设置原型
    console.log(foo.say()) // qwer
})()
```
```js
(function() {
    var obj = { name: 'qwe', age: 18 }
    var obj2 = { ...obj }
    console.log(obj2) // { name: 'qwe', age: 18 }
})()
```
```Object.is(param1, param2)```: 比较param1和param2是否严格相等，等同于===
```Object.keys()```: 返回一个数组，成员是参数对象自身的（不含继承的）所有可遍历（enumerable）属性的键名
```Object.values()```: 方法返回一个数组，成员是参数对象自身的（不含继承的）所有可遍历（enumerable）属性的键值
```Object.entries()```: 方法返回一个数组，成员是参数对象自身的（不含继承的）所有可遍历（enumerable）属性的键值对数组
```Object.fromEntries()```: 是Object.entries()的逆操作
```Object.create()```
```js
// Object.create方法的第二个参数添加的对象属性，如果不显式声明，默认是不可遍历的
const obj = Object.create({}, {p: {value: 42}});
Object.values(obj) // []

const obj = Object.create({}, {p:
  {
    value: 42,
    enumerable: true
  }
});
Object.values(obj) // [42]
```
