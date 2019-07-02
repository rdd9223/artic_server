const mongoose = require('mongoose');
var moment = require('moment');
require('moment-timezone');

moment.tz.setDefault("Asia/Seoul");

//배열 숫자 다 가능
const boardSchema = new mongoose.Schema({
    title: { type: String, required: true},
    content: { type: String, required: true},
    writer: { type: String, required: true},
    date: Date,
    hits: { type: Number, default: 0},
    category: { type: Array, default: []},
    comments: { type: Array, default: []},
}, {
    versionKey: false,
});

//this를 바인딩하지 못하기 때문에 화살표함수 쓰면 안됨
boardSchema.statics.findByCategory = function(category) {
    return this.find({'category' : category});
};

//특정 동작 이전에 어떤 작업을 실행할 것인지 지: pre
boardSchema.pre('save', function() {
    //도큐먼트 저장 내용 최종 검증 시 사용
    if (!this.date) this.date = moment().format('YYYY-MM-DD HH:mm:ss');
});

//model 메소드 : 첫번째 매개변수인 'name'(예제에서는 board)을 자동으로 소문자화 + 복수형으로 바꿔줌
//board -> boards 이름으로 모델이 만들어짐
//강제 개명이 싫으면 model 메소드의 세번째 인자로 원하는 이름 넣어주면 됨
module.exports = mongoose.model('Board', boardSchema);