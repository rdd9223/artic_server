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
require('moment-timezone');

// 아티클 등록
router.post('/:archive_idx/article', async (req, res) => {
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
});
//아카이브 삭제
router.delete('/:archive_idx', authUtils.isLoggedin, async (req, res) => {
    const idx = req.params.archive_idx;
    const user_idx = req.decoded.idx;
    const deleteArchive = 'DELETE FROM archive WHERE archive_idx = ? AND user_idx = ?';
    const deleteArchiveResult = await db.queryParam_Parse(deleteArchive, [idx, user_idx]);

    if (deleteArchiveResult.length == 0) {
        res.status(200).send(utils.successFalse(statusCode.NO_CONTENT, resMessage.NOT_FIND_ARTICLE));
    } else {
        if (deleteArchiveResult === undefined) {
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.DELETE_ARCHIVE_FAIL));
        } else {
            res.status(200).send(utils.successTrue(statusCode.OK, resMessage.DELETE_ARCHIVE_SUCCESS));
        }
    }
});

module.exports = router;
