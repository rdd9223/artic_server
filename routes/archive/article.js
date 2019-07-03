var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const jwt = require('../../modules/jwt');

router.post('/:article_idx/history', async (req, res) => {
    const articleIdx = req.params.article_idx;
    
    // 임의, 토큰처리 필요!!
    const userIdx = 2; 
    const addReadQuery = 'INSERT INTO artic.read (user_idx, article_idx) VALUES (?, ?)';
    const readResult = await db.queryParam_Arr(addReadQuery, [userIdx, articleIdx]);

    if(readResult === undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.READ_ARTICLE_FAIL));
    } else {
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.READ_ARTICLE_SUCCESS));
    }
});

// 아티클 수정 + 링크 -> 썸네일 크롤링 추가해야함
router.put('/:article_idx', async (req, res) => {
    const articleIdx = req.params.article_idx;
    const articleTitle = req.body.article_title;
    const articleLink = req.body.link;
    
    const selectArticleQuery = 'SELECT * FROM article WHERE article_idx = ?';
    const updateArticleQuery = 'UPDATE article SET article_title = ? , link = ? WHERE article_idx = ?';
    
    const selectArticleResult = await db.queryParam_Arr(selectArticleQuery, [articleIdx]);

    if(selectArticleResult.length == 0) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_ARTICLE));
    } else {
        const updateArticleResult = await db.queryParam_Arr(updateArticleQuery, [articleTitle, articleLink, articleIdx]);

        if(updateArticleResult === undefined) {
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.UPDATE_ARTICLE_FAIL));
        } else {
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.UPDATE_ARTICLE_SUCCESS));
        }
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



module.exports = router;
