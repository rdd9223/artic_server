var express = require('express');
var router = express.Router();
const defaultRes = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const upload = require('../../config/multer');

// 신규 아카이브 더보기
router.get('/new', async(req,res)=>{
	const getNewArchiveQuery = 'SELECT * FROM archive ORDER BY date DESC';
	const getNewArchiveResult = await db.queryParam_None(getNewArchiveQuery);

	if(!getNewArchiveResult){
        res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getNewArchiveResult));
    }
});
// 신규 아카이브 하나보기
router.get('/new/:archive_idx', async(req,res)=>{
    const idx  = req.params.archive_idx;

	const getOneNewArchiveQuery = 'SELECT * FROM archive ORDER BY date DESC';
	const getOneNewArchiveResult = await db.queryParam_None(getOneNewArchiveQuery);

	if(!getNewArchiveResult){
        res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getOneNewArchiveResult));
    }
});

module.exports = router;