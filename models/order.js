var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CounterSchema = new Schema({
	_id: { type: String, require: true, default: 'counter' },
	seq: { type: Number, require: true, default: 0 }
});

var Counter = mongoose.model('Counter', CounterSchema);

var OrderSchema = new Schema({
	_userid: { type: Schema.Types.ObjectId, ref: 'User' },
	_file: { type: Schema.Types.ObjectId, ref: 'UploadFile' },
	orderid: { type: Number, require: true },
	hours: Number,
	price: Number,
	discount: Number,
	status: { type: String, default: 'New' },
	note: String,
	timestamp: { type: Date, default: Date.now }
});

OrderSchema.pre('save', function(next){
	var order = this;
	Counter.findByIdAndUpdate('counter', { $inc: { seq: 1 } }, { new: true, upsert: true }, function(err, counter){
		if(err) return next(err);
		order.orderid = counter.seq;
		next();
	});
});

module.exports = mongoose.model('Order', OrderSchema);
