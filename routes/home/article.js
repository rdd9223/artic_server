var express = require('express');
var router = express.Router();
const defaultRes = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const authUtils = require('../../modules/utils/authUtils');
const upload = require('../../config/multer');

// 신규 아티클 더보기
router.get('/articles/new',authUtils.isLoggedin, async (req, res) => {
	const getNewArticleQuery = 'SELECT * FROM article ORDER BY date DESC';
	const getNewArticleResult = await db.queryParam_None(getNewArticleQuery);

	if (!getNewArticleResult) {
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getNewArticleResult));
	}

});
// 신규 아티클 하나 
router.get('/new/:article_idx', authUtils.isLoggedin, async (req, res) => {
	const idx = req.params.article_idx;
	//const user_idx = req.decoded.idx;
	const getOneNewArticleQuery = 'SELECT * FROM artic.article WHERE article_idx = ?'
	const getOneNewArticleResult = await db.queryParam_Parse(getOneNewArticleQuery, [idx]);
	console.log(`이건되는디${getOneNewArticleResult[0].article_idx}`)
	if (!getOneNewArticleResult) {
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		const getOneNewArchive = 'SELECT * FROM artic.archiveArticle WHERE article_idx = ? ORDER BY archiveArticle_idx LIMIT 1'; //그 아티클이 속해있는 아카이브 제일 처음꺼
		const archiveTitleIdx = await db.queryParam_Arr(getOneNewArchive, [idx]);
		console.log(`해당 아티클이 속해있는 아카이브 인덱스1${archiveTitleIdx[0].archive_idx}`)
		const getOneNewArchiveTitle = 'SELECT archive_title FROM artic.archive WHERE archive_idx = ?'
		const archiveTitle = await db.queryParam_Arr(getOneNewArchiveTitle, [archiveTitleIdx[0].archive_idx])
		console.log(`ffffffffffff${archiveTitle[0].archive_title}`)
		getOneNewArticleResult[0].archive_title = archiveTitle[0].archive_title;
		//getOneNewArticleResult.archive_title = archiveTitle.archive_title;
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getOneNewArticleResult[0]));
	}
});
//최근 읽은 아티클
router.get('/history', authUtils.isLoggedin, async (req, res) => {
	const user_idx = req.decoded.idx;
	const getHistory = 'SELECT * FROM artic.read WHERE user_idx = ? ORDER BY date DESC';
	const getHistoryResult = await db.queryParam_Arr(getHistory, [user_idx]);

	if (!getHistoryResult) {
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_HISTORY_FAIL));
	} else {
		if (getHistoryResult.length == 0) {
			res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.HOME_HISTORY_NO));
		} else {
			console.log(getHistoryResult.length);
			res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_HISTORY_SUCESS, getHistoryResult));
		}

	}
});

//아틱의 추천
router.get('/pick', async (req, res) => {
	const getArticlePickQuery = 'SELECT * FROM artic.article WHERE pick = 0';
	const getArticlePickResult = await db.queryParam_None(getArticlePickQuery);

	if (!getArticlePickResult) {
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_PICK_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_PICK_SUCESS, getArticlePickResult));
	}

});

module.exports = router;