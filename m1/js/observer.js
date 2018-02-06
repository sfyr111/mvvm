/**
 *
 * @param data {object}
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
 */
function defineReactive(data, key, val) {
  // 递归监听子属性
  observe(val)
  Object.defineProperty(data, key, {
    enumerable: true, // 可枚举
    configurable: false, // key 属性不可删除
    get() {
      return val
    },
    set(newVal) {
      console.log('监听ing: ', val, ' = ', newVal)
      val = newVal
    }
  })
}