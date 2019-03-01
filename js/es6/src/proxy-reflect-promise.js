export const proxyReflectPromise = {
    proxys: function() {
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
        (function() {
            var superObj = {}
            var foo = {
                proxy: new Proxy(superObj, {
                    get(target, key) {
                        return target[key]
                    }
                })
            }
            foo.proxy.a = 3
            console.log(superObj.a) // 3
        })();
        (function() {
            var p = new Proxy({}, {
                get(target, key) {
                    return target[key]
                }
            })
            p.time = 12
            var obj = Object.create(p)
            console.log(obj.time) // 12
            p.number = 5
            console.log(obj.number) // 5
        })();
        (function() {
            var p = new Proxy(function(x,y,z) {
                return x+y+z
            }, {
                get(target, key) {
                    if (key === 'prototype') {
                        return Object.prototype
                    }
                    return target[key]
                },
                apply(target, thisBinding, args) {
                    return args
                },
                construct(target, args) {
                    return { value: args }
                }
            })
            console.log(p(1,2,3)) // [1,2,3], 调用的apply
            console.log(new p(1,2,3)) // { value: [1,2,3] }, 调用construct
            console.log(p.prototype === Object.prototype) // true
            p.a = 111
            console.log(p.a) // 111
        })();
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
        (function() {
            var p = new Proxy({}, {
                get(target, key, receiver) {
                    return receiver // 指向proxy对象
                }
            })
            console.log(p.a, p.a === p) // Proxy {}, true
        })();
    }
}