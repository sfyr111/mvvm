/**
 *
 * @param data {object}
 * @return void
 */
function observe(data) {
  if (!data || typeof data !== 'object') return
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key])
  })
}

/**
 *
 * @param data {object}
 * @param key {string}
 * @param val {any}
 * @return void
 */
function defineReactive(data, key, val) {
  const dep = new Dep() // 消息订阅器
  observe(val)  // 递归监听子属性
  Object.defineProperty(data, key, {
    enumerable: true, // 可枚举
    configurable: false, // key 属性不可删除
    get() {
      Dep.target && dep.addDep(Dep.target) // 伪，添加订阅者
      return val
    },
    set(newVal) {
      console.log('监听ing: ', val, ' = ', newVal)
      val = newVal
      dep.notify() // 通知所有订阅者
    }
  })
}

/**
 * @name 消息订阅器
 * @constructord subs {array} 收集订阅者
 * @proto addSub {func} 添加订阅者
 * @proto notify {func} 通知所有subs订阅者 -> 更新
 */
function Dep() {
  this.subs = [] // 存放的是watcher 多个订阅者
}

Dep.prototype.addSub = function(sub) {
  this.subs.push(sub)
}

Dep.prototype.notify = function() {
  this.subs.forEach(sub => sub.update())
}