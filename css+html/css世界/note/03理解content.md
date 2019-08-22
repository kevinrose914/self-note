### 替换元素与非替换元素
[替换元素]: 内容可替换，如：input,img,video,iframe,textarea...

#### 替换元素的特性
> 1. 内容的外观不受页面css的影响
> 2. 有自己的尺寸
> 3. 在很多css属性上有自己的一套表现规则

#### 替换元素的尺寸计算规则
[固有尺寸]: 值的是替换内容原本的尺寸
[HTML尺寸]: HTML原生属性改变，如：img的height、width，input的size，textarea的cols、rows...
[CSS尺寸]: 通过css的width、height设置的尺寸
> 规则：css尺寸 > html尺寸 > 固有尺寸

### 要点及应用
> 1. input[type=button]和button的区别：两者的white-space属性值不一，前者为pre，后者为normal，表现的差异为在文字足够多的时候，前者不会换行，后者会自动换行
> 2. img的src属性缺省的时候，图片不会有任何请求，是最高效的实现方式
> 3. img的src地址可以书写到content里面
```html
<img src="1.png"/>
```
```css
img:hover {
  content: url('2.png')
}
```
> 4. 清除浮动
```css
.clear:after {
  content: '';
  display: block;
  clear: both;
}
```
> 5. 实现两端对齐,见02两端对齐.html
> 6. 实现loading加载动画，见css世界page60
> 7. 实现quote, 见page63
> 8. 利用content生成html元素attr的内容， 见03content-attr.html
> 9. content计数，见04content-counter.html