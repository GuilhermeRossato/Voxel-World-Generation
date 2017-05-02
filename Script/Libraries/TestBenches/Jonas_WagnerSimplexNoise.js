const CANVAS_SIZE = 250;

let noiseGen;
let xyScale = 0.05;
let zScale = 0.01;

function noiseSetup() {
	noiseGen = new SimplexNoiseJ();
}

function noiseGenerate(x, y, z) {
	return (1+noiseGen.noise3D(x*xyScale, y*xyScale, z*zScale))/2;
}