const { Route } = require('../lib/decorator')
const { resolve } = require('path')

export const router = app => {
    const apiPath = resolve(__dirname, '../routes')
    const router = new Route(app, apiPath)  //这里对接响应前端请求路由

    router.init()
}