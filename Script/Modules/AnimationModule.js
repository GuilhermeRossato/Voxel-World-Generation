const AnimationModule = (function() {

	let animationSize = 156;
	let player; // Class with .position {x, y, z} and .rotation {yaw, pitch}
	let enabled = false;
	let points = [];
	let state = "idle";
	let updateCallback;
	let count = 0;
	let redirectUpdate, redirectBusy;

	function easeInterpolation(x) {
		return x;
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
		else if (points.length === 6)
			return interpolation.add(0, points[0][parameter]).add(animationSize*easeInterpolation(1/5), points[1][parameter]).add(animationSize*easeInterpolation(2/5), points[2][parameter]).add(animationSize*easeInterpolation(3/5), points[3][parameter]).add(animationSize*easeInterpolation(4/5), points[4][parameter]).add(animationSize, points[5][parameter]);
		else
			return {at:i=>i};
	}

	function update() {
		if (count === animationSize)
			console.log("Warning: Last frame");
		["x", "y", "z"].forEach((parameter,i) => {
			player.position[parameter] = getInterpolationFor(parameter).at(count);
		});
		["yaw", "pitch"].forEach((parameter,i) => {
			player.rotation[parameter] = getInterpolationFor(parameter).at(count);
		});
		console.log(player.position.x, player.position.y, player.position.z, player.rotation.yaw, player.rotation.pitch);
		count++;
	}
	function startAnimation() {
		startPos = {x: player.position.x, y: player.position.y, z: player.position.z};
		console.log("Animation started");
		trackFunctions = [];
		["x", "y", "z", "yaw", "pitch"].forEach(parameter => {
			trackFunctions.push(getInterpolationFor(parameter));
		});
		update();
		state = "playing";
		if (typeof performancer === "object") {
			performancer.wrapper.style.top = "0px";
		}
		if (app.controller) {
			app.controller.release();
			redirectUpdate = app.controller.update;
			redirectBusy = app.controller.isEnabled;
			app.controller.update = ()=>true;
			app.controller.isEnabled = ()=>true;
			setTimeout(()=>(app.main.style.display = "none"), 200);
		}
	}
	var keys = {
		"add": "KeyE",
		"remove": "KeyR",
		"show": "KeyC",
		"start": "KeyQ",
		"step": "KeyZ",
		"stop": "KeyX"
	}

	function onKeyDown(ev) {
		if (ev.code === keys.add && player && state === "saving") {
			if (points.length >= 6) {
				console.log("Cannot add points: Too many points already exists");
			} else {
				let pointInfo = {x: player.position.x, y: player.position.y, z: player.position.z, yaw: player.rotation.yaw, pitch:player.rotation.pitch};
				points.push(pointInfo);
				console.log(`Added point ${pointInfo.x}, ${pointInfo.y}, ${pointInfo.z} - Looking at ${pointInfo.yaw}, ${pointInfo.pitch}`);
			}
		} else if (ev.code === keys.remove && player && state === "saving") {
			if (points.length > 0) {
				let pointInfo = points.pop();
				console.log(`Removed point ${pointInfo.x}, ${pointInfo.y}, ${pointInfo.z} - Looking at ${pointInfo.yaw}, ${pointInfo.pitch}`);
			} else
				console.log("No point to remove");
		} else if (ev.code === keys.show) {
			console.table(points);
		} else if (ev.code === keys.start && state === "saving") {
			if (points.length === 0) {
				console.log("Cannot start animation: No points created.");
			} else if (points.length === 1) {
				console.log("Cannot start animation: Only one point created.");
			} else {
				startAnimation();
			}
		} else if (ev.code === keys.step && state === "playing") {
			console.log("Updating");
			update();
		} else if (ev.code === keys.stop && state === "playing") {
			stop();
		}
	}

	function stop() {

	}

	function validatePlayer(pl) {
		if (!pl || !pl.position || !pl.rotation)
			return new Error("Player property missing");
		if (!(typeof pl.position.x === "number") || !(typeof pl.position.y === "number") || !(typeof pl.position.z === "number"))
			return new Error("Player position doesn't contain numbers");
		if (!(typeof pl.rotation.pitch === "number") || !(typeof pl.rotation.yaw === "number"))
			return new Error("Player rotation doesn't contain numbers");
	}

	function stop() {
		enabled = false;
		window.removeEventListener("keydown", onKeyDown);
		console.log(`Animation ended at frame ${count}`);
		state = "idle";
		if (redirectUpdate) {
			app.controller.update = redirectUpdate;
			app.controller.isEnabled = redirectBusy;
			app.main.style.display = "flex";
		}
	}

	return {
		points: points,
		getCount: function() {
			return count
		},
		init: function(pl, callback) {
			if (enabled) return new Error("Already Started");
			if (typeof player !== "object") {
				if (!pl) return new Error("Missing Player Object");
				let validation = validatePlayer(pl);
				if (validation instanceof Error)
					return validation;
				player = pl;
			}
			points.length = 0;
			enabled = true;
			updateCallback = callback;
			window.addEventListener("keydown", onKeyDown);
			state = "saving";
			console.log("Animation Enabled");
			console.log(`${keys.add} to save point, ${keys.remove} to remove, ${keys.start} to begin, ${keys.step} to step, ${keys.stop} to finish, ${keys.show} to show list`);
		},
		stop: function() {
			if (state === "playing")
				stop();
			else
				console.warn("Not currently playing");
		},
		dispose: function() {
			window.removeEventListener("keydown", onKeyDown);
			points = undefined;
			player = undefined;
			keys = undefined;
			updateCallback = undefined;
			this.init = undefined;
			this.stop = undefined;
			this.dispose = undefined;
		}
	}
}());

