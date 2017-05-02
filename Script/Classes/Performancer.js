/*!
 * Graphically displays a continous array of numbers between 0 and 256
 * Commonly used to display millisecond delay between frames
 * Note: Only usefull if the ".update" function is called at least 5 times a second.
 *
 * Heavily inspired on Stats from mrdoobs (https://github.com/mrdoob/stats.js/)
 *
 * @name	Performancer Class
 * @author	Guilherme Rossato
 * @link	https://github.com/GuilhermeRossato/JsAppHelpers/tree/master/Performancer
 * @year	2017
 * 
 */

function Performancer(config = {}) {
	(function loadDefaultConfig() {
		(config.wrapper === undefined)			&& (config.wrapper = document.body);
		(config.left === undefined)				&& (config.left = 0);
		(config.compact === undefined)			&& (config.compact = false);
		(config.unclickable === undefined)		&& (config.unclickable = false);
		(config.noLabel === undefined)		&& (config.noLabel = false);
		(config.onCompactChange === undefined)	&& (config.onCompactChange = undefined);
		(config.zIndex === undefined)			&& (config.zIndex = undefined);
	}());
	/* Document Elements */
	let wrapper = document.createElement("div");
	this.wrapper = wrapper;
	let span = document.createElement("span");
	let canvas = document.createElement("canvas");
	/* Styles */
	this.setLeft = function(left, zIndex) {
		let alignment = "left:";
		if (typeof left === "string")
			if (left.indexOf(";") === -1)
				alignment += left+";";
			else
				alignment += left.substr(0, left.indexOf(";")+1);
		else
			alignment += left+"px;";
		alignment += " top:18px";
		let zIndexString = zIndex?("z-index: "+zIndex+";"):"";
		wrapper.setAttribute("style", `
			cursor:pointer;
			${alignment};${zIndexString}
			position:absolute;
			margin:0px;
			padding:0px;
			width:81px;
			max-height:50px;
			background-color:#002200;
			text-shadow:none;
		`);
		return this;
	}
	this.setLeft(config.left, config.zIndex);

	canvas.width = 75;
	canvas.height = 32;
	canvas.setAttribute("style", `
		display:${config.compact?"inline":"none"};
		width: ${canvas.width}px;
		height: ${canvas.height}px;
		background-color:#003300;
		margin: 1px 3px 3px 3px;
		padding: 0;
		image-rendering: pixelated;
	`);
	span.setAttribute("style", `
		display: ${(config.noLabel?"none":"inline")};
		color: #00FF00;
		height: 11px;
		text-align: center;
		display: block;
		width: ${canvas.width}px;
		font-size: 11px;
		font-family: Verdana, Arial;
		padding: 0;
		margin: 0px 3px 3px 3px;
	`);
	span.innerText = "STARTING";
	/* Appends */
	wrapper.appendChild(span);
	wrapper.appendChild(canvas);
	/* Events */
	let index = -1;
	let ctx = canvas.getContext("2d");

	let reset = function() {
		ctx.clearRect(0, 0, 75, 32);
		index = -1;
		return this;
	}
	this.reset = reset;

	let largeDisplay = config.compact;
	if (!config.unclickable) {
		wrapper.onclick = () => {
			canvas.style.display = (largeDisplay)?"none":"inline";
			if (!largeDisplay)
				reset();
			if (config.onCompactChange)
				config.onCompactChange(largeDisplay);
			largeDisplay = !largeDisplay;
			return true;
		}
		wrapper.onclick();
	} else {
		canvas.style.display = (largeDisplay)?"none":"inline";
		largeDisplay = !largeDisplay;
	}

	this.update = function(delta) {
		if (index < 75)
			index++;
		else
			index = 0;
		if (index % 5 === 0)
			span.innerText = `${delta|0} MS`;
		if (largeDisplay) {
			delta = (delta/8)|0;
			if (delta < 9) {
				ctx.fillStyle = "#00DB00";
			} else if (delta < 16) {
				ctx.fillStyle = "#DBDB00";
			} else {
				ctx.fillStyle = "#DB0000";
				delta = 32;
			}
			ctx.clearRect(index, 0, 3, 32);
			ctx.fillRect(index, 31-delta, 1, delta+1);
		}
	}

	this.attach = function(object) {
		if (wrapper.parentNode)
			wrapper.parentNode.removeChild(wrapper);
		if (object && object.appendChild)
			object.appendChild(wrapper);
		else
			console.warn("Unable to append");
		return this;
	}

	if (config.wrapper === null) {
		setTimeout(()=>{
			if (!config.wrapper && !document.body)
				console.warn("Unable to append");
			else if (config.wrapper)
				config.wrapper.appendChild(this.wrapper);
			else
				document.body.appendChild(this.wrapper);
		}, 10);
	} else {
		config.wrapper.appendChild(this.wrapper);
	}
}

Performancer.prototype = {
	constructor: Performancer
}