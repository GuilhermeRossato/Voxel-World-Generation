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
	app = Application;
	app.init();
});