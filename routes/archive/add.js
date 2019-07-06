var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const authUtils = require('../../modules/utils/authUtils');

// 아카이브 스크랩(담기)
router.post('/:archive_idx', authUtils.isLoggedin, async (req, res) => {
	const archiveIdx = req.params.archive_idx;
	const userIdx = req.decoded.idx;

	const getAddArchiveQuery = 'SELECT * FROM archiveAdd WHERE user_idx = ? AND archive_idx = ?'
	const insertAddArchiveQuery = 'INSERT INTO archiveAdd (user_idx, archive_idx) VALUES (?, ?)';
	const deleteAddArchiveQuery = 'DELETE FROM archiveAdd WHERE user_idx = ? AND archive_idx = ?'

	const getAddArchiveResult = await db.queryParam_Parse(getAddArchiveQuery, [userIdx, archiveIdx]);
	if (getAddArchiveResult.length == 0) {
		const insertAddArchiveResult = await db.queryParam_Arr(insertAddArchiveQuery, [userIdx, archiveIdx]);
		if (!insertAddArchiveResult) {
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.INSERT_ADD_ARCHIVE_FAIL));
		} else {
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.INSERT_ADD_ARCHIVE_SUCCESS, insertAddArchiveResult));
		}
	} else {
		const deleteAddArchiveResult = await db.queryParam_Arr(deleteAddArchiveQuery, [userIdx, archiveIdx]);
		if (!deleteAddArchiveResult) {
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.DELETE_ARCHIVE_FAIL));
		} else {
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.DELETE_ARCHIVE_SUCCESS, deleteAddArchiveResult));
		}
	}
});

module.exports = router;