## 概要
> 1. vue-router实质就是为了在改变url时，要避免其向服务端发送请求返回404的情况。
> 2. hash模式中，hash不会包括在http请求中，只要服务端匹配了hash前面的baseurl，不管hash如何变，都不会返回404
> 3. history模式，这个就需要服务端做一个完整的匹配，避免出现404的情况
> 4. 两种模式，都是通过transitionTo去改变router.current，从而改变视图。视图变了后再通过各自相应的方法改变页面上的url显示。

## HTML5History
> 1. 这个模式，实质是利用window.history.replaceState()和window.history.pushState()来进行url的更新。【注意，这两个方法是不会触发popstate事件的】。
> 2. 当使用push去更新路由及视图时，首先调用transitionTo改变route以及页面，成功后，执行pushState()去更新url的显示，也就是window.history.pushState()。
> 3. 当使用replace去更新路由及视图时，首先调用transitionTo改变route以及页面，成功后，执行replaceState()去更新url的显示，也就是window.history.replaceState()。
> 3. 当使用go，或者点击浏览器上的回退前进按钮，去更新视图时，首先触发popstate事件。再popstate事件中，执行transitionTo去更新视图。这儿就不需要去更新url的显示了


## HashHistory
> 1. hash模式下，代码里面也是做了一个兼容性处理。如果浏览器支持popstate，那么还是用的popstate，否则才用hashchange。所以这儿只考虑浏览器使用hashchange的情况
> 2. 当使用window.location.hash = '/xxx'或者window.location.replace('完整url')试图去更新页面时，都会去触发一开始就定义好的hashchange事件。在hashchange事件中，会执行transitionTo方法更改页面显示，页面显示更改完成后，还要执行replaceHash来改变url的显示【这儿其实一开始url就已经变了，这段代码其实是提供给使用push,replace方法改变页面显示后再改变url的显示】。执行replaceHash的时候，会重新触发hashchange事件，这儿不就死循环了？其实不是，在transitionTo函数调用里面，会比对当前路由和要变化的路由，由于路由早就已经变好了，这儿两者是一样的，所以会跳出函数。这样路由视图得到更新，url也得到更新。
> 3. 当使用push试图去更新页面时，首先调用transitionTo改变route以及页面，再使用pushHash去改变url的显示。pushHash和replaceHash其实区别不大，前者使用window.location.hash = '/xxx'，后者使用window.location.replace('完整url')。
> 4. 当使用replace去更新页面时，首先调用transitionTo改变route以及页面，再使用replaceHash去改变url的显示。
> 5. 当使用go或者点击浏览器上面的前进后退按钮，去更新页面时，直接触发hashchange事件，与第2的道理一样