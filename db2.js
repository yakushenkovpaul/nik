const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

loadAndProcessProducts();

async function loadAndProcessProducts() {
    const url = 'mongodb+srv://readwrite:iddqdidkfa@cluster0.8kkr23m.mongodb.net';
    const dbName = 'fastwaz_com';
    const client = new MongoClient(url, { useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("Connected successfully to server");
    
        const db = client.db(dbName);
        const collection = db.collection('products');
    
        let num = 0;

        const processBatch = () => {
            return new Promise(async (resolve, reject) => {
                const products = await collection.find({}).skip(num).limit(10).toArray();
                if(products.length === 0) {
                    resolve(num);
                } else {
                    products.forEach(product => {
                        // process each product here
                        console.log(products[0].data.features);
                        num++;
                    });

                    processBatch().then(resolve).catch(reject);
                }
            });
        };

        const totalCount = await processBatch();
        console.log(`Total number of processed products: ${totalCount}`);

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}
