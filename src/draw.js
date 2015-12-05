import * as audio from './audio';
import * as ui from './ui.js';
import {showSequenceEditor} from './sequenceEditor';

export var svg;
//aa
var nodeGroup, lineGroup;
var drag;
var dragOut;
var dragParam;
var dragPanel;

var mouseClickNode;
var mouseOverNode;
var line;
var audioNodeCreators = [];

// Drawの初期化
export function initUI(){
	// 出力ノードの作成（削除不可）
	var out = audio.AudioNodeView.create(audio.ctx.destination,showPanel);
	out.x = window.innerWidth / 2;
	out.y = window.innerHeight / 2;
	out.removable = false;
	
	// プレイヤー
	audio.Sequencer.added = ()=>
	{
		if(audio.Sequencer.sequencers.length == 1 && audio.Sequencer.sequencers.status === audio.SEQ_STATUS.STOPPED){
			d3.select('#play').attr('disabled',null);
			d3.select('#stop').attr('disabled','disabled');
			d3.select('#pause').attr('disabled','disabled');
		}
	}
	
	audio.Sequencer.empty = ()=>{
		audio.Sequencer.stopSequences();
		d3.select('#play').attr('disabled','disabled');
		d3.select('#stop').attr('disabled','disabled');
		d3.select('#pause').attr('disabled','disabled');
	} 
	
	d3.select('#play')
	.on('click',function()
	{
		audio.Sequencer.startSequences(audio.ctx.currentTime);
		d3.select(this).attr('disabled','disabled');
		d3.select('#stop').attr('disabled',null);
		d3.select('#pause').attr('disabled',null);
	});
	
	d3.select('#pause').on('click',function(){
		audio.Sequencer.pauseSequences();
		d3.select(this).attr('disabled','disabled');
		d3.select('#stop').attr('disabled',null);
		d3.select('#play').attr('disabled',null);
	});
	
	d3.select('#stop').on('click',function(){
		audio.Sequencer.stopSequences();
		d3.select(this).attr('disabled','disabled');
		d3.select('#pause').attr('disabled','disabled');
		d3.select('#play').attr('disabled',null);
	});
	
	audio.Sequencer.stopped = ()=>{
		d3.select('#stop').attr('disabled','disabled');
		d3.select('#pause').attr('disabled','disabled');
		d3.select('#play').attr('disabled',null);
	}
	
	
	// AudioNodeドラッグ用
	drag = d3.behavior.drag()
	.origin(function (d) { return d; })
	.on('dragstart',function(d){
		if(d3.event.sourceEvent.ctrlKey || d3.event.sourceEvent.shiftKey){
			this.dispatchEvent(new Event('mouseup'));			
			return false;
		}
		d.temp.x = d.x;
		d.temp.y = d.y;
		d3.select(this.parentNode)
		.append('rect')
		.attr({id:'drag',width:d.width,height:d.height,x:0,y:0,'class':'audioNodeDrag'} );
	})
	.on("drag", function (d) {
		if(d3.event.sourceEvent.ctrlKey || d3.event.sourceEvent.shiftKey){
			return;
		}
		d.temp.x += d3.event.dx;
		d.temp.y += d3.event.dy;
		//d3.select(this).attr('transform', 'translate(' + (d.x - d.width / 2) + ',' + (d.y - d.height / 2) + ')');
		//draw();
		var dragCursol = d3.select(this.parentNode)
		.select('rect#drag');
		var x = parseFloat(dragCursol.attr('x')) + d3.event.dx;
		var y = parseFloat(dragCursol.attr('y')) + d3.event.dy;
		dragCursol.attr({x:x,y:y});		
	})
	.on('dragend',function(d){
		if(d3.event.sourceEvent.ctrlKey || d3.event.sourceEvent.shiftKey){
			return;
		}
		var dragCursol = d3.select(this.parentNode)
		.select('rect#drag');
		var x = parseFloat(dragCursol.attr('x'));
		var y = parseFloat(dragCursol.attr('y'));
		d.x = d.temp.x;
		d.y = d.temp.y;
		dragCursol.remove();		
		draw();
	});
	
	// ノード間接続用 drag 
	dragOut = d3.behavior.drag()
	.origin(function (d) { return d; })
	.on('dragstart',function(d){
		let x1,y1;
		if(d.index){
			if(d.index instanceof audio.ParamView){
				x1 = d.node.x - d.node.width / 2 + d.index.x;
				y1 = d.node.y - d.node.height /2 + d.index.y;
			} else {
				x1 = d.node.x + d.node.width / 2;
				y1 = d.node.y - d.node.height /2 + d.node.outputStartY + d.index * 20; 
			}
		} else {
			x1 = d.node.x + d.node.width / 2;
			y1 = d.node.y - d.node.height /2 + d.node.outputStartY;
		}

		d.x1 = x1,d.y1 = y1;				
		d.x2 = x1,d.y2 = y1;

		var pos = makePos(x1,y1,d.x2,d.y2);
		d.line = svg.append('g')
		.datum(d)
		.append('path')
		.attr({'d':line(pos),'class':'line-drag'});
	})
	.on("drag", function (d) {
		d.x2 += d3.event.dx;
		d.y2 += d3.event.dy;
		d.line.attr('d',line(makePos(d.x1,d.y1,d.x2,d.y2)));					
	})
	.on("dragend", function (d) {
		let targetX = d.x2;
		let targetY = d.y2;
		// inputもしくはparamに到達しているか
		// input		
		let connected = false;
		let inputs = d3.selectAll('.input')[0];
		for(var i = 0,l = inputs.length;i < l;++i){
			let elm = inputs[i];
			let bbox = elm.getBBox();
			let node = elm.__data__.node;
			let left = node.x - node.width / 2 + bbox.x,
				top = node.y - node.height / 2 + bbox.y,
				right = node.x - node.width / 2 + bbox.x + bbox.width,
				bottom = node.y - node.height / 2 + bbox.y + bbox.height;
			if(targetX >= left && targetX <= right && targetY >= top && targetY <= bottom)
			{
//				console.log('hit',elm);
				let from_ = {node:d.node,param:d.index};
				let to_ = {node:node,param:elm.__data__.index};
				audio.AudioNodeView.connect(from_,to_);
				//AudioNodeView.connect();
				draw();
				connected = true;
				break;
			}
		}
		
		if(!connected){
			// AudioParam
			var params = d3.selectAll('.param,.audio-param')[0];
			for(var i = 0,l = params.length;i < l;++i)
			{
				let elm = params[i];
				let bbox = elm.getBBox();
				let param = elm.__data__;
				let node = param.node;
				let left = node.x - node.width / 2 + bbox.x;
				let	top_ = node.y - node.height / 2 + bbox.y;
				let	right = node.x - node.width / 2 + bbox.x + bbox.width;
				let	bottom = node.y - node.height / 2 + bbox.y + bbox.height;
				if(targetX >= left && targetX <= right && targetY >= top_ && targetY <= bottom)
				{
					console.log('hit',elm);
					audio.AudioNodeView.connect({node:d.node,param:d.index},{node:node,param:param.index});
					draw();
					break;
				}
			}
		}
		// lineプレビューの削除
		d.line.remove();
		delete d.line;
	});
	
	d3.select('#panel-close')
	.on('click',function(){d3.select('#prop-panel').style('visibility','hidden');d3.event.returnValue = false;d3.event.preventDefault();});

	// node間接続line描画関数
	line = d3.svg.line()
	.x(function(d){return d.x})
	.y(function(d){return d.y})
	.interpolate('basis');

	// DOMにsvgエレメントを挿入	
	svg = d3.select('#content')
		.append('svg')
		.attr({ 'width': window.innerWidth, 'height': window.innerHeight });

	// ノードが入るグループ
	nodeGroup = svg.append('g');
	// ラインが入るグループ
	lineGroup = svg.append('g');
	
	// body属性に挿入
	audioNodeCreators = 
	[
		{name:'Gain',create:audio.ctx.createGain.bind(audio.ctx)},
		{name:'Delay',create:audio.ctx.createDelay.bind(audio.ctx)},
		{name:'AudioBufferSource',create:audio.ctx.createBufferSource.bind(audio.ctx)},
		{name:'MediaElementAudioSource',create:audio.ctx.createMediaElementSource.bind(audio.ctx)},
		{name:'Panner',create:audio.ctx.createPanner.bind(audio.ctx)},
		{name:'Convolver',create:audio.ctx.createConvolver.bind(audio.ctx)},
		{name:'Analyser',create:audio.ctx.createAnalyser.bind(audio.ctx)},
		{name:'ChannelSplitter',create:audio.ctx.createChannelSplitter.bind(audio.ctx)},
		{name:'ChannelMerger',create:audio.ctx.createChannelMerger.bind(audio.ctx)},
		{name:'DynamicsCompressor',create:audio.ctx.createDynamicsCompressor.bind(audio.ctx)},
		{name:'BiquadFilter',create:audio.ctx.createBiquadFilter.bind(audio.ctx)},
		{name:'Oscillator',create:audio.ctx.createOscillator.bind(audio.ctx)},
		{name:'MediaStreamAudioSource',create:audio.ctx.createMediaStreamSource.bind(audio.ctx)},
		{name:'WaveShaper',create:audio.ctx.createWaveShaper.bind(audio.ctx)},
		{name:'EG',create:()=>new audio.EG()},
		{name:'Sequencer',create:()=>new audio.Sequencer(),editor:showSequenceEditor}
	];
	
	if(audio.ctx.createMediaStreamDestination){
		audioNodeCreators.push({name:'MediaStreamAudioDestination',
			create:audio.ctx.createMediaStreamDestination.bind(audio.ctx)
		});
	}
	
	d3.select('#content')
	.datum({})
	.on('contextmenu',function(){
		showAudioNodePanel(this);
	});
}

