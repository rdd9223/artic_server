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
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.CATEGORY_SELECT_FAIL));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.CATEGORY_SELECT_SUCCESS, getAllCategoryResult));
	}
})

//아카이브 목록 조회
router.get('/:category_idx/archives',async (req, res) => {
    const idx = req.params.category_idx;
    const getArchive = 'SELECT * FROM archive WHERE category_idx = ? WHERE user_idx = 12';
    const getArchiveResult = await db.queryParam_Arr(getArchive, [idx, user_idx]);

    if (!getArchiveResult) {
        res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.ADD_ARTICLE_FAIL));
    } else {
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.ARCHIVE_LIST_SUCCESS, getArchiveResult));
    }
});

module.exports = router;