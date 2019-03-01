```html
<script src="" defer></script>
<script src="" async></script>
```
```defer```：要等到整个页面在内存中正常渲染结束（DOM 结构完全生成，以及其他脚本执行完成），才会执行（渲染完再执行）<br />
```async```：一旦下载完，渲染引擎就会中断渲染，执行这个脚本以后，再继续渲染（下载完就执行）<br />
另外，如果有多个defer脚本，会按照它们在页面出现的顺序加载，而多个async脚本是不能保证加载顺序的
```html
<script type="module" src=""></script>
```
```type=module```：ES6 模块，浏览器对于带有type="module"的<script>，都是异步加载，不会造成堵塞浏览器，即等到整个页面渲染完，再执行模块脚本，等同于打开了<script>标签的defer属性,如果网页有多个<script type="module">，它们会按照在页面出现的顺序依次执行
```html
<script type="module" src="" async></script>
```
一旦使用了async，该模块就成为下载完后，浏览器中断渲染，执行该模块,同样多个这样的模块，也就没有了执行顺序

es6模块内嵌到页面中
```html
<html>
    <body>
        <script type="module">
            import {xxx} from './xxx'
        </script>
    </body>
</html>
```

es6模块引入的方式<br />
1. import {xxx} from '...'或者import xxx from 'xxx'<br />
2. import 'xxx' // 直接执行某模块<br />
3. import()  // 异步加载<br />

es6模块内部不能使用的变量：arguments, require, module, exports, __filename, __dirname<br />

es6模块月commonjs模块的区别<br />
1. commonjs模块输出的是一个值的拷贝，es6模块是值得引用<br />
2. commonjs是运行时加载，es6模块是编译时输出接口<br />
3. commonjs加载的是一个对象（module.esports），该对象只有在脚本运行完才会生成；而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成<br />

es6模块加载commonjs模块
```js
// commonjs module a.js
module.exports = {
    name: 'asd',
    age: 16
}
// es6 module b.js 三种引入方法
import obj from './a.js'
// obj = { name: 'asd', age: 16 }
import { default as person } from './a.js'
// person = { name: 'asd', age: 16 }
import * as person from './a.js'
// person = {
//   get default() {return module.exports;},
//   get name() {return this.default.name}.bind(person),
//   get age() {return this.default.age}.bind(bpersonaz)
// }
```

commonjs模块加载es6模块
```js
// es6 module a.js
export const number = 16
export default { name: 'asd }

// commonjs module b.js
const person = await import('./a.js')
console.log(person)
// person = {
//     get default() { return { name: 'asd' } },
//     get number() { return 16 }
// }
console.log(person.default) // { name: 'asd' }
```

```commonjs模块加载原理```: CommonJS 的一个模块，就是一个脚本文件。require命令第一次加载该脚本，就会执行整个脚本，然后在内存生成一个对象.即使再次执行require命令，也不会再次执行该模块，而是到缓存之中取值。也就是说，CommonJS 模块无论加载多少次，都只会在第一次加载时运行一次，以后再加载，就返回第一次运行的结果，除非手动清除系统缓存<br />
```es6模块加载原理```：ES6 模块是动态引用，如果使用import从一个模块加载变量（即import foo from 'foo'），那些变量不会被缓存，而是成为一个指向被加载模块的引用，需要开发者自己保证，真正取值的时候能够取到值<br />
```System.import```：将es6模块，amd模块，commonjs模块转成es5格式,System.import使用异步加载，返回一个 Promise 对象
```js
<script>
System.import('app/es6-file').then(function(m) {
  console.log(new m.q().es6); // hello
});
</script>
```