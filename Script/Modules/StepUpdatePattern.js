/*!
* @author: Guilherme Rossato
* @name: StepUpdatePattern Module
*
* This module handles updates with a fixed time-step.
*
*/

/*
 * Edited to create a instance of Performancer
*/

var performancer;

const StepUpdatePattern = (function() {

	function loadDefaultConfigurations(config) {
		(config.update === undefined)		&& (config.update = undefined);
		(config.miss === undefined)			&& (config.miss = undefined);
		(config.draw === undefined)			&& (config.draw = undefined); // Function that runs once  
		(config.fpsUpdate === undefined)	&& (config.fpsUpdate = undefined); // Optional function that runs once a second, with the FPS as parameter
		(config.setup === undefined)		&& (config.setup = undefined); // Optional Function that runs right after init() and before the first update()
		(config.timeStep === undefined)		&& (config.timeStep = 16); // How many miliseconds is a step
		(config.singleStep === undefined)	&& (config.singleStep = false); // When true, overwrites the update pattern and updates once each frame inconditionally (good for debug)
		(config.missStep === undefined)		&& (config.missStep = true); // When true causes a single update when it misses frames, instead of zero.
		(config.logMode === undefined)		&& (config.logMode = false); // When true it logs in the console which mode was set for the internal update function.
	}

	function checkConfigurations(config) {
		(config.update === undefined)	&& console.error("No update function to redirect!");
		(config.timeStep < 8)			&& console.warn(`update call is too fast (${(1000/config.timeStep)|0}Hz). Consider using another update pattern.`);
	}

	function generateUpdateFunction(update, miss, draw, fpsUpdate, timeStep, singleStep, missStep, logMode) {
		if (!update)
			return ()=>{}

		let lastUpdt, lastScnd, tS, difference, leftOver, fpsCount, internalUpdate, that;

		performancer = new Performancer({
			compact: (getCookie("is_compact") !== "0"),
			onCompactChange: function(compact) {
				setCookie("is_compact", compact?"1":"0", 30);
			}
		});

		lastScnd = lastUpdt = performance.now();
		fpsCount = leftOver = 0;
		that = this;

		// This function is written like it's trying to predict every configuration because it must generate performance-delicate code.
		if (singleStep && draw && fpsUpdate) {
			this.mode = 1;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt);
				lastUpdt = tS;
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				update(tS);
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (singleStep && draw) {
			this.mode = 2;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt);
				lastUpdt = tS;
				update(tS);
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (singleStep && fpsUpdate) {
			this.mode = 3;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt);
				lastUpdt = tS;
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				update(tS);
				requestAnimationFrame(internalUpdate);
			}
		} else if (singleStep) {
			this.mode = 4;
			internalUpdate = function() {
				update(performance.now());
				requestAnimationFrame(internalUpdate);
			}
		} else if (fpsUpdate && miss && missStep && draw) {
			this.mode = 5;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					miss();
					update(tS);
				}
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (timeStep === 16 && fpsCount && miss && missStep && draw) {
			// Second most commonly used configuration
			this.mode = 6;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= 160) {
					while (difference >= 16) {
						difference -= 16;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					miss();
					update(tS);
				}
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (fpsUpdate && miss && missStep) {
			this.mode = 7;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					miss();
					update(tS);
				}
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				requestAnimationFrame(internalUpdate);
			}
		} else if (fpsUpdate && miss && draw) {
			this.mode = 8;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					miss();
				}
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (fpsUpdate && timeStep === 16 && missStep && draw) {
			this.mode = 9;
			// The most commonly used configuration
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= 160) {
					while (difference >= 16) {
						difference -= 16;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					update(tS);
				}
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					if (tS - lastScnd >= 1000)
						lastScnd = tS;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (fpsUpdate && missStep && draw) {
			this.mode = 10;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					update(tS);
				}
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (fpsUpdate && draw) {
			this.mode = 11;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
				}
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (fpsUpdate && missStep) {
			this.mode = 12;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					update(tS);
				}
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				requestAnimationFrame(internalUpdate);
			}
		} else if (fpsUpdate && miss) {
			this.mode = 13;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					miss();
				}
				if (tS - lastScnd >= 1000) {
					lastScnd += 1000;
					fpsUpdate(fpsCount);
					fpsCount = 0;
				} else
					fpsCount++;
				requestAnimationFrame(internalUpdate);
			}
		} else if (miss && missStep && draw) {
			this.mode = 14;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					miss();
					update(tS);
				}
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (miss && missStep) {
			this.mode = 15;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					miss();
					update(tS);
				}
				requestAnimationFrame(internalUpdate);
			}
		} else if (miss && draw) {
			this.mode = 16;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					miss();
				}
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (timeStep === 16 && missStep && draw) {
			this.mode = 17;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= 160) {
					while (difference >= 16) {
						difference -= 16;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					update(tS);
				}
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (missStep && draw) {
			this.mode = 18;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					update(tS);
				}
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (draw) {
			this.mode = 19;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
				}
				draw();
				requestAnimationFrame(internalUpdate);
			}
		} else if (missStep) {
			this.mode = 20;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					update(tS);
				}
				requestAnimationFrame(internalUpdate);
			}
		} else if (miss) {
			this.mode = 21;
			internalUpdate = function() {
				tS = performance.now();
				performancer.update(difference = tS - lastUpdt + leftOver);
				lastUpdt = tS;
				if (difference <= timeStep*10) {
					while (difference >= timeStep) {
						difference -= timeStep;
						update();
					}
					leftOver = difference;
				} else {
					leftOver = 0;
					miss();
				}
				requestAnimationFrame(internalUpdate);
			}
		} else {
			this.mode = undefined;
			console.error("Unable to create update function");
			internalUpdate = ()=>{}
		}
		if (logMode)
			console.log(`Mode set to ${this.mode}`);
		return internalUpdate;
	}

	return {
		init: function(config = {}) {
			loadDefaultConfigurations(config);
			checkConfigurations(config);
			if (config.setup) {
				setTimeout(()=>{
					config.setup.call(window)
					generateUpdateFunction.call(this, config.update, config.miss, config.draw, config.fpsUpdate, config.timeStep, config.singleStep, config.missStep, config.logMode).call();
				}, 10);
			} else {
				generateUpdateFunction.call(this, config.update, config.miss, config.draw, config.fpsUpdate, config.timeStep, config.singleStep, config.missStep, config.logMode).call();
			}
			this.init = undefined;
		}
	}
})();
