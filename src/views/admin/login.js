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

    this.state = {
      loading: false
    }
  }

  _toggleLoading = (status = false) => {
    this.setState({
      loading: status
    })
  }

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
    const { getFieldDecorator } = this.props.form

    return (
      <div>
        <Form onSubmit={this._handleSubmit} className='login-form'>
          <h3 style={{ textAlign: 'center' }}>黑骑预告片后台</h3>
          <FormItem>
            {
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
                <Input type='password' prefix={<Icon type='user' style={{ fontSize: 13 }} />} placeholder='Password' />
              )
            }
          </FormItem>
          <FormItem>
            <Button style={{width: '100%'}} htmlType='submit' loading={this.state.loading}>登录</Button>
          </FormItem>
        </Form>
      </div>
    )
  }
}