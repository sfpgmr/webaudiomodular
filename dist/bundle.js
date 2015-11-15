(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopExportWildcard(obj, defaults) { var newObj = defaults({}, obj); delete newObj['default']; return newObj; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

var _audioNodeView = require('./audioNodeView');

_defaults(exports, _interopExportWildcard(_audioNodeView, _defaults));

var _eg = require('./eg');

_defaults(exports, _interopExportWildcard(_eg, _defaults));

var _sequencerJs = require('./sequencer.js');

_defaults(exports, _interopExportWildcard(_sequencerJs, _defaults));

},{"./audioNodeView":2,"./eg":4,"./sequencer.js":7}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x7, _x8, _x9) { var _again = true; _function: while (_again) { var object = _x7, property = _x8, receiver = _x9; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x7 = parent; _x8 = property; _x9 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.defIsNotAPIObj = defIsNotAPIObj;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ui = require('./ui');

var ui = _interopRequireWildcard(_ui);

var counter = 0;
var ctx;
exports.ctx = ctx;

var NodeViewBase = function NodeViewBase() {
	var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	var width = arguments.length <= 2 || arguments[2] === undefined ? ui.nodeWidth : arguments[2];
	var height = arguments.length <= 3 || arguments[3] === undefined ? ui.nodeHeight : arguments[3];
	var name = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];

	_classCallCheck(this, NodeViewBase);

	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.name = name;
};

exports.NodeViewBase = NodeViewBase;
var STATUS_PLAY_NOT_PLAYED = 0;
exports.STATUS_PLAY_NOT_PLAYED = STATUS_PLAY_NOT_PLAYED;
var STATUS_PLAY_PLAYING = 1;
exports.STATUS_PLAY_PLAYING = STATUS_PLAY_PLAYING;
var STATUS_PLAY_PLAYED = 2;

exports.STATUS_PLAY_PLAYED = STATUS_PLAY_PLAYED;

function defIsNotAPIObj(this_, v) {
	Object.defineProperty(this_, 'isNotAPIObj', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: v
	});
}

var AudioParamView = (function (_NodeViewBase) {
	_inherits(AudioParamView, _NodeViewBase);

	function AudioParamView(AudioNodeView, name, param) {
		_classCallCheck(this, AudioParamView);

		_get(Object.getPrototypeOf(AudioParamView.prototype), 'constructor', this).call(this, 0, 0, ui.pointSize, ui.pointSize, name);
		this.id = counter++;
		this.audioParam = param;
		this.AudioNodeView = AudioNodeView;
	}

	return AudioParamView;
})(NodeViewBase);

exports.AudioParamView = AudioParamView;

var ParamView = (function (_NodeViewBase2) {
	_inherits(ParamView, _NodeViewBase2);

	function ParamView(AudioNodeView, name, isoutput) {
		_classCallCheck(this, ParamView);

		_get(Object.getPrototypeOf(ParamView.prototype), 'constructor', this).call(this, 0, 0, ui.pointSize, ui.pointSize, name);
		this.id = counter++;
		this.AudioNodeView = AudioNodeView;
		this.isOutput = isoutput || false;
	}

	return ParamView;
})(NodeViewBase);

exports.ParamView = ParamView;

var AudioNodeView = (function (_NodeViewBase3) {
	_inherits(AudioNodeView, _NodeViewBase3);

	function AudioNodeView(audioNode, editor) {
		var _this = this;

		_classCallCheck(this, AudioNodeView);

		// audioNode はベースとなるノード
		_get(Object.getPrototypeOf(AudioNodeView.prototype), 'constructor', this).call(this);
		this.id = counter++;
		this.audioNode = audioNode;
		this.name = audioNode.constructor.toString().match(/function\s(.*)\(/)[1];
		this.inputParams = [];
		this.outputParams = [];
		this.params = [];
		var inputCy = 1,
		    outputCy = 1;

		this.removable = true;

		// プロパティ・メソッドの複製
		for (var i in audioNode) {
			if (typeof audioNode[i] === 'function') {
				//				this[i] = audioNode[i].bind(audioNode);
			} else {
					if (typeof audioNode[i] === 'object') {
						if (audioNode[i] instanceof AudioParam) {
							this[i] = new AudioParamView(this, i, audioNode[i]);
							this.inputParams.push(this[i]);
							this.params.push((function (p) {
								return {
									name: i,
									'get': function get() {
										return p.audioParam.value;
									},
									'set': function set(v) {
										p.audioParam.value = v;
									},
									param: p,
									node: _this
								};
							})(this[i]));
							this[i].y = 20 * inputCy++;
						} else if (audioNode[i] instanceof ParamView) {
							audioNode[i].AudioNodeView = this;
							this[i] = audioNode[i];
							if (this[i].isOutput) {
								this[i].y = 20 * outputCy++;
								this[i].x = this.width;
								this.outputParams.push(this[i]);
							} else {
								this[i].y = 20 * inputCy++;
								this.inputParams.push(this[i]);
							}
						} else {
							this[i] = audioNode[i];
						}
					} else {
						var desc = Object.getOwnPropertyDescriptor(AudioNode.prototype, i);
						if (!desc) {
							desc = Object.getOwnPropertyDescriptor(this.audioNode.__proto__, i);
						}
						if (!desc) {
							desc = Object.getOwnPropertyDescriptor(this.audioNode, i);
						}
						var props = {};

						//					if(desc.get){
						props.get = (function (i) {
							return _this.audioNode[i];
						}).bind(null, i);
						//					}

						if (desc.writable || desc.set) {
							props.set = (function (i, v) {
								_this.audioNode[i] = v;
							}).bind(null, i);
						}

						props.enumerable = desc.enumerable;
						props.configurable = desc.configurable;
						//props.writable = false;
						//props.writable = desc.writable;

						Object.defineProperty(this, i, props);

						props.name = i;
						props.node = this;

						if (desc.enumerable && !i.match(/(.*_$)|(name)|(^numberOf.*$)/i) && typeof audioNode[i] !== 'Array') {
							this.params.push(props);
						}
					}
				}
		}

		this.inputStartY = inputCy * 20;
		var inputHeight = (inputCy + this.numberOfInputs) * 20;
		var outputHeight = (outputCy + this.numberOfOutputs) * 20;
		this.outputStartY = outputCy * 20;
		this.height = Math.max(this.height, inputHeight, outputHeight);
		this.temp = {};
		this.statusPlay = STATUS_PLAY_NOT_PLAYED; // not played.
		this.panel = null;
		this.editor = editor.bind(this, this);
	}

	// ノードの削除

	_createClass(AudioNodeView, null, [{
		key: 'remove',
		value: function remove(node) {
			if (!node.removable) {
				throw new Error('削除できないノードです。');
			}
			// ノードの削除
			for (var i = 0; i < AudioNodeView.audioNodes.length; ++i) {
				if (AudioNodeView.audioNodes[i] === node) {
					if (node.audioNode.dispose) {
						node.audioNode.dispose();
					}
					AudioNodeView.audioNodes.splice(i--, 1);
				}
			}

			for (var i = 0; i < AudioNodeView.audioConnections.length; ++i) {
				var n = AudioNodeView.audioConnections[i];
				if (n.from.node === node || n.to.node === node) {
					AudioNodeView.disconnect_(n);
					AudioNodeView.audioConnections.splice(i--, 1);
				}
			}
		}

		//
	}, {
		key: 'disconnect_',
		value: function disconnect_(con) {
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
	}, {
		key: 'disconnect',
		value: function disconnect(from_, to_) {
			if (from_ instanceof AudioNodeView) {
				from_ = { node: from_ };
			}

			if (from_ instanceof ParamView) {
				from_ = { node: from_.AudioNodeView, param: from_ };
			}

			if (to_ instanceof AudioNodeView) {
				to_ = { node: to_ };
			}

			if (to_ instanceof AudioParamView) {
				to_ = { node: to_.AudioNodeView, param: to_ };
			}

			if (to_ instanceof ParamView) {
				to_ = { node: to_.AudioNodeView, param: to_ };
			}

			var con = { 'from': from_, 'to': to_ };

			// コネクションの削除
			for (var i = 0; i < AudioNodeView.audioConnections.length; ++i) {
				var n = AudioNodeView.audioConnections[i];
				if (con.from.node === n.from.node && con.from.param === n.from.param && con.to.node === n.to.node && con.to.param === n.to.param) {
					AudioNodeView.audioConnections.splice(i--, 1);
					AudioNodeView.disconnect_(con);
				}
			}
		}
	}, {
		key: 'create',
		value: function create(audionode) {
			var editor = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

			var obj = new AudioNodeView(audionode, editor);
			AudioNodeView.audioNodes.push(obj);
			return obj;
		}

		// ノード間の接続
	}, {
		key: 'connect',
		value: function connect(from_, to_) {
			if (from_ instanceof AudioNodeView) {
				from_ = { node: from_, param: 0 };
			}

			if (from_ instanceof ParamView) {
				from_ = { node: from_.AudioNodeView, param: from_ };
			}

			if (to_ instanceof AudioNodeView) {
				to_ = { node: to_, param: 0 };
			}

			if (to_ instanceof AudioParamView) {
				to_ = { node: to_.AudioNodeView, param: to_ };
			}

			if (to_ instanceof ParamView) {
				to_ = { node: to_.AudioNodeView, param: to_ };
			}
			// 存在チェック
			for (var i = 0, l = AudioNodeView.audioConnections.length; i < l; ++i) {
				var c = AudioNodeView.audioConnections[i];
				if (c.from.node === from_.node && c.from.param === from_.param && c.to.node === to_.node && c.to.param === to_.param) {
					return;
					//				throw (new Error('接続が重複しています。'));
				}
			}

			// 接続先がParamViewの場合は接続元はParamViewのみ
			if (to_.param instanceof ParamView && !(from_.param instanceof ParamView)) {
				return;
			}

			// ParamViewが接続可能なのはAudioParamからParamViewのみ
			if (from_.param instanceof ParamView) {
				if (!(to_.param instanceof ParamView || to_.param instanceof AudioParamView)) {
					return;
				}
			}

			if (from_.param) {
				// fromパラメータあり
				if (from_.param instanceof ParamView) {
					from_.node.audioNode.connect({ 'from': from_, 'to': to_ });
					//				from_.node.connectParam(from_.param,to_);
				} else if (to_.param) {
						// toパラメータあり
						if (to_.param instanceof AudioParamView) {
							// AudioParamの場合
							from_.node.audioNode.connect(to_.param.audioParam, from_.param);
						} else {
							// 数字の場合
							from_.node.audioNode.connect(to_.node.audioNode, from_.param, to_.param);
						}
					} else {
						// toパラメータなし
						from_.node.audioNode.connect(to_.node.audioNode, from_.param);
					}
			} else {
				// fromパラメータなし
				if (to_.param) {
					// toパラメータあり
					if (to_.param instanceof AudioParamView) {
						// AudioParamの場合
						from_.node.audioNode.connect(to_.param.audioParam);
					} else {
						// 数字の場合
						from_.node.audioNode.connect(to_.node.audioNode, 0, to_.param);
					}
				} else {
					// toパラメータなし
					from_.node.audioNode.connect(to_.node.audioNode);
				}
				//throw new Error('Connection Error');
			}

			AudioNodeView.audioConnections.push({
				'from': from_,
				'to': to_
			});
		}
	}]);

	return AudioNodeView;
})(NodeViewBase);

exports.AudioNodeView = AudioNodeView;

AudioNodeView.audioNodes = [];
AudioNodeView.audioConnections = [];

},{"./ui":8}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.initUI = initUI;
exports.draw = draw;
exports.createAudioNodeView = createAudioNodeView;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _uiJs = require('./ui.js');

var ui = _interopRequireWildcard(_uiJs);

var _sequenceEditor = require('./sequenceEditor');

var svg;
exports.svg = svg;
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

function initUI() {
	// 出力ノードの作成（削除不可）
	var out = audio.AudioNodeView.create(audio.ctx.destination, showPanel);
	out.x = window.innerWidth / 2;
	out.y = window.innerHeight / 2;
	out.removable = false;

	// プレイヤー
	audio.Sequencer.added = function () {
		if (audio.Sequencer.sequencers.length == 1 && audio.Sequencer.sequencers.status === audio.SEQ_STATUS.STOPPED) {
			d3.select('#play').attr('disabled', null);
			d3.select('#stop').attr('disabled', 'disabled');
			d3.select('#pause').attr('disabled', 'disabled');
		}
	};

	audio.Sequencer.empty = function () {
		audio.Sequencer.stopSequences();
		d3.select('#play').attr('disabled', 'disabled');
		d3.select('#stop').attr('disabled', 'disabled');
		d3.select('#pause').attr('disabled', 'disabled');
	};

	d3.select('#play').on('click', function () {
		audio.Sequencer.startSequences(audio.ctx.currentTime);
		d3.select(this).attr('disabled', 'disabled');
		d3.select('#stop').attr('disabled', null);
		d3.select('#pause').attr('disabled', null);
	});

	d3.select('#pause').on('click', function () {
		audio.Sequencer.pauseSequences();
		d3.select(this).attr('disabled', 'disabled');
		d3.select('#stop').attr('disabled', null);
		d3.select('#play').attr('disabled', null);
	});

	d3.select('#stop').on('click', function () {
		audio.Sequencer.stopSequences();
		d3.select(this).attr('disabled', 'disabled');
		d3.select('#pause').attr('disabled', 'disabled');
		d3.select('#play').attr('disabled', null);
	});

	audio.Sequencer.stopped = function () {
		d3.select('#stop').attr('disabled', 'disabled');
		d3.select('#pause').attr('disabled', 'disabled');
		d3.select('#play').attr('disabled', null);
	};

	// AudioNodeドラッグ用
	drag = d3.behavior.drag().origin(function (d) {
		return d;
	}).on('dragstart', function (d) {
		if (d3.event.sourceEvent.ctrlKey || d3.event.sourceEvent.shiftKey) {
			this.dispatchEvent(new Event('mouseup'));
			return false;
		}
		d.temp.x = d.x;
		d.temp.y = d.y;
		d3.select(this.parentNode).append('rect').attr({ id: 'drag', width: d.width, height: d.height, x: 0, y: 0, 'class': 'audioNodeDrag' });
	}).on("drag", function (d) {
		if (d3.event.sourceEvent.ctrlKey || d3.event.sourceEvent.shiftKey) {
			return;
		}
		d.temp.x += d3.event.dx;
		d.temp.y += d3.event.dy;
		//d3.select(this).attr('transform', 'translate(' + (d.x - d.width / 2) + ',' + (d.y - d.height / 2) + ')');
		//draw();
		var dragCursol = d3.select(this.parentNode).select('rect#drag');
		var x = parseFloat(dragCursol.attr('x')) + d3.event.dx;
		var y = parseFloat(dragCursol.attr('y')) + d3.event.dy;
		dragCursol.attr({ x: x, y: y });
	}).on('dragend', function (d) {
		if (d3.event.sourceEvent.ctrlKey || d3.event.sourceEvent.shiftKey) {
			return;
		}
		var dragCursol = d3.select(this.parentNode).select('rect#drag');
		var x = parseFloat(dragCursol.attr('x'));
		var y = parseFloat(dragCursol.attr('y'));
		d.x = d.temp.x;
		d.y = d.temp.y;
		dragCursol.remove();
		draw();
	});

	// ノード間接続用 drag
	dragOut = d3.behavior.drag().origin(function (d) {
		return d;
	}).on('dragstart', function (d) {
		var x1 = undefined,
		    y1 = undefined;
		if (d.index) {
			if (d.index instanceof audio.ParamView) {
				x1 = d.node.x - d.node.width / 2 + d.index.x;
				y1 = d.node.y - d.node.height / 2 + d.index.y;
			} else {
				x1 = d.node.x + d.node.width / 2;
				y1 = d.node.y - d.node.height / 2 + d.node.outputStartY + d.index * 20;
			}
		} else {
			x1 = d.node.x + d.node.width / 2;
			y1 = d.node.y - d.node.height / 2 + d.node.outputStartY;
		}

		d.x1 = x1, d.y1 = y1;
		d.x2 = x1, d.y2 = y1;

		var pos = makePos(x1, y1, d.x2, d.y2);
		d.line = svg.append('g').datum(d).append('path').attr({ 'd': line(pos), 'class': 'line-drag' });
	}).on("drag", function (d) {
		d.x2 += d3.event.dx;
		d.y2 += d3.event.dy;
		d.line.attr('d', line(makePos(d.x1, d.y1, d.x2, d.y2)));
	}).on("dragend", function (d) {
		var targetX = d.x2;
		var targetY = d.y2;
		// inputもしくはparamに到達しているか
		// input		
		var connected = false;
		var inputs = d3.selectAll('.input')[0];
		for (var i = 0, l = inputs.length; i < l; ++i) {
			var elm = inputs[i];
			var bbox = elm.getBBox();
			var node = elm.__data__.node;
			var left = node.x - node.width / 2 + bbox.x,
			    _top = node.y - node.height / 2 + bbox.y,
			    right = node.x - node.width / 2 + bbox.x + bbox.width,
			    bottom = node.y - node.height / 2 + bbox.y + bbox.height;
			if (targetX >= left && targetX <= right && targetY >= _top && targetY <= bottom) {
				//				console.log('hit',elm);
				var from_ = { node: d.node, param: d.index };
				var to_ = { node: node, param: elm.__data__.index };
				audio.AudioNodeView.connect(from_, to_);
				//AudioNodeView.connect();
				draw();
				connected = true;
				break;
			}
		}

		if (!connected) {
			// AudioParam
			var params = d3.selectAll('.param,.audio-param')[0];
			for (var i = 0, l = params.length; i < l; ++i) {
				var elm = params[i];
				var bbox = elm.getBBox();
				var param = elm.__data__;
				var node = param.node;
				var left = node.x - node.width / 2 + bbox.x;
				var top_ = node.y - node.height / 2 + bbox.y;
				var right = node.x - node.width / 2 + bbox.x + bbox.width;
				var bottom = node.y - node.height / 2 + bbox.y + bbox.height;
				if (targetX >= left && targetX <= right && targetY >= top_ && targetY <= bottom) {
					console.log('hit', elm);
					audio.AudioNodeView.connect({ node: d.node, param: d.index }, { node: node, param: param.index });
					draw();
					break;
				}
			}
		}
		// lineプレビューの削除
		d.line.remove();
		delete d.line;
	});

	d3.select('#panel-close').on('click', function () {
		d3.select('#prop-panel').style('visibility', 'hidden');d3.event.returnValue = false;d3.event.preventDefault();
	});

	// node間接続line描画関数
	line = d3.svg.line().x(function (d) {
		return d.x;
	}).y(function (d) {
		return d.y;
	}).interpolate('basis');

	// DOMにsvgエレメントを挿入	
	exports.svg = svg = d3.select('#content').append('svg').attr({ 'width': window.innerWidth, 'height': window.innerHeight });

	// ノードが入るグループ
	nodeGroup = svg.append('g');
	// ラインが入るグループ
	lineGroup = svg.append('g');

	// body属性に挿入
	audioNodeCreators = [{ name: 'Gain', create: audio.ctx.createGain.bind(audio.ctx) }, { name: 'Delay', create: audio.ctx.createDelay.bind(audio.ctx) }, { name: 'AudioBufferSource', create: audio.ctx.createBufferSource.bind(audio.ctx) }, { name: 'MediaElementAudioSource', create: audio.ctx.createMediaElementSource.bind(audio.ctx) }, { name: 'Panner', create: audio.ctx.createPanner.bind(audio.ctx) }, { name: 'Convolver', create: audio.ctx.createConvolver.bind(audio.ctx) }, { name: 'Analyser', create: audio.ctx.createAnalyser.bind(audio.ctx) }, { name: 'ChannelSplitter', create: audio.ctx.createChannelSplitter.bind(audio.ctx) }, { name: 'ChannelMerger', create: audio.ctx.createChannelMerger.bind(audio.ctx) }, { name: 'DynamicsCompressor', create: audio.ctx.createDynamicsCompressor.bind(audio.ctx) }, { name: 'BiquadFilter', create: audio.ctx.createBiquadFilter.bind(audio.ctx) }, { name: 'Oscillator', create: audio.ctx.createOscillator.bind(audio.ctx) }, { name: 'MediaStreamAudioSource', create: audio.ctx.createMediaStreamSource.bind(audio.ctx) }, { name: 'WaveShaper', create: audio.ctx.createWaveShaper.bind(audio.ctx) }, { name: 'EG', create: function create() {
			return new audio.EG();
		} }, { name: 'Sequencer', create: function create() {
			return new audio.Sequencer();
		}, editor: _sequenceEditor.showSequenceEditor }];

	if (audio.ctx.createMediaStreamDestination) {
		audioNodeCreators.push({ name: 'MediaStreamAudioDestination',
			create: audio.ctx.createMediaStreamDestination.bind(audio.ctx)
		});
	}

	d3.select('#content').datum({}).on('contextmenu', function () {
		showAudioNodePanel(this);
	});
}

// 描画

function draw() {
	// AudioNodeの描画
	var gd = nodeGroup.selectAll('g').data(audio.AudioNodeView.audioNodes, function (d) {
		return d.id;
	});

	// 矩形の更新
	gd.select('rect').attr({ 'width': function width(d) {
			return d.width;
		}, 'height': function height(d) {
			return d.height;
		} });

	// AudioNode矩形グループ
	var g = gd.enter().append('g');
	// AudioNode矩形グループの座標位置セット
	gd.attr('transform', function (d) {
		return 'translate(' + (d.x - d.width / 2) + ',' + (d.y - d.height / 2) + ')';
	});

	// AudioNode矩形
	g.append('rect').call(drag).attr({ 'width': function width(d) {
			return d.width;
		}, 'height': function height(d) {
			return d.height;
		}, 'class': 'audioNode' }).classed('play', function (d) {
		return d.statusPlay === audio.STATUS_PLAY_PLAYING;
	}).on('contextmenu', function (d) {
		// パラメータ編集画面の表示
		d.editor();
		d3.event.preventDefault();
		d3.event.returnValue = false;
	}).on('click.remove', function (d) {
		// ノードの削除
		if (d3.event.shiftKey) {
			d.panel && d.panel.isShow && d.panel.dispose();
			try {
				audio.AudioNodeView.remove(d);
				draw();
			} catch (e) {
				//				dialog.text(e.message).node().show(window.innerWidth/2,window.innerHeight/2);
			}
		}
		d3.event.returnValue = false;
		d3.event.preventDefault();
	}).filter(function (d) {
		// 音源のみにフィルタ
		return d.audioNode instanceof OscillatorNode || d.audioNode instanceof AudioBufferSourceNode || d.audioNode instanceof MediaElementAudioSourceNode;
	}).on('click', function (d) {
		// 再生・停止
		console.log(d3.event);
		d3.event.returnValue = false;
		d3.event.preventDefault();

		if (!d3.event.ctrlKey) {
			return;
		}
		var sel = d3.select(this);
		if (d.statusPlay === audio.STATUS_PLAY_PLAYING) {
			d.statusPlay = audio.STATUS_PLAY_PLAYED;
			sel.classed('play', false);
			d.audioNode.stop(0);
		} else if (d.statusPlay !== audio.STATUS_PLAY_PLAYED) {
			d.audioNode.start(0);
			d.statusPlay = audio.STATUS_PLAY_PLAYING;
			sel.classed('play', true);
		} else {
			alert('一度停止すると再生できません。');
		}
	}).call(tooltip('Ctrl + Click で再生・停止'));
	;

	// AudioNodeのラベル
	g.append('text').attr({ x: 0, y: -10, 'class': 'label' }).text(function (d) {
		return d.name;
	});

	// 入力AudioParamの表示	
	gd.each(function (d) {
		var sel = d3.select(this);
		var gp = sel.append('g');
		var gpd = gp.selectAll('g').data(d.inputParams.map(function (d) {
			return { node: d.AudioNodeView, index: d };
		}), function (d) {
			return d.index.id;
		});

		var gpdg = gpd.enter().append('g');

		gpdg.append('circle').attr({ 'r': function r(d) {
				return d.index.width / 2;
			},
			cx: 0, cy: function cy(d, i) {
				return d.index.y;
			},
			'class': function _class(d) {
				if (d.index instanceof audio.AudioParamView) {
					return 'audio-param';
				}
				return 'param';
			} });

		gpdg.append('text').attr({ x: function x(d) {
				return d.index.x + d.index.width / 2 + 5;
			}, y: function y(d) {
				return d.index.y;
			}, 'class': 'label' }).text(function (d) {
			return d.index.name;
		});

		gpd.exit().remove();
	});

	// 出力Paramの表示	
	gd.each(function (d) {
		var sel = d3.select(this);
		var gp = sel.append('g');

		var gpd = gp.selectAll('g').data(d.outputParams.map(function (d) {
			return { node: d.AudioNodeView, index: d };
		}), function (d) {
			return d.index.id;
		});

		var gpdg = gpd.enter().append('g');

		gpdg.append('circle').attr({ 'r': function r(d) {
				return d.index.width / 2;
			},
			cx: d.width, cy: function cy(d, i) {
				return d.index.y;
			},
			'class': 'param' }).call(dragOut);

		gpdg.append('text').attr({ x: function x(d) {
				return d.index.x + d.index.width / 2 + 5;
			}, y: function y(d) {
				return d.index.y;
			}, 'class': 'label' }).text(function (d) {
			return d.index.name;
		});

		gpd.exit().remove();
	});

	// 出力表示
	gd.filter(function (d) {
		return d.numberOfOutputs > 0;
	}).each(function (d) {
		var sel = d3.select(this).append('g');
		if (!d.temp.outs || d.temp.outs && d.temp.outs.length < d.numberOfOutputs) {
			d.temp.outs = [];
			for (var i = 0; i < d.numberOfOutputs; ++i) {
				d.temp.outs.push({ node: d, index: i });
			}
		}
		var sel1 = sel.selectAll('g');
		var seld = sel1.data(d.temp.outs);

		seld.enter().append('g').append('rect').attr({ x: d.width - ui.pointSize / 2, y: function y(d1) {
				return d.outputStartY + d1.index * 20 - ui.pointSize / 2;
			}, width: ui.pointSize, height: ui.pointSize, 'class': 'output' }).call(dragOut);
		seld.exit().remove();
	});

	// 入力表示
	gd.filter(function (d) {
		return d.numberOfInputs > 0;
	}).each(function (d) {
		var sel = d3.select(this).append('g');
		if (!d.temp.ins || d.temp.ins && d.temp.ins.length < d.numberOfInputs) {
			d.temp.ins = [];
			for (var i = 0; i < d.numberOfInputs; ++i) {
				d.temp.ins.push({ node: d, index: i });
			}
		}
		var sel1 = sel.selectAll('g');
		var seld = sel1.data(d.temp.ins);

		seld.enter().append('g').append('rect').attr({ x: -ui.pointSize / 2, y: function y(d1) {
				return d.inputStartY + d1.index * 20 - ui.pointSize / 2;
			}, width: ui.pointSize, height: ui.pointSize, 'class': 'input' }).on('mouseenter', function (d) {
			mouseOverNode = { node: d.audioNode_, param: d };
		}).on('mouseleave', function (d) {
			if (mouseOverNode.node) {
				if (mouseOverNode.node === d.audioNode_ && mouseOverNode.param === d) {
					mouseOverNode = null;
				}
			}
		});
		seld.exit().remove();
	});

	// 不要なノードの削除
	gd.exit().remove();

	// line 描画
	var ld = lineGroup.selectAll('path').data(audio.AudioNodeView.audioConnections);

	ld.enter().append('path');

	ld.each(function (d) {
		var path = d3.select(this);
		var x1, y1, x2, y2;

		// x1,y1
		if (d.from.param) {
			if (d.from.param instanceof audio.ParamView) {
				x1 = d.from.node.x - d.from.node.width / 2 + d.from.param.x;
				y1 = d.from.node.y - d.from.node.height / 2 + d.from.param.y;
			} else {
				x1 = d.from.node.x + d.from.node.width / 2;
				y1 = d.from.node.y - d.from.node.height / 2 + d.from.node.outputStartY + d.from.param * 20;
			}
		} else {
			x1 = d.from.node.x + d.from.node.width / 2;
			y1 = d.from.node.y - d.from.node.height / 2 + d.from.node.outputStartY;
		}

		x2 = d.to.node.x - d.to.node.width / 2;
		y2 = d.to.node.y - d.to.node.height / 2;

		if (d.to.param) {
			if (d.to.param instanceof audio.AudioParamView || d.to.param instanceof audio.ParamView) {
				x2 += d.to.param.x;
				y2 += d.to.param.y;
			} else {
				y2 += d.to.node.inputStartY + d.to.param * 20;
			}
		} else {
			y2 += d.to.node.inputStartY;
		}

		var pos = makePos(x1, y1, x2, y2);

		path.attr({ 'd': line(pos), 'class': 'line' });
		path.on('click', function (d) {
			if (d3.event.shiftKey) {
				audio.AudioNodeView.disconnect(d.from, d.to);
				d3.event.returnValue = false;
				draw();
			}
		}).call(tooltip('Shift + clickで削除'));
	});
	ld.exit().remove();
}

// 簡易tooltip表示
function tooltip(mes) {
	return function (d) {
		this.on('mouseenter', function () {
			svg.append('text').attr({ 'class': 'tip', x: d3.event.x + 20, y: d3.event.y - 20 }).text(mes);
		}).on('mouseleave', function () {
			svg.selectAll('.tip').remove();
		});
	};
}

// 接続線の座標生成
function makePos(x1, y1, x2, y2) {
	return [{ x: x1, y: y1 }, { x: x1 + (x2 - x1) / 4, y: y1 }, { x: x1 + (x2 - x1) / 2, y: y1 + (y2 - y1) / 2 }, { x: x1 + (x2 - x1) * 3 / 4, y: y2 }, { x: x2, y: y2 }];
}

// プロパティパネルの表示
function showPanel(d) {

	d3.event.returnValue = false;
	d3.event.cancelBubble = true;
	d3.event.preventDefault();

	if (d.panel && d.panel.isShow) return;

	d.panel = new ui.Panel();
	d.panel.x = d.x;
	d.panel.y = d.y;
	d.panel.header.text(d.name);

	var table = d.panel.article.append('table');
	var tbody = table.append('tbody').selectAll('tr').data(d.params);
	var tr = tbody.enter().append('tr');
	tr.append('td').text(function (d) {
		return d.name;
	});
	tr.append('td').append('input').attr({ type: "text", value: function value(d) {
			return d.get();
		}, readonly: function readonly(d) {
			return d.set ? null : 'readonly';
		} }).on('change', function (d) {
		var value = this.value;
		var vn = parseFloat(value);
		if (isNaN(vn)) {
			d.set(value);
		} else {
			d.set(vn);
		}
	});
	d.panel.show();
}

// ノード挿入パネルの表示
function showAudioNodePanel(d) {
	d3.event.returnValue = false;
	d3.event.preventDefault();

	if (d.panel) {
		if (d.panel.isShow) return;
	}

	d.panel = new ui.Panel();
	d.panel.x = d3.event.offsetX;
	d.panel.y = d3.event.offsetY;
	d.panel.header.text('AudioNodeの挿入');

	var table = d.panel.article.append('table');
	var tbody = table.append('tbody').selectAll('tr').data(audioNodeCreators);
	tbody.enter().append('tr').append('td').text(function (d) {
		return d.name;
	}).on('click', function (dt) {
		console.log('挿入', dt);

		var editor = dt.editor || showPanel;

		var node = audio.AudioNodeView.create(dt.create(), editor);
		node.x = d3.event.clientX;
		node.y = d3.event.clientY;
		draw();
		// d3.select('#prop-panel').style('visibility','hidden');
		// d.panel.dispose();
	});
	d.panel.show();
}

function createAudioNodeView(name) {
	var obj = audioNodeCreators.find(function (d) {
		if (d.name === name) return true;
	});
	if (obj) {
		return audio.AudioNodeView.create(obj.create(), obj.editor || showPanel);
	}
}

},{"./audio":1,"./sequenceEditor":6,"./ui.js":8}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _audioNodeView = require('./audioNodeView');

