const mongoConnect = require('./utils/mongodb').mongoConnect;
const Product = require('./models/product');
const parse = require('./utils/parse').parse;

const parse_link = 'https://www.99.co/id/sewa/rumah/bali?hlmn=';

mongoConnect(() => {
	parse(parse_link, 0, 500, 2500, (data) => {
		if(data.url !== undefined && data.url.length > 0)
		{
			const product = new Product(data.url, data)
			.save()
			.then(result => {
				console.log('added to db: ' + data.url);
			}).catch(err => {
				console.log(err);
			});
		}
	});
});