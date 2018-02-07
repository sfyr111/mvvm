function MVVM(options) {
  this.$options = options || {}
  const data = this._data = this.$options.data
  const _this = this

  // data 数据代理
  Object.keys(data).forEach(function(key) {
    _this._proxyData(key)
  })

  this._initComputed()

  observe(data, this)

  // 绑定html
  this.$compile = new Compile(options.el || document.body, this)
}

/**
 * @fature 劫持vm 实例的属性读写权 vm.data 修改 vm.options.data
 * @param key
 * @private
 */
MVVM.prototype._proxyData = function(key) {
  const _this = this
  Object.defineProperty(_this, key, {
    configurable: false,
    enumerable: true,
    get: function proxyGetter() {
      return _this._data[key]
    },
    set: function proxySetter(newVal) {
      _this._data[key] = newVal
    }
  })
}

MVVM.prototype._initComputed = function() {
  const _this = this
  let computed = this.$options.computed
  if (typeof computed === 'object') {
    Object.keys(computed).forEach(function(key) {
      Object.defineProperty(_this, key, {
        // 计算属性的两种情况
        get: typeof computed[key] === 'function'
                ? computed[key]
                : computed[key].get,
        set: function() {}
      })
    })
  }
}

MVVM.prototype.$watch = function(key, cb, options) {
  new Watcher(this, key, cb)
}