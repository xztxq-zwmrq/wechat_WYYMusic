import PubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../../utils/request'

//获取全局实例
const appInstance = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,//标识音乐是否播放
    song: {},//歌曲详情对象
    musicId: '',//音乐id
    currentTime: '00:00',//实时时间
    durationTime: '00:00',//总时长
    currentWidth: 0,//实时进度条的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options:用于接收路由跳转的query参数
    // console.log(options)
    // console.log(typeof options.song)
    //原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
    //数据不完整导致JSON.parse报错
    // console.log(JSON.parse(options.song))

    let musicId = options.musicId
    // console.log(musicId)
    //获取音乐详情
    this.getMusicInfo(musicId)
    //将音乐的id存入到data中
    this.setData({
      musicId
    })
    //即使将订阅放在这里也会因为页面反复重新加载而累加
    // PubSub.subscribe('musicId', (msg, musicId) => {
    //   // console.log(musicId)
    //   this.getMusicInfo(musicId)
    //   //将音乐的id存入到data中
    //   this.setData({
    //     musicId
    //   })
    //   //取消订阅
    //   PubSub.unsubscribe('musicId')
    // })
    /**
     * 问题：如果用户操作系统的控制音乐播放/暂停的按钮，回导致页面中不知道音乐的状态，导致播放的真实状态和页面的不一致
     * 解决方法：
     * 1.通过控制音频的实例去监听音乐的播放、暂停
     * 
     */

    //判断当前页面音乐是否在播放
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId == musicId) {
      //修改 当前页面音乐的播放状态
      // changePlayState(true)
      this.setData({
        isPlay: true
      })
    }
    //创建控制音频播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    //监视音乐播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true)

      //修改全局的音乐id
      appInstance.globalData.musicId = musicId
    })
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false)
    })
    //这种写法报错
    // this.backgroundAudioManager.onStop(this.changePlayState(false))
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false)
    })
    //监听音乐播放结束
    this.backgroundAudioManager.onEnded(() => {
      this.subscribeMusicId()
      //自动切换至下一首，并自动播放
      PubSub.publish('switchType', 'next')
      //将进度条还原
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    })

    //监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // console.log(this.backgroundAudioManager.duration, this.backgroundAudioManager.currentTime)
      //格式化实时的播放时间
      // console.log(this.backgroundAudioManager.currentTime)
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      // console.log(currentTime)
      let currentWidth = (this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration) * 450
      // console.log(currentWidth)
      this.setData({
        currentTime,
        currentWidth
      })
    })
  },
  //修改播放音乐状态的功能函数
  changePlayState (isPlay) {
    this.setData({
      // isPlay: isPlay
      isPlay
    })
    //修改全局音乐的播放的状态
    appInstance.globalData.isMusicPlay = isPlay
  },
  //获取音乐详情的功能函数
  async getMusicInfo (musicId) {
    let songData = await request('/song/detail', { ids: musicId })
    // console.log(songData)
    //songData.song[0].dt 单位ms
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    let song = songData.songs[0]
    this.setData({
      song,
      durationTime
    })
    //动态修改标题
    wx.setNavigationBarTitle({
      title: song.name
    })
  },
  //点击播放、暂停的回调
  handleMusicPlay () {
    let isPlay = !this.data.isPlay
    //修改音乐的播放状态
    // this.setData({
    //   isPlay
    // })
    let { musicId, musicLink } = this.data
    this.musicControl(isPlay, musicId, musicLink);
  },

  //控制音乐播放/暂停的功能函数
  async musicControl (isPlay, musicId, musicLink) {
    if (isPlay) {//播放音乐
      if (!musicLink) {
        //获取音乐的播放链接
        let musicLinkData = await request('/song/url', { id: musicId })
        musicLink = musicLinkData.data[0].url
        this.setData({
          musicLink
        })
      }

      //backgroundAudioManager.src="音乐了链接"
      this.backgroundAudioManager.src = musicLink
      this.backgroundAudioManager.title = this.data.song.name
    } else {
      this.backgroundAudioManager.pause();
    }
  },

  //点击切歌的回调
  handleSwitch (event) {
    //获取切歌的类型
    let type = event.currentTarget.id
    // console.log(type)
    this.subscribeMusicId()
    //关闭当前播放的音乐
    this.backgroundAudioManager.stop()
    //发布消息数据给recommendSong页面
    PubSub.publish('switchType', type)
  },
  //订阅musicId
  subscribeMusicId () {
    //订阅来自recommendSong页面发布传来的musicId，订阅会累加，导致订阅多次
    PubSub.subscribe('musicId', (msg, musicId) => {
      // console.log(musicId)
      //获取最新的音乐信息
      this.getMusicInfo(musicId)
      //自动播放当前音乐
      this.musicControl(true, musicId)
      //将音乐的id存入到data中
      this.setData({
        musicId
      })
      //取消订阅
      PubSub.unsubscribe('musicId')
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