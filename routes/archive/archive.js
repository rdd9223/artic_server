var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const jwt = require('../../modules/jwt');
const PythonShell = require('python-shell');
const authUtils = require('../../modules/utils/authUtils');
const Notification = require('../../models/notificationSchema');
const aws = require('aws-sdk');
const upload = require('../../config/multer')
var moment = require('moment');
const crawlingoption = require('../../modules/crawling/crawlingoption')
require('moment-timezone');

//아카이브 등록
router.post('/', upload.single('img'), authUtils.isLoggedin, async (req, res) => {
    const user_idx = req.decoded.idx;
    const archive_title = req.body.title;
    const archive_img = req.file.location;
    const categorymain_idx = req.body.category_main;
    const categorysub_idx = req.body.category_sub;
    const date = moment().format('YYYY-MM-DD HH:mm:ss');

    if (user_idx != 12) {
        res.status(200).send(utils.successFalse(statusCode.FORBIDDEN, resMessage.NO_DELETE_AUTHORITY))
    } else {
        if (!archive_title || !archive_img || !categorymain_idx) {
            res.status(200).send(utils.successFalse(statusCode.SERVICE_UNAVAILABLE, resMessage.REGISTER_ARCHIVE_UNOPENED));
        } else {
            const archiveRegister = await db.Transaction(async (connection) => {
                const InsertArchive1 = 'INSERT INTO archive (user_idx, archive_title, date, archive_img, category_idx) VALUES (?, ?, ?, ?, ?)';
                const InsertArchiveResult1 = await connection.query(InsertArchive1, [user_idx, archive_title, date, archive_img, categorymain_idx]);
                console.log("0");
                const archiveIdx = InsertArchiveResult1.insertId
                const InsertAchiveCategory1 = 'INSERT INTO archiveCategory (archive_idx, category_idx) VALUES (?, ?)';
                const InsertArchiveCategoryResult1 = await connection.query(InsertAchiveCategory1, [archiveIdx, categorymain_idx]);
                console.log("2");
                if(categorysub_idx != undefined) {
                    const InsertArchiveCategoryResult2 = await connection.query(InsertAchiveCategory1, [archiveIdx, categorysub_idx]);
                }
                console.log("1");
            });
            if (!archiveRegister) {
                res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.REGISTER_ARCHIVE_FAIL));
            } else {
                res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.REGISTER_ARCHIVE_SUCCESS));
            }
        }
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

// 아티클 등록
router.post('/:archive_idx/article', authUtils.isLoggedin, async (req, res) => {
    const user_idx = req.decoded.idx;
    const archiveIdx = req.params.archive_idx
    const url = req.body.url

    if (user_idx != 12) {
        res.status(200).send(utils.successFalse(statusCode.FORBIDDEN, resMessage.ARTICLE_NO_ADD_AUTH))
    } else {
        //크롤링
        // var options = {
        //     mode: 'text',
        //     pythonPath: '',
        //     //서버 올린 후 경로 수정 -> /usr/bin/python3
        //     pythonOptions: ['-u'],
        //     scriptPath: __dirname,
        //     args: [url]
        // };
        const selectArchiveQuery = 'SELECT * FROM archive WHERE archive_idx = ?'; //아카이브 idx가져오기
        const selectArchiveResult = await db.queryParam_Arr(selectArchiveQuery,[archiveIdx]);

        if (selectArchiveResult.length == 0) {
            res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_ARCHIVE));
        } else {
            function python() {
                return new Promise((resolve, reject) => {
                    PythonShell.PythonShell.run('dbconfig.py', crawlingoption(url), function (err, results) {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('results: %j', results);
                            resolve(results);
                        }
                    });
                })
            }
            await python(url);
            const insertTransaction = await db.Transaction(async (connection) => {
                const selectArticleIdx = 'SELECT article_idx FROM article ORDER BY article_idx DESC LIMIT 1';
                const selectArticleIdxResult = await connection.query(selectArticleIdx);
                const articleIdx = selectArticleIdxResult[0].article_idx
                console.log(selectArticleIdxResult[0].article_idx);
                const addArchiveArticleQuery = 'INSERT INTO archiveArticle (article_idx, archive_idx) VALUES (?, ?)'; //아카이브아티클
                const addArchiveArticleResult = await connection.query(addArchiveArticleQuery, [articleIdx, archiveIdx]);
				// 새 아티클 알림
				const getAddArchiveUserQuery = 'SELECT user_idx FROM archiveAdd WHERE archive_idx = ?';
				const getAddArchiveUserResult = await db.queryParam_Arr(getAddArchiveUserQuery, [archiveIdx]);

				Notification.create({
					user_idx: getAddArchiveUserResult,
					article_idx: articleIdx,
					notification_type: 0
				}).then((result) => {
					res.status(statusCode.OK).send(utils.successTrue(statusCode.CREATED, resMessage.SAVE_SUCCESS, result));
				}).catch((err) => {
					res.status(statusCode.OK).send(utils.successFalse(statusCode.DB_ERROR, resMessage.SAVE_FAIL));
				});;
			});
			if (insertTransaction === undefined) {
				res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ADD_ARTICLE_FAIL));
			} else {
				res.status(200).send(utils.successTrue(statusCode.OK, resMessage.ADD_ARTICLE_SUCCESS));
			}

		}
	}

});

