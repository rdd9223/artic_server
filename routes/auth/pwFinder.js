var express = require('express');
var router = express.Router();
const db = require('../../modules/pool');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const utils = require('../../modules/utils/utils');
const authUtils = require('../../modules/utils/authUtils');
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
    let email = req.body.email;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'rdd9223@gmail.com',
            pass: 'asd970712!@'
        }
    })
    
    var mailOptions = {
        from: 'rdd9223@gmail.com',
        to: 'rdd9223@naver.com',
        subject: "실험 이메일",
        text: "재밌당 ㅎㅎ"
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err);
        } else {
            console.log("Message sent: " + info.response)
        }
    })
    transporter.close(); // 종료
})

module.exports = router;