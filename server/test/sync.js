

const doSync = (sth, time) => new Promise( resolve =>{
    setTimeout(() => {
        console.log(sth + '用了' + time + '毫秒')
        resolve()
    }, time);
})

const doAsync = (sth, time, cb) => {
    setTimeout(() => {
        console.log(sth + '用了' + time + '毫秒')
        cb && cb() // 如果有回调函数，就执行
    }, time);
}
const doElse = (sth) => {
    console.log(sth)
}

const Scott = { doSync, doAsync }
const Meizi = { doSync, doAsync, doElse }


;(async () => {
    //模拟同步的过程，有阻塞
    console.log('case 1: 妹纸来到门口')
    await Scott.doSync('Scott 刷牙', 1000)
    console.log('啥也没干，一直等')
    await Meizi.doSync('妹纸洗澡', 2000)
    Meizi.doElse('妹纸忙别的去了')

    //模拟异步的过程，没有阻塞，妹纸等待时间去忙别的了，Scott刷完牙，回调函数通知妹纸来洗澡
    //然后妹纸洗完澡，调用的doAsync没有回调。
    console.log('case 3: 妹纸来到门口按下通知开关')//相当于注册回调函数
    Scott.doAsync('Scott 刷牙', 1000, () => {
        console.log('卫生间通知妹纸来洗澡')
        Meizi.doAsync('妹纸洗澡', 2000)
    })
    Meizi.doElse('妹纸忙别的去了')
})()

/**执行结果：
case 1: 妹纸来到门口
Scott 刷牙用了1000毫秒
啥也没干，一直等
妹纸洗澡用了2000毫秒
妹纸忙别的去了
case 3: 妹纸来到门口按下通知开关
妹纸忙别的去了
Scott 刷牙用了1000毫秒
卫生间通知妹纸来洗澡
妹纸洗澡用了2000毫秒
 */
