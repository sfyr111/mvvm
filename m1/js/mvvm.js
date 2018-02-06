function MVVM(options) {
  this.$options = options
  const data = this._data = this.$options.data
  observe(data, this)
  this.$compile = new Compile(options.el || document.body, this)
}

/**
 * @fature 劫持vm 实例的属性读写权 vm.data 修改 vm.options.data
 * @param key
 * @private
 */
MVVM.prototype._proxy = function(key) {
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