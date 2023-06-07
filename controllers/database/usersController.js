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

		const hashedPassword = await new Promise((resolve, reject) => {
    		bcrypt.hash(password, 10, function(err, hash) {
      		if (err) reject(err)
      		resolve(hash)
    	});
  })
		const result = await usersModel.create({
			username: username,
			password: await hashedPassword,
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
		console.log(hash)
		console.log(result)
		await bcrypt.compare(password, hash)
		if (result) {
			return true;
		} else {
			return false
		}
		// // console.log(result);
		// if (result == null) {
		// 	return false;
		// }
		// return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

