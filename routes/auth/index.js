var express = require('express');
var router = express.Router();

router.use('/signin', require('./signin'));
router.use('/signup', require('./signup'));
router.use('/passportTest', require('./passportTest'));

module.exports = router;