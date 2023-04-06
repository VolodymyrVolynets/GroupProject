const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userConnection = mongoose.createConnection(
	`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.r8enxnx.mongodb.net/group_project_users?retryWrites=true&w=majority`
);

const sensorsConnection = mongoose.createConnection(
	`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.r8enxnx.mongodb.net/group_project_houses?retryWrites=true&w=majority`
);

const usersSchema = new Schema({
	username: String,
	password: String,
});

const sensorsSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	value: {
		type: Number,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

const usersModel = userConnection.model('users', usersSchema);
const sensorsModel = (username) => {
	return sensorsConnection.model(`${username}`, sensorsSchema);
};

module.exports = { usersModel, sensorsModel };
