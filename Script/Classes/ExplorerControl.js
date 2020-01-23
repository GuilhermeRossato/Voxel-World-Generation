function ExplorerControl(scene, camera) {
	let pointerLock, yawObject, pitchObject;
	let enabled = false;
	let position;
	let direction = new THREE.Vector3(0, 0, 0);
	let rotation = {};
	Object.defineProperty(rotation, "yaw", {
		get: () => ((yawObject)? yawObject.rotation.y : 0),
		set: (value) => ((yawObject) && (yawObject.rotation.y = value))
	});
	Object.defineProperty(rotation, "pitch", {
		get: () => ((pitchObject)? pitchObject.rotation.x : 0),
		set: (value) => ((pitchObject) && (pitchObject.rotation.x = value))
	});
	Object.defineProperty(this, "position", {
		get: () => position,
		set: (value) => false
	});
	Object.defineProperty(this, "rotation", {
		get: () => rotation,
		set: (value) => false
	});

	function loadPosition() {
		if (typeof getCookie === "function") {
			let cookieValue;
			["x", "y", "z"].forEach(axis => {
				cookieValue = getCookie(`explorer_${axis}`);
				if (typeof cookieValue === "string" && cookieValue.length > 0 && (!(isNaN(parseFloat(cookieValue))))) {
					position[axis] = parseFloat(cookieValue);
				}
			});
			["pitch", "yaw"].forEach(direction => {
				cookieValue = getCookie(`explorer_${direction}`);
				if (typeof cookieValue === "string" && cookieValue.length > 0 && (!(isNaN(parseFloat(cookieValue))))) {
					rotation[direction] = parseFloat(cookieValue);
				}
			});
			yawObject.rotation.y = rotation.yaw;
			pitchObject.rotation.x = rotation.pitch;
		}
	}

	function savePosition() {
		if (typeof setCookie === "function") {
			["x", "y", "z"].forEach(axis => {
				setCookie(`explorer_${axis}`, position[axis], 30);
			});
			["pitch", "yaw"].forEach(direction => {
				setCookie(`explorer_${direction}`, rotation[direction], 30);
			});
		}
	}

	let callbacks = {};

	function forEachPropertyInObject(object, f) {
		for (var property in object) {
			if (object.hasOwnProperty(property)) {
				f(property, object[property]);
			}
		}
	}

	function pointerLockChange(ev) {
		if (document.pointerLockElement === document.body) {
			yawObject.rotation.y = rotation.yaw;
			position.copy(position);
			pitchObject.rotation.x = rotation.pitch;
			pointerLock.enabled = true;
			callbacks.lock && callbacks.lock();
		} else {
			forEachPropertyInObject(keys, (property) => (keys[property] = false));
			pointerLock.enabled = false;
			enabled = false;
			rotation.yaw = yawObject.rotation.y;
			rotation.pitch = pitchObject.rotation.x;
			savePosition();
			callbacks.release && callbacks.release();
		}
	}

	this.savePosition = savePosition;

	const keys = {
		"KeyW": false,
		"KeyD": false,
		"KeyS": false,
		"KeyA": false,
		"Space": false,
		"ShiftLeft": false,
		"ShiftRight": false,
		"KeyR": false
	}

	function onKeyDown(ev) {
		if (keys[ev.code] === false && ev.code !== "ShiftRight") {
			keys[ev.code] = true;
		} else if (ev.code == "F5") {
			savePosition();
		}
	}
	function onKeyUp(ev) {
		if (ev.code === "ShiftRight") {
			keys[ev.code] = !keys[ev.code];
		} else if (ev.code === "KeyR" && worldSize < 20) {
			app.setupWorld();
		} else if (keys[ev.code] === true) {
			keys[ev.code] = false;
		}
	}

	/*
	var gamepads = {};

	function gamepadConnected(ev) {
		if (ev.gamepad)
			gamepads[ev.gamepad.index] = ev.gamepad;
		console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
		ev.gamepad.index, ev.gamepad.id,
		ev.gamepad.buttons.length, ev.gamepad.axes.length);
	}

	function gamepadDisconnected(ev) {
		if (ev.gamepad)
			delete gamepads[ev.gamepad.index];
	}
	*/
	this.getPointerLock = function() {
		return pointerLock;
	}
	this.getYawObject = function() {
		return yawObject;
	}
	this.addCallback = function(type, func) {
		callbacks[type] = func;
	}
	this.isEnabled = function() {
		return enabled;
	}
	this.dispose = function() {
		if (pointerLock)
			pointerLock.dispose();
		document.removeEventListener('pointerlockchange', pointerLockChange, false);
		document.removeEventListener('keydown', onKeyDown, false);
		document.removeEventListener('keyup', onKeyUp, false);
		//window.removeEventListener("gamepadconnected", gamepadConnected, false);
		//window.removeEventListener("gamepaddisconnected", gamepadDisconnected, false);
	}
	this.update = function() {
		if (yawObject && pitchObject) {
			this.updateDirectionVector();
			let multiplier = (keys["ShiftRight"]?8:2);
			if (direction.x != 0)
				position.x += direction.x * 0.085*multiplier;
			if (direction.y != 0)
				position.y += direction.y * 0.105*multiplier;
			if (direction.z != 0)
				position.z += direction.z * 0.085*multiplier;
		}
	}
	this.lock = function() {
		if (enabled) return;
		enabled = true;
		document.body.requestPointerLock();
	}
	this.release = function() {
		if (!enabled) return;
		document.exitPointerLock();
	}
	this.updateDirectionVector = function() {
		let value = (keys["KeyW"]?1:0) + (keys["KeyS"]?1:0) * 2 + (keys["KeyA"]?1:0) * 4 + (keys["KeyD"]?1:0) * 8;
		let x, z;
		if (value > 0 && value < 15 && value !== 12) {
			x = [0, 0, 0, -1, -0.70703125, -0.70703125, -1, 1, 0.70703125, 0.70703125, 1, 0, 0, 0][value - 1];
			z = [-1, 1, 0, 0, -0.70703125, 0.70703125, 0, 0, -0.70703125, 0.70703125, 0, 0, -1, 1][value - 1];
		} else {
			x = 0;
			z = 0;
		}
		let verticalDirection = keys["ShiftLeft"]?-1:(keys["Space"]?1:0);
		direction.set(x, verticalDirection, z);
		if (yawObject)
			direction.applyQuaternion(yawObject.quaternion);
	}
	function init(scene, camera) {
		if (!(scene instanceof THREE.Scene)) throw "Missing parameter: Scene Object";
		if (!(camera instanceof THREE.Camera)) throw "Missing parameter: Camera Object";
		pointerLock = new THREE.PointerLockControls(camera);
		yawObject = pointerLock.getObject();
		pitchObject = yawObject.children[0];
		position = yawObject.position;
		scene.add(yawObject);
		yawObject.position.set(200,35,200);
		loadPosition();
		direction = new THREE.Vector3(0,0,0);
		document.addEventListener('pointerlockchange', pointerLockChange);
		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
		//window.addEventListener("gamepadconnected", gamepadConnected);
		//window.addEventListener("gamepaddisconnected", gamepadDisconnected);
	}
	init.call(this, scene, camera);
}

ExplorerControl.prototype = {
	constructor: ExplorerControl
}