const fs = require('fs');
const { subDays, subWeeks, subMonths, format } = require('date-fns');
const MongoClient = require('mongodb').MongoClient;

loadAndProcessProducts();

async function loadAndProcessProducts() {
    const url = 'mongodb+srv://readwrite:iddqdidkfa@cluster0.8kkr23m.mongodb.net';
    const dbName = 'fastwaz_com';
    const batchSize = 10;
    const client = new MongoClient(url, { useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("Connected successfully to server");
    
        const db = client.db(dbName);
        const collection = db.collection('raw_products');
    
        const totalDocs = await collection.countDocuments({});
        const totalPages = Math.ceil(totalDocs / batchSize);

        let num = 0;
				let totalFeatures = {};
				let totalProjectFeatures = {};
				let totalBasicInformation = {};

        for(let page = 1; page <= totalPages; page++) {
            const products = await collection.find({}).skip((page - 1) * batchSize).limit(batchSize).toArray();

            for(const product of products) {

								let preparedBasicInformation = getBasicInformation(product.data.basicInformation);

								product.data.bi_date_listed = (preparedBasicInformation.date_listed) ? preparedBasicInformation.date_listed : '';
								product.data.bi_updated = (preparedBasicInformation.updated) ? preparedBasicInformation.updated : '';
								product.data.bi_property_type = (preparedBasicInformation.property_type) ? preparedBasicInformation.property_type : '';
								product.data.bi_floor = (preparedBasicInformation.floor) ? preparedBasicInformation.floor : '';
								product.data.bi_bedrooms = (preparedBasicInformation.bedrooms) ? preparedBasicInformation.bedrooms : '';
								product.data.bi_size = (preparedBasicInformation.size) ? preparedBasicInformation.size : '';
								product.data.bi_price_per_sqm = (preparedBasicInformation.price_per_sqm) ? preparedBasicInformation.price_per_sqm : '';
								product.data.bi_apartment_ownership = (preparedBasicInformation.apartment_ownership) ? preparedBasicInformation.apartment_ownership : '';
								product.data.bi_furniture = (preparedBasicInformation.furniture) ? preparedBasicInformation.furniture	 : '';
								product.data.bi_views = (preparedBasicInformation.views) ? preparedBasicInformation.views : '';
								product.data.bi_cam_fee = (preparedBasicInformation.cam_fee) ? preparedBasicInformation.cam_fee : '';
								product.data.bi_listed_by = (preparedBasicInformation.listed_by) ? preparedBasicInformation.listed_by : '';
								product.data.bi_unit_id = (preparedBasicInformation.unit_id) ? preparedBasicInformation.unit_id : '';
								product.data.bi_condo_ownership = (preparedBasicInformation.condo_ownership) ? preparedBasicInformation.condo_ownership : '';
								product.data.bi_unit_type = (preparedBasicInformation.unit_type) ? preparedBasicInformation.unit_type	 : '';
								product.data.bi_bedroom = (preparedBasicInformation.bedroom) ? preparedBasicInformation.bedroom : '';
								product.data.bi_building = (preparedBasicInformation.building) ? preparedBasicInformation.building : '';
								product.data.bi_penthouse_ownership = (preparedBasicInformation.penthouse_ownership) ? preparedBasicInformation.penthouse_ownership : '';

								delete product.data.basicInformation;

								console.log(product);
								return;

								//normalizeString(product.data.features, totalFeatures);
								//normalizeString(product.data.projectFeatures, totalProjectFeatures);
								//normalizeBasicInformation(product.data.basicInformation, totalBasicInformation);

								//let preparedBasicInformation = getBasicInformation(product.data.basicInformation);
								//console.log(preparedBasicInformation);

								console.log('current num: ' + num);
                num++;
            }
        }

				// fs.writeFile('totalFeatures.json', JSON.stringify(totalFeatures, null, 2), (err) => {
				// 	if (err) {
				// 			console.error(err);
				// 	} else {
				// 			console.log('totalFeatures written to file');
				// 	}
				// });

				// fs.writeFile('totalProjectFeatures.json', JSON.stringify(totalProjectFeatures, null, 2), (err) => {
				// 	if (err) {
				// 			console.error(err);
				// 	} else {
				// 			console.log('totalProjectFeatures written to file');
				// 	}
				// });

				// fs.writeFile('totalBasicInformation.json', JSON.stringify(totalBasicInformation, null, 2), (err) => {
				// 	if (err) {
				// 			console.error(err);
				// 	} else {
				// 			console.log('totalBasicInformation written to file');
				// 	}
				// });

        console.log(`Total number of processed products: ${num}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}


function normalizeString(str, array = {}) {
	str = str.toLowerCase();
	str = str.replace(/\s/g, '_');
	str = str.replace(/[^a-z_,]/g, '');

	const phrases = str.split(',');

	for(let phrase of phrases) {
			phrase = phrase.trim();
			phrase = phrase.replace(/^_+|_+$/g, '');
			if(!array[phrase]) {
				array[phrase] = 1;
			}
	}

	return array;
}

function normalizeBasicInformation(str, array = {}) {
	const pairs = str.split(';');

	for(let pair of pairs) {
			pair = pair.trim().split(':');
			if(pair.length === 2) {
					let [key, value] = pair;
					key = key.toLowerCase().replace(/\s/g, '_').replace(/[^a-z_]/g, '');
					if(!array[key]) {
						array[key] = 1;
					}
			}
	}

	return array;
}

function getBasicInformation(str) {
	const pairs = str.split(';');
	const obj = {};

	for(let pair of pairs) {
			pair = pair.trim().split(':');
			if(pair.length === 2) {
					let [key, value] = pair;
					key = key.toLowerCase().replace(/\s/g, '_').replace(/[^a-z_]/g, '');
					value = value.trim();

					if (key === 'date_listed') {
							let date = new Date(value);
							value = date.toLocaleDateString('en-GB');
					}
					
					obj[key] = value;
			}
	}

	return obj;
}