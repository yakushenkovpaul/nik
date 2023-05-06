const getDb = require('../utils/mongodb').getDb;

class Product {
	constructor(url, data) {
		this.url = url;
		this.data = data;
	}

	save() {
		const db = getDb();
		return db.collection('products').insertOne(this).then(result => {
			//console.log(result);
		}).catch(err => {
			console.log(err);
		});
	}
}

module.exports = Product;