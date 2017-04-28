const FakeWorldGeneration = {
	postMessage: function(message) {
		if (this.onmessage === undefined) return;
		this.onmessage("chello");
	}
}