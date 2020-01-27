- [响应式原理](#%e5%93%8d%e5%ba%94%e5%bc%8f%e5%8e%9f%e7%90%86)
- [依赖收集](#%e4%be%9d%e8%b5%96%e6%94%b6%e9%9b%86)
- [数据绑定](#%e6%95%b0%e6%8d%ae%e7%bb%91%e5%ae%9a)

## 响应式原理

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
};

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

app.text1 = '222d';
```

## 依赖收集
"defineReactive.set() { notify() }" -> "dep.update()" -> "watcher" 

## 数据绑定
