const https = require('https');
const cheerio = require('cheerio');
const moment = require('moment');
const headers = require('./headers');
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

			//const urls = $('a.link-unit');

			const urls = $('div.result-search__item').find('a.link-unit');

			let num = urls.length;

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
								//if ($('i.page-item pagination-next-nav').length > 0) {
									if(nextpage < limit)
									{
										parse(parse_link, nextpage, limit, timeout, callback);
									}
								//}
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
		data.id = clearString($('.unit-info-element__item__unit-id').text().trim());
		data.location = $('.project-location').text().trim();
		getTopDetails($, data);
		data.price = $('div.gallery-unit-rent-price__price').contents().not('.gallery-unit-rent-price__more-price').not('.gallery-unit-rent-price__price-reduce').text().trim();
		data.price_3_6_months = $('li.monthly-rent-list__item:contains("3 - 6 Month contract")').find(".monthly-rent-list__item__price").contents().text().trim();
		data.price_monthly = $('li.monthly-rent-list__item:contains("Monthly contract")').find(".monthly-rent-list__item__price").contents().text().trim();
		
	
		data.price_special = $('li.monthly-rent-list__sub-item').find(".monthly-rent-list__sub-item__price").contents().text().trim();
		data.price_special_text = $('li.monthly-rent-list__sub-item').contents().not('.monthly-rent-list__sub-item__price').text().trim();
		
		
		data.features = getFeatures($);
		data.basicInformation = getBasicInformation($);
		data.project_name = $('a.project-information-info:first').text().trim();
		data.unitInvestment = getUnitInvestment($);
		data.projectFeatures = getProjectFeatures($);


		if(data.id !== '')
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

const getFeatures = ($) => {
	let temp_features = [];
	$('span.unit-features__item').each(function(i, elem) {
		let text = $(this).text().trim();
		if (text.length > 0) {
			temp_features.push(text);
		}
	});
	return temp_features.join(', ')
}

const getProjectFeatures = ($) => {
	let temp_features = [];
	$('div.project-features__item').each(function(i, elem) {
		let text = $(this).text().trim();
		if (text.length > 0) {
			temp_features.push(text);
		}
	});
	return temp_features.join(', ')
}

const getBasicInformation = ($) => {
	let result = [];
	$('.basic-information__item').each(function(i, elem) {
		$(this).find('.basic-information__tooltip-message').remove();
		let key = $(this).find('.basic-information-topic').text().trim();
		let value = $(this).find('.basic-information-info').text().trim();
		if (key.length > 0 && value.length > 0 && value != "N/A") {
				result.push(`${key}: ${value}`);
		}
	});
	return result.join('; ');
}

const getUnitInvestment = ($) => {
	let result = [];
	$('.unit-new-investment__text').each(function(i, elem) {
		$(this).find('.new-investment__tooltip-message').remove();
		let key = $(this).find('.new-investment-topic').text().trim();
		let value = $(this).find('.new-investment-value').text().trim();
		if (key.length > 0 && value.length > 0) {
				result.push(`${key}: ${value}`);
		}
	});
	return result.join(', ');
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

const clearString = (input) => {
	return input.replace(/\n/g, '').replace(/\s\s+/g, ' ').trim();
}