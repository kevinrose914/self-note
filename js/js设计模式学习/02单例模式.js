function CreatePerson() {
}
CreatePerson.prototype.init = function() {}
var proxyCreatePerson = (function() {
  var instance = null; // 通过闭包，让构造函数只能被实例化一次
  return function() {
    if (!instance) {
      instance = new CreatePerson(); 
    }
    return instance;
  }
})();
var a = proxyCreatePerson();
var b = proxyCreatePerson();
console.log(a === b); // true
var c = new proxyCreatePerson();
var d = new proxyCreatePerson();
console.log(c === d, a === c, c instanceof proxyCreatePerson); // true, true , false


// 惰性单例
// 指再需要的时候才创建对象实例，重点
// 应用场景：弹出框
function bg() {
  var r=Math.floor(Math.random()*256);
  var g=Math.floor(Math.random()*256);
  var b=Math.floor(Math.random()*256);
  return "rgb("+r+','+g+','+b+")";
}
var left = 0;
function CreateDialog() {
  var div = document.createElement('div');
  div.style.height = "300px";
  div.style.width = "400px";
  div.style.background = bg();
  div.style.display = 'none';
  div.style.position = 'fixed';
  div.style.left = left + 'px';
  left += 10;
  document.body.appendChild(div);
  this.ele = div;
  return this;
}
CreateDialog.prototype.open = function() {
  this.ele.style.display = 'block';
}
CreateDialog.prototype.close = function() {
  this.ele.style.display = 'none';
}
var singleInstance = function() {
  var instance = null;
  return function() {
    if (!instance) {
      instance = new CreateDialog(); 
    }
    return instance;
  }
}
var singleCreateDialog = singleInstance();
var instance = null;
document.getElementById('open').onclick = function() {
  instance = singleCreateDialog();
  instance.open();
}
document.getElementById('close').onclick = function() {
  instance.close();
}
