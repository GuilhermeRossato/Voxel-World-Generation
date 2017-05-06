const ThreejsHandler = (function() {

	function loadDefaultConfigs(config) {
		(config.wrapper === undefined)		&& (config.wrapper = document.body);
		(config.antiAlias === undefined)	&& (config.antiAlias = false);
		(config.viewDistance === undefined)	&& (config.viewDistance = 160);
		(config.width === undefined)		&& (config.width = window.innerWidth);
		(config.height === undefined)		&& (config.height = window.innerHeight);
	}

	function resize(width = 650, height = 406) {
		if (this.camera) {
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
		}
		if (this.renderer) {
			this.renderer.setSize(width, height);
		}
	}

	function initRenderer(wrapper, antiAlias) {
		try {
			this.renderer = new THREE.WebGLRenderer({
				antialias: antiAlias,
				alpha: false
			});
		} catch (err) {
			return false;
		}
		this.renderer.setClearColor(0x999999, 1);
		this.renderer.domElement.style.position = "absolute";
		this.renderer.domElement.style.zIndex = "-1";
		wrapper.appendChild(this.renderer.domElement);
		this.canvas = this.renderer.domElement;
		return true;
	}

	function initCamera(viewDistance, width, height) {
		this.camera = new THREE.PerspectiveCamera(95, width / height, 0.1, viewDistance);
		this.camera.fov = 95;
		this.scene.add(this.camera);
	}

	function initScene() {
		this.scene = new THREE.Scene();
		{
			let scene = this.scene;
			function addLight(name, position, intensity) {
				let light = new THREE.DirectionalLight(0xffffff, intensity);
				light.position.copy(position);
				light.name = name;
				scene.add(light);
			}
			[["Top", { x: 0, y: 1, z: 0 }, 2.935],
			["Front", { x: 0, y: 0, z: -1 }, 2.382],
			["Back", { x: 0, y: 0, z: 1 }, 2.3548],
			["Left", { x: -1, y: 0, z: 0 }, 1.7764],
			["Right", { x: 1, y: 0, z: 0 }, 1.7742],
			["Bottom", { x: 0, y: -1, z: 0 }, 1.5161]].map(args=>addLight(...args));
		}
	}

	return {
		resize: function(width = window.innerWidth, height = window.innerHeight) {
			resize.call(this, width, height);
		},
		init: function(config = {}) {
			loadDefaultConfigs.call(this, config);
			if (!initRenderer.call(this, config.wrapper, config.antiAlias))
				return false;
			initScene.call(this);
			initCamera.call(this, config.width, config.height);
			this.resize(config.width, config.height);
			this.render();
			this.init = undefined;
			return true;
		},
		render: function() {
			this.renderer.render(this.scene, this.camera);
		},
		dispose: function() {
			this.scene.dispose();
			this.scene = undefined;
		}
	}
})();
