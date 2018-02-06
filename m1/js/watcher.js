// 订阅者，存放在subs
function Watcher() {
  this.value
}

Watcher.prototype.get = function(key) {
  Dep.target = this
  this.value = data[key] // 这里会触发属性的getter， 从而添加subs 订阅者
  Dep.target = null
}