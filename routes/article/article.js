var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const jwt = require('../../modules/jwt');
const PythonShell = require('python-shell');
const authUtils = require('../../modules/utils/authUtils')
var moment = require('moment');
require('moment-timezone');

// 아티클 등록
router.post('/:archive_idx', async (req, res) => {
    let archiveIdx = req.params.archive_idx
    let url = req.body.url
    //크롤링
    var options = {
        mode: 'text',
        pythonPath: '',
        //서버 올린 후 경로 수정 -> /usr/bin/python3
        pythonOptions: ['-u'],
        scriptPath: __dirname,
        args: [url]
    };
    let selectArchiveQuery = 'SELECT * FROM archive WHERE archive_idx = ?';
    let addArchiveArticleQuery = 'INSERT INTO archiveArticle (article_idx, archive_idx)  VALUES (?, ?)';
    let archiveResult = await db.queryParam_Arr(selectArchiveQuery, [archiveIdx]);

    if (archiveResult.length == 0) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_ARCHIVE));
    } else {
        function python() {
            return new Promise((resolve, reject) => {
                PythonShell.PythonShell.run('dbconfig.py', options, function (err, results) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('results: %j', results);
                        resolve(results);
                    }
                });
            })
        }
        await python();
        const insertTransaction = await db.Transaction(async (connection) => {
            const selectArticleIdx = 'SELECT article_idx FROM article ORDER BY article_idx DESC LIMIT 1';
            const selectArticleIdxResult = await db.queryParam_None(selectArticleIdx);
			const articleIdx = selectArticleIdxResult[0].article_idx
			//알림
            console.log(selectArticleIdxResult[0].article_idx);
            const addArchiveArticleResult = await connection.query(addArchiveArticleQuery, [articleIdx, archiveIdx]);
        });
        if (insertTransaction === undefined) {
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ADD_ARTICLE_FAIL));
        } else {
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.ADD_ARTICLE_SUCCESS));
        }

    }
});

// 아티클 목록 (신규 순)
router.get('/:archive_idx', async (req, res) => {
    let archiveIdx = req.params.archive_idx;
    let getArticlesQuery = 'SELECT a.* FROM archiveArticle aa INNER JOIN article a ON aa.article_idx = a.article_idx WHERE aa.archive_idx = ? ORDER BY date DESC';
    let getLikeCntQuery = 'SELECT COUNT(article_idx) cnt FROM artic.like WHERE article_idx = ?';
    let selectArchiveQuery = 'SELECT * FROM archive WHERE archive_idx = ?';

    let archiveResult = await db.queryParam_Arr(selectArchiveQuery, [archiveIdx]);

    if (archiveResult.length == 0) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_ARCHIVE));
    } else {
        let articleListResult = await db.queryParam_Arr(getArticlesQuery, [archiveIdx]);
        // 토큰 받아서 like 유무 체크 필요
        // try {
        //     const decodedToken = jwt.verify(req.headers.token);
        //     console.log(decodedToken);

        //     if (decodedToken.grade == 0) {
        //         res.status(200).send(utils.successFalse((statusCode.BAD_REQUEST, resMessage.NO_SELECT_AUTHORITY)));
        //     } else {
        //         res.status(200).send(utils.successTrue((statusCode.OK, resMessage.USER_SELECTED)));
        //     }
        // } catch (err) {
        //     console.log(err);
        // }
        if (articleListResult === undefined) {
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.LIST_ARTICLE_FAIL));
        } else {
            for (var i = 0, article; article = articleListResult[i]; i++) {
                let articleIdx = article.article_idx;
                let likeCntResult = await db.queryParam_Arr(getLikeCntQuery, [articleIdx]);

                if (likeCntResult === undefined) {
                    res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_LIKE_CNT));
                } else {
                    article.like_cnt = likeCntResult[0].cnt;
                }
            }
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.LIST_ARTICLE_SUCCESS, articleListResult));
        }
    }
})

// 아티클 읽기
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
router.post('/:article_idx/like', async (req, res) => {
    const articleIdx = req.params.article_idx;
    
    // 임의, 토큰처리 필요!!
    const userIdx = 2; 
    const getLikeCntQuery = 'SELECT * FROM like WHERE user_idx = ?, article_idx = ?';
    const insertLikeQuery = 'INSERT INTO like (user_idx, article_idx) VALUES (?, ?)';
    const deleteLikeQuery = 'DELETE FROM like WHERE user_idx = ?, article_idx = ?';

    const getLikeResult = await db.queryParam_Arr(getLikeCntQuery, [userIdx, articleIdx]);

    if(getLikeResult.length == 0) {
        const insertLikeResult = await db.queryParam_Arr(insertLikeQuery, [userIdx, articleIdx]);
        if(insertLikeResult === undefined) {
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.LIKE_ARTICLE_FAIL));
        } else {
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.LIKE_ARTICLE_SUCCESS));
        }
    } else {
        const deleteLikeResult = await db.queryParam_Arr(deleteLikeQuery, [userIdx, articleIdx]);
        if(deleteLikeResult === undefined) {
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.UNLIKE_ARTICLE_FAIL));
        } else {
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.UNLIKE_ARTICLE_SUCCESS));
        }

    }
});

module.exports = router;
