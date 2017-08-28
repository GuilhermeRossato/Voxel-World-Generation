let lastChunkTexture;
function createChunkTexture() {
	if (!lastChunkTexture) {
		let data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANUlEQVQ4T2MMDQ39b2RkxEAOOHfuHANje3v7/4qKCnL0M3R0dIwaMBoGo+kAmHuokxcozc4AyIRYJQ0lCBYAAAAASUVORK5CYII="
			let loader = new THREE.TextureLoader();
		let texture = loader.load(data);
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		lastChunkTexture = texture;
		return texture;
	} else {
		return lastChunkTexture;
	}
}

function createChunkMesh(geometries) {
	let materials = [0x646464, 0x406827, 0x7A563D].map((colorCode) => {
		return new THREE.PointsMaterial({
			map: createChunkTexture(),
			size:0.75,
			color: new THREE.Color(colorCode)
		});
	});
	let meshes = materials.map((material, i) => new THREE.Points(geometries[i], material));
	return meshes;
}

function Chunk(x, y, z) {
	this.geometries = [new THREE.Geometry(), new THREE.Geometry(), new THREE.Geometry()];
	this.squaredDistanceFrom = function(px, py, pz) {
		return (px-x)*(px-x)+(py-y)*(py-y)+(pz-z)*(pz-z);
	}
	this.getXYZ = function() {
		return [x,y,z];
	}
}

Chunk.prototype = {
	constructor: Chunk,
	sidesDisplacement: [
	[0, 0, -1], [0, 0, 1], [-1, 0, 0], [1, 0, 0],
	[0, -1, 0], [0, 1, 0], [-1, 1, -1], [-1, 1, 1],
	[1, 1, -1], [1, 1, 1], [-1, -1, -1], [-1, -1, 1],
	[1, -1, -1], [1, -1, 1],[1, -1, 0], [-1, -1, 0],
	[0, -1, 1], [0, -1, -1], [1, 1, 0], [-1, 1, 0],
	[0, 1, 1], [0, 1, -1], [1, 1, 1], [1, 0, 1], [-1, 0, -1]],
	fillFrom: function(data, cx, cy, cz, count = 512) {
		let i = 0,
			rx = cx*chunkSize,
			ry = cy*chunkSize,
			rz = cz*chunkSize,
			id, marker, geo;
		for (let x = 0 ; x < chunkSize; x ++) {
			for (let y = 0 ; y < chunkSize; y ++) {
				for (let z = 0 ; z < chunkSize; z ++) {
					id = data.get(x,y,z);
					if (id !== 0 && this.geometries[id-1]) {
						geo = this.geometries[id-1];
						geo.vertices.push(new THREE.Vector3(x+rx+0.25, y+ry+0.25, z+rz+0.25));
						geo.vertices.push(new THREE.Vector3(x+rx+0.25, y+ry+0.25, z+rz-0.25));
						geo.vertices.push(new THREE.Vector3(x+rx-0.25, y+ry+0.25, z+rz+0.25));
						geo.vertices.push(new THREE.Vector3(x+rx-0.25, y+ry+0.25, z+rz-0.25));
						geo.vertices.push(new THREE.Vector3(x+rx+0.25, y+ry-0.25, z+rz+0.25));
						geo.vertices.push(new THREE.Vector3(x+rx+0.25, y+ry-0.25, z+rz-0.25));
						geo.vertices.push(new THREE.Vector3(x+rx-0.25, y+ry-0.25, z+rz+0.25));
						geo.vertices.push(new THREE.Vector3(x+rx-0.25, y+ry-0.25, z+rz-0.25));
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
	destroy: function() {
		var i;
		for (i=0;i<this.meshes.length;i++) {
			this.meshes[i].parent.remove(this.meshes[i]);
			this.meshes[i].material.dispose();
			this.meshes[i].geometry.dispose();
		}
		for (i=0;i<this.geometries.length;i++) {
			this.geometries[i].vertices = null;
			this.geometries[i] = null;
		}
		this.meshes = null;
		this.geometries = null;
		this.squaredDistanceFrom = null;
		return this.getXYZ();
	},
	finalize: function(scene) {
		this.meshes = createChunkMesh(this.geometries);
		this.meshes.forEach(mesh => scene.add(mesh));
		this.finalize = undefined;
	}
}