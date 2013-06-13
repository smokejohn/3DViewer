var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback(){
	console.log("database connection successfull!");

	// Database Schemes

	// USER
	var userSchema = mongoose.Schema({
		username: { type: String, required: true, index: { unique: true }},
		password: { type: String, required: true },
		email: { type: String, required: true },
		registered: { type: Boolean, default: false },
		created: { type: Date, default: Date.now }
	});

	// USER FUNCTIONS

	userSchema.methods.validPassword = function (password) {
		return this.password === password; 
	};


	// USERLIST
	var userlistSchema = mongoose.Schema({
		userID : { type: String, required: true }
	});
    
    // USERMODEL
    
    var usermodelSchema = mongoose.Schema({
    
        name: { type: String, required: true, index: { unique: true }},
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        path: { type: String, required: true},
        desc: { type: String}
    });
    
	// Database Models

	// USER
	var User = mongoose.model('User', userSchema);

	// USERLIST
	var UserList = mongoose.model('UserList', userlistSchema);

	//Exports
	exports.User = User;
	exports.UserList = UserList;

});


exports.db = db;