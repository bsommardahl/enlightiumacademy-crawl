
const Bluebird = require('bluebird');
const MongoClient = require('mongodb').MongoClient;
const url = require('./dbConfig').url;

const connect = () => (
	new Bluebird((resolve, reject) => {
		MongoClient.connect(url, (err, db) => {
			if (err) {
				return reject(err);
			}
			resolve(db);
		});
	})
);

module.exports = {
  connect
};