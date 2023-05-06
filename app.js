const mongoConnect = require('./utils/mongodb').mongoConnect;
const Product = require('./models/product');
const parse = require('./utils/parse').parse;
const variables = require('./utils/args');

let start = (variables['start']) ? parseInt(variables['start']) : 1;
let limit = (variables['limit']) ? parseInt(variables['limit']) : 500;
let timeout = (variables['timeout']) ? parseInt(variables['timeout']) : 2500;
let parse_link = (variables['parse_url']) ? variables['parse_url'] : '';

if(!parse_link)
{
	//https://www.99.co/id/jual/rumah/bali?harga_maks=1,25mily&hlmn=
	console.log('Please provide url to parse');
	return;
}

mongoConnect(() => {
	parse(parse_link, start, limit, timeout, (data) => {
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