var app, worker;

function getWorker() {
	try {
		var w = new Worker("Script/WorldGeneration/WorldWorker1.js")
		return w;
	} catch(e) {
		return FakeWorldGenerator;
	}
}

window.addEventListener("load", () => {
	app = new Application();
	worker = getWorker();
	worker.onmessage = function(message) {
		if (message.data[0] === "c") {
			console.log(message.data.substr(1));
		}
	}
	worker.postMessage("c0,0,0");
});