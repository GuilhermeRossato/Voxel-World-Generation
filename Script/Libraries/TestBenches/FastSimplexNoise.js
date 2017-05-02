const CANVAS_SIZE = 100;

let noiseGen;
let xyScale = 0.2;
let zScale = 0.03;

function noiseSetup() {
	noiseGen = new FastSimplexNoise({
		frequency: 0.05,
		octaves: 4
	});
}

function noiseGenerate(x, y, z) {
	return (1+noiseGen.scaled3D(x*xyScale, y*xyScale, z*zScale));
}