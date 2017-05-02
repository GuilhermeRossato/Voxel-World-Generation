/*!
* Application module for:
*		Voxel World Gen Experiment
*
* @author: Guilherme Rossato
*/

let worldFrequency = 0.05;
let WorldGen, scene, player;

const Application = (function() {
	let domElements, logger, world, controller, particleSystem;
	return {
		init: function() {
			initialize.call(this);
			this.init = undefined;
		},
		addTestCube: function(scene) {
			var cubeGeometry = new THREE.CubeGeometry(5, 5, 5);
			var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x1ec876 });
			var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

			cube.rotation.y = Math.PI * 45 / 180;
			scene.add(cube);
		},
	}
	function fpsUpdate(fps) {
		logger.setText(`FPS: ${fps}`);
	}
	function update() {
		world.update();
		controller.update();
	}
	function draw() {
		ThreejsHandler.render();
	}
	function initialize() {
		domElements = {};
		["main", "primary", "secondary"].forEach(elementName => domElements[elementName] = document.getElementById(elementName));
		domElements.secondary.style.display = "none";
		if (!ThreejsHandler.init())
			return showText("WebGL Error", "This browser doesn't support WebGL");
		scene = ThreejsHandler.scene;

		controller = new ExplorerControl(ThreejsHandler.scene, ThreejsHandler.camera);
		controller.addCallback("lock", () => (domElements.main.style.display = "none"));
		controller.addCallback("release", () => (domElements.main.style.display = "flex"));
		player = controller;

		particleSystem = new ParticleSystem(ThreejsHandler.scene, 0.5);
		try {
			world = new WorldHandler(controller, ThreejsHandler.scene);
		} catch (e) {
			console.log(e);
			showText("WebWorkers Error", "This browser doesn't support multithreading");
			return;
		}
		logger = new Logger(81);

		function onMessageClick() {
			if (!controller.isEnabled()) {
				controller.lock();
			}
		}

		domElements.main.addEventListener("click", onMessageClick, false);
		window.addEventListener("resize", onResize, false);

		particleSystem.init();

		fpsUpdate(60);

		StepUpdatePattern.init({
			update: update,
			draw: draw,
			fpsUpdate: fpsUpdate,
			logMode: false,
			timeStamp: 16
		});

		showText("Paused", "Click anywhere to start<br><br>[W,A,S,D] to move around<br>[Space/Shift] to move up and down<br>[Right Shift] Hold to move faster");
		domElements.main.style.cursor = "pointer";
	}
	function onResize() {
		ThreejsHandler.resize();
	}
	function forEachElementOfType(element, elementType, func) {
		let arr = element.childNodes, count = 0;
		for (let i = 0 ; i < arr.length ; i++) {
			if (arr[i] instanceof elementType) {
				func(arr[i], count);
				count++;
			}
		}
	}
	function showText(...messages) {
		(new Array(...domElements.primary.childNodes)).filter(element=>element instanceof HTMLDivElement).forEach((element, i) => (messages[i] && (element.innerHTML = messages[i])));
	}
}());