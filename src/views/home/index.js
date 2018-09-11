import React, { Component } from 'react'
import Layout from '../../layouts/default'
import { request } from '../../lib'
import Content from './content'
import {
  Menu
} from 'antd'

export default class Home extends Component {
  constructor (props) {
    super(props)
    console.log('props是:', props)
    this.state = {
      years: ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'],
      type: this.props.match.params.type,
      year: this.props.match.params.year,
      movies: []
    }
  }

  //页面渲染时取得所有电影数据,也可根据年份或者类别进行筛选一下
  componentDidMount () {
    this._getAllMovies()
  }

  //将选择的年份赋给states
  _selectItem = ({ key }) => {
    this.setState({
      selectedKey: key
    })
  }

  
  _getAllMovies = () => {
    console.log('测试window.__LOADING__:', window.__LOADING__)

    request(window.__LOADING__)({
      method: 'get',
      url: `/api/v0/movies?type=${this.state.type || ''}&year=${this.state.year || ''}`
    }).then(res => {
      this.setState({ //获取到数据,更新页面状态
        movies: res
      })
    }).catch(() => {
      this.setState({
        movies: []
      })
    })
  }

  _renderContent = () => {
    console.log('首页渲染的states:', this.state)


    const { movies } = this.state

    if (!movies || !movies.length) return null

    return (
      <Content movies={movies} />
    )
  }

  render () {
    const { years, selectedKey } = this.state
    return (
      <Layout {...this.props}>
        <div className='flex-row full'>  
          {/* 边菜单 */}      
          <Menu   
            defaultSelectedKeys={[selectedKey]}
            mode='inline'
            style={{ height: '100%', overflowY: 'scroll', maxWidth: 230 }}
            onSelect={this._selectItem} //边菜单的选择项,这里是年份
            className='align-self-start'
          >
          {
            years.map((e, i) => (
              <Menu.Item key={i}>
                <a href={`/year/${e}`}>{e} 年上映</a>
              </Menu.Item>
            ))
          }
          </Menu>
          <div className='flex-1 scroll-y align-self-start'>
            {this._renderContent()}
          </div>
        </div>
      </Layout>
    )
  }
}