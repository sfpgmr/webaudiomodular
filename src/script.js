"use strict";

import * as audio from './audioNode_';
import {initUI,draw,svg } from './draw';

window.onload = () => {
	audio.ctx = new AudioContext();
	d3.select(window)
	.on('resize',function(){
		if(svg){
			svg.attr({
				width:window.innerWidth,
				height:window.innerHeight
			})
		}
	});

	var out = audio.AudioNode_.create(audio.ctx.destination);
	out.x = window.innerWidth / 2;
	out.y = window.innerHeight / 2;
	out.removable = false;
	initUI();
	draw();
};