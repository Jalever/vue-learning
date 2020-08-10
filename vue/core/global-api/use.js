/* @flow */

import { toArray } from '../util/index'

export function initUse(Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    //拿到已安装插件列表
    const installedPlugins =
      this._installedPlugins || (this._installedPlugins = [])

    //如果已经安装，直接跳出方法
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // 如果已经安装，直接跳出方法
    const args = toArray(arguments, 1)

    // 将vue对象填充到第一位, 最后的结构为[vue,arg1,arg2,...]
    args.unshift(this)

    //判断插件是否有install方法，如果有执行install方法，如果没有直接把插件当install执行
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }

    //注册完成填充至已安装列表，保证每个插件只安装一次
    installedPlugins.push(plugin)

    return this
  }
}
