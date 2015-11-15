import * as ui from './ui';

var counter = 0;
export var ctx; 
export class NodeViewBase {
	constructor(x = 0, y = 0,width = ui.nodeWidth,height = ui.nodeHeight,name = '') {
		this.x = x ;
		this.y = y ;
		this.width = width ;
		this.height = height ;
		this.name = name;
	}
}

export const STATUS_PLAY_NOT_PLAYED = 0;
export const STATUS_PLAY_PLAYING = 1;
export const STATUS_PLAY_PLAYED = 2;

export function defIsNotAPIObj(this_,v){
	Object.defineProperty(this_,'isNotAPIObj',{
			enumerable: false,
			configurable: false,
			writable:false,
			value: v
		});
}

export class AudioParamView extends NodeViewBase {
	constructor(AudioNodeView,name, param) {
		super(0,0,ui.pointSize,ui.pointSize,name);
		this.id = counter++;
		this.audioParam = param;
		this.AudioNodeView = AudioNodeView;
	}
}

export class ParamView extends NodeViewBase {
	constructor(AudioNodeView,name,isoutput) {
		super(0,0,ui.pointSize,ui.pointSize,name);
		this.id = counter++;
		this.AudioNodeView = AudioNodeView;
		this.isOutput = isoutput || false;
	}
}

