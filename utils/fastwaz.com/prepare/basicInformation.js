const Functions = require('./functions');

class basicInformation {

	static json = {
		"date_listed": '',
		"updated": '',
		"property_type": '',
		"floor": '',
		"bedrooms": '',
		"size": '',
		"price_per_sqm": '',
		"apartment_ownership": '',
		"furniture": '',
		"views": '',
		"cam_fee": '',
		"listed_by": '',
		"unit_id": '',
		"condo_ownership": '',
		"unit_type": '',
		"bedroom": '',
		"building": '',
		"penthouse_ownership": ''
	}

	static normalize(str, array = {}) {
		const pairs = str.split(';');
	
		for(let pair of pairs) {
				pair = pair.trim().split(':');
				if(pair.length === 2) {
						let [key, value] = pair;
						value = value.trim();
						key = key.toLowerCase().replace(/\s/g, '_').replace(/[^a-z_]/g, '');
						if(!array[key]) {
							if (key === 'date_listed') {
									let date = new Date(value);
									value = date.toLocaleDateString('en-GB');
							}
							array[key] = value;
						}
				}
		}
	
		return array;
	}

	static get(str) {
		return {...this.json, ...this.normalize(str)};
	}

	static prepare(data)
	{
		let result = Object.fromEntries(
			Object.entries(this.get(data.basicInformation)).map(([key, value]) => ['basicInformation_' + key, value])
		);

		delete data.basicInformation;

		return {...data, ...result};
	}

	static save(filename = 'totalBasicInformation.json', input)
	{
		Functions.saveFile(filename, input);
	}
}

module.exports = basicInformation;