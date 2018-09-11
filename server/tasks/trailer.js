//第三步,进入到每一个预告片的视频页面,爬取详情页的视频地址和缩略图,放入数据库
const  cp = require('child_process')
const { resolve } = require('path')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')

;(async () => {
    let movies = await Movie.find({
        $or: [
          { video: { $exists: false }},
          { video: null }
        ]
      })

    const script = resolve(__dirname, '../crawler/video') //子进程的脚本
    const child = cp.fork(script, []) //创建这个子进程
    let invoked = false   //子进程的标识符

    //错误的处理
    child.on('error', err => {
        if(invoked) return

        invoked = true

        console.log(err)
    })

    //子进程退出返回码
    child.on('exit', code => {
        if(invoked) return

        invoked = true
        let err = code === 0 ? null : new Error('exit code:' + code)

        console.log(err)
    })

    //监听message消息，得到data，也即子进程返回的结果
    child.on('message', async data => {
        let doubanId = data.doubanId
        let movie = await Movie.findOne({
          doubanId: doubanId
        })
    
        if (data.video) {
          movie.video = data.video
          movie.cover = data.cover
    
          await movie.save()
        } else {
          await movie.remove()
    
          let movieTypes = movie.movieTypes
    
          for (let i = 0; i < movieTypes.length; i++) {
            let type = movieTypes[i]
            let cat = Category.findOne({
              name: type
            })
    
            if (cat && cat.movies) {
              let idx = cat.movies.indexOf(movie._id)
    
              if (idx > -1) {
                cat.movies = cat.movies.splice(idx, 1)
              }
    
              await cat.save()
            }
          }
        }
      })
  // 这里的第三步是需要将查找到的满足条件的movies,先发送给子进程,
  // 而第一步没有传数据给子进程
  child.send(movies)
})()