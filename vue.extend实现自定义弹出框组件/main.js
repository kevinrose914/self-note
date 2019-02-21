import Vue from 'vue'
import App from './App.vue'
import store from './store/index.js'
import router from './router'
import VueAMap from 'vue-amap'
import VueWechatTitle from 'vue-wechat-title'
import WXConfig from './utils/wx.js'


import 'lib-flexible'
import './styles/common.less'
import './styles/border.less'

import FastClick from 'fastclick'

import './directive/document-title.js'

FastClick.attach(document.body);

document.body.addEventListener('touchmove', (e) => {
  e.preventDefault()
})

document.documentElement.setAttribute('data-dpr', window.devicePixelRatio)

// 微信IOS版，每次切换路由，SPA的url是不会变的，发起签名请求的url参数必须是当前页面的url就是最初进入页面时的url
if (typeof window.entryUrl === 'undefined' || window.entryUrl === '') {
  window.entryUrl = location.href.split('#')[0];
}

WXConfig()

import './utils/run.js'

import './permission.js'

import { Toast, Indicator, Swipe, SwipeItem, Loadmore, Lazyload, Picker, DatetimePicker, MessageBox, Field, Popup, Spinner } from 'mint-ui'
Vue.component('Toast', Toast)
Vue.component('Indicator', Indicator)
Vue.component('Swipe', Swipe)
Vue.component('SwipeItem', SwipeItem)
Vue.component(Loadmore.name, Loadmore)
Vue.component(Picker.name, Picker)
Vue.component(DatetimePicker.name, DatetimePicker)
Vue.component(MessageBox.name, MessageBox)
Vue.component(Field.name, Field)
Vue.component(Popup.name, Popup)
Vue.component(Spinner.name, Spinner)
Vue.use(Lazyload)
Vue.use(VueAMap)

Vue.use(VueWechatTitle)


import asynDialog from '@/utils/asyn-dialog/asny-dialog-component.js'
Vue.use(asynDialog)

VueAMap.initAMapApiLoader({
  key: '091dd0928e37a305405730a3291fc37f', // 高德Key
  plugin: ['AMap.Autocomplete', 'Amap.Walking', 'AMap.PlaceSearch', 'Geolocation',
    'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor', 'AMap.Driving'
  ],
  // 默认高德 sdk 版本为 1.4.4
  v: '1.4.4'
})


Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
