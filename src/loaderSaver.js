"use strict";
import * as audio from './audio.js';

const	audioNodeCreators = 
	{
'Gain':audio.ctx.createGain.bind(audio.ctx),
'Delay':audio.ctx.createDelay.bind(audio.ctx),
'AudioBufferSource':audio.ctx.createBufferSource.bind(audio.ctx),
'MediaElementAudioSource':audio.ctx.createMediaElementSource.bind(audio.ctx),
'Panner':audio.ctx.createPanner.bind(audio.ctx),
'Convolver':audio.ctx.createConvolver.bind(audio.ctx),
'Analyser':audio.ctx.createAnalyser.bind(audio.ctx),
'ChannelSplitter':audio.ctx.createChannelSplitter.bind(audio.ctx),
'ChannelMerger':audio.ctx.createChannelMerger.bind(audio.ctx),
'DynamicsCompressor':audio.ctx.createDynamicsCompressor.bind(audio.ctx),
'BiquadFilter':audio.ctx.createBiquadFilter.bind(audio.ctx),
'Oscillator':audio.ctx.createOscillator.bind(audio.ctx),
'MediaStreamAudioSource':audio.ctx.createMediaStreamSource.bind(audio.ctx),
'WaveShaper':audio.ctx.createWaveShaper.bind(audio.ctx),
'EG':audio.EG.fromJSON,
'Sequencer':audio.Sequencer.fromJSON
};
	
export function createAudioNodeViewfromJSON(o){
  let audioNode;
  if(o.audioNode){
    audioNode = audioNodeCreators[o.name](o.audioNode);
  } else {
    audioNode = audioNodeCreators[o.name]();
  }
  let ret = new audio.AudioNodeView(audioNode);
  if(o.params){
    for(let i in o.params){
      ret[i] = o.params[i];
    }
  }
  ret.id = o.id;
  ret.x = o.x;
  ret.y = o.y;
  ret.name = o.name;
  return ret;
}

export function load()
{
  let data = localStorage.getItem('data');
  if(data){
    
  }
}

export function save()
{
  let saveData = 
  {
    audioNodes:audio.AudioNodeView.audioNodes,
    audioConnections:[]
  };
  
  audio.AudioNodeView.connections.forEach((d)=>{
    
  });

  localStorage.setItem('data',JSON.stringify(saveData));  
}
