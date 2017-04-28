/*!
* Application class for:
*		Voxel World Gen Experiment
*
* @author: Guilherme Rossato
*/

var worldSize = 20;
var worldFrequency = 0.05;
var WorldGen, scene, player;

function Application() {
	if (!ThreejsHandler.init()) {
		this.showMessage("WebGL Error", "This browser doesn't support WebGL");
		return;
	}

	this.world = new ParticleSystem(ThreejsHandler.scene, 0.5);
	this.main = document.getElementById("main");

	this.logger = new Logger(125);
	ButtonGen.generate(this);

	this.controller = new ExplorerControl(ThreejsHandler.scene, ThreejsHandler.camera);
	this.controller.addCallback("lock", () => (this.main.style.display = "none"));
	this.controller.addCallback("release", () => (this.main.style.display = "flex"));
	player = this.controller;
	function onMessageClick() {
		if (!this.controller.isEnabled()) {
			this.controller.lock();
		}
	}

	function onCanvasClick() {
		
	}

	this.main.addEventListener("click", ()=>onMessageClick.call(this), false);
	window.addEventListener("resize", ()=>this.onWindowResize(), false);

	this.fpsUpdate(60);

	StepUpdatePattern.init({
		setup: ()=>this.setup(),
		update: ()=>this.update(),
		draw: ()=>this.draw(),
		fpsUpdate: (fps)=>this.fpsUpdate(fps),
		logMode: false,
		timeStamp: 16
	});

	this.showMessage("Paused", "Press anywhere to start<br><br>[W,A,S,D] to move around<br>[Space/Shift] to move up and down<br>[Right Shift] Hold to move faster");
	this.main.style.cursor = "pointer";
}

Application.prototype = {
	constructor: Application,
	showMessage: function(...messages) {
		function forEachElementOfType(element, elementType, func) {
			let arr = element.childNodes, count = 0;
			for (let i = 0 ; i < arr.length ; i++) {
				if (arr[i] instanceof elementType) {
					func(arr[i], count);
					count++;
				}
			}
		}
		if (!document.getElementById("main")) {
			console.error("Unable to show message: Missing main");
		} else {
			forEachElementOfType(document.getElementById("main"), HTMLDivElement, (element, i) => {
				if (i === 0) {
					forEachElementOfType(element, HTMLDivElement, (element, i) => {
					if (messages[i])
						element.innerHTML = messages[i];
					});
				} else {
					element.style.display = "none";
				}
			});
		}
	},
	onWindowResize: function() {
		ThreejsHandler.resize();
	},
	setupWorld: function() {
		this.world.clear();
		this.world.createGeometries();
		WorldGen = WorldGen1;
		WorldGen.generate(this.world, worldSize);
		this.world.createMeshes();
		this.world.addMeshes();
	},
	addTestCube: function(scene) {
		var cubeGeometry = new THREE.CubeGeometry(5, 5, 5);
		var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x1ec876 });
		var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

		cube.rotation.y = Math.PI * 45 / 180;
		scene.add(cube);
	},
	setup: function() {
		scene = ThreejsHandler.scene;
		this.world.init();
		this.setupWorld();
		this.world.addMeshes();
	},
	update: function() {
		this.controller.update()
	},
	draw: function() {
		ThreejsHandler.render();
	},
	fpsUpdate: function(fps) {
		this.logger.setText(`FPS: ${fps}`);
	}
}