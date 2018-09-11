import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  Form,
  Icon,
  Input,
  Button
} from 'antd'
import { request } from '../../lib'
import './login.sass'

const FormItem = Form.Item

@Form.create()  //方便获取表单域的字段
export default class Login extends Component {
  constructor (props) {
    super(props)
    // console.log('开始调到登录页的props', this.props)
    this.state = {
      loading: false
    }
  }

  _toggleLoading = (status = false) => {
    this.setState({
      loading: status
    })
  }

  // 处理登录请求,post到后端,返回成功跳到管理的list页面
  _handleSubmit = (e) => {
    e.preventDefault()

    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        request(this._toggleLoading)({
          method: 'post',
          url: '/admin/login',
          data: {
            ...values
          }
        }).then(res => {
          this.props.history.replace('/admin/list')
        })
      }
    })
  }

  render () {
    const { getFieldDecorator } = this.props.form  //antd对于表单的验证装饰器方式

    return (
      <div>
        <Form onSubmit={this._handleSubmit} className='login-form'>
          <h3 style={{ textAlign: 'center' }}>黑骑预告片后台</h3>
          <FormItem>
            { //注意这里()()的写法
              getFieldDecorator('email', {
                rules: [{
                  required: true,
                  message: '请填入邮箱'
                }]
              })(
                <Input prefix={<Icon type='user' style={{ fontSize: 13 }} />} placeholder='Email' />
              )
            }
          </FormItem>
          <FormItem>
            {
              getFieldDecorator('password', {
                rules: [{
                  required: true,
                  message: '请填入密码'
                }]
              })(
                <Input type='password' prefix={<Icon type='question' style={{ fontSize: 13 }} />} placeholder='Password' />
              )
            }
          </FormItem>
          <FormItem>
            <Button  style={{width: '100%'}} htmlType='submit' loading={this.state.loading}>登录</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}