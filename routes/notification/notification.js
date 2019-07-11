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
				var resArr = Array(); // 결과 배열
				for (var i = 0; i < resResult.length; i++) {
					var data = new Object();

					const selectAchiveinfoQuery = 'SELECT ac.archive_title, ac.archive_idx FROM archiveArticle aa, archive ac WHERE aa.article_idx = ? AND aa.archive_idx = ac.archive_idx'
					var selectArticleQuery = "SELECT * FROM article WHERE article_idx IN (";

					for (var j = 0; articleIdx = resResult[i].article_idx, j < articleIdx.length; j++) {
						console.log(articleIdx[j])
						selectArticleQuery = selectArticleQuery + String(articleIdx[j])
						if (j != articleIdx.length - 1) {
							selectArticleQuery = selectArticleQuery + ",";
						}
					}
					selectArticleQuery = selectArticleQuery + ")";
					var articlesResult = await db.queryParam_None(selectArticleQuery);
					for(var j = 0; j < articlesResult.length; j++){
						var selectAchiveinfoResult = await db.queryParam_Arr(selectAchiveinfoQuery,[articlesResult[j].article_idx]);
						articlesResult[j].archive_idx = selectAchiveinfoResult[0].archive_idx;
						articlesResult[j].archive_title = selectAchiveinfoResult[0].archive_title;
					}
					console.log(articlesResult);
					data.articles = articlesResult;

					var articleIdx = resResult[i].article_idx

					for (var k = 0; userIdxes = resResult[i].user_idx, k < userIdxes.length; k++) {
						if (userIdxes[k].user_idx == userIdx) {
							data.isRead = userIdxes[k].isRead;
							data.notification_type = resResult[k].notification_type;
							data.notification_id = resResult[k]._id;
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
// 읽음 변경 통신
router.put('/read', authUtils.isLoggedin, async (req, res) => {
	const userIdx = req.decoded.idx;
	Notification.updateMany({
		"user_idx.user_idx": userIdx
	}, {
		$set: { "user_idx.$.isRead": true }
		}, { "multi": true },
		(err, updateResult) => {
			if (err) {
				res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.ISREAD_UPDATE_FAIL));
			} else {
				res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, resMessage.ISREAD_UPDATE_SUCCESS, updateResult));
			}
		});
})

// 추천 알림 (마지막 읽은 아티클의 카테고리 중, 무작위 5개(안 읽은 것))
router.post('/1', authUtils.isLoggedin, async (req, res) => {
	if (req.decoded.idx == 1) {
		const getAllUserIdxQuery = 'SELECT user_idx FROM user WHERE user_idx != ?'
		const getRecentViewArticleQuery = 'SELECT article_idx FROM `read` WHERE user_idx = ? ORDER BY date DESC LIMIT 1';
		const getCategoryFromArticleQuery = 'SELECT ac.category_idx FROM archiveArticle aa, archiveCategory ac WHERE aa.article_idx = ? AND aa.archive_idx = ac.archive_idx ORDER BY rand()';
		const getRandomRecommendArticleQuery = 'SELECT aa.article_idx FROM archiveArticle aa, archiveCategory ac WHERE (ac.category_idx = ? AND aa.archive_idx = ac.archive_idx AND aa.article_idx NOT IN' +
			'(SELECT `read`.article_idx FROM `read` WHERE `read`.user_idx = ?)) ORDER BY rand() limit 5';

		const getAllUserIdxResult = await db.queryParam_Arr(getAllUserIdxQuery, [1]);

		var articleResult = [],
			userResult = [];
		for (let i = 0, j = 0; i < getAllUserIdxResult.length; i++) {
			//console.log(getAllUserIdxResult[i].user_idx);
			const getRecentViewArticleResult = await db.queryParam_Arr(getRecentViewArticleQuery, [getAllUserIdxResult[i].user_idx]);
			if (getRecentViewArticleResult.length != 0) {
				//console.log(getRecentViewArticleResult[0].article_idx);
				const getCategoryFromArticleResult = await db.queryParam_Arr(getCategoryFromArticleQuery, [getRecentViewArticleResult[0].article_idx]);
				//console.log(getCategoryFromArticleResult[0].category_idx);
				const getRandomRecommendArticleResult = await db.queryParam_Arr(getRandomRecommendArticleQuery, [getCategoryFromArticleResult[0].category_idx, getAllUserIdxResult[i].user_idx]);
				userResult[j] = getAllUserIdxResult[i].user_idx;
				articleResult[j++] = getRandomRecommendArticleResult;
				//console.log(articleResult[j-1]);
			}
		}

		let articleArr = [],
			resultArr = [];

		for (let j = 0; j < userResult.length; j++) {
			for (let i = 0; i < articleResult[j].length; i++) {
				articleArr[i] = articleResult[j][i].article_idx;
			}
			userData = {
				user_idx: userResult[j],
				isRead: false
			}

			Notification.create({
				user_idx: userData,
				article_idx: articleArr,
				notification_type: 1
			}).then((result) => {
				resultArr[j] = result;
			});
		}
		if (!resultArr) {
			res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.NOTIFICATION_POST_FAIL));
		} else {
			res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, resMessage.NOTIFICATION_POST_SUCCESS));
		}
	} else {
		res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.NO_ARTIC_MANAGER));
	}

})

// 읽지않은 아티클 알림 등록
router.post('/2', authUtils.isLoggedin, async (req, res) => {
	if (req.decoded.idx == 1) {
		const getAllUserIdxQuery = 'SELECT user_idx FROM user WHERE user_idx != ?'
		const getNotReadArticleIdxQuery = 'SELECT distinct aa.article_idx FROM archive ar, archiveArticle aa WHERE ar.user_idx = ? AND ar.archive_idx = aa.archive_idx ' +
			'AND aa.article_idx NOT IN (SELECT `read`.article_idx FROM `read` WHERE `read`.user_idx = ?)';
		const getAllUserIdxResult = await db.queryParam_Arr(getAllUserIdxQuery, [1]);
		var resultArr = [],
			userResult = [],
			articleResult = [];
		for (let i = 0, j = 0; i < getAllUserIdxResult.length; i++) {
			const getNotReadArticleIdxResult = await db.queryParam_Arr(getNotReadArticleIdxQuery, [getAllUserIdxResult[i].user_idx, getAllUserIdxResult[i].user_idx]);
			if (getNotReadArticleIdxResult.length != 0) {
				// console.log(getAllUserIdxResult[i]);
				// console.log(getNotReadArticleIdxResult);
				userResult[j] = getAllUserIdxResult[i].user_idx;
				articleResult[j++] = getNotReadArticleIdxResult;
			}
		}
		let articleArr = [];
		for (let i = 0; i < userResult.length; i++) {
			for (let j = 0; j < articleResult[i].length; j++) {
				articleArr[j] = articleResult[i][j].article_idx;
			}
			const userData = {
				user_idx: userResult[i],
				isRead: false
			}
			Notification.create({
				user_idx: userData,
				article_idx: articleArr,
				notification_type: 2
			}).then((result) => {
				resultArr[i] = {
					result
				};
			});
		}
		if (!resultArr) {
			res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.NOTIFICATION_POST_FAIL));
		} else {
			res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, resMessage.NOTIFICATION_POST_SUCCESS));
		}
	} else {
		res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.NO_ARTIC_MANAGER));
	}
});

module.exports = router;
