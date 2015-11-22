(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventEmitter;
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {} /* Nothing to set */

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event,
      available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt],
      len = arguments.length,
      args,
      i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1:
        return listeners.fn.call(listeners.context), true;
      case 2:
        return listeners.fn.call(listeners.context, a1), true;
      case 3:
        return listeners.fn.call(listeners.context, a1, a2), true;
      case 4:
        return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len - 1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length,
        j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1:
          listeners[i].fn.call(listeners[i].context);break;
        case 2:
          listeners[i].fn.call(listeners[i].context, a1);break;
        case 3:
          listeners[i].fn.call(listeners[i].context, a1, a2);break;
        default:
          if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this),
      evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;else {
    if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true),
      evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;else {
    if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */

EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt],
      events = [];

  if (fn) {
    if (listeners.fn) {
      if (listeners.fn !== fn || once && !listeners.once || context && listeners.context !== context) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _audioNodeView = require('./audioNodeView');

for (let _key in _audioNodeView) {
  if (_key === "default") continue;
  Object.defineProperty(exports, _key, {
    enumerable: true,
    get: function () {
      return _audioNodeView[_key];
    }
  });
}

var _eg = require('./eg');

for (let _key2 in _eg) {
  if (_key2 === "default") continue;
  Object.defineProperty(exports, _key2, {
    enumerable: true,
    get: function () {
      return _eg[_key2];
    }
  });
}

var _sequencer = require('./sequencer');

for (let _key3 in _sequencer) {
  if (_key3 === "default") continue;
  Object.defineProperty(exports, _key3, {
    enumerable: true,
    get: function () {
      return _sequencer[_key3];
    }
  });
}

exports.dummy = dummy;
function dummy() {};

},{"./audioNodeView":3,"./eg":5,"./sequencer":10}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.AudioNodeView = exports.ParamView = exports.AudioParamView = exports.STATUS_PLAY_PLAYED = exports.STATUS_PLAY_PLAYING = exports.STATUS_PLAY_NOT_PLAYED = exports.NodeViewBase = exports.ctx = undefined;
exports.setCtx = setCtx;
exports.defIsNotAPIObj = defIsNotAPIObj;

var _ui = require('./ui');

var ui = _interopRequireWildcard(_ui);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var counter = 0;
var ctx = exports.ctx = undefined;
function setCtx(c) {
	exports.ctx = ctx = c;
}

let NodeViewBase = exports.NodeViewBase = function NodeViewBase() {
	let x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	let y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	let width = arguments.length <= 2 || arguments[2] === undefined ? ui.nodeWidth : arguments[2];
	let height = arguments.length <= 3 || arguments[3] === undefined ? ui.nodeHeight : arguments[3];
	let name = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];

	_classCallCheck(this, NodeViewBase);

	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.name = name;
};

const STATUS_PLAY_NOT_PLAYED = exports.STATUS_PLAY_NOT_PLAYED = 0;
const STATUS_PLAY_PLAYING = exports.STATUS_PLAY_PLAYING = 1;
const STATUS_PLAY_PLAYED = exports.STATUS_PLAY_PLAYED = 2;

function defIsNotAPIObj(this_, v) {
	Object.defineProperty(this_, 'isNotAPIObj', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: v
	});
}

let AudioParamView = exports.AudioParamView = (function (_NodeViewBase) {
	_inherits(AudioParamView, _NodeViewBase);

	function AudioParamView(AudioNodeView, name, param) {
		_classCallCheck(this, AudioParamView);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioParamView).call(this, 0, 0, ui.pointSize, ui.pointSize, name));

		_this.id = counter++;
		_this.audioParam = param;
		_this.AudioNodeView = AudioNodeView;
		return _this;
	}

	return AudioParamView;
})(NodeViewBase);

let ParamView = exports.ParamView = (function (_NodeViewBase2) {
	_inherits(ParamView, _NodeViewBase2);

	function ParamView(AudioNodeView, name, isoutput) {
		_classCallCheck(this, ParamView);

		var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(ParamView).call(this, 0, 0, ui.pointSize, ui.pointSize, name));

		_this2.id = counter++;
		_this2.AudioNodeView = AudioNodeView;
		_this2.isOutput = isoutput || false;
		return _this2;
	}

	return ParamView;
})(NodeViewBase);

