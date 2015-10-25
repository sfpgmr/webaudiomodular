"use strict";
var ctx;
window.onload = () => {
	ctx = new AudioContext();
	
	d3.select(window)
	.on('resize',function(){
		if(svg){
			svg.attr({
				width:window.innerWidth,
				height:window.innerHeight
			})
		}
	});

	var out = AudioNode_.create(ctx.destination);
	out.x = 750;
	out.y = 300;
	initUI();
	draw();
};