var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const PythonShell = require('python-shell');
const authUtils = require('../../modules/utils/authUtils')
require('moment-timezone');


// 아티클 읽기
router.post('/:article_idx/history', authUtils.isLoggedin, async (req, res) => {
    const articleIdx = req.params.article_idx;
    const userIdx = req.decoded.idx;
    const addReadQuery = 'INSERT INTO artic.read (user_idx, article_idx) VALUES (?, ?)';
    const readResult = await db.queryParam_Arr(addReadQuery, [userIdx, articleIdx]);

    if(readResult === undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.READ_ARTICLE_FAIL));
    } else {
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.READ_ARTICLE_SUCCESS));
    }
});



// 아티클 삭제
router.delete('/:article_idx', async (req, res) => {
    const articleIdx = req.params.article_idx;
    const selectArticleQuery = 'SELECT * FROM article WHERE article_idx = ?';
    const deleteArticleQuery = 'DELETE FROM article WHERE article_idx = ?';

    const selectArticleResult = await db.queryParam_Arr(selectArticleQuery, [articleIdx]);

    if(selectArticleResult.length == 0) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_ARTICLE));
    } else {
        const deleteArticleResult = await db.queryParam_Arr(deleteArticleQuery, [articleIdx]);

        if(deleteArticleResult === undefined) {
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.DELETE_ARTICLE_FAIL));
        } else {
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.DELETE_ARTICLE_SUCCESS));
        }
    }
});

// 아티클 좋아요, 좋아요 취소
router.post('/:article_idx/like', authUtils.isLoggedin, async (req, res) => {
    console.log(0)
    const articleIdx = req.params.article_idx;
    const userIdx = req.decoded.idx;
    const getLikeCntQuery = 'SELECT * FROM artic.like WHERE user_idx = ? AND article_idx = ?';
    const insertLikeQuery = 'INSERT INTO artic.like (user_idx, article_idx) VALUES (?, ?)';
    const deleteLikeQuery = 'DELETE FROM artic.like WHERE user_idx = ? AND article_idx = ?';

    const getLikeResult = await db.queryParam_Arr(getLikeCntQuery, [userIdx, articleIdx]);

    if(getLikeResult === undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_LIKE_INFO));
        console.log(1)
    } else if(getLikeResult.length == 0) {
        const insertLikeResult = await db.queryParam_Arr(insertLikeQuery, [userIdx, articleIdx]);
        console.log(2)
        if(insertLikeResult === undefined) {
            console.log(3)
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.LIKE_ARTICLE_FAIL));
            
        } else {
            console.log(4)
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.LIKE_ARTICLE_SUCCESS));
            
        }
    } else {
        const deleteLikeResult = await db.queryParam_Arr(deleteLikeQuery, [userIdx, articleIdx]);
        console.log(5)
        if(deleteLikeResult === undefined) {
            console.log(6)
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.UNLIKE_ARTICLE_FAIL));
             
        } else {
            console.log(7)
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.UNLIKE_ARTICLE_SUCCESS));
        }
    }
});

module.exports = router;
