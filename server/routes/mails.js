"use strict";
const nodemailer = require("nodemailer");

var express = require('express')
var router = express.Router()
const Authcode = require('../model/Authcode')
const fetch = require('node-fetch')
const schedule = require('node-schedule')

const leandro = (nome, frontEndDev) => {
	return {
		nome,
		leandro
	}
}

let access_token = "ya29.a0AWY7CkkGpXCrF7RRQidxs7A5JzVdJtWdgVzPvciTw0dzZ41TloYfsyuwYnsFWjn5kypvxfAFwTjLo_PxEJfnT-cAfNLDOhpaGKf26DhvTHGJ6qdd9-F7K6kjw_YkmdNMh9vCaCZLE2s4oUzBgqCsT5aqHOK8344aCgYKAYASARESFQG1tDrpDYSQuT0qQ6xHrmL_dWVd8g0166"

const scheduleCronstyle = () => {
  //: schedule task will be executed every 30 seconds
  schedule.scheduleJob('*/30 * * * *', () => {
    console.log('scheduleCronstyle:' + new Date())
    fetch('https://accounts.google.com/o/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application.json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: "672020294536-kcj0vcfsu5ptuuisl55ohojg2q5s3ddn.apps.googleusercontent.com",
        client_secret: "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",
        refresh_token: "1//04ct6yhL547G7CgYIARAAGAQSNwF-L9IrLXIPRVn7DipFJRadKdZYd92iX7ExZr6XUSG-_RdDuSuGo8BPWahwfMsWyagee6rFXkU",
        grant_type: "refresh_token"
      })
    }).then(res => res.json()).then(json => {
      console.log(json)
      if (json.access_token != undefined) {
        access_token = json.access_token
        console.log("access token: "+ access_token)
      } else {
        console.log("error: "+ json.error)
      }
    });
  });
}
scheduleCronstyle();

// 发送邮件
// Get replay test
router.get('/send/:to', (req, res) => {
  console.log(req.params.to);
  
  // 如果使用 Gmail 邮箱
  // let access_token = "ya29.a0AWY7CklErgyfCQb4HtlaZaDwwU4lT3cX0WePvDrALcnMQdtY4IiaMfIDPrpnz-e0HeAvANdKvqe-HRLOZImyTFBf3CcVvg2GFRh56_9OvY-pbTCAf8Bso51UT4SfHeQ8VpeFeS70ECOUiUr0hfeApr20ctk8aCgYKAZISARESFQG1tDrpdBDAzL5gqhMNpPVgB7I3SA0163";
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: "models.research.lab@gmail.com",
      clientId:
        "672020294536-kcj0vcfsu5ptuuisl55ohojg2q5s3ddn.apps.googleusercontent.com",
      clientSecret: "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",
      refreshToken:
        "1//04ct6yhL547G7CgYIARAAGAQSNwF-L9IrLXIPRVn7DipFJRadKdZYd92iX7ExZr6XUSG-_RdDuSuGo8BPWahwfMsWyagee6rFXkU",
      accessToken:
        access_token,
    },
  });

  // let access_token = "ya29.a0AWY7CklvWWtJxwRDHVzfCWu8wuX8tXmlLsDzaDKQvPyfnaSKolYQzDIrVtpWdqxMA3yh2m8GmaBMf799TaPpvwvNGSm1MlE14ZsjEkgi_4HW_3Fsps6_-oA6ilBJnP-Na-SEX5yQ06LRtsnsTJWvNNDwY5s-_ToaCgYKAaoSARESFQG1tDrp5tAitNX2aXh5ZwRZ9zaDiQ0166";
  // const transporter = nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     type: "OAuth2",
  //     user: "binwang.neu@gmail.com",
  //     clientId:
  //       "569830411778-t4mtq59bkkq4b65pj649m6kdt4irei4k.apps.googleusercontent.com",
  //     clientSecret: "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",
  //     refreshToken:
  //       "1//04ZFWwik31BFOCgYIARAAGAQSNwF-L9IrhCONVYtoRyiIP4HKeaT3Sfj2OHSoa24MKz06hgEtwdM_Fr2FSXSkUb9w-M1xDvkz5tM",
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

  // 如果要使用 Gmail 邮箱
  let mailOptions = {
    from: 'models.research.lab@gmail.com', // 发送地址
    to: req.params.to, // 接收列表（可多个）
    subject: "Hello,You are registering for a BlockModel account!", // 主题
    // 发送text或者html格式（任选一个）
    text: text,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
      res.json(' '+error)
      return
    }
    // auth code should be store into authcodes table
    let value = {"_user":req.params.to,"_code":code,"_createtime":Date.now()}
    Authcode.create(value)
      .then(() => {
        console.log('Authcode Added')
        res.json(info)
      })
      .catch(err => {
        res.json('Error: ' + err)
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
