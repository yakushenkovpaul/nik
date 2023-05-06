let array = ['1', '2', '3', '4'];

array.forEach(async(item, index) => {
	new Promise((resolve, reject) => setTimeout(resolve, 5000)).then(() => {
		console.log(index);
	});
});