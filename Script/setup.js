var app, worker;

function getWorker() {
	try {
		var w = new Worker("Script/WorldGeneration/WorldWorker1.js")
		return w;
	} catch(e) {
		return FakeWorldGen;
	}
}

window.addEventListener("load", () => {
	app = new Application();
	worker = getWorker();
	worker.onmessage = function(message) {
		if (message === "c") {
			console.log(message.substr(1));
		}
	}
	worker.postMessage("c0,0,0");
});