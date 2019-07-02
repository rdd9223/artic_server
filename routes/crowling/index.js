var express = require('express');
var router = express.Router();

router.use('/', require('./crowling'));

module.exports = router;