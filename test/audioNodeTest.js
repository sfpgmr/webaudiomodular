"use strict";
import * as audio from '../src/audio';
import {initUI,draw,svg,createAudioNodeView } from '../src/draw';


describe('AudioNodeTest', () => {
	audio.ctx = new AudioContext();
	var osc, gain, filter, out, osc2, splitter, merger,eg,seq;

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
		eg.x = 100;
		eg.y = 400;
		seq = audio.AudioNodeView.create(new audio.Sequencer());
		seq.x = 200;
		seq.y = 400;

		expect(audio.AudioNodeView.audioNodes.length).toEqual(9);
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
		audio.AudioNodeView.connect({node:seq,param:seq.trk0g},{node:eg,param:eg.gate});

		expect(audio.AudioNodeView.audioConnections.length).toEqual(14);
	});
		

	it('ノード削除', () => {
		audio.AudioNodeView.remove(osc);
		audio.AudioNodeView.remove(seq);
		expect(audio.AudioNodeView.audioNodes.length).toEqual(7);
		expect(audio.AudioNodeView.audioConnections.length).toEqual(11);
		expect(audio.Sequencer.sequencers.length).toEqual(0); 
	});
	
	it('コネクション削除',()=>{
		audio.AudioNodeView.disconnect({node:eg,param:eg.output},{node:gain,param:gain.inputParams[0]});
		audio.AudioNodeView.disconnect({ node: splitter, param: 0 }, { node: merger, param: 0 });
		audio.AudioNodeView.disconnect({ node: splitter, param: 1 }, { node: merger, param: 1 });
		audio.AudioNodeView.disconnect({ node: splitter, param: 2 }, { node: merger, param: 3 });
		audio.AudioNodeView.disconnect({ node: splitter, param: 3 }, { node: merger, param: 2 });
		audio.AudioNodeView.disconnect({ node: splitter, param: 5 }, { node: merger, param: 5 });
		audio.AudioNodeView.disconnect({ node: splitter, param: 4 }, { node: merger, param: 4 });
		
		expect(audio.AudioNodeView.audioConnections.length).toEqual(4);
	});

	it('フィルター削除後チェック', () => {
		audio.AudioNodeView.remove(filter);
		expect(audio.AudioNodeView.audioNodes.length).toEqual(6);
		expect(audio.AudioNodeView.audioConnections.length).toEqual(3);
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
	
	it('ノード全削除',()=>{
		audio.AudioNodeView.remove(eg);
		audio.AudioNodeView.remove(gain);
		audio.AudioNodeView.remove(out);
		audio.AudioNodeView.remove(splitter);
		audio.AudioNodeView.remove(merger);
		audio.AudioNodeView.remove(osc2);
		expect(audio.AudioNodeView.audioNodes.length).toEqual(0);
	});
	
	it('描画してみる',()=>{
		//	osc.audioNode.type = 'sawtooth';
		
		var content = d3.select('body').append('div').attr('id','content').classed('content',true);
		var player = content.append('div').attr({id:'player',class:'player'});
		player.append('button').attr({id:'play',class:'play'}).text('▼');
		player.append('button').attr({id:'stop',class:'stop'}).text('■');
		player.append('button').attr({id:'pause',class:'pause'}).text('＝');

		initUI();
		
		// コネクション
		
		let out = audio.AudioNodeView.audioNodes[0];
		let osc = createAudioNodeView('Oscillator');
		osc.x = 400;
		osc.y = 300;
		let gain = createAudioNodeView('Gain');
		gain.x = 550;
		gain.y = 200;
		let seq = createAudioNodeView('Sequencer');
		seq.x = 50;
		seq.y = 300;
		let eg = createAudioNodeView('EG');
		eg.x = 200;
		eg.y = 200;
		
		// 接続
		
		audio.AudioNodeView.connect({node:seq,param:seq.trk0g},{node:eg,param:eg.gate});		
		audio.AudioNodeView.connect({node:seq,param:seq.trk0p},{node:osc,param:osc.frequency});		
		audio.AudioNodeView.connect({node:osc,param:0},{node:gain,param:0});		
		audio.AudioNodeView.connect({node:eg,param:eg.output},{node:gain,param:gain.gain});		
		audio.AudioNodeView.connect({node:gain,param:0},{node:out,param:0});	

		// コネクション
		
		let out1 = audio.AudioNodeView.audioNodes[0];
		let osc1 = createAudioNodeView('Oscillator');
		osc1.x = 400;
		osc1.y = 500;
		let gain1 = createAudioNodeView('Gain');
		gain1.x = 550;
		gain1.y = 400;
		let eg1 = createAudioNodeView('EG');
		eg1.x = 200;
		eg1.y = 400;
		
		// 接続
		
		audio.AudioNodeView.connect({node:seq,param:seq.trk1g},{node:eg1,param:eg1.gate});		
		audio.AudioNodeView.connect({node:seq,param:seq.trk1p},{node:osc1,param:osc1.frequency});		
		audio.AudioNodeView.connect({node:osc1,param:0},{node:gain1,param:0});		
		audio.AudioNodeView.connect({node:eg1,param:eg1.output},{node:gain1,param:gain1.gain});		
		audio.AudioNodeView.connect({node:gain1,param:0},{node:out,param:0});	

		
		// シーケンスデータの挿入
		seq.audioNode.bpm = 120;
		seq.audioNode.tracks[0].events.push(new audio.NoteEvent(48,47,6));
		for(var i = 48;i< 110;++i){
			seq.audioNode.tracks[0].events.push(new audio.NoteEvent(48,i,6));
		}
		
		seq.audioNode.tracks[1].events.push(new audio.NoteEvent(192,0,6));
		for(var i = 47;i< 110;++i){
			seq.audioNode.tracks[1].events.push(new audio.NoteEvent(48,i,6));
		}
		draw();
		expect(true).toBe(true);
	});
	
	
	
	
});