"use strict";
import * as ui from './ui';
import {initUI,draw,svg } from './draw';
import * as audio from './audio.AudioNode_';

describe('AudioNodeTest', () => {
	var ctx = new AudioContext();
	var osc, gain, filter, out, osc2, splitter, merger;

	beforeEach(() => {

	});

	it("audio.AudioNode_追加", () => {

		osc = audio.AudioNode_.create(ctx.createOscillator());
		osc.x = 100;
		osc.y = 200;

		gain = audio.AudioNode_.create(ctx.createGain());

		gain.x = 400;
		gain.y = 200;

		filter = audio.AudioNode_.create(ctx.createBiquadFilter());
		filter.x = 250;
		filter.y = 330;

		out = audio.AudioNode_.create(ctx.destination);
		out.x = 750;
		out.y = 300;


		osc2 = audio.AudioNode_.create(ctx.createOscillator());
		osc2.x = 100;
		osc2.y = 600;

		splitter = audio.AudioNode_.create(ctx.createChannelSplitter());
		splitter.x = 250;
		splitter.y = 600;

		merger = audio.AudioNode_.create(ctx.createChannelMerger());
		merger.x = 500;
		merger.y = 600;

		expect(audio.AudioNode_.audioNodes.length).toEqual(7);
	});

	it('コネクション追加後チェック', () => {

		audio.AudioNode_.connect(osc, filter);
		audio.AudioNode_.connect(osc, gain.audioParams[0]);
		audio.AudioNode_.connect(filter, gain);
		audio.AudioNode_.connect(gain, out);
		audio.AudioNode_.connect(merger, out);
		audio.AudioNode_.connect({ node: splitter, param: 0 }, { node: merger, param: 0 });
		audio.AudioNode_.connect({ node: splitter, param: 1 }, { node: merger, param: 1 });
		audio.AudioNode_.connect({ node: splitter, param: 2 }, { node: merger, param: 3 });
		audio.AudioNode_.connect({ node: splitter, param: 3 }, { node: merger, param: 2 });
		audio.AudioNode_.connect({ node: splitter, param: 5 }, { node: merger, param: 5 });
		audio.AudioNode_.connect({ node: splitter, param: 4 }, { node: merger, param: 4 });
		audio.AudioNode_.connect(osc2, splitter);

		expect(audio.AudioNode_.audioConnections.length).toEqual(12);
	});
		

	it('コネクション削除', () => {
		audio.AudioNode_.remove(osc);
		expect(audio.AudioNode_.audioNodes.length).toEqual(6);
		expect(audio.AudioNode_.audioConnections.length).toEqual(10);
	});

	it('フィルター削除後チェック', () => {
		audio.AudioNode_.remove(filter);
		expect(audio.AudioNode_.audioNodes.length).toEqual(5);
		expect(audio.AudioNode_.audioConnections.length).toEqual(9);
		expect((() => {
			var ret = 0;
			audio.AudioNode_.audioConnections.forEach((d) => {
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
		// osc.stop(ctx.currentTime + 0.1);
		initUI();
		draw();
		expect(true).toBe(true);
	});
	
	
});