// 判断是开发还是生产环境，来调用不同的文件
const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'

module.exports = require(`./${env}.js`)