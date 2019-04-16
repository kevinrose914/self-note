# 动画性能浅析

影响性能的行为：响应、动画、空闲、加载
* 响应：用户点击一个按钮或输入操作，如果能在100ms内做出响应，就可视为无延迟操作
* 动画：一般显示器为60Hz（每秒刷新60次），要是动画流畅，动画必须要到达60帧，也就是1帧不能超过16ms（1000ms / 60），否则就会出现掉帧的情况，给人直观感觉卡顿
* 空闲：线程空闲时间，做的任务限制在50ms内，因为要保证主线程足够处理下一个用户的输入操作
* 加载：页面首次加载如果不能在1s内完成，用户的注意力就会分散。尤其不能超过10s打不开页面
**像素管道**
JS -> Style -> Layout -> Paint -> Composite<br />
js操作样式 -> 样式计算 -> 布局 -> 绘制 -> 合成<br />
像素管道所需时间一般不能超过16ms，由于样式计算以及绘制需要时间，故js操作的时间不能超过10ms<br />
并不是所有的样式改动都会经历上面五个步骤：如果在js中修改了几何属性，上面五个步骤都会运行；如果修改的值是某个元素的颜色，那么布局这一步是可以跳过的；如果只是通过css修改属性，那么第一步是可以跳过的。

**js动画性能优化**
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

**css动画性能优化**
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