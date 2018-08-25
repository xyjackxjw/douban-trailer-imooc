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

        invoked = true
        let err = code === 0 ? null : new Error('exit code:' + code)

        console.log(err)
    })

    //监听message消息，得到data，也即子进程返回的结果
    child.on('message', data => {
        let result = data.result

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