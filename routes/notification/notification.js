var express = require('express');
var router = express.Router();
const db = require('../../modules/pool');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const utils = require('../../modules/utils/utils');
const authUtils = require('../../modules/utils/authUtils');
const Notification = require('../../models/notificationSchema'); //코드에 쓸 스키마 가져오기
// mongoose promise지원

/*	
	notification type code
	newArticle = 0
	recommend = 1
	notRead = 2
*/
// newArticle code --> route/archive/:archive_idx/article

// 모든 알림 불러오기
router.get('/', authUtils.isLoggedin, async (req, res) => {
	const userIdx = req.decoded.idx;
	//오름차순 = 1, 내림차순 = -1

	Notification.find({
			'user_idx.user_idx': userIdx
		}).sort({
			_id: -1
		})
		.then(async (result) => {
			if (!result[0]) {
				res.status(statusCode.OK).send(utils.successFalse(statusCode.NO_CONTENT, resMessage.NOTIFICATION_NOT_EXIST));
			} else {
				const resResult = result;
				Notification.updateMany({
						"user_idx.user_idx": userIdx
					}, {
						$set: {
							"user_idx.$.isRead": true
						}
					}, {
						"multi": true
					},
					(err, updateResult) => {
						if (err) {
							console.log(err);
						} else {
							console.log(updateResult)
						}
					});
				var resArr = Array();
				for (var i = 0; i < resResult.length; i++) {
					var data = new Object();

					var selectArticleQuery = "SELECT * FROM article WHERE article_idx IN (";

					for (var j = 0; articleIdx = resResult[i].article_idx, j < articleIdx.length; j++) {
						console.log(articleIdx[j])
						selectArticleQuery = selectArticleQuery + String(articleIdx[j])
						if (j != articleIdx.length - 1) {
							selectArticleQuery = selectArticleQuery + ",";
						}
					}
					selectArticleQuery = selectArticleQuery + ")";
					console.log(selectArticleQuery);
					var articlesResult = await db.queryParam_None(selectArticleQuery);
					data.articles = articlesResult
					console.log(data)

					for (var k = 0; userIdxes = resResult[i].user_idx, k < userIdxes.length; k++) {
						if (userIdxes[k].user_idx == userIdx) {
							data.isRead = userIdxes[k].isRead;
							break;
						}
					}

					resArr[i] = data;
				}
				res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, resMessage.NOTIFICATION_READ_SUCCESS, resArr));

			}
		}).catch((err) => {
			res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.NOTIFICATION_READ_FAIL));
		});
})

// 읽지않은 아티클 알림 등록
router.post('/', authUtils.isLoggedin, async (req, res) => {
	const getNotReadArticleIdxQuery = 'SELECT distinct article_idx FROM `read` WHERE user_idx = ? AND article_idx ' +
		'NOT IN (SELECT aa.article_idx FROM archive ar, archiveArticle aa WHERE ar.user_idx = ? AND ar.archive_idx = aa.archive_idx)';
	const getNotReadArticleIdxResult = await db.queryParam_Arr(getNotReadArticleIdxQuery, [18, 18]); //req.decoded.idx
	let articleArr = [];

	for (let i = 0; i < getNotReadArticleIdxResult.length; i++) {
		articleArr[i] = getNotReadArticleIdxResult[i].article_idx;
	}
	const userData = {
		user_idx: 11, //req.decoded.idx,
		isRead: false
	}
	Notification.create({
		user_idx: userData,
		article_idx: articleArr,
		notification_type: 2
	}).then((result) => {
		res.status(statusCode.OK).send(utils.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS, result));
	}).catch((err) => {
		res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.SAVE_FAIL));
	});
});

module.exports = router;
// 담기한 아카이브에서 새로운 글 등록시 알림
// 추천
// 아카이브 담은것중에 안읽은거  읽었느지