import axios from 'axios'
// import { Message, MessageBox } from 'element-ui'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/assets/js/auth'

let qs = require('qs')

// 创建axios实例
const service = axios.create({
  // baseURL: process.env.publicPath, // api 的 base_url
  baseURL: process.env.NODE_ENV === 'production' ? '/v1' : '/api/v1', // 开发使用代理,注意后台有没有基础路径(注意：api是给代理替换，v1是后台的基础路径)
  timeout: 5000, // 请求超时时间
  headers: {}
})

// request拦截器
service.interceptors.request.use(
  config => {
    if(store.getters.token){
      // config.headers['X-Token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
      config.headers.Authorization = `Bearer ${getToken()}`
    }
    if(
      config.method === 'post' ||
      config.method === 'put' ||
      config.method === 'delete' ||
      config.method === 'patch'
    ){
      // 注意上传文件不能用qs
      config.data = config.headers['Content-Type'] === 'multipart/form-data' ? config.data : qs.stringify(config.data)
    }
    // debugger
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Message({ message: error.message, type: 'error', duration: 3 * 1000 })
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    /**
     * code为非200是抛错 可结合自己业务进行修改
     */
    const res = response.data
    console.log(res)
    if (res.code !== 200) {
      // 处理自定义异常,400,401,token不合法等
      if (res.code === 401){
        store.dispatch('FedLogOut').then(() => {
          // location.reload() // 为了重新实例化vue-router对象 避免bug
        })
      }
      Message({ message: res.msg, type: 'error', duration: 3 * 1000 })
      // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
      // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // MessageBox.confirm(
        //   '你已被登出，可以取消继续留在该页面，或者重新登录',
        //   '确定登出',
        //   {
        //     confirmButtonText: '重新登录',
        //     cancelButtonText: '取消',
        //     type: 'warning'
        //   }
        // ).then(() => {
        //   // 前端登出
        //   store.dispatch('FedLogOut').then(() => {
        //     location.reload() // 为了重新实例化vue-router对象 避免bug
        //   })
        // })
      // }
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject(res)
    } else {
      return response.data
    }
  },
  error => {
    // 处理服务器抛出的异常,未知的异常
    console.log('err' + error) // for debug
    Message({ message: error, type: 'error', duration: 3 * 1000 })
    return Promise.reject(error)
  }
)

export default service
