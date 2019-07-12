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
// 관리자 아카이브 등록시 - title, img, category_main, category_sub
// 사용자 아카이브 등록시 - title, category_main
router.post('/', upload.single('img'), authUtils.isLoggedin, async (req, res) => {
	const user_idx = req.decoded.idx;
	const archive_title = req.body.title;
	let archive_img = null;
	const categorymain_idx = req.body.category_main;
	const categorysub_idx = req.body.category_sub;
	const date = moment().format('YYYY-MM-DD HH:mm:ss');

	if (user_idx != 1) {
		if (!archive_title) {
			res.status(200).send(utils.successFalse(statusCode.SERVICE_UNAVAILABLE, resMessage.REGISTER_MY_ARCHIVE_UNOPENED));
		} else {
			console.log("관리자가 아닌 사람이 아카이브 등록할때")
			const archiveRegistermy = await db.Transaction(async (connection) => {
				const InsertArchive1 = 'INSERT INTO archive (user_idx, archive_title, date, category_idx) VALUES (?, ?, ?, ?)';
				const InsertArchiveResult1 = await connection.query(InsertArchive1, [user_idx, archive_title, date, 1]);
				const archiveIdx = InsertArchiveResult1.insertId
				const InsertAchiveCategory1 = 'INSERT INTO archiveCategory (archive_idx, category_idx) VALUES (?, ?)';
				const InsertArchiveCategoryResult1 = await connection.query(InsertAchiveCategory1, [archiveIdx, 1]);
			});
			if (!archiveRegistermy) {
				res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.REGISTER_MY_ARCHIVE_FAIL));
			} else {
				res.status(200).send(utils.successTrue(statusCode.CREATED, resMessage.REGISTER_MY_ARCHIVE_SUCCESS));
			}
		}
	} else {
		console.log("관리자가 아카이브 등록할때")
		console.log(req.file)
		if (typeof req.file != "undefined") {
			console.log("Hhhhh")
			archive_img = req.file.location;
		}
		console.log("파일 받아오기 설정 했고")
		if (!archive_title || !archive_img || !categorymain_idx) {
			res.status(200).send(utils.successFalse(statusCode.SERVICE_UNAVAILABLE, resMessage.REGISTER_ARCHIVE_UNOPENED));
		} else {
			const archiveRegister = await db.Transaction(async (connection) => {
				const InsertArchive1 = 'INSERT INTO archive (user_idx, archive_title, date, archive_img, category_idx) VALUES (?, ?, ?, ?, ?)';
				const InsertArchiveResult1 = await connection.query(InsertArchive1, [user_idx, archive_title, date, archive_img, categorymain_idx]);
				const archiveIdx = InsertArchiveResult1.insertId
				const InsertAchiveCategory1 = 'INSERT INTO archiveCategory (archive_idx, category_idx) VALUES (?, ?)';
				const InsertArchiveCategoryResult1 = await connection.query(InsertAchiveCategory1, [archiveIdx, categorymain_idx]);
				if (categorysub_idx != undefined) {
					const InsertArchiveCategoryResult2 = await connection.query(InsertAchiveCategory1, [archiveIdx, categorysub_idx]);
				}
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
	if (user_idx != 1) {
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
	if (user_idx != 1) {
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

// 아카이브 스크랩
router.post('/add/:archive_idx', authUtils.isLoggedin, async (req, res) => {
	const archiveIdx = req.params.archive_idx;
	const userIdx = req.decoded.idx;

	const getAddArchiveQuery = 'SELECT * FROM archiveAdd WHERE user_idx = ? AND archive_idx = ?'
	const insertAddArchiveQuery = 'INSERT INTO archiveAdd (user_idx, archive_idx) VALUES (?, ?)';
	const deleteAddArchiveQuery = 'DELETE FROM archiveAdd WHERE user_idx = ? AND archive_idx = ?'

	const getAddArchiveResult = await db.queryParam_Parse(getAddArchiveQuery, [userIdx, archiveIdx]);
	if (getAddArchiveResult.length == 0) { //스크랩 실행
		const insertAddArchiveResult = await db.queryParam_Arr(insertAddArchiveQuery, [userIdx, archiveIdx]);
		if (!insertAddArchiveResult) {
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.INSERT_ADD_ARCHIVE_FAIL));
		} else {
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.INSERT_ADD_ARCHIVE_SUCCESS, insertAddArchiveResult));
		}
	} else { //이미 되어 있으면 테이블에서 지움
		const deleteAddArchiveResult = await db.queryParam_Arr(deleteAddArchiveQuery, [userIdx, archiveIdx]);
		if (!deleteAddArchiveResult) {
			res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.DELETE_ARCHIVE_FAIL));
		} else {
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.DELETE_ARCHIVE_SUCCESS, deleteAddArchiveResult));
		}
	}
});

