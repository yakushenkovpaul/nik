const mongoConnect = require('./utils/mongodb').mongoConnect;
const Product = require('./models/product');
//const parse = require('./utils/99.co/parse').parse;
//const parse_product = require('./utils/99.co/parse').parse_product;
const parse = require('./utils/fastwaz.com/parse').parse;
const parse_product = require('./utils/fastwaz.com/parse').parse_product;
const variables = require('./utils/args');

let start = (variables['start']) ? parseInt(variables['start']) : 1;
let limit = (variables['limit']) ? parseInt(variables['limit']) : 500;
let timeout = (variables['timeout']) ? parseInt(variables['timeout']) : 2500;
let parse_id = (variables['parse_id']) ? variables['parse_id'] : '';

let parse_links = [];

parse_links[1] = 'https://www.fazwaz.com/projects/thailand/phuket/thalang/si-sunthon/villa-qabalah';

if(!parse_id && !parse_links[parse_id])
{
	console.log('Please provide url to parse');
	return;
}

const parse_link = parse_links[parse_id];

parse_product(parse_link);

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