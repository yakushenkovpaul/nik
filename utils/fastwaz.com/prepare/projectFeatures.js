const Functions = require('./functions');

class ProjectFeatures {

	static json = {
		"on_site_restaurant": 0,
		"communal_pool": 0,
		"communal_gym": 0,
		"clubhouse": 0,
		"h_security": 0,
		"cctv_video_surveillance": 0,
		"car_parking": 0,
		"sauna": 0,
		"reception__lobby_area": 0,
		"hotel_managed": 0,
		"jacuzzi": 0,
		"steam_room": 0,
		"indoor_kids_zone": 0,
		"direct_beach_access": 0,
		"kids_club": 0,
		"coworking_space__meeting_room": 0,
		"lounge": 0,
		"shuttle_bus": 0,
		"spa": 0,
		"communal_garden_area": 0,
		"back_up_generators": 0,
		"key_card_access": 0,
		"bar": 0,
		"laundry_facilities__dry_cleaning": 0,
		"party_hall__group_entertainment": 0,
		"attached_market__shops": 0,
		"tennis_court": 0,
		"marina": 0,
		"yoga_area": 0,
		"kids_pool": 0,
		"library__reading_room": 0,
		"massage_room": 0,
		"outdoor_kids_zone": 0,
		"bbq_area": 0,
		"cigar_lounge": 0,
		"cafe": 0,
		"pool__snooker_table": 0,
		"indoor_games_room": 0,
		"walking__running_track": 0,
		"mini_theater": 0
	}

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
			Object.entries(this.get(data.projectFeatures)).map(([key, value]) => ['projectFeatures_' + key, value])
		);

		delete data.projectFeatures;

		return {...data, ...result};
	}

	static save(filename = 'totalProjectFeatures.json', input)
	{
		Functions.saveFile(filename, input);
	}

}

module.exports = ProjectFeatures;