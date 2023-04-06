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
        // console.log(database)
        const result = await usersModel.findOne({
			username: username,
			password: password,
		});
        if (result.length === 0) {
            return false;
        }
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
