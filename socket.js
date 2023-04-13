const { http } = require('./express');
const io = require('socket.io')(http);
const sensorsController = require('./controllers/database/sensorsController');
const SensorDataModel = require('./Models/SensorDataModel');
const ActuatorDataModel = require('./Models/ActuatorDataModel');

io.use(require('./middlewares/authMiddleware').authenticateUser);


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
			// validate data
			let actuatorsArray = [];
			for (let i = 0; i < data.length; i++) {
				actuatorsArray.push(new SensorDataModel(data[i]));
			}

			// echo to other clients
			client.to(client.username).emit('actuators_value', data);
		} catch (err) {
			console.log(err);
		}
	});

	// Swift clients send actuators values to the server and the server sends them to the other clients
	client.on('new_actuator_value', (data) => {
		try {
			// validate data
			let actuator = new SensorDataModel(data);

			if (actuator.name === undefined || actuator.value === undefined || actuator.type === undefined) {
				console.log('Bad request')
				return
			}
			console.log(actuator)
			// echo to other clients
			client.to(client.username).emit('new_actuator_value', actuator);
		} catch (err) {
			console.log(err);
		}
	});

	client.on('disconnect', () => {
		client.disconnect();
	});
});


module.exports = {
	io,
};
