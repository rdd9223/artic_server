var express = require('express');
var router = express.Router();
const defaultRes = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const upload = require('../../config/multer');

// 신규 아티클 더보기
router.get('/new', async(req,res)=>{
    const getNewArticleQuery = 'SELECT * FROM article ORDER BY date DESC';
    const getNewArticleResult = await db.queryParam_None(getNewArticleQuery);

	if(!getNewArticleResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getNewArticleResult));
    }

});
// 신규 아티클 하나
router.get('/new/:article_idx', async(req,res)=>{
    const idx  = req.params.article_idx;

    const getOneNewArticleQuery = 'SELECT * FROM archiveArticle WHERE article_idx = ?';
    const getOneNewArticleResult = await db.queryParam_Parse(getOneNewArticleQuery, [idx]);
    const archive_idx = getOneNewArticleResult[0].archive_idx
    const article_idx = getOneNewArticleResult[0].article_idx

    const getOneNewArchiveQuery = 'SELECT * FROM archive WHERE archive_idx = ? ORDER BY date DESC limit 1';
    const getOneNewArchiveResult = await db.queryParam_Parse(getOneNewArchiveQuery, [archive_idx]);
    
    const getOneArchiveQuery = 'SELECT * FROM article WHERE article_idx = ?'
    const getOneArchiveResult = await db.queryParam_Parse(getOneArchiveQuery, [article_idx]);

    const newdata = {
        //OneNewArticle : getOneNewArticleResult, //해당 article_idx의 archive_idx
        Archive : getOneNewArchiveResult, //해당 아티클이 들어있는 아카이브
        Articles : getOneArchiveResult //해당 아카이브에 들어있는 모든 아티클
    }

	if(!getOneNewArticleResult || !getOneNewArchiveResult || !getOneArchiveResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, newdata));
    }

});
//최근 읽은 아티클
router.get('/history', async(req,res)=>{
	 const getAllCategoryQuery = 'SELECT * FROM read ORDER BY date DESC';
	// const getAllcategoryResult = await db.queryParam_None(getAllCategoryQuery);

	// if(!getAllcategoryResult){
	// 	res.status(200).send(defaultRes.successFalse(statusCode.CATEGORY_SELECT_FAIL));
	// } else {
	// 	res.status(200).send(defaultRes.successTrue(statusCode.CATEGORY_SELECT_SUCCESS, getAllcategoryResult));
    // }
   //   /archive/article/:article_idx/history


});
//아틱의 선택 
//나중에 구분  WHERE pick="동현";
router.get('/pick', async(req,res)=>{
	 const getArticlePickQuery = 'SELECT * FROM article';
	 const getArticlePickResult = await db.queryParam_None(getArticlePickQuery);

     if(!getNewArticleResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_PICK_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_PICK_SUCESS, getArticlePickResult));
    }
    
});

module.exports = router;