var svg;
//aa
var nodeGroup, lineGroup;
var drag;
var dragOut;
var dragPanel;

var mouseClickNode;
var mouseOverNode;
var line;
var audioNodeCreators = [];

// Drawの初期化
function initUI(){
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
		var x1 = d.node.x + d.node.width / 2,y1;
		if(d.index){
			y1 = d.node.y - d.node.height /2 + d.node.outputStartY + d.index * 20; 
		} else {
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
				console.log('hit',node.name,d);
				let from_ = {node:d.node,param:d.index};
				let to_ = {node:node,param:elm.__data__.index};
				AudioNode_.connect(from_,to_);
				//AudioNode_.connect();
				draw();
				connected = true;
				break;
			}
		}
		
		if(!connected){
			// AudioParam
			var params = d3.selectAll('.param')[0];
			for(var i = 0,l = params.length;i < l;++i)
			{
				let elm = params[i];
				let bbox = elm.getBBox();
				let param = elm.__data__;
				let node = param.audioNode_;
				let left = node.x - node.width / 2 + bbox.x,
					top = node.y - node.height / 2 + bbox.y,
					right = node.x - node.width / 2 + bbox.x + bbox.width,
					bottom = node.y - node.height / 2 + bbox.y + bbox.height;
				if(targetX >= left && targetX <= right && targetY >= top && targetY <= bottom)
				{
					AudioNode_.connect({node:d.node,param:d.index},{node:node,param:param});
					draw();
					break;
				}
			}
		}
		// lineプレビューの削除
		d.line.remove();
		delete d.line;
	});
	
	// パネル用Dragその他
	dragPanel = d3.behavior.drag()
//	.origin(function(d){ return d;})
	.on('dragstart',function(d){
		var sel = d3.select(this.parentNode);
		d3.select('#content')
		.insert('div')
		.attr({id:'prop-dummy',
			'class':'prop-panel prop-dummy'})
		.style({
			left:sel.style('left'),
			top:sel.style('top')
		});
	})
	.on("drag", function (d) {
		var dummy = d3.select('#prop-dummy');

		var x = parseFloat(dummy.style('left')) + d3.event.dx;
		var y = parseFloat(dummy.style('top')) + d3.event.dy;
		
		dummy.style({'left':x + 'px','top':y + 'px'});
	})
	.on('dragend',function(d){
		var sel = d3.select(this.parentNode);
		var dummy = d3.select('#prop-dummy');
		sel.style(
			{'left':dummy.style('left'),'top':dummy.style('top')}
		);
		dummy.remove();
	});
	d3.select('#panel-header').call(dragPanel);

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
		{name:'Gain',create:ctx.createGain.bind(ctx)},
		{name:'Delay',create:ctx.createDelay.bind(ctx)},
		{name:'AudioBufferSource',create:ctx.createBufferSource.bind(ctx)},
		{name:'MediaElementAudioSource',create:ctx.createMediaElementSource.bind(ctx)},
		{name:'Panner',create:ctx.createPanner.bind(ctx)},
		{name:'Convolver',create:ctx.createConvolver.bind(ctx)},
		{name:'Analyser',create:ctx.createAnalyser.bind(ctx)},
		{name:'ChannelSplitter',create:ctx.createChannelSplitter.bind(ctx)},
		{name:'ChannelMerger',create:ctx.createChannelMerger.bind(ctx)},
		{name:'DynamicsCompressor',create:ctx.createDynamicsCompressor.bind(ctx)},
		{name:'BiquadFilter',create:ctx.createBiquadFilter.bind(ctx)},
		{name:'Oscillator',create:ctx.createOscillator.bind(ctx)},
		{name:'MediaStreamAudioSource',create:ctx.createMediaStreamSource.bind(ctx)},
		{name:'WaveShaper',create:ctx.createWaveShaper.bind(ctx)}
	];
	
	if(ctx.createMediaStreamDestination){
		audioNodeCreators.push({name:'MediaStreamAudioDestination',
			create:ctx.createMediaStreamDestination.bind(ctx)
		});
	}
	
	d3.select('#content')
	.on('contextmenu',function(){
		showAudioNodePanel(this);
	});
}

