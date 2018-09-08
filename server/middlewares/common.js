import bodyParser from 'koa-bodyparser'
import logger from 'koa-logger'
import session from 'koa-session'

//解析返回体的中间件
export const addBodyParser = app => {
  app.use(bodyParser())
}

export const addLogger = app => {
  app.use(logger())
}

export const addSession = app => {
  app.keys = ['imooc-trailer']

  const CONFIG = {
    key: 'koa:sess',
    maxAge: 86400000,
    overwrite: true,
    httpOnly: false,
    signed: true,
    rolling: false
  }

  app.use(session(CONFIG, app))
}