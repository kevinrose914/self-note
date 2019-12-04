(function(root) {
    var _ = {};
    root._ = _;
    // fn允许多少个参数，而返回的函数多传的参数就合并为一个参数
    root._.restArg = function(fn) {
        return function () {
            var alowLength = fn.length
            var startIndex = fn.length - 1
            var args = new Array(alowLength)
            var rest = Array.prototype.slice.call(arguments, startIndex)
            for(var i = 0; i < alowLength; i++) {
                args[i] = arguments[i]
            }
            args[startIndex] = rest
            fn.apply(this, args)
        }
    }
})(this)