## 路由record、current的初始化

### 1.路由的record初始化--createMatcher函数
> createMatcher函数返回一个对象{ match: function, addRoutes: function }
> 该函数的主要作用有
>>> 1.为路由配置中，将父子级关系的路由的path整合成同级数组
>>> 2.以路由的path为键，生成的record为值保存一个对象pathMap
>>> 3.以路由的name为键，生成的record为值保存一个对象nameMap

```js
// VueRouter的构造函数中
// options.routes为路由配置中的数组，this为VueRouter实例
this.matcher = createMatcher(options.routes || [], this)
```
```crateMatcher function```
```js
export function crateMatcher(
    routes: Array<RouteConfig>, // 配置的路由数组
    router: VueRouter // VueRouter实例
) {
    // pathlist：所有路由，及其children里面的路由的path组成的数组
    // pathmap：以路由path为键，路由的record为值组成的对象，同样包含了嵌套路由，注意path是父子拼接后的path
    // namemap：以路由name为键，路由的record为值组成的对象，同样包含了嵌套路由
    const { pathList, pathMap, nameMap } = createRouteMap(routes)
    return {
        match,
        addRoutes
    }
}
```
```createRouteMap function```
```js
export function createRouteMap (
  routes: Array<RouteConfig>, // 路由配置数组
  oldPathList?: Array<string>,
  oldPathMap?: Dictionary<RouteRecord>,
  oldNameMap?: Dictionary<RouteRecord>
): {
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>
} {
  const pathList: Array<string> = oldPathList || []
  const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
  const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)

  // 遍历路由配置数组的各项
  // 这儿就是去将路由配置数组的数据，整合一下，改变pathList、pathMap、nameMap
  routes.forEach(route => {
    // 在addRouteRecord函数中会去检测路由的children属性，进行递归
    addRouteRecord(pathList, pathMap, nameMap, route)
  })

  // ensure wildcard routes are always at the end
  // 这里遍历，就是为了确保通配符路由始终在pathlist的末尾
  for (let i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0])
      l--
      i--
    }
  }
  // 返回
  return {
    pathList, // 所有路由，及其children里面的路由的path组成的数组
    pathMap, // 以路由path为键，路由的record为值组成的对象，同样包含了嵌套路由，注意path是父子拼接后的path
    nameMap // 以路由name为键，路由的record为值组成的对象，同样包含了嵌套路由
  }
}
```
```addRouteRecord function```
```js
function addRouteRecord (
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>,
  route: RouteConfig, // 单个路由配置
  parent?: RouteRecord,
  matchAs?: string
) {
  const { path, name } = route
  // 获得当前路由完整的path，因为如果当前路由有父路由，这儿会去做一个path拼接
  const normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict)

  const record: RouteRecord = {
    path: normalizedPath,
    regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
    components: route.components || { default: route.component },
    instances: {},
    name,
    parent,
    matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props:
      route.props == null
        ? {}
        : route.components
          ? route.props
          : { default: route.props }
  }

  // 如果路由有children属性
  if (route.children) {
    route.children.forEach(child => {
      const childMatchAs = matchAs
        ? cleanPath(`${matchAs}/${child.path}`)
        : undefined
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
  }

  // 保存当前路由的path和record
  // 这儿这个pathlist从左到右，是从子到父
  if (!pathMap[record.path]) {
    pathList.push(record.path)
    pathMap[record.path] = record
  }

  // alias没用过
  if (route.alias !== undefined) {
      // xxx
  }
  // 如果当前路由有name属性
  if (name) {
    // name没重复，则保存以name为key，record为value
    if (!nameMap[name]) {
      nameMap[name] = record
    } else if (process.env.NODE_ENV !== 'production' && !matchAs) {
      warn(
        false,
        `Duplicate named routes definition: ` +
          `{ name: "${name}", path: "${record.path}" }`
      )
    }
  }
}
```

### 2.路由的current初始化
在new HTML5History()的时候，由于HTML5History继承了History。在History构造函数中，已经对current做了初始化
```js
this.current = START // 空route对象
```
```js
export const START = createRoute(null, {
  path: '/'
})
```
```js
export function createRoute (
  record: ?RouteRecord,
  location: Location,
  redirectedFrom?: ?Location,
  router?: VueRouter
): Route {
  const stringifyQuery = router && router.options.stringifyQuery

  let query: any = location.query || {}
  // 深拷贝query
  try {
    query = clone(query)
  } catch (e) {}

  // 构建route对象
  const route: Route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query,
    params: location.params || {},
    fullPath: getFullPath(location, stringifyQuery),
    matched: record ? formatMatch(record) : [] // 保存record数组，不仅仅只是有当前路由的record，还有其父路由的
  }
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery)
  }
  return Object.freeze(route)
}
```