export class AudioNodeView extends NodeViewBase {
	constructor(audioNode,editor) { // audioNode はベースとなるノード
		super();
		this.id = counter++;
		this.audioNode = audioNode;
		this.name = audioNode.constructor.toString().match(/function\s(.*)\(/)[1];
		this.inputParams = [];
		this.outputParams = [];
		this.params = [];
		let inputCy = 1,outputCy = 1;
		
		this.removable = true;
		
		// プロパティ・メソッドの複製
		for (var i in audioNode) {
			if (typeof audioNode[i] === 'function') {
//				this[i] = audioNode[i].bind(audioNode);
			} else {
				if (typeof audioNode[i] === 'object') {
					if (audioNode[i] instanceof AudioParam) {
						this[i] = new AudioParamView(this,i, audioNode[i]);
						this.inputParams.push(this[i]);
						this.params.push(((p)=>{
							return {
								name:i,
								'get':() => p.audioParam.value,
								'set':(v) =>{p.audioParam.value = v;},
								param:p,
								node:this
							}
						})(this[i]));
						this[i].y = (20 * inputCy++);
					} else if(audioNode[i] instanceof ParamView){
						audioNode[i].AudioNodeView = this;
						this[i] = audioNode[i];
						if(this[i].isOutput){
							this[i].y = (20 * outputCy++);
							this[i].x = this.width;
							this.outputParams.push(this[i]);
						} else {
							this[i].y = (20 * inputCy++);
							this.inputParams.push(this[i]);
						}
					} else {
						this[i] = audioNode[i];
					}
				} else {
					var desc = Object.getOwnPropertyDescriptor(AudioNode.prototype, i);	
					if(!desc){
						desc = Object.getOwnPropertyDescriptor(this.audioNode.__proto__, i);	
					} 
					if(!desc){
						desc = Object.getOwnPropertyDescriptor(this.audioNode,i);
					}
					var props = {};

//					if(desc.get){
							props.get = ((i) => this.audioNode[i]).bind(null, i);
//					}
					
					if(desc.writable || desc.set){
						props.set = ((i, v) => { this.audioNode[i] = v; }).bind(null, i);
					}
					
					props.enumerable = desc.enumerable;
					props.configurable = desc.configurable;
					//props.writable = false;
					//props.writable = desc.writable;
					
					Object.defineProperty(this, i,props);
					
					props.name = i;
					props.node = this;
					
					if(desc.enumerable && !i.match(/(.*_$)|(name)|(^numberOf.*$)/i) && (typeof audioNode[i]) !== 'Array'){
						this.params.push(props);
					}
				}
			}
		}

		this.inputStartY = inputCy * 20;
		var inputHeight = (inputCy + this.numberOfInputs) * 20 ;
		var outputHeight = (outputCy + this.numberOfOutputs) * 20;
		this.outputStartY = outputCy * 20;
		this.height = Math.max(this.height,inputHeight,outputHeight);
		this.temp = {};
		this.statusPlay = STATUS_PLAY_NOT_PLAYED;// not played.
		this.panel = null;
		this.editor = editor.bind(this,this);
	}
	
	// ノードの削除
	static remove(node) {
			if(!node.removable)
			{
				throw new Error('削除できないノードです。');
			}
			// ノードの削除
			for (var i = 0; i < AudioNodeView.audioNodes.length; ++i) {
				if (AudioNodeView.audioNodes[i] === node) {
					if(node.audioNode.dispose){
						node.audioNode.dispose();
					}
					AudioNodeView.audioNodes.splice(i--, 1);
				}
			}

			for (var i = 0; i < AudioNodeView.audioConnections.length; ++i) {
				let n = AudioNodeView.audioConnections[i];
				if (n.from.node === node || n.to.node === node) {
					AudioNodeView.disconnect_(n);
					AudioNodeView.audioConnections.splice(i--,1);
				}
			}
	}

  // 
	static disconnect_(con) {
		if (con.from.param instanceof ParamView) {
			con.from.node.audioNode.disconnect(con);
		} else if (con.to.param) {
						// toパラメータあり
			if (con.to.param instanceof AudioParamView) {
				// AUdioParam
				if (con.from.param) {
					// fromパラメータあり
					con.from.node.audioNode.disconnect(con.to.param.audioParam, con.from.param);
				} else {
					// fromパラメータなし
					con.from.node.audioNode.disconnect(con.to.param.audioParam);
				}
						} else {
				// con.to.paramが数字
				if (con.from.param) {
					// fromパラメータあり
					if (con.from.param instanceof ParamView) {
						con.from.node.audioNode.disconnect(con);
					} else {
						try {
							con.from.node.audioNode.disconnect(con.to.node.audioNode, con.from.param, con.to.param);
						} catch (e) {
							console.log(e);
						}
					}
				} else {
					// fromパラメータなし
					con.from.node.audioNode.disconnect(con.to.node.audioNode, 0, con.to.param);
				}
			}
		} else {
			// to パラメータなし
			if (con.from.param) {
				// fromパラメータあり
				con.from.node.audioNode.disconnect(con.to.node.audioNode, con.from.param);
			} else {
				// fromパラメータなし
				con.from.node.audioNode.disconnect(con.to.node.audioNode);
			}
		}
	}
	
	// コネクションの接続を解除する
	static disconnect(from_,to_) {
			if(from_ instanceof AudioNodeView){
				from_ = {node:from_};
			}
			
			if(from_ instanceof ParamView ){
				from_ = {node:from_.AudioNodeView,param:from_};
			}

			if(to_ instanceof AudioNodeView){
				to_ = {node:to_};
			}

			if(to_ instanceof AudioParamView){
				to_ = {node:to_.AudioNodeView,param:to_}
			}

			if(to_ instanceof ParamView){
				to_ = {node:to_.AudioNodeView,param:to_}
			}
			
			var con = {'from':from_,'to':to_};
			
			// コネクションの削除
			for (var i = 0; i < AudioNodeView.audioConnections.length; ++i) {
				let n = AudioNodeView.audioConnections[i];
				if(con.from.node === n.from.node && con.from.param === n.from.param 
					&& con.to.node === n.to.node && con.to.param === n.to.param){
					AudioNodeView.audioConnections.splice(i--,1);
					AudioNodeView.disconnect_(con);
					}
			}
	}

	static create(audionode,editor = ()=>{}) {
		var obj = new AudioNodeView(audionode,editor);
		AudioNodeView.audioNodes.push(obj);
		return obj;
	}
	
  // ノード間の接続
	static connect(from_, to_) {
		if(from_ instanceof AudioNodeView ){
			from_ = {node:from_,param:0};
		}

		if(from_ instanceof ParamView){
			from_ = {node:from_.AudioNodeView,param:from_};
		}

		
		if(to_ instanceof AudioNodeView){
			to_ = {node:to_,param:0};
		}
		
		if(to_ instanceof AudioParamView){
			to_ = {node:to_.AudioNodeView,param:to_};
		}
		
		if(to_ instanceof ParamView){
			to_ = {node:to_.AudioNodeView,param:to_};
		}
		// 存在チェック
		for (var i = 0, l = AudioNodeView.audioConnections.length; i < l; ++i) {
			var c = AudioNodeView.audioConnections[i];
			if (c.from.node === from_.node 
				&& c.from.param === from_.param
				&& c.to.node === to_.node
				&& c.to.param === to_.param
				) 
				{
					return;
//				throw (new Error('接続が重複しています。'));
			}
		}
		
		// 接続先がParamViewの場合は接続元はParamViewのみ
		if(to_.param instanceof ParamView && !(from_.param instanceof ParamView)){
		  return ;
		}
		
		// ParamViewが接続可能なのはAudioParamからParamViewのみ
		if(from_.param instanceof ParamView){
			if(!(to_.param instanceof ParamView || to_.param instanceof AudioParamView)){
				return;	
			}
		} 
		
		if (from_.param) {
			// fromパラメータあり
		  if(from_.param instanceof ParamView){
				  from_.node.audioNode.connect({'from':from_,'to':to_});
//				from_.node.connectParam(from_.param,to_);
			} else if (to_.param) 
			{
				// toパラメータあり
				if(to_.param instanceof AudioParamView){
					// AudioParamの場合
					from_.node.audioNode.connect(to_.param.audioParam,from_.param);
				} else {
					// 数字の場合
					from_.node.audioNode.connect(to_.node.audioNode, from_.param,to_.param);
				}
			} else {
				// toパラメータなし
				from_.node.audioNode.connect(to_.node.audioNode,from_.param);
			}
		} else {
			// fromパラメータなし
			if (to_.param) {
				// toパラメータあり
				if(to_.param instanceof AudioParamView){
					// AudioParamの場合
					from_.node.audioNode.connect(to_.param.audioParam);
				} else{
					// 数字の場合
					from_.node.audioNode.connect(to_.node.audioNode,0,to_.param);
				}
			} else {
				// toパラメータなし
				from_.node.audioNode.connect(to_.node.audioNode);
			}
			//throw new Error('Connection Error');
		}
		
		AudioNodeView.audioConnections.push
		({
			'from': from_,
			'to': to_
		});
	}
}

AudioNodeView.audioNodes = [];
AudioNodeView.audioConnections = [];


