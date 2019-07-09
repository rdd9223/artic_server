var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const jwt = require('../../modules/jwt');
const authUtil = require('../../modules/utils/authUtils');
const upload = require('../../config/multer')

// 마이페이지 조회
router.get('/', authUtil.isLoggedin, async (req, res) => {
	console.log(req.decoded);
	if (!req.decoded.idx) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_IDX));
	} else {
		const getUserInfoQuery = 'SELECT * FROM user WHERE user_idx=?';
		const getUserInfoResult = await db.queryParam_Arr(getUserInfoQuery, [req.decoded.idx]);
		var userIntro = getUserInfoResult[0].user_intro;
		if (!userIntro) {
			userIntro = "";
		}
		const userInfo = {
			userId: getUserInfoResult[0].user_id,
			userImg: getUserInfoResult[0].user_img,
			userName: getUserInfoResult[0].user_name,
			userIntro: userIntro
		}
		if (!getUserInfoResult) {
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_USER));
		} else {
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.FIND_USER_DATA, userInfo));
		}
	}
});

// 마이페이지 수정
router.put('/', upload.single('img'), authUtil.isLoggedin, async (req, res) => {
	let img = req.file.location;
	const intro = req.body.intro;
	const name = req.body.name;
	if (!img || !intro || !name) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NO_USER_DATA));
	} else {
		const updateUserInfoQuery = "UPDATE user SET user_img = ?, user_intro = ?, user_name = ? WHERE user_idx = ?";
		const updateUserInfoResult = await db.queryParam_Arr(updateUserInfoQuery, [img, intro, name, req.decoded.idx]);
		if (!updateUserInfoResult) {
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.UPDATE_USER_DATA_FAIL));
		} else {
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.UPDATE_USER_DATA_SUCCESS));
		}
	}
});

// 내가 스크랩한 아카이브 조회
router.get('/archive/scrap', authUtil.isLoggedin, async (req, res) => {
	// 토큰을 받아 사용자 인증을 한다
	console.log(req.decoded.idx);
	
	// archiveAdd 테이블에 user_idx에 해당하는 아카이브를 모두 조회한다, 해당하는 아카이브를 모두 가져온다
	const findScrapArchiveQuery = 'SELECT * FROM archive, archiveAdd WHERE archiveAdd.user_idx = ? AND archiveAdd.archive_idx = archive.archive_idx';
	const getCategoryNameQuery = 'SELECT category_title FROM category WHERE category_idx = ?';
	const findScrapArchiveResult = await db.queryParam_Arr(findScrapArchiveQuery, [req.decoded.idx]);
	
	for (var i = 0, archive; archive = findScrapArchiveResult[i]; i++){
		const categoryIdx = archive.category_idx;
		const getCategoryNameResult = await db.queryParam_Arr(getCategoryNameQuery,[categoryIdx]);
		archive.category_title = getCategoryNameResult[0].category_title;
	}
	
	if (!findScrapArchiveResult) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.FIND_ADD_ARCHIVE_FAIL));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.FIND_ADD_ARCHIVE_SUCCESS, findScrapArchiveResult));
	}
});

// 내가 만든 아카이브 조회
router.get('/archive/mine', authUtil.isLoggedin, async (req, res) => {

	const findMyArchiveQuery = 'SELECT * FROM archive WHERE user_idx = ?';
	const findMyArchiveResult = await db.queryParam_Arr(findMyArchiveQuery, [req.decoded.idx]);

	if (!findMyArchiveResult) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.FIND_MY_ARCHIVE_FAIL));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.FIND_MY_ARCHIVE_SUCCESS, findMyArchiveResult));
	}
});

module.exports = router;