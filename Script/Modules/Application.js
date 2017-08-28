/*!
* Application module for:
*		Voxel World Gen Experiment
*
* @author: Guilherme Rossato
*/

let worldFrequency = 0.05;
let WorldGen, scene, player;

const Application = (function() {
	let domElements, world, controller, particleSystem, menu;
	let menuData = {};
	return {
		init: function() {
			initialize.call(this);
			this.controller = controller;
			this.world = world;
			this.init = undefined;
		},
		addTestCube: function(scene) {
			var cubeGeometry = new THREE.CubeGeometry(5, 5, 5);
			var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x1ec876 });
			var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

			cube.rotation.y = Math.PI * 45 / 180;
			scene.add(cube);
		},
		hideElements: function() {
			menu.hide();
			domElements.main.style.display = "none";
			domElements.primary.style.display = "none";
		},
		showElements: function() {
			menu.show();
			domElements.main.style.display = "flex";
			domElements.primary.style.display = "block";
		}
	}
	function update() {
		world.update();
		controller.update();
		menu.update();
	}
	function draw() {
		ThreejsHandler.render();
	}
	function initialize() {
		domElements = {};
		["main", "primary", "secondary"].forEach(elementName => domElements[elementName] = document.getElementById(elementName));
		domElements.secondary.style.display = "none";
		if (!ThreejsHandler.init())
			return showText("WebGL Error", "This app couldn't initialize WebGL");
		scene = ThreejsHandler.scene;

		controller = new ExplorerControl(ThreejsHandler.scene, ThreejsHandler.camera);
		controller.addCallback("lock", () => (domElements.main.style.display = "none"));
		controller.addCallback("release", () => (domElements.main.style.display = "flex"));
		player = controller;


		menu = new Menu({wrapper: document.body, data:menuData});

		particleSystem = new ParticleSystem(ThreejsHandler.scene, 0.5);
		try {
			world = new WorldHandler(controller, ThreejsHandler.scene);
		} catch (e) {
			if (e instanceof DOMException) {
				console.log("Cross origin error, you must first disable security or run on a local server.");
			} else {
				console.log(e);
			}
			if (ThreejsHandler.renderer && ThreejsHandler.renderer.domElement)
				ThreejsHandler.renderer.domElement.style.display = "none";
			showText("WebWorkers Error", "WebWorker API is either not supported or disabled.");
			return;
		}

		menuData.position = controller.position;
		menuData.rotation = controller.rotation;
		menuData.world = world;

		function onMessageClick() {
			if (!controller.isEnabled()) {
				controller.lock();
			}
		}

		domElements.main.addEventListener("click", onMessageClick, false);
		window.addEventListener("resize", onResize, false);

		particleSystem.init();

		SpecialStepUpdatePattern.init({
			update: update,
			draw: draw,
			logMode: false,
			timeStamp: 16
		});

		showText("Paused", "Click anywhere to start<br><br>[W,A,S,D] to move around<br>[Space/Shift] to move up and down<br>[Right Shift] Toggle movement speed");
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