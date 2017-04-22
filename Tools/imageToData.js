var state, canvas, ctx, cout, ctx1, drop, output, drawPanned;

var radius = 7;
var pts = [];

function answerRequest() {
	if (canvas.width === 0)
		return;
	console.log("hi");
}


function init() {
	drop = document.getElementsByTagName("div")[0];
	output = document.getElementsByTagName("div")[1];
	canvas = document.getElementsByTagName("canvas")[0];
	cout = document.getElementsByTagName("canvas")[1];
	cout.style.display = "none";
	ctx = canvas.getContext('2d');
	ctx1 = cout.getContext('2d');
	canvas.width = canvas.height = cout.width = cout.height = 0;
	canvas.style.marginBottom = "16px";
	setState("Initialized");
}

function setState(s, extra) {
	state = s;
	if (extra)
		output.innerHTML = state + extra;
	else
		output.innerHTML = state;
}

function clear() {
	ctx.clearRect(-1, -1, canvas.width + 2, canvas.height + 2);
}

function noopHandler(ev, leaving) {
	setState("waiting image to be dropped");
	ev.stopPropagation();
	ev.preventDefault();
}

function onReadyImage(img) {
	canvas.width = img.width;
	canvas.height = img.height;
	drawPanned = function(x, y) {
		ctx.drawImage(img, -x, -y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
	}
	drawPanned(0, 0);
	output.innerText = canvas.toDataURL();
}

function inside(pt, x, y) {
	var dist = (x - pt.x) * (x - pt.x) + (y - pt.y) * (y - pt.y);
	return ( dist < (radius + 1) * (radius + 1)) ;
}

function onMouseDown(ev) {
}

function onMouseMove(ev) {
	mouseX = ev.clientX - 9;
	mouseY = ev.clientY - 9;
}

function onMouseUp(ev) {
	mouseX = ev.clientX - 9;
	mouseY = ev.clientY - 9;
}

function onKeyDown(ev) {
	
}

function onKeyUp(ev) {
	
}

function drop(ev) {
	ev.stopPropagation();
	ev.preventDefault();
	if (ev.dataTransfer.files[0]) {
		setState("reading file", "</br> File: \"" + ev.dataTransfer.files[0].name + "\"");
		var reader = new FileReader();
		reader.addEventListener("loadend", function(ev) {
			var img = document.createElement("img");
			img.src = this.result;
			img.addEventListener("load", function() {
				drop.style.display = "none";
				onReadyImage(img);
				document.body.removeChild(img);
			});
			document.body.appendChild(img);
		});
		reader.readAsDataURL(ev.dataTransfer.files[0]);
	}
}

document.body.addEventListener('dragenter', (ev)=>noopHandler(ev, false), false);
document.body.addEventListener('dragexit', (ev)=>noopHandler(ev, true), false);
document.body.addEventListener('dragover', (ev)=>noopHandler(ev, false), false);
document.body.addEventListener('drop', drop, false);

function repeat(n, f) {
	for (var i = 0; i < n; i++)
		f(i);
}

function b(i, j, k) {
	return i + (j - i) * k;
}

function ib(i,j,b) {
	return ((i - j) == 0) ? 0 : ((i - b) / (i - j))
}

Object.defineProperty(window, "interpolation", { get: function() {
	var pts = [];
	return {
		add: function(x, y) {
			pts.push([x, y]);
			return this;
		},
		_update: function() {
		},
		at: function(x) {
			if (pts.length === 1)
				return pts[0][1];
			else if (pts.length === 2)
				return b(pts[0][1], pts[1][1], ib(pts[0][0], pts[1][0], x));
			else if (pts.length === 3)
				return b(b(pts[0][1], pts[1][1], ib(pts[0][0], pts[1][0], x)),b(pts[1][1], pts[2][1], ib(pts[1][0], pts[2][0], x)), ib(pts[0][0], pts[2][0], x));
			else if (pts.length === 4)
				return b(b(b(pts[0][1], pts[1][1], ib(pts[0][0], pts[1][0], x)), b(pts[1][1], pts[2][1], ib(pts[1][0], pts[2][0], x)), ib(pts[0][0], pts[2][0], x)), b(b(pts[1][1], pts[2][1], ib(pts[1][0], pts[2][0], x)), b(pts[2][1], pts[3][1], ib(pts[2][0], pts[3][0], x)), ib(pts[1][0], pts[3][0], x)), ib(pts[0][0], pts[3][0], x));
			else if (pts.length === 5) {
				return b(b(b(b(pts[0][1], pts[1][1], ib(pts[0][0], pts[1][0], x)), b(pts[1][1], pts[2][1], ib(pts[1][0], pts[2][0], x)), ib(pts[0][0], pts[2][0], x)), b(b(pts[1][1], pts[2][1], ib(pts[1][0], pts[2][0], x)), b(pts[2][1], pts[3][1], ib(pts[2][0], pts[3][0], x)), ib(pts[1][0], pts[3][0], x)), ib(pts[0][0], pts[3][0], x)),b(b(b(pts[1][1], pts[2][1], ib(pts[1][0], pts[2][0], x)), b(pts[2][1], pts[3][1], ib(pts[2][0], pts[3][0], x)), ib(pts[1][0], pts[3][0], x)), b(b(pts[2][1], pts[3][1], ib(pts[2][0], pts[3][0], x)), b(pts[3][1], pts[4][1], ib(pts[3][0], pts[4][0], x)), ib(pts[2][0], pts[4][0], x)), ib(pts[1][0], pts[4][0], x)),ib(pts[0][0], pts[4][0], x));
			} else {
				this.warn();
				return 0;
			}
		},
		warn: function(len) {
			console.warn("Consider creating a more performant interpolation method. This was not made to efficiently interpolate "+ len + " points");
			this.warn = () => undefined;
		}
	}
}});