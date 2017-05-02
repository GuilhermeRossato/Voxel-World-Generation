/*!
 * A class that usees Uint32Array to handle 3D data structure, each element is composed of values of 3 bits.
 *
 * @name WorldDataArray Class
 * @author Guilherme Rossato
 *
 */

function WorldDataArray(sizeX, sizeY, sizeZ) {
	let main = new Uint32Array(Math.ceil(sizeX*sizeY*sizeZ/10));
	let count = 0;
	function flatten(x, y, z) {
		return x+sizeX*(z+y*sizeZ);
		//return x+z*sizeX+y*sizeX*sizeZ;
	}
	function getMask(area) {
		//generated using: ("if (area === 0)\n\treturn 0x")+[0,1,2,3,4,5,6,7,8,9].reverse().map(i=>parseInt("1".repeat(3*i)+"10001"+"1".repeat(8*3-i*3+3),2).toString(16)).reduce((past, next, i)=>(`${past};\nelse if (area === ${(i)})\n\treturn 0x${next}`))+";";
		if (area === 0)
			return 0xfffffff1;
		else if (area === 1)
			return 0xffffff8f;
		else if (area === 2)
			return 0xfffffc7f;
		else if (area === 3)
			return 0xffffe3ff;
		else if (area === 4)
			return 0xffff1fff;
		else if (area === 5)
			return 0xfff8ffff;
		else if (area === 6)
			return 0xffc7ffff;
		else if (area === 7)
			return 0xfe3fffff;
		else if (area === 8)
			return 0xf1ffffff;
		else if (area === 9)
			return 0x8fffffff;
	}
	this._get = function(x, y, z) {
		let index = flatten(x, y, z),
			compactId = index / 10 | 0,
			area = index % 10,
			mask = getMask(area) ^ 0xffffffff;
		//console.log(`index: ${index}, compactId: ${compactId}, area: ${area}, mask:${minL((mask.toString(2)), "0", 8*4, true,4)}`);
		return ((main[compactId] & mask) >> (area * 3+1));
	}
	this._set = function(x, y, z, value) {
		let index = flatten(x, y, z),
			compactId = index / 10 | 0,
			area = index % 10,
			mask = getMask(area);
		//console.log(`index: ${index}, compactId: ${compactId}, area: ${area}, mask:${minL((mask.toString(2)), "0", 8*4, true,4)}`);
		return (main[compactId] = (main[compactId] & mask) | (value << (area*3+1)));
	}
	this.get = function(x, y, z) {
		if (x >= 0 && y >= 0 && z >= 0 && x < sizeX && y < sizeY && z < sizeZ) {
			return this._get(x, y, z);
		}
	}
	this.set = function(x, y, z, value) {
		if (x >= 0 && y >= 0 && z >= 0 && value >= 0 && x < sizeX && y < sizeY && z < sizeZ && value < 8) {
			count ++;
			return this._set(x, y, z, value);
		}
		console.warn("Unnaccepted parameters: ", {x:x, y:y, z:z, value:value, sizeX:sizeX, sizeY:sizeY, sizeZ:sizeZ});
	}
	this.getCount = function() {
		return count;
	}
	this.clear = function() {
		for (let i = 0; i < main.length; i++) {
			main[i] = 0;
		}
	}
	this.toArray = function() {
		return new Array(...main);
	}
	this.encode = function() {
		var chars = [];
		for (let i = 0; i < main.length; i++) {
			chars.push(	String.fromCharCode((main[i] & 0xFF000000) >>> 8*3),
						String.fromCharCode((main[i] & 0x00FF0000) >>> 8*2),
						String.fromCharCode((main[i] & 0x0000FF00) >>> 8*1),
						String.fromCharCode((main[i] & 0x000000FF)));
		}
		return (chars.join(''));
	}
	this.decode = function(encoded) {
		var chars = (encoded).split("").map(c => c.charCodeAt(0));
		if (chars.length%4!==0)
			return new Error("Unreadable: input length is not divisible by 4");
		if (main.length*4 != chars.length)
			return new Error("Unreadable: This instance size doesn't match the input");
		for (let i = 0; i < main.length; i++) {
			main[i] = (encoded.charCodeAt(i*4) << 8*3)+(encoded.charCodeAt(i*4+1) << 8*2)+(encoded.charCodeAt(i*4+2) << 8) + encoded.charCodeAt(i*4+3);
		}
		return true;
	}
}

WorldDataArray.prototype = {
	constructor: WorldDataArray
}

WorldDataArray.test = function() {
	var sx = 2;
	var sy = 11;
	var sz = 14;
	var a = new WorldDataArray(sx,sy,sz);
	var failCount = 0;
	for (let x = 0 ; x < sx; x ++) {
		for (let y = 0 ; y < sy; y ++) {
			for (let z = 0 ; z < sz; z ++) {
				for (let k = 0; k < 8; k++) {
					a.set(x, y, z, k);
					if (a.get(x,y,z) != k) {
						failCount++
						if (failCount < 20)
							console.warn("Setting",x, y, z,"wasn't sucessfull for",k);
					}
				}
			}
		}
	}
	if (failCount > 0) {
		console.log("Failed "+failCount+" times out of "+sx*sy*sz*8+" = "+((((100000*failCount)/(sx*sy*sz*8))|0))/1000+"% failure")
	} else {
		console.log("Sucessful test");
	}
}


/*
sizeX = 2;
sizeY = 3;
sizeZ = 5;

x y z	id	real
0 0 0	0	0
1 0 0	1	0	
2 0 0	NaN	0
0 0 1	2	0
1 0 1	3	0
0 0 2	4	0
0 0 3	6	0
0 0 4	8	0
0 0 5	NaN
1 0 5	9	0
0 1 0	10	1
0 2 0	20	1
*/