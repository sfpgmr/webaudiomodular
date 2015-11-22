"use strict";
import * as audio from './audio';
import EventEmitter from './eventEmitter3';
import * as prop from './prop';



export class EventBase {
	constructor(step){
		this.step = step; 
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

export var EventType  = {
	Note:1,
	Measure:2
}

export class Measure extends EventBase {
	constructor(){
		super(0);
		this.type = EventType.Measure;
	}
}

export class NoteEvent extends EventBase {
	constructor(step = 96,note = 64,gate = 48,vel = 1.0,command = new Command()){
		super(step);
		this.note_ = note;
		this.transopse_ = 0;
		this.calcPitch();
		this.gate = gate;
		this.vel = vel;
		this.command = command;
		this.command.event = this;
		this.type = EventType.Note;
	}
	
	get note (){
		 return this.note_;
	}
	
	set note(v){
		 this.note_ = v;
		 this.calcPitch();
	}
	
	set transpose(v){
		if(v != this.transpose_){
			this.transpose_ = v;
			this.calcPitch();
		}
	}
	
	calcPitch(){
		this.pitch = (440.0 / 32.0) * (Math.pow(2.0,((this.note_ + this.transpose_ - 9) / 12)));
	}
	
	process(time,track){
			if(this.note){
				this.transopse = track.transpose;
				for(let j = 0,je = track.pitches.length;j < je;++j){
					track.pitches[j].process(this.command,this.pitch,time);
				}
				
				for(let j = 0,je = track.velocities.length;j < je;++j){
					// keyon
					track.velocities[j].process(this.command,this.vel,time);
					// keyoff
					track.velocities[j].process(this.command,0,time + this.gate * track.sequencer.stepTime_ );
				}
			}
	}
}



export class Track extends EventEmitter {
	constructor(sequencer){
		super();
		this.events = [];
		this.pointer = 0;

		prop.defObservable(this,'step');
		prop.defObservable(this,'end');
		prop.defObservable(this,'name');
		prop.defObservable(this,'transpose');
		
		this.step = 0;
		this.end = false;
		this.pitches = [];
		this.velocities = [];
		this.sequencer = sequencer;
		this.name = '';
		this.transpose = 0;
	}
}

export const SEQ_STATUS = {
	STOPPED:0,
	PLAYING:1,
	PAUSED:2
} ;

export const NUM_OF_TRACKS = 4;

export class Sequencer extends EventEmitter {
	constructor(){
		super();
		
		prop.defObservable(this,'bpm');
		prop.defObservable(this,'tpb');
		prop.defObservable(this,'beat');
		prop.defObservable(this,'bar');
		prop.defObservable(this,'repeat');

		this.bpm = 120.0; // tempo
		this.tpb = 96.0; // 四分音符の解像度
		this.beat = 4;
		this.bar = 4; // 
		this.tracks = [];
		this.numberOfInputs = 0;
		this.numberOfOutputs = 0;
		this.name = 'Sequencer';
		for (var i = 0;i < NUM_OF_TRACKS;++i)
		{
			this.tracks.push(new Track(this));
			this['trk' + i + 'g'] = new audio.ParamView(null,'trk' + i + 'g',true);
			this['trk' + i + 'g'].track = this.tracks[i];
			this['trk' + i + 'g'].type = 'gate';
			
			this['trk' + i + 'p'] = new audio.ParamView(null,'trk' + i + 'p',true);
			this['trk' + i + 'p'].track = this.tracks[i];
			this['trk' + i + 'p'].type = 'pitch';
		}
		this.startTime_ = 0;
		this.currentTime_ = 0;
		this.currentMeasure_ = 0;
		this.calcStepTime();
		this.repeat = false;
		this.status_ = SEQ_STATUS.STOPPED;

		//
		this.on('bpm_chaneged',()=>{this.calcStepTime();});
		this.on('tpb_chaneged',()=>{this.calcStepTime();});

		Sequencer.sequencers.push(this);
		if(Sequencer.added){
			Sequencer.added();
		}
	}
	

	dispose(){
		for(var i = 0;i < Sequencer.sequencers.length;++i)
		{
			if(this === Sequencer.sequencers[i]){
				 Sequencer.sequencers.splice(i,1);
				 break;
			}
		}
		
		if(Sequencer.sequencers.length == 0)
		{
			if(Sequencer.empty){
				Sequencer.empty();
			}
		}
	}
	
	calcStepTime(){
		this.stepTime_ = 60.0 / ( this.bpm * this.tpb); 
	}
	
	start(time){
		if(this.status_ == SEQ_STATUS.STOPPED || this.status_ == SEQ_STATUS.PAUSED ){
			this.currentTime_ = time || audio.ctx.currentTime();
			this.startTime_  = this.currentTime_;
			this.status_ = SEQ_STATUS.PLAYING;
		}
	}
	
	stop(){
		if(this.status_ == SEQ_STATUS.PLAYING || this.status_ == SEQ_STATUS.PAUSED)
		{
			this.tracks.forEach((d)=>{
				d.pitches.forEach((p)=>{
					p.stop();
				});
				d.velocities.forEach((v)=>{
					v.stop();
				});
			});
			
			this.status_ = SEQ_STATUS.STOPPED;
			this.reset();
		}
	}

	pause(){
		if(this.status_ == SEQ_STATUS.PLAYING){
			this.status_ = SEQ_STATUS.PAUSED;
		}
	}
	
	reset(){
		this.startTime_ = 0;
		this.currentTime_ = 0;
		this.tracks.forEach((track)=>{
			track.end = !track.events.length;
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
		let endcount = 0;
		for(var i = 0,l = this.tracks.length;i < l;++i){
			var track = this.tracks[i];
			if(!track.end){
				while(track.step <= currentStep && !track.end ){
					if(track.pointer >= track.events.length ){
						track.end = true;
						break;
					} else {
						var event = track.events[track.pointer++];
						var playTime = track.step * this.stepTime_ + this.startTime_;
						event.process(playTime,track);
						track.step += event.step;
//					console.log(track.pointer,track.events.length,track.events[track.pointer],track.step,currentStep,this.currentTime_,playTime);
					}
				}
			} else {
				++endcount;
			}
		}
		if(endcount == this.tracks.length){
			this.stop();
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
		var track = c.from.param.track;
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
					c.to.node.audioNode.process(c.to,com,v,t);
				},
				stop:function(){
					c.to.node.audioNode.stop(c.to);
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
			process:process,
			stop:function(){
				c.to.param.audioParam.cancelScheduledValues(0);
			}
		};
	}

	static exec()
	{
		if(Sequencer.sequencers.status == SEQ_STATUS.PLAYING){
			window.requestAnimationFrame(Sequencer.exec);
			let endcount = 0;
			for(var i = 0,e = Sequencer.sequencers.length;i < e;++i){
				var seq = Sequencer.sequencers[i];
				if(seq.status_ == SEQ_STATUS.PLAYING){
					seq.process(audio.ctx.currentTime);
				} else if(seq.status_ == SEQ_STATUS.STOPPED){
					++endcount;
				}
			}
			if(endcount == Sequencer.sequencers.length)
			{
				Sequencer.stopSequences();
				if(Sequencer.stopped){
					Sequencer.stopped();
				}
			}
		}
	}
	
	// シーケンス全体のスタート
	static startSequences(time){
		if(Sequencer.sequencers.status == SEQ_STATUS.STOPPED || Sequencer.sequencers.status == SEQ_STATUS.PAUSED )
		{
			Sequencer.sequencers.forEach((d)=>{
				d.start(time);
			});
			Sequencer.sequencers.status = SEQ_STATUS.PLAYING;
			Sequencer.exec();
		}
	}
	// シーケンス全体の停止
	static stopSequences(){
		if(Sequencer.sequencers.status == SEQ_STATUS.PLAYING || Sequencer.sequencers.status == SEQ_STATUS.PAUSED ){
			Sequencer.sequencers.forEach((d)=>{
				d.stop();
			});
			Sequencer.sequencers.status = SEQ_STATUS.STOPPED;
		}
	}

	// シーケンス全体のポーズ	
	static pauseSequences(){
		if(Sequencer.sequencers.status == SEQ_STATUS.PLAYING){
			Sequencer.sequencers.forEach((d)=>{
				d.pause();
			});
			Sequencer.sequencers.status = SEQ_STATUS.PAUSED;
		}
	}
}

Sequencer.sequencers = [];
Sequencer.sequencers.status = SEQ_STATUS.STOPPED; 
