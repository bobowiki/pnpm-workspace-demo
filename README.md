# pnpm workspace

## pnpm workspace 和 yarn workspace 区别

pnpm 采用的安装更加能够节省内存，他会将所有的包安装在了磁盘的一个地方剩下其他项目用到改包都是一个短链。所以目前大家还是更偏向于使用 pnpm。

## pnpm monorapo 实践

首先需要创建`pnpm-workspace.yaml`文件指定 workspace

```yaml
packages:
  - packages/*
```

## 包管理

通过`pnpm add lodash -w`进行包的全局安装(不是-g)，通过`pnpm add lodash --filter module-a`module-a 下面包的单独安装

## 包和包之间的依赖管理

`pnpm add module-a --workspace --filter module-b`在 b 中使用 a 导出的方法就可以直接执行这个方法

## pnpm 中一些好用的指令

- 执行各个包下面的指令

`pnpm -r exec node index.js`执行所有包下面的 node index.js 指令，这个用于跑测试非常棒

同时你还可以这样 `pnpm --filter module-a run start`只执行 module-a 下面的 pacakge-script 指令

## 已有项目如何变成 monorapo

首先创建 pnpm-workspace.yaml，然后再将已有项目的文件都放在 packages 下面，删除项目中的 node-module 以及相应的.git 文件，然后在最外层执行 pnpm install 他会自动管理好相应的包。非常简单这样就好了

## 不同的包如何进行分开运行

`pnpm --filter vite-react run dev`这样就会执行 vite-react 下面的 npm run dev 指令，--filter 加上相应的包即可

## 组件的调试

在目前我的项目中我引入了一个由 vite 启起来的 lib 库打包模式的 vite-react-compoents 的项目。我先简单介绍一下如何开发第三方库。

首先要进行改造 package.json

```json
  "main": "./dist/vite-react-components.es.js",
  "module": "./dist/vite-react-components.es.js",
  "types": "./dist/vite-react-components.d.ts",
  "exports": {
    ".": {
      "types": "./dist/vite-react-components.d.ts",
      "import": "./dist/vite-react-components.es.js",
      "require": "./dist/vite-react-components.umd.js"
    }
  },
  "files": [
    "dist"
  ],
```

这些配置是针对一个 JavaScript 包（或者 TypeScript 编译后的 JavaScript 包）的，通常用于发布到 npm 上，以便其他开发者使用。让我逐一解释：

1. **"main": "./dist/vite-react-components.es.js"：** 这个字段指定了入口文件。当其他开发者通过 npm 安装你的包时，`require` 或 `import` 语句将会导入这个文件的内容。
2. **"module": "./dist/vite-react-components.es.js"：** 这个字段指定了 ES module 的入口文件。现代的 JavaScript 构建工具（如 Rollup 或 Webpack）会优先使用这个字段作为模块的入口。
3. **"types": "./dist/vite-react-components.d.ts"：** 这个字段指定了 TypeScript 类型声明文件的路径。当其他开发者使用 TypeScript 编写代码，并导入你的包时，TypeScript 编译器会使用这个声明文件来提供代码提示和类型检查。
4. **"exports": {...}：** 这个字段用于配置包的导出方式。这里的配置指定了默认导出的方式，以及模块、CommonJS 和 UMD 规范下的导出方式。这样，其他开发者可以在不同的环境下引入你的包。
5. **"files": ["dist"]：** 这个字段指定了包中要包含的文件和目录。在这个例子中，只有 `dist` 目录会被包含在发布的包中。这样做可以避免将不必要的文件发布到 npm 上，减小包的体积。

这些配置是为了确保你的包可以在不同的环境下正确地被引用和使用，并且提供了 TypeScript 类型声明以便其他开发者在使用时能够得到良好的开发体验。

在配置好之后呢，通过执行`pnpm run build:watch`本质实在执行`tsc && vite build --watch`这样可以监听文件的变化随时进行打包。另外 vite 还需要继续打包的一些配置，主要是 lib 库的打包配置

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import { name as pkName } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: pkName,
      formats: ["es", "umd"],
      fileName: (format) => `${pkName}.${format}.js`,
    },
    outDir: "dist",
  },
  plugins: [react(), dts({ rollupTypes: true })],
});
```

这样我们就能打包成 lib 模式了，通过执行`pnpm --filter vite-react add vite-react-components --workspace`这样就能直接进行 lib 包的调试了。

有一点我想说的是 vite 的打包`"build": "tsc && vite build"`tsc 在 tsconfig.json 中设置了`"noEmit": true`也就是 tsc 并不会对文件进行编译和打包，在这里 tsc 只是起到了执行代码的检查，包括类型检查、语法检查等，以确保代码的质量和正确性。

## 脚本优化

我们看到在每次执行 packages 下面 module 的命令时要写一大段`pnpm --filter vite-react-compoents run build:watch`非常的不方便，那如何优化呢？

我们可以直接在最外层的 package.json 里面添加以下脚本。

```json
  "scripts": {
    "com:build:watch": "pnpm --filter vite-react-components run build:watch",
    "com:build": "pnpm --filter vite-react-components run build"
  },
```

在这里为了让脚本更加语义化，可以将你的包名放在前面然后再写上包里面的命令，中间冒号隔开，这样就更加的清晰。
