const express = require('express');
const app = express();
const http = require('http').Server(app);
const dotenv = require('dotenv');
const sensorsController = require('./controllers/database/sensorsController');
const usersController = require('./controllers/database/usersController');
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => { 
    const username = req.body.username
    const password = req.body.password
    // console.log(username, password)

    if (!username || !password) {
        res.status(400).send('Bad request');
        return;
    }
    if (await usersController.authenticateUser(username, password) === false) {
        res.status(401).send('Unauthorized');
        return;
    }
    req.username = username;
    next()
})

app.post('/getDataForSensor', async (req, res) => {
    const sensorName = req.body.sensorName

    const data = await sensorsController.getDataForSensor(req.username, sensorName);
	res.send(data);
});

module.exports = {
	app,
	http,
};
