var express = require('express');
var router = express.Router();
const defaultRes = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const authUtils = require('../../modules/utils/authUtils');
const upload = require('../../config/multer');

// 신규 아카이브 더보기 (최신순 정렬)
router.get('/archives/new', async (req, res) => {
	const getNewArchiveQuery = 'SELECT ar.*  FROM archive ar INNER JOIN category ca where ar.category_idx = ca.category_idx ORDER BY date DESC';
	const getNewArchiveResult = await db.queryParam_None(getNewArchiveQuery);
	const getNewArticleCount = 'SELECT count(article_idx) count FROM archiveArticle WHERE archive_idx = ? '; //해당 아카이브에 들어있는 아티클개수
	// ++
	const getArchiveCategoryQuery = 'SELECT ca.category_title FROM category ca INNER JOIN archiveCategory ac WHERE ac.archive_idx = ? AND ac.category_idx = ca.category_idx'


	if (!getNewArchiveResult) {
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		for (var i = 0, archive; archive = getNewArchiveResult[i]; i++) {
			const archiveIdx = archive.archive_idx;
			const archiveCount = await db.queryParam_Arr(getNewArticleCount, [archiveIdx])
			archive.article_cnt = archiveCount[0].count

			// ++
			const archiveCategoryResult = await db.queryParam_Arr(getArchiveCategoryQuery, [archiveIdx])
			archive.category_all = archiveCategoryResult
		}
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getNewArchiveResult));
	}
});
// 신규 아카이브 하나보기
//아카이브 제목, 아카이브 스크랩 여부 해당 아카이브의 아티클들+아티클들의 좋아요개수 +아티클들의 담기 여부
router.get('/:archive_idx', authUtils.isLoggedin, async (req, res) => {
	const userIdx = req.decoded.idx;
	const idx = req.params.archive_idx;
	const getOneNewArchiveQuery = 'SELECT * FROM archive WHERE archive_idx = ?';
	const getOneNewArchiveResult = await db.queryParam_Arr(getOneNewArchiveQuery, [idx]); ///아카이브 정보

	//해당 아카이브 아티클 조회
	const getArticles = 'SELECT at.* FROM article at, archiveArticle aa WHERE aa.archive_idx = ?'
	const getArticlesResult = await db.queryParam_Arr(getArticles, [idx]);
	//해당 아카이브 아티클의 좋아요 개수
	for(var i = 0, article; article = getArticlesResult[i]; i++){
		const articleIdx = article.article_idx;
		const getLikeCntQuery = 'SELECT COUNT(article_idx) cnt FROM artic.like WHERE article_idx = ?';
		const getLikeCheckQuery = 'SELECT * FROM artic.like WHERE user_idx = ? AND article_idx = ?';		
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

	// 스크랩 유무 체크
	const getScrapCheckQuery = 'SELECT * FROM artic.archiveAdd WHERE user_idx = ? AND archive_idx = ?';
	const scrapCheckResult = await db.queryParam_Arr(getScrapCheckQuery, [userIdx, idx]);
	if (scrapCheckResult === undefined) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ARCHIVE_SCRAP_CHECK_FAIL));
	} else {
		if (scrapCheckResult.length == 0) {
			getOneNewArchiveResult.scrap = false;
		} else {
			getOneNewArchiveResult.scrap = true;
		}
	}
	if (!getOneNewArchiveResult) {
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_NEW_FAIL));
	} else {
		getOneNewArchiveResult[0].articles = getArticlesResult;
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_NEW_SUCCESS, getOneNewArchiveResult[0]));
	}
});
// 카테고리별 아카이브 4개만 보내주기 
router.get('/category/:category_idx', async (req, res) => {
	const idx = req.params.category_idx;
	const getCategory = 'SELECT ca.category_title, ac.* FROM category ca, archive ac WHERE ca.category_idx = ? LIMIT 4';
	const getCategoryResult = await db.queryParam_Arr(getCategory, [idx]);
	const countArticle = 'SELECT count(*) count FROM archiveArticle WHERE archive_idx = ?'
	//const countArticleResult = await db.queryParam_Arr(countArticle,[getCategoryResult[0].archive_idx])
	if (!getCategoryResult) {
		res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.HOME_CATE_FAIL));
	} else if (getCategoryResult.length == 0) {
		res.status(200).send(defaultRes.successFalse(statusCode.NO_CONTENT, resMessage.HOME_CATE_EMPTY));
	} else {
		for (var i = 0, archive; archive = getCategoryResult[i]; i++) {
			const archiveIdx = archive.archive_idx;
			const archiveCount = await db.queryParam_Arr(countArticle, [archiveIdx]);
			console.log(archiveIdx);
			archive.article_cnt = archiveCount[0].count;
		}
		res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.HOME_CATE_SUCCESS, getCategoryResult));
	}
});

module.exports = router;