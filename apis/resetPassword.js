console.log('Loading function');

// dependencies
var AWS = require('aws-sdk');
var crypto = require('crypto');
var config = require('../config.json');
var {computeHash} = require('../common/utils');
var {getUser} = require('../services/userService');


exports.handler = async function(event, context) {
	var email = event.email;
	var lostToken = event.lost;
	var newPassword = event.password;

	let user = await getUser(email);
	if (!user) {
		context.fail('Error in getUser: ' + err);
	}

	let correctToken = user.lostToken;
	if (!correctToken) {
		console.log('No lostToken for user: ' + email);
		context.succeed({
			changed: false
		});
	}

	if (lostToken != correctToken) {
		// Wrong token, no password lost
		console.log('Wrong lostToken for user: ' + email);
		context.succeed({
			changed: false
		});
	}

	console.log('User logged in: ' + email);
	computeHash(newPassword, function(err, newSalt, newHash) {
		if (err) {
			context.fail('Error in computeHash: ' + err);
		} else {
			user.passwordHash = newHash;
			user.passwordSalt = newSalt;
			user.save();
		}
	});
}
