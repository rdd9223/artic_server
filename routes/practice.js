var express = require('express');
var router = express.Router();
const db = require('../modules/pool');
const resMessage = require('../modules/utils/responseMessage');
const statusCode = require('../modules/utils/statusCode');
const utils = require('../modules/utils/utils');
const authUtils = require('../modules/utils/authUtils');
const Notification = require('../models/notificationSchema');

router.get('/', async(req,res) =>{
	// 영우 알림
	archiveIdx = 3;
	articleIdx = 1;
	const getAddArchiveUserQuery = 'SELECT user_idx FROM archiveAdd WHERE archive_idx = ?';
	const getAddArchiveUserResult = await db.queryParam_Arr(getAddArchiveUserQuery, [archiveIdx]);
	
	Notification.create({
		user_idx: getAddArchiveUserResult,
		article_idx: articleIdx,
		notification_type: 0
	}).then((result) => {
		res.status(statusCode.OK).send(utils.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS, result));
	}).catch((err) => {
		res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.SAVE_FAIL));
	});;
})

module.exports = router;