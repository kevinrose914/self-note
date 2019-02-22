function isObject (obj) {
    return obj !== null && typeof obj === 'object'
}

function compare(a, b) {
    var isObjectA = isObject(a)
    var isObjectB = isObject(b)
    if (isObjectA && isObjectB) {
        try {
            var isArray = Array.isArray
            var isAryA = isArray(a)
            var isAryB = isArray(b)
            if (isAryA && isAryB) {
                return a.length === b.length && a.every((item, index) => {
                    return compare(item, b[i])
                })
            } else if (!isAryA && !isAryB) {
                var aKeys = Object.keys(a)
                var bKeys = Object.keys(b)
                return aKeys.length === bKeys.length && aKeys.every((k, i) => {
                    return compare(a[k], b[k])
                })
            }
        } catch {
            return false
        }
    } else if (!isObjectA && !isObjectB) {
        return String(a) === String(b)
    } else {
        return false
    }
}