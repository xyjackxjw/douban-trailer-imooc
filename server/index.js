const Koa = require('koa')
const app = new Koa()
const ejs = require('ejs')

const { htmlTpl, ejsTpl } = require('./tpl')

app.use(async (ctx, next) => {
    ctx.type = 'text/html; charset=utf-8'
    ctx.body = ejs.render(ejsTpl, {
        you: 'luke',
        me: 'Scott'
    })
})

app.listen(8000, () => {
    console.log('电影首页服务已启动，监听8000端口')
})