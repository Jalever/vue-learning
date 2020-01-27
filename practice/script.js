// function observe(obj, cb) {
//     Object.keys(obj).forEach(key => defineReactivity(obj, key, obj[key], cb));
// }

// function defineReactivity(obj, key, val, cb) {
//     Object.defineProperty(obj, key, {
//         enumerable: true, 
//         configurable: true,
//         get: () => {
//             return val;
//         },
//         set: newVal => {
//             val = newVal;
//             cb();
//             console.warn('newVal: ');
//             console.log(newVal);
//             console.log("\n");
//         }
//     });
// }

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

