var express = require('express');
var router = express.Router();
const utils = require('../../modules/utils/utils');
const resMessage = require('../../modules/utils/responseMessage');
const statusCode = require('../../modules/utils/statusCode');
const db = require('../../modules/pool');
const encrytion = require('../../modules/encrytion/encrytionModule');
const jwt = require('../../modules/jwt');

// 마이페이지 조회
router.get('/', async (req, res) => {
	const getUserInfoQuery = 'SELECT * FROM user';
	const getUserInfoResult = await db.queryParam_
})