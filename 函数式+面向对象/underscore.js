(function(root){
    var push = Array.prototype.push
    var slice = Array.prototype.slice
    var _ = function(wrap) {
        if (!(this instanceof _)) {
            return new _(wrap)
        }
        this.wrapper = wrap
    }
    // 链式调用
    _.chain = function(obj) {
        var instance = _(obj)
        instance._chain = true
        return instance
    }
    // 结束链式调用
    _.end = function(result) {
        this._chain = false
        return result
    }
    var result = function(instance, result) {
        return instance._chain ? _(result).chain() : result
    }
    _.addClasss = function() {
        console.log('add class')
    }
    _.uniq = function(arr, callback) {
        var temp = []
        for(var i = 0; i < arr.length; i++) {
            var a = callback ? callback(arr[i]) : arr[i]
            if(temp.indexOf(a) === -1) {
                temp.push(a)
            }
        }
        return temp
    }
    _.each = function(array, callback) {
        for(var i = 0; i < array.length; i++) {
            callback.call(array[i], array[i])
        }
    }
    _.functions = function(obj) {
        var keyNameAry = []
        for (var i in obj) {
            keyNameAry.push(i)
        }
        return keyNameAry
    }
    _.mixin = function(underscore) {
        _.each(_.functions(underscore), function(key) {
            var func = underscore[key]
            _.prototype[key] = function() {
                var params = [this.wrapper]
                push.apply(params, arguments)
                return result(this, func.apply(this, params))
            }
        })
    }
    _.mixin(_)
    root._ = _
})(this)