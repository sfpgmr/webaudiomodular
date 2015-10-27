import * as ui from './ui';

var counter = 0;
export var ctx; 
export class NodeViewData {
	constructor(x = 0, y = 0,width = ui.nodeWidth,height = ui.nodeHeight) {
		this.x = x ;
		this.y = y ;
		this.width = width ;
		this.height = height ;
	}
}

export const STATUS_PLAY_NOT_PLAYED = 0;
export const STATUS_PLAY_PLAYING = 1;
export const STATUS_PLAY_PLAYED = 2;

export class AudioParam_ extends NodeViewData {
	constructor(audioNode_,name, param) {
		super(0,0,ui.pointSize,ui.pointSize);
		this.id = counter++;
		this.name = name;
		this.audioParam = param;
		this.audioNode_ = audioNode_;
	}
}

export class AudioNode_ extends NodeViewData {
	constructor(audioNode) {
		super();
		this.id = counter++;
		this.audioNode = audioNode;
		this.name = audioNode.constructor.toString().match(/function\s(.*)\(/)[1];
		this.audioParams = [];
		this.params = [];
		let cy = 1;
		this.removable = true;
		for (var i in audioNode) {
			if (typeof audioNode[i] === 'function') {
				this[i] = audioNode[i].bind(audioNode);
			} else {
				if (typeof audioNode[i] === 'object') {
					if (audioNode[i] instanceof AudioParam) {
						this[i] = new AudioParam_(this,i, audioNode[i]);
						this.audioParams.push(this[i]);
						this.params.push(((p)=>{
							return {
								name:i,
								'get':() => p.audioParam.value,
								'set':(v) =>{p.audioParam.value = v;},
								param:p,
								node:this
							}
						})(this[i]));
						this[i].y = (20 * cy++);
					} else {
						this[i] = audioNode[i];
					}
				} else {
					var desc = Object.getOwnPropertyDescriptor(AudioNode.prototype, i);	
					if(!desc){
						desc = Object.getOwnPropertyDescriptor(this.audioNode.__proto__, i);	
					}
					var props = {};

					if(desc.get){
						props.get = ((i) => this.audioNode[i]).bind(null, i);
					} 
					
					if(desc.set){
						props.set = ((i, v) => { this.audioNode[i] = v; }).bind(null, i);
					}
					
					props.enumerable = desc.enumerable;
					props.configurable = desc.configurable;
					
					Object.defineProperty(this, i,props);
					
					props.name = i;
					props.node = this;
	
					this.params.push(props);
				}
			}
		}

		this.inputStartY = cy * 20;
		var inputHeight = (cy + this.numberOfInputs) * 20 ;
		var outputHeight = this.numberOfOutputs * 20 + 20 ;
		this.outputStartY = 20;
		this.height = Math.max(this.height,inputHeight,outputHeight);
		this.temp = {};
		this.statusPlay = STATUS_PLAY_NOT_PLAYED;// not played.
		this.panel = null;
	}
	
	// 1つだけだとノードの削除で2つの場合はコネクションの削除
	static remove(node) {
			if(!this.removable)
			{
				throw new Error('削除できないノードです。');
			}
			// ノードの削除
			for (var i = 0; i < AudioNode_.audioNodes.length; ++i) {
				if (AudioNode_.audioNodes[i] === node) {
					AudioNode_.audioNodes.splice(i--, 1);
				}
			}

			for (var i = 0; i < AudioNode_.audioConnections.length; ++i) {
				let n = AudioNode_.audioConnections[i];
				let disconnected = false;
				if (n.from.node === node) {
					if(n.to.param){
						// toパラメータあり
						if(n.to.param instanceof AudioParam_){
							// AUdioParam
							if(n.from.param){
								// fromパラメータあり
								n.from.node.disconnect(n.to.param.audioParam,n.from.param);
								disconnected = true;
							} else {
								// fromパラメータなし
								n.from.node.disconnect(n.to.param.audioParam);
								disconnected = true;
							}
						} else {
							// n.to.paramが数字
							if(n.from.param){
								// fromパラメータあり
								n.from.node.disconnect(n.to.node.audioNode,n.from.param,n.to.param);
								disconnected = true;
							} else {
								// fromパラメータなし
								n.from.node.disconnect(n.to.node.audioNode,0,n.to.param);
								disconnected = true;
							}
						}
					} else {
						// to パラメータなし
						if(n.from.param){
							// fromパラメータあり
							n.from.node.disconnect(n.to.node.audioNode,n.from.param);
							disconnected = true;
						} else {
							// fromパラメータなし
							n.from.node.disconnect(n.to.node.audioNode);
							disconnected = true;
						}
					}
				}

				if(n.to.node === node){
					if(n.from.param){
						// from パラメータあり
						if(n.to.param){
							// to パラメータあり
							if(n.to.param instanceof AudioParam_){
								// to パラメータがAudioParam_
								n.from.node.disconnect(n.to.param.audioParam,n.from.param);
								disconnected = true;							
							} else {
								// to パラメータが数字
								n.from.node.disconnect(n.to.node.audioNode,n.from.param,n.to.param);
								disconnected = true;
							}
						} else {
							// to パラメータなし
							n.from.node.disconnect(n.to.node.audioNode,n.from.param);
							disconnected = true;
						}
					} else {
						// from パラメータなし
						if(n.to.param){
							// to パラメータあり
							if(n.to.param instanceof AudioParam_){
								// to パラメータがAudioParam_
								n.from.node.disconnect(n.to.param.audioParam);
								disconnected = true;							
							} else {
								// to パラメータが数字
								n.from.node.disconnect(n.to.node.audioNode,0,n.to.param);
								disconnected = true;
							}
						} else {
							// to パラメータなし
							n.from.node.disconnect(n.to.node.audioNode);
							disconnected = true;
						}
					}
					
				}
				if(disconnected){
					AudioNode_.audioConnections.splice(i--,1);
				}
			}
	}
	
	static disconnect(from_,to_) {
			if(from_ instanceof AudioNode_){
				from_ = {node:from_};
			}

			if(to_ instanceof AudioNode_){
				to_ = {node:to_};
			}

			if(to_ instanceof AudioParam_){
				to_ = {node:to_.audioNode_,param:to_}
			}
			
			var con = {'from':from_,'to':to_};
			
			// コネクションの削除
			for (var i = 0; i < AudioNode_.audioConnections.length; ++i) {
				let n = AudioNode_.audioConnections[i];
				if(con.from === n.from && con.to === n.to){
					AudioNode_.audioConnections.splice(i--,1);
					if(con.from.param){
						// fromパラメータあり
						if(con.to.param){
							// to パラメータあり
							if(con.to.param instanceof AudioParam_){
								// to AudioParam_
								con.from.node.disconnect(con.to.param.audioParam,con.from.param);
							} else {
								// to 数字
								con.from.node.disconnect(con.to.node.audioNode,con.from.param,con.to.param);
							}
						} else {
							// to パラメータなし
							con.from.node.disconnect(con.to.node.audioNode,con.from.param);
						}
					} else {
						// fromパラメータなし
						if(con.to.param){
							// to パラメータあり
							if(con.to.param instanceof AudioParam_){
								// to AudioParam_
								con.from.node.disconnect(con.to.param.audioParam);
							} else {
								// to 数字
								con.from.node.disconnect(con.to.node.audioNode,0,con.to.param);
							}
						} else {
							// to パラメータなし
							con.from.node.disconnect(con.to.node.audioNode);
						}
					}
				}
			}

	}

	static create(audionode) {
		var obj = new AudioNode_(audionode);
		AudioNode_.audioNodes.push(obj);
		return obj;
	}

	static connect(from_, to_) {
		if(from_ instanceof AudioNode_ ){
			from_ = {node:from_,param:0};
		}
		
		if(to_ instanceof AudioNode_){
			to_ = {node:to_,param:0};
		}
		
		if(to_ instanceof AudioParam_){
			to_ = {node:to_.audioNode_,param:to_};
		}
		// 存在チェック
		for (var i = 0, l = AudioNode_.audioConnections.length; i < l; ++i) {
			var c = AudioNode_.audioConnections[i];
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
		
		if (from_.param) {
			// fromパラメータあり
			if (to_.param) {
				// toパラメータあり
				if(to_.param instanceof AudioParam_){
					// AudioParamの場合
					from_.node.connect(to_.param.audioParam,from_.param);
				} else{
					// 数字の場合
					from_.node.connect(to_.node.audioNode, from_.param,to_.param);
				}
			} else {
				// toパラメータなし
				from_.node.connect(to_.node.audioNode,from_.param);
			}
		} else {
			// fromパラメータなし
			if (to_.param) {
				// toパラメータあり
				if(to_.param instanceof AudioParam_){
					// AudioParamの場合
					from_.node.connect(to_.param.audioParam);
				} else{
					// 数字の場合
					from_.node.connect(to_.node.audioNode,0,to_.param);
				}
			} else {
				// toパラメータなし
				from_.node.connect(to_.node.audioNode);
			}
			//throw new Error('Connection Error');
		}
		
		AudioNode_.audioConnections.push
		({
			'from': from_,
			'to': to_
		});
	}
}

AudioNode_.audioNodes = [];
AudioNode_.audioConnections = [];


