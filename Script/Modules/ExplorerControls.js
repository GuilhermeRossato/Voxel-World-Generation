const ExplorerControls = (function() {
	let pointerLock, yawObject, pitchObject;
	let enabled = false;
	let position = {x:0, y:32, z:0};
	let rotation = {yaw:0, pitch:0};

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
			yawObject.position.copy(position);
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

	function pointerLockChange(ev) {
		if (document.pointerLockElement === document.body) {
			yawObject.rotation.y = rotation.yaw;
			yawObject.position.copy(position);
			pitchObject.rotation.x = rotation.pitch;
			pointerLock.enabled = true;
			callbacks.lock && callbacks.lock();
		} else {
			pointerLock.enabled = false;
			enabled = false;
			rotation.yaw = yawObject.rotation.y;
			rotation.pitch = pitchObject.rotation.x;
			position.x = yawObject.position.x;
			position.y = yawObject.position.y;
			position.z = yawObject.position.z;
			savePosition();
			callbacks.release && callbacks.release();
		}
	}

	let keys = {
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
		if (keys[ev.code] === false && ev.code !== "ShiftRight")
			keys[ev.code] = true;
	}
	function onKeyUp(ev) {
		if (ev.code === "ShiftRight") {
			keys[ev.code] = !keys[ev.code];
		} else if (ev.code === "KeyR") {
			app.setupWorld();
		} else if (keys[ev.code] === true)
			keys[ev.code] = false;
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

	return {
		getPointerLock: function() {
			return pointerLock;
		},
		getYawObject: function() {
			return yawObject;
		},
		addCallback: function(type, func) {
			callbacks[type] = func;
		},
		isEnabled: function() {
			return enabled;
		},
		updateDirectionVector: function() {
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
			this.direction.set(x, verticalDirection, z);
			this.direction.applyQuaternion(yawObject.quaternion);
		},
		update: function() {
			if (yawObject && pitchObject) {
				this.updateDirectionVector();
				if (this.direction.x != 0) {
					yawObject.position.x += this.direction.x * (keys["ShiftRight"]?0.085*4:0.085);
				}
				if (this.direction.y != 0)
					yawObject.position.y += this.direction.y * (keys["ShiftRight"]?0.105*4:0.105);
				if (this.direction.z != 0)
					yawObject.position.z += this.direction.z * (keys["ShiftRight"]?0.085*4:0.085);
			}
		},
		init: function(scene, camera) {
			if (!(camera instanceof THREE.Camera)) throw "Missing parameter: Camera Object";
			pointerLock = new THREE.PointerLockControls(camera);
			yawObject = pointerLock.getObject();
			pitchObject = yawObject.children[0];
			scene.add(yawObject);
			loadPosition();
			this.direction = new THREE.Vector3(0,0,0);
			document.addEventListener('pointerlockchange', pointerLockChange);
			document.addEventListener('keydown', onKeyDown);
			document.addEventListener('keyup', onKeyUp);
			//window.addEventListener("gamepadconnected", gamepadConnected);
			//window.addEventListener("gamepaddisconnected", gamepadDisconnected);
			this.init = undefined;
		},
		lock: function() {
			if (enabled) return;
			enabled = true;
			document.body.requestPointerLock();
		},
		release: function() {
			if (!enabled) return;
			document.exitPointerLock();
		},
		dispose: function() {
			if (pointerLock)
				pointerLock.dispose();
			document.removeEventListener('pointerlockchange', pointerLockChange, false);
			document.removeEventListener('keydown', onKeyDown, false);
			document.removeEventListener('keyup', onKeyUp, false);
			//window.removeEventListener("gamepadconnected", gamepadConnected, false);
			//window.removeEventListener("gamepaddisconnected", gamepadDisconnected, false);
		}
	}
}());