const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { Mixed, ObjectId } = Schema.Types //Mixed 可以存放任何类型数据

const movieSchema = new Schema({
    doubanId: {
        unique: true,
        type: String
    },

    category: [{
        type: ObjectId,
        ref: 'Category'
    }],

    rate: Number,
    title: String,
    summary: String,
    video: String,
    poster: String,
    cover: String,

    rawTitle: String,
    movieTypes: [String],
    pubDate: Mixed,
    year: Number,

    videoKey: String,
    posterKey: String,
    coverKey: String,

    tags: [String],

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

//增加一个中间件,这里的this指本条数据，如果用箭头函数，会破坏上下文，指到上一层的全局中了
movieSchema.pre('save', function (next) {
    // 如果一条数据是新数据，则将创建和更新时间都设为当前
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now()
    } else {
        this.meta.updatedAt = Date.now()
    }

    next()
})

mongoose.model('Movie', movieSchema)