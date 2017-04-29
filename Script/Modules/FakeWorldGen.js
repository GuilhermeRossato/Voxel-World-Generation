const FakeWorldGen = {
	postMessage: function(message) {
		if (this.onmessage === undefined) return;
		this.onmessage("chello");
	}
}