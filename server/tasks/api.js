// http: //api.douban.com/v2/movie/subject/1764796

//http的request获取数据
const rp = require('request-promise-native')

const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')


//定义一个通过doubanId获取豆瓣API的数据的函数
async function fetchMovie(item) {
    // const url = `http://api.douban.com/v2/movie/subject/${item.doubanId}`

    const url = `http://api.douban.com/v2/movie/${item.doubanId}`

    const res = await rp(url)

    console.log( typeof res ) //显示res的数据类型，需转换一下

    let body

    try {
        body = JSON.parse(res)

        console.log('body得到结果：', body)
    } catch (error) {
        console.log(error)
    }

    return body
}

//立即执行函数，先通过movies.js中获取的数据，粘贴两条doubanId过来，然后获取API中的全部这两条电影数据
;(async () => {
    //测试数据
    // let movies = [{
    //         doubanId: 30223604,
    //         title: '致亲爱的法官大人',
    //         rate: 7,
    //         poster: 'https://img3.doubanio.com/view/photo/l_ration_poster/public/p2528264333.jpg'
    //     },
    //     {
    //         doubanId: 30232234,
    //         title: '魔女的爱情',
    //         rate: 6.9,
    //         poster: 'https://img3.doubanio.com/view/photo/l_ration_poster/public/p2528449352.jpg'
    //     },
    // ]

    //从数据库中查询，补充不完整的数据
    let movies = await Movie.find({
        //如果存在以下情况
        $or: [{
                summary: {
                    $exists: false
                }
            }, //summary不存在
            {
                summary: ''
            }, //summary为空
            {
                summary: null
            }, // 
            {
                title: ''
            }, //title为空
            {
                year: {
                    $exists: false
                }
            }, //年份为空
        ]
    })

    //减少api的访问次数，先改为只取一条
    // for (let i = 0; i < [movies[0]].length; i++) {
    for (let i = 0; i < movies.length; i++) {
        let movie = movies[i]
        let movieData = await fetchMovie(movie)

        if (movieData) {
            let tags = movieData.tags || [] //或者缺省值

            movie.tags = movie.tags || []
            movie.summary = movieData.summary || ''
            movie.title = movieData.alt_title || movieData.title || ''
            movie.rawTitle = movieData.title || ''

            if (movieData.attrs) {
                movie.movieTypes = movieData.attrs.movie_type || []
                movie.year = movieData.attrs.year[0] || 2500

                for (let i = 0; i < movie.movieTypes.length; i++) {
                    let item = movie.movieTypes[i]
                    let cat = await Category.findOne({
                        name: item
                    })

                    if (!cat) {
                        cat = new Category({
                            name: item,
                            movies: [movie._id]
                        })
                    } else {
                        if (cat.movies.indexOf(movie._id) === -1) {
                            cat.movies.push(movie._id)
                        }
                    }

                    await cat.save()

                    if (!movie.category) {
                        movie.category.push(cat._id)
                    } else {
                        if (movie.category.indexOf(cat._id) === -1) {
                            movie.category.push(cat._id)
                        }
                    }
                }


                let dates = movieData.attrs.pubdate || []
                let pubdates = []

                dates.map(item => {
                    if (item && item.split('(').length > 0) {
                        let parts = item.split('(')
                        let date = parts[0]

                        if (parts[1]) {
                            country = parts[1].split(')')[0]
                        }

                        pubdates.push({
                            date: new Date(date),
                            country
                        })
                    }
                })

                movie.pubdate = pubdates
            }

            tags.forEach(tag => {
                movie.tags.push(tag.name)
            })

            await movie.save()
        }

    }

    // movies.map(async movie => {
    //     let movieData = await fetchMovie(movie)

    //     try {
    //         movieData = JSON.parse(movieData)

    //         console.log(movieData.tags)
    //         console.log(movieData.summary)
    //         console.log(movieData)
    //     } catch (err) {
    //         console.log(err)
    //     }
    //     // console.log(movieData)
    // })
})()
