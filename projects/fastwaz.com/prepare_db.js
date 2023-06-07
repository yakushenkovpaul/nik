const MongoClient = require('mongodb').MongoClient;
const Product = require('../../models/product');
const BasicInformation = require('./prepare_db/basicInformation');
const Features = require('./prepare_db/features');
const ProjectFeatures = require('./prepare_db/projectFeatures');
const unitInvestment = require('./prepare_db/unitInvestment');

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
        const collection = db.collection('products_rent');
				const destinationCollection = db.collection('products_rent_raw');
    
        const totalDocs = await collection.countDocuments({});
        const totalPages = Math.ceil(totalDocs / batchSize);

        let num = 0;
				//let totalFeatures = {};
				//let totalProjectFeatures = {};
				//let totalBasicInformation = {};
				//let totalUnitInvestment = {};

        for(let page = 1; page <= totalPages; page++) {
            const products = await collection.find({}).skip((page - 1) * batchSize).limit(batchSize).toArray();

            for(const product of products) {

							let preparedFeatures = Features.prepare(product.data);
							let preparedBasicInformation = BasicInformation.prepare(preparedFeatures);
							let preparedProjectFeatures = ProjectFeatures.prepare(preparedBasicInformation);
							let preparedProduct = unitInvestment.prepare(preparedProjectFeatures);

							// Insert the object into the collection
							destinationCollection.insertOne(preparedProduct, function(err, result) {
								console.assert(null, err);
								console.log("Inserted document into the destination collection");
							});

							//Features.normalize(product.data.features, totalFeatures);
							//ProjectFeatures.normalize(product.data.projectFeatures, totalProjectFeatures);
							//BasicInformation.normalize(product.data.basicInformation, totalBasicInformation);
							//unitInvestment.normalize(product.data.unitInvestment, totalUnitInvestment);

							console.log('current num: ' + num);
							num++;
            }
        }

				//Features.save('totalFeatures.json', totalBasicInformation);
				//ProjectFeatures.save('totalFeatures.json', totalBasicInformation);
				//BasicInformation.save('totalBasicInformation.json', totalBasicInformation);
				//unitInvestment.save('totalUnitInvestment.json', totalUnitInvestment);

        console.log(`Total number of processed products: ${num}`);

    } catch (err) {
        console.error(err);
    } finally {
       // await client.close();
    }
}