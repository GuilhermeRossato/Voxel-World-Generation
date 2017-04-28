var app, worker;

window.addEventListener("load", () => {
	worker = new Worker("Script/WorldGeneration/WorldWorker1.js")
	worker.onmessage = function(message) {
		if (message.data[0] === "c") {
			console.log(message.data.substr(1));
		}
	}
	worker.postMessage("c0,0,0");
	app = new Application();
});