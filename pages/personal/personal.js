import request from "../../utils/request";

let startY = 0;//手指的起始坐标
let moveY = 0;//手指移动坐标
let moveDistance = 0;//手指移动距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',
    coverTransition: '',
    userInfo: {},//用户信息
    recentPlayList: [],//用户播放记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    // console.log(userInfo)
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
      //获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },
  //获取用户的播放记录,功能函数
  async getUserRecentPlayList (userId) {
    let recentPlayListData = await request('/user/record', { uid: userId, type: 0 })
    // console.log(recentPlayListData)
    let recentPlayList = recentPlayListData.allData.splice(0, 10).map((item, index) => item = { ...item, id: index });
    this.setData({
      recentPlayList,
    })
  },
  handleTouchStart (event) {
    // console.log('start')
    startY = event.touches[0].clientY;
    this.setData({
      coverTransition: ''
    })
  },
  handleTouchMove (event) {
    // console.log('move')
    moveY = event.touches[0].clientY;
    moveDistance = moveY - startY;
    // console.log(moveDistance)
    if (moveDistance <= 0) {
      return
    }
    if (moveDistance >= 80) {
      moveDistance = 80
    }
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd () {
    this.setData({
      coverTransform: 'translateY(0)',
      coverTransition: 'transform 1s linear'
    })
    // console.log('end')
  },

  toLogin () {
    wx.navigateTo({
      url: '/pages/login/login'
    })
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