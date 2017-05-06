let menuElements;

function Menu(config = {}) {
	(function loadDefaultConfig() {
		(config.wrapper === undefined)		&& (config.wrapper = document.body);
		(config.maxY === undefined)			&& (config.maxY = 1);
	}());
	let state, elements, isMobile;
	elements = {};
	this.setupElements(config.wrapper, elements);
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
		} else if (nState === "open") {
			elements.wrapper.style.width = "100vmin";
			elements.wrapper.style.height = "100vmin";
			elements.inner.style.maxHeight = "";
			elements.inner.style.fontSize = "1.5cm";
			elements.innerElements.style.opacity = "1";
		}
		state = nState;
	}
	let lastEventTimestamp;
	function onClick(event) {
		if (- lastEventTimestamp + (lastEventTimestamp = event.timeStamp) < 10) {
			return;
		} else {
			if (event instanceof MouseEvent && event.button !== 0)
				return
			event.preventDefault();
			setState(((state === "closed")?"open":"closed"))
		}
	}
	elements.wrapper.addEventListener("mouseup", onClick);
	elements.wrapper.addEventListener("touchstart", onClick);
	setState("closed");
}

Menu.prototype = {
	constructor: Menu,
	createElementWithStyle: function(type, style) {
		let element = document.createElement(type);
		element.setAttribute("style", style.replace(/(\r\n\t|\n|\r|\t)/gm,""));
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
		elements.innerTitle.innerText = "Menu";

		/* ELEMENTS STYLE */
		style = `
			margin:0px;
			width: 100px;
			height: 100%;
			background-color:red;
			transition: inherit;
		`;
		elements.innerElements = this.createElementWithStyle("div", style);
		elements.inner.appendChild(elements.innerTitle);
		elements.inner.appendChild(elements.innerElements);
		elements.wrapper.appendChild(elements.inner);
		wrapper.appendChild(elements.wrapper);
	}
}