const Koa = require('koa')
const app = new Koa()

app.use(async (ctx, next) => {
    ctx.body = '电影首页'
})

app.listen(8000, () => {
    console.log('电影首页服务已启动，监听8000端口')
})