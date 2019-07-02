var express = require('express');
var router = express.Router();
const defaultRes = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const upload = require('../../config/multer');
const {PythonShell} = require('python-shell');

  
// 크롤링 연습
router.get('/', async(req,res)=>{
    console.log('welcome');
	var options = {
    mode: 'text',
    pythonPath: '',
    pythonOptions: ['-u'],
    scriptPath: '',
    args: []
  };
  const pyroute = __dirname +  '\dbconfig.py';
  
  PythonShell.run(pyroute, options, function (err, results) {
    if (err) throw err;
    console.log('results: %j', results);
  });

});

module.exports = router;