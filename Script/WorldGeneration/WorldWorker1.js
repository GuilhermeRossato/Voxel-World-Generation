importScripts('WorkerBase.js', 'WorldDataArray.js');

var w = new WorldDataArray(chunkSize, chunkSize, chunkSize);

function generate(x, y, z) {
	w.clear();
	w.set(0,0,0,4);
	w.set(0,0,1,1);
	w.set(0,0,2,1);
	w.set(0,0,3,1);
	w.set(0,0,4,1);
	w.set(0,0,5,1);
	w.set(0,0,6,1);
	w.set(0,0,7,1);
	return w;
}

function handleMessage(message) {
	if (message.data[0] === "p") {
		postMessage("ping "+message.data.substr(1));
	} else if (message.data[0] === "c") {
		values = interpretXYZ(message.data, 10);
		let world = generate(values.x, values.y, values.z);
		postMessage(encodeWorldMessage(world));
	} else if (message.data === "die") {
		postMessage("dead");
		self.close();
	}
}

self.addEventListener('message', handleMessage, false);