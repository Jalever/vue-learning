Vue version = 2.6.11

## File Structures

```
src
├── compiler        # 编译相关
├── core            # 核心代码
├── platforms       # 不同平台的支持
├── server          # 服务端渲染
├── sfc             # .vue 文件解析
├── shared          # 共享代码
```

## Goal

#### Vue 所使用到的设计模式

1. 观察者模式
2. 状态模式
3. 节流模式
4. 参与者模式
5. 备忘录模式
6. 单例模式
7. 装饰者模式
8. 组合继承模式
9. 链模式
10. ...

#### Vue 的主体内容

1. 依赖收集
2. 依赖更新
3. 响应式原理(依赖收集, 依赖更新)
4. Virtual DOM, dom 节点生成虚拟 Vnode 节点
5. Compile, 模板编译
6. Diff, Patch, 节点比较更新
7. NextTick, 延迟执行回调
8. Render, 渲染机制
9. LifeCircle, 生命周期
10. Model, 双向绑定
11. Event, 事件机制

#### Vue 的主体内容

1. computed
2. filter
3. mixin
4. directive
5. slot
6. props
7. watch
