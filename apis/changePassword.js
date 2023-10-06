console.log('Loading function');

// dependencies
var AWS = require('aws-sdk');
var crypto = require('crypto');
var config = require('../config.json');
var {computeHash} = require('../common/utils');
var {getUser} = require('../services/userService');

exports.handler = function(event, context) {
	var email = event.email;
	var oldPassword = event.oldPassword;
	var newPassword = event.newPassword;
	let correctHash = null;
	let salt = null;

	try {
		let user = getUser(email);
		if (!user) {
			console.log(`error: user not found!`);
			context.fail('Error in getUser: ' + err);
		}

		correctHash = user.passwordHash;
		salt = user.passwordSalt;
		if (correctHash == null) {
			// User not found
			console.log('User not found: ' + email);
			context.succeed({
				changed: false
			});
		} else {
			computeHash(oldPassword, salt, function(err, salt, hash) {
				if (err) {
					context.fail('Error in hash: ' + err);
				} else {
					if (hash == correctHash) {
						// Login ok
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
					} else {
						// Login failed
						console.log('User login failed: ' + email);
						context.succeed({
							changed: false
						});
					}
				}
			});
		}

	} catch (e) {
		console.log(`error in chanaging user password: ${e}`);
	}
}
