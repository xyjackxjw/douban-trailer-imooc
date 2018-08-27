
// const mongoose = require('mongoose')

const { controller, get, post, put, del} = require('../lib/decorator')
const { checkPassword
      } = require('../service/user')

//装饰器声明一个控制器
@controller('/api/v0/user')
export class userController {
    @post('/') //密码验证
    async login (ctx, next) {
        const { email, password } = ctx.request.body
        const matchData = await checkPassword(email, password)

        if(!matchData.user) {
            return (ctx.body = {
                success: false,
                err:'用户不存在'
            })
        }

        if (matchData.match) {
            return (ctx.body = {
                sucess: true 
            })

        }

        return (ctx.body = {
            success: false,
            err:'密码不正确'
        })
        
    }
}
    
