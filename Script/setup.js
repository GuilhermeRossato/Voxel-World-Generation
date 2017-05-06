var app, worker;

window.addEventListener("load", () => {
	app = Application;
	app.init();
});

document.addEventListener("touchmove",function(event){
	event.preventDefault();
});