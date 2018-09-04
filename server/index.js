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
const MIDDLEWARES = ['common', 'router', 'parcel'] //定义一个中间件的数组，用ramda方法将router全部加载进去

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

;(async () => {
    await connect()

    initSchemas()

    await initAdmin()

    const app = new Koa()
    await useMiddlewares(app)

    app.listen(8000, () => {
        console.log('电影首页服务已启动，监听8000端口')
    })

})()


