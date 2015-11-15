"use strict";
import UUID from './uuid.core';
export const nodeHeight = 50;
export const nodeWidth = 100;
export const pointSize = 16;

// panel window
export class Panel {
	constructor(sel,prop){
		if(!prop || !prop.id){
			prop = prop ? (prop.id = 'id-' + UUID.generate(),prop) :{ id:'id-' + UUID.generate()};
		}
		this.id = prop.id;
		sel = sel || d3.select('#content');
		this.selection = 
		sel
		.append('div')
		.attr(prop)
		.attr('class','panel')
		.datum(this);

		// パネル用Dragその他

		this.header = this.selection.append('header').call(this.drag);
		this.article = this.selection.append('article');
		this.footer = this.selection.append('footer');
		this.selection.append('div')
		.classed('panel-close',true)
		.on('click',()=>{
			this.dispose();
		});

	}	

	get node() {
		return this.selection.node();
	}
	get x (){
		return parseFloat(this.selection.style('left'));
	}
	set x (v){
		this.selection.style('left',v + 'px');
	}
	get y (){
		return parseFloat(this.selection.style('top'));
	}
	set y (v){
		this.selection.style('top',v + 'px');
	}
	get width(){
		return parseFloat(this.selection.style('width'));
	}
	set width(v){
		this.selection.style('width', v + 'px');
	}
	get height(){
		return parseFloat(this.selection.style('height'));
	}
	set height(v){
		this.selection.style('height',v + 'px');
	}
	
	dispose(){
		this.selection.remove();
		this.selection = null;
	}
	
	show(){
		this.selection.style('visibility','visible');
	}

	hide(){
		this.selection.style('visibility','hidden');
	}
	
	get isShow(){
		return this.selection && this.selection.style('visibility') === 'visible';
	}
}

Panel.prototype.drag = d3.behavior.drag()
		.on('dragstart',function(d){
			console.log(d);
		var sel = d3.select('#' + d.id);
		
		d3.select('#content')
		.append('div')
		.attr({id:'panel-dummy-' + d.id,
			'class':'panel panel-dummy'})
		.style({
			left:sel.style('left'),
			top:sel.style('top'),
			width:sel.style('width'),
			height:sel.style('height')
		});
	})
	.on("drag", function (d) {
		var dummy = d3.select('#panel-dummy-' + d.id);

		var x = parseFloat(dummy.style('left')) + d3.event.dx;
		var y = parseFloat(dummy.style('top')) + d3.event.dy;
		
		dummy.style({'left':x + 'px','top':y + 'px'});
	})
	.on('dragend',function(d){
		var sel = d3.select('#' + d.id);
		var dummy = d3.select('#panel-dummy-' + d.id);
		sel.style(
			{'left':dummy.style('left'),'top':dummy.style('top')}
		);
		dummy.remove();
	});
	
