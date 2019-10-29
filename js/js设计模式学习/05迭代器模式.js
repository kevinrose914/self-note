// 内部迭代器
var each = function(ary, cb) {
  for (var i = 0; i < ary.length; i++) {
    cb.call(ary[i], i, ary[i]);
  }
}
each([1,2,3,4], function(index, item) {
  console.log(index, item);
})

// 外部迭代
var Iterator = function(obj) {
  var current = 0;
  var next = function() {
    current += 1;
  }
  var isDone = function() {
    return current >= obj.length;
  }
  var getCurrent = function() {
    return obj[current];
  }
  return {
    next,
    isDone,
    getCurrent,
  };
}
var compare = function(iterator1, iterator2) {
  while(!iterator1.isDone() && !iterator2.isDone()) {
    if (iterator1.getCurrent() !== iterator2.getCurrent()) {
      throw new Error('not same');
    }
    iterator1.next();
    iterator2.next();
  }
}
var iterator1 = Iterator([1,2,3,4]);
var iterator2 = Iterator([1,2,3,4]);
compare(iterator1, iterator2);


// 倒序迭代
var sort = function(arr, cb) {
  for (var i = arr.length - 1; i >= 0; i--) {
    cb(i, arr[i]);
  }
}

// 终止迭代
var each2 = function (arr, cb) {
  for (var i = 0; i < arr.length; i++) {
    if (!cb(arr[i])) {
      break;
    }
  }
}
each2([1,2,3,4], function(item) {
  if (item >= 3) {
    return false;
  }
  console.log(item);
  return true;
});