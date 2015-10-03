var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UploadFileSchema = new Schema({
	_userid: { type: Schema.Types.ObjectId, ref: 'User' },
	filename: String,
	originfilename: String,
	mimetype: String,
	size: Number,
	timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UploadFile', UploadFileSchema);