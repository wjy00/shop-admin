import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import Users from '@/components/users/Users'
import Rights from '@/components/power/Rights'
import Roles from '@/components/power/Roles'
import Cate from '@/components/goods/Cate'


Vue.use(VueRouter)

const routes = [{
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    // 子路由
    children: [{
      path: '/welcome',
      component: Welcome
    }, {
      path: '/users',
      component: Users
    }, {
      path: '/rights',
      component: Rights
    }, {
      path: '/roles',
      component: Roles
    }, {
      path: '/categories',
      component: Cate
    }]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作 next('/login')强制跳转login
router.beforeEach((to, from, next) => {
  // 若访问登录页，放行 next()
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 若没有token, 强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})


export default router