// 描画
function draw() {
	// AudioNodeの描画
	var gd = nodeGroup.selectAll('g').
	data(AudioNode_.audioNodes,function(d){return d.id;});

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
		return d.statusPlay === STATUS_PLAY_PLAYING;
	})
	.on('contextmenu',function(d){
		showPanel.bind(this,d)();
		d3.event.preventDefault();
		d3.event.returnValue = false;
	})
	.on('click.remove',function(d){
		if(d3.event.shiftKey){
			AudioNode_.remove(d);
			draw();
		}
		d3.event.returnValue = false;
		d3.event.preventDefault();
	})
	.filter(function(d){
		return d.audioNode instanceof OscillatorNode || d.audioNode instanceof AudioBufferSourceNode || d.audioNode instanceof MediaElementAudioSourceNode; 
	})
	.on('click',function(d){
		console.log(d3.event);
		d3.event.returnValue = false;
		d3.event.preventDefault();

		if(!d3.event.ctrlKey){
			return;
		}
		let sel = d3.select(this);
		if(d.statusPlay === STATUS_PLAY_PLAYING){
			d.statusPlay = STATUS_PLAY_PLAYED;
			sel.classed('play',false);
			d.stop(0);
		} else if(d.statusPlay !== STATUS_PLAY_PLAYED){
			d.start(0);
			d.statusPlay = STATUS_PLAY_PLAYING;
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

	// AudioParamの表示	
	gd.each(function (d) {
		var sel = d3.select(this);
		var gp = sel.append('g');
		var gpd = gp.selectAll('g')
		.data(d.audioParams,function(d){return d.id;});
		
		var gpdg = gpd.enter()
		.append('g');
		
		gpdg.append('circle')
		.attr({ 'r': (d)=>d.width/2, cx: 0, cy: (d, i)=> { /*d.x = 0; d.y = (i + 1) * 20; */return d.y; }, 'class': 'param' });
		
		gpdg.append('text')
		.attr({x: (d)=> (d.x + d.width / 2 + 5),y:(d)=>d.y,'class':'label' })
		.text((d)=>d.name);
		
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
		.attr({ x: d.width - pointSize / 2, y: (d1)=> (d.outputStartY + d1.index * 20 - pointSize / 2), width: pointSize, height: pointSize, 'class': 'output' })
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
		.attr({ x: - pointSize / 2, y: (d1)=> (d.inputStartY + d1.index * 20 - pointSize / 2), width: pointSize, height: pointSize, 'class': 'input' })
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
	.data(AudioNode_.audioConnections);

	ld.enter()
	.append('path');

	ld.each(function (d) {
		var path = d3.select(this);
		var x1,y1,x2,y2;

		// x1,y1
		x1 = d.from.node.x + d.from.node.width / 2;
		if(d.from.param){
			y1 = d.from.node.y - d.from.node.height /2 + d.from.node.outputStartY + d.from.param * 20; 
		} else {
			y1 = d.from.node.y - d.from.node.height /2 + d.from.node.outputStartY;
		}

		x2 = d.to.node.x - d.to.node.width / 2;
		y2 = d.to.node.y - d.to.node.height / 2;
		
		if(d.to.param){
			if(d.to.param instanceof AudioParam_){
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
				AudioNode_.disconnect(d.from,d.to);
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
	d3.select('#panel-header').text(d.name);
	var panel = d3.select('#prop-panel').select('#panel-content');
	panel.select('table').remove();
	var table = panel.append('table');
	// var th = table.append('thead')
	// .append('tr');
	// th.append('th').text('パラメータ');
	// th.append('th').text('値');

	var tbody = table.append('tbody').selectAll('tr').data(d.params);
	var tr = tbody.enter()
	.append('tr');
	tr.append('td')
	.text((d)=>d.name);
	tr.append('td')
	.append('input')
	.attr({type:"text",value:(d)=>d.get(),readonly:(d)=>d.set?null:'readonly'})
	.on('change',function(d){
		let sel = d3.select(this);
		let value = this.value;
		console.log(value);
		let vn = parseFloat(value);
		if(isNaN(vn)){
			d.set(value);
		} else {
			d.set(vn);
		}
	});
	
	 d3.select('#prop-panel').style('visibility','visible');
	 d3.event.returnValue = false;
	 d3.event.preventDefault();
	 d3.event.cancelBubble = true;
}

// ノード挿入パネルの表示
function showAudioNodePanel(d){
	d3.select('#panel-header').text('AudioNodeの挿入');
	var panel = d3.select('#prop-panel').select('#panel-content');
	panel.select('table').remove();
	var table = panel.append('table');

	var tbody = table.append('tbody').selectAll('tr').data(audioNodeCreators);
	var tr = tbody.enter()
	.append('tr')
	.append('td')
	.text((d)=>d.name)
	.on('click',function(dt){
		console.log(d3.event);
		var node = AudioNode_.create(dt.create());
		node.x = d3.event.clientX;
		node.y = d3.event.clientY;
		draw();
		d3.select('#prop-panel').style('visibility','hidden');
	});

	 d3.select('#prop-panel').style(
		 {
			 'visibility':'visible',
		 	 'left': d3.event.clientX + 'px',
			 'top':d3.event.clientY + 'px'
		 });
	 d3.event.returnValue = false;
	 d3.event.preventDefault();
	
}