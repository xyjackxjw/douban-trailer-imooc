const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')

//查询某一条电影数据并删除
export const findAndRemove = async (id) => {
    const movie = await Movie.findOne({_id: id})
  
    if (movie) {
      await movie.remove()
    }
}

//可以根据电影类别或上映年份查询返回电影数据
export const getAllMovies = async (type, year) => {
    let query = {}

    if(type) {
        query.movieTypes = {
            $in: [type]
        }
    }

    if(year) {
        query.year = year
    }

    const movies = await Movie.find(query)

    return movies
}

// 根据id查询某一部电影
export const getMovieDetail = async (id) => {   

    const movie = await Movie.findOne({_id: id})

    return movie
}

//查询同类电影
export const getRelativeMovies = async (movie) => {   

    const movies = await Movie.find({
        movieTypes: {
            $in: movie.movieTypes
        }
    })

    return movies
}