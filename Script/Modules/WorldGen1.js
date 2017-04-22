var countBlock = 0;

const WorldGen1 = {
	generate: function(world, worldSize) {
		let xStart = 0;
		let yStart = 0;
		let zStart = 0;
		if (typeof player === "object") {
			xStart = player.position.x-worldSize/2|0;
			yStart = player.position.y*0;
			zStart = player.position.z-worldSize/2|0;
		}
		this.vecs = [];
		this.world = world;
		if (!this.noiseGen || this.noiseGen.frequency != worldFrequency) {
			this.noiseGen = new FastSimplexNoise({
				frequency: worldFrequency,
				octaves: 8
			});
		}
		for (let x = xStart; x < worldSize+xStart; x++) {
			for (let y = yStart; y < 32+yStart; y++) {
				for (let z = zStart; z < worldSize+zStart; z++) {
					this.verifyBlock(x|0, y|0, z|0);
				}
			}
		}
		this.vecs.forEach(vec => {
			this.world.add(vec.x,vec.y,vec.z,vec.bt);
		});
		//world.populate(1, this.vecs);
		/*world.scene.children.forEach(obj => {
			if (obj instanceof THREE.Mesh && (obj.geometry)) {
				obj.geometry.computeBoundingSphere();
			}
		})*/
	},
	verifyBlock: function(x, y, z) {
		if (this.aroundClosed(x, y, z))
			return;
		let bt = this.getBlockType(x, y, z)
		if (bt !== 0) {
			countBlock ++;
			this.vecs.push({x:x, y:y, z:z, bt:bt});
		}
	},
	getBlockType: function(x, y, z) {
		if (y < 4)
			return 3;
		if (y < 32) {
			if (y < 16) {
				let noise2D = (this.noiseGen.scaled2D(x/2, z/2)+1)/2;
				//let balanceY = interpolation.add(0,0).add(8,0.55).add(16,1).at(y);
				let balanceY = (y/16);
				if (noise2D > balanceY)
					return 1;
			}
			let noise3D = (this.noiseGen.scaled3D(x/2, y/2, z/2)+1)/2;
			//let balance = interpolation.add(0,0).add(32, 1).at(y);
			let balance = (y/32);
			return (noise3D > balance)?2:0;
		}
		return 0;
	},
	sidesDisplacement: [[0, 0, -1], [0, 0, 1], [-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [-1, 1, -1], [-1, 1, 1], [1, 1, -1], [1, 1, 1], [-1, -1, -1], [-1, -1, 1], [1, -1, -1], [1, -1, 1],
	[1, -1, 0], [-1, -1, 0], [0, -1, 1], [0, -1, -1], [1, 1, 0], [-1, 1, 0], [0, 1, 1], [0, 1, -1]],
	clear: function(world) {
		world.clear();
	},
	aroundClosed: function(x, y, z) {
		let count = 0;
		this.sidesDisplacement.forEach(vec=>{
			if (this.getBlockType(x + vec[0], y + vec[1], z + vec[2]))
				count++;
		}
		);
		return (count < 3 || count === this.sidesDisplacement.length);
	}
}
