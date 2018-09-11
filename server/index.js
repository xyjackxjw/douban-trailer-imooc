const Koa = require('koa')
const views = require('koa-views')
const mongoose = require('mongoose')

const {
    resolve
} = require('path')

const {
    connect,
    initSchemas,
    initAdmin
} = require('./database/init')

const R = require('ramda')

//定义一个中间件的数组，用ramda方法将router和前端打包的parcel目录下的内容，全部加载进去
// common包含body解析,session等,router为路由,parcel为内容打包到dist目录
const MIDDLEWARES = ['common', 'router', 'parcel'] 

// map：对象的所有属性依次执行某个函数。
// compose：将多个函数合并成一个函数，从右到左执行。
// forEachObjIndexed：每个属性依次执行给定函数，给定函数的参数分别是属性值和属性名，返回原对象。
const useMiddlewares = (app) => {
    R.map(
        R.compose(
            R.forEachObjIndexed(
                initWith => initWith(app) 
            ),
            require,
            name => resolve(__dirname, `./middlewares/${name}`)
        )
    )(MIDDLEWARES)
}

//定义一个定时函数，休眠一个time后再执行
const sleep = time => new Promise(resolve => {
    setTimeout(resolve, time)
})

;(async () => {
    await connect() //连接数据库

    initSchemas()   //创建数据库结构

    await initAdmin()  //创建了一个账户

    //以上爬取豆瓣电影网页,并通过豆瓣api补充数据,然后爬取视频数据,并上传七牛
    // require('./tasks/movie')
    // // await sleep(5000)
    // require('./tasks/api')
    // // await sleep(5000)
    // require('./tasks/trailer')
    // await sleep(5000)
    // require('./tasks/qiniu')

    const app = new Koa()
    await useMiddlewares(app)

    app.listen(8000, () => {
        console.log('电影首页服务已启动，监听8000端口')
    })

})()

/**
 * 虽然Underscore或lodash也提供了 .compose（或 .flowRight）函数来实现函数组合的能力，但ramdajs具有更强的组合力。
 * 它的这种能力主要来自它自有的两大能力：自动柯里化和函数参数优先于数据。
 */

/**
 * 柯里化
拥有高阶函数(例如，函数可以接收一个函数作为参数并返回一个新函数)的能力以及闭包(缓存本地变量)联合起来给了我们一个很好的方式：柯里化。
柯里化是一个把多个参数的函数转变为只接受一个参数并返回另一个只接收一个参数的函数的过程。这个过程持续多次直到收集到所有所需参数。
 */

