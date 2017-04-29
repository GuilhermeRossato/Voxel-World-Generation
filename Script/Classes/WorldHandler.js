function WorldHandler(world, workers) {
	this.chunks = [];
	this.chunkOffsets = [[0,0,0], [0,0,1], [0,0,-1], [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [1,0,1], [1,0,-1], [-1,0,1], [-1,0,-1], [-1,-1,0], [1,-1,0], [0,-1,-1], [0,-1,1], [-1,1,0], [1,1,0], [0,1,-1], [0,1,1], [1,1,1], [1,1,-1], [1,-1,1], [1,-1,-1], [-1,1,1], [-1,1,-1], [-1,-1,1], [-1,-1,-1]];
	if (workers instanceof Array) {
		this.workers = workers;
		this.availableWorkers = workers.length;
	} else if (workers instanceof Worker) {
		this.workers = [workers];
		this.availableWorkers = 1;
	}
	let data = new WorldDataArray(chunkSize, chunkSize, chunkSize);
	function workerMessage(message) {
		console.log(message);
		if (message.data[0] === "c") {
			let data = interpretXYZ(message.data);
			console.log("data start = ",data.substr(message.start));
		} else if (message.data[0] === "e") {
			
		}
	}
	this.workers.forEach(worker => worker.onmessage = workerMessage);
}

WorldHandler.prototype = {
	constructor: WorldHandler,
	hasElapsed: function() {
		if (this.elapsed > 0) {
			this.elapsed--;
			return false;
		} else {
			this.elapsed = 5;
			return true;
		}
	},
	didMove: function(x, y, z) {
		if (this.last_x === x && this.last_y === y && this.last_z === z) {
			return false;
		} else {
			this.last_x = x;
			this.last_y = y;
			this.last_z = z;
			return true;
		}
	},
	getChunk: function(x, y, z) {
		if (this.chunks[x] && this.chunks[x][z])
			return this.chunks[x][z][y];
		return undefined;
	},
	setChunk: function(x, y, z, chunk) {
		(!this.chunks[x]) && (this.chunks[x] = []);
		(!this.chunks[x][z]) && (this.chunks[x][z] = []);
		this.chunks[x][z][y] = chunk;
	},
	changedWorkerCount: function() {
		if (this.lastWorkerCount === this.workers.length) {
			return false
		} else {
			this.lastWorkerCount = this.workers.length;
		}
	},
	update: function(player) {
		if (!hasElapsed() || (this.workers.length === 0))
			return;
		let x = (player.position.x/chunkSize)|0, y = (player.position.y/chunkSize)|0, z = (player.position.z/chunkSize)|0;
		if (!didMove(x, y, z) && !changedWorkerCount())
			return;
		let rx, ry, rz, chunk, worker;
		for (let i = 0; i < this.chunkOffsets.length; i++) {
			rx = x + this.chunkOffsets[i][0];
			ry = y + this.chunkOffsets[i][1];
			rz = z + this.chunkOffsets[i][2];
			chunk = this.getChunk(rx, ry, rz);
			if (!chunk) {
				this.workers.pop().postMessage(`c${rx},${ry},${rz}`);
				if (this.workers.length <= 0)
					break;
			}
		}
	}
}