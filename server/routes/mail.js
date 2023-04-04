"use strict";
const nodemailer = require("nodemailer");

var express = require('express')
var router = express.Router()

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
  // let toAddress = 'huixuan@ssc-hn.com';
  let mailOptions = {
    from: '616731641@qq.com', // 发送地址
    to: req.params.to, // 接收列表（可多个）
    subject: "Hello,You are registering for a BlockModel account!", // 主题
    // 发送text或者html格式（任选一个）
    text: text,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.json(error);
    }
    res.json(info)
  });
})
module.exports = router
// 整体流程：
// 1. 前端用户填入邮箱后，点击发送验证码按钮，生成随机验证码并发到指定邮箱，同时存邮箱、验证码、时间戳到数据库（5min内有效）
// 2. 如出错报告给前端，前端给出错误信息 ｜ 如未出错报告给前端，前端显示已发送
// 时间充裕可以增加多少分钟后才能重发的限制
// 3. 前端接受用户输入的验证码，传给后端验证，若超时直接验证失败
// 4. 验证通过则邮箱登陆成功，失败则显示验证失败