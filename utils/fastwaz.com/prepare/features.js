const Functions = require('./functions');

class Features {

	static json = {
		"corner_unit": 0,
		"balcony": 0,
		"full_western_kitchen": 0,
		"washing_machine": 0,
		"microwave": 0,
		"oven": 0,
		"tv": 0,
		"private_pool": 0,
		"pool_access": 0,
		"wifi_included": 0,
		"fully_renovated": 0,
		"renovated_bathroom": 0,
		"truevision": 0,
		"garden_access": 0,
		"duplex": 0,
		"jacuzzi": 0,
		"rooftop_terrace": 0,
		"terrace": 0,
		"covered_parking": 0,
		"outdoor_showers": 0,
		"bathtub": 0,
		"private_gym": 0,
		"private_sauna": 0,
		"maids_quarters": 0,
		"beach_access": 0,
		"oceanfront": 0,
		"private_garden": 0,
		"renovated_kitchen": 0,
		"cable_tv": 0,
		"private_lift": 0,
		"gardening_included": 0,
		"pool_cleaning_included": 0,
		"beachfront": 0,
		"ocean_access": 0,
		"pool_lounge": 0,
		"media_roomcinema": 0,
		"wet_bar": 0,
		"rooftop_garden": 0
	};

	static normalize(str, array = {}) {
		str = str.toLowerCase();
		str = str.replace(/\s/g, '_');
		str = str.replace(/[^a-z_,]/g, '');
	
		const phrases = str.split(',');
	
		for(let phrase of phrases) {
				phrase = phrase.trim();
				phrase = phrase.replace(/^_+|_+$/g, '');
				if(!array[phrase]) {
					array[phrase] = 1;
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
			Object.entries(this.get(data.features)).map(([key, value]) => ['features_' + key, value])
		);

		delete data.features;

		return {...data, ...result};
	}

	static save(filename = 'totalFeatures.json', input)
	{
		Functions.saveFile(filename, input);
	}
}

module.exports = Features;