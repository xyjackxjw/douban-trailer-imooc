const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const { resolve } = require('path')

// const { htmlTpl, ejsTpl } = require('./tpl')
//使用kao-views中间件，来应用各种模板引擎，有两个参数，第一个是views目录下，第二个表示扩展名为pug的所有文件都是模板
app.use(views(resolve(__dirname, './views'),{
    extension: 'pug'
}))

app.use(async (ctx, next) => {
    await ctx.render('index', {
        you: 'Luke',
        me: 'Scott '
    })
})

app.listen(8000, () => {
    console.log('电影首页服务已启动，监听8000端口')
})