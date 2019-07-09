var express = require('express');
var router = express.Router();
const db = require('../../modules/pool');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const utils = require('../../modules/utils/utils');
const authUtils = require('../../modules/utils/authUtils');
const Notification = require('../../models/notificationSchema'); //코드에 쓸 스키마 가져오기
// mongoose promise지원

// notification type code
// newArticle = 0
// recommend = 1
// notRead = 2

// newArticle code --> route/archive/:archive_idx/article
router.get('/', authUtils.isLoggedin, async (req, res) => {
	const userIdx = req.decoded.idx
	//오름차순 = 1, 내림차순 = -1

    Notification.findByNotification(userIdx)
        .then((notifications) => {
			console.log(notifications)
            //res.status(statusCode.OK).send(utils.successTrue(statusCode.CREATED, resMessage.READ_FAIL, allNotifications));
        }).catch((err) => {
			console.log(err)
            //res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.READ_FAIL));
    });
})

router.post('/', async(req, res) => {
	//아티클저장 - 인서트 id가 아티클 id
	//아카이브 인덱스를 좋아요하는 유저들 idx뽑아와
	//index가지고 있는걸 배열로 저장
	//알림 타입 지정 insert type
	//제이슨으로 저장(몽고디비)
	const getArticleQuery = 'SELECT article FROM article';
	const getArticleResult = await db.queryParam_None(getArticleQuery);

	const article_idx = getArticleResult;

	const getUserQuery = 'SELECT user_idx FROM user';
	const getUserReselt = await db.queryParam_None(getUserQuery);
	const user_idx = [];

	for(let i=0; i<getUserReselt.length; i++){
		user_idx[i] = getUserReselt[i];
	}

	//const insertTypeQuery = 'INSERT INTO '
	notification.create(req.body)
	.then((result) => {
		res.status(statusCode.OK).send(utils.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS, result));
	}).catch((err) => {
		res.status(statusCode.OK).send(utils.successTrue(statusCode.DB_ERROR, resMessage.SAVE_FAIL));
	});
});

module.exports = router;
// 담기한 아카이브에서 새로운 글 등록시 알림
// 추천
// 아카이브 담은것중에 안읽은거  읽었느지