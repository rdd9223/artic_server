var express = require('express');
var router = express.Router();

const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const utils = require('../../modules/utils/utils');

//boardSchema.js 에서 만들어진 board 모델 (모델은 대부분 대문자로 시작)
const notification = require('../../modules/mongo/notification'); //코드에 쓸 스키마 가져오기
//mongoose promise지원

router.get('/', async (req, res) => {
    //오름차순 = 1, 내림차순 = -1
    notification.find().sort({ date: -1 })
        .then((allnotifications) => {
            res.status(statusCode.OK).send(utils.successTrue(statusCode.CREATED, resMessage.READ_FAIL, allBoards));
        }).catch((err) => {
            res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.READ_FAIL));
    });
})


module.exports = router;
