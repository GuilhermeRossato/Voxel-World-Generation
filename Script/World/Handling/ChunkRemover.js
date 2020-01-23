const CR_MaxDeletionsPerSecond = 40;

function ChunkRemover(parent) {
	this.parent = parent;
	this.index = 0;
	this.lastIndex = 0;
	this.chunkList = [];
	this.processedList = [];
	this.distancesList = [];
}

ChunkRemover.prototype = {
	constructor: ChunkRemover,
	chunkOffsets: [[0,0,0], [0,0,1], [0,0,-1], [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [1,0,1], [1,0,-1], [-1,0,1], [-1,0,-1], [-1,-1,0], [1,-1,0], [0,-1,-1], [0,-1,1], [-1,1,0], [1,1,0], [0,1,-1], [0,1,1], [1,1,1], [1,1,-1], [1,-1,1], [1,-1,-1], [-1,1,1], [-1,1,-1], [-1,-1,1], [-1,-1,-1]],
	// Only the WorldHandler calls this function
	onChunkAdded: function(chunk) {
		this.chunkList.push(chunk);
		this.lastIndex++;
	},
	finishProcessing: function() {
		for (let i = 0, j = this.distancesList.length; i < j; i++) {
			let chunk = this.chunkList.splice(this.chunkList.indexOf(this.processedList[i]),1)[0];
			this.lastIndex--;
			chunk.destroy();
			this.parent.onRemoveChunkRequest(...chunk.getXYZ());
			if (this.lastIndex < maxLoadedChunks)
				break;
		}
		this.processedList = [];
		this.distancesList = [];
	},
	update: function(x, y, z) {
		if ((this.lastIndex === 0) || (this.lastIndex < maxLoadedChunks))
			return;
		for (let r = 0 ; r < 30; r++) {
			if (this.index === this.lastIndex) {
				this.finishProcessing();
				this.index = 0;
				break;
			} else {
				let thisChunk = this.chunkList[this.index]
				let thisDistance = thisChunk.squaredDistanceFrom(x, y, z);
				if (this.processedList.length < CR_MaxDeletionsPerSecond) {
					this.processedList.push(thisChunk);
					this.distancesList.push(thisDistance);
				} else {
					for (let i = 0 ; i < CR_MaxDeletionsPerSecond; i++) {
						if (thisDistance > this.distancesList[i]) {
							this.distancesList[i] = thisDistance;
							this.processedList[i] = thisChunk;
							break;
						}
					}
				}
				this.index++;
			}
		}
	}
}