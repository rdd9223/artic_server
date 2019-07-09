var express = require('express');
var router = express.Router();

const passport = require('passport');

const db = require('../../modules/pool');
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');

// router.get('/', (req, res) => {
//     console.log(req.session.passport);
//  });

// kakao 로그인
router.get('/login/kakao',
    passport.authenticate('kakao')
);
// kakao 로그인 연동 콜백
router.get('/login/kakao/callback',
    passport.authenticate('kakao', {
        successRedirect: '/auth/social/login/success',
        failureRedirect: '/auth/social/login/fail'
    })
);
router.get('/login/fail', (req, res) => {
    res.status(200).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.LOGIN_FAIL));
});
router.get('/login/success', (req, res) => {
    console.log(req._passport.session);
    res.status(200).send(utils.successTrue(statusCode.AUTH_OK, resMessage.LOGIN_SUCCESS, req._passport.session.user.token));
});
module.exports = router;
