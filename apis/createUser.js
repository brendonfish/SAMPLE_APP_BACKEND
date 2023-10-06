console.log('Loading function');

// dependencies
var AWS = require('aws-sdk');
var {computeHash} = require('../common/utils');
var {sendVerificationEmail} = require('../services/emailService');
var {storeUser, checkExistedUser, getToken} = require('../services/userService');

var config = require('../config.json');

// Get reference to AWS clients
const SECONDS_PER_HOUR = 3600;


exports.handler = async function(event, context) {
	var email = event.email;
	var clearPassword = event.password;

  if (await checkExistedUser(email)) {

    context.succeed({
      created: false,
      error: "user existed"
    }); 

    return

  } else {

      computeHash(clearPassword, function(err, salt, hash) {
        if (err) {
          context.fail('Error in hash: ' + err);
          console.log('Error in hash:' + err);
        } else {
          getToken(email, function(err, identityId, identity_token) {
            if (err) {
              context.fail('Error in getToken: ' + err);
            } else {
              storeUser(email, hash, salt, identityId, identity_token, function(err, token) {
                if (err) {
                  console.log('Store User has error: ' + err);
                  if (err.code == 'ConditionalCheckFailedException') {
                    // userId already found
                    context.succeed({
                      created: false
                    });
                  } else {
                    context.fail('Error in storeUser: ' + err);
                  }
                } else {
                  sendVerificationEmail(email, token, function(err, data) {
                    if (err) {
                      context.fail('Error in sendVerificationEmail: ' + err);
                    } else {

                      context.succeed({
                        created: true,
                        identityId: identityId,
                        token: identity_token                    
                      });

                    }
                  });
                }
              });
            }
          });

        }
      });
  }
}
