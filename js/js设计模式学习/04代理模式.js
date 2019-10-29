// 场景1： 虚拟代理实现图片预加载
var myImage = (function(imgEle) {
  return {
    setSrc: function(src) {
      imgEle.src = src;
    }
  };
})(xxx)
var proxyImg = (function() {
  var img = new Image();
  img.onload = function() {
    myImage.src = this.src;
  };
  return {
    setSrc: function(src) {
      myImage.setSrc('loading.gif');
      img.src = src;
    }
  };
})()
// proxyImg.setSrc('xxxx.png');