// 第四步,将第三步获取到的海报,视频,和视频封面图三个东西上传到七牛,并将生成的地址链接保存到数据库中
const qiniu = require('qiniu')
const nanoid = require('nanoid')
const config = require('../config')// 七牛api的配置
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')

// 七牛api
const bucket = config.qiniu.bucket
const mac = new qiniu.auth.digest.Mac(config.qiniu.AK, config.qiniu.SK)
const cfg = new qiniu.conf.Config()
const client = new qiniu.rs.BucketManager(mac, cfg)

//拿到指定的url,将内容上传到七牛上
const uploadToQiniu = async (url, key) => {
  return new Promise((resolve, reject) => {
    client.fetch(url, bucket, key, (err, ret, info) => {
      if (err) {
        reject(err)
      } else {
        if (info.statusCode === 200) {
          resolve({ key })
        } else {
          reject(info)
        }
      }
    })
  })
}

;(async () => {
    // let movies = [
    //     { 
    //         video: 'http://vt1.doubanio.com/201809041039/d006607f7382538b0c35a49bf5c69b12/view/movie/M/402320087.mp4',
    //         doubanId: '4058933',
    //         poster: 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2524354600.webp',
    //         cover: 'https://img3.doubanio.com/img/trailer/medium/2524216073.jpg' 
    //     }
    // ]
  
    let movies = await Movie.find({
      $or: [
        { videoKey: { $exists: false } },
        { videoKey: null },
        { videoKey: '' }
      ]
    })
  
    // for (let i = 0; i < [movies[0]].length; i++) {
    for (let i = 0; i < movies.length; i++) {
      let movie = movies[i]
  
      // Nano ID是一个JavaScript的一个随机 ID 生成模块
      if (movie.video && !movie.videoKey) {
        try {
          console.log('开始传 video')
          let videoData = await uploadToQiniu(movie.video, nanoid() + '.mp4')
          console.log('开始传 cover')
          let coverData = await uploadToQiniu(movie.cover, nanoid() + '.png')
          console.log('开始传 poster')
          let posterData = await uploadToQiniu(movie.poster, nanoid() + '.png')
  
          // 七牛上传成功,会将nanoid生成的key返回出来,这个key也就是上传的地址内容
          if (videoData.key) {
            movie.videoKey = videoData.key
          }
          if (coverData.key) {
            movie.coverKey = coverData.key
          }
          if (posterData.key) {
            movie.posterKey = posterData.key
          }
  
          console.log(movie)
  
          await movie.save() //存入数据库
        } catch (err) {
          console.log(err)
        }
      }
    } 
})()
  
//在tasks/movie.js中爬取到电影列表信息(里面含有poster),取得某个电影的doubanId,再由doubanId在trailer中爬取video和cover,组成下面的数组
// let movies = [
//     { 
//         video: 'http://vt1.doubanio.com/201809041039/d006607f7382538b0c35a49bf5c69b12/view/movie/M/402320087.mp4',
//         doubanId: '4058933',
//         poster: 'https://img3.doubanio.com/view/photo/l_ration_poster/public/p2524354600.jpg',
//         cover: '"https://img3.doubanio.com/img/trailer/medium/2524216073.jpg"' 
//     }
// ]

//将单个电影的video,cover,poster上传到七牛上面,得到下面的三个key,也就是视频和图片的外链地址
// { video: 'http://vt1.doubanio.com/201809041039/d006607f7382538b0c35a49bf5c69b12/view/movie/M/402320087.mp4',
//   doubanId: '4058933',
//   poster: 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2524354600.webp',
//   cover: 'https://img3.doubanio.com/img/trailer/medium/2524216073.jpg',
//   videoKey: 'http://peie35zt9.bkt.clouddn.com/2f71VdCTLD7S42ey1Bryx.mp4',
//   coverKey: 'http://peie35zt9.bkt.clouddn.com/tZ5Jk9QWVLSj__vV94FAj.png',
//   posterKey: 'http://peie35zt9.bkt.clouddn.com/DO2VnIgA5Bd0Yywz~wnru.png' }
  