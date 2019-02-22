(function(context) {
    var _ = context
    _.messageChannel = {
        post: function(target, data, origin) {
            target.postMessage(data, origin)
        },
        subscribe: function(callback, checkOrigin) {
            this.addEventListener('message', function(e) {
                if (!checkOrigin) {
                    callback(e)
                } else {
                    if (checkOrigin === e.origin) {
                        callback(e)
                    } else {
                        console.error('error!')
                    }
                }
            })
        }
    }
})(this)