// 아티클 목록 (신규 순)
router.get('/:archive_idx/articles', authUtils.isLoggedin, async (req, res) => {
	const userIdx = req.decoded.idx;
	const archiveIdx = req.params.archive_idx;
	const getArticlesQuery = 'SELECT a.* FROM archiveArticle aa INNER JOIN article a ON aa.article_idx = a.article_idx WHERE aa.archive_idx = ? ORDER BY date DESC';
	const getLikeCntQuery = 'SELECT COUNT(article_idx) cnt FROM artic.like WHERE article_idx = ?';
	const getLikeCheckQuery = 'SELECT * FROM artic.like WHERE user_idx = ? AND article_idx = ?';
	const selectArchiveQuery = 'SELECT * FROM archive WHERE archive_idx = ?';

	const archiveResult = await db.queryParam_Arr(selectArchiveQuery, [archiveIdx]);

	if (archiveResult.length == 0) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_ARCHIVE));
	} else {
		const articleListResult = await db.queryParam_Arr(getArticlesQuery, [archiveIdx]);

		if (articleListResult === undefined) {
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.LIST_ARTICLE_FAIL));
		} else {
			for (var i = 0, article; article = articleListResult[i]; i++) {
				const articleIdx = article.article_idx;
				const likeCntResult = await db.queryParam_Arr(getLikeCntQuery, [articleIdx]);
				const likeCheckResult = await db.queryParam_Arr(getLikeCheckQuery, [userIdx, articleIdx]);

				if (likeCntResult === undefined || likeCheckResult === undefined) {
					res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_LIKE_INFO));
				} else {
					if (likeCheckResult.length == 0) {
						article.like = false;
					} else {
						article.like = true;
					}
					article.like_cnt = likeCntResult[0].cnt;
				}
			}
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.LIST_ARTICLE_SUCCESS, articleListResult));
		}
	}
});

// 아티클 담기
router.post('/:archive_idx/article/:article_idx', authUtils.isLoggedin, async (req, res) => {
	console.log(10)
	const articleIdx = req.params.article_idx;
	const archiveIdx = req.params.archive_idx;
	const userIdx = req.decoded.idx;
	const selectArchiveQuery = 'SELECT * FROM archive WHERE archive_idx = ? AND user_idx = ?';
	const insertArticleQuery = 'INSERT INTO archiveArticle (article_idx, archive_idx) VALUES (?, ?)';

	const selectArchiveResult = await db.queryParam_Arr(selectArchiveQuery, [archiveIdx, userIdx]);

	if (selectArchiveResult === undefined) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_ARCHIVE));
	} else if (selectArchiveResult == 0) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_ARCHIVE_OWNER));
	} else {
		const insertArticleResult = await db.queryParam_Arr(insertArticleQuery, [articleIdx, archiveIdx]);
		if (insertArticleResult === undefined) {
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.SCRAP_ARTICLE_FAIL));
		} else {
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.SCRAP_ARTICLE_SUCCESS));
		}
	}
});

module.exports = router;
