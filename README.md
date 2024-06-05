# pnpm workspace

## pnpm workspace和yarn workspace区别

pnpm 采用的安装更加能够节省内存，他会将所有的包安装在了磁盘的一个地方剩下其他项目用到改包都是一个短链。所以目前大家还是更偏向于使用pnpm。

## pnpm monorapo实践

首先需要创建`pnpm-workspace.yaml`文件指定workspace

```yaml
packages: 
  - packages/*
```

## 包管理

通过`pnpm add lodash -w`进行包的全局安装(不是-g)，通过`pnpm add lodash --filter module-a`module-a下面包的单独安装

## 包和包之间的依赖管理

`pnpm add module-a --workspace --filter module-b`在b中使用a导出的方法就可以直接执行这个方法

## pnpm中一些好用的指令

`pnpm -r exec node index.js`执行所有包下面的node index.js指令，这个用于跑测试非常棒
