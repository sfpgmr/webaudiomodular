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
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _audioNodeView = require('./audioNodeView');

var _loop = function _loop(_key4) {
  if (_key4 === "default") return 'continue';
  Object.defineProperty(exports, _key4, {
    enumerable: true,
    get: function get() {
      return _audioNodeView[_key4];
    }
  });
};

for (var _key4 in _audioNodeView) {
  var _ret = _loop(_key4);

  if (_ret === 'continue') continue;
}

var _eg = require('./eg');

var _loop2 = function _loop2(_key5) {
  if (_key5 === "default") return 'continue';
  Object.defineProperty(exports, _key5, {
    enumerable: true,
    get: function get() {
      return _eg[_key5];
    }
  });
};

for (var _key5 in _eg) {
  var _ret2 = _loop2(_key5);

  if (_ret2 === 'continue') continue;
}

var _sequencer = require('./sequencer');

var _loop3 = function _loop3(_key6) {
  if (_key6 === "default") return 'continue';
  Object.defineProperty(exports, _key6, {
    enumerable: true,
    get: function get() {
      return _sequencer[_key6];
    }
  });
};

for (var _key6 in _sequencer) {
  var _ret3 = _loop3(_key6);

  if (_ret3 === 'continue') continue;
}

exports.dummy = dummy;
function dummy() {}

},{"./audioNodeView":3,"./eg":5,"./sequencer":9}],3:[function(require,module,exports){
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

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var counter = 0;
var ctx = exports.ctx = undefined;
function setCtx(c) {
	exports.ctx = ctx = c;
}

var NodeViewBase = exports.NodeViewBase = function NodeViewBase() {
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

var STATUS_PLAY_NOT_PLAYED = exports.STATUS_PLAY_NOT_PLAYED = 0;
var STATUS_PLAY_PLAYING = exports.STATUS_PLAY_PLAYING = 1;
var STATUS_PLAY_PLAYED = exports.STATUS_PLAY_PLAYED = 2;

function defIsNotAPIObj(this_, v) {
	Object.defineProperty(this_, 'isNotAPIObj', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: v
	});
}

var AudioParamView = exports.AudioParamView = (function (_NodeViewBase) {
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

var ParamView = exports.ParamView = (function (_NodeViewBase2) {
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

var AudioNodeView = exports.AudioNodeView = (function (_NodeViewBase3) {
	_inherits(AudioNodeView, _NodeViewBase3);

	function AudioNodeView(audioNode, editor) {
		_classCallCheck(this, AudioNodeView);

		var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioNodeView).call(this)); // audioNode はベースとなるノード

		_this3.id = counter++;
		_this3.audioNode = audioNode;
		_this3.name = audioNode.constructor.toString().match(/function\s(.*)\(/)[1];
		_this3.inputParams = [];
		_this3.outputParams = [];
		_this3.params = [];
		var inputCy = 1,
		    outputCy = 1;

		_this3.removable = true;

		// プロパティ・メソッドの複製
		for (var i in audioNode) {
			if (typeof audioNode[i] === 'function') {
				//				this[i] = audioNode[i].bind(audioNode);
			} else {
					if (_typeof(audioNode[i]) === 'object') {
						if (audioNode[i] instanceof AudioParam) {
							_this3[i] = new AudioParamView(_this3, i, audioNode[i]);
							_this3.inputParams.push(_this3[i]);
							_this3.params.push((function (p) {
								return {
									name: i,
									'get': function get() {
										return p.audioParam.value;
									},
									'set': function set(v) {
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

AudioNodeView.audioNodes = [];
AudioNodeView.audioConnections = [];

},{"./ui":10}],4:[function(require,module,exports){
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
			    top = node.y - node.height / 2 + bbox.y,
			    right = node.x - node.width / 2 + bbox.x + bbox.width,
			    bottom = node.y - node.height / 2 + bbox.y + bbox.height;
			if (targetX >= left && targetX <= right && targetY >= top && targetY <= bottom) {
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

},{"./audio":2,"./sequenceEditor":8,"./ui.js":10}],5:[function(require,module,exports){
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

var EG = exports.EG = (function () {
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
module.exports = exports['default'];

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.defObservable = defObservable;
function defObservable(target, propName) {
	var opt = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

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

var SequenceEditor = exports.SequenceEditor = (function () {
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
		div.append('input').datum(sequencer).attr({ 'type': 'text', 'size': '3', 'value': function value(d) {
				return sequencer.audioNode.beat;
			} }).on('change', function (d) {
			sequencer.audioNode.beat = parseFloat(d3.select(_this2).attr('value'), 10);
		});

		div.append('span').text(' / ');
		div.append('input').datum(sequencer).attr({ 'type': 'text', 'size': '3', 'value': function value(d) {
				return sequencer.audioNode.bar;
			} }).on('change', function (d) {
			sequencer.audioNode.bar = parseFloat(d3.select(_this2).attr('value'), 10);
		});

		var trackEdit = editor.selectAll('div.track').data(sequencer.audioNode.tracks).enter().append('div').classed('track', true);
		var trackHeader = trackEdit.append('div').classed('track-header', true);
		trackHeader.append('span').text(function (d, i) {
			return 'TR:' + (i + 1);
		});
		trackHeader.append('span').text('MEAS:');
		var trackBody = trackEdit.append('div').classed('track-body', true);
		var eventEdit = trackBody.append('table');
		var headrow = eventEdit.append('thead').append('tr');
		headrow.append('th').text('M#');
		headrow.append('th').text('S#');
		headrow.append('th').text('NT');
		headrow.append('th').text('N#');
		headrow.append('th').text('ST');
		headrow.append('th').text('GT');
		headrow.append('th').text('VE');
		headrow.append('th').text('CO');
		var eventBody = eventEdit.append('tbody');
		this.drawEvents(eventBody);

		for (var i = 0; i < 39; ++i) {
			eventBody.append('tr');
		}
		// sequencer.panel.on('show',()=>{
		// 	d3.select('#time-base').node().focus();
		// 	d3.select(window).on('keydown',()=>{
		// 		console.log(d3.event.keyCode);
		// 		d3.event.preventDefault();
		// 		d3.event.cancelBubble = true;
		// 		return false;
		// 	});	
		// });
		//
		// sequencer.panel.on('hide',()=>{
		// 	d3.select(window).on('keydown',null);
		// });
		//
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

function showSequenceEditor(d) {
	d3.event.returnValue = false;
	d3.event.preventDefault();
	d3.event.cancelBubble = true;
	if (d.panel && d.panel.isShow) return;
	if (d.editor && d.panel) {
		d.panel.show();
	}
	d.editor = new SequenceEditor(d);
}

function setInput() {
	this.attr('contentEditable', 'true').on('DOMCharacterDataModified', function () {
		console.log(d3.event);
	}).on('keydown', function () {
		switch (d3.event.keyCode) {
			case 13:
				{
					var next = d3.select(this).node().nextSibling;
					if (next) next.focus();
					d3.event.preventDefault();return false;
				}
				break;
		}
	});
}

},{"./audio":2,"./ui":10}],9:[function(require,module,exports){
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

var EventBase = exports.EventBase = function EventBase(step) {
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

var Command = exports.Command = function Command() {
	var pitchCommand = arguments.length <= 0 || arguments[0] === undefined ? setValueAtTime : arguments[0];
	var velocityCommand = arguments.length <= 1 || arguments[1] === undefined ? setValueAtTime : arguments[1];

	_classCallCheck(this, Command);

	this.processPitch = pitchCommand.bind(this);
	this.processVelocity = velocityCommand.bind(this);
};

var EventType = exports.EventType = {
	Note: 1,
	Measure: 2
};

var Measure = exports.Measure = (function (_EventBase) {
	_inherits(Measure, _EventBase);

	function Measure() {
		_classCallCheck(this, Measure);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Measure).call(this, 0));

		_this.type = EventType.Measure;
		return _this;
	}

	return Measure;
})(EventBase);

var NoteEvent = exports.NoteEvent = (function (_EventBase2) {
	_inherits(NoteEvent, _EventBase2);

	function NoteEvent() {
		var step = arguments.length <= 0 || arguments[0] === undefined ? 96 : arguments[0];
		var note = arguments.length <= 1 || arguments[1] === undefined ? 64 : arguments[1];
		var gate = arguments.length <= 2 || arguments[2] === undefined ? 48 : arguments[2];
		var vel = arguments.length <= 3 || arguments[3] === undefined ? 1.0 : arguments[3];
		var command = arguments.length <= 4 || arguments[4] === undefined ? new Command() : arguments[4];

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
	}, {
		key: 'transpose',
		set: function set(v) {
			if (v != this.transpose_) {
				this.transpose_ = v;
				this.calcPitch();
			}
		}
	}]);

	return NoteEvent;
})(EventBase);

var Track = exports.Track = (function (_EventEmitter) {
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

var SEQ_STATUS = exports.SEQ_STATUS = {
	STOPPED: 0,
	PLAYING: 1,
	PAUSED: 2
};

var NUM_OF_TRACKS = exports.NUM_OF_TRACKS = 4;

var Sequencer = exports.Sequencer = (function (_EventEmitter2) {
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
})(_eventEmitter2.default);

Sequencer.sequencers = [];
Sequencer.sequencers.status = SEQ_STATUS.STOPPED;

},{"./audio":2,"./eventEmitter3":6,"./prop":7}],10:[function(require,module,exports){
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

var nodeHeight = exports.nodeHeight = 50;
var nodeWidth = exports.nodeWidth = 100;
var pointSize = exports.pointSize = 16;

// panel window

var Panel = exports.Panel = (function (_EventEmitter) {
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
	dummy.remove();
});

},{"./EventEmitter3":1,"./uuid.core":11}],11:[function(require,module,exports){
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
  for (var c = a.toString(16), d = b - c.length, e = "0"; 0 < d; d >>>= 1, e += e) {
    d & 1 && (c = e + c);
  }return c;
};
module.exports = exports['default'];

},{}],12:[function(require,module,exports){
"use strict";

var _audio = require('../src/audio');

var audio = _interopRequireWildcard(_audio);

var _draw = require('../src/draw');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('AudioNodeTest', function () {
	audio.ctx = new AudioContext();
	var osc, gain, filter, out, osc2, splitter, merger, eg, seq;

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
		eg.x = 100;
		eg.y = 400;
		seq = audio.AudioNodeView.create(new audio.Sequencer());
		seq.x = 200;
		seq.y = 400;

		expect(audio.AudioNodeView.audioNodes.length).toEqual(9);
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
		audio.AudioNodeView.connect({ node: seq, param: seq.trk0g }, { node: eg, param: eg.gate });

		expect(audio.AudioNodeView.audioConnections.length).toEqual(14);
	});

	it('ノード削除', function () {
		audio.AudioNodeView.remove(osc);
		audio.AudioNodeView.remove(seq);
		expect(audio.AudioNodeView.audioNodes.length).toEqual(7);
		expect(audio.AudioNodeView.audioConnections.length).toEqual(11);
		expect(audio.Sequencer.sequencers.length).toEqual(0);
	});

	it('コネクション削除', function () {
		audio.AudioNodeView.disconnect({ node: eg, param: eg.output }, { node: gain, param: gain.inputParams[0] });
		audio.AudioNodeView.disconnect({ node: splitter, param: 0 }, { node: merger, param: 0 });
		audio.AudioNodeView.disconnect({ node: splitter, param: 1 }, { node: merger, param: 1 });
		audio.AudioNodeView.disconnect({ node: splitter, param: 2 }, { node: merger, param: 3 });
		audio.AudioNodeView.disconnect({ node: splitter, param: 3 }, { node: merger, param: 2 });
		audio.AudioNodeView.disconnect({ node: splitter, param: 5 }, { node: merger, param: 5 });
		audio.AudioNodeView.disconnect({ node: splitter, param: 4 }, { node: merger, param: 4 });

		expect(audio.AudioNodeView.audioConnections.length).toEqual(4);
	});

	it('フィルター削除後チェック', function () {
		audio.AudioNodeView.remove(filter);
		expect(audio.AudioNodeView.audioNodes.length).toEqual(6);
		expect(audio.AudioNodeView.audioConnections.length).toEqual(3);
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

	it('ノード全削除', function () {
		audio.AudioNodeView.remove(eg);
		audio.AudioNodeView.remove(gain);
		audio.AudioNodeView.remove(out);
		audio.AudioNodeView.remove(splitter);
		audio.AudioNodeView.remove(merger);
		audio.AudioNodeView.remove(osc2);
		expect(audio.AudioNodeView.audioNodes.length).toEqual(0);
	});

	it('描画してみる', function () {
		//	osc.audioNode.type = 'sawtooth';

		var content = d3.select('body').append('div').attr('id', 'content').classed('content', true);
		var player = content.append('div').attr({ id: 'player', class: 'player' });
		player.append('button').attr({ id: 'play', class: 'play' }).text('▼');
		player.append('button').attr({ id: 'stop', class: 'stop' }).text('■');
		player.append('button').attr({ id: 'pause', class: 'pause' }).text('＝');

		(0, _draw.initUI)();

		// コネクション

		var out = audio.AudioNodeView.audioNodes[0];
		var osc = (0, _draw.createAudioNodeView)('Oscillator');
		osc.x = 400;
		osc.y = 300;
		var gain = (0, _draw.createAudioNodeView)('Gain');
		gain.x = 550;
		gain.y = 200;
		var seq = (0, _draw.createAudioNodeView)('Sequencer');
		seq.x = 50;
		seq.y = 300;
		var eg = (0, _draw.createAudioNodeView)('EG');
		eg.x = 200;
		eg.y = 200;

		// 接続

		audio.AudioNodeView.connect({ node: seq, param: seq.trk0g }, { node: eg, param: eg.gate });
		audio.AudioNodeView.connect({ node: seq, param: seq.trk0p }, { node: osc, param: osc.frequency });
		audio.AudioNodeView.connect({ node: osc, param: 0 }, { node: gain, param: 0 });
		audio.AudioNodeView.connect({ node: eg, param: eg.output }, { node: gain, param: gain.gain });
		audio.AudioNodeView.connect({ node: gain, param: 0 }, { node: out, param: 0 });

		// コネクション

		var out1 = audio.AudioNodeView.audioNodes[0];
		var osc1 = (0, _draw.createAudioNodeView)('Oscillator');
		osc1.x = 400;
		osc1.y = 500;
		var gain1 = (0, _draw.createAudioNodeView)('Gain');
		gain1.x = 550;
		gain1.y = 400;
		var eg1 = (0, _draw.createAudioNodeView)('EG');
		eg1.x = 200;
		eg1.y = 400;

		// 接続

		audio.AudioNodeView.connect({ node: seq, param: seq.trk1g }, { node: eg1, param: eg1.gate });
		audio.AudioNodeView.connect({ node: seq, param: seq.trk1p }, { node: osc1, param: osc1.frequency });
		audio.AudioNodeView.connect({ node: osc1, param: 0 }, { node: gain1, param: 0 });
		audio.AudioNodeView.connect({ node: eg1, param: eg1.output }, { node: gain1, param: gain1.gain });
		audio.AudioNodeView.connect({ node: gain1, param: 0 }, { node: out, param: 0 });

		// シーケンスデータの挿入
		seq.audioNode.bpm = 120;
		seq.audioNode.tracks[0].events.push(new audio.NoteEvent(48, 47, 6));
		for (var i = 48; i < 110; ++i) {
			seq.audioNode.tracks[0].events.push(new audio.NoteEvent(48, i, 6));
		}

		seq.audioNode.tracks[1].events.push(new audio.NoteEvent(192, 0, 6));
		for (var i = 47; i < 110; ++i) {
			seq.audioNode.tracks[1].events.push(new audio.NoteEvent(48, i, 6));
		}
		(0, _draw.draw)();
		expect(true).toBe(true);
	});
});

},{"../src/audio":2,"../src/draw":4}]},{},[12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXEV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGF1ZGlvLmpzIiwic3JjXFxhdWRpb05vZGVWaWV3LmpzIiwic3JjXFxkcmF3LmpzIiwic3JjXFxlZy5qcyIsInNyY1xcZXZlbnRFbWl0dGVyMy5qcyIsInNyY1xccHJvcC5qcyIsInNyY1xcc2VxdWVuY2VFZGl0b3IuanMiLCJzcmNcXHNlcXVlbmNlci5qcyIsInNyY1xcdWkuanMiLCJzcmNcXHV1aWQuY29yZS5qcyIsInRlc3RcXGF1ZGlvTm9kZVRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7OztBQUFZLENBQUM7Ozs7a0JBaUNXLFlBQVk7QUF2QnBDLElBQUksTUFBTSxHQUFHLE9BQU8sTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVLEdBQUcsR0FBRyxHQUFHLEtBQUs7Ozs7Ozs7Ozs7QUFBQyxBQVUvRCxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtBQUM3QixNQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNiLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQztDQUMzQjs7Ozs7Ozs7O0FBQUEsQUFTYyxTQUFTLFlBQVksR0FBRzs7Ozs7Ozs7QUFBd0IsQUFRL0QsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUzs7Ozs7Ozs7OztBQUFDLEFBVTNDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDbkUsTUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSztNQUNyQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVsRCxNQUFJLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDL0IsTUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUMxQixNQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFeEMsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkUsTUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDekI7O0FBRUQsU0FBTyxFQUFFLENBQUM7Q0FDWDs7Ozs7Ozs7O0FBQUMsQUFTRixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtBQUNyRSxNQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEtBQUssQ0FBQzs7QUFFdEQsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7TUFDN0IsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNO01BQ3RCLElBQUk7TUFDSixDQUFDLENBQUM7O0FBRU4sTUFBSSxVQUFVLEtBQUssT0FBTyxTQUFTLENBQUMsRUFBRSxFQUFFO0FBQ3RDLFFBQUksU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFOUUsWUFBUSxHQUFHO0FBQ1QsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzlELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDbEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDdEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsS0FDL0U7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7QUFFRCxhQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07QUFDTCxRQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0FBRU4sU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsVUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVwRixjQUFRLEdBQUc7QUFDVCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzFELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzlELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUNsRTtBQUNFLGNBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUks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QUNOLEtBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDakMsS0FBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztHQUN2RDs7QUFFRCxHQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNwQixHQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsTUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkMsR0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUN2QixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQ1IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNkLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUM7RUFDM0MsQ0FBQyxDQUNELEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDeEIsR0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUNwQixHQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQ3BCLEdBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDcEQsQ0FBQyxDQUNELEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDM0IsTUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNuQixNQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRTs7O0FBQUMsQUFHbkIsTUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsT0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQztBQUN6QyxPQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsT0FBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3pCLE9BQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQzdCLE9BQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7T0FDMUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7T0FDdkMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSztPQUNyRCxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFN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LENBQUMsS0FBSyxFQUFDO0FBQ2YsT0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxLQUFLLENBQUMsU0FBUyxFQUFDO0FBQzFDLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDNUQsTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM1RCxNQUFNO0FBQ04sTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQzFGO0dBQ0QsTUFBTTtBQUNOLEtBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUMzQyxLQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FB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QyxDQUFDOztBQUU5RSxZQUFRLEdBQUc7QUFDVCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDOUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUNsRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUN0RSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxLQUMvRTs7QUFFRCxTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2xELFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztBQUVELGFBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtBQUNMLFFBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7QUFFTixTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQixVQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBGLGNBQVEsR0FBRztBQUNULGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDMUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDOUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQ2xFO0FBQ0UsY0FBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFD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QU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFFLENBQUM7QUFDMUMsTUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25FLE1BQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUMsTUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsTUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxNQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFD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R0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUE7Q0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxTQUFPLENBQUMsR0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLEVBQUUsSUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBRSxDQUFDLElBQUUsQ0FBQyxDQUFBLEFBQUMsR0FBQyxFQUFFLElBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVUsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUEsR0FBRSxVQUFVLElBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBRSxDQUFDLElBQUUsQ0FBQyxHQUFDLEVBQUUsQ0FBQSxBQUFDLENBQUEsQUFBQyxHQUFDLEdBQUcsQ0FBQTtDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxPQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLE1BQUksQ0FBQyxFQUFDLENBQUMsSUFBRSxDQUFDO0FBQUMsS0FBQyxHQUFDLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxBQUFDLENBQUM7R0FBQSxPQUFPLENBQUMsQ0FBQTtDQUFDLENBQUM7Ozs7QUNKM2EsWUFBWSxDQUFDOzs7O0lBQ0QsS0FBSzs7Ozs7O0FBSWpCLFFBQVEsQ0FBQyxlQUFlLEVBQUUsWUFBTTtBQUMvQixNQUFLLENBQUMsR0FBRyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7QUFDL0Is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QU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUV0RCxPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDMUMsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN6QyxPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFB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QUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ2pFO0FBQ0QsWUE3TGEsSUFBSSxHQTZMWCxDQUFDO0FBQ1AsUUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUN4QixDQUFDLENBQUM7Q0FLSCxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL1xuLy8gV2Ugc3RvcmUgb3VyIEVFIG9iamVjdHMgaW4gYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3Jcbi8vIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxuLy9cbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICAgLCBqO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIGxpc3RlbmVycyBtYXRjaGluZyB0aGlzIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgICBpZiAoXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVycy5vbmNlKVxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXG4gICAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgICApIHtcbiAgICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAvL1xuICBpZiAoZXZlbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW3ByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRdO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxuLy9cbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmV4cG9ydCAqIGZyb20gJy4vYXVkaW9Ob2RlVmlldyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZWcnO1xyXG5leHBvcnQgKiBmcm9tICcuL3NlcXVlbmNlcic7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZHVtbXkoKXt9IFxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aSc7XHJcblxyXG52YXIgY291bnRlciA9IDA7XHJcbmV4cG9ydCB2YXIgY3R4O1xyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q3R4KGMpe2N0eCA9IGM7fVxyXG5cclxuZXhwb3J0IGNsYXNzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoeCA9IDAsIHkgPSAwLHdpZHRoID0gdWkubm9kZVdpZHRoLGhlaWdodCA9IHVpLm5vZGVIZWlnaHQsbmFtZSA9ICcnKSB7XHJcblx0XHR0aGlzLnggPSB4IDtcclxuXHRcdHRoaXMueSA9IHkgO1xyXG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoIDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IDtcclxuXHRcdHRoaXMubmFtZSA9IG5hbWU7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgU1RBVFVTX1BMQVlfTk9UX1BMQVlFRCA9IDA7XHJcbmV4cG9ydCBjb25zdCBTVEFUVVNfUExBWV9QTEFZSU5HID0gMTtcclxuZXhwb3J0IGNvbnN0IFNUQVRVU19QTEFZX1BMQVlFRCA9IDI7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVmSXNOb3RBUElPYmoodGhpc18sdil7XHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXNfLCdpc05vdEFQSU9iaicse1xyXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcclxuXHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcclxuXHRcdFx0d3JpdGFibGU6ZmFsc2UsXHJcblx0XHRcdHZhbHVlOiB2XHJcblx0XHR9KTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEF1ZGlvUGFyYW1WaWV3IGV4dGVuZHMgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihBdWRpb05vZGVWaWV3LG5hbWUsIHBhcmFtKSB7XHJcblx0XHRzdXBlcigwLDAsdWkucG9pbnRTaXplLHVpLnBvaW50U2l6ZSxuYW1lKTtcclxuXHRcdHRoaXMuaWQgPSBjb3VudGVyKys7XHJcblx0XHR0aGlzLmF1ZGlvUGFyYW0gPSBwYXJhbTtcclxuXHRcdHRoaXMuQXVkaW9Ob2RlVmlldyA9IEF1ZGlvTm9kZVZpZXc7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUGFyYW1WaWV3IGV4dGVuZHMgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihBdWRpb05vZGVWaWV3LG5hbWUsaXNvdXRwdXQpIHtcclxuXHRcdHN1cGVyKDAsMCx1aS5wb2ludFNpemUsdWkucG9pbnRTaXplLG5hbWUpO1xyXG5cdFx0dGhpcy5pZCA9IGNvdW50ZXIrKztcclxuXHRcdHRoaXMuQXVkaW9Ob2RlVmlldyA9IEF1ZGlvTm9kZVZpZXc7XHJcblx0XHR0aGlzLmlzT3V0cHV0ID0gaXNvdXRwdXQgfHwgZmFsc2U7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQXVkaW9Ob2RlVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoYXVkaW9Ob2RlLGVkaXRvcikgeyAvLyBhdWRpb05vZGUg44Gv44OZ44O844K544Go44Gq44KL44OO44O844OJXHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5pZCA9IGNvdW50ZXIrKztcclxuXHRcdHRoaXMuYXVkaW9Ob2RlID0gYXVkaW9Ob2RlO1xyXG5cdFx0dGhpcy5uYW1lID0gYXVkaW9Ob2RlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL2Z1bmN0aW9uXFxzKC4qKVxcKC8pWzFdO1xyXG5cdFx0dGhpcy5pbnB1dFBhcmFtcyA9IFtdO1xyXG5cdFx0dGhpcy5vdXRwdXRQYXJhbXMgPSBbXTtcclxuXHRcdHRoaXMucGFyYW1zID0gW107XHJcblx0XHRsZXQgaW5wdXRDeSA9IDEsb3V0cHV0Q3kgPSAxO1xyXG5cdFx0XHJcblx0XHR0aGlzLnJlbW92YWJsZSA9IHRydWU7XHJcblx0XHRcclxuXHRcdC8vIOODl+ODreODkeODhuOCo+ODu+ODoeOCveODg+ODieOBruikh+ijvVxyXG5cdFx0Zm9yICh2YXIgaSBpbiBhdWRpb05vZGUpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBhdWRpb05vZGVbaV0gPT09ICdmdW5jdGlvbicpIHtcclxuLy9cdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV0uYmluZChhdWRpb05vZGUpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgYXVkaW9Ob2RlW2ldID09PSAnb2JqZWN0Jykge1xyXG5cdFx0XHRcdFx0aWYgKGF1ZGlvTm9kZVtpXSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW0pIHtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXSA9IG5ldyBBdWRpb1BhcmFtVmlldyh0aGlzLGksIGF1ZGlvTm9kZVtpXSk7XHJcblx0XHRcdFx0XHRcdHRoaXMuaW5wdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5wYXJhbXMucHVzaCgoKHApPT57XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0XHRcdG5hbWU6aSxcclxuXHRcdFx0XHRcdFx0XHRcdCdnZXQnOigpID0+IHAuYXVkaW9QYXJhbS52YWx1ZSxcclxuXHRcdFx0XHRcdFx0XHRcdCdzZXQnOih2KSA9PntwLmF1ZGlvUGFyYW0udmFsdWUgPSB2O30sXHJcblx0XHRcdFx0XHRcdFx0XHRwYXJhbTpwLFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZTp0aGlzXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KSh0aGlzW2ldKSk7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0ueSA9ICgyMCAqIGlucHV0Q3krKyk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYoYXVkaW9Ob2RlW2ldIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdFx0YXVkaW9Ob2RlW2ldLkF1ZGlvTm9kZVZpZXcgPSB0aGlzO1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldID0gYXVkaW9Ob2RlW2ldO1xyXG5cdFx0XHRcdFx0XHRpZih0aGlzW2ldLmlzT3V0cHV0KXtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnkgPSAoMjAgKiBvdXRwdXRDeSsrKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnggPSB0aGlzLndpZHRoO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMub3V0cHV0UGFyYW1zLnB1c2godGhpc1tpXSk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpc1tpXS55ID0gKDIwICogaW5wdXRDeSsrKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmlucHV0UGFyYW1zLnB1c2godGhpc1tpXSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihBdWRpb05vZGUucHJvdG90eXBlLCBpKTtcdFxyXG5cdFx0XHRcdFx0aWYoIWRlc2Mpe1xyXG5cdFx0XHRcdFx0XHRkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLmF1ZGlvTm9kZS5fX3Byb3RvX18sIGkpO1x0XHJcblx0XHRcdFx0XHR9IFxyXG5cdFx0XHRcdFx0aWYoIWRlc2Mpe1xyXG5cdFx0XHRcdFx0XHRkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLmF1ZGlvTm9kZSxpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHZhciBwcm9wcyA9IHt9O1xyXG5cclxuLy9cdFx0XHRcdFx0aWYoZGVzYy5nZXQpe1xyXG5cdFx0XHRcdFx0XHRcdHByb3BzLmdldCA9ICgoaSkgPT4gdGhpcy5hdWRpb05vZGVbaV0pLmJpbmQobnVsbCwgaSk7XHJcbi8vXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoZGVzYy53cml0YWJsZSB8fCBkZXNjLnNldCl7XHJcblx0XHRcdFx0XHRcdHByb3BzLnNldCA9ICgoaSwgdikgPT4geyB0aGlzLmF1ZGlvTm9kZVtpXSA9IHY7IH0pLmJpbmQobnVsbCwgaSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHByb3BzLmVudW1lcmFibGUgPSBkZXNjLmVudW1lcmFibGU7XHJcblx0XHRcdFx0XHRwcm9wcy5jb25maWd1cmFibGUgPSBkZXNjLmNvbmZpZ3VyYWJsZTtcclxuXHRcdFx0XHRcdC8vcHJvcHMud3JpdGFibGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdC8vcHJvcHMud3JpdGFibGUgPSBkZXNjLndyaXRhYmxlO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaSxwcm9wcyk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHByb3BzLm5hbWUgPSBpO1xyXG5cdFx0XHRcdFx0cHJvcHMubm9kZSA9IHRoaXM7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKGRlc2MuZW51bWVyYWJsZSAmJiAhaS5tYXRjaCgvKC4qXyQpfChuYW1lKXwoXm51bWJlck9mLiokKS9pKSAmJiAodHlwZW9mIGF1ZGlvTm9kZVtpXSkgIT09ICdBcnJheScpe1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBhcmFtcy5wdXNoKHByb3BzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmlucHV0U3RhcnRZID0gaW5wdXRDeSAqIDIwO1xyXG5cdFx0dmFyIGlucHV0SGVpZ2h0ID0gKGlucHV0Q3kgKyB0aGlzLm51bWJlck9mSW5wdXRzKSAqIDIwIDtcclxuXHRcdHZhciBvdXRwdXRIZWlnaHQgPSAob3V0cHV0Q3kgKyB0aGlzLm51bWJlck9mT3V0cHV0cykgKiAyMDtcclxuXHRcdHRoaXMub3V0cHV0U3RhcnRZID0gb3V0cHV0Q3kgKiAyMDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gTWF0aC5tYXgodGhpcy5oZWlnaHQsaW5wdXRIZWlnaHQsb3V0cHV0SGVpZ2h0KTtcclxuXHRcdHRoaXMudGVtcCA9IHt9O1xyXG5cdFx0dGhpcy5zdGF0dXNQbGF5ID0gU1RBVFVTX1BMQVlfTk9UX1BMQVlFRDsvLyBub3QgcGxheWVkLlxyXG5cdFx0dGhpcy5wYW5lbCA9IG51bGw7XHJcblx0XHR0aGlzLmVkaXRvciA9IGVkaXRvci5iaW5kKHRoaXMsdGhpcyk7XHJcblx0fVxyXG5cdFxyXG5cdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdHN0YXRpYyByZW1vdmUobm9kZSkge1xyXG5cdFx0XHRpZighbm9kZS5yZW1vdmFibGUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ+WJiumZpOOBp+OBjeOBquOBhOODjuODvOODieOBp+OBmeOAgicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGlmIChBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXNbaV0gPT09IG5vZGUpIHtcclxuXHRcdFx0XHRcdGlmKG5vZGUuYXVkaW9Ob2RlLmRpc3Bvc2Upe1xyXG5cdFx0XHRcdFx0XHRub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMuc3BsaWNlKGktLSwgMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGxldCBuID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRcdGlmIChuLmZyb20ubm9kZSA9PT0gbm9kZSB8fCBuLnRvLm5vZGUgPT09IG5vZGUpIHtcclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdF8obik7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcblxyXG4gIC8vIFxyXG5cdHN0YXRpYyBkaXNjb25uZWN0Xyhjb24pIHtcclxuXHRcdGlmIChjb24uZnJvbS5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldykge1xyXG5cdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbik7XHJcblx0XHR9IGVsc2UgaWYgKGNvbi50by5wYXJhbSkge1xyXG5cdFx0XHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRpZiAoY29uLnRvLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpIHtcclxuXHRcdFx0XHQvLyBBVWRpb1BhcmFtXHJcblx0XHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtKSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5wYXJhbS5hdWRpb1BhcmFtLCBjb24uZnJvbS5wYXJhbSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLnBhcmFtLmF1ZGlvUGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBjb24udG8ucGFyYW3jgYzmlbDlrZdcclxuXHRcdFx0XHRpZiAoY29uLmZyb20ucGFyYW0pIHtcclxuXHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldykge1xyXG5cdFx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbik7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0cnkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlLCBjb24uZnJvbS5wYXJhbSwgY29uLnRvLnBhcmFtKTtcclxuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGUpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlLCAwLCBjb24udG8ucGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gdG8g44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSkge1xyXG5cdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSwgY29uLmZyb20ucGFyYW0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g44Kz44ON44Kv44K344On44Oz44Gu5o6l57aa44KS6Kej6Zmk44GZ44KLXHJcblx0c3RhdGljIGRpc2Nvbm5lY3QoZnJvbV8sdG9fKSB7XHJcblx0XHRcdGlmKGZyb21fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyl7XHJcblx0XHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tX307XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdGlmKGZyb21fIGluc3RhbmNlb2YgUGFyYW1WaWV3ICl7XHJcblx0XHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tXy5BdWRpb05vZGVWaWV3LHBhcmFtOmZyb21ffTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYodG9fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyl7XHJcblx0XHRcdFx0dG9fID0ge25vZGU6dG9ffTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYodG9fIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX31cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYodG9fIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHZhciBjb24gPSB7J2Zyb20nOmZyb21fLCd0byc6dG9ffTtcclxuXHRcdFx0XHJcblx0XHRcdC8vIOOCs+ODjeOCr+OCt+ODp+ODs+OBruWJiumZpFxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGxldCBuID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRcdGlmKGNvbi5mcm9tLm5vZGUgPT09IG4uZnJvbS5ub2RlICYmIGNvbi5mcm9tLnBhcmFtID09PSBuLmZyb20ucGFyYW0gXHJcblx0XHRcdFx0XHQmJiBjb24udG8ubm9kZSA9PT0gbi50by5ub2RlICYmIGNvbi50by5wYXJhbSA9PT0gbi50by5wYXJhbSl7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdF8oY29uKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdH1cclxuXHJcblx0c3RhdGljIGNyZWF0ZShhdWRpb25vZGUsZWRpdG9yID0gKCk9Pnt9KSB7XHJcblx0XHR2YXIgb2JqID0gbmV3IEF1ZGlvTm9kZVZpZXcoYXVkaW9ub2RlLGVkaXRvcik7XHJcblx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMucHVzaChvYmopO1xyXG5cdFx0cmV0dXJuIG9iajtcclxuXHR9XHJcblx0XHJcbiAgLy8g44OO44O844OJ6ZaT44Gu5o6l57aaXHJcblx0c3RhdGljIGNvbm5lY3QoZnJvbV8sIHRvXykge1xyXG5cdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3ICl7XHJcblx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8scGFyYW06MH07XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRmcm9tXyA9IHtub2RlOmZyb21fLkF1ZGlvTm9kZVZpZXcscGFyYW06ZnJvbV99O1xyXG5cdFx0fVxyXG5cclxuXHRcdFxyXG5cdFx0aWYodG9fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyl7XHJcblx0XHRcdHRvXyA9IHtub2RlOnRvXyxwYXJhbTowfTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYodG9fIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZih0b18gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199O1xyXG5cdFx0fVxyXG5cdFx0Ly8g5a2Y5Zyo44OB44Kn44OD44KvXHJcblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcclxuXHRcdFx0dmFyIGMgPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnNbaV07XHJcblx0XHRcdGlmIChjLmZyb20ubm9kZSA9PT0gZnJvbV8ubm9kZSBcclxuXHRcdFx0XHQmJiBjLmZyb20ucGFyYW0gPT09IGZyb21fLnBhcmFtXHJcblx0XHRcdFx0JiYgYy50by5ub2RlID09PSB0b18ubm9kZVxyXG5cdFx0XHRcdCYmIGMudG8ucGFyYW0gPT09IHRvXy5wYXJhbVxyXG5cdFx0XHRcdCkgXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0cmV0dXJuO1xyXG4vL1x0XHRcdFx0dGhyb3cgKG5ldyBFcnJvcign5o6l57aa44GM6YeN6KSH44GX44Gm44GE44G+44GZ44CCJykpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIOaOpee2muWFiOOBjFBhcmFtVmlld+OBruWgtOWQiOOBr+aOpee2muWFg+OBr1BhcmFtVmlld+OBruOBv1xyXG5cdFx0aWYodG9fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3ICYmICEoZnJvbV8ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpKXtcclxuXHRcdCAgcmV0dXJuIDtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gUGFyYW1WaWV344GM5o6l57aa5Y+v6IO944Gq44Gu44GvQXVkaW9QYXJhbeOBi+OCiVBhcmFtVmlld+OBruOBv1xyXG5cdFx0aWYoZnJvbV8ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRpZighKHRvXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyB8fCB0b18ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldykpe1xyXG5cdFx0XHRcdHJldHVybjtcdFxyXG5cdFx0XHR9XHJcblx0XHR9IFxyXG5cdFx0XHJcblx0XHRpZiAoZnJvbV8ucGFyYW0pIHtcclxuXHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0ICBpZihmcm9tXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0ICBmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHsnZnJvbSc6ZnJvbV8sJ3RvJzp0b199KTtcclxuLy9cdFx0XHRcdGZyb21fLm5vZGUuY29ubmVjdFBhcmFtKGZyb21fLnBhcmFtLHRvXyk7XHJcblx0XHRcdH0gZWxzZSBpZiAodG9fLnBhcmFtKSBcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0aWYodG9fLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0Ly8gQXVkaW9QYXJhbeOBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ucGFyYW0uYXVkaW9QYXJhbSxmcm9tXy5wYXJhbSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdC8vIOaVsOWtl+OBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUsIGZyb21fLnBhcmFtLHRvXy5wYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUsZnJvbV8ucGFyYW0pO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdGlmICh0b18ucGFyYW0pIHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdC8vIEF1ZGlvUGFyYW3jga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLnBhcmFtLmF1ZGlvUGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZXtcclxuXHRcdFx0XHRcdC8vIOaVsOWtl+OBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUsMCx0b18ucGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvL3Rocm93IG5ldyBFcnJvcignQ29ubmVjdGlvbiBFcnJvcicpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMucHVzaFxyXG5cdFx0KHtcclxuXHRcdFx0J2Zyb20nOiBmcm9tXyxcclxuXHRcdFx0J3RvJzogdG9fXHJcblx0XHR9KTtcclxuXHR9XHJcbn1cclxuXHJcbkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2RlcyA9IFtdO1xyXG5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMgPSBbXTtcclxuXHJcblxyXG4iLCJpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aS5qcyc7XHJcbmltcG9ydCB7c2hvd1NlcXVlbmNlRWRpdG9yfSBmcm9tICcuL3NlcXVlbmNlRWRpdG9yJztcclxuXHJcbmV4cG9ydCB2YXIgc3ZnO1xyXG4vL2FhXHJcbnZhciBub2RlR3JvdXAsIGxpbmVHcm91cDtcclxudmFyIGRyYWc7XHJcbnZhciBkcmFnT3V0O1xyXG52YXIgZHJhZ1BhcmFtO1xyXG52YXIgZHJhZ1BhbmVsO1xyXG5cclxudmFyIG1vdXNlQ2xpY2tOb2RlO1xyXG52YXIgbW91c2VPdmVyTm9kZTtcclxudmFyIGxpbmU7XHJcbnZhciBhdWRpb05vZGVDcmVhdG9ycyA9IFtdO1xyXG5cclxuLy8gRHJhd+OBruWIneacn+WMllxyXG5leHBvcnQgZnVuY3Rpb24gaW5pdFVJKCl7XHJcblx0Ly8g5Ye65Yqb44OO44O844OJ44Gu5L2c5oiQ77yI5YmK6Zmk5LiN5Y+v77yJXHJcblx0dmFyIG91dCA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5kZXN0aW5hdGlvbixzaG93UGFuZWwpO1xyXG5cdG91dC54ID0gd2luZG93LmlubmVyV2lkdGggLyAyO1xyXG5cdG91dC55ID0gd2luZG93LmlubmVySGVpZ2h0IC8gMjtcclxuXHRvdXQucmVtb3ZhYmxlID0gZmFsc2U7XHJcblx0XHJcblx0Ly8g44OX44Os44Kk44Ok44O8XHJcblx0YXVkaW8uU2VxdWVuY2VyLmFkZGVkID0gKCk9PlxyXG5cdHtcclxuXHRcdGlmKGF1ZGlvLlNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aCA9PSAxICYmIGF1ZGlvLlNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PT0gYXVkaW8uU0VRX1NUQVRVUy5TVE9QUEVEKXtcclxuXHRcdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHRcdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGF1ZGlvLlNlcXVlbmNlci5lbXB0eSA9ICgpPT57XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIuc3RvcFNlcXVlbmNlcygpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHR9IFxyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3BsYXknKVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIuc3RhcnRTZXF1ZW5jZXMoYXVkaW8uY3R4LmN1cnJlbnRUaW1lKTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fSk7XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5vbignY2xpY2snLGZ1bmN0aW9uKCl7XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIucGF1c2VTZXF1ZW5jZXMoKTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9KTtcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNzdG9wJykub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnN0b3BTZXF1ZW5jZXMoKTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fSk7XHJcblx0XHJcblx0YXVkaW8uU2VxdWVuY2VyLnN0b3BwZWQgPSAoKT0+e1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0Ly8gQXVkaW9Ob2Rl44OJ44Op44OD44Kw55SoXHJcblx0ZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKVxyXG5cdC5vcmlnaW4oZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQ7IH0pXHJcblx0Lm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0aWYoZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5zaGlmdEtleSl7XHJcblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ21vdXNldXAnKSk7XHRcdFx0XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGQudGVtcC54ID0gZC54O1xyXG5cdFx0ZC50ZW1wLnkgPSBkLnk7XHJcblx0XHRkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cih7aWQ6J2RyYWcnLHdpZHRoOmQud2lkdGgsaGVpZ2h0OmQuaGVpZ2h0LHg6MCx5OjAsJ2NsYXNzJzonYXVkaW9Ob2RlRHJhZyd9ICk7XHJcblx0fSlcclxuXHQub24oXCJkcmFnXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRpZihkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5IHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0ZC50ZW1wLnggKz0gZDMuZXZlbnQuZHg7XHJcblx0XHRkLnRlbXAueSArPSBkMy5ldmVudC5keTtcclxuXHRcdC8vZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIChkLnggLSBkLndpZHRoIC8gMikgKyAnLCcgKyAoZC55IC0gZC5oZWlnaHQgLyAyKSArICcpJyk7XHJcblx0XHQvL2RyYXcoKTtcclxuXHRcdHZhciBkcmFnQ3Vyc29sID0gZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSlcclxuXHRcdC5zZWxlY3QoJ3JlY3QjZHJhZycpO1xyXG5cdFx0dmFyIHggPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneCcpKSArIGQzLmV2ZW50LmR4O1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneScpKSArIGQzLmV2ZW50LmR5O1xyXG5cdFx0ZHJhZ0N1cnNvbC5hdHRyKHt4OngseTp5fSk7XHRcdFxyXG5cdH0pXHJcblx0Lm9uKCdkcmFnZW5kJyxmdW5jdGlvbihkKXtcclxuXHRcdGlmKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgZHJhZ0N1cnNvbCA9IGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpXHJcblx0XHQuc2VsZWN0KCdyZWN0I2RyYWcnKTtcclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3gnKSk7XHJcblx0XHR2YXIgeSA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd5JykpO1xyXG5cdFx0ZC54ID0gZC50ZW1wLng7XHJcblx0XHRkLnkgPSBkLnRlbXAueTtcclxuXHRcdGRyYWdDdXJzb2wucmVtb3ZlKCk7XHRcdFxyXG5cdFx0ZHJhdygpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdC8vIOODjuODvOODiemWk+aOpee2mueUqCBkcmFnIFxyXG5cdGRyYWdPdXQgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHQub3JpZ2luKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkOyB9KVxyXG5cdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdGxldCB4MSx5MTtcclxuXHRcdGlmKGQuaW5kZXgpe1xyXG5cdFx0XHRpZihkLmluZGV4IGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR4MSA9IGQubm9kZS54IC0gZC5ub2RlLndpZHRoIC8gMiArIGQuaW5kZXgueDtcclxuXHRcdFx0XHR5MSA9IGQubm9kZS55IC0gZC5ub2RlLmhlaWdodCAvMiArIGQuaW5kZXgueTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR4MSA9IGQubm9kZS54ICsgZC5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0XHR5MSA9IGQubm9kZS55IC0gZC5ub2RlLmhlaWdodCAvMiArIGQubm9kZS5vdXRwdXRTdGFydFkgKyBkLmluZGV4ICogMjA7IFxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR4MSA9IGQubm9kZS54ICsgZC5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLm5vZGUub3V0cHV0U3RhcnRZO1xyXG5cdFx0fVxyXG5cclxuXHRcdGQueDEgPSB4MSxkLnkxID0geTE7XHRcdFx0XHRcclxuXHRcdGQueDIgPSB4MSxkLnkyID0geTE7XHJcblxyXG5cdFx0dmFyIHBvcyA9IG1ha2VQb3MoeDEseTEsZC54MixkLnkyKTtcclxuXHRcdGQubGluZSA9IHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmRhdHVtKGQpXHJcblx0XHQuYXBwZW5kKCdwYXRoJylcclxuXHRcdC5hdHRyKHsnZCc6bGluZShwb3MpLCdjbGFzcyc6J2xpbmUtZHJhZyd9KTtcclxuXHR9KVxyXG5cdC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdGQueDIgKz0gZDMuZXZlbnQuZHg7XHJcblx0XHRkLnkyICs9IGQzLmV2ZW50LmR5O1xyXG5cdFx0ZC5saW5lLmF0dHIoJ2QnLGxpbmUobWFrZVBvcyhkLngxLGQueTEsZC54MixkLnkyKSkpO1x0XHRcdFx0XHRcclxuXHR9KVxyXG5cdC5vbihcImRyYWdlbmRcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdGxldCB0YXJnZXRYID0gZC54MjtcclxuXHRcdGxldCB0YXJnZXRZID0gZC55MjtcclxuXHRcdC8vIGlucHV044KC44GX44GP44GvcGFyYW3jgavliLDpgZTjgZfjgabjgYTjgovjgYtcclxuXHRcdC8vIGlucHV0XHRcdFxyXG5cdFx0bGV0IGNvbm5lY3RlZCA9IGZhbHNlO1xyXG5cdFx0bGV0IGlucHV0cyA9IGQzLnNlbGVjdEFsbCgnLmlucHV0JylbMF07XHJcblx0XHRmb3IodmFyIGkgPSAwLGwgPSBpbnB1dHMubGVuZ3RoO2kgPCBsOysraSl7XHJcblx0XHRcdGxldCBlbG0gPSBpbnB1dHNbaV07XHJcblx0XHRcdGxldCBiYm94ID0gZWxtLmdldEJCb3goKTtcclxuXHRcdFx0bGV0IG5vZGUgPSBlbG0uX19kYXRhX18ubm9kZTtcclxuXHRcdFx0bGV0IGxlZnQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueCxcclxuXHRcdFx0XHR0b3AgPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94LnksXHJcblx0XHRcdFx0cmlnaHQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueCArIGJib3gud2lkdGgsXHJcblx0XHRcdFx0Ym90dG9tID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55ICsgYmJveC5oZWlnaHQ7XHJcblx0XHRcdGlmKHRhcmdldFggPj0gbGVmdCAmJiB0YXJnZXRYIDw9IHJpZ2h0ICYmIHRhcmdldFkgPj0gdG9wICYmIHRhcmdldFkgPD0gYm90dG9tKVxyXG5cdFx0XHR7XHJcbi8vXHRcdFx0XHRjb25zb2xlLmxvZygnaGl0JyxlbG0pO1xyXG5cdFx0XHRcdGxldCBmcm9tXyA9IHtub2RlOmQubm9kZSxwYXJhbTpkLmluZGV4fTtcclxuXHRcdFx0XHRsZXQgdG9fID0ge25vZGU6bm9kZSxwYXJhbTplbG0uX19kYXRhX18uaW5kZXh9O1xyXG5cdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChmcm9tXyx0b18pO1xyXG5cdFx0XHRcdC8vQXVkaW9Ob2RlVmlldy5jb25uZWN0KCk7XHJcblx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHRcdGNvbm5lY3RlZCA9IHRydWU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoIWNvbm5lY3RlZCl7XHJcblx0XHRcdC8vIEF1ZGlvUGFyYW1cclxuXHRcdFx0dmFyIHBhcmFtcyA9IGQzLnNlbGVjdEFsbCgnLnBhcmFtLC5hdWRpby1wYXJhbScpWzBdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwLGwgPSBwYXJhbXMubGVuZ3RoO2kgPCBsOysraSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGxldCBlbG0gPSBwYXJhbXNbaV07XHJcblx0XHRcdFx0bGV0IGJib3ggPSBlbG0uZ2V0QkJveCgpO1xyXG5cdFx0XHRcdGxldCBwYXJhbSA9IGVsbS5fX2RhdGFfXztcclxuXHRcdFx0XHRsZXQgbm9kZSA9IHBhcmFtLm5vZGU7XHJcblx0XHRcdFx0bGV0IGxlZnQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueDtcclxuXHRcdFx0XHRsZXRcdHRvcF8gPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94Lnk7XHJcblx0XHRcdFx0bGV0XHRyaWdodCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54ICsgYmJveC53aWR0aDtcclxuXHRcdFx0XHRsZXRcdGJvdHRvbSA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueSArIGJib3guaGVpZ2h0O1xyXG5cdFx0XHRcdGlmKHRhcmdldFggPj0gbGVmdCAmJiB0YXJnZXRYIDw9IHJpZ2h0ICYmIHRhcmdldFkgPj0gdG9wXyAmJiB0YXJnZXRZIDw9IGJvdHRvbSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnaGl0JyxlbG0pO1xyXG5cdFx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOmQubm9kZSxwYXJhbTpkLmluZGV4fSx7bm9kZTpub2RlLHBhcmFtOnBhcmFtLmluZGV4fSk7XHJcblx0XHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIGxpbmXjg5fjg6zjg5Pjg6Xjg7zjga7liYrpmaRcclxuXHRcdGQubGluZS5yZW1vdmUoKTtcclxuXHRcdGRlbGV0ZSBkLmxpbmU7XHJcblx0fSk7XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjcGFuZWwtY2xvc2UnKVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKCl7ZDMuc2VsZWN0KCcjcHJvcC1wYW5lbCcpLnN0eWxlKCd2aXNpYmlsaXR5JywnaGlkZGVuJyk7ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO30pO1xyXG5cclxuXHQvLyBub2Rl6ZaT5o6l57aabGluZeaPj+eUu+mWouaVsFxyXG5cdGxpbmUgPSBkMy5zdmcubGluZSgpXHJcblx0LngoZnVuY3Rpb24oZCl7cmV0dXJuIGQueH0pXHJcblx0LnkoZnVuY3Rpb24oZCl7cmV0dXJuIGQueX0pXHJcblx0LmludGVycG9sYXRlKCdiYXNpcycpO1xyXG5cclxuXHQvLyBET03jgatzdmfjgqjjg6zjg6Hjg7Pjg4jjgpLmjL/lhaVcdFxyXG5cdHN2ZyA9IGQzLnNlbGVjdCgnI2NvbnRlbnQnKVxyXG5cdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdC5hdHRyKHsgJ3dpZHRoJzogd2luZG93LmlubmVyV2lkdGgsICdoZWlnaHQnOiB3aW5kb3cuaW5uZXJIZWlnaHQgfSk7XHJcblxyXG5cdC8vIOODjuODvOODieOBjOWFpeOCi+OCsOODq+ODvOODl1xyXG5cdG5vZGVHcm91cCA9IHN2Zy5hcHBlbmQoJ2cnKTtcclxuXHQvLyDjg6njgqTjg7PjgYzlhaXjgovjgrDjg6vjg7zjg5dcclxuXHRsaW5lR3JvdXAgPSBzdmcuYXBwZW5kKCdnJyk7XHJcblx0XHJcblx0Ly8gYm9keeWxnuaAp+OBq+aMv+WFpVxyXG5cdGF1ZGlvTm9kZUNyZWF0b3JzID0gXHJcblx0W1xyXG5cdFx0e25hbWU6J0dhaW4nLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlR2Fpbi5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0RlbGF5JyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZURlbGF5LmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQXVkaW9CdWZmZXJTb3VyY2UnLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQnVmZmVyU291cmNlLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonTWVkaWFFbGVtZW50QXVkaW9Tb3VyY2UnLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonUGFubmVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZVBhbm5lci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0NvbnZvbHZlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVDb252b2x2ZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidBbmFseXNlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVBbmFseXNlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0NoYW5uZWxTcGxpdHRlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVDaGFubmVsU3BsaXR0ZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidDaGFubmVsTWVyZ2VyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxNZXJnZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidEeW5hbWljc0NvbXByZXNzb3InLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlRHluYW1pY3NDb21wcmVzc29yLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQmlxdWFkRmlsdGVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUJpcXVhZEZpbHRlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J09zY2lsbGF0b3InLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlT3NjaWxsYXRvci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J01lZGlhU3RyZWFtQXVkaW9Tb3VyY2UnLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidXYXZlU2hhcGVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZVdhdmVTaGFwZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidFRycsY3JlYXRlOigpPT5uZXcgYXVkaW8uRUcoKX0sXHJcblx0XHR7bmFtZTonU2VxdWVuY2VyJyxjcmVhdGU6KCk9Pm5ldyBhdWRpby5TZXF1ZW5jZXIoKSxlZGl0b3I6c2hvd1NlcXVlbmNlRWRpdG9yfVxyXG5cdF07XHJcblx0XHJcblx0aWYoYXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtRGVzdGluYXRpb24pe1xyXG5cdFx0YXVkaW9Ob2RlQ3JlYXRvcnMucHVzaCh7bmFtZTonTWVkaWFTdHJlYW1BdWRpb0Rlc3RpbmF0aW9uJyxcclxuXHRcdFx0Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbURlc3RpbmF0aW9uLmJpbmQoYXVkaW8uY3R4KVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI2NvbnRlbnQnKVxyXG5cdC5kYXR1bSh7fSlcclxuXHQub24oJ2NvbnRleHRtZW51JyxmdW5jdGlvbigpe1xyXG5cdFx0c2hvd0F1ZGlvTm9kZVBhbmVsKHRoaXMpO1xyXG5cdH0pO1xyXG59XHJcblxyXG4vLyDmj4/nlLtcclxuZXhwb3J0IGZ1bmN0aW9uIGRyYXcoKSB7XHJcblx0Ly8gQXVkaW9Ob2Rl44Gu5o+P55S7XHJcblx0dmFyIGdkID0gbm9kZUdyb3VwLnNlbGVjdEFsbCgnZycpLlxyXG5cdGRhdGEoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLGZ1bmN0aW9uKGQpe3JldHVybiBkLmlkO30pO1xyXG5cclxuXHQvLyDnn6nlvaLjga7mm7TmlrBcclxuXHRnZC5zZWxlY3QoJ3JlY3QnKVxyXG5cdC5hdHRyKHsgJ3dpZHRoJzogKGQpPT4gZC53aWR0aCwgJ2hlaWdodCc6IChkKT0+IGQuaGVpZ2h0IH0pO1xyXG5cdFxyXG5cdC8vIEF1ZGlvTm9kZeefqeW9ouOCsOODq+ODvOODl1xyXG5cdHZhciBnID0gZ2QuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ2cnKTtcclxuXHQvLyBBdWRpb05vZGXnn6nlvaLjgrDjg6vjg7zjg5fjga7luqfmqJnkvY3nva7jgrvjg4Pjg4hcclxuXHRnZC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgKGQueCAtIGQud2lkdGggLyAyKSArICcsJyArIChkLnkgLSBkLmhlaWdodCAvIDIpICsgJyknIH0pO1x0XHJcblxyXG5cdC8vIEF1ZGlvTm9kZeefqeW9olxyXG5cdGcuYXBwZW5kKCdyZWN0JylcclxuXHQuY2FsbChkcmFnKVxyXG5cdC5hdHRyKHsgJ3dpZHRoJzogKGQpPT4gZC53aWR0aCwgJ2hlaWdodCc6IChkKT0+IGQuaGVpZ2h0LCAnY2xhc3MnOiAnYXVkaW9Ob2RlJyB9KVxyXG5cdC5jbGFzc2VkKCdwbGF5JyxmdW5jdGlvbihkKXtcclxuXHRcdHJldHVybiBkLnN0YXR1c1BsYXkgPT09IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlJTkc7XHJcblx0fSlcclxuXHQub24oJ2NvbnRleHRtZW51JyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOODkeODqeODoeODvOOCv+e3qOmbhueUu+mdouOBruihqOekulxyXG5cdFx0ZC5lZGl0b3IoKTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdH0pXHJcblx0Lm9uKCdjbGljay5yZW1vdmUnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g44OO44O844OJ44Gu5YmK6ZmkXHJcblx0XHRpZihkMy5ldmVudC5zaGlmdEtleSl7XHJcblx0XHRcdGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cgJiYgZC5wYW5lbC5kaXNwb3NlKCk7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUoZCk7XHJcblx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHR9IGNhdGNoKGUpIHtcclxuLy9cdFx0XHRcdGRpYWxvZy50ZXh0KGUubWVzc2FnZSkubm9kZSgpLnNob3cod2luZG93LmlubmVyV2lkdGgvMix3aW5kb3cuaW5uZXJIZWlnaHQvMik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdH0pXHJcblx0LmZpbHRlcihmdW5jdGlvbihkKXtcclxuXHRcdC8vIOmfs+a6kOOBruOBv+OBq+ODleOCo+ODq+OCv1xyXG5cdFx0cmV0dXJuIGQuYXVkaW9Ob2RlIGluc3RhbmNlb2YgT3NjaWxsYXRvck5vZGUgfHwgZC5hdWRpb05vZGUgaW5zdGFuY2VvZiBBdWRpb0J1ZmZlclNvdXJjZU5vZGUgfHwgZC5hdWRpb05vZGUgaW5zdGFuY2VvZiBNZWRpYUVsZW1lbnRBdWRpb1NvdXJjZU5vZGU7IFxyXG5cdH0pXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDlho3nlJ/jg7vlgZzmraJcclxuXHRcdGNvbnNvbGUubG9nKGQzLmV2ZW50KTtcclxuXHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRcdGlmKCFkMy5ldmVudC5jdHJsS2V5KXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0bGV0IHNlbCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdGlmKGQuc3RhdHVzUGxheSA9PT0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUlORyl7XHJcblx0XHRcdGQuc3RhdHVzUGxheSA9IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlFRDtcclxuXHRcdFx0c2VsLmNsYXNzZWQoJ3BsYXknLGZhbHNlKTtcclxuXHRcdFx0ZC5hdWRpb05vZGUuc3RvcCgwKTtcclxuXHRcdH0gZWxzZSBpZihkLnN0YXR1c1BsYXkgIT09IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlFRCl7XHJcblx0XHRcdGQuYXVkaW9Ob2RlLnN0YXJ0KDApO1xyXG5cdFx0XHRkLnN0YXR1c1BsYXkgPSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HO1xyXG5cdFx0XHRzZWwuY2xhc3NlZCgncGxheScsdHJ1ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhbGVydCgn5LiA5bqm5YGc5q2i44GZ44KL44Go5YaN55Sf44Gn44GN44G+44Gb44KT44CCJyk7XHJcblx0XHR9XHJcblx0fSlcclxuXHQuY2FsbCh0b29sdGlwKCdDdHJsICsgQ2xpY2sg44Gn5YaN55Sf44O75YGc5q2iJykpO1xyXG5cdDtcclxuXHRcclxuXHQvLyBBdWRpb05vZGXjga7jg6njg5njg6tcclxuXHRnLmFwcGVuZCgndGV4dCcpXHJcblx0LmF0dHIoeyB4OiAwLCB5OiAtMTAsICdjbGFzcyc6ICdsYWJlbCcgfSlcclxuXHQudGV4dChmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5uYW1lOyB9KTtcclxuXHJcblx0Ly8g5YWl5YqbQXVkaW9QYXJhbeOBruihqOekulx0XHJcblx0Z2QuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdHZhciBncCA9IHNlbC5hcHBlbmQoJ2cnKTtcclxuXHRcdHZhciBncGQgPSBncC5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZC5pbnB1dFBhcmFtcy5tYXAoKGQpPT57XHJcblx0XHRcdHJldHVybiB7bm9kZTpkLkF1ZGlvTm9kZVZpZXcsaW5kZXg6ZH07XHJcblx0XHR9KSxmdW5jdGlvbihkKXtyZXR1cm4gZC5pbmRleC5pZDt9KTtcdFx0XHJcblxyXG5cdFx0dmFyIGdwZGcgPSBncGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdC5hdHRyKHsncic6IChkKT0+ZC5pbmRleC53aWR0aC8yLCBcclxuXHRcdGN4OiAwLCBjeTogKGQsIGkpPT4geyByZXR1cm4gZC5pbmRleC55OyB9LFxyXG5cdFx0J2NsYXNzJzogZnVuY3Rpb24oZCkge1xyXG5cdFx0XHRpZihkLmluZGV4IGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHJldHVybiAnYXVkaW8tcGFyYW0nO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiAncGFyYW0nO1xyXG5cdFx0fX0pO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgndGV4dCcpXHJcblx0XHQuYXR0cih7eDogKGQpPT4gKGQuaW5kZXgueCArIGQuaW5kZXgud2lkdGggLyAyICsgNSkseTooZCk9PmQuaW5kZXgueSwnY2xhc3MnOidsYWJlbCcgfSlcclxuXHRcdC50ZXh0KChkKT0+ZC5pbmRleC5uYW1lKTtcclxuXHJcblx0XHRncGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0fSk7XHJcblxyXG5cdC8vIOWHuuWKm1BhcmFt44Gu6KGo56S6XHRcclxuXHRnZC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0dmFyIGdwID0gc2VsLmFwcGVuZCgnZycpO1xyXG5cdFx0XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0dmFyIGdwZCA9IGdwLnNlbGVjdEFsbCgnZycpXHJcblx0XHQuZGF0YShkLm91dHB1dFBhcmFtcy5tYXAoKGQpPT57XHJcblx0XHRcdHJldHVybiB7bm9kZTpkLkF1ZGlvTm9kZVZpZXcsaW5kZXg6ZH07XHJcblx0XHR9KSxmdW5jdGlvbihkKXtyZXR1cm4gZC5pbmRleC5pZDt9KTtcclxuXHRcdFxyXG5cdFx0dmFyIGdwZGcgPSBncGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpO1xyXG5cclxuXHRcdGdwZGcuYXBwZW5kKCdjaXJjbGUnKVxyXG5cdFx0LmF0dHIoeydyJzogKGQpPT5kLmluZGV4LndpZHRoLzIsIFxyXG5cdFx0Y3g6IGQud2lkdGgsIGN5OiAoZCwgaSk9PiB7IHJldHVybiBkLmluZGV4Lnk7IH0sXHJcblx0XHQnY2xhc3MnOiAncGFyYW0nfSlcclxuXHRcdC5jYWxsKGRyYWdPdXQpO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgndGV4dCcpXHJcblx0XHQuYXR0cih7eDogKGQpPT4gKGQuaW5kZXgueCArIGQuaW5kZXgud2lkdGggLyAyICsgNSkseTooZCk9PmQuaW5kZXgueSwnY2xhc3MnOidsYWJlbCcgfSlcclxuXHRcdC50ZXh0KChkKT0+ZC5pbmRleC5uYW1lKTtcclxuXHJcblx0XHRncGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0fSk7XHJcblxyXG5cdC8vIOWHuuWKm+ihqOekulxyXG5cdGdkLmZpbHRlcihmdW5jdGlvbiAoZCkge1xyXG5cdFx0cmV0dXJuIGQubnVtYmVyT2ZPdXRwdXRzID4gMDtcclxuXHR9KVxyXG5cdC5lYWNoKGZ1bmN0aW9uKGQpe1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ2cnKTtcclxuXHRcdGlmKCFkLnRlbXAub3V0cyB8fCAoZC50ZW1wLm91dHMgJiYgKGQudGVtcC5vdXRzLmxlbmd0aCA8IGQubnVtYmVyT2ZPdXRwdXRzKSkpXHJcblx0XHR7XHJcblx0XHRcdGQudGVtcC5vdXRzID0gW107XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7aSA8IGQubnVtYmVyT2ZPdXRwdXRzOysraSl7XHJcblx0XHRcdFx0ZC50ZW1wLm91dHMucHVzaCh7bm9kZTpkLGluZGV4Oml9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIHNlbDEgPSBzZWwuc2VsZWN0QWxsKCdnJyk7XHJcblx0XHR2YXIgc2VsZCA9IHNlbDEuZGF0YShkLnRlbXAub3V0cyk7XHJcblxyXG5cdFx0c2VsZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoeyB4OiBkLndpZHRoIC0gdWkucG9pbnRTaXplIC8gMiwgeTogKGQxKT0+IChkLm91dHB1dFN0YXJ0WSArIGQxLmluZGV4ICogMjAgLSB1aS5wb2ludFNpemUgLyAyKSwgd2lkdGg6IHVpLnBvaW50U2l6ZSwgaGVpZ2h0OiB1aS5wb2ludFNpemUsICdjbGFzcyc6ICdvdXRwdXQnIH0pXHJcblx0XHQuY2FsbChkcmFnT3V0KTtcclxuXHRcdHNlbGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH0pO1xyXG5cclxuXHQvLyDlhaXlipvooajnpLpcclxuXHRnZFxyXG5cdC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcdHJldHVybiBkLm51bWJlck9mSW5wdXRzID4gMDsgfSlcclxuXHQuZWFjaChmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCdnJyk7XHJcblx0XHRpZighZC50ZW1wLmlucyB8fCAoZC50ZW1wLmlucyAmJiAoZC50ZW1wLmlucy5sZW5ndGggPCBkLm51bWJlck9mSW5wdXRzKSkpXHJcblx0XHR7XHJcblx0XHRcdGQudGVtcC5pbnMgPSBbXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDtpIDwgZC5udW1iZXJPZklucHV0czsrK2kpe1xyXG5cdFx0XHRcdGQudGVtcC5pbnMucHVzaCh7bm9kZTpkLGluZGV4Oml9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIHNlbDEgPSBzZWwuc2VsZWN0QWxsKCdnJyk7XHJcblx0XHR2YXIgc2VsZCA9IHNlbDEuZGF0YShkLnRlbXAuaW5zKTtcclxuXHJcblx0XHRzZWxkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cih7IHg6IC0gdWkucG9pbnRTaXplIC8gMiwgeTogKGQxKT0+IChkLmlucHV0U3RhcnRZICsgZDEuaW5kZXggKiAyMCAtIHVpLnBvaW50U2l6ZSAvIDIpLCB3aWR0aDogdWkucG9pbnRTaXplLCBoZWlnaHQ6IHVpLnBvaW50U2l6ZSwgJ2NsYXNzJzogJ2lucHV0JyB9KVxyXG5cdFx0Lm9uKCdtb3VzZWVudGVyJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0bW91c2VPdmVyTm9kZSA9IHtub2RlOmQuYXVkaW9Ob2RlXyxwYXJhbTpkfTtcclxuXHRcdH0pXHJcblx0XHQub24oJ21vdXNlbGVhdmUnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRpZihtb3VzZU92ZXJOb2RlLm5vZGUpe1xyXG5cdFx0XHRcdGlmKG1vdXNlT3Zlck5vZGUubm9kZSA9PT0gZC5hdWRpb05vZGVfICYmIG1vdXNlT3Zlck5vZGUucGFyYW0gPT09IGQpe1xyXG5cdFx0XHRcdFx0bW91c2VPdmVyTm9kZSA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHNlbGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdC8vIOS4jeimgeOBquODjuODvOODieOBruWJiumZpFxyXG5cdGdkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdC8vIGxpbmUg5o+P55S7XHJcblx0dmFyIGxkID0gbGluZUdyb3VwLnNlbGVjdEFsbCgncGF0aCcpXHJcblx0LmRhdGEoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zKTtcclxuXHJcblx0bGQuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3BhdGgnKTtcclxuXHJcblx0bGQuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHBhdGggPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHR2YXIgeDEseTEseDIseTI7XHJcblxyXG5cdFx0Ly8geDEseTFcclxuXHRcdGlmKGQuZnJvbS5wYXJhbSl7XHJcblx0XHRcdGlmKGQuZnJvbS5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDEgPSBkLmZyb20ubm9kZS54IC0gZC5mcm9tLm5vZGUud2lkdGggLyAyICsgZC5mcm9tLnBhcmFtLng7XHJcblx0XHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLnBhcmFtLnk7IFxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCArIGQuZnJvbS5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0XHR5MSA9IGQuZnJvbS5ub2RlLnkgLSBkLmZyb20ubm9kZS5oZWlnaHQgLzIgKyBkLmZyb20ubm9kZS5vdXRwdXRTdGFydFkgKyBkLmZyb20ucGFyYW0gKiAyMDsgXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCArIGQuZnJvbS5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLm5vZGUub3V0cHV0U3RhcnRZO1xyXG5cdFx0fVxyXG5cclxuXHRcdHgyID0gZC50by5ub2RlLnggLSBkLnRvLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0eTIgPSBkLnRvLm5vZGUueSAtIGQudG8ubm9kZS5oZWlnaHQgLyAyO1xyXG5cdFx0XHJcblx0XHRpZihkLnRvLnBhcmFtKXtcclxuXHRcdFx0aWYoZC50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLkF1ZGlvUGFyYW1WaWV3IHx8IGQudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHgyICs9IGQudG8ucGFyYW0ueDtcclxuXHRcdFx0XHR5MiArPSBkLnRvLnBhcmFtLnk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eTIgKz0gIGQudG8ubm9kZS5pbnB1dFN0YXJ0WSAgKyAgZC50by5wYXJhbSAqIDIwO1x0XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHkyICs9IGQudG8ubm9kZS5pbnB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHBvcyA9IG1ha2VQb3MoeDEseTEseDIseTIpO1xyXG5cdFx0XHJcblx0XHRwYXRoLmF0dHIoeydkJzpsaW5lKHBvcyksJ2NsYXNzJzonbGluZSd9KTtcclxuXHRcdHBhdGgub24oJ2NsaWNrJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0aWYoZDMuZXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdChkLmZyb20sZC50byk7XHJcblx0XHRcdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdH0gXHJcblx0XHR9KS5jYWxsKHRvb2x0aXAoJ1NoaWZ0ICsgY2xpY2vjgafliYrpmaQnKSk7XHJcblx0XHRcclxuXHR9KTtcclxuXHRsZC5leGl0KCkucmVtb3ZlKCk7XHJcbn1cclxuXHJcbi8vIOewoeaYk3Rvb2x0aXDooajnpLpcclxuZnVuY3Rpb24gdG9vbHRpcChtZXMpXHJcbntcclxuXHRyZXR1cm4gZnVuY3Rpb24oZCl7XHJcblx0XHR0aGlzXHJcblx0XHQub24oJ21vdXNlZW50ZXInLGZ1bmN0aW9uKCl7XHJcblx0XHRcdHN2Zy5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHQuYXR0cih7J2NsYXNzJzondGlwJyx4OmQzLmV2ZW50LnggKyAyMCAseTpkMy5ldmVudC55IC0gMjB9KVxyXG5cdFx0XHQudGV4dChtZXMpO1xyXG5cdFx0fSlcclxuXHRcdC5vbignbW91c2VsZWF2ZScsZnVuY3Rpb24oKXtcclxuXHRcdFx0c3ZnLnNlbGVjdEFsbCgnLnRpcCcpLnJlbW92ZSgpO1xyXG5cdFx0fSlcclxuXHR9O1xyXG59XHJcblxyXG4vLyDmjqXntprnt5rjga7luqfmqJnnlJ/miJBcclxuZnVuY3Rpb24gbWFrZVBvcyh4MSx5MSx4Mix5Mil7XHJcblx0cmV0dXJuIFtcclxuXHRcdFx0e3g6eDEseTp5MX0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpLzQseTp5MX0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpLzIseTp5MSArICh5MiAtIHkxKS8yfSxcclxuXHRcdFx0e3g6eDEgKyAoeDIgLSB4MSkqMy80LHk6eTJ9LFxyXG5cdFx0XHR7eDp4MiwgeTp5Mn1cclxuXHRcdF07XHJcbn1cclxuXHJcbi8vIOODl+ODreODkeODhuOCo+ODkeODjeODq+OBruihqOekulxyXG5mdW5jdGlvbiBzaG93UGFuZWwoZCl7XHJcblxyXG5cdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0ZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRpZihkLnBhbmVsICYmIGQucGFuZWwuaXNTaG93KSByZXR1cm4gO1xyXG5cclxuXHRkLnBhbmVsID0gbmV3IHVpLlBhbmVsKCk7XHJcblx0ZC5wYW5lbC54ID0gZC54O1xyXG5cdGQucGFuZWwueSA9IGQueTtcclxuXHRkLnBhbmVsLmhlYWRlci50ZXh0KGQubmFtZSk7XHJcblx0XHJcblx0dmFyIHRhYmxlID0gZC5wYW5lbC5hcnRpY2xlLmFwcGVuZCgndGFibGUnKTtcclxuXHR2YXIgdGJvZHkgPSB0YWJsZS5hcHBlbmQoJ3Rib2R5Jykuc2VsZWN0QWxsKCd0cicpLmRhdGEoZC5wYXJhbXMpO1xyXG5cdHZhciB0ciA9IHRib2R5LmVudGVyKClcclxuXHQuYXBwZW5kKCd0cicpO1xyXG5cdHRyLmFwcGVuZCgndGQnKVxyXG5cdC50ZXh0KChkKT0+ZC5uYW1lKTtcclxuXHR0ci5hcHBlbmQoJ3RkJylcclxuXHQuYXBwZW5kKCdpbnB1dCcpXHJcblx0LmF0dHIoe3R5cGU6XCJ0ZXh0XCIsdmFsdWU6KGQpPT5kLmdldCgpLHJlYWRvbmx5OihkKT0+ZC5zZXQ/bnVsbDoncmVhZG9ubHknfSlcclxuXHQub24oJ2NoYW5nZScsZnVuY3Rpb24oZCl7XHJcblx0XHRsZXQgdmFsdWUgPSB0aGlzLnZhbHVlO1xyXG5cdFx0bGV0IHZuID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcblx0XHRpZihpc05hTih2bikpe1xyXG5cdFx0XHRkLnNldCh2YWx1ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRkLnNldCh2bik7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0ZC5wYW5lbC5zaG93KCk7XHJcblxyXG59XHJcblxyXG4vLyDjg47jg7zjg4nmjL/lhaXjg5Hjg43jg6vjga7ooajnpLpcclxuZnVuY3Rpb24gc2hvd0F1ZGlvTm9kZVBhbmVsKGQpe1xyXG5cdCBkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdCBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRpZihkLnBhbmVsKXtcclxuXHRcdGlmKGQucGFuZWwuaXNTaG93KVxyXG5cdFx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGQucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuXHRkLnBhbmVsLnggPSBkMy5ldmVudC5vZmZzZXRYO1xyXG5cdGQucGFuZWwueSA9IGQzLmV2ZW50Lm9mZnNldFk7XHJcblx0ZC5wYW5lbC5oZWFkZXIudGV4dCgnQXVkaW9Ob2Rl44Gu5oy/5YWlJyk7XHJcblxyXG5cdHZhciB0YWJsZSA9IGQucGFuZWwuYXJ0aWNsZS5hcHBlbmQoJ3RhYmxlJyk7XHJcblx0dmFyIHRib2R5ID0gdGFibGUuYXBwZW5kKCd0Ym9keScpLnNlbGVjdEFsbCgndHInKS5kYXRhKGF1ZGlvTm9kZUNyZWF0b3JzKTtcclxuXHR0Ym9keS5lbnRlcigpXHJcblx0LmFwcGVuZCgndHInKVxyXG5cdC5hcHBlbmQoJ3RkJylcclxuXHQudGV4dCgoZCk9PmQubmFtZSlcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbihkdCl7XHJcblx0XHRjb25zb2xlLmxvZygn5oy/5YWlJyxkdCk7XHJcblx0XHRcclxuXHRcdHZhciBlZGl0b3IgPSBkdC5lZGl0b3IgfHwgc2hvd1BhbmVsO1xyXG5cdFx0XHJcblx0XHR2YXIgbm9kZSA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGR0LmNyZWF0ZSgpLGVkaXRvcik7XHJcblx0XHRub2RlLnggPSBkMy5ldmVudC5jbGllbnRYO1xyXG5cdFx0bm9kZS55ID0gZDMuZXZlbnQuY2xpZW50WTtcclxuXHRcdGRyYXcoKTtcclxuXHRcdC8vIGQzLnNlbGVjdCgnI3Byb3AtcGFuZWwnKS5zdHlsZSgndmlzaWJpbGl0eScsJ2hpZGRlbicpO1xyXG5cdFx0Ly8gZC5wYW5lbC5kaXNwb3NlKCk7XHJcblx0fSk7XHJcblx0ZC5wYW5lbC5zaG93KCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdWRpb05vZGVWaWV3KG5hbWUpe1xyXG5cdHZhciBvYmogPSBhdWRpb05vZGVDcmVhdG9ycy5maW5kKChkKT0+e1xyXG5cdFx0aWYoZC5uYW1lID09PSBuYW1lKSByZXR1cm4gdHJ1ZTtcclxuXHR9KTtcclxuXHRpZihvYmope1xyXG5cdFx0cmV0dXJuIGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKG9iai5jcmVhdGUoKSxvYmouZWRpdG9yIHx8IHNob3dQYW5lbCk7XHRcdFx0XHJcblx0fVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBFRyB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHRoaXMuZ2F0ZSA9IG5ldyBhdWRpby5QYXJhbVZpZXcodGhpcywnZ2F0ZScsZmFsc2UpO1xyXG5cdFx0dGhpcy5vdXRwdXQgPSBuZXcgYXVkaW8uUGFyYW1WaWV3KHRoaXMsJ291dHB1dCcsdHJ1ZSk7XHJcblx0XHR0aGlzLm51bWJlck9mSW5wdXRzID0gMDtcclxuXHRcdHRoaXMubnVtYmVyT2ZPdXRwdXRzID0gMDtcclxuXHRcdHRoaXMuYXR0YWNrID0gMC4wMDE7XHJcblx0XHR0aGlzLmRlY2F5ID0gMC4wNTtcclxuXHRcdHRoaXMucmVsZWFzZSA9IDAuMDU7XHJcblx0XHR0aGlzLnN1c3RhaW4gPSAwLjI7XHJcblx0XHR0aGlzLmdhaW4gPSAxLjA7XHJcblx0XHR0aGlzLm5hbWUgPSAnRUcnO1xyXG5cdFx0YXVkaW8uZGVmSXNOb3RBUElPYmoodGhpcyxmYWxzZSk7XHJcblx0XHR0aGlzLm91dHB1dHMgPSBbXTtcclxuXHR9XHJcblx0XHJcblx0Y29ubmVjdChjKVxyXG5cdHtcclxuXHRcdGlmKCEgKGMudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5BdWRpb1BhcmFtVmlldykpe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0F1ZGlvUGFyYW3ku6XlpJbjgajjga/mjqXntprjgafjgY3jgb7jgZvjgpPjgIInKTtcclxuXHRcdH1cclxuXHRcdGMudG8ucGFyYW0uYXVkaW9QYXJhbS52YWx1ZSA9IDA7XHJcblx0XHR0aGlzLm91dHB1dHMucHVzaChjLnRvKTtcclxuXHR9XHJcblx0XHJcblx0ZGlzY29ubmVjdChjKXtcclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRoaXMub3V0cHV0cy5sZW5ndGg7KytpKXtcclxuXHRcdFx0aWYoYy50by5ub2RlID09PSB0aGlzLm91dHB1dHNbaV0ubm9kZSAmJiBjLnRvLnBhcmFtID09PSB0aGlzLm91dHB1dHNbaV0ucGFyYW0pXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aGlzLm91dHB1dHMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRwcm9jZXNzKHRvLGNvbSx2LHQpXHJcblx0e1xyXG5cdFx0aWYodiA+IDApIHtcclxuXHRcdFx0Ly8ga2V5b25cclxuXHRcdFx0Ly8gQURT44G+44Gn44KC44Gj44Gm44GE44GPXHJcblx0XHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdrZXlvbicsY29tLHYsdCk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLnNldFZhbHVlQXRUaW1lKDAsdCk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYgKiB0aGlzLmdhaW4gLHQgKyB0aGlzLmF0dGFjayk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYgKiB0aGlzLmdhaW4gLHQgKyB0aGlzLmF0dGFjayArIHRoaXMuZGVjYXkgKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBrZXlvZmZcclxuXHRcdFx0Ly8g44Oq44Oq44O844K5XHJcblx0XHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdrZXlvZmYnLGNvbSx2LHQpO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLHQgKyB0aGlzLnJlbGVhc2UpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0c3RvcCgpe1xyXG5cdFx0dGhpcy5vdXRwdXRzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdGNvbnNvbGUubG9nKCdzdG9wJyk7XHJcblx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcblx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5zZXRWYWx1ZUF0VGltZSgwLDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdHBhdXNlKCl7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcbn1cclxuXHJcbi8vIC8vLyDjgqjjg7Pjg5njg63jg7zjg5fjgrjjgqfjg43jg6zjg7zjgr/jg7xcclxuLy8gZnVuY3Rpb24gRW52ZWxvcGVHZW5lcmF0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuLy8gICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbi8vICAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbi8vICAgdGhpcy5hdHRhY2sgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4vLyAgIHRoaXMuZGVjYXkgPSBkZWNheSB8fCAwLjA1O1xyXG4vLyAgIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW4gfHwgMC41O1xyXG4vLyAgIHRoaXMucmVsZWFzZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4vLyB9O1xyXG4vLyBcclxuLy8gRW52ZWxvcGVHZW5lcmF0b3IucHJvdG90eXBlID1cclxuLy8ge1xyXG4vLyAgIGtleW9uOiBmdW5jdGlvbiAodCx2ZWwpIHtcclxuLy8gICAgIHRoaXMudiA9IHZlbCB8fCAxLjA7XHJcbi8vICAgICB2YXIgdiA9IHRoaXMudjtcclxuLy8gICAgIHZhciB0MCA9IHQgfHwgdGhpcy52b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuLy8gICAgIHZhciB0MSA9IHQwICsgdGhpcy5hdHRhY2sgKiB2O1xyXG4vLyAgICAgdmFyIGdhaW4gPSB0aGlzLnZvaWNlLmdhaW4uZ2FpbjtcclxuLy8gICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuLy8gICAgIGdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDApO1xyXG4vLyAgICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2LCB0MSk7XHJcbi8vICAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQwICsgdGhpcy5kZWNheSAvIHYpO1xyXG4vLyAgICAgLy9nYWluLnNldFRhcmdldEF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MSwgdDEgKyB0aGlzLmRlY2F5IC8gdik7XHJcbi8vICAgfSxcclxuLy8gICBrZXlvZmY6IGZ1bmN0aW9uICh0KSB7XHJcbi8vICAgICB2YXIgdm9pY2UgPSB0aGlzLnZvaWNlO1xyXG4vLyAgICAgdmFyIGdhaW4gPSB2b2ljZS5nYWluLmdhaW47XHJcbi8vICAgICB2YXIgdDAgPSB0IHx8IHZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4vLyAgICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4vLyAgICAgLy9nYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMCwgdDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4vLyAgIH1cclxuLy8gfTsiLCIndXNlIHN0cmljdCc7XG5cbi8vXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXG4vL1xudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xuICB0aGlzLmZuID0gZm47XG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XG59XG5cbi8qKlxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cblxuLyoqXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgICAsIGo7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGV2ZW50cyA9IFtdO1xuXG4gIGlmIChmbikge1xuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICAgIGlmIChcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXG4gICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVycy5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgKSB7XG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXG4gICAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICAgICkge1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gIC8vXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcblxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XG4gIGVsc2UgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVmT2JzZXJ2YWJsZSh0YXJnZXQscHJvcE5hbWUsb3B0ID0ge30pXHJcbntcclxuXHQoKCk9PntcclxuXHRcdHZhciB2XztcclxuXHRcdG9wdC5lbnVtZXJhYmxlID0gb3B0LmVudW1lcmFibGUgfHwgdHJ1ZTtcclxuXHRcdG9wdC5jb25maWd1cmFibGUgPSBvcHQuY29uZmlndXJhYmxlIHx8IGZhbHNlO1xyXG5cdFx0b3B0LmdldCA9IG9wdC5nZXQgfHwgKCgpID0+IHZfKTtcclxuXHRcdG9wdC5zZXQgPSBvcHQuc2V0IHx8ICgodik9PntcclxuXHRcdFx0aWYodl8gIT0gdil7XHJcblx0XHRcdFx0dGFyZ2V0LmVtaXQocHJvcE5hbWUgKyAnX2NoYW5nZWQnLHYpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZfID0gdjtcclxuXHRcdH0pO1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCxwcm9wTmFtZSxvcHQpO1xyXG5cdH0pKCk7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTZXF1ZW5jZUVkaXRvciB7XHJcblx0Y29uc3RydWN0b3Ioc2VxdWVuY2VyKVxyXG5cdHtcclxuXHRcdHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG5cdCBzZXF1ZW5jZXIucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuXHQgc2VxdWVuY2VyLnBhbmVsLnggPSBzZXF1ZW5jZXIueDtcclxuXHQgc2VxdWVuY2VyLnBhbmVsLnkgPSBzZXF1ZW5jZXIueTtcclxuXHQgc2VxdWVuY2VyLnBhbmVsLndpZHRoID0gMTAyNDtcclxuXHQgc2VxdWVuY2VyLnBhbmVsLmhlaWdodCA9IDc2ODtcclxuXHQgc2VxdWVuY2VyLnBhbmVsLmhlYWRlci50ZXh0KCdTZXF1ZW5jZSBFZGl0b3InKTtcclxuXHQgdmFyIGVkaXRvciA9IHNlcXVlbmNlci5wYW5lbC5hcnRpY2xlLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnc2VxLWVkaXRvcicsdHJ1ZSk7XHJcblx0IHZhciBkaXYgPSBlZGl0b3IuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdoZWFkZXInLHRydWUpO1xyXG5cdCBcclxuXHQgLy9cclxuXHQgZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJ1RpbWUgQmFzZTonKTtcclxuXHQgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG5cdCAuZGF0dW0oc2VxdWVuY2VyLmF1ZGlvTm9kZS50cGIpXHJcblx0IC5hdHRyKHsndHlwZSc6J3RleHQnLCdzaXplJzonMycsJ2lkJzondGltZS1iYXNlJ30pXHJcblx0IC5hdHRyKCd2YWx1ZScsKHYpPT52KVxyXG5cdCAub24oJ2NoYW5nZScsZnVuY3Rpb24oKXtcclxuXHRcdCBzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRwYiA9IGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpO1xyXG5cdCB9KVxyXG5cdCAuY2FsbChmdW5jdGlvbigpe1xyXG5cdFx0XHRzZXF1ZW5jZXIuYXVkaW9Ob2RlLm9uKCd0cGJfY2hhbmdlZCcsKHYpPT57XHJcblx0XHRcdFx0dGhpcy5hdHRyKCd2YWx1ZScsdik7IFxyXG5cdFx0XHR9KTtcdFx0IFxyXG5cdCB9KTtcclxuXHJcblxyXG5cdCBkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnVGVtcG86Jyk7XHJcblx0IGRpdi5hcHBlbmQoJ2lucHV0JylcclxuXHQgLmRhdHVtKHNlcXVlbmNlcilcclxuXHQgLmF0dHIoeyd0eXBlJzondGV4dCcsJ3NpemUnOiczJ30pXHJcblx0IC5hdHRyKCd2YWx1ZScsKGQpPT5zZXF1ZW5jZXIuYXVkaW9Ob2RlLmJwbSlcclxuXHQgLm9uKCdjaGFuZ2UnLCgpPT57XHJcblx0XHRcdHNlcXVlbmNlci5hdWRpb05vZGUuYnBtID0gcGFyc2VGbG9hdChkMy5zZWxlY3QodGhpcykuYXR0cigndmFsdWUnKSwxMCk7XHJcblx0IH0pXHJcblx0IC5jYWxsKGZ1bmN0aW9uKCl7XHJcblx0XHQgc2VxdWVuY2VyLmF1ZGlvTm9kZS5vbignYnBtX2NoYW5nZWQnLCh2KT0+e1xyXG5cdFx0XHQgdGhpcy5hdHRyKCd2YWx1ZScsdik7XHJcblx0XHQgfSk7XHJcblx0IH0pO1xyXG5cdFxyXG5cdGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdCZWF0OicpO1xyXG5cdGRpdi5hcHBlbmQoJ2lucHV0JylcclxuXHQuZGF0dW0oc2VxdWVuY2VyKVxyXG5cdC5hdHRyKHsndHlwZSc6J3RleHQnLCdzaXplJzonMycsJ3ZhbHVlJzooZCk9PnNlcXVlbmNlci5hdWRpb05vZGUuYmVhdH0pXHJcblx0Lm9uKCdjaGFuZ2UnLChkKT0+e1xyXG5cdFx0c2VxdWVuY2VyLmF1ZGlvTm9kZS5iZWF0ID0gcGFyc2VGbG9hdChkMy5zZWxlY3QodGhpcykuYXR0cigndmFsdWUnKSwxMCk7XHJcblx0fSk7XHJcblxyXG5cdGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCcgLyAnKTtcclxuXHRkaXYuYXBwZW5kKCdpbnB1dCcpXHJcblx0LmRhdHVtKHNlcXVlbmNlcilcclxuXHQuYXR0cih7J3R5cGUnOid0ZXh0Jywnc2l6ZSc6JzMnLCd2YWx1ZSc6KGQpPT5zZXF1ZW5jZXIuYXVkaW9Ob2RlLmJhcn0pXHJcblx0Lm9uKCdjaGFuZ2UnLChkKT0+e1xyXG5cdFx0c2VxdWVuY2VyLmF1ZGlvTm9kZS5iYXIgPSBwYXJzZUZsb2F0KGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpLDEwKTtcclxuXHR9KTtcclxuXHJcblxyXG5cdGxldCB0cmFja0VkaXQgPSBlZGl0b3Iuc2VsZWN0QWxsKCdkaXYudHJhY2snKS5kYXRhKHNlcXVlbmNlci5hdWRpb05vZGUudHJhY2tzKVxyXG5cdC5lbnRlcigpXHJcblx0LmFwcGVuZCgnZGl2JykuY2xhc3NlZCgndHJhY2snLHRydWUpO1xyXG5cdGxldCB0cmFja0hlYWRlciA9IHRyYWNrRWRpdC5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ3RyYWNrLWhlYWRlcicsdHJ1ZSk7XHJcblx0dHJhY2tIZWFkZXIuYXBwZW5kKCdzcGFuJykudGV4dCgoZCxpKSA9PiAnVFI6JyArIChpKzEpKTtcclxuXHR0cmFja0hlYWRlci5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdNRUFTOicgKTtcclxuXHRsZXQgdHJhY2tCb2R5ID0gdHJhY2tFZGl0LmFwcGVuZCgnZGl2JykuY2xhc3NlZCgndHJhY2stYm9keScsdHJ1ZSk7XHJcblx0bGV0IGV2ZW50RWRpdCA9IHRyYWNrQm9keS5hcHBlbmQoJ3RhYmxlJyk7XHJcblx0bGV0IGhlYWRyb3cgPSBldmVudEVkaXQuYXBwZW5kKCd0aGVhZCcpLmFwcGVuZCgndHInKTtcclxuXHRoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdNIycpO1xyXG5cdGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1MjJyk7XHJcblx0aGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnTlQnKTtcclxuXHRoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdOIycpO1xyXG5cdGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1NUJyk7XHJcblx0aGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnR1QnKTtcclxuXHRoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdWRScpO1xyXG5cdGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ0NPJyk7XHJcblx0bGV0IGV2ZW50Qm9keSA9IGV2ZW50RWRpdC5hcHBlbmQoJ3Rib2R5Jyk7XHJcblx0dGhpcy5kcmF3RXZlbnRzKGV2ZW50Qm9keSk7XHJcblx0XHJcblx0IGZvcih2YXIgaSA9IDA7aSA8IDM5OysraSl7XHJcblx044CAIFx0ZXZlbnRCb2R5LmFwcGVuZCgndHInKTtcclxuXHQgfVxyXG5cdC8vIHNlcXVlbmNlci5wYW5lbC5vbignc2hvdycsKCk9PntcclxuXHQvLyBcdGQzLnNlbGVjdCgnI3RpbWUtYmFzZScpLm5vZGUoKS5mb2N1cygpO1xyXG5cdC8vIFx0ZDMuc2VsZWN0KHdpbmRvdykub24oJ2tleWRvd24nLCgpPT57XHJcblx0Ly8gXHRcdGNvbnNvbGUubG9nKGQzLmV2ZW50LmtleUNvZGUpO1xyXG5cdC8vIFx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdC8vIFx0XHRkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdC8vIFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0Ly8gXHR9KTtcdFxyXG5cdC8vIH0pO1xyXG5cdC8vIFxyXG5cdC8vIHNlcXVlbmNlci5wYW5lbC5vbignaGlkZScsKCk9PntcclxuXHQvLyBcdGQzLnNlbGVjdCh3aW5kb3cpLm9uKCdrZXlkb3duJyxudWxsKTtcclxuXHQvLyB9KTtcclxuXHQvLyBcclxuXHRzZXF1ZW5jZXIucGFuZWwuc2hvdygpO1xyXG5cdH1cclxuXHRcclxuXHRkcmF3RXZlbnRzKGV2ZW50Qm9keSl7XHJcblx0XHRldmVudEJvZHkuZWFjaChmdW5jdGlvbihkLGkpe1xyXG5cdFx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0XHR2YXIgZXZzZWwgPSBzZWwuc2VsZWN0QWxsKCd0cicpLmRhdGEoZC5ldmVudHMpO1xyXG5cdFx0XHR2YXIgcm93ID0gZXZzZWwuZW50ZXIoKS5hcHBlbmQoJ3RyJyk7XHJcblx0XHRcdHZhciBzdGVwID0gMDtcclxuXHRcdFx0cm93LmVhY2goZnVuY3Rpb24oZCxpKXtcclxuXHRcdFx0XHRzd2l0Y2goZC50eXBlKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGNhc2UgYXVkaW8uRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdGNhc2UgYXVkaW8uRXZlbnRUeXBlLk1lYXN1cmU6XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTZXF1ZW5jZUVkaXRvcihkKVxyXG57XHJcblx0IGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0IGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0IGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0IGlmKGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cpIHJldHVybjtcclxuXHQgaWYoZC5lZGl0b3IgJiYgZC5wYW5lbCl7XHJcblx0XHQgZC5wYW5lbC5zaG93KCk7XHJcblx0IH1cclxuXHQgZC5lZGl0b3IgPSBuZXcgU2VxdWVuY2VFZGl0b3IoZCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldElucHV0KCl7XHJcblx0dGhpcy5hdHRyKCdjb250ZW50RWRpdGFibGUnLCd0cnVlJylcclxuXHQub24oJ0RPTUNoYXJhY3RlckRhdGFNb2RpZmllZCcsKCk9Pntjb25zb2xlLmxvZyhkMy5ldmVudCl9KVxyXG5cdC5vbigna2V5ZG93bicsZnVuY3Rpb24oKXtcclxuXHRcdHN3aXRjaChkMy5ldmVudC5rZXlDb2RlKXtcclxuXHRcdFx0Y2FzZSAxMzpcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGxldCBuZXh0ID0gZDMuc2VsZWN0KHRoaXMpLm5vZGUoKS5uZXh0U2libGluZztcclxuXHRcdFx0XHRpZihuZXh0KSBuZXh0LmZvY3VzKCk7XHJcblx0XHRcdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fSk7XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9ldmVudEVtaXR0ZXIzJztcclxuaW1wb3J0ICogYXMgcHJvcCBmcm9tICcuL3Byb3AnO1xyXG5cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihzdGVwKXtcclxuXHRcdHRoaXMuc3RlcCA9IHN0ZXA7IFxyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSlcclxue1xyXG5cdGF1ZGlvUGFyYW0uc2V0VmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZShhdWRpb1BhcmFtLHZhbHVlLHRpbWUpe1xyXG5cdGF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSl7XHJcblx0YXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2YWx1ZSx0aW1lKTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tYW5kIHtcclxuXHRjb25zdHJ1Y3RvcihwaXRjaENvbW1hbmQgPSBzZXRWYWx1ZUF0VGltZSx2ZWxvY2l0eUNvbW1hbmQgPSBzZXRWYWx1ZUF0VGltZSlcclxuXHR7XHJcblx0XHR0aGlzLnByb2Nlc3NQaXRjaCA9IHBpdGNoQ29tbWFuZC5iaW5kKHRoaXMpO1xyXG5cdFx0dGhpcy5wcm9jZXNzVmVsb2NpdHkgPSB2ZWxvY2l0eUNvbW1hbmQuYmluZCh0aGlzKTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgRXZlbnRUeXBlICA9IHtcclxuXHROb3RlOjEsXHJcblx0TWVhc3VyZToyXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBNZWFzdXJlIGV4dGVuZHMgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoMCk7XHJcblx0XHR0aGlzLnR5cGUgPSBFdmVudFR5cGUuTWVhc3VyZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOb3RlRXZlbnQgZXh0ZW5kcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHN0ZXAgPSA5Nixub3RlID0gNjQsZ2F0ZSA9IDQ4LHZlbCA9IDEuMCxjb21tYW5kID0gbmV3IENvbW1hbmQoKSl7XHJcblx0XHRzdXBlcihzdGVwKTtcclxuXHRcdHRoaXMubm90ZV8gPSBub3RlO1xyXG5cdFx0dGhpcy50cmFuc29wc2VfID0gMDtcclxuXHRcdHRoaXMuY2FsY1BpdGNoKCk7XHJcblx0XHR0aGlzLmdhdGUgPSBnYXRlO1xyXG5cdFx0dGhpcy52ZWwgPSB2ZWw7XHJcblx0XHR0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xyXG5cdFx0dGhpcy5jb21tYW5kLmV2ZW50ID0gdGhpcztcclxuXHRcdHRoaXMudHlwZSA9IEV2ZW50VHlwZS5Ob3RlO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgbm90ZSAoKXtcclxuXHRcdCByZXR1cm4gdGhpcy5ub3RlXztcclxuXHR9XHJcblx0XHJcblx0c2V0IG5vdGUodil7XHJcblx0XHQgdGhpcy5ub3RlXyA9IHY7XHJcblx0XHQgdGhpcy5jYWxjUGl0Y2goKTtcclxuXHR9XHJcblx0XHJcblx0c2V0IHRyYW5zcG9zZSh2KXtcclxuXHRcdGlmKHYgIT0gdGhpcy50cmFuc3Bvc2VfKXtcclxuXHRcdFx0dGhpcy50cmFuc3Bvc2VfID0gdjtcclxuXHRcdFx0dGhpcy5jYWxjUGl0Y2goKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Y2FsY1BpdGNoKCl7XHJcblx0XHR0aGlzLnBpdGNoID0gKDQ0MC4wIC8gMzIuMCkgKiAoTWF0aC5wb3coMi4wLCgodGhpcy5ub3RlXyArIHRoaXMudHJhbnNwb3NlXyAtIDkpIC8gMTIpKSk7XHJcblx0fVxyXG5cdFxyXG5cdHByb2Nlc3ModGltZSx0cmFjayl7XHJcblx0XHRcdGlmKHRoaXMubm90ZSl7XHJcblx0XHRcdFx0dGhpcy50cmFuc29wc2UgPSB0cmFjay50cmFuc3Bvc2U7XHJcblx0XHRcdFx0Zm9yKGxldCBqID0gMCxqZSA9IHRyYWNrLnBpdGNoZXMubGVuZ3RoO2ogPCBqZTsrK2ope1xyXG5cdFx0XHRcdFx0dHJhY2sucGl0Y2hlc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCx0aGlzLnBpdGNoLHRpbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IobGV0IGogPSAwLGplID0gdHJhY2sudmVsb2NpdGllcy5sZW5ndGg7aiA8IGplOysrail7XHJcblx0XHRcdFx0XHQvLyBrZXlvblxyXG5cdFx0XHRcdFx0dHJhY2sudmVsb2NpdGllc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCx0aGlzLnZlbCx0aW1lKTtcclxuXHRcdFx0XHRcdC8vIGtleW9mZlxyXG5cdFx0XHRcdFx0dHJhY2sudmVsb2NpdGllc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCwwLHRpbWUgKyB0aGlzLmdhdGUgKiB0cmFjay5zZXF1ZW5jZXIuc3RlcFRpbWVfICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBUcmFjayBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3Ioc2VxdWVuY2VyKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmV2ZW50cyA9IFtdO1xyXG5cdFx0dGhpcy5wb2ludGVyID0gMDtcclxuXHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnc3RlcCcpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2VuZCcpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ25hbWUnKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCd0cmFuc3Bvc2UnKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zdGVwID0gMDtcclxuXHRcdHRoaXMuZW5kID0gZmFsc2U7XHJcblx0XHR0aGlzLnBpdGNoZXMgPSBbXTtcclxuXHRcdHRoaXMudmVsb2NpdGllcyA9IFtdO1xyXG5cdFx0dGhpcy5zZXF1ZW5jZXIgPSBzZXF1ZW5jZXI7XHJcblx0XHR0aGlzLm5hbWUgPSAnJztcclxuXHRcdHRoaXMudHJhbnNwb3NlID0gMDtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBTRVFfU1RBVFVTID0ge1xyXG5cdFNUT1BQRUQ6MCxcclxuXHRQTEFZSU5HOjEsXHJcblx0UEFVU0VEOjJcclxufSA7XHJcblxyXG5leHBvcnQgY29uc3QgTlVNX09GX1RSQUNLUyA9IDQ7XHJcblxyXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdFxyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JwbScpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3RwYicpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JlYXQnKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdiYXInKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdyZXBlYXQnKTtcclxuXHJcblx0XHR0aGlzLmJwbSA9IDEyMC4wOyAvLyB0ZW1wb1xyXG5cdFx0dGhpcy50cGIgPSA5Ni4wOyAvLyDlm5vliIbpn7PnrKbjga7op6Plg4/luqZcclxuXHRcdHRoaXMuYmVhdCA9IDQ7XHJcblx0XHR0aGlzLmJhciA9IDQ7IC8vIFxyXG5cdFx0dGhpcy50cmFja3MgPSBbXTtcclxuXHRcdHRoaXMubnVtYmVyT2ZJbnB1dHMgPSAwO1xyXG5cdFx0dGhpcy5udW1iZXJPZk91dHB1dHMgPSAwO1xyXG5cdFx0dGhpcy5uYW1lID0gJ1NlcXVlbmNlcic7XHJcblx0XHRmb3IgKHZhciBpID0gMDtpIDwgTlVNX09GX1RSQUNLUzsrK2kpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMudHJhY2tzLnB1c2gobmV3IFRyYWNrKHRoaXMpKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddID0gbmV3IGF1ZGlvLlBhcmFtVmlldyhudWxsLCd0cmsnICsgaSArICdnJyx0cnVlKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddLnRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ2cnXS50eXBlID0gJ2dhdGUnO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddID0gbmV3IGF1ZGlvLlBhcmFtVmlldyhudWxsLCd0cmsnICsgaSArICdwJyx0cnVlKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddLnRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ3AnXS50eXBlID0gJ3BpdGNoJztcclxuXHRcdH1cclxuXHRcdHRoaXMuc3RhcnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRNZWFzdXJlXyA9IDA7XHJcblx0XHR0aGlzLmNhbGNTdGVwVGltZSgpO1xyXG5cdFx0dGhpcy5yZXBlYXQgPSBmYWxzZTtcclxuXHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuU1RPUFBFRDtcclxuXHJcblx0XHQvL1xyXG5cdFx0dGhpcy5vbignYnBtX2NoYW5lZ2VkJywoKT0+e3RoaXMuY2FsY1N0ZXBUaW1lKCk7fSk7XHJcblx0XHR0aGlzLm9uKCd0cGJfY2hhbmVnZWQnLCgpPT57dGhpcy5jYWxjU3RlcFRpbWUoKTt9KTtcclxuXHJcblx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5wdXNoKHRoaXMpO1xyXG5cdFx0aWYoU2VxdWVuY2VyLmFkZGVkKXtcclxuXHRcdFx0U2VxdWVuY2VyLmFkZGVkKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cclxuXHRkaXNwb3NlKCl7XHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGg7KytpKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0aGlzID09PSBTZXF1ZW5jZXIuc2VxdWVuY2Vyc1tpXSl7XHJcblx0XHRcdFx0IFNlcXVlbmNlci5zZXF1ZW5jZXJzLnNwbGljZShpLDEpO1xyXG5cdFx0XHRcdCBicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGggPT0gMClcclxuXHRcdHtcclxuXHRcdFx0aWYoU2VxdWVuY2VyLmVtcHR5KXtcclxuXHRcdFx0XHRTZXF1ZW5jZXIuZW1wdHkoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRjYWxjU3RlcFRpbWUoKXtcclxuXHRcdHRoaXMuc3RlcFRpbWVfID0gNjAuMCAvICggdGhpcy5icG0gKiB0aGlzLnRwYik7IFxyXG5cdH1cclxuXHRcclxuXHRzdGFydCh0aW1lKXtcclxuXHRcdGlmKHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlNUT1BQRUQgfHwgdGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUEFVU0VEICl7XHJcblx0XHRcdHRoaXMuY3VycmVudFRpbWVfID0gdGltZSB8fCBhdWRpby5jdHguY3VycmVudFRpbWUoKTtcclxuXHRcdFx0dGhpcy5zdGFydFRpbWVfICA9IHRoaXMuY3VycmVudFRpbWVfO1xyXG5cdFx0XHR0aGlzLnN0YXR1c18gPSBTRVFfU1RBVFVTLlBMQVlJTkc7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHN0b3AoKXtcclxuXHRcdGlmKHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcgfHwgdGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUEFVU0VEKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnRyYWNrcy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQucGl0Y2hlcy5mb3JFYWNoKChwKT0+e1xyXG5cdFx0XHRcdFx0cC5zdG9wKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0ZC52ZWxvY2l0aWVzLmZvckVhY2goKHYpPT57XHJcblx0XHRcdFx0XHR2LnN0b3AoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnN0YXR1c18gPSBTRVFfU1RBVFVTLlNUT1BQRUQ7XHJcblx0XHRcdHRoaXMucmVzZXQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHBhdXNlKCl7XHJcblx0XHRpZih0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5QQVVTRUQ7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJlc2V0KCl7XHJcblx0XHR0aGlzLnN0YXJ0VGltZV8gPSAwO1xyXG5cdFx0dGhpcy5jdXJyZW50VGltZV8gPSAwO1xyXG5cdFx0dGhpcy50cmFja3MuZm9yRWFjaCgodHJhY2spPT57XHJcblx0XHRcdHRyYWNrLmVuZCA9ICF0cmFjay5ldmVudHMubGVuZ3RoO1xyXG5cdFx0XHR0cmFjay5zdGVwID0gMDtcclxuXHRcdFx0dHJhY2sucG9pbnRlciA9IDA7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuY2FsY1N0ZXBUaW1lKCk7XHJcblx0fVxyXG4gIC8vIOOCt+ODvOOCseODs+OCteODvOOBruWHpueQhlxyXG5cdHByb2Nlc3MgKHRpbWUpXHJcblx0e1xyXG5cdFx0dGhpcy5jdXJyZW50VGltZV8gPSB0aW1lIHx8IGF1ZGlvLmN0eC5jdXJyZW50VGltZSgpO1xyXG5cdFx0dmFyIGN1cnJlbnRTdGVwID0gKHRoaXMuY3VycmVudFRpbWVfICAtIHRoaXMuc3RhcnRUaW1lXyArIDAuMSkgLyB0aGlzLnN0ZXBUaW1lXztcclxuXHRcdGxldCBlbmRjb3VudCA9IDA7XHJcblx0XHRmb3IodmFyIGkgPSAwLGwgPSB0aGlzLnRyYWNrcy5sZW5ndGg7aSA8IGw7KytpKXtcclxuXHRcdFx0dmFyIHRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdGlmKCF0cmFjay5lbmQpe1xyXG5cdFx0XHRcdHdoaWxlKHRyYWNrLnN0ZXAgPD0gY3VycmVudFN0ZXAgJiYgIXRyYWNrLmVuZCApe1xyXG5cdFx0XHRcdFx0aWYodHJhY2sucG9pbnRlciA+PSB0cmFjay5ldmVudHMubGVuZ3RoICl7XHJcblx0XHRcdFx0XHRcdHRyYWNrLmVuZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dmFyIGV2ZW50ID0gdHJhY2suZXZlbnRzW3RyYWNrLnBvaW50ZXIrK107XHJcblx0XHRcdFx0XHRcdHZhciBwbGF5VGltZSA9IHRyYWNrLnN0ZXAgKiB0aGlzLnN0ZXBUaW1lXyArIHRoaXMuc3RhcnRUaW1lXztcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJvY2VzcyhwbGF5VGltZSx0cmFjayk7XHJcblx0XHRcdFx0XHRcdHRyYWNrLnN0ZXAgKz0gZXZlbnQuc3RlcDtcclxuLy9cdFx0XHRcdFx0Y29uc29sZS5sb2codHJhY2sucG9pbnRlcix0cmFjay5ldmVudHMubGVuZ3RoLHRyYWNrLmV2ZW50c1t0cmFjay5wb2ludGVyXSx0cmFjay5zdGVwLGN1cnJlbnRTdGVwLHRoaXMuY3VycmVudFRpbWVfLHBsYXlUaW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0KytlbmRjb3VudDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoZW5kY291bnQgPT0gdGhpcy50cmFja3MubGVuZ3RoKXtcclxuXHRcdFx0dGhpcy5zdG9wKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOaOpee2mlxyXG5cdGNvbm5lY3QoYyl7XHJcblx0XHR2YXIgdHJhY2sgPSBjLmZyb20ucGFyYW0udHJhY2s7XHJcblx0XHRpZihjLmZyb20ucGFyYW0udHlwZSA9PT0gJ3BpdGNoJyl7XHJcblx0XHRcdHRyYWNrLnBpdGNoZXMucHVzaChTZXF1ZW5jZXIubWFrZVByb2Nlc3MoYykpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dHJhY2sudmVsb2NpdGllcy5wdXNoKFNlcXVlbmNlci5tYWtlUHJvY2VzcyhjKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOWJiumZpFxyXG5cdGRpc2Nvbm5lY3QoYyl7XHJcblx0XHR2YXIgdHJhY2sgPSBjLmZyb20ucGFyYW0udHJhY2s7XHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0cmFjay5waXRjaGVzLmxlbmd0aDsrK2kpe1xyXG5cdFx0XHRpZihjLnRvLm5vZGUgPT09IHRyYWNrLnBpdGNoZXNbaV0udG8ubm9kZSAmJiBjLnRvLnBhcmFtID09PSB0cmFjay5waXRjaGVzW2ldLnRvLnBhcmFtKXtcclxuXHRcdFx0XHR0cmFjay5waXRjaGVzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0cmFjay52ZWxvY2l0aWVzLmxlbmd0aDsrK2kpe1xyXG5cdFx0XHRpZihjLnRvLm5vZGUgPT09IHRyYWNrLnZlbG9jaXRpZXNbaV0udG8ubm9kZSAmJiBjLnRvLnBhcmFtID09PSB0cmFjay52ZWxvY2l0aWVzW2ldLnRvLnBhcmFtKXtcclxuXHRcdFx0XHR0cmFjay5waXRjaGVzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBtYWtlUHJvY2VzcyhjKXtcclxuXHRcdGlmKGMudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRyZXR1cm4gIHtcclxuXHRcdFx0XHR0bzpjLnRvLFxyXG5cdFx0XHRcdHByb2Nlc3M6IChjb20sdix0KT0+e1xyXG5cdFx0XHRcdFx0Yy50by5ub2RlLmF1ZGlvTm9kZS5wcm9jZXNzKGMudG8sY29tLHYsdCk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzdG9wOmZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRjLnRvLm5vZGUuYXVkaW9Ob2RlLnN0b3AoYy50byk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0fSBcclxuXHRcdHZhciBwcm9jZXNzO1xyXG5cdFx0aWYoYy50by5wYXJhbS50eXBlID09PSAncGl0Y2gnKXtcclxuXHRcdFx0cHJvY2VzcyA9IChjb20sdix0KSA9PiB7XHJcblx0XHRcdFx0Y29tLnByb2Nlc3NQaXRjaChjLnRvLnBhcmFtLmF1ZGlvUGFyYW0sdix0KTtcclxuXHRcdFx0fTtcdFx0XHRcdFx0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRwcm9jZXNzID1cdChjb20sdix0KT0+e1xyXG5cdFx0XHRcdGNvbS5wcm9jZXNzVmVsb2NpdHkoYy50by5wYXJhbS5hdWRpb1BhcmFtLHYsdCk7XHJcblx0XHRcdH07XHRcdFx0XHRcdFxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dG86Yy50byxcclxuXHRcdFx0cHJvY2Vzczpwcm9jZXNzLFxyXG5cdFx0XHRzdG9wOmZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0Yy50by5wYXJhbS5hdWRpb1BhcmFtLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBleGVjKClcclxuXHR7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShTZXF1ZW5jZXIuZXhlYyk7XHJcblx0XHRcdGxldCBlbmRjb3VudCA9IDA7XHJcblx0XHRcdGZvcih2YXIgaSA9IDAsZSA9IFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aDtpIDwgZTsrK2kpe1xyXG5cdFx0XHRcdHZhciBzZXEgPSBTZXF1ZW5jZXIuc2VxdWVuY2Vyc1tpXTtcclxuXHRcdFx0XHRpZihzZXEuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHRcdFx0c2VxLnByb2Nlc3MoYXVkaW8uY3R4LmN1cnJlbnRUaW1lKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYoc2VxLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5TVE9QUEVEKXtcclxuXHRcdFx0XHRcdCsrZW5kY291bnQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmKGVuZGNvdW50ID09IFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdFNlcXVlbmNlci5zdG9wU2VxdWVuY2VzKCk7XHJcblx0XHRcdFx0aWYoU2VxdWVuY2VyLnN0b3BwZWQpe1xyXG5cdFx0XHRcdFx0U2VxdWVuY2VyLnN0b3BwZWQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g44K344O844Kx44Oz44K55YWo5L2T44Gu44K544K/44O844OIXHJcblx0c3RhdGljIHN0YXJ0U2VxdWVuY2VzKHRpbWUpe1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuU1RPUFBFRCB8fCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QQVVTRUQgKVxyXG5cdFx0e1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQuc3RhcnQodGltZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlBMQVlJTkc7XHJcblx0XHRcdFNlcXVlbmNlci5leGVjKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8vIOOCt+ODvOOCseODs+OCueWFqOS9k+OBruWBnOatolxyXG5cdHN0YXRpYyBzdG9wU2VxdWVuY2VzKCl7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QTEFZSU5HIHx8IFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBBVVNFRCApe1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQuc3RvcCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8g44K344O844Kx44Oz44K55YWo5L2T44Gu44Od44O844K6XHRcclxuXHRzdGF0aWMgcGF1c2VTZXF1ZW5jZXMoKXtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQucGF1c2UoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuUEFVU0VEO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuU2VxdWVuY2VyLnNlcXVlbmNlcnMgPSBbXTtcclxuU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5TVE9QUEVEOyBcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgVVVJRCBmcm9tICcuL3V1aWQuY29yZSc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9FdmVudEVtaXR0ZXIzJztcclxuZXhwb3J0IGNvbnN0IG5vZGVIZWlnaHQgPSA1MDtcclxuZXhwb3J0IGNvbnN0IG5vZGVXaWR0aCA9IDEwMDtcclxuZXhwb3J0IGNvbnN0IHBvaW50U2l6ZSA9IDE2O1xyXG5cclxuLy8gcGFuZWwgd2luZG93XHJcbmV4cG9ydCBjbGFzcyBQYW5lbCAgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKHNlbCxwcm9wKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRpZighcHJvcCB8fCAhcHJvcC5pZCl7XHJcblx0XHRcdHByb3AgPSBwcm9wID8gKHByb3AuaWQgPSAnaWQtJyArIFVVSUQuZ2VuZXJhdGUoKSxwcm9wKSA6eyBpZDonaWQtJyArIFVVSUQuZ2VuZXJhdGUoKX07XHJcblx0XHR9XHJcblx0XHR0aGlzLmlkID0gcHJvcC5pZDtcclxuXHRcdHNlbCA9IHNlbCB8fCBkMy5zZWxlY3QoJyNjb250ZW50Jyk7XHJcblx0XHR0aGlzLnNlbGVjdGlvbiA9IFxyXG5cdFx0c2VsXHJcblx0XHQuYXBwZW5kKCdkaXYnKVxyXG5cdFx0LmF0dHIocHJvcClcclxuXHRcdC5hdHRyKCdjbGFzcycsJ3BhbmVsJylcclxuXHRcdC5kYXR1bSh0aGlzKTtcclxuXHJcblx0XHQvLyDjg5Hjg43jg6vnlKhEcmFn44Gd44Gu5LuWXHJcblxyXG5cdFx0dGhpcy5oZWFkZXIgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2hlYWRlcicpLmNhbGwodGhpcy5kcmFnKTtcclxuXHRcdHRoaXMuYXJ0aWNsZSA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnYXJ0aWNsZScpO1xyXG5cdFx0dGhpcy5mb290ZXIgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2Zvb3RlcicpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdkaXYnKVxyXG5cdFx0LmNsYXNzZWQoJ3BhbmVsLWNsb3NlJyx0cnVlKVxyXG5cdFx0Lm9uKCdjbGljaycsKCk9PntcclxuXHRcdFx0dGhpcy5kaXNwb3NlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0fVx0XHJcblxyXG5cdGdldCBub2RlKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc2VsZWN0aW9uLm5vZGUoKTtcclxuXHR9XHJcblx0Z2V0IHggKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnbGVmdCcpKTtcclxuXHR9XHJcblx0c2V0IHggKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2xlZnQnLHYgKyAncHgnKTtcclxuXHR9XHJcblx0Z2V0IHkgKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgndG9wJykpO1xyXG5cdH1cclxuXHRzZXQgeSAodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndG9wJyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCB3aWR0aCgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3dpZHRoJykpO1xyXG5cdH1cclxuXHRzZXQgd2lkdGgodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnd2lkdGgnLCB2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCBoZWlnaHQoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdoZWlnaHQnKSk7XHJcblx0fVxyXG5cdHNldCBoZWlnaHQodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnaGVpZ2h0Jyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdFxyXG5cdGRpc3Bvc2UoKXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlbW92ZSgpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRzaG93KCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScsJ3Zpc2libGUnKTtcclxuXHRcdHRoaXMuZW1pdCgnc2hvdycpO1xyXG5cdH1cclxuXHJcblx0aGlkZSgpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtcclxuXHRcdHRoaXMuZW1pdCgnaGlkZScpO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgaXNTaG93KCl7XHJcblx0XHRyZXR1cm4gdGhpcy5zZWxlY3Rpb24gJiYgdGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknKSA9PT0gJ3Zpc2libGUnO1xyXG5cdH1cclxufVxyXG5cclxuUGFuZWwucHJvdG90eXBlLmRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHRcdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdFx0Y29uc29sZS5sb2coZCk7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KCcjJyArIGQuaWQpO1xyXG5cdFx0XHJcblx0XHRkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHQuYXR0cih7aWQ6J3BhbmVsLWR1bW15LScgKyBkLmlkLFxyXG5cdFx0XHQnY2xhc3MnOidwYW5lbCBwYW5lbC1kdW1teSd9KVxyXG5cdFx0LnN0eWxlKHtcclxuXHRcdFx0bGVmdDpzZWwuc3R5bGUoJ2xlZnQnKSxcclxuXHRcdFx0dG9wOnNlbC5zdHlsZSgndG9wJyksXHJcblx0XHRcdHdpZHRoOnNlbC5zdHlsZSgnd2lkdGgnKSxcclxuXHRcdFx0aGVpZ2h0OnNlbC5zdHlsZSgnaGVpZ2h0JylcclxuXHRcdH0pO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIGR1bW15ID0gZDMuc2VsZWN0KCcjcGFuZWwtZHVtbXktJyArIGQuaWQpO1xyXG5cclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkdW1teS5zdHlsZSgnbGVmdCcpKSArIGQzLmV2ZW50LmR4O1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGR1bW15LnN0eWxlKCd0b3AnKSkgKyBkMy5ldmVudC5keTtcclxuXHRcdFxyXG5cdFx0ZHVtbXkuc3R5bGUoeydsZWZ0Jzp4ICsgJ3B4JywndG9wJzp5ICsgJ3B4J30pO1xyXG5cdH0pXHJcblx0Lm9uKCdkcmFnZW5kJyxmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QoJyMnICsgZC5pZCk7XHJcblx0XHR2YXIgZHVtbXkgPSBkMy5zZWxlY3QoJyNwYW5lbC1kdW1teS0nICsgZC5pZCk7XHJcblx0XHRzZWwuc3R5bGUoXHJcblx0XHRcdHsnbGVmdCc6ZHVtbXkuc3R5bGUoJ2xlZnQnKSwndG9wJzpkdW1teS5zdHlsZSgndG9wJyl9XHJcblx0XHQpO1xyXG5cdFx0ZHVtbXkucmVtb3ZlKCk7XHJcblx0fSk7XHJcblx0XHJcbiIsIi8qXG4gVmVyc2lvbjogY29yZS0xLjBcbiBUaGUgTUlUIExpY2Vuc2U6IENvcHlyaWdodCAoYykgMjAxMiBMaW9zSy5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBVVUlEKCl7fVVVSUQuZ2VuZXJhdGU9ZnVuY3Rpb24oKXt2YXIgYT1VVUlELl9ncmksYj1VVUlELl9oYTtyZXR1cm4gYihhKDMyKSw4KStcIi1cIitiKGEoMTYpLDQpK1wiLVwiK2IoMTYzODR8YSgxMiksNCkrXCItXCIrYigzMjc2OHxhKDE0KSw0KStcIi1cIitiKGEoNDgpLDEyKX07VVVJRC5fZ3JpPWZ1bmN0aW9uKGEpe3JldHVybiAwPmE/TmFOOjMwPj1hPzB8TWF0aC5yYW5kb20oKSooMTw8YSk6NTM+PWE/KDB8MTA3Mzc0MTgyNCpNYXRoLnJhbmRvbSgpKSsxMDczNzQxODI0KigwfE1hdGgucmFuZG9tKCkqKDE8PGEtMzApKTpOYU59O1VVSUQuX2hhPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPWEudG9TdHJpbmcoMTYpLGQ9Yi1jLmxlbmd0aCxlPVwiMFwiOzA8ZDtkPj4+PTEsZSs9ZSlkJjEmJihjPWUrYyk7cmV0dXJuIGN9O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4uL3NyYy9hdWRpbyc7XHJcbmltcG9ydCB7aW5pdFVJLGRyYXcsc3ZnLGNyZWF0ZUF1ZGlvTm9kZVZpZXcgfSBmcm9tICcuLi9zcmMvZHJhdyc7XHJcblxyXG5cclxuZGVzY3JpYmUoJ0F1ZGlvTm9kZVRlc3QnLCAoKSA9PiB7XHJcblx0YXVkaW8uY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xyXG5cdHZhciBvc2MsIGdhaW4sIGZpbHRlciwgb3V0LCBvc2MyLCBzcGxpdHRlciwgbWVyZ2VyLGVnLHNlcTtcclxuXHJcblx0YmVmb3JlRWFjaCgoKSA9PiB7XHJcblxyXG5cdH0pO1xyXG5cclxuXHRpdChcImF1ZGlvLkF1ZGlvTm9kZVZpZXfov73liqBcIiwgKCkgPT4ge1xyXG5cclxuXHRcdG9zYyA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5jcmVhdGVPc2NpbGxhdG9yKCkpO1xyXG5cdFx0b3NjLnggPSAxMDA7XHJcblx0XHRvc2MueSA9IDIwMDtcclxuXHJcblx0XHRnYWluID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZUdhaW4oKSk7XHJcblxyXG5cdFx0Z2Fpbi54ID0gNDAwO1xyXG5cdFx0Z2Fpbi55ID0gMjAwO1xyXG5cclxuXHRcdGZpbHRlciA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5jcmVhdGVCaXF1YWRGaWx0ZXIoKSk7XHJcblx0XHRmaWx0ZXIueCA9IDI1MDtcclxuXHRcdGZpbHRlci55ID0gMzMwO1xyXG5cclxuXHRcdG91dCA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5kZXN0aW5hdGlvbik7XHJcblx0XHRvdXQueCA9IDc1MDtcclxuXHRcdG91dC55ID0gMzAwO1xyXG5cclxuXHJcblx0XHRvc2MyID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZU9zY2lsbGF0b3IoKSk7XHJcblx0XHRvc2MyLnggPSAxMDA7XHJcblx0XHRvc2MyLnkgPSA2MDA7XHJcblxyXG5cdFx0c3BsaXR0ZXIgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguY3JlYXRlQ2hhbm5lbFNwbGl0dGVyKCkpO1xyXG5cdFx0c3BsaXR0ZXIueCA9IDI1MDtcclxuXHRcdHNwbGl0dGVyLnkgPSA2MDA7XHJcblxyXG5cdFx0bWVyZ2VyID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxNZXJnZXIoKSk7XHJcblx0XHRtZXJnZXIueCA9IDUwMDtcclxuXHRcdG1lcmdlci55ID0gNjAwO1xyXG5cdFx0XHJcblx0XHRlZyA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKG5ldyBhdWRpby5FRygpKTtcclxuXHRcdGVnLnggPSAxMDA7XHJcblx0XHRlZy55ID0gNDAwO1xyXG5cdFx0c2VxID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUobmV3IGF1ZGlvLlNlcXVlbmNlcigpKTtcclxuXHRcdHNlcS54ID0gMjAwO1xyXG5cdFx0c2VxLnkgPSA0MDA7XHJcblxyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGgpLnRvRXF1YWwoOSk7XHJcblx0fSk7XHJcblxyXG5cdGl0KCfjgrPjg43jgq/jgrfjg6fjg7Pov73liqDlvozjg4Hjgqfjg4Pjgq8nLCAoKSA9PiB7XHJcblxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KG9zYywgZmlsdGVyKTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChvc2MsIGdhaW4uaW5wdXRQYXJhbXNbMF0pO1xyXG5cdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoZmlsdGVyLCBnYWluKTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChnYWluLCBvdXQpO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KG1lcmdlciwgb3V0KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMCB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDAgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDEgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAxIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAyIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMyB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMyB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDIgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDUgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiA1IH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiA0IH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogNCB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChvc2MyLCBzcGxpdHRlcik7XHJcblx0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTplZyxwYXJhbTplZy5vdXRwdXR9LHtub2RlOmdhaW4scGFyYW06Z2Fpbi5pbnB1dFBhcmFtc1swXX0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOnNlcSxwYXJhbTpzZXEudHJrMGd9LHtub2RlOmVnLHBhcmFtOmVnLmdhdGV9KTtcclxuXHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aCkudG9FcXVhbCgxNCk7XHJcblx0fSk7XHJcblx0XHRcclxuXHJcblx0aXQoJ+ODjuODvOODieWJiumZpCcsICgpID0+IHtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKG9zYyk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShzZXEpO1xyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGgpLnRvRXF1YWwoNyk7XHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aCkudG9FcXVhbCgxMSk7XHJcblx0XHRleHBlY3QoYXVkaW8uU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoKS50b0VxdWFsKDApOyBcclxuXHR9KTtcclxuXHRcclxuXHRpdCgn44Kz44ON44Kv44K344On44Oz5YmK6ZmkJywoKT0+e1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KHtub2RlOmVnLHBhcmFtOmVnLm91dHB1dH0se25vZGU6Z2FpbixwYXJhbTpnYWluLmlucHV0UGFyYW1zWzBdfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDAgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAwIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAxIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMSB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMiB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDMgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDMgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAyIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiA1IH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogNSB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogNCB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDQgfSk7XHJcblx0XHRcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoKS50b0VxdWFsKDQpO1xyXG5cdH0pO1xyXG5cclxuXHRpdCgn44OV44Kj44Or44K/44O85YmK6Zmk5b6M44OB44Kn44OD44KvJywgKCkgPT4ge1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUoZmlsdGVyKTtcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoKS50b0VxdWFsKDYpO1xyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGgpLnRvRXF1YWwoMyk7XHJcblx0XHRleHBlY3QoKCgpID0+IHtcclxuXHRcdFx0dmFyIHJldCA9IDA7XHJcblx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5mb3JFYWNoKChkKSA9PiB7XHJcblx0XHRcdFx0aWYgKGQuZnJvbS5ub2RlID09PSBmaWx0ZXIgfHwgZC50by5ub2RlID09PSBmaWx0ZXIpIHtcclxuXHRcdFx0XHRcdCsrcmV0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRcdHJldHVybiByZXQ7XHJcblx0XHR9KSgpKS50b0VxdWFsKDApO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGl0KCfjg47jg7zjg4nlhajliYrpmaQnLCgpPT57XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShlZyk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShnYWluKTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKG91dCk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShzcGxpdHRlcik7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShtZXJnZXIpO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUob3NjMik7XHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aCkudG9FcXVhbCgwKTtcclxuXHR9KTtcclxuXHRcclxuXHRpdCgn5o+P55S744GX44Gm44G/44KLJywoKT0+e1xyXG5cdFx0Ly9cdG9zYy5hdWRpb05vZGUudHlwZSA9ICdzYXd0b290aCc7XHJcblx0XHRcclxuXHRcdHZhciBjb250ZW50ID0gZDMuc2VsZWN0KCdib2R5JykuYXBwZW5kKCdkaXYnKS5hdHRyKCdpZCcsJ2NvbnRlbnQnKS5jbGFzc2VkKCdjb250ZW50Jyx0cnVlKTtcclxuXHRcdHZhciBwbGF5ZXIgPSBjb250ZW50LmFwcGVuZCgnZGl2JykuYXR0cih7aWQ6J3BsYXllcicsY2xhc3M6J3BsYXllcid9KTtcclxuXHRcdHBsYXllci5hcHBlbmQoJ2J1dHRvbicpLmF0dHIoe2lkOidwbGF5JyxjbGFzczoncGxheSd9KS50ZXh0KCfilrwnKTtcclxuXHRcdHBsYXllci5hcHBlbmQoJ2J1dHRvbicpLmF0dHIoe2lkOidzdG9wJyxjbGFzczonc3RvcCd9KS50ZXh0KCfilqAnKTtcclxuXHRcdHBsYXllci5hcHBlbmQoJ2J1dHRvbicpLmF0dHIoe2lkOidwYXVzZScsY2xhc3M6J3BhdXNlJ30pLnRleHQoJ++8nScpO1xyXG5cclxuXHRcdGluaXRVSSgpO1xyXG5cdFx0XHJcblx0XHQvLyDjgrPjg43jgq/jgrfjg6fjg7NcclxuXHRcdFxyXG5cdFx0bGV0IG91dCA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlc1swXTtcclxuXHRcdGxldCBvc2MgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdPc2NpbGxhdG9yJyk7XHJcblx0XHRvc2MueCA9IDQwMDtcclxuXHRcdG9zYy55ID0gMzAwO1xyXG5cdFx0bGV0IGdhaW4gPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdHYWluJyk7XHJcblx0XHRnYWluLnggPSA1NTA7XHJcblx0XHRnYWluLnkgPSAyMDA7XHJcblx0XHRsZXQgc2VxID0gY3JlYXRlQXVkaW9Ob2RlVmlldygnU2VxdWVuY2VyJyk7XHJcblx0XHRzZXEueCA9IDUwO1xyXG5cdFx0c2VxLnkgPSAzMDA7XHJcblx0XHRsZXQgZWcgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdFRycpO1xyXG5cdFx0ZWcueCA9IDIwMDtcclxuXHRcdGVnLnkgPSAyMDA7XHJcblx0XHRcclxuXHRcdC8vIOaOpee2mlxyXG5cdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6c2VxLHBhcmFtOnNlcS50cmswZ30se25vZGU6ZWcscGFyYW06ZWcuZ2F0ZX0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpzZXEscGFyYW06c2VxLnRyazBwfSx7bm9kZTpvc2MscGFyYW06b3NjLmZyZXF1ZW5jeX0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpvc2MscGFyYW06MH0se25vZGU6Z2FpbixwYXJhbTowfSk7XHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOmVnLHBhcmFtOmVnLm91dHB1dH0se25vZGU6Z2FpbixwYXJhbTpnYWluLmdhaW59KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6Z2FpbixwYXJhbTowfSx7bm9kZTpvdXQscGFyYW06MH0pO1x0XHJcblxyXG5cdFx0Ly8g44Kz44ON44Kv44K344On44OzXHJcblx0XHRcclxuXHRcdGxldCBvdXQxID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzWzBdO1xyXG5cdFx0bGV0IG9zYzEgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdPc2NpbGxhdG9yJyk7XHJcblx0XHRvc2MxLnggPSA0MDA7XHJcblx0XHRvc2MxLnkgPSA1MDA7XHJcblx0XHRsZXQgZ2FpbjEgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdHYWluJyk7XHJcblx0XHRnYWluMS54ID0gNTUwO1xyXG5cdFx0Z2FpbjEueSA9IDQwMDtcclxuXHRcdGxldCBlZzEgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdFRycpO1xyXG5cdFx0ZWcxLnggPSAyMDA7XHJcblx0XHRlZzEueSA9IDQwMDtcclxuXHRcdFxyXG5cdFx0Ly8g5o6l57aaXHJcblx0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpzZXEscGFyYW06c2VxLnRyazFnfSx7bm9kZTplZzEscGFyYW06ZWcxLmdhdGV9KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6c2VxLHBhcmFtOnNlcS50cmsxcH0se25vZGU6b3NjMSxwYXJhbTpvc2MxLmZyZXF1ZW5jeX0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpvc2MxLHBhcmFtOjB9LHtub2RlOmdhaW4xLHBhcmFtOjB9KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6ZWcxLHBhcmFtOmVnMS5vdXRwdXR9LHtub2RlOmdhaW4xLHBhcmFtOmdhaW4xLmdhaW59KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6Z2FpbjEscGFyYW06MH0se25vZGU6b3V0LHBhcmFtOjB9KTtcdFxyXG5cclxuXHRcdFxyXG5cdFx0Ly8g44K344O844Kx44Oz44K544OH44O844K/44Gu5oy/5YWlXHJcblx0XHRzZXEuYXVkaW9Ob2RlLmJwbSA9IDEyMDtcclxuXHRcdHNlcS5hdWRpb05vZGUudHJhY2tzWzBdLmV2ZW50cy5wdXNoKG5ldyBhdWRpby5Ob3RlRXZlbnQoNDgsNDcsNikpO1xyXG5cdFx0Zm9yKHZhciBpID0gNDg7aTwgMTEwOysraSl7XHJcblx0XHRcdHNlcS5hdWRpb05vZGUudHJhY2tzWzBdLmV2ZW50cy5wdXNoKG5ldyBhdWRpby5Ob3RlRXZlbnQoNDgsaSw2KSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHNlcS5hdWRpb05vZGUudHJhY2tzWzFdLmV2ZW50cy5wdXNoKG5ldyBhdWRpby5Ob3RlRXZlbnQoMTkyLDAsNikpO1xyXG5cdFx0Zm9yKHZhciBpID0gNDc7aTwgMTEwOysraSl7XHJcblx0XHRcdHNlcS5hdWRpb05vZGUudHJhY2tzWzFdLmV2ZW50cy5wdXNoKG5ldyBhdWRpby5Ob3RlRXZlbnQoNDgsaSw2KSk7XHJcblx0XHR9XHJcblx0XHRkcmF3KCk7XHJcblx0XHRleHBlY3QodHJ1ZSkudG9CZSh0cnVlKTtcclxuXHR9KTtcclxuXHRcclxuXHRcclxuXHRcclxuXHRcclxufSk7Il19
