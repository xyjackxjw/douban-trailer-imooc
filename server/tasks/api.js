// http: //api.douban.com/v2/movie/subject/1764796
const rp = require('request-promise-native')  //http的request获取数据
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

        // console.log('获取每一条API得到body结果：', body)
    } catch (error) {
        console.log(error)
    }

    return body
}

//立即执行函数，获取API中的全部电影数据
;(async () => {
    //从数据库中查询，补充不完整的数据
    let movies = await Movie.find({
        //如果存在以下情况
        $or: [
            { summary: { $exists: false } }, //summary不存在
            { summary: ''}, //summary为空
            { summary: null }, // 
            { title: '' }, //title为空
            { year: { $exists: false } }, //年份为空
            { pubdate: { $exists: false } }
        ]
    })

    console.log('数据库中共有爬到的数据总数', movies.length)
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

                // 处理上映时间和国家
                let dates = movieData.attrs.pubdate || []
                let pubdates = []

                dates.map(item => {
                    if (item && item.split('(').length > 0) {
                        let parts = item.split('(')
                        let date = parts[0]
                        let country = '未知'

                        if (parts[1]) {
                            country = parts[1].split(')')[0]
                        }
                        console.log('上映时间:', date)
                        console.log('国家:', country)
                        pubdates.push({
                            date: new Date(date),
                            country
                        })
                    }
                })

                console.log('上映时间:', pubdates)
                movie.pubDate = pubdates
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


/**
 * 根据doubanId获取每一条API得到body结果： 
{ rating: { max: 10, average: '8.7', numRaters: 399, min: 0 },
  author: [ { name: '布莱德利·库珀 Bradley Cooper' } ],
  alt_title: '一个明星的诞生 / 一个巨星的诞生(台)',
  image: 'http://img7.doubanio.com/view/photo/s_ratio_poster/public/p2524354600.jpg',
  title: 'A Star Is Born',
  summary: '好莱坞浪漫巨制《一个明星的诞生》深情来袭。影片讲述了一个渐趋过气的男明星帮助一个有着明星梦的女孩实现梦想的故事，璀璨经典风靡世界，曾三次被搬上大银幕，各个版本更先后获得奥斯卡金像奖最佳男女主角提名、最佳原创音乐等多项殊荣。今年，这一经典爱情IP再度起航，“火箭浣熊”布莱德利•库珀身兼导演、编剧、制片人、主演等数职，联袂流行音乐天后Lady Gaga主演并实力包办数首动听歌曲，才子佳人强强联合，一场悲喜交加的音乐爱情故事即将拉开帷幕。',
  attrs:
   { language: [ '英语' ],
     pubdate: [ '2018-08-31(威尼斯电影节)', '2018-10-05(美国)' ],
     title: [ 'A Star Is Born' ],
     country: [ '美国' ],
     writer:
      [ '布莱德利·库珀 Bradley Cooper',
        '威尔·法特斯 Will Fetters',
        '艾琳·梅琪 Irene Mecchi',
        '史蒂芬·里维尔 Stephen J. Rivele',
        'Christopher Wilkinson' ],
     director: [ '布莱德利·库珀 Bradley Cooper' ],
     cast:
      [ '布莱德利·库珀 Bradley Cooper',
        'Lady Gaga',
        '大卫·查普尔 Dave Chappelle',
        '山姆·艾里奥特 Sam Elliott',
        '安德鲁·戴斯·克雷 Andrew Dice Clay',
        '迈克尔·哈尔尼 Michael Harney',
        '拉菲·格拉沃恩 Rafi Gavron',
        '迈克尔·D·罗伯茨 Michael D. Roberts' ],
     movie_duration: [ '135分钟' ],
     year: [ '2018' ],
     movie_type: [ '剧情', '爱情', '音乐' ] },
  id: 'http://api.douban.com/movie/4058933',
  mobile_link: 'http://m.douban.com/movie/subject/4058933/',
  alt: 'https://movie.douban.com/movie/4058933',
  tags:
   [ { count: 690, name: 'LadyGaga' },
     { count: 382, name: '音乐' },
     { count: 318, name: '美国' },
     { count: 252, name: '美国电影' },
     { count: 250, name: '2018' },
     { count: 239, name: 'BradleyCooper' },
     { count: 229, name: '电影' },
     { count: 179, name: '歌舞' } ] }
 */