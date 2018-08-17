const Koa = require('koa')
const app = new Koa()

const { normal} = require('./tpl')

app.use(async (ctx, next) => {
    ctx.type = 'text/html; charset=utf-8'
    ctx.body = normal
})

app.listen(8000, () => {
    console.log('电影首页服务已启动，监听8000端口')
})