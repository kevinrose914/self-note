
(function(context){
    var _ = context
    _.channel = (function() {
        var storage = window.localStorage
        var listener = {}
        if (/MSIE 8/.test(navigator.userAgent)) {

        } else {
            window.addEventListener('storage', function(e) {
                if (e.newValue !== null) {
                    broadcast(e.key, e.newValue)
                }
            })
        }
        function broadcast(key, value) {
            if (key in listener) {
                var val = JSON.parse(value)
                for (var i = 0, callbackAry = listener[key], len = callbackAry.length; i < len; i++) {
                    try {
                        callbackAry[i](value)
                    } catch (e) {
                        console.error(e.stack)
                    }
                }
            }
        }
        return {
            post: function(key, val) {
                storage.setItem(key, JSON.stringify(val))
                return this
            },
            on: function(key, callback) {
                if (key in listener) {
                    listener[key].push(callback)
                } else {
                    listener[key] = [callback]
                }
                return this
            },
            off: function(key, callback) {
                const callbackAry = listener[key]
                if (callbackAry) {
                    if (callback) {
                        var len = callbackAry.length
                        while(i--){
                            if (callbackAry[i] === callback) {
                                callbackAry.splice(i, 1)
                            }
                        }
                    } else {
                        delete listener[key]
                    }
                }
            }
        }
    })()
})(this)