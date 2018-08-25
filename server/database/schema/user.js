const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const Mixed = Schema.Types.Mixed

const SALT_WORK_FACTOR = 10  //加盐加密的算法权重值
const MAX_LOGIN_ATTEMPS = 5  //最大登录尝试次数
const LOCK_TIME = 2 * 60 *60 * 1000 //两个小时的登录错误锁定时间

const userSchema = new Schema({
    username: {
        unique: true,
        type: String
    },
    email: {
        unique: true,
        type: String
    },
    password: {
        unique: true,
        type: String
    },
    loginAttempts: {
        type: Number,
        required: true, //不能为空
        default: 0
    },
    lockUntil: Number,
    meta: {
        createdAt: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }
})

//虚拟字段，不会存到数据库中，表示用户是否被锁定,两次取反？？？
userSchema.virtual('isLocked').get(() => {
    return !!(this.lockUntil && this.lockUntil > Date.now())
})

//增加一个中间件
userSchema.pre('save', function (next)  {
    // 如果一条数据是新数据，则将创建和更新时间都设为当前
    if(this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now()
    }else {
        this.meta.updatedAt = Date.now()
    }
    next()
})

//增加一个中间件,对密码进行加盐
userSchema.pre('save', function (next) {
    // 如果password没有修改过，则控制权到下一步
    if( !this.isModified('password') ) return next()

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if(err) return next(err)

        bcrypt.hash(this.paswword, salt, (error, hash) => {
            if(error) return next(error)

            this.password = hash
            next()
        })
    })

    next()
})

//实例方法，比较密码，和判断登录尝试次数
userSchema.methods= {
    comparePassword: (_password, password) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(_password, password, (err, isMatch) => {
                if(!err) resolve(isMatch)
                else reject(err)
            })
        })
    },
    
    incLoginAttepts: (user)=> {
        return new Promise((resolve, reject) => {
            if(this.lockUntil && this.lockUntil < Date.now()){
                this.update({
                    $set: {
                        loginAttempts: 1
                    },
                    $unset: {
                        lockUntil: 1
                    }
                },(err) => {
                    if(!err) resolve(true)
                    else reject(err)
                })
            } else {
                let updates = {
                    $inc: {
                        loginAttempts: 1
                    }
                }

                if(this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPS && !this.isLocked) {
                    updates.$set = {
                        lockUntil: Date.now() + LOCK_TIME
                    }
                }

                this.update(updates, err => {
                    if(!err) resolve(true)
                    else reject(err)
                })
            }
        })
    }
}

mongoose.model('User', userSchema)