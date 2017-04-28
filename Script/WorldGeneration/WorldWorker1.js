importScripts('WorkerBase.js', 'WorldDataArray.js');

function generate(x, y, z) {
	var w = new WorldDataArray(chunkSize, chunkSize, chunkSize);
	w.set(0,0,0,2);
	w.set(0,0,1,1);
	w.set(0,1,0,1);
	w.set(1,0,0,1);
	w.set(3,2,1,3);
	w.set(1,2,3,4);
	w.set(1,1,1,5);
	w.set(2,2,2,6);
	return w;
}

function handleMessage(message) {
	if (message.data[0] === "p") {
		postMessage("ping "+message.data.substr(1));
	} else if (message.data[0] === "c") {
		values = interpretXYZ(message.data, 10);
		var world = generate(values.x, values.y, values.z);
		postMessage(message.data+","+world.toString());
	}
}

self.addEventListener('message', handleMessage, false);