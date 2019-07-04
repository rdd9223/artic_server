const jwt = require('../jwt');
const resMessage = require('./responseMessage');
const statusCode = require('./statusCode');
const util = require('./utils');

const authUtil = {
	isLoggedin: async (req, res, next) => {
		var token = req.headers.token;

		if(!token){
			return res.json(util.successFalse(statusCode.BAD_REQUEST, resMessage.EMPTY_TOKEN));
		} else {
			const user = jwt.verify(token);

			if(user == -3){
				return res.json(util.successFalse(statusCode.UNAUTHORIZED, resMessage.EXPRIED_TOKEN));
			}else if (user == -2){
				return res.json(util.successFalse(statusCode.UNAUTHORIZED, resMessage.INVALID_TOKEN));
			}else{ 
				req.decoded = user;
				next();
			}
		}
	},
	checkLogin: async (req, res, next)=>{
		var token = req.headers.token;

		if(!token){
			req.decoded = "NL";
			next();
		}else{
			const user = jwt.verify(token);
			console.log(user);

			if(user == -3){
				return res.json(util.successFalse(statusCode.UNAUTHORIZED, resMessage.EXPRIED_TOKEN));
			}else if (user == -2){
				return res.json(util.successFalse(statusCode.UNAUTHORIZED, resMessage.INVALID_TOKEN));
			}else{
				req.decoded = user;
				next();
			}
		}
	}
};

module.exports = authUtil;