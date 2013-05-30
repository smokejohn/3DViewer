
/*
 * GET 
 */

exports.list = function(req, res){
  res.render('users', { title: "Users"});
};

exports.signup = function(req, res){
	res.render('signup', { title: "SignUp"});
};

exports.signin = function(req, res){
	res.render('signin', { title: "SignIn"});
};

/*
 * POST 
 */

exports.register = function(req, res){
	res.send("trololl");
};

exports.login = function(req, res){
	
};