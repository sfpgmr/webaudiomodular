"use strict";

import * as audio from './audio';
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


	initUI();
	draw();
};