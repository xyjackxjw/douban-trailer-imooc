//电影分类的schema

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId  = Schema.Types.ObjectId //

const categorySchema = new Schema({
    name: {
        type: String,
        unique: true
    },

    movies : [{
        type: ObjectId,
        ref: 'Movie'
    }],

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

//增加一个中间件
categorySchema.pre('save', function (next) {
    // 如果一条数据是新数据，则将创建和更新时间都设为当前
    if(this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now()
    }else {
        this.meta.updatedAt = Date.now()
    }

    next()
})

mongoose.model('Category', categorySchema)