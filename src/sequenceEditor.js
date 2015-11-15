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
	 
	 
	 d.panel.show();
	 
}