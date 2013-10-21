var nodemailer = require("nodemailer");


function sendMail (usermail, mailbody) {

	var smtpTransport = nodemailer.createTransport('SMTP', {
		service: 'Gmail',
		auth: {
						user: '3dviwr@gmail.com',
						pass: 'emailviewer'
					}
	});

	var mailOptions = {
        from: 'Responsive3D <3dviwr@gmail.com>',
		to: usermail,
		subject: 'register@responsive3D',
		text:	mailbody,
		html: mailbody
	};

	smtpTransport.sendMail(mailOptions, function(err, res){
		if (err)
			console.log(err);
		else
			console.log("Message sent: " + res.message);
	});
}

exports.sendMail = sendMail;