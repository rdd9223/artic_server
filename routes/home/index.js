var express = require('express');
var router = express.Router();

router.use('/article', require('./article'));
router.use('/archive', require('./archive'));

module.exports = router;