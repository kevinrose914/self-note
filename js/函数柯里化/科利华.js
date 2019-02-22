(function(root) {
    var _ = {}
    root._ = _
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