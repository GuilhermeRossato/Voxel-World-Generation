
let out = document.getElementById("out");
out.innerText = "";
let canvas = document.createElement("canvas");
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
canvas.setAttribute("style", "width:"+(CANVAS_SIZE*2)+"px;height:"+(CANVAS_SIZE*2)+"px;margin-top:8px;background-color: #DDD;");
document.body.appendChild(canvas);
let performancer = new Performancer({left: 2*CANVAS_SIZE+16}), lastTime = performance.now(), frameCount = 0;
let ctx, imageData;
function setup() {
	noiseSetup();
	ctx = canvas.getContext("2d");
	imageData = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
}

function update() {
	let thisTime = performance.now();
	let delta = thisTime - lastTime;
	performancer.update(delta);
	frameCount += (delta/16);
	lastTime = thisTime;
	draw();
	requestAnimationFrame(update);
}

function draw() {
	let data = [];
	for (let ix = 0 ; ix < CANVAS_SIZE; ix++) {
		for (let iy = 0; iy < CANVAS_SIZE; iy++) {
			let noise = noiseGenerate(ix, iy, frameCount);
			if (noise <= 0 || noise >= 1)
				debugger;
			data.push((noise*256)|0);
		}
	}
	ctx.fillRect(0,0, CANVAS_SIZE, CANVAS_SIZE);

	let j = 0;
    for (let i=0; i < imageData.data.length; i+=4) {
		imageData.data[i] = data[j];
		imageData.data[i+1] = data[j];
		imageData.data[i+2] = data[j++];
		imageData.data[i+3] = 255;
    }
	ctx.putImageData(imageData, 0, 0);
	ctx.fillRect(0,0,2,2);
}

setup();
requestAnimationFrame(update);