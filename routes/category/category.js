var express = require('express');
var router = express.Router();
const defaultRes = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');

// 카테고리 전체조회
router.get('/', async(req,res)=>{
	const getAllCategoryQuery = 'SELECT * FROM category';
	const getAllCategoryResult = await db.queryParam_None(getAllCategoryQuery);

	if(!getAllCategoryResult){
		res.status(200).send(defaultRes.successFalse(statusCode.CATEGORY_SELECT_FAIL));
	} else {
		res.status(200).send(defaultRes.successTrue(statusCode.CATEGORY_SELECT_SUCCESS, getAllCategoryResult));
	}
})

module.exports = router;