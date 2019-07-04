var express = require('express');
var router = express.Router();

router.use('/archive', require('./archive'));
router.use('/article', require('./article'));

module.exports = router;