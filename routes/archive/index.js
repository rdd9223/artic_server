var express = require('express');
var router = express.Router();

router.use('/', require('./archive'));
router.use('/article', require('../article/index'));

module.exports = router;