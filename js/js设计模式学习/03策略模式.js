// 策略模式： 定义一系列算法，封装起来，并使其可以相互替换

// 场景1：表单校验
var varifyMaps = {
  isEmpty: function() {},
  minLength: function() {},
  isMobile: function() {},
  // ...
};