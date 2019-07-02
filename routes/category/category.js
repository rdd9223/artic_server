var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');

// 카테고리 전체조회
router.get('/', async(req,res)=>{
	const getAllCategoryQuery = 'SELECT * FROM category';
	const getAllCategoryResult = await db.queryParam_None(getAllCategoryQuery);

	if(!getAllCategoryResult){
		res.status(200).send(utils.successFalse(statusCode.OK, resMessage.CATEGORY_SELECT_FAIL));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.CATEGORY_SELECT_SUCCESS, getAllCategoryResult));
	}
})

module.exports = router;