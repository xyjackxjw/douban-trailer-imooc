//引入动态加载
import AC from './components/async_load' 

// 定义路由的对象数组
export default [
    {
        name: '首页',
        icon: 'home',
        path: '/',
        component: AC(() => import('./views/home'))//加载进来的是一个组件,也就是一个类
    },
    {
        name: '详情页',
        path: '/detail/:id',
        component: AC(() => import('./views/movie/detail'))
    },
    {
        name: '后台入口',
        icon: 'admin',
        path: '/admin',
        component: AC(() => import('./views/admin/login'))
    }
]