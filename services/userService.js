var AWS = require('aws-sdk');
var crypto = require('crypto');
var util = require('util');
var config = require('../config.json');
var {User} = require('../model/userModel');
var userModel = require('../model/userModel');
var docClient = new AWS.DynamoDB.DocumentClient();
var dynamodb = new AWS.DynamoDB();
var cognitoidentity = new AWS.CognitoIdentity();
const randomBytesAsync = util.promisify(require('crypto').randomBytes);
const SECONDS_PER_HOUR = 3600;
const USER_TABLE_INDEX = 'userToken-index';

async function storeUser(email, password, salt, openId, identity_token, fn) {
	// Bytesize
	var len = config.CRYPTO_BYTE_SIZE;
  	let expireTime = Math.floor(Date.now()/1000)+SECONDS_PER_HOUR;
	let token = '';

	try {
		token = await randomBytesAsync(len);
		token = token.toString('hex');
		var param = {
		IdentityPoolId: config.IDENTITY_POOL_ID,
		Logins: {} // To have provider name in a variable
		};
		param.Logins[config.DEVELOPER_PROVIDER_NAME] = email;

		let user = new User({
			email: email,
			passwordHash: password,
			passwordSalt: salt, 
			verified: true,
			verifyToken: token,
			userToken: identity_token,
			identityId: openId,
			expireTime: expireTime
		});

		let token = user.save();
		return fn(token);

	} catch (e) {
		return fn(e);
	}
}

async function checkExistedUser(email, fn) {

	let user = await userModel.getUser(email);
	if (user) {
		fn(null, true);
	} else {
		fn(null, false); // User not found
	}
}

async function checkExistedUser(email) {

	let user = await userModel.getUser(email);
	if (user) {
		return true;
	} else {
		return false; // User not found
	}
}

function getToken(email, fn) {
	var param = {
		IdentityPoolId: config.IDENTITY_POOL_ID,
		Logins: {} // To have provider name in a variable
	};
	param.Logins[config.DEVELOPER_PROVIDER_NAME] = email;
	cognitoidentity.getOpenIdTokenForDeveloperIdentity(param,
		function(err, data) {
			if (err) return fn(err); // an error occurred
			else fn(null, data.IdentityId, data.Token); // successful response
		});
}

async function getUser(email) {
	let user = await userModel.getUser(email);
	if (user) {
		return user;
	} else {
		return null;
	}
}

async function queryEmailById(userToken) {
	let params = { 
		 TableName: config.DDB_TABLE,
		 IndexName: USER_TABLE_INDEX,
		 KeyConditionExpression: 'userToken = :token',
		 ExpressionAttributeValues: {':token': {S: userToken}} 
	};
	console.log('params:\n'+JSON.stringify(params));

	let data = await dynamodb.query(params).promise();

	if(!data) {
		console.log('query error:'+err);
		fn(err, null);
	} else {
		if (data.Count>0){
			let item = data.Items[0];
			return { email:item.email.S, identityId: item.identityId.S, expireTime: item.expireTime.N};
		} else {
			console.log('query error:'+'user not found');
			return null;
		}
	}
}

function updateUserTable(email, token, fn){
	
	let expireTime = Math.floor(Date.now()/1000)+SECONDS_PER_HOUR;
	const params = {
        TableName: config.DDB_TABLE,
        Key: {
            "email": email
        },
        UpdateExpression: "set userToken = :token, expireTime= :expireTime",
        ExpressionAttributeValues: {
            ":token": token,
            ":expireTime":expireTime 
        }
    };

    docClient.update(params, function(err, data) {
        if (err) console.log('updateUserTable:'+err);
        else console.log('updateUserTable:'+data);
        fn();
    });
}

async function storeLostToken(email) {
	// Bytesize
	var len = config.CRYPTO_BYTE_SIZE;
	let token = null;
	try {
		token = await crandomBytesAsync(len);
		token = token.toString('hex');
		await dynamodb.updateItem({
				TableName: config.DDB_TABLE,
				Key: {
					email: {
						S: email
					}
				},
				AttributeUpdates: {
					lostToken: {
						Action: 'PUT',
						Value: {
							S: token
						}
					}
				}
		}).promise();
		return token;
	} catch (e) {
		return null;
	}
}

module.exports = {
	storeUser: storeUser,
	checkExistedUser: checkExistedUser,
	getToken: getToken,
	storeLostToken: storeLostToken,
	getUser: getUser,
	queryEmailById: queryEmailById,
	updateUserTable: updateUserTable
}