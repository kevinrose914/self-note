// 又叫发布订阅模式
var Event = (function() {
  var depends = {};
  var on = function(eventName, fn) {
    if (!depends[eventName]) {
      depends[eventName] = [];
    }
    depends[eventName].push(fn);
  }
  var trigger = function() {
    const key = Array.prototype.shift.call(arguments);
    fns = depends[key];
    if (!fns || fns.length === 0) {
      return false;
    }
    for (var i = 0; i < fns.length; i++) {
      fns[i].apply(this, arguments);
    }
  }
  var remove = function(key, fn) {
    var fns = depends[key]
    if (!fns || fns.length === 0) {
      return false;
    }
    if (!fn) {
      fns = [];
    } else {
      for(var i = fns.length - 1; i >= 0; i--) {
        if (fns[i] === fn) {
          fns.splice(i, 1);
        }
      }
    }
  }
  return {
    on, trigger, remove
  };
})()