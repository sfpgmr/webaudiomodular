'use strict';
import * as audio from './audio';
import * as ui from './ui.js';


export class SequenceEditor {
	
}


export function showSequenceEditor(d)
{
	 d3.event.returnValue = false;
	 d3.event.preventDefault();
	 d3.event.cancelBubble = true;
	 if(d.panel && d.panel.isShow) return;
	 
	 d.panel = new ui.Panel();
	 d.panel.x = d.x;
	 d.panel.y = d.y;
	 d.panel.width = 1024;
	 d.panel.height = 768;
	 d.panel.header.text('Sequence Editor');
	 var div = d.panel.article.append('div').classed('seq-editor',true);
	 div.append('span').text('Time Base:');
	 div.append('input')
	 .datum(d)
	 .attr({'type':'text','size':'3'})
	 .attr('value',(d)=>d.audioNode.tpb)
	 .on('change',function(d){
		 d.audioNode.tpb = d3.select(this).attr('value');
	 });

	 div.append('span').text('Tempo:');
	 div.append('input')
	 .datum(d)
	 .attr({'type':'text','size':'3'})
	 .attr('value',(d)=>d.audioNode.bpm)
	 .on('change',function(d){
		 d.audioNode.bpm = d3.select(this).attr('value');
	 });
	 
	 
	 d.panel.show();
	 
}