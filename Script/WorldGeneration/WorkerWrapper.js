function WorkerWrapper(world, worker) {
	let state, lastData, self, x, y, z;
	self = this;
	worker.onmessage = function(message) {
		if (message.data[0] === "p" && state === "pinging") {
			world.workers.push(self);
		} else if (message.data[0] === "c") {
			let interpreted = decodeWorldMessage(message.data);
			if (lastData === undefined) {
				console.warn("Worker returned when not expected to");
			} else {
				lastData.decode(message.data.substr(interpreted.start+1));
				world.onChunkFill(lastData, interpreted.count, x, y, z);
			}
			lastData = undefined;
			world.workers.push(self);
		}
	}
	function assign(data, rx, ry, rz) {
		x = rx;
		y = ry;
		z = rz;
		if (!(data instanceof WorldDataArray)) return new Error("Data object not accepted:", data);
		lastData = data;
		worker.postMessage(`c${x},${y},${z}`);
	}
	function setState(newState) {
		state = newState;
	}
	this.assign = assign;
	setState("pinging");
	worker.postMessage("p");
}
WorkerWrapper.prototype = {
	constructor: WorkerWrapper
}