var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const authUtils = require('../../modules/utils/authUtils')
require('moment-timezone');

// 아카이브 검색
// 아카이브 제목, 스크랩 여부, 아티클 갯수, 카테고리
router.get('/archive', authUtils.isLoggedin, async (req, res) => {
    const userIdx = req.decoded.idx;
    const keyword = req.query.keyword;
    const getArchivesQuery = "SELECT distinct a.* FROM artic.archive a INNER JOIN artic.archiveCategory ac WHERE a.archive_title LIKE ? AND a.archive_idx = ac.archive_idx AND NOT ac.category_idx IN (1) ORDER BY date DESC";
    const getScrapCheckQuery = 'SELECT * FROM artic.archiveAdd WHERE user_idx = ? AND archive_idx = ?';
    const getArticleCntQuery = 'SELECT count(article_idx) count FROM archiveArticle WHERE archive_idx = ?';
    const getArchiveCategoryQuery = 'SELECT ca.category_title FROM category ca INNER JOIN archiveCategory ac WHERE ac.archive_idx = ? AND ac.category_idx = ca.category_idx';
    
    const archiveResult = await db.queryParam_Arr(getArchivesQuery, ['%'+keyword+'%']);

    if (archiveResult === undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.SEARCH_ARCHIVE_FAIL));
    } else {
        console.log(archiveResult);
        for (var i = 0, archive; archive = archiveResult[i]; i++) {
            const archiveIdx = archive.archive_idx;

            // 아티클 갯수 조회
            const archiveCntResult = await db.queryParam_Arr(getArticleCntQuery, [archiveIdx]);
            if(archiveCntResult === undefined) {
                res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ARCHIVE_ARTICLE_COUNT_FAIL));
            } else {
                archive.article_cnt = archiveCntResult[0].count;
            }

            // 스크랩 유무 체크
            const scrapCheckResult = await db.queryParam_Arr(getScrapCheckQuery, [userIdx, archiveIdx]);
            if(scrapCheckResult === undefined) {
                res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ARCHIVE_SCRAP_CHECK_FAIL));
            } else {
                if(scrapCheckResult.length == 0) {
                    archive.scrap = false;
                } else {
                    archive.scrap = true;
                }
            }

            // 아카이브 카테고리 조회
            const archiveCategoryResult = await db.queryParam_Arr(getArchiveCategoryQuery, [archiveIdx]);
            if(archiveCntResult === undefined) {
                res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.ARCHIVE_CATEGORY_FAIL));
            } else {
                archive.category_all = archiveCategoryResult;
            }
            
        }
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.SEARCH_ARCHIVE_SUCCESS, archiveResult));
    }
});

// 아카이브 검색
// 아카이브 제목, 스크랩 여부, 아티클 갯수, 카테고리
router.get('/article', authUtils.isLoggedin, async (req, res) => {
    const userIdx = req.decoded.idx;
    const keyword = req.query.keyword;
    const getArchivesQuery = "SELECT * FROM artic.article WHERE article_title LIKE ? ORDER BY date DESC";
    const getLikeCntQuery = 'SELECT COUNT(article_idx) cnt FROM artic.like WHERE article_idx = ?';
    const getLikeCheckQuery = 'SELECT * FROM artic.like WHERE user_idx = ? AND article_idx = ?';
    
    const articleListResult = await db.queryParam_Arr(getArchivesQuery, ['%'+keyword+'%']);
        
    if (articleListResult === undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.SEARCH_ARTICLE_FAIL));
    } else {
        for (var i = 0, article; article = articleListResult[i]; i++) {
            const articleIdx = article.article_idx;
            const likeCntResult = await db.queryParam_Arr(getLikeCntQuery, [articleIdx]);
            const likeCheckResult = await db.queryParam_Arr(getLikeCheckQuery, [userIdx, articleIdx]);

            if (likeCntResult === undefined || likeCheckResult === undefined) {
                res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NOT_FIND_LIKE_INFO));
            } else {
                if(likeCheckResult.length == 0) {
                    article.like = false;
                } else {
                    article.like = true;
                }
                article.like_cnt = likeCntResult[0].cnt;
            }
        }
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.SEARCH_ARTICLE_SUCCESS, articleListResult));
    }
});

// 추천 검색어
router.get('/recommendation', authUtils.isLoggedin, async (req, res) => {
    const getSearchWordQuery = 'SELECT search_word FROM artic.search WHERE search_idx IN (?,?,?,?,?,?,?,?,?)';
    const randomArr = Rand(9, 10);
    console.log(randomArr);
    const getSearchWordResult = await db.queryParam_Arr(getSearchWordQuery, randomArr);
    if(getSearchWordResult === undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.SEARCH_WORD_FAIL));
    } else {
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.SEARCH_WORD_SUCCESS, getSearchWordResult));
    }
});

function Rand(n, m) {
    var arr = Array();
    var flag = true;
    for(var i=0; i<n; i++){
        flag = true;
        var temp = Math.floor(Math.random() * m) + 1;
        for(var j=0; j<arr.length; j++){
            if (arr[j] == temp) { flag = false; }
        }
        if(flag == false) { 
            i--;
        } else {
            arr[i] = temp;
        }
    }
    return arr;
} 

module.exports = router;