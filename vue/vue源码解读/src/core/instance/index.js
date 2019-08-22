import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue) // vue.prototype._init()
stateMixin(Vue) // vue.prototype.$watch
eventsMixin(Vue) // $on, $once, $off, $emit
lifecycleMixin(Vue) // vue.prototype._update()
renderMixin(Vue) // vue.prototype._render()

export default Vue
