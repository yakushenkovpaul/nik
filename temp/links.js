const https = require('https');
const url = require('url');
const cheerio = require('cheerio');
const fs = require('fs');
const crypto = require('crypto');

const headers = {
	'Cookie':'cf_chl_2=804bc4ce3a7a11c; cf_clearance=C8XZTrEn2zntJRC232lxmBPCJ1j5k8H8FUxbY1EFL88-1681747378-0-250',
	'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
};

const filename = 'links.txt';
const uniq_keys = [];

fs.access(filename, (err) => {
	if (err) {
		fs.writeFile(filename, "", (err) => {
			if (err) throw err;
		});
	}
});

let index_link = 'https://www.99.co/id/jual/tanah/bali?hlmn=';

let parse = (page_url) => {

	const pageRegex = /hlmn=(\d+)/;
	const match = pageRegex.exec(page_url);
	const page = match ? parseInt(match[1]) + 1 : 1;

	https.get(page_url, { headers }, (res) => {
		let html = '';
	
		res.on('data', (chunk) => {
		html += chunk;
		});
	
		res.on('end', () => {

			console.log('Page: ' + page_url);

			//fs.writeFileSync('index.html', html);

			const $ = cheerio.load(html);

			const urls = $('a.ui-molecules-secondary-card__link');

			urls.each((index, element) => {

				let link = $(element).attr('href');

				// let bedroom = parseInt($(element).children('.ui-molecules-secondary-card__description__listview').find('img[src*="icon-bedroom.svg"]').next('p').html());
				// let bathroom = parseInt($(element).children('.ui-molecules-secondary-card__description__listview').find('img[src*="icon-bathroom.svg"]').next('p').html());
				// let buildsize = parseInt($(element).children('.ui-molecules-secondary-card__description__listview').find('img[src*="icon-build-size.svg"]').next('p').html());
				// let landsize = parseInt($(element).children('.ui-molecules-secondary-card__description__listview').find('img[src*="icon-land-size"]').next('p').html());
				// let path = url.parse(link).pathname.replace(/\d+/g, "");


				// if(!bedroom) bedroom = 1;
				// if(!bathroom) bathroom = 1;
				// if(!buildsize) buildsize = 1;
				// if(!landsize) landsize = 1;

				//let uniq_key = path+(bedroom*bathroom*buildsize*landsize);

				//if(!uniq_keys.includes(uniq_key)) {
					//uniq_keys.push(uniq_key);
					fs.appendFile(filename, link + "\n", function(err) {
						if (err) throw err;
					});
				//}
				//else {
					//console.log('dublicate: ' + link);
				//}
			});

			setTimeout(() => {
				if ($('i[aria-label="chevron_right"]').length > 0) {
					if(page < 501)
					{
						parse(index_link + page);
					}
				}
			}, 1000);
		});
	});
}

parse(index_link + 1)