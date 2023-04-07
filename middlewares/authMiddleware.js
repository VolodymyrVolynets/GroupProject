const usersController = require('../controllers/database/usersController');

exports.authenticateUser = async (client, next) => {
	console.log('middleware');
	const username = client.handshake.query.username;
	const password = client.handshake.query.password;
	client.username = username;

	if (!(await usersController.authenticateUser(username, password))) {
		console.log('Authentication failed');
		// client.emit('disconnect', { message: 'Authentication failed' });
		return client.disconnect();
	}

	client.join(client.username);
	console.log('Authentication successful');
	next();
};
