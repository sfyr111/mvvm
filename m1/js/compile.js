/**
 *
 * @param el {HTMLElement} dom 节点
 * @constructor $el dom节点
 * @constructor $fragment fragment节点
 */
function Compile(el, vm) {
  this.$vm = vm
  this.$el = this.isElementNode(el) ? el : document.querySelector(el)
  if (this.$el) {
    this.$fragment = this.node2Fragment(this.$el) // 原生节点转换成fragment
    this.init() // 把$fragment 进行编译
    this.$el.appendChild(this.$fragment)
  }
}

Compile.prototype = {
  node2Fragment(el) {
    let child,
        fragment = document.createDocumentFragment()

    // 讲原生节点拷贝到fragment 拷贝节点
    while (child = el.firstChild) {
      fragment.appendChild(child)
    }
    return fragment
  },
  init() {
    this.compileElement(this.$fragment)
  },
  compileElement(el) {
    let childNodes = el.childNodes,
        _this = this

    Array.prototype.slice.call(childNodes).forEach(function(node) {
      const text = node.textContent
      const reg = /\{\{(.*)\}\}/ // 匹配{{data}} 模板语法

      if (_this.isElementNode(node)) _this.compile(node)
      else if (_this.isTextNode(node) && reg.test(text)) _this.compileText(node, RegExp.$1)
      // 子节点递归
      if (node.childNodes && node.childNodes.length) _this.compileElement(node)
    })
  },
  compile(node) {
    let nodeAttrs = node.attributes,
        _this = this

    Array.prototype.slice.call(nodeAttrs).forEach(function(attr) {
      let attrName = attr.name
      if (_this.isDirective(attrName)) {
        let exp = attr.value
        let dir = attrName.substring(2)
        // Event 指令 v-on
        if (_this.isEventDirective(dir)) compileUtil.eventHandler(node, _this.$vm, exp, dir)
        // 普通指令绑定
        else compileUtil[dir] && compileUtil[dir](node, _this.$vm, exp)
        node.removeAttribute(attrName) // 删了？
      }
    })
  },
  compileText(node, exp) {
    compileUtil.text(node, this.$vm, exp)
  },
  isDirective(attr) {
    return attr.indexOf('v-') === 0
  },
  isEventDirective(dir) {
    return dir.indexOf('on') === 0
  },
  isElementNode(node) {
    return node.nodeType === 1
  },
  isTextNode(node) {
    return node.nodeType === 3
  }
}

// 指令处理集合
const compileUtil = {
  text(node, vm, exp) {
    this.bind(node, vm, exp, 'text')
  },
  html(node, vm, exp) {
    this.bind(node, vm, exp, 'html')
  },
  model(node, vm, exp) {
    this.bind(node, vm, exp, 'model')

    let _this = this,
        val = this._getVMVal(vm, exp)
    node.addEventListener('input', function(e) {
      let newValue = e.target.value
      if (val === newValue) return
      _this._setVMVal(vm, exp, newValue)
      val = newValue
    })
  },
  class(node, vm, exp) {
    this.bind(node, vm, exp, 'class')
  },
  bind(node, vm, exp, dir) {
    let updaterFn = updater[dir + 'Updater']
    // 首次初始化视图
    updaterFn && updaterFn(node, this._getVMVal(vm, exp))
    // 实例化订阅者，此操作会在对应的属性消息订阅器中添加了该订阅者watcher
    new Watcher(vm, exp, function(value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue)
    })
  },
  /**
   * @fature 事件处理 v-on:click="handleClick"
   * @param node {Element}
   * @param vm {}
   * @param exp {string} 函数名handleClick
   * @param dir {string} :click
   */
  eventHandler(node, vm, exp, dir) {
    let eventType = dir.split(':')[1],
        fn = vm.$options.methods && vm.$options.methods[exp]

    if (eventType && fn) node.addEventListener(eventType, fn.bind(vm), false)
  },
  /**
   * @fature 处理对象v-model="obj.o.name" 的值
   * @param vm 实例，没啥用标识的
   * @param exp obj.o.name
   * @returns {*} name 的值
   * @private
   */
  _getVMVal(vm, exp) {
    let val = vm
    exp = exp.split('.')
    exp.forEach(function(k) {
      val = val[k]
    })
    return val
  },
  _setVMVal(vm, exp, value) {
    let val = vm
    exp = exp.split('.')
    exp.forEach(function(k, i) {
      if (i < exp.length - 1) val = val[k] // 遍历到最后一个key
      else val[k] = value // 只当最后一个key 时赋值
    })
  }
}

const updater = {
  textUpdater(node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  },
  htmlUpdater(node, value) {
    node.innerHTML = typeof value === 'undefined' ? '' : value
  },
  classUpdater(node, value, oldValue) {
    let className = node.className
    className = className.replace(oldValue, '').replace(/\s$/, '')

    let space = className && String(value) ? ' ' : ''

    node.className = className + space + value
  },
  modelUpdater(node, value) {
    node.value = typeof value === 'undefined' ? '' : value
  }
}
