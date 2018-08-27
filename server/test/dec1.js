class Boy{
    @speak('中文')
    run () {
        console.log('i can run!')
        console.log('i can speak:' + this.language)
    }
}

function speak (language) {
    return function (target, key, descriptor) {
        //将装饰器的参数传入这个类
        target.language = language
    
        // return descriptor
    }
}


const luke = new Boy() //创建boy类的实例时就会执行这个speak

luke.run()

