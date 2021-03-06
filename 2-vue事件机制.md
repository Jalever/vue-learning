- [Vue 事件 API](#vue-%e4%ba%8b%e4%bb%b6-api)
- [初始化事件](#%e5%88%9d%e5%a7%8b%e5%8c%96%e4%ba%8b%e4%bb%b6)
    - [\$on](#on)
    - [\$emit](#emit)
    - [\$once](#once)
    - [\$off](#off)

## Vue 事件 API

- \$on
- \$emit
- \$once
- \$off

## 初始化事件

初始化事件在 vm 上创建一个`_events`对象，用来存放事件

`_events`的内容如下

```js
_events: {
  event1: [fn1, fn2, ... , fnn],
  event2: [fn1, fn2, ... , fnn],
  ...,
  eventn: [fn1, fn2, ... , fnn],
  _hasHookEvent: true || false;
}
```

存放事件名以及对应执行方法

```js
export function initEvents(vm: Component) {
  /*在vm上创建一个_events对象，用来存放事件。*/
  vm._events = Object.create(null);

  /*
  这个bool标志位来表明是否存在钩子，
  而不需要通过哈希表的方法来查找是否有钩子，
  这样做可以减少不必要的开销，优化性能
  */
  vm._hasHookEvent = false;

  // init parent attached events
  /*初始化父组件attach的事件*/
  const listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}
```

#### \$on

1. \$on(event, fn)
2. event 是数组, 遍历 event 数组, 监听数组中的 event 事件
3. event 不是数组, 如果\_events 存在则 push 进去, 如果不存在, 在创建一个新的数组 push 进入

```js
Vue.prototype.$on = function(
  event: string | Array<string>,
  fn: Function
): Component {
  const vm: Component = this;

  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      vm.$on(event[i], fn);
    }
  } else {
    (vm._events[event] || (vm._events[event] = [])).push(fn);

    // optimize hook:event cost by using a boolean flag marked at registration
    // instead of a hash lookup
    if (hookRE.test(event)) {
      vm._hasHookEvent = true;
    }
  }

  return vm;
};
```

#### \$emit

\$emit(event): 触发指定的自定义事件

```js
Vue.prototype.$emit = function(event: string): Component {
  const vm: Component = this;

  if (process.env.NODE_ENV !== "production") {
    const lowerCaseEvent = event.toLowerCase();

    if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
      tip(
        `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(
            vm
          )} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
      );
    }
  }

  let cbs = vm._events[event];

  /**
   * Convert an Array-like object to a real Array.
   */
  // export function toArray(list: any, start?: number): Array<any> {
  //   start = start || 0;
  //   let i = list.length - start;
  //   const ret: Array<any> = new Array(i);
  //   while (i--) {
  //     ret[i] = list[i + start];
  //   }
  //   return ret;
  // }

  if (cbs) {
    cbs = cbs.length > 1 ? toArray(cbs) : cbs;
    // toArray: 将类数组的对象转换成数组
    const args = toArray(arguments, 1);
    const info = `event handler for "${event}"`;

    /*遍历执行*/
    for (let i = 0, l = cbs.length; i < l; i++) {
      //invokeWithErrorHandling(cbs[i], vm, args, vm, info)
      // => cbs[i].apply(vm, args)
      invokeWithErrorHandling(cbs[i], vm, args, vm, info);
    }
  }

  return vm;
};
```

#### \$once

```js
Vue.prototype.$once = function(event: string, fn: Function): Component {
  const vm: Component = this;
  function on() {
    /*在第一次执行的时候将该事件销毁*/
    vm.$off(event, on);
    /*执行注册的方法*/
    fn.apply(vm, arguments);
  }

  on.fn = fn;
  vm.$on(event, on);

  return vm;
};
```

#### \$off

1. \$off( event, fn )：移除自定义事件
2. 如果不传参数则注销所有事件
3. 如果 event 是数组则递归注销事件
4. 本身不存在该事件则直接返回
5. 如果没有指定对应的 handler 方法则 off 掉该 event 下所有的方法
6. 遍历寻找对应方法并删除

```js
Vue.prototype.$off = function(
  event?: string | Array<string>,
  fn?: Function
): Component {
  const vm: Component = this;

  // all
  /*如果不传参数则注销所有事件*/
  if (!arguments.length) {
    vm._events = Object.create(null);
    return vm;
  }

  // array of events
  /*如果event是数组则递归注销事件*/
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      vm.$off(event[i], fn);
    }
    return vm;
  }

  // specific event
  const cbs = vm._events[event];
  /*本身不存在该事件则直接返回*/
  if (!cbs) {
    return vm;
  }

  // 如果没有指定对应的handler方法则off掉该event下所有的方法
  if (!fn) {
    vm._events[event] = null;
    return vm;
  }

  // specific handler
  /*遍历寻找对应方法并删除*/
  let cb;
  let i = cbs.length;
  while (i--) {
    cb = cbs[i];
    if (cb === fn || cb.fn === fn) {
      cbs.splice(i, 1);
      break;
    }
  }

  return vm;
};
```
