var express = require('express');
var router = express.Router();
const defaultRes = require('../../modules/utils/utils');
const statusCode = require('../../modules/utils/statusCode');
const resMessage = require('../../modules/utils/responseMessage');
const db = require('../../modules/pool');
const upload = require('../../config/multer');
const PythonShell = require('python-shell');

  
// 크롤링 연습
router.post('/', async(req,res)=>{
  const url = req.body.url

  console.log('welcome');
	var options = {
    mode: 'text',
    pythonPath: '',
    //서버 경로 /usr/bin/python3
    pythonOptions: ['-u'],
    scriptPath: __dirname,
    args: [url]
  };
  
  PythonShell.PythonShell.run('dbconfig.py', options, function (err, results) {
    if (err) console.log('err');
    console.log('results: %j', results);
  });

});

module.exports = router;