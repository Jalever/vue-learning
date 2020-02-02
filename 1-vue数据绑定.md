- [响应式原理](#%e5%93%8d%e5%ba%94%e5%bc%8f%e5%8e%9f%e7%90%86)
- [依赖收集](#%e4%be%9d%e8%b5%96%e6%94%b6%e9%9b%86)
    - [为什么要依赖收集](#%e4%b8%ba%e4%bb%80%e4%b9%88%e8%a6%81%e4%be%9d%e8%b5%96%e6%94%b6%e9%9b%86)
    - [依赖收集的过程](#%e4%be%9d%e8%b5%96%e6%94%b6%e9%9b%86%e7%9a%84%e8%bf%87%e7%a8%8b)
- [数据绑定](#%e6%95%b0%e6%8d%ae%e7%bb%91%e5%ae%9a)
    - [数据绑定成员是数组](#%e6%95%b0%e6%8d%ae%e7%bb%91%e5%ae%9a%e6%88%90%e5%91%98%e6%98%af%e6%95%b0%e7%bb%84)

## 响应式原理

1. 通过 ES 6 中的 Object.defineProperty 修改 Vue 实例中的 data 对象的 data descriptor
2. 每次修改 data 对象中的数据时就会调用 callback 方法
3. accessor descriptor存取描述符( configurable, enumerable, get, set )
4. data descriptor数据描述符( configurable, enumerable, value, writable )

```js
function observe(obj, cb) {
  Object.keys(obj).forEach(key => defineReactivity(obj, key, obj[key], cb));
}

function defineReactivity(obj, key, val, cb) {
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: () => {
      return val;
    },
    set: newVal => {
      val = newVal;
      cb();
      console.warn("newVal: ");
      console.log(newVal);
      console.log("\n");
    }
  });
}

class Vue {
  constructor(options) {
    this._data = options.data;
    observe(this._data, options.render);
  }
}

let app = new Vue({
  el: "",
  data: {
    text1: "text11_value",
    text2: "text22_value"
  },
  render() {
    console.log("render____render____");
  }
});

app._data.text1 = "222d";
```

改良后:

```js
function _proxy(obj, cb) {
  let that = this;

  Object.keys(obj).forEach(key => {
    Object.defineProperty(that, key, {
      configurable: true,
      enumerable: true,
      get: () => {
        return that._data[key];
      },
      set: newVal => {
        that._data[key] = newVal;
        cb();
      }
    });
  });
}

class Vue {
  constructor(options) {
    this._data = options.data;

    // observe(this._data, options.render);
    _proxy.call(this, options.data, options.render);
  }
}

let app = new Vue({
  el: "",
  data: {
    text1: "text11_value",
    text2: "text22_value"
  },
  render() {
    console.log("render____render____");
  }
});

app.text1 = "222d";
```

## 依赖收集

#### 为什么要依赖收集

```javascript
new Vue({
  template: `<div>
            <span>text1:</span> {{text1}}
            <span>text2:</span> {{text2}}
        <div>`,
  data: {
    text1: "text1",
    text2: "text2",
    text3: "text3"
  }
});
```

按上面'响应式原理'所述会出现一种情况, text3 的数据在模板中并没有用到, 但是修改 text3 的数据时会触发该数据的 setter 调用 `callback()`方法执行重新渲染, 依赖收集就是为了解决这种情况所诞生的

#### 依赖收集的过程
1. 项目启动最开始时进行一次渲染, 渲染所依赖 data 中的数据就会被 getter 收集到 Dep 收集类的 subs 数组中去, 在后续对 data 中的数据进行修改时就只会对 subs 中的函数进行触发.
2. 在修改 data 中数据的时候会触发 dep 中的 notify 方法, 该方法通知所有的 watcher 去修改对应的视图
3. Watcher 观察者中会将实例赋值给全局 Dep.target, 然后在触发 render 操作时只有被 Dep.target 标记过的 sub 才会被依赖收集.

```javascript
export function defineReactive(
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep();
  ...
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      if (Dep.target) {
        dep.depend();
      }

      return value;
    },
    set: function reactiveSetter(newVal) {
      ...
      dep.notify();
    }
  });
}
```

```javascript
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor() {
    this.id = uid++;
    this.subs = []; //被渲染所需要的数据
  }

  //依赖收集
  addSub(sub: Watcher) {
    this.subs.push(sub);
  }

  //从subs数组中移除sub
  removeSub(sub: Watcher) {
    remove(this.subs, sub);
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice();

    //在对data中的数据进行修改的时候setter就只会触发subs中的函数
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}
```

```javascript
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;

  constructor(vm: Component, expOrFn: string | Function, cb: Function) {
    this.vm = vm;

    //_watchers存放订阅者实例
    vm._watchers.push(this);

    this.cb = cb;
    this.id = ++uid; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.expression =
      process.env.NODE_ENV !== "production" ? expOrFn.toString() : "";

    this.value = this.lazy ? undefined : this.get();
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get() {
    // 在这里将观察者本身赋值给全局的target，只有被target标记过的才会进行依赖收集
    pushTarget(this);

    let value;
    const vm = this.vm;

    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }

      popTarget();
      this.cleanupDeps();
    }

    return value;
  }

  /**
   * Add a dependency to this directive.
   */
  addDep(dep: Dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);

      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      //没有相同的watcher id就push进watcher数组
      queueWatcher(this);
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run() {
    if (this.active) {
      const value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value;
        this.value = value;

        // 触发渲染操作进行依赖收集
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }
}
```

## 数据绑定

#### 数据绑定成员是数组

如果我们进行`pop`、`push`等操作的时候，`push`进去的对象根本没有进行过双向绑定，更别说`pop`了，那么我们如何监听数组的这些变化呢？ `Vue.js`提供的方法是重写`push`、`pop`、`shift`、`unshift`、`splice`、`sort`、`reverse`这七个数组方法

```javascript
const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse"
];

// Intercept mutating methods and emit events
methodsToPatch.forEach(function(method) {
  // cache original method
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    let inserted;

    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }

    if (inserted) ob.observeArray(inserted);
    // observeArray(items: Array<any>) {
    //   for (let i = 0, l = items.length; i < l; i++) {
    //     observe(items[i]);
    //   }
    // }

    // notify change
    ob.dep.notify();
    return result;
  });
});
```
