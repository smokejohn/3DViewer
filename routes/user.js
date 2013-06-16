var db = require("../db");
var mailer = require("../mailer");
var async = require("async");


/*
 * GET 
 */

exports.list = function(req, res){

	var query = db.User.find();

	query.select('username email created');

    query.exec(function(err, users){
		if (err)
			throw err;
		else
			res.render('users', { title: "Users", users: users });
    });

};


exports.dashboard = function(req, res){


    db.UserModel.find({ 'owner': req.user._id }, function(err, models){
        if(err)
            throw err;
        else
            res.render('dashboard', { title: 'Dashboard', models: models});
        
    });
}

exports.signup = function(req, res){
	res.render('signup', { title: 'SignUp', message: req.flash('error')});
};

exports.signin = function(req, res){
	res.render('signin', { title: 'SignIn', message: req.flash('error')});
	console.log(req.flash('error'));
};


exports.activationmail = function(req, res){
	res.render('activationmail', {title: '3D-Viewer'});
}


exports.activateuser = function(req, res){
	
	
	db.User.update({_id: req.params.id}, { $set: { registered: true}}, function(err){
	if (err) throw err;
	else
		console.log("User registered!");

	});

	res.render('activateuser', {title: '3D-Viewer'});
}

/*
 * POST 
 */
 
 exports.getModel = function(req, res){
 
    res.send('get Model');
 
 
 
 }

 

exports.register = function(req, res){

	if( req.body.username === '' || req.body.password === '' || req.body.email === '')	
	{
		req.flash('error', 'Missing credentials');
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

				async.series([
                    function (callback){
                        user.save(function (err, user){
                            if (err)
                                throw err;
                            else
                                console.log("User " + user.username + " was saved");
					});

					callback(null);
                    },
                    function (callback){
                        async.waterfall([
                            function(callback){
                                db.User.findOne({ username: req.body.username }, function(err, user){
                                    if (err) throw err;
									console.log(user)
                                    callback(null, user._id);
								});
						
							},
							function(id, callback){
								var mailbody = "<h2>Welcome to 3D-Viewer</h2></br></br><p>To finish your registration, click the activation Link below</p></br></br><a href='http://localhost:3000/user/activate_user/" + id +"'>Activation Link</a>";
								mailer.sendMail(req.body.email, mailbody);
								res.redirect('/user/activationmail');
								callback(null, 'done');
							}
						]);
					}
				]);
			}
			else{
				req.flash('error', 'Username already in use');
				res.redirect('back');
			}
		});
	}
};


    
    


