// 成为高阶函数的条件
// 1. 函数可以作为参数被传递
// 2. 函数可以作为返回值输出

// 回调函数
function a(cb) {
  if (cb) {
    cb();
  }
}

// 函数作为返回值输出
function b() {
  return function () {}
}

// 高阶函数实现AOP（面向切面编程）
Function.prototype.before = function( beforefn ){
  var __self = this; // 保存原函数的引用
  return function(){ // 返回包含了原函数和新函数的"代理"函数
       beforefn.apply( this, arguments ); 
       return __self.apply( this, arguments );
  }
};
Function.prototype.after = function( afterfn ){
   var __self = this; // 此处的this，实际上指向的是before函数返回出来的那个函数
   return function(){
       // 执行新函数，修正 this // 执行原函数
        var ret = __self.apply( this, arguments );        
        afterfn.apply( this, arguments );
        return ret;  
   } 
};
var func = function(){ 
  console.log( 2 );
};
func = func.before(function(){ 
  console.log( 1 );
}).after(function(){ 
    console.log( 3 );
});
func();    //  1  2  3


// 高阶函数之currying，部分求值
function currying(fn) {
  var args = [];
  return function() {
    if (arguments.length === 0) {
      return fn.apply(this, args);
    } else {
      var ary = Array.prototype.slice.call(arguments, 0);
      args = args.concat(ary);
    }
  }
}
function origin() {
  var money = 0;
  return function() {
    for (let i = 0; i < arguments.length; i++) {
      money += arguments[i];
    }
    return money;
  }
}
var newFunc = currying(origin());
console.log(newFunc(100)); // undefined
console.log(newFunc(200)); // undefined
console.log(newFunc(300)); // undefined
console.log(newFunc()); // 600
