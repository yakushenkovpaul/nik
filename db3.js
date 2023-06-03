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

        for(let page = 1; page <= 1; page++) {
            const products = await collection.find({}).skip((page - 1) * batchSize).limit(batchSize).toArray();

            for(const product of products) {
                // process each product here

								features = normalizeString(product.data.features, totalFeatures);

                console.log(product.data.id);
                console.log(features);
                num++;
            }
        }

        console.log(totalFeatures);
        console.log(`Total number of processed products: ${num}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}


function normalizeString(str, array) {
	str = str.toLowerCase();
	str = str.replace(/\s/g, '_');
	str = str.replace(/[^a-z_,]/g, '');

	const phrases = str.split(',');
	const obj = {};

	for(let phrase of phrases) {
			phrase = phrase.trim();
			phrase = phrase.replace(/^_+|_+$/g, '');
			if(!)
			obj[phrase] = 1;
	}

	return obj;
}