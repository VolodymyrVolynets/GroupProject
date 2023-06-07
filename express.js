const express = require('express');
const app = express();
const http = require('http').Server(app);
const dotenv = require('dotenv');
const sensorsController = require('./controllers/database/sensorsController');
const usersController = require('./controllers/database/usersController');
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/register', async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	const result = await usersController.registerUser(username, password);

	if (result) {
		res.sendStatus(200);
	} else {
		res.sendStatus(500);
	}
})

app.use(async (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;
	// console.log(username, password)

	if (!username || !password) {
		res.status(400).send('Bad request');
		return;
	}
	if (
		(await usersController.authenticateUser(username, password)) === false
	) {
		res.status(401).send('Unauthorized');
		return;
	}
	req.username = username;
	// res.status(200);
	next();
});

app.post('/getDataForSensor', async (req, res) => {
	const sensorName = req.body.sensorName;
 
	const data = await sensorsController.getDataForSensor(
		req.username,
		sensorName
	);
	res.send(data.values);
});

app.post('/getAllSensorsLastData', async (req, res) => {
	const data = await sensorsController.getAllSensorsLastData(req.username);

	const formatedData = []
	for (let i = 0; i < data.length; i++) {
		const sensor = data[i];
		const sensorName = sensor.name;
		const sensorType = sensor.type;
		const sensorValue = sensor.values[0].value
		formatedData.push({
			"name": sensorName,
			"type": sensorType,
			"value": sensorValue
		})
	}

	res.send(formatedData);
});

app.post('/removeSensorsData', async (req, res) => {
	const sensorName = req.body.sensorName;

	const result = await sensorsController.removeSensorsData(
		req.username,
		sensorName
	);

	if (result) {
		res.sendStatus(200);
	} else {
		res.sendStatus(500);
	}
});

module.exports = {
	app,
	http,
};
