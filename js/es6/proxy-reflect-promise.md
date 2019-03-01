# proxy
```proxy```：对象属性的访问和设置的前面，建立一个方法
```js
(function(){
    var target = {}
    var p = new Proxy(target, {
        get(target, key) {
            return target[key]
        }
    })
    p.a = 3
    console.log(p.a, target.a) // 3, 3
})();
```
```proxy```作为对象的原型存在
```js
(function() {
    var p = new Proxy({}, {
        get(target, key) {
            return target[key]
        }
    })
    p.time = 12
    var obj = Object.create(p)
    console.log(obj.time) // 12, obj 继承了p
    p.number = 5
    console.log(obj.number) // 5
})()
```
```proxy```支持的拦截操作
1. get(target, propKey, receiver)：拦截对象属性的读取
2. set(target, propKey, value, receiver)：拦截对象属性的设置
3. has(target, propKey)：拦截propKey in proxy的操作，返回一个布尔值
4. deleteProperty(target, propKey)：拦截delete proxy[propKey]的操作，返回一个布尔值
5. ownKeys(target)：拦截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)、for...in循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而Object.keys()的返回结果仅包括目标对象自身的可遍历属性
6. getOwnPropertyDescriptor(target, propKey)：拦截Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象
7. defineProperty(target, propKey, propDesc)：拦截Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一个布尔值
8. preventExtensions(target)：拦截Object.preventExtensions(proxy)，返回一个布尔值
9. getPrototypeOf(target)：拦截Object.getPrototypeOf(proxy)，返回一个对象
10. isExtensible(target)：拦截Object.isExtensible(proxy)，返回一个布尔值
11. setPrototypeOf(target, proto)：拦截Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截
12. apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作，比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(...)
13. construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作，比如new proxy(...args)

用```proxy```实现函数链式调用
```js
(function() {
    let funcsObj = {
        double: n => n * 2,
        triple: n => n * 3
    }
    let chain = function(value) {
        let _context = this
        let funcArys = []
        let proxy = new Proxy({}, {
            get(target, key) {
                if (key === 'get') {
                    return funcArys.reduce(function(prev, next) {
                        return next(prev)
                    }, value)
                } else {
                    funcArys.push(_context[key])
                    return proxy
                }
            }
        })
        return proxy
    }
    console.log(chain.call(funcsObj, 3).double.triple.get) // 18  3*2*3=18
})();
```
复习redux的compose函数
```js
(function() {
    var funcs = {
        two: n => n * 2,
        three: n => n * 3,
        four: n => n * 4,
        five: n => n * 5
    }
    var funcsAry = Object.keys(funcs).map(f => funcs[f])
    function compose(ary) {
        return ary.reduce((prevf, nextf) => {
            return function() {
                return prevf(nextf.apply(null, [...arguments]))
            }
        })
    }
    var newFunc = compose(funcsAry)
    console.log(newFunc(1)) // 120
})();
```
get方法的第三个参数```receiver```
```js
(function() {
    var p = new Proxy({}, {
        get(target, key, receiver) {
            return receiver // 指向proxy对象
        }
    })
    console.log(p.a, p.a === p) // Proxy {}, true
})();
```
