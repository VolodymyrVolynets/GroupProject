const { sensorsModel } = require('./database');
// const {SensorDataModel} = require('../../Models/SensorDataModel');

exports.addNewSensorsData = async (username, sensorDataModel) => {
    try {
        const result = await sensorsModel(username).create(sensorDataModel);
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

exports.addNewSensorsValueIfMoreThan5Minutes = async (username, sensorDataModel) => {
    try {
        // Get the latest element by name
        const latestElement = await sensorsModel(username).findOne({ name: sensorDataModel.name })
			.sort({ date: -1 })
            .exec();
        
        // Check if the latest element by name was created more than 5 minutes ago
        if (
			!latestElement ||
			(Date.now() - latestElement.date.getTime()) / 1000 > 300
		) {
            await sensorsModel(username).create(sensorDataModel);
            // console.log('New data added to the database');
		} 
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

exports.getDataForSensor = async (username, sensorName) => {
    try {
        const model = await sensorsModel(username);
        const data = await model.find({ name: sensorName })
        return data;
    } catch (err) {
        console.log(err);
        return;
    }
}
