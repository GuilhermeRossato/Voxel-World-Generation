/*!
* @author	Guilherme Rossato
* @name		Special StepUpdatePattern Module
*
* This module handles updates with a fixed time-step, this version has two lines and is edited to include an instance of Performancer.
*
*/


const SpecialStepUpdatePattern = (function() {

	function loadDefaultConfigurations(config) {
		(config.update === undefined)		&& (config.update = undefined);
		(config.miss === undefined)			&& (config.miss = undefined);
		(config.draw === undefined)			&& (config.draw = undefined); // Function that runs once  
		(config.setup === undefined)		&& (config.setup = undefined); // Optional Function that runs right after init() and before the first update()
		(config.timeStep === undefined)		&& (config.timeStep = 16); // How many miliseconds is a step
		(config.singleStep === undefined)	&& (config.singleStep = false); // When true, overwrites the update pattern and updates once each frame inconditionally (good for debug)
		(config.missStep === undefined)		&& (config.missStep = true); // When true causes a single update when it misses frames, instead of zero.
		(config.logMode === undefined)		&& (config.logMode = false); // When true it logs in the console which mode was set for the internal update function.
	}

	var performancer;

	function checkConfigurations(config) {
		(config.update === undefined)	&& console.error("No update function to redirect!");
		(config.timeStep < 8)			&& console.warn(`update call is too fast (${(1000/config.timeStep)|0}Hz). Consider using another update pattern.`);
	}

	function generatePerformancer() {
		if (!performancer)
			performancer = new Performancer({
				compact: (getCookie("is_compact") !== "0"),
				onCompactChange: function(compact) {
					setCookie("is_compact", compact?"1":"0", 30);
				}
			});
	}

	function generateUpdateFunction(update, miss, draw, fpsUpdate, timeStep, singleStep, missStep, logMode) {
		if (!update)
			return ()=>{}

		let lastUpdt, lastScnd, tS, difference, leftOver, fpsCount, internalUpdate;

		generatePerformancer();
		fpsUpdate = performancer.updateFPS;
		lastScnd = lastUpdt = performance.now();
		fpsCount = leftOver = 0;
		internalUpdate = function() {
			tS = performance.now();
			performancer.update(difference = tS - lastUpdt + leftOver);
			lastUpdt = tS;
			if (difference <= 260) {
				while (difference >= 16) {
					difference -= 16;
					update();
				}
				leftOver = difference;
			} else {
				leftOver = 0;
				update();
			}
			if (tS - lastScnd >= 1000) {
				lastScnd += 1000;
				fpsUpdate(fpsCount);
				fpsCount = 0;
			} else
				fpsCount++;
			requestAnimationFrame(internalUpdate);
			draw();
		}
		if (logMode)
			console.log(`There's only one mode for this step update module.`);
		return internalUpdate;
	}

	return {
		init: function(config = {}) {
			loadDefaultConfigurations(config);
			checkConfigurations(config);
			if (config.setup) {
				setTimeout(()=>{
					config.setup.call(window)
					generateUpdateFunction.call(this, config.update, config.miss, config.draw, undefined, config.timeStep, config.singleStep, config.missStep, config.logMode).call();
				}, 10);
			} else {
				generateUpdateFunction.call(this, config.update, config.miss, config.draw, undefined, config.timeStep, config.singleStep, config.missStep, config.logMode).call();
			}
			this.init = undefined;
		}
	}
})();
