const mongoConnect = require('../../utils/mongodb').mongoConnect;
const Product = require('../../models/product');
const parse = require('./condo_sale/parse').parse;
const parse_product = require('./condo_sale/parse').parse_product;
const variables = require('../../utils/args');

let start = (variables['start']) ? parseInt(variables['start']) : 1;
let limit = (variables['limit']) ? parseInt(variables['limit']) : 500;
let timeout = (variables['timeout']) ? parseInt(variables['timeout']) : 2500;
let parse_id = (variables['parse_id']) ? variables['parse_id'] : '';

let parse_links = [];

parse_links[1] = 'https://www.fazwaz.com/property-for-sale/thailand/phuket?type=condo,apartment,penthouse&order_by=rank|asc&page=';

if(!parse_id && !parse_links[parse_id])
{
	console.log('Please provide url to parse');
	return;
}

const parse_link = parse_links[parse_id];

//parse(parse_link, start, limit, timeout, (data) => {});

//parse_product(parse_link, (data)=>{ console.log(data) });

//return;

mongoConnect(() => {
	parse(parse_link, start, limit, timeout, (data) => {
		if(data.url !== undefined && data.url.length > 0)
		{
			const product = new Product(data.url, data, 'products_sale')
			.save()
			.then(result => {
				console.log('added to db: ' + data.url);
			}).catch(err => {
				console.log(err);
			});
		}
	});
});