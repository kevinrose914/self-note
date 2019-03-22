1. Vue.config = {xxx}
2. Vue.util = {warn, extend, mergeOptions, defineReactive}
3. Vue.set = set
4. Vue.delete = del
5. Vue.nextTick = nextTick
6. Vue.options = {components: {}, directives: {}, filters: {}}
7. Vue._base = Vue
8. 把keepalive组件加到Vue.options.components中
9. Vue.use = function() {}
10. Vue.mixin = function() {}
11. Vue.extend = function() {}
12. Vue.component = function(){}
12. Vue.directive = function(){}
12. Vue.filter = function(){}

```js
function initGlobalAPI (Vue) {
  // config
  var configDef = {};
  configDef.get = function () { return config; };
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}
```