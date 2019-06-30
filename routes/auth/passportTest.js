var express = require('express');
var router = express.Router();

const passport = require('passport');

const db = require('../../module/pool');
const utils = require('../../module/utils/utils');
const resMessage = require('../../module/utils/responseMessage');
const statusCode = require('../../module/utils/statusCode');

// facebook 로그인
router.get('/login/facebook',
    passport.authenticate('facebook')
);
// facebook 로그인 연동 콜백
router.get('/login/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/auth/login/success',
        failureRedirect: '/auth/login/fail'
    })
);
router.get('/login/fail', (req, res) => {
    res.status(200).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.LOGIN_FAIL));
});
router.get('/login/success', (req, res) => {
    console.log(req._passport.session);
    res.status(200).send(utils.successTrue(statusCode.AUTH_OK, resMessage.LOGIN_SUCCESS, req._passport.session.user));
});
module.exports = router;
