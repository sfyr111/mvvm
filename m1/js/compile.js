/**
 *
 * @param el {HTMLElement} dom 节点
 * @constructor $el dom节点
 * @constructor $fragment fragment节点
 */
function Compile(el) {
  this.$el = this.isElementNode(el) ? el : document.querySelector(el)
  if (this.$el) {
    this.$fragment = this.node2Fragment(this.$el) // 原生节点转换成fragment
    this.init() // 把$fragment 进行编译
  }
}

Compile.prototype.init = function() {
  this.compileElement(this.$fragment)
}

/**
 *
 * @param el {HTMLElement} dom 节点
 * @returns {DocumentFragment}
 */
Compile.prototype.node2Fragment = function(el) {
  let child,
      fragment = document.createDocumentFragment()
  // 讲原生节点拷贝到fragment 拷贝节点
  while (child = el.firstChild) { // null 时结束
    fragment.appendChild(child)
  }
  return fragment
}
