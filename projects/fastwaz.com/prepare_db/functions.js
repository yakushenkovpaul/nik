const fs = require('fs');

class Functions {
	
	static saveFile(filename = 'default.json', input)
	{
		fs.writeFile(filename, JSON.stringify(input, null, 2), (err) => {
			if (err) {
					console.error(err);
			} else {
					console.log(filename + ' has been added');
			}
		});
	}
}

module.exports = Functions;