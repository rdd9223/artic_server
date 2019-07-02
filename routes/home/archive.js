var express = require('express');
var router = express.Router();
const defaultRes = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const upload = require('../../config/multer');

// 홈화면

router.get('/new', async(req,res)=>{
	const getNewArchiveQuery = 'SELECT * FROM archive ORDER BY date DESC';
	const getNewArchiveResult = await db.queryParam_None(getNewArticleQuery);

	if(!getNewArchiveResult){
        res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getNewArchiveResult));
    }
});

module.exports = router;