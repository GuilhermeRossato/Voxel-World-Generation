function Logger(width=100) {
	this.domElement = document.createElement("div");
	this.domElement.setAttribute("style", `cursor:default;width:${width}px;background-color:#DDD;text-align:center;position:absolute;top:0;left:0;`);
	document.body.appendChild(this.domElement);
	document.body.style.backgroundColor = "white";
	this.labels = [];
}

Logger.prototype = {
	constructor: Logger,
	addLabel: function() {
		let label = document.createElement("div");
		this.domElement.appendChild(label);
		this.labels.push(label);
	},
	setText: function(...texts) {
		while (texts.length > this.labels.length) {
			this.addLabel();
		}
		this.labels.forEach((label, i) => {
			label.innerText = (i < texts.length)?texts[i]:"****";
		});
	}
}