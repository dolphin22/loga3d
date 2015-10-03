var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	fullname: String,
	email: { type: String, unique: true, index: true },
	password: String,
	address: String,
	district: String,
	city: String,
	country: String,
	zipcode: String,
	printedtime: Number,
	moneyspent: Number,
	discount: Number,
	phone: String,	
	timestamp: { type: Date, default: Date.now },
	files: [{ type: Schema.Types.ObjectId, ref: 'UploadFile' }]
});

UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);