var audio = _interopRequireWildcard(_audioNodeView);

"use strict";

var EG = (function () {
	function EG() {
		_classCallCheck(this, EG);

		this.gate = new audio.ParamView(this, 'gate', false);
		this.output = new audio.ParamView(this, 'output', true);
		this.numberOfInputs = 0;
		this.numberOfOutputs = 0;
		this.attack = 0.001;
		this.decay = 0.05;
		this.release = 0.05;
		this.sustain = 0.2;
		this.gain = 1.0;
		this.name = 'EG';
		audio.defIsNotAPIObj(this, false);
		this.outputs = [];
	}

	// /// エンベロープジェネレーター
	// function EnvelopeGenerator(voice, attack, decay, sustain, release) {
	//   this.voice = voice;
	//   //this.keyon = false;
	//   this.attack = attack || 0.0005;
	//   this.decay = decay || 0.05;
	//   this.sustain = sustain || 0.5;
	//   this.release = release || 0.5;
	// };
	//
	// EnvelopeGenerator.prototype =
	// {
	//   keyon: function (t,vel) {
	//     this.v = vel || 1.0;
	//     var v = this.v;
	//     var t0 = t || this.voice.audioctx.currentTime;
	//     var t1 = t0 + this.attack * v;
	//     var gain = this.voice.gain.gain;
	//     gain.cancelScheduledValues(t0);
	//     gain.setValueAtTime(0, t0);
	//     gain.linearRampToValueAtTime(v, t1);
	//     gain.linearRampToValueAtTime(this.sustain * v, t0 + this.decay / v);
	//     //gain.setTargetAtTime(this.sustain * v, t1, t1 + this.decay / v);
	//   },
	//   keyoff: function (t) {
	//     var voice = this.voice;
	//     var gain = voice.gain.gain;
	//     var t0 = t || voice.audioctx.currentTime;
	//     gain.cancelScheduledValues(t0);
	//     //gain.setValueAtTime(0, t0 + this.release / this.v);
	//     //gain.setTargetAtTime(0, t0, t0 + this.release / this.v);
	//     gain.linearRampToValueAtTime(0, t0 + this.release / this.v);
	//   }
	// };

	_createClass(EG, [{
		key: 'connect',
		value: function connect(c) {
			if (!(c.to.param instanceof audio.AudioParamView)) {
				throw new Error('AudioParam以外とは接続できません。');
			}
			c.to.param.audioParam.value = 0;
			this.outputs.push(c.to);
		}
	}, {
		key: 'disconnect',
		value: function disconnect(c) {
			for (var i = 0; i < this.outputs.length; ++i) {
				if (c.to.node === this.outputs[i].node && c.to.param === this.outputs[i].param) {
					this.outputs.splice(i--, 1);
					break;
				}
			}
		}
	}, {
		key: 'process',
		value: function process(to, com, v, t) {
			var _this = this;

			if (v > 0) {
				// keyon
				// ADSまでもっていく
				this.outputs.forEach(function (d) {
					console.log('keyon', com, v, t);
					d.param.audioParam.setValueAtTime(0, t);
					d.param.audioParam.linearRampToValueAtTime(v * _this.gain, t + _this.attack);
					d.param.audioParam.linearRampToValueAtTime(_this.sustain * v * _this.gain, t + _this.attack + _this.decay);
				});
			} else {
				// keyoff
				// リリース
				this.outputs.forEach(function (d) {
					console.log('keyoff', com, v, t);
					d.param.audioParam.linearRampToValueAtTime(0, t + _this.release);
				});
			}
		}
	}, {
		key: 'stop',
		value: function stop() {
			this.outputs.forEach(function (d) {
				console.log('stop');
				d.param.audioParam.cancelScheduledValues(0);
				d.param.audioParam.setValueAtTime(0, 0);
			});
		}
	}, {
		key: 'pause',
		value: function pause() {}
	}]);

	return EG;
})();

exports.EG = EG;

},{"./audioNodeView":2}],5:[function(require,module,exports){
"use strict";

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _draw = require('./draw');

window.onload = function () {
	audio.ctx = new AudioContext();
	d3.select(window).on('resize', function () {
		if (_draw.svg) {
			_draw.svg.attr({
				width: window.innerWidth,
				height: window.innerHeight
			});
		}
	});

	(0, _draw.initUI)();
	(0, _draw.draw)();
};

},{"./audio":1,"./draw":3}],6:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.showSequenceEditor = showSequenceEditor;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _uiJs = require('./ui.js');

var ui = _interopRequireWildcard(_uiJs);

var SequenceEditor = function SequenceEditor() {
	_classCallCheck(this, SequenceEditor);
};

exports.SequenceEditor = SequenceEditor;

