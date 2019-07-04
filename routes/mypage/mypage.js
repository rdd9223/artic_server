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
	if (!req.decoded.idx) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_IDX));
	} else {
		const getUserInfoQuery = 'SELECT * FROM user WHERE user_idx=?';
		const getUserInfoResult = await db.queryParam_Parse(getUserInfoQuery, [req.decoded.idx]);

		if (!getUserInfoResult) {
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_USER));
		} else {
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.FIND_USER_DATA, getUserInfoResult));
		}
	}
});

router.put('/', authUtil.isLoggedin, async (req, res) => {
	const img = req.body.img;
	const id = req.body.id;
	const intro = req.body.intro;
	const name = req.body.name;

	if (!img || !id || !intro || !name) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
	} else {
		const updateUserInfoQuery = "UPDATE user SET user_img = ?, user_intro = ?, user_name = ? WHERE user_idx = ?";
		const updateUserInfoResult = await db.queryParam_Arr(updateUserInfoQuery, [img, intro, name, req.decoded.idx]);

		if (!updateUserInfoResult) {
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.UPDATE_USER_DATA_FAIL));
		} else {
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.UPDATE_USER_DATA_SUCCESS, updateUserInfoResult));
		}
	}
});

router.get('/archive/scrap', authUtil.isLoggedin, async (req, res) => {
	// 토큰을 받아 사용자 인증을 한다
	console.log(req.decoded.idx);

	// archiveAdd 테이블에 user_idx에 해당하는 아카이브를 모두 조회한다, 해당하는 아카이브를 모두 가져온다
	const findScrapArchiveQuery = 'SELECT * FROM archive, archiveAdd WHERE archiveAdd.user_idx = ? AND archiveAdd.archive_idx = archive.archive_idx';
	const findScrapArchiveResult = await db.queryParam_Arr(findScrapArchiveQuery,[req.decoded.idx]);

	if(!findScrapArchiveResult){
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_MY_ARCHIVE));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.FIND_MY_ARCHIVE_SUCCESS,findScrapArchiveResult));
	}
});

router.get('/archive/mine', authUtil.isLoggedin, async (req, res) => {
	
	const findMyArchiveQuery = 'SELECT * FROM archive WHERE user_idx = ?';
	const findMyArchiveResult = await db.queryParam_Arr(findMyArchiveQuery, [req.decoded.idx]);

	if(!findMyArchiveResult){
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_ARCHIVE));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.FIND_MY_ARCHIVE_SUCCESS, findMyArchiveResult));
	}
})
// 	let getArticlesQuery = 'SELECT a.* FROM archiveArticle aa INNER JOIN article a ON aa.article_idx = a.article_idx WHERE aa.archive_idx = ? ORDER BY date DESC';
//  let getLikeCntQuery = 'SELECT COUNT(article_idx) cnt FROM artic.like WHERE article_idx = ?';
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