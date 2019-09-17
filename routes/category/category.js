var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const authUtils = require('../../modules/utils/authUtils');

// 카테고리 전체조회
router.get('/', async (req, res) => {
	const getAllCategoryQuery = 'SELECT * FROM category WHERE category_idx > 1';
	const getAllCategoryResult = await db.queryParam_None(getAllCategoryQuery);

	if (!getAllCategoryResult) {
		res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.CATEGORY_SELECT_FAIL));
	} else {
		console.log("헤이헤이")
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.CATEGORY_SELECT_SUCCESS, getAllCategoryResult));
	}
})

//아카이브 목록 조회 
router.get('/:category_idx/archives', authUtils.isLoggedin, async (req, res) => {

	const userIdx = req.decoded.idx;
	const category_idx = req.params.category_idx
	const getNewArchiveQuery = 'SELECT ac.* FROM archive ac, category ca WHERE ca.category_idx = ? AND ac.category_idx = ? AND ac.user_idx = 1 ORDER BY date DESC';
	const getNewArchiveResult = await db.queryParam_Arr(getNewArchiveQuery, [category_idx, category_idx]);
	const getNewArticleCount = 'SELECT count(article_idx) count FROM archiveArticle WHERE archive_idx = ? '; //해당 아카이브에 들어있는 아티클개수
	const getArchiveCategoryQuery = 'SELECT ca.category_title FROM category ca INNER JOIN archiveCategory ac WHERE ac.archive_idx = ? AND ac.category_idx = ca.category_idx';
	const getIsScrapedQuery = 'SELECT aa.archive_idx FROM archiveAdd aa, archiveCategory ac WHERE aa.archive_idx = ac.archive_idx AND ac.archive_idx = ? AND aa.user_idx = ?';
	//한 아카이브에서 스크랩이 2개 되었을 때 처리를 안해w
	console.log(getNewArchiveResult);
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
				const getIsScrapedResult = await db.queryParam_Arr(getIsScrapedQuery, [archiveIdx, userIdx]);
				archive.archive_title = getNewArchiveResult[i].archive_title;
			if (getIsScrapedResult[0] == undefined) {
				archive.scrap = false;
			} else {
				if(archiveIdx == getIsScrapedResult[0].archive_idx){
					archive.scrap = true;
				} else {
					archive.scrap = false;
				}
			}
					
			}
		}
		res.status(200).send(utils.successTrue(statusCode.OK, resMessage.ARCHIVE_LIST_SUCCESS, getNewArchiveResult));
	}
});

module.exports = router;