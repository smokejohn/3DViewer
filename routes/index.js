/*
 * GET home page.
 */

var fs = require('fs');
var util = require('util');
var path = require('path');

exports.index = function(req, res){
  res.render('index', { title: '3DViewer', message: req.flash('error')});
};

exports.upload = function(req, res)
{
    // get the temporary location of the file
  var tmp_path = req.files.modelFile.path;
  // set where the file should actually exists - in this case it is in the "files" directory
  var target_path = 'public/files/' + req.files.modelFile.name;
    
    
    // have to use Streams to be sure moving/copying of files works cross partitions || cross disks
    // InputStream (is) and OutputStream (os)
    var is = fs.createReadStream(tmp_path);
    var os = fs.createWriteStream(target_path);
    
    console.log(path.extname(req.files.modelFile.name));
    // pipe file content to new File in target path
    if(path.extname(req.files.modelFile.name) == '.obj')
    {
        is.pipe(os);
    }
    else
    {
        req.flash('error', 'Wrong Filetype, please upload .obj');
		res.redirect('back');
    }
    // listen for EOF in InputStream(is)
    is.on('end', function(){
        // delete file in tmp path
        fs.unlink(tmp_path, function(err){
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.modelFile.size + ' bytes');
    
        });
    
    
    });
    
    
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