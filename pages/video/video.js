import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],//导航标签数据
    // navId: 58100,
    navId: '',//导航标识
    videoList: [],//视频列表数据
    videoId: '',//视频id标识
    videoUpdateTime: [],//记录video播放的时长
    isTriggered: false,//标识下拉刷新是否被触发
    playVideoDuration: 0,//记录视频跳转到几秒开始播放
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取导航数据
    this.getVideoGroupListData()
    //获取视频列表数据
    // console.log(this.data.navId)//结果为空串，因为异步
    // this.getVedioList(this.data.navId)
  },
  //获取导航数据
  async getVideoGroupListData () {
    let videoGroupListData = await request('/video/group/list')
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id
    })
    //获取视频列表数据
    // console.log(this.data.navId)//结果为空串，因为异步
    this.getVedioList(this.data.navId)
  },
  //获取视频列表数据
  async getVedioList (navId) {
    //判断navId为空串的情况
    if (!navId) {
      return
    }
    // let videoListData = await request('/video/group', { id: navId }).datas  //这样写会报错
    let videoListData = await request('/video/group', { id: navId })
    // console.log(videoListData)
    //关闭消息提示框
    wx.hideLoading()

    let videoList = videoListData.datas.map((item, index) => { return { ...item, id: index } })
    this.setData({
      videoList,
      //关闭下拉刷新
      isTriggered: false
    })
  },
  // 点击切换导航的回调
  changeNav (event) {
    //通过id向event传参的时候如果传的是number会自动转换为string
    // let navId = event.currentTarget.id;
    // console.log(typeof navId)
    //这里的navId自动转换为了string
    let navId = event.currentTarget.dataset.id;
    // console.log(event)
    this.setData({
      // navId: parseInt(navId)
      // navId: navId * 1
      // navId:navId>>>0转换为数字（右移或左移运算符会将非number数据强制转换为number）
      navId,
      videoList: []
    })
    //显示正在加载
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    //动态获取当前导航对应的视频数据
    this.getVedioList(this.data.navId)
  },

  //点击播放/继续播放的回调
  handlePlay (event) {
    // console.log('start')
    /**
     * 需求：
     *  1.在点击当前视频播放需要找到上一个播放的视频
     *  2.在播放新的视频之前要关闭上一个视频
     * 关键：
     *  1.如何找到上一个视频的实例对象
     *  2.如何确定点击的视频和正在播放的视频不是同一个视频
     * 单例模式：
     *  1.需要创建多个对象的场景下，通过一个变量接收，始终保持只有一个对象
     *  2.节省内存空间
     */

    let vid = event.currentTarget.id
    // 关闭上一个视频
    // if (this.videoContext) {
    //   this.videoContext.stop()
    // }
    //简洁写法
    // this.vid !== vid && this.videoContext && this.videoContext.stop()
    // this.vid = vid
    //更新data中vid的状态数据
    this.setData({
      videoId: vid
    })
    //创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid)
    // let videoContext = wx.createVideoContext(vid)
    let { videoUpdateTime } = this.data
    //判断当前的视频是否存在播放过的记录
    let videoItem = videoUpdateTime.find(item => item.vid === vid)
    if (videoItem) {
      // this.videoContext.seek(videoItem.currentTime)
      this.setData({
        playVideoDuration: videoItem.currentTime
      })
    }
    this.videoContext.play()
    // videoContext.play()
    console.log('hello')
  },

  //监听视频播放进度的回调
  handleTimeUpdate (event) {
    // console.log(event)
    let videoTimeObj = { vid: event.currentTarget.id, currentTime: event.detail.currentTime }
    let { videoUpdateTime } = this.data
    //判断记录播放时长的videoUpdateTime数组中是否存在当前视频的记录
    //不存在的情况
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid)
    if (videoItem) {
      videoItem.currentTime = videoTimeObj.currentTime;
    } else {
      videoUpdateTime.push(videoTimeObj)
    }
    //更新videoUpdateTime的状态
    console.log(videoUpdateTime)
    this.setData({
      videoUpdateTime
    })
  },

  //视频播放结束调用
  handleEnd (event) {
    // console.log('end')
    //移除记录播放时长数组中的当前视频对象
    let { videoUpdateTime } = this.data
    let num = videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id)
    videoUpdateTime.splice(num, 1)
    this.setData({
      videoUpdateTime
    })
  },
  //自定义下拉刷新数据的回调：scroll-view
  handleRefresher () {
    // console.log('refresher')
    let navId = this.data.navId
    //再次发请求，获取最新数据
    this.getVedioList(navId)
  },
  //自定义上拉触底时的回调:scroll-view
  async handleToLower () {
    // console.log('tolower')
    //数据分页：1.后端分页2.前端分页
    //模拟数据
    let videoListData = await request('/video/group', { id: this.data.navId })
    videoListData = videoListData.datas.map((item, index) => { return { ...item, id: index } })
    let videoList = this.data.videoList
    videoList.push(...videoListData)
    this.setData({
      videoList
    })
  },
  //跳转到搜索页面
  toSearch () {
    wx.navigateTo({
      url: "/pages/search/search"
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
    console.log('页面上拉刷新')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('页面下拉触底')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({ from }) {
    console.log(from)
    if (from === 'button') {
      return {
        title: '简易云音乐',
        page: '/pages/video/video',
      }
    }
    else {
      return {
        title: '简易云音乐',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvshen.jpg'
      }
    }
  }

})