var express = require('express');
var router = express.Router();
const defaultRes = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const authUtils = require('../../modules/utils/authUtils');
const upload = require('../../config/multer');

// 신규 아티클 더보기
router.get('/articles/new', async(req,res)=>{
    const getNewArticleQuery = 'SELECT * FROM article ORDER BY date DESC';
    const getNewArticleResult = await db.queryParam_None(getNewArticleQuery);

	if(!getNewArticleResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getNewArticleResult));
    }

});
// 신규 아티클 하나
router.get('/:article_idx', async(req,res)=>{
    const idx  = req.params.article_idx;

	const getOneNewArticleQuery = 'SELECT * FROM article WHERE article_idx = ?'
	const getOneNewArticleResult = await db.queryParam_Parse(getOneNewArticleQuery, [idx]);
	const getOneNewArchive = 'SELECT archive_idx FROM archiveArticle WHERE article_idx = ? ORDER BY archiveArticle_idx LIMIT 1' //그 아티클이 속해있는 아카이브 제일 처음꺼
	const getOneNewArchiveTitle = 'SELECT archive_title FROM archive WHERE archive_idx = ?'
	if(!getOneNewArticleResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		for(var i = 0 , article; article = getOneNewArticleResult[i]; i++) { 
			const articleIdx = article.archive_idx;
			const archiveTitleIdx = await db.queryParam_Arr(getOneNewArchive,[getOneNewArticleResult[0].article_idx]);
			const archiveTitle = await db.queryParam_Arr(getOneNewArchiveTitle,[archiveTitleIdx[0].archive_idx])
			article.archive_title = archiveTitle[0].archive_title;
		}
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getOneNewArticleResult));
    }

});
//최근 읽은 아티클
router.get('/history', authUtils.isLoggedin, async(req,res)=>{
	const user_idx = req.decoded.idx;
	 const getHistory = 'SELECT * FROM artic.read WHERE user_idx = ? ORDER BY date DESC';
	 const getHistoryResult = await db.queryParam_Arr(getHistory,[user_idx]);

	if(!getHistoryResult){
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_HISTORY_FAIL));
	} else {
		if(getHistoryResult.length == 0) {
			res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.HOME_HISTORY_NO));
		} else {
			console.log(getHistoryResult.length);
			res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_HISTORY_SUCESS, getHistoryResult));
		}
		
    }
});

//아틱의 선택 
router.get('/pick', async(req,res)=>{
	 const getArticlePickQuery = 'SELECT * FROM article WHERE pick = 0';
	 const getArticlePickResult = await db.queryParam_None(getArticlePickQuery);

     if(!getArticlePickResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_PICK_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_PICK_SUCESS, getArticlePickResult));
    }
    
});

module.exports = router;