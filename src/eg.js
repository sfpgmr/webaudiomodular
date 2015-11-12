import * as audio from './audioNodeView';
"use strict";

export class EG {
	constructor(){
		this.gate = new audio.ParamView(this,'gate',false);
		this.gate.connect_ = (function(param){
			if(param.param instanceof audio.ParamView){
				this.exec = (p)=>{
					this.param.push(param);
				}
			} else if(param.param instanceof audio.AudioNodeView){
				
			}
		}).bind(this.gate);
		this.output = new audio.ParamView(this,'output',true);
		this.numberOfInputs = 0;
		this.numberOfOutputs = 0;
		this.attack = 0.5;
		this.decay = 0.5;
		this.release = 0.5;
		this.sustain = 0.5;
		this.gain = 1.0;
		this.name = 'EG';
		audio.defIsNotAPIObj(this,false);
	}
	
	connect(to){
		console.log('connect');
	}
	
	disconnect(to){
		
	}
	
}

// /// エンベロープジェネレーター
// function EnvelopeGenerator(voice, attack, decay, sustain, release) {
//   this.voice = voice;
//   //this.keyon = false;
//   this.attack = attack || 0.0005;
//   this.decay = decay || 0.05;
//   this.sustain = sustain || 0.5;
//   this.release = release || 0.5;
// };
// 
// EnvelopeGenerator.prototype =
// {
//   keyon: function (t,vel) {
//     this.v = vel || 1.0;
//     var v = this.v;
//     var t0 = t || this.voice.audioctx.currentTime;
//     var t1 = t0 + this.attack * v;
//     var gain = this.voice.gain.gain;
//     gain.cancelScheduledValues(t0);
//     gain.setValueAtTime(0, t0);
//     gain.linearRampToValueAtTime(v, t1);
//     gain.linearRampToValueAtTime(this.sustain * v, t0 + this.decay / v);
//     //gain.setTargetAtTime(this.sustain * v, t1, t1 + this.decay / v);
//   },
//   keyoff: function (t) {
//     var voice = this.voice;
//     var gain = voice.gain.gain;
//     var t0 = t || voice.audioctx.currentTime;
//     gain.cancelScheduledValues(t0);
//     //gain.setValueAtTime(0, t0 + this.release / this.v);
//     //gain.setTargetAtTime(0, t0, t0 + this.release / this.v);
//     gain.linearRampToValueAtTime(0, t0 + this.release / this.v);
//   }
// };