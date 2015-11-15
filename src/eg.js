import * as audio from './audioNodeView';
"use strict";

export class EG {
	constructor(){
		this.gate = new audio.ParamView(this,'gate',false);
		this.output = new audio.ParamView(this,'output',true);
		this.numberOfInputs = 0;
		this.numberOfOutputs = 0;
		this.attack = 0.001;
		this.decay = 0.05;
		this.release = 0.05;
		this.sustain = 0.2;
		this.gain = 1.0;
		this.name = 'EG';
		audio.defIsNotAPIObj(this,false);
		this.outputs = [];
	}
	
	connect(c)
	{
		if(! (c.to.param instanceof audio.AudioParamView)){
			throw new Error('AudioParam以外とは接続できません。');
		}
		c.to.param.audioParam.value = 0;
		this.outputs.push(c.to);
	}
	
	disconnect(c){
		for(var i = 0;i < this.outputs.length;++i){
			if(c.to.node === this.outputs[i].node && c.to.param === this.outputs[i].param)
			{
				this.outputs.splice(i--,1);
				break;
			}
		}
	}
	
	process(to,com,v,t)
	{
		if(v > 0) {
			// keyon
			// ADSまでもっていく
			this.outputs.forEach((d)=>{
				console.log('keyon',com,v,t);
				d.param.audioParam.setValueAtTime(0,t);
				d.param.audioParam.linearRampToValueAtTime(v * this.gain ,t + this.attack);
				d.param.audioParam.linearRampToValueAtTime(this.sustain * v * this.gain ,t + this.attack + this.decay );
			});
		} else {
			// keyoff
			// リリース
			this.outputs.forEach((d)=>{
				console.log('keyoff',com,v,t);
				d.param.audioParam.linearRampToValueAtTime(0,t + this.release);
			});
		}
	}
	
	stop(){
		this.outputs.forEach((d)=>{
			console.log('stop');
			d.param.audioParam.cancelScheduledValues(0);
			d.param.audioParam.setValueAtTime(0,0);
		});
	}
	
	pause(){
		
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