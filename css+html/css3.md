# css3
@import和link的区别:<br />
1. link出了可以用来引用css，还可以引用其他类型的文件<br />
2. link引用的css与页面的加载同时执行，@import引入的css必须等到页面加载完毕才会执行<br />
css选择器权重：<br />
!important > 行内样式 > id > class,伪类,属性 > tag > * <br />
```background-attachment```取值：<br />
1. scroll默认值，跟随页面滚动<br />
2. fixed：固定背景，不随页面滚动<br />
3. inherit：继承<br />
```background-size```:<br />
```css
.box {
    background-size: auto; // 默认值
    background-size: 30px 30px; // 直接定义宽高，只给出一个值，那第二个自动为auto
    background-size: 20% 20%; // 用百分数定义，百分数为占元素的宽高的比例，只给出一个值，那第二个自动为auto
    background-size: cover; // 是按照等比缩放铺满整个区域。如果显示比例和显示区域的比例相差很大某些部分会不显示，比如长度比宽度大很多，则宽度左侧会有一部分不显示
    background-size: contain; // 也是等比缩放，按照某一边来覆盖显示区域的，会有白边
}
```
```background-origin```:规定背景图片的定位区域
```css
.box {
    background-origin: border-box; // 全部显示背景，包括border
    background-origin: content-box; // 内容以外的不显示背景
    background-origin: padding-box; // 默认值，padding以外的不显示背景

    background-image:url(img_flwr.gif),url(img_tree.gif); // css3允许多个图像重叠
}
```
```background-clip```: [这个博客写的很完善](https://blog.csdn.net/cysear/article/details/50238265)<br />
box-shadow: 阴影
```css
.box {
    box-shadow: 10px 10px 5px #ccc inset; // 水平位移，纵向位移，模糊距离，颜色，内模糊
}
```
```border-image```: 指定作为元素周围边框的图像
```css
.box {
    border-image: source slice width outset repeat|initial|inherit
    border-image-source: url('xxx') // 图像的位置
    border-image-slice: 0 10 0 10; // 依次为上，右，下，左的图像向内偏移
    border-image-slice: 10% 10%; // 省略后，上下相同，左右相同，百分比相对于图片的宽和高
    border-image-slice: fill; // 保留图像的中间部分, 效果相当于background
    border-image-width: 10 10 10 10 | 10 | 10 10; // 图片边界的宽度,也是四个方向，可以是百分数
    border-image-outset: 10 10; // 也是四个方向， 用于指定在边框外部绘制 border-image-area 的量
    border-image-repeat: repeat | initial | inherit; // 用于设置图像边界是否应重复（repeat）、拉伸（stretch）或铺满（round）
}
```
```transition```: 过渡<br />
语法：transition: property duration timing-function delay;<br />
```css
.box {
    transition: width 2s ease 0;
    transition-property: width; // 指定css属性，默认值为all
    transition-duration: 2s; // transition效果需要指定多少秒或毫秒才能完成
    transition-timing-function: ease; // 指定transition效果的转速曲线
    // timing-funcition取值：ease | linear | ease-in | ease-out | ease-in-out | cubic-bezier(n,n,n,n);
    // linear: 规定以相同速度开始至结束的过渡效果（等于 cubic-bezier(0,0,1,1)）;
    // ease: 规定慢速开始，然后变快，然后慢速结束的过渡效果（cubic-bezier(0.25,0.1,0.25,1)）;
    // ease-in: 规定以慢速开始的过渡效果（等于 cubic-bezier(0.42,0,1,1)）。;
    // ease-out: 规定以慢速结束的过渡效果（等于 cubic-bezier(0,0,0.58,1)）。;
    // ease-in-out: 规定以慢速开始和结束的过渡效果（等于 cubic-bezier(0.42,0,0.58,1)）;
    // cubic-bezier(n,n,n,n): 在 cubic-bezier 函数中定义自己的值。可能的值是 0 至 1 之间的数值;
    transition-delay: 2s; // 定义transition效果开始的时候
}
```
[贝瑟尔曲线](https://blog.csdn.net/qq_25600055/article/details/51045163)<br />
```transitionend```事件，在transition结束后调用<br />
```animation```: 动画<br />
语法：animation: name duration timing-function delay iteration-count direction fill-mode play-state;<br />
```css
.box {
    animation: move 2s ease 0s normal;
    animation-name: move; // 定义动画的名字
    animation-duration: 2s // 动画指定需要多少秒或毫秒完成
    animation-timing-function: ease; // 同transition的timing-function
    animation-delay: 0s; // 设置动画在启动前的延迟间隔
    animation-iteration-count: 1 | infinite; // 动画播放次数，默认为1， infinite表示无限循环

    animation-direction: normal | reverse | alternate | alternate-reverse; // 定义是否循环交替反向播放动画
    animation-direction: normal; // 正常播放
    animation-direction: reverse; // 动画反向播放
    animation-direction: alternate; // 在动画播放奇数次时正向播放，偶数次时反向播放
    animation-direction: alternate-reverse; // 在动画播放奇数次时反向播放，偶数次时正向播放

    animation-fill-mode: none | forwards | backwards | both; // 规定当动画不播放时，是否应用样式到元素
    animation-fill-mode: none; // 默认值， 动画在动画执行之前和之后不会应用任何样式到目标元素
    animation-fill-mode: forwards; // 在动画结束后（由 animation-iteration-count 决定），动画将应用该属性值
    animation-fill-mode: backwards; // 动画将应用在 animation-delay 定义期间启动动画的第一次迭代的关键帧中定义的属性值
    animation-fill-mode: both; // forwards和backwards都有

    animation-play-state: paused | running; // 指定动画是否正在运行或已暂停
    animation-play-state: paused; // 指定暂停动画
    animation-play-state: running; // 指定正在运行的动画
}
```
animation动画作用过程中的三个事件：<br />
1. ```animationstart```: css动画开始后触发<br />
2. ```animationiteration```: css动画重复播放时触发<br />
3. ```animationend```: css动画结束时触发<br />
