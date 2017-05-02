function WorldHandler(player, scene) {
	this.chunkOffsets = [[0,0,0], [0,0,1], [0,0,-1], [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [1,0,1], [1,0,-1], [-1,0,1], [-1,0,-1], [-1,-1,0], [1,-1,0], [0,-1,-1], [0,-1,1], [-1,1,0], [1,1,0], [0,1,-1], [0,1,1], [1,1,1], [1,1,-1], [1,-1,1], [1,-1,-1], [-1,1,1], [-1,1,-1], [-1,-1,1], [-1,-1,-1]];
	this.chunks = [];
	this.player = player;
	this.scene = scene;
	this.workers = [];
	this.data = new WorldDataArray(chunkSize, chunkSize, chunkSize);
	this.startWorkers();
}

WorldHandler.prototype = {
	constructor: WorldHandler,
	onChunkFill: function(data, count, cx, cy, cz) {
		let chunk = new Chunk();
		chunk.fillFrom(data, cx, cy, cz, count);
		chunk.finalize(this.scene);
		this.chunks[cx][cz][cy] = chunk;
	},
	startWorkers: function(quantity = 4) {
		this.workers.forEach(worker => worker.terminate());
		this.workers.length = 0;
		for (let i = 0; i < quantity; i++) {
			let worker = new Worker("Script/WorldGeneration/WorldWorker1.js");
			new WorkerWrapper(this, worker);
		}
	},
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
	assignWorker: function(worker, x, y, z) {
		let data = new WorldDataArray(chunkSize, chunkSize, chunkSize);
		worker.assign(data, x, y, z);
		this.setChunk(x, y, z, data);
	},
	changedWorkerCount: function() {
		if (this.lastWorkerCount === this.workers.length)
			return false;
		else
			this.lastWorkerCount = this.workers.length;
		return true;
	},
	update: function(player) {
		if (!this.hasElapsed() || (this.workers.length === 0))
			return;
		let cx = (this.player.position.x/chunkSize)|0, cy = (this.player.position.y/chunkSize)|0, cz = (this.player.position.z/chunkSize)|0;
		if (!this.didMove(cx, cy, cz) && !this.changedWorkerCount())
			return;
		let rx, ry, rz, chunk, worker;
		for (let i = 0; i < this.chunkOffsets.length; i++) {
			rx = cx + this.chunkOffsets[i][0];
			ry = cy + this.chunkOffsets[i][1];
			rz = cz + this.chunkOffsets[i][2];
			chunk = this.getChunk(rx, ry, rz);
			if (!chunk) {
				let worker = this.workers.pop();
				this.lastWorkerCount--;
				this.assignWorker(worker, rx, ry, rz);
				if (this.workers.length === 0)
					break;
			}
		}
	}
}