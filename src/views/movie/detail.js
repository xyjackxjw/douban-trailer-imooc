import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  Tabs,
  Badge
} from 'antd'
import { request } from '../../lib'
import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')

const TabPane = Tabs.TabPane
const DPlayer = window.DPlayer
const site = 'http://peie35zt9.bkt.clouddn.com/'

// tab切换时的回调,得到key后可以加一些操作
const callback = (key) => {
  console.log('callback的key是:', key)
}

export default class Detail extends Component {
  constructor (props) {
    super(props)
    // console.log('传到详情页的props是:', props)
    this.state = {
      movie: null,
      relativeMovies: [],
      _id: this.props.match.params.id  //将父页面传过来的id给state的id,后面根据这个id来获取详情的电影数据
    }
  }

  componentDidMount () {
    this._getMovieDetail()
  }

  _getMovieDetail = () => {
    request({
      method: 'get',
      url: `/api/v0/movies/${this.state._id}`
    }).then(res => {
      const movie = res.movie
      const relativeMovies = res.relativeMovies
      const video = site + movie.videoKey
      const pic = site + movie.coverKey

      this.setState({
        movie,
        relativeMovies
      }, () => {   //页面状态更新成功后,用这个回调函数创建播放器的实例,
        this.player = new DPlayer({
          container: document.getElementById('videoPlayer'),
          screenshot: true,
          video: {
            url: video,
            pic: pic,
            thumbnails: pic
          }
        })
      })
    }).catch(() => {
      this.setState({
        movie: {}
      })

      this.props.history.goBack()
    })
  }

  render () {
    const { movie, relativeMovies } = this.state

    if (!movie) return null

    return (
      <div className='flex-row full'>
        <div className='page-shade'> 
          {/* 详情页,有两个tab,关于本片,同类电影          */}
          <div className='video-sidebar'>
            <Link className='homeLink' to={'/'}>回到首页</Link>
            <Tabs defaultActiveKey='1' onChange={callback}>
              <TabPane tab='关于本片' key='1'>
                <h1>{movie.title}</h1>
                <dl>
                  <dt>豆瓣评分：<Badge count={movie.rate} style={{ backgroundColor: '#52c41a' }} /> 分</dt>
                  <dt>电影分类：{movie.tags && movie.tags.join(' ')}</dt>
                  <dt>更新时间：{moment(movie.meta.createdAt).fromNow()}</dt>
                  <dt>影片介绍：</dt>
                  <dd>{movie.summary}</dd>
                </dl>
              </TabPane>
              <TabPane tab='同类电影' key='2'>
                {
                  relativeMovies.map(item => (
                    <Link key={item._id} className='media' to={`/detail/${item._id}`}>
                      <img width='60' className='align-self-center mr-3' src={site + item.posterKey} />
                      <div class='media-body'>
                        <h6 className='media-title'>{item.title}</h6>
                        <ul className='list-unstyled'>
                          {
                            item.pubdate && item.pubdate.map((it, i) => (
                              <li key={i}>{moment(it.date).format('YYYY.MM')} {it.country}</li>
                            ))
                          }
                        </ul>
                      </div>
                    </Link>
                  ))
                }
              </TabPane>
            </Tabs>
          </div>
          
          {/* 详情页电影的预告片播放 */}
          <div className='video-wrapper'>
            <div id='videoPlayer' data-src={site + movie.coverKey} data-video={site + movie.videoKey} />
          </div>                
        </div>
      </div>
    )
  }
}


/**传到详情页的props是: 
 * 
location :
  hash:""
  key:"m6k9s9"
  pathname:"/detail/5b93709f159a8b135303ed8b"
  search:""
  state:undefined

match:
  isExact:true
  params: {
      id: "5b93709f159a8b135303ed8b"
    }
  path:"/detail/:id"
  url:"/detail/5b93709f159a8b135303ed8b"
 */