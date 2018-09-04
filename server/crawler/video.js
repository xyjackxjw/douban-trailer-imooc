// { doubanId: 4058933,
//     title: '一个明星的诞生',
//     rate: 8.5,
//     poster: 'https://img3.doubanio.com/view/photo/l_ration_poster/public/p2524354600.jpg' },

const base = 'https://movie.douban.com/subject/'
const doubanId = '4058933'
const videoBase = `https://movie.douban.com/trailer/231125/#content`
// http://vt1.doubanio.com/201808231003/68436461d37cf1256056b384b215eb1e/view/movie/M/402310125.mp4
const puppeteer = require('puppeteer')

//定义一个定时函数，等待一个time后再执行
const sleep = time => new Promise(resolve => {
    setTimeout(resolve, time)
})

;(async () => {
    console.log ('开始访问目标视频网页。。。')

    //定义一个模拟的chromium浏览器browser，在这上面进行操作
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        dumpio: false
    })

    //打开一个新的网页，载入目标网页
    const page = await browser.newPage()
    await page.goto(base + doubanId, {
        waitUntil: 'networkidle2'
    })

    //等待网页载入3秒钟
    await sleep(1000)

    //获取预告片内容放入对象中,页面中有已加载好的JQuery库，可以直接用jQuery
    const result = await page.evaluate(() => {
        var $ = window.$ //Jquery
        var it = $('.related-pic-video') //预告片视频

        if (it && it.length > 0){
            var link = it.attr('href')  //预告片的跳转地址
            var cover = it.css('background-image')  //预告片视频的封面图地址,现豆瓣网页有改变，和视频中不一样，需要从style中获取这个background-image的值

            //然后去掉不需要的字符
            // style="background-image:url(https://img3.doubanio.com/img/trailer/medium/2522393546.jpg?)"
            cover = cover.replace("url(", "")
            cover = cover.replace(/\?/, "")
            cover = cover.replace(/\)/, "")

            //将得到的结果封装成对象返回给result
            return {
                link,
                cover
            }
        }

        return {} //如果没有预告片内容，则返回一个空对象
    })

    //继续爬取视频
    let video

    if(result.link){
        await page.goto(result.link, {
            waitUntil:'networkidle2'
        })
        await sleep(2000)

        video = await page.evaluate(() => {
            var $ = window.$
            var it = $('source') //得到视频地址

            if (it && it.length > 0){
                return it.attr('src')
            }

            return ''
        })
    }

    //封装最后返回的数据
    const data = {
        video,
        doubanId,
        cover: result.cover
    }
    browser.close() //关闭这个模拟的browser
    console.log('cover是:', data.cover)

    //将这个结果发送出去
    process.send(data)
    process.exit(0)

})()


// <a class="related-pic-video" href="https://movie.douban.com/trailer/231125/#content" 
//      title="预告片" style="background-image:url(https://img3.doubanio.com/img/trailer/medium/2522393546.jpg?)">
//  </a>