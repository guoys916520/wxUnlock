//app.js
App({
  onLaunch: function (options) {
    var scene_id = decodeURIComponent(options.scene)
    console.log("111二维码参数" + scene_id)
  
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
   
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // 获取屏幕参数
    try {
      const res = wx.getSystemInfoSync()
      if (res.platform == 'ios') {
        this.globalData.platform = 'ios'
      } else if (res.platform == 'android') {
        this.globalData.platform = 'android'
      }
      // 导航高度
      let navHeight = res.statusBarHeight 
      // 屏幕宽度/高度，单位px
      this.globalData.screenWidth = res.screenWidth
      this.globalData.screenHeight = res.screenHeight
      // 状态栏的高度，单位px
      this.globalData.statusBarHeight = res.statusBarHeight
      // 设备像素比
      this.globalData.pixelRatio = res.pixelRatio
      // 可使用窗口宽度，单位px
      this.globalData.winWidth = res.windowWidth
      // 安卓时，胶囊距离状态栏8px，iOS距离4px
      if (res.system.indexOf('Android') !== -1) {
        this.globalData.navHeight = navHeight + 14 + 32
        this.globalData.navTitleTop = navHeight + 8
        // 视窗高度 顶部有占位栏时
        this.globalData.winHeight = res.screenHeight - navHeight - 14 - 32
        // tab主页视窗高度
        this.globalData.winHeightTab = res.windowHeight - navHeight - 14 - 32
      } else {
        this.globalData.navHeight = navHeight + 12 + 32
        this.globalData.navTitleTop = navHeight + 4
        // 视窗高度 顶部有占位栏时
        this.globalData.winHeight = res.screenHeight - navHeight - 12 - 32
        // tab主页视窗高度
        this.globalData.winHeightTab = res.windowHeight - navHeight - 12 - 32
      }
      console.log(wx.getSystemInfoSync(), this.globalData.winHeightTab)
    } catch (e) {
      console.log(e)
    }
  },
  globalData: {
    userInfo: null,
    sessionId: "",
    openId: "",
    phoneNumber: "",
    sceneId: "",
    token: "",
    name: "",
    idCard: "",
    apiUrl: "",
    redisKey: "",
    param: "",
    clientId: "",
    clientCode: "",
  }
})