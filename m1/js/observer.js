function Observer(data) {
  this.data = data
  this.walk(data)
}

Observer.prototype = {
  // 遍历data
  walk(data) {
    const _this = this
    Object.keys(data).forEach(function(key) {
      _this.convert(key, data[key])
    })
  },
  // 转化至订阅者
  convert(key, val) {
    this.defineReactive(this.data, key, val)
  },
  // 使每个复杂属性都都添加到订阅者内
  defineReactive(data, key, val) {
    const dep = new Dep() // 消息订阅器
    let childObj = observe(val) // 递归监听复杂属性

    Object.defineProperty(data, key, {
      enumerable: true, // 枚举
      configurable: false, // 不给del
      get() {
        // target 就是watcher
        Dep.target && dep.depend() // 添加订阅者
        return val
      },
      set(newVal) {
        if (newVal === val) return
        console.log('监听ing: ', val, ' = ', newVal)
        val = newVal
        // newVal 是object 进行监听
        childObj = observe(newVal)
        // 通知订阅者
        dep.notify()
      }
    })
  }
}
/**
 *
 * @param data {object}
 * @return void
 */
function observe(data) {
  if (!data || typeof data !== 'object') return

  return new Observer(data)
}

/**
 * @name 消息订阅器
 * @constructord subs {array} 收集订阅者
 * @proto addSub {func} 添加订阅者
 * @proto notify {func} 通知所有subs订阅者 -> 更新
 */
let uid = 0
function Dep() {
  this.id = uid++
  this.subs = [] // 存放的是watcher 多个订阅者
}

Dep.prototype.addSub = function(sub) {
  this.subs.push(sub)
}

Dep.prototype.notify = function() {
  this.subs.forEach(sub => sub.update())
}

Dep.prototype = {
  addSub(sub) {
    this.subs.push(sub)
  },
  depend() {
    Dep.target.addDep(this)
  },
  notify() {
    // 订阅者watcher全体更新
    this.subs.forEach(function(sub) {
      sub.update()
    })
  },
  removeSub(sub) {
    let index = this.subs.indexOf(sub)
    if (index !== -1) this.subs.splice(index, 1)
  }
}

Dep.target = null // 重置