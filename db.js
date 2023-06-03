const mongoConnect = require('./utils/mongodb').mongoConnect;
const getDb = require('./utils/mongodb').getDb;

mongoConnect(async() => {
	const db = getDb();

	const limit = 1;
	const total = await db.collection('products').countDocuments();
	const pages = Math.ceil(total / limit);
	
	console.log(total);
	console.log(pages);

	const result = await getProducts(db, pages, limit);

	console.log('end2');
});

async function getProducts(db, pages, limit) {

	let featuresList = {};


	

	for(let page = 1; page <= 2; page++) {
		const skip = (page - 1) * limit;

		db.collection('products').find().skip(skip).limit(limit).toArray().then(
			products => {
				var features = {};
				features = transformString(products[0].data.features);
				console.log(products[0].data.features);
				//console.log(features);

				Object.keys(features).forEach(feature => {
					//if (!featuresList[feature]) {
						featuresList[feature] = 1;
					//}
				});
			}
		).catch(err => {
			console.log(err);
		}
		);
	}
	console.log('end');
	return featuresList;
}

function transformString(string, separator = ',') {
	// Split the string into an array
	const array = string.split(separator);

	// Convert the array into an object
	const object = array.reduce((obj, item) => {
			// Trim leading/trailing spaces, convert to lower case, remove special characters and assign a value of 1
			let key = item.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "_");
			obj[key] = 1;
			return obj;
	}, {});

	return object;
}