
let f1 = () => {
	urls.each((index, element) => {
		setTimeout(() => {
			//do something
		}, 500 * index);
	});
}

//q: rewrite f1 to using promise instead of setTimeout

let f2 = () => {
	let promises = urls.map((index, element) => {
		return new Promise((resolve, reject) => {
			//do something
		});
	});
	return Promise.all(promises);
}
