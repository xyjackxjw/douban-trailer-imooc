// import { log } from 'util';

// const Router = require('koa-router')
// const mongoose = require('mongoose')
// const router = new Router()
const { controller, get, post, put, del} = require('../lib/decorator')
const { getAllMovies,
        getMovieDetail,
        getRelativeMovies
      } = require('../service/movie')

//装饰器声明一个控制器
@controller('/api/v0/movies')
export class movieController {
    @get('/') //查询所有电影
    async getMovies (ctx, next) {
        //
        // const Movie = mongoose.model('Movie')

        //业务逻辑代码，这里是查询功能，移到service层进行处理，control则只负责路由
        // const movies = await Movie.find({}).sort({
        //     'meta.createdAt': -1
        // })

        const { type, year } = ctx.query
        const movies = await getAllMovies(type, year)
    
        ctx.body = {
            movies
        } 
    }

    @get('/:id') //查询单个电影，以及相关电影
    async getMovieDetail (ctx, next) {
        // const Movie = mongoose.model('Movie')

        // const id = ctx.params.id
        // const movie = await Movie.findOne({_id: id})

        const id = ctx.params.id
        const movie = await getMovieDetail(id)
        const relativeMovies = await getRelativeMovies(movie)
        
        ctx.body = {
            data: {
                movie,
                relativeMovies
            },
            success: true
        } 
    }

}
    

 
// router.get('/movies', async (ctx, next) => {
//     //查出数据库中所有的movies，并按创建时间降序排好
//     const Movie = mongoose.model('Movie')
//     const movies = await Movie.find({}).sort({
//         'meta.createdAt': -1
//     })

//     ctx.body = {
//         movies
//     }
// })

// router.get('/movies/:id', async (ctx, next) => {
//     //根据id查出数据库中的movie
//     const Movie = mongoose.model('Movie')
//     const id = ctx.params.id
//     const movie = await Movie.findOne({_id: id})

//     ctx.body = {
//         movie
//     }
// })

// module.exports = router