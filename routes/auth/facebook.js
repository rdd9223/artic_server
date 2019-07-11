var express = require('express');
var router = express.Router();

const db = require('../../modules/pool');
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const jwt = require('../../modules/jwt');

// kakao 로그인
router.post('/', async (req, res) => {
    const id = req.body.id //
    const email = req.body.email; //user_id에 넣어주고
    const name = req.body.name; // user_name
    const img = req.body.img
    const type = "facebookuser"

    const insertFacebook = 'INSERT INTO artic.user (user_id, user_img, user_type, user_name, salt) VALUES (?, ?, ?, ?, ?)';
    const insertFacebookResult = await db.queryParam_Parse(insertFacebook, [email, img, type, name, id]);
    if(!insertFacebookResult) {
        res.status(200).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.LOGIN_FAIL));
    } else {
        //토큰화
        const tokenValue = jwt.sign(insertFacebookResult.insertId);
        console.log(tokenValue);
        res.status(200).send(utils.successTrue(statusCode.AUTH_OK, resMessage.LOGIN_SUCCESS, tokenValue));
    }

});

module.exports = router;
