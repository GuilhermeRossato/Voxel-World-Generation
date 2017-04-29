var blockTypes = {
	undefined: 0,
	air: 1,
	dirt: 2,
	grass: 3,
	stone: 4,
	log: 5,
	leaves: 6,
	flower: 7
}

const chunkSize = 8;

function baseWorldGen(x, y, z) {
	var w = new WorldDataArray(chunkSize, chunkSize, chunkSize);
	w.set(0,0,0,2);
	w.set(0,0,1,1);
	w.set(0,1,0,1);
	w.set(1,0,0,1);
	w.set(3,2,1,3);
	w.set(1,2,3,4);
	w.set(1,1,1,5);
	w.set(2,2,2,6);
	return w;
}

function interpretXYZ(text) {
	let commaIndex = 0,	nextComma = text.indexOf(','), values = {};
	values.x = parseInt(text.substr(commaIndex+1, nextComma-1), 10);
	commaIndex = nextComma;
	nextComma = text.indexOf(",", nextComma+1);
	values.y = parseInt(text.substr(commaIndex+1, nextComma-1), 10);
	commaIndex = nextComma;
	nextComma = text.indexOf(",", nextComma+1);
	if (nextComma === -1)
		nextComma = text.length;
	else
		values.start = nextComma;
	values.z = parseInt(text.substr(commaIndex+1, nextComma-1), 10);
	return values;
}
