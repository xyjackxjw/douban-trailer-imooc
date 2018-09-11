const Bundler = require('parcel-bundler')
const views = require('koa-views')
const serve = require('koa-static')

const { resolve } = require('path')

const r = path => resolve(__dirname, path)//拼接地址

// 前端的首页地址,将前端内容打包到dist目录
const bundler = new Bundler(r('../../../src/index.html'), {
    publicUrl: '/',
    watch: true //观察是否有更新
})

// 启动dist目录的服务
export const dev = async app => {
    await bundler.bundle()

    app.use(serve(r('../../../dist')))
    app.use(views(r('../../../dist')), {
        extension: 'html'
    })

    app.use(async (ctx) => {
        await ctx.render('index.html')
    })
}