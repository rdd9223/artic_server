var express = require('express');
var router = express.Router();

router.use('/', require('./archive'));

module.exports = router;