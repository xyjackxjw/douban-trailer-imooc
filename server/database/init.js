const mongoose = require('mongoose')
const db = 'mongodb://localhost/douban-trailer'
const { resolve } = require('path')

const glob = require('glob')

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

    if(!user) {
        const user = new User({
            username: 'Scott',
            email: 'koa2@imooc.com',
            password: '123abc'
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

        mongoose.connection.on('disconnected', () => {
            maxConnectTimes ++
            if (maxConnectTimes < 5) {
                mongoose.connect(db)
            } else {
                throw new Error('数据库问题，请尽快修复')
            }           
        })

        mongoose.connection.on('error', err => {
            maxConnectTimes ++
            if (maxConnectTimes < 5) {
                mongoose.connect(db)
            } else {
                throw new Error('数据库问题，请尽快修复')
            }
        })

        mongoose.connection.once('open', () => {

            //测试一下
            // const Dog = mongoose.model('Dog',{ name: String })
            // const doga = new Dog({ name: '阿尔法'})

            // doga.save().then(() => {
            //     console.log('wang!!!')
            // })


            resolve()
            console.log('MongoDB 连接成功！')
        })

    })

}