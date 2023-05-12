const https = require('https');
const cheerio = require('cheerio');
const moment = require('moment');
const headers = require('../99.co/headers');
const fs = require('fs');

//const filename = 'parse.txt';

// if (fs.existsSync(filename)) {
// 	fs.unlink('parse.txt', (err) => {
// 		if (err) throw err;
// 	})
// };

let parse = (parse_link, parse_page, limit, timeout, callback) => {

	let current_parse_link = parse_link + parse_page;

	const pageRegex = /hlmn=(\d+)/;
	const match = pageRegex.exec(current_parse_link);
	const nextpage = match ? parseInt(match[1]) + 1 : 1;

	https.get(current_parse_link, { headers }, (res) => {
		let html = '';
	
		res.on('data', (chunk) => {
		html += chunk;
		});
	
		res.on('end', () => {

			console.log('Page: ' + current_parse_link);

			// fs.appendFile(filename, current_parse_link + "\n", function(err) {
			// 	if (err) throw err;
			// });

			const $ = cheerio.load(html);

			const urls = $('a.ui-molecules-secondary-card__link');

			let num = urls.length;

			if(num === 0)
			{
				console.log('There is no data in this page. Update headers.js');
			}

			if(num > 0) {
				urls.each((index, element) => {
					setTimeout(() => {
						num--
						let link = $(element).attr('href');
						parse_product(link, (data) => {
							callback(data);
						});
						if(num === 0)
						{
							setTimeout(() => {
								if ($('i[aria-label="chevron_right"]').length > 0) {
									if(nextpage < limit)
									{
										parse(parse_link, nextpage, limit, timeout, callback);
									}
								}
							}, timeout);
						}
	
					}, timeout * index);
				});
			}
		});
	});
}

const parse_product = (product_url, callback) => {

	//load product html file to variable, write function
	const product_html = fs.readFileSync('product.html', 'utf8');
	const $ = cheerio.load(product_html);
	const data = {};

	data.url = product_url;
	data.title = $('h1').text().trim();
	data.location = $('div.project-location').text().trim();
	
	getTopDetails($, data);

	data.sale_units = $('div.header-detail-page-price:contains("For Sale")').find('small.header-detail-page-price__count-units').text().trim();;
	data.sale_price = $('div.header-detail-page-price:contains("For Sale")').find('span.header-detail-page-price__rate').text().trim();
	data.rent_units = $('div.header-detail-page-price:contains("For Rent")').find('small.header-detail-page-price__count-units').text().trim();;
	data.rent_price = $('div.header-detail-page-price:contains("For Rent")').find('span.header-detail-page-price__rate').text().trim();


	data.leisure = getFacilities($, 'Leisure');
	data.fitness = getFacilities($, 'Fitness');
	data.convenience = getFacilities($, 'Convenience');
	data.safety = getFacilities($, 'Safety');
	data.parking = getManagment($, 'Parking &amp; Lift');





	
	console.log(data);

	return;

	https.get(product_url, { headers }, (res) => {
		let product_html = '';
	
		res.on('data', (chunk) => {
			product_html += chunk;
		});
	
		res.on('end', () => {

		fs.writeFile('product.html', product_html, (err) => {
			if (err) throw err;
			console.log('The file has been saved!');
		});

		return;

		const $ = cheerio.load(product_html);
		const data = {};

		const jsonStr = $('#__NEXT_DATA__').text();
	
		if(jsonStr.length > 0)
		{
			const jsonObj = JSON.parse(jsonStr);
			const temp = jsonObj['props']['pageProps']['data'];

			if(temp === undefined)	
			{
				callback(data);
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

			callback(data);
		}
		});
	}).on('error', (err) => {
		console.error(err);
	});
}


const getTopDetails = ($, data) => {
	$('.header-detail-page__right .property-info-element').each(function(i, elem) {

		let key = $(this).find('small').text().trim().replace(' ', '').toLowerCase();
		let value = $(this).clone().children().remove().end().text().trim();
	
		switch(key) {
			case 'offplan':
				data.date = value;
				data.status = key;
				break;
			case 'units':
				data.units = $(this).find("span#resultTotalUnit").text().trim();
				break;
			default:
				data[key] = value;
				break;
		}	
	});
}


const getFacilities = ($, facility) => {
	let array = [];
	// Find the 'Leisure' section
	let result = $('.project-features-body').filter(function() {
		return $(this).find('.project-features-body__title').text().trim() === facility;
	});
	
	// Find and iterate over each feature in the section
	result.find('.project-features-item').each(function(i, elem) {
		// Get the feature text and add it to the array
		array.push($(this).text().trim());
	});
	
	// Convert the array to a string, with features separated by commas
	return array.join(', ');
}

const getManagment = ($, facility) => {
	let array = [];
	let result = $('.table-management').filter(function() {
		return $(this).find('.management-title').text().trim() === facility;
	});
	
	// Find and iterate over each feature in the section
	result.find('.col-management').each(function(i, elem) {
		// Get the feature text and add it to the array
		array.push($(this).text().trim());
	});
	
	// Convert the array to a string, with features separated by commas
	return array.join(', ');
}

exports.parse = parse;
exports.parse_product = parse_product;