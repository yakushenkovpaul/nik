const https = require('https');
const cheerio = require('cheerio');
const ExcelJS = require('exceljs');
const fs = require('fs');
const { exit } = require('process');
const moment = require('moment');
const mongoConnect = require('./utils/mongodb').mongoConnect;
const Product = require('./models/product');

mongoConnect(() => {
	console.log('Connected!');
	const product = new Product('https://www.realestate.com.au/property-house-nsw-ashfield-1340000')
	.save()
	.then(result => {
		console.log(result);
	}).catch(err => {
		console.log(err);
	});
});


return;

const uniq_keys = [];
const filename = 'data' + moment().format('YYYYMMDD-HHmmss') +'.xlsx'
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Data');

const headers = {
	'Cookie':'cf_chl_2=7414e68572fa4ae; cf_clearance=zzqXFdbGqFilkTNEYRC3N.jPNgt3ysEfKvO0VupBFSM-1681749431-0-160',
	'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
};

// Read the file synchronously and store its contents in a variable
const linksFile = fs.readFileSync('links.txt', 'utf-8');

// Split the contents of the file into an array of links
const links = linksFile.split('\n');

let parse_product = (product_url) => {

	https.get(product_url, { headers }, (res) => {
		let product_html = '';
	
		res.on('data', (chunk) => {
			product_html += chunk;
		});
	
		res.on('end', () => {
		const $ = cheerio.load(product_html);
		const data = {};

		const jsonStr = $('#__NEXT_DATA__').text();

		if(jsonStr.length == 0)
		{
			//fs.writeFileSync('product.html', product_html);
			//exit;
		}
	
		if(jsonStr.length > 0)
		{
			const jsonObj = JSON.parse(jsonStr);
			const temp = jsonObj['props']['pageProps']['data'];

			if(temp === undefined)	
			{

			}
			else {
				data.url = product_url;

				data.updatedDate = (temp['timestamps']['updated']) ? moment.unix(temp['timestamps']['updated']).format('DD-MM-YY') : '';
				data.title = (temp['title']) ? temp['title'] : '';
				data.type = (temp['attributes']['property_type']['value']) ? temp['attributes']['property_type']['value'] : '';
				data.description = (temp['description']) ? temp['description'] : '';
				data.agent = (temp['agent']['username']) ? temp['agent']['username'] : '';
				data.province = (temp['location']['province']['name']) ? temp['location']['province']['name'] : '';
				data.city = (temp['location']['city']['name']) ? temp['location']['city']['name'] : '';
				data.district = (temp['location']['district']['name']) ? temp['location']['district']['name'] : '';
				data.address = (temp['location']['address_1']) ? temp['location']['address_1'] : '';
				data.fulladdress = (temp['full_address']) ? temp['full_address'] : '';
				data.location_lat = (temp['location_pin']['lat']) ? temp['location_pin']['lat'] : '';
				data.location_lng = (temp['location_pin']['long']) ? temp['location_pin']['long'] : '';
				data.bedrooms = (temp['attributes']['bedrooms']) ? temp['attributes']['bedrooms'] : 0;
				data.bathrooms = (temp['attributes']['bathrooms']) ? temp['attributes']['bathrooms'] : 0;
				data.floors = (temp['attributes']['floors']) ? temp['attributes']['floors'] : 0;
				data.buildSize = (temp['attributes']['builtup_area']['value']) ? temp['attributes']['builtup_area']['value'] : 0;
				data.landSize = (temp['attributes']['land_area']['value']) ? temp['attributes']['land_area']['value'] : 0;
				data.price = (temp['price']['price']) ? temp['price']['price'] : 0;
				data.price_type = (temp['attributes']['price_type']['value']) ? temp['attributes']['price_type']['value'] : '';
				data.garages = (temp['attributes']['garages']) ? temp['attributes']['garages'] : 0;
				data.carports = (temp['attributes']['carports']) ? temp['attributes']['carports'] : 0;
				data.certificate = (temp['attributes']['certificate']['value']) ? temp['attributes']['certificate']['value'] : '';
			}

			//fs.writeFileSync('product.json', jsonStr);

			//console.log(data);
			//return;

			worksheet.addRow(data);
			workbook.xlsx.writeFile(filename);
		}
		});
	}).on('error', (err) => {
		console.error(err);
	});
}

let parse = () => {

	const columns = [
		{ header: "URL", key: "url" },
		{ header: "Updated Date", key: "updatedDate" },
		{ header: "Title", key: "title" },
		{ header: "Type", key: "type" },
		{ header: "Description", key: "description" },
		{ header: "Agent", key: "agent" },
		{ header: "Province", key: "province" },
		{ header: "City", key: "city" },
		{ header: "District", key: "district" },
		{ header: "Address", key: "address" },
		{ header: "Fulladdress", key: "fulladdress" },
		{ header: "Location Latitude", key: "location_lat" },
		{ header: "Location Longitude", key: "location_lng" },
		{ header: "Bedrooms", key: "bedrooms" },
		{ header: "Bathrooms", key: "bathrooms" },
		{ header: "Floors", key: "floors" },
		{ header: "Building Size", key: "buildSize" },
		{ header: "Land Size", key: "landSize" },
		{ header: "Price", key: "price" },
		{ header: "Price type", key: "price_type" },
		{ header: "Garages", key: "garages" },
		{ header: "Carports", key: "carports" },
		{ header: "Certificate", key: "certificate" }
	];

	// // Define the headers
	worksheet.columns = columns;

	links.map((link, num) => {
		setTimeout(() => {
			console.log("current link: " + link);
			console.log("current num: " + num);
			parse_product(link);
		}, 1500 * num);
	});
}

if (fs.existsSync(filename)) {
	fs.unlinkSync(filename);
}

parse()

//parse_product('https://www.99.co/id/properti/rumah-dijual-19mily-kuta-1000449809');