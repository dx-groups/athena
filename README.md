# athena


[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![gemnasium deps][gemnasium-image]][gemnasium-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/@dx-groups/athena.svg?style=flat-square
[npm-url]: http://npmjs.org/package/@dx-groups/athena
[travis-image]: https://img.shields.io/travis/elephant-fe/@dx-groups/athena.svg?style=flat-square
[travis-url]: https://travis-ci.org/elephant-fe/@dx-groups/athena
[coveralls-image]: https://img.shields.io/coveralls/elephant-fe/@dx-groups/athena.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/elephant-fe/@dx-groups/athena?branch=master
[gemnasium-image]: http://img.shields.io/gemnasium/elephant-fe/@dx-groups/athena.svg?style=flat-square
[gemnasium-url]: https://gemnasium.com/elephant-fe/@dx-groups/athena
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/@dx-groups/athena.svg?style=flat-square
[download-url]: https://npmjs.org/package/@dx-groups/athena


`athena` 是基于 webpack 的应用开发工具，添加灵活的配置选项及周边支持


安装：

[![@dx-groups/athena](https://nodei.co/npm/@dx-groups/athena.png)](https://npmjs.org/package/@dx-groups/athena)


## 设计原则

尽量遵循 "开闭原则" - 对扩展开放，对修改关闭

将必要的内容固化，力求按照统一标准对外输出结果


## 定制

athena 默认会解析项目根目录下的 `.athena.js` 文件，并在构建时应用配置的内容，文件的结构如下：

```javascript
module.exports = {
  entry: '<src/index.js>',                    // 项目的入口文件，默认为 'src/index.js'
  publicPath: '</>',                          // 项目发布路径，默认为根目录启动 '/'
  babel: {},                                  // babel 配置信息
  webpack: {
    dev: {},                                  // 开发时用到的 webpack 配置
    prod: {},                                 // 构建时用到的 webpack 配置
    vendor: [],                               // 构建时，splitChunks 插件独立打包的模块
    dll: []                                   // 开发时 dll 列表
  },
  serviceWorker: '<src/service-worker.js>'    // service-worker配置
  proxy: {},                                  // 代理配置
}
```

其中，babel 默认配置为

```javascript
{
  babelrc: false,
  highlightCode: true,
  presets: [
    ['@babel/preset-env', { modules: false }],
    ['@babel/preset-stage-0', { decoratorsLegacy: true }],
    '@babel/preset-react',
  ],
  plugins: [
    'react-hot-loader/babel',
  ],
}
```

service-worker 为项目注入了 PWA 的相关支持，默认实现采用 [Workbox API](https://developers.google.com/web/tools/workbox/)，可参考 [示例代码](./examples/demo/src/service-worker.js)

## 环境变量

为了使项目使用各种环境，常常需要能在代码中注入多种环境变量，athena 为此提供了友好的支持

只要在执行命令时添加

```bash
ATHENA_ENV_<env>=<value> athena <cmd>
```

之后，在代码中，即可通过 `process.env.<env>` 取到该值

例如： 执行命令

> ATHENA_ENV_BUILD_ENV=test athena build'

项目中即可取到 process.env.BUILD_ENV 的值为 test


## 命令

一个常规的 athena 项目，其 `package.json` 的 `scripts` 配置如下

```json
"scripts": {
  "start": "athena start",
  "build": "athena build",
  "analyze": "athena build --report",
  "lint": "athena lint src",
  "lint-fix": "athena lint-fix src"
},
```

### start

以开发模式启动 app

然后可以在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果

### build

构建用于发布的版本，默认都生成在 `build` 目录下

也可以执行 `build --report` 命令，分析部署包中的内容构成

## lint && lint-fix

默认内置了 `eslint` 和 `stylelint` 两种 lint 工具，并且触发时机是一致的

eslint 的规则可以在项目根目录下创建 `.eslintrc` 或者 `.eslintrc.js` 中配置

stylelint 的规则可以在项目根目录下创建 `.stylelintrc` 中配置

## html 模板参考

有时候需要在 html 中根据不同的运行环境添加不同的脚本或标签，可以借助模板语法，并根据 `htmlWebpackPlugin.options.minify` 的值来判断处理，比如：

```html
<% if (htmlWebpackPlugin.options.minify) { %>
  <script defer src="//cdn.bootcss.com/react/16.2.0/umd/react.production.min.js"></script>
  <script defer src="//cdn.bootcss.com/react-dom/16.2.0/umd/react-dom.production.min.js"></script>
<% } %>
```

## HMR

开发时借助 [react-hot-loader](https://github.com/gaearon/react-hot-loader) 支持 HMR，只要在 App 文件中做如下处理即可

```javascript
// ./containers/App.js
import React from 'react'
import { hot } from 'react-hot-loader'

const App = () => <div>Hello World!</div>

export default hot(module)(App)
```

也可参考 [示例程序](./examples/demo/src/App.js)

## mock

为了提升开发体验，除了提供 proxy 的功能外，对简单的接口，mock 工具在很多场景下都是更好的选择

athena 默认集成了 webpack-api-mocker，并解析项目根目录下的 `.athena.mock.js` 文件，具体语法请参考 [webpack-api-mocker](https://github.com/jaywcjlove/webpack-api-mocker)
