import * as audio from './audioNodeView';
"use strict";

export class EventBase {
	constructor(step){
		this.step = 0; 
	}
}

export function setValueAtTime(audioParam,value,time)
{
	audioParam.setValueAtTime(value,time);
}

export function linearRampToValueAtTime(audioParam,value,time){
	audioParam.linearRampToValueAtTime(value,time);
}

export function exponentialRampToValueAtTime(audioParam,value,time){
	audioParam.linearRampToValueAtTime(value,time);
}


export class Command {
	constructor(pitchCommand = setValueAtTime,velocityCommand = setValueAtTime)
	{
		this.processPitch = pitchCommand.bind(this);
		this.processVelocity = velocityCommand.bind(this);
	}
}

export class NoteEvent extends EventBase {
	constructor(step = 96,note = 64,gate = 48,vel = 1.0,command = new Command()){
		super(step);
		this.note_ = note;
		this.calcPitch();
		this.gate = gate;
		this.vel = vel;
		this.command = command;
		this.command.event = this;
	}
	
	get note (){
		 return this.note_;
	}
	set note(v){
		 this.note_ = v;
		 this.calcPitch();
	}
	
	calcPitch(){
		this.pitch = (440.0 / 32.0) * (Math.pow(2.0,((this.note_ - 9) / 12)));
	}
	
	process(time,track){
			for(let j = 0,je = track.pithces.length;j < je;++j){
				track.pitches[j].process(this.com,this.pitch,time);
			}
			for(let j = 0,je = track.velocities.length;j < je;++j){
				track.velocities[j].process(this.com,this.vel,time);
			}
	}
}

export class Track {
	constructor(){
		this.events = [];
		this.pointer = 0;
		this.step = 0;
		this.end = false;
		this.pitches = [];
		this.velocities = [];
	}
}

export class Sequencer {
	constructor(){
		this.bpm = 120.0; // tempo
		this.tpb = 48.0; // 四分音符の解像度
		this.beat = 4;
		this.bar = 4; // 
		this.tracks = [];
		this.numberOfInputs = 0;
		this.numberOfOutputs = 0;
		this.name = 'Sequencer';
		for (var i = 0;i < 16;++i)
		{
			this.tracks.push(new Track());
			this['trk' + i + 'g'] = new audio.ParamView(null,'trk' + i + 'g',true);
			this['trk' + i + 'g'].track = this.tracks[i];
			this['trk' + i + 'g'].type = 'gate';
			
			this['trk' + i + 'p'] = new audio.ParamView(null,'trk' + i + 'p',true);
			this['trk' + i + 'p'].track = this.tracks[i];
			this['trk' + i + 'p'].type = 'pitch';
		}
		this.startTime_ = 0;
		this.currentTime_ = 0;
		this.calcStepTime();
		this.repeat = false;
		Sequencer.sequencers.push(this); 
	}
	
	calcStepTime(){
		this.stepTime_ = 60.0 / ( this.bpm * this.tpb); 
	}
	
	start(time){
		this.currentTime_ = time || audio.ctx.currentTime();
	}
	
	stop(){
		
	}

	pause(){
		
	}
	
	reset(){
		this.startTime_ = 0;
		this.currentTime_ = 0;
		this.tracks.forEach((track)=>{
			track.end = false;
			track.step = 0;
			track.pointer = 0;
		});
		this.calcStepTime();
	}
  // シーケンサーの処理
	process (time)
	{
		this.currentTime_ = time || audio.ctx.currentTime();
		var currentStep = (this.currentTime_  - this.startTime_ + 0.1) / this.stepTime_;
		for(var i = 0,l = this.tracks.length;i < l;++i){
			var track = this.tracks[i];
			while(track.step <= currentStep && !track.end ){
				if(track.pointer > track.events.length ){
					track.end = true;
					break;
				} else {
					var event = track.events[track.pointer++];
					track.step += event.step;
					var playTime = track.step * this.stepTime_ + this.currentTime_;
					event.process(playTime,track);
				}
			}
		}
	}
	
	// 接続
	connect(c){
		var track = c.from.param.track;
		if(c.from.param.type === 'pitch'){
			track.pitches.push(Sequencer.makeProcess(c));
		} else {
			track.velocities.push(Sequencer.makeProcess(c));
		}
	}
	
	// 削除
	disconnect(c){
		var track = track.c.from.param.track;
		for(var i = 0;i < track.pitches.length;++i){
			if(c.to.node === track.pitches[i].to.node && c.to.param === track.pitches[i].to.param){
				track.pitches.splice(i--,1);
				break;
			}
		}

		for(var i = 0;i < track.velocities.length;++i){
			if(c.to.node === track.velocities[i].to.node && c.to.param === track.velocities[i].to.param){
				track.pitches.splice(i--,1);
				break;
			}
		}
	}
	
	static makeProcess(c){
		if(c.to.param instanceof audio.ParamView){
			return  {
				to:c.to,
				process: (com,v,t)=>{
					c.to.node.process(c.to,com,v,t);
				}
			};
		} 
		var process;
		if(c.to.param.type === 'pitch'){
			process = (com,v,t) => {
				com.processPitch(c.to.param.audioParam,v,t);
			};					
		} else {
			process =	(com,v,t)=>{
				com.processVelocity(c.to.param.audioParam,v,t);
			};					
		}
		return {
			to:c.to,
			process:process
		};
	}
}

Sequencer.sequencers = [];

