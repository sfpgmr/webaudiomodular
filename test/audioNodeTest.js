"use strict";
import * as audio from '../src/audio';
import {initUI,draw,svg } from '../src/draw';

describe('AudioNodeTest', () => {
	audio.ctx = new AudioContext();
	var osc, gain, filter, out, osc2, splitter, merger,eg;

	beforeEach(() => {

	});

	it("audio.AudioNodeView追加", () => {

		osc = audio.AudioNodeView.create(audio.ctx.createOscillator());
		osc.x = 100;
		osc.y = 200;

		gain = audio.AudioNodeView.create(audio.ctx.createGain());

		gain.x = 400;
		gain.y = 200;

		filter = audio.AudioNodeView.create(audio.ctx.createBiquadFilter());
		filter.x = 250;
		filter.y = 330;

		out = audio.AudioNodeView.create(audio.ctx.destination);
		out.x = 750;
		out.y = 300;


		osc2 = audio.AudioNodeView.create(audio.ctx.createOscillator());
		osc2.x = 100;
		osc2.y = 600;

		splitter = audio.AudioNodeView.create(audio.ctx.createChannelSplitter());
		splitter.x = 250;
		splitter.y = 600;

		merger = audio.AudioNodeView.create(audio.ctx.createChannelMerger());
		merger.x = 500;
		merger.y = 600;
		
		eg = audio.AudioNodeView.create(new audio.EG());

		expect(audio.AudioNodeView.audioNodes.length).toEqual(8);
	});

	it('コネクション追加後チェック', () => {

		audio.AudioNodeView.connect(osc, filter);
		audio.AudioNodeView.connect(osc, gain.inputParams[0]);
		
		audio.AudioNodeView.connect(filter, gain);
		audio.AudioNodeView.connect(gain, out);
		audio.AudioNodeView.connect(merger, out);
		audio.AudioNodeView.connect({ node: splitter, param: 0 }, { node: merger, param: 0 });
		audio.AudioNodeView.connect({ node: splitter, param: 1 }, { node: merger, param: 1 });
		audio.AudioNodeView.connect({ node: splitter, param: 2 }, { node: merger, param: 3 });
		audio.AudioNodeView.connect({ node: splitter, param: 3 }, { node: merger, param: 2 });
		audio.AudioNodeView.connect({ node: splitter, param: 5 }, { node: merger, param: 5 });
		audio.AudioNodeView.connect({ node: splitter, param: 4 }, { node: merger, param: 4 });
		audio.AudioNodeView.connect(osc2, splitter);
		
		audio.AudioNodeView.connect({node:eg,param:eg.output},{node:gain,param:gain.inputParams[0]});

		expect(audio.AudioNodeView.audioConnections.length).toEqual(13);
	});
		

	it('ノード削除', () => {
		audio.AudioNodeView.remove(osc);
		expect(audio.AudioNodeView.audioNodes.length).toEqual(7);
		expect(audio.AudioNodeView.audioConnections.length).toEqual(11);
		
	});
	
	it('コネクション削除',()=>{
		audio.AudioNodeView.disconnect({node:eg,param:eg.output},{node:gain,param:gain.inputParams[0]});
		expect(audio.AudioNodeView.audioConnections.length).toEqual(10);
	});

	it('フィルター削除後チェック', () => {
		audio.AudioNodeView.remove(filter);
		expect(audio.AudioNodeView.audioNodes.length).toEqual(6);
		expect(audio.AudioNodeView.audioConnections.length).toEqual(9);
		expect((() => {
			var ret = 0;
			audio.AudioNodeView.audioConnections.forEach((d) => {
				if (d.from.node === filter || d.to.node === filter) {
					++ret;
				}
			});
			return ret;
		})()).toEqual(0);
	});
	
	it('描画してみる',()=>{
		//	osc.audioNode.type = 'sawtooth';
		osc.type = 'sawtooth';
		console.log(osc.type);
		osc.frequency.value = 440;
		// osc.start();
		// osc.stop(audio.ctx.currentTime + 0.1);
		initUI();
		draw();
		expect(true).toBe(true);
	});
	
	
});