// 아티클 등록
router.post('/:archive_idx/article', authUtils.isLoggedin, async (req, res) => {
	const user_idx = req.decoded.idx;
	const archiveIdx = req.params.archive_idx
	const url = req.body.url

	if (user_idx != 1) {
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
		const selectArchiveResult = await db.queryParam_Arr(selectArchiveQuery, [archiveIdx]);

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
			
			const insertTransaction = await db.Transaction(async (connection) => {
				await python(url);
				const selectArticleIdx = 'SELECT article_idx FROM article ORDER BY article_idx DESC LIMIT 1';
				const selectArticleIdxResult = await connection.query(selectArticleIdx);
				const articleIdx = selectArticleIdxResult[0].article_idx
				console.log(selectArticleIdxResult[0].article_idx);
				const addArchiveArticleQuery = 'INSERT INTO archiveArticle (article_idx, archive_idx) VALUES (?, ?)'; //아카이브아티클
				const addArchiveArticleResult = await connection.query(addArchiveArticleQuery, [articleIdx, archiveIdx]);
				// 새 아티클 알림
				//const getAddArchiveUserQuery = 'SELECT user_idx FROM archiveAdd WHERE archive_idx = ?';
				//const getAddArchiveUserResult = await db.queryParam_Arr(getAddArchiveUserQuery, [archiveIdx]);

				// for (let i = 0, userData; userData = getAddArchiveUserResult[i]; i++) {
				// 	userData.isRead = false;
				// }

				// result = await Notification.create({
				// 	user_idx: getAddArchiveUserResult,
				// 	article_idx: articleIdx,
				// 	notification_type: 0
				// });
			});

			if (insertTransaction === undefined) {
				res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ADD_ARTICLE_FAIL));
			} else {
				res.status(200).send(utils.successTrue(statusCode.OK, resMessage.ADD_ARTICLE_SUCCESS, result));
			}
		}
	}
});
//아카이브 아이디로 스크랩 여부
router.get('/:archive_idx/scrap', authUtils.isLoggedin, async (req, res) => {
	const archiveIdx = req.params.archive_idx;
	const userIdx = req.decoded.idx;

	const getIsScrapedQuery = 'SELECT archive_idx FROM archiveAdd WHERE archive_idx = ? AND user_idx = ?';
	const getIsScrapedResult = await db.queryParam_Arr(getIsScrapedQuery, [archiveIdx, userIdx]);

	if (!getIsScrapedResult) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ARCHIVE_SCRAP_FAIL));
	} else {
		if (getIsScrapedResult.length == 0) {
			res.status(200).send(utils.successTrue(statusCode.NO_CONTENT, resMessage.ARCHIVE_SCRAP_NO, {"scrap" : false}));
		} else {
			for (var i = 0, archive; archive = getIsScrapedResult[i]; i++) {
				const archiveIdx = archive.archive_idx;
				if (getIsScrapedResult[0] == undefined) {
					archive.scrap = false;
				} else {
					if (archiveIdx == getIsScrapedResult[0].archive_idx) {
						archive.scrap = true;
					} else {
						archive.scrap = false;
					}
				}
			}
			res.status(200).send(utils.successTrue(statusCode.OK, resMessage.ARCHIVE_SCRAP_SUCCESS, getIsScrapedResult[0]));
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
	const articleIdx = req.params.article_idx;
	const archiveIdx = req.params.archive_idx;
	const userIdx = req.decoded.idx;
	const selectArchiveQuery = 'SELECT * FROM archive WHERE archive_idx = ? AND user_idx = ?';
	const selectAddCheckQuery = 'SELECT * FROM archiveArticle WHERE archive_idx = ? AND article_idx = ?';
	const insertArticleQuery = 'INSERT INTO archiveArticle (article_idx, archive_idx) VALUES (?, ?)';

	const selectArchiveResult = await db.queryParam_Arr(selectArchiveQuery, [archiveIdx, userIdx]);

	const selectArchiveCnt = 'SELECT * FROM archiveArticle WHERE archive_idx = ?'
	const selectArchiveCntResult = await db.queryParam_Arr(selectArchiveCnt, [archiveIdx])

	if (selectArchiveResult === undefined) {
		// 아카이브를 찾을 수 없음
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_ARCHIVE));
	} else if (selectArchiveResult == 0) {
		// 아카이브 소유자가 아님
		res.status(202).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_ARCHIVE_OWNER));
	} else {
		const selectAddCheckResult = await db.queryParam_Arr(selectAddCheckQuery, [archiveIdx, articleIdx]);
		// 이미 담음
		if (selectAddCheckResult.length > 0) {
			res.status(202).send(utils.successTrue(statusCode.OK, resMessage.ALREADY_SCRAP_ARTICLE));
		} else if (selectAddCheckResult.length == 0) {
			const insertArticleResult = await db.queryParam_Arr(insertArticleQuery, [articleIdx, archiveIdx]);
			const getImg = 'SELECT thumnail FROM artic.article WHERE article_idx =?'
			const getImgResult = await db.queryParam_Arr(getImg, [articleIdx])
			if (selectArchiveCntResult.length == 0) {
				console.log("이름 등록하기")
				const updateArchive = 'UPDATE artic.archive SET archive_img = ? WHERE archive_idx = ?'
				const updateArchiveResult = await db.queryParam_Arr(updateArchive, [getImgResult[0].thumnail, archiveIdx])
			}
			if (insertArticleResult === undefined) {
				res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.SCRAP_ARTICLE_FAIL));
			} else {
				res.status(200).send(utils.successTrue(statusCode.OK, resMessage.SCRAP_ARTICLE_SUCCESS));
			}
		}

	}
});




module.exports = router;
