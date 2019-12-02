function Queue() {
    this.items = [];
}
// 添加
Queue.prototype.enqueue = function(el) {
    this.items.push(el);
}
// 删除
Queue.prototype.dequeue = function() {
    return this.items.shift(); // 性能比较低
}
// 返回队列中第一个元素
Queue.prototype.front = function() {
    return this.items[0];
}
// 判空
Queue.prototype.isEmpty = function() {
    return this.items.length === 0;
}
// 返回队列的长度
Queue.prototype.size = function() {
    return this.items.length;
}
// 转字符串
Queue.prototype.toString = function() {

}