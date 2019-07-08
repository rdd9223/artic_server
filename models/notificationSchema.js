const mongoose = require('mongoose');
var moment = require('moment');
require('moment-timezone');

moment.tz.setDefault("Asia/Seoul");

const notificationSchema = new mongoose.Schema({
    user_idx: { type: Array, required: true},
    article_idx: { type: Number, required: true},
    notification_type: { type: String, required: true}
}, {
    versionKey: false
});

notificationSchema.statics.findByNotification = function(user_idx) {
    return this.find({
		'user_idx' : user_idx,
		// 'article_idx' : article_idx,
		// 'notification_type' : notification_type
	});
};

notificationSchema.pre('save', function() { 
    if (!this.date) this.date = moment().format('YYYY-MM-DD HH:mm:ss');
});

module.exports = mongoose.model('notification', notificationSchema);