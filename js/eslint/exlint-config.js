var eslintrc = {
    "plugins": [// 第三方插件，可以省略包名的前缀
        "react", // eslint-plugin-react
        "import" // eslint-plugin-import：作用域支持es6以上的import/exports语法
    ],
    "extends": [
        "eslint:recommended", // 启用推荐的rules进行约束
        "plugin:react/recommended"
    ],
    "globals": { // 哪些全局的属性名称可以直接用
        "AMap": true,
        "React": true,
        "ReactDOM": true,
        "moment": true,
        "$$": true,
        "formItemLayout": true,
        "console": true,
        "API_GATEWAY": true,
        "API_ACCOUNT": true,
        "CLIENT_ID": true,
        "__MOCK__": true,
        "QR_BASE": true
    },
    "env": { // 一个环境定义了一组预定义的全局变量
        "es6": true, // 启用除了 modules 以外的所有 ECMAScript 6 特性（该选项会自动设置 ecmaVersion 解析器选项为 6）
        "browser": true, // 浏览器环境中的全局变量
        "node": true // Node.js 全局变量和 Node.js 作用域
    },
    "parser": "babel-eslint", // 解析器，通过npm安装的
    "parserOptions": {
        "ecmaVersion": 6, // ECMAScript的版本
        "sourceType": "module", // 设置为 "script" (默认) 或 "module"（如果你的代码是 ECMAScript 模块)
        "ecmaFeatures": { // 这是个对象，表示你想使用的额外的语言特性
            "experimentalObjectRestSpread": true, // 实验性功能，建议不要依赖
            "jsx": true // 启用jsx
        }
    },
    "rules": { // 规则
        "camelcase": [2, {"properties": "never"}], // 强制使用骆驼拼写法命名约定，2表示error，properties为never表示不检查属性名称
        "eqeqeq": 2, // 要求使用 === 和 !==
        "no-var": 2, // 要求使用 let 或 const 而不是 var
        "semi": [2, "always"], // always: 要求在语句末尾写分号， never：禁止在语句末尾写分号
        "semi-spacing": [2, // 强制分号前后有空格
            {
                "before": false,
                "after": true
            }
        ],
        "key-spacing": [2, // 强制在对象字面量的属性中键和值之间使用一致的间距
            {
                "beforeColon": false, // 禁止在对象字面量的键和冒号之间存在空格
                "afterColon": true // 要求在对象字面量的冒号和值之间存在至少有一个空格
            }
        ],
        "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }], // 禁止出现多行空行，max：最大连续空行， maxEOF：文件末尾最大连续空行
        "indent": [2, 4, { "SwitchCase": 1 }], // 缩进， 4： 4个空格； SwitchCase：强制 switch 语句中的 case 子句的缩进级别
        "quotes": [2, "single"], // 强制使用一致的反勾号、双引号或单引号，这儿是单引号
        "jsx-quotes": ["error", "prefer-double"], // 强制在 JSX 属性中一致地使用双引号或单引号，这儿是强制所有不包含双引号的 JSX 属性值使用双引号
        "quote-props": [2, "as-needed"], // 要求对象字面量属性名称用引号括起来，这儿是禁止对象字面量属性名称使用引号
        "max-len": [2, 120], // 强制一行的最大长度
        "curly": [2, "multi-line"], // 强制所有控制语句使用一致的括号风格
        "no-console": 0, // 禁用 console
        "comma-spacing": [2, { "before": false, "after": true }], // 强制在逗号前后使用一致的空格
        "object-curly-spacing": [2, "always"], // 强制在大括号中使用一致的空格，"always" 要求花括号内有空格 (除了 {})
        "comma-style": 2, // 强制使用一致的逗号风格
        "comma-dangle": 0, // 要求或禁止使用拖尾逗号
        "no-use-before-define": 2, // 禁止在变量定义之前使用它们
        "no-underscore-dangle": 0, // 禁止标识符中有悬空下划线
        "no-debugger": 0, // 禁用 debugger
        "dot-notation": 2, // 强制尽可能地使用点号
        "no-multi-spaces": ["error", { // 禁止使用多个空格
            "ignoreEOLComments": true, // 忽略行尾注释前的多个空格
            "exceptions": { "Property": true }
        }],
        "no-param-reassign": 0, // 禁止对 function 的参数进行重新赋值
        "import/no-extraneous-dependencies": 0, // 禁止导入未在package.json里面申明的依赖
        "import/no-unresolved": 0, // 确保导入的文件可以被解析
        "react/jsx-handler-names": [2, // 确保用于处理事件的任何组件或prop方法都正确地加上前缀
            {
                "eventHandlerPrefix": "handle", // 组件内事件处理程序的前缀
                "eventHandlerPropPrefix": "on" // 事件处理程序是通过props传入的程序的前缀
            }
        ],
        "react/jsx-max-props-per-line": [2, {"maximum": 3}], // 限制单行可书写的props个数
        "react/jsx-indent-props": [2, 4], // jsx内props的缩进，这儿是4个空格
        "react/jsx-key": 2, // 在array循环出来的dom，需要有一个名为key的props
        "react/jsx-indent": [2, 4], // jsx的缩进
        "react/jsx-no-bind": [2, {"ignoreRefs": true, "allowArrowFunctions": true}], // jsx的props不能用bind，ref属性除外，函数可以用箭头函数
        "react/prefer-stateless-function": [0, { // 无状态组件强制用纯函数，不用类
            "ignorePureComponents": true
        }],
        "react/jsx-no-duplicate-props": 2, // 防止JSX中的重复props
        "react/jsx-sort-props": 0,
        "react/jsx-closing-bracket-location": [ // 强制jsx中元素结尾符号的位置
            2,
            "tag-aligned" // 与开始对齐
        ],
        "react/jsx-uses-react": 2, // 防止React被错误地标记为未使用
        "react/jsx-uses-vars": 2, // 防止JSX中使用的变量被错误地标记为未使用
        "react/jsx-pascal-case": 2, // 为用户定义的JSX组件强制使用PascalCase
        "react/self-closing-comp": 2, // 防止没有子节点的组件的额外关闭标签
        "react/jsx-boolean-value": 2, // 在JSX中强制使用布尔属性表示法
        "react/require-render-return": 2, // 强制执行ES5或ES6类以在render函数中返回值
        "react/jsx-wrap-multilines": 2, // 防止多线JSX周围缺少括号
        "react/no-unknown-property": 2,
        "react/no-unused-prop-types": 2,
        "react/jsx-curly-spacing": [2, "never"],
        "react/prefer-es6-class": [2, "always"],
        "react/jsx-equals-spacing": [2, "never"],
        "react/jsx-tag-spacing": [2, {
            "beforeSelfClosing": "always",
            "closingSlash": "never"
        }],
        "react/jsx-first-prop-new-line": [2, "multiline-multiprop"]
    },
    "settings": { // 共享设置，它将提供给每一个将被执行的规则，这里就是以来的eslint-plugin-import插件
        "import/resolver": {
            "node": {
                "extensions": [
                    ".js",
                    ".json"
                ]
            }
        },
        "import/extensions": [
            "node_modules"
        ],
        "import/core-modules": [],
        "import/ignore": [
            "node_modules",
            "\\.(coffee|scss|css|less|hbs|svg|json)$"
        ]
    }

}