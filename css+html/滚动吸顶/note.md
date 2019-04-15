# 使用position:sticky实现滚动吸顶
要求：<br />
1. 父元素不能overflow:hidden或者overflow:auto<br />
2. 元素top、left、bottom、right必须要指定一个<br />
3. 父元素高度不小于sticky元素的高度<br />
案例：demo1.html<br />
不足：兼容不够好，但在ios中兼容比较好<br />

注意：
>吸顶的时候会出现抖动，原因就是fixed的元素不占位，下面的元素会顶上来，解决办法有两种
>>>1. 在需要吸顶的元素下面再加一个同样的元素，将其隐藏；当元素吸顶的时候，将其显示。（见demo2.html）
>>>2. 用一个和吸顶元素等高的元素包含吸顶元素即可。（见demo3.html）
>吸顶会使用监听滚动事件，在ios下的滚动过程中是不会即使触发scroll事件，它只在滚动完成才有事件。故在ios中使用sticky实现
>吸顶的方案中，会在scroll事件里面去获取元素的offsetTop或者getBoundingClientRect，这样会造成很严重的重绘。优化方案
>>>1. 使用节流函数包装scroll的回调
>>>2. 使用IntersectionObserver和节流结合，以上两种都牺牲了吸顶那一瞬间的平滑度 （见demo4.html）

案例：
1. demo1.html  position:sticky实现
2. demo2.html  offsetTop原生实现
3. demo3.html  getBoundingClientRect实现

[学习内容来源](https://juejin.im/post/5caa0c2d51882543fa41e478)

# IntersectionObserver
用法：用来判断元素是否可视
```js
let observer = new IntersectionObserver(function(changes) {
    // 是否可见发生变化时，就会触发此回调
    // changes是一个数组，里面包含有所有被监听的元素的信息
}, {
    threshold: [0, 0.2, 0.5, 1] // 此参数决定什么时候触发回调函数，注意时一个元素对应一个值，默认都是0
    // 0的意思是：元素刚好进入可视区域那一瞬间，但还没有完全进入
    // 1的意思是：元素刚好完全进入可视区域那一瞬间
})
observer.observe(dom) // 讲某个dom元素加入监听列表里面
observer.observe(dom)
observer.unobserve(dom) // 停止监听某个dom
observer.disconnect() // 关闭监听器
```
[学习内容来源](http://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html)