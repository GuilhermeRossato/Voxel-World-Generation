function ChunkAdder(parent) {
	this.parent = parent;
}

ChunkAdder.prototype = {
	constructor: ChunkAdder,
	chunkOffsets: [[0,0,0], [0,0,1], [0,0,-1], [1,0,0], [-1,0,0], [0,1,0], [0,-1,0], [1,0,1], [1,0,-1], [-1,0,1], [-1,0,-1], [-1,-1,0], [1,-1,0], [0,-1,-1], [0,-1,1], [-1,1,0], [1,1,0], [0,1,-1], [0,1,1], [1,1,1], [1,1,-1], [1,-1,1], [1,-1,-1], [-1,1,1], [-1,1,-1], [-1,-1,1], [-1,-1,-1]],
	update: function(cx, cy, cz) {
		let rx, ry, rz;
		for (let i = 0; i < this.chunkOffsets.length; i++) {
			for (let j = 0; j < this.chunkOffsets.length; j++) {
				rx = cx + this.chunkOffsets[i][0] + this.chunkOffsets[j][0];
				ry = cy + this.chunkOffsets[i][1] + this.chunkOffsets[j][1];
				rz = cz + this.chunkOffsets[i][2] + this.chunkOffsets[j][2];
				chunk = this.parent.getChunk(rx, ry, rz);
				if (!chunk && !this.parent.onNewChunkRequest(rx, ry, rz))
					break;
			}
		}
	}
}