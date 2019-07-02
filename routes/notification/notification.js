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




module.exports = router;
