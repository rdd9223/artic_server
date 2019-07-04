var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const jwt = require('../../modules/jwt');
const PythonShell = require('python-shell');

// 아티클 등록
router.post('/:archive_idx/article', async (req, res) => {
    let archiveIdx = req.params.archive_idx
    let url = req.body.url

    const promisePython = function (results) {
        return new Promise((resolve, reject) => {
            if (results == undefined) {
                reject("false");
            } else {
                resolve("true");
            }
        });
    }
    //크롤링
    var options = {
        mode: 'text',
        pythonPath: '',
        //서버 경로 /usr/bin/python3
        pythonOptions: ['-u'],
        scriptPath: __dirname,
        args: [url]
    };
    let selectArchiveQuery = 'SELECT * FROM archive WHERE archive_idx = ?';
    //let addArticleQuery = 'INSERT INTO article (article_title, thumnail, link)  VALUES (?, ?, ?';
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
            //const addArticleResult = await connection.query(addArticleQuery, [title, thumnail, link]);
            //const articleIdx = addArticleResult.insertId;

            const selectArticleIdx = 'SELECT article_idx FROM article ORDER BY article_idx DESC LIMIT 1';
            const selectArticleIdxResult = await db.queryParam_None(selectArticleIdx);
            const articleIdx = selectArticleIdxResult[0].article_idx
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
router.get('/:archive_idx/article', async (req, res) => {
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

module.exports = router;
