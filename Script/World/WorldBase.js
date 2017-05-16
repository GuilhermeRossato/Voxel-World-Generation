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

const chunkSize = 20;
const maxLoadedChunks = 60;

function encodeWorldMessage(world) {
	return ("c"+world.getCount()+","+world.encode());
}

function decodeWorldMessage(text) {
	let nextComma, values = {};
	nextComma = text.indexOf(",");
	values.start = nextComma;
	values.count = parseInt(text.substr(1, nextComma-1));
	return values;
}