var db = require("../db");

/*
 * GET 
 */

exports.list = function(req, res){

	var query = db.User.find();

	query.select('username email');

  query.exec(function(err, users){
		if (err)
			throw err;
		else
			res.render('users', { title: "Users", users: users });
});

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

	if( req.body.username === '' || req.body.password === '' || req.body.email === '')	
	{
		res.redirect('back');
	}
	else
	{
		var query = db.User.where('username').equals(req.body.username);
		
		query.exec(function (err, quser){
			
			if (err)
				throw err
			else if (quser[0] === undefined)
			{
				var user = new db.User({ 
					username: req.body.username,
					password: req.body.password,
					email: req.body.email});

				user.save(function (err, user){
					if (err)
						throw err;
					else
						console.log("User " + user.username + " was saved");
						res.redirect('/');
				});
			
			}
			else
				res.redirect('back');
		});
	}
};

exports.login = function(req, res){
	
};