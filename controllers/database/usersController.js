const { usersModel } = require('./database');
const bcrypt = require("bcrypt")
const saltRounds = 10

exports.isUserExist = async (username) => {
	try {
		const result = await usersModel.findOne({ username: username });
		if (result.length === 0) {
			return false;
		}
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

exports.registerUser = async (username, password) => {
	try {
		const check = await usersModel.findOne({
			username: username
		});
		if (check != null) {
			return false;
		}
		
		var hashedPass = ""
		bcrypt.hash(password, 10, function(err, hash) {
			hashedPass = hash
		});
		const result = await usersModel.create({
			username: username,
			password: hashedPass,
		});
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

exports.authenticateUser = async (username, password) => {
	try {
		const result = await usersModel.findOne({
			username: username
		});
		const hash = result.password
		bcrypt.compare(password, hash, function(err, result) {
			if (!result) {
				return false;
			}
		});
		// console.log(result);
		if (result == null) {
			return false;
		}
		return true;
	} catch (err) {
		console.log(err);
	}
};

