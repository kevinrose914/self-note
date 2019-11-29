
// 字典类
function Dictionary() {
    this.items = {};
}

Dictionary.prototype.set = function(key, value) {
    this.items[key] = value;
}
Dictionary.prototype.has = function(key) {
    return this.items.hasOwnProperty(key);
}
Dictionary.prototype.remove = function(key) {
    if (!this.has(key)) return false;
    delete this.items[key];
    return true;
}
Dictionary.prototype.get = function(key) {
    return this.has(key) ? this.items[key] : undefined;
}
Dictionary.prototype.keys = function() {
    return Object.keys(this.items);
}
Dictionary.prototype.values = function() {
    return Object.values(this.items);
}
Dictionary.prototype.size = function() {
    return this.keys().length;
}
Dictionary.prototype.clear = function() {
    this.items = {};
}
