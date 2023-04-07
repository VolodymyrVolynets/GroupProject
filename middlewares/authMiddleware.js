const usersController = require('../controllers/database/usersController');

exports.authenticateUser = async (client, next) => {
	console.log('middleware');
	const username = client.handshake.query.username;
	const password = client.handshake.query.password;

	// if (!(await usersController.authenticateUser(username, password))) {
	// 	console.log('Authentication failed');
	// 	client.isCorrectLiginDetails = false;
	// } else {
	// 	client.isCorrectLiginDetails = true;
	// 	client.join(client.username);
	// 	console.log('Authentication successful');
	// }

	if (!(await usersController.authenticateUser(username, password))) {
		console.log('Authentication failed');
		return next(new Error('Authentication error'));
	} 
	
	client.username = username;
	client.join(client.username);
	console.log('Authentication successful');

	next();
};
