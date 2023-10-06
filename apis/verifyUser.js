var config = require('../config.json');


exports.handler = async function(event, context) {
	var email = event.email;
	var verifyToken = event.verify;

	let user = await getUser(email);
	
	if (!user) {
		context.fail('Error in getUser: ' + err);
	} else if (user.verified) {
		console.log('User already verified: ' + email);
		context.succeed({
			verified: true
		});
	} else if (verifyToken == user.correctToken) {
		// User verified
		user.verified = true;
		delete user['verifyToken'];
		user.save();
		console.log('User verified: ' + email);
		context.succeed({
			verified: true
		});
	} else {
		// Wrong token, not verified
		console.log('User not verified: ' + email);
		context.succeed({
			verified: false
		});
	}
}
