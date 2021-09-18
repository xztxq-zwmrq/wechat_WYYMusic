import request from '../../utils/request'
let isSend = false;//用于节流使用
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '',//placeholder的内容
    hotList: [],//热搜榜数据
    searchContent: '',//用户输入表单项数据
    searchList: [],//关键字模糊匹配的数据
    historyList: [],//搜索历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取初始化数据
    this.getInitData()
    //获取历史记录
    this.getSearchHistory()
  },



  //获取初始化的数据
  async getInitData () {
    let placeholderData = await request('/search/default');
    let hotList = await request('/search/hot/detail');
    hotList = hotList.data.map((item, index) =>
      item = { ...item, index: index }
    )
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList
    })
  },
  //获取本地历史记录的功能函数
  getSearchHistory () {
    let historyList = wx.getStorageSync('searchHistory')
    if (historyList) {
      this.setData({
        historyList
      })
    }
  },
  //表单项内容发生改变的回调
  handleInputChange (event) {
    this.setData({
      searchContent: event.detail.value.trim()
    })
    //函数节流
    // this.isSend = false;
    if (isSend) {
      return
    }
    isSend = true
    this.getSearchList()
    setTimeout(async () => {
      isSend = false;
    }, 300);
  },
  //获取搜索数据的功能函数
  async getSearchList () {
    if (!this.data.searchContent) {
      this.setData({
        searchList: []
      })
      return
    }
    let { searchContent, historyList } = this.data
    //发请求获取关键字模糊匹配数据
    let searchListData = await request('/search', { keywords: searchContent, limit: 10 })
    // console.log(searchListData)
    searchListData.msg ? this.setData({
      searchList: [{ name: searchListData.msg }]
    }) : (searchListData.result.songs ? this.setData({
      searchList: searchListData.result.songs
    }) : this.setData({
      searchList: [{ name: '没有查到数据' }]
    }))

    //将搜索的关键字添加到搜索历史记录中
    if (historyList.indexOf(searchContent) !== -1) {
      historyList.splice(historyList.indexOf(searchContent), 1)
    }
    historyList.unshift(searchContent)
    this.setData({
      historyList
    })
    wx.setStorageSync('searchHistory', historyList)
  },

  //清空搜索内容
  clearSearchContent () {
    this.setData({
      searchContent: '',
      searchList: [],
    })
  },
  //刪除搜索历史记录
  deleteSearchHistory () {
    let _this = this;
    wx.showModal({
      content: '是否确认删除历史记录',
      success (res) {
        console.log(res)
        if (res.confirm) {
          // console.log('用户点击确定')
          _this.setData({
            historyList: []
          })
          wx.removeStorageSync('searchHistory', [])
        }
        // else if (res.cancel) {
        //   console.log('用户点击取消')
        // }
      }
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