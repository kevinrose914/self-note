viewport有的种类: layout viewport, visual viewport, idea viewport</br>
```layout viewport```: 页面自身的大小</br>
```visual viewport```: 页面显示在当前屏幕上的部分,用户会滚动页面来改变可见部分，或者缩放浏览器来改变visualviewport的尺寸</br>
```ideal viewport```: 布局理想宽度（width=device-width或者initial-scale=1.0可以实现）,可以理解为css中的100%</br>
```width=device-width```: 将layout viewport宽度设置为等于设备像素， 页面整屏全部展示出来（如果有元素超过这个宽度，页面会缩放，以容纳）</br>
```initial-scale=1.0```： 设置页面的初始缩放值</br>
```document.documentElement.clientWidth```: 获取的是layout viewport的宽度</br>
```window.innerWidth```: 获取visual viewport的宽度</br>
```document.documentElement.offsetWidth```: html元素的宽度</br>
当页面完整的展示在浏览器中，此时```layout viewport === visual viewport```,前提条件是不加meta标签加以约束</br>

eg:在iphone6（设备宽375）下，当页面设置
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
此时layout viewport 就为375px， visual viewport 也为375px</br>
当其中有一个元素宽度大于了375px时，此时的visual viewport变为该元素的宽度, 而layout viewport不变，页面通过缩放，自动全部显示</br>

```initial-scale=1.0```在此时，页面同样可以达到width=device-width的效果，也就是说，此时的layoutvirewport等同于visualviewpot.这是因为这个缩放比例，缩放相对的是ideaviewport来进行缩放的,这个在windows phone上的IE浏览器无论是横屏还是竖屏都把宽度设置为竖屏时的ideaviewport的宽度；同样width=device-width的缺陷是在iphone和ipad上，无论是竖屏还是横屏，宽度都是竖屏时idealviewport的宽度，所以两个同时一起用；如果出现这种情况```html
<meta name="viewport" content="width=300, initial-scale=1.0" />
```此时，哪个值大，就把layoutviewport的值设为他

当一个idealviewport的宽为320px的设备，当initial-scale=3时，此时的页面可视区域随之缩小，变成了320 / 3px,固可以得到公式：visualviewport = idealviewport / scale


# vw+rem适配方案
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
```js
// 1vm = 屏幕宽度的1%
// 首先确立根元素的font-size大小，让其跟随屏幕的宽度变化而变化
// 在iphone6下，定义一个基准值75px， 则font-size = （75 / 375）*100vw，其要根据媒体查询，在屏幕宽度小于或者等于320px时，取320 * 20vm也就是320 * 0.2 = 64px， 在屏幕宽度大于或者等于540px时，取540 * 20vm，也就是540*0.2 = 108px
// 然后rem = px / 75
// body的宽度设置限制最大值为540px，最小值为320px
```

# flexible+rem适配方案
```html
<meta name="viewport" content="initial-scale=scale" />
```
scale = 1 / dpr，根据终端dpr来确定scale大小

然后动态生成根元素的font-size大小
```javascript
var width = docEl.getBoundingClientRect().width;
if (width / dpr > 540) {
    width = 540 * dpr;
}
var rem = width / 10;
docEl.style.fontSize = rem + 'px';
flexible.rem = win.rem = rem;
```

# 两种方案区别
vm+rem：固定viewport，让设计稿通过css等比缩放到viewport的宽度
flexible： 固定设计稿，让viewport等比缩放到设计稿的宽度

# 总结等比缩放
移动端的viewport包含了layoutviewport、visualviewport、idealviewport三中情况，其中layoutviewport是页面实际的大小，visualviewport是浏览器内所能看到的页面范围的大小、idealviewport是一个理想的视觉宽度。layoutviewport在浏览器端大多都是980，800之内的大小，固其本身就大于了visualviewport，这样就造成页面在移动端浏览器下只能通过手动缩放、拖拽移动达到浏览效果。这种不友好的问题的解决方案，就是等比缩放。
等比缩放：将layoutviewport等于idealviewport，也可以理解为，将其等于visualviewport，这样，页面就能在移动端浏览器中整体完美展示出来。如何等比缩放呢？通过width-device-width,initial-scale=1.0，可以理解为将设计稿的宽度整体缩放为idealviewport的宽度可以实现。通过initial-scale=1/dpr，可以理解为将idealviewport的宽度整体缩放为设计稿的宽度可以实现。