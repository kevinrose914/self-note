import './common/index.less'
var el = document.documentElement
console.log('clientwidth=', el.clientWidth)
console.log('innerWidth=', window.innerWidth)
console.log('offsetWidth=', el.offsetWidth)


const env = process.env.env_config

import './lib/flexible.js'
if (env === 'flexible') {
    console.log('flexible state')
}