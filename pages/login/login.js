// pages/login/login.js
/**
 * 登录流程
 *    1.收集表单项数据
 *    2.前端认证
 *      1）验证用户信息（账号密码）的合理性
 *      2）前端认证不通过就提示用户，不需要发请求
 *      3）前端认证通过，发起请求（携带账号密码）给服务器
 *    3.后端认证
 *      1）认证用户是否存在
 *      2）用户不存在直接返回，告诉前端用户不存在
 *      3）用户存在需要认证密码是否正确
 *      4）密码不正确返回给前端，提示密码错误
 *      5）密码正确返回给前端数据，提示用户登录成功（会携带用户的相关信息）
 */
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '',//手机号
    password: '',//密码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //表单项内容发生改变的回调
  handleInput (event) {
    // console.log(event)
    // let type = event.currentTarget.id//使用id传值；取值：phone || password

    let type = event.currentTarget.dataset.type;//使用data-type形式传值
    // console.log(type, event.detail.value)
    this.setData({
      [type]: event.detail.value
    })
  },

  //登录的回调
  async login () {
    let { phone, password } = this.data;
    if (!phone) {
      //输入为空
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return
    }
    //定义一个正则表达式
    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none'
      })
      return
    }
    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return
    }
    // wx.showToast({
    //   title: '认证通过',
    // })
    //
    let result = await request('/login/cellphone', { phone, password, isLogin: true });
    if (result.code === 200) {
      wx.showToast({
        title: '登录成功'
      })
      //将用户的信息存储到本地
      wx.setStorageSync("userInfo", JSON.stringify(result.profile))
      //跳转至个人中心界面，
      // wx.switchTab({
      //   url: '/pages/personal/personal'
      // })
      //使用reLaunch保证页面重新加载 
      wx.reLaunch({
        url: '/pages/personal/personal'
      })
    }
    else if (result.code === 400) {
      wx.showToast({
        title: '手机号错误',
        icon: 'none'
      })
    }
    else if (result.code === 502) {
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      })
    }
    else if (result.code === 501) {
      wx.showToast({
        title: '账号不存在',
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: '登录错误（未知错误），请重新登录',
        icon: 'none'
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})