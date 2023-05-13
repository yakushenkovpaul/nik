const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db = null;

const mongoConnect = (callback) => {
	MongoClient.connect('mongodb+srv://readwrite:iddqdidkfa@cluster0.8kkr23m.mongodb.net/fastwaz_com?retryWrites=true&w=majority')
	.then(client => {
		_db = client.db();
		callback();
	})
	.catch(err => 
	{
		throw(err);
	});	
};

const getDb = () => {
	if(_db)
	{
		return _db;
	}
	throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;