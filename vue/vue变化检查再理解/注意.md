1. Observe类中，dep实例化的位置对更新的影响
```js
class Observe {
    constructor(data) {
        this.__ob__ = this
        this.dep = new Dep()
        /**如果是放在这儿
         * 1. 首先在get过程收集依赖的时候，会收集当前target下所有key对应的watcher
         * 2. 在set的时候，也会通知当前target下所有key对应的watcher去执行更新操作
         * 3. 这个较之于下面那个，定位得稍微粗略一点
         * **/
        if (Array.isArray(data)) {
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }
    // xxx
    defineReactive(target, key, value) {
        let dep = new Dep()
        /**如果是放在这儿
         * 1. 首先在get过程收集依赖的时候，只会收集当前key对应的watcher
         * 2. 在set的时候，也只会通知当前key对应的watcher去执行更新操作
         * 3. 这个较之于上面那个，定位得要细致一点
         * **/
        Object.defineProperty(target, key, {
            // enumerable: true,
            configurable: true,
            get: function() {
                dep.depend()
                return value
            },
            set: function(newVal) {
                if (value === newVal) {
                    return
                }
                value = newVal
                observe(newVal)
                dep.notify()
            }
        })
    }
}
/**
 * 上面两种情况都需要放置，作用就是用来处理array数组的数据
*/
```
```childOb处理array类型的数据```
1. 首先看Observe类的代码，可以知道，array是无法进入defineReactive里面去收集依赖的
2. 无法收集依赖，意味着当array执行push，splice，pop，shift等操作时，数组因为没有依赖，所以无法实现更新
3. 此时，能不能让数组在不进入defineReactive函数的前提下，强行去收集依赖呢？
```js
function observe (data) {
    if (!data || typeof data !== 'object') {
        return
    }
    return new Observe(data)
}
// 定义属性
function def(target, key, value, enumerable) {
    Object.defineProperty(target, key, {
        enumerable: !!enumerable,
        configurable: true,
        writable: true,
        value
    })
}
// 针对数组，让其递归收集依赖
function dependArray (value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i]
        /**
         * e对象数组里面的某一项数据
         * 对于非引用型数据，不需要关心dep
         * 对于引用型数据，若想要取到dep
         * 此时就要利用Observer的构造函数内的def(data, '__ob__', this)方法
         * 这个方法为数据创建了一个__ob__属性，属性指向Observer实例
         * 则这个数据就可以用__ob__.dep拿到dep，然后去depend收集依赖
        */
        e && e.__ob__ && e.__ob__.dep.depend()
        if (Array.isArray(e)) {
            dependArray(e)
        }
    }
}
class Observer {
    constructor (data) {
        def(data, '__ob__', this) 
        // 为data添加__ob__属性，属性值为当前observer，这时给array数据专门提供的访问dep的途径
        this.dep = new Dep()
        /** 
         * data所对应的dep，eg: data: {person: {name: 'rose'}},
         * 那么，这个dep就可以相当于这个键值对的键（data）所对应的dep
         * 由于array数据无法进入defineReactive函数，故要在这儿申明一个dep，
         * 这个dep就是为了数组的更新而使用
         * **/
        if (Array.isArray(data)) {
            this.observeArray(data)
        } else {
            this.walk(data)
        }
    }
    observeArray(array) {
        for (let i = 0, len = array.length; i < len; i++) {
            observe(array[i])
        }
    }
    walk(object) {
        for (let i in object) {
            this.defineReactive(object, i, object[i])
        }
    }
    defineReactive(target, key, value) {
        const dep = new Dep()
        /**
         * 此时这个dep
         * 相当于就是data: {person: {name: 'rose'}}
         * 这个键值对的值{person: {name: 'rose'}}
         * 所对应的dep
         * 其与上面那个dep可以看作成父子级关系
         * */
        const childOb = observe(value)
        /**
         * 此时childOb.dep指向的就是person: {name: 'rose'}这个键值对的键person所对应的dep
         * 以此推到，可以看作是形成了有层级关系的dep
        */
        Object.defineProperty(target, key, {
            configurable: true,
            get: function() {
                dep.depend() // 收集依赖
                if (childOb) { 
                    childOb.dep.depend()
                    /**
                     * 子级dep也要收集依赖，这个就是为array准备的
                     * 最开始分析，array数据的dep本身是不会收集依赖的
                     * 但是可以让他强行进行一次收集，就是在这儿
                     * */
                    if (Array.isArray[value]) {
                        dependArray(value)
                    }
                    /**
                     * 如果value是一个数组
                     * 则上面有一步：const childOb = observe(value)已经通过递归，为数组以及数组里面的引用类型的数据new好了observe对象，每一个observe，都会拥有一个dep
                     * 这时，通过dependArray函数，
                     * 通知array子级的dep，去强行收集这次的依赖，dep.depend()
                    */
                }
                return value
            }
        })
    }
}
```
4. 到这里依赖可以收集了，但是如何让数组在做了push等操作后，去通知这些依赖执行更新呢？
5. 此时需要做的就是，拦截push等操作
```js
const arrayProto = Array.prototype // 获取数组的原型上的方法
const arrayMethodObj = Object.create(arrayProto) // 创建一个对象，将其原型指向arrayProto
const operateAry = ['push', 'pop', 'shift', 'unshift', 'splice'] // 需要拦截的数组操作
for (let i = 0, len = operateAry.length; i < len; i++) {
    const method = operateAry[i]
    const origin = arrayProto[method]
    Object.defineProperty(arrayMethodObj, method, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: function(...args) {
            const result = origin.apply(this, args)
            const ob = this.__ob__ // 这儿的用法同dependArray(value)，就是为了取得dep
            let inserted
            switch(method) {
                case 'push':
                case 'unshift':
                    inserted = args
                    break
                case 'splice':
                    inserted = args.slice(2)
                    break
            }
            if (inserted) { // 如果有新的数据插入，则插入的数据也要进行一个响应式
                ob.observeArray(inserted)
            }
            // 通知依赖进行更新
            ob.dep.notify()
            return result
        }
    })
}
```