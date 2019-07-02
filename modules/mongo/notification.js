//보드 스키마 예ㅒ제 가져다 놓은거
//노
const mongoose = require('mongoose');
var moment = require('moment');
require('moment-timezone');

moment.tz.setDefault("Asia/Seoul");

const notificationSchema = new mongoose.Schema({
    user_idx: { type: Array, default: []}, //자동적 false
    article_idx: { type: String, required: true},
    notification_type: { type: String, required: true}
}, {
    versionKey: false, //true 면 데이터를 저장할때마자 document에 버젼이 들어감
});
//가장 많이쓰이는 statics와 pre
//this를 바인딩하지 못하기 때문에 화살표함수 쓰면 안됨
notificationSchema.statics.findByCategory = function(user_idx) {
    return this.find({'user_idx' : user_idx});
};

//특정 동작 이전에 어떤 작업을 실행할 것인지 지 (확인)
notificationSchema.pre('save', function() { 
    //도큐먼트 저장 내용 최종 검증 시 사용
    if (!this.date) this.date = moment().format('YYYY-MM-DD HH:mm:ss');
});

//model 메소드 : 첫번째 매개변수인 'name'(예제에서는 board)을 자동으로 소문자화 + 복수형으로 바꿔줌
//board -> boards 이름으로 모델이 만들어짐
//강제 개명이 싫으면 model 메소드의 세번째 인자로 원하는 이름 넣어주면 됨
module.exports = mongoose.model('notification', notificationSchema); //컬렉션은 소문자 + s 로 만들어짐. 원하지 않으면 3번째 인자로 만들어 주면 됨