var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const authUtils = require('../../modules/utils/authUtils');

// 카테고리 전체조회
router.get('/', async (req, res) => {
	const getAllCategoryQuery = 'SELECT * FROM category';
	const getAllCategoryResult = await db.queryParam_None(getAllCategoryQuery);

	if (!getAllCategoryResult) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.CATEGORY_SELECT_FAIL));
	} else {
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.CATEGORY_SELECT_SUCCESS, getAllCategoryResult));
	}
})

//아카이브 목록 조회
router.get('/:category_idx/archives', authUtils.isLoggedin, async (req, res) => {

	const userIdx = req.decoded.idx;
	const getNewArchiveQuery = 'SELECT ar.*  FROM archive ar INNER JOIN category ca WHERE ar.category_idx = ca.category_idx AND user_idx = 12 ORDER BY date DESC';
	const getNewArchiveResult = await db.queryParam_None(getNewArchiveQuery);
	const getNewArticleCount = 'SELECT count(article_idx) count FROM archiveArticle WHERE archive_idx = ? '; //해당 아카이브에 들어있는 아티클개수
	const getArchiveCategoryQuery = 'SELECT ca.category_title FROM category ca INNER JOIN archiveCategory ac WHERE ac.archive_idx = ? AND ac.category_idx = ca.category_idx';
	const getIsScrapedQuery = 'SELECT aa.archive_idx FROM archiveAdd aa, archiveCategory ac WHERE ac.category_idx = ? AND aa.user_idx = ?';

	// console.log(getIsScrapedResult);
	if (!getNewArchiveResult) {
		res.status(200).send(utils.successFalse(statusCode.DB_ERROR, resMessage.ARCHIVE_LIST_FAIL));
	} else {
		if (getNewArchiveResult.length == 0) {
			res.status(200).send(utils.successFalse(statusCode.NO_CONTENT, resMessage.ARCHIVE_NO));
		} else {
			for (var i = 0, archive; archive = getNewArchiveResult[i]; i++) {
				const archiveIdx = archive.archive_idx;
				const archiveCount = await db.queryParam_Arr(getNewArticleCount, [archiveIdx])
				archive.article_cnt = archiveCount[0].count
				const archiveCategoryResult = await db.queryParam_Arr(getArchiveCategoryQuery, [archiveIdx]) // 스트레스 ,, 
				archive.category_all = archiveCategoryResult
				const getIsScrapedResult = await db.queryParam_Arr(getIsScrapedQuery, [req.params.category_idx, userIdx]);
				
				for (var j = 0; j < getIsScrapedResult.length; j++) {
					if (archiveIdx != getIsScrapedResult[j].archive_idx) {
						archive.scrap = false;
					} else {
						archive.scrap = true;
					}
				}
			}
		}
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.ARCHIVE_LIST_SUCCESS, getNewArchiveResult));
	}
});

module.exports = router;