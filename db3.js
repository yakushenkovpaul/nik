const fs = require('fs');
const { subDays, format } = require('date-fns');
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
        const collection = db.collection('products');
    
        const totalDocs = await collection.countDocuments({});
        const totalPages = Math.ceil(totalDocs / batchSize);

        let num = 0;
				let totalFeatures = {};
				let totalProjectFeatures = {};

        for(let page = 1; page <= 1; page++) {
            const products = await collection.find({}).skip((page - 1) * batchSize).limit(batchSize).toArray();

            for(const product of products) {
								normalizeString(product.data.features, totalFeatures);
								normalizeString(product.data.projectFeatures, totalProjectFeatures);

								console.log(product.data.basicInformation);

								let preparedBasicInformation = normalizeBasicInformation(product.data.basicInformation);
								console.log(preparedBasicInformation);
                num++;
            }
        }

				fs.writeFile('totalFeatures.json', JSON.stringify(totalFeatures, null, 2), (err) => {
					if (err) {
							console.error(err);
					} else {
							console.log('totalFeatures written to file');
					}
				});

				fs.writeFile('totalProjectFeatures.json', JSON.stringify(totalProjectFeatures, null, 2), (err) => {
					if (err) {
							console.error(err);
					} else {
							console.log('totalProjectFeatures written to file');
					}
				});

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

function normalizeBasicInformation(str) {
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

					if (key === 'updated') {
						if(value.includes('day ago')) {
								const daysAgo = Number(value.split(' ')[0]);
								let date = subDays(new Date(), daysAgo);
								value = format(date, 'dd/MM/yyyy');
						}
				}
					
					obj[key] = value;
			}
	}

	return obj;
}