var express = require('express');
var router = express.Router();

router.use('/auth', require('./auth/index'));
// router.use('/category', require('./category/index'));
// router.use('/home', require('./home/index'));
// router.use('/search', require('./search/index'));
// router.use('/archive', require('./archive/index'));
// router.use('/mypage', require('./mypage/index'));
router.use('/notification', require('./notification/index'));

module.exports = router;