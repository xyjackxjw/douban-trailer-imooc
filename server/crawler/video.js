const puppeteer = require('puppeteer')

const base = `https://movie.douban.com/subject/`

const sleep = time => new Promise(resolve => {
  setTimeout(resolve, time)
})

process.on('message', async movies => {
  console.log('开始访问目标视频网页。。。')

  //定义一个模拟的chromium浏览器browser，在这上面进行操作
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    dumpio: false
  })

  //打开一个新的网页，载入目标网页
  const page = await browser.newPage()

  for (let i = 0; i < movies.length; i++) {
    let doubanId = movies[i].doubanId

    await page.goto(base + doubanId, {
      waitUntil: 'networkidle2'
    })

    await sleep(1000)

    const result = await page.evaluate(() => {
        var $ = window.$
        var it = $('.related-pic-video')

        if (it && it.length > 0){
          var link = it.attr('href')  //预告片的跳转地址
          var cover = it.css('background-image')  //预告片视频的封面图地址,现豆瓣网页有改变，和视频中不一样，需要从style中获取这个background-image的值

          //然后去掉不需要的字符 
          // style="background-image:url(https://img3.doubanio.com/img/trailer/medium/2522393546.jpg?)"

          //    \"https://img3.doubanio.com/img/trailer/medium/2524216073.jpg\"
          //     https://img3.doubanio.com/img/trailer/medium/2533207242.jpg1536055077\"
          cover = cover.replace("url(", "")
          cover = cover.replace(/\?/, "")
          cover = cover.replace(/\)/, "")
          cover = cover.replace(/\"/, "")
          let cover_parts = cover.split('.jpg')
          cover = cover_parts[0] + '.jpg'
          
          // console.log('cover地址是:', cover)

          //将得到的结果封装成对象返回给result
          return {
              link,
              cover
          }
      }

      return {}
    })

    let video

    if (result.link) {
      await page.goto(result.link, {
        waitUntil: 'networkidle2'
      })
      await sleep(1000)

      video = await page.evaluate(() => {
        var $ = window.$
        var it = $('source')

        if (it && it.length > 0) {
          return it.attr('src')
        }

        return ''
      })
    }

    // 最后将所有数据封装成对象,发送到主进程
    const data = {
      video,
      doubanId,
      cover: result.cover
    }

    process.send(data)
  }

  browser.close()
  process.exit(0)
})
