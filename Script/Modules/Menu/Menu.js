let menuElements;

function Menu(config={}) {
	//debugger;
	(function loadDefaultConfig() {
		(config.wrapper === undefined) && (config.wrapper = document.body);
		(config.maxY === undefined) && (config.maxY = 1);
		(config.data === undefined) && (config.data = {});
	}());
	let state, elements, isMobile;
	elements = {};
	this.setupElements(config.wrapper, elements);
	this.data = config.data;
	menuElements = elements;
	state = "initializing";
	isMobile = ((window.mobileAndTabletcheck instanceof Function) && window.mobileAndTabletcheck());
	function setState(nState) {
		if (nState === "closed") {
			elements.wrapper.style.width = "15vmax";
			elements.wrapper.style.height = "5vmax";
			elements.inner.style.maxHeight = "5vmax";
			elements.inner.style.fontSize = "0.75cm";
			elements.innerElements.style.opacity = "0";
			elements.innerElements.style.height = "0px";
			elements.innerTitle.innerText = "Info";
		} else if (nState === "open") {
			var contentSize = 30*5;
			elements.wrapper.style.width = (100+contentSize)+"px";
			elements.wrapper.style.height = (60+contentSize)+"px";
			elements.inner.style.maxHeight = "";
			elements.inner.style.fontSize = "0.75cm";
			elements.innerElements.style.opacity = "1";
			elements.innerElements.style.height = contentSize+"px";
			elements.innerTitle.innerText = "Click to Close";
		}
		state = nState;
	}
	let lastEventTimestamp;
	function onClick(event) {
		if (-lastEventTimestamp + (lastEventTimestamp = event.timeStamp) < 10) {
			return;
		} else {
			if (event instanceof MouseEvent && event.button !== 0)
				return
			event.preventDefault();
			setState(((state === "closed") ? "open" : "closed"))
		}
	}
	elements.wrapper.addEventListener("mouseup", onClick);
	elements.wrapper.addEventListener("touchstart", onClick);
	setState("closed");
	this.elements = elements;
	this.getState = function() {
		return state;
	}
}

Menu.prototype = {
	constructor: Menu,
	hide: function() {
		this.elements.wrapper.style.display = "none";
	},
	show: function() {
		this.elements.wrapper.style.display = "flex";
	},
	update: function() {
		if (this.elements && this.getState() == "open" && this.data.position && this.data.position.x) {
			/* Makeshift debounce to not update DOM all the time */
			var thisData = [this.data.position.x, this.data.position.y, this.data.position.z, this.data.rotation.pitch, this.data.rotation.yaw, this.data.world.chunkCount, window.innerWidth, window.innerHeight];
			var i, somethingChanged = (!this.lastData);
			if (this.lastData) {
				/* Check whenever something is different, and fixes undefined values*/
				for (i = 0; (i < thisData.length); i++) {
					((thisData[i] === undefined) && (thisData[i] = {
						toFixed: ()=>"?"
					}));
					((thisData[i] !== this.lastData[i]) && (somethingChanged = true));
				}
			}
			if (somethingChanged) {
				this.lastData = thisData;
				this.elements.position.text.innerText = thisData[0].toFixed(1) + ", " + thisData[2].toFixed(1);
				this.elements.rotation.text.innerText = thisData[3].toFixed(2) + ", " + thisData[4].toFixed(2);
				this.elements.height.text.innerText = thisData[1].toFixed(1);
				this.elements.chunks.text.innerText = thisData[5].toFixed(0);
				this.elements.viewport.text.innerText = thisData[6].toFixed(0) + " x " + thisData[7].toFixed(0)
			}
		}
		(this.data.position.x).toFixed(1);
	},
	createElementWithStyle: function(type, style) {
		let element = document.createElement(type);
		element.setAttribute("style", style.replace(/(\r\n\t|\n|\r|\t)/gm, ""));
		return element;
	},
	setupElements: function(wrapper, elements) {
		/* WRAPPER STYLE */
		let style = `
			display: flex; align-items: center;
			justify-content: center;
			position:relative;
			z-index:10;
			transition: all 0.4s cubic-bezier(0.7, 0, 0.3, 1);
			margin: 0 0% auto auto;
			padding:0;
			background-color:#888;
			min-width:2cm;
			min-height:1cm;
			cursor:pointer;
			border-bottom-left-radius: 8px;
		`;
		elements.wrapper = this.createElementWithStyle("div", style);
		menuDiv = elements.wrapper;
		/* INNER STYLE */
		style = `
			width:auto;
			height:auto;
			max-width: 480px;
			max-height: 5vmax;
			text-align:center;
			color:#111;
			transition: inherit;
			pointer-events:none;
		`;
		elements.inner = this.createElementWithStyle("div", style);
		elements.innerTitle = this.createElementWithStyle("span", "");
		elements.innerTitle.innerText = "Info";

		/* ELEMENTS STYLE */
		style = `
			margin:0px;
			width: 100%;
			height: 100%;
			transition: inherit;
			display: flex;
			flex-wrap: wrap;
			overflow: hidden;
			margin-top:10px;
		`;
		elements.innerElements = this.createElementWithStyle("div", style);

		/* Information Lines */
		["Position", "Height", "Rotation", "Chunks", "Viewport"].forEach((type,i)=>{
			var line = this.createElementWithStyle("div", `order: ${i}; padding: 2px 0px; display: grid; grid-template-columns: 80px 1fr; width: 100%`)
			line.label = this.createElementWithStyle("span", "font-size: 14px; padding: 4px; grid-column: 1/1; text-align:right;");
			line.text = this.createElementWithStyle("span", "font-size: 14px; font-family: Courier; padding:4px; grid-column: 2/2; text-shadow: 0px 0px 3.5px white; font-weight: bold;");
			line.label.innerText = type + ":";
			line.text.innerText = "?";
			line.appendChild(line.label);
			line.appendChild(line.text);
			elements.innerElements.appendChild(line);
			elements[type.toLowerCase()] = line;
		}
		);
		/* Final Appends */
		elements.innerElements.appendChild(elements.position);
		elements.inner.appendChild(elements.innerTitle);
		elements.inner.appendChild(elements.innerElements);
		elements.wrapper.appendChild(elements.inner);
		wrapper.appendChild(elements.wrapper);
	}
}
