var express = require('express');
var router = express.Router();

const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const utils = require('../../modules/utils/utils');

const notification = require('../../modules/mongo/notificationSchema'); //코드에 쓸 스키마 가져오기
//mongoose promise지원

router.get('/', async (req, res) => {
    //오름차순 = 1, 내림차순 = -1
    notification.find().sort({ date: -1 })
        .then((allnotifications) => {
            res.status(statusCode.OK).send(utils.successTrue(statusCode.CREATED, resMessage.READ_FAIL, allnotifications));
        }).catch((err) => {
            res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.READ_FAIL));
    });
})

router.get('/:user', async (req,res)=>{
	notification.find({
		category: req.params.category
	})
	.then((notifications) => console.log(notifications))
	.catch((err) => console.log(err));
})

router.post('/', async(req, res) => {
	//아티클저장 - 인서트 id가 아티클 id
	//아카이브 인덱스를 좋아요하는 유저들 idx뽑아와
	//index가지고 있는걸 배열로 저장
	//알림 타입 지정
	//제이슨으로 저장(몽고디비)
	const getArticleQuery = 'SELECT article_idx FROM article';
	const getArticleResult = await db.queryParam_None(getArticleQuery);

	const article_idx = getArticleResult;

	const getUserQuery = 'SELECT user_idx FROM user';
	const getUserReselt = await db.queryParam_None(getUserQuery);
	const user_idx = [];

	for(let i=0; i<getUserReselt.length; i++){
		user_idx[i] = getUserReselt[i];
	}

	const insertTypeQuery = 'INSERT INTO '
	notification.create(req.body)
	.then((result) => {
		res.status(statusCode.OK).send(utils.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS, result));
	}).catch((err) => {
		res.status(statusCode.OK).send(utils.successTrue(statusCode.DB_ERROR, resMessage.SAVE_FAIL));
	});
});

module.exports = router;
