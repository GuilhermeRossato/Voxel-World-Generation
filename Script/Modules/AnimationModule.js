const AnimationModule = (function() {
	
	let animationSize = 120;
	let player; // Class with .position {x, y, z} and .rotation {yaw, pitch}
	let enabled = false;
	let points = [];
	let state = "idle";
	let updateCallback;
	let count = 0;
	
	function easeInterpolation(x) {
		return x*x;
	}
	
	function getInterpolationFor(parameter) {
		if (points.length === 2)
			return interpolation.add(0, points[0][parameter]).add(animationSize, points[1][parameter]);
		else if (points.length === 3)
			return interpolation.add(0, points[0][parameter]).add(animationSize*easeInterpolation(1/2), points[1][parameter]).add(animationSize, points[2][parameter]);
		else if (points.length === 4)
			return interpolation.add(0, points[0][parameter]).add(animationSize*easeInterpolation(1/3), points[1][parameter]).add(animationSize*easeInterpolation(2/3), points[2][parameter]).add(animationSize, points[3][parameter]);
		else if (points.length === 5)
			return interpolation.add(0, points[0][parameter]).add(animationSize*easeInterpolation(1/4), points[1][parameter]).add(animationSize*easeInterpolation(2/4), points[2][parameter]).add(animationSize*easeInterpolation(3/4), points[3][parameter]).add(animationSize, points[4][parameter]);
		else
			return {at:i=>i};
	}
	
	function update() {
		if (count === animationSize)
			console.warn("Warning: Last frame");
		["x", "y", "z"].forEach(parameter => {
			player.position[parameter] = getInterpolationFor(parameter).at(count);
		});
		["yaw", "pitch"].forEach(parameter => {
			player.rotation[parameter] = getInterpolationFor(parameter).at(count);
		});
		count++;
	}
	
	function onKeyDown(ev) {
		if (ev.code === "KeyE" && player && state === "saving") {
			if (points.length >= 5) {
				console.log("Cannot add points: Too many created");
			} else {
				let pointInfo = {x: player.position.x, y: player.position.y, z: player.position.z, yaw: player.rotation.yaw, pitch:player.rotation.pitch};
				points.push(pointInfo);
				console.log(`Added point ${pointInfo.x}, ${pointInfo.y}, ${pointInfo.z} - Looking at ${pointInfo.yaw}, ${pointInfo.pitch}`);
			}
		} else if (ev.code === "KeyR" && player && state === "saving") {
			let pointInfo = points.pop();
			console.log(`Removed point ${pointInfo.x}, ${pointInfo.y}, ${pointInfo.z} - Looking at ${pointInfo.yaw}, ${pointInfo.pitch}`);
		} else if (ev.code === "KeyC") {
			console.table(points);
		} else if (ev.code === "KeyQ" && state === "saving") {
			if (points.length === 0) {
				console.log("Cannot start animation: No points created.");
			} else if (points.length === 1) {
				console.log("Cannot start animation: Only one point created.");
			} else {
				console.log("Animation started");
				update();
				state = "running";
			}
		} else if (ev.code === "KeyZ" && state === "playing") {
			update();
		} else if (ev.code === "KeyX" && state === "playing") {
			console.log(`Animation ended at ${count}`)
			state = "idle";
		}
	}
	
	function validatePlayer(pl) {
		if (!pl || !pl.position || !pl.rotation)
			return;
		if (!(typeof pl.position.x === "number") || !(typeof pl.position.y === "number") || !(typeof pl.position.z === "number"))
			return;
		if (!(typeof pl.rotation.pitch === "number") || !(typeof pl.rotation.yaw === "number"))
			return;
	}
	
	return {
		init: function(pl, callback) {
			if (!validatePlayer(pl)) throw new Error("Invalid Player Object");
			player = pl;
			updateCallback = callback;
			enabled = true;
			window.addEventListener("keydown", onKeyDown);
			state = "saving";
			console.log("Animation Enabled");
			console.log("E to save, R to remove, Q to begin, Z to step, X to finish, C to show list");
			this.init = undefined;
		},
		dispose: function() {
			window.removeEventListener("keydown", onKeyDown);
		}
	}
}());

