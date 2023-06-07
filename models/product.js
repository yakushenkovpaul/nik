const getDb = require('../utils/mongodb').getDb;

class Product {
	constructor(url, data, db) {
		this.url = url;
		this.data = data;

		if(db)
		{
			this.db = db;
		}
		else 
		{
			this.db = 'products';
		}
	}

	save() {
		const db = getDb();
		return db.collection(this.db).insertOne(this).then(result => {
			//console.log(result);
		}).catch(err => {
			console.log(err);
		});
	}
}

module.exports = Product;