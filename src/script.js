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
	
	// for(var i in ctx){
	// 	if(i.match(/create/)){
	// 		try {
	// 		var o = ctx[i]();
	// 		for(var j in o){
	// 			if(o[j] instanceof AudioParam){
	// 				for(var k in o[j]){
	// 					console.log(' ',k,o[j][k] instanceof AudioParam,o[j][k]);
	// 				}
	// 			}
	// 		}
	// 			
	// 		} catch (e){
	// 			console.log(e);
	// 		}
	// 		
	// 	}
	// }
	// 
// 	var osc = AudioNode_.create(ctx.createOscillator());
// 	osc.x = 100;
// 	osc.y = 200;
// 	
// 	var gain = AudioNode_.create(ctx.createGain());
// 	
// 	gain.x = 400;
// 	gain.y = 200;
// 	
// 
// 	var filter = AudioNode_.create(ctx.createBiquadFilter());
// 	filter.x = 250;
// 	filter.y = 330;

	var out = AudioNode_.create(ctx.destination);
	out.x = 750;
	out.y = 300;
	
// 	var osc2 = AudioNode_.create(ctx.createOscillator());
// 	osc2.x = 100;
// 	osc2.y = 600;
// 	
// 	var splitter = AudioNode_.create(ctx.createChannelSplitter());
// 	splitter.x = 250;
// 	splitter.y = 600;
// 
// 	var merger = AudioNode_.create(ctx.createChannelMerger());
// 	merger.x = 500;
// 	merger.y = 600;
// 	
// 	var osc3 = AudioNode_.create(ctx.createOscillator());
// 	osc3.x = 100;
// 	osc3.y = 700;
	

	// for(var i in osc){
	// 	console.log(i + ':' + osc[i]);
	// 	for(var j in osc[i]){
	// 		console.log(' ' + j + ':' + osc[i][j]);
	// 	}
	// }

	// AudioNode_.connect(osc, filter);
	// AudioNode_.connect(osc,gain.audioParams[0]);
	// AudioNode_.connect(filter,gain);
	// AudioNode_.connect(gain,out);
	// AudioNode_.connect(merger,out);
	// AudioNode_.connect({node:splitter,param:0},{node:merger,param:0});
	// AudioNode_.connect({node:splitter,param:1},{node:merger,param:1});
	// AudioNode_.connect({node:splitter,param:2},{node:merger,param:3});
	// AudioNode_.connect({node:splitter,param:3},{node:merger,param:2});
	// AudioNode_.connect({node:splitter,param:5},{node:merger,param:5});
	// AudioNode_.connect({node:splitter,param:4},{node:merger,param:4});
	// AudioNode_.connect(osc2,splitter);
	
	// console.log(AudioNode_.audioNodes.length);
	// console.log(AudioNode_.audioConnections.length);
	// console.log(AudioNode_.audioConnections[0]);

	initUI();
	draw();

	// window.setTimeout(() => {
	// 	//AudioNode_.remove(osc);
	// 	//AudioNode_.remove(out);
	// 	console.log(AudioNode_.audioNodes.length);
	// 	console.log(AudioNode_.audioConnections.length);
	// 	draw();
	// }, 2000);
	// 
	// draw();

};