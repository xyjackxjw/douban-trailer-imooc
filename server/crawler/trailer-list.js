const url = 'https://movie.douban.com/tag/#/?sort=R&range=6,10&tags='

const puppeteer = require('puppeteer')

//定义一个定时函数，等待一个time
const sleep = time => new Promise(resolve => {
    setTimeout(resolve, time)
})

//一个自动执行的异步函数，来自动获取豆瓣电影上的相关信息
//这里的内容是豆瓣主页，电影分类的页面
const temp = (async () => {
    console.log ('开始访问目标网页。。。')

    //定义一个模拟的chromium浏览器browser，在这上面进行操作
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        dumpio: false
    })

    //打开一个新的网页，载入目标网页
    const page = await browser.newPage()
    await page.goto(url, {
        waitUntil: 'networkidle2'
    })

    //等待网页载入3秒钟
    await sleep(3000)

    //这是个分页的，有个选择更多，F12查看源网页内容，这是一个a标签，其id是.more
    await page.waitForSelector('.more')

    //爬取两页的内容
    for (let i = 0; i<1; i++) {
        await sleep(3000)
        await page.click('.more')
    }

    //获取网页内容放入数组对象中,页面中有已加载好的JQuery库，所有可以直接用jQuery
    const result = await page.evaluate(() => {
        var $ = window.$ //Jquery
        var items = $('.list-wp a')  //得到所有这一页的详情内容，每个详情都由一个a标签包裹着
        var links = []

        console.log(items)

        if(items.length >= 1){
            items.each((index, item) => {
                let it = $(item)
                let doubanId = it.find('div').data('id')
                let title = it.find('.title').text()
                let rate = Number(it.find('.rate').text())
                let poster = it.find('img').attr('src').replace('s_ratio', 'l_ration')

                links.push({
                    doubanId,
                    title,
                    rate,
                    poster
                })
            })
        }

        return links
    })

    browser.close()
    console.log(result)
})

temp()