var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const authUtils = require('../../modules/utils/authUtils');

router.post('/:archive_idx', authUtils.isLoggedin, async(req, res) => {
	const archiveIdx = req.params.archive_idx;
	const userIdx = req.decoded.idx;
	console.log(userIdx);
	const addArchiveQuery = 'INSERT INTO archiveAdd (user_idx, archive_idx) VALUES (?, ?)';
	const addArchiveResult = await db.queryParam_Parse(addArchiveQuery, [userIdx, archiveIdx]);
	
	if (!addArchiveResult){
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ADD_ARTICLE_FAIL));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.ADD_ARTICLE_SUCCESS, addArchiveResult));
	}
});

module.exports = router;