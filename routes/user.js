var express = require('express');
var router = express.Router();
var User = require('../models/user');

/*
router.route('/')
	.get(function(req, res, next) {
		User.find().sort({ 'timestamp': -1 }).exec(function(err, users) {
			if (err) res.send(err);
			res.render('user', { title: 'List Users', users: users });
		})
	});
*/
router.route('/create')
	.post(function(req, res) {
		var user = new User();
		user.fullname = req.body.fullname;
		user.email = req.body.email;
		user.password = req.body.password;
		user.save(function(err) {
			if (err) res.send(err);
			res.render('index', { message: 'User created' })
		})
	})
	.get(function(req, res, next) {
		res.render('user', { title: 'New User' });
	});
	
router.post('/update', function(req, res){
	User.findById(req.user.id).exec(function(err, user){
		if(err) res.send(err);
		user.fullname = req.body.fullname;
		user.address = req.body.address;
		user.district = req.body.district;
		user.city = req.body.city;
		user.country = req.body.country;
		user.zipcode = req.body.zipcode;
		user.phone = req.body.phone;
		user.password = req.body.password;
		user.save(function(err){
			if(err) res.send(err);
			res.render('profile', { user: user, title: 'My Profile' ,message: 'Profile updated' });
		})
	})
})

module.exports = router;