function showSequenceEditor(d) {
	d3.event.returnValue = false;
	d3.event.preventDefault();
	d3.event.cancelBubble = true;
	if (d.panel && d.panel.isShow) return;

	d.panel = new ui.Panel();
	d.panel.x = d.x;
	d.panel.y = d.y;
	d.panel.width = 1024;
	d.panel.height = 768;
	d.panel.header.text('Sequence Editor');
	var div = d.panel.article.append('div').classed('seq-editor', true);
	div.append('span').text('Time Base:');
	div.append('input').datum(d).attr({ 'type': 'text', 'size': '3' }).attr('value', function (d) {
		return d.audioNode.tpb;
	}).on('change', function (d) {
		d.audioNode.tpb = d3.select(this).attr('value');
	});

	div.append('span').text('Tempo:');
	div.append('input').datum(d).attr({ 'type': 'text', 'size': '3' }).attr('value', function (d) {
		return d.audioNode.bpm;
	}).on('change', function (d) {
		d.audioNode.bpm = d3.select(this).attr('value');
	});

	d.panel.show();
}

},{"./audio":1,"./ui.js":8}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x8, _x9, _x10) { var _again = true; _function: while (_again) { var object = _x8, property = _x9, receiver = _x10; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x8 = parent; _x9 = property; _x10 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.setValueAtTime = setValueAtTime;
exports.linearRampToValueAtTime = linearRampToValueAtTime;
exports.exponentialRampToValueAtTime = exponentialRampToValueAtTime;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

"use strict";

var EventBase = function EventBase(step) {
	_classCallCheck(this, EventBase);

	this.step = step;
};

exports.EventBase = EventBase;

function setValueAtTime(audioParam, value, time) {
	audioParam.setValueAtTime(value, time);
}

function linearRampToValueAtTime(audioParam, value, time) {
	audioParam.linearRampToValueAtTime(value, time);
}

function exponentialRampToValueAtTime(audioParam, value, time) {
	audioParam.linearRampToValueAtTime(value, time);
}

var Command = function Command() {
	var pitchCommand = arguments.length <= 0 || arguments[0] === undefined ? setValueAtTime : arguments[0];
	var velocityCommand = arguments.length <= 1 || arguments[1] === undefined ? setValueAtTime : arguments[1];

	_classCallCheck(this, Command);

	this.processPitch = pitchCommand.bind(this);
	this.processVelocity = velocityCommand.bind(this);
};

exports.Command = Command;

var NoteEvent = (function (_EventBase) {
	_inherits(NoteEvent, _EventBase);

	function NoteEvent() {
		var step = arguments.length <= 0 || arguments[0] === undefined ? 96 : arguments[0];
		var note = arguments.length <= 1 || arguments[1] === undefined ? 64 : arguments[1];
		var gate = arguments.length <= 2 || arguments[2] === undefined ? 48 : arguments[2];
		var vel = arguments.length <= 3 || arguments[3] === undefined ? 1.0 : arguments[3];
		var command = arguments.length <= 4 || arguments[4] === undefined ? new Command() : arguments[4];

		_classCallCheck(this, NoteEvent);

		_get(Object.getPrototypeOf(NoteEvent.prototype), 'constructor', this).call(this, step);
		this.note_ = note;
		this.calcPitch();
		this.gate = gate;
		this.vel = vel;
		this.command = command;
		this.command.event = this;
	}

	_createClass(NoteEvent, [{
		key: 'calcPitch',
		value: function calcPitch() {
			this.pitch = 440.0 / 32.0 * Math.pow(2.0, (this.note_ - 9) / 12);
		}
	}, {
		key: 'process',
		value: function process(time, track) {
			if (this.note) {
				for (var j = 0, je = track.pitches.length; j < je; ++j) {
					track.pitches[j].process(this.command, this.pitch, time);
				}

				for (var j = 0, je = track.velocities.length; j < je; ++j) {
					// keyon
					track.velocities[j].process(this.command, this.vel, time);
					// keyoff
					track.velocities[j].process(this.command, 0, time + this.gate * track.sequencer.stepTime_);
				}
			}
		}
	}, {
		key: 'note',
		get: function get() {
			return this.note_;
		},
		set: function set(v) {
			this.note_ = v;
			this.calcPitch();
		}
	}]);

	return NoteEvent;
})(EventBase);

exports.NoteEvent = NoteEvent;

var Track = function Track(sequencer) {
	_classCallCheck(this, Track);

	this.events = [];
	this.pointer = 0;
	this.step = 0;
	this.end = false;
	this.pitches = [];
	this.velocities = [];
	this.sequencer = sequencer;
};

exports.Track = Track;
var SEQ_STATUS = {
	STOPPED: 0,
	PLAYING: 1,
	PAUSED: 2
};

exports.SEQ_STATUS = SEQ_STATUS;
var NUM_OF_TRACKS = 4;

exports.NUM_OF_TRACKS = NUM_OF_TRACKS;

var Sequencer = (function () {
	function Sequencer() {
		_classCallCheck(this, Sequencer);

		this.bpm_ = 120.0; // tempo
		this.tpb_ = 96.0; // 四分音符の解像度
		this.beat = 4;
		this.bar = 4; //
		this.tracks = [];
		this.numberOfInputs = 0;
		this.numberOfOutputs = 0;
		this.name = 'Sequencer';
		for (var i = 0; i < NUM_OF_TRACKS; ++i) {
			this.tracks.push(new Track(this));
			this['trk' + i + 'g'] = new audio.ParamView(null, 'trk' + i + 'g', true);
			this['trk' + i + 'g'].track = this.tracks[i];
			this['trk' + i + 'g'].type = 'gate';

			this['trk' + i + 'p'] = new audio.ParamView(null, 'trk' + i + 'p', true);
			this['trk' + i + 'p'].track = this.tracks[i];
			this['trk' + i + 'p'].type = 'pitch';
		}
		this.startTime_ = 0;
		this.currentTime_ = 0;
		this.calcStepTime();
		this.repeat = false;
		this.status_ = SEQ_STATUS.STOPPED;
		Sequencer.sequencers.push(this);
		if (Sequencer.added) {
			Sequencer.added();
		}
	}

	_createClass(Sequencer, [{
		key: 'dispose',
		value: function dispose() {
			for (var i = 0; i < Sequencer.sequencers.length; ++i) {
				if (this === Sequencer.sequencers[i]) {
					Sequencer.sequencers.splice(i, 1);
					break;
				}
			}

			if (Sequencer.sequencers.length == 0) {
				if (Sequencer.empty) {
					Sequencer.empty();
				}
			}
		}
	}, {
		key: 'calcStepTime',
		value: function calcStepTime() {
			this.stepTime_ = 60.0 / (this.bpm * this.tpb);
		}
	}, {
		key: 'start',
		value: function start(time) {
			if (this.status_ == SEQ_STATUS.STOPPED || this.status_ == SEQ_STATUS.PAUSED) {
				this.currentTime_ = time || audio.ctx.currentTime();
				this.startTime_ = this.currentTime_;
				this.status_ = SEQ_STATUS.PLAYING;
			}
		}
	}, {
		key: 'stop',
		value: function stop() {
			if (this.status_ == SEQ_STATUS.PLAYING || this.status_ == SEQ_STATUS.PAUSED) {
				this.tracks.forEach(function (d) {
					d.pitches.forEach(function (p) {
						p.stop();
					});
					d.velocities.forEach(function (v) {
						v.stop();
					});
				});

				this.status_ = SEQ_STATUS.STOPPED;
				this.reset();
			}
		}
	}, {
		key: 'pause',
		value: function pause() {
			if (this.status_ == SEQ_STATUS.PLAYING) {
				this.status_ = SEQ_STATUS.PAUSED;
			}
		}
	}, {
		key: 'reset',
		value: function reset() {
			this.startTime_ = 0;
			this.currentTime_ = 0;
			this.tracks.forEach(function (track) {
				track.end = !track.events.length;
				track.step = 0;
				track.pointer = 0;
			});
			this.calcStepTime();
		}

		// シーケンサーの処理
	}, {
		key: 'process',
		value: function process(time) {
			this.currentTime_ = time || audio.ctx.currentTime();
			var currentStep = (this.currentTime_ - this.startTime_ + 0.1) / this.stepTime_;
			var endcount = 0;
			for (var i = 0, l = this.tracks.length; i < l; ++i) {
				var track = this.tracks[i];
				if (!track.end) {
					while (track.step <= currentStep && !track.end) {
						if (track.pointer >= track.events.length) {
							track.end = true;
							break;
						} else {
							var event = track.events[track.pointer++];
							var playTime = track.step * this.stepTime_ + this.startTime_;
							event.process(playTime, track);
							track.step += event.step;
							//					console.log(track.pointer,track.events.length,track.events[track.pointer],track.step,currentStep,this.currentTime_,playTime);
						}
					}
				} else {
						++endcount;
					}
			}
			if (endcount == this.tracks.length) {
				this.stop();
			}
		}

		// 接続
	}, {
		key: 'connect',
		value: function connect(c) {
			var track = c.from.param.track;
			if (c.from.param.type === 'pitch') {
				track.pitches.push(Sequencer.makeProcess(c));
			} else {
				track.velocities.push(Sequencer.makeProcess(c));
			}
		}

		// 削除
	}, {
		key: 'disconnect',
		value: function disconnect(c) {
			var track = c.from.param.track;
			for (var i = 0; i < track.pitches.length; ++i) {
				if (c.to.node === track.pitches[i].to.node && c.to.param === track.pitches[i].to.param) {
					track.pitches.splice(i--, 1);
					break;
				}
			}

			for (var i = 0; i < track.velocities.length; ++i) {
				if (c.to.node === track.velocities[i].to.node && c.to.param === track.velocities[i].to.param) {
					track.pitches.splice(i--, 1);
					break;
				}
			}
		}
	}, {
		key: 'tpb',
		get: function get() {
			return this.tpb_;
		},
		set: function set(v) {
			this.tpb_ = v;
			this.calcStepTime();
		}
	}, {
		key: 'bpm',
		get: function get() {
			return this.bpm_;
		},
		set: function set(v) {
			this.bpm_ = v;
			this.calcStepTime();
		}
	}], [{
		key: 'makeProcess',
		value: function makeProcess(c) {
			if (c.to.param instanceof audio.ParamView) {
				return {
					to: c.to,
					process: function process(com, v, t) {
						c.to.node.audioNode.process(c.to, com, v, t);
					},
					stop: function stop() {
						c.to.node.audioNode.stop(c.to);
					}
				};
			}
			var process;
			if (c.to.param.type === 'pitch') {
				process = function (com, v, t) {
					com.processPitch(c.to.param.audioParam, v, t);
				};
			} else {
				process = function (com, v, t) {
					com.processVelocity(c.to.param.audioParam, v, t);
				};
			}
			return {
				to: c.to,
				process: process,
				stop: function stop() {
					c.to.param.audioParam.cancelScheduledValues(0);
				}
			};
		}
	}, {
		key: 'exec',
		value: function exec() {
			if (Sequencer.sequencers.status == SEQ_STATUS.PLAYING) {
				window.requestAnimationFrame(Sequencer.exec);
				var endcount = 0;
				for (var i = 0, e = Sequencer.sequencers.length; i < e; ++i) {
					var seq = Sequencer.sequencers[i];
					if (seq.status_ == SEQ_STATUS.PLAYING) {
						seq.process(audio.ctx.currentTime);
					} else if (seq.status_ == SEQ_STATUS.STOPPED) {
						++endcount;
					}
				}
				if (endcount == Sequencer.sequencers.length) {
					Sequencer.stopSequences();
					if (Sequencer.stopped) {
						Sequencer.stopped();
					}
				}
			}
		}

		// シーケンス全体のスタート
	}, {
		key: 'startSequences',
		value: function startSequences(time) {
			if (Sequencer.sequencers.status == SEQ_STATUS.STOPPED || Sequencer.sequencers.status == SEQ_STATUS.PAUSED) {
				Sequencer.sequencers.forEach(function (d) {
					d.start(time);
				});
				Sequencer.sequencers.status = SEQ_STATUS.PLAYING;
				Sequencer.exec();
			}
		}

		// シーケンス全体の停止
	}, {
		key: 'stopSequences',
		value: function stopSequences() {
			if (Sequencer.sequencers.status == SEQ_STATUS.PLAYING || Sequencer.sequencers.status == SEQ_STATUS.PAUSED) {
				Sequencer.sequencers.forEach(function (d) {
					d.stop();
				});
				Sequencer.sequencers.status = SEQ_STATUS.STOPPED;
			}
		}

		// シーケンス全体のポーズ	
	}, {
		key: 'pauseSequences',
		value: function pauseSequences() {
			if (Sequencer.sequencers.status == SEQ_STATUS.PLAYING) {
				Sequencer.sequencers.forEach(function (d) {
					d.pause();
				});
				Sequencer.sequencers.status = SEQ_STATUS.PAUSED;
			}
		}
	}]);

	return Sequencer;
})();

exports.Sequencer = Sequencer;

Sequencer.sequencers = [];
Sequencer.sequencers.status = SEQ_STATUS.STOPPED;

},{"./audio":1}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _uuidCore = require('./uuid.core');

var _uuidCore2 = _interopRequireDefault(_uuidCore);

var nodeHeight = 50;
exports.nodeHeight = nodeHeight;
var nodeWidth = 100;
exports.nodeWidth = nodeWidth;
var pointSize = 16;

exports.pointSize = pointSize;
// panel window

var Panel = (function () {
	function Panel(sel, prop) {
		var _this = this;

		_classCallCheck(this, Panel);

		if (!prop || !prop.id) {
			prop = prop ? (prop.id = 'id-' + _uuidCore2['default'].generate(), prop) : { id: 'id-' + _uuidCore2['default'].generate() };
		}
		this.id = prop.id;
		sel = sel || d3.select('#content');
		this.selection = sel.append('div').attr(prop).attr('class', 'panel').datum(this);

		// パネル用Dragその他

		this.header = this.selection.append('header').call(this.drag);
		this.article = this.selection.append('article');
		this.footer = this.selection.append('footer');
		this.selection.append('div').classed('panel-close', true).on('click', function () {
			_this.dispose();
		});
	}

	_createClass(Panel, [{
		key: 'dispose',
		value: function dispose() {
			this.selection.remove();
			this.selection = null;
		}
	}, {
		key: 'show',
		value: function show() {
			this.selection.style('visibility', 'visible');
		}
	}, {
		key: 'hide',
		value: function hide() {
			this.selection.style('visibility', 'hidden');
		}
	}, {
		key: 'node',
		get: function get() {
			return this.selection.node();
		}
	}, {
		key: 'x',
		get: function get() {
			return parseFloat(this.selection.style('left'));
		},
		set: function set(v) {
			this.selection.style('left', v + 'px');
		}
	}, {
		key: 'y',
		get: function get() {
			return parseFloat(this.selection.style('top'));
		},
		set: function set(v) {
			this.selection.style('top', v + 'px');
		}
	}, {
		key: 'width',
		get: function get() {
			return parseFloat(this.selection.style('width'));
		},
		set: function set(v) {
			this.selection.style('width', v + 'px');
		}
	}, {
		key: 'height',
		get: function get() {
			return parseFloat(this.selection.style('height'));
		},
		set: function set(v) {
			this.selection.style('height', v + 'px');
		}
	}, {
		key: 'isShow',
		get: function get() {
			return this.selection && this.selection.style('visibility') === 'visible';
		}
	}]);

	return Panel;
})();

exports.Panel = Panel;

Panel.prototype.drag = d3.behavior.drag().on('dragstart', function (d) {
	console.log(d);
	var sel = d3.select('#' + d.id);

	d3.select('#content').append('div').attr({ id: 'panel-dummy-' + d.id,
		'class': 'panel panel-dummy' }).style({
		left: sel.style('left'),
		top: sel.style('top'),
		width: sel.style('width'),
		height: sel.style('height')
	});
}).on("drag", function (d) {
	var dummy = d3.select('#panel-dummy-' + d.id);

	var x = parseFloat(dummy.style('left')) + d3.event.dx;
	var y = parseFloat(dummy.style('top')) + d3.event.dy;

	dummy.style({ 'left': x + 'px', 'top': y + 'px' });
}).on('dragend', function (d) {
	var sel = d3.select('#' + d.id);
	var dummy = d3.select('#panel-dummy-' + d.id);
	sel.style({ 'left': dummy.style('left'), 'top': dummy.style('top') });
	dummy.remove();
});

},{"./uuid.core":9}],9:[function(require,module,exports){
/*
 Version: core-1.0
 The MIT License: Copyright (c) 2012 LiosK.
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = UUID;

function UUID() {}

UUID.generate = function () {
  var a = UUID._gri,
      b = UUID._ha;return b(a(32), 8) + "-" + b(a(16), 4) + "-" + b(16384 | a(12), 4) + "-" + b(32768 | a(14), 4) + "-" + b(a(48), 12);
};UUID._gri = function (a) {
  return 0 > a ? NaN : 30 >= a ? 0 | Math.random() * (1 << a) : 53 >= a ? (0 | 1073741824 * Math.random()) + 1073741824 * (0 | Math.random() * (1 << a - 30)) : NaN;
};UUID._ha = function (a, b) {
  for (var c = a.toString(16), d = b - c.length, e = "0"; 0 < d; d >>>= 1, e += e) d & 1 && (c = e + c);return c;
};
module.exports = exports["default"];

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJFOi9wai9naXN0cy93ZWJhdWRpb21vZHVsZXIvc3JjL2F1ZGlvLmpzIiwiRTovcGovZ2lzdHMvd2ViYXVkaW9tb2R1bGVyL3NyYy9hdWRpb05vZGVWaWV3LmpzIiwiRTovcGovZ2lzdHMvd2ViYXVkaW9tb2R1bGVyL3NyYy9kcmF3LmpzIiwiRTovcGovZ2lzdHMvd2ViYXVkaW9tb2R1bGVyL3NyYy9lZy5qcyIsIkU6L3BqL2dpc3RzL3dlYmF1ZGlvbW9kdWxlci9zcmMvc2NyaXB0LmpzIiwiRTovcGovZ2lzdHMvd2ViYXVkaW9tb2R1bGVyL3NyYy9zZXF1ZW5jZUVkaXRvci5qcyIsIkU6L3BqL2dpc3RzL3dlYmF1ZGlvbW9kdWxlci9zcmMvc2VxdWVuY2VyLmpzIiwiRTovcGovZ2lzdHMvd2ViYXVkaW9tb2R1bGVyL3NyYy91aS5qcyIsIkU6L3BqL2dpc3RzL3dlYmF1ZGlvbW9kdWxlci9zcmMvdXVpZC5jb3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs2QkNBYyxpQkFBaUI7Ozs7a0JBQ2pCLE1BQU07Ozs7MkJBQ04sZ0JBQWdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkNGVixNQUFNOztJQUFkLEVBQUU7O0FBRWQsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ1QsSUFBSSxHQUFHLENBQUM7OztJQUNGLFlBQVksR0FDYixTQURDLFlBQVksR0FDd0Q7S0FBcEUsQ0FBQyx5REFBRyxDQUFDO0tBQUUsQ0FBQyx5REFBRyxDQUFDO0tBQUMsS0FBSyx5REFBRyxFQUFFLENBQUMsU0FBUztLQUFDLE1BQU0seURBQUcsRUFBRSxDQUFDLFVBQVU7S0FBQyxJQUFJLHlEQUFHLEVBQUU7O3VCQURsRSxZQUFZOztBQUV2QixLQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRTtBQUNaLEtBQUksQ0FBQyxDQUFD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QyxFQUFFLFlBQUEsQ0FBQztBQUNWLE1BQUcsQ0FBQyxDQUFDLEtBQUssRUFBQztBQUNWLE9BQUcsQ0FBQyxDQUFDLEtBQUssWUFBWSxLQUFLLENBQUMsU0FBUyxFQUFDO0FBQ3JDLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDN0MsTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3QyxNQUFNO0FBQ04sTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNqQyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ3RFO0dBQ0QsTUFBTTtBQUNOLEtBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDakMsS0FBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztHQUN2RDs7QUFFRCxHQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNwQixHQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsTUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkMsR0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUN2QixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQ1IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNkLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUM7RUFDM0MsQ0FBQyxDQUNELEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDeEIsR0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUNwQixHQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQ3BCLEdBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDcEQsQ0FBQyxDQUNELEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDM0IsTUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNuQixNQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDOzs7QUFHbkIsTUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsT0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQztBQUN6QyxPQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsT0FBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3pCLE9BQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQzdCLE9BQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7T0FDMUMsSUFBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7T0FDdkMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSztPQUNyRCxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDMUQsT0FBRyxPQUFPLElBQUksSUFBSSxJQUFJLE9BQU8sSUFBSSxLQUFLLElBQUksT0FBTyxJQUFJLElBQUcsSUFBSSxPQUFPLElBQUksTUFBTSxFQUM3RTs7QUFFQyxRQUFJLEtBQUssR0FBRyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsS0FBSyxFQUFDLENBQUM7QUFDeEMsUUFBSSxHQUFHLEdBQUcsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBQyxDQUFDO0FBQy9DLFNBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxD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QkFBbUIsRUFBQyxDQUFDLENBQzdCLEtBQUssQ0FBQztBQUNOLE1BQUksRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUN0QixLQUFHLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDcEIsT0FBSyxFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ3hCLFFBQU0sRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztFQUMxQixDQUFDLENBQUM7Q0FDSCxDQUFDLENBQ0QsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTtBQUN4QixLQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRTlDLEtBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDdEQsS0FBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQzs7QUFFckQsTUFBSyxDQUFDLEtBQUssQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUcsSUFBSSxFQUFDLEtBQUssRUFBQyxDQUFDLEdBQUcsSUFBSSxFQUFDLENBQUMsQ0FBQztDQUM5QyxDQUFDLENBQ0QsRUFBRSxDQUFDLFNBQVMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUN4QixLQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsS0FBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlDLElBQUcsQ0FBQyxLQUFLLENBQ1IsRUFBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBQyxLQUFLLEVBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUNyRCxDQUFDO0FBQ0YsTUFBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQ2YsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7cUJDM0dvQixJQUFJOztBQUFiLFNBQVMsSUFBSSxHQUFFLEVBQUU7O0FBQUEsSUFBSSxDQUFDLFFBQVEsR0FBQyxZQUFVO0FBQUMsTUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUk7TUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQTtDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsRUFBRSxJQUFFLENBQUMsR0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFFLENBQUMsSUFBRSxDQUFDLENBQUEsQUFBQyxHQUFDLEVBQUUsSUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQSxHQUFFLFVBQVUsSUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFFLENBQUMsSUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFBLEFBQUMsQ0FBQSxBQUFDLEdBQUMsR0FBRyxDQUFBO0NBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLE9BQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsTUFBSSxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0ICogZnJvbSAnLi9hdWRpb05vZGVWaWV3JztcclxuZXhwb3J0ICogZnJvbSAnLi9lZyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vc2VxdWVuY2VyLmpzJzsiLCJpbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpJztcclxuXHJcbnZhciBjb3VudGVyID0gMDtcclxuZXhwb3J0IHZhciBjdHg7IFxyXG5leHBvcnQgY2xhc3MgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IDAsd2lkdGggPSB1aS5ub2RlV2lkdGgsaGVpZ2h0ID0gdWkubm9kZUhlaWdodCxuYW1lID0gJycpIHtcclxuXHRcdHRoaXMueCA9IHggO1xyXG5cdFx0dGhpcy55ID0geSA7XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGggO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQgO1xyXG5cdFx0dGhpcy5uYW1lID0gbmFtZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBTVEFUVVNfUExBWV9OT1RfUExBWUVEID0gMDtcclxuZXhwb3J0IGNvbnN0IFNUQVRVU19QTEFZX1BMQVlJTkcgPSAxO1xyXG5leHBvcnQgY29uc3QgU1RBVFVTX1BMQVlfUExBWUVEID0gMjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZJc05vdEFQSU9iaih0aGlzXyx2KXtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpc18sJ2lzTm90QVBJT2JqJyx7XHJcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxyXG5cdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0XHR3cml0YWJsZTpmYWxzZSxcclxuXHRcdFx0dmFsdWU6IHZcclxuXHRcdH0pO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQXVkaW9QYXJhbVZpZXcgZXh0ZW5kcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKEF1ZGlvTm9kZVZpZXcsbmFtZSwgcGFyYW0pIHtcclxuXHRcdHN1cGVyKDAsMCx1aS5wb2ludFNpemUsdWkucG9pbnRTaXplLG5hbWUpO1xyXG5cdFx0dGhpcy5pZCA9IGNvdW50ZXIrKztcclxuXHRcdHRoaXMuYXVkaW9QYXJhbSA9IHBhcmFtO1xyXG5cdFx0dGhpcy5BdWRpb05vZGVWaWV3ID0gQXVkaW9Ob2RlVmlldztcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQYXJhbVZpZXcgZXh0ZW5kcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKEF1ZGlvTm9kZVZpZXcsbmFtZSxpc291dHB1dCkge1xyXG5cdFx0c3VwZXIoMCwwLHVpLnBvaW50U2l6ZSx1aS5wb2ludFNpemUsbmFtZSk7XHJcblx0XHR0aGlzLmlkID0gY291bnRlcisrO1xyXG5cdFx0dGhpcy5BdWRpb05vZGVWaWV3ID0gQXVkaW9Ob2RlVmlldztcclxuXHRcdHRoaXMuaXNPdXRwdXQgPSBpc291dHB1dCB8fCBmYWxzZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBdWRpb05vZGVWaWV3IGV4dGVuZHMgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihhdWRpb05vZGUsZWRpdG9yKSB7IC8vIGF1ZGlvTm9kZSDjga/jg5njg7zjgrnjgajjgarjgovjg47jg7zjg4lcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmlkID0gY291bnRlcisrO1xyXG5cdFx0dGhpcy5hdWRpb05vZGUgPSBhdWRpb05vZGU7XHJcblx0XHR0aGlzLm5hbWUgPSBhdWRpb05vZGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvZnVuY3Rpb25cXHMoLiopXFwoLylbMV07XHJcblx0XHR0aGlzLmlucHV0UGFyYW1zID0gW107XHJcblx0XHR0aGlzLm91dHB1dFBhcmFtcyA9IFtdO1xyXG5cdFx0dGhpcy5wYXJhbXMgPSBbXTtcclxuXHRcdGxldCBpbnB1dEN5ID0gMSxvdXRwdXRDeSA9IDE7XHJcblx0XHRcclxuXHRcdHRoaXMucmVtb3ZhYmxlID0gdHJ1ZTtcclxuXHRcdFxyXG5cdFx0Ly8g44OX44Ot44OR44OG44Kj44O744Oh44K944OD44OJ44Gu6KSH6KO9XHJcblx0XHRmb3IgKHZhciBpIGluIGF1ZGlvTm9kZSkge1xyXG5cdFx0XHRpZiAodHlwZW9mIGF1ZGlvTm9kZVtpXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4vL1x0XHRcdFx0dGhpc1tpXSA9IGF1ZGlvTm9kZVtpXS5iaW5kKGF1ZGlvTm9kZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBhdWRpb05vZGVbaV0gPT09ICdvYmplY3QnKSB7XHJcblx0XHRcdFx0XHRpZiAoYXVkaW9Ob2RlW2ldIGluc3RhbmNlb2YgQXVkaW9QYXJhbSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldID0gbmV3IEF1ZGlvUGFyYW1WaWV3KHRoaXMsaSwgYXVkaW9Ob2RlW2ldKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5pbnB1dFBhcmFtcy5wdXNoKHRoaXNbaV0pO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBhcmFtcy5wdXNoKCgocCk9PntcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0bmFtZTppLFxyXG5cdFx0XHRcdFx0XHRcdFx0J2dldCc6KCkgPT4gcC5hdWRpb1BhcmFtLnZhbHVlLFxyXG5cdFx0XHRcdFx0XHRcdFx0J3NldCc6KHYpID0+e3AuYXVkaW9QYXJhbS52YWx1ZSA9IHY7fSxcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmFtOnAsXHJcblx0XHRcdFx0XHRcdFx0XHRub2RlOnRoaXNcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pKHRoaXNbaV0pKTtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXS55ID0gKDIwICogaW5wdXRDeSsrKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZihhdWRpb05vZGVbaV0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0XHRhdWRpb05vZGVbaV0uQXVkaW9Ob2RlVmlldyA9IHRoaXM7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV07XHJcblx0XHRcdFx0XHRcdGlmKHRoaXNbaV0uaXNPdXRwdXQpe1xyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0ueSA9ICgyMCAqIG91dHB1dEN5KyspO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0ueCA9IHRoaXMud2lkdGg7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5vdXRwdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnkgPSAoMjAgKiBpbnB1dEN5KyspO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuaW5wdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXSA9IGF1ZGlvTm9kZVtpXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEF1ZGlvTm9kZS5wcm90b3R5cGUsIGkpO1x0XHJcblx0XHRcdFx0XHRpZighZGVzYyl7XHJcblx0XHRcdFx0XHRcdGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRoaXMuYXVkaW9Ob2RlLl9fcHJvdG9fXywgaSk7XHRcclxuXHRcdFx0XHRcdH0gXHJcblx0XHRcdFx0XHRpZighZGVzYyl7XHJcblx0XHRcdFx0XHRcdGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRoaXMuYXVkaW9Ob2RlLGkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dmFyIHByb3BzID0ge307XHJcblxyXG4vL1x0XHRcdFx0XHRpZihkZXNjLmdldCl7XHJcblx0XHRcdFx0XHRcdFx0cHJvcHMuZ2V0ID0gKChpKSA9PiB0aGlzLmF1ZGlvTm9kZVtpXSkuYmluZChudWxsLCBpKTtcclxuLy9cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZihkZXNjLndyaXRhYmxlIHx8IGRlc2Muc2V0KXtcclxuXHRcdFx0XHRcdFx0cHJvcHMuc2V0ID0gKChpLCB2KSA9PiB7IHRoaXMuYXVkaW9Ob2RlW2ldID0gdjsgfSkuYmluZChudWxsLCBpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cHJvcHMuZW51bWVyYWJsZSA9IGRlc2MuZW51bWVyYWJsZTtcclxuXHRcdFx0XHRcdHByb3BzLmNvbmZpZ3VyYWJsZSA9IGRlc2MuY29uZmlndXJhYmxlO1xyXG5cdFx0XHRcdFx0Ly9wcm9wcy53cml0YWJsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0Ly9wcm9wcy53cml0YWJsZSA9IGRlc2Mud3JpdGFibGU7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpLHByb3BzKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cHJvcHMubmFtZSA9IGk7XHJcblx0XHRcdFx0XHRwcm9wcy5ub2RlID0gdGhpcztcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoZGVzYy5lbnVtZXJhYmxlICYmICFpLm1hdGNoKC8oLipfJCl8KG5hbWUpfChebnVtYmVyT2YuKiQpL2kpICYmICh0eXBlb2YgYXVkaW9Ob2RlW2ldKSAhPT0gJ0FycmF5Jyl7XHJcblx0XHRcdFx0XHRcdHRoaXMucGFyYW1zLnB1c2gocHJvcHMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuaW5wdXRTdGFydFkgPSBpbnB1dEN5ICogMjA7XHJcblx0XHR2YXIgaW5wdXRIZWlnaHQgPSAoaW5wdXRDeSArIHRoaXMubnVtYmVyT2ZJbnB1dHMpICogMjAgO1xyXG5cdFx0dmFyIG91dHB1dEhlaWdodCA9IChvdXRwdXRDeSArIHRoaXMubnVtYmVyT2ZPdXRwdXRzKSAqIDIwO1xyXG5cdFx0dGhpcy5vdXRwdXRTdGFydFkgPSBvdXRwdXRDeSAqIDIwO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBNYXRoLm1heCh0aGlzLmhlaWdodCxpbnB1dEhlaWdodCxvdXRwdXRIZWlnaHQpO1xyXG5cdFx0dGhpcy50ZW1wID0ge307XHJcblx0XHR0aGlzLnN0YXR1c1BsYXkgPSBTVEFUVVNfUExBWV9OT1RfUExBWUVEOy8vIG5vdCBwbGF5ZWQuXHJcblx0XHR0aGlzLnBhbmVsID0gbnVsbDtcclxuXHRcdHRoaXMuZWRpdG9yID0gZWRpdG9yLmJpbmQodGhpcyx0aGlzKTtcclxuXHR9XHJcblx0XHJcblx0Ly8g44OO44O844OJ44Gu5YmK6ZmkXHJcblx0c3RhdGljIHJlbW92ZShub2RlKSB7XHJcblx0XHRcdGlmKCFub2RlLnJlbW92YWJsZSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcign5YmK6Zmk44Gn44GN44Gq44GE44OO44O844OJ44Gn44GZ44CCJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly8g44OO44O844OJ44Gu5YmK6ZmkXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0aWYgKEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlc1tpXSA9PT0gbm9kZSkge1xyXG5cdFx0XHRcdFx0aWYobm9kZS5hdWRpb05vZGUuZGlzcG9zZSl7XHJcblx0XHRcdFx0XHRcdG5vZGUuYXVkaW9Ob2RlLmRpc3Bvc2UoKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5zcGxpY2UoaS0tLCAxKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0bGV0IG4gPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnNbaV07XHJcblx0XHRcdFx0aWYgKG4uZnJvbS5ub2RlID09PSBub2RlIHx8IG4udG8ubm9kZSA9PT0gbm9kZSkge1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0XyhuKTtcclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdH1cclxuXHJcbiAgLy8gXHJcblx0c3RhdGljIGRpc2Nvbm5lY3RfKGNvbikge1xyXG5cdFx0aWYgKGNvbi5mcm9tLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KSB7XHJcblx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uKTtcclxuXHRcdH0gZWxzZSBpZiAoY29uLnRvLnBhcmFtKSB7XHJcblx0XHRcdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdGlmIChjb24udG8ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldykge1xyXG5cdFx0XHRcdC8vIEFVZGlvUGFyYW1cclxuXHRcdFx0XHRpZiAoY29uLmZyb20ucGFyYW0pIHtcclxuXHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLnBhcmFtLmF1ZGlvUGFyYW0sIGNvbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ucGFyYW0uYXVkaW9QYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIGNvbi50by5wYXJhbeOBjOaVsOWtl1xyXG5cdFx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSkge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KSB7XHJcblx0XHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsIGNvbi5mcm9tLnBhcmFtLCBjb24udG8ucGFyYW0pO1xyXG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsIDAsIGNvbi50by5wYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB0byDjg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtKSB7XHJcblx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlLCBjb24uZnJvbS5wYXJhbSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDjgrPjg43jgq/jgrfjg6fjg7Pjga7mjqXntprjgpLop6PpmaTjgZnjgotcclxuXHRzdGF0aWMgZGlzY29ubmVjdChmcm9tXyx0b18pIHtcclxuXHRcdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3KXtcclxuXHRcdFx0XHRmcm9tXyA9IHtub2RlOmZyb21ffTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBQYXJhbVZpZXcgKXtcclxuXHRcdFx0XHRmcm9tXyA9IHtub2RlOmZyb21fLkF1ZGlvTm9kZVZpZXcscGFyYW06ZnJvbV99O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3KXtcclxuXHRcdFx0XHR0b18gPSB7bm9kZTp0b199O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih0b18gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX31cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNvbiA9IHsnZnJvbSc6ZnJvbV8sJ3RvJzp0b199O1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8g44Kz44ON44Kv44K344On44Oz44Gu5YmK6ZmkXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0bGV0IG4gPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnNbaV07XHJcblx0XHRcdFx0aWYoY29uLmZyb20ubm9kZSA9PT0gbi5mcm9tLm5vZGUgJiYgY29uLmZyb20ucGFyYW0gPT09IG4uZnJvbS5wYXJhbSBcclxuXHRcdFx0XHRcdCYmIGNvbi50by5ub2RlID09PSBuLnRvLm5vZGUgJiYgY29uLnRvLnBhcmFtID09PSBuLnRvLnBhcmFtKXtcclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0Xyhjb24pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgY3JlYXRlKGF1ZGlvbm9kZSxlZGl0b3IgPSAoKT0+e30pIHtcclxuXHRcdHZhciBvYmogPSBuZXcgQXVkaW9Ob2RlVmlldyhhdWRpb25vZGUsZWRpdG9yKTtcclxuXHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5wdXNoKG9iaik7XHJcblx0XHRyZXR1cm4gb2JqO1xyXG5cdH1cclxuXHRcclxuICAvLyDjg47jg7zjg4nplpPjga7mjqXntppcclxuXHRzdGF0aWMgY29ubmVjdChmcm9tXywgdG9fKSB7XHJcblx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcgKXtcclxuXHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tXyxwYXJhbTowfTtcclxuXHRcdH1cclxuXHJcblx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8uQXVkaW9Ob2RlVmlldyxwYXJhbTpmcm9tX307XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLHBhcmFtOjB9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX307XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX307XHJcblx0XHR9XHJcblx0XHQvLyDlrZjlnKjjg4Hjgqfjg4Pjgq9cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aDsgaSA8IGw7ICsraSkge1xyXG5cdFx0XHR2YXIgYyA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0aWYgKGMuZnJvbS5ub2RlID09PSBmcm9tXy5ub2RlIFxyXG5cdFx0XHRcdCYmIGMuZnJvbS5wYXJhbSA9PT0gZnJvbV8ucGFyYW1cclxuXHRcdFx0XHQmJiBjLnRvLm5vZGUgPT09IHRvXy5ub2RlXHJcblx0XHRcdFx0JiYgYy50by5wYXJhbSA9PT0gdG9fLnBhcmFtXHJcblx0XHRcdFx0KSBcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcbi8vXHRcdFx0XHR0aHJvdyAobmV3IEVycm9yKCfmjqXntprjgYzph43opIfjgZfjgabjgYTjgb7jgZnjgIInKSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8g5o6l57aa5YWI44GMUGFyYW1WaWV344Gu5aC05ZCI44Gv5o6l57aa5YWD44GvUGFyYW1WaWV344Gu44G/XHJcblx0XHRpZih0b18ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcgJiYgIShmcm9tXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldykpe1xyXG5cdFx0ICByZXR1cm4gO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBQYXJhbVZpZXfjgYzmjqXntprlj6/og73jgarjga7jga9BdWRpb1BhcmFt44GL44KJUGFyYW1WaWV344Gu44G/XHJcblx0XHRpZihmcm9tXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdGlmKCEodG9fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3IHx8IHRvXy5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KSl7XHJcblx0XHRcdFx0cmV0dXJuO1x0XHJcblx0XHRcdH1cclxuXHRcdH0gXHJcblx0XHRcclxuXHRcdGlmIChmcm9tXy5wYXJhbSkge1xyXG5cdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHQgIGlmKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0XHQgIGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3Qoeydmcm9tJzpmcm9tXywndG8nOnRvX30pO1xyXG4vL1x0XHRcdFx0ZnJvbV8ubm9kZS5jb25uZWN0UGFyYW0oZnJvbV8ucGFyYW0sdG9fKTtcclxuXHRcdFx0fSBlbHNlIGlmICh0b18ucGFyYW0pIFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRpZih0b18ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0XHQvLyBBdWRpb1BhcmFt44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5wYXJhbS5hdWRpb1BhcmFtLGZyb21fLnBhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8g5pWw5a2X44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSwgZnJvbV8ucGFyYW0sdG9fLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSxmcm9tXy5wYXJhbSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0aWYgKHRvXy5wYXJhbSkge1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0aWYodG9fLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0Ly8gQXVkaW9QYXJhbeOBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ucGFyYW0uYXVkaW9QYXJhbSk7XHJcblx0XHRcdFx0fSBlbHNle1xyXG5cdFx0XHRcdFx0Ly8g5pWw5a2X44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSwwLHRvXy5wYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vdGhyb3cgbmV3IEVycm9yKCdDb25uZWN0aW9uIEVycm9yJyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5wdXNoXHJcblx0XHQoe1xyXG5cdFx0XHQnZnJvbSc6IGZyb21fLFxyXG5cdFx0XHQndG8nOiB0b19cclxuXHRcdH0pO1xyXG5cdH1cclxufVxyXG5cclxuQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzID0gW107XHJcbkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucyA9IFtdO1xyXG5cclxuXHJcbiIsImltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpLmpzJztcclxuaW1wb3J0IHtzaG93U2VxdWVuY2VFZGl0b3J9IGZyb20gJy4vc2VxdWVuY2VFZGl0b3InO1xyXG5cclxuZXhwb3J0IHZhciBzdmc7XHJcbi8vYWFcclxudmFyIG5vZGVHcm91cCwgbGluZUdyb3VwO1xyXG52YXIgZHJhZztcclxudmFyIGRyYWdPdXQ7XHJcbnZhciBkcmFnUGFyYW07XHJcbnZhciBkcmFnUGFuZWw7XHJcblxyXG52YXIgbW91c2VDbGlja05vZGU7XHJcbnZhciBtb3VzZU92ZXJOb2RlO1xyXG52YXIgbGluZTtcclxudmFyIGF1ZGlvTm9kZUNyZWF0b3JzID0gW107XHJcblxyXG4vLyBEcmF344Gu5Yid5pyf5YyWXHJcbmV4cG9ydCBmdW5jdGlvbiBpbml0VUkoKXtcclxuXHQvLyDlh7rlipvjg47jg7zjg4njga7kvZzmiJDvvIjliYrpmaTkuI3lj6/vvIlcclxuXHR2YXIgb3V0ID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmRlc3RpbmF0aW9uLHNob3dQYW5lbCk7XHJcblx0b3V0LnggPSB3aW5kb3cuaW5uZXJXaWR0aCAvIDI7XHJcblx0b3V0LnkgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xyXG5cdG91dC5yZW1vdmFibGUgPSBmYWxzZTtcclxuXHRcclxuXHQvLyDjg5fjg6zjgqTjg6Tjg7xcclxuXHRhdWRpby5TZXF1ZW5jZXIuYWRkZWQgPSAoKT0+XHJcblx0e1xyXG5cdFx0aWYoYXVkaW8uU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoID09IDEgJiYgYXVkaW8uU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09PSBhdWRpby5TRVFfU1RBVFVTLlNUT1BQRUQpe1xyXG5cdFx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdFx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YXVkaW8uU2VxdWVuY2VyLmVtcHR5ID0gKCk9PntcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5zdG9wU2VxdWVuY2VzKCk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdH0gXHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjcGxheScpXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5zdGFydFNlcXVlbmNlcyhhdWRpby5jdHguY3VycmVudFRpbWUpO1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9KTtcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNwYXVzZScpLm9uKCdjbGljaycsZnVuY3Rpb24oKXtcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5wYXVzZVNlcXVlbmNlcygpO1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3N0b3AnKS5vbignY2xpY2snLGZ1bmN0aW9uKCl7XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIuc3RvcFNlcXVlbmNlcygpO1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9KTtcclxuXHRcclxuXHRhdWRpby5TZXF1ZW5jZXIuc3RvcHBlZCA9ICgpPT57XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHQvLyBBdWRpb05vZGXjg4njg6njg4PjgrDnlKhcclxuXHRkcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcblx0Lm9yaWdpbihmdW5jdGlvbiAoZCkgeyByZXR1cm4gZDsgfSlcclxuXHQub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oZCl7XHJcblx0XHRpZihkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5IHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnbW91c2V1cCcpKTtcdFx0XHRcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0ZC50ZW1wLnggPSBkLng7XHJcblx0XHRkLnRlbXAueSA9IGQueTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKHtpZDonZHJhZycsd2lkdGg6ZC53aWR0aCxoZWlnaHQ6ZC5oZWlnaHQseDowLHk6MCwnY2xhc3MnOidhdWRpb05vZGVEcmFnJ30gKTtcclxuXHR9KVxyXG5cdC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdGlmKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRkLnRlbXAueCArPSBkMy5ldmVudC5keDtcclxuXHRcdGQudGVtcC55ICs9IGQzLmV2ZW50LmR5O1xyXG5cdFx0Ly9kMy5zZWxlY3QodGhpcykuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgKGQueCAtIGQud2lkdGggLyAyKSArICcsJyArIChkLnkgLSBkLmhlaWdodCAvIDIpICsgJyknKTtcclxuXHRcdC8vZHJhdygpO1xyXG5cdFx0dmFyIGRyYWdDdXJzb2wgPSBkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKVxyXG5cdFx0LnNlbGVjdCgncmVjdCNkcmFnJyk7XHJcblx0XHR2YXIgeCA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd4JykpICsgZDMuZXZlbnQuZHg7XHJcblx0XHR2YXIgeSA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd5JykpICsgZDMuZXZlbnQuZHk7XHJcblx0XHRkcmFnQ3Vyc29sLmF0dHIoe3g6eCx5Onl9KTtcdFx0XHJcblx0fSlcclxuXHQub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0aWYoZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5zaGlmdEtleSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHZhciBkcmFnQ3Vyc29sID0gZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSlcclxuXHRcdC5zZWxlY3QoJ3JlY3QjZHJhZycpO1xyXG5cdFx0dmFyIHggPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneCcpKTtcclxuXHRcdHZhciB5ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3knKSk7XHJcblx0XHRkLnggPSBkLnRlbXAueDtcclxuXHRcdGQueSA9IGQudGVtcC55O1xyXG5cdFx0ZHJhZ0N1cnNvbC5yZW1vdmUoKTtcdFx0XHJcblx0XHRkcmF3KCk7XHJcblx0fSk7XHJcblx0XHJcblx0Ly8g44OO44O844OJ6ZaT5o6l57aa55SoIGRyYWcgXHJcblx0ZHJhZ091dCA9IGQzLmJlaGF2aW9yLmRyYWcoKVxyXG5cdC5vcmlnaW4oZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQ7IH0pXHJcblx0Lm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0bGV0IHgxLHkxO1xyXG5cdFx0aWYoZC5pbmRleCl7XHJcblx0XHRcdGlmKGQuaW5kZXggaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHgxID0gZC5ub2RlLnggLSBkLm5vZGUud2lkdGggLyAyICsgZC5pbmRleC54O1xyXG5cdFx0XHRcdHkxID0gZC5ub2RlLnkgLSBkLm5vZGUuaGVpZ2h0IC8yICsgZC5pbmRleC55O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHgxID0gZC5ub2RlLnggKyBkLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHRcdHkxID0gZC5ub2RlLnkgLSBkLm5vZGUuaGVpZ2h0IC8yICsgZC5ub2RlLm91dHB1dFN0YXJ0WSArIGQuaW5kZXggKiAyMDsgXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHgxID0gZC5ub2RlLnggKyBkLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHR5MSA9IGQubm9kZS55IC0gZC5ub2RlLmhlaWdodCAvMiArIGQubm9kZS5vdXRwdXRTdGFydFk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZC54MSA9IHgxLGQueTEgPSB5MTtcdFx0XHRcdFxyXG5cdFx0ZC54MiA9IHgxLGQueTIgPSB5MTtcclxuXHJcblx0XHR2YXIgcG9zID0gbWFrZVBvcyh4MSx5MSxkLngyLGQueTIpO1xyXG5cdFx0ZC5saW5lID0gc3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuZGF0dW0oZClcclxuXHRcdC5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0LmF0dHIoeydkJzpsaW5lKHBvcyksJ2NsYXNzJzonbGluZS1kcmFnJ30pO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0ZC54MiArPSBkMy5ldmVudC5keDtcclxuXHRcdGQueTIgKz0gZDMuZXZlbnQuZHk7XHJcblx0XHRkLmxpbmUuYXR0cignZCcsbGluZShtYWtlUG9zKGQueDEsZC55MSxkLngyLGQueTIpKSk7XHRcdFx0XHRcdFxyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ2VuZFwiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0bGV0IHRhcmdldFggPSBkLngyO1xyXG5cdFx0bGV0IHRhcmdldFkgPSBkLnkyO1xyXG5cdFx0Ly8gaW5wdXTjgoLjgZfjgY/jga9wYXJhbeOBq+WIsOmBlOOBl+OBpuOBhOOCi+OBi1xyXG5cdFx0Ly8gaW5wdXRcdFx0XHJcblx0XHRsZXQgY29ubmVjdGVkID0gZmFsc2U7XHJcblx0XHRsZXQgaW5wdXRzID0gZDMuc2VsZWN0QWxsKCcuaW5wdXQnKVswXTtcclxuXHRcdGZvcih2YXIgaSA9IDAsbCA9IGlucHV0cy5sZW5ndGg7aSA8IGw7KytpKXtcclxuXHRcdFx0bGV0IGVsbSA9IGlucHV0c1tpXTtcclxuXHRcdFx0bGV0IGJib3ggPSBlbG0uZ2V0QkJveCgpO1xyXG5cdFx0XHRsZXQgbm9kZSA9IGVsbS5fX2RhdGFfXy5ub2RlO1xyXG5cdFx0XHRsZXQgbGVmdCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54LFxyXG5cdFx0XHRcdHRvcCA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueSxcclxuXHRcdFx0XHRyaWdodCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54ICsgYmJveC53aWR0aCxcclxuXHRcdFx0XHRib3R0b20gPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94LnkgKyBiYm94LmhlaWdodDtcclxuXHRcdFx0aWYodGFyZ2V0WCA+PSBsZWZ0ICYmIHRhcmdldFggPD0gcmlnaHQgJiYgdGFyZ2V0WSA+PSB0b3AgJiYgdGFyZ2V0WSA8PSBib3R0b20pXHJcblx0XHRcdHtcclxuLy9cdFx0XHRcdGNvbnNvbGUubG9nKCdoaXQnLGVsbSk7XHJcblx0XHRcdFx0bGV0IGZyb21fID0ge25vZGU6ZC5ub2RlLHBhcmFtOmQuaW5kZXh9O1xyXG5cdFx0XHRcdGxldCB0b18gPSB7bm9kZTpub2RlLHBhcmFtOmVsbS5fX2RhdGFfXy5pbmRleH07XHJcblx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KGZyb21fLHRvXyk7XHJcblx0XHRcdFx0Ly9BdWRpb05vZGVWaWV3LmNvbm5lY3QoKTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdFx0Y29ubmVjdGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZighY29ubmVjdGVkKXtcclxuXHRcdFx0Ly8gQXVkaW9QYXJhbVxyXG5cdFx0XHR2YXIgcGFyYW1zID0gZDMuc2VsZWN0QWxsKCcucGFyYW0sLmF1ZGlvLXBhcmFtJylbMF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDAsbCA9IHBhcmFtcy5sZW5ndGg7aSA8IGw7KytpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IGVsbSA9IHBhcmFtc1tpXTtcclxuXHRcdFx0XHRsZXQgYmJveCA9IGVsbS5nZXRCQm94KCk7XHJcblx0XHRcdFx0bGV0IHBhcmFtID0gZWxtLl9fZGF0YV9fO1xyXG5cdFx0XHRcdGxldCBub2RlID0gcGFyYW0ubm9kZTtcclxuXHRcdFx0XHRsZXQgbGVmdCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54O1xyXG5cdFx0XHRcdGxldFx0dG9wXyA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueTtcclxuXHRcdFx0XHRsZXRcdHJpZ2h0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LnggKyBiYm94LndpZHRoO1xyXG5cdFx0XHRcdGxldFx0Ym90dG9tID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55ICsgYmJveC5oZWlnaHQ7XHJcblx0XHRcdFx0aWYodGFyZ2V0WCA+PSBsZWZ0ICYmIHRhcmdldFggPD0gcmlnaHQgJiYgdGFyZ2V0WSA+PSB0b3BfICYmIHRhcmdldFkgPD0gYm90dG9tKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdoaXQnLGVsbSk7XHJcblx0XHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6ZC5ub2RlLHBhcmFtOmQuaW5kZXh9LHtub2RlOm5vZGUscGFyYW06cGFyYW0uaW5kZXh9KTtcclxuXHRcdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gbGluZeODl+ODrOODk+ODpeODvOOBruWJiumZpFxyXG5cdFx0ZC5saW5lLnJlbW92ZSgpO1xyXG5cdFx0ZGVsZXRlIGQubGluZTtcclxuXHR9KTtcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNwYW5lbC1jbG9zZScpXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oKXtkMy5zZWxlY3QoJyNwcm9wLXBhbmVsJykuc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO2QzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7fSk7XHJcblxyXG5cdC8vIG5vZGXplpPmjqXntppsaW5l5o+P55S76Zai5pWwXHJcblx0bGluZSA9IGQzLnN2Zy5saW5lKClcclxuXHQueChmdW5jdGlvbihkKXtyZXR1cm4gZC54fSlcclxuXHQueShmdW5jdGlvbihkKXtyZXR1cm4gZC55fSlcclxuXHQuaW50ZXJwb2xhdGUoJ2Jhc2lzJyk7XHJcblxyXG5cdC8vIERPTeOBq3N2Z+OCqOODrOODoeODs+ODiOOCkuaMv+WFpVx0XHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjY29udGVudCcpXHJcblx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0LmF0dHIoeyAnd2lkdGgnOiB3aW5kb3cuaW5uZXJXaWR0aCwgJ2hlaWdodCc6IHdpbmRvdy5pbm5lckhlaWdodCB9KTtcclxuXHJcblx0Ly8g44OO44O844OJ44GM5YWl44KL44Kw44Or44O844OXXHJcblx0bm9kZUdyb3VwID0gc3ZnLmFwcGVuZCgnZycpO1xyXG5cdC8vIOODqeOCpOODs+OBjOWFpeOCi+OCsOODq+ODvOODl1xyXG5cdGxpbmVHcm91cCA9IHN2Zy5hcHBlbmQoJ2cnKTtcclxuXHRcclxuXHQvLyBib2R55bGe5oCn44Gr5oy/5YWlXHJcblx0YXVkaW9Ob2RlQ3JlYXRvcnMgPSBcclxuXHRbXHJcblx0XHR7bmFtZTonR2FpbicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVHYWluLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonRGVsYXknLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlRGVsYXkuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidBdWRpb0J1ZmZlclNvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidNZWRpYUVsZW1lbnRBdWRpb1NvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidQYW5uZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlUGFubmVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ29udm9sdmVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNvbnZvbHZlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0FuYWx5c2VyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUFuYWx5c2VyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ2hhbm5lbFNwbGl0dGVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxTcGxpdHRlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0NoYW5uZWxNZXJnZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQ2hhbm5lbE1lcmdlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0R5bmFtaWNzQ29tcHJlc3NvcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidCaXF1YWRGaWx0ZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQmlxdWFkRmlsdGVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonT3NjaWxsYXRvcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVPc2NpbGxhdG9yLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonTWVkaWFTdHJlYW1BdWRpb1NvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J1dhdmVTaGFwZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlV2F2ZVNoYXBlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0VHJyxjcmVhdGU6KCk9Pm5ldyBhdWRpby5FRygpfSxcclxuXHRcdHtuYW1lOidTZXF1ZW5jZXInLGNyZWF0ZTooKT0+bmV3IGF1ZGlvLlNlcXVlbmNlcigpLGVkaXRvcjpzaG93U2VxdWVuY2VFZGl0b3J9XHJcblx0XTtcclxuXHRcclxuXHRpZihhdWRpby5jdHguY3JlYXRlTWVkaWFTdHJlYW1EZXN0aW5hdGlvbil7XHJcblx0XHRhdWRpb05vZGVDcmVhdG9ycy5wdXNoKHtuYW1lOidNZWRpYVN0cmVhbUF1ZGlvRGVzdGluYXRpb24nLFxyXG5cdFx0XHRjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtRGVzdGluYXRpb24uYmluZChhdWRpby5jdHgpXHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjY29udGVudCcpXHJcblx0LmRhdHVtKHt9KVxyXG5cdC5vbignY29udGV4dG1lbnUnLGZ1bmN0aW9uKCl7XHJcblx0XHRzaG93QXVkaW9Ob2RlUGFuZWwodGhpcyk7XHJcblx0fSk7XHJcbn1cclxuXHJcbi8vIOaPj+eUu1xyXG5leHBvcnQgZnVuY3Rpb24gZHJhdygpIHtcclxuXHQvLyBBdWRpb05vZGXjga7mj4/nlLtcclxuXHR2YXIgZ2QgPSBub2RlR3JvdXAuc2VsZWN0QWxsKCdnJykuXHJcblx0ZGF0YShhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMsZnVuY3Rpb24oZCl7cmV0dXJuIGQuaWQ7fSk7XHJcblxyXG5cdC8vIOefqeW9ouOBruabtOaWsFxyXG5cdGdkLnNlbGVjdCgncmVjdCcpXHJcblx0LmF0dHIoeyAnd2lkdGgnOiAoZCk9PiBkLndpZHRoLCAnaGVpZ2h0JzogKGQpPT4gZC5oZWlnaHQgfSk7XHJcblx0XHJcblx0Ly8gQXVkaW9Ob2Rl55+p5b2i44Kw44Or44O844OXXHJcblx0dmFyIGcgPSBnZC5lbnRlcigpXHJcblx0LmFwcGVuZCgnZycpO1xyXG5cdC8vIEF1ZGlvTm9kZeefqeW9ouOCsOODq+ODvOODl+OBruW6p+aomeS9jee9ruOCu+ODg+ODiFxyXG5cdGdkLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiAndHJhbnNsYXRlKCcgKyAoZC54IC0gZC53aWR0aCAvIDIpICsgJywnICsgKGQueSAtIGQuaGVpZ2h0IC8gMikgKyAnKScgfSk7XHRcclxuXHJcblx0Ly8gQXVkaW9Ob2Rl55+p5b2iXHJcblx0Zy5hcHBlbmQoJ3JlY3QnKVxyXG5cdC5jYWxsKGRyYWcpXHJcblx0LmF0dHIoeyAnd2lkdGgnOiAoZCk9PiBkLndpZHRoLCAnaGVpZ2h0JzogKGQpPT4gZC5oZWlnaHQsICdjbGFzcyc6ICdhdWRpb05vZGUnIH0pXHJcblx0LmNsYXNzZWQoJ3BsYXknLGZ1bmN0aW9uKGQpe1xyXG5cdFx0cmV0dXJuIGQuc3RhdHVzUGxheSA9PT0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUlORztcclxuXHR9KVxyXG5cdC5vbignY29udGV4dG1lbnUnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g44OR44Op44Oh44O844K/57eo6ZuG55S76Z2i44Gu6KGo56S6XHJcblx0XHRkLmVkaXRvcigpO1xyXG5cdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0fSlcclxuXHQub24oJ2NsaWNrLnJlbW92ZScsZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRcdGlmKGQzLmV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0ZC5wYW5lbCAmJiBkLnBhbmVsLmlzU2hvdyAmJiBkLnBhbmVsLmRpc3Bvc2UoKTtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShkKTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdH0gY2F0Y2goZSkge1xyXG4vL1x0XHRcdFx0ZGlhbG9nLnRleHQoZS5tZXNzYWdlKS5ub2RlKCkuc2hvdyh3aW5kb3cuaW5uZXJXaWR0aC8yLHdpbmRvdy5pbm5lckhlaWdodC8yKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0fSlcclxuXHQuZmlsdGVyKGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g6Z+z5rqQ44Gu44G/44Gr44OV44Kj44Or44K/XHJcblx0XHRyZXR1cm4gZC5hdWRpb05vZGUgaW5zdGFuY2VvZiBPc2NpbGxhdG9yTm9kZSB8fCBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyU291cmNlTm9kZSB8fCBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIE1lZGlhRWxlbWVudEF1ZGlvU291cmNlTm9kZTsgXHJcblx0fSlcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOWGjeeUn+ODu+WBnOatolxyXG5cdFx0Y29uc29sZS5sb2coZDMuZXZlbnQpO1xyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdFx0aWYoIWQzLmV2ZW50LmN0cmxLZXkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRsZXQgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0aWYoZC5zdGF0dXNQbGF5ID09PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HKXtcclxuXHRcdFx0ZC5zdGF0dXNQbGF5ID0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUVEO1xyXG5cdFx0XHRzZWwuY2xhc3NlZCgncGxheScsZmFsc2UpO1xyXG5cdFx0XHRkLmF1ZGlvTm9kZS5zdG9wKDApO1xyXG5cdFx0fSBlbHNlIGlmKGQuc3RhdHVzUGxheSAhPT0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUVEKXtcclxuXHRcdFx0ZC5hdWRpb05vZGUuc3RhcnQoMCk7XHJcblx0XHRcdGQuc3RhdHVzUGxheSA9IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlJTkc7XHJcblx0XHRcdHNlbC5jbGFzc2VkKCdwbGF5Jyx0cnVlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFsZXJ0KCfkuIDluqblgZzmraLjgZnjgovjgajlho3nlJ/jgafjgY3jgb7jgZvjgpPjgIInKTtcclxuXHRcdH1cclxuXHR9KVxyXG5cdC5jYWxsKHRvb2x0aXAoJ0N0cmwgKyBDbGljayDjgaflho3nlJ/jg7vlgZzmraInKSk7XHJcblx0O1xyXG5cdFxyXG5cdC8vIEF1ZGlvTm9kZeOBruODqeODmeODq1xyXG5cdGcuYXBwZW5kKCd0ZXh0JylcclxuXHQuYXR0cih7IHg6IDAsIHk6IC0xMCwgJ2NsYXNzJzogJ2xhYmVsJyB9KVxyXG5cdC50ZXh0KGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLm5hbWU7IH0pO1xyXG5cclxuXHQvLyDlhaXliptBdWRpb1BhcmFt44Gu6KGo56S6XHRcclxuXHRnZC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0dmFyIGdwID0gc2VsLmFwcGVuZCgnZycpO1xyXG5cdFx0dmFyIGdwZCA9IGdwLnNlbGVjdEFsbCgnZycpXHJcblx0XHQuZGF0YShkLmlucHV0UGFyYW1zLm1hcCgoZCk9PntcclxuXHRcdFx0cmV0dXJuIHtub2RlOmQuQXVkaW9Ob2RlVmlldyxpbmRleDpkfTtcclxuXHRcdH0pLGZ1bmN0aW9uKGQpe3JldHVybiBkLmluZGV4LmlkO30pO1x0XHRcclxuXHJcblx0XHR2YXIgZ3BkZyA9IGdwZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJyk7XHJcblx0XHRcclxuXHRcdGdwZGcuYXBwZW5kKCdjaXJjbGUnKVxyXG5cdFx0LmF0dHIoeydyJzogKGQpPT5kLmluZGV4LndpZHRoLzIsIFxyXG5cdFx0Y3g6IDAsIGN5OiAoZCwgaSk9PiB7IHJldHVybiBkLmluZGV4Lnk7IH0sXHJcblx0XHQnY2xhc3MnOiBmdW5jdGlvbihkKSB7XHJcblx0XHRcdGlmKGQuaW5kZXggaW5zdGFuY2VvZiBhdWRpby5BdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0cmV0dXJuICdhdWRpby1wYXJhbSc7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuICdwYXJhbSc7XHJcblx0XHR9fSk7XHJcblx0XHRcclxuXHRcdGdwZGcuYXBwZW5kKCd0ZXh0JylcclxuXHRcdC5hdHRyKHt4OiAoZCk9PiAoZC5pbmRleC54ICsgZC5pbmRleC53aWR0aCAvIDIgKyA1KSx5OihkKT0+ZC5pbmRleC55LCdjbGFzcyc6J2xhYmVsJyB9KVxyXG5cdFx0LnRleHQoKGQpPT5kLmluZGV4Lm5hbWUpO1xyXG5cclxuXHRcdGdwZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHR9KTtcclxuXHJcblx0Ly8g5Ye65YqbUGFyYW3jga7ooajnpLpcdFxyXG5cdGdkLmVhY2goZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHR2YXIgZ3AgPSBzZWwuYXBwZW5kKCdnJyk7XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0XHJcblx0XHR2YXIgZ3BkID0gZ3Auc2VsZWN0QWxsKCdnJylcclxuXHRcdC5kYXRhKGQub3V0cHV0UGFyYW1zLm1hcCgoZCk9PntcclxuXHRcdFx0cmV0dXJuIHtub2RlOmQuQXVkaW9Ob2RlVmlldyxpbmRleDpkfTtcclxuXHRcdH0pLGZ1bmN0aW9uKGQpe3JldHVybiBkLmluZGV4LmlkO30pO1xyXG5cdFx0XHJcblx0XHR2YXIgZ3BkZyA9IGdwZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJyk7XHJcblxyXG5cdFx0Z3BkZy5hcHBlbmQoJ2NpcmNsZScpXHJcblx0XHQuYXR0cih7J3InOiAoZCk9PmQuaW5kZXgud2lkdGgvMiwgXHJcblx0XHRjeDogZC53aWR0aCwgY3k6IChkLCBpKT0+IHsgcmV0dXJuIGQuaW5kZXgueTsgfSxcclxuXHRcdCdjbGFzcyc6ICdwYXJhbSd9KVxyXG5cdFx0LmNhbGwoZHJhZ091dCk7XHJcblx0XHRcclxuXHRcdGdwZGcuYXBwZW5kKCd0ZXh0JylcclxuXHRcdC5hdHRyKHt4OiAoZCk9PiAoZC5pbmRleC54ICsgZC5pbmRleC53aWR0aCAvIDIgKyA1KSx5OihkKT0+ZC5pbmRleC55LCdjbGFzcyc6J2xhYmVsJyB9KVxyXG5cdFx0LnRleHQoKGQpPT5kLmluZGV4Lm5hbWUpO1xyXG5cclxuXHRcdGdwZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHR9KTtcclxuXHJcblx0Ly8g5Ye65Yqb6KGo56S6XHJcblx0Z2QuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XHJcblx0XHRyZXR1cm4gZC5udW1iZXJPZk91dHB1dHMgPiAwO1xyXG5cdH0pXHJcblx0LmVhY2goZnVuY3Rpb24oZCl7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgnZycpO1xyXG5cdFx0aWYoIWQudGVtcC5vdXRzIHx8IChkLnRlbXAub3V0cyAmJiAoZC50ZW1wLm91dHMubGVuZ3RoIDwgZC5udW1iZXJPZk91dHB1dHMpKSlcclxuXHRcdHtcclxuXHRcdFx0ZC50ZW1wLm91dHMgPSBbXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDtpIDwgZC5udW1iZXJPZk91dHB1dHM7KytpKXtcclxuXHRcdFx0XHRkLnRlbXAub3V0cy5wdXNoKHtub2RlOmQsaW5kZXg6aX0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR2YXIgc2VsMSA9IHNlbC5zZWxlY3RBbGwoJ2cnKTtcclxuXHRcdHZhciBzZWxkID0gc2VsMS5kYXRhKGQudGVtcC5vdXRzKTtcclxuXHJcblx0XHRzZWxkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cih7IHg6IGQud2lkdGggLSB1aS5wb2ludFNpemUgLyAyLCB5OiAoZDEpPT4gKGQub3V0cHV0U3RhcnRZICsgZDEuaW5kZXggKiAyMCAtIHVpLnBvaW50U2l6ZSAvIDIpLCB3aWR0aDogdWkucG9pbnRTaXplLCBoZWlnaHQ6IHVpLnBvaW50U2l6ZSwgJ2NsYXNzJzogJ291dHB1dCcgfSlcclxuXHRcdC5jYWxsKGRyYWdPdXQpO1xyXG5cdFx0c2VsZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0fSk7XHJcblxyXG5cdC8vIOWFpeWKm+ihqOekulxyXG5cdGdkXHJcblx0LmZpbHRlcihmdW5jdGlvbiAoZCkge1x0cmV0dXJuIGQubnVtYmVyT2ZJbnB1dHMgPiAwOyB9KVxyXG5cdC5lYWNoKGZ1bmN0aW9uKGQpe1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ2cnKTtcclxuXHRcdGlmKCFkLnRlbXAuaW5zIHx8IChkLnRlbXAuaW5zICYmIChkLnRlbXAuaW5zLmxlbmd0aCA8IGQubnVtYmVyT2ZJbnB1dHMpKSlcclxuXHRcdHtcclxuXHRcdFx0ZC50ZW1wLmlucyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwO2kgPCBkLm51bWJlck9mSW5wdXRzOysraSl7XHJcblx0XHRcdFx0ZC50ZW1wLmlucy5wdXNoKHtub2RlOmQsaW5kZXg6aX0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR2YXIgc2VsMSA9IHNlbC5zZWxlY3RBbGwoJ2cnKTtcclxuXHRcdHZhciBzZWxkID0gc2VsMS5kYXRhKGQudGVtcC5pbnMpO1xyXG5cclxuXHRcdHNlbGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKHsgeDogLSB1aS5wb2ludFNpemUgLyAyLCB5OiAoZDEpPT4gKGQuaW5wdXRTdGFydFkgKyBkMS5pbmRleCAqIDIwIC0gdWkucG9pbnRTaXplIC8gMiksIHdpZHRoOiB1aS5wb2ludFNpemUsIGhlaWdodDogdWkucG9pbnRTaXplLCAnY2xhc3MnOiAnaW5wdXQnIH0pXHJcblx0XHQub24oJ21vdXNlZW50ZXInLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRtb3VzZU92ZXJOb2RlID0ge25vZGU6ZC5hdWRpb05vZGVfLHBhcmFtOmR9O1xyXG5cdFx0fSlcclxuXHRcdC5vbignbW91c2VsZWF2ZScsZnVuY3Rpb24oZCl7XHJcblx0XHRcdGlmKG1vdXNlT3Zlck5vZGUubm9kZSl7XHJcblx0XHRcdFx0aWYobW91c2VPdmVyTm9kZS5ub2RlID09PSBkLmF1ZGlvTm9kZV8gJiYgbW91c2VPdmVyTm9kZS5wYXJhbSA9PT0gZCl7XHJcblx0XHRcdFx0XHRtb3VzZU92ZXJOb2RlID0gbnVsbDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0c2VsZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0fSk7XHJcblx0XHJcblx0Ly8g5LiN6KaB44Gq44OO44O844OJ44Gu5YmK6ZmkXHJcblx0Z2QuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0Ly8gbGluZSDmj4/nlLtcclxuXHR2YXIgbGQgPSBsaW5lR3JvdXAuc2VsZWN0QWxsKCdwYXRoJylcclxuXHQuZGF0YShhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMpO1xyXG5cclxuXHRsZC5lbnRlcigpXHJcblx0LmFwcGVuZCgncGF0aCcpO1xyXG5cclxuXHRsZC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgcGF0aCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdHZhciB4MSx5MSx4Mix5MjtcclxuXHJcblx0XHQvLyB4MSx5MVxyXG5cdFx0aWYoZC5mcm9tLnBhcmFtKXtcclxuXHRcdFx0aWYoZC5mcm9tLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR4MSA9IGQuZnJvbS5ub2RlLnggLSBkLmZyb20ubm9kZS53aWR0aCAvIDIgKyBkLmZyb20ucGFyYW0ueDtcclxuXHRcdFx0XHR5MSA9IGQuZnJvbS5ub2RlLnkgLSBkLmZyb20ubm9kZS5oZWlnaHQgLzIgKyBkLmZyb20ucGFyYW0ueTsgXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eDEgPSBkLmZyb20ubm9kZS54ICsgZC5mcm9tLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHRcdHkxID0gZC5mcm9tLm5vZGUueSAtIGQuZnJvbS5ub2RlLmhlaWdodCAvMiArIGQuZnJvbS5ub2RlLm91dHB1dFN0YXJ0WSArIGQuZnJvbS5wYXJhbSAqIDIwOyBcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0eDEgPSBkLmZyb20ubm9kZS54ICsgZC5mcm9tLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHR5MSA9IGQuZnJvbS5ub2RlLnkgLSBkLmZyb20ubm9kZS5oZWlnaHQgLzIgKyBkLmZyb20ubm9kZS5vdXRwdXRTdGFydFk7XHJcblx0XHR9XHJcblxyXG5cdFx0eDIgPSBkLnRvLm5vZGUueCAtIGQudG8ubm9kZS53aWR0aCAvIDI7XHJcblx0XHR5MiA9IGQudG8ubm9kZS55IC0gZC50by5ub2RlLmhlaWdodCAvIDI7XHJcblx0XHRcclxuXHRcdGlmKGQudG8ucGFyYW0pe1xyXG5cdFx0XHRpZihkLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcgfHwgZC50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDIgKz0gZC50by5wYXJhbS54O1xyXG5cdFx0XHRcdHkyICs9IGQudG8ucGFyYW0ueTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR5MiArPSAgZC50by5ub2RlLmlucHV0U3RhcnRZICArICBkLnRvLnBhcmFtICogMjA7XHRcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0eTIgKz0gZC50by5ub2RlLmlucHV0U3RhcnRZO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgcG9zID0gbWFrZVBvcyh4MSx5MSx4Mix5Mik7XHJcblx0XHRcclxuXHRcdHBhdGguYXR0cih7J2QnOmxpbmUocG9zKSwnY2xhc3MnOidsaW5lJ30pO1xyXG5cdFx0cGF0aC5vbignY2xpY2snLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRpZihkMy5ldmVudC5zaGlmdEtleSl7XHJcblx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KGQuZnJvbSxkLnRvKTtcclxuXHRcdFx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0fSBcclxuXHRcdH0pLmNhbGwodG9vbHRpcCgnU2hpZnQgKyBjbGlja+OBp+WJiumZpCcpKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cdGxkLmV4aXQoKS5yZW1vdmUoKTtcclxufVxyXG5cclxuLy8g57Ch5piTdG9vbHRpcOihqOekulxyXG5mdW5jdGlvbiB0b29sdGlwKG1lcylcclxue1xyXG5cdHJldHVybiBmdW5jdGlvbihkKXtcclxuXHRcdHRoaXNcclxuXHRcdC5vbignbW91c2VlbnRlcicsZnVuY3Rpb24oKXtcclxuXHRcdFx0c3ZnLmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdC5hdHRyKHsnY2xhc3MnOid0aXAnLHg6ZDMuZXZlbnQueCArIDIwICx5OmQzLmV2ZW50LnkgLSAyMH0pXHJcblx0XHRcdC50ZXh0KG1lcyk7XHJcblx0XHR9KVxyXG5cdFx0Lm9uKCdtb3VzZWxlYXZlJyxmdW5jdGlvbigpe1xyXG5cdFx0XHRzdmcuc2VsZWN0QWxsKCcudGlwJykucmVtb3ZlKCk7XHJcblx0XHR9KVxyXG5cdH07XHJcbn1cclxuXHJcbi8vIOaOpee2mue3muOBruW6p+aomeeUn+aIkFxyXG5mdW5jdGlvbiBtYWtlUG9zKHgxLHkxLHgyLHkyKXtcclxuXHRyZXR1cm4gW1xyXG5cdFx0XHR7eDp4MSx5OnkxfSxcclxuXHRcdFx0e3g6eDEgKyAoeDIgLSB4MSkvNCx5OnkxfSxcclxuXHRcdFx0e3g6eDEgKyAoeDIgLSB4MSkvMix5OnkxICsgKHkyIC0geTEpLzJ9LFxyXG5cdFx0XHR7eDp4MSArICh4MiAtIHgxKSozLzQseTp5Mn0sXHJcblx0XHRcdHt4OngyLCB5OnkyfVxyXG5cdFx0XTtcclxufVxyXG5cclxuLy8g44OX44Ot44OR44OG44Kj44OR44ON44Or44Gu6KGo56S6XHJcbmZ1bmN0aW9uIHNob3dQYW5lbChkKXtcclxuXHJcblx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdGlmKGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cpIHJldHVybiA7XHJcblxyXG5cdGQucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuXHRkLnBhbmVsLnggPSBkLng7XHJcblx0ZC5wYW5lbC55ID0gZC55O1xyXG5cdGQucGFuZWwuaGVhZGVyLnRleHQoZC5uYW1lKTtcclxuXHRcclxuXHR2YXIgdGFibGUgPSBkLnBhbmVsLmFydGljbGUuYXBwZW5kKCd0YWJsZScpO1xyXG5cdHZhciB0Ym9keSA9IHRhYmxlLmFwcGVuZCgndGJvZHknKS5zZWxlY3RBbGwoJ3RyJykuZGF0YShkLnBhcmFtcyk7XHJcblx0dmFyIHRyID0gdGJvZHkuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3RyJyk7XHJcblx0dHIuYXBwZW5kKCd0ZCcpXHJcblx0LnRleHQoKGQpPT5kLm5hbWUpO1xyXG5cdHRyLmFwcGVuZCgndGQnKVxyXG5cdC5hcHBlbmQoJ2lucHV0JylcclxuXHQuYXR0cih7dHlwZTpcInRleHRcIix2YWx1ZTooZCk9PmQuZ2V0KCkscmVhZG9ubHk6KGQpPT5kLnNldD9udWxsOidyZWFkb25seSd9KVxyXG5cdC5vbignY2hhbmdlJyxmdW5jdGlvbihkKXtcclxuXHRcdGxldCB2YWx1ZSA9IHRoaXMudmFsdWU7XHJcblx0XHRsZXQgdm4gPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuXHRcdGlmKGlzTmFOKHZuKSl7XHJcblx0XHRcdGQuc2V0KHZhbHVlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGQuc2V0KHZuKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRkLnBhbmVsLnNob3coKTtcclxuXHJcbn1cclxuXHJcbi8vIOODjuODvOODieaMv+WFpeODkeODjeODq+OBruihqOekulxyXG5mdW5jdGlvbiBzaG93QXVkaW9Ob2RlUGFuZWwoZCl7XHJcblx0IGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0IGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdGlmKGQucGFuZWwpe1xyXG5cdFx0aWYoZC5wYW5lbC5pc1Nob3cpXHJcblx0XHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0ZC5wYW5lbCA9IG5ldyB1aS5QYW5lbCgpO1xyXG5cdGQucGFuZWwueCA9IGQzLmV2ZW50Lm9mZnNldFg7XHJcblx0ZC5wYW5lbC55ID0gZDMuZXZlbnQub2Zmc2V0WTtcclxuXHRkLnBhbmVsLmhlYWRlci50ZXh0KCdBdWRpb05vZGXjga7mjL/lhaUnKTtcclxuXHJcblx0dmFyIHRhYmxlID0gZC5wYW5lbC5hcnRpY2xlLmFwcGVuZCgndGFibGUnKTtcclxuXHR2YXIgdGJvZHkgPSB0YWJsZS5hcHBlbmQoJ3Rib2R5Jykuc2VsZWN0QWxsKCd0cicpLmRhdGEoYXVkaW9Ob2RlQ3JlYXRvcnMpO1xyXG5cdHRib2R5LmVudGVyKClcclxuXHQuYXBwZW5kKCd0cicpXHJcblx0LmFwcGVuZCgndGQnKVxyXG5cdC50ZXh0KChkKT0+ZC5uYW1lKVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKGR0KXtcclxuXHRcdGNvbnNvbGUubG9nKCfmjL/lhaUnLGR0KTtcclxuXHRcdFxyXG5cdFx0dmFyIGVkaXRvciA9IGR0LmVkaXRvciB8fCBzaG93UGFuZWw7XHJcblx0XHRcclxuXHRcdHZhciBub2RlID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoZHQuY3JlYXRlKCksZWRpdG9yKTtcclxuXHRcdG5vZGUueCA9IGQzLmV2ZW50LmNsaWVudFg7XHJcblx0XHRub2RlLnkgPSBkMy5ldmVudC5jbGllbnRZO1xyXG5cdFx0ZHJhdygpO1xyXG5cdFx0Ly8gZDMuc2VsZWN0KCcjcHJvcC1wYW5lbCcpLnN0eWxlKCd2aXNpYmlsaXR5JywnaGlkZGVuJyk7XHJcblx0XHQvLyBkLnBhbmVsLmRpc3Bvc2UoKTtcclxuXHR9KTtcclxuXHRkLnBhbmVsLnNob3coKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF1ZGlvTm9kZVZpZXcobmFtZSl7XHJcblx0dmFyIG9iaiA9IGF1ZGlvTm9kZUNyZWF0b3JzLmZpbmQoKGQpPT57XHJcblx0XHRpZihkLm5hbWUgPT09IG5hbWUpIHJldHVybiB0cnVlO1xyXG5cdH0pO1xyXG5cdGlmKG9iail7XHJcblx0XHRyZXR1cm4gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUob2JqLmNyZWF0ZSgpLG9iai5lZGl0b3IgfHwgc2hvd1BhbmVsKTtcdFx0XHRcclxuXHR9XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpb05vZGVWaWV3JztcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRUcge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHR0aGlzLmdhdGUgPSBuZXcgYXVkaW8uUGFyYW1WaWV3KHRoaXMsJ2dhdGUnLGZhbHNlKTtcclxuXHRcdHRoaXMub3V0cHV0ID0gbmV3IGF1ZGlvLlBhcmFtVmlldyh0aGlzLCdvdXRwdXQnLHRydWUpO1xyXG5cdFx0dGhpcy5udW1iZXJPZklucHV0cyA9IDA7XHJcblx0XHR0aGlzLm51bWJlck9mT3V0cHV0cyA9IDA7XHJcblx0XHR0aGlzLmF0dGFjayA9IDAuMDAxO1xyXG5cdFx0dGhpcy5kZWNheSA9IDAuMDU7XHJcblx0XHR0aGlzLnJlbGVhc2UgPSAwLjA1O1xyXG5cdFx0dGhpcy5zdXN0YWluID0gMC4yO1xyXG5cdFx0dGhpcy5nYWluID0gMS4wO1xyXG5cdFx0dGhpcy5uYW1lID0gJ0VHJztcclxuXHRcdGF1ZGlvLmRlZklzTm90QVBJT2JqKHRoaXMsZmFsc2UpO1xyXG5cdFx0dGhpcy5vdXRwdXRzID0gW107XHJcblx0fVxyXG5cdFxyXG5cdGNvbm5lY3QoYylcclxuXHR7XHJcblx0XHRpZighIChjLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcpKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdBdWRpb1BhcmFt5Lul5aSW44Go44Gv5o6l57aa44Gn44GN44G+44Gb44KT44CCJyk7XHJcblx0XHR9XHJcblx0XHRjLnRvLnBhcmFtLmF1ZGlvUGFyYW0udmFsdWUgPSAwO1xyXG5cdFx0dGhpcy5vdXRwdXRzLnB1c2goYy50byk7XHJcblx0fVxyXG5cdFxyXG5cdGRpc2Nvbm5lY3QoYyl7XHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0aGlzLm91dHB1dHMubGVuZ3RoOysraSl7XHJcblx0XHRcdGlmKGMudG8ubm9kZSA9PT0gdGhpcy5vdXRwdXRzW2ldLm5vZGUgJiYgYy50by5wYXJhbSA9PT0gdGhpcy5vdXRwdXRzW2ldLnBhcmFtKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhpcy5vdXRwdXRzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cHJvY2Vzcyh0byxjb20sdix0KVxyXG5cdHtcclxuXHRcdGlmKHYgPiAwKSB7XHJcblx0XHRcdC8vIGtleW9uXHJcblx0XHRcdC8vIEFEU+OBvuOBp+OCguOBo+OBpuOBhOOBj1xyXG5cdFx0XHR0aGlzLm91dHB1dHMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRjb25zb2xlLmxvZygna2V5b24nLGNvbSx2LHQpO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5zZXRWYWx1ZUF0VGltZSgwLHQpO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2ICogdGhpcy5nYWluICx0ICsgdGhpcy5hdHRhY2spO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW4gKiB2ICogdGhpcy5nYWluICx0ICsgdGhpcy5hdHRhY2sgKyB0aGlzLmRlY2F5ICk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8ga2V5b2ZmXHJcblx0XHRcdC8vIOODquODquODvOOCuVxyXG5cdFx0XHR0aGlzLm91dHB1dHMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRjb25zb2xlLmxvZygna2V5b2ZmJyxjb20sdix0KTtcclxuXHRcdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCx0ICsgdGhpcy5yZWxlYXNlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHN0b3AoKXtcclxuXHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRjb25zb2xlLmxvZygnc3RvcCcpO1xyXG5cdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG5cdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0uc2V0VmFsdWVBdFRpbWUoMCwwKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRwYXVzZSgpe1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG59XHJcblxyXG4vLyAvLy8g44Ko44Oz44OZ44Ot44O844OX44K444Kn44ON44Os44O844K/44O8XHJcbi8vIGZ1bmN0aW9uIEVudmVsb3BlR2VuZXJhdG9yKHZvaWNlLCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKSB7XHJcbi8vICAgdGhpcy52b2ljZSA9IHZvaWNlO1xyXG4vLyAgIC8vdGhpcy5rZXlvbiA9IGZhbHNlO1xyXG4vLyAgIHRoaXMuYXR0YWNrID0gYXR0YWNrIHx8IDAuMDAwNTtcclxuLy8gICB0aGlzLmRlY2F5ID0gZGVjYXkgfHwgMC4wNTtcclxuLy8gICB0aGlzLnN1c3RhaW4gPSBzdXN0YWluIHx8IDAuNTtcclxuLy8gICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlIHx8IDAuNTtcclxuLy8gfTtcclxuLy8gXHJcbi8vIEVudmVsb3BlR2VuZXJhdG9yLnByb3RvdHlwZSA9XHJcbi8vIHtcclxuLy8gICBrZXlvbjogZnVuY3Rpb24gKHQsdmVsKSB7XHJcbi8vICAgICB0aGlzLnYgPSB2ZWwgfHwgMS4wO1xyXG4vLyAgICAgdmFyIHYgPSB0aGlzLnY7XHJcbi8vICAgICB2YXIgdDAgPSB0IHx8IHRoaXMudm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbi8vICAgICB2YXIgdDEgPSB0MCArIHRoaXMuYXR0YWNrICogdjtcclxuLy8gICAgIHZhciBnYWluID0gdGhpcy52b2ljZS5nYWluLmdhaW47XHJcbi8vICAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbi8vICAgICBnYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwKTtcclxuLy8gICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodiwgdDEpO1xyXG4vLyAgICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MCArIHRoaXMuZGVjYXkgLyB2KTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDEsIHQxICsgdGhpcy5kZWNheSAvIHYpO1xyXG4vLyAgIH0sXHJcbi8vICAga2V5b2ZmOiBmdW5jdGlvbiAodCkge1xyXG4vLyAgICAgdmFyIHZvaWNlID0gdGhpcy52b2ljZTtcclxuLy8gICAgIHZhciBnYWluID0gdm9pY2UuZ2Fpbi5nYWluO1xyXG4vLyAgICAgdmFyIHQwID0gdCB8fCB2b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuLy8gICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbi8vICAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKDAsIHQwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbi8vICAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICB9XHJcbi8vIH07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0IHtpbml0VUksZHJhdyxzdmcgfSBmcm9tICcuL2RyYXcnO1xyXG5cclxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcclxuXHRhdWRpby5jdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XHJcblx0ZDMuc2VsZWN0KHdpbmRvdylcclxuXHQub24oJ3Jlc2l6ZScsZnVuY3Rpb24oKXtcclxuXHRcdGlmKHN2Zyl7XHJcblx0XHRcdHN2Zy5hdHRyKHtcclxuXHRcdFx0XHR3aWR0aDp3aW5kb3cuaW5uZXJXaWR0aCxcclxuXHRcdFx0XHRoZWlnaHQ6d2luZG93LmlubmVySGVpZ2h0XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cclxuXHRpbml0VUkoKTtcclxuXHRkcmF3KCk7XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aS5qcyc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFNlcXVlbmNlRWRpdG9yIHtcclxuXHRcclxufVxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93U2VxdWVuY2VFZGl0b3IoZClcclxue1xyXG5cdCBkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdCBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdCBkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdCBpZihkLnBhbmVsICYmIGQucGFuZWwuaXNTaG93KSByZXR1cm47XHJcblx0IFxyXG5cdCBkLnBhbmVsID0gbmV3IHVpLlBhbmVsKCk7XHJcblx0IGQucGFuZWwueCA9IGQueDtcclxuXHQgZC5wYW5lbC55ID0gZC55O1xyXG5cdCBkLnBhbmVsLndpZHRoID0gMTAyNDtcclxuXHQgZC5wYW5lbC5oZWlnaHQgPSA3Njg7XHJcblx0IGQucGFuZWwuaGVhZGVyLnRleHQoJ1NlcXVlbmNlIEVkaXRvcicpO1xyXG5cdCB2YXIgZGl2ID0gZC5wYW5lbC5hcnRpY2xlLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnc2VxLWVkaXRvcicsdHJ1ZSk7XHJcblx0IGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdUaW1lIEJhc2U6Jyk7XHJcblx0IGRpdi5hcHBlbmQoJ2lucHV0JylcclxuXHQgLmRhdHVtKGQpXHJcblx0IC5hdHRyKHsndHlwZSc6J3RleHQnLCdzaXplJzonMyd9KVxyXG5cdCAuYXR0cigndmFsdWUnLChkKT0+ZC5hdWRpb05vZGUudHBiKVxyXG5cdCAub24oJ2NoYW5nZScsZnVuY3Rpb24oZCl7XHJcblx0XHQgZC5hdWRpb05vZGUudHBiID0gZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJyk7XHJcblx0IH0pO1xyXG5cclxuXHQgZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJ1RlbXBvOicpO1xyXG5cdCBkaXYuYXBwZW5kKCdpbnB1dCcpXHJcblx0IC5kYXR1bShkKVxyXG5cdCAuYXR0cih7J3R5cGUnOid0ZXh0Jywnc2l6ZSc6JzMnfSlcclxuXHQgLmF0dHIoJ3ZhbHVlJywoZCk9PmQuYXVkaW9Ob2RlLmJwbSlcclxuXHQgLm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0IGQuYXVkaW9Ob2RlLmJwbSA9IGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpO1xyXG5cdCB9KTtcclxuXHQgXHJcblx0IFxyXG5cdCBkLnBhbmVsLnNob3coKTtcclxuXHQgXHJcbn0iLCJpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihzdGVwKXtcclxuXHRcdHRoaXMuc3RlcCA9IHN0ZXA7IFxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSlcclxue1xyXG5cdGF1ZGlvUGFyYW0uc2V0VmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZShhdWRpb1BhcmFtLHZhbHVlLHRpbWUpe1xyXG5cdGF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSl7XHJcblx0YXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2YWx1ZSx0aW1lKTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tYW5kIHtcclxuXHRjb25zdHJ1Y3RvcihwaXRjaENvbW1hbmQgPSBzZXRWYWx1ZUF0VGltZSx2ZWxvY2l0eUNvbW1hbmQgPSBzZXRWYWx1ZUF0VGltZSlcclxuXHR7XHJcblx0XHR0aGlzLnByb2Nlc3NQaXRjaCA9IHBpdGNoQ29tbWFuZC5iaW5kKHRoaXMpO1xyXG5cdFx0dGhpcy5wcm9jZXNzVmVsb2NpdHkgPSB2ZWxvY2l0eUNvbW1hbmQuYmluZCh0aGlzKTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOb3RlRXZlbnQgZXh0ZW5kcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHN0ZXAgPSA5Nixub3RlID0gNjQsZ2F0ZSA9IDQ4LHZlbCA9IDEuMCxjb21tYW5kID0gbmV3IENvbW1hbmQoKSl7XHJcblx0XHRzdXBlcihzdGVwKTtcclxuXHRcdHRoaXMubm90ZV8gPSBub3RlO1xyXG5cdFx0dGhpcy5jYWxjUGl0Y2goKTtcclxuXHRcdHRoaXMuZ2F0ZSA9IGdhdGU7XHJcblx0XHR0aGlzLnZlbCA9IHZlbDtcclxuXHRcdHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XHJcblx0XHR0aGlzLmNvbW1hbmQuZXZlbnQgPSB0aGlzO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgbm90ZSAoKXtcclxuXHRcdCByZXR1cm4gdGhpcy5ub3RlXztcclxuXHR9XHJcblx0c2V0IG5vdGUodil7XHJcblx0XHQgdGhpcy5ub3RlXyA9IHY7XHJcblx0XHQgdGhpcy5jYWxjUGl0Y2goKTtcclxuXHR9XHJcblx0XHJcblx0Y2FsY1BpdGNoKCl7XHJcblx0XHR0aGlzLnBpdGNoID0gKDQ0MC4wIC8gMzIuMCkgKiAoTWF0aC5wb3coMi4wLCgodGhpcy5ub3RlXyAtIDkpIC8gMTIpKSk7XHJcblx0fVxyXG5cdFxyXG5cdHByb2Nlc3ModGltZSx0cmFjayl7XHJcblx0XHRcdGlmKHRoaXMubm90ZSl7XHJcblx0XHRcdFx0Zm9yKGxldCBqID0gMCxqZSA9IHRyYWNrLnBpdGNoZXMubGVuZ3RoO2ogPCBqZTsrK2ope1xyXG5cdFx0XHRcdFx0dHJhY2sucGl0Y2hlc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCx0aGlzLnBpdGNoLHRpbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IobGV0IGogPSAwLGplID0gdHJhY2sudmVsb2NpdGllcy5sZW5ndGg7aiA8IGplOysrail7XHJcblx0XHRcdFx0XHQvLyBrZXlvblxyXG5cdFx0XHRcdFx0dHJhY2sudmVsb2NpdGllc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCx0aGlzLnZlbCx0aW1lKTtcclxuXHRcdFx0XHRcdC8vIGtleW9mZlxyXG5cdFx0XHRcdFx0dHJhY2sudmVsb2NpdGllc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCwwLHRpbWUgKyB0aGlzLmdhdGUgKiB0cmFjay5zZXF1ZW5jZXIuc3RlcFRpbWVfICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVHJhY2sge1xyXG5cdGNvbnN0cnVjdG9yKHNlcXVlbmNlcil7XHJcblx0XHR0aGlzLmV2ZW50cyA9IFtdO1xyXG5cdFx0dGhpcy5wb2ludGVyID0gMDtcclxuXHRcdHRoaXMuc3RlcCA9IDA7XHJcblx0XHR0aGlzLmVuZCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5waXRjaGVzID0gW107XHJcblx0XHR0aGlzLnZlbG9jaXRpZXMgPSBbXTtcclxuXHRcdHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFNFUV9TVEFUVVMgPSB7XHJcblx0U1RPUFBFRDowLFxyXG5cdFBMQVlJTkc6MSxcclxuXHRQQVVTRUQ6MlxyXG59IDtcclxuXHJcbmV4cG9ydCBjb25zdCBOVU1fT0ZfVFJBQ0tTID0gNDtcclxuXHJcbmV4cG9ydCBjbGFzcyBTZXF1ZW5jZXIge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHR0aGlzLmJwbV8gPSAxMjAuMDsgLy8gdGVtcG9cclxuXHRcdHRoaXMudHBiXyA9IDk2LjA7IC8vIOWbm+WIhumfs+espuOBruino+WDj+W6plxyXG5cdFx0dGhpcy5iZWF0ID0gNDtcclxuXHRcdHRoaXMuYmFyID0gNDsgLy8gXHJcblx0XHR0aGlzLnRyYWNrcyA9IFtdO1xyXG5cdFx0dGhpcy5udW1iZXJPZklucHV0cyA9IDA7XHJcblx0XHR0aGlzLm51bWJlck9mT3V0cHV0cyA9IDA7XHJcblx0XHR0aGlzLm5hbWUgPSAnU2VxdWVuY2VyJztcclxuXHRcdGZvciAodmFyIGkgPSAwO2kgPCBOVU1fT0ZfVFJBQ0tTOysraSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy50cmFja3MucHVzaChuZXcgVHJhY2sodGhpcykpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdnJ10gPSBuZXcgYXVkaW8uUGFyYW1WaWV3KG51bGwsJ3RyaycgKyBpICsgJ2cnLHRydWUpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdnJ10udHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddLnR5cGUgPSAnZ2F0ZSc7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdwJ10gPSBuZXcgYXVkaW8uUGFyYW1WaWV3KG51bGwsJ3RyaycgKyBpICsgJ3AnLHRydWUpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdwJ10udHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddLnR5cGUgPSAncGl0Y2gnO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5zdGFydFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY3VycmVudFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY2FsY1N0ZXBUaW1lKCk7XHJcblx0XHR0aGlzLnJlcGVhdCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMucHVzaCh0aGlzKTtcclxuXHRcdGlmKFNlcXVlbmNlci5hZGRlZCl7XHJcblx0XHRcdFNlcXVlbmNlci5hZGRlZCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRnZXQgdHBiKCl7XHJcblx0XHRyZXR1cm4gdGhpcy50cGJfO1xyXG5cdH1cclxuXHRcclxuXHRzZXQgdHBiKHYpe1xyXG5cdFx0dGhpcy50cGJfID0gdjtcclxuXHRcdHRoaXMuY2FsY1N0ZXBUaW1lKCk7XHJcblx0fVxyXG5cdFxyXG5cdGdldCBicG0oKXtcclxuXHRcdHJldHVybiB0aGlzLmJwbV87XHJcblx0fVxyXG5cdFxyXG5cdHNldCBicG0odil7XHJcblx0XHR0aGlzLmJwbV8gPSB2O1xyXG5cdFx0dGhpcy5jYWxjU3RlcFRpbWUoKTtcclxuXHR9XHJcblx0XHJcblx0ZGlzcG9zZSgpe1xyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoOysraSlcclxuXHRcdHtcclxuXHRcdFx0aWYodGhpcyA9PT0gU2VxdWVuY2VyLnNlcXVlbmNlcnNbaV0pe1xyXG5cdFx0XHRcdCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zcGxpY2UoaSwxKTtcclxuXHRcdFx0XHQgYnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoID09IDApXHJcblx0XHR7XHJcblx0XHRcdGlmKFNlcXVlbmNlci5lbXB0eSl7XHJcblx0XHRcdFx0U2VxdWVuY2VyLmVtcHR5KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Y2FsY1N0ZXBUaW1lKCl7XHJcblx0XHR0aGlzLnN0ZXBUaW1lXyA9IDYwLjAgLyAoIHRoaXMuYnBtICogdGhpcy50cGIpOyBcclxuXHR9XHJcblx0XHJcblx0c3RhcnQodGltZSl7XHJcblx0XHRpZih0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5TVE9QUEVEIHx8IHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBBVVNFRCApe1xyXG5cdFx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IHRpbWUgfHwgYXVkaW8uY3R4LmN1cnJlbnRUaW1lKCk7XHJcblx0XHRcdHRoaXMuc3RhcnRUaW1lXyAgPSB0aGlzLmN1cnJlbnRUaW1lXztcclxuXHRcdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5QTEFZSU5HO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRzdG9wKCl7XHJcblx0XHRpZih0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QTEFZSU5HIHx8IHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBBVVNFRClcclxuXHRcdHtcclxuXHRcdFx0dGhpcy50cmFja3MuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnBpdGNoZXMuZm9yRWFjaCgocCk9PntcclxuXHRcdFx0XHRcdHAuc3RvcCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdGQudmVsb2NpdGllcy5mb3JFYWNoKCh2KT0+e1xyXG5cdFx0XHRcdFx0di5zdG9wKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cdFx0XHR0aGlzLnJlc2V0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwYXVzZSgpe1xyXG5cdFx0aWYodGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuUEFVU0VEO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXNldCgpe1xyXG5cdFx0dGhpcy5zdGFydFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY3VycmVudFRpbWVfID0gMDtcclxuXHRcdHRoaXMudHJhY2tzLmZvckVhY2goKHRyYWNrKT0+e1xyXG5cdFx0XHR0cmFjay5lbmQgPSAhdHJhY2suZXZlbnRzLmxlbmd0aDtcclxuXHRcdFx0dHJhY2suc3RlcCA9IDA7XHJcblx0XHRcdHRyYWNrLnBvaW50ZXIgPSAwO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLmNhbGNTdGVwVGltZSgpO1xyXG5cdH1cclxuICAvLyDjgrfjg7zjgrHjg7PjgrXjg7zjga7lh6bnkIZcclxuXHRwcm9jZXNzICh0aW1lKVxyXG5cdHtcclxuXHRcdHRoaXMuY3VycmVudFRpbWVfID0gdGltZSB8fCBhdWRpby5jdHguY3VycmVudFRpbWUoKTtcclxuXHRcdHZhciBjdXJyZW50U3RlcCA9ICh0aGlzLmN1cnJlbnRUaW1lXyAgLSB0aGlzLnN0YXJ0VGltZV8gKyAwLjEpIC8gdGhpcy5zdGVwVGltZV87XHJcblx0XHRsZXQgZW5kY291bnQgPSAwO1xyXG5cdFx0Zm9yKHZhciBpID0gMCxsID0gdGhpcy50cmFja3MubGVuZ3RoO2kgPCBsOysraSl7XHJcblx0XHRcdHZhciB0cmFjayA9IHRoaXMudHJhY2tzW2ldO1xyXG5cdFx0XHRpZighdHJhY2suZW5kKXtcclxuXHRcdFx0XHR3aGlsZSh0cmFjay5zdGVwIDw9IGN1cnJlbnRTdGVwICYmICF0cmFjay5lbmQgKXtcclxuXHRcdFx0XHRcdGlmKHRyYWNrLnBvaW50ZXIgPj0gdHJhY2suZXZlbnRzLmxlbmd0aCApe1xyXG5cdFx0XHRcdFx0XHR0cmFjay5lbmQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHZhciBldmVudCA9IHRyYWNrLmV2ZW50c1t0cmFjay5wb2ludGVyKytdO1xyXG5cdFx0XHRcdFx0XHR2YXIgcGxheVRpbWUgPSB0cmFjay5zdGVwICogdGhpcy5zdGVwVGltZV8gKyB0aGlzLnN0YXJ0VGltZV87XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByb2Nlc3MocGxheVRpbWUsdHJhY2spO1xyXG5cdFx0XHRcdFx0XHR0cmFjay5zdGVwICs9IGV2ZW50LnN0ZXA7XHJcbi8vXHRcdFx0XHRcdGNvbnNvbGUubG9nKHRyYWNrLnBvaW50ZXIsdHJhY2suZXZlbnRzLmxlbmd0aCx0cmFjay5ldmVudHNbdHJhY2sucG9pbnRlcl0sdHJhY2suc3RlcCxjdXJyZW50U3RlcCx0aGlzLmN1cnJlbnRUaW1lXyxwbGF5VGltZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCsrZW5kY291bnQ7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGVuZGNvdW50ID09IHRoaXMudHJhY2tzLmxlbmd0aCl7XHJcblx0XHRcdHRoaXMuc3RvcCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDmjqXntppcclxuXHRjb25uZWN0KGMpe1xyXG5cdFx0dmFyIHRyYWNrID0gYy5mcm9tLnBhcmFtLnRyYWNrO1xyXG5cdFx0aWYoYy5mcm9tLnBhcmFtLnR5cGUgPT09ICdwaXRjaCcpe1xyXG5cdFx0XHR0cmFjay5waXRjaGVzLnB1c2goU2VxdWVuY2VyLm1ha2VQcm9jZXNzKGMpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRyYWNrLnZlbG9jaXRpZXMucHVzaChTZXF1ZW5jZXIubWFrZVByb2Nlc3MoYykpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDliYrpmaRcclxuXHRkaXNjb25uZWN0KGMpe1xyXG5cdFx0dmFyIHRyYWNrID0gYy5mcm9tLnBhcmFtLnRyYWNrO1xyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdHJhY2sucGl0Y2hlcy5sZW5ndGg7KytpKXtcclxuXHRcdFx0aWYoYy50by5ub2RlID09PSB0cmFjay5waXRjaGVzW2ldLnRvLm5vZGUgJiYgYy50by5wYXJhbSA9PT0gdHJhY2sucGl0Y2hlc1tpXS50by5wYXJhbSl7XHJcblx0XHRcdFx0dHJhY2sucGl0Y2hlcy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdHJhY2sudmVsb2NpdGllcy5sZW5ndGg7KytpKXtcclxuXHRcdFx0aWYoYy50by5ub2RlID09PSB0cmFjay52ZWxvY2l0aWVzW2ldLnRvLm5vZGUgJiYgYy50by5wYXJhbSA9PT0gdHJhY2sudmVsb2NpdGllc1tpXS50by5wYXJhbSl7XHJcblx0XHRcdFx0dHJhY2sucGl0Y2hlcy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgbWFrZVByb2Nlc3MoYyl7XHJcblx0XHRpZihjLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0cmV0dXJuICB7XHJcblx0XHRcdFx0dG86Yy50byxcclxuXHRcdFx0XHRwcm9jZXNzOiAoY29tLHYsdCk9PntcclxuXHRcdFx0XHRcdGMudG8ubm9kZS5hdWRpb05vZGUucHJvY2VzcyhjLnRvLGNvbSx2LHQpO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c3RvcDpmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0Yy50by5ub2RlLmF1ZGlvTm9kZS5zdG9wKGMudG8pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdH0gXHJcblx0XHR2YXIgcHJvY2VzcztcclxuXHRcdGlmKGMudG8ucGFyYW0udHlwZSA9PT0gJ3BpdGNoJyl7XHJcblx0XHRcdHByb2Nlc3MgPSAoY29tLHYsdCkgPT4ge1xyXG5cdFx0XHRcdGNvbS5wcm9jZXNzUGl0Y2goYy50by5wYXJhbS5hdWRpb1BhcmFtLHYsdCk7XHJcblx0XHRcdH07XHRcdFx0XHRcdFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cHJvY2VzcyA9XHQoY29tLHYsdCk9PntcclxuXHRcdFx0XHRjb20ucHJvY2Vzc1ZlbG9jaXR5KGMudG8ucGFyYW0uYXVkaW9QYXJhbSx2LHQpO1xyXG5cdFx0XHR9O1x0XHRcdFx0XHRcclxuXHRcdH1cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHRvOmMudG8sXHJcblx0XHRcdHByb2Nlc3M6cHJvY2VzcyxcclxuXHRcdFx0c3RvcDpmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGMudG8ucGFyYW0uYXVkaW9QYXJhbS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgZXhlYygpXHJcblx0e1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoU2VxdWVuY2VyLmV4ZWMpO1xyXG5cdFx0XHRsZXQgZW5kY291bnQgPSAwO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwLGUgPSBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGg7aSA8IGU7KytpKXtcclxuXHRcdFx0XHR2YXIgc2VxID0gU2VxdWVuY2VyLnNlcXVlbmNlcnNbaV07XHJcblx0XHRcdFx0aWYoc2VxLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0XHRcdHNlcS5wcm9jZXNzKGF1ZGlvLmN0eC5jdXJyZW50VGltZSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHNlcS5zdGF0dXNfID09IFNFUV9TVEFUVVMuU1RPUFBFRCl7XHJcblx0XHRcdFx0XHQrK2VuZGNvdW50O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZihlbmRjb3VudCA9PSBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRTZXF1ZW5jZXIuc3RvcFNlcXVlbmNlcygpO1xyXG5cdFx0XHRcdGlmKFNlcXVlbmNlci5zdG9wcGVkKXtcclxuXHRcdFx0XHRcdFNlcXVlbmNlci5zdG9wcGVkKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOOCt+ODvOOCseODs+OCueWFqOS9k+OBruOCueOCv+ODvOODiFxyXG5cdHN0YXRpYyBzdGFydFNlcXVlbmNlcyh0aW1lKXtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlNUT1BQRUQgfHwgU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUEFVU0VEIClcclxuXHRcdHtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnN0YXJ0KHRpbWUpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5QTEFZSU5HO1xyXG5cdFx0XHRTZXF1ZW5jZXIuZXhlYygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvLyDjgrfjg7zjgrHjg7PjgrnlhajkvZPjga7lgZzmraJcclxuXHRzdGF0aWMgc3RvcFNlcXVlbmNlcygpe1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUExBWUlORyB8fCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QQVVTRUQgKXtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnN0b3AoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuU1RPUFBFRDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIOOCt+ODvOOCseODs+OCueWFqOS9k+OBruODneODvOOCulx0XHJcblx0c3RhdGljIHBhdXNlU2VxdWVuY2VzKCl7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnBhdXNlKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlBBVVNFRDtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcblNlcXVlbmNlci5zZXF1ZW5jZXJzID0gW107XHJcblNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuU1RPUFBFRDsgXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IFVVSUQgZnJvbSAnLi91dWlkLmNvcmUnO1xyXG5leHBvcnQgY29uc3Qgbm9kZUhlaWdodCA9IDUwO1xyXG5leHBvcnQgY29uc3Qgbm9kZVdpZHRoID0gMTAwO1xyXG5leHBvcnQgY29uc3QgcG9pbnRTaXplID0gMTY7XHJcblxyXG4vLyBwYW5lbCB3aW5kb3dcclxuZXhwb3J0IGNsYXNzIFBhbmVsIHtcclxuXHRjb25zdHJ1Y3RvcihzZWwscHJvcCl7XHJcblx0XHRpZighcHJvcCB8fCAhcHJvcC5pZCl7XHJcblx0XHRcdHByb3AgPSBwcm9wID8gKHByb3AuaWQgPSAnaWQtJyArIFVVSUQuZ2VuZXJhdGUoKSxwcm9wKSA6eyBpZDonaWQtJyArIFVVSUQuZ2VuZXJhdGUoKX07XHJcblx0XHR9XHJcblx0XHR0aGlzLmlkID0gcHJvcC5pZDtcclxuXHRcdHNlbCA9IHNlbCB8fCBkMy5zZWxlY3QoJyNjb250ZW50Jyk7XHJcblx0XHR0aGlzLnNlbGVjdGlvbiA9IFxyXG5cdFx0c2VsXHJcblx0XHQuYXBwZW5kKCdkaXYnKVxyXG5cdFx0LmF0dHIocHJvcClcclxuXHRcdC5hdHRyKCdjbGFzcycsJ3BhbmVsJylcclxuXHRcdC5kYXR1bSh0aGlzKTtcclxuXHJcblx0XHQvLyDjg5Hjg43jg6vnlKhEcmFn44Gd44Gu5LuWXHJcblxyXG5cdFx0dGhpcy5oZWFkZXIgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2hlYWRlcicpLmNhbGwodGhpcy5kcmFnKTtcclxuXHRcdHRoaXMuYXJ0aWNsZSA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnYXJ0aWNsZScpO1xyXG5cdFx0dGhpcy5mb290ZXIgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2Zvb3RlcicpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdkaXYnKVxyXG5cdFx0LmNsYXNzZWQoJ3BhbmVsLWNsb3NlJyx0cnVlKVxyXG5cdFx0Lm9uKCdjbGljaycsKCk9PntcclxuXHRcdFx0dGhpcy5kaXNwb3NlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0fVx0XHJcblxyXG5cdGdldCBub2RlKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc2VsZWN0aW9uLm5vZGUoKTtcclxuXHR9XHJcblx0Z2V0IHggKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnbGVmdCcpKTtcclxuXHR9XHJcblx0c2V0IHggKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2xlZnQnLHYgKyAncHgnKTtcclxuXHR9XHJcblx0Z2V0IHkgKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgndG9wJykpO1xyXG5cdH1cclxuXHRzZXQgeSAodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndG9wJyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCB3aWR0aCgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3dpZHRoJykpO1xyXG5cdH1cclxuXHRzZXQgd2lkdGgodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnd2lkdGgnLCB2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCBoZWlnaHQoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdoZWlnaHQnKSk7XHJcblx0fVxyXG5cdHNldCBoZWlnaHQodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnaGVpZ2h0Jyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdFxyXG5cdGRpc3Bvc2UoKXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlbW92ZSgpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRzaG93KCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScsJ3Zpc2libGUnKTtcclxuXHR9XHJcblxyXG5cdGhpZGUoKXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd2aXNpYmlsaXR5JywnaGlkZGVuJyk7XHJcblx0fVxyXG5cdFxyXG5cdGdldCBpc1Nob3coKXtcclxuXHRcdHJldHVybiB0aGlzLnNlbGVjdGlvbiAmJiB0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScpID09PSAndmlzaWJsZSc7XHJcblx0fVxyXG59XHJcblxyXG5QYW5lbC5wcm90b3R5cGUuZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKVxyXG5cdFx0Lm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyhkKTtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QoJyMnICsgZC5pZCk7XHJcblx0XHRcclxuXHRcdGQzLnNlbGVjdCgnI2NvbnRlbnQnKVxyXG5cdFx0LmFwcGVuZCgnZGl2JylcclxuXHRcdC5hdHRyKHtpZDoncGFuZWwtZHVtbXktJyArIGQuaWQsXHJcblx0XHRcdCdjbGFzcyc6J3BhbmVsIHBhbmVsLWR1bW15J30pXHJcblx0XHQuc3R5bGUoe1xyXG5cdFx0XHRsZWZ0OnNlbC5zdHlsZSgnbGVmdCcpLFxyXG5cdFx0XHR0b3A6c2VsLnN0eWxlKCd0b3AnKSxcclxuXHRcdFx0d2lkdGg6c2VsLnN0eWxlKCd3aWR0aCcpLFxyXG5cdFx0XHRoZWlnaHQ6c2VsLnN0eWxlKCdoZWlnaHQnKVxyXG5cdFx0fSk7XHJcblx0fSlcclxuXHQub24oXCJkcmFnXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgZHVtbXkgPSBkMy5zZWxlY3QoJyNwYW5lbC1kdW1teS0nICsgZC5pZCk7XHJcblxyXG5cdFx0dmFyIHggPSBwYXJzZUZsb2F0KGR1bW15LnN0eWxlKCdsZWZ0JykpICsgZDMuZXZlbnQuZHg7XHJcblx0XHR2YXIgeSA9IHBhcnNlRmxvYXQoZHVtbXkuc3R5bGUoJ3RvcCcpKSArIGQzLmV2ZW50LmR5O1xyXG5cdFx0XHJcblx0XHRkdW1teS5zdHlsZSh7J2xlZnQnOnggKyAncHgnLCd0b3AnOnkgKyAncHgnfSk7XHJcblx0fSlcclxuXHQub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCgnIycgKyBkLmlkKTtcclxuXHRcdHZhciBkdW1teSA9IGQzLnNlbGVjdCgnI3BhbmVsLWR1bW15LScgKyBkLmlkKTtcclxuXHRcdHNlbC5zdHlsZShcclxuXHRcdFx0eydsZWZ0JzpkdW1teS5zdHlsZSgnbGVmdCcpLCd0b3AnOmR1bW15LnN0eWxlKCd0b3AnKX1cclxuXHRcdCk7XHJcblx0XHRkdW1teS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHRcclxuIiwiLypcbiBWZXJzaW9uOiBjb3JlLTEuMFxuIFRoZSBNSVQgTGljZW5zZTogQ29weXJpZ2h0IChjKSAyMDEyIExpb3NLLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFVVSUQoKXt9VVVJRC5nZW5lcmF0ZT1mdW5jdGlvbigpe3ZhciBhPVVVSUQuX2dyaSxiPVVVSUQuX2hhO3JldHVybiBiKGEoMzIpLDgpK1wiLVwiK2IoYSgxNiksNCkrXCItXCIrYigxNjM4NHxhKDEyKSw0KStcIi1cIitiKDMyNzY4fGEoMTQpLDQpK1wiLVwiK2IoYSg0OCksMTIpfTtVVUlELl9ncmk9ZnVuY3Rpb24oYSl7cmV0dXJuIDA+YT9OYU46MzA+PWE/MHxNYXRoLnJhbmRvbSgpKigxPDxhKTo1Mz49YT8oMHwxMDczNzQxODI0Kk1hdGgucmFuZG9tKCkpKzEwNzM3NDE4MjQqKDB8TWF0aC5yYW5kb20oKSooMTw8YS0zMCkpOk5hTn07VVVJRC5faGE9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9YS50b1N0cmluZygxNiksZD1iLWMubGVuZ3RoLGU9XCIwXCI7MDxkO2Q+Pj49MSxlKz1lKWQmMSYmKGM9ZStjKTtyZXR1cm4gY307XG4iXX0=
