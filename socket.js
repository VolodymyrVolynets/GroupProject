const { http } = require('./express');
const io = require('socket.io')(http);
const sensorsController = require('./controllers/database/sensorsController');
const SensorDataModel = require('./Models/SensorDataModel');
const ActuatorDataModel = require('./Models/ActuatorDataModel');

io.use(require('./middlewares/authMiddleware').authenticateUser);

// Authentication middleware called only when a client connects
io.use(require('./middlewares/authMiddleware').authenticateUser);

// io.use((socket, next) => {
// 	socket.onAny((eventName, data) => {
// 		// Modify the data here
// 		console.log(eventName, data)

// 		// Call the next middleware function or event listener with the modified data
// 		next(eventName, data);
// 	});
// });

io.on('connection', (client, next) => {
	// Check if the client is authenticated
	if (!client.username) {
		client.disconnect();
		return;
	}

	// Send all active sensors to the client
	var allClientsInRoom = io.sockets.adapter.rooms.get(client.username);
	if (allClientsInRoom) {
		allClientsInRoom = Array.from(allClientsInRoom);
		for (let i = 0; i < allClientsInRoom.length; i++) {
			const socketId = allClientsInRoom[i];
			const socket = io.sockets.sockets.get(socketId);
			if (socket.activeSensors) {
				client.emit('sensors_connected', socket.activeSensors);
			}
		}
	}

	client.activeSensors = [];


	// Python clients send sensors values to the server and the server sends them to the other clients and saves them in the database every 5 minute
	client.on('sensors_value', (data) => {
		try {
			// validate data
			try {
				// Try parsing the data as JSON
				data = JSON.parse(data);
			} catch (error) {
				// If parsing fails, assume the data is not JSON and convert
			}

			let sensorsArray = [];
			for (let i = 0; i < data.length; i++) {
				var sensor = new SensorDataModel(data[i])
				sensorsArray.push(sensor);

				// Add sensor name to client 
				if (client.activeSensors.indexOf(sensor.name) === -1) {
					client.activeSensors.push(sensor.name);
					client.to(client.username).emit('sensors_connected', [sensor.name]);
				}
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
			try {
				// Try parsing the data as JSON
				data = JSON.parse(data);
			} catch (error) {
				// If parsing fails, assume the data is not JSON and convert
			}

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
			try {
				// Try parsing the data as JSON
				data = JSON.parse(data);
			} catch (error) {
				// If parsing fails, assume the data is not JSON and convert
			}
			
			let actuator = new SensorDataModel(data);

			if (
				actuator.name === undefined ||
				actuator.value === undefined ||
				actuator.type === undefined
			) {
				console.log('Bad request');
				return;
			}
			console.log(actuator);
			// echo to other clients
			client.to(client.username).emit('new_actuator_value', actuator);
		} catch (err) {
			console.log(err);
		}
	});

	client.on('disconnect', () => {
		// echo client disconnection
		client.to(client.username).emit('sensors_disconnected', client.activeSensors);
		client.disconnect();
	});
});

module.exports = {
	io,
};
