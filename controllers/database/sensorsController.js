const { sensorsModel } = require('./database');
// const {SensorDataModel} = require('../../Models/SensorDataModel');

// exports.addNewSensorsData = async (username, sensorDataModel) => {
// 	try {
// 		const model = await sensorsModel(username);
// 		model.findOne({ name: sensorDataModel.name }, (err, sensor) => {
// 			if (err) {
// 				console.error(err);
// 			} else if (sensor) {
// 				/// Find the sensor by name and update its values array
// 				Sensor.findOne(
// 					{ name: sensorDataModel.name },
// 					(err, sensor) => {
// 						if (err) {
// 							console.error(err);
// 						} else {
// 							sensor.values.push({
// 								date: new Date(),
// 								value: sensorDataModel.value,
// 							});
// 							sensor.save((err, updatedSensor) => {
// 								if (err) {
// 									console.error(err);
// 								} else {
// 									console.log(
// 										`Added new value to ${updatedSensor.name}`
// 									);
// 								}
// 							});
// 						}
// 					}
// 				);
// 			} else {
// 				// Create a new sensor
// 				const sensorData = new Sensor({
// 					name: sensorDataModel.name,
// 					type: sensorDataModel.type,
// 					values: [
// 						{
// 							date: new Date(),
// 							value: sensorDataModel.value,
// 						},
// 					],
// 				});
// 				// Save the sensor data to the database
// 				sensorData.save((err, savedSensor) => {
// 					if (err) {
// 						return false;
// 					} else {
// 						return true;
// 					}
// 				});
// 			}
// 		});
// 		return true;
// 	} catch (err) {
// 		console.log(err);
// 		return false;
// 	}
// 	// try {
// 	// 	const result = await sensorsModel(username).create(sensorDataModel);
// 	// 	return true;
// 	// } catch (err) {
// 	// 	console.log(err);
// 	// 	return false;
// 	// }
// };

exports.addNewSensorsValueIfMoreThan5Minutes = async (
	username,
	sensorDataModel
) => {
	const model = await sensorsModel(username);

	try {
		const sensor = await model.findOne({ name: sensorDataModel.name });
		createNewSensorIfNotExist(model, sensorDataModel);
		if (await isSensorNeedsUpdate(sensor, 300)) {
			sensor.values.push({
				date: new Date(),
				value: sensorDataModel.value,
			});
			const updatedSensor = await sensor.save();
		}
	} catch (err) {
		console.error(err);
	}
};

createNewSensorIfNotExist = async (model, sensorDataModel) => {
	try {
		const sensor = await model.findOne({ name: sensorDataModel.name });
		if (!sensor) {
			const sensorData = new model({
				name: sensorDataModel.name,
				type: sensorDataModel.type,
				values: [
					{
						date: new Date(),
						value: sensorDataModel.value,
					},
				],
			});
			const saved = await sensorData.save();
			console.log(sensorData);
		}
	} catch (err) {
		console.error(err);
		return;
	}
};

isSensorNeedsUpdate = async (sensor, timeInSec) => {
	if (!sensor) {
		return false;
	}

	const now = Date.now();
	const latestValue = sensor.values.slice(-1)[0];
	if (latestValue && !(now - latestValue.date.getTime() < timeInSec * 1000)) {
		return true;
	} else {
		return false;
	}
};

exports.getDataForSensor = async (username, sensorName) => {
	try {
		const model = await sensorsModel(username);
		const data = await model.find({ name: sensorName });
		return data;
	} catch (err) {
		console.log(err);
		return;
	}
};

exports.getAllSensorsLastData = async (username) => {
	try {
		const model = await sensorsModel(username);
		const sensors = await model.find({}, { values: { $slice: -1 } });
		return sensors;
	} catch (err) {
		console.error(err);
		return;
	}
};

exports.removeSensorsData = async (username, sensorName) => {
	try {
		const model = await sensorsModel(username);
		await model.deleteMany({ name: sensorName });
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};
