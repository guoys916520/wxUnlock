
const app = getApp()
Page({

  data: {
    openid: getApp().globalData.openId,
    name: "",
    idCard: "",
    sceneId: ""
  },

  onLoad: function (options) {
    this.setData({
      openid: getApp().globalData.openId,
    })
  },
})