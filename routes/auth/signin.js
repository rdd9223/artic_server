var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const encrytion = require('../../modules/encrytion/encrytionModule');
const jwt = require('../../modules/jwt');
const secretOrPrivateKey = "articKey!";
//로그인
router.post('/', async(req, res) => {
    const id = req.body.id;
    const pw = req.body.pw;

    const selectQuery = 'SELECT * FROM user WHERE user_id = ?';

    if (!id || !pw) { //아이디가 없고 패스워드도 없음
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
        const selectResult = await db.queryParam_Parse(selectQuery, [id])
      
        if (!selectResult) { //디비 조회 안되면
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.MEMBERSHIP_DB_SELECT_ERROR));
        } else if (selectResult.length == 1) { //디비 조회 결과 한개면
            console.log(selectResult[0].salt)
            console.log(selectResult[0].user_pw)
            const hashedPw = await encrytion.onlyEncrytion(pw, selectResult[0].salt)
            
            if (selectResult[0].user_pw == hashedPw.hashedPassword) {
               
                const tokenValue = jwt.sign(selectResult[0]);
                //  const decodedJwt = jwt.verify(tokenValue.token);
                //  console.log(decodedJwt); -> 토큰 확인할때 사용
                res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.LOGIN_SUCCESS, tokenValue));
            } else {
                res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.MISS_MATCH_PW));
            }
        } else {
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.LOGIN_FAIL));
        }
    }
});

module.exports = router;
