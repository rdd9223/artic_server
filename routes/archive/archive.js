var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const jwt = require('../../modules/jwt');
const PythonShell = require('python-shell');
const authUtils = require('../../modules/utils/authUtils')
const aws = require('aws-sdk');
const upload = require('../../config/multer')
var moment = require('moment');
require('moment-timezone');

//아카이브 등록
router.post('/', upload.single('archive_img'), authUtils.isLoggedin, async (req, res) => {
    const user_idx = req.decoded.idx;
    const archive_title = req.body.title;
    const archive_img = req.file.location;
    const category_idx = req.body.category_idx;
    const date = moment().format('YYYY-MM-DD HH:mm:ss');

    const InsertArchive = 'INSERT INTO archive (user_idx, archive_title, date, archive_img, category_idx) VALUES (?, ?, ?, ?, ?)';
    const InsertArchiveResult = await db.queryParam_Parse(InsertArchive, [user_idx, archive_title, date, archive_img, category_idx]);
    if (!archive_title || !archive_img || !category_idx) {
        res.status(200).send(utils.successFalse(statusCode.SERVICE_UNAVAILABLE, resMessage.REGISTER_ARCHIVE_UNOPENED));
    } else {
        if (!InsertArchiveResult) {
            res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.REGISTER_ARCHIVE_FAIL));
        } else {
            res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.REGISTER_ARCHIVE_SUCCESS));
        }
    }
});
//아카이브 목록 조회
router.get('/category/:category_idx', async (req, res) => {
    const idx = req.params.category_idx;
    const getArchive = 'SELECT * FROM archive WHERE category_idx = ?';
    const getArchiveResult = await db.queryParam_Arr(getArchive, [idx]);

    if (!getArchiveResult) {
        res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.ADD_ARTICLE_FAIL));
    } else {
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.ARCHIVE_LIST_SUCCESS, getArchiveResult));
    }
});
//아카이브 수정
router.put('/:archive_idx', authUtils.isLoggedin, async (req, res) => {
    const archive_idx = req.params.archive_idx;
    const user_idx = req.decoded.idx;
    const archive_title = req.body.title;
    const archive_img = req.body.img;
    const category_idx = req.body.category_idx;
    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    if (user_idx != 12) {
        res.status(200).send(utils.successFalse(statusCode.FORBIDDEN, resMessage.NO_DELETE_AUTHORITY))
    } else {
        const updateArchive = 'UPDATE archive SET archive_title = ?, date = ?, archive_img = ?, category_idx = ? WHERE user_idx = ? AND archive_idx = ?'
        const InsertArchiveResult = await db.queryParam_Parse(updateArchive, [archive_title, date, archive_img, category_idx, user_idx, archive_idx]);
        if (!archive_title || !archive_img || !category_idx) {
            res.status(200).send(utils.successFalse(statusCode.SERVICE_UNAVAILABLE, resMessage.UPDATE_ARCHIVE_UNOPENED));
        } else {
            if (!InsertArchiveResult) {
                res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.UPDATE_ARCHIVE_FAIL));
            } else {
                res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.UPDATE_ARCHIVE_SUCCESS));
            }
        }
    }
});
//아카이브 삭제
//관리자만 지울 수 있게
router.delete('/:archive_idx', authUtils.isLoggedin, async (req, res) => {
    const idx = req.params.archive_idx;
    const user_idx = req.decoded.idx;
    const getArchiveCount = await db.queryParam_Arr('SELECT COUNT(*) count FROM archive WHERE user_idx = ?', [user_idx])
    if (user_idx != 12) {
        res.status(200).send(utils.successFalse(statusCode.FORBIDDEN, resMessage.NO_DELETE_AUTHORITY))
    } else {
        const deleteArchive = 'DELETE FROM archive WHERE archive_idx = ?';
        const deleteArchiveResult = await db.queryParam_Arr(deleteArchive, [idx]);
        if (deleteArchiveResult === undefined) {
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.DELETE_ARCHIVE_FAIL));
        } else {
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.DELETE_ARCHIVE_SUCCESS));
        }
    }
});

module.exports = router;