let AudioNodeView = exports.AudioNodeView = (function (_NodeViewBase3) {
	_inherits(AudioNodeView, _NodeViewBase3);

	function AudioNodeView(audioNode, editor) {
		_classCallCheck(this, AudioNodeView);

		var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioNodeView).call(this));
		// audioNode はベースとなるノード

		_this3.id = counter++;
		_this3.audioNode = audioNode;
		_this3.name = audioNode.constructor.toString().match(/function\s(.*)\(/)[1];
		_this3.inputParams = [];
		_this3.outputParams = [];
		_this3.params = [];
		let inputCy = 1,
		    outputCy = 1;

		_this3.removable = true;

		// プロパティ・メソッドの複製
		for (var i in audioNode) {
			if (typeof audioNode[i] === 'function') {
				//				this[i] = audioNode[i].bind(audioNode);
			} else {
					if (typeof audioNode[i] === 'object') {
						if (audioNode[i] instanceof AudioParam) {
							_this3[i] = new AudioParamView(_this3, i, audioNode[i]);
							_this3.inputParams.push(_this3[i]);
							_this3.params.push((function (p) {
								return {
									name: i,
									'get': function () {
										return p.audioParam.value;
									},
									'set': function (v) {
										p.audioParam.value = v;
									},
									param: p,
									node: _this3
								};
							})(_this3[i]));
							_this3[i].y = 20 * inputCy++;
						} else if (audioNode[i] instanceof ParamView) {
							audioNode[i].AudioNodeView = _this3;
							_this3[i] = audioNode[i];
							if (_this3[i].isOutput) {
								_this3[i].y = 20 * outputCy++;
								_this3[i].x = _this3.width;
								_this3.outputParams.push(_this3[i]);
							} else {
								_this3[i].y = 20 * inputCy++;
								_this3.inputParams.push(_this3[i]);
							}
						} else {
							_this3[i] = audioNode[i];
						}
					} else {
						var desc = Object.getOwnPropertyDescriptor(AudioNode.prototype, i);
						if (!desc) {
							desc = Object.getOwnPropertyDescriptor(_this3.audioNode.__proto__, i);
						}
						if (!desc) {
							desc = Object.getOwnPropertyDescriptor(_this3.audioNode, i);
						}
						var props = {};

						//					if(desc.get){
						props.get = (function (i) {
							return _this3.audioNode[i];
						}).bind(null, i);
						//					}

						if (desc.writable || desc.set) {
							props.set = (function (i, v) {
								_this3.audioNode[i] = v;
							}).bind(null, i);
						}

						props.enumerable = desc.enumerable;
						props.configurable = desc.configurable;
						//props.writable = false;
						//props.writable = desc.writable;

						Object.defineProperty(_this3, i, props);

						props.name = i;
						props.node = _this3;

						if (desc.enumerable && !i.match(/(.*_$)|(name)|(^numberOf.*$)/i) && typeof audioNode[i] !== 'Array') {
							_this3.params.push(props);
						}
					}
				}
		}

		_this3.inputStartY = inputCy * 20;
		var inputHeight = (inputCy + _this3.numberOfInputs) * 20;
		var outputHeight = (outputCy + _this3.numberOfOutputs) * 20;
		_this3.outputStartY = outputCy * 20;
		_this3.height = Math.max(_this3.height, inputHeight, outputHeight);
		_this3.temp = {};
		_this3.statusPlay = STATUS_PLAY_NOT_PLAYED; // not played.
		_this3.panel = null;
		_this3.editor = editor.bind(_this3, _this3);
		return _this3;
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
				let n = AudioNodeView.audioConnections[i];
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
				let n = AudioNodeView.audioConnections[i];
				if (con.from.node === n.from.node && con.from.param === n.from.param && con.to.node === n.to.node && con.to.param === n.to.param) {
					AudioNodeView.audioConnections.splice(i--, 1);
					AudioNodeView.disconnect_(con);
				}
			}
		}
	}, {
		key: 'create',
		value: function create(audionode) {
			let editor = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

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

AudioNodeView.audioNodes = [];
AudioNodeView.audioConnections = [];

},{"./ui":11}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.svg = undefined;
exports.initUI = initUI;
exports.draw = draw;
exports.createAudioNodeView = createAudioNodeView;

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _ui = require('./ui.js');

var ui = _interopRequireWildcard(_ui);

var _sequenceEditor = require('./sequenceEditor');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var svg = exports.svg = undefined;
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
		let x1, y1;
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
		let targetX = d.x2;
		let targetY = d.y2;
		// inputもしくはparamに到達しているか
		// input		
		let connected = false;
		let inputs = d3.selectAll('.input')[0];
		for (var i = 0, l = inputs.length; i < l; ++i) {
			let elm = inputs[i];
			let bbox = elm.getBBox();
			let node = elm.__data__.node;
			let left = node.x - node.width / 2 + bbox.x,
			    top = node.y - node.height / 2 + bbox.y,
			    right = node.x - node.width / 2 + bbox.x + bbox.width,
			    bottom = node.y - node.height / 2 + bbox.y + bbox.height;
			if (targetX >= left && targetX <= right && targetY >= top && targetY <= bottom) {
				//				console.log('hit',elm);
				let from_ = { node: d.node, param: d.index };
				let to_ = { node: node, param: elm.__data__.index };
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
				let elm = params[i];
				let bbox = elm.getBBox();
				let param = elm.__data__;
				let node = param.node;
				let left = node.x - node.width / 2 + bbox.x;
				let top_ = node.y - node.height / 2 + bbox.y;
				let right = node.x - node.width / 2 + bbox.x + bbox.width;
				let bottom = node.y - node.height / 2 + bbox.y + bbox.height;
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
	audioNodeCreators = [{ name: 'Gain', create: audio.ctx.createGain.bind(audio.ctx) }, { name: 'Delay', create: audio.ctx.createDelay.bind(audio.ctx) }, { name: 'AudioBufferSource', create: audio.ctx.createBufferSource.bind(audio.ctx) }, { name: 'MediaElementAudioSource', create: audio.ctx.createMediaElementSource.bind(audio.ctx) }, { name: 'Panner', create: audio.ctx.createPanner.bind(audio.ctx) }, { name: 'Convolver', create: audio.ctx.createConvolver.bind(audio.ctx) }, { name: 'Analyser', create: audio.ctx.createAnalyser.bind(audio.ctx) }, { name: 'ChannelSplitter', create: audio.ctx.createChannelSplitter.bind(audio.ctx) }, { name: 'ChannelMerger', create: audio.ctx.createChannelMerger.bind(audio.ctx) }, { name: 'DynamicsCompressor', create: audio.ctx.createDynamicsCompressor.bind(audio.ctx) }, { name: 'BiquadFilter', create: audio.ctx.createBiquadFilter.bind(audio.ctx) }, { name: 'Oscillator', create: audio.ctx.createOscillator.bind(audio.ctx) }, { name: 'MediaStreamAudioSource', create: audio.ctx.createMediaStreamSource.bind(audio.ctx) }, { name: 'WaveShaper', create: audio.ctx.createWaveShaper.bind(audio.ctx) }, { name: 'EG', create: function () {
			return new audio.EG();
		} }, { name: 'Sequencer', create: function () {
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
	gd.select('rect').attr({ 'width': function (d) {
			return d.width;
		}, 'height': function (d) {
			return d.height;
		} });

	// AudioNode矩形グループ
	var g = gd.enter().append('g');
	// AudioNode矩形グループの座標位置セット
	gd.attr('transform', function (d) {
		return 'translate(' + (d.x - d.width / 2) + ',' + (d.y - d.height / 2) + ')';
	});

	// AudioNode矩形
	g.append('rect').call(drag).attr({ 'width': function (d) {
			return d.width;
		}, 'height': function (d) {
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
		let sel = d3.select(this);
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

		gpdg.append('circle').attr({ 'r': function (d) {
				return d.index.width / 2;
			},
			cx: 0, cy: function (d, i) {
				return d.index.y;
			},
			'class': function (d) {
				if (d.index instanceof audio.AudioParamView) {
					return 'audio-param';
				}
				return 'param';
			} });

		gpdg.append('text').attr({ x: function (d) {
				return d.index.x + d.index.width / 2 + 5;
			}, y: function (d) {
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

		gpdg.append('circle').attr({ 'r': function (d) {
				return d.index.width / 2;
			},
			cx: d.width, cy: function (d, i) {
				return d.index.y;
			},
			'class': 'param' }).call(dragOut);

		gpdg.append('text').attr({ x: function (d) {
				return d.index.x + d.index.width / 2 + 5;
			}, y: function (d) {
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

		seld.enter().append('g').append('rect').attr({ x: d.width - ui.pointSize / 2, y: function (d1) {
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

		seld.enter().append('g').append('rect').attr({ x: -ui.pointSize / 2, y: function (d1) {
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
	tr.append('td').append('input').attr({ type: "text", value: function (d) {
			return d.get();
		}, readonly: function (d) {
			return d.set ? null : 'readonly';
		} }).on('change', function (d) {
		let value = this.value;
		let vn = parseFloat(value);
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

},{"./audio":2,"./sequenceEditor":9,"./ui.js":11}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.EG = undefined;

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let EG = exports.EG = (function () {
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

},{"./audio":2}],6:[function(require,module,exports){
'use strict'

//
// We store our EE objects in a plain object whose properties are event names.
// If `Object.create(null)` is not supported we prefix the event names with a
// `~` to make sure that the built-in object properties are not overridden or
// used as an attack vector.
// We also assume that `Object.create(null)` is available when the event name
// is an ES6 Symbol.
//
;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EventEmitter;
var prefix = typeof Object.create !== 'function' ? '~' : false;

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {} /* Nothing to set */

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @param {Boolean} exists We only need to know if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event,
      available = this._events && this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return false;

  var listeners = this._events[evt],
      len = arguments.length,
      args,
      i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1:
        return listeners.fn.call(listeners.context), true;
      case 2:
        return listeners.fn.call(listeners.context, a1), true;
      case 3:
        return listeners.fn.call(listeners.context, a1, a2), true;
      case 4:
        return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len - 1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length,
        j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1:
          listeners[i].fn.call(listeners[i].context);break;
        case 2:
          listeners[i].fn.call(listeners[i].context, a1);break;
        case 3:
          listeners[i].fn.call(listeners[i].context, a1, a2);break;
        default:
          if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this),
      evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;else {
    if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true),
      evt = prefix ? prefix + event : event;

  if (!this._events) this._events = prefix ? {} : Object.create(null);
  if (!this._events[evt]) this._events[evt] = listener;else {
    if (!this._events[evt].fn) this._events[evt].push(listener);else this._events[evt] = [this._events[evt], listener];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Mixed} context Only remove listeners matching this context.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */

EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events || !this._events[evt]) return this;

  var listeners = this._events[evt],
      events = [];

  if (fn) {
    if (listeners.fn) {
      if (listeners.fn !== fn || once && !listeners.once || context && listeners.context !== context) {
        events.push(listeners);
      }
    } else {
      for (var i = 0, length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[evt] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[prefix ? prefix + event : event];else this._events = prefix ? {} : Object.create(null);

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.defObservable = defObservable;
function defObservable(target, propName) {
	let opt = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	(function () {
		var v_;
		opt.enumerable = opt.enumerable || true;
		opt.configurable = opt.configurable || false;
		opt.get = opt.get || function () {
			return v_;
		};
		opt.set = opt.set || function (v) {
			if (v_ != v) {
				target.emit(propName + '_changed', v);
			}
			v_ = v;
		};
		Object.defineProperty(target, propName, opt);
	})();
}

},{}],8:[function(require,module,exports){
"use strict";

var _audio = require('./audio.js');

var audio = _interopRequireWildcard(_audio);

var _draw = require('./draw');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

window.onload = function () {
	audio.setCtx(new AudioContext());
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

},{"./audio.js":2,"./draw":4}],9:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.SequenceEditor = undefined;
exports.showSequenceEditor = showSequenceEditor;

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _ui = require('./ui');

var ui = _interopRequireWildcard(_ui);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let SequenceEditor = exports.SequenceEditor = (function () {
	function SequenceEditor(sequencer) {
		var _this2 = this;

		_classCallCheck(this, SequenceEditor);

		this.sequencer = sequencer;
		sequencer.panel = new ui.Panel();
		sequencer.panel.x = sequencer.x;
		sequencer.panel.y = sequencer.y;
		sequencer.panel.width = 1024;
		sequencer.panel.height = 768;
		sequencer.panel.header.text('Sequence Editor');
		var editor = sequencer.panel.article.append('div').classed('seq-editor', true);
		var div = editor.append('div').classed('header', true);

		//
		div.append('span').text('Time Base:');
		div.append('input').datum(sequencer.audioNode.tpb).attr({ 'type': 'text', 'size': '3', 'id': 'time-base' }).attr('value', function (v) {
			return v;
		}).on('change', function () {
			sequencer.audioNode.tpb = d3.select(this).attr('value');
		}).call(function () {
			var _this = this;

			sequencer.audioNode.on('tpb_changed', function (v) {
				_this.attr('value', v);
			});
		});

		div.append('span').text('Tempo:');
		div.append('input').datum(sequencer).attr({ 'type': 'text', 'size': '3' }).attr('value', function (d) {
			return sequencer.audioNode.bpm;
		}).on('change', function () {
			sequencer.audioNode.bpm = parseFloat(d3.select(_this2).attr('value'), 10);
		}).call(function () {
			var _this3 = this;

			sequencer.audioNode.on('bpm_changed', function (v) {
				_this3.attr('value', v);
			});
		});

		div.append('span').text('Beat:');
		div.append('input').datum(sequencer).attr({ 'type': 'text', 'size': '3', 'value': function (d) {
				return sequencer.audioNode.beat;
			} }).on('change', function (d) {
			sequencer.audioNode.beat = parseFloat(d3.select(_this2).attr('value'), 10);
		});

		div.append('span').text(' / ');
		div.append('input').datum(sequencer).attr({ 'type': 'text', 'size': '3', 'value': function (d) {
				return sequencer.audioNode.bar;
			} }).on('change', function (d) {
			sequencer.audioNode.bar = parseFloat(d3.select(_this2).attr('value'), 10);
		});

		// トラックエディタ
		let trackEdit = editor.selectAll('div.track').data(sequencer.audioNode.tracks).enter().append('div').classed('track', true).attr({ 'id': function (d, i) {
				return 'track-' + (i + 1);
			}, 'tabindex': '0' });

		let trackHeader = trackEdit.append('div').classed('track-header', true);
		trackHeader.append('span').text(function (d, i) {
			return 'TR:' + (i + 1);
		});
		trackHeader.append('span').text('MEAS:');
		let trackBody = trackEdit.append('div').classed('track-body', true);
		let eventEdit = trackBody.append('table');
		let headrow = eventEdit.append('thead').append('tr');
		headrow.append('th').text('M#');
		headrow.append('th').text('S#');
		headrow.append('th').text('NT');
		headrow.append('th').text('N#');
		headrow.append('th').text('ST');
		headrow.append('th').text('GT');
		headrow.append('th').text('VE');
		headrow.append('th').text('CO');
		let eventBody = eventEdit.append('tbody').attr('id', function (d, i) {
			return 'track-' + (i + 1) + '-events';
		});
		//this.drawEvents(eventBody);

		sequencer.audioNode.tracks[0].events.push(new audio.NoteEvent(48, 47, 6));
		for (var i = 48; i < 58; ++i) {
			sequencer.audioNode.tracks[0].events.push(new audio.NoteEvent(48, i, 6));
		}

		// トラックエディタメイン

		trackEdit.each(function (d) {
			if (!this.editor) {
				this.editor = doEditor(d3.select(this));
				this.editor.next();
				this.sequencer = sequencer;
			}
		});

		trackEdit.on('keydown', function (d) {
			console.log(d3.event.keyCode);
			var ret = this.editor.next(d3.event.keyCode);
			console.log(ret);
			if (ret.value) {
				d3.event.preventDefault();
				d3.event.cancelBubble = true;
				return false;
			}
		});

		sequencer.panel.on('show', function () {
			d3.select('#time-base').node().focus();
		});

		sequencer.panel.on('dispose', function () {
			delete sequencer.editorInstance;
		});

		sequencer.panel.show();
	}

	_createClass(SequenceEditor, [{
		key: 'drawEvents',
		value: function drawEvents(eventBody) {
			eventBody.each(function (d, i) {
				var sel = d3.select(this);
				var evsel = sel.selectAll('tr').data(d.events);
				var row = evsel.enter().append('tr');
				var step = 0;
				row.each(function (d, i) {
					switch (d.type) {
						case audio.EventType.Note:
							break;
						case audio.EventType.Measure:
							break;
					}
				});
			});
		}
	}]);

	return SequenceEditor;
})();

var Notes = ['C ', 'C#', 'D ', 'D#', 'E ', 'F ', 'F#', 'G ', 'G#', 'A ', 'A#', 'B '];

function* doEditor(trackEdit) {
	let keycode = 0;
	let track = trackEdit.datum();
	let editView = d3.select('#' + trackEdit.attr('id') + '-events');
	let measure = 1;
	let step = 1;
	let loop = false;
	let rowIndex = 0;
	let currentEventIndex = 0;
	let cellIndex = 2;

	function setInput() {
		this.attr('contentEditable', 'true');
		this.on('focus', function () {
			console.log(this.parentNode.rowIndex - 1);
			rowIndex = this.parentNode.rowIndex - 1;
		});
	}
	// 既存イベントの表示
	{
		let evflagment = track.events.slice();
		let select = editView.selectAll('tr').data(track.events);
		let enter = select.enter();
		let rows = enter.append('tr').attr('data-index', function (d, i) {
			return i;
		});
		rows.each(function (d, i) {
			let row = d3.select(this);
			rowIndex = i;
			switch (d.type) {
				case audio.EventType.Note:
					row.append('td').text(measure); // Measeure #
					row.append('td').text(step++); // Step #
					let oct = d.note / 12 | 0;
					let noteName = Notes[d.note % 12] + oct;
					row.append('td').text(noteName).call(setInput); // Note
					row.append('td').text(d.note).call(setInput); // Note #
					row.append('td').text(d.step).call(setInput); // Step
					row.append('td').text(d.gate).call(setInput); // Gate
					row.append('td').text(d.vel).call(setInput); // Velocity
					row.append('td').text(d.com).call(setInput); // Command
					break;
				case audio.EventType.Measure:
					break;
			}
		});
	}

	do {
		console.log('new line', rowIndex, track.events.length);
		if (track.events.length == 0 || rowIndex > track.events.length - 1) {
			var row = editView.append('tr');
			cellIndex = 2;
			row.append('td').text(measure); // Measeure #
			row.append('td').text(step++); // Step #
			row.append('td').call(setInput); // Note
			row.append('td').call(setInput); // Note #
			row.append('td').call(setInput); // Step
			row.append('td').call(setInput); // Gate
			row.append('td').call(setInput); // Velocity
			row.append('td').call(setInput); // Command
			row.node().cells[cellIndex].focus();
		}
		keycode = yield false;
		var end = false;
		while (!end) {
			switch (keycode) {
				case 13:
					//Enter
					loop = true;
					end = true;
					// デフォルト値の代入
					// if(editView.node().rows[rowIndex].cells[2].match(/(C )|(C#)|(D )|(D#)|(E )|(F )|(F#)|(G )|(G#)|(A )|(A#)|(B )[0-9]/))
					// {
					// 	
					// 	
					// }
					rowIndex++;
					keycode = yield true;
					break;
				case 39:
					// right Cursor
					cellIndex++;
					if (cellIndex > 7) {
						cellIndex = 2;
						if (rowIndex < editView.node().rows.length - 1) {
							++rowIndex;
						} else {
							++rowIndex;
							loop = true;
							end = true;
							break;
						}
					}
					editView.node().rows[rowIndex].cells[cellIndex].focus();
					keycode = yield true;
					break;
				case 37:
					// left Cursor
					--cellIndex;
					if (cellIndex <= 2) {
						if (rowIndex == 0) {} else {
							--rowIndex;
							cellIndex = 7;
						}
					}
					editView.node().rows[rowIndex].cells[cellIndex].focus();
					keycode = yield true;
					break;
				case 106:
					// *
					keycode = yield false;
					break;
				default:
					keycode = yield false;
					break;
			}
		}
	} while (loop);
}

function showSequenceEditor(d) {
	d3.event.returnValue = false;
	d3.event.preventDefault();
	d3.event.cancelBubble = true;
	if (d.panel && d.panel.isShow) return;
	d.editorInstance = new SequenceEditor(d);
}

},{"./audio":2,"./ui":11}],10:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Sequencer = exports.NUM_OF_TRACKS = exports.SEQ_STATUS = exports.Track = exports.NoteEvent = exports.Measure = exports.EventType = exports.Command = exports.EventBase = undefined;
exports.setValueAtTime = setValueAtTime;
exports.linearRampToValueAtTime = linearRampToValueAtTime;
exports.exponentialRampToValueAtTime = exponentialRampToValueAtTime;

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _eventEmitter = require('./eventEmitter3');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _prop = require('./prop');

var prop = _interopRequireWildcard(_prop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let EventBase = exports.EventBase = function EventBase(step) {
	_classCallCheck(this, EventBase);

	this.step = step;
};

function setValueAtTime(audioParam, value, time) {
	audioParam.setValueAtTime(value, time);
}

function linearRampToValueAtTime(audioParam, value, time) {
	audioParam.linearRampToValueAtTime(value, time);
}

function exponentialRampToValueAtTime(audioParam, value, time) {
	audioParam.linearRampToValueAtTime(value, time);
}

let Command = exports.Command = function Command() {
	let pitchCommand = arguments.length <= 0 || arguments[0] === undefined ? setValueAtTime : arguments[0];
	let velocityCommand = arguments.length <= 1 || arguments[1] === undefined ? setValueAtTime : arguments[1];

	_classCallCheck(this, Command);

	this.processPitch = pitchCommand.bind(this);
	this.processVelocity = velocityCommand.bind(this);
};

var EventType = exports.EventType = {
	Note: 1,
	Measure: 2
};

let Measure = exports.Measure = (function (_EventBase) {
	_inherits(Measure, _EventBase);

	function Measure() {
		_classCallCheck(this, Measure);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Measure).call(this, 0));

		_this.type = EventType.Measure;
		return _this;
	}

	return Measure;
})(EventBase);

let NoteEvent = exports.NoteEvent = (function (_EventBase2) {
	_inherits(NoteEvent, _EventBase2);

	function NoteEvent() {
		let step = arguments.length <= 0 || arguments[0] === undefined ? 96 : arguments[0];
		let note = arguments.length <= 1 || arguments[1] === undefined ? 64 : arguments[1];
		let gate = arguments.length <= 2 || arguments[2] === undefined ? 48 : arguments[2];
		let vel = arguments.length <= 3 || arguments[3] === undefined ? 1.0 : arguments[3];
		let command = arguments.length <= 4 || arguments[4] === undefined ? new Command() : arguments[4];

		_classCallCheck(this, NoteEvent);

		var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(NoteEvent).call(this, step));

		_this2.note_ = note;
		_this2.transopse_ = 0;
		_this2.calcPitch();
		_this2.gate = gate;
		_this2.vel = vel;
		_this2.command = command;
		_this2.command.event = _this2;
		_this2.type = EventType.Note;
		return _this2;
	}

	_createClass(NoteEvent, [{
		key: 'calcPitch',
		value: function calcPitch() {
			this.pitch = 440.0 / 32.0 * Math.pow(2.0, (this.note_ + this.transpose_ - 9) / 12);
		}
	}, {
		key: 'process',
		value: function process(time, track) {
			if (this.note) {
				this.transopse = track.transpose;
				for (let j = 0, je = track.pitches.length; j < je; ++j) {
					track.pitches[j].process(this.command, this.pitch, time);
				}

				for (let j = 0, je = track.velocities.length; j < je; ++j) {
					// keyon
					track.velocities[j].process(this.command, this.vel, time);
					// keyoff
					track.velocities[j].process(this.command, 0, time + this.gate * track.sequencer.stepTime_);
				}
			}
		}
	}, {
		key: 'note',
		get: function () {
			return this.note_;
		},
		set: function (v) {
			this.note_ = v;
			this.calcPitch();
		}
	}, {
		key: 'transpose',
		set: function (v) {
			if (v != this.transpose_) {
				this.transpose_ = v;
				this.calcPitch();
			}
		}
	}]);

	return NoteEvent;
})(EventBase);

let Track = exports.Track = (function (_EventEmitter) {
	_inherits(Track, _EventEmitter);

	function Track(sequencer) {
		_classCallCheck(this, Track);

		var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(Track).call(this));

		_this3.events = [];
		_this3.pointer = 0;

		prop.defObservable(_this3, 'step');
		prop.defObservable(_this3, 'end');
		prop.defObservable(_this3, 'name');
		prop.defObservable(_this3, 'transpose');

		_this3.step = 0;
		_this3.end = false;
		_this3.pitches = [];
		_this3.velocities = [];
		_this3.sequencer = sequencer;
		_this3.name = '';
		_this3.transpose = 0;
		return _this3;
	}

	return Track;
})(_eventEmitter2.default);

const SEQ_STATUS = exports.SEQ_STATUS = {
	STOPPED: 0,
	PLAYING: 1,
	PAUSED: 2
};

const NUM_OF_TRACKS = exports.NUM_OF_TRACKS = 4;

let Sequencer = exports.Sequencer = (function (_EventEmitter2) {
	_inherits(Sequencer, _EventEmitter2);

	function Sequencer() {
		_classCallCheck(this, Sequencer);

		var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(Sequencer).call(this));

		prop.defObservable(_this4, 'bpm');
		prop.defObservable(_this4, 'tpb');
		prop.defObservable(_this4, 'beat');
		prop.defObservable(_this4, 'bar');
		prop.defObservable(_this4, 'repeat');

		_this4.bpm = 120.0; // tempo
		_this4.tpb = 96.0; // 四分音符の解像度
		_this4.beat = 4;
		_this4.bar = 4; //
		_this4.tracks = [];
		_this4.numberOfInputs = 0;
		_this4.numberOfOutputs = 0;
		_this4.name = 'Sequencer';
		for (var i = 0; i < NUM_OF_TRACKS; ++i) {
			_this4.tracks.push(new Track(_this4));
			_this4['trk' + i + 'g'] = new audio.ParamView(null, 'trk' + i + 'g', true);
			_this4['trk' + i + 'g'].track = _this4.tracks[i];
			_this4['trk' + i + 'g'].type = 'gate';

			_this4['trk' + i + 'p'] = new audio.ParamView(null, 'trk' + i + 'p', true);
			_this4['trk' + i + 'p'].track = _this4.tracks[i];
			_this4['trk' + i + 'p'].type = 'pitch';
		}
		_this4.startTime_ = 0;
		_this4.currentTime_ = 0;
		_this4.currentMeasure_ = 0;
		_this4.calcStepTime();
		_this4.repeat = false;
		_this4.status_ = SEQ_STATUS.STOPPED;

		//
		_this4.on('bpm_chaneged', function () {
			_this4.calcStepTime();
		});
		_this4.on('tpb_chaneged', function () {
			_this4.calcStepTime();
		});

		Sequencer.sequencers.push(_this4);
		if (Sequencer.added) {
			Sequencer.added();
		}
		return _this4;
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
			let endcount = 0;
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
	}], [{
		key: 'makeProcess',
		value: function makeProcess(c) {
			if (c.to.param instanceof audio.ParamView) {
				return {
					to: c.to,
					process: function (com, v, t) {
						c.to.node.audioNode.process(c.to, com, v, t);
					},
					stop: function () {
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
				stop: function () {
					c.to.param.audioParam.cancelScheduledValues(0);
				}
			};
		}
	}, {
		key: 'exec',
		value: function exec() {
			if (Sequencer.sequencers.status == SEQ_STATUS.PLAYING) {
				window.requestAnimationFrame(Sequencer.exec);
				let endcount = 0;
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
})(_eventEmitter2.default);

Sequencer.sequencers = [];
Sequencer.sequencers.status = SEQ_STATUS.STOPPED;

},{"./audio":2,"./eventEmitter3":6,"./prop":7}],11:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Panel = exports.pointSize = exports.nodeWidth = exports.nodeHeight = undefined;

var _uuid = require('./uuid.core');

var _uuid2 = _interopRequireDefault(_uuid);

var _EventEmitter2 = require('./EventEmitter3');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

const nodeHeight = exports.nodeHeight = 50;
const nodeWidth = exports.nodeWidth = 100;
const pointSize = exports.pointSize = 16;

// panel window

let Panel = exports.Panel = (function (_EventEmitter) {
	_inherits(Panel, _EventEmitter);

	function Panel(sel, prop) {
		_classCallCheck(this, Panel);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Panel).call(this));

		if (!prop || !prop.id) {
			prop = prop ? (prop.id = 'id-' + _uuid2.default.generate(), prop) : { id: 'id-' + _uuid2.default.generate() };
		}
		_this.id = prop.id;
		sel = sel || d3.select('#content');
		_this.selection = sel.append('div').attr(prop).attr('class', 'panel').datum(_this);

		// パネル用Dragその他

		_this.header = _this.selection.append('header').call(_this.drag);
		_this.article = _this.selection.append('article');
		_this.footer = _this.selection.append('footer');
		_this.selection.append('div').classed('panel-close', true).on('click', function () {
			_this.emit('dispose');
			_this.dispose();
		});

		return _this;
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
			this.emit('show');
		}
	}, {
		key: 'hide',
		value: function hide() {
			this.selection.style('visibility', 'hidden');
			this.emit('hide');
		}
	}, {
		key: 'node',
		get: function () {
			return this.selection.node();
		}
	}, {
		key: 'x',
		get: function () {
			return parseFloat(this.selection.style('left'));
		},
		set: function (v) {
			this.selection.style('left', v + 'px');
		}
	}, {
		key: 'y',
		get: function () {
			return parseFloat(this.selection.style('top'));
		},
		set: function (v) {
			this.selection.style('top', v + 'px');
		}
	}, {
		key: 'width',
		get: function () {
			return parseFloat(this.selection.style('width'));
		},
		set: function (v) {
			this.selection.style('width', v + 'px');
		}
	}, {
		key: 'height',
		get: function () {
			return parseFloat(this.selection.style('height'));
		},
		set: function (v) {
			this.selection.style('height', v + 'px');
		}
	}, {
		key: 'isShow',
		get: function () {
			return this.selection && this.selection.style('visibility') === 'visible';
		}
	}]);

	return Panel;
})(_EventEmitter3.default);

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
	d.emit('dragend');
	dummy.remove();
});

},{"./EventEmitter3":1,"./uuid.core":12}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = UUID;
/*
 Version: core-1.0
 The MIT License: Copyright (c) 2012 LiosK.
*/
function UUID() {}UUID.generate = function () {
  var a = UUID._gri,
      b = UUID._ha;return b(a(32), 8) + "-" + b(a(16), 4) + "-" + b(16384 | a(12), 4) + "-" + b(32768 | a(14), 4) + "-" + b(a(48), 12);
};UUID._gri = function (a) {
  return 0 > a ? NaN : 30 >= a ? 0 | Math.random() * (1 << a) : 53 >= a ? (0 | 1073741824 * Math.random()) + 1073741824 * (0 | Math.random() * (1 << a - 30)) : NaN;
};UUID._ha = function (a, b) {
  for (var c = a.toString(16), d = b - c.length, e = "0"; 0 < d; d >>>= 1, e += e) d & 1 && (c = e + c);return c;
};

},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXEV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGF1ZGlvLmpzIiwic3JjXFxhdWRpb05vZGVWaWV3LmpzIiwic3JjXFxkcmF3LmpzIiwic3JjXFxlZy5qcyIsInNyY1xcZXZlbnRFbWl0dGVyMy5qcyIsInNyY1xccHJvcC5qcyIsInNyY1xcc2NyaXB0LmpzIiwic3JjXFxzZXF1ZW5jZUVkaXRvci5qcyIsInNyY1xcc2VxdWVuY2VyLmpzIiwic3JjXFx1aS5qcyIsInNyY1xcdXVpZC5jb3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7Ozs7Ozs7QUFBWSxDQUFDOzs7O2tCQWlDVyxZQUFZO0FBdkJwQyxJQUFJLE1BQU0sR0FBRyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEtBQUssVUFBVSxHQUFHLEdBQUcsR0FBRyxLQUFLOzs7Ozs7Ozs7O0FBQUMsQUFVL0QsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7QUFDN0IsTUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDYixNQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxLQUFLLENBQUM7Q0FDM0I7Ozs7Ozs7OztBQUFBLEFBU2MsU0FBUyxZQUFZLEdBQUc7Ozs7Ozs7O0FBQXdCLEFBUS9ELFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVM7Ozs7Ozs7Ozs7QUFBQyxBQVUzQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQ25FLE1BQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUs7TUFDckMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFbEQsTUFBSSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQy9CLE1BQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDMUIsTUFBSSxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRXhDLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ25FLE1BQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0dBQ3pCOztBQUVELFNBQU8sRUFBRSxDQUFDO0NBQ1g7Ozs7Ozs7OztBQUFDLEFBU0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7QUFDckUsTUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDOztBQUUxQyxNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxLQUFLLENBQUM7O0FBRXRELE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO01BQzdCLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTTtNQUN0QixJQUFJO01BQ0osQ0FBQyxDQUFDOztBQUVOLE1BQUksVUFBVSxLQUFLLE9BQU8sU0FBUyxDQUFDLEVBQUUsRUFBRTtBQUN0QyxRQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRTlFLFlBQVEsR0FBRztBQUNULFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUM5RCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ2xFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ3RFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEtBQy9FOztBQUVELFNBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbEQsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUI7O0FBRUQsYUFBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztHQUM3QyxNQUFNO0FBQ0wsUUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU07UUFDekIsQ0FBQyxDQUFDOztBQUVOLFNBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNCLFVBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFcEYsY0FBUSxHQUFHO0FBQ1QsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUMxRCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUM5RCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDbEU7QUFDRSxjQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDN0QsZ0JBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQzVCOztBQUVELG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQUEsT0FDckQ7S0FDRjtHQUNGOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7Ozs7Ozs7QUFBQyxBQVVGLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0FBQzFELE1BQUksUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDO01BQ3RDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BFLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQ2hEO0FBQ0gsUUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FDdkIsSUFBSSxDQUFD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Q0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDakMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzVDLElBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztBQUN6QyxJQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7RUFDekMsQ0FBQyxDQUFDOztBQUVILEdBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBQyxZQUFVO0FBQ3ZDLE9BQUssQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDaEMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzVDLElBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxVQUFVLENBQUMsQ0FBQztBQUNoRCxJQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7RUFDekMsQ0FBQyxDQUFDOztBQUVILE1BQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFlBQUk7QUFDN0IsSUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQy9DLElBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxVQUFVLENBQUMsQ0FBQztBQUNoRCxJQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7RUFDekM7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LEdBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDZixZQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDcEIsTUFBSSxFQUFFLENBQUM7RUFDUCxDQUFDOzs7QUFBQyxBQUdILFFBQU8sR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUMzQixNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFBRSxTQUFPLENBQUMsQ0FBQztFQUFFLENBQUMsQ0FDbEMsRUFBRSxDQUFDLFdBQVcsRUFBQyxVQUFTLENBQUMsRUFBQztBQUMxQixNQUFJLEVBQUUsRUFBQyxFQUFFLENBQUM7QUFDVixNQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUM7QUFDVixPQUFHLENBQUMsQ0FBQyxLQUFLLFlBQVksS0FBSyxDQUFDLFNBQVMsRUFBQztBQUNyQyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzdDLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDN0MsTUFBTTtBQUNOLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDakMsTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUN0RTtHQUNELE1BQU07QUFDTixLQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FB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LElBQUksQ0FBQyxLQUFLLFlBQVksS0FBSyxDQUFDLFNBQVMsRUFBQztBQUMxQyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzVELE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDNUQsTUFBTTtBQUNOLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUMzQyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUMxRjtHQUNELE1BQU07QUFDTixLQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDM0MsS0FBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FB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QUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDOUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUNsRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUN0RSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxLQUMvRTs7QUFFRCxTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2xELFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztBQUVELGFBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtBQUNMLFFBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7QUFFTixTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQixVQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBGLGNBQVEsR0FBRztBQUNULGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDMUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDOUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQ2xFO0FBQ0UsY0FBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzdE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QUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxNQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQztVQUFLLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxTQUFTO0dBQUEsQ0FBQzs7O0FBQUMsQUFHL0YsV0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hFLE9BQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFDLENBQUMsR0FBRSxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDeEIsWUFBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFD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LE9BQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsV0FBUSxHQUFHLENBQUMsQ0FBQztBQUNiLFdBQVEsQ0FBQyxDQUFDLElBQUk7QUFDYixTQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUN4QixRQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7QUFBQyxBQUMvQixRQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUFDLEFBQzlCLFNBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMxQixTQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDeEMsUUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUFDLEFBQy9DLFFBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQUMsQUFDN0MsUUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7QUFBQyxBQUM3QyxRQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUFDLEFBQzdDLFFBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQUMsQUFDNUMsUUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7QUFBQyxBQUM1QyxXQUFNO0FBQUEsQUFDUCxTQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTztBQUMzQixXQUFNO0FBQUEsSUFDUDtHQUNGLENBQUMsQ0FBQztFQUNIOztBQUVELElBQUc7QUFDRCxTQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBQyxRQUFRLEVBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN0RCxNQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxRQUFRLEdBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFDckUsT0FBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxZQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQUMsQUFDL0IsTUFBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFBQyxBQUM5QixNQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7QUFBQyxBQUNoQyxNQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7QUFBQyxBQUNoQyxNQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7QUFBQyxBQUNoQyxNQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7QUFBQyxBQUNoQyxNQUFHLENBQUMsTUFBTSxD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KGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbi8vXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXG4vL1xudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xuICB0aGlzLmZuID0gZm47XG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XG59XG5cbi8qKlxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cblxuLyoqXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgICAsIGo7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5leHBvcnQgKiBmcm9tICcuL2F1ZGlvTm9kZVZpZXcnO1xyXG5leHBvcnQgKiBmcm9tICcuL2VnJztcclxuZXhwb3J0ICogZnJvbSAnLi9zZXF1ZW5jZXInO1xyXG5leHBvcnQgZnVuY3Rpb24gZHVtbXkoKXt9O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aSc7XHJcblxyXG52YXIgY291bnRlciA9IDA7XHJcbmV4cG9ydCB2YXIgY3R4O1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3R4KGMpe2N0eCA9IGM7fVxyXG5cclxuZXhwb3J0IGNsYXNzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoeCA9IDAsIHkgPSAwLHdpZHRoID0gdWkubm9kZVdpZHRoLGhlaWdodCA9IHVpLm5vZGVIZWlnaHQsbmFtZSA9ICcnKSB7XHJcblx0XHR0aGlzLnggPSB4IDtcclxuXHRcdHRoaXMueSA9IHkgO1xyXG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoIDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IDtcclxuXHRcdHRoaXMubmFtZSA9IG5hbWU7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgU1RBVFVTX1BMQVlfTk9UX1BMQVlFRCA9IDA7XHJcbmV4cG9ydCBjb25zdCBTVEFUVVNfUExBWV9QTEFZSU5HID0gMTtcclxuZXhwb3J0IGNvbnN0IFNUQVRVU19QTEFZX1BMQVlFRCA9IDI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVmSXNOb3RBUElPYmoodGhpc18sdil7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXNfLCdpc05vdEFQSU9iaicse1xyXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcclxuXHRcdFx0d3JpdGFibGU6ZmFsc2UsXHJcblx0XHRcdHZhbHVlOiB2XHJcblx0XHR9KTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEF1ZGlvUGFyYW1WaWV3IGV4dGVuZHMgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihBdWRpb05vZGVWaWV3LG5hbWUsIHBhcmFtKSB7XHJcblx0XHRzdXBlcigwLDAsdWkucG9pbnRTaXplLHVpLnBvaW50U2l6ZSxuYW1lKTtcclxuXHRcdHRoaXMuaWQgPSBjb3VudGVyKys7XHJcblx0XHR0aGlzLmF1ZGlvUGFyYW0gPSBwYXJhbTtcclxuXHRcdHRoaXMuQXVkaW9Ob2RlVmlldyA9IEF1ZGlvTm9kZVZpZXc7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUGFyYW1WaWV3IGV4dGVuZHMgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihBdWRpb05vZGVWaWV3LG5hbWUsaXNvdXRwdXQpIHtcclxuXHRcdHN1cGVyKDAsMCx1aS5wb2ludFNpemUsdWkucG9pbnRTaXplLG5hbWUpO1xyXG5cdFx0dGhpcy5pZCA9IGNvdW50ZXIrKztcclxuXHRcdHRoaXMuQXVkaW9Ob2RlVmlldyA9IEF1ZGlvTm9kZVZpZXc7XHJcblx0XHR0aGlzLmlzT3V0cHV0ID0gaXNvdXRwdXQgfHwgZmFsc2U7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQXVkaW9Ob2RlVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoYXVkaW9Ob2RlLGVkaXRvcilcclxuXHR7XHJcblx0XHQvLyBhdWRpb05vZGUg44Gv44OZ44O844K544Go44Gq44KL44OO44O844OJXHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5pZCA9IGNvdW50ZXIrKztcclxuXHRcdHRoaXMuYXVkaW9Ob2RlID0gYXVkaW9Ob2RlO1xyXG5cdFx0dGhpcy5uYW1lID0gYXVkaW9Ob2RlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL2Z1bmN0aW9uXFxzKC4qKVxcKC8pWzFdO1xyXG5cdFx0dGhpcy5pbnB1dFBhcmFtcyA9IFtdO1xyXG5cdFx0dGhpcy5vdXRwdXRQYXJhbXMgPSBbXTtcclxuXHRcdHRoaXMucGFyYW1zID0gW107XHJcblx0XHRsZXQgaW5wdXRDeSA9IDEsb3V0cHV0Q3kgPSAxO1xyXG5cdFx0XHJcblx0XHR0aGlzLnJlbW92YWJsZSA9IHRydWU7XHJcblx0XHRcclxuXHRcdC8vIOODl+ODreODkeODhuOCo+ODu+ODoeOCveODg+ODieOBruikh+ijvVxyXG5cdFx0Zm9yICh2YXIgaSBpbiBhdWRpb05vZGUpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBhdWRpb05vZGVbaV0gPT09ICdmdW5jdGlvbicpIHtcclxuLy9cdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV0uYmluZChhdWRpb05vZGUpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgYXVkaW9Ob2RlW2ldID09PSAnb2JqZWN0Jykge1xyXG5cdFx0XHRcdFx0aWYgKGF1ZGlvTm9kZVtpXSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW0pIHtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXSA9IG5ldyBBdWRpb1BhcmFtVmlldyh0aGlzLGksIGF1ZGlvTm9kZVtpXSk7XHJcblx0XHRcdFx0XHRcdHRoaXMuaW5wdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5wYXJhbXMucHVzaCgoKHApPT57XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0XHRcdG5hbWU6aSxcclxuXHRcdFx0XHRcdFx0XHRcdCdnZXQnOigpID0+IHAuYXVkaW9QYXJhbS52YWx1ZSxcclxuXHRcdFx0XHRcdFx0XHRcdCdzZXQnOih2KSA9PntwLmF1ZGlvUGFyYW0udmFsdWUgPSB2O30sXHJcblx0XHRcdFx0XHRcdFx0XHRwYXJhbTpwLFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZTp0aGlzXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KSh0aGlzW2ldKSk7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0ueSA9ICgyMCAqIGlucHV0Q3krKyk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYoYXVkaW9Ob2RlW2ldIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdFx0YXVkaW9Ob2RlW2ldLkF1ZGlvTm9kZVZpZXcgPSB0aGlzO1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldID0gYXVkaW9Ob2RlW2ldO1xyXG5cdFx0XHRcdFx0XHRpZih0aGlzW2ldLmlzT3V0cHV0KXtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnkgPSAoMjAgKiBvdXRwdXRDeSsrKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnggPSB0aGlzLndpZHRoO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMub3V0cHV0UGFyYW1zLnB1c2godGhpc1tpXSk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpc1tpXS55ID0gKDIwICogaW5wdXRDeSsrKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmlucHV0UGFyYW1zLnB1c2godGhpc1tpXSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihBdWRpb05vZGUucHJvdG90eXBlLCBpKTtcdFxyXG5cdFx0XHRcdFx0aWYoIWRlc2Mpe1xyXG5cdFx0XHRcdFx0XHRkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLmF1ZGlvTm9kZS5fX3Byb3RvX18sIGkpO1x0XHJcblx0XHRcdFx0XHR9IFxyXG5cdFx0XHRcdFx0aWYoIWRlc2Mpe1xyXG5cdFx0XHRcdFx0XHRkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLmF1ZGlvTm9kZSxpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHZhciBwcm9wcyA9IHt9O1xyXG5cclxuLy9cdFx0XHRcdFx0aWYoZGVzYy5nZXQpe1xyXG5cdFx0XHRcdFx0XHRcdHByb3BzLmdldCA9ICgoaSkgPT4gdGhpcy5hdWRpb05vZGVbaV0pLmJpbmQobnVsbCwgaSk7XHJcbi8vXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoZGVzYy53cml0YWJsZSB8fCBkZXNjLnNldCl7XHJcblx0XHRcdFx0XHRcdHByb3BzLnNldCA9ICgoaSwgdikgPT4geyB0aGlzLmF1ZGlvTm9kZVtpXSA9IHY7IH0pLmJpbmQobnVsbCwgaSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHByb3BzLmVudW1lcmFibGUgPSBkZXNjLmVudW1lcmFibGU7XHJcblx0XHRcdFx0XHRwcm9wcy5jb25maWd1cmFibGUgPSBkZXNjLmNvbmZpZ3VyYWJsZTtcclxuXHRcdFx0XHRcdC8vcHJvcHMud3JpdGFibGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdC8vcHJvcHMud3JpdGFibGUgPSBkZXNjLndyaXRhYmxlO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaSxwcm9wcyk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHByb3BzLm5hbWUgPSBpO1xyXG5cdFx0XHRcdFx0cHJvcHMubm9kZSA9IHRoaXM7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKGRlc2MuZW51bWVyYWJsZSAmJiAhaS5tYXRjaCgvKC4qXyQpfChuYW1lKXwoXm51bWJlck9mLiokKS9pKSAmJiAodHlwZW9mIGF1ZGlvTm9kZVtpXSkgIT09ICdBcnJheScpe1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBhcmFtcy5wdXNoKHByb3BzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmlucHV0U3RhcnRZID0gaW5wdXRDeSAqIDIwO1xyXG5cdFx0dmFyIGlucHV0SGVpZ2h0ID0gKGlucHV0Q3kgKyB0aGlzLm51bWJlck9mSW5wdXRzKSAqIDIwIDtcclxuXHRcdHZhciBvdXRwdXRIZWlnaHQgPSAob3V0cHV0Q3kgKyB0aGlzLm51bWJlck9mT3V0cHV0cykgKiAyMDtcclxuXHRcdHRoaXMub3V0cHV0U3RhcnRZID0gb3V0cHV0Q3kgKiAyMDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gTWF0aC5tYXgodGhpcy5oZWlnaHQsaW5wdXRIZWlnaHQsb3V0cHV0SGVpZ2h0KTtcclxuXHRcdHRoaXMudGVtcCA9IHt9O1xyXG5cdFx0dGhpcy5zdGF0dXNQbGF5ID0gU1RBVFVTX1BMQVlfTk9UX1BMQVlFRDsvLyBub3QgcGxheWVkLlxyXG5cdFx0dGhpcy5wYW5lbCA9IG51bGw7XHJcblx0XHR0aGlzLmVkaXRvciA9IGVkaXRvci5iaW5kKHRoaXMsdGhpcyk7XHJcblx0fVxyXG5cdFxyXG5cdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdHN0YXRpYyByZW1vdmUobm9kZSkge1xyXG5cdFx0XHRpZighbm9kZS5yZW1vdmFibGUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ+WJiumZpOOBp+OBjeOBquOBhOODjuODvOODieOBp+OBmeOAgicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGlmIChBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXNbaV0gPT09IG5vZGUpIHtcclxuXHRcdFx0XHRcdGlmKG5vZGUuYXVkaW9Ob2RlLmRpc3Bvc2Upe1xyXG5cdFx0XHRcdFx0XHRub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMuc3BsaWNlKGktLSwgMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGxldCBuID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRcdGlmIChuLmZyb20ubm9kZSA9PT0gbm9kZSB8fCBuLnRvLm5vZGUgPT09IG5vZGUpIHtcclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdF8obik7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcblxyXG4gIC8vIFxyXG5cdHN0YXRpYyBkaXNjb25uZWN0Xyhjb24pIHtcclxuXHRcdGlmIChjb24uZnJvbS5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldykge1xyXG5cdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbik7XHJcblx0XHR9IGVsc2UgaWYgKGNvbi50by5wYXJhbSkge1xyXG5cdFx0XHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRpZiAoY29uLnRvLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpIHtcclxuXHRcdFx0XHQvLyBBVWRpb1BhcmFtXHJcblx0XHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtKSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5wYXJhbS5hdWRpb1BhcmFtLCBjb24uZnJvbS5wYXJhbSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLnBhcmFtLmF1ZGlvUGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBjb24udG8ucGFyYW3jgYzmlbDlrZdcclxuXHRcdFx0XHRpZiAoY29uLmZyb20ucGFyYW0pIHtcclxuXHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldykge1xyXG5cdFx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbik7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlLCBjb24uZnJvbS5wYXJhbSwgY29uLnRvLnBhcmFtKTtcclxuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGUpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlLCAwLCBjb24udG8ucGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gdG8g44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSkge1xyXG5cdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSwgY29uLmZyb20ucGFyYW0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g44Kz44ON44Kv44K344On44Oz44Gu5o6l57aa44KS6Kej6Zmk44GZ44KLXHJcblx0c3RhdGljIGRpc2Nvbm5lY3QoZnJvbV8sdG9fKSB7XHJcblx0XHRcdGlmKGZyb21fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyl7XHJcblx0XHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tX307XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmKGZyb21fIGluc3RhbmNlb2YgUGFyYW1WaWV3ICl7XHJcblx0XHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tXy5BdWRpb05vZGVWaWV3LHBhcmFtOmZyb21ffTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYodG9fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyl7XHJcblx0XHRcdFx0dG9fID0ge25vZGU6dG9ffTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYodG9fIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX31cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYodG9fIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHZhciBjb24gPSB7J2Zyb20nOmZyb21fLCd0byc6dG9ffTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIOOCs+ODjeOCr+OCt+ODp+ODs+OBruWJiumZpFxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGxldCBuID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRcdGlmKGNvbi5mcm9tLm5vZGUgPT09IG4uZnJvbS5ub2RlICYmIGNvbi5mcm9tLnBhcmFtID09PSBuLmZyb20ucGFyYW0gXHJcblx0XHRcdFx0XHQmJiBjb24udG8ubm9kZSA9PT0gbi50by5ub2RlICYmIGNvbi50by5wYXJhbSA9PT0gbi50by5wYXJhbSl7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdF8oY29uKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdH1cclxuXHJcblx0c3RhdGljIGNyZWF0ZShhdWRpb25vZGUsZWRpdG9yID0gKCk9Pnt9KSB7XHJcblx0XHR2YXIgb2JqID0gbmV3IEF1ZGlvTm9kZVZpZXcoYXVkaW9ub2RlLGVkaXRvcik7XHJcblx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMucHVzaChvYmopO1xyXG5cdFx0cmV0dXJuIG9iajtcclxuXHR9XHJcblx0XHJcbiAgLy8g44OO44O844OJ6ZaT44Gu5o6l57aaXHJcblx0c3RhdGljIGNvbm5lY3QoZnJvbV8sIHRvXykge1xyXG5cdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3ICl7XHJcblx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8scGFyYW06MH07XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRmcm9tXyA9IHtub2RlOmZyb21fLkF1ZGlvTm9kZVZpZXcscGFyYW06ZnJvbV99O1xyXG5cdFx0fVxyXG5cclxuXHRcdFxyXG5cdFx0aWYodG9fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyl7XHJcblx0XHRcdHRvXyA9IHtub2RlOnRvXyxwYXJhbTowfTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYodG9fIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZih0b18gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199O1xyXG5cdFx0fVxyXG5cdFx0Ly8g5a2Y5Zyo44OB44Kn44OD44KvXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcclxuXHRcdFx0dmFyIGMgPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnNbaV07XHJcblx0XHRcdGlmIChjLmZyb20ubm9kZSA9PT0gZnJvbV8ubm9kZSBcclxuXHRcdFx0XHQmJiBjLmZyb20ucGFyYW0gPT09IGZyb21fLnBhcmFtXHJcblx0XHRcdFx0JiYgYy50by5ub2RlID09PSB0b18ubm9kZVxyXG5cdFx0XHRcdCYmIGMudG8ucGFyYW0gPT09IHRvXy5wYXJhbVxyXG5cdFx0XHRcdCkgXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG4vL1x0XHRcdFx0dGhyb3cgKG5ldyBFcnJvcign5o6l57aa44GM6YeN6KSH44GX44Gm44GE44G+44GZ44CCJykpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIOaOpee2muWFiOOBjFBhcmFtVmlld+OBruWgtOWQiOOBr+aOpee2muWFg+OBr1BhcmFtVmlld+OBruOBv1xyXG5cdFx0aWYodG9fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3ICYmICEoZnJvbV8ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpKXtcclxuXHRcdCAgcmV0dXJuIDtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gUGFyYW1WaWV344GM5o6l57aa5Y+v6IO944Gq44Gu44GvQXVkaW9QYXJhbeOBi+OCiVBhcmFtVmlld+OBruOBv1xyXG5cdFx0aWYoZnJvbV8ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRpZighKHRvXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyB8fCB0b18ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldykpe1xyXG5cdFx0XHRcdHJldHVybjtcdFxyXG5cdFx0XHR9XHJcblx0XHR9IFxyXG5cdFx0XHJcblx0XHRpZiAoZnJvbV8ucGFyYW0pIHtcclxuXHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0ICBpZihmcm9tXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0ICBmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHsnZnJvbSc6ZnJvbV8sJ3RvJzp0b199KTtcclxuLy9cdFx0XHRcdGZyb21fLm5vZGUuY29ubmVjdFBhcmFtKGZyb21fLnBhcmFtLHRvXyk7XHJcblx0XHRcdH0gZWxzZSBpZiAodG9fLnBhcmFtKSBcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0aWYodG9fLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0Ly8gQXVkaW9QYXJhbeOBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ucGFyYW0uYXVkaW9QYXJhbSxmcm9tXy5wYXJhbSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIOaVsOWtl+OBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUsIGZyb21fLnBhcmFtLHRvXy5wYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUsZnJvbV8ucGFyYW0pO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdGlmICh0b18ucGFyYW0pIHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdC8vIEF1ZGlvUGFyYW3jga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLnBhcmFtLmF1ZGlvUGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZXtcclxuXHRcdFx0XHRcdC8vIOaVsOWtl+OBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUsMCx0b18ucGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvL3Rocm93IG5ldyBFcnJvcignQ29ubmVjdGlvbiBFcnJvcicpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMucHVzaFxyXG5cdFx0KHtcclxuXHRcdFx0J2Zyb20nOiBmcm9tXyxcclxuXHRcdFx0J3RvJzogdG9fXHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMgPSBbXTtcclxuQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zID0gW107XHJcblxyXG5cclxuIiwiaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbmltcG9ydCAqIGFzIHVpIGZyb20gJy4vdWkuanMnO1xyXG5pbXBvcnQge3Nob3dTZXF1ZW5jZUVkaXRvcn0gZnJvbSAnLi9zZXF1ZW5jZUVkaXRvcic7XHJcblxyXG5leHBvcnQgdmFyIHN2ZztcclxuLy9hYVxyXG52YXIgbm9kZUdyb3VwLCBsaW5lR3JvdXA7XHJcbnZhciBkcmFnO1xyXG52YXIgZHJhZ091dDtcclxudmFyIGRyYWdQYXJhbTtcclxudmFyIGRyYWdQYW5lbDtcclxuXHJcbnZhciBtb3VzZUNsaWNrTm9kZTtcclxudmFyIG1vdXNlT3Zlck5vZGU7XHJcbnZhciBsaW5lO1xyXG52YXIgYXVkaW9Ob2RlQ3JlYXRvcnMgPSBbXTtcclxuXHJcbi8vIERyYXfjga7liJ3mnJ/ljJZcclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRVSSgpe1xyXG5cdC8vIOWHuuWKm+ODjuODvOODieOBruS9nOaIkO+8iOWJiumZpOS4jeWPr++8iVxyXG5cdHZhciBvdXQgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguZGVzdGluYXRpb24sc2hvd1BhbmVsKTtcclxuXHRvdXQueCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gMjtcclxuXHRvdXQueSA9IHdpbmRvdy5pbm5lckhlaWdodCAvIDI7XHJcblx0b3V0LnJlbW92YWJsZSA9IGZhbHNlO1xyXG5cdFxyXG5cdC8vIOODl+ODrOOCpOODpOODvFxyXG5cdGF1ZGlvLlNlcXVlbmNlci5hZGRlZCA9ICgpPT5cclxuXHR7XHJcblx0XHRpZihhdWRpby5TZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGggPT0gMSAmJiBhdWRpby5TZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT09IGF1ZGlvLlNFUV9TVEFUVVMuU1RPUFBFRCl7XHJcblx0XHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0XHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhdWRpby5TZXF1ZW5jZXIuZW1wdHkgPSAoKT0+e1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnN0b3BTZXF1ZW5jZXMoKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0fSBcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNwbGF5JylcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnN0YXJ0U2VxdWVuY2VzKGF1ZGlvLmN0eC5jdXJyZW50VGltZSk7XHJcblx0XHRkMy5zZWxlY3QodGhpcykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3BhdXNlJykub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnBhdXNlU2VxdWVuY2VzKCk7XHJcblx0XHRkMy5zZWxlY3QodGhpcykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fSk7XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjc3RvcCcpLm9uKCdjbGljaycsZnVuY3Rpb24oKXtcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5zdG9wU2VxdWVuY2VzKCk7XHJcblx0XHRkMy5zZWxlY3QodGhpcykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGF1ZGlvLlNlcXVlbmNlci5zdG9wcGVkID0gKCk9PntcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdC8vIEF1ZGlvTm9kZeODieODqeODg+OCsOeUqFxyXG5cdGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHQub3JpZ2luKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkOyB9KVxyXG5cdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdGlmKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdtb3VzZXVwJykpO1x0XHRcdFxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRkLnRlbXAueCA9IGQueDtcclxuXHRcdGQudGVtcC55ID0gZC55O1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSlcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoe2lkOidkcmFnJyx3aWR0aDpkLndpZHRoLGhlaWdodDpkLmhlaWdodCx4OjAseTowLCdjbGFzcyc6J2F1ZGlvTm9kZURyYWcnfSApO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0aWYoZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5zaGlmdEtleSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGQudGVtcC54ICs9IGQzLmV2ZW50LmR4O1xyXG5cdFx0ZC50ZW1wLnkgKz0gZDMuZXZlbnQuZHk7XHJcblx0XHQvL2QzLnNlbGVjdCh0aGlzKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAoZC54IC0gZC53aWR0aCAvIDIpICsgJywnICsgKGQueSAtIGQuaGVpZ2h0IC8gMikgKyAnKScpO1xyXG5cdFx0Ly9kcmF3KCk7XHJcblx0XHR2YXIgZHJhZ0N1cnNvbCA9IGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpXHJcblx0XHQuc2VsZWN0KCdyZWN0I2RyYWcnKTtcclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3gnKSkgKyBkMy5ldmVudC5keDtcclxuXHRcdHZhciB5ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3knKSkgKyBkMy5ldmVudC5keTtcclxuXHRcdGRyYWdDdXJzb2wuYXR0cih7eDp4LHk6eX0pO1x0XHRcclxuXHR9KVxyXG5cdC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oZCl7XHJcblx0XHRpZihkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5IHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRyYWdDdXJzb2wgPSBkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKVxyXG5cdFx0LnNlbGVjdCgncmVjdCNkcmFnJyk7XHJcblx0XHR2YXIgeCA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd4JykpO1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneScpKTtcclxuXHRcdGQueCA9IGQudGVtcC54O1xyXG5cdFx0ZC55ID0gZC50ZW1wLnk7XHJcblx0XHRkcmFnQ3Vyc29sLnJlbW92ZSgpO1x0XHRcclxuXHRcdGRyYXcoKTtcclxuXHR9KTtcclxuXHRcclxuXHQvLyDjg47jg7zjg4nplpPmjqXntprnlKggZHJhZyBcclxuXHRkcmFnT3V0ID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcblx0Lm9yaWdpbihmdW5jdGlvbiAoZCkgeyByZXR1cm4gZDsgfSlcclxuXHQub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oZCl7XHJcblx0XHRsZXQgeDEseTE7XHJcblx0XHRpZihkLmluZGV4KXtcclxuXHRcdFx0aWYoZC5pbmRleCBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDEgPSBkLm5vZGUueCAtIGQubm9kZS53aWR0aCAvIDIgKyBkLmluZGV4Lng7XHJcblx0XHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLmluZGV4Lnk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eDEgPSBkLm5vZGUueCArIGQubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLm5vZGUub3V0cHV0U3RhcnRZICsgZC5pbmRleCAqIDIwOyBcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0eDEgPSBkLm5vZGUueCArIGQubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdHkxID0gZC5ub2RlLnkgLSBkLm5vZGUuaGVpZ2h0IC8yICsgZC5ub2RlLm91dHB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHJcblx0XHRkLngxID0geDEsZC55MSA9IHkxO1x0XHRcdFx0XHJcblx0XHRkLngyID0geDEsZC55MiA9IHkxO1xyXG5cclxuXHRcdHZhciBwb3MgPSBtYWtlUG9zKHgxLHkxLGQueDIsZC55Mik7XHJcblx0XHRkLmxpbmUgPSBzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5kYXR1bShkKVxyXG5cdFx0LmFwcGVuZCgncGF0aCcpXHJcblx0XHQuYXR0cih7J2QnOmxpbmUocG9zKSwnY2xhc3MnOidsaW5lLWRyYWcnfSk7XHJcblx0fSlcclxuXHQub24oXCJkcmFnXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRkLngyICs9IGQzLmV2ZW50LmR4O1xyXG5cdFx0ZC55MiArPSBkMy5ldmVudC5keTtcclxuXHRcdGQubGluZS5hdHRyKCdkJyxsaW5lKG1ha2VQb3MoZC54MSxkLnkxLGQueDIsZC55MikpKTtcdFx0XHRcdFx0XHJcblx0fSlcclxuXHQub24oXCJkcmFnZW5kXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRsZXQgdGFyZ2V0WCA9IGQueDI7XHJcblx0XHRsZXQgdGFyZ2V0WSA9IGQueTI7XHJcblx0XHQvLyBpbnB1dOOCguOBl+OBj+OBr3BhcmFt44Gr5Yiw6YGU44GX44Gm44GE44KL44GLXHJcblx0XHQvLyBpbnB1dFx0XHRcclxuXHRcdGxldCBjb25uZWN0ZWQgPSBmYWxzZTtcclxuXHRcdGxldCBpbnB1dHMgPSBkMy5zZWxlY3RBbGwoJy5pbnB1dCcpWzBdO1xyXG5cdFx0Zm9yKHZhciBpID0gMCxsID0gaW5wdXRzLmxlbmd0aDtpIDwgbDsrK2kpe1xyXG5cdFx0XHRsZXQgZWxtID0gaW5wdXRzW2ldO1xyXG5cdFx0XHRsZXQgYmJveCA9IGVsbS5nZXRCQm94KCk7XHJcblx0XHRcdGxldCBub2RlID0gZWxtLl9fZGF0YV9fLm5vZGU7XHJcblx0XHRcdGxldCBsZWZ0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LngsXHJcblx0XHRcdFx0dG9wID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55LFxyXG5cdFx0XHRcdHJpZ2h0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LnggKyBiYm94LndpZHRoLFxyXG5cdFx0XHRcdGJvdHRvbSA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueSArIGJib3guaGVpZ2h0O1xyXG5cdFx0XHRpZih0YXJnZXRYID49IGxlZnQgJiYgdGFyZ2V0WCA8PSByaWdodCAmJiB0YXJnZXRZID49IHRvcCAmJiB0YXJnZXRZIDw9IGJvdHRvbSlcclxuXHRcdFx0e1xyXG4vL1x0XHRcdFx0Y29uc29sZS5sb2coJ2hpdCcsZWxtKTtcclxuXHRcdFx0XHRsZXQgZnJvbV8gPSB7bm9kZTpkLm5vZGUscGFyYW06ZC5pbmRleH07XHJcblx0XHRcdFx0bGV0IHRvXyA9IHtub2RlOm5vZGUscGFyYW06ZWxtLl9fZGF0YV9fLmluZGV4fTtcclxuXHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoZnJvbV8sdG9fKTtcclxuXHRcdFx0XHQvL0F1ZGlvTm9kZVZpZXcuY29ubmVjdCgpO1xyXG5cdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0XHRjb25uZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKCFjb25uZWN0ZWQpe1xyXG5cdFx0XHQvLyBBdWRpb1BhcmFtXHJcblx0XHRcdHZhciBwYXJhbXMgPSBkMy5zZWxlY3RBbGwoJy5wYXJhbSwuYXVkaW8tcGFyYW0nKVswXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMCxsID0gcGFyYW1zLmxlbmd0aDtpIDwgbDsrK2kpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgZWxtID0gcGFyYW1zW2ldO1xyXG5cdFx0XHRcdGxldCBiYm94ID0gZWxtLmdldEJCb3goKTtcclxuXHRcdFx0XHRsZXQgcGFyYW0gPSBlbG0uX19kYXRhX187XHJcblx0XHRcdFx0bGV0IG5vZGUgPSBwYXJhbS5ub2RlO1xyXG5cdFx0XHRcdGxldCBsZWZ0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94Lng7XHJcblx0XHRcdFx0bGV0XHR0b3BfID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55O1xyXG5cdFx0XHRcdGxldFx0cmlnaHQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueCArIGJib3gud2lkdGg7XHJcblx0XHRcdFx0bGV0XHRib3R0b20gPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94LnkgKyBiYm94LmhlaWdodDtcclxuXHRcdFx0XHRpZih0YXJnZXRYID49IGxlZnQgJiYgdGFyZ2V0WCA8PSByaWdodCAmJiB0YXJnZXRZID49IHRvcF8gJiYgdGFyZ2V0WSA8PSBib3R0b20pXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ2hpdCcsZWxtKTtcclxuXHRcdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpkLm5vZGUscGFyYW06ZC5pbmRleH0se25vZGU6bm9kZSxwYXJhbTpwYXJhbS5pbmRleH0pO1xyXG5cdFx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBsaW5l44OX44Os44OT44Ol44O844Gu5YmK6ZmkXHJcblx0XHRkLmxpbmUucmVtb3ZlKCk7XHJcblx0XHRkZWxldGUgZC5saW5lO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3BhbmVsLWNsb3NlJylcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbigpe2QzLnNlbGVjdCgnI3Byb3AtcGFuZWwnKS5zdHlsZSgndmlzaWJpbGl0eScsJ2hpZGRlbicpO2QzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTt9KTtcclxuXHJcblx0Ly8gbm9kZemWk+aOpee2mmxpbmXmj4/nlLvplqLmlbBcclxuXHRsaW5lID0gZDMuc3ZnLmxpbmUoKVxyXG5cdC54KGZ1bmN0aW9uKGQpe3JldHVybiBkLnh9KVxyXG5cdC55KGZ1bmN0aW9uKGQpe3JldHVybiBkLnl9KVxyXG5cdC5pbnRlcnBvbGF0ZSgnYmFzaXMnKTtcclxuXHJcblx0Ly8gRE9N44Grc3Zn44Ko44Os44Oh44Oz44OI44KS5oy/5YWlXHRcclxuXHRzdmcgPSBkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHQuYXR0cih7ICd3aWR0aCc6IHdpbmRvdy5pbm5lcldpZHRoLCAnaGVpZ2h0Jzogd2luZG93LmlubmVySGVpZ2h0IH0pO1xyXG5cclxuXHQvLyDjg47jg7zjg4njgYzlhaXjgovjgrDjg6vjg7zjg5dcclxuXHRub2RlR3JvdXAgPSBzdmcuYXBwZW5kKCdnJyk7XHJcblx0Ly8g44Op44Kk44Oz44GM5YWl44KL44Kw44Or44O844OXXHJcblx0bGluZUdyb3VwID0gc3ZnLmFwcGVuZCgnZycpO1xyXG5cdFxyXG5cdC8vIGJvZHnlsZ7mgKfjgavmjL/lhaVcclxuXHRhdWRpb05vZGVDcmVhdG9ycyA9IFxyXG5cdFtcclxuXHRcdHtuYW1lOidHYWluJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUdhaW4uYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidEZWxheScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVEZWxheS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0F1ZGlvQnVmZmVyU291cmNlJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J01lZGlhRWxlbWVudEF1ZGlvU291cmNlJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhRWxlbWVudFNvdXJjZS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J1Bhbm5lcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVQYW5uZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidDb252b2x2ZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQ29udm9sdmVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQW5hbHlzZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQW5hbHlzZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidDaGFubmVsU3BsaXR0ZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQ2hhbm5lbFNwbGl0dGVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ2hhbm5lbE1lcmdlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVDaGFubmVsTWVyZ2VyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonRHluYW1pY3NDb21wcmVzc29yJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3Nvci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0JpcXVhZEZpbHRlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVCaXF1YWRGaWx0ZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidPc2NpbGxhdG9yJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU9zY2lsbGF0b3IuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidNZWRpYVN0cmVhbUF1ZGlvU291cmNlJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtU291cmNlLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonV2F2ZVNoYXBlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVXYXZlU2hhcGVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonRUcnLGNyZWF0ZTooKT0+bmV3IGF1ZGlvLkVHKCl9LFxyXG5cdFx0e25hbWU6J1NlcXVlbmNlcicsY3JlYXRlOigpPT5uZXcgYXVkaW8uU2VxdWVuY2VyKCksZWRpdG9yOnNob3dTZXF1ZW5jZUVkaXRvcn1cclxuXHRdO1xyXG5cdFxyXG5cdGlmKGF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbURlc3RpbmF0aW9uKXtcclxuXHRcdGF1ZGlvTm9kZUNyZWF0b3JzLnB1c2goe25hbWU6J01lZGlhU3RyZWFtQXVkaW9EZXN0aW5hdGlvbicsXHJcblx0XHRcdGNyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFTdHJlYW1EZXN0aW5hdGlvbi5iaW5kKGF1ZGlvLmN0eClcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHQuZGF0dW0oe30pXHJcblx0Lm9uKCdjb250ZXh0bWVudScsZnVuY3Rpb24oKXtcclxuXHRcdHNob3dBdWRpb05vZGVQYW5lbCh0aGlzKTtcclxuXHR9KTtcclxufVxyXG5cclxuLy8g5o+P55S7XHJcbmV4cG9ydCBmdW5jdGlvbiBkcmF3KCkge1xyXG5cdC8vIEF1ZGlvTm9kZeOBruaPj+eUu1xyXG5cdHZhciBnZCA9IG5vZGVHcm91cC5zZWxlY3RBbGwoJ2cnKS5cclxuXHRkYXRhKGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2RlcyxmdW5jdGlvbihkKXtyZXR1cm4gZC5pZDt9KTtcclxuXHJcblx0Ly8g55+p5b2i44Gu5pu05pawXHJcblx0Z2Quc2VsZWN0KCdyZWN0JylcclxuXHQuYXR0cih7ICd3aWR0aCc6IChkKT0+IGQud2lkdGgsICdoZWlnaHQnOiAoZCk9PiBkLmhlaWdodCB9KTtcclxuXHRcclxuXHQvLyBBdWRpb05vZGXnn6nlvaLjgrDjg6vjg7zjg5dcclxuXHR2YXIgZyA9IGdkLmVudGVyKClcclxuXHQuYXBwZW5kKCdnJyk7XHJcblx0Ly8gQXVkaW9Ob2Rl55+p5b2i44Kw44Or44O844OX44Gu5bqn5qiZ5L2N572u44K744OD44OIXHJcblx0Z2QuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuICd0cmFuc2xhdGUoJyArIChkLnggLSBkLndpZHRoIC8gMikgKyAnLCcgKyAoZC55IC0gZC5oZWlnaHQgLyAyKSArICcpJyB9KTtcdFxyXG5cclxuXHQvLyBBdWRpb05vZGXnn6nlvaJcclxuXHRnLmFwcGVuZCgncmVjdCcpXHJcblx0LmNhbGwoZHJhZylcclxuXHQuYXR0cih7ICd3aWR0aCc6IChkKT0+IGQud2lkdGgsICdoZWlnaHQnOiAoZCk9PiBkLmhlaWdodCwgJ2NsYXNzJzogJ2F1ZGlvTm9kZScgfSlcclxuXHQuY2xhc3NlZCgncGxheScsZnVuY3Rpb24oZCl7XHJcblx0XHRyZXR1cm4gZC5zdGF0dXNQbGF5ID09PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HO1xyXG5cdH0pXHJcblx0Lm9uKCdjb250ZXh0bWVudScsZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDjg5Hjg6njg6Hjg7zjgr/nt6jpm4bnlLvpnaLjga7ooajnpLpcclxuXHRcdGQuZWRpdG9yKCk7XHJcblx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHR9KVxyXG5cdC5vbignY2xpY2sucmVtb3ZlJyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdFx0aWYoZDMuZXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRkLnBhbmVsICYmIGQucGFuZWwuaXNTaG93ICYmIGQucGFuZWwuZGlzcG9zZSgpO1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKGQpO1xyXG5cdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0fSBjYXRjaChlKSB7XHJcbi8vXHRcdFx0XHRkaWFsb2cudGV4dChlLm1lc3NhZ2UpLm5vZGUoKS5zaG93KHdpbmRvdy5pbm5lcldpZHRoLzIsd2luZG93LmlubmVySGVpZ2h0LzIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHR9KVxyXG5cdC5maWx0ZXIoZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDpn7PmupDjga7jgb/jgavjg5XjgqPjg6vjgr9cclxuXHRcdHJldHVybiBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIE9zY2lsbGF0b3JOb2RlIHx8IGQuYXVkaW9Ob2RlIGluc3RhbmNlb2YgQXVkaW9CdWZmZXJTb3VyY2VOb2RlIHx8IGQuYXVkaW9Ob2RlIGluc3RhbmNlb2YgTWVkaWFFbGVtZW50QXVkaW9Tb3VyY2VOb2RlOyBcclxuXHR9KVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g5YaN55Sf44O75YGc5q2iXHJcblx0XHRjb25zb2xlLmxvZyhkMy5ldmVudCk7XHJcblx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHRpZighZDMuZXZlbnQuY3RybEtleSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGxldCBzZWwgPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHRpZihkLnN0YXR1c1BsYXkgPT09IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlJTkcpe1xyXG5cdFx0XHRkLnN0YXR1c1BsYXkgPSBhdWRpby5TVEFUVVNfUExBWV9QTEFZRUQ7XHJcblx0XHRcdHNlbC5jbGFzc2VkKCdwbGF5JyxmYWxzZSk7XHJcblx0XHRcdGQuYXVkaW9Ob2RlLnN0b3AoMCk7XHJcblx0XHR9IGVsc2UgaWYoZC5zdGF0dXNQbGF5ICE9PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZRUQpe1xyXG5cdFx0XHRkLmF1ZGlvTm9kZS5zdGFydCgwKTtcclxuXHRcdFx0ZC5zdGF0dXNQbGF5ID0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUlORztcclxuXHRcdFx0c2VsLmNsYXNzZWQoJ3BsYXknLHRydWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YWxlcnQoJ+S4gOW6puWBnOatouOBmeOCi+OBqOWGjeeUn+OBp+OBjeOBvuOBm+OCk+OAgicpO1xyXG5cdFx0fVxyXG5cdH0pXHJcblx0LmNhbGwodG9vbHRpcCgnQ3RybCArIENsaWNrIOOBp+WGjeeUn+ODu+WBnOatoicpKTtcclxuXHQ7XHJcblx0XHJcblx0Ly8gQXVkaW9Ob2Rl44Gu44Op44OZ44OrXHJcblx0Zy5hcHBlbmQoJ3RleHQnKVxyXG5cdC5hdHRyKHsgeDogMCwgeTogLTEwLCAnY2xhc3MnOiAnbGFiZWwnIH0pXHJcblx0LnRleHQoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQubmFtZTsgfSk7XHJcblxyXG5cdC8vIOWFpeWKm0F1ZGlvUGFyYW3jga7ooajnpLpcdFxyXG5cdGdkLmVhY2goZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHR2YXIgZ3AgPSBzZWwuYXBwZW5kKCdnJyk7XHJcblx0XHR2YXIgZ3BkID0gZ3Auc2VsZWN0QWxsKCdnJylcclxuXHRcdC5kYXRhKGQuaW5wdXRQYXJhbXMubWFwKChkKT0+e1xyXG5cdFx0XHRyZXR1cm4ge25vZGU6ZC5BdWRpb05vZGVWaWV3LGluZGV4OmR9O1xyXG5cdFx0fSksZnVuY3Rpb24oZCl7cmV0dXJuIGQuaW5kZXguaWQ7fSk7XHRcdFxyXG5cclxuXHRcdHZhciBncGRnID0gZ3BkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKTtcclxuXHRcdFxyXG5cdFx0Z3BkZy5hcHBlbmQoJ2NpcmNsZScpXHJcblx0XHQuYXR0cih7J3InOiAoZCk9PmQuaW5kZXgud2lkdGgvMiwgXHJcblx0XHRjeDogMCwgY3k6IChkLCBpKT0+IHsgcmV0dXJuIGQuaW5kZXgueTsgfSxcclxuXHRcdCdjbGFzcyc6IGZ1bmN0aW9uKGQpIHtcclxuXHRcdFx0aWYoZC5pbmRleCBpbnN0YW5jZW9mIGF1ZGlvLkF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRyZXR1cm4gJ2F1ZGlvLXBhcmFtJztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gJ3BhcmFtJztcclxuXHRcdH19KTtcclxuXHRcdFxyXG5cdFx0Z3BkZy5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0LmF0dHIoe3g6IChkKT0+IChkLmluZGV4LnggKyBkLmluZGV4LndpZHRoIC8gMiArIDUpLHk6KGQpPT5kLmluZGV4LnksJ2NsYXNzJzonbGFiZWwnIH0pXHJcblx0XHQudGV4dCgoZCk9PmQuaW5kZXgubmFtZSk7XHJcblxyXG5cdFx0Z3BkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cclxuXHQvLyDlh7rliptQYXJhbeOBruihqOekulx0XHJcblx0Z2QuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdHZhciBncCA9IHNlbC5hcHBlbmQoJ2cnKTtcclxuXHRcdFxyXG5cdFx0XHJcblx0XHRcclxuXHRcdHZhciBncGQgPSBncC5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZC5vdXRwdXRQYXJhbXMubWFwKChkKT0+e1xyXG5cdFx0XHRyZXR1cm4ge25vZGU6ZC5BdWRpb05vZGVWaWV3LGluZGV4OmR9O1xyXG5cdFx0fSksZnVuY3Rpb24oZCl7cmV0dXJuIGQuaW5kZXguaWQ7fSk7XHJcblx0XHRcclxuXHRcdHZhciBncGRnID0gZ3BkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKTtcclxuXHJcblx0XHRncGRnLmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdC5hdHRyKHsncic6IChkKT0+ZC5pbmRleC53aWR0aC8yLCBcclxuXHRcdGN4OiBkLndpZHRoLCBjeTogKGQsIGkpPT4geyByZXR1cm4gZC5pbmRleC55OyB9LFxyXG5cdFx0J2NsYXNzJzogJ3BhcmFtJ30pXHJcblx0XHQuY2FsbChkcmFnT3V0KTtcclxuXHRcdFxyXG5cdFx0Z3BkZy5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0LmF0dHIoe3g6IChkKT0+IChkLmluZGV4LnggKyBkLmluZGV4LndpZHRoIC8gMiArIDUpLHk6KGQpPT5kLmluZGV4LnksJ2NsYXNzJzonbGFiZWwnIH0pXHJcblx0XHQudGV4dCgoZCk9PmQuaW5kZXgubmFtZSk7XHJcblxyXG5cdFx0Z3BkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cclxuXHQvLyDlh7rlipvooajnpLpcclxuXHRnZC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcclxuXHRcdHJldHVybiBkLm51bWJlck9mT3V0cHV0cyA+IDA7XHJcblx0fSlcclxuXHQuZWFjaChmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCdnJyk7XHJcblx0XHRpZighZC50ZW1wLm91dHMgfHwgKGQudGVtcC5vdXRzICYmIChkLnRlbXAub3V0cy5sZW5ndGggPCBkLm51bWJlck9mT3V0cHV0cykpKVxyXG5cdFx0e1xyXG5cdFx0XHRkLnRlbXAub3V0cyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwO2kgPCBkLm51bWJlck9mT3V0cHV0czsrK2kpe1xyXG5cdFx0XHRcdGQudGVtcC5vdXRzLnB1c2goe25vZGU6ZCxpbmRleDppfSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHZhciBzZWwxID0gc2VsLnNlbGVjdEFsbCgnZycpO1xyXG5cdFx0dmFyIHNlbGQgPSBzZWwxLmRhdGEoZC50ZW1wLm91dHMpO1xyXG5cclxuXHRcdHNlbGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKHsgeDogZC53aWR0aCAtIHVpLnBvaW50U2l6ZSAvIDIsIHk6IChkMSk9PiAoZC5vdXRwdXRTdGFydFkgKyBkMS5pbmRleCAqIDIwIC0gdWkucG9pbnRTaXplIC8gMiksIHdpZHRoOiB1aS5wb2ludFNpemUsIGhlaWdodDogdWkucG9pbnRTaXplLCAnY2xhc3MnOiAnb3V0cHV0JyB9KVxyXG5cdFx0LmNhbGwoZHJhZ091dCk7XHJcblx0XHRzZWxkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHJcblx0Ly8g5YWl5Yqb6KGo56S6XHJcblx0Z2RcclxuXHQuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XHRyZXR1cm4gZC5udW1iZXJPZklucHV0cyA+IDA7IH0pXHJcblx0LmVhY2goZnVuY3Rpb24oZCl7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgnZycpO1xyXG5cdFx0aWYoIWQudGVtcC5pbnMgfHwgKGQudGVtcC5pbnMgJiYgKGQudGVtcC5pbnMubGVuZ3RoIDwgZC5udW1iZXJPZklucHV0cykpKVxyXG5cdFx0e1xyXG5cdFx0XHRkLnRlbXAuaW5zID0gW107XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7aSA8IGQubnVtYmVyT2ZJbnB1dHM7KytpKXtcclxuXHRcdFx0XHRkLnRlbXAuaW5zLnB1c2goe25vZGU6ZCxpbmRleDppfSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHZhciBzZWwxID0gc2VsLnNlbGVjdEFsbCgnZycpO1xyXG5cdFx0dmFyIHNlbGQgPSBzZWwxLmRhdGEoZC50ZW1wLmlucyk7XHJcblxyXG5cdFx0c2VsZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoeyB4OiAtIHVpLnBvaW50U2l6ZSAvIDIsIHk6IChkMSk9PiAoZC5pbnB1dFN0YXJ0WSArIGQxLmluZGV4ICogMjAgLSB1aS5wb2ludFNpemUgLyAyKSwgd2lkdGg6IHVpLnBvaW50U2l6ZSwgaGVpZ2h0OiB1aS5wb2ludFNpemUsICdjbGFzcyc6ICdpbnB1dCcgfSlcclxuXHRcdC5vbignbW91c2VlbnRlcicsZnVuY3Rpb24oZCl7XHJcblx0XHRcdG1vdXNlT3Zlck5vZGUgPSB7bm9kZTpkLmF1ZGlvTm9kZV8scGFyYW06ZH07XHJcblx0XHR9KVxyXG5cdFx0Lm9uKCdtb3VzZWxlYXZlJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0aWYobW91c2VPdmVyTm9kZS5ub2RlKXtcclxuXHRcdFx0XHRpZihtb3VzZU92ZXJOb2RlLm5vZGUgPT09IGQuYXVkaW9Ob2RlXyAmJiBtb3VzZU92ZXJOb2RlLnBhcmFtID09PSBkKXtcclxuXHRcdFx0XHRcdG1vdXNlT3Zlck5vZGUgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRzZWxkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHRcclxuXHQvLyDkuI3opoHjgarjg47jg7zjg4njga7liYrpmaRcclxuXHRnZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHQvLyBsaW5lIOaPj+eUu1xyXG5cdHZhciBsZCA9IGxpbmVHcm91cC5zZWxlY3RBbGwoJ3BhdGgnKVxyXG5cdC5kYXRhKGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucyk7XHJcblxyXG5cdGxkLmVudGVyKClcclxuXHQuYXBwZW5kKCdwYXRoJyk7XHJcblxyXG5cdGxkLmVhY2goZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBwYXRoID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0dmFyIHgxLHkxLHgyLHkyO1xyXG5cclxuXHRcdC8vIHgxLHkxXHJcblx0XHRpZihkLmZyb20ucGFyYW0pe1xyXG5cdFx0XHRpZihkLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCAtIGQuZnJvbS5ub2RlLndpZHRoIC8gMiArIGQuZnJvbS5wYXJhbS54O1xyXG5cdFx0XHRcdHkxID0gZC5mcm9tLm5vZGUueSAtIGQuZnJvbS5ub2RlLmhlaWdodCAvMiArIGQuZnJvbS5wYXJhbS55OyBcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR4MSA9IGQuZnJvbS5ub2RlLnggKyBkLmZyb20ubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLm5vZGUub3V0cHV0U3RhcnRZICsgZC5mcm9tLnBhcmFtICogMjA7IFxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR4MSA9IGQuZnJvbS5ub2RlLnggKyBkLmZyb20ubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdHkxID0gZC5mcm9tLm5vZGUueSAtIGQuZnJvbS5ub2RlLmhlaWdodCAvMiArIGQuZnJvbS5ub2RlLm91dHB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHJcblx0XHR4MiA9IGQudG8ubm9kZS54IC0gZC50by5ub2RlLndpZHRoIC8gMjtcclxuXHRcdHkyID0gZC50by5ub2RlLnkgLSBkLnRvLm5vZGUuaGVpZ2h0IC8gMjtcclxuXHRcdFxyXG5cdFx0aWYoZC50by5wYXJhbSl7XHJcblx0XHRcdGlmKGQudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5BdWRpb1BhcmFtVmlldyB8fCBkLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR4MiArPSBkLnRvLnBhcmFtLng7XHJcblx0XHRcdFx0eTIgKz0gZC50by5wYXJhbS55O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHkyICs9ICBkLnRvLm5vZGUuaW5wdXRTdGFydFkgICsgIGQudG8ucGFyYW0gKiAyMDtcdFxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR5MiArPSBkLnRvLm5vZGUuaW5wdXRTdGFydFk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBwb3MgPSBtYWtlUG9zKHgxLHkxLHgyLHkyKTtcclxuXHRcdFxyXG5cdFx0cGF0aC5hdHRyKHsnZCc6bGluZShwb3MpLCdjbGFzcyc6J2xpbmUnfSk7XHJcblx0XHRwYXRoLm9uKCdjbGljaycsZnVuY3Rpb24oZCl7XHJcblx0XHRcdGlmKGQzLmV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoZC5mcm9tLGQudG8pO1xyXG5cdFx0XHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHR9IFxyXG5cdFx0fSkuY2FsbCh0b29sdGlwKCdTaGlmdCArIGNsaWNr44Gn5YmK6ZmkJykpO1xyXG5cdFx0XHJcblx0fSk7XHJcblx0bGQuZXhpdCgpLnJlbW92ZSgpO1xyXG59XHJcblxyXG4vLyDnsKHmmJN0b29sdGlw6KGo56S6XHJcbmZ1bmN0aW9uIHRvb2x0aXAobWVzKVxyXG57XHJcblx0cmV0dXJuIGZ1bmN0aW9uKGQpe1xyXG5cdFx0dGhpc1xyXG5cdFx0Lm9uKCdtb3VzZWVudGVyJyxmdW5jdGlvbigpe1xyXG5cdFx0XHRzdmcuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0LmF0dHIoeydjbGFzcyc6J3RpcCcseDpkMy5ldmVudC54ICsgMjAgLHk6ZDMuZXZlbnQueSAtIDIwfSlcclxuXHRcdFx0LnRleHQobWVzKTtcclxuXHRcdH0pXHJcblx0XHQub24oJ21vdXNlbGVhdmUnLGZ1bmN0aW9uKCl7XHJcblx0XHRcdHN2Zy5zZWxlY3RBbGwoJy50aXAnKS5yZW1vdmUoKTtcclxuXHRcdH0pXHJcblx0fTtcclxufVxyXG5cclxuLy8g5o6l57aa57ea44Gu5bqn5qiZ55Sf5oiQXHJcbmZ1bmN0aW9uIG1ha2VQb3MoeDEseTEseDIseTIpe1xyXG5cdHJldHVybiBbXHJcblx0XHRcdHt4OngxLHk6eTF9LFxyXG5cdFx0XHR7eDp4MSArICh4MiAtIHgxKS80LHk6eTF9LFxyXG5cdFx0XHR7eDp4MSArICh4MiAtIHgxKS8yLHk6eTEgKyAoeTIgLSB5MSkvMn0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpKjMvNCx5OnkyfSxcclxuXHRcdFx0e3g6eDIsIHk6eTJ9XHJcblx0XHRdO1xyXG59XHJcblxyXG4vLyDjg5fjg63jg5Hjg4bjgqPjg5Hjg43jg6vjga7ooajnpLpcclxuZnVuY3Rpb24gc2hvd1BhbmVsKGQpe1xyXG5cclxuXHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0aWYoZC5wYW5lbCAmJiBkLnBhbmVsLmlzU2hvdykgcmV0dXJuIDtcclxuXHJcblx0ZC5wYW5lbCA9IG5ldyB1aS5QYW5lbCgpO1xyXG5cdGQucGFuZWwueCA9IGQueDtcclxuXHRkLnBhbmVsLnkgPSBkLnk7XHJcblx0ZC5wYW5lbC5oZWFkZXIudGV4dChkLm5hbWUpO1xyXG5cdFxyXG5cdHZhciB0YWJsZSA9IGQucGFuZWwuYXJ0aWNsZS5hcHBlbmQoJ3RhYmxlJyk7XHJcblx0dmFyIHRib2R5ID0gdGFibGUuYXBwZW5kKCd0Ym9keScpLnNlbGVjdEFsbCgndHInKS5kYXRhKGQucGFyYW1zKTtcclxuXHR2YXIgdHIgPSB0Ym9keS5lbnRlcigpXHJcblx0LmFwcGVuZCgndHInKTtcclxuXHR0ci5hcHBlbmQoJ3RkJylcclxuXHQudGV4dCgoZCk9PmQubmFtZSk7XHJcblx0dHIuYXBwZW5kKCd0ZCcpXHJcblx0LmFwcGVuZCgnaW5wdXQnKVxyXG5cdC5hdHRyKHt0eXBlOlwidGV4dFwiLHZhbHVlOihkKT0+ZC5nZXQoKSxyZWFkb25seTooZCk9PmQuc2V0P251bGw6J3JlYWRvbmx5J30pXHJcblx0Lm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0bGV0IHZhbHVlID0gdGhpcy52YWx1ZTtcclxuXHRcdGxldCB2biA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG5cdFx0aWYoaXNOYU4odm4pKXtcclxuXHRcdFx0ZC5zZXQodmFsdWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZC5zZXQodm4pO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdGQucGFuZWwuc2hvdygpO1xyXG5cclxufVxyXG5cclxuLy8g44OO44O844OJ5oy/5YWl44OR44ON44Or44Gu6KGo56S6XHJcbmZ1bmN0aW9uIHNob3dBdWRpb05vZGVQYW5lbChkKXtcclxuXHQgZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHQgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0aWYoZC5wYW5lbCl7XHJcblx0XHRpZihkLnBhbmVsLmlzU2hvdylcclxuXHRcdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRkLnBhbmVsID0gbmV3IHVpLlBhbmVsKCk7XHJcblx0ZC5wYW5lbC54ID0gZDMuZXZlbnQub2Zmc2V0WDtcclxuXHRkLnBhbmVsLnkgPSBkMy5ldmVudC5vZmZzZXRZO1xyXG5cdGQucGFuZWwuaGVhZGVyLnRleHQoJ0F1ZGlvTm9kZeOBruaMv+WFpScpO1xyXG5cclxuXHR2YXIgdGFibGUgPSBkLnBhbmVsLmFydGljbGUuYXBwZW5kKCd0YWJsZScpO1xyXG5cdHZhciB0Ym9keSA9IHRhYmxlLmFwcGVuZCgndGJvZHknKS5zZWxlY3RBbGwoJ3RyJykuZGF0YShhdWRpb05vZGVDcmVhdG9ycyk7XHJcblx0dGJvZHkuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3RyJylcclxuXHQuYXBwZW5kKCd0ZCcpXHJcblx0LnRleHQoKGQpPT5kLm5hbWUpXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oZHQpe1xyXG5cdFx0Y29uc29sZS5sb2coJ+aMv+WFpScsZHQpO1xyXG5cdFx0XHJcblx0XHR2YXIgZWRpdG9yID0gZHQuZWRpdG9yIHx8IHNob3dQYW5lbDtcclxuXHRcdFxyXG5cdFx0dmFyIG5vZGUgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShkdC5jcmVhdGUoKSxlZGl0b3IpO1xyXG5cdFx0bm9kZS54ID0gZDMuZXZlbnQuY2xpZW50WDtcclxuXHRcdG5vZGUueSA9IGQzLmV2ZW50LmNsaWVudFk7XHJcblx0XHRkcmF3KCk7XHJcblx0XHQvLyBkMy5zZWxlY3QoJyNwcm9wLXBhbmVsJykuc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtcclxuXHRcdC8vIGQucGFuZWwuZGlzcG9zZSgpO1xyXG5cdH0pO1xyXG5cdGQucGFuZWwuc2hvdygpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXVkaW9Ob2RlVmlldyhuYW1lKXtcclxuXHR2YXIgb2JqID0gYXVkaW9Ob2RlQ3JlYXRvcnMuZmluZCgoZCk9PntcclxuXHRcdGlmKGQubmFtZSA9PT0gbmFtZSkgcmV0dXJuIHRydWU7XHJcblx0fSk7XHJcblx0aWYob2JqKXtcclxuXHRcdHJldHVybiBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShvYmouY3JlYXRlKCksb2JqLmVkaXRvciB8fCBzaG93UGFuZWwpO1x0XHRcdFxyXG5cdH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRUcge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHR0aGlzLmdhdGUgPSBuZXcgYXVkaW8uUGFyYW1WaWV3KHRoaXMsJ2dhdGUnLGZhbHNlKTtcclxuXHRcdHRoaXMub3V0cHV0ID0gbmV3IGF1ZGlvLlBhcmFtVmlldyh0aGlzLCdvdXRwdXQnLHRydWUpO1xyXG5cdFx0dGhpcy5udW1iZXJPZklucHV0cyA9IDA7XHJcblx0XHR0aGlzLm51bWJlck9mT3V0cHV0cyA9IDA7XHJcblx0XHR0aGlzLmF0dGFjayA9IDAuMDAxO1xyXG5cdFx0dGhpcy5kZWNheSA9IDAuMDU7XHJcblx0XHR0aGlzLnJlbGVhc2UgPSAwLjA1O1xyXG5cdFx0dGhpcy5zdXN0YWluID0gMC4yO1xyXG5cdFx0dGhpcy5nYWluID0gMS4wO1xyXG5cdFx0dGhpcy5uYW1lID0gJ0VHJztcclxuXHRcdGF1ZGlvLmRlZklzTm90QVBJT2JqKHRoaXMsZmFsc2UpO1xyXG5cdFx0dGhpcy5vdXRwdXRzID0gW107XHJcblx0fVxyXG5cdFxyXG5cdGNvbm5lY3QoYylcclxuXHR7XHJcblx0XHRpZighIChjLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcpKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdBdWRpb1BhcmFt5Lul5aSW44Go44Gv5o6l57aa44Gn44GN44G+44Gb44KT44CCJyk7XHJcblx0XHR9XHJcblx0XHRjLnRvLnBhcmFtLmF1ZGlvUGFyYW0udmFsdWUgPSAwO1xyXG5cdFx0dGhpcy5vdXRwdXRzLnB1c2goYy50byk7XHJcblx0fVxyXG5cdFxyXG5cdGRpc2Nvbm5lY3QoYyl7XHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0aGlzLm91dHB1dHMubGVuZ3RoOysraSl7XHJcblx0XHRcdGlmKGMudG8ubm9kZSA9PT0gdGhpcy5vdXRwdXRzW2ldLm5vZGUgJiYgYy50by5wYXJhbSA9PT0gdGhpcy5vdXRwdXRzW2ldLnBhcmFtKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhpcy5vdXRwdXRzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHRcclxuXHRwcm9jZXNzKHRvLGNvbSx2LHQpXHJcblx0e1xyXG5cdFx0aWYodiA+IDApIHtcclxuXHRcdFx0Ly8ga2V5b25cclxuXHRcdFx0Ly8gQURT44G+44Gn44KC44Gj44Gm44GE44GPXHJcblx0XHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdrZXlvbicsY29tLHYsdCk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLnNldFZhbHVlQXRUaW1lKDAsdCk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYgKiB0aGlzLmdhaW4gLHQgKyB0aGlzLmF0dGFjayk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYgKiB0aGlzLmdhaW4gLHQgKyB0aGlzLmF0dGFjayArIHRoaXMuZGVjYXkgKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBrZXlvZmZcclxuXHRcdFx0Ly8g44Oq44Oq44O844K5XHJcblx0XHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdrZXlvZmYnLGNvbSx2LHQpO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLHQgKyB0aGlzLnJlbGVhc2UpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0c3RvcCgpe1xyXG5cdFx0dGhpcy5vdXRwdXRzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdGNvbnNvbGUubG9nKCdzdG9wJyk7XHJcblx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcblx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5zZXRWYWx1ZUF0VGltZSgwLDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdHBhdXNlKCl7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcbn1cclxuXHJcbi8vIC8vLyDjgqjjg7Pjg5njg63jg7zjg5fjgrjjgqfjg43jg6zjg7zjgr/jg7xcclxuLy8gZnVuY3Rpb24gRW52ZWxvcGVHZW5lcmF0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuLy8gICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbi8vICAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbi8vICAgdGhpcy5hdHRhY2sgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4vLyAgIHRoaXMuZGVjYXkgPSBkZWNheSB8fCAwLjA1O1xyXG4vLyAgIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW4gfHwgMC41O1xyXG4vLyAgIHRoaXMucmVsZWFzZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4vLyB9O1xyXG4vLyBcclxuLy8gRW52ZWxvcGVHZW5lcmF0b3IucHJvdG90eXBlID1cclxuLy8ge1xyXG4vLyAgIGtleW9uOiBmdW5jdGlvbiAodCx2ZWwpIHtcclxuLy8gICAgIHRoaXMudiA9IHZlbCB8fCAxLjA7XHJcbi8vICAgICB2YXIgdiA9IHRoaXMudjtcclxuLy8gICAgIHZhciB0MCA9IHQgfHwgdGhpcy52b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuLy8gICAgIHZhciB0MSA9IHQwICsgdGhpcy5hdHRhY2sgKiB2O1xyXG4vLyAgICAgdmFyIGdhaW4gPSB0aGlzLnZvaWNlLmdhaW4uZ2FpbjtcclxuLy8gICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuLy8gICAgIGdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDApO1xyXG4vLyAgICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2LCB0MSk7XHJcbi8vICAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQwICsgdGhpcy5kZWNheSAvIHYpO1xyXG4vLyAgICAgLy9nYWluLnNldFRhcmdldEF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MSwgdDEgKyB0aGlzLmRlY2F5IC8gdik7XHJcbi8vICAgfSxcclxuLy8gICBrZXlvZmY6IGZ1bmN0aW9uICh0KSB7XHJcbi8vICAgICB2YXIgdm9pY2UgPSB0aGlzLnZvaWNlO1xyXG4vLyAgICAgdmFyIGdhaW4gPSB2b2ljZS5nYWluLmdhaW47XHJcbi8vICAgICB2YXIgdDAgPSB0IHx8IHZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4vLyAgICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4vLyAgICAgLy9nYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMCwgdDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4vLyAgIH1cclxuLy8gfTsiLCIndXNlIHN0cmljdCc7XG5cbi8vXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXG4vL1xudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xuICB0aGlzLmZuID0gZm47XG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XG59XG5cbi8qKlxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cblxuLyoqXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgICAsIGo7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZPYnNlcnZhYmxlKHRhcmdldCxwcm9wTmFtZSxvcHQgPSB7fSlcclxue1xyXG5cdCgoKT0+e1xyXG5cdFx0dmFyIHZfO1xyXG5cdFx0b3B0LmVudW1lcmFibGUgPSBvcHQuZW51bWVyYWJsZSB8fCB0cnVlO1xyXG5cdFx0b3B0LmNvbmZpZ3VyYWJsZSA9IG9wdC5jb25maWd1cmFibGUgfHwgZmFsc2U7XHJcblx0XHRvcHQuZ2V0ID0gb3B0LmdldCB8fCAoKCkgPT4gdl8pO1xyXG5cdFx0b3B0LnNldCA9IG9wdC5zZXQgfHwgKCh2KT0+e1xyXG5cdFx0XHRpZih2XyAhPSB2KXtcclxuXHRcdFx0XHR0YXJnZXQuZW1pdChwcm9wTmFtZSArICdfY2hhbmdlZCcsdik7XHJcblx0XHRcdH1cclxuXHRcdFx0dl8gPSB2O1xyXG5cdFx0fSk7XHJcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LHByb3BOYW1lLG9wdCk7XHJcblx0fSkoKTtcclxufSIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpby5qcyc7XHJcbmltcG9ydCB7aW5pdFVJLGRyYXcsc3ZnIH0gZnJvbSAnLi9kcmF3JztcclxuXHJcbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XHJcblx0YXVkaW8uc2V0Q3R4KG5ldyBBdWRpb0NvbnRleHQoKSk7XHJcblx0ZDMuc2VsZWN0KHdpbmRvdylcclxuXHQub24oJ3Jlc2l6ZScsZnVuY3Rpb24oKXtcclxuXHRcdGlmKHN2Zyl7XHJcblx0XHRcdHN2Zy5hdHRyKHtcclxuXHRcdFx0XHR3aWR0aDp3aW5kb3cuaW5uZXJXaWR0aCxcclxuXHRcdFx0XHRoZWlnaHQ6d2luZG93LmlubmVySGVpZ2h0XHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdGluaXRVSSgpO1xyXG5cdGRyYXcoKTtcclxufTsiLCIndXNlIHN0cmljdCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTZXF1ZW5jZUVkaXRvciB7XHJcblx0Y29uc3RydWN0b3Ioc2VxdWVuY2VyKSB7XHJcblx0XHR0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuXHRcdHNlcXVlbmNlci5wYW5lbCA9IG5ldyB1aS5QYW5lbCgpO1xyXG5cdFx0c2VxdWVuY2VyLnBhbmVsLnggPSBzZXF1ZW5jZXIueDtcclxuXHRcdHNlcXVlbmNlci5wYW5lbC55ID0gc2VxdWVuY2VyLnk7XHJcblx0XHRzZXF1ZW5jZXIucGFuZWwud2lkdGggPSAxMDI0O1xyXG5cdFx0c2VxdWVuY2VyLnBhbmVsLmhlaWdodCA9IDc2ODtcclxuXHRcdHNlcXVlbmNlci5wYW5lbC5oZWFkZXIudGV4dCgnU2VxdWVuY2UgRWRpdG9yJyk7XHJcblx0XHR2YXIgZWRpdG9yID0gc2VxdWVuY2VyLnBhbmVsLmFydGljbGUuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdzZXEtZWRpdG9yJywgdHJ1ZSk7XHJcblx0XHR2YXIgZGl2ID0gZWRpdG9yLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnaGVhZGVyJywgdHJ1ZSk7XHJcblx0IFxyXG5cdFx0Ly9cclxuXHRcdGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdUaW1lIEJhc2U6Jyk7XHJcblx0XHRkaXYuYXBwZW5kKCdpbnB1dCcpXHJcblx0XHRcdC5kYXR1bShzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRwYilcclxuXHRcdFx0LmF0dHIoeyAndHlwZSc6ICd0ZXh0JywgJ3NpemUnOiAnMycsICdpZCc6ICd0aW1lLWJhc2UnIH0pXHJcblx0XHRcdC5hdHRyKCd2YWx1ZScsICh2KSA9PiB2KVxyXG5cdFx0XHQub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRwYiA9IGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2FsbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2VxdWVuY2VyLmF1ZGlvTm9kZS5vbigndHBiX2NoYW5nZWQnLCAodikgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5hdHRyKCd2YWx1ZScsIHYpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHJcblxyXG5cdFx0ZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJ1RlbXBvOicpO1xyXG5cdFx0ZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG5cdFx0XHQuZGF0dW0oc2VxdWVuY2VyKVxyXG5cdFx0XHQuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJyB9KVxyXG5cdFx0XHQuYXR0cigndmFsdWUnLCAoZCkgPT4gc2VxdWVuY2VyLmF1ZGlvTm9kZS5icG0pXHJcblx0XHRcdC5vbignY2hhbmdlJywgKCkgPT4ge1xyXG5cdFx0XHRcdHNlcXVlbmNlci5hdWRpb05vZGUuYnBtID0gcGFyc2VGbG9hdChkMy5zZWxlY3QodGhpcykuYXR0cigndmFsdWUnKSwgMTApO1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQuY2FsbChmdW5jdGlvbiAoKSB7XHJcblx0XHRcdFx0c2VxdWVuY2VyLmF1ZGlvTm9kZS5vbignYnBtX2NoYW5nZWQnLCAodikgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5hdHRyKCd2YWx1ZScsIHYpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnQmVhdDonKTtcclxuXHRcdGRpdi5hcHBlbmQoJ2lucHV0JylcclxuXHRcdFx0LmRhdHVtKHNlcXVlbmNlcilcclxuXHRcdFx0LmF0dHIoeyAndHlwZSc6ICd0ZXh0JywgJ3NpemUnOiAnMycsICd2YWx1ZSc6IChkKSA9PiBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJlYXQgfSlcclxuXHRcdFx0Lm9uKCdjaGFuZ2UnLCAoZCkgPT4ge1xyXG5cdFx0XHRcdHNlcXVlbmNlci5hdWRpb05vZGUuYmVhdCA9IHBhcnNlRmxvYXQoZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJyksIDEwKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0ZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJyAvICcpO1xyXG5cdFx0ZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG5cdFx0XHQuZGF0dW0oc2VxdWVuY2VyKVxyXG5cdFx0XHQuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJywgJ3ZhbHVlJzogKGQpID0+IHNlcXVlbmNlci5hdWRpb05vZGUuYmFyIH0pXHJcblx0XHRcdC5vbignY2hhbmdlJywgKGQpID0+IHtcclxuXHRcdFx0XHRzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJhciA9IHBhcnNlRmxvYXQoZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJyksIDEwKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cclxuXHRcdC8vIOODiOODqeODg+OCr+OCqOODh+OCo+OCv1xyXG5cdFx0bGV0IHRyYWNrRWRpdCA9IGVkaXRvci5zZWxlY3RBbGwoJ2Rpdi50cmFjaycpXHJcblx0XHRcdC5kYXRhKHNlcXVlbmNlci5hdWRpb05vZGUudHJhY2tzKVxyXG5cdFx0XHQuZW50ZXIoKVxyXG5cdFx0XHQuYXBwZW5kKCdkaXYnKVxyXG5cdFx0XHQuY2xhc3NlZCgndHJhY2snLCB0cnVlKVxyXG5cdFx0XHQuYXR0cih7ICdpZCc6IChkLCBpKSA9PiAndHJhY2stJyArIChpICsgMSksICd0YWJpbmRleCc6ICcwJyB9KTtcclxuXHJcblx0XHRsZXQgdHJhY2tIZWFkZXIgPSB0cmFja0VkaXQuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCd0cmFjay1oZWFkZXInLCB0cnVlKTtcclxuXHRcdHRyYWNrSGVhZGVyLmFwcGVuZCgnc3BhbicpLnRleHQoKGQsIGkpID0+ICdUUjonICsgKGkgKyAxKSk7XHJcblx0XHR0cmFja0hlYWRlci5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdNRUFTOicpO1xyXG5cdFx0bGV0IHRyYWNrQm9keSA9IHRyYWNrRWRpdC5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ3RyYWNrLWJvZHknLCB0cnVlKTtcclxuXHRcdGxldCBldmVudEVkaXQgPSB0cmFja0JvZHkuYXBwZW5kKCd0YWJsZScpO1xyXG5cdFx0bGV0IGhlYWRyb3cgPSBldmVudEVkaXQuYXBwZW5kKCd0aGVhZCcpLmFwcGVuZCgndHInKTtcclxuXHRcdGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ00jJyk7XHJcblx0XHRoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdTIycpO1xyXG5cdFx0aGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnTlQnKTtcclxuXHRcdGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ04jJyk7XHJcblx0XHRoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdTVCcpO1xyXG5cdFx0aGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnR1QnKTtcclxuXHRcdGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1ZFJyk7XHJcblx0XHRoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdDTycpO1xyXG5cdFx0bGV0IGV2ZW50Qm9keSA9IGV2ZW50RWRpdC5hcHBlbmQoJ3Rib2R5JykuYXR0cignaWQnLCAoZCwgaSkgPT4gJ3RyYWNrLScgKyAoaSArIDEpICsgJy1ldmVudHMnKTtcclxuXHRcdC8vdGhpcy5kcmF3RXZlbnRzKGV2ZW50Qm9keSk7XHJcblx0XHRcclxuXHRcdHNlcXVlbmNlci5hdWRpb05vZGUudHJhY2tzWzBdLmV2ZW50cy5wdXNoKG5ldyBhdWRpby5Ob3RlRXZlbnQoNDgsNDcsNikpO1xyXG5cdFx0Zm9yKHZhciBpID0gNDg7aTwgNTg7KytpKXtcclxuXHRcdFx0c2VxdWVuY2VyLmF1ZGlvTm9kZS50cmFja3NbMF0uZXZlbnRzLnB1c2gobmV3IGF1ZGlvLk5vdGVFdmVudCg0OCxpLDYpKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyDjg4jjg6njg4Pjgq/jgqjjg4fjgqPjgr/jg6HjgqTjg7NcclxuXHJcblx0XHR0cmFja0VkaXQuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0XHRpZiAoIXRoaXMuZWRpdG9yKSB7XHJcblx0XHRcdFx0dGhpcy5lZGl0b3IgPSBkb0VkaXRvcihkMy5zZWxlY3QodGhpcykpO1xyXG5cdFx0XHRcdHRoaXMuZWRpdG9yLm5leHQoKTtcclxuXHRcdFx0XHR0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dHJhY2tFZGl0Lm9uKCdrZXlkb3duJywgZnVuY3Rpb24gKGQpIHtcclxuXHRcdFx0Y29uc29sZS5sb2coZDMuZXZlbnQua2V5Q29kZSk7XHJcblx0XHRcdHZhciByZXQgPSB0aGlzLmVkaXRvci5uZXh0KGQzLmV2ZW50LmtleUNvZGUpO1xyXG5cdFx0XHRjb25zb2xlLmxvZyhyZXQpO1xyXG5cdFx0XHRpZihyZXQudmFsdWUpe1xyXG5cdFx0XHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0ZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cclxuXHRcdHNlcXVlbmNlci5wYW5lbC5vbignc2hvdycsICgpID0+IHtcclxuXHRcdFx0ZDMuc2VsZWN0KCcjdGltZS1iYXNlJykubm9kZSgpLmZvY3VzKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRzZXF1ZW5jZXIucGFuZWwub24oJ2Rpc3Bvc2UnLCAoKSA9PiB7XHJcblx0XHRcdGRlbGV0ZSBzZXF1ZW5jZXIuZWRpdG9ySW5zdGFuY2U7XHJcblx0XHR9KTtcclxuXHJcblx0XHRzZXF1ZW5jZXIucGFuZWwuc2hvdygpO1xyXG5cdH1cclxuXHJcblx0ZHJhd0V2ZW50cyhldmVudEJvZHkpIHtcclxuXHRcdGV2ZW50Qm9keS5lYWNoKGZ1bmN0aW9uIChkLCBpKSB7XHJcblx0XHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHRcdHZhciBldnNlbCA9IHNlbC5zZWxlY3RBbGwoJ3RyJykuZGF0YShkLmV2ZW50cyk7XHJcblx0XHRcdHZhciByb3cgPSBldnNlbC5lbnRlcigpLmFwcGVuZCgndHInKTtcclxuXHRcdFx0dmFyIHN0ZXAgPSAwO1xyXG5cdFx0XHRyb3cuZWFjaChmdW5jdGlvbiAoZCwgaSkge1xyXG5cdFx0XHRcdHN3aXRjaCAoZC50eXBlKSB7XHJcblx0XHRcdFx0XHRjYXNlIGF1ZGlvLkV2ZW50VHlwZS5Ob3RlOlxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgYXVkaW8uRXZlbnRUeXBlLk1lYXN1cmU6XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxufVxyXG5cclxuXHJcbnZhciBOb3RlcyA9IFtcclxuXHQnQyAnLFxyXG5cdCdDIycsXHJcblx0J0QgJyxcclxuXHQnRCMnLFxyXG5cdCdFICcsXHJcblx0J0YgJyxcclxuXHQnRiMnLFxyXG5cdCdHICcsXHJcblx0J0cjJyxcclxuXHQnQSAnLFxyXG5cdCdBIycsXHJcblx0J0IgJyxcclxuXTtcclxuXHJcblxyXG5mdW5jdGlvbiogZG9FZGl0b3IodHJhY2tFZGl0KSB7XHJcblx0bGV0IGtleWNvZGUgPSAwO1xyXG5cdGxldCB0cmFjayA9IHRyYWNrRWRpdC5kYXR1bSgpO1xyXG5cdGxldCBlZGl0VmlldyA9IGQzLnNlbGVjdCgnIycgKyB0cmFja0VkaXQuYXR0cignaWQnKSArICctZXZlbnRzJyk7XHJcblx0bGV0IG1lYXN1cmUgPSAxO1xyXG5cdGxldCBzdGVwID0gMTtcclxuXHRsZXQgbG9vcCA9IGZhbHNlO1xyXG5cdGxldCByb3dJbmRleCA9IDA7XHJcblx0bGV0IGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuXHRsZXQgY2VsbEluZGV4ID0gMjtcclxuXHRcclxuXHRmdW5jdGlvbiBzZXRJbnB1dCgpIHtcclxuXHRcdHRoaXMuYXR0cignY29udGVudEVkaXRhYmxlJywgJ3RydWUnKTtcclxuXHRcdHRoaXMub24oJ2ZvY3VzJyxmdW5jdGlvbigpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxKTtcclxuXHRcdFx0cm93SW5kZXggPSB0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxO1xyXG5cdFx0fSlcclxuXHR9XHJcblx0Ly8g5pei5a2Y44Kk44OZ44Oz44OI44Gu6KGo56S6XHJcblx0e1xyXG5cdFx0bGV0IGV2ZmxhZ21lbnQgPSB0cmFjay5ldmVudHMuc2xpY2UoKTtcclxuXHRcdGxldCBzZWxlY3QgPSBlZGl0Vmlldy5zZWxlY3RBbGwoJ3RyJykuZGF0YSh0cmFjay5ldmVudHMpO1xyXG5cdFx0bGV0IGVudGVyID0gc2VsZWN0LmVudGVyKCk7XHJcblx0XHRsZXQgcm93cyA9IGVudGVyLmFwcGVuZCgndHInKS5hdHRyKCdkYXRhLWluZGV4JywoZCxpKT0+aSk7XHJcblx0XHQgcm93cy5lYWNoKGZ1bmN0aW9uIChkLCBpKSB7XHJcblx0XHRcdCBsZXQgcm93ID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0XHQgcm93SW5kZXggPSBpOyBcclxuXHRcdFx0XHRzd2l0Y2ggKGQudHlwZSkge1xyXG5cdFx0XHRcdFx0Y2FzZSBhdWRpby5FdmVudFR5cGUuTm90ZTpcclxuXHRcdFx0XHRcdFx0cm93LmFwcGVuZCgndGQnKS50ZXh0KG1lYXN1cmUpOy8vIE1lYXNldXJlICNcclxuXHRcdFx0XHRcdFx0cm93LmFwcGVuZCgndGQnKS50ZXh0KHN0ZXArKyk7Ly8gU3RlcCAjXHJcblx0XHRcdFx0XHRcdGxldCBvY3QgPSBkLm5vdGUgLyAxMiB8IDA7XHJcblx0XHRcdFx0XHRcdGxldCBub3RlTmFtZSA9IE5vdGVzW2Qubm90ZSAlIDEyXSArIG9jdDtcclxuXHRcdFx0XHRcdFx0cm93LmFwcGVuZCgndGQnKS50ZXh0KG5vdGVOYW1lKS5jYWxsKHNldElucHV0KTsvLyBOb3RlXHJcblx0XHRcdFx0XHRcdHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLm5vdGUpLmNhbGwoc2V0SW5wdXQpOy8vIE5vdGUgI1xyXG5cdFx0XHRcdFx0XHRyb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5zdGVwKS5jYWxsKHNldElucHV0KTsvLyBTdGVwXHJcblx0XHRcdFx0XHRcdHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLmdhdGUpLmNhbGwoc2V0SW5wdXQpOy8vIEdhdGVcclxuXHRcdFx0XHRcdFx0cm93LmFwcGVuZCgndGQnKS50ZXh0KGQudmVsKS5jYWxsKHNldElucHV0KTsvLyBWZWxvY2l0eVxyXG5cdFx0XHRcdFx0XHRyb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5jb20pLmNhbGwoc2V0SW5wdXQpOy8vIENvbW1hbmRcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHRjYXNlIGF1ZGlvLkV2ZW50VHlwZS5NZWFzdXJlOlxyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGRvIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ25ldyBsaW5lJyxyb3dJbmRleCx0cmFjay5ldmVudHMubGVuZ3RoKTtcclxuXHRcdGlmICh0cmFjay5ldmVudHMubGVuZ3RoID09IDAgfHwgcm93SW5kZXggPiAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcblx0XHRcdHZhciByb3cgPSBlZGl0Vmlldy5hcHBlbmQoJ3RyJyk7XHJcblx0XHRcdGNlbGxJbmRleCA9IDI7XHJcblx0XHRcdHJvdy5hcHBlbmQoJ3RkJykudGV4dChtZWFzdXJlKTsvLyBNZWFzZXVyZSAjXHJcblx0XHRcdHJvdy5hcHBlbmQoJ3RkJykudGV4dChzdGVwKyspOy8vIFN0ZXAgI1xyXG5cdFx0XHRyb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpOy8vIE5vdGVcclxuXHRcdFx0cm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KTsvLyBOb3RlICNcclxuXHRcdFx0cm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KTsvLyBTdGVwXHJcblx0XHRcdHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dCk7Ly8gR2F0ZVxyXG5cdFx0XHRyb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpOy8vIFZlbG9jaXR5XHJcblx0XHRcdHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dCk7Ly8gQ29tbWFuZFxyXG5cdFx0XHRyb3cubm9kZSgpLmNlbGxzW2NlbGxJbmRleF0uZm9jdXMoKTtcclxuXHRcdH1cclxuXHRcdGtleWNvZGUgPSB5aWVsZCBmYWxzZTtcclxuXHRcdHZhciBlbmQgPSBmYWxzZTtcclxuXHRcdHdoaWxlICghZW5kKSB7XHJcblx0XHRcdHN3aXRjaCAoa2V5Y29kZSkge1xyXG5cdFx0XHRcdGNhc2UgMTM6Ly9FbnRlclxyXG5cdFx0XHRcdFx0bG9vcCA9IHRydWU7XHJcblx0XHRcdFx0XHRlbmQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0Ly8g44OH44OV44Kp44Or44OI5YCk44Gu5Luj5YWlXHJcblx0XHRcdFx0XHQvLyBpZihlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbMl0ubWF0Y2goLyhDICl8KEMjKXwoRCApfChEIyl8KEUgKXwoRiApfChGIyl8KEcgKXwoRyMpfChBICl8KEEjKXwoQiApWzAtOV0vKSlcclxuXHRcdFx0XHRcdC8vIHtcclxuXHRcdFx0XHRcdC8vIFx0XHJcblx0XHRcdFx0XHQvLyBcdFxyXG5cdFx0XHRcdFx0Ly8gfSBcclxuXHRcdFx0XHRcdHJvd0luZGV4Kys7XHJcblx0XHRcdFx0XHRrZXljb2RlID0geWllbGQgdHJ1ZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgMzk6Ly8gcmlnaHQgQ3Vyc29yXHJcblx0XHRcdFx0XHRjZWxsSW5kZXgrKztcclxuXHRcdFx0XHRcdGlmIChjZWxsSW5kZXggPiA3KSB7XHJcblx0XHRcdFx0XHRcdGNlbGxJbmRleCA9IDI7XHJcblx0XHRcdFx0XHRcdGlmKHJvd0luZGV4IDwgKGVkaXRWaWV3Lm5vZGUoKS5yb3dzLmxlbmd0aCAtIDEpKXtcclxuXHRcdFx0XHRcdFx0XHQrK3Jvd0luZGV4O1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdCsrcm93SW5kZXg7XHJcblx0XHRcdFx0XHRcdFx0bG9vcCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdFx0ZW5kID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF0uZm9jdXMoKTtcclxuXHRcdFx0XHRcdGtleWNvZGUgPSB5aWVsZCB0cnVlO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAzNzovLyBsZWZ0IEN1cnNvclxyXG5cdFx0XHRcdFx0LS1jZWxsSW5kZXg7XHJcblx0XHRcdFx0XHRpZihjZWxsSW5kZXggPD0gMil7XHJcblx0XHRcdFx0XHRcdGlmKHJvd0luZGV4ID09IDApe1xyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdC0tcm93SW5kZXg7XHJcblx0XHRcdFx0XHRcdFx0Y2VsbEluZGV4ID0gNztcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0ZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF0uZm9jdXMoKTtcclxuXHRcdFx0XHRcdGtleWNvZGUgPSB5aWVsZCB0cnVlO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSAxMDY6Ly8gKlxyXG5cdFx0XHRcdFx0a2V5Y29kZSA9IHlpZWxkIGZhbHNlO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHRcdGtleWNvZGUgPSB5aWVsZCBmYWxzZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSB3aGlsZSAobG9vcCk7XHJcbn1cclxuXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTZXF1ZW5jZUVkaXRvcihkKSB7XHJcblx0IGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0IGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0IGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0IGlmIChkLnBhbmVsICYmIGQucGFuZWwuaXNTaG93KSByZXR1cm47XHJcblx0IGQuZWRpdG9ySW5zdGFuY2UgPSBuZXcgU2VxdWVuY2VFZGl0b3IoZCk7XHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2V2ZW50RW1pdHRlcjMnO1xyXG5pbXBvcnQgKiBhcyBwcm9wIGZyb20gJy4vcHJvcCc7XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHN0ZXApe1xyXG5cdFx0dGhpcy5zdGVwID0gc3RlcDsgXHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0VmFsdWVBdFRpbWUoYXVkaW9QYXJhbSx2YWx1ZSx0aW1lKVxyXG57XHJcblx0YXVkaW9QYXJhbS5zZXRWYWx1ZUF0VGltZSh2YWx1ZSx0aW1lKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSl7XHJcblx0YXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2YWx1ZSx0aW1lKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUoYXVkaW9QYXJhbSx2YWx1ZSx0aW1lKXtcclxuXHRhdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHZhbHVlLHRpbWUpO1xyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIENvbW1hbmQge1xyXG5cdGNvbnN0cnVjdG9yKHBpdGNoQ29tbWFuZCA9IHNldFZhbHVlQXRUaW1lLHZlbG9jaXR5Q29tbWFuZCA9IHNldFZhbHVlQXRUaW1lKVxyXG5cdHtcclxuXHRcdHRoaXMucHJvY2Vzc1BpdGNoID0gcGl0Y2hDb21tYW5kLmJpbmQodGhpcyk7XHJcblx0XHR0aGlzLnByb2Nlc3NWZWxvY2l0eSA9IHZlbG9jaXR5Q29tbWFuZC5iaW5kKHRoaXMpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IHZhciBFdmVudFR5cGUgID0ge1xyXG5cdE5vdGU6MSxcclxuXHRNZWFzdXJlOjJcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE1lYXN1cmUgZXh0ZW5kcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigwKTtcclxuXHRcdHRoaXMudHlwZSA9IEV2ZW50VHlwZS5NZWFzdXJlO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE5vdGVFdmVudCBleHRlbmRzIEV2ZW50QmFzZSB7XHJcblx0Y29uc3RydWN0b3Ioc3RlcCA9IDk2LG5vdGUgPSA2NCxnYXRlID0gNDgsdmVsID0gMS4wLGNvbW1hbmQgPSBuZXcgQ29tbWFuZCgpKXtcclxuXHRcdHN1cGVyKHN0ZXApO1xyXG5cdFx0dGhpcy5ub3RlXyA9IG5vdGU7XHJcblx0XHR0aGlzLnRyYW5zb3BzZV8gPSAwO1xyXG5cdFx0dGhpcy5jYWxjUGl0Y2goKTtcclxuXHRcdHRoaXMuZ2F0ZSA9IGdhdGU7XHJcblx0XHR0aGlzLnZlbCA9IHZlbDtcclxuXHRcdHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XHJcblx0XHR0aGlzLmNvbW1hbmQuZXZlbnQgPSB0aGlzO1xyXG5cdFx0dGhpcy50eXBlID0gRXZlbnRUeXBlLk5vdGU7XHJcblx0fVxyXG5cdFxyXG5cdGdldCBub3RlICgpe1xyXG5cdFx0IHJldHVybiB0aGlzLm5vdGVfO1xyXG5cdH1cclxuXHRcclxuXHRzZXQgbm90ZSh2KXtcclxuXHRcdCB0aGlzLm5vdGVfID0gdjtcclxuXHRcdCB0aGlzLmNhbGNQaXRjaCgpO1xyXG5cdH1cclxuXHRcclxuXHRzZXQgdHJhbnNwb3NlKHYpe1xyXG5cdFx0aWYodiAhPSB0aGlzLnRyYW5zcG9zZV8pe1xyXG5cdFx0XHR0aGlzLnRyYW5zcG9zZV8gPSB2O1xyXG5cdFx0XHR0aGlzLmNhbGNQaXRjaCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRjYWxjUGl0Y2goKXtcclxuXHRcdHRoaXMucGl0Y2ggPSAoNDQwLjAgLyAzMi4wKSAqIChNYXRoLnBvdygyLjAsKCh0aGlzLm5vdGVfICsgdGhpcy50cmFuc3Bvc2VfIC0gOSkgLyAxMikpKTtcclxuXHR9XHJcblx0XHJcblx0cHJvY2Vzcyh0aW1lLHRyYWNrKXtcclxuXHRcdFx0aWYodGhpcy5ub3RlKXtcclxuXHRcdFx0XHR0aGlzLnRyYW5zb3BzZSA9IHRyYWNrLnRyYW5zcG9zZTtcclxuXHRcdFx0XHRmb3IobGV0IGogPSAwLGplID0gdHJhY2sucGl0Y2hlcy5sZW5ndGg7aiA8IGplOysrail7XHJcblx0XHRcdFx0XHR0cmFjay5waXRjaGVzW2pdLnByb2Nlc3ModGhpcy5jb21tYW5kLHRoaXMucGl0Y2gsdGltZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGZvcihsZXQgaiA9IDAsamUgPSB0cmFjay52ZWxvY2l0aWVzLmxlbmd0aDtqIDwgamU7KytqKXtcclxuXHRcdFx0XHRcdC8vIGtleW9uXHJcblx0XHRcdFx0XHR0cmFjay52ZWxvY2l0aWVzW2pdLnByb2Nlc3ModGhpcy5jb21tYW5kLHRoaXMudmVsLHRpbWUpO1xyXG5cdFx0XHRcdFx0Ly8ga2V5b2ZmXHJcblx0XHRcdFx0XHR0cmFjay52ZWxvY2l0aWVzW2pdLnByb2Nlc3ModGhpcy5jb21tYW5kLDAsdGltZSArIHRoaXMuZ2F0ZSAqIHRyYWNrLnNlcXVlbmNlci5zdGVwVGltZV8gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFRyYWNrIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb25zdHJ1Y3RvcihzZXF1ZW5jZXIpe1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuZXZlbnRzID0gW107XHJcblx0XHR0aGlzLnBvaW50ZXIgPSAwO1xyXG5cclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdzdGVwJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnZW5kJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnbmFtZScpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3RyYW5zcG9zZScpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0ZXAgPSAwO1xyXG5cdFx0dGhpcy5lbmQgPSBmYWxzZTtcclxuXHRcdHRoaXMucGl0Y2hlcyA9IFtdO1xyXG5cdFx0dGhpcy52ZWxvY2l0aWVzID0gW107XHJcblx0XHR0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuXHRcdHRoaXMubmFtZSA9ICcnO1xyXG5cdFx0dGhpcy50cmFuc3Bvc2UgPSAwO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFNFUV9TVEFUVVMgPSB7XHJcblx0U1RPUFBFRDowLFxyXG5cdFBMQVlJTkc6MSxcclxuXHRQQVVTRUQ6MlxyXG59IDtcclxuXHJcbmV4cG9ydCBjb25zdCBOVU1fT0ZfVFJBQ0tTID0gNDtcclxuXHJcbmV4cG9ydCBjbGFzcyBTZXF1ZW5jZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnYnBtJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywndHBiJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnYmVhdCcpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JhcicpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3JlcGVhdCcpO1xyXG5cclxuXHRcdHRoaXMuYnBtID0gMTIwLjA7IC8vIHRlbXBvXHJcblx0XHR0aGlzLnRwYiA9IDk2LjA7IC8vIOWbm+WIhumfs+espuOBruino+WDj+W6plxyXG5cdFx0dGhpcy5iZWF0ID0gNDtcclxuXHRcdHRoaXMuYmFyID0gNDsgLy8gXHJcblx0XHR0aGlzLnRyYWNrcyA9IFtdO1xyXG5cdFx0dGhpcy5udW1iZXJPZklucHV0cyA9IDA7XHJcblx0XHR0aGlzLm51bWJlck9mT3V0cHV0cyA9IDA7XHJcblx0XHR0aGlzLm5hbWUgPSAnU2VxdWVuY2VyJztcclxuXHRcdGZvciAodmFyIGkgPSAwO2kgPCBOVU1fT0ZfVFJBQ0tTOysraSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy50cmFja3MucHVzaChuZXcgVHJhY2sodGhpcykpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdnJ10gPSBuZXcgYXVkaW8uUGFyYW1WaWV3KG51bGwsJ3RyaycgKyBpICsgJ2cnLHRydWUpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdnJ10udHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddLnR5cGUgPSAnZ2F0ZSc7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdwJ10gPSBuZXcgYXVkaW8uUGFyYW1WaWV3KG51bGwsJ3RyaycgKyBpICsgJ3AnLHRydWUpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdwJ10udHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddLnR5cGUgPSAncGl0Y2gnO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5zdGFydFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY3VycmVudFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY3VycmVudE1lYXN1cmVfID0gMDtcclxuXHRcdHRoaXMuY2FsY1N0ZXBUaW1lKCk7XHJcblx0XHR0aGlzLnJlcGVhdCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cclxuXHRcdC8vXHJcblx0XHR0aGlzLm9uKCdicG1fY2hhbmVnZWQnLCgpPT57dGhpcy5jYWxjU3RlcFRpbWUoKTt9KTtcclxuXHRcdHRoaXMub24oJ3RwYl9jaGFuZWdlZCcsKCk9Pnt0aGlzLmNhbGNTdGVwVGltZSgpO30pO1xyXG5cclxuXHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnB1c2godGhpcyk7XHJcblx0XHRpZihTZXF1ZW5jZXIuYWRkZWQpe1xyXG5cdFx0XHRTZXF1ZW5jZXIuYWRkZWQoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblxyXG5cdGRpc3Bvc2UoKXtcclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aDsrK2kpXHJcblx0XHR7XHJcblx0XHRcdGlmKHRoaXMgPT09IFNlcXVlbmNlci5zZXF1ZW5jZXJzW2ldKXtcclxuXHRcdFx0XHQgU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3BsaWNlKGksMSk7XHJcblx0XHRcdFx0IGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aCA9PSAwKVxyXG5cdFx0e1xyXG5cdFx0XHRpZihTZXF1ZW5jZXIuZW1wdHkpe1xyXG5cdFx0XHRcdFNlcXVlbmNlci5lbXB0eSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGNhbGNTdGVwVGltZSgpe1xyXG5cdFx0dGhpcy5zdGVwVGltZV8gPSA2MC4wIC8gKCB0aGlzLmJwbSAqIHRoaXMudHBiKTsgXHJcblx0fVxyXG5cdFxyXG5cdHN0YXJ0KHRpbWUpe1xyXG5cdFx0aWYodGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuU1RPUFBFRCB8fCB0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QQVVTRUQgKXtcclxuXHRcdFx0dGhpcy5jdXJyZW50VGltZV8gPSB0aW1lIHx8IGF1ZGlvLmN0eC5jdXJyZW50VGltZSgpO1xyXG5cdFx0XHR0aGlzLnN0YXJ0VGltZV8gID0gdGhpcy5jdXJyZW50VGltZV87XHJcblx0XHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuUExBWUlORztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0c3RvcCgpe1xyXG5cdFx0aWYodGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUExBWUlORyB8fCB0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QQVVTRUQpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMudHJhY2tzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5waXRjaGVzLmZvckVhY2goKHApPT57XHJcblx0XHRcdFx0XHRwLnN0b3AoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRkLnZlbG9jaXRpZXMuZm9yRWFjaCgodik9PntcclxuXHRcdFx0XHRcdHYuc3RvcCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuU1RPUFBFRDtcclxuXHRcdFx0dGhpcy5yZXNldCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cGF1c2UoKXtcclxuXHRcdGlmKHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHR0aGlzLnN0YXR1c18gPSBTRVFfU1RBVFVTLlBBVVNFRDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmVzZXQoKXtcclxuXHRcdHRoaXMuc3RhcnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLnRyYWNrcy5mb3JFYWNoKCh0cmFjayk9PntcclxuXHRcdFx0dHJhY2suZW5kID0gIXRyYWNrLmV2ZW50cy5sZW5ndGg7XHJcblx0XHRcdHRyYWNrLnN0ZXAgPSAwO1xyXG5cdFx0XHR0cmFjay5wb2ludGVyID0gMDtcclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5jYWxjU3RlcFRpbWUoKTtcclxuXHR9XHJcbiAgLy8g44K344O844Kx44Oz44K144O844Gu5Yem55CGXHJcblx0cHJvY2VzcyAodGltZSlcclxuXHR7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IHRpbWUgfHwgYXVkaW8uY3R4LmN1cnJlbnRUaW1lKCk7XHJcblx0XHR2YXIgY3VycmVudFN0ZXAgPSAodGhpcy5jdXJyZW50VGltZV8gIC0gdGhpcy5zdGFydFRpbWVfICsgMC4xKSAvIHRoaXMuc3RlcFRpbWVfO1xyXG5cdFx0bGV0IGVuZGNvdW50ID0gMDtcclxuXHRcdGZvcih2YXIgaSA9IDAsbCA9IHRoaXMudHJhY2tzLmxlbmd0aDtpIDwgbDsrK2kpe1xyXG5cdFx0XHR2YXIgdHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0aWYoIXRyYWNrLmVuZCl7XHJcblx0XHRcdFx0d2hpbGUodHJhY2suc3RlcCA8PSBjdXJyZW50U3RlcCAmJiAhdHJhY2suZW5kICl7XHJcblx0XHRcdFx0XHRpZih0cmFjay5wb2ludGVyID49IHRyYWNrLmV2ZW50cy5sZW5ndGggKXtcclxuXHRcdFx0XHRcdFx0dHJhY2suZW5kID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR2YXIgZXZlbnQgPSB0cmFjay5ldmVudHNbdHJhY2sucG9pbnRlcisrXTtcclxuXHRcdFx0XHRcdFx0dmFyIHBsYXlUaW1lID0gdHJhY2suc3RlcCAqIHRoaXMuc3RlcFRpbWVfICsgdGhpcy5zdGFydFRpbWVfO1xyXG5cdFx0XHRcdFx0XHRldmVudC5wcm9jZXNzKHBsYXlUaW1lLHRyYWNrKTtcclxuXHRcdFx0XHRcdFx0dHJhY2suc3RlcCArPSBldmVudC5zdGVwO1xyXG4vL1x0XHRcdFx0XHRjb25zb2xlLmxvZyh0cmFjay5wb2ludGVyLHRyYWNrLmV2ZW50cy5sZW5ndGgsdHJhY2suZXZlbnRzW3RyYWNrLnBvaW50ZXJdLHRyYWNrLnN0ZXAsY3VycmVudFN0ZXAsdGhpcy5jdXJyZW50VGltZV8scGxheVRpbWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQrK2VuZGNvdW50O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihlbmRjb3VudCA9PSB0aGlzLnRyYWNrcy5sZW5ndGgpe1xyXG5cdFx0XHR0aGlzLnN0b3AoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g5o6l57aaXHJcblx0Y29ubmVjdChjKXtcclxuXHRcdHZhciB0cmFjayA9IGMuZnJvbS5wYXJhbS50cmFjaztcclxuXHRcdGlmKGMuZnJvbS5wYXJhbS50eXBlID09PSAncGl0Y2gnKXtcclxuXHRcdFx0dHJhY2sucGl0Y2hlcy5wdXNoKFNlcXVlbmNlci5tYWtlUHJvY2VzcyhjKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0cmFjay52ZWxvY2l0aWVzLnB1c2goU2VxdWVuY2VyLm1ha2VQcm9jZXNzKGMpKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g5YmK6ZmkXHJcblx0ZGlzY29ubmVjdChjKXtcclxuXHRcdHZhciB0cmFjayA9IGMuZnJvbS5wYXJhbS50cmFjaztcclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRyYWNrLnBpdGNoZXMubGVuZ3RoOysraSl7XHJcblx0XHRcdGlmKGMudG8ubm9kZSA9PT0gdHJhY2sucGl0Y2hlc1tpXS50by5ub2RlICYmIGMudG8ucGFyYW0gPT09IHRyYWNrLnBpdGNoZXNbaV0udG8ucGFyYW0pe1xyXG5cdFx0XHRcdHRyYWNrLnBpdGNoZXMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRyYWNrLnZlbG9jaXRpZXMubGVuZ3RoOysraSl7XHJcblx0XHRcdGlmKGMudG8ubm9kZSA9PT0gdHJhY2sudmVsb2NpdGllc1tpXS50by5ub2RlICYmIGMudG8ucGFyYW0gPT09IHRyYWNrLnZlbG9jaXRpZXNbaV0udG8ucGFyYW0pe1xyXG5cdFx0XHRcdHRyYWNrLnBpdGNoZXMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0c3RhdGljIG1ha2VQcm9jZXNzKGMpe1xyXG5cdFx0aWYoYy50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdHJldHVybiAge1xyXG5cdFx0XHRcdHRvOmMudG8sXHJcblx0XHRcdFx0cHJvY2VzczogKGNvbSx2LHQpPT57XHJcblx0XHRcdFx0XHRjLnRvLm5vZGUuYXVkaW9Ob2RlLnByb2Nlc3MoYy50byxjb20sdix0KTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHN0b3A6ZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdGMudG8ubm9kZS5hdWRpb05vZGUuc3RvcChjLnRvKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHR9IFxyXG5cdFx0dmFyIHByb2Nlc3M7XHJcblx0XHRpZihjLnRvLnBhcmFtLnR5cGUgPT09ICdwaXRjaCcpe1xyXG5cdFx0XHRwcm9jZXNzID0gKGNvbSx2LHQpID0+IHtcclxuXHRcdFx0XHRjb20ucHJvY2Vzc1BpdGNoKGMudG8ucGFyYW0uYXVkaW9QYXJhbSx2LHQpO1xyXG5cdFx0XHR9O1x0XHRcdFx0XHRcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHByb2Nlc3MgPVx0KGNvbSx2LHQpPT57XHJcblx0XHRcdFx0Y29tLnByb2Nlc3NWZWxvY2l0eShjLnRvLnBhcmFtLmF1ZGlvUGFyYW0sdix0KTtcclxuXHRcdFx0fTtcdFx0XHRcdFx0XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR0bzpjLnRvLFxyXG5cdFx0XHRwcm9jZXNzOnByb2Nlc3MsXHJcblx0XHRcdHN0b3A6ZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRjLnRvLnBhcmFtLmF1ZGlvUGFyYW0uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGV4ZWMoKVxyXG5cdHtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKFNlcXVlbmNlci5leGVjKTtcclxuXHRcdFx0bGV0IGVuZGNvdW50ID0gMDtcclxuXHRcdFx0Zm9yKHZhciBpID0gMCxlID0gU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoO2kgPCBlOysraSl7XHJcblx0XHRcdFx0dmFyIHNlcSA9IFNlcXVlbmNlci5zZXF1ZW5jZXJzW2ldO1xyXG5cdFx0XHRcdGlmKHNlcS5zdGF0dXNfID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdFx0XHRzZXEucHJvY2VzcyhhdWRpby5jdHguY3VycmVudFRpbWUpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihzZXEuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlNUT1BQRUQpe1xyXG5cdFx0XHRcdFx0KytlbmRjb3VudDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoZW5kY291bnQgPT0gU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0U2VxdWVuY2VyLnN0b3BTZXF1ZW5jZXMoKTtcclxuXHRcdFx0XHRpZihTZXF1ZW5jZXIuc3RvcHBlZCl7XHJcblx0XHRcdFx0XHRTZXF1ZW5jZXIuc3RvcHBlZCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDjgrfjg7zjgrHjg7PjgrnlhajkvZPjga7jgrnjgr/jg7zjg4hcclxuXHRzdGF0aWMgc3RhcnRTZXF1ZW5jZXModGltZSl7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5TVE9QUEVEIHx8IFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBBVVNFRCApXHJcblx0XHR7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5zdGFydCh0aW1lKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuUExBWUlORztcclxuXHRcdFx0U2VxdWVuY2VyLmV4ZWMoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0Ly8g44K344O844Kx44Oz44K55YWo5L2T44Gu5YGc5q2iXHJcblx0c3RhdGljIHN0b3BTZXF1ZW5jZXMoKXtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcgfHwgU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUEFVU0VEICl7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5zdG9wKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlNUT1BQRUQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyDjgrfjg7zjgrHjg7PjgrnlhajkvZPjga7jg53jg7zjgrpcdFxyXG5cdHN0YXRpYyBwYXVzZVNlcXVlbmNlcygpe1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5wYXVzZSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5QQVVTRUQ7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5TZXF1ZW5jZXIuc2VxdWVuY2VycyA9IFtdO1xyXG5TZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlNUT1BQRUQ7IFxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCBVVUlEIGZyb20gJy4vdXVpZC5jb3JlJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL0V2ZW50RW1pdHRlcjMnO1xyXG5leHBvcnQgY29uc3Qgbm9kZUhlaWdodCA9IDUwO1xyXG5leHBvcnQgY29uc3Qgbm9kZVdpZHRoID0gMTAwO1xyXG5leHBvcnQgY29uc3QgcG9pbnRTaXplID0gMTY7XHJcblxyXG4vLyBwYW5lbCB3aW5kb3dcclxuZXhwb3J0IGNsYXNzIFBhbmVsICBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3Ioc2VsLHByb3Ape1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdGlmKCFwcm9wIHx8ICFwcm9wLmlkKXtcclxuXHRcdFx0cHJvcCA9IHByb3AgPyAocHJvcC5pZCA9ICdpZC0nICsgVVVJRC5nZW5lcmF0ZSgpLHByb3ApIDp7IGlkOidpZC0nICsgVVVJRC5nZW5lcmF0ZSgpfTtcclxuXHRcdH1cclxuXHRcdHRoaXMuaWQgPSBwcm9wLmlkO1xyXG5cdFx0c2VsID0gc2VsIHx8IGQzLnNlbGVjdCgnI2NvbnRlbnQnKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uID0gXHJcblx0XHRzZWxcclxuXHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHQuYXR0cihwcm9wKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywncGFuZWwnKVxyXG5cdFx0LmRhdHVtKHRoaXMpO1xyXG5cclxuXHRcdC8vIOODkeODjeODq+eUqERyYWfjgZ3jga7ku5ZcclxuXHJcblx0XHR0aGlzLmhlYWRlciA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnaGVhZGVyJykuY2FsbCh0aGlzLmRyYWcpO1xyXG5cdFx0dGhpcy5hcnRpY2xlID0gdGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdhcnRpY2xlJyk7XHJcblx0XHR0aGlzLmZvb3RlciA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnZm9vdGVyJyk7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2RpdicpXHJcblx0XHQuY2xhc3NlZCgncGFuZWwtY2xvc2UnLHRydWUpXHJcblx0XHQub24oJ2NsaWNrJywoKT0+e1xyXG5cdFx0XHR0aGlzLmVtaXQoJ2Rpc3Bvc2UnKTtcclxuXHRcdFx0dGhpcy5kaXNwb3NlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0fVx0XHJcblxyXG5cdGdldCBub2RlKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc2VsZWN0aW9uLm5vZGUoKTtcclxuXHR9XHJcblx0Z2V0IHggKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnbGVmdCcpKTtcclxuXHR9XHJcblx0c2V0IHggKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2xlZnQnLHYgKyAncHgnKTtcclxuXHR9XHJcblx0Z2V0IHkgKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgndG9wJykpO1xyXG5cdH1cclxuXHRzZXQgeSAodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndG9wJyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCB3aWR0aCgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3dpZHRoJykpO1xyXG5cdH1cclxuXHRzZXQgd2lkdGgodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnd2lkdGgnLCB2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCBoZWlnaHQoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdoZWlnaHQnKSk7XHJcblx0fVxyXG5cdHNldCBoZWlnaHQodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnaGVpZ2h0Jyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdFxyXG5cdGRpc3Bvc2UoKXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlbW92ZSgpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRzaG93KCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScsJ3Zpc2libGUnKTtcclxuXHRcdHRoaXMuZW1pdCgnc2hvdycpO1xyXG5cdH1cclxuXHJcblx0aGlkZSgpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtcclxuXHRcdHRoaXMuZW1pdCgnaGlkZScpO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgaXNTaG93KCl7XHJcblx0XHRyZXR1cm4gdGhpcy5zZWxlY3Rpb24gJiYgdGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknKSA9PT0gJ3Zpc2libGUnO1xyXG5cdH1cclxufVxyXG5cclxuUGFuZWwucHJvdG90eXBlLmRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHRcdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdFx0Y29uc29sZS5sb2coZCk7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KCcjJyArIGQuaWQpO1xyXG5cdFx0XHJcblx0XHRkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHQuYXR0cih7aWQ6J3BhbmVsLWR1bW15LScgKyBkLmlkLFxyXG5cdFx0XHQnY2xhc3MnOidwYW5lbCBwYW5lbC1kdW1teSd9KVxyXG5cdFx0LnN0eWxlKHtcclxuXHRcdFx0bGVmdDpzZWwuc3R5bGUoJ2xlZnQnKSxcclxuXHRcdFx0dG9wOnNlbC5zdHlsZSgndG9wJyksXHJcblx0XHRcdHdpZHRoOnNlbC5zdHlsZSgnd2lkdGgnKSxcclxuXHRcdFx0aGVpZ2h0OnNlbC5zdHlsZSgnaGVpZ2h0JylcclxuXHRcdH0pO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIGR1bW15ID0gZDMuc2VsZWN0KCcjcGFuZWwtZHVtbXktJyArIGQuaWQpO1xyXG5cclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkdW1teS5zdHlsZSgnbGVmdCcpKSArIGQzLmV2ZW50LmR4O1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGR1bW15LnN0eWxlKCd0b3AnKSkgKyBkMy5ldmVudC5keTtcclxuXHRcdFxyXG5cdFx0ZHVtbXkuc3R5bGUoeydsZWZ0Jzp4ICsgJ3B4JywndG9wJzp5ICsgJ3B4J30pO1xyXG5cdH0pXHJcblx0Lm9uKCdkcmFnZW5kJyxmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QoJyMnICsgZC5pZCk7XHJcblx0XHR2YXIgZHVtbXkgPSBkMy5zZWxlY3QoJyNwYW5lbC1kdW1teS0nICsgZC5pZCk7XHJcblx0XHRzZWwuc3R5bGUoXHJcblx0XHRcdHsnbGVmdCc6ZHVtbXkuc3R5bGUoJ2xlZnQnKSwndG9wJzpkdW1teS5zdHlsZSgndG9wJyl9XHJcblx0XHQpO1xyXG5cdFx0ZC5lbWl0KCdkcmFnZW5kJyk7XHJcblx0XHRkdW1teS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHRcclxuIiwiLypcbiBWZXJzaW9uOiBjb3JlLTEuMFxuIFRoZSBNSVQgTGljZW5zZTogQ29weXJpZ2h0IChjKSAyMDEyIExpb3NLLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFVVSUQoKXt9VVVJRC5nZW5lcmF0ZT1mdW5jdGlvbigpe3ZhciBhPVVVSUQuX2dyaSxiPVVVSUQuX2hhO3JldHVybiBiKGEoMzIpLDgpK1wiLVwiK2IoYSgxNiksNCkrXCItXCIrYigxNjM4NHxhKDEyKSw0KStcIi1cIitiKDMyNzY4fGEoMTQpLDQpK1wiLVwiK2IoYSg0OCksMTIpfTtVVUlELl9ncmk9ZnVuY3Rpb24oYSl7cmV0dXJuIDA+YT9OYU46MzA+PWE/MHxNYXRoLnJhbmRvbSgpKigxPDxhKTo1Mz49YT8oMHwxMDczNzQxODI0Kk1hdGgucmFuZG9tKCkpKzEwNzM3NDE4MjQqKDB8TWF0aC5yYW5kb20oKSooMTw8YS0zMCkpOk5hTn07VVVJRC5faGE9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9YS50b1N0cmluZygxNiksZD1iLWMubGVuZ3RoLGU9XCIwXCI7MDxkO2Q+Pj49MSxlKz1lKWQmMSYmKGM9ZStjKTtyZXR1cm4gY307XG4iXX0=
