

class User {
    constructor(userObj) {
		this.email= userObj.email;
		this.passwordHash= userObj.password;
		this.passwordSalt= userObj.salt;
		this.verified= userObj.varified;
		this.verifyToken= userObj.token;
		this.userToken= userObj.identity_token;
		this.identityId= userObj.openId;
		this.expireTime= userObj.expireTime
    }

    save(){
		docClient.put({
			TableName: config.DDB_TABLE,
			Item: this
		  }, (err, data) => {
			if (err) {
			  console.log(`error saving user: ${err}`)
			} else {
			}
		  });
    }
}

const getUser = async (email) => {

	try {
		let userObj = await dynamodb.getItem({
			TableName: config.DDB_TABLE,
			Key: {
			  email: {
				S: email
			  }
			}
		}).promise();
	
		let user = new User(userObj);
		return user;
	} catch (e) {
		return null;
	}

}

module.exports = {
	User: User,
	getUser: getUser
}