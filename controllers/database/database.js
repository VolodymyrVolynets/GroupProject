const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
mongoose.pluralize(null);
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
		type: Number,
		required: true,
	},
	values: [
		{
			_id: false,
			date: {
				type: Date,
				required: true,
			},
			value: {
				type: Number,
				required: true,
			},
		},
	],
});

//make data expiry after 1 month
sensorsSchema.index(
	{ 'values.date': 1, 'values.value': 1 },
	{ expireAfterSeconds: 60 * 60 * 24 * 30 }
);

const usersModel = userConnection.model('users', usersSchema);
const sensorsModel = (username) => {
	return sensorsConnection.model(`${username}`, sensorsSchema);
};

module.exports = { usersModel, sensorsModel };
