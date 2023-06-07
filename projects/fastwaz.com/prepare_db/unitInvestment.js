const Functions = require('./functions');

class unitInvestment {

	static json = {
		"sale_price": "",
		"cam_fee": "",
		"rent": "",
		"pricetorent_ratio": "",
		"rental_yield": "",
		"guaranteed_rental_return": "",
		"guarantee_duration": "",
		"est_rent": ""
	};

	static normalize(str, array = {}) {

		const pairs = str.replace(/(\d),(\d)/g, '$1$2').split(',');
	
		for(let pair of pairs) {
				pair = pair.trim().split(':');
				if(pair.length === 2) {
						let [key, value] = pair;
						value = value.trim();
						key = key.toLowerCase().replace(/\s/g, '_').replace(/[^a-z_]/g, '');
						if(!array[key]) {
							array[key] = value;
						}
				}
		}
	
		return array;
	}

	static get(str)
	{
		return {...this.json, ...this.normalize(str)};
	}

	static prepare(data)
	{
		let result = Object.fromEntries(
			Object.entries(this.get(data.unitInvestment)).map(([key, value]) => ['unitInvestment_' + key, value])
		);

		delete data.unitInvestment;

		return {...data, ...result};
	}

	static save(filename = 'unitInvestment.json', input)
	{
		Functions.saveFile(filename, input);
	}
}

module.exports = unitInvestment;