var express = require('express');
var router = express.Router();
const db = require('../../modules/pool');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const utils = require('../../modules/utils/utils');
const authUtils = require('../../modules/utils/authUtils');
const nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


router.post('/', async (req, res) => {
    let email = req.body.email;
    const id = req.body.id;
    const pw = req.body.pw;
    
    //회원정보 확인
    const getAdmin = 'SELECT * FROM user WHERE user_id = ?'
	const getAdminResult = await db.queryParam_Arr(getAdmin, [id]);


    //메일 발송객체 생성
    let transporter = nodemailer.createTransport(smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'hyeong412@gmail.com',
            pass: 'Dbgusdud412!'
        }
    }));
    
    var mailOptions = {
        from: 'articrew',
        to: email,
        subject: "비밀번호 인증코드",
        text: "랜덤 코드 보내기"
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err);
        } else {
            console.log("Message sent: " + info.response);
        }
    });
    transporter.close(); // 종료
});

module.exports = router;