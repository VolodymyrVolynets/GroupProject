const { sensorsModel } = require('./database');
// const {SensorDataModel} = require('../../Models/SensorDataModel');

exports.addNewSensorsData = async (username, sensorDataModel) => {
	try {
		const Sensor = await sensorsModel(username);
		Sensor.findOne({ name: sensorDataModel.name }, (err, sensor) => {
			if (err) {
				console.error(err);
			} else if (sensor) {
				/// Find the sensor by name and update its values array
				Sensor.findOne(
					{ name: sensorDataModel.name },
					(err, sensor) => {
						if (err) {
							console.error(err);
						} else {
							sensor.values.push({
								date: new Date(),
								value: sensorDataModel.value,
							});
							sensor.save((err, updatedSensor) => {
								if (err) {
									console.error(err);
								} else {
									console.log(
										`Added new value to ${updatedSensor.name}`
									);
								}
							});
						}
					}
				);
			} else {
				// Create a new sensor
				const sensorData = new Sensor({
					name: sensorDataModel.name,
					type: sensorDataModel.type,
					values: [
						{
							date: new Date(),
							value: sensorDataModel.value,
						},
					],
				});
				// Save the sensor data to the database
				sensorData.save((err, savedSensor) => {
					if (err) {
						return false;
					} else {
						return true;
					}
				});
			}
		});
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
	// try {
	// 	const result = await sensorsModel(username).create(sensorDataModel);
	// 	return true;
	// } catch (err) {
	// 	console.log(err);
	// 	return false;
	// }
};

exports.addNewSensorsValueIfMoreThan5Minutes = async (
	username,
	sensorDataModel
) => {
	const Sensor = await sensorsModel(username);

	try {
		const sensor = await Sensor.findOne({ name: sensorDataModel.name });
		if (sensor) {
			const now = Date.now();
			const latestValue = sensor.values.slice(-1)[0];
			if (
				latestValue &&
				!(now - latestValue.date.getTime() < 5 * 60 * 1000)
			) {
				sensor.values.push({
					date: new Date(),
					value: sensorDataModel.value,
				});
				const updatedSensor = await sensor.save();
				console.log(`Updated sensor ${updatedSensor.name}`);
			} else {
				console.log(`Recent value found for ${sensor.name}`);
			}
		} else {
			console.log('Sensor not found');
			//save new sensor
			try {
				const sensorData = new Sensor({
					name: sensorDataModel.name,
					type: sensorDataModel.type,
					values: [
						{
							date: new Date(),
							value: sensorDataModel.value,
						},
					],
				});
				const savedSensor = await sensorData.save();
				return true;
			} catch (err) {
				console.error(err);
				return false;
			}
		}
	} catch (err) {
		console.error(err);
	}

	// try {
	// 	// Get the latest element by name
	// 	const latestElement = await sensorsModel(username)
	// 		.findOne({ name: sensorDataModel.name })
	// 		.sort({ date: -1 })
	// 		.exec();

	// 	// Check if the latest element by name was created more than 5 minutes ago
	// 	if (
	// 		!latestElement ||
	// 		(Date.now() - latestElement.date.getTime()) / 1000 > 300
	// 	) {
	// 		await sensorsModel(username).create(sensorDataModel);
	// 		// console.log('New data added to the database');
	// 	}
	// 	return true;
	// } catch (err) {
	// 	console.log(err);
	// 	return false;
	// }
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
		console.log('Getting all sensors last data');
		const Sensor = await sensorsModel(username);
		const sensors = await Sensor.find({}, { values: { $slice: -1 } });
		console.log(sensors);
		return sensors;
		// if (sensors.length > 0) {
		// 	sensors.forEach((sensor) => {
		// 		console.log(
		// 			`Sensor ${sensor.name} has last value of ${sensor.values[0].value} at ${sensor.values[0].date}`
		// 		);
		// 	});
		// } else {
		// 	console.log('No sensors found');
		// }
	} catch (err) {
		console.error(err);
		return;
	}

	// try {
	// 	const model = await sensorsModel(username);
	// 	const data = await model.aggregate([
	// 		{
	// 			$sort: { date: -1 },
	// 		},
	// 		{
	// 			$group: {
	// 				_id: '$name',
	// 				latestElement: { $first: '$$ROOT' },
	// 			},
	// 		},
	// 		{
	// 			$project: {
	// 				_id: '$latestElement._id',
	// 				name: '$latestElement.name',
	// 				type: '$latestElement.type',
	// 				value: '$latestElement.value',
	// 				date: '$latestElement.date',
	// 			},
	// 		},
	// 	]);
	// 	return data;
	// } catch (err) {
	// 	console.log(err);
	// 	return;
	// }
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
