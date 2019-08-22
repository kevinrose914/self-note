### margin与元素尺寸
> 对于普通流体元素，margin只能改变水平方向的尺寸；对于具有拉伸特性的绝对定位元素，margin可以改变水平和垂直方向的尺寸。
```css
.father {
  width: 300px;
  height: 300px;
}
.child {
  margin: -20px;
}
```

### margin合并
> 1. 相邻兄弟元素之间合并
> 2. 父级和第一个子元素或者最后一个子元素的合并
> 3. 空块级元素的magin合并

#### 阻止父子级margin-top合并
> 1. 将父元素设置为块状格式化上下文元素
> 2. 父元素设置border-top值
> 3. 父元素设置padding-top值
> 4. 父元素和第一个子元素之间添加内联元素进行分隔

#### 阻止父子级margin-bottom合并
> 1. 将父元素设置为块状格式化上下文元素
> 2. 父元素设置border-bottom值
> 3. 父元素设置padding-bottom值
> 4. 父元素和最后一个子元素之间添加内联元素进行分隔
> 5. 父元素设置height、min-hieght或max-height

#### 阻止空块级元素margin合并
> 1. 设置垂直方向的border
> 2. 设置垂直方向的padding
> 3. 里面添加内联元素
> 4. 设置height或者min-height

### margin的要点及应用
> 1. 一侧定宽的两栏自适应布局, page83
```css
.box {
  overflow: hidden;
}
.left {
  float: left;
}
.right {
  margin-left: 100px;
}
```
```html
<div class="box">
  <img src="" class="left" />
  <p class="right"></p>
</div>
```
> 2. 利用margin改变元素尺寸，实现两端对齐，page84
> 3. 利用margin实现等高布局，page86