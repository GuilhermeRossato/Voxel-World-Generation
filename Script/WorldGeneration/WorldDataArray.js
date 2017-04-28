/*!
 * A class that usees Uint32Array to handle 3D data structure, each element is composed of values of 3 bits.
 *
 * @name WorldDataArray Class
 * @author Guilherme Rossato
 *
 */

function WorldDataArray(sizeX, sizeY, sizeZ) {
	let main = new Uint32Array(sizeX*sizeY*sizeZ/10);
	function flatten(x, y, z) {
		return x+sizeX*(z+y*sizeZ);
		//return x+z*sizeX+y*sizeX*sizeZ;
	}
	function getMask(area) {
		if (area === 0)
			mask = 0xfffffff8;
		else if (area === 1)
			mask = 0xffffffc7;
		else if (area === 2)
			mask = 0xfffffe3f;
		else if (area === 3)
			mask = 0xfffff1ff;
		else if (area === 4)
			mask = 0xffff8fff;
		else if (area === 5)
			mask = 0xfffc7fff;
		else if (area === 6)
			mask = 0xffe3ffff;
		else if (area === 7)
			mask = 0xff1fffff;
		else if (area === 8)
			mask = 0xf8ffffff;
		else // (area === 9)
			mask = 0xc7ffffff;
	}
	this.get = function(x, y, z) {
		if (x >= 0 && y >= 0 && z >= 0 && x < sizeX && y < sizeY && z < sizeZ) {
			return this._get(x, y, z);
		}
	}
	this._get = function(x, y, z) {
		let index = flatten(x, y, z),
			compactId = index / 10 | 0,
			area = index % 10,
			mask = getMask(area) ^ 0xffffffff;
		return ((main[compactId] & mask) >> (area * 3));
	}
	this.set = function(x, y, z, value) {
		if (x >= 0 && y >= 0 && z >= 0 && value >= 0 && x < sizeX && y < sizeY && z < sizeZ && value < 8) {
			return this._set(x, y, z, value);
		}
		console.warn("Unnacepted parameters: ", {x:x, y:y, z:z, value:value, sizeX:sizeX, sizeY:sizeY, sizeZ:sizeZ});
	}
	this._set = function(x, y, z, value) {
		let index = flatten(x, y, z),
			compactId = index / 10 | 0,
			area = index % 10,
			mask = getMask(area);
		return (main[compactId] = (main[compactId] & mask) | (value << (area*3)));
	}
	this.toString = function() {
		return "ohaio";
	}
}

WorldDataArray.prototype = {
	constructor: WorldDataArray
}

WorldDataArray.test = function() {
	var a = new WorldDataArray(16,15,13);
	for (let x = 0 ; x < 16; x ++) {
		for (let y = 0 ; y < 15; y ++) {
			for (let z = 0 ; z < 13; z ++) {
				for (let k = 0; k < 8; k++) {
					a.set(x, y, z, k);
					if (a.get(x,y,z) != k)
						console.log(x, y, z);
				}
			}
		}
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