"use strict";
const nodemailer = require("nodemailer");

var express = require('express')
var router = express.Router()
const Authcode = require('../model/Authcode')

const leandro = (nome, frontEndDev) => {
	return {
		nome,
		leandro
	}
}

// 发送邮件
// Get replay test
router.get('/send/:to', (req, res) => {
  console.log(req.params.to);
  let transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    service: "qq", // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
    //   port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
      user: "616731641@qq.com",
      pass: "pujyjrassyzjbbfc", //授权码，并非QQ密码
    },
  });
  
  // 如果使用 Gmail 邮箱
  // let access_token = "ya29.a0Ael9sCO_u-JjQgpVVEOlANmYKH-3ptyWEk-6vrCgrukkZ3DDs8W-1C3WcQC0WLgIN_e5ITFA_WTXhr4x2TkvGBI8o2na1pod9byMSxT_Wws8nAyi3NgGxXsrMd8BQZkfmqDwEbsgZhelSsWoglIpQV4MwDiIaCgYKAfYSARISFQF4udJhWBtpWtsVTthevvQPdPfsyA0163";
  // const transporter = nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     type: "OAuth2",
  //     user: "models.research.lab@gmail.com",
  //     clientId:
  //       "672020294536-ah1g9re5uo0eajo839359jl4h5vg3idt.apps.googleusercontent.com",
  //     clientSecret: "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",
  //     refreshToken:
  //       "1//04Fvli7l0i5sQCgYIARAAGAQSNwF-L9Ir45s7iidy5FyrrVDwUXURHgf02HjRjARjaeNm0Yz6ejxG4jnra1uEluyS7aBJ012OA6o",
  //     accessToken:
  //       access_token,
  //   },
  // });
  
  const randomFns=()=> { // 生成6位随机数
    let code = ""
    for(let i= 0;i<6;i++){
        code += parseInt(Math.random()*10)
    }
    return code 
  }
  
  let code = randomFns();
  
  // 拼接验证码
  let text  ='Your verification code is: ' + code + ' .the verification code is valid within 5 minutes';
  
  // 收件人地址 (由前端传过来)
  let mailOptions = {
    from: '616731641@qq.com', // 发送地址
    to: req.params.to, // 接收列表（可多个）
    subject: "Hello,You are registering for a BlockModel account!", // 主题
    // 发送text或者html格式（任选一个）
    text: text,
  };

  // 如果要使用 Gmail 邮箱
  // let mailOptions = {
  //   from: 'models.research.lab@gmail.com', // 发送地址
  //   to: req.params.to, // 接收列表（可多个）
  //   subject: "Hello,You are registering for a BlockModel account!", // 主题
  //   // 发送text或者html格式（任选一个）
  //   text: text,
  // };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.json(error);
    }
    // auth code should be store into authcodes table
    let value = {"_user":req.params.to,"_code":code,"_createtime":Date.now()}
    Authcode.create(value)
      .then(() => {
        console.log('Authcode Added')
        res.json(info)
      })
      .catch(err => {
        res.send('Error : ' + err)
      })
  });
})

// verify auth code
router.post('/authcode', (req, res) => {
  if (!req.body) {
    res.status(404)
    res.json({
      error: 'Bad data'
    })
  } else {
    console.log(req.body)
    Authcode.findAll({
      where: {
        _user: req.body.user
      }, order: [
        ['_createtime', 'DESC']
      ]
    })
      .then(authcodes => {
        if (authcodes.length > 0) {
          console.log(authcodes[0].dataValues._code)
          if (Date.now() - Number(authcodes[0].dataValues._createtime) > 300000) {
            Authcode.destroy({
              where: {
                _user: req.body.user
              }
            })
              .then((result) => {
                console.log(result)
                if (result > 0) {
                  console.log('Authcode Deleted!')
                } else {
                  console.log('No Authcode!')
                }
              })
              .catch(err => {
                console.log('error: ' + err)
              })
            res.json({
              result: 'authcode expired'
            })
          } else {
            if (req.body.code == authcodes[0].dataValues._code) {
              res.json({
                result: 'true'
              })
            } else {
              res.json({
                result: 'false'
              })
            }
          }
        } else {
          res.json({
            result: 'null'
          })
        }
      })
      .catch(err => {
        res.json('error: ' + err)
      })
  }
})


module.exports = router
// 整体流程：
// 1. 前端用户填入邮箱后，点击发送验证码按钮，生成随机验证码并发到指定邮箱，同时存邮箱、验证码、时间戳到数据库（5min内有效）
// 2. 如出错报告给前端，前端给出错误信息 ｜ 如未出错报告给前端，前端显示已发送
// 时间充裕可以增加多少分钟后才能重发的限制
// 3. 前端接受用户输入的验证码，传给后端验证，若超时直接验证失败
// 4. 验证通过则邮箱登陆成功，失败则显示验证失败


// 如果使用 gmail 发送邮件需要定制刷新 access token，但是这段代码应该是要写在一个定时任务里，还没写定时任务
// const res = await ctx.curl("https://accounts.google.com/o/oauth2/token", {
//   method: "POST",
//   contentType: "json",
//   dataType: "json",
//   data: {
//     client_id: clientId,
//     client_secret: clientSecret,
//     refresh_token: refreshToken,
//     grant_type: "refresh_token",
//   },
// });
// const { access_token } = res.data || {};