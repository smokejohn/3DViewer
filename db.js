var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback(){


// Database Schemes

// USER
var userSchema = mongoose.Schema({
	username: { type: String, required: true, index: { unique: true }},
	password: { type: String, required: true},
	email: { type: String, required: true}
});

// USERLIST
var userlistSchema = mongoose.Schema({
	userID : { type: ObjectId, required: true }
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