// 描画
export function draw() {
	// AudioNodeの描画
	var gd = nodeGroup.selectAll('g').
	data(audio.AudioNodeView.audioNodes,function(d){return d.id;});

	// 矩形の更新
	gd.select('rect')
	.attr({ 'width': (d)=> d.width, 'height': (d)=> d.height });
	
	// AudioNode矩形グループ
	var g = gd.enter()
	.append('g');
	// AudioNode矩形グループの座標位置セット
	gd.attr('transform', function (d) { return 'translate(' + (d.x - d.width / 2) + ',' + (d.y - d.height / 2) + ')' });	

	// AudioNode矩形
	g.append('rect')
	.call(drag)
	.attr({ 'width': (d)=> d.width, 'height': (d)=> d.height, 'class': 'audioNode' })
	.classed('play',function(d){
		return d.statusPlay === audio.STATUS_PLAY_PLAYING;
	})
	.on('contextmenu',function(d){
		// パラメータ編集画面の表示
		d.editor();
		d3.event.preventDefault();
		d3.event.returnValue = false;
	})
	.on('click.remove',function(d){
		// ノードの削除
		if(d3.event.shiftKey){
			d.panel && d.panel.isShow && d.panel.dispose();
			try {
				audio.AudioNodeView.remove(d);
				draw();
			} catch(e) {
//				dialog.text(e.message).node().show(window.innerWidth/2,window.innerHeight/2);
			}
		}
		d3.event.returnValue = false;
		d3.event.preventDefault();
	})
	.filter(function(d){
		// 音源のみにフィルタ
		return d.audioNode instanceof OscillatorNode || d.audioNode instanceof AudioBufferSourceNode || d.audioNode instanceof MediaElementAudioSourceNode; 
	})
	.on('click',function(d){
		// 再生・停止
		console.log(d3.event);
		d3.event.returnValue = false;
		d3.event.preventDefault();

		if(!d3.event.ctrlKey){
			return;
		}
		let sel = d3.select(this);
		if(d.statusPlay === audio.STATUS_PLAY_PLAYING){
			d.statusPlay = audio.STATUS_PLAY_PLAYED;
			sel.classed('play',false);
			d.audioNode.stop(0);
		} else if(d.statusPlay !== audio.STATUS_PLAY_PLAYED){
			d.audioNode.start(0);
			d.statusPlay = audio.STATUS_PLAY_PLAYING;
			sel.classed('play',true);
		} else {
			alert('一度停止すると再生できません。');
		}
	})
	.call(tooltip('Ctrl + Click で再生・停止'));
	;
	
	// AudioNodeのラベル
	g.append('text')
	.attr({ x: 0, y: -10, 'class': 'label' })
	.text(function (d) { return d.name; });

	// 入力AudioParamの表示	
	gd.each(function (d) {
		var sel = d3.select(this);
		var gp = sel.append('g');
		var gpd = gp.selectAll('g')
		.data(d.inputParams.map((d)=>{
			return {node:d.AudioNodeView,index:d};
		}),function(d){return d.index.id;});		

		var gpdg = gpd.enter()
		.append('g');
		
		gpdg.append('circle')
		.attr({'r': (d)=>d.index.width/2, 
		cx: 0, cy: (d, i)=> { return d.index.y; },
		'class': function(d) {
			if(d.index instanceof audio.AudioParamView){
				return 'audio-param';
			}
			return 'param';
		}});
		
		gpdg.append('text')
		.attr({x: (d)=> (d.index.x + d.index.width / 2 + 5),y:(d)=>d.index.y,'class':'label' })
		.text((d)=>d.index.name);

		gpd.exit().remove();
		
	});

	// 出力Paramの表示	
	gd.each(function (d) {
		var sel = d3.select(this);
		var gp = sel.append('g');
		
		
		
		var gpd = gp.selectAll('g')
		.data(d.outputParams.map((d)=>{
			return {node:d.AudioNodeView,index:d};
		}),function(d){return d.index.id;});
		
		var gpdg = gpd.enter()
		.append('g');

		gpdg.append('circle')
		.attr({'r': (d)=>d.index.width/2, 
		cx: d.width, cy: (d, i)=> { return d.index.y; },
		'class': 'param'})
		.call(dragOut);
		
		gpdg.append('text')
		.attr({x: (d)=> (d.index.x + d.index.width / 2 + 5),y:(d)=>d.index.y,'class':'label' })
		.text((d)=>d.index.name);

		gpd.exit().remove();
		
	});

	// 出力表示
	gd.filter(function (d) {
		return d.numberOfOutputs > 0;
	})
	.each(function(d){
		var sel = d3.select(this).append('g');
		if(!d.temp.outs || (d.temp.outs && (d.temp.outs.length < d.numberOfOutputs)))
		{
			d.temp.outs = [];
			for(var i = 0;i < d.numberOfOutputs;++i){
				d.temp.outs.push({node:d,index:i});
			}
		}
		var sel1 = sel.selectAll('g');
		var seld = sel1.data(d.temp.outs);

		seld.enter()
		.append('g')
		.append('rect')
		.attr({ x: d.width - ui.pointSize / 2, y: (d1)=> (d.outputStartY + d1.index * 20 - ui.pointSize / 2), width: ui.pointSize, height: ui.pointSize, 'class': 'output' })
		.call(dragOut);
		seld.exit().remove();
	});

	// 入力表示
	gd
	.filter(function (d) {	return d.numberOfInputs > 0; })
	.each(function(d){
		var sel = d3.select(this).append('g');
		if(!d.temp.ins || (d.temp.ins && (d.temp.ins.length < d.numberOfInputs)))
		{
			d.temp.ins = [];
			for(var i = 0;i < d.numberOfInputs;++i){
				d.temp.ins.push({node:d,index:i});
			}
		}
		var sel1 = sel.selectAll('g');
		var seld = sel1.data(d.temp.ins);

		seld.enter()
		.append('g')
		.append('rect')
		.attr({ x: - ui.pointSize / 2, y: (d1)=> (d.inputStartY + d1.index * 20 - ui.pointSize / 2), width: ui.pointSize, height: ui.pointSize, 'class': 'input' })
		.on('mouseenter',function(d){
			mouseOverNode = {node:d.audioNode_,param:d};
		})
		.on('mouseleave',function(d){
			if(mouseOverNode.node){
				if(mouseOverNode.node === d.audioNode_ && mouseOverNode.param === d){
					mouseOverNode = null;
				}
			}
		});
		seld.exit().remove();
	});
	
	// 不要なノードの削除
	gd.exit().remove();
		
	// line 描画
	var ld = lineGroup.selectAll('path')
	.data(audio.AudioNodeView.audioConnections);

	ld.enter()
	.append('path');

	ld.each(function (d) {
		var path = d3.select(this);
		var x1,y1,x2,y2;

		// x1,y1
		if(d.from.param){
			if(d.from.param instanceof audio.ParamView){
				x1 = d.from.node.x - d.from.node.width / 2 + d.from.param.x;
				y1 = d.from.node.y - d.from.node.height /2 + d.from.param.y; 
			} else {
				x1 = d.from.node.x + d.from.node.width / 2;
				y1 = d.from.node.y - d.from.node.height /2 + d.from.node.outputStartY + d.from.param * 20; 
			}
		} else {
			x1 = d.from.node.x + d.from.node.width / 2;
			y1 = d.from.node.y - d.from.node.height /2 + d.from.node.outputStartY;
		}

		x2 = d.to.node.x - d.to.node.width / 2;
		y2 = d.to.node.y - d.to.node.height / 2;
		
		if(d.to.param){
			if(d.to.param instanceof audio.AudioParamView || d.to.param instanceof audio.ParamView){
				x2 += d.to.param.x;
				y2 += d.to.param.y;
			} else {
				y2 +=  d.to.node.inputStartY  +  d.to.param * 20;	
			}
		} else {
			y2 += d.to.node.inputStartY;
		}
		
		var pos = makePos(x1,y1,x2,y2);
		
		path.attr({'d':line(pos),'class':'line'});
		path.on('click',function(d){
			if(d3.event.shiftKey){
				audio.AudioNodeView.disconnect(d.from,d.to);
				d3.event.returnValue = false;
				draw();
			} 
		}).call(tooltip('Shift + clickで削除'));
		
	});
	ld.exit().remove();
}

// 簡易tooltip表示
function tooltip(mes)
{
	return function(d){
		this
		.on('mouseenter',function(){
			svg.append('text')
			.attr({'class':'tip',x:d3.event.x + 20 ,y:d3.event.y - 20})
			.text(mes);
		})
		.on('mouseleave',function(){
			svg.selectAll('.tip').remove();
		})
	};
}

// 接続線の座標生成
function makePos(x1,y1,x2,y2){
	return [
			{x:x1,y:y1},
			{x:x1 + (x2 - x1)/4,y:y1},
			{x:x1 + (x2 - x1)/2,y:y1 + (y2 - y1)/2},
			{x:x1 + (x2 - x1)*3/4,y:y2},
			{x:x2, y:y2}
		];
}

// プロパティパネルの表示
function showPanel(d){

	d3.event.returnValue = false;
	d3.event.cancelBubble = true;
	d3.event.preventDefault();

	if(d.panel && d.panel.isShow) return ;

	d.panel = new ui.Panel();
	d.panel.x = d.x;
	d.panel.y = d.y;
	d.panel.header.text(d.name);
	
	var table = d.panel.article.append('table');
	var tbody = table.append('tbody').selectAll('tr').data(d.params);
	var tr = tbody.enter()
	.append('tr');
	tr.append('td')
	.text((d)=>d.name);
	tr.append('td')
	.append('input')
	.attr({type:"text",value:(d)=>d.get(),readonly:(d)=>d.set?null:'readonly'})
	.on('change',function(d){
		let value = d3.event.target.value;
		let vn = parseFloat(value);
		if(isNaN(vn)){
			d.set(value);
		} else {
			d.set(vn);
		}
	});
	d.panel.show();

}

// ノード挿入パネルの表示
function showAudioNodePanel(d){
	 d3.event.returnValue = false;
	 d3.event.preventDefault();

	if(d.panel){
		if(d.panel.isShow)
			return;
	}
	
	d.panel = new ui.Panel();
	d.panel.x = d3.event.offsetX;
	d.panel.y = d3.event.offsetY;
	d.panel.header.text('AudioNodeの挿入');

	var table = d.panel.article.append('table');
	var tbody = table.append('tbody').selectAll('tr').data(audioNodeCreators);
	tbody.enter()
	.append('tr')
	.append('td')
	.text((d)=>d.name)
	.on('click',function(dt){
		console.log('挿入',dt);
		
		var editor = dt.editor || showPanel;
		
		var node = audio.AudioNodeView.create(dt.create(),editor);
		node.x = d3.event.clientX;
		node.y = d3.event.clientY;
		draw();
		// d3.select('#prop-panel').style('visibility','hidden');
		// d.panel.dispose();
	});
	d.panel.show();
}

export function createAudioNodeView(name){
	var obj = audioNodeCreators.find((d)=>{
		if(d.name === name) return true;
	});
	if(obj){
		return audio.AudioNodeView.create(obj.create(),obj.editor || showPanel);			
	}
}
