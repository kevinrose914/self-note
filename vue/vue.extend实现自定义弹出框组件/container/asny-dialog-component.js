import Vue from 'vue'
import container from './container.vue'
const containerConstructor = Vue.extend(container)
let cache = [] // 缓存实例
let getComponentInstance = (constructor) => {
    if (cache.length > 0) {
        let instance = cache[0]
        cache.splice(0, 1)
        return instance
    }
    return new constructor({
        el: document.createElement('div')
    })
}
let cacheInstance = (instance) => {
    if (instance) {
        cache.push(instance)
    }
}
let removeContainerDom = (e) => {
    // 先移除自定义组件的元素，再移除外层包装的组件元素
    const content = e.target.querySelector('.content')
    content.removeChild(content.childNodes[0])
    if (e.target.parentNode) {
      e.target.parentNode.removeChild(e.target);
    }
}
containerConstructor.prototype.close = function() {
    this.visible = false;
    this.$el.addEventListener('transitionend', removeContainerDom);
    this.closed = true;
    cacheInstance(this)
    if (this.closeCallback) {
        this.closeCallback()
    }
}
function showDialog(object) {
    const containerInstance = getComponentInstance(containerConstructor)
    const { component, data, config } = object
    const dialogContructor = Vue.extend(component)
    dialogContructor.prototype.$close = containerConstructor.prototype.close.bind(containerInstance)
    const dialogBodyInstance = new dialogContructor({
        el: containerInstance.$el
    })
    // 将需要传给自定义组件的数据传入
    for(let i in data) {
        dialogBodyInstance[i] = data[i]
    }

    containerInstance.closed = false
    containerInstance.duration = config ? config.duration : 0 
    containerInstance.maskCloseDialog = config ? config.maskCloseDialog : false
    containerInstance.closeCallback = config ? config.closeCallback : null
    clearTimeout(containerInstance.timer);

    containerInstance.$el.querySelector('.content').appendChild(dialogBodyInstance.$el)
    document.body.appendChild(containerInstance.$el)

    Vue.nextTick(() => {
        containerInstance.visible = true
        containerInstance.$el.removeEventListener('transitionend', removeContainerDom)
        const { duration } = containerInstance
        if (duration && duration > 0) {
            containerInstance.timer = setTimeout(() => {
              if (containerInstance.closed) {
                return
              }
              containerInstance.close()
            }, duration)
          }
    })

    return containerInstance
}

function asynDialog() {
    Vue.prototype.$asynDialog = showDialog
}

export default asynDialog