/**
 * @Fature 订阅者，存放在subs
 * @param vm {Vue} 实例
 * @param exp {string} 执行的表达式
 * @param cb {func} v-bind 时生成实例传入的更新回调
 * @constructor
 */
function Watcher(vm, exp, cb) {
  this.cb = cb
  this.vm = vm
  this.exp = exp
  // 触发属性的getter，在dep 中添加自己，- Observer
  this.value = this.get()
}

Watcher.prototype.update = function() {
  this.run() // 属性值变化收到通知
}

Watcher.prototype.run = function() {
  let value = this.get() // 取到最新值
  let oldVal = this.value
  if (value !== oldVal) {
    this.value = value
    this.cb.call(this.vm, value, oldVal) // 执行Compile 中绑定的回调，更新视图
  }
}

Watcher.prototype.get = function(key) {
  Dep.target = this // 将当前订阅者指向自己
  const value = this.vm[exp] // 这里会触发属性的getter， 从而添加subs 订阅者
  Dep.target = null // 添加完毕，重置
  return value
}