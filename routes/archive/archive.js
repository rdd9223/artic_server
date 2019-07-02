var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');

// 아티클 등록
router.post('/:archive_idx/article', async(req, res) => {
    let articleIdx = req.params.archive_idx
    let title = req.body.article_title
    let thumnail = req.body.thumnail
    let link = req.body.link

    let addArticleQuery = 'INSERT INTO article (article_title, thumnail, link, date)  VALUES (?, ?, ?, NOW())'
    let result = await db.queryParam_Arr(addArticleQuery, [title, thumnail, link])
    // let result = await db.queryParam_Arr(addArticleQuery, [articleResult])

    if(result === undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE))
    }else if(result == undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE))
    }else {
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.ADD_ARTICLE_SUCCESS))
    }
})

// 아티클 목록 (신규 순)
router.get('/:archive_idx/article', async (req, res) => {
    let archiveIdx = req.params.archive_idx
    let getArticlesQuery = 'SELECT a.* FROM artic.archiveArticle aa INNER JOIN artic.article a ON aa.article_idx = a.article_idx WHERE aa.archive_idx = ? ORDER BY date DESC'
    let result = await db.queryParam_Arr(getArticlesQuery, [archiveIdx])

    if(result === undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE))
    } else if(result == undefined) {
        res.status(200).send(utils.successFalse(statusCode.BAD_REQUEST, resMessage.NULL_VALUE))
    }
    else {
        res.status(200).send(utils.successTrue(statusCode.OK, resMessage.LIST_ARTICLE_SUCCESS, result))
    }

})

module.exports = router;
