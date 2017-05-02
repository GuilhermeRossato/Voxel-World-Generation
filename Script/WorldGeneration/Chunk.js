function createChunkTexture() {
	let data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANUlEQVQ4T2MMDQ39b2RkxEAOOHfuHANje3v7/4qKCnL0M3R0dIwaMBoGo+kAmHuokxcozc4AyIRYJQ0lCBYAAAAASUVORK5CYII="
	let loader = new THREE.TextureLoader();
	let texture = loader.load(data);
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.LinearMipMapLinearFilter;
	return texture;
}

function createChunkMesh(geometry) {
	let material = new THREE.PointsMaterial({
		map: createChunkTexture(),
		size: 0.25,
		color: new THREE.Color(0xFF0000)
	});
	let mesh = new THREE.Points(geometry, material);
	return mesh;
}

function Chunk(x, y, z) {
	this.geometry = new THREE.Geometry();
}

Chunk.prototype = {
	constructor: Chunk,
	fillFrom: function(data, cx, cy, cz, count = 512) {
		let i = 0,
			rx = cx*chunkSize,
			ry = cy*chunkSize,
			rz = cz*chunkSize;
		for (let x = 0 ; x < chunkSize; x ++) {
			for (let y = 0 ; y < chunkSize; y ++) {
				for (let z = 0 ; z < chunkSize; z ++) {
					let id = data.get(x,y,z);
					if (id !== 0) {
						this.geometry.vertices.push(new THREE.Vector3(x+rx, y+ry, z+rz));
						//this.set(x, y, z, id);
						i++;
					}
				}
				if (i === count)
					return true;
			}
		}
		return false;
	},
//	set: function(x, y, z, id) {
//		this.geometry.vertices.push(new THREE.Vector3(x, y, z));
//	},
	finalize: function(scene) {
		let mesh = createChunkMesh(this.geometry);
		scene.add(mesh);
		this.finalize = undefined;
	}
}