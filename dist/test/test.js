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

},{"./audioNodeView":2,"./eg":4,"./sequencer.js":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

	function AudioNodeView(audioNode) {
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
	}

	// 1つだけだとノードの削除で2つの場合はコネクションの削除

	_createClass(AudioNodeView, null, [{
		key: 'remove',
		value: function remove(node) {
			if (!node.removable) {
				throw new Error('削除できないノードです。');
			}
			// ノードの削除
			for (var i = 0; i < AudioNodeView.audioNodes.length; ++i) {
				if (AudioNodeView.audioNodes[i] === node) {
					AudioNodeView.audioNodes.splice(i--, 1);
				}
			}

			for (var i = 0; i < AudioNodeView.audioConnections.length; ++i) {
				var n = AudioNodeView.audioConnections[i];
				var disconnected = false;
				if (n.from.node === node) {
					if (n.from.param instanceof ParamView) {
						n.from.node.audioNode.disconnect(n);
					} else if (n.to.param) {
						// toパラメータあり
						if (n.to.param instanceof AudioParamView) {
							// AUdioParam
							if (n.from.param) {
								// fromパラメータあり
								n.from.node.audioNode.disconnect(n.to.param.audioParam, n.from.param);
								disconnected = true;
							} else {
								// fromパラメータなし
								n.from.node.audioNode.disconnect(n.to.param.audioParam);
								disconnected = true;
							}
						} else {
							// n.to.paramが数字
							if (n.from.param) {
								// fromパラメータあり
								if (n.from.param instanceof ParamView) {
									n.from.node.audioNode.disconnect(n);
								} else {
									n.from.node.audioNode.disconnect(n.to.node.audioNode, n.from.param, n.to.param);
								}
								disconnected = true;
							} else {
								// fromパラメータなし
								n.from.node.audioNode.disconnect(n.to.node.audioNode, 0, n.to.param);
								disconnected = true;
							}
						}
					} else {
						// to パラメータなし
						if (n.from.param) {
							// fromパラメータあり
							n.from.node.audioNode.disconnect(n.to.node.audioNode, n.from.param);
							disconnected = true;
						} else {
							// fromパラメータなし
							n.from.node.audioNode.disconnect(n.to.node.audioNode);
							disconnected = true;
						}
					}
				}

				if (n.to.node === node) {
					// from パラメータあり
					if (n.from.param) {
						if (n.from.param instanceof ParamView) {
							n.from.node.audioNode.disconnect(n);
						} else {
							if (n.to.param) {
								// to パラメータあり
								if (n.to.param instanceof AudioParamView) {
									// to パラメータがAudioParamView
									n.from.node.audioNode.disconnect(n.to.param.audioParam, n.from.param);
									disconnected = true;
								} else {
									// to パラメータが数字
									n.from.node.audioNode.disconnect(n.to.node.audioNode, n.from.param, n.to.param);
									disconnected = true;
								}
							} else {
								// to パラメータなし
								n.from.node.audioNode.disconnect(n.to.node.audioNode, n.from.param);
								disconnected = true;
							}
						}
					} else {
						// from パラメータなし
						if (n.to.param) {
							// to パラメータあり
							if (n.to.param instanceof AudioParamView) {
								// to パラメータがAudioParamView
								n.from.node.audioNode.disconnect(n.to.param.audioParam);
								disconnected = true;
							} else {
								// to パラメータが数字
								n.from.node.audioNode.disconnect(n.to.node.audioNode, 0, n.to.param);
								disconnected = true;
							}
						} else {
							// to パラメータなし
							n.from.node.audioNode.disconnect(n.to.node.audioNode);
							disconnected = true;
						}
					}
				}
				if (disconnected) {
					AudioNodeView.audioConnections.splice(i--, 1);
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
					if (con.from.param) {
						// fromパラメータあり
						if (con.from.param instanceof ParamView) {
							con.from.node.audioNode.disconnect(con);
						} else {
							if (con.to.param) {
								// to パラメータあり
								if (con.to.param instanceof AudioParamView) {
									// to AudioParamView
									con.from.node.disconnect(con.to.param.audioParam, con.from.param);
								} else if (con.to.param instanceof ParamView) {
									// to ParamView
									con.from.node.disconnect(con);
								} else {
									// to 数字
									con.from.node.disconnect(con.to.node.audioNode, con.from.param, con.to.param);
								}
							} else {
								// to パラメータなし
								con.from.node.disconnect(con.to.node.audioNode, con.from.param);
							}
						}
					} else {
						// fromパラメータなし
						if (con.to.param) {
							// to パラメータあり
							if (con.to.param instanceof AudioParamView) {
								// to AudioParamView
								con.from.node.disconnect(con.to.param.audioParam);
							} else {
								// to 数字
								con.from.node.disconnect(con.to.node.audioNode, 0, con.to.param);
							}
						} else {
							// to パラメータなし
							con.from.node.disconnect(con.to.node.audioNode);
						}
					}
				}
			}
		}
	}, {
		key: 'create',
		value: function create(audionode) {
			var obj = new AudioNodeView(audionode);
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

},{"./ui":6}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.initUI = initUI;
exports.draw = draw;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _uiJs = require('./ui.js');

var ui = _interopRequireWildcard(_uiJs);

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
				console.log('hit', elm);
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
		} }];

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
		showPanel.bind(this, d)();
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
			d.stop(0);
		} else if (d.statusPlay !== audio.STATUS_PLAY_PLAYED) {
			d.start(0);
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
		console.log(d3.event);
		var node = audio.AudioNodeView.create(dt.create());
		node.x = d3.event.clientX;
		node.y = d3.event.clientY;
		draw();
		// d3.select('#prop-panel').style('visibility','hidden');
		// d.panel.dispose();
	});
	d.panel.show();
}

},{"./audio":1,"./ui.js":6}],4:[function(require,module,exports){
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
		this.gate.connect_ = (function (param) {
			var _this = this;

			if (param.param instanceof audio.ParamView) {
				this.exec = function (p) {
					_this.param.push(param);
				};
			} else if (param.param instanceof audio.AudioNodeView) {}
		}).bind(this.gate);
		this.output = new audio.ParamView(this, 'output', true);
		this.numberOfInputs = 0;
		this.numberOfOutputs = 0;
		this.attack = 0.5;
		this.decay = 0.5;
		this.release = 0.5;
		this.sustain = 0.5;
		this.gain = 1.0;
		this.name = 'EG';
		audio.defIsNotAPIObj(this, false);
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
		value: function connect(to) {
			console.log('connect');
		}
	}, {
		key: 'disconnect',
		value: function disconnect(to) {}
	}]);

	return EG;
})();

exports.EG = EG;

},{"./audioNodeView":2}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _audioNodeView = require('./audioNodeView');

var audio = _interopRequireWildcard(_audioNodeView);

"use strict";

var EventBase = function EventBase(step) {
	_classCallCheck(this, EventBase);

	this.step = 0;
};

exports.EventBase = EventBase;

var NoteEvent = (function (_EventBase) {
	_inherits(NoteEvent, _EventBase);

	function NoteEvent() {
		var step = arguments.length <= 0 || arguments[0] === undefined ? 96 : arguments[0];
		var note = arguments.length <= 1 || arguments[1] === undefined ? 64 : arguments[1];
		var gate = arguments.length <= 2 || arguments[2] === undefined ? 48 : arguments[2];
		var vel = arguments.length <= 3 || arguments[3] === undefined ? 1.0 : arguments[3];
		var command = arguments.length <= 4 || arguments[4] === undefined ? 0 : arguments[4];

		_classCallCheck(this, NoteEvent);

		_get(Object.getPrototypeOf(NoteEvent.prototype), 'constructor', this).call(this, step);
		this.note_ = note;
		this.calcPitch();
		this.gate = gate;
		this.vel = vel;
		this.command = command;
	}

	_createClass(NoteEvent, [{
		key: 'calcPitch',
		value: function calcPitch() {
			this.pitch = 440.0 / 32.0 * Math.pow(2.0, (this.note_ - 9) / 12);
		}
	}, {
		key: 'process',
		value: function process(time, track) {
			for (var j = 0, je = track.pithces.length; j < je; ++j) {
				track.pitches[j].process(time, this.pitch);
			}
			for (var j = 0, je = track.velocities.length; j < je; ++j) {
				track.velocities[j].process(time, this.vel);
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

var Track = function Track() {
	_classCallCheck(this, Track);

	this.events = [];
	this.pointer = 0;
	this.step = 0;
	this.end = false;
	this.pitches = [];
	this.velocities = [];
};

exports.Track = Track;

var Sequencer = (function () {
	function Sequencer() {
		_classCallCheck(this, Sequencer);

		this.bpm = 120.0; // tempo
		this.tpb = 48.0; // 四分音符の解像度
		this.beat = 4;
		this.bar = 4; //
		this.tracks = [];
		this.numberOfInputs = 0;
		this.numberOfOutputs = 0;
		this.name = 'Sequencer';
		for (var i = 0; i < 16; ++i) {
			this.tracks.push(new Track());
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
	}

	_createClass(Sequencer, [{
		key: 'calcStepTime',
		value: function calcStepTime() {
			this.stepTime_ = 60.0 / (this.bpm * this.tpb);
		}
	}, {
		key: 'start',
		value: function start(time) {
			this.currentTime_ = time || audio.ctx.currentTime();
		}
	}, {
		key: 'stop',
		value: function stop() {}
	}, {
		key: 'pause',
		value: function pause() {}
	}, {
		key: 'reset',
		value: function reset() {
			this.startTime_ = 0;
			this.currentTime_ = 0;
			this.tracks.forEach(function (track) {
				track.end = false;
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
			for (var i = 0, l = this.tracks.length; i < l; ++i) {
				var track = this.tracks[i];
				while (track.step <= currentStep && !track.end) {
					if (track.pointer > track.events.length) {
						track.end = true;
						break;
					} else {
						var event = track.events[track.pointer++];
						track.step += event.step;
						var playTime = track.step * this.stepTime_ + this.currentTime_;
						event.process(playTime);
					}
				}
			}
		}
	}, {
		key: 'connect',
		value: function connect(c) {
			console.log('connect');
			var track = c.from.param.track;
			if (c.from.param.type === 'pitch') {
				track.pitches.push(makeProcess(c));
			} else {}
		}
	}, {
		key: 'disconnect',
		value: function disconnect(c) {}
	}], [{
		key: 'makeProcess',
		value: function makeProcess(c) {
			if (c.to.param instanceof audio.ParamView) {
				return {
					to: c.to,
					process: function process(t, v, com) {
						c.to.node.process(t, v, com, c.to);
					}
				};
			} else {
				return {
					to: c.to,
					process: function process(t, v, com) {
						com.process(t, v, c.to.param.audioParam);

						// switch(com)
						// {
						// 	case 0:
						// 		c.to.param.audioParam.setValueAtTime(t,v);
						// 		break;
						// 	break;
						// 		c.to.param.audioParam.linearRampToValueAtTime(t,v);
						// 		break;
						// 	case 1:
						// 		c.to.param.audioParam.exponentialRampToValueAtTime(t,v);
						// 	break;
						// 	case 2:
						// 		c.to.param.audioParam.cancelScheduledValues(t);
						// 	break;
						// }
					}
				};
			}
		}
	}]);

	return Sequencer;
})();

exports.Sequencer = Sequencer;

},{"./audioNodeView":2}],6:[function(require,module,exports){
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
		top: sel.style('top')
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

},{"./uuid.core":7}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
"use strict";

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _srcAudio = require('../src/audio');

var audio = _interopRequireWildcard(_srcAudio);

var _srcDraw = require('../src/draw');

describe('AudioNodeTest', function () {
	audio.ctx = new AudioContext();
	var osc, gain, filter, out, osc2, splitter, merger, eg;

	beforeEach(function () {});

	it("audio.AudioNodeView追加", function () {

		osc = audio.AudioNodeView.create(audio.ctx.createOscillator());
		osc.x = 100;
		osc.y = 200;

		gain = audio.AudioNodeView.create(audio.ctx.createGain());

		gain.x = 400;
		gain.y = 200;

		filter = audio.AudioNodeView.create(audio.ctx.createBiquadFilter());
		filter.x = 250;
		filter.y = 330;

		out = audio.AudioNodeView.create(audio.ctx.destination);
		out.x = 750;
		out.y = 300;

		osc2 = audio.AudioNodeView.create(audio.ctx.createOscillator());
		osc2.x = 100;
		osc2.y = 600;

		splitter = audio.AudioNodeView.create(audio.ctx.createChannelSplitter());
		splitter.x = 250;
		splitter.y = 600;

		merger = audio.AudioNodeView.create(audio.ctx.createChannelMerger());
		merger.x = 500;
		merger.y = 600;

		eg = audio.AudioNodeView.create(new audio.EG());

		expect(audio.AudioNodeView.audioNodes.length).toEqual(8);
	});

	it('コネクション追加後チェック', function () {

		audio.AudioNodeView.connect(osc, filter);
		audio.AudioNodeView.connect(osc, gain.inputParams[0]);

		audio.AudioNodeView.connect(filter, gain);
		audio.AudioNodeView.connect(gain, out);
		audio.AudioNodeView.connect(merger, out);
		audio.AudioNodeView.connect({ node: splitter, param: 0 }, { node: merger, param: 0 });
		audio.AudioNodeView.connect({ node: splitter, param: 1 }, { node: merger, param: 1 });
		audio.AudioNodeView.connect({ node: splitter, param: 2 }, { node: merger, param: 3 });
		audio.AudioNodeView.connect({ node: splitter, param: 3 }, { node: merger, param: 2 });
		audio.AudioNodeView.connect({ node: splitter, param: 5 }, { node: merger, param: 5 });
		audio.AudioNodeView.connect({ node: splitter, param: 4 }, { node: merger, param: 4 });
		audio.AudioNodeView.connect(osc2, splitter);

		audio.AudioNodeView.connect({ node: eg, param: eg.output }, { node: gain, param: gain.inputParams[0] });

		expect(audio.AudioNodeView.audioConnections.length).toEqual(13);
	});

	it('ノード削除', function () {
		audio.AudioNodeView.remove(osc);
		expect(audio.AudioNodeView.audioNodes.length).toEqual(7);
		expect(audio.AudioNodeView.audioConnections.length).toEqual(11);
	});

	it('コネクション削除', function () {
		audio.AudioNodeView.disconnect({ node: eg, param: eg.output }, { node: gain, param: gain.inputParams[0] });
		expect(audio.AudioNodeView.audioConnections.length).toEqual(10);
	});

	it('フィルター削除後チェック', function () {
		audio.AudioNodeView.remove(filter);
		expect(audio.AudioNodeView.audioNodes.length).toEqual(6);
		expect(audio.AudioNodeView.audioConnections.length).toEqual(9);
		expect((function () {
			var ret = 0;
			audio.AudioNodeView.audioConnections.forEach(function (d) {
				if (d.from.node === filter || d.to.node === filter) {
					++ret;
				}
			});
			return ret;
		})()).toEqual(0);
	});

	it('描画してみる', function () {
		//	osc.audioNode.type = 'sawtooth';
		osc.type = 'sawtooth';
		console.log(osc.type);
		osc.frequency.value = 440;
		// osc.start();
		// osc.stop(audio.ctx.currentTime + 0.1);
		(0, _srcDraw.initUI)();
		(0, _srcDraw.draw)();
		expect(true).toBe(true);
	});
});

},{"../src/audio":1,"../src/draw":3}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJFOi9wai9naXN0cy93ZWJhdWRpb21vZHVsZXIvc3JjL2F1ZGlvLmpzIiwiRTovcGovZ2lzdHMvd2ViYXVkaW9tb2R1bGVyL3NyYy9hdWRpb05vZGVWaWV3LmpzIiwiRTovcGovZ2lzdHMvd2ViYXVkaW9tb2R1bGVyL3NyYy9kcmF3LmpzIiwiRTovcGovZ2lzdHMvd2ViYXVkaW9tb2R1bGVyL3NyYy9lZy5qcyIsIkU6L3BqL2dpc3RzL3dlYmF1ZGlvbW9kdWxlci9zcmMvc2VxdWVuY2VyLmpzIiwiRTovcGovZ2lzdHMvd2ViYXVkaW9tb2R1bGVyL3NyYy91aS5qcyIsIkU6L3BqL2dpc3RzL3dlYmF1ZGlvbW9kdWxlci9zcmMvdXVpZC5jb3JlLmpzIiwiRTovcGovZ2lzdHMvd2ViYXVkaW9tb2R1bGVyL3Rlc3QvYXVkaW9Ob2RlVGVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7NkJDQWMsaUJBQWlCOzs7O2tCQUNqQixNQUFNOzs7OzJCQUNOLGdCQUFnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JDRlYsTUFBTTs7SUFBZCxFQUFFOztBQUVkLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNULElBQUksR0FBRyxDQUFDOzs7SUFDRixZQUFZLEdBQ2IsU0FEQyxZQUFZLEdBQ3dEO0tBQXBFLENBQUMseURBQUcsQ0FBQztLQUFFLENBQUMseURBQUcsQ0FBQztLQUFDLEtBQUsseURBQUcsRUFBRSxDQUFDLFNBQVM7S0FBQyxNQUFNLHlEQUFHLEVBQUUsQ0FBQyxVQUFVO0tBQUMsSUFBSSx5REFBRyxFQUFFOzt1QkFEbEUsWUFBWTs7QUFFdkIsS0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUU7QUFDWixLQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBRTtBQUNaLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FB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QUksQ0FBQztPQUNwQixNQUFNOztBQUVOLFFBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEQsbUJBQVksR0FBRyxJQUFJLENBQUM7T0FDcEI7TUFDRDtLQUNEOztBQUVELFFBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFDOztBQUVyQixTQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDO0FBQ2YsVUFBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxTQUFTLEVBQUU7QUFDckMsUUFBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNwQyxNQUFNO0FBQ04sV0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBQzs7QUFFYixZQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxZQUFZLGNBQWMsRUFBQzs7QUFFdkMsVUFBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNyRSxxQkFBWSxHQUFHLElBQUksQ0FBQztTQUNwQixNQUFNOztBQUVOLFVBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUUscUJBQVksR0FBRyxJQUFJLENBQUM7U0FDcEI7UUFDRCxNQUFNOztBQUVOLFNBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxV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QyxFQUFFLENBQUMsV0FBVyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQzFCLE1BQUksRUFBRSxZQUFBO01BQUMsRUFBRSxZQUFBLENBQUM7QUFDVixNQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUM7QUFDVixPQUFHLENBQUMsQ0FBQyxLQUFLLFlBQVksS0FBSyxDQUFDLFNBQVMsRUFBQztBQUNyQyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzdDLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDN0MsTUFBTTtBQUNOLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDakMsTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUN0RTtHQUNELE1BQU07QUFDTixLQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLEtBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7R0FDdkQ7O0FBRUQsR0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDcEIsR0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7O0FBRXBCLE1BQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25DLEdBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDdkIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUNSLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDZCxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLE9BQU8sRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDO0VBQzNDLENBQUMsQ0FDRCxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQ3hCLEdBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDcEIsR0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUNwQixHQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3BELENBQUMsQ0FDRCxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQzNCLE1BQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDbkIsTUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7O0FBR25CLE1BQUksU0FBUyxHQUFHLEtBQUssQ0FBQztBQUN0QixNQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE9BQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDekMsT0FBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLE9BQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN6QixPQUFJLElBQUksR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztBQUM3QixPQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO09BQzFDLElBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO09BQ3ZDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUs7T0FDckQsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzFELE9BQUcsT0FBTyxJQUFJLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJLE9BQU8sSUFBSSxJQUFHLElBQUksT0FBTyxJQUFJLE1BQU0sRUFDN0U7QUFDQyxXQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsQ0FBQztBQUN2QixRQUFJLEtBQUssR0FBRyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsS0FBSyxFQUFDLENBQUM7QUFDeEMsUUFBSSxH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QUFNLENBQUMsQ0FDbEIsSUFBSSxDQUFDLEVBQUMsQ0FBQyxFQUFFLFdBQUMsQ0FBQztXQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDO0lBQUMsRUFBQyxDQUFDLEVBQUMsV0FBQyxDQUFDO1dBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQUEsRUFBQyxPQUFPLEVBQUMsT0FBTyxFQUFFLENBQUMsQ0FDdEYsSUFBSSxDQUFDLFVBQUMsQ0FBQztVQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSTtHQUFBLENBQUMsQ0FBQzs7QUFFekIsS0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBRXBCLENBQUMsQ0FBQzs7O0FBR0gsR0FBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUN0QixTQUFPLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0VBQzdCLENBQUMsQ0FDRCxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFDaEIsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsTUFBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsZUFBZSxBQUFDLEFBQUMsRUFDNUU7QUFDQyxJQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDakIsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDdkMsS0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFDLENB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Q0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzVELE1BQU07QUFDTixNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDM0MsTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDMUY7R0FDRCxNQUFNO0FBQ04sS0FBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLEtBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7R0FDdEU7O0FBRUQsSUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLElBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs7QUFFeEMsTUFBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBQztBQUNiLE9BQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLFlBQVksS0FBSyxDQUFDLGNBQWMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssWUFBWSxLQUFLLENBQUMsU0FBUyxFQUFDO0FBQ3RGLE1BQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbkIsTUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuQixNQUFNO0FBQ04sTUFBRSxJQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDakQ7R0FDRCxNQUFNO0FBQ04sS0FBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztHQUM1Qjs7QUFFRCxNQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLENBQUM7O0FBRS9CLE1BQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO0FBQzFDLE1BQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQzFCLE9BQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUM7QUFDcEIsU0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDNUMsTUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQzdCLFFBQUksRUFBRSxDQUFDO0lBQ1A7R0FDRCxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7RUFFckMsQ0FBQyxDQUFDO0FBQ0gsR0FBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQ25COzs7QUFHRCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQ3BCO0FBQ0MsUUFBTyxVQUFTLENBQUMsRUFBQztBQUNqQixNQUFJLENBQ0gsRUFBRSxDQUFDLFlBQVksRUFBQyxZQUFVO0FBQzFCLE1BQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ2pCLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FDMUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ1gsQ0FBQyxDQUNELEVBQUUsQ0FBQyxZQUFZLEVBQUMsWUFBVTtBQUMxQixNQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQy9CLENBQUMsQ0FBQTtFQUNGLENBQUM7Q0FDRjs7O0FBR0QsU0FBUyxPQUFPLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDO0FBQzVCLFFBQU8sQ0FDTCxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxFQUNYLEVBQUMsQ0FBQyxFQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUEsR0FBRSxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsRUFBQyxFQUN6QixFQUFDLENBQUMsRUFBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBLEdBQUUsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBLEdBQUUsQ0FBQyxFQUFDLEVBQ3ZDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUEsR0FBRSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLEVBQUMsRUFDM0IsRUFBQyxDQUFDLEVBQUMsRUFBRSxFQUFFLENBQUMsRUFBQyxFQUFFLEVBQUMsQ0FDWixDQUFDO0NBQ0g7OztBQUdELFNBQVMsU0FBUyxDQUFDLENBQUMsRUFBQzs7QUFFcEIsR0FBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQzdCLEdBQUUsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUM3QixHQUFFLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUUxQixLQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsT0FBUTs7QUFFdEMsRUFBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN6QixFQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLEVBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsRUFBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFNUIsS0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzVDLEtBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakUsS0FBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZCxHQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUNkLElBQUksQ0FBQyxVQUFDLENBQUM7U0FBRyxDQUFDLENBQUMsSUFBSTtFQUFBLENBQUMsQ0FBQztBQUNuQixHQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUNkLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FDZixJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBQyxlQUFDLENBQUM7VUFBRyxDQUFDLENBQUMsR0FBRyxFQUFFO0dBQUEsRUFBQyxRQUFRLEVBQUMsa0JBQUMsQ0FBQztVQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUMsSUFBSSxHQUFDLFVBQVU7R0FBQSxFQUFDLENBQUMsQ0FDMUUsRUFBRSxDQUFDLFFBQVEsRUFBQyxVQUFTLENBQUMsRUFBQztBQUN2QixNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3ZCLE1BQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQixNQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBQztBQUNaLElBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDYixNQUFNO0FBQ04sSUFBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUNWO0VBQ0QsQ0FBQyxDQUFDO0FBQ0gsRUFBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUVmOzs7QUFHRCxTQUFTLGtCQUFrQixDQUFDLENBQUMsRUFBQztBQUM1QixHQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDN0IsR0FBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzs7QUFFM0IsS0FBRyxDQUFDLENBQUMsS0FBSyxFQUFDO0FBQ1YsTUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDaEIsT0FBTztFQUNSOztBQUVELEVBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDekIsRUFBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDN0IsRUFBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDN0IsRUFBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUVwQyxLQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDNUMsS0FBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDMUUsTUFBSyxDQUFDLEtBQUssRUFBRSxDQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FDWixNQUFNLENBQUMsSUFBSSxDQUFDLENBQ1osSUFBSSxDQUFDLFVBQUMsQ0FBQztTQUFHLENBQUMsQ0FBQyxJQUFJO0VBQUEsQ0FBQyxDQUNqQixFQUFFLENBQUMsT0FBTyxFQUFDLFVBQVMsRUFBRSxFQUFDO0FBQ3ZCLFNBQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RCLE1BQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELE1BQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDMUIsTUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztBQUMxQixNQUFJLEVBQUUsQ0FBQzs7O0VBR1AsQ0FBQyxDQUFDO0FBQ0gsRUFBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNmOzs7Ozs7Ozs7Ozs7Ozs7NkJDL2hCc0IsaUJBQWlCOztJQUE1QixLQUFLOztBQUNqQixZQUFZLENBQUM7O0lBRUEsRUFBRTtBQUNILFVBREMsRUFBRSxHQUNEO3dCQURELEVBQUU7O0FBRWIsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsQ0FBQztBQUNuRCxNQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLFVBQVMsS0FBSyxFQUFDOzs7QUFDcEMsT0FBRyxLQUFLLENBQUMsS0FBSyxZQUFZLEtBQUssQ0FBQyxTQUFTLEVBQUM7QUFDekMsUUFBSSxDQUFDLElBQUksR0FBRyxVQUFDLENBQUMsRUFBRztBQUNoQixXQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDdkIsQ0FBQTtJQUNELE1BQU0sSUFBRyxLQUFLLENBQUMsS0FBSyxZQUFZLEtBQUssQ0FBQyxhQUFhLEVBQUMsRUFFcEQ7R0FDRCxDQUFBLENBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuQixNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RELE1BQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLE1BQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLE1BQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLE1BQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ25CLE1BQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ25CLE1BQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ2hCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE9BQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ2pDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2NBdEJXLEVBQUU7O1NBd0JQLGlCQUFDLEVBQUUsRUFBQztBQUNWLFVBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDdkI7OztTQUVTLG9CQUFDLEVBQUUsRUFBQyxFQUViOzs7UUE5QlcsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2QkNIUSxpQkFBaUI7O0lBQTVCLEtBQUs7O0FBQ2pCLFlBQVksQ0FBQzs7SUFFQSxTQUFTLEdBQ1YsU0FEQyxTQUFTLENBQ1QsSUFBSSxFQUFDO3VCQURMLFNBQVM7O0FBRXBCLEtBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0NBQ2Q7Ozs7SUFHVyxTQUFTO1dBQVQsU0FBUzs7QUFDVixVQURDLFNBQVMsR0FDMkM7TUFBcEQsSUFBSSx5REFBRyxFQUFFO01BQUMsSUFBSSx5REFBRyxFQUFFO01BQUMsSUFBSSx5REFBRyxFQUFFO01BQUMsR0FBRyx5REFBRyxHQUFHO01BQUMsT0FBTyx5REFBRyxDQUFDOzt3QkFEbkQsU0FBUzs7QUFFcEIsNkJBRlcsU0FBUyw2Q0FFZCxJQUFJLEVBQUU7QUFDWixNQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixNQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDakIsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDZixNQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztFQUN2Qjs7Y0FSVyxTQUFTOztTQWtCWixxQkFBRTtBQUNWLE9BQUksQ0FBQyxLQUFLLEdBQUcsQUFBQyxLQUFLLEdBQUcsSUFBSSxHQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUEsR0FBSSxFQUFFLENBQUUsQUFBQyxDQUFDO0dBQ3RFOzs7U0FFTSxpQkFBQyxJQUFJLEVBQUMsS0FBSyxFQUFDO0FBQ2pCLFFBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUcsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQ2xELFNBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUM7QUFDRCxRQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFBQztBQUNyRCxTQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzNDO0dBQ0Y7OztPQW5CUSxlQUFFO0FBQ1QsVUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQ25CO09BQ08sYUFBQyxDQUFDLEVBQUM7QUFDVCxPQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLE9BQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztHQUNsQjs7O1FBaEJXLFNBQVM7R0FBUyxTQUFTOzs7O0lBZ0MzQixLQUFLLEdBQ04sU0FEQyxLQUFLLEdBQ0o7dUJBREQsS0FBSzs7QUFFaEIsS0FBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsS0FBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsS0FBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7QUFDZCxLQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztBQUNqQixLQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNsQixLQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztDQUNyQjs7OztJQUdXLFNBQVM7QUFDVixVQURDLFNBQVMsR0FDUjt3QkFERCxTQUFTOztBQUVwQixNQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztBQUNqQixNQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNoQixNQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNkLE1BQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ2IsTUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsTUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7QUFDeEIsTUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDekIsTUFBSSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUM7QUFDeEIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBQyxFQUFFLENBQUMsRUFDekI7QUFDQyxPQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDOUIsT0FBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQztBQUN2RSxPQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QyxPQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDOztBQUVwQyxPQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZFLE9BQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLE9BQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7R0FDckM7QUFDRCxNQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNwQixNQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztBQUN0QixNQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDcEIsTUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7RUFDcEI7O2NBekJXLFNBQVM7O1NBMkJULHdCQUFFO0FBQ2IsT0FBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFBLEFBQUMsQ0FBQztHQUMvQzs7O1NBRUksZUFBQyxJQUFJLEVBQUM7QUFDVixPQUFJLENBQUMsWUFBWSxHQUFHLElBQUksSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0dBQ3BEOzs7U0FFRyxnQkFBRSxFQUVMOzs7U0FFSSxpQkFBRSxFQUVOOzs7U0FFSSxpQkFBRTtBQUNOLE9BQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLE9BQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLE9BQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFHO0FBQzVCLFNBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLFNBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsU0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQyxDQUFDO0FBQ0gsT0FBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0dBQ3BCOzs7OztTQUVPLGlCQUFDLElBQUksRUFDYjtBQUNDLE9BQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDcEQsT0FBSSxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFBLEdBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNoRixRQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQztBQUM5QyxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCLFdBQU0sS0FBSyxDQUFDLElBQUksSUFBSSxXQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO0FBQzlDLFNBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtBQUN2QyxXQUFLLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNqQixZQUFNO01BQ04sTUFBTTtBQUNOLFVBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDMUMsV0FBSyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3pCLFVBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQy9ELFdBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7TUFDeEI7S0FDRDtJQUNEO0dBQ0Q7OztTQUVNLGlCQUFDLENBQUMsRUFBQztBQUNULFVBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdkIsT0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLE9BQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBQztBQUNoQyxTQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQyxNQUFNLEVBRU47R0FFRDs7O1NBRVMsb0JBQUMsQ0FBQyxFQUFDLEVBQ1o7OztTQUVpQixxQkFBQyxDQUFDLEVBQUM7QUFDcEIsT0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssWUFBWSxLQUFLLENBQUMsU0FBUyxFQUFDO0FBQ3hDLFdBQVE7QUFDUCxPQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDUCxZQUFPLEVBQUUsaUJBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxHQUFHLEVBQUc7QUFDbkIsT0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztNQUNoQztLQUNBLENBQUM7SUFDSCxNQUFNO0FBQ04sV0FBTztBQUNOLE9BQUUsRUFBQyxDQUFDLENBQUMsRUFBRTtBQUNQLFlBQU8sRUFBRSxpQkFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEdBQUcsRUFBRztBQUNuQixTQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O01BaUJ2QztLQUNELENBQUM7SUFDRjtHQUNEOzs7UUF4SFcsU0FBUzs7Ozs7O0FDcER0QixZQUFZLENBQUM7Ozs7Ozs7Ozs7O3dCQUNJLGFBQWE7Ozs7QUFDdkIsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDOztBQUN0QixJQUFNLFNBQVMsR0FBRyxHQUFHLENBQUM7O0FBQ3RCLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQzs7Ozs7SUFHZixLQUFLO0FBQ04sVUFEQyxLQUFLLENBQ0wsR0FBRyxFQUFDLElBQUksRUFBQzs7O3dCQURULEtBQUs7O0FBRWhCLE1BQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFDO0FBQ3BCLE9BQUksR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsc0JBQUssUUFBUSxFQUFFLEVBQUMsSUFBSSxDQUFBLEdBQUcsRUFBRSxFQUFFLEVBQUMsS0FBSyxHQUFHLHNCQUFLLFFBQVEsRUFBRSxFQUFDLENBQUM7R0FDdEY7QUFDRCxNQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDbEIsS0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ25DLE1BQUksQ0FBQyxTQUFTLEdBQ2QsR0FBRyxDQUNGLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDYixJQUFJLENBQUMsSUFBSSxDQUFDLENBQ1YsSUFBSSxDQUFDLE9BQU8sRUFBQyxPQUFPLENBQUMsQ0FDckIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7O0FBSWIsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlELE1BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEQsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5QyxNQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDM0IsT0FBTyxDQUFDLGFBQWEsRUFBQyxJQUFJLENBQUMsQ0FDM0IsRUFBRSxDQUFDLE9BQU8sRUFBQyxZQUFJO0FBQ2YsU0FBSyxPQUFPLEVBQUUsQ0FBQztHQUNmLENBQUMsQ0FBQztFQUVIOztjQXpCVyxLQUFLOztTQXVEVixtQkFBRTtBQUNSLE9BQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEIsT0FBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7R0FDdEI7OztTQUVHLGdCQUFFO0FBQ0wsT0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQzdDOzs7U0FFRyxnQkFBRTtBQUNMLE9BQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBQyxRQUFRLENBQUMsQ0FBQztHQUM1Qzs7O09BdkNPLGVBQUc7QUFDVixVQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDN0I7OztPQUNLLGVBQUU7QUFDUCxVQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0dBQ2hEO09BQ0ssYUFBQyxDQUFDLEVBQUM7QUFDUixPQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0dBQ3RDOzs7T0FDSyxlQUFFO0FBQ1AsVUFBTyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztHQUMvQztPQUNLLGFBQUMsQ0FBQyxFQUFDO0FBQ1IsT0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztHQUNyQzs7O09BQ1EsZUFBRTtBQUNWLFVBQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7R0FDakQ7T0FDUSxhQUFDLENBQUMsRUFBQztBQUNYLE9BQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7R0FDeEM7OztPQUNTLGVBQUU7QUFDWCxVQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0dBQ2xEO09BQ1MsYUFBQyxDQUFDLEVBQUM7QUFDWixPQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0dBQ3hDOzs7T0FlUyxlQUFFO0FBQ1gsVUFBTyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQVMsQ0FBQztHQUMxRTs7O1FBdEVXLEtBQUs7Ozs7O0FBeUVsQixLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUN0QyxFQUFFLENBQUMsV0FBVyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQzFCLFFBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEIsS0FBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUVoQyxHQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUNwQixNQUFNLENBQUMsS0FBSyxDQUFDLENBQ2IsSUFBSSxDQUFDLEVBQUMsRUFBRSxFQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUM5QixTQUFPLEVBQUMsbUJBQW1CLEVBQUMsQ0FBQyxDQUM3QixLQUFLLENBQUM7QUFDTixNQUFJLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDdEIsS0FBRyxFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0VBQ3BCLENBQUMsQ0FBQztDQUNILENBQUMsQ0FDRCxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQ3hCLEtBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFOUMsS0FBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUN0RCxLQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDOztBQUVyRCxNQUFLLENBQUMsS0FBSyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsR0FBRyxJQUFJLEVBQUMsS0FBSyxFQUFDLENBQUMsR0FBRyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0NBQzlDLENBQUMsQ0FDRCxFQUFFLENBQUMsU0FBUyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQ3hCLEtBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxLQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUMsSUFBRyxDQUFDLEtBQUssQ0FDUixFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQ3JELENBQUM7QUFDRixNQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDZixDQUFDLENBQUM7Ozs7Ozs7Ozs7OztxQkN6R29CLElBQUk7O0FBQWIsU0FBUyxJQUFJLEdBQUUsRUFBRTs7QUFBQSxJQUFJLENBQUMsUUFBUSxHQUFDLFlBQVU7QUFBQyxNQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBSTtNQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFBO0NBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsU0FBTyxDQUFDLEdBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxFQUFFLElBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQSxBQUFDLEdBQUMsRUFBRSxJQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBLEdBQUUsVUFBVSxJQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUUsQ0FBQyxJQUFFLENBQUMsR0FBQyxFQUFFLENBQUEsQUFBQyxDQUFBLEFBQUMsR0FBQyxHQUFHLENBQUE7Q0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUMsVUFBUyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsT0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUMsR0FBRyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFJLENBQUMsRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0NBQUMsQ0FBQzs7OztBQ0ozYSxZQUFZLENBQUM7Ozs7d0JBQ1UsY0FBYzs7SUFBekIsS0FBSzs7dUJB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YSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkMsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3pDLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJ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LENBQUMsSUFBSSxDQUFDLENBQUM7RUFDeEIsQ0FBQyxDQUFDO0NBR0gsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImV4cG9ydCAqIGZyb20gJy4vYXVkaW9Ob2RlVmlldyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZWcnO1xyXG5leHBvcnQgKiBmcm9tICcuL3NlcXVlbmNlci5qcyc7IiwiaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aSc7XHJcblxyXG52YXIgY291bnRlciA9IDA7XHJcbmV4cG9ydCB2YXIgY3R4OyBcclxuZXhwb3J0IGNsYXNzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoeCA9IDAsIHkgPSAwLHdpZHRoID0gdWkubm9kZVdpZHRoLGhlaWdodCA9IHVpLm5vZGVIZWlnaHQsbmFtZSA9ICcnKSB7XHJcblx0XHR0aGlzLnggPSB4IDtcclxuXHRcdHRoaXMueSA9IHkgO1xyXG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoIDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IDtcclxuXHRcdHRoaXMubmFtZSA9IG5hbWU7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgU1RBVFVTX1BMQVlfTk9UX1BMQVlFRCA9IDA7XHJcbmV4cG9ydCBjb25zdCBTVEFUVVNfUExBWV9QTEFZSU5HID0gMTtcclxuZXhwb3J0IGNvbnN0IFNUQVRVU19QTEFZX1BMQVlFRCA9IDI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVmSXNOb3RBUElPYmoodGhpc18sdil7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXNfLCdpc05vdEFQSU9iaicse1xyXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcclxuXHRcdFx0d3JpdGFibGU6ZmFsc2UsXHJcblx0XHRcdHZhbHVlOiB2XHJcblx0XHR9KTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEF1ZGlvUGFyYW1WaWV3IGV4dGVuZHMgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihBdWRpb05vZGVWaWV3LG5hbWUsIHBhcmFtKSB7XHJcblx0XHRzdXBlcigwLDAsdWkucG9pbnRTaXplLHVpLnBvaW50U2l6ZSxuYW1lKTtcclxuXHRcdHRoaXMuaWQgPSBjb3VudGVyKys7XHJcblx0XHR0aGlzLmF1ZGlvUGFyYW0gPSBwYXJhbTtcclxuXHRcdHRoaXMuQXVkaW9Ob2RlVmlldyA9IEF1ZGlvTm9kZVZpZXc7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUGFyYW1WaWV3IGV4dGVuZHMgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihBdWRpb05vZGVWaWV3LG5hbWUsaXNvdXRwdXQpIHtcclxuXHRcdHN1cGVyKDAsMCx1aS5wb2ludFNpemUsdWkucG9pbnRTaXplLG5hbWUpO1xyXG5cdFx0dGhpcy5pZCA9IGNvdW50ZXIrKztcclxuXHRcdHRoaXMuQXVkaW9Ob2RlVmlldyA9IEF1ZGlvTm9kZVZpZXc7XHJcblx0XHR0aGlzLmlzT3V0cHV0ID0gaXNvdXRwdXQgfHwgZmFsc2U7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQXVkaW9Ob2RlVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoYXVkaW9Ob2RlKSB7IC8vIGF1ZGlvTm9kZSDjga/jg5njg7zjgrnjgajjgarjgovjg47jg7zjg4lcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmlkID0gY291bnRlcisrO1xyXG5cdFx0dGhpcy5hdWRpb05vZGUgPSBhdWRpb05vZGU7XHJcblx0XHR0aGlzLm5hbWUgPSBhdWRpb05vZGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvZnVuY3Rpb25cXHMoLiopXFwoLylbMV07XHJcblx0XHR0aGlzLmlucHV0UGFyYW1zID0gW107XHJcblx0XHR0aGlzLm91dHB1dFBhcmFtcyA9IFtdO1xyXG5cdFx0dGhpcy5wYXJhbXMgPSBbXTtcclxuXHRcdGxldCBpbnB1dEN5ID0gMSxvdXRwdXRDeSA9IDE7XHJcblx0XHRcclxuXHRcdHRoaXMucmVtb3ZhYmxlID0gdHJ1ZTtcclxuXHRcdFxyXG5cdFx0Ly8g44OX44Ot44OR44OG44Kj44O744Oh44K944OD44OJ44Gu6KSH6KO9XHJcblx0XHRmb3IgKHZhciBpIGluIGF1ZGlvTm9kZSkge1xyXG5cdFx0XHRpZiAodHlwZW9mIGF1ZGlvTm9kZVtpXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4vL1x0XHRcdFx0dGhpc1tpXSA9IGF1ZGlvTm9kZVtpXS5iaW5kKGF1ZGlvTm9kZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBhdWRpb05vZGVbaV0gPT09ICdvYmplY3QnKSB7XHJcblx0XHRcdFx0XHRpZiAoYXVkaW9Ob2RlW2ldIGluc3RhbmNlb2YgQXVkaW9QYXJhbSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldID0gbmV3IEF1ZGlvUGFyYW1WaWV3KHRoaXMsaSwgYXVkaW9Ob2RlW2ldKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5pbnB1dFBhcmFtcy5wdXNoKHRoaXNbaV0pO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBhcmFtcy5wdXNoKCgocCk9PntcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0bmFtZTppLFxyXG5cdFx0XHRcdFx0XHRcdFx0J2dldCc6KCkgPT4gcC5hdWRpb1BhcmFtLnZhbHVlLFxyXG5cdFx0XHRcdFx0XHRcdFx0J3NldCc6KHYpID0+e3AuYXVkaW9QYXJhbS52YWx1ZSA9IHY7fSxcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmFtOnAsXHJcblx0XHRcdFx0XHRcdFx0XHRub2RlOnRoaXNcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pKHRoaXNbaV0pKTtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXS55ID0gKDIwICogaW5wdXRDeSsrKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZihhdWRpb05vZGVbaV0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0XHRhdWRpb05vZGVbaV0uQXVkaW9Ob2RlVmlldyA9IHRoaXM7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV07XHJcblx0XHRcdFx0XHRcdGlmKHRoaXNbaV0uaXNPdXRwdXQpe1xyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0ueSA9ICgyMCAqIG91dHB1dEN5KyspO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0ueCA9IHRoaXMud2lkdGg7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5vdXRwdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnkgPSAoMjAgKiBpbnB1dEN5KyspO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuaW5wdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXSA9IGF1ZGlvTm9kZVtpXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEF1ZGlvTm9kZS5wcm90b3R5cGUsIGkpO1x0XHJcblx0XHRcdFx0XHRpZighZGVzYyl7XHJcblx0XHRcdFx0XHRcdGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRoaXMuYXVkaW9Ob2RlLl9fcHJvdG9fXywgaSk7XHRcclxuXHRcdFx0XHRcdH0gXHJcblx0XHRcdFx0XHRpZighZGVzYyl7XHJcblx0XHRcdFx0XHRcdGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRoaXMuYXVkaW9Ob2RlLGkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dmFyIHByb3BzID0ge307XHJcblxyXG4vL1x0XHRcdFx0XHRpZihkZXNjLmdldCl7XHJcblx0XHRcdFx0XHRcdFx0cHJvcHMuZ2V0ID0gKChpKSA9PiB0aGlzLmF1ZGlvTm9kZVtpXSkuYmluZChudWxsLCBpKTtcclxuLy9cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZihkZXNjLndyaXRhYmxlIHx8IGRlc2Muc2V0KXtcclxuXHRcdFx0XHRcdFx0cHJvcHMuc2V0ID0gKChpLCB2KSA9PiB7IHRoaXMuYXVkaW9Ob2RlW2ldID0gdjsgfSkuYmluZChudWxsLCBpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cHJvcHMuZW51bWVyYWJsZSA9IGRlc2MuZW51bWVyYWJsZTtcclxuXHRcdFx0XHRcdHByb3BzLmNvbmZpZ3VyYWJsZSA9IGRlc2MuY29uZmlndXJhYmxlO1xyXG5cdFx0XHRcdFx0Ly9wcm9wcy53cml0YWJsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0Ly9wcm9wcy53cml0YWJsZSA9IGRlc2Mud3JpdGFibGU7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpLHByb3BzKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cHJvcHMubmFtZSA9IGk7XHJcblx0XHRcdFx0XHRwcm9wcy5ub2RlID0gdGhpcztcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoZGVzYy5lbnVtZXJhYmxlICYmICFpLm1hdGNoKC8oLipfJCl8KG5hbWUpfChebnVtYmVyT2YuKiQpL2kpICYmICh0eXBlb2YgYXVkaW9Ob2RlW2ldKSAhPT0gJ0FycmF5Jyl7XHJcblx0XHRcdFx0XHRcdHRoaXMucGFyYW1zLnB1c2gocHJvcHMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuaW5wdXRTdGFydFkgPSBpbnB1dEN5ICogMjA7XHJcblx0XHR2YXIgaW5wdXRIZWlnaHQgPSAoaW5wdXRDeSArIHRoaXMubnVtYmVyT2ZJbnB1dHMpICogMjAgO1xyXG5cdFx0dmFyIG91dHB1dEhlaWdodCA9IChvdXRwdXRDeSArIHRoaXMubnVtYmVyT2ZPdXRwdXRzKSAqIDIwO1xyXG5cdFx0dGhpcy5vdXRwdXRTdGFydFkgPSBvdXRwdXRDeSAqIDIwO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBNYXRoLm1heCh0aGlzLmhlaWdodCxpbnB1dEhlaWdodCxvdXRwdXRIZWlnaHQpO1xyXG5cdFx0dGhpcy50ZW1wID0ge307XHJcblx0XHR0aGlzLnN0YXR1c1BsYXkgPSBTVEFUVVNfUExBWV9OT1RfUExBWUVEOy8vIG5vdCBwbGF5ZWQuXHJcblx0XHR0aGlzLnBhbmVsID0gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0Ly8gMeOBpOOBoOOBkeOBoOOBqOODjuODvOODieOBruWJiumZpOOBpzLjgaTjga7loLTlkIjjga/jgrPjg43jgq/jgrfjg6fjg7Pjga7liYrpmaRcclxuXHRzdGF0aWMgcmVtb3ZlKG5vZGUpIHtcclxuXHRcdFx0aWYoIW5vZGUucmVtb3ZhYmxlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCfliYrpmaTjgafjgY3jgarjgYTjg47jg7zjg4njgafjgZnjgIInKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRpZiAoQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzW2ldID09PSBub2RlKSB7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMuc3BsaWNlKGktLSwgMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGxldCBuID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRcdGxldCBkaXNjb25uZWN0ZWQgPSBmYWxzZTtcclxuXHRcdFx0XHRpZiAobi5mcm9tLm5vZGUgPT09IG5vZGUpIHtcclxuXHRcdFx0XHRcdGlmKG4uZnJvbS5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0XHRcdFx0bi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3Qobik7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYobi50by5wYXJhbSl7XHJcblx0XHRcdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0XHRcdGlmKG4udG8ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0XHRcdFx0Ly8gQVVkaW9QYXJhbVxyXG5cdFx0XHRcdFx0XHRcdGlmKG4uZnJvbS5wYXJhbSl7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0XHRcdFx0XHRuLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChuLnRvLnBhcmFtLmF1ZGlvUGFyYW0sbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0XHRcdFx0XHRcdGRpc2Nvbm5lY3RlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRcdFx0XHRcdG4uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KG4udG8ucGFyYW0uYXVkaW9QYXJhbSk7XHJcblx0XHRcdFx0XHRcdFx0XHRkaXNjb25uZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHQvLyBuLnRvLnBhcmFt44GM5pWw5a2XXHJcblx0XHRcdFx0XHRcdFx0aWYobi5mcm9tLnBhcmFtKXtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRcdFx0XHRcdGlmKG4uZnJvbS5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0XHRcdFx0XHRcdCBuLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChuKTtcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0bi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3Qobi50by5ub2RlLmF1ZGlvTm9kZSxuLmZyb20ucGFyYW0sbi50by5wYXJhbSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHRkaXNjb25uZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRcdFx0XHRuLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChuLnRvLm5vZGUuYXVkaW9Ob2RlLDAsbi50by5wYXJhbSk7XHJcblx0XHRcdFx0XHRcdFx0XHRkaXNjb25uZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Ly8gdG8g44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRcdGlmKG4uZnJvbS5wYXJhbSl7XHJcblx0XHRcdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdFx0XHRcdG4uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KG4udG8ubm9kZS5hdWRpb05vZGUsbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0XHRcdFx0XHRkaXNjb25uZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRcdFx0XHRuLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChuLnRvLm5vZGUuYXVkaW9Ob2RlKTtcclxuXHRcdFx0XHRcdFx0XHRkaXNjb25uZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRpZihuLnRvLm5vZGUgPT09IG5vZGUpe1xyXG5cdFx0XHRcdFx0Ly8gZnJvbSDjg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRcdGlmKG4uZnJvbS5wYXJhbSl7XHJcblx0XHRcdFx0XHRcdGlmKG4uZnJvbS5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyApe1xyXG5cdFx0XHRcdFx0XHRcdG4uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KG4pO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdGlmKG4udG8ucGFyYW0pe1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gdG8g44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0XHRcdFx0XHRpZihuLnRvLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyB0byDjg5Hjg6njg6Hjg7zjgr/jgYxBdWRpb1BhcmFtVmlld1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRuLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChuLnRvLnBhcmFtLmF1ZGlvUGFyYW0sbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0ZGlzY29ubmVjdGVkID0gdHJ1ZTtcdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gdG8g44OR44Op44Oh44O844K/44GM5pWw5a2XXHJcblx0XHRcdFx0XHRcdFx0XHRcdG4uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KG4udG8ubm9kZS5hdWRpb05vZGUsbi5mcm9tLnBhcmFtLG4udG8ucGFyYW0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRkaXNjb25uZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyB0byDjg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRcdFx0XHRcdG4uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KG4udG8ubm9kZS5hdWRpb05vZGUsbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0XHRcdFx0XHRcdGRpc2Nvbm5lY3RlZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHQvLyBmcm9tIOODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdFx0XHRpZihuLnRvLnBhcmFtKXtcclxuXHRcdFx0XHRcdFx0XHQvLyB0byDjg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRcdFx0XHRpZihuLnRvLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gdG8g44OR44Op44Oh44O844K/44GMQXVkaW9QYXJhbVZpZXdcclxuXHRcdFx0XHRcdFx0XHRcdG4uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KG4udG8ucGFyYW0uYXVkaW9QYXJhbSk7XHJcblx0XHRcdFx0XHRcdFx0XHRkaXNjb25uZWN0ZWQgPSB0cnVlO1x0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdC8vIHRvIOODkeODqeODoeODvOOCv+OBjOaVsOWtl1xyXG5cdFx0XHRcdFx0XHRcdFx0bi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3Qobi50by5ub2RlLmF1ZGlvTm9kZSwwLG4udG8ucGFyYW0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0ZGlzY29ubmVjdGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gdG8g44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRcdFx0bi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3Qobi50by5ub2RlLmF1ZGlvTm9kZSk7XHJcblx0XHRcdFx0XHRcdFx0ZGlzY29ubmVjdGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmKGRpc2Nvbm5lY3RlZCl7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIOOCs+ODjeOCr+OCt+ODp+ODs+OBruaOpee2muOCkuino+mZpOOBmeOCi1xyXG5cdHN0YXRpYyBkaXNjb25uZWN0KGZyb21fLHRvXykge1xyXG5cdFx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV99O1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIFBhcmFtVmlldyApe1xyXG5cdFx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8uQXVkaW9Ob2RlVmlldyxwYXJhbTpmcm9tX307XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdHRvXyA9IHtub2RlOnRvX307XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY29uID0geydmcm9tJzpmcm9tXywndG8nOnRvX307XHJcblx0XHRcdFxyXG5cdFx0XHQvLyDjgrPjg43jgq/jgrfjg6fjg7Pjga7liYrpmaRcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0XHRpZihjb24uZnJvbS5ub2RlID09PSBuLmZyb20ubm9kZSAmJiBjb24uZnJvbS5wYXJhbSA9PT0gbi5mcm9tLnBhcmFtIFxyXG5cdFx0XHRcdFx0JiYgY29uLnRvLm5vZGUgPT09IG4udG8ubm9kZSAmJiBjb24udG8ucGFyYW0gPT09IG4udG8ucGFyYW0pe1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0XHRpZihjb24uZnJvbS5wYXJhbSl7XHJcblx0XHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRcdFx0aWYoY29uLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRpZihjb24udG8ucGFyYW0pe1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gdG8g44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0XHRcdFx0XHRpZihjb24udG8ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0XHRcdFx0XHRcdC8vIHRvIEF1ZGlvUGFyYW1WaWV3XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuZGlzY29ubmVjdChjb24udG8ucGFyYW0uYXVkaW9QYXJhbSxjb24uZnJvbS5wYXJhbSk7XHJcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYoY29uLnRvLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gdG8gUGFyYW1WaWV3XHJcblx0XHRcdFx0XHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuZGlzY29ubmVjdChjb24pO1x0XHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZXtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gdG8g5pWw5a2XXHJcblx0XHRcdFx0XHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsY29uLmZyb20ucGFyYW0sY29uLnRvLnBhcmFtKTtcclxuXHRcdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gdG8g44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlLGNvbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRcdFx0aWYoY29uLnRvLnBhcmFtKXtcclxuXHRcdFx0XHRcdFx0XHQvLyB0byDjg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRcdFx0XHRpZihjb24udG8ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0XHRcdFx0XHQvLyB0byBBdWRpb1BhcmFtVmlld1xyXG5cdFx0XHRcdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5kaXNjb25uZWN0KGNvbi50by5wYXJhbS5hdWRpb1BhcmFtKTtcclxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdFx0Ly8gdG8g5pWw5a2XXHJcblx0XHRcdFx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlLDAsY29uLnRvLnBhcmFtKTtcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0Ly8gdG8g44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHRzdGF0aWMgY3JlYXRlKGF1ZGlvbm9kZSkge1xyXG5cdFx0dmFyIG9iaiA9IG5ldyBBdWRpb05vZGVWaWV3KGF1ZGlvbm9kZSk7XHJcblx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMucHVzaChvYmopO1xyXG5cdFx0cmV0dXJuIG9iajtcclxuXHR9XHJcblx0XHJcbiAgLy8g44OO44O844OJ6ZaT44Gu5o6l57aaXHJcblx0c3RhdGljIGNvbm5lY3QoZnJvbV8sIHRvXykge1xyXG5cdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3ICl7XHJcblx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8scGFyYW06MH07XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRmcm9tXyA9IHtub2RlOmZyb21fLkF1ZGlvTm9kZVZpZXcscGFyYW06ZnJvbV99O1xyXG5cdFx0fVxyXG5cclxuXHRcdFxyXG5cdFx0aWYodG9fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyl7XHJcblx0XHRcdHRvXyA9IHtub2RlOnRvXyxwYXJhbTowfTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYodG9fIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZih0b18gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199O1xyXG5cdFx0fVxyXG5cdFx0Ly8g5a2Y5Zyo44OB44Kn44OD44KvXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcclxuXHRcdFx0dmFyIGMgPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnNbaV07XHJcblx0XHRcdGlmIChjLmZyb20ubm9kZSA9PT0gZnJvbV8ubm9kZSBcclxuXHRcdFx0XHQmJiBjLmZyb20ucGFyYW0gPT09IGZyb21fLnBhcmFtXHJcblx0XHRcdFx0JiYgYy50by5ub2RlID09PSB0b18ubm9kZVxyXG5cdFx0XHRcdCYmIGMudG8ucGFyYW0gPT09IHRvXy5wYXJhbVxyXG5cdFx0XHRcdCkgXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG4vL1x0XHRcdFx0dGhyb3cgKG5ldyBFcnJvcign5o6l57aa44GM6YeN6KSH44GX44Gm44GE44G+44GZ44CCJykpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIOaOpee2muWFiOOBjFBhcmFtVmlld+OBruWgtOWQiOOBr+aOpee2muWFg+OBr1BhcmFtVmlld+OBruOBv1xyXG5cdFx0aWYodG9fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3ICYmICEoZnJvbV8ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpKXtcclxuXHRcdCAgcmV0dXJuIDtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gUGFyYW1WaWV344GM5o6l57aa5Y+v6IO944Gq44Gu44GvQXVkaW9QYXJhbeOBi+OCiVBhcmFtVmlld+OBruOBv1xyXG5cdFx0aWYoZnJvbV8ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRpZighKHRvXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyB8fCB0b18ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldykpe1xyXG5cdFx0XHRcdHJldHVybjtcdFxyXG5cdFx0XHR9XHJcblx0XHR9IFxyXG5cdFx0XHJcblx0XHRpZiAoZnJvbV8ucGFyYW0pIHtcclxuXHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0ICBpZihmcm9tXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0ICBmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHsnZnJvbSc6ZnJvbV8sJ3RvJzp0b199KTtcclxuLy9cdFx0XHRcdGZyb21fLm5vZGUuY29ubmVjdFBhcmFtKGZyb21fLnBhcmFtLHRvXyk7XHJcblx0XHRcdH0gZWxzZSBpZiAodG9fLnBhcmFtKSBcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0aWYodG9fLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0Ly8gQXVkaW9QYXJhbeOBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ucGFyYW0uYXVkaW9QYXJhbSxmcm9tXy5wYXJhbSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIOaVsOWtl+OBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUsIGZyb21fLnBhcmFtLHRvXy5wYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUsZnJvbV8ucGFyYW0pO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdGlmICh0b18ucGFyYW0pIHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdC8vIEF1ZGlvUGFyYW3jga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLnBhcmFtLmF1ZGlvUGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZXtcclxuXHRcdFx0XHRcdC8vIOaVsOWtl+OBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUsMCx0b18ucGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvL3Rocm93IG5ldyBFcnJvcignQ29ubmVjdGlvbiBFcnJvcicpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMucHVzaFxyXG5cdFx0KHtcclxuXHRcdFx0J2Zyb20nOiBmcm9tXyxcclxuXHRcdFx0J3RvJzogdG9fXHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuXHJcbkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2RlcyA9IFtdO1xyXG5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMgPSBbXTtcclxuXHJcblxyXG4iLCJpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aS5qcyc7XHJcblxyXG5leHBvcnQgdmFyIHN2ZztcclxuLy9hYVxyXG52YXIgbm9kZUdyb3VwLCBsaW5lR3JvdXA7XHJcbnZhciBkcmFnO1xyXG52YXIgZHJhZ091dDtcclxudmFyIGRyYWdQYXJhbTtcclxudmFyIGRyYWdQYW5lbDtcclxuXHJcbnZhciBtb3VzZUNsaWNrTm9kZTtcclxudmFyIG1vdXNlT3Zlck5vZGU7XHJcbnZhciBsaW5lO1xyXG52YXIgYXVkaW9Ob2RlQ3JlYXRvcnMgPSBbXTtcclxuXHJcbi8vIERyYXfjga7liJ3mnJ/ljJZcclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRVSSgpe1xyXG5cdC8vIEF1ZGlvTm9kZeODieODqeODg+OCsOeUqFxyXG5cdGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHQub3JpZ2luKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkOyB9KVxyXG5cdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdGlmKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdtb3VzZXVwJykpO1x0XHRcdFxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRkLnRlbXAueCA9IGQueDtcclxuXHRcdGQudGVtcC55ID0gZC55O1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSlcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoe2lkOidkcmFnJyx3aWR0aDpkLndpZHRoLGhlaWdodDpkLmhlaWdodCx4OjAseTowLCdjbGFzcyc6J2F1ZGlvTm9kZURyYWcnfSApO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0aWYoZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5zaGlmdEtleSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGQudGVtcC54ICs9IGQzLmV2ZW50LmR4O1xyXG5cdFx0ZC50ZW1wLnkgKz0gZDMuZXZlbnQuZHk7XHJcblx0XHQvL2QzLnNlbGVjdCh0aGlzKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAoZC54IC0gZC53aWR0aCAvIDIpICsgJywnICsgKGQueSAtIGQuaGVpZ2h0IC8gMikgKyAnKScpO1xyXG5cdFx0Ly9kcmF3KCk7XHJcblx0XHR2YXIgZHJhZ0N1cnNvbCA9IGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpXHJcblx0XHQuc2VsZWN0KCdyZWN0I2RyYWcnKTtcclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3gnKSkgKyBkMy5ldmVudC5keDtcclxuXHRcdHZhciB5ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3knKSkgKyBkMy5ldmVudC5keTtcclxuXHRcdGRyYWdDdXJzb2wuYXR0cih7eDp4LHk6eX0pO1x0XHRcclxuXHR9KVxyXG5cdC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oZCl7XHJcblx0XHRpZihkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5IHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRyYWdDdXJzb2wgPSBkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKVxyXG5cdFx0LnNlbGVjdCgncmVjdCNkcmFnJyk7XHJcblx0XHR2YXIgeCA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd4JykpO1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneScpKTtcclxuXHRcdGQueCA9IGQudGVtcC54O1xyXG5cdFx0ZC55ID0gZC50ZW1wLnk7XHJcblx0XHRkcmFnQ3Vyc29sLnJlbW92ZSgpO1x0XHRcclxuXHRcdGRyYXcoKTtcclxuXHR9KTtcclxuXHRcclxuXHQvLyDjg47jg7zjg4nplpPmjqXntprnlKggZHJhZyBcclxuXHRkcmFnT3V0ID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcblx0Lm9yaWdpbihmdW5jdGlvbiAoZCkgeyByZXR1cm4gZDsgfSlcclxuXHQub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oZCl7XHJcblx0XHRsZXQgeDEseTE7XHJcblx0XHRpZihkLmluZGV4KXtcclxuXHRcdFx0aWYoZC5pbmRleCBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDEgPSBkLm5vZGUueCAtIGQubm9kZS53aWR0aCAvIDIgKyBkLmluZGV4Lng7XHJcblx0XHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLmluZGV4Lnk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eDEgPSBkLm5vZGUueCArIGQubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLm5vZGUub3V0cHV0U3RhcnRZICsgZC5pbmRleCAqIDIwOyBcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0eDEgPSBkLm5vZGUueCArIGQubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdHkxID0gZC5ub2RlLnkgLSBkLm5vZGUuaGVpZ2h0IC8yICsgZC5ub2RlLm91dHB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHJcblx0XHRkLngxID0geDEsZC55MSA9IHkxO1x0XHRcdFx0XHJcblx0XHRkLngyID0geDEsZC55MiA9IHkxO1xyXG5cclxuXHRcdHZhciBwb3MgPSBtYWtlUG9zKHgxLHkxLGQueDIsZC55Mik7XHJcblx0XHRkLmxpbmUgPSBzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5kYXR1bShkKVxyXG5cdFx0LmFwcGVuZCgncGF0aCcpXHJcblx0XHQuYXR0cih7J2QnOmxpbmUocG9zKSwnY2xhc3MnOidsaW5lLWRyYWcnfSk7XHJcblx0fSlcclxuXHQub24oXCJkcmFnXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRkLngyICs9IGQzLmV2ZW50LmR4O1xyXG5cdFx0ZC55MiArPSBkMy5ldmVudC5keTtcclxuXHRcdGQubGluZS5hdHRyKCdkJyxsaW5lKG1ha2VQb3MoZC54MSxkLnkxLGQueDIsZC55MikpKTtcdFx0XHRcdFx0XHJcblx0fSlcclxuXHQub24oXCJkcmFnZW5kXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRsZXQgdGFyZ2V0WCA9IGQueDI7XHJcblx0XHRsZXQgdGFyZ2V0WSA9IGQueTI7XHJcblx0XHQvLyBpbnB1dOOCguOBl+OBj+OBr3BhcmFt44Gr5Yiw6YGU44GX44Gm44GE44KL44GLXHJcblx0XHQvLyBpbnB1dFx0XHRcclxuXHRcdGxldCBjb25uZWN0ZWQgPSBmYWxzZTtcclxuXHRcdGxldCBpbnB1dHMgPSBkMy5zZWxlY3RBbGwoJy5pbnB1dCcpWzBdO1xyXG5cdFx0Zm9yKHZhciBpID0gMCxsID0gaW5wdXRzLmxlbmd0aDtpIDwgbDsrK2kpe1xyXG5cdFx0XHRsZXQgZWxtID0gaW5wdXRzW2ldO1xyXG5cdFx0XHRsZXQgYmJveCA9IGVsbS5nZXRCQm94KCk7XHJcblx0XHRcdGxldCBub2RlID0gZWxtLl9fZGF0YV9fLm5vZGU7XHJcblx0XHRcdGxldCBsZWZ0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LngsXHJcblx0XHRcdFx0dG9wID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55LFxyXG5cdFx0XHRcdHJpZ2h0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LnggKyBiYm94LndpZHRoLFxyXG5cdFx0XHRcdGJvdHRvbSA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueSArIGJib3guaGVpZ2h0O1xyXG5cdFx0XHRpZih0YXJnZXRYID49IGxlZnQgJiYgdGFyZ2V0WCA8PSByaWdodCAmJiB0YXJnZXRZID49IHRvcCAmJiB0YXJnZXRZIDw9IGJvdHRvbSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdoaXQnLGVsbSk7XHJcblx0XHRcdFx0bGV0IGZyb21fID0ge25vZGU6ZC5ub2RlLHBhcmFtOmQuaW5kZXh9O1xyXG5cdFx0XHRcdGxldCB0b18gPSB7bm9kZTpub2RlLHBhcmFtOmVsbS5fX2RhdGFfXy5pbmRleH07XHJcblx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KGZyb21fLHRvXyk7XHJcblx0XHRcdFx0Ly9BdWRpb05vZGVWaWV3LmNvbm5lY3QoKTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdFx0Y29ubmVjdGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZighY29ubmVjdGVkKXtcclxuXHRcdFx0Ly8gQXVkaW9QYXJhbVxyXG5cdFx0XHR2YXIgcGFyYW1zID0gZDMuc2VsZWN0QWxsKCcucGFyYW0sLmF1ZGlvLXBhcmFtJylbMF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDAsbCA9IHBhcmFtcy5sZW5ndGg7aSA8IGw7KytpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IGVsbSA9IHBhcmFtc1tpXTtcclxuXHRcdFx0XHRsZXQgYmJveCA9IGVsbS5nZXRCQm94KCk7XHJcblx0XHRcdFx0bGV0IHBhcmFtID0gZWxtLl9fZGF0YV9fO1xyXG5cdFx0XHRcdGxldCBub2RlID0gcGFyYW0ubm9kZTtcclxuXHRcdFx0XHRsZXQgbGVmdCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54O1xyXG5cdFx0XHRcdGxldFx0dG9wXyA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueTtcclxuXHRcdFx0XHRsZXRcdHJpZ2h0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LnggKyBiYm94LndpZHRoO1xyXG5cdFx0XHRcdGxldFx0Ym90dG9tID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55ICsgYmJveC5oZWlnaHQ7XHJcblx0XHRcdFx0aWYodGFyZ2V0WCA+PSBsZWZ0ICYmIHRhcmdldFggPD0gcmlnaHQgJiYgdGFyZ2V0WSA+PSB0b3BfICYmIHRhcmdldFkgPD0gYm90dG9tKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdoaXQnLGVsbSk7XHJcblx0XHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6ZC5ub2RlLHBhcmFtOmQuaW5kZXh9LHtub2RlOm5vZGUscGFyYW06cGFyYW0uaW5kZXh9KTtcclxuXHRcdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gbGluZeODl+ODrOODk+ODpeODvOOBruWJiumZpFxyXG5cdFx0ZC5saW5lLnJlbW92ZSgpO1xyXG5cdFx0ZGVsZXRlIGQubGluZTtcclxuXHR9KTtcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNwYW5lbC1jbG9zZScpXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oKXtkMy5zZWxlY3QoJyNwcm9wLXBhbmVsJykuc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO2QzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7fSk7XHJcblxyXG5cdC8vIG5vZGXplpPmjqXntppsaW5l5o+P55S76Zai5pWwXHJcblx0bGluZSA9IGQzLnN2Zy5saW5lKClcclxuXHQueChmdW5jdGlvbihkKXtyZXR1cm4gZC54fSlcclxuXHQueShmdW5jdGlvbihkKXtyZXR1cm4gZC55fSlcclxuXHQuaW50ZXJwb2xhdGUoJ2Jhc2lzJyk7XHJcblxyXG5cdC8vIERPTeOBq3N2Z+OCqOODrOODoeODs+ODiOOCkuaMv+WFpVx0XHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjY29udGVudCcpXHJcblx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0LmF0dHIoeyAnd2lkdGgnOiB3aW5kb3cuaW5uZXJXaWR0aCwgJ2hlaWdodCc6IHdpbmRvdy5pbm5lckhlaWdodCB9KTtcclxuXHJcblx0Ly8g44OO44O844OJ44GM5YWl44KL44Kw44Or44O844OXXHJcblx0bm9kZUdyb3VwID0gc3ZnLmFwcGVuZCgnZycpO1xyXG5cdC8vIOODqeOCpOODs+OBjOWFpeOCi+OCsOODq+ODvOODl1xyXG5cdGxpbmVHcm91cCA9IHN2Zy5hcHBlbmQoJ2cnKTtcclxuXHRcclxuXHQvLyBib2R55bGe5oCn44Gr5oy/5YWlXHJcblx0YXVkaW9Ob2RlQ3JlYXRvcnMgPSBcclxuXHRbXHJcblx0XHR7bmFtZTonR2FpbicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVHYWluLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonRGVsYXknLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlRGVsYXkuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidBdWRpb0J1ZmZlclNvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidNZWRpYUVsZW1lbnRBdWRpb1NvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidQYW5uZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlUGFubmVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ29udm9sdmVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNvbnZvbHZlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0FuYWx5c2VyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUFuYWx5c2VyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ2hhbm5lbFNwbGl0dGVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxTcGxpdHRlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0NoYW5uZWxNZXJnZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQ2hhbm5lbE1lcmdlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0R5bmFtaWNzQ29tcHJlc3NvcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidCaXF1YWRGaWx0ZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQmlxdWFkRmlsdGVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonT3NjaWxsYXRvcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVPc2NpbGxhdG9yLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonTWVkaWFTdHJlYW1BdWRpb1NvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J1dhdmVTaGFwZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlV2F2ZVNoYXBlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0VHJyxjcmVhdGU6KCk9Pm5ldyBhdWRpby5FRygpfSxcclxuXHRcdHtuYW1lOidTZXF1ZW5jZXInLGNyZWF0ZTooKT0+bmV3IGF1ZGlvLlNlcXVlbmNlcigpfVxyXG5cdF07XHJcblx0XHJcblx0aWYoYXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtRGVzdGluYXRpb24pe1xyXG5cdFx0YXVkaW9Ob2RlQ3JlYXRvcnMucHVzaCh7bmFtZTonTWVkaWFTdHJlYW1BdWRpb0Rlc3RpbmF0aW9uJyxcclxuXHRcdFx0Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbURlc3RpbmF0aW9uLmJpbmQoYXVkaW8uY3R4KVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI2NvbnRlbnQnKVxyXG5cdC5kYXR1bSh7fSlcclxuXHQub24oJ2NvbnRleHRtZW51JyxmdW5jdGlvbigpe1xyXG5cdFx0c2hvd0F1ZGlvTm9kZVBhbmVsKHRoaXMpO1xyXG5cdH0pO1xyXG59XHJcblxyXG4vLyDmj4/nlLtcclxuZXhwb3J0IGZ1bmN0aW9uIGRyYXcoKSB7XHJcblx0Ly8gQXVkaW9Ob2Rl44Gu5o+P55S7XHJcblx0dmFyIGdkID0gbm9kZUdyb3VwLnNlbGVjdEFsbCgnZycpLlxyXG5cdGRhdGEoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLGZ1bmN0aW9uKGQpe3JldHVybiBkLmlkO30pO1xyXG5cclxuXHQvLyDnn6nlvaLjga7mm7TmlrBcclxuXHRnZC5zZWxlY3QoJ3JlY3QnKVxyXG5cdC5hdHRyKHsgJ3dpZHRoJzogKGQpPT4gZC53aWR0aCwgJ2hlaWdodCc6IChkKT0+IGQuaGVpZ2h0IH0pO1xyXG5cdFxyXG5cdC8vIEF1ZGlvTm9kZeefqeW9ouOCsOODq+ODvOODl1xyXG5cdHZhciBnID0gZ2QuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ2cnKTtcclxuXHQvLyBBdWRpb05vZGXnn6nlvaLjgrDjg6vjg7zjg5fjga7luqfmqJnkvY3nva7jgrvjg4Pjg4hcclxuXHRnZC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgKGQueCAtIGQud2lkdGggLyAyKSArICcsJyArIChkLnkgLSBkLmhlaWdodCAvIDIpICsgJyknIH0pO1x0XHJcblxyXG5cdC8vIEF1ZGlvTm9kZeefqeW9olxyXG5cdGcuYXBwZW5kKCdyZWN0JylcclxuXHQuY2FsbChkcmFnKVxyXG5cdC5hdHRyKHsgJ3dpZHRoJzogKGQpPT4gZC53aWR0aCwgJ2hlaWdodCc6IChkKT0+IGQuaGVpZ2h0LCAnY2xhc3MnOiAnYXVkaW9Ob2RlJyB9KVxyXG5cdC5jbGFzc2VkKCdwbGF5JyxmdW5jdGlvbihkKXtcclxuXHRcdHJldHVybiBkLnN0YXR1c1BsYXkgPT09IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlJTkc7XHJcblx0fSlcclxuXHQub24oJ2NvbnRleHRtZW51JyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOODkeODqeODoeODvOOCv+e3qOmbhueUu+mdouOBruihqOekulxyXG5cdFx0c2hvd1BhbmVsLmJpbmQodGhpcyxkKSgpO1xyXG5cdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0fSlcclxuXHQub24oJ2NsaWNrLnJlbW92ZScsZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRcdGlmKGQzLmV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0ZC5wYW5lbCAmJiBkLnBhbmVsLmlzU2hvdyAmJiBkLnBhbmVsLmRpc3Bvc2UoKTtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShkKTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdH0gY2F0Y2goZSkge1xyXG4vL1x0XHRcdFx0ZGlhbG9nLnRleHQoZS5tZXNzYWdlKS5ub2RlKCkuc2hvdyh3aW5kb3cuaW5uZXJXaWR0aC8yLHdpbmRvdy5pbm5lckhlaWdodC8yKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0fSlcclxuXHQuZmlsdGVyKGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g6Z+z5rqQ44Gu44G/44Gr44OV44Kj44Or44K/XHJcblx0XHRyZXR1cm4gZC5hdWRpb05vZGUgaW5zdGFuY2VvZiBPc2NpbGxhdG9yTm9kZSB8fCBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyU291cmNlTm9kZSB8fCBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIE1lZGlhRWxlbWVudEF1ZGlvU291cmNlTm9kZTsgXHJcblx0fSlcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOWGjeeUn+ODu+WBnOatolxyXG5cdFx0Y29uc29sZS5sb2coZDMuZXZlbnQpO1xyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdFx0aWYoIWQzLmV2ZW50LmN0cmxLZXkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRsZXQgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0aWYoZC5zdGF0dXNQbGF5ID09PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HKXtcclxuXHRcdFx0ZC5zdGF0dXNQbGF5ID0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUVEO1xyXG5cdFx0XHRzZWwuY2xhc3NlZCgncGxheScsZmFsc2UpO1xyXG5cdFx0XHRkLnN0b3AoMCk7XHJcblx0XHR9IGVsc2UgaWYoZC5zdGF0dXNQbGF5ICE9PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZRUQpe1xyXG5cdFx0XHRkLnN0YXJ0KDApO1xyXG5cdFx0XHRkLnN0YXR1c1BsYXkgPSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HO1xyXG5cdFx0XHRzZWwuY2xhc3NlZCgncGxheScsdHJ1ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhbGVydCgn5LiA5bqm5YGc5q2i44GZ44KL44Go5YaN55Sf44Gn44GN44G+44Gb44KT44CCJyk7XHJcblx0XHR9XHJcblx0fSlcclxuXHQuY2FsbCh0b29sdGlwKCdDdHJsICsgQ2xpY2sg44Gn5YaN55Sf44O75YGc5q2iJykpO1xyXG5cdDtcclxuXHRcclxuXHQvLyBBdWRpb05vZGXjga7jg6njg5njg6tcclxuXHRnLmFwcGVuZCgndGV4dCcpXHJcblx0LmF0dHIoeyB4OiAwLCB5OiAtMTAsICdjbGFzcyc6ICdsYWJlbCcgfSlcclxuXHQudGV4dChmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5uYW1lOyB9KTtcclxuXHJcblx0Ly8g5YWl5YqbQXVkaW9QYXJhbeOBruihqOekulx0XHJcblx0Z2QuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdHZhciBncCA9IHNlbC5hcHBlbmQoJ2cnKTtcclxuXHRcdHZhciBncGQgPSBncC5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZC5pbnB1dFBhcmFtcy5tYXAoKGQpPT57XHJcblx0XHRcdHJldHVybiB7bm9kZTpkLkF1ZGlvTm9kZVZpZXcsaW5kZXg6ZH07XHJcblx0XHR9KSxmdW5jdGlvbihkKXtyZXR1cm4gZC5pbmRleC5pZDt9KTtcdFx0XHJcblxyXG5cdFx0dmFyIGdwZGcgPSBncGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdC5hdHRyKHsncic6IChkKT0+ZC5pbmRleC53aWR0aC8yLCBcclxuXHRcdGN4OiAwLCBjeTogKGQsIGkpPT4geyByZXR1cm4gZC5pbmRleC55OyB9LFxyXG5cdFx0J2NsYXNzJzogZnVuY3Rpb24oZCkge1xyXG5cdFx0XHRpZihkLmluZGV4IGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHJldHVybiAnYXVkaW8tcGFyYW0nO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiAncGFyYW0nO1xyXG5cdFx0fX0pO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgndGV4dCcpXHJcblx0XHQuYXR0cih7eDogKGQpPT4gKGQuaW5kZXgueCArIGQuaW5kZXgud2lkdGggLyAyICsgNSkseTooZCk9PmQuaW5kZXgueSwnY2xhc3MnOidsYWJlbCcgfSlcclxuXHRcdC50ZXh0KChkKT0+ZC5pbmRleC5uYW1lKTtcclxuXHJcblx0XHRncGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0fSk7XHJcblxyXG5cdC8vIOWHuuWKm1BhcmFt44Gu6KGo56S6XHRcclxuXHRnZC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0dmFyIGdwID0gc2VsLmFwcGVuZCgnZycpO1xyXG5cdFx0XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0dmFyIGdwZCA9IGdwLnNlbGVjdEFsbCgnZycpXHJcblx0XHQuZGF0YShkLm91dHB1dFBhcmFtcy5tYXAoKGQpPT57XHJcblx0XHRcdHJldHVybiB7bm9kZTpkLkF1ZGlvTm9kZVZpZXcsaW5kZXg6ZH07XHJcblx0XHR9KSxmdW5jdGlvbihkKXtyZXR1cm4gZC5pbmRleC5pZDt9KTtcclxuXHRcdFxyXG5cdFx0dmFyIGdwZGcgPSBncGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpO1xyXG5cclxuXHRcdGdwZGcuYXBwZW5kKCdjaXJjbGUnKVxyXG5cdFx0LmF0dHIoeydyJzogKGQpPT5kLmluZGV4LndpZHRoLzIsIFxyXG5cdFx0Y3g6IGQud2lkdGgsIGN5OiAoZCwgaSk9PiB7IHJldHVybiBkLmluZGV4Lnk7IH0sXHJcblx0XHQnY2xhc3MnOiAncGFyYW0nfSlcclxuXHRcdC5jYWxsKGRyYWdPdXQpO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgndGV4dCcpXHJcblx0XHQuYXR0cih7eDogKGQpPT4gKGQuaW5kZXgueCArIGQuaW5kZXgud2lkdGggLyAyICsgNSkseTooZCk9PmQuaW5kZXgueSwnY2xhc3MnOidsYWJlbCcgfSlcclxuXHRcdC50ZXh0KChkKT0+ZC5pbmRleC5uYW1lKTtcclxuXHJcblx0XHRncGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0fSk7XHJcblxyXG5cdC8vIOWHuuWKm+ihqOekulxyXG5cdGdkLmZpbHRlcihmdW5jdGlvbiAoZCkge1xyXG5cdFx0cmV0dXJuIGQubnVtYmVyT2ZPdXRwdXRzID4gMDtcclxuXHR9KVxyXG5cdC5lYWNoKGZ1bmN0aW9uKGQpe1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ2cnKTtcclxuXHRcdGlmKCFkLnRlbXAub3V0cyB8fCAoZC50ZW1wLm91dHMgJiYgKGQudGVtcC5vdXRzLmxlbmd0aCA8IGQubnVtYmVyT2ZPdXRwdXRzKSkpXHJcblx0XHR7XHJcblx0XHRcdGQudGVtcC5vdXRzID0gW107XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7aSA8IGQubnVtYmVyT2ZPdXRwdXRzOysraSl7XHJcblx0XHRcdFx0ZC50ZW1wLm91dHMucHVzaCh7bm9kZTpkLGluZGV4Oml9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIHNlbDEgPSBzZWwuc2VsZWN0QWxsKCdnJyk7XHJcblx0XHR2YXIgc2VsZCA9IHNlbDEuZGF0YShkLnRlbXAub3V0cyk7XHJcblxyXG5cdFx0c2VsZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoeyB4OiBkLndpZHRoIC0gdWkucG9pbnRTaXplIC8gMiwgeTogKGQxKT0+IChkLm91dHB1dFN0YXJ0WSArIGQxLmluZGV4ICogMjAgLSB1aS5wb2ludFNpemUgLyAyKSwgd2lkdGg6IHVpLnBvaW50U2l6ZSwgaGVpZ2h0OiB1aS5wb2ludFNpemUsICdjbGFzcyc6ICdvdXRwdXQnIH0pXHJcblx0XHQuY2FsbChkcmFnT3V0KTtcclxuXHRcdHNlbGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH0pO1xyXG5cclxuXHQvLyDlhaXlipvooajnpLpcclxuXHRnZFxyXG5cdC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcdHJldHVybiBkLm51bWJlck9mSW5wdXRzID4gMDsgfSlcclxuXHQuZWFjaChmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCdnJyk7XHJcblx0XHRpZighZC50ZW1wLmlucyB8fCAoZC50ZW1wLmlucyAmJiAoZC50ZW1wLmlucy5sZW5ndGggPCBkLm51bWJlck9mSW5wdXRzKSkpXHJcblx0XHR7XHJcblx0XHRcdGQudGVtcC5pbnMgPSBbXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDtpIDwgZC5udW1iZXJPZklucHV0czsrK2kpe1xyXG5cdFx0XHRcdGQudGVtcC5pbnMucHVzaCh7bm9kZTpkLGluZGV4Oml9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIHNlbDEgPSBzZWwuc2VsZWN0QWxsKCdnJyk7XHJcblx0XHR2YXIgc2VsZCA9IHNlbDEuZGF0YShkLnRlbXAuaW5zKTtcclxuXHJcblx0XHRzZWxkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cih7IHg6IC0gdWkucG9pbnRTaXplIC8gMiwgeTogKGQxKT0+IChkLmlucHV0U3RhcnRZICsgZDEuaW5kZXggKiAyMCAtIHVpLnBvaW50U2l6ZSAvIDIpLCB3aWR0aDogdWkucG9pbnRTaXplLCBoZWlnaHQ6IHVpLnBvaW50U2l6ZSwgJ2NsYXNzJzogJ2lucHV0JyB9KVxyXG5cdFx0Lm9uKCdtb3VzZWVudGVyJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0bW91c2VPdmVyTm9kZSA9IHtub2RlOmQuYXVkaW9Ob2RlXyxwYXJhbTpkfTtcclxuXHRcdH0pXHJcblx0XHQub24oJ21vdXNlbGVhdmUnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRpZihtb3VzZU92ZXJOb2RlLm5vZGUpe1xyXG5cdFx0XHRcdGlmKG1vdXNlT3Zlck5vZGUubm9kZSA9PT0gZC5hdWRpb05vZGVfICYmIG1vdXNlT3Zlck5vZGUucGFyYW0gPT09IGQpe1xyXG5cdFx0XHRcdFx0bW91c2VPdmVyTm9kZSA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHNlbGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdC8vIOS4jeimgeOBquODjuODvOODieOBruWJiumZpFxyXG5cdGdkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdC8vIGxpbmUg5o+P55S7XHJcblx0dmFyIGxkID0gbGluZUdyb3VwLnNlbGVjdEFsbCgncGF0aCcpXHJcblx0LmRhdGEoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zKTtcclxuXHJcblx0bGQuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3BhdGgnKTtcclxuXHJcblx0bGQuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHBhdGggPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHR2YXIgeDEseTEseDIseTI7XHJcblxyXG5cdFx0Ly8geDEseTFcclxuXHRcdGlmKGQuZnJvbS5wYXJhbSl7XHJcblx0XHRcdGlmKGQuZnJvbS5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDEgPSBkLmZyb20ubm9kZS54IC0gZC5mcm9tLm5vZGUud2lkdGggLyAyICsgZC5mcm9tLnBhcmFtLng7XHJcblx0XHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLnBhcmFtLnk7IFxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCArIGQuZnJvbS5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0XHR5MSA9IGQuZnJvbS5ub2RlLnkgLSBkLmZyb20ubm9kZS5oZWlnaHQgLzIgKyBkLmZyb20ubm9kZS5vdXRwdXRTdGFydFkgKyBkLmZyb20ucGFyYW0gKiAyMDsgXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCArIGQuZnJvbS5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLm5vZGUub3V0cHV0U3RhcnRZO1xyXG5cdFx0fVxyXG5cclxuXHRcdHgyID0gZC50by5ub2RlLnggLSBkLnRvLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0eTIgPSBkLnRvLm5vZGUueSAtIGQudG8ubm9kZS5oZWlnaHQgLyAyO1xyXG5cdFx0XHJcblx0XHRpZihkLnRvLnBhcmFtKXtcclxuXHRcdFx0aWYoZC50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLkF1ZGlvUGFyYW1WaWV3IHx8IGQudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHgyICs9IGQudG8ucGFyYW0ueDtcclxuXHRcdFx0XHR5MiArPSBkLnRvLnBhcmFtLnk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eTIgKz0gIGQudG8ubm9kZS5pbnB1dFN0YXJ0WSAgKyAgZC50by5wYXJhbSAqIDIwO1x0XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHkyICs9IGQudG8ubm9kZS5pbnB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHBvcyA9IG1ha2VQb3MoeDEseTEseDIseTIpO1xyXG5cdFx0XHJcblx0XHRwYXRoLmF0dHIoeydkJzpsaW5lKHBvcyksJ2NsYXNzJzonbGluZSd9KTtcclxuXHRcdHBhdGgub24oJ2NsaWNrJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0aWYoZDMuZXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdChkLmZyb20sZC50byk7XHJcblx0XHRcdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdH0gXHJcblx0XHR9KS5jYWxsKHRvb2x0aXAoJ1NoaWZ0ICsgY2xpY2vjgafliYrpmaQnKSk7XHJcblx0XHRcclxuXHR9KTtcclxuXHRsZC5leGl0KCkucmVtb3ZlKCk7XHJcbn1cclxuXHJcbi8vIOewoeaYk3Rvb2x0aXDooajnpLpcclxuZnVuY3Rpb24gdG9vbHRpcChtZXMpXHJcbntcclxuXHRyZXR1cm4gZnVuY3Rpb24oZCl7XHJcblx0XHR0aGlzXHJcblx0XHQub24oJ21vdXNlZW50ZXInLGZ1bmN0aW9uKCl7XHJcblx0XHRcdHN2Zy5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHQuYXR0cih7J2NsYXNzJzondGlwJyx4OmQzLmV2ZW50LnggKyAyMCAseTpkMy5ldmVudC55IC0gMjB9KVxyXG5cdFx0XHQudGV4dChtZXMpO1xyXG5cdFx0fSlcclxuXHRcdC5vbignbW91c2VsZWF2ZScsZnVuY3Rpb24oKXtcclxuXHRcdFx0c3ZnLnNlbGVjdEFsbCgnLnRpcCcpLnJlbW92ZSgpO1xyXG5cdFx0fSlcclxuXHR9O1xyXG59XHJcblxyXG4vLyDmjqXntprnt5rjga7luqfmqJnnlJ/miJBcclxuZnVuY3Rpb24gbWFrZVBvcyh4MSx5MSx4Mix5Mil7XHJcblx0cmV0dXJuIFtcclxuXHRcdFx0e3g6eDEseTp5MX0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpLzQseTp5MX0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpLzIseTp5MSArICh5MiAtIHkxKS8yfSxcclxuXHRcdFx0e3g6eDEgKyAoeDIgLSB4MSkqMy80LHk6eTJ9LFxyXG5cdFx0XHR7eDp4MiwgeTp5Mn1cclxuXHRcdF07XHJcbn1cclxuXHJcbi8vIOODl+ODreODkeODhuOCo+ODkeODjeODq+OBruihqOekulxyXG5mdW5jdGlvbiBzaG93UGFuZWwoZCl7XHJcblxyXG5cdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0ZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRpZihkLnBhbmVsICYmIGQucGFuZWwuaXNTaG93KSByZXR1cm4gO1xyXG5cclxuXHRkLnBhbmVsID0gbmV3IHVpLlBhbmVsKCk7XHJcblx0ZC5wYW5lbC54ID0gZC54O1xyXG5cdGQucGFuZWwueSA9IGQueTtcclxuXHRkLnBhbmVsLmhlYWRlci50ZXh0KGQubmFtZSk7XHJcblx0XHJcblx0dmFyIHRhYmxlID0gZC5wYW5lbC5hcnRpY2xlLmFwcGVuZCgndGFibGUnKTtcclxuXHR2YXIgdGJvZHkgPSB0YWJsZS5hcHBlbmQoJ3Rib2R5Jykuc2VsZWN0QWxsKCd0cicpLmRhdGEoZC5wYXJhbXMpO1xyXG5cdHZhciB0ciA9IHRib2R5LmVudGVyKClcclxuXHQuYXBwZW5kKCd0cicpO1xyXG5cdHRyLmFwcGVuZCgndGQnKVxyXG5cdC50ZXh0KChkKT0+ZC5uYW1lKTtcclxuXHR0ci5hcHBlbmQoJ3RkJylcclxuXHQuYXBwZW5kKCdpbnB1dCcpXHJcblx0LmF0dHIoe3R5cGU6XCJ0ZXh0XCIsdmFsdWU6KGQpPT5kLmdldCgpLHJlYWRvbmx5OihkKT0+ZC5zZXQ/bnVsbDoncmVhZG9ubHknfSlcclxuXHQub24oJ2NoYW5nZScsZnVuY3Rpb24oZCl7XHJcblx0XHRsZXQgdmFsdWUgPSB0aGlzLnZhbHVlO1xyXG5cdFx0bGV0IHZuID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcblx0XHRpZihpc05hTih2bikpe1xyXG5cdFx0XHRkLnNldCh2YWx1ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRkLnNldCh2bik7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0ZC5wYW5lbC5zaG93KCk7XHJcblxyXG59XHJcblxyXG4vLyDjg47jg7zjg4nmjL/lhaXjg5Hjg43jg6vjga7ooajnpLpcclxuZnVuY3Rpb24gc2hvd0F1ZGlvTm9kZVBhbmVsKGQpe1xyXG5cdCBkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdCBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRpZihkLnBhbmVsKXtcclxuXHRcdGlmKGQucGFuZWwuaXNTaG93KVxyXG5cdFx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGQucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuXHRkLnBhbmVsLnggPSBkMy5ldmVudC5vZmZzZXRYO1xyXG5cdGQucGFuZWwueSA9IGQzLmV2ZW50Lm9mZnNldFk7XHJcblx0ZC5wYW5lbC5oZWFkZXIudGV4dCgnQXVkaW9Ob2Rl44Gu5oy/5YWlJyk7XHJcblxyXG5cdHZhciB0YWJsZSA9IGQucGFuZWwuYXJ0aWNsZS5hcHBlbmQoJ3RhYmxlJyk7XHJcblx0dmFyIHRib2R5ID0gdGFibGUuYXBwZW5kKCd0Ym9keScpLnNlbGVjdEFsbCgndHInKS5kYXRhKGF1ZGlvTm9kZUNyZWF0b3JzKTtcclxuXHR0Ym9keS5lbnRlcigpXHJcblx0LmFwcGVuZCgndHInKVxyXG5cdC5hcHBlbmQoJ3RkJylcclxuXHQudGV4dCgoZCk9PmQubmFtZSlcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbihkdCl7XHJcblx0XHRjb25zb2xlLmxvZyhkMy5ldmVudCk7XHJcblx0XHR2YXIgbm9kZSA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGR0LmNyZWF0ZSgpKTtcclxuXHRcdG5vZGUueCA9IGQzLmV2ZW50LmNsaWVudFg7XHJcblx0XHRub2RlLnkgPSBkMy5ldmVudC5jbGllbnRZO1xyXG5cdFx0ZHJhdygpO1xyXG5cdFx0Ly8gZDMuc2VsZWN0KCcjcHJvcC1wYW5lbCcpLnN0eWxlKCd2aXNpYmlsaXR5JywnaGlkZGVuJyk7XHJcblx0XHQvLyBkLnBhbmVsLmRpc3Bvc2UoKTtcclxuXHR9KTtcclxuXHRkLnBhbmVsLnNob3coKTtcclxufVxyXG4iLCJpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvTm9kZVZpZXcnO1xyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBFRyB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHRoaXMuZ2F0ZSA9IG5ldyBhdWRpby5QYXJhbVZpZXcodGhpcywnZ2F0ZScsZmFsc2UpO1xyXG5cdFx0dGhpcy5nYXRlLmNvbm5lY3RfID0gKGZ1bmN0aW9uKHBhcmFtKXtcclxuXHRcdFx0aWYocGFyYW0ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHRoaXMuZXhlYyA9IChwKT0+e1xyXG5cdFx0XHRcdFx0dGhpcy5wYXJhbS5wdXNoKHBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSBpZihwYXJhbS5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLkF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHR9KS5iaW5kKHRoaXMuZ2F0ZSk7XHJcblx0XHR0aGlzLm91dHB1dCA9IG5ldyBhdWRpby5QYXJhbVZpZXcodGhpcywnb3V0cHV0Jyx0cnVlKTtcclxuXHRcdHRoaXMubnVtYmVyT2ZJbnB1dHMgPSAwO1xyXG5cdFx0dGhpcy5udW1iZXJPZk91dHB1dHMgPSAwO1xyXG5cdFx0dGhpcy5hdHRhY2sgPSAwLjU7XHJcblx0XHR0aGlzLmRlY2F5ID0gMC41O1xyXG5cdFx0dGhpcy5yZWxlYXNlID0gMC41O1xyXG5cdFx0dGhpcy5zdXN0YWluID0gMC41O1xyXG5cdFx0dGhpcy5nYWluID0gMS4wO1xyXG5cdFx0dGhpcy5uYW1lID0gJ0VHJztcclxuXHRcdGF1ZGlvLmRlZklzTm90QVBJT2JqKHRoaXMsZmFsc2UpO1xyXG5cdH1cclxuXHRcclxuXHRjb25uZWN0KHRvKXtcclxuXHRcdGNvbnNvbGUubG9nKCdjb25uZWN0Jyk7XHJcblx0fVxyXG5cdFxyXG5cdGRpc2Nvbm5lY3QodG8pe1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG59XHJcblxyXG4vLyAvLy8g44Ko44Oz44OZ44Ot44O844OX44K444Kn44ON44Os44O844K/44O8XHJcbi8vIGZ1bmN0aW9uIEVudmVsb3BlR2VuZXJhdG9yKHZvaWNlLCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKSB7XHJcbi8vICAgdGhpcy52b2ljZSA9IHZvaWNlO1xyXG4vLyAgIC8vdGhpcy5rZXlvbiA9IGZhbHNlO1xyXG4vLyAgIHRoaXMuYXR0YWNrID0gYXR0YWNrIHx8IDAuMDAwNTtcclxuLy8gICB0aGlzLmRlY2F5ID0gZGVjYXkgfHwgMC4wNTtcclxuLy8gICB0aGlzLnN1c3RhaW4gPSBzdXN0YWluIHx8IDAuNTtcclxuLy8gICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlIHx8IDAuNTtcclxuLy8gfTtcclxuLy8gXHJcbi8vIEVudmVsb3BlR2VuZXJhdG9yLnByb3RvdHlwZSA9XHJcbi8vIHtcclxuLy8gICBrZXlvbjogZnVuY3Rpb24gKHQsdmVsKSB7XHJcbi8vICAgICB0aGlzLnYgPSB2ZWwgfHwgMS4wO1xyXG4vLyAgICAgdmFyIHYgPSB0aGlzLnY7XHJcbi8vICAgICB2YXIgdDAgPSB0IHx8IHRoaXMudm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbi8vICAgICB2YXIgdDEgPSB0MCArIHRoaXMuYXR0YWNrICogdjtcclxuLy8gICAgIHZhciBnYWluID0gdGhpcy52b2ljZS5nYWluLmdhaW47XHJcbi8vICAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbi8vICAgICBnYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwKTtcclxuLy8gICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodiwgdDEpO1xyXG4vLyAgICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MCArIHRoaXMuZGVjYXkgLyB2KTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDEsIHQxICsgdGhpcy5kZWNheSAvIHYpO1xyXG4vLyAgIH0sXHJcbi8vICAga2V5b2ZmOiBmdW5jdGlvbiAodCkge1xyXG4vLyAgICAgdmFyIHZvaWNlID0gdGhpcy52b2ljZTtcclxuLy8gICAgIHZhciBnYWluID0gdm9pY2UuZ2Fpbi5nYWluO1xyXG4vLyAgICAgdmFyIHQwID0gdCB8fCB2b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuLy8gICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbi8vICAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKDAsIHQwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbi8vICAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICB9XHJcbi8vIH07IiwiaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpb05vZGVWaWV3JztcclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihzdGVwKXtcclxuXHRcdHRoaXMuc3RlcCA9IDA7IFxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE5vdGVFdmVudCBleHRlbmRzIEV2ZW50QmFzZSB7XHJcblx0Y29uc3RydWN0b3Ioc3RlcCA9IDk2LG5vdGUgPSA2NCxnYXRlID0gNDgsdmVsID0gMS4wLGNvbW1hbmQgPSAwKXtcclxuXHRcdHN1cGVyKHN0ZXApO1xyXG5cdFx0dGhpcy5ub3RlXyA9IG5vdGU7XHJcblx0XHR0aGlzLmNhbGNQaXRjaCgpO1xyXG5cdFx0dGhpcy5nYXRlID0gZ2F0ZTtcclxuXHRcdHRoaXMudmVsID0gdmVsO1xyXG5cdFx0dGhpcy5jb21tYW5kID0gY29tbWFuZDtcclxuXHR9XHJcblx0XHJcblx0Z2V0IG5vdGUgKCl7XHJcblx0XHQgcmV0dXJuIHRoaXMubm90ZV87XHJcblx0fVxyXG5cdHNldCBub3RlKHYpe1xyXG5cdFx0IHRoaXMubm90ZV8gPSB2O1xyXG5cdFx0IHRoaXMuY2FsY1BpdGNoKCk7XHJcblx0fVxyXG5cdFxyXG5cdGNhbGNQaXRjaCgpe1xyXG5cdFx0dGhpcy5waXRjaCA9ICg0NDAuMCAvIDMyLjApICogKE1hdGgucG93KDIuMCwoKHRoaXMubm90ZV8gLSA5KSAvIDEyKSkpO1xyXG5cdH1cclxuXHRcclxuXHRwcm9jZXNzKHRpbWUsdHJhY2spe1xyXG5cdFx0XHRmb3IobGV0IGogPSAwLGplID0gdHJhY2sucGl0aGNlcy5sZW5ndGg7aiA8IGplOysrail7XHJcblx0XHRcdFx0dHJhY2sucGl0Y2hlc1tqXS5wcm9jZXNzKHRpbWUsdGhpcy5waXRjaCk7XHJcblx0XHRcdH1cclxuXHRcdFx0Zm9yKGxldCBqID0gMCxqZSA9IHRyYWNrLnZlbG9jaXRpZXMubGVuZ3RoO2ogPCBqZTsrK2ope1xyXG5cdFx0XHRcdHRyYWNrLnZlbG9jaXRpZXNbal0ucHJvY2Vzcyh0aW1lLHRoaXMudmVsKTtcclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFRyYWNrIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0dGhpcy5ldmVudHMgPSBbXTtcclxuXHRcdHRoaXMucG9pbnRlciA9IDA7XHJcblx0XHR0aGlzLnN0ZXAgPSAwO1xyXG5cdFx0dGhpcy5lbmQgPSBmYWxzZTtcclxuXHRcdHRoaXMucGl0Y2hlcyA9IFtdO1xyXG5cdFx0dGhpcy52ZWxvY2l0aWVzID0gW107XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VyIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0dGhpcy5icG0gPSAxMjAuMDsgLy8gdGVtcG9cclxuXHRcdHRoaXMudHBiID0gNDguMDsgLy8g5Zub5YiG6Z+z56ym44Gu6Kej5YOP5bqmXHJcblx0XHR0aGlzLmJlYXQgPSA0O1xyXG5cdFx0dGhpcy5iYXIgPSA0OyAvLyBcclxuXHRcdHRoaXMudHJhY2tzID0gW107XHJcblx0XHR0aGlzLm51bWJlck9mSW5wdXRzID0gMDtcclxuXHRcdHRoaXMubnVtYmVyT2ZPdXRwdXRzID0gMDtcclxuXHRcdHRoaXMubmFtZSA9ICdTZXF1ZW5jZXInO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7aSA8IDE2OysraSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy50cmFja3MucHVzaChuZXcgVHJhY2soKSk7XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ2cnXSA9IG5ldyBhdWRpby5QYXJhbVZpZXcobnVsbCwndHJrJyArIGkgKyAnZycsdHJ1ZSk7XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ2cnXS50cmFjayA9IHRoaXMudHJhY2tzW2ldO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdnJ10udHlwZSA9ICdnYXRlJztcclxuXHRcdFx0XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ3AnXSA9IG5ldyBhdWRpby5QYXJhbVZpZXcobnVsbCwndHJrJyArIGkgKyAncCcsdHJ1ZSk7XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ3AnXS50cmFjayA9IHRoaXMudHJhY2tzW2ldO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdwJ10udHlwZSA9ICdwaXRjaCc7XHJcblx0XHR9XHJcblx0XHR0aGlzLnN0YXJ0VGltZV8gPSAwO1xyXG5cdFx0dGhpcy5jdXJyZW50VGltZV8gPSAwO1xyXG5cdFx0dGhpcy5jYWxjU3RlcFRpbWUoKTtcclxuXHRcdHRoaXMucmVwZWF0ID0gZmFsc2U7XHJcblx0fVxyXG5cdFxyXG5cdGNhbGNTdGVwVGltZSgpe1xyXG5cdFx0dGhpcy5zdGVwVGltZV8gPSA2MC4wIC8gKCB0aGlzLmJwbSAqIHRoaXMudHBiKTsgXHJcblx0fVxyXG5cdFxyXG5cdHN0YXJ0KHRpbWUpe1xyXG5cdFx0dGhpcy5jdXJyZW50VGltZV8gPSB0aW1lIHx8IGF1ZGlvLmN0eC5jdXJyZW50VGltZSgpO1xyXG5cdH1cclxuXHRcclxuXHRzdG9wKCl7XHJcblx0XHRcclxuXHR9XHJcblxyXG5cdHBhdXNlKCl7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0cmVzZXQoKXtcclxuXHRcdHRoaXMuc3RhcnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLnRyYWNrcy5mb3JFYWNoKCh0cmFjayk9PntcclxuXHRcdFx0dHJhY2suZW5kID0gZmFsc2U7XHJcblx0XHRcdHRyYWNrLnN0ZXAgPSAwO1xyXG5cdFx0XHR0cmFjay5wb2ludGVyID0gMDtcclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5jYWxjU3RlcFRpbWUoKTtcclxuXHR9XHJcbiAgLy8g44K344O844Kx44Oz44K144O844Gu5Yem55CGXHJcblx0cHJvY2VzcyAodGltZSlcclxuXHR7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IHRpbWUgfHwgYXVkaW8uY3R4LmN1cnJlbnRUaW1lKCk7XHJcblx0XHR2YXIgY3VycmVudFN0ZXAgPSAodGhpcy5jdXJyZW50VGltZV8gIC0gdGhpcy5zdGFydFRpbWVfICsgMC4xKSAvIHRoaXMuc3RlcFRpbWVfO1xyXG5cdFx0Zm9yKHZhciBpID0gMCxsID0gdGhpcy50cmFja3MubGVuZ3RoO2kgPCBsOysraSl7XHJcblx0XHRcdHZhciB0cmFjayA9IHRoaXMudHJhY2tzW2ldO1xyXG5cdFx0XHR3aGlsZSh0cmFjay5zdGVwIDw9IGN1cnJlbnRTdGVwICYmICF0cmFjay5lbmQgKXtcclxuXHRcdFx0XHRpZih0cmFjay5wb2ludGVyID4gdHJhY2suZXZlbnRzLmxlbmd0aCApe1xyXG5cdFx0XHRcdFx0dHJhY2suZW5kID0gdHJ1ZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR2YXIgZXZlbnQgPSB0cmFjay5ldmVudHNbdHJhY2sucG9pbnRlcisrXTtcclxuXHRcdFx0XHRcdHRyYWNrLnN0ZXAgKz0gZXZlbnQuc3RlcDtcclxuXHRcdFx0XHRcdHZhciBwbGF5VGltZSA9IHRyYWNrLnN0ZXAgKiB0aGlzLnN0ZXBUaW1lXyArIHRoaXMuY3VycmVudFRpbWVfO1xyXG5cdFx0XHRcdFx0ZXZlbnQucHJvY2VzcyhwbGF5VGltZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGNvbm5lY3QoYyl7XHJcblx0XHRjb25zb2xlLmxvZygnY29ubmVjdCcpO1xyXG5cdFx0dmFyIHRyYWNrID0gYy5mcm9tLnBhcmFtLnRyYWNrO1xyXG5cdFx0aWYoYy5mcm9tLnBhcmFtLnR5cGUgPT09ICdwaXRjaCcpe1xyXG5cdFx0XHR0cmFjay5waXRjaGVzLnB1c2gobWFrZVByb2Nlc3MoYykpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0XHJcblx0XHR9XHJcblx0XHRcclxuXHR9XHJcblx0XHJcblx0ZGlzY29ubmVjdChjKXtcclxuXHR9XHJcblx0XHJcblx0c3RhdGljIG1ha2VQcm9jZXNzKGMpe1xyXG5cdFx0aWYoYy50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdHJldHVybiAge1xyXG5cdFx0XHRcdHRvOmMudG8sXHJcblx0XHRcdFx0cHJvY2VzczogKHQsdixjb20pPT57XHJcblx0XHRcdFx0XHRjLnRvLm5vZGUucHJvY2Vzcyh0LHYsY29tLGMudG8pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR9O1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHR0bzpjLnRvLFxyXG5cdFx0XHRcdHByb2Nlc3M6ICh0LHYsY29tKT0+e1xyXG5cdFx0XHRcdFx0Y29tLnByb2Nlc3ModCx2LGMudG8ucGFyYW0uYXVkaW9QYXJhbSk7XHJcblxyXG5cdFx0XHRcdFx0Ly8gc3dpdGNoKGNvbSlcclxuXHRcdFx0XHRcdC8vIHtcclxuXHRcdFx0XHRcdC8vIFx0Y2FzZSAwOlxyXG5cdFx0XHRcdFx0Ly8gXHRcdGMudG8ucGFyYW0uYXVkaW9QYXJhbS5zZXRWYWx1ZUF0VGltZSh0LHYpO1xyXG5cdFx0XHRcdFx0Ly8gXHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Ly8gXHRicmVhaztcclxuXHRcdFx0XHRcdC8vIFx0XHRjLnRvLnBhcmFtLmF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodCx2KTtcclxuXHRcdFx0XHRcdC8vIFx0XHRicmVhaztcclxuXHRcdFx0XHRcdC8vIFx0Y2FzZSAxOlxyXG5cdFx0XHRcdFx0Ly8gXHRcdGMudG8ucGFyYW0uYXVkaW9QYXJhbS5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKHQsdik7XHJcblx0XHRcdFx0XHQvLyBcdGJyZWFrO1xyXG5cdFx0XHRcdFx0Ly8gXHRjYXNlIDI6XHJcblx0XHRcdFx0XHQvLyBcdFx0Yy50by5wYXJhbS5hdWRpb1BhcmFtLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0KTtcclxuXHRcdFx0XHRcdC8vIFx0YnJlYWs7XHJcblx0XHRcdFx0XHQvLyB9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCBVVUlEIGZyb20gJy4vdXVpZC5jb3JlJztcclxuZXhwb3J0IGNvbnN0IG5vZGVIZWlnaHQgPSA1MDtcclxuZXhwb3J0IGNvbnN0IG5vZGVXaWR0aCA9IDEwMDtcclxuZXhwb3J0IGNvbnN0IHBvaW50U2l6ZSA9IDE2O1xyXG5cclxuLy8gcGFuZWwgd2luZG93XHJcbmV4cG9ydCBjbGFzcyBQYW5lbCB7XHJcblx0Y29uc3RydWN0b3Ioc2VsLHByb3Ape1xyXG5cdFx0aWYoIXByb3AgfHwgIXByb3AuaWQpe1xyXG5cdFx0XHRwcm9wID0gcHJvcCA/IChwcm9wLmlkID0gJ2lkLScgKyBVVUlELmdlbmVyYXRlKCkscHJvcCkgOnsgaWQ6J2lkLScgKyBVVUlELmdlbmVyYXRlKCl9O1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5pZCA9IHByb3AuaWQ7XHJcblx0XHRzZWwgPSBzZWwgfHwgZDMuc2VsZWN0KCcjY29udGVudCcpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBcclxuXHRcdHNlbFxyXG5cdFx0LmFwcGVuZCgnZGl2JylcclxuXHRcdC5hdHRyKHByb3ApXHJcblx0XHQuYXR0cignY2xhc3MnLCdwYW5lbCcpXHJcblx0XHQuZGF0dW0odGhpcyk7XHJcblxyXG5cdFx0Ly8g44OR44ON44Or55SoRHJhZ+OBneOBruS7llxyXG5cclxuXHRcdHRoaXMuaGVhZGVyID0gdGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdoZWFkZXInKS5jYWxsKHRoaXMuZHJhZyk7XHJcblx0XHR0aGlzLmFydGljbGUgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2FydGljbGUnKTtcclxuXHRcdHRoaXMuZm9vdGVyID0gdGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdmb290ZXInKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnZGl2JylcclxuXHRcdC5jbGFzc2VkKCdwYW5lbC1jbG9zZScsdHJ1ZSlcclxuXHRcdC5vbignY2xpY2snLCgpPT57XHJcblx0XHRcdHRoaXMuZGlzcG9zZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdH1cdFxyXG5cclxuXHRnZXQgbm9kZSgpIHtcclxuXHRcdHJldHVybiB0aGlzLnNlbGVjdGlvbi5ub2RlKCk7XHJcblx0fVxyXG5cdGdldCB4ICgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2xlZnQnKSk7XHJcblx0fVxyXG5cdHNldCB4ICh2KXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdsZWZ0Jyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCB5ICgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3RvcCcpKTtcclxuXHR9XHJcblx0c2V0IHkgKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3RvcCcsdiArICdweCcpO1xyXG5cdH1cclxuXHRnZXQgd2lkdGgoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd3aWR0aCcpKTtcclxuXHR9XHJcblx0c2V0IHdpZHRoKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3dpZHRoJywgdiArICdweCcpO1xyXG5cdH1cclxuXHRnZXQgaGVpZ2h0KCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnaGVpZ2h0JykpO1xyXG5cdH1cclxuXHRzZXQgaGVpZ2h0KHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2hlaWdodCcsdiArICdweCcpO1xyXG5cdH1cclxuXHRcclxuXHRkaXNwb3NlKCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5yZW1vdmUoKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uID0gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0c2hvdygpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknLCd2aXNpYmxlJyk7XHJcblx0fVxyXG5cclxuXHRoaWRlKCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScsJ2hpZGRlbicpO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgaXNTaG93KCl7XHJcblx0XHRyZXR1cm4gdGhpcy5zZWxlY3Rpb24gJiYgdGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknKSA9PT0gJ3Zpc2libGUnO1xyXG5cdH1cclxufVxyXG5cclxuUGFuZWwucHJvdG90eXBlLmRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHRcdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdFx0Y29uc29sZS5sb2coZCk7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KCcjJyArIGQuaWQpO1xyXG5cdFx0XHJcblx0XHRkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHQuYXR0cih7aWQ6J3BhbmVsLWR1bW15LScgKyBkLmlkLFxyXG5cdFx0XHQnY2xhc3MnOidwYW5lbCBwYW5lbC1kdW1teSd9KVxyXG5cdFx0LnN0eWxlKHtcclxuXHRcdFx0bGVmdDpzZWwuc3R5bGUoJ2xlZnQnKSxcclxuXHRcdFx0dG9wOnNlbC5zdHlsZSgndG9wJylcclxuXHRcdH0pO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIGR1bW15ID0gZDMuc2VsZWN0KCcjcGFuZWwtZHVtbXktJyArIGQuaWQpO1xyXG5cclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkdW1teS5zdHlsZSgnbGVmdCcpKSArIGQzLmV2ZW50LmR4O1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGR1bW15LnN0eWxlKCd0b3AnKSkgKyBkMy5ldmVudC5keTtcclxuXHRcdFxyXG5cdFx0ZHVtbXkuc3R5bGUoeydsZWZ0Jzp4ICsgJ3B4JywndG9wJzp5ICsgJ3B4J30pO1xyXG5cdH0pXHJcblx0Lm9uKCdkcmFnZW5kJyxmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QoJyMnICsgZC5pZCk7XHJcblx0XHR2YXIgZHVtbXkgPSBkMy5zZWxlY3QoJyNwYW5lbC1kdW1teS0nICsgZC5pZCk7XHJcblx0XHRzZWwuc3R5bGUoXHJcblx0XHRcdHsnbGVmdCc6ZHVtbXkuc3R5bGUoJ2xlZnQnKSwndG9wJzpkdW1teS5zdHlsZSgndG9wJyl9XHJcblx0XHQpO1xyXG5cdFx0ZHVtbXkucmVtb3ZlKCk7XHJcblx0fSk7XHJcblx0XHJcbiIsIi8qXG4gVmVyc2lvbjogY29yZS0xLjBcbiBUaGUgTUlUIExpY2Vuc2U6IENvcHlyaWdodCAoYykgMjAxMiBMaW9zSy5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBVVUlEKCl7fVVVSUQuZ2VuZXJhdGU9ZnVuY3Rpb24oKXt2YXIgYT1VVUlELl9ncmksYj1VVUlELl9oYTtyZXR1cm4gYihhKDMyKSw4KStcIi1cIitiKGEoMTYpLDQpK1wiLVwiK2IoMTYzODR8YSgxMiksNCkrXCItXCIrYigzMjc2OHxhKDE0KSw0KStcIi1cIitiKGEoNDgpLDEyKX07VVVJRC5fZ3JpPWZ1bmN0aW9uKGEpe3JldHVybiAwPmE/TmFOOjMwPj1hPzB8TWF0aC5yYW5kb20oKSooMTw8YSk6NTM+PWE/KDB8MTA3Mzc0MTgyNCpNYXRoLnJhbmRvbSgpKSsxMDczNzQxODI0KigwfE1hdGgucmFuZG9tKCkqKDE8PGEtMzApKTpOYU59O1VVSUQuX2hhPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPWEudG9TdHJpbmcoMTYpLGQ9Yi1jLmxlbmd0aCxlPVwiMFwiOzA8ZDtkPj4+PTEsZSs9ZSlkJjEmJihjPWUrYyk7cmV0dXJuIGN9O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4uL3NyYy9hdWRpbyc7XHJcbmltcG9ydCB7aW5pdFVJLGRyYXcsc3ZnIH0gZnJvbSAnLi4vc3JjL2RyYXcnO1xyXG5cclxuZGVzY3JpYmUoJ0F1ZGlvTm9kZVRlc3QnLCAoKSA9PiB7XHJcblx0YXVkaW8uY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG5cdHZhciBvc2MsIGdhaW4sIGZpbHRlciwgb3V0LCBvc2MyLCBzcGxpdHRlciwgbWVyZ2VyLGVnO1xyXG5cclxuXHRiZWZvcmVFYWNoKCgpID0+IHtcclxuXHJcblx0fSk7XHJcblxyXG5cdGl0KFwiYXVkaW8uQXVkaW9Ob2RlVmlld+i/veWKoFwiLCAoKSA9PiB7XHJcblxyXG5cdFx0b3NjID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZU9zY2lsbGF0b3IoKSk7XHJcblx0XHRvc2MueCA9IDEwMDtcclxuXHRcdG9zYy55ID0gMjAwO1xyXG5cclxuXHRcdGdhaW4gPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguY3JlYXRlR2FpbigpKTtcclxuXHJcblx0XHRnYWluLnggPSA0MDA7XHJcblx0XHRnYWluLnkgPSAyMDA7XHJcblxyXG5cdFx0ZmlsdGVyID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpKTtcclxuXHRcdGZpbHRlci54ID0gMjUwO1xyXG5cdFx0ZmlsdGVyLnkgPSAzMzA7XHJcblxyXG5cdFx0b3V0ID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmRlc3RpbmF0aW9uKTtcclxuXHRcdG91dC54ID0gNzUwO1xyXG5cdFx0b3V0LnkgPSAzMDA7XHJcblxyXG5cclxuXHRcdG9zYzIgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguY3JlYXRlT3NjaWxsYXRvcigpKTtcclxuXHRcdG9zYzIueCA9IDEwMDtcclxuXHRcdG9zYzIueSA9IDYwMDtcclxuXHJcblx0XHRzcGxpdHRlciA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5jcmVhdGVDaGFubmVsU3BsaXR0ZXIoKSk7XHJcblx0XHRzcGxpdHRlci54ID0gMjUwO1xyXG5cdFx0c3BsaXR0ZXIueSA9IDYwMDtcclxuXHJcblx0XHRtZXJnZXIgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguY3JlYXRlQ2hhbm5lbE1lcmdlcigpKTtcclxuXHRcdG1lcmdlci54ID0gNTAwO1xyXG5cdFx0bWVyZ2VyLnkgPSA2MDA7XHJcblx0XHRcclxuXHRcdGVnID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUobmV3IGF1ZGlvLkVHKCkpO1xyXG5cclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoKS50b0VxdWFsKDgpO1xyXG5cdH0pO1xyXG5cclxuXHRpdCgn44Kz44ON44Kv44K344On44Oz6L+95Yqg5b6M44OB44Kn44OD44KvJywgKCkgPT4ge1xyXG5cclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChvc2MsIGZpbHRlcik7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qob3NjLCBnYWluLmlucHV0UGFyYW1zWzBdKTtcclxuXHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KGZpbHRlciwgZ2Fpbik7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoZ2Fpbiwgb3V0KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChtZXJnZXIsIG91dCk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDAgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAwIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAxIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMSB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMiB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDMgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDMgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAyIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiA1IH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogNSB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogNCB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDQgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qob3NjMiwgc3BsaXR0ZXIpO1xyXG5cdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6ZWcscGFyYW06ZWcub3V0cHV0fSx7bm9kZTpnYWluLHBhcmFtOmdhaW4uaW5wdXRQYXJhbXNbMF19KTtcclxuXHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aCkudG9FcXVhbCgxMyk7XHJcblx0fSk7XHJcblx0XHRcclxuXHJcblx0aXQoJ+ODjuODvOODieWJiumZpCcsICgpID0+IHtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKG9zYyk7XHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aCkudG9FcXVhbCg3KTtcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoKS50b0VxdWFsKDExKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cdFxyXG5cdGl0KCfjgrPjg43jgq/jgrfjg6fjg7PliYrpmaQnLCgpPT57XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3Qoe25vZGU6ZWcscGFyYW06ZWcub3V0cHV0fSx7bm9kZTpnYWluLHBhcmFtOmdhaW4uaW5wdXRQYXJhbXNbMF19KTtcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoKS50b0VxdWFsKDEwKTtcclxuXHR9KTtcclxuXHJcblx0aXQoJ+ODleOCo+ODq+OCv+ODvOWJiumZpOW+jOODgeOCp+ODg+OCrycsICgpID0+IHtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKGZpbHRlcik7XHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aCkudG9FcXVhbCg2KTtcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoKS50b0VxdWFsKDkpO1xyXG5cdFx0ZXhwZWN0KCgoKSA9PiB7XHJcblx0XHRcdHZhciByZXQgPSAwO1xyXG5cdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuZm9yRWFjaCgoZCkgPT4ge1xyXG5cdFx0XHRcdGlmIChkLmZyb20ubm9kZSA9PT0gZmlsdGVyIHx8IGQudG8ubm9kZSA9PT0gZmlsdGVyKSB7XHJcblx0XHRcdFx0XHQrK3JldDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gcmV0O1xyXG5cdFx0fSkoKSkudG9FcXVhbCgwKTtcclxuXHR9KTtcclxuXHRcclxuXHRpdCgn5o+P55S744GX44Gm44G/44KLJywoKT0+e1xyXG5cdFx0Ly9cdG9zYy5hdWRpb05vZGUudHlwZSA9ICdzYXd0b290aCc7XHJcblx0XHRvc2MudHlwZSA9ICdzYXd0b290aCc7XHJcblx0XHRjb25zb2xlLmxvZyhvc2MudHlwZSk7XHJcblx0XHRvc2MuZnJlcXVlbmN5LnZhbHVlID0gNDQwO1xyXG5cdFx0Ly8gb3NjLnN0YXJ0KCk7XHJcblx0XHQvLyBvc2Muc3RvcChhdWRpby5jdHguY3VycmVudFRpbWUgKyAwLjEpO1xyXG5cdFx0aW5pdFVJKCk7XHJcblx0XHRkcmF3KCk7XHJcblx0XHRleHBlY3QodHJ1ZSkudG9CZSh0cnVlKTtcclxuXHR9KTtcclxuXHRcclxuXHRcclxufSk7Il19
