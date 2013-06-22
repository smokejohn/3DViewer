/*
 * GET home page.
 */

var fs = require('fs');
var util = require('util');
var path = require('path');
var db = require('../db');
var async = require('async');

exports.index = function(req, res){
    res.render('index', { title: '3DViewer', message: req.flash('error')});
    if (req.user)    
        console.log(req.user._id);
    console.log(res.locals.currentUser);
    console.log(fs);
};

exports.upload = function(req, res)
{

    async.waterfall([
    
        function(callback){
            
           // Set Users Model Directory
            db.User.findById(req.user._id, function(err, user){
                if(err) 
                    throw err;
                else{
                    user.userpath = "files/" + user._id;
                    user.save();
                    console.log("User: %s's Userpath was set to %s", user.username, user.userpath);
                } 
                callback(err, user.userpath);
            });
            
        },
        function(userpath, callback){
            
            console.log(path.extname(req.files.modelFile.name));
            console.log(userpath);
            
            var bExists;
            
            // CREATE DIRECTORY
            // Check if Directory already exists for User, if not create one
            fs.stat(userpath, function(err, stats){
                if(err && err.code != 'ENOENT')
                    throw err;
                else if(err && err.code == 'ENOENT')
                {
                    bExists = false;             
                }
                else{
                    bExists = true;
                }
                callback(null, userpath, bExists);
            });
        },
        function(userpath, exists, callback){
        
            if(!exists){
                fs.mkdir(userpath, function(err){
                    if(err) 
                        throw err;
                    else 
                        console.log("Directory %s created!", userpath);            
                });       
            }
            else
                console.log("Directory %s already exists!", userpath);
            callback(null, userpath);
        },
        function(userpath, callback){
        
 
           
                    
            // UPLOAD
            
            // pipe file content to new File in target path
            if(path.extname(req.files.modelFile.name) == '.obj')
            {
                // get the temporary location of the file
                var tmp_path = req.files.modelFile.path;
                // set where the file should actually exists - in this case it is in the "files" directory
                var target_path = userpath + "/" + req.files.modelFile.name;
              
                // have to use Streams to be sure moving/copying of files works cross partitions || cross disks
                // InputStream (is) and OutputStream (os)
                var is = fs.createReadStream(tmp_path);
                var os = fs.createWriteStream(target_path);
    
                // pipe data to new location
                is.pipe(os);
    
                // listen for EOF in InputStream(is)
                is.on('end', function(){
                    // delete file in tmp path
                    fs.unlink(tmp_path, function(err){
                        if (err) throw err;
                        res.send('File uploaded to: ' + target_path + ' - ' + req.files.modelFile.size + ' bytes');
                    });
                });
            }
            else
            {
                req.flash('error', 'Wrong Filetype, please upload .obj');
                res.redirect('back');
            }

            callback(null, userpath);
        
        },
        function(userpath, callback)
        {
            var query = db.UserModel.find({ name: req.files.modelFile.name });
            query.where('owner').equals(req.user._id);
            
            query.exec(function(err, model){
                console.log( "DBQuery for Modelname: " + model );
                if(model[0] === undefined)
                {
                    var Model3d = new db.UserModel({
                        name: req.files.modelFile.name,
                        owner: req.user._id,
                        path: userpath,
                        desc: "lalallalalalala 3D",
                        created: Date.now() });
                            
                    Model3d.save(function(err){
                        if(err)
                            throw err;
                        else
                            console.log("Model %s has been saved", req.files.modelFile.name);            
                    }); 
                }
            else
            {
                model.desc = "lalalalallalal 3D";
                model.created = Date.now();
                console.log("Model %s exists, and has been updated", req.files.modelFile.name);
            }
            });
            callback(null, "done");
        }], 
        function (err, result) {
            if(err)
                throw err;
            else    
                console.log(result);
        }
    );

 
    // old implementation, with fs.rename doesnt work cross partition || cross disk
    /*
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.modelFile.size + ' bytes');
        });
    });*/
};

exports.uploaded = function(req, res)
{
    res.setHeader('Content-Type', 'text/plain');
    res.send("File Upload was Successful");
}


exports.threeJS = function(req, res)
{
    res.render('threeJS', {title: '3DViewer'});
}