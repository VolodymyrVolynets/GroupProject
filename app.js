const server = require('http').createServer();
const io = require('socket.io')(server);
const dotenv = require('dotenv');
dotenv.config();
const sensorsController = require('./controllers/database/sensorsController');
const SensorDataModel = require('./Models/SensorDataModel');

// Authentication middleware called only when a client connects
io.use(require('./middlewares/authMiddleware').authenticateUser);

io.on('connection', (client, next) => {
	// Check if the client is authenticated
	if (!client.username) {
		client.disconnect();
		return;
	}

	// Python clients send sensors values to the server and the server sends them to the other clients and saves them in the database every 5 minute
	client.on('sensors_value', (data) => {
		try {
			// validate data
			let sensorsArray = [];
			for (let i = 0; i < data.length; i++) {
				sensorsArray.push(new SensorDataModel(data[i]));
			}

			// echo to other clients
			client.to(client.username).emit('sensors_value', sensorsArray);

			// save data in the database
			for (let i = 0; i < sensorsArray.length; i++) {
				sensorsController.addNewSensorsValueIfMoreThan5Minutes(
					client.username,
					sensorsArray[i]
				);
			}
		} catch (err) {
			console.log(err);
		}
	});

	// Python clients send actuators values to the server and the server sends them to the other clients
	client.on('actuators_value', (data) => {
		try {
			// echo to other clients
			client.to(client.username).emit('actuators_value', data);
		} catch (err) {
			console.log(err);
		}
	});

	// Swift clients send actuators values to the server and the server sends them to the other clients
	client.on('new_actuators_value', (data) => {
		try {
			// echo to other clients
			client.to(client.username).emit('new_actuators_value', data);
		} catch (err) {
			console.log(err);
		}
	});

	client.on('disconnect', () => {
		client.disconnect();
	});
});


server.listen(process.env.PORT || 3000);

// write mysql query to get all users with email ivanZhukov@gmail.com
