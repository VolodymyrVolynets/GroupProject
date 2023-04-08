const { usersModel } = require('./database');

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

exports.authenticateUser = async (username, password) => {
	try {
		const result = await usersModel.findOne({
			username: username,
			password: password,
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

