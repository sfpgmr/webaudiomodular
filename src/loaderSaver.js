"use strict";
import * as audio from './audio.js';
import * as ui from './ui.js';
import {showPanel} from './draw';
import {showSequenceEditor} from './sequenceEditor';



var audioNodeCreators = {};
export function setAudioNodeCreators(v){
  audioNodeCreators = v;
}	
  
export function createAudioNodeViewfromJSON(o){
  let audioNode;
  if(o.audioNode){
    audioNode = audioNodeCreators[o.name].create(o.audioNode);
  } else {
    audioNode = audioNodeCreators[o.name].create();
  }
  let ret = audio.AudioNodeView.create(audioNode,audioNodeCreators[o.name].editor);
  if(o.params){
    for(let i in o.params){
      ret[i] = o.params[i];
    }
  }
  ret.id = o.id;
  ret.x = o.x;
  ret.y = o.y;
  ret.name = o.name;
  ret.removable = o.removable;
  return ret;
}

export function load(data)
{
  if(data){
    data = JSON.parse(data);
    var audioNodeViews = {};
    if(data.audioNodes && data.audioConnections){
      audio.AudioNodeView.removeAllNodeViews();
      data.audioNodes.forEach((d)=>{
        let nodeView = createAudioNodeViewfromJSON(d);
        audioNodeViews[nodeView.id] = nodeView;
      });
      // Connectionの作成
      data.audioConnections.forEach((d)=>{
        let fromNode = audioNodeViews[d.from.node.id];
        let fromParam = d.from.param.name?fromNode.outputParams.find((e)=>{
          return e.name === d.from.param.name;
        }):d.from.param;
        
        let toNode = audioNodeViews[d.to.node.id];
        let toParam = d.to.param.name?toNode.inputParams.find((e)=>{
          return e.name === d.to.param.name;
        }):d.to.param;
        
        audio.AudioNodeView.connect(
         {node:fromNode,param:fromParam}
        ,{node:toNode,param:toParam}
        );
      });
    }
  }
}

export function save()
{
  let saveData = 
  {
    audioNodes:audio.AudioNodeView.audioNodes,
    audioConnections:[],
    objCounter:audio.getObjectCounter()
  };
  
  audio.AudioNodeView.audioConnections.forEach((d)=>{
    let dest ={
      from:{
        node:{
           id:d.from.node.id,
           name:d.from.node.name
        },
        param:(d.from.param.name?{
          name:d.from.param.name
        }:d.from.param)
      },
      to:{
        node:{
          id:d.to.node.id,
          name:d.to.node.name
        },
        param:(d.to.param.name?{
          name:d.to.param.name
        }:d.to.param)
      }
    };
    saveData.audioConnections.push(dest);
  });

  localStorage.setItem('data',JSON.stringify(saveData));  
}
