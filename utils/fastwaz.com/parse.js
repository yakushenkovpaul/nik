const https = require('https');
const cheerio = require('cheerio');
const moment = require('moment');
const headers = require('../fastwaz.com/headers');
const fs = require('fs');

//const filename = 'parse.txt';

// if (fs.existsSync(filename)) {
// 	fs.unlink('parse.txt', (err) => {
// 		if (err) throw err;
// 	})
// };

let parse = (parse_link, parse_page, limit, timeout, callback) => {

	let current_parse_link = parse_link + parse_page;

	const pageRegex = /page=(\d+)/;
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

			const urls = $('div.site-map-item').find('a');

			let num = urls.length;

			console.log('num: ' + num);
			return;

			if(num === 0)
			{
				console.log('There is no data in this page. Plz check your settings');
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
								if ($('i.page-item pagination-next-nav').length > 0) {
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

	https.get(product_url, { headers }, (res) => {
		let product_html = '';
	
		res.on('data', (chunk) => {
			product_html += chunk;
		});
	
		res.on('end', () => {

		// fs.writeFile('product.html', product_html, (err) => {
		// 	if (err) throw err;
		// 	console.log('The file has been saved!');
		// });

		const $ = cheerio.load(product_html);
		const data = {};

		data.url = product_url;
		data.title = clearString($('h1').text().trim());
		//data.information = clearString($('.about-project__text-description').text().trim());
		data.information = $('.about-project').text().trim();
		data.area_information = $('.google-map-api-inner').text().trim();
		data.location = $('div.project-location').text().trim();
		
		getTopDetails($, data);
	
		data.sale_units = $('div.header-detail-page-price:contains("For Sale")').find('small.header-detail-page-price__count-units').text().trim();;
		data.sale_price = $('div.header-detail-page-price:contains("For Sale")').find('span.header-detail-page-price__rate').text().trim();
		data.rent_units = $('div.header-detail-page-price:contains("For Rent")').find('small.header-detail-page-price__count-units').text().trim();;
		data.rent_price = $('div.header-detail-page-price:contains("For Rent")').find('span.header-detail-page-price__rate').text().trim();
		data.developer = $('a.developer-info__developer-all').attr('href');
	
	
		data.leisure = getFacilities($, 'Leisure');
		data.fitness = getFacilities($, 'Fitness');
		data.convenience = getFacilities($, 'Convenience');
		data.safety = getFacilities($, 'Safety');
		data.parking = getParking($, 'Parking & Lift');
		data.managment = getManagment($, 'Management');
		data.address = getAdress(product_html);
		data.payment_plan = getPaymentPlan($, data);

		if(data.address !== '')
		{
			callback(data);
		}
		else
		{
			console.log('There is no address in this page. Plz check your settings');
		}
		});
	}).on('error', (err) => {
		console.error(err);
	});
}

exports.parse = parse;
exports.parse_product = parse_product;




















//addition functions

const getAdress = (html) => {
	let match = html.match(/"streetAddress":"(.*?)"/);
	return match ? match[1] : null;
}

const getPaymentPlan = ($, data) => {
	let array = [];
	$('.project-payment__body').each(function(i, elem) {
		array.push($(this).text().trim());
	});
	return array.join(', ');
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
			case 'completed':
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

const getFacilities = ($, input) => {
	let array = [];
	// Find the 'Leisure' section
	let result = $('.project-features-body').filter(function() {
		return $(this).find('.project-features-body__title').text().trim() === input;
	});
	
	// Find and iterate over each feature in the section
	result.find('.project-features-item').each(function(i, elem) {
		// Get the feature text and add it to the array
		array.push($(this).text().trim());
	});
	
	// Convert the array to a string, with features separated by commas
	return array.join(', ');
}

const getManagment = ($, input) => {
	let array = [];
	let result = $('.table-management').filter(function() {
		return $(this).find('.management-title').text().trim() === input;
	});
	
	// Find and iterate over each feature in the section
	result.find('.col-management').each(function(i, elem) {
    let spanText = $(this).clone().children('.features-tooltip-icon, .features-tooltip-inner').remove().end().text().trim().replace(/\n/g, '').replace(':', ': ');
    array.push(spanText);
	});
	
	// Convert the array to a string, with features separated by commas
	return array.join(', ');
}

const getParking = ($, input) => {
	let array = [];
	let result = $('.table-category').filter(function() {
		return $(this).find('.category-title').text().trim() === input;
	});
	
	// Find and iterate over each feature in the section
	result.find('.col-features').each(function(i, elem) {
		array.push($(this).text().trim().replace(/\n/g, ''));
	});
	
	// Convert the array to a string, with features separated by commas
	return array.join(', ');
}

const clearString = (input) => {
	return input.replace(/\n/g, '').replace(/\s\s+/g, ' ').trim();
}