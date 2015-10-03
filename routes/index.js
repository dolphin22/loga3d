var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Order = require('../models/order');
var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Loga3D', user: req.user, message: req.flash('error') });
});

router.post('/', 
	passport.authenticate('local', { successRedirect: '/myfiles',
									 failureRedirect: '/',
									 failureFlash: true,
									 successFlash: 'Logged in' }),
	function(req, res) {
		res.redirect('/', { message: 'Logged in' });
});

router.get('/myfiles', 
	require('connect-ensure-login').ensureLoggedIn('/'),
	function(req, res, next){
		User.findById(req.user.id).populate('files').exec(function(err, user) {
			if (err) res.send(err);
			res.render('myfiles', { moment: moment, user: user, host: req.get('host') });
		})
});

router.get('/profile',
	require('connect-ensure-login').ensureLoggedIn('/'),
	function(req, res){
		res.render('profile', { user: req.user, title: 'My Profile' });
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

router.get('/orders', function(req, res){
	require('connect-ensure-login').ensureLoggedIn('/'),
	Order.find().populate('_file').exec(function(err, orders){
		if (err) res.send(err);
		res.render('order', { moment: moment, user: req.user, title: 'My Orders', orders: orders });
	});
});

router.get('/orders/create', function(req, res){
	require('connect-ensure-login').ensureLoggedIn('/'),
	res.render('order', { title: 'New Order' });
});

router.get('/orders/delete/:id', function(req, res){
	require('connect-ensure-login').ensureLoggedIn('/'),
	Order.findById(req.params.id).remove(function(err){
		if (err) res.send(err);
		res.redirect('/orders');
	});
});

router.get('/orders/:id', function(req, res){
	require('connect-ensure-login').ensureLoggedIn('/'),
	Order.findById(req.params.id).populate('_file').exec(function(err, order){
		if (err) res.send(err);
		res.render('orderdetail', { moment: moment, user: req.user, title: 'Order #', order: order });
	});
});

module.exports = router;
