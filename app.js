const mongoConnect = require('./utils/mongodb').mongoConnect;
const Product = require('./models/product');
const parse = require('./utils/parse').parse;
const variables = require('./utils/args');

let start = (variables['start']) ? parseInt(variables['start']) : 1;
let limit = (variables['limit']) ? parseInt(variables['limit']) : 500;
let timeout = (variables['timeout']) ? parseInt(variables['timeout']) : 2500;
let parse_id = (variables['parse_id']) ? variables['parse_id'] : '';

let parse_links = [];

parse_links[1] = 'https://www.99.co/id/jual/rumah/bali?harga_min=1,25mily&harga_maks=2mily&hlmn=';
parse_links[2] = 'https://www.99.co/id/jual/rumah/bali?harga_min=2mily&harga_maks=3mily&hlmn=';
parse_links[3] = 'https://www.99.co/id/jual/rumah/bali?harga_min=3mily&harga_maks=4,80mily&hlmn=';
parse_links[4] = 'https://www.99.co/id/jual/rumah/bali?harga_min=4,80mily&harga_maks=9,50mily&hlmn=';
parse_links[5] = 'https://www.99.co/id/jual/rumah/bali?harga_min=9,50mily&hlmn=';


if(!parse_id && !parse_links[parse_id])
{
	console.log('Please provide url to parse');
	return;
}

const parse_link = parse_links[parse_id];

console.log('Start parsing from: ' + parse_link + start + ' to ' + limit);
return;

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