var interp = [];

const AnimationModule = (function() {

	let animationSize = 156;
	let player; // Class with .position {x, y, z} and .rotation {yaw, pitch}
	let enabled = false;
	let points = [];
	let state = "idle";
	let updateCallback;
	let count = 0;
	let redirectUpdate, redirectBusy;
	let startPos;

	function easeInterpolation(x) {
		return FastInterpolation.any(0,0,0.1,0.01,0.9,0.99,1,1,x);
	}

	function getInterpolationFor(parameter) {
		let n = [];
		for (let i = 0 ; i < points.length; i++) {
			n.push(i/(points.length-1), points[i][parameter]);
		}
		return FastInterpolation.any(...n);
	}

	function update() {
		if (count === animationSize)
			console.log("Warning: Last frame");
		["x", "y", "z"].forEach((parameter,i) => {
			player.position[parameter] = interp[i].at(easeInterpolation(count/animationSize));
		});
		["yaw", "pitch"].forEach((parameter,i) => {
			player.rotation[parameter] = interp[i+3].at(easeInterpolation(count/animationSize));
		});
		//console.log(player.position.x, player.position.y, player.position.z, player.rotation.yaw, player.rotation.pitch);
		count++;
	}
	function startAnimation() {
		startPos = {x: player.position.x, y: player.position.y, z: player.position.z, yaw: player.rotation.yaw, pitch:player.rotation.pitch};
		console.log("Animation started with "+points.length+" points");
		interp.length = 0;
		count = 0;
		["x", "y", "z", "yaw", "pitch"].forEach(parameter => {
			interp.push(getInterpolationFor(parameter));
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

	function addPoint(x, y, z, yaw = 0, pitch = 0) {
		let pointInfo = {x: x, y: y, z: z, yaw: yaw, pitch:pitch};
		points.push(pointInfo);
		return pointInfo;
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
			if (points.length >= 4) {
				console.log("Cannot add points: Too many points already exists");
			} else {
				let pointInfo = addPoint(player.position.x, player.position.y, player.position.z, player.rotation.yaw, player.rotation.pitch);
				if (pointInfo instanceof Error)
					console.log(pointInfo);
				else
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
			update();
		} else if (ev.code === keys.stop && state === "playing") {
			stop();
		}
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
		if (startPos) {
			player.position.set(startPos.z, startPos.y, startPos.z);
			player.rotation.yaw = startPos.yaw;
			player.rotation.pitch = startPos.pitch;
		}
	}

	return {
		points: points,
		getInterpolationFor: getInterpolationFor,
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
		addPoint: function(x, y, z, yaw = 0, pitch = 0) {
			if (typeof x === "object")
				if (typeof x.position === "object")
					return addPoint(x.position.x, x.position.y, x.position.z, x.rotation.yaw, x.rotation.pitch);
				else if (typeof x.x === "number")
					return addPoint(x.x, x.y, x.z, x.yaw, x.pitch);
				else
					return new Error("Unrecognized input");
			else if (typeof x === "number" && typeof y === "number" && typeof z === "number")
				return addPoint(x, y, z, yaw, pitch);
			else
				return new Error("Unrecognized input");
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

setTimeout(()=>{
	AnimationModule.init(player);
}, 1000)
