function ParticleSystem(scene, size) {
	if (scene === undefined)
		throw "Missing parameter: Scene Object";
	this.scene = scene;
	this.colors = [0xDDDDDD, 0x757575, 0x3333ff, 0x6B8AC9, 0xB1A627, 0x41AE38];
	this.size = size;
}

ParticleSystem.prototype = {
	constructor: ParticleSystem,
	populate: function(typeId, vecs) {
		/*
		this.geometries[typeId] = new THREE.BufferGeometry();
		let geometry = this.geometries[typeId];
		let particles = vecs.length;
		geometry.attributes = {
			position: {
				itemSize: 3,
				array: new Float32Array(particles * 3),
				numItems: particles * 3
			},
			color: {
				itemSize: 3,
				array: new Float32Array(particles * 3),
				numItems: particles * 3
			}
		}
		let colors = geometry.attributes.color.array;
		var positions = geometry.attributes.position.array;
		vecs.forEach((vec, i) => {
			positions[i*3]     = vec.x;
			positions[i*3 + 1] = vec.y;
			positions[i*3 + 2] = vec.z;
			colors[i*3] = 1;
			colors[i*3 + 1] = 1;
			colors[i*3 + 2] = 1;
		});
		geometry.computeBoundingSphere();
		var material = new THREE.PointsMaterial( { size: 15, vertexColors: true } );
		var particleSystem = new THREE.Points( geometry, material );
		this.scene.add(particleSystem);
		*/
	},
	createGeometries: function() {
		this.geometries = this.colors.map(color=>new THREE.Color(color)).map(color=>{
			let geometry = new THREE.Geometry();
			return geometry;
		});
	},
	createMeshes: function() {
		let data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAANUlEQVQ4T2MMDQ39b2RkxEAOOHfuHANje3v7/4qKCnL0M3R0dIwaMBoGo+kAmHuokxcozc4AyIRYJQ0lCBYAAAAASUVORK5CYII="
		var loader = new THREE.TextureLoader();
		var texture = loader.load(data);
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.LinearMipMapLinearFilter;

		this.meshes = this.colors.map((color,i)=>{
			let mesh = new THREE.Points(this.geometries[i],new THREE.PointsMaterial({
				map: texture,
				size: this.size || 1
			}))
			mesh.name = "Particles "+i;
			mesh.material.color = new THREE.Color(color);
			return mesh;
		}
		);
	},
	clear: function() {
		if (this.meshes) {
			this.meshes.forEach(mesh=>{
				this.scene.remove(mesh);
			});
		}
	},
	recreate: function() {
		this.createGeometries();
		this.createMeshes();
		this.meshes.forEach(mesh=>{
			this.scene.add(mesh);
		});
	},
	add: function(x, y, z, id) {
		if (id === 0) {
			console.warn("Cannot add air");
			return;
		}
		id = id - 1;
		if (!(id < this.geometries.length)) {
			console.warn(`Unhandled id: ${id}`);
			return;
		}
		this.geometries[id].vertices.push(new THREE.Vector3(x + 0.25,y + 0.25,z + 0.25));
		this.geometries[id].vertices.push(new THREE.Vector3(x - 0.25,y + 0.25,z + 0.25));
		this.geometries[id].vertices.push(new THREE.Vector3(x + 0.25,y + 0.25,z - 0.25));
		this.geometries[id].vertices.push(new THREE.Vector3(x - 0.25,y + 0.25,z - 0.25));
		this.geometries[id].vertices.push(new THREE.Vector3(x + 0.25,y - 0.25,z + 0.25));
		this.geometries[id].vertices.push(new THREE.Vector3(x - 0.25,y - 0.25,z + 0.25));
		this.geometries[id].vertices.push(new THREE.Vector3(x + 0.25,y - 0.25,z - 0.25));
		this.geometries[id].vertices.push(new THREE.Vector3(x - 0.25,y - 0.25,z - 0.25));
	},
	addMeshes: function() {
		this.meshes.forEach(mesh=>{
			this.scene.add(mesh);
		});
	},
	init: function() {
		this.createGeometries();
		this.createMeshes();
		this.init = undefined;
	}
}
