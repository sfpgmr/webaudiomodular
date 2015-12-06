"use strict";

import * as audio from './audio.js';
import {initUI,draw,svg,showPanel } from './draw';
import {showSequenceEditor} from './sequenceEditor';
import {load,save,setAudioNodeCreators} from './loaderSaver';

window.onload = () => {
	audio.setCtx(new AudioContext());
  initUI();

  setAudioNodeCreators( 
	{
    'AudioDestinationNode':{create:()=>audio.ctx.destination,editor:showPanel},
    'GainNode':{create:audio.ctx.createGain.bind(audio.ctx),editor:showPanel},
    'DelayNode':{create:audio.ctx.createDelay.bind(audio.ctx),editor:showPanel},
    'AudioBufferSourceNode':{create:audio.ctx.createBufferSource.bind(audio.ctx),editor:showPanel},
    'MediaElementAudioSourceNode':{create:audio.ctx.createMediaElementSource.bind(audio.ctx),editor:showPanel},
    'PannerNode':{create:audio.ctx.createPanner.bind(audio.ctx),editor:showPanel},
    'ConvolverNode':{create:audio.ctx.createConvolver.bind(audio.ctx),editor:showPanel},
    'AnalyserNode':{create:audio.ctx.createAnalyser.bind(audio.ctx),editor:showPanel},
    'ChannelSplitterNode':{create:audio.ctx.createChannelSplitter.bind(audio.ctx),editor:showPanel},
    'ChannelMergerNode':{create:audio.ctx.createChannelMerger.bind(audio.ctx),editor:showPanel},
    'DynamicsCompressorNode':{create:audio.ctx.createDynamicsCompressor.bind(audio.ctx),editor:showPanel},
    'BiquadFilterNode':{create:audio.ctx.createBiquadFilter.bind(audio.ctx),editor:showPanel},
    'OscillatorNode':{create:audio.ctx.createOscillator.bind(audio.ctx),editor:showPanel},
    'MediaStreamAudioSourceNode':{create:audio.ctx.createMediaStreamSource.bind(audio.ctx),editor:showPanel},
    'WaveShaperNode':{create:audio.ctx.createWaveShaper.bind(audio.ctx),editor:showPanel},
    'EG':{create:audio.EG.fromJSON,editor:showPanel},
    'Sequencer':{create:audio.Sequencer.fromJSON,editor:showSequenceEditor}
  });
  
  // 出力ノードの作成（削除不可）
  let data = localStorage.getItem('data');
  if(false/*!data*/){
    let out = audio.AudioNodeView.create(audio.ctx.destination,showPanel);
    out.x = window.innerWidth / 2;
    out.y = window.innerHeight / 2;
    out.removable = false;
  } else {
    load(data);
    if(audio.AudioNodeView.audioNodes.length == 0 ){
      let out = audio.AudioNodeView.create(audio.ctx.destination,showPanel);
      out.x = window.innerWidth / 2;
      out.y = window.innerHeight / 2;
      out.removable = false;
    }
  }
  
	d3.select(window)
	.on('resize',function(){
		if(svg){
			svg.attr({
				width:window.innerWidth,
				height:window.innerHeight
			})
		}
	});

	draw();
};

window.onbeforeunload = ()=>{
  save();
}

