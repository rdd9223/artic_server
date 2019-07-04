var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const encrytion = require('../../modules/encrytion/encrytionModule');
const jwt = require('../../modules/jwt');
const authUtil = require('../../modules/utils/authUtils');

// 마이페이지 조회
router.get('/', authUtil.isLoggedin, async (req, res) => {
	console.log(req.decoded);
	const decodedUserIdx = req.decoded.idx;

	if (!decodedUserId) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.EMPTY_ID));
	} else {
		const getUserInfoQuery = 'SELECT * FROM user WHERE useridx=?';
		const getUserInfoResult = await db.queryParam_Parse(getUserInfoQuery, decodedUserId);

		if(!getUserInfoResult){
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NO_USER));
		} else{

		}
	}
})
// 토큰 받아서 like 유무 체크 필요
// try {
//     const decodedToken = jwt.verify(req.headers.token);
//     console.log(decodedToken);

//     if (decodedToken.grade == 0) {
//         res.status(200).send(utils.successFalse((statusCode.BAD_REQUEST, resMessage.NO_SELECT_AUTHORITY)));
//     } else {
//         res.status(200).send(utils.successTrue((statusCode.OK, resMessage.USER_SELECTED)));
//     }
// } catch (err) {
//     console.log(err);
// }

module.exports = router;