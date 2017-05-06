importScripts('WorkerBase.js', '../WorldDataArray.js', '../WorldBase.js', '../../Libraries/Jonas_WagnerSimplexNoise.js', '../../Libraries/alea.min.js');

var w = new WorldDataArray(chunkSize, chunkSize, chunkSize);
var prng1 = new Alea(1337);
var noiseGen = new SimplexNoiseJ(prng1.next);
let scale = 24;

function pointCheck(rx,ry,rz) {
	if (ry < 2) {
		return false;
	}
	if (ry < 48) {
		let noise;
		if (ry < 20) {
			noise = noiseGen.noise2D(rx/30, rz/30)+1
			if (noise > ry/10)
				return true;
		}
		noise = noiseGen.noise3D(rx/scale, ry/scale, rz/scale)+1;
		let balance = ry/24;
		if (noise > balance*balance)
			return true;
	}
	return false;
}

function generate(x0, y0, z0) {
	w.clear();
	for (let x = 0 ; x < chunkSize; x++) {
		for (let y = 0; y < chunkSize; y++) {
			for (let z = 0; z < chunkSize; z++) {
				let rx = x+x0, ry = y+y0, rz = z+z0;
				if (pointCheck(rx, ry, rz)) {
					w.set(x, y, z, 1);
				}
			}
		}
	}
	return w;
}

function handleMessage(message) {
	if (message.data[0] === "p") {
		postMessage("ping "+message.data.substr(1));
	} else if (message.data[0] === "c") {
		values = interpretXYZ(message.data, 10);
		let world = generate(values.x*chunkSize, values.y*chunkSize, values.z*chunkSize);
		postMessage(encodeWorldMessage(world));
	} else if (message.data === "die") {
		postMessage("dead");
		self.close();
	} else if (message.data[0] === "d") {
		scale = parseFloat(message.data.substr(1));
	}
}

self.addEventListener('message', handleMessage, false);
