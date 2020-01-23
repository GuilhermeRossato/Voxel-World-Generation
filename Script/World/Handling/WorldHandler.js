function WorldHandler(player, scene) {
	this.chunks = [];
	this.player = player;
	this.scene = scene;
	this.workers = [];
	this.data = new WorldDataArray(chunkSize, chunkSize, chunkSize);

	//this.advanceStimuli();

	this.startWorkers.call(this);
	this.chunkAdder = new ChunkAdder(this);
	this.chunkRemover = new ChunkRemover(this);

	this.chunkCount = 0;
	this.wishList = [];
}

WorldHandler.prototype = {
	constructor: WorldHandler,
	advanceStimuli: function() {
		let v = parseInt(getCookie("ha"));
		if (isNaN(v))
			v = 0;
		setCookie("ha", v+1,3);
		console.log("frame "+v);
		this.a = v;
		if (isNaN(this.a))
			this.a = 0;
		player.position.set(chunkSize/2, 42, -20);
	},
	startWorkers: function(quantity = 4) {
		this.workers.forEach(worker => worker.terminate());
		this.workers.length = 0;
		for (let i = 0; i < quantity; i++) {
			let worker = new Worker("Script/World/Generation/WorldWorker3.js");
			new WorkerWrapper(this, worker, this.a);
		}
	},
	hasElapsed: function() {
		if (this.elapsed > 0) {
			this.elapsed--;
			return false;
		} else {
			this.elapsed = 3;
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
	// Only a WorkerWrapper calls this function
	onChunkFill: function(data, count, cx, cy, cz) {
		if (this.chunks[cx][cz][cy] instanceof Chunk)
			return console.warn("Double call here");
		let chunk = new Chunk(cx, cy, cz);
		chunk.fillFrom(data, cx, cy, cz, count);
		chunk.finalize(this.scene);
		this.chunkRemover.onChunkAdded(chunk);
		this.chunks[cx][cz][cy] = chunk;
		this.chunkCount ++;
	},
	// ChunkAdder calls this function when a chunk is requested
	// WorldHandler calls this function when it needs a chunk built from wishList
	onNewChunkRequest: function(cx, cy, cz) {
		let worker = this.workers.pop();
		if (!worker) {
			// we are out of workers, we need to wait :(
			this.wishList.push({x: cx, y: cy, z: cz});
			return false;
		}
		this.lastWorkerCount--;
		this.assignWorker(worker, cx, cy, cz);
		return (this.workers.length !== 0)
	},
	// Only ChunkRemover calls this function
	onRemoveChunkRequest: function(x, y, z) {
		this.chunks[x][z][y] = undefined;
		this.chunkCount--;
	},
	update: function(player) {
		if (!this.hasElapsed())
			return;
		let cx = Math.floor(this.player.position.x/chunkSize);
		let cy = (this.player.position.y/chunkSize)|0;
		let cz = Math.floor(this.player.position.z/chunkSize);
		
		/*
		if (this.player.position.x > 0)
			cx--;
		if (this.player.position.z > 0)
			cz--;
		*/
		cy = (24/chunkSize)|0;
		this.chunkRemover.update(cx, cy, cz);
		if (this.workers.length === 0)
			return;
		if (this.wishList.length > 0) {
			while (this.workers.length > 0 && this.wishList.length > 0) {
				const pos = this.wishList.pop();
				this.onNewChunkRequest(pos.x, pos.y, pos.z);
			}
			return;
		}
		if (!this.didMove(cx, cy, cz) && !this.changedWorkerCount())
			return;
		this.chunkAdder.update(cx, cy, cz);
	}
}