# 动画性能浅析

影响性能的行为：响应、动画、空闲、加载
 * 响应：用户点击一个按钮或输入操作，如果能在100ms内做出响应，就可视为无延迟操作
 * 动画：一般显示器为60Hz（每秒刷新60次），要是动画流畅，动画必须要到达60帧，也就是1帧不能超过16ms（1000ms / 60），否则就会出现掉帧的情况，给人直观感觉卡顿
 * 空闲：线程空闲时间，做的任务限制在50ms内，因为要保证主线程足够处理下一个用户的输入操作
 * 加载：页面首次加载如果不能在1s内完成，用户的注意力就会分散。尤其不能超过10s打不开页面<br />
### 1. 像素管道
JS -> Style -> Layout -> Paint -> Composite<br />
js操作样式 -> 样式计算 -> 布局 -> 绘制 -> 合成<br />
像素管道所需时间一般不能超过16ms，由于样式计算以及绘制需要时间，故js操作的时间不能超过10ms<br />
并不是所有的样式改动都会经历上面五个步骤：如果在js中修改了几何属性，上面五个步骤都会运行；如果修改的值是某个元素的颜色，那么布局这一步是可以跳过的；如果只是通过css修改属性，那么第一步是可以跳过的。

### 2. js动画性能优化
* 使用requestAnimationFrame代替setInterval,setTimeout来实现动画
* 避免FSL，即像素管道中，布局超前样式计算，与js操作样式同时进行去了
```js
var box = document.getElementById('ss')
box.classList.add('haha') // js操作样式
var width = box.offsetWidth // 要获取宽度，首先就要执行像素管道中的布局
// 这样一来，布局就超前了样式计算
```
布局抖动
```js
const box = document.querySelector('.box');
const p = document.querySelectorAll('p');
for (let i = 0; i < p.length; i++) {
    const width = box.offsetWidth; // 造成FSL(强制进行布局，让布局跑到样式计算前面)，拿到外面去获取
    // 浏览器在此处进行多次无效布局，成为布局抖动，会导致性能问题
    p[i].style.width = width + 'px';
}
```
#### 2.1 requestAnimationFrame
requestAnimationFrame(callback)，callback的调用是每一帧调用一次，也就是16ms调用一次
* 相较于setTimeout实现动画的优势，在于当页面隐藏或者后台运行时，requestAnimationFrame会停止渲染，不占cpu。而timeout不会。
* 其在高频率事件（resize，scroll）中，可以防止在一个刷新时间间隔内发生多次函数执行
```js
// requestAnimationFrame的polyfill
if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    'use strict';
    
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());
```

### 3. css动画性能优化
* 创建图层，其方法有（will-change: 在变化的属性），或者transform:translateZ(0), 或者将运动属性有transform来实现
```css
.box {
    will-change: left;
    animation: move 2s;
}
@keyframes move {
    0% {
        left: 0;
    }
    ...
}
```

### 4. 关键渲染路径(demo4.html)
关键渲染路径的五个步骤：构建dom -> 构建cssom -> 构建渲染树 -> 布局 -> 绘制<br />
```构建dom```: html -> 字节 -> token -> node<br />
```构建cssdom```: 字节 -> token -> cssom<br />
正常情况下，构建dom和构建cssom是同时进行的。当构建dom的过程中遇到js时，会阻塞dom的构建。假如js中又有对样式的操作，就会造成浏览器先进行cssom的构建，然后才是dom的构建，会造成严重的页面渲染问题，影响首屏的加载速度

#### 4.1 优化关键渲染路径
> * 优化关键资源的数量(减少那些可以阻塞页面首次渲染的资源，js/css等)
> * 优化关键路径的长度(减少浏览器域服务器的往返次数)
> * 优化关键字节的数量(关键资源的字节大小)
##### 优化dom
保证html文件轻量，采用压缩、http缓存等技术
##### 优化cssom
css同样可以才去减少文件大小，压缩，http缓存技术到达优化效果。<br />
但是，css还有一个影响性能的因素，其可以阻塞dom的构建（即阻塞关键渲染路径）。<br />
如何解决css阻塞关键渲染路径？
```html
<!--针对首屏不需要的css-->
<link href="xxx.css" rel="stylesheet" media="print">
<!--针对首屏需要的css, 加载完成后再生效-->
<link href="xxx.css" rel="stylesheet" media="print" onload="this.media='all'">
<!--其他方案-->
<link rel="preload" href="style.css" as="style" onload="this.rel='stylesheet'">
<link rel="alternate stylesheet" href="style.css" onload="this.rel='stylesheet'">
```
最佳方案：[Critical CSS](https://github.com/addyosmani/critical)<br />
避免使用@import加载css：如果两个css都是用的link，那么他们是并行加载；加入有一个css是在另外一个css的内部通过@import引入的，那么这两个css将成为串行加载，增加资源加载时间的总和<br />
js资源也会阻塞关键渲染路径，so，异步加载javascript，压缩，缓存等技术来优化，为script标签添加async属性（加载完后，立即执行,加载过程中不会阻塞dom构建，故DOMContentLoaded事件会比较快），为script标签添加defer属性（页面渲染完，再执行，推迟DOMContentLoaded事件。其加载不会阻塞dom构建）
