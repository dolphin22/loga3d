var express = require('express');
var expressSession = require('express-session');
var fs = require('fs');
var flash = require('connect-flash');
var path = require('path');
var moment = require('moment-timezone');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/loga3d');
mongoose.connect('mongodb://loga3d:loga3d@ds041643.mongolab.com:41643/loga3d');
var User = require('./models/user');
var UploadFile = require('./models/uploadfile');
var Order = require('./models/order');
var multer = require('multer');
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './uploads');
	},
	filename: function(req, file, cb) {
		var filename = file.originalname.substr(0,file.originalname.lastIndexOf('.')).split(' ').join('_');
		var extension = file.originalname.substr(file.originalname.lastIndexOf('.'));
		cb(null, filename + '_'+ Date.now() + extension);
	}
});
var upload = multer({ storage: storage });

var routes= require('./routes/index');
var user = require('./routes/user');

// authenticate users
passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	},
	function(username, password, done) {
		User.findOne({ email: username }, function(err, user) {
			if (err) { return done(err); }
			
			if (!user) {
				return done(null, false, { message: 'Incorrect username' });
			}
			
			if (user.password != password) {
				return done(null, false, { message: 'Incorrect password' });
			}
			
			return done(null, user);
		});
	}
));
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});
passport.deserializeUser(function(id, cb) {
  User.findById(id).exec(function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(function(req, res, next){
	if(req.path.split('/')[0] == 'download') res.attachment();
	next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/files', express.static(path.join(__dirname, 'uploads')));

app.use(expressSession({ secret: 'keyboard cat', resave: false, saveUninitialized: false, cookie: { maxAge: 60000 }}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/user', user);

/*
app.get('/download/:filename', function(req, res){
	var file = path.join(__dirname, 'uploads/') + req.params.filename;
	res.download(file);
});
*/

// multer
app.get('/upload/file',
	require('connect-ensure-login').ensureLoggedIn('/'),
	function(req, res){
	res.render('upload', { 'title': 'Upload file' });
})
app.post('/upload/file', 
	require('connect-ensure-login').ensureLoggedIn('/'),
	upload.single('file'),
	function(req, res, next){
		file = new UploadFile();
		file.filename = req.file.filename;
		file.originfilename = req.file.originalname;
		file.mimetype = req.file.mimetype;
		file.size = req.file.size;
		file._userid = req.user.id;
		file.save(function(err){
			if(err) res.send(err);
			User.findById(req.user.id).exec(function(err, user){
				if(err) res.send(err)
				user.files.push(file);
				user.save();
				res.redirect('/myfiles');	
			})
	})
});

app.get('/file/:action/:id',
	require('connect-ensure-login').ensureLoggedIn('/'),
	function(req, res) {
	if(req.params.action == 'delete') {
		UploadFile.findById(req.params.id).exec(function(err, file){
			if (err) res.send(err);
			fs.unlink(path.join(__dirname, 'uploads', file.filename), function(err) {
				if (err) res.send(err);
				file.remove(function(err){
					if (err) res.send(err);
					User.findById(req.user.id).exec(function(err, user){
						if (err) res.send(err);
						user.files.pull({ _id: file._id });
						user.save();
					})
					res.redirect('/myfiles');
				})
			})
		})
	} else if (req.params.action == 'print') {
		var order = new Order();
		order._userid = req.user.id;
		order._file = req.params.id;
		order.save(function(err){
			if (err) res.send(err);
			res.redirect('/orders');
		})
	} else {
		res.send('Error');
	}
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
