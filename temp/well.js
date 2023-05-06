const https = require('https');
const cheerio = require('cheerio');
const ExcelJS = require('exceljs');
const fs = require('fs');


const uniq_keys = [];
const filename = 'data.xlsx'
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Data');

const headers = {
	'cookie':'cf_clearance=vbFQXk0VGZz4zjQNSkWQl8uOKRDul67v6Qohac_.avE-1681132506-0-160',
	'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
};

let parse = () => {

	const columns = [
		{ header: "URL", key: "url" },
		{ header: "Short ID", key: "shortId" },
		{ header: "Updated Date", key: "updatedDate" },
		{ header: "Title", key: "title" },
		{ header: "Type", key: "type" },
		{ header: "Listing", key: "listing" },
		{ header: "Description", key: "description" },
		{ header: "Agent", key: "agent" },
		{ header: "Agent Phone", key: "agent_phone" },
		{ header: "Agent Phone 2", key: "agent_phone2" },
		{ header: "Agent Email", key: "agent_email" },
		{ header: "Agent Website", key: "agent_website" },
		{ header: "Location", key: "location" },
		{ header: "Location Latitude", key: "location_lat" },
		{ header: "Location Longitude", key: "location_lng" },
		{ header: "Bedrooms", key: "bedrooms" },
		{ header: "Bathrooms", key: "bathrooms" },
		{ header: "Floors", key: "floors" },
		{ header: "Building Size", key: "buildingSize" },
		{ header: "Land Size", key: "landSize" },
		{ header: "Price", key: "price" },
		{ header: "Garages", key: "garages" },
		{ header: "Carports", key: "carports" },
		{ header: "Certificate", key: "certificate" }
	];

	// Define the headers
	worksheet.columns = columns;

	https.get('https://www.99.co/id/jual/rumah/bali?hlmn=11', { headers }, (res) => {
		let html = '';
	
		res.on('data', (chunk) => {
		html += chunk;
		});
	
		res.on('end', () => {

			//fs.writeFileSync('index.html', html);

			const $ = cheerio.load(html);
			const urls = $('a.ui-molecules-secondary-card__link');
			
			urls.each((index, link) => {
				let url = $(link).attr('href');

				https.get(url, { headers }, (res) => {
					let html = '';
				
					res.on('data', (chunk) => {
					html += chunk;
					});
				
					res.on('end', () => {
					const $ = cheerio.load(html);
					const data = {};
				
					const jsonStr = $('#ui__data').text();
				
					if(jsonStr.length > 0)
					{
						const jsonObj = JSON.parse(jsonStr);
				
						data.url = (jsonObj['ListingReducer']['data']['url']) ? jsonObj['ListingReducer']['data']['url'] : '';
						data.shortId = (jsonObj['ListingReducer']['data']['shortId']) ? jsonObj['ListingReducer']['data']['shortId'] : '';
						data.updatedDate = (jsonObj['ListingReducer']['data']['updatedDate']) ? jsonObj['ListingReducer']['data']['updatedDate'] : '';
						data.title = (jsonObj['ListingReducer']['data']['title']) ? jsonObj['ListingReducer']['data']['title'] : '';
						data.type = (jsonObj['ListingReducer']['data']['type']) ? jsonObj['ListingReducer']['data']['type'] : '';
						data.listing = (jsonObj['ListingReducer']['data']['listing']) ? jsonObj['ListingReducer']['data']['listing'] : '';
						data.description = (jsonObj['ListingReducer']['data']['description']) ? jsonObj['ListingReducer']['data']['description'] : '';
						data.agent = (jsonObj['ListingReducer']['data']['agent']['name']) ? jsonObj['ListingReducer']['data']['agent']['name'] : '';
						data.agent_phone = (jsonObj['ListingReducer']['data']['agent']['contact']['telephone']) ? jsonObj['ListingReducer']['data']['agent']['contact'] ['telephone']: '';
						data.agent_phone2 = (jsonObj['ListingReducer']['data']['agent']['contact']['telephone2']) ? jsonObj['ListingReducer']['data']['agent']['contact'] ['telephone2']: '';
						data.agent_email = (jsonObj['ListingReducer']['data']['agent']['contact']['email']) ? jsonObj['ListingReducer']['data']['agent']['contact'] ['email']: '';
						data.agent_website = (jsonObj['ListingReducer']['data']['agent']['contact']['website']) ? jsonObj['ListingReducer']['data']['agent']['contact'] ['website']: '';
						data.location = (jsonObj['ListingReducer']['data']['location']['address']) ? jsonObj['ListingReducer']['data']['location']['address'] : '';
						
						data.location_lat = (jsonObj['ListingReducer']['data']['location']['coordinate']['lat']) ? jsonObj['ListingReducer']['data']['location']['coordinate']['lat'] : '';
						data.location_lng = (jsonObj['ListingReducer']['data']['location']['coordinate']['lng']) ? jsonObj['ListingReducer']['data']['location']['coordinate']['lng'] : '';
						
						data.bedrooms = (jsonObj['ListingReducer']['data']['attributes']['bedrooms']) ? jsonObj['ListingReducer']['data']['attributes']['bedrooms'] : 0;
						data.bathrooms = (jsonObj['ListingReducer']['data']['attributes']['bathrooms']) ? jsonObj['ListingReducer']['data']['attributes']['bathrooms'] : 0;
						data.floors = (jsonObj['ListingReducer']['data']['attributes']['floors']) ? jsonObj['ListingReducer']['data']['attributes']['floors'] : 0;
						data.buildingSize = (jsonObj['ListingReducer']['data']['attributes']['buildingSize']) ? parseInt(jsonObj['ListingReducer']['data']['attributes']['buildingSize']) : 0;
						data.landSize = (jsonObj['ListingReducer']['data']['attributes']['landSize']) ? parseInt(jsonObj['ListingReducer']['data']['attributes']['landSize']) : 0;
						data.price = (jsonObj['ListingReducer']['data']['attributes']['price']) ? jsonObj['ListingReducer']['data']['attributes']['price'] : 0;
						data.garages = (jsonObj['ListingReducer']['data']['attributes']['garages']) ? jsonObj['ListingReducer']['data']['attributes']['garages'] : 0;
						data.carports = (jsonObj['ListingReducer']['data']['attributes']['carports']) ? jsonObj['ListingReducer']['data']['attributes']['carports'] : 0;
						data.certificate = (jsonObj['ListingReducer']['data']['formattedAttributes']['certificate']['value']) ? jsonObj['ListingReducer']['data']['formattedAttributes']['certificate']['value'] : '';
					
						//console.log(data);

						let uniq_key = data.buildingSize*data.landSize*data.bedrooms*data.bathrooms;

						if(uniq_key > 0)
						{
							if(!uniq_keys.includes(uniq_key)) 
							{
								uniq_keys.push(uniq_key);

								// Add the row to the worksheet
								worksheet.addRow(data);

								console.log('add url > ' + data.url + 'to filename > ' + filename);


								workbook.xlsx.writeFile(filename);
							}
						}
					}
					});
				}).on('error', (err) => {
					console.error(err);
				});


			});

		});
	});
}

if (fs.existsSync(filename)) {
	fs.unlinkSync(filename);
}

parse();

//})