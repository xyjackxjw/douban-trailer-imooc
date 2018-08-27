class Boy{
    @speak
    run () {
        console.log('i can run!')
    }
}

function speak (target, key, descriptor) {
    //speak是修饰这个类的，可以对boy类的功能进行扩展
    //target就是指这个类 Boy {}
    //key指speak修饰的类中的方法，这里就是run方法 
    //descriptor指针对这个类的对象的具体描述，如是否可配置，是否可写等
    /**运行结果
     * Boy {}
        run
        { value: [Function: run],
          writable: true,
          enumerable: false,
          configurable: true }
     */
    console.log(target)
    console.log(key)
    console.log(descriptor) 

    return descriptor
}

const luke = new Boy() //创建boy类的实例时就会执行这个speak

luke.run()

