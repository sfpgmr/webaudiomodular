"use strict";

// panel window
class panel {
	constructor(sel,id,klass){
		this.selection = sel
		.append('div')
		.attr({'id':id, 'class': klass || 'panel'});
		this.selection.append('div').classed('panel-close',true);
		this.selection.append('header');
		this.selection.append('article');
		this.selection.append('footer');
	}	
	get selection(){
		return this.selection;
	}
	get node(){
		return this.selection.node();
	}
}