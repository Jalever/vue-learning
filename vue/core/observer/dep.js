/* @flow */

import type Watcher from "./watcher";
import { remove } from "../util/index";
import config from "../config";

let uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
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

  //从subs数组中移除sub;移除渲染不需要的数据
  removeSub(sub: Watcher) {
    //   export function remove (arr: Array<any>, item: any): Array<any> | void {
    //   if (arr.length) {
    //     const index = arr.indexOf(item)
    //     if (index > -1) {
    //       return arr.splice(index, 1)
    //     }
    //   }
    // }
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

    // 开发环境 && 非异步
    if (process.env.NODE_ENV !== "production" && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id);
    }

    //在对data中的数据进行修改的时候setter就只会触发subs中的函数
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;
const targetStack = [];

export function pushTarget(target: ?Watcher) {
  targetStack.push(target);
  Dep.target = target;
}

export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
