const mongoose = require('mongoose')
const db = 'mongodb://localhost/douban-trailer'
const { resolve } = require('path')

const glob = require('glob')//文件加载工具

mongoose.Promise = global.Promise

//同步加载schema目录下的所有model文件
exports.initSchemas = () => {
    glob.sync(resolve(__dirname, './schema', '**/*.js')).forEach(require)
}

exports.initAdmin = async () => {
    const User = mongoose.model('User')
    let user = await User.findOne({
        username: 'Scott'
    })
    //预设一个管理员账户
    if(!user) {
        const user = new User({
            username: 'Scott',
            email: 'koa2@imooc.com',
            password: '123abc',
            role:'admin'
        })

        await user.save()
    }
}

exports.connect = () => {
    //最大重连次数
    let maxConnectTimes = 0

    //放在promise里面，保证连接数据库后再干别的事
    return new Promise((resolve, reject) => {

        //如果不是生产环境，需要打印debug信息
        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true)
        }

        mongoose.connect(db) //5.0版本前还需要一些配置参数

        // 如果数据库断开,重新连接
        mongoose.connection.on('disconnected', () => {
            maxConnectTimes ++
            if (maxConnectTimes < 5) {
                mongoose.connect(db)
            } else {
                throw new Error('数据库问题，请尽快修复')
            }           
        })

        // 如果数据库出错,重新连接
        mongoose.connection.on('error', err => {
            maxConnectTimes ++
            if (maxConnectTimes < 5) {
                mongoose.connect(db)
            } else {
                throw new Error('数据库问题，请尽快修复')
            }
        })

        mongoose.connection.once('open', () => {
            resolve()
            console.log('MongoDB 连接成功！')
        })

    })

}