
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
	, db = require('./db')
	, passport = require('passport')
	, LocalStrategy = require('passport-local').Strategy;

// PASSPORT SETUP
passport.use(new LocalStrategy(
  function(username, password, done) {
    db.User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.User.findById(id, function(err, user) {
    done(err, user);
  });
});

// EXPRESS SETUP

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
	app.use(passport.initialize());
  app.use(passport.session());
	app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

currentUser = function (req, res, next)
{
	if (req.user !== undefined)
	{
		res.locals.currentUser = req.user;
	}
	next();
}


// Get Requests
app.get('/', currentUser, routes.index);
app.get('/users', currentUser, user.list);
app.get('/uploaded', currentUser, routes.uploaded);
app.get('/threeJS', currentUser, routes.threeJS);
app.get('/user/signup', currentUser, user.signup);
app.get('/user/signin', currentUser, user.signin);
app.get('/user/logout', currentUser, function(req, res){req.logout(); res.redirect('back');});


// Post Requests
app.post('/upload', routes.upload);
app.post('/user/register', user.register);
app.post('/user/login', passport.authenticate('local', { successRedirect: '/',
																												 failureRedirect: '/user/signin' }));


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
