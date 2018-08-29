import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter} from 'react-router-dom'

import App from '/app'  //路由的控制由app.js文件来完成

const rootElement = document.getElementById('app')


render(
  <BrowserRouter>
    <App/>
  </BrowserRouter>, rootElement)