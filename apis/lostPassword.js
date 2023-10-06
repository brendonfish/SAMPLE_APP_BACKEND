console.log('Loading function');

// dependencies
var AWS = require('aws-sdk');
var crypto = require('crypto');
var config = require('../config.json');
var {sendLostPasswordEmail} = require('../services/emailService');
var {getUser, storeLostToken} = require('../services/userService');

exports.handler = async function(event, context) {
	var email = event.email;

	let user = await getUser(email);
	if (!user) {
		context.fail('Error in getUserFromEmail: ' + err);
	} else {
		try {
			let token = await storeLostToken(email);
			if (!token) {
				context.fail('Error in storeLostToken: ' + e);
				return;
			}

			sendLostPasswordEmail(email, token, function(err, data) {
				if (err) {
					context.fail('Error in sendLostPasswordEmail: ' + err);
				} else {
					console.log('User found: ' + email);
					context.succeed({
						sent: true
					});
				}
			});
		} catch (e) {
			context.fail('Error in storeLostToken: ' + e);
		}
	}
}
