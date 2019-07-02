var express = require('express');
var router = express.Router();

<<<<<<< HEAD
//router.use('/auth', require('./auth/index'));
=======
router.use('/auth', require('./auth/index'));
// router.use('/home', require('./home/index'));
// router.use('/search', require('./search/index'));
// router.use('/archive', require('./archive/index'));
// router.use('/mypage', require('./mypage/index'));
router.use('/notification', require('./notification/index'));
>>>>>>> 6648b3146f5124461e2bbb06becf9d8859c3cc45
router.use('/category', require('./category/index'));

module.exports = router;