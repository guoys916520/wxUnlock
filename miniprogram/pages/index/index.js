//index.js
const app = getApp()
Page({
 data: {
  canIUse: wx.canIUse('button.open-type.getUserInfo'),
  nickName : "",
  src : "",//图片的链接
  token: "",
  base64: "",
  msg:"",
  sessionId:"",
  code:"",
  sceneId: "",
  param: "",
  scene_id: ""
 },

  onLoad: function(options) {
    var scene_id = "";
    scene_id = getApp().globalData.sceneId
    // var scene_id = decodeURIComponent(options.scene)
    var sessionId = ""
    var openid = ""
    console.log("二维码参数" + scene_id)
    getApp().globalData.sceneId = scene_id
  //获取配置信息
  var arr = scene_id.split("&");
  app.globalData.apiUrl = arr[0]
  app.globalData.redisKey = arr[1]

  wx.request({
    url: 'https://' + arr[0] + '/hotel/wxApi/getAttribute', 
    method:'GET',
    header: {
      'content-type': 'application/json'
    },
    data: {
      redisKey: arr[1]
    },
    success(res) {
        app.globalData.param = res.data
        app.globalData.clientId = res.data.wxClientId
        app.globalData.clientCode = res.data.wxClientCode
    },
    fail: e => {
      wx.showToast({
        icon: 'none',
        title: '服务器失联了',
      })
    },
})
 // 登录
 wx.login({
  success: function(res) {
    // 发送 res.code 到后台换取 openId, sessionKey, unionId
    // console.log(res.code)
    //这里调用后台接口，获取手机号
    if (res.code){
      wx.request({
        url: 'https://' + app.globalData.apiUrl + '/hotel/wxApi/getSessionId',
        data: {
          jsCode: res.code,
          appid: getApp().globalData.clientId,
          secret: getApp().globalData.clientCode,
          grantType: 'authorization_code'
        },
        method:'GET',
        header: {
          'content-type': 'application/json'
        },
        success: function(res){
          // console.log(res.data)
          //存储数据
          // wx.setStorage({
          //   data: res.data,
          //   key: "123",
          // })
          // sessionId = res.data.session_key
          // openid = res.data.openid
          // console.log(sessionId)
          // console.log(openid)
          //赋值session和openid到全局变量
          app.globalData.sessionId = res.data.session_key
          app.globalData.openId = res.data.openid
          // console.log(app.globalData.sessionId)
          // console.log(app.globalData.openId)
        },fail: function(res){
          console.log(res.errMsg);
        }
      })
    }
  }
})
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // console.log(res)
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateBack({
          delta: 0,
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateBack({
          delta: 0,
        })
      }
    })
  },
  getPhoneNumber: function(e){
    if(app.globalData.sceneId == null || app.globalData.sceneId == undefined){
      console.log("判断参数方法")
      wx.showToast({
        title: '无客户端参数，请获取正确二维码',
        icon: 'error',
        duration: 3000
       })
       return
    }
    console.log("客户端参数：" + app.globalData.sceneId)
    wx.request({
      url: 'https://' + app.globalData.apiUrl + '/hotel/wxApi/getPhoneNumber', //这里就写上后台解析手机号的接口
      //这里的几个参数是获取授权后的加密数据，作为参数传递给后台就行了
      data: {
          encryptedData: e.detail.encryptedData,
          sessionId: app.globalData.sessionId, 
          iv: e.detail.iv
      },
      method:'GET',
      header: {
        'content-type': 'application/json'
      },
      success(res) {
          console.log("手机号接口返回：" + res.data.phoneNumber)
          app.globalData.phoneNumber = res.data.phoneNumber
          wx.showToast({
            title: '授权成功',
            icon: 'success',
            duration: 1000
           })
           wx.navigateBack({
             delta: 0,
           })
      }
  })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },
//获取用户信息
bindGetUserInfo: function(e){
  this.setData({
   nickName: e.detail.userInfo.nickName
  })
  // console.log(e.detail)
  var session_key = "";
  // wx.getStorageInfo({
  //   success: (option) => {
  //     console.log(option)
  //   },
  // })
  wx.showToast({
   title: '授权成功',
   icon: 'success',
   duration: 1000
  })
 },

//先授权登陆，再拍照注册
 btnreg:function(){
  wx.showModal({
   title: '注册须知',
   content: '先授权登陆，再拍照注册哦！网络可能故障，如果不成功，请再试一下！',
  })
 }
})


