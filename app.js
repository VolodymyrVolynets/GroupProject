const express = require('./express');
const socket = require('./socket');

const port = process.env.PORT || 3000;

express.http.listen(port, () => {
	console.log(`Listening on ${port}`);
});
