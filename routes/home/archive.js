var express = require('express');
var router = express.Router();
const defaultRes = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const upload = require('../../config/multer');

// 신규 아카이브 더보기
router.get('/new', async (req, res) => {
	const getNewArchiveQuery = 'SELECT ar.*, ca.category_title FROM archive ar INNER JOIN category ca where ar.category_idx = ca.category_idx';
	const getNewArchiveResult = await db.queryParam_None(getNewArchiveQuery);

	if (!getNewArchiveResult) {
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getNewArchiveResult));
	}
});
// 신규 아카이브 하나보기
//아카이브 스크랩 여부, 아티클 좋아요/담기여부 만 추가하면됨
router.get('/new/:archive_idx', async (req, res) => {
	const idx = req.params.archive_idx;

	const getOneNewArchiveQuery = 'SELECT ac.archive_title, ar.article_idx, at.* FROM archive ac, archiveArticle ar, article at WHERE ac.archive_idx = ar.archive_idx AND ar.article_idx = at.article_idx' ;
	const getOneConntArticle = 'SELECT * FROM article WHERE article_idx = ?';
	const getOneNewArchiveResult = await db.queryParam_None(getOneNewArchiveQuery);

	console.log(getOneNewArchiveResult);
	if (!getOneNewArchiveResult) {
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getOneNewArchiveResult));
	}
});
// 카테고리별 아카이브 4개만 보내주기 
router.get('/category/:category_idx', async (req, res) => {
	const idx = req.params.category_idx;
	const getCategory = 'SELECT ca.category_title, ac.* FROM category ca, archive ac WHERE ca.category_idx = ? AND ac.category_idx = ? LIMIT 4';
	const getCategoryResult = await db.queryParam_Arr(getCategory,[idx, idx]);
	if (!getCategoryResult) {
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_CATE_FAIL));
	} else if(getCategoryResult.length == 0){
		res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.HOME_CATE_EMPTY));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_CATE_SUCCESS, getCategoryResult));
	}
});

module.exports = router;