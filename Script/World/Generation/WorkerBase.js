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
