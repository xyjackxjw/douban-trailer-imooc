// 第一步,先爬取电影分类页面的数据,得到一个含有dobanId的list出来,也含有其它的一些页面中的信息,放入数据库
const  cp = require('child_process')
const { resolve } = require('path')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')

;(async () => {
    const script = resolve(__dirname, '../crawler/trailer-list') //子进程的脚本
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

        // console.log('invoked是:',invoked) //子进程退出时invoked是false
        // console.log('code是:',code) //子进程退出时code是0
        console.log('获取trailer的子进程正常退出了')

        invoked = true
        let err = code === 0 ? null : new Error('exit code:' + code)

        console.log(err)
    })

    //监听message消息，得到data，也即子进程返回的结果,返回的data是一个包装好的对象
    child.on('message', data => {
        let result = data.result

        console.log('获取trailer的子进程得到的结果:', result)

        //先判断数据库中有没有这条数据,没有的话,把每一条数据都存入数据库
        result.forEach(async item => {
            let movie = await Movie.findOne({
                doubanId: item.doubanId
            })

            if(!movie) {
                movie = new Movie(item)
                await movie.save()
            }
        })
    })
})()