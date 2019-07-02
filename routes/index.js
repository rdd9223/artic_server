var express = require('express');
var router = express.Router();

//router.use('/auth', require('./auth/index'));
router.use('/category', require('./category/index'));

module.exports = router;