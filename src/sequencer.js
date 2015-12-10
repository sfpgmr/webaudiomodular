"use strict";
import * as audio from './audio';
import EventEmitter from './eventEmitter3';
import * as prop from './prop';



export class EventBase {
	constructor(step = 0,name = ""){
		this.step = step;
		this.stepNo = 0;
		this.measure = 0;
		this.name =  name;
	}
}

const CommandType = {
  setValueAtTime:0,
  linearRampToValueAtTime:1,
  exponentialRampToValueAtTime:2  
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

const commandFuncs =[
  setValueAtTime,
  linearRampToValueAtTime,
  exponentialRampToValueAtTime
];


export class Command {
	constructor(pitchCommand = CommandType.setValueAtTime,velocityCommand = CommandType.setValueAtTime)
	{
    this.pitchCommand = pitchCommand;
    this.velocityCommand = velocityCommand;
		this.processPitch = commandFuncs[pitchCommand].bind(this);
		this.processVelocity = commandFuncs[velocityCommand].bind(this);
	}
  
  toJSON()
  {
    return {
      pitchCommand:this.pitchCommand,
      velocityCommand:this.velocityCommand
    };
  }
  
  static fromJSON(o){
    return new Command(o.pitchCommand,o.velocityCommand);
  }
}

export const EventType  = {
	Note:0,
	Measure:1,
	TrackEnd:2
}

// 小節線
export class Measure extends EventBase {
	constructor(){
		super(0);
		this.type = EventType.Measure;
    this.stepTotal = 0;
    this.startIndex = 0;
    this.endIndex = 0;
	}
  
  toJSON(){
    return {
      name:'Measure',
      measure:this.measure,
      stepNo:this.stepNo,
      step:this.step,
      type:this.type,
      stepTotal:this.stepTotal,
      startIndex:this.startIndex,
      endIndex:this.endIndex
    };
  }
  
  static fromJSON(o){
    let ret = new Measure();
    ret.measure = o.measure;
    ret.stepNo = o.stepNo;
    ret.step = o.step;
    ret.stepTotal = o.stepTotal;
    ret.startIndex = o.startIndex;
    ret.endIndex = o.endIndex;
    return ret;
  }
  
  clone(){
    return new Measure();
  }
  
  process(){
    
  }
}

// Track End
export class TrackEnd extends EventBase {
	constructor(){
		super(0);
		this.type = EventType.TrackEnd;
	}
  process(){
    
  }
	
}

var Notes = [
	'C ',
	'C#',
	'D ',
	'D#',
	'E ',
	'F ',
	'F#',
	'G ',
	'G#',
	'A ',
	'A#',
	'B ',
];

export class NoteEvent extends EventBase {
	constructor(step = 0,note = 0,gate = 0,vel = 0.5,command = new Command()){
		super(step);
		this.transpose_ = 0.0;
		this.note = note;
		this.gate = gate;
		this.vel = vel;
		this.command = command;
		this.command.event = this;
		this.type = EventType.Note;
		this.setNoteName();
	}
	
   toJSON(){
     return {
       name:'NoteEvent',
       measure:this.measure,
       stepNo:this.stepNo,
       step:this.step,
       note:this.note,
       gate:this.gate,
       vel:this.vel,
       command:this.command,
       type:this.type
     }
   }
   
   static fromJSON(o){
     let ret = new NoteEvent(o.step,o.note,o.gate,o.vel,Command.fromJSON(o.command));
     ret.measure = o.measure;
     ret.stepNo = o.stepNo;
     return ret;
   }
  
  clone(){
    return new NoteEvent(this.step,this.note,this.gate,this.vel,this.command);
  }
  
	setNoteName(){
			let oct = this.note / 12 | 0;
			this.name = Notes[this.note % 12] + oct;
	}

	setNoteNameToNote(noteName,defaultNoteName = "")
	{
    var matches = noteName.match(/(C#)|(C)|(D#)|(D)|(E)|(F#)|(F)|(G#)|(G)|(A#)|(A)|(B)/i);
		if(matches)
		{
      var n = matches[0];
      var getNumber = new RegExp('([0-9]{1,2})');
//      getNumber.compile();
      getNumber.exec(noteName);
      var o = RegExp.$1;
      if(!o){
        (new RegExp('([0-9]{1,2})')).exec(defaultNoteName);        
        o = RegExp.$1;
        if(!o){
          return false;
        }
      }
      if(n.length === 1) n += ' ';
      
      if(Notes.some((d,i)=>{
          if(d === n){
            this.note = parseFloat(i) + parseFloat(o) * 12;
            return true;
          }				
         }))
      {
        return true;
      } else {
        this.setNoteName();
        return false;
      }
		} else {
      this.setNoteName();
      return false; 
    }
	}
	
	get note (){
		 return this.note_;
	}
	
	set note(v){
		 this.note_ = v;
		 this.calcPitch();
		 this.setNoteName();
	}
	
	set transpose(v){
		if(v != this.transpose_){
			this.transpose_ = v;
			this.calcPitch();
		}
	}
	
	calcPitch(){
		this.pitch = (440.0 / 32.0) * (Math.pow(2.0,((this.note + this.transpose_ - 9) / 12)));
	}
  
  playOneshot(track){
    if(this.note){
				this.transopse = track.transpose;
				for(let j = 0,je = track.pitches.length;j < je;++j){
					track.pitches[j].process(new Command(),this.pitch,audio.ctx.currentTime);
				}
				
				for(let j = 0,je = track.velocities.length;j < je;++j){
					// keyon
					track.velocities[j].process(new Command(),this.vel,audio.ctx.currentTime);
					// keyoff
					track.velocities[j].process(new Command(),0,audio.ctx.currentTime+0.25);
				}
    }
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
    this.measures = [];
    this.measures.push({
      startIndex:0,
      endIndex:0,
      stepTotal:0
    });
		this.pointer = 0;
		this.events.push(new TrackEnd());
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
	
  toJSON()
  {
    return {
      name:'Track',
      events:this.events,
      step:this.step,
      trackName:this.name,
      transpose:this.transpose
    };
  }
  
  static fromJSON(o,sequencer)
  {
    let ret = new Track(sequencer);
    ret.step = o.step;
    ret.name = o.trackName;
    ret.transpose = o.transpose;
    o.events.forEach(function(d){
      switch(d.type){
        case EventType.Note:
          ret.addEvent(NoteEvent.fromJSON(d));
          break;
        case EventType.Measure:
          ret.addEvent(Measure.fromJSON(d));
          break;
        case EventType.TrackEnd:
        //何もしない
        break;
      }
    });
    return ret;
  }
  
	addEvent(ev){
		if(this.events.length > 1)
		{
			var before = this.events[this.events.length - 2];
			switch(before.type){
				case EventType.Note:
					ev.stepNo = before.stepNo + 1;
					ev.measure = before.measure;
					break;
				case EventType.Measure:
					ev.stepNo = 0;
					ev.measure = before.measure + 1;
					break;
			}
		} else {
			ev.stepNo = 0;
			ev.measure = 0;
		}
    
    switch(ev.type){
      case EventType.Note:
        this.measures[ev.measure].endIndex = this.events.length - 2 + 1; 
        this.measures[ev.measure].stepTotal += ev.step;
        break;
      case EventType.Measure:
        this.measures.push({
          startIndex:this.events.length - 2 + 2,
          endIndex:this.events.length - 2,
          stepTotal:0
        })
        break;
    }

		this.events.splice(this.events.length - 1,0,ev);
    //this.calcMeasureStepTotal(this.events.length - 2);
	}
	
	insertEvent(ev,index){
		if(this.events.length > 1 && index != 0){
			var before = this.events[index-1];
			switch(before.type){
				case EventType.Note:
					ev.stepNo = before.stepNo + 1;
					ev.measure = before.measure;
				break;
				case EventType.Measure:
					ev.stepNo = 0;
					ev.measure = before.measure + 1;
				break;
			}
		} else {
			ev.stepNo = 0;
			ev.measure = 0;
    }
    
		this.events.splice(index,0,ev);

    switch(ev.type){
      case EventType.Note:
        this.measures[ev.measure].endIndex = Math.max(this.measures[ev.measure].endIndex,index); 
        this.measures[ev.measure].stepTotal += ev.step;
        break;
      case EventType.Measure:
        {
          let endIndex = this.measures[ev.measure].endIndex;
          this.measures[ev.measure].endIndex = index - 1;
          
          // ステップの再計算
          {
            let stepTotal = 0;
            for(let i = this.measures[ev.measure].startIndex,e = this.measures[ev.measure].endIndex + 1;i < e;++i){
                stepTotal += this.events[i].step;                  
            }
            this.measures[ev.measure].stepTotal = stepTotal;
          }
          this.measures.splice(ev.measure + 1,0,{
            startIndex:index + 1,
            endIndex:endIndex + 1,
            stepTotal:0
          });
          {
            let stepTotal = 0;
            for(let i = this.measures[ev.measure + 1].startIndex,e = this.measures[ev.measure + 1].endIndex + 1;i < e;++i){
                stepTotal += this.events[i].step;                  
            }
            this.measures[ev.measure + 1].stepTotal = stepTotal;
          }
          
        }
        break;
    }
    
    this.updateStep_(index,ev);
    //this.calcMeasureStepTotal(index);
	}

  updateNoteStep(index,ev,newStep){
    let delta = newStep - ev.step;
    ev.step = newStep;
    this.updateStep__(index);
    this.measures[ev.measure].stepTotal += delta;
  }
  
  updateStep_(index,ev){
 		if(ev.type == EventType.Measure){
			this.updateStepAndMeasure__(index);		
		} else {
			this.updateStep__(index);		
    }
  }  

	updateStep__(index){
		for(let i = index + 1,e = this.events.length;i<e;++i)
		{
			let before = this.events[i-1];
			let current = this.events[i];
			switch(before.type){
				case EventType.Note:
					current.stepNo = before.stepNo + 1;
					current.measure = before.measure;
          break;
				case EventType.Measure:
          break;
				break;
			}			
		}
	}	
  
	updateStepAndMeasure__(index){
		for(let i = index + 1,e = this.events.length;i<e;++i)
		{
			let before = this.events[i-1];
			let current = this.events[i];
			switch(before.type){
				case EventType.Note:
					current.stepNo = before.stepNo + 1;
					current.measure = before.measure;
				break;
				case EventType.Measure:
					current.stepNo = 0;
					current.measure = before.measure + 1;
				break;
			}			
		}
	}
  
  // calcMeasureStepTotal(index){
  //   let indexAfter = index +1;
  //   let events = this.events;
  //   let stepTotal = 0;
  //   let event = events[index];
  //   // 挿入したメジャーのstepTotalを補正
  //   if(event.type == EventType.Measure){
  //     --index;
  //     while(index >= 0){
  //       let ev = events[index];
  //       if(ev.type == EventType.Measure)
  //       {
  //         break;
  //       } else {
  //         stepTotal +=  ev.step;
  //       }
  //       --index;
  //     }
  //     event.stepTotal = stepTotal;
  //     // 後続のメジャーのstepTotalを補正
  //     stepTotal = 0;
  //     if(indexAfter >= (events.length -1))
  //     {
  //       return;
  //     }
  //     if(events[indexAfter].type == EventType.Measure){
  //       events[indexAfter].stepTotal = 0;
  //       return;
  //     }
  //     while(indexAfter < (events.length - 1) )
  //     {
  //       if(events[indexAfter].type != EventType.Measure){
  //         stepTotal += events[indexAfter++].step;
  //       } else {
  //         events[indexAfter].stepTotal = stepTotal;
  //         break;
  //       }
  //     }
  //     return;
  //   } else {
  //     // 一つ前のメジャーを探す
  //     let startIndex = 0;
  //     if(index == 0){
  //       startIndex = 0;
  //     } else {
  //       startIndex = index;
  //       while(startIndex > 0){
  //         --startIndex;
  //         if(this.events[startIndex].type == EventType.Measure)
  //         {
  //           ++startIndex;
  //           break;
  //         }
  //       }
  //     }
  //     stepTotal = 0;
  //     while(this.events[startIndex].type == EventType.Note)
  //     {
  //       stepTotal += this.events[startIndex].step;        
  //       ++startIndex;
  //     }  
  //     if(this.events[startIndex].type == EventType.Measure){
  //       this.events[startIndex].stepTotal = stepTotal;
  //     }
  //   }
  // }

  // イベントの削除  
  deleteEvent(index){
    var ev = this.events[index];
    this.events.splice(index,1);
    if(index == 0){
      this.events[0].measure = 1;
      this.events[0].stepNo = 1;
      if(this.events.length > 1){
        this.updateStep_(1,ev);
      }
    } else if(index <= (this.events.length - 1))
    {
        this.updateStep_(index - 1,ev);
    }
    //this.calcMeasureStepTotal(index);
    
    switch(ev.type)
    {
      case EventType.Measure:
      {
        let m = this.measures[ev.measure];
        let mn = this.measures[ev.measure + 1];
        if(mn){
          mn.startIndex = m.startIndex + 1;
          for(let i = ev.measure + 1,e = this.measures.length;i<e;++i){
              --this.measures[i].endIndex;
              --this.measures[i].startIndex;
          }
          mn.stepTotal += m.stepTotal;
        } else {
          if(this.measures.length == 1){
            --this.measures[0].endIndex;
          }
        }
        this.measures.splice(ev.measure,1);
      }
      break;
      case EventType.Note:
      {
        let m = this.measures[ev.measure];
        if(m.startIndex != index){
          --m.endIndex;
        }
        m.stepTotal -= ev.step;
      }
      break;
    }
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
		this.repeat = false;
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
		this.status_ = SEQ_STATUS.STOPPED;

		//
		this.on('bpm_changed',()=>{this.calcStepTime();});
		this.on('tpb_changed',()=>{this.calcStepTime();});

		Sequencer.sequencers.push(this);
		if(Sequencer.added){
			Sequencer.added();
		}
	}

  toJSON(){
    return {
      name:'Sequencer',
      bpm:this.bpm,
      tpb:this.tpb,
      beat:this.beat,
      bar:this.bar,
      tracks:this.tracks,
      repeat:this.repeat
    }
  }
  
  static fromJSON(o)
  {
    let ret = new Sequencer();
    ret.bpm = o.bpm;
    ret.tpb = o.tpb;
    ret.beat = o.beat;
    ret.bar = o.bar;
    ret.repeat = o.repeat;
    //ret.tracks.length = 0;
    o.tracks.forEach(function(d,i){
      ret.tracks[i] = Track.fromJSON(d,ret);
			ret['trk' + i + 'g'].track = ret.tracks[i];
			ret['trk' + i + 'p'].track = ret.tracks[i];

    });
    ret.calcStepTime();
    return ret;
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

