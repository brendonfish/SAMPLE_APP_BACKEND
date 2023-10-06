console.log('Loading function');

// dependencies
var AWS = require('aws-sdk');
var crypto = require('crypto');
var config = require('../config.json');
var {computeHash} = require('../common/utils');
var {getUser, getToken, updateUserTable} = require('../services/userService');

exports.handler = async function(event, context) {
	var email = event.email;
	var clearPassword = event.password;
	console.log('event:'+JSON.stringify(event));
	// Return user email if send with token
	if(event.hasOwnProperty('user_token')){

		let userInfo = await queryEmailById(event.user_token);
		if (!userInfo) {
			console.log('failed...')
			context.fail(err);
		} else {
			console.log('succeeded...')
			context.succeed(userInfo);
		}

	} else {
		let user = await getUser(email);
		if (!user) {
			context.fail('Error in getUser: ' + err);
		} else {
			if (user.correctHash == null) {
				// User not found
				console.log('User not found: ' + email);
				context.succeed({
					login: false
				});
			} else if (!user.verified) {
				// User not verified
				console.log('User not verified: ' + email);
				context.succeed({
					login: false,
					verified: false,
				});
			} else {
				computeHash(user.clearPassword, user.salt, function(err, salt, hash) {
					if (err) {
						context.fail('Error in hash: ' + err);
					} else {
						console.log('correctHash: ' + user.correctHash + ' hash: ' + hash);
						if (hash == user.correctHash) {
							// Login ok
							console.log('User logged in: ' + email);
							getToken(email, identityId, function(err, identityId, token) {
								if (err) {
									context.fail('Error in getToken: ' + err);
								} else {
									updateUserTable(email, token, function(){
										context.succeed({
											login: true,
											identityId: identityId,
											token: token
										});
									});
								}
							});
						} else {
							// Login failed
							console.log('User login failed: ' + email);
							context.succeed({
								login: false
							});
						}
					}
				});
			}
		}
	}
}
