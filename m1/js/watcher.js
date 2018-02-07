/**
 * @fature 订阅者，存放在subs
 * @param vm {Vue} 实例
 * @param exp {string || func} 执行的表达式. object.o.name | handlerFn
 * @param cb {func} v-bind 时生成实例传入的更新回调
 * @constructor
 */
function Watcher(vm, exp, cb) {
  this.cb = cb
  this.vm = vm
  this.exp = exp
  this.depIds = {}

  if (typeof exp === 'function') this.getter = exp
  else this.getter = this.parseGetter(exp)

  // 触发属性的getter，在dep 中添加自己，- Observer
  this.value = this.get()
}

Watcher.prototype = {
  update() {
    // observer notify 进行更新
    this.run()
  },
  run() {
    let value = this.get() // 取到最新值
    let oldval = this.value
    if (value !== oldval) {
      this.value = value
      this.cb.call(this.vm, value, oldval) // 执行Compile 中绑定的回调，更新视图
    }
  },
  addDep(dep) {
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.addSub(this)
      this.depIds[dep.id] = dep
    }
  },
  get() {
    Dep.target = this // 将当前订阅者指向自己
    // this.vm context 中 把this.vm传入
    let value = this.getter.call(this.vm, this.vm) // 这里会触发属性的getter， 从而添加subs 订阅者
    Dep.target = null // 添加完毕，重置
    return value
  },
  parseGetter(exp) {
    if (/[^\w.$]/.test(exp)) return
    // [object, o, name]
    let exps = exp.split('.')

    return function(vm) {
      for (let i = 0; i < exps.length; i++) {
        if (!vm) return
        vm = vm[exps[i]] // vm[object] MVVM 用了_proxyData 代理属性
      }
      return vm // 遍历到name
    }
  }
}
