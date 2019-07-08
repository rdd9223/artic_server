const mongoose = require('mongoose');
var moment = require('moment');
require('moment-timezone');

moment.tz.setDefault("Asia/Seoul");

const searchWordSchema = new mongoose.Schema({
    keyword: { type: String, required: true},
}, {
    versionKey: false,
});

searchWordSchema.statics.findByKeyword = function(keyword) {
    return this.find({'keyword' : keyword});
};

//특정 동작 이전에 어떤 작업을 실행할 것인지 지: pre
searchWordSchema.pre('save', function() {
    //도큐먼트 저장 내용 최종 검증 시 사용
    if (!this.date) this.date = moment().format('YYYY-MM-DD HH:mm:ss');
});

module.exports = mongoose.model('searchWord', searchWordSchema);