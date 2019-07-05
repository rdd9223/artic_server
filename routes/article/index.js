var express = require('express');
var router = express.Router();

router.use('/', require('./article'));

module.exports = router;