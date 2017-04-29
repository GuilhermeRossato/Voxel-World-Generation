/*!
* ButtonGen module for:
*		Voxel World Gen Experiment
*
* @author: Guilherme Rossato
*/

const ButtonGen = {
	generate: function(application) {
		application.interactor = new Interactor(150);
		if (typeof worldSize !== "number") {
			console.error("Global Variable worldSize not found!");
			return;
		}
		if (typeof worldFrequency !== "number") {
			console.error("Global Variable worldFrequency not found!");
			return;
		}
		application.interactor.initButtons({
			value: "World Size",
			disabled: true,
			init: function() {
				let cookieValue = getCookie("vwg_worldSize");
				if (typeof cookieValue === "string" && cookieValue.length > 1 && (!(isNaN(parseInt(cookieValue))))) {
					worldSize = parseInt(cookieValue);
				}
				this.value = `World Size: ${worldSize|0}`;
			},
			updateValue: function() {
				this.value = `World Size: ${worldSize|0}`;
				if (typeof setCookie === "function") {
					setCookie("vwg_worldSize", worldSize|0);
				}
			}
		}, {
			value: "World Size +",
			onclick: function() {
				if (typeof worldSize === "number") {
					if (worldSize < 256)
						worldSize = worldSize * 1.25;
					(application.interactor.buttons[0]) && (application.interactor.buttons[0].updateValue());
				}
			}
		}, {
			value: "World Size -",
			onclick: function() {
				if (typeof worldSize === "number") {
					if (worldSize >= 1.25)
						worldSize = worldSize / 1.25;
					(application.interactor.buttons[0]) && (application.interactor.buttons[0].updateValue());
				}
			}
		}, {
			value: "Frequency",
			disabled: true,
			init: function() {
				let cookieValue = getCookie("vwg_frequency");
				if (typeof cookieValue === "string" && cookieValue.length > 1 && (!(isNaN(parseInt(cookieValue))))) {
					worldFrequency = parseInt(cookieValue);
				}
				this.value = `Frequency: ${((worldFrequency*1000|0)/1000)}`;
			},
			updateValue: function() {
				this.value = `Frequency: ${((worldFrequency*1000|0)/1000)}`;
				if (typeof setCookie === "function") {
					setCookie("vwg_frequency", worldFrequency|0);
				}
			}
		}, {
			value: "Frequency +",
			onclick: function() {
				if (typeof worldFrequency === "number") {
					worldFrequency = worldFrequency * 1.15;
					(application.interactor.buttons[3]) && (application.interactor.buttons[3].updateValue());
				}
			}
		}, {
			value: "Frequency -",
			onclick: function() {
				if (typeof worldFrequency === "number") {
					worldFrequency = worldFrequency / 1.15;
					(application.interactor.buttons[3]) && (application.interactor.buttons[3].updateValue());
				}
			}
		}, {
			value: "Recreate World",
			onclick: () => application.setupWorld()
		});
	}
}