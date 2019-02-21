import Vue from 'vue/dist/vue.js';
import options from '@/components/dialog.vue'

const ToastConstructor = Vue.extend(options);
let toastPool = [];

let getAnInstance = () => {
  if (toastPool.length > 0) {
    let instance = toastPool[0];
    toastPool.splice(0, 1);
    return instance;
  }
  return new ToastConstructor({
    el: document.createElement('div')
  });
};

let returnAnInstance = instance => {
  if (instance) {
    toastPool.push(instance);
  }
};

let removeDom = event => {
  if (event.target.parentNode) {
    event.target.parentNode.removeChild(event.target);
  }
};

ToastConstructor.prototype.close = function() {
  this.visible = false;
  this.$el.addEventListener('transitionend', removeDom);
  this.closed = true;
  returnAnInstance(this);
};

let Toast = (options = {}) => {
  let duration = options.duration || 3000;

  let instance = getAnInstance();
  instance.closed = false;
  clearTimeout(instance.timer);
  instance.type = options.type;
  instance.msgType = options.msgType;
  instance.msg = options.msg;
  instance.duration = options.duration;

  document.body.appendChild(instance.$el);
  Vue.nextTick(function() {
    instance.visible = true;
    instance.$el.removeEventListener('transitionend', removeDom);
    if (duration && duration > 0) {
      instance.timer = setTimeout(() => {
        if (instance.closed) {
          return
        }
        instance.close()
      }, duration)
    }
  });
  return instance;
};

export default Toast;
