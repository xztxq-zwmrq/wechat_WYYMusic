//发送ajax请求
/*
  1.封装功能函数
    1.功能点明确
    2.函数内部应该保留固定代码（静态）
    3.将动态的数据抽取为形参
    4.一个良好的功能函数应该设置形参的默认值（es6的形参默认值）

  2.功能组件的封装
    1.功能点明确
    2.组件中保留静态的代码
    3.将动态的数据抽取成props参数，有使用者根据自身的情况以标签属性的形式动态的传入props数据
    4.一个设置组件的必要性及数据类型
    prop:{
      msg:{
        required:true,
        default:默认值,
        type:String
      }
    }
*/
import config from './config'
export default (url, data = {}, method = "GET") => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        // cookie: wx.getStorageSync('cookies')[1]
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
      },
      success: (res) => {
        // console.log('请求成功')
        // console.log(res)
        if (data.isLogin) {
          // 将用户的cookie存入本地
          wx.setStorage({
            key: 'cookies',
            data: res.cookies
          })
        }
        resolve(res.data)
      },
      fail: (err) => {
        // console.log('请求失败')
        reject(err)
      }
    })
  })
}