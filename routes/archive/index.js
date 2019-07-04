var express = require('express');
var router = express.Router();

router.use('/', require('./archive'));
router.use('/', require('./article'));

module.exports = router;