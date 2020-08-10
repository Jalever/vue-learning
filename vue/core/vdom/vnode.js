/* @flow */

export default class VNode {
  tag: string | void; //当前节点的标签名
  data: VNodeData | void; //当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息
  children: ?Array<VNode>; //当前节点的子节点，是一个数组
  text: string | void; //当前节点的文本
  elm: Node | void; //当前虚拟节点对应的真实dom节点
  ns: string | void; //当前节点的名字空间
  context: Component | void; // //编译作用域; rendered in this component's scope
  key: string | number | void; //节点的key属性，被当作节点的标志，用以优化
  componentOptions: VNodeComponentOptions | void; //组件的option选项
  componentInstance: Component | void; //当前节点对应的组件的实例; component instance
  parent: VNode | void; // component placeholder node

  // strictly internal
  raw: boolean; // 简而言之就是是否为原生HTML或只是普通文本，innerHTML的时候为true，textContent的时候为false; contains raw HTML? (server only)
  isStatic: boolean; // 静态节点标志; hoisted static node
  isRootInsert: boolean; // 是否作为根节点插入; necessary for enter transition check
  isComment: boolean; // 是否为注释节点; empty comment placeholder?
  isCloned: boolean; // 是否为克隆节点; is a cloned node?
  isOnce: boolean; // 是否有v-once指令; is a v-once node?
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  devtoolsMeta: ?Object; // used to store functional render context for devtools
  fnScopeId: ?string; // functional scope id support

  constructor(
    tag?: string, //当前节点的标签名
    data?: VNodeData, //当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息
    children?: ?Array<VNode>, //当前节点的子节点，是一个数组
    text?: string, //当前节点的文本
    elm?: Node, //当前虚拟节点对应的真实dom节点
    context?: Component,
    componentOptions?: VNodeComponentOptions, //组件的option选项
    asyncFactory?: Function
  ) {
    this.tag = tag; //当前节点的标签名
    this.data = data; //当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息
    this.children = children; //当前节点的子节点，是一个数组
    this.text = text; //当前节点的文本
    this.elm = elm; //当前虚拟节点对应的真实dom节点
    this.context = context; //编译作用域
    this.componentOptions = componentOptions; //组件的option选项
    this.asyncFactory = asyncFactory;

    this.ns = undefined; //当前节点的名字空间
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key; //节点的key属性，被当作节点的标志，用以优化
    this.componentInstance = undefined; //当前节点对应的组件的实例
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child(): Component | void {
    return this.componentInstance;
  }
}

// 创建一个空VNode节点
export const createEmptyVNode = (text: string = "") => {
  const node = new VNode();
  node.text = text;
  node.isComment = true;
  return node;
};

// 创建一个文本节点
export function createTextVNode(val: string | number) {
  // VNode(tag, data, children, text)
  return new VNode(undefined, undefined, undefined, String(val));
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
export function cloneVNode(vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned;
}
