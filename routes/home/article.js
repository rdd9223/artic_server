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

    const getOneNewArticleQuery = 'SELECT at.*, ac.archive_title FROM archiveArticle aa, article at, archive ac WHERE aa.article_idx = ? AND aa.archive_idx = ac.archive_idx ';
    const getOneNewArticleResult = await db.queryParam_Parse(getOneNewArticleQuery, [idx]);

	if(!getOneNewArticleResult){
        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getOneNewArticleResult));
    }
    //해당 아카이브에 있는 아티클

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