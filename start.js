require('babel-core/register')() //运行一个es6并不支持的，需要运行时
require('babel-polyfill')
// require('./server/test/dec1.js')
require('./server/index.js')