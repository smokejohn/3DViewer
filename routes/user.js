var db = require("../db");
var mailer = require("../mailer");
var async = require("async");
var fs =  require('fs');


/*
 * GET 
 */

exports.list = function(req, res){

	var query = db.User.find();
    console.log(async);
	query.select('username email created registered admin');

    query.exec(function(err, users){
		if (err)
			throw err;
		else
			res.render('users', { title: "Responsive 3D", users: users });
    });

};


exports.dashboard = function(req, res){

    db.UserModel.find({ 'owner': req.user._id }, function(err, models){
        if(err)
            throw err;
        else
            res.render('dashboard', { title: 'Responsive 3D', models: models});
        
    });
}

exports.upload = function(req, res){
    res.render('upload', {title: 'Responsive 3D'});


}

exports.view3D = function(req, res){
    
    console.log('SV: view3D Route: ' + req.params.id);
    
    db.UserModel.findById(req.params.id, function(err, model){
        if(err)
            throw err;
        else
            res.render('threeJS', {title: 'Responsive 3D', model: model});
    
    })

    
}


exports.signup = function(req, res){
	res.render('signup', { title: 'Responsive 3D', message: req.flash('error')});
};

exports.signin = function(req, res){
	res.render('signin', { title: 'Responsive 3D', message: req.flash('error')});
	console.log(req.flash('error'));
};


exports.activationmail = function(req, res){
	res.render('activationmail', {title: 'Responsive 3D'});
}


exports.activateuser = function(req, res){
	
	
	db.User.update({_id: req.params.id}, { $set: { registered: true}}, function(err){
	if (err) throw err;
	else
		console.log("User registered!");

	});

	res.render('activateuser', {title: 'Responsive 3D'});
}

/*
 * POST 
 */
 
 exports.deleteModel = function(req, res){
 
    console.log(req.body.model_id);
    
    db.UserModel.findById(req.body.model_id, function(err, model){
        if(err)
            throw err;
        else{
            console.log("found model!");
            
            // build up the path where the model is
            var delPath = model.path + '/' + model.name;
            console.log(delPath);
            
            // delete model from FileSystem
            fs.unlink(delPath, function(err){
                if (err)
                    throw err;
                else
                    console.log('modelfile %s deleted', model.name);
            });
            
            // remove Database entry of model
            model.remove(function(){console.log("DB Entry removed");});
            
            res.redirect('back');
        }
    });
    
 
 
 }
 
 exports.getModel = function(req ,res){
 
    console.log("Todo: Send model._id via Ajax to ThreeJS");
    console.log(req.body.id);
    console.log(__dirname);
    
    
    db.UserModel.findById(req.body.id, function(err, model){
        
        if(err)
            throw err;
        else
        {
            console.log("SV:getting the ModelPath:");
            console.log(model.path);
            // var root = __dirname.substring(0, __dirname.lastIndexOf('routes'));
            // console.log(root);
            var path = model.path.substring(model.path.lastIndexOf('/') + 1);
            console.log(path);
            res.contentType('json');
            res.send(JSON.stringify({ path: "/" + path + "/" + model.name }));
        }
    });
    
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
								var mailbody = "<h2>Welcome to Responsive 3D</h2></br></br><p>To finish your registration, click the activation Link below</p></br></br><a href='http://localhost:3000/user/activate_user/" + id +"'>Activation Link</a>";
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

exports.createUser = function(req, res){

    var user = new models.User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    });
    
    if(req.body.registered){
        user.registered = true;
    }
    
    if(req.body.admin){
        user.admin = true;
    }
    user.save();

}


exports.updateUser = function(req, res){
 
    // @Todo: Update Player with new Data;
    console.log(req.body);
    console.log(req.body.username);
    console.log(req.body.registered);
    
    db.User.findById(req.body.userId, function(err, user){
        if(err)
            throw err;
        else
        {
        
            if(req.body.username != '')
                user.username = req.body.username;
                
            if(req.body.password != '')
                user.password = req.body.password;
                
            if(req.body.email != '')  
                user.email = req.body.email;
                
            if(req.body.registered != undefined){
                user.registered = true;
            }
            else{
                user.registered = false;
            }
            
            if(req.body.admin != undefined){
                user.admin = true;
            }
            else{
                user.admin = false;
            }
            
            user.save();
        }

        res.redirect('back');
    });
    
 
 }

exports.deleteUser = function(req, res){
    
    db.User.findById(req.params.id, function(err, user){
        if(err)
            throw err;
        else
            console.log("deleting user!");
            user.remove();
            res.redirect('back');
    });

 }


    


