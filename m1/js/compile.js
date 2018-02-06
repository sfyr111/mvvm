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
  while (child = el.firstChild) { // null 时结束。一般就一次
    fragment.appendChild(child)
  }
  return fragment
}

/**
 *
 * @param el {DocumentFragment}
 * @return void
 */
Compile.prototype.compileElement = function(el) {
  // {NodeList} text element
  let childNodes = el.childNodes,
      _this = this
  Array.slice.call(childNodes).forEach(function(node) {
        let text = node.textContent // 每个节点的文本内容
        let reg = /\{\{(.*)\}\}/ // 匹配{{this.data}} 语法
        // 按元素节点类型编译
        if (_this.isElementNode(node)) _this.compile(node)
        if (_this.isTextNode(node) && reg.test(text)) _this.compileText(node, RegExp.$1)
        if (node.childNodes && node.childNodes.length) _this.compileElement(node) // 递归调用
      })
}

/**
 *
 * @param node {Element}
 * @return void
 */
Compile.prototype.compile = function(node) {
  let nodeAttrs = node.attributes,
      _this = this
  // [id, class , v-text, v-bind]
  Array.slice.call(nodeAttrs).forEach(function(attr) {
    let attrName = attr.name // id class v-text v-for
    if (_this.isDirective(attrName)) {
      let exp = attr.value // ex: v-for的"v for arr", 属性后的表达式
      let dir = attrName.substring(2) // for html texst 属性名
      // 事件Event 指令
      if (/* v-on:click */_this.isEventDirective(dir)) compileUtil.eventHandler(node, _this.$vm, exp, dir)
      // 普通指令 v-text v-bind
      else compileUtil[dir] && compileUtil[dir](node, _this.$vm, exp)
    }
  })
}

Compile.prototype.isDirective = function(attr) {
  return attr.indexOf('v-') === 0
}

Compile.prototype.isEventDirective = function(dir) {
  return dir.indexOf('on') === 0
},

Compile.prototype.isElementNode = function(node) {
  return node.nodeType === 1
},

Compile.prototype.isTextNode = function(node) {
  return node.nodeType === 3
}

/**
 * 普通指令 v-text, v-bind
 * @type {{text: (function(*=, *=, *=)), bind: (function(*=, *=, *=, *))}}
 * @param node {Element}
 * @param vm {Vue}
 * @param exp {string} 指令表达式
 * @param dir {指令名} text html for...
 */
const compileUtil = {
  text(node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },
  bind(node, vm, exp, dir) {
    let updaterFn = updater[dir + 'Updater']
    // 首次初始化视图
    updaterFn && updaterFn(node, vm[exp])
    // 实例化订阅者，此操作会在对应的属性消息订阅器中添加了该订阅者watcher
    new Watcher(vm, exp, function(value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue)
    })
  }
}

const updater = {
  textUpdater(node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  }
}