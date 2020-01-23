const blockTypes = {
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
var maxLoadedChunks = typeof window !== "undefined" && window.localStorage && window.localStorage.getItem("last-world-max-loaded-chunk") && !isNaN(parseInt(window.localStorage.getItem("last-world-max-loaded-chunk"))) ? parseInt(window.localStorage.getItem("last-world-max-loaded-chunk")) : 60;

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