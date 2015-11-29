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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SequenceEditor = undefined;
exports.showSequenceEditor = showSequenceEditor;

var _audio = require('./audio');

var audio = _interopRequireWildcard(_audio);

var _ui = require('./ui');

var ui = _interopRequireWildcard(_ui);

var _undo = require('./undo');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

const InputType = {
  keybord: 0,
  midi: 1
};

const InputCommand = {
  enter: 1,
  esc: 2,
  right: 3,
  left: 4,
  up: 5,
  down: 6,
  insertMeasure: 7,
  undo: 8,
  redo: 9,
  pageUp: 10,
  pageDown: 11,
  home: 12,
  end: 13,
  number: 14,
  note: 15,
  scrollUp: 16,
  scrollDown: 17,
  delete: 18,
  linePaste: 19
};

//
const KeyBind = {
  13: [{
    keyCode: 13,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.enter
  }],
  27: [{
    keyCode: 27,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.esc
  }],
  32: [{
    keyCode: 32,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.right
  }],
  39: [{
    keyCode: 39,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.right
  }],
  37: [{
    keyCode: 37,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.left
  }],
  38: [{
    keyCode: 38,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.up
  }],
  40: [{
    keyCode: 40,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.down
  }],
  106: [{
    keyCode: 106,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.insertMeasure
  }],
  90: [{
    keyCode: 90,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.undo
  }],
  89: [{
    keyCode: 89,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.redo
  }],
  33: [{
    keyCode: 33,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.pageUp
  }, {
    keyCode: 33,
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.scrollUp
  }],
  82: [{
    keyCode: 82,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.pageUp
  }],
  34: [{
    keyCode: 34,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.pageDown
  }, {
    keyCode: 34,
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.scrollDown
  }],
  67: [{
    keyCode: 67,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.pageDown
  }, {
    keyCode: 67,
    note: 'C',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 67,
    note: 'C',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  36: [{
    keyCode: 36,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.home
  }],
  35: [{
    keyCode: 35,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.end
  }],
  96: [{
    keyCode: 96,
    number: 0,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  97: [{
    keyCode: 97,
    number: 1,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  98: [{
    keyCode: 98,
    number: 2,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  99: [{
    keyCode: 99,
    number: 3,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  100: [{
    keyCode: 100,
    number: 4,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  101: [{
    keyCode: 101,
    number: 5,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  102: [{
    keyCode: 102,
    number: 6,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  103: [{
    keyCode: 103,
    number: 7,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  104: [{
    keyCode: 104,
    number: 8,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  105: [{
    keyCode: 105,
    number: 9,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.number
  }],
  65: [{
    keyCode: 65,
    note: 'A',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 65,
    note: 'A',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  66: [{
    keyCode: 66,
    note: 'B',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 66,
    note: 'B',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  68: [{
    keyCode: 68,
    note: 'D',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 68,
    note: 'D',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  69: [{
    keyCode: 69,
    note: 'E',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 69,
    note: 'E',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  70: [{
    keyCode: 70,
    note: 'F',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 70,
    note: 'F',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  71: [{
    keyCode: 71,
    note: 'G',
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }, {
    keyCode: 71,
    note: 'G',
    ctrlKey: false,
    shiftKey: true,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.note
  }],
  46: [{
    keyCode: 46,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.delete
  }],
  76: [{
    keyCode: 76,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.linePaste
  }]
};

let SequenceEditor = exports.SequenceEditor = function SequenceEditor(sequencer) {
  var _this2 = this;

  _classCallCheck(this, SequenceEditor);

  var self_ = this;
  this.undoManager = new _undo.UndoManager();
  this.sequencer = sequencer;
  sequencer.panel = new ui.Panel();
  sequencer.panel.x = sequencer.x;
  sequencer.panel.y = sequencer.y;
  sequencer.panel.width = 1024;
  sequencer.panel.height = 768;
  sequencer.panel.header.text('Sequence Editor');
  var editor = sequencer.panel.article.append('div').classed('seq-editor', true);
  var div = editor.append('div').classed('header', true);

  // タイムベース
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

  // テンポ
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

  // テストデータ
  for (var i = 0; i < 127; i += 8) {
    for (var j = i; j < i + 8; ++j) {
      sequencer.audioNode.tracks[0].addEvent(new audio.NoteEvent(48, j, 6));
    }
    sequencer.audioNode.tracks[0].addEvent(new audio.Measure());
  }

  // トラックエディタメイン

  trackEdit.each(function (d) {
    if (!this.editor) {
      this.editor = doEditor(d3.select(this), self_);
      this.editor.next();
      this.sequencer = sequencer;
    }
  });

  // キー入力ハンドラ
  trackEdit.on('keydown', function (d) {
    var _this4 = this;

    let e = d3.event;
    console.log(e.keyCode);
    let key = KeyBind[e.keyCode];
    let ret = {};
    if (key) {
      key.some(function (d) {
        if (d.ctrlKey == e.ctrlKey && d.shiftKey == e.shiftKey && d.altKey == e.altKey && d.metaKey == e.metaKey) {
          ret = _this4.editor.next(d);
          return true;
        }
      });
      if (ret.value) {
        d3.event.preventDefault();
        d3.event.cancelBubble = true;
        return false;
      }
    }
  });

  sequencer.panel.on('show', function () {
    d3.select('#time-base').node().focus();
  });

  sequencer.panel.on('dispose', function () {
    delete sequencer.editorInstance;
  });

  sequencer.panel.show();
};

// エディタ本体

function* doEditor(trackEdit, seqEditor) {
  let keycode = 0; // 入力されたキーコードを保持する変数
  let track = trackEdit.datum(); // 現在編集中のトラック
  let editView = d3.select('#' + trackEdit.attr('id') + '-events'); //編集画面のセレクション
  let measure = 1; // 小節
  let step = 1; // ステップNo
  let rowIndex = 0; // 編集画面の現在行
  let currentEventIndex = 0; // イベント配列の編集開始行
  let cellIndex = 2; // 列インデックス
  let cancelEvent = false; // イベントをキャンセルするかどうか
  let lineBuffer = []; //行バッファ
  const NUM_ROW = 47; // １画面の行数

  function setInput() {
    this.attr('contentEditable', 'true');
    this.on('focus', function () {
      console.log(this.parentNode.rowIndex - 1);
      rowIndex = this.parentNode.rowIndex - 1;
      cellIndex = this.cellIndex;
    });
  }

  // 既存イベントの表示
  function drawEvent() {
    let evflagment = track.events.slice(currentEventIndex, currentEventIndex + NUM_ROW);
    editView.selectAll('tr').remove();
    let select = editView.selectAll('tr').data(evflagment);
    let enter = select.enter();
    let rows = enter.append('tr').attr('data-index', function (d, i) {
      return i;
    });
    rows.each(function (d, i) {
      let row = d3.select(this);
      //rowIndex = i;
      switch (d.type) {
        case audio.EventType.Note:
          row.append('td').text(d.measure); // Measeure #
          row.append('td').text(d.stepNo); // Step #
          row.append('td').text(d.name).call(setInput) // Note
          .on('blur', function (d) {
            d.setNoteNameToNote(this.innerText);
            this.innerText = d.name;
            // NoteNo表示も更新
            this.parentNode.cells[3].innerText = d.note;
          }); // Note
          row.append('td').text(d.note).call(setInput) // Note #
          .on('blur', function (d) {
            d.note = parseFloat(this.innerText);
            this.parentNode.cells[2].innerText = d.name;
          });
          row.append('td').text(d.step).call(setInput) // Step
          .on('blur', function (d) {
            d.step = parseInt(this.innerText);
          });
          row.append('td').text(d.gate).call(setInput); // Gate
          row.append('td').text(d.vel).call(setInput); // Velocity
          row.append('td').text(d.com).call(setInput); // Command
          break;
        case audio.EventType.Measure:
          row.append('td').text(''); // Measeure #
          row.append('td').text(''); // Step #
          row.append('td').attr({ 'colspan': 6, 'tabindex': 0 }).text(' --- (' + d.stepTotal + ') --- ').on('focus', function () {
            rowIndex = this.parentNode.rowIndex - 1;
          });
          break;
        case audio.EventType.TrackEnd:
          row.append('td').text(''); // Measeure #
          row.append('td').text(''); // Step #
          row.append('td').attr({ 'colspan': 6, 'tabindex': 0 }).text(' --- Track End --- ').on('focus', function () {
            rowIndex = this.parentNode.rowIndex - 1;
          });
          ;
          break;
      }
    });

    if (rowIndex > evflagment.length - 1) {
      rowIndex = evflagment.length - 1;
    }
  }

  // イベントのフォーカス
  function focusEvent() {
    let evrow = d3.select(editView.node().rows[rowIndex]);
    let ev = evrow.datum();
    switch (ev.type) {
      case audio.EventType.Note:
        editView.node().rows[rowIndex].cells[cellIndex].focus();
        break;
      case audio.EventType.Measure:
        editView.node().rows[rowIndex].cells[2].focus();
        break;
      case audio.EventType.TrackEnd:
        editView.node().rows[rowIndex].cells[2].focus();
        break;
    }
  }

  // イベントの挿入
  function insertEvent(rowIndex) {
    seqEditor.undoManager.exec({
      exec() {
        this.row = editView.node().rows[rowIndex];
        this.cellIndex = cellIndex;
        this.rowIndex = rowIndex;
        this.exec_();
      },
      exec_() {
        var row = d3.select(editView.node().insertRow(this.rowIndex)).datum(new audio.NoteEvent());
        cellIndex = 2;
        row.append('td'); // Measeure #
        row.append('td'); // Step #
        row.append('td').call(setInput).on('blur', function (d) {
          if (this.innerText != '' && d.setNoteNameToNote(this.innerText)) {
            this.innerText = d.name;
            // NoteNo表示も更新
            this.parentNode.cells[3].innerText = d.note;
          }
        }); // Note
        row.append('td').call(setInput); // Note #
        row.append('td').call(setInput); // Step
        row.append('td').call(setInput); // Gate
        row.append('td').call(setInput); // Velocity
        row.append('td').call(setInput); // Command
        row.node().cells[this.cellIndex].focus();
        row.attr('data-new', true);
      },
      redo() {
        this.exec_();
      },
      undo() {
        editView.node().deleteRow(this.rowIndex);
        this.row.cells[this.cellIndex].focus();
      }
    });
  }

  // 新規入力行の確定
  function endNewInput() {
    let down = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

    d3.select(editView.node().rows[rowIndex]).attr('data-new', null);
    // 1つ前のノートデータを検索する
    let beforeCells = [];
    let sr = rowIndex - 1;
    while (sr >= 0) {
      var target = d3.select(editView.node().rows[sr]);
      if (target.datum().type === audio.EventType.Note) {
        beforeCells = target.node().cells;
        break;
      }
      --sr;
    }
    // 現在の編集行
    let curRow = editView.node().rows[rowIndex].cells;
    let ev = d3.select(editView.node().rows[rowIndex]).datum();
    // エベントを生成する
    // データが何も入力されていないときは、1つ前のノートデータを複製する。
    // 1つ前のノートデータがないときや不正データの場合は、デフォルト値を代入する。
    let noteNo = 0;
    if (cellIndex == 2) {
      let note = editView.node().rows[rowIndex].cells[cellIndex].innerText;
      ev.setNoteNameToNote(note, beforeCells[2] ? beforeCells[2].innerText : '');
      noteNo = ev.note;
    } else {
      noteNo = parseFloat(curRow[3].innerText || (beforeCells[3] ? beforeCells[3].innerText : '60'));
    }
    if (isNaN(noteNo)) noteNo = 60;
    let step = parseFloat(curRow[4].innerText || (beforeCells[4] ? beforeCells[4].innerText : '96'));
    if (isNaN(step)) step = 96;
    let gate = parseFloat(curRow[5].innerText || (beforeCells[5] ? beforeCells[5].innerText : '24'));
    if (isNaN(gate)) gate = 24;
    let vel = parseFloat(curRow[6].innerText || (beforeCells[6] ? beforeCells[6].innerText : '1.0'));
    if (isNaN(vel)) vel = 1.0;
    let com = /*curRow[7].innerText || beforeCells[7]?beforeCells[7].innerText:*/new audio.Command();

    ev.note = noteNo;
    ev.step = step;
    ev.gate = gate;
    ev.vel = vel;
    ev.command = com;
    //            var ev = new audio.NoteEvent(step, noteNo, gate, vel, com);
    // トラックにデータをセット
    track.insertEvent(ev, rowIndex + currentEventIndex);
    if (down) {
      if (rowIndex == NUM_ROW - 1) {
        ++currentEventIndex;
      } else {
        ++rowIndex;
      }
    }
    // 挿入後、再描画
    drawEvent();
    focusEvent();
  }

  drawEvent();
  while (true) {
    console.log('new line', rowIndex, track.events.length);
    if (track.events.length == 0 || rowIndex > track.events.length - 1) {}
    keyloop: while (true) {
      let input = yield cancelEvent;
      switch (input.inputCommand) {
        case InputCommand.enter:
          //Enter
          console.log('CR/LF');
          // 現在の行が新規か編集中か
          let flag = d3.select(editView.node().rows[rowIndex]).attr('data-new');
          if (flag) {
            endNewInput();
          } else {
            //新規編集中の行でなければ、新規入力用行を挿入
            insertEvent(rowIndex);
          }
          cancelEvent = true;
          break;
        case InputCommand.right:
          // right Cursor
          {
            cellIndex++;
            let curRow = editView.node().rows;
            if (cellIndex > curRow[rowIndex].cells.length - 1) {
              cellIndex = 2;
              if (rowIndex < curRow.length - 1) {
                if (d3.select(curRow[rowIndex]).attr('data-new')) {
                  endNewInput();
                } else {
                  ++rowIndex;
                }
              } else {
                cancelEvent = true;
                break;
              }
            }
            focusEvent();
            cancelEvent = true;
          }
          break;
        case InputCommand.number:
          {
            let curRow = editView.node().rows[rowIndex];
            let curData = d3.select(curRow).datum();
            if (curData.type != audio.EventType.Note) {
              //新規編集中の行でなければ、新規入力用行を挿入
              insertEvent(rowIndex);
              cellIndex = 3;
              let cell = editView.node().rows[rowIndex].cells[cellIndex];
              cell.innerText = input.number;
              let sel = window.getSelection();
              sel.collapse(cell, 1);
              // sel.select();
              cancelEvent = true;
            } else {
              cancelEvent = false;
            }
          }
          break;
        case InputCommand.note:
          {
            let curRow = editView.node().rows[rowIndex];
            let curData = d3.select(curRow).datum();
            if (curData.type != audio.EventType.Note) {
              //新規編集中の行でなければ、新規入力用行を挿入
              insertEvent(rowIndex);
              let cell = editView.node().rows[rowIndex].cells[cellIndex];
              cell.innerText = input.note;
              let sel = window.getSelection();
              sel.collapse(cell, 1);
              // sel.select();
              cancelEvent = true;
            } else {
              cancelEvent = false;
            }
          }
          break;
        case InputCommand.left:
          // left Cursor
          {
            let curRow = editView.node().rows;
            --cellIndex;
            if (cellIndex < 2) {
              if (rowIndex == 0) {} else {
                if (d3.select(curRow[rowIndex]).attr('data-new')) {
                  endNewInput(false);
                }
                --rowIndex;
                cellIndex = editView.node().rows[rowIndex].cells.length - 1;
              }
            }
            focusEvent();
            cancelEvent = true;
          }
          break;
        case InputCommand.up:
          // Up Cursor
          {
            let curRow = editView.node().rows;
            if (d3.select(curRow[rowIndex]).attr('data-new')) {
              endNewInput(false);
            }
            if (rowIndex > 0) {
              --rowIndex;
              focusEvent();
            } else {
              if (currentEventIndex > 0) {
                --currentEventIndex;
                drawEvent();
                rowIndex = 0;
                focusEvent();
              }
            }
            cancelEvent = true;
          }
          break;
        case InputCommand.down:
          // Down Cursor
          {
            let curRow = editView.node().rows;
            if (d3.select(curRow[rowIndex]).attr('data-new')) {
              endNewInput(false);
            }
            if (rowIndex == NUM_ROW - 1) {
              if (currentEventIndex + NUM_ROW <= track.events.length - 1) {
                ++currentEventIndex;
                drawEvent();
                focusEvent();
              }
            } else {
              ++rowIndex;
              focusEvent();
            }
            cancelEvent = true;
          }
          break;
        case InputCommand.pageDown:
          // Page Down キー
          {
            if (currentEventIndex < track.events.length - 1) {
              currentEventIndex += NUM_ROW;
              if (currentEventIndex > track.events.length - 1) {
                currentEventIndex -= NUM_ROW;
              } else {
                drawEvent();
              }
              focusEvent();
            }
            cancelEvent = true;
          }
          break;
        case InputCommand.pageUp:
          // Page Up キー
          {
            if (currentEventIndex > 0) {
              currentEventIndex -= NUM_ROW;
              if (currentEventIndex < 0) {
                currentEventIndex = 0;
              }
              drawEvent();
              focusEvent();
            }
            cancelEvent = true;
          }
          break;
        // スクロールアップ
        case InputCommand.scrollUp:
          {
            if (currentEventIndex > 0) {
              --currentEventIndex;
              drawEvent();
              focusEvent();
            }
          }
          break;
        // スクロールダウン
        case InputCommand.scrollDown:
          {
            if (currentEventIndex + NUM_ROW <= track.events.length - 1) {
              ++currentEventIndex;
              drawEvent();
              focusEvent();
            }
          }
          break;
        // 先頭行に移動
        case InputCommand.home:
          if (currentEventIndex > 0) {
            rowIndex = 0;
            currentEventIndex = 0;
            drawEvent();
            focusEvent();
          }
          cancelEvent = true;
          break;
        // 最終行に移動
        case InputCommand.end:
          if (currentEventIndex != track.events.length - 1) {
            rowIndex = 0;
            currentEventIndex = track.events.length - 1;
            drawEvent();
            focusEvent();
          }
          cancelEvent = true;
          break;
        // 行削除
        case InputCommand.delete:
          {
            seqEditor.undoManager.exec({
              exec() {
                this.rowIndex = rowIndex;
                this.currentEventIndex = currentEventIndex;
                this.event = track.events[this.rowIndex];
                this.rowData = track.events[this.currentEventIndex + this.rowIndex];
                editView.node().deleteRow(this.rowIndex);
                this.lineBuffer = lineBuffer;
                lineBuffer = this.event;
                track.deleteEvent(this.currentEventIndex + this.rowIndex);
                drawEvent();
                focusEvent();
              },
              redo() {
                this.lineBuffer = lineBuffer;
                lineBuffer = this.event;
                editView.node().deleteRow(this.rowIndex);
                track.deleteEvent(this.currentEventIndex + this.rowIndex);
                drawEvent();
                focusEvent();
              },
              undo() {
                lineBuffer = this.lineBuffer;
                track.insertEvent(this.event, this.currentEventIndex + this.rowIndex);
                drawEvent();
                focusEvent();
              }
            });
          }
          break;
        // redo  
        case InputCommand.redo:
          seqEditor.undoManager.redo();
          cancelEvent = true;
          break;
        // undo 
        case InputCommand.undo:
          seqEditor.undoManager.undo();
          cancelEvent = true;
          break;
        // 小節線挿入
        case InputCommand.insertMeasure:
          // *
          cancelEvent = true;
          break;
        // デフォルト
        default:
          cancelEvent = false;
          console.log('default');
          break;
      }
    }
  }
}

function showSequenceEditor(d) {
  d3.event.returnValue = false;
  d3.event.preventDefault();
  d3.event.cancelBubble = true;
  if (d.panel && d.panel.isShow) return;
  d.editorInstance = new SequenceEditor(d);
}

},{"./audio":2,"./ui":11,"./undo":12}],10:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Sequencer = exports.NUM_OF_TRACKS = exports.SEQ_STATUS = exports.Track = exports.NoteEvent = exports.TrackEnd = exports.Measure = exports.EventType = exports.Command = exports.EventBase = undefined;
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

let EventBase = exports.EventBase = function EventBase() {
	let step = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	let name = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

	_classCallCheck(this, EventBase);

	this.step = step;
	this.stepNo = 0;
	this.measure = 0;
	this.name = name;
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

const EventType = exports.EventType = {
	Note: Symbol(),
	Measure: Symbol(),
	TrackEnd: Symbol()
};

// 小節線

let Measure = exports.Measure = (function (_EventBase) {
	_inherits(Measure, _EventBase);

	function Measure() {
		_classCallCheck(this, Measure);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Measure).call(this, 0));

		_this.type = EventType.Measure;
		_this.stepTotal = 0;
		return _this;
	}

	_createClass(Measure, [{
		key: 'process',
		value: function process() {}
	}]);

	return Measure;
})(EventBase);

// Track End

let TrackEnd = exports.TrackEnd = (function (_EventBase2) {
	_inherits(TrackEnd, _EventBase2);

	function TrackEnd() {
		_classCallCheck(this, TrackEnd);

		var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(TrackEnd).call(this, 0));

		_this2.type = EventType.TrackEnd;
		return _this2;
	}

	_createClass(TrackEnd, [{
		key: 'process',
		value: function process() {}
	}]);

	return TrackEnd;
})(EventBase);

var Notes = ['C ', 'C#', 'D ', 'D#', 'E ', 'F ', 'F#', 'G ', 'G#', 'A ', 'A#', 'B '];

let NoteEvent = exports.NoteEvent = (function (_EventBase3) {
	_inherits(NoteEvent, _EventBase3);

	function NoteEvent() {
		let step = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
		let note = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
		let gate = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
		let vel = arguments.length <= 3 || arguments[3] === undefined ? 0.5 : arguments[3];
		let command = arguments.length <= 4 || arguments[4] === undefined ? new Command() : arguments[4];

		_classCallCheck(this, NoteEvent);

		var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(NoteEvent).call(this, step));

		_this3.transpose_ = 0.0;
		_this3.note = note;
		_this3.gate = gate;
		_this3.vel = vel;
		_this3.command = command;
		_this3.command.event = _this3;
		_this3.type = EventType.Note;
		_this3.setNoteName();
		return _this3;
	}

	_createClass(NoteEvent, [{
		key: 'setNoteName',
		value: function setNoteName() {
			let oct = this.note / 12 | 0;
			this.name = Notes[this.note % 12] + oct;
		}
	}, {
		key: 'setNoteNameToNote',
		value: function setNoteNameToNote(noteName) {
			var _this4 = this;

			let defaultNoteName = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];

			var matches = noteName.match(/(C#)|(C)|(D#)|(D)|(E)|(F#)|(F)|(G#)|(G)|(A#)|(A)|(B)/i);
			if (matches) {
				var n = matches[0];
				var getNumber = new RegExp('([0-9]{1,2})');
				//      getNumber.compile();
				getNumber.exec(noteName);
				var o = RegExp.$1;
				if (!o) {
					new RegExp('([0-9]{1,2})').exec(defaultNoteName);
					o = RegExp.$1;
					if (!o) {
						return false;
					}
				}
				if (n.length === 1) n += ' ';

				if (Notes.some(function (d, i) {
					if (d === n) {
						_this4.note = parseFloat(i) + parseFloat(o) * 12;
						return true;
					}
				})) {
					return true;
				} else {
					this.setNoteName();
					return false;
				}
			} else {
				this.setNoteName();
				return false;
			}
		}
	}, {
		key: 'calcPitch',
		value: function calcPitch() {
			this.pitch = 440.0 / 32.0 * Math.pow(2.0, (this.note + this.transpose_ - 9) / 12);
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
			this.setNoteName();
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

		var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(Track).call(this));

		_this5.events = [];
		_this5.pointer = 0;
		_this5.events.push(new TrackEnd());
		prop.defObservable(_this5, 'step');
		prop.defObservable(_this5, 'end');
		prop.defObservable(_this5, 'name');
		prop.defObservable(_this5, 'transpose');

		_this5.step = 0;
		_this5.end = false;
		_this5.pitches = [];
		_this5.velocities = [];
		_this5.sequencer = sequencer;
		_this5.name = '';
		_this5.transpose = 0;
		return _this5;
	}

	_createClass(Track, [{
		key: 'addEvent',
		value: function addEvent(ev) {
			if (this.events.length > 1) {
				var before = this.events[this.events.length - 2];
				switch (before.type) {
					case EventType.Note:
						ev.stepNo = before.stepNo + 1;
						ev.measure = before.measure;
						break;
					case EventType.Measure:
						ev.stepNo = 1;
						ev.measure = before.measure + 1;
						break;
				}
			} else {
				ev.stepNo = 1;
				ev.measure = 1;
			}
			this.events.splice(this.events.length - 1, 0, ev);
			this.calcMeasureStepTotal(this.events.length - 2);
		}
	}, {
		key: 'insertEvent',
		value: function insertEvent(ev, index) {
			if (this.events.length > 1 && index != 0) {
				var before = this.events[index - 1];
				switch (before.type) {
					case EventType.Note:
						ev.stepNo = before.stepNo + 1;
						ev.measure = before.measure;
						break;
					case EventType.Measure:
						ev.stepNo = 1;
						ev.measure = before.measure + 1;
						break;
				}
			} else {
				ev.stepNo = 1;
				ev.measure = 1;
			}
			this.events.splice(index, 0, ev);
			if (ev.type == EventType.Measure) {
				this.updateStepAndMeasure(index);
			} else {
				this.updateStep(index);
			}
			this.calcMeasureStepTotal(index);
		}
	}, {
		key: 'updateStep',
		value: function updateStep(index) {
			for (let i = index + 1, e = this.events.length; i < e; ++i) {
				let before = this.events[i - 1];
				let current = this.events[i];
				switch (before.type) {
					case EventType.Note:
						current.stepNo = before.stepNo + 1;
						current.measure = before.measure;
						break;
					case EventType.Measure:
						break;
						break;
				}
			}
		}
	}, {
		key: 'updateStepAndMeasure',
		value: function updateStepAndMeasure(index) {
			for (let i = index + 1, e = this.events.length; i < e; ++i) {
				let before = this.events[i - 1];
				let current = this.events[i];
				switch (before.type) {
					case EventType.Note:
						current.stepNo = before.stepNo + 1;
						current.measure = before.measure;
						break;
					case EventType.Measure:
						current.stepNo = 1;
						current.measure = before.measure + 1;
						break;
				}
			}
		}
	}, {
		key: 'calcMeasureStepTotal',
		value: function calcMeasureStepTotal(index) {
			let events = this.events;
			let stepTotal = 0;
			let event = events[index];
			if (event.type == EventType.Measure) {
				--index;
				while (index >= 0) {
					let ev = events[index];
					if (ev.type == EventType.Measure) {
						break;
					} else {
						stepTotal += ev.step;
					}
					--index;
				}
				event.stepTotal = stepTotal;
				stepTotal = 0;
				while (index < events.length - 1) {
					++index;
					let ev = events[index];
					if (ev.type == EventType.Measure) {
						ev.stepTotal = stepTotal;
						break;
					} else {
						stepTotal += ev.step;
					}
				}
				return;
			} else {
				// 一つ前のメジャーを探す
				let startIndex = 0;
				if (index == 0) {
					startIndex = 0;
				} else {
					startIndex = index;
					while (startIndex > 0) {
						--startIndex;
						if (this.events[startIndex].type == EventType.Measure) {
							++startIndex;
							break;
						}
					}
				}
				stepTotal = 0;
				while (this.events[startIndex].type == EventType.Note) {
					stepTotal += this.events[startIndex].step;
					++startIndex;
				}
				if (this.events[startIndex].type == EventType.Measure) {
					this.events[startIndex].stepTotal = stepTotal;
				}
			}
		}

		// イベントの削除 

	}, {
		key: 'deleteEvent',
		value: function deleteEvent(index) {
			var ev = this.events[index];
			this.events.splice(index, 1);
			if (index == 0) {
				this.events[0].measure = 1;
				this.events[0].stepNo = 1;
				if (this.events.length > 1) {
					switch (ev.type) {
						case EventType.note:
							this.updateStep(1);
							break;
						case EventType.Measure:
							this.updateStepAndMeasure(1);
							break;
					}
				}
			} else if (index <= this.events.length - 1) {
				switch (ev.type) {
					case EventType.note:
						this.updateStep(index - 1);
						break;
					case EventType.Measure:
						this.updateStepAndMeasure(index - 1);
						break;
				}
			}
			this.calcMeasureStepTotal(index);
		}
	}]);

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

		var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(Sequencer).call(this));

		prop.defObservable(_this6, 'bpm');
		prop.defObservable(_this6, 'tpb');
		prop.defObservable(_this6, 'beat');
		prop.defObservable(_this6, 'bar');
		prop.defObservable(_this6, 'repeat');

		_this6.bpm = 120.0; // tempo
		_this6.tpb = 96.0; // 四分音符の解像度
		_this6.beat = 4;
		_this6.bar = 4; //
		_this6.tracks = [];
		_this6.numberOfInputs = 0;
		_this6.numberOfOutputs = 0;
		_this6.name = 'Sequencer';
		for (var i = 0; i < NUM_OF_TRACKS; ++i) {
			_this6.tracks.push(new Track(_this6));
			_this6['trk' + i + 'g'] = new audio.ParamView(null, 'trk' + i + 'g', true);
			_this6['trk' + i + 'g'].track = _this6.tracks[i];
			_this6['trk' + i + 'g'].type = 'gate';

			_this6['trk' + i + 'p'] = new audio.ParamView(null, 'trk' + i + 'p', true);
			_this6['trk' + i + 'p'].track = _this6.tracks[i];
			_this6['trk' + i + 'p'].type = 'pitch';
		}
		_this6.startTime_ = 0;
		_this6.currentTime_ = 0;
		_this6.currentMeasure_ = 0;
		_this6.calcStepTime();
		_this6.repeat = false;
		_this6.status_ = SEQ_STATUS.STOPPED;

		//
		_this6.on('bpm_chaneged', function () {
			_this6.calcStepTime();
		});
		_this6.on('tpb_chaneged', function () {
			_this6.calcStepTime();
		});

		Sequencer.sequencers.push(_this6);
		if (Sequencer.added) {
			Sequencer.added();
		}
		return _this6;
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

},{"./EventEmitter3":1,"./uuid.core":13}],12:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UndoManager = undefined;

var _EventEmitter2 = require('./EventEmitter3');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

let UndoManager = exports.UndoManager = (function (_EventEmitter) {
  _inherits(UndoManager, _EventEmitter);

  function UndoManager() {
    _classCallCheck(this, UndoManager);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UndoManager).call(this));

    _this.buffer = [];
    _this.index = -1;
    return _this;
  }

  _createClass(UndoManager, [{
    key: 'clear',
    value: function clear() {
      this.buffer.length = 0;
      this.index = -1;
      this.emit('cleared');
    }
  }, {
    key: 'exec',
    value: function exec(command) {
      command.exec();
      if (this.index + 1 < this.buffer.length) {
        this.buffer.length = this.index + 1;
      }
      this.buffer.push(command);
      ++this.index;
      this.emit('executed');
    }
  }, {
    key: 'redo',
    value: function redo() {
      if (this.index + 1 < this.buffer.length) {
        ++this.index;
        var command = this.buffer[this.index];
        command.redo();
        this.emit('redid');
        if (this.index + 1 == this.buffer.length) {
          this.emit('redoEmpty');
        }
      }
    }
  }, {
    key: 'undo',
    value: function undo() {
      if (this.buffer.length > 0 && this.index >= 0) {
        var command = this.buffer[this.index];
        command.undo();
        --this.index;
        this.emit('undid');
        if (this.index < 0) {
          this.index = -1;
          this.emit('undoEmpty');
        }
      }
    }
  }]);

  return UndoManager;
})(_EventEmitter3.default);

var undoManager = new UndoManager();
exports.default = undoManager;

},{"./EventEmitter3":1}],13:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXEV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGF1ZGlvLmpzIiwic3JjXFxhdWRpb05vZGVWaWV3LmpzIiwic3JjXFxkcmF3LmpzIiwic3JjXFxlZy5qcyIsInNyY1xcZXZlbnRFbWl0dGVyMy5qcyIsInNyY1xccHJvcC5qcyIsInNyY1xcc2NyaXB0LmpzIiwic3JjXFxzZXF1ZW5jZUVkaXRvci5qcyIsInNyY1xcc2VxdWVuY2VyLmpzIiwic3JjXFx1aS5qcyIsInNyY1xcdW5kby5qcyIsInNyY1xcdXVpZC5jb3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7Ozs7Ozs7QUFBWSxDQUFDOzs7O2tCQWlDVyxZQUFZO0FBdkJwQyxJQUFJLE1BQU0sR0FBRyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEtBQUssVUFBVSxHQUFHLEdBQUcsR0FBRyxLQUFLOzs7Ozs7Ozs7O0FBQUMsQUFVL0QsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7QUFDN0IsTUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDYixNQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixNQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxLQUFLLENBQUM7Q0FDM0I7Ozs7Ozs7OztBQUFBLEFBU2MsU0FBUyxZQUFZLEdBQUc7Ozs7Ozs7O0FBQXdCLEFBUS9ELFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVM7Ozs7Ozs7Ozs7QUFBQyxBQVUzQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQ25FLE1BQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUs7TUFDckMsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFbEQsTUFBSSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDO0FBQy9CLE1BQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLENBQUM7QUFDMUIsTUFBSSxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRXhDLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ25FLE1BQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0dBQ3pCOztBQUVELFNBQU8sRUFBRSxDQUFDO0NBQ1g7Ozs7Ozs7OztBQUFDLEFBU0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7QUFDckUsTUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDOztBQUUxQyxNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxLQUFLLENBQUM7O0FBRXRELE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO01BQzdCLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTTtNQUN0QixJQUFJO01BQ0osQ0FBQyxDQUFDOztBQUVOLE1BQUksVUFBVSxLQUFLLE9BQU8sU0FBUyxDQUFDLEVBQUUsRUFBRTtBQUN0QyxRQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRTlFLFlBQVEsR0FBRztBQUNULFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUM5RCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ2xFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ3RFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEtBQy9FOztBQUVELFNBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbEQsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUI7O0FBRUQsYUFBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztHQUM3QyxNQUFNO0FBQ0wsUUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU07UUFDekIsQ0FBQyxDQUFDOztBQUVOLFNBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNCLFVBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFcEYsY0FBUSxHQUFHO0FBQ1QsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUMxRCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUM5RCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDbEU7QUFDRSxjQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDN0QsZ0JBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQzVCOztBQUVELG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQUEsT0FDckQ7S0FDRjtHQUNGOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7Ozs7Ozs7QUFBQyxBQVVGLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0FBQzFELE1BQUksUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDO01BQ3RDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BFLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQ2hEO0FBQ0gsUUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcs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LENBQUMsQ0FBQztBQUNmLEdBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDZixZQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDcEIsTUFBSSxFQUFFLENBQUM7RUFDUCxDQUFDOzs7QUFBQyxBQUdILFFBQU8sR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUMzQixNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFBRSxTQUFPLENBQUMsQ0FBQztFQUFFLENBQUMsQ0FDbEMsRUFBRSxDQUFDLFdBQVcsRUFBQyxVQUFTLENBQUMsRUFBQztBQUMxQixNQUFJLEVBQUUsRUFBQyxFQUFFLENBQUM7QUFDVixNQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUM7QUFDVixPQUFHLENBQUMsQ0FBQyxLQUFLLFlBQVksS0FBSyxDQUFDLFNBQVMsRUFBQztBQUNyQyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzdDLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDN0MsTUFBTTtBQUNOLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDakMsTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUN0RTtHQUNELE1BQU07QUFDTixLQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLEtBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7R0FDdkQ7O0FBRUQsR0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDcEIsR0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7O0FBRXBCLE1BQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25DLEdBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDdkIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUNSLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDZCxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLE9BQU8sRUFBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDO0VBQzNDLENBQUMsQ0FDRCxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQ3hCLEdBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDcEIsR0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUNwQixHQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3BELENBQUMsQ0FDRCxFQUFFLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQzNCLE1BQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDbkIsTUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUU7OztBQUFDLEFBR25CLE1BQUksU0FBUyxHQUFHLEtBQUssQ0FBQztBQUN0QixNQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE9BQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDekMsT0FBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLE9BQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN6QixPQUFJLElBQUksR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztBQUM3QixPQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO09BQzFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO09BQ3ZDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUs7T0FDckQsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzFELE9BQUcsT0FBTyxJQUFJLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJLE9BQU8sSUFBSSxHQUFHLElBQUksT0FBTyxJQUFJLE1BQU0sRUFDN0U7O0FBRUMsUUFBSSxLQUFLLEdBQUcsRUFBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEtBQUssRUFBQyxDQUFDO0FBQ3hDLFFBQUksR0FBRyxHQUFHLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUMsQ0FBQztBQUMvQyxTQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsR0FBRyxDQUFDOztBQUFDLEFBRXZDLFFBQUksRUFBRSxDQUFDO0FBQ1AsYUFBUyxHQUFHLElBQUksQ0FBQztBQUNqQixVQUFNO0lBQ047R0FDRDs7QUFFRCxNQUFHLENBQUMsU0FBUyxFQUFDOztBQUViLE9BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRCxRQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUN6QztBQUNDLFFBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwQixRQUFJLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDekIsUUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQztBQUN6QixRQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3RCLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM1QyxRQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDN0MsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDMUQsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDN0QsUUFBRyxPQUFPLElBQUksSUFBSSxJQUFJLE9BQU8sSUFBSSxLQUFLLElBQUksT0FBTyxJQUFJLElBQUksSUFBSSxPQUFPLElBQUksTUFBTSxFQUM5RTtBQUNDLFlBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLFVBQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUMsRUFBQyxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO0FBQ3ZGLFNBQUksRUFBRSxDQUFDO0FBQ1AsV0FBTTtLQUNOO0lBQ0Q7R0FDRDs7QUFBQSxBQUVELEdBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDaEIsU0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQ2QsQ0FBQyxDQUFDOztBQUVILEdBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQ3hCLEVBQUUsQ0FBQyxPQUFPLEVBQUMsWUFBVTtBQUFDLElBQUUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUFDLENBQUM7OztBQUFDLEFBR3ZJLEtBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUNuQixDQUFDLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxTQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7RUFBQyxDQUFDLENBQzFCLENBQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUFDLENBQUMsQ0FDMUIsV0FBVyxDQUFDLE9BQU8sQ0FBQzs7O0FBQUMsQUFHdEIsU0EvTVUsR0FBRyxHQStNYixHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUNiLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7OztBQUFDLEFBR3JFLFVBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQzs7QUFBQyxBQUU1QixVQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7OztBQUFDLEFBRzVCLGtCQUFpQixHQUNqQixDQUNDLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUN6RCxFQUFDLElBQUksRUFBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFDM0QsRUFBQyxJQUFJLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUM5RSxFQUFDLElBQUksRUFBQyx5QkFBeUIsRUFBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQzFGLEVBQUMsSUFBSSxFQUFDLFFBQVEsRUFBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUM3RCxFQUFDLElBQUksRUFBQyxXQUFXLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFDbkUsRUFBQyxJQUFJLEVBQUMsVUFBVSxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQ2pFLEVBQUMsSUFBSSxFQUFDLGlCQUFpQixFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFDL0UsRUFBQyxJQUFJLEVBQUMsZUFBZSxFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFDM0UsRUFBQyxJQUFJLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUNyRixFQUFDLElBQUksRUFBQyxjQUFjLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUN6RSxFQUFDLElBQUksRUFBQyxZQUFZLEVBQUMsTUFBTSxFQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUNyRSxFQUFDLElBQUksRUFBQyx3QkFBd0IsRUFBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQ3hGLEVBQUMsSUFBSSxFQUFDLFlBQVksRUFBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQ3JFLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUM7VUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7R0FBQSxFQUFDLEVBQ3JDLEVBQUMsSUFBSSxFQUFDLFdBQVcsRUFBQyxNQUFNLEVBQUM7VUFBSSxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUU7R0FBQSxFQUFDLE1BQU0sa0JBNU9uRCxrQkFBa0IsQUE0T29ELEVBQUMsQ0FDN0UsQ0FBQzs7QUFFRixLQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUM7QUFDekMsbUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFDLDZCQUE2QjtBQUN6RCxTQUFNLEVBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztHQUM3RCxDQUFDLENBQUM7RUFDSDs7QUFFRCxHQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUNwQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQ1QsRUFBRSxDQUFDLGFBQWEsRUFBQyxZQUFVO0FBQzNCLG9CQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3pCLENBQUMsQ0FBQztDQUNIOzs7QUFBQSxBQUdNLFNBQVMsSUFBSSxHQUFHOztBQUV0QixLQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxTQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7RUFBQyxDQUFDOzs7QUFBQyxBQUcvRCxHQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNoQixJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFDO1VBQUksQ0FBQyxDQUFDLEtBQUs7R0FBQSxFQUFFLFFBQVEsRUFBRSxVQUFDLENBQUM7VUFBSSxDQUFDLENBQUMsTUFBTTtHQUFBLEVBQUUsQ0FBQzs7O0FBQUMsQUFHNUQsS0FBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUNqQixNQUFNLENBQUMsR0FBRyxDQUFDOztBQUFDLEFBRWIsR0FBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFBRSxTQUFPLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQSxBQUFDLEdBQUcsR0FBRyxDQUFBO0VBQUUsQ0FBQzs7O0FBQUMsQUFHcEgsRUFBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDZixJQUFJLENBQUMsSUFBSSxDQUFDLENBQ1YsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQUMsQ0FBQztVQUFJLENBQUMsQ0FBQyxLQUFLO0dBQUEsRUFBRSxRQUFRLEVBQUUsVUFBQyxDQUFDO1VBQUksQ0FBQyxDQUFDLE1BQU07R0FBQSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUNoRixPQUFPLENBQUMsTUFBTSxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQzFCLFNBQU8sQ0FBQyxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUMsbUJBQW1CLENBQUM7RUFDbEQsQ0FBQyxDQUNELEVBQUUsQ0FBQyxhQUFhLEVBQUMsVUFBUyxDQUFDLEVBQUM7O0FBRTVCLEdBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNYLElBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDMUIsSUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0VBQzdCLENBQUMsQ0FDRCxFQUFFLENBQUMsY0FBYyxFQUFDLFVBQVMsQ0FBQyxFQUFDOztBQUU3QixNQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFDO0FBQ3BCLElBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMvQyxPQUFJO0FBQ0gsU0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsUUFBSSxFQUFFLENBQUM7SUFDUCxDQUFDLE9BQU0sQ0FBQyxFQUFFOztJQUVWO0dBQ0Q7QUFDRCxJQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDN0IsSUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztFQUMxQixDQUFDLENBQ0QsTUFBTSxDQUFDLFVBQVMsQ0FBQyxFQUFDOztBQUVsQixTQUFPLENBQUMsQ0FBQyxTQUFTLFlBQVksY0FBYyxJQUFJLENBQUMsQ0FBQyxTQUFTLFlBQVkscUJBQXFCLElBQUksQ0FBQyxDQUFDLFNBQVMsWUFBWSwyQkFBMkIsQ0FBQztFQUNuSixDQUFDLENBQ0QsRUFBRSxDQUFDLE9BQU8sRUFBQyxVQUFTLENBQUMsRUFBQzs7QUFFdEIsU0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEIsSUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQzdCLElBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRTFCLE1BQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBQztBQUNwQixVQUFPO0dBQ1A7QUFDRCxNQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFCLE1BQUcsQ0FBQyxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUMsbUJBQW1CLEVBQUM7QUFDN0MsSUFBQyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUM7QUFDeEMsTUFBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUMsS0FBSyxDQUFDLENBQUM7QUFDMUIsSUFBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDcEIsTUFBTSxJQUFHLENBQUMsQ0FBQyxVQUFVLEtBQUssS0FBSyxDQUFDLGtCQUFrQixFQUFDO0FBQ25ELElBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLElBQUMsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLG1CQUFtQixDQUFDO0FBQ3pDLE1BQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3pCLE1BQU07QUFDTixRQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztHQUN6QjtFQUNELENBQUMsQ0FDRCxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztBQUN0Qzs7O0FBQUMsQUFHRCxFQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNmLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUN4QyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFBRSxTQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7RUFBRSxDQUFDOzs7QUFBQyxBQUd2QyxHQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ3BCLE1BQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsTUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QixNQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUMxQixJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDLEVBQUc7QUFDNUIsVUFBTyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUMsYUFBYSxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsQ0FBQztHQUN0QyxDQUFDLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxVQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0dBQUMsQ0FBQyxDQUFDOztBQUVwQyxNQUFJLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFYixNQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUNwQixJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsVUFBQyxDQUFDO1dBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsQ0FBQztJQUFBO0FBQ2hDLEtBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSTtBQUFFLFdBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFBRTtBQUN6QyxVQUFPLEVBQUUsVUFBUyxDQUFDLEVBQUU7QUFDcEIsUUFBRyxDQUFDLENBQUMsS0FBSyxZQUFZLEtBQUssQ0FBQyxjQUFjLEVBQUM7QUFDMUMsWUFBTyxhQUFhLENBQUM7S0FDckI7QUFDRCxXQUFPLE9BQU8sQ0FBQztJQUNmLEVBQUMsQ0FBQyxDQUFDOztBQUVKLE1BQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ2xCLElBQUksQ0FBQyxFQUFDLENBQUMsRUFBRSxVQUFDLENBQUM7V0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQztJQUFDLEVBQUMsQ0FBQyxFQUFDLFVBQUMsQ0FBQztXQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUFBLEVBQUMsT0FBTyxFQUFDLE9BQU8sRUFBRSxDQUFDLENBQ3RGLElBQUksQ0FBQyxVQUFDLENBQUM7VUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUk7R0FBQSxDQUFDLENBQUM7O0FBRXpCLEtBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUVwQixDQUFDOzs7QUFBQyxBQUdILEdBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDcEIsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixNQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUl6QixNQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUMxQixJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDLEVBQUc7QUFDN0IsVUFBTyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUMsYUFBYSxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsQ0FBQztHQUN0QyxDQUFDLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxVQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0dBQUMsQ0FBQyxDQUFDOztBQUVwQyxNQUFJLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQ3JCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFYixNQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUNwQixJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsVUFBQyxDQUFDO1dBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUMsQ0FBQztJQUFBO0FBQ2hDLEtBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUk7QUFBRSxXQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQUU7QUFDL0MsVUFBTyxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFZixNQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNsQixJQUFJLENBQUMsRUFBQyxDQUFDLEVBQUUsVUFBQyxDQUFDO1dBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFBQyxFQUFDLENBQUMsRUFBQyxVQUFDLENBQUM7V0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFBQSxFQUFDLE9BQU8sRUFBQyxPQUFPLEVBQUUsQ0FBQyxDQUN0RixJQUFJLENBQUMsVUFBQyxDQUFDO1VBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJO0dBQUEsQ0FBQyxDQUFDOztBQUV6QixLQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7RUFFcEIsQ0FBQzs7O0FBQUMsQUFHSCxHQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO0FBQ3RCLFNBQU8sQ0FBQyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7RUFDN0IsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFTLENBQUMsRUFBQztBQUNoQixNQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxNQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxlQUFlLEFBQUMsQUFBQyxFQUM1RTtBQUNDLElBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNqQixRQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBQyxFQUFFLENBQUMsRUFBQztBQUN2QyxLQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ25DO0dBQ0Q7QUFDRCxNQUFJLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLE1BQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFbEMsTUFBSSxDQUFDLEtBQUssRUFBRSxDQUNYLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDWCxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ2QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQUMsRUFBRTtXQUFLLENBQUMsQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDO0lBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FDcEssSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2YsTUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3JCLENBQUM7OztBQUFDLEFBR0gsR0FBRSxDQUNELE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUFFLFNBQU8sQ0FBQyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7RUFBRSxDQUFDLENBQ3JELElBQUksQ0FBQyxVQUFTLENBQUMsRUFBQztBQUNoQixNQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxNQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxjQUFjLEFBQUMsQUFBQyxFQUN4RTtBQUNDLElBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsRUFBQyxFQUFFLENBQUMsRUFBQztBQUN0QyxLQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ2xDO0dBQ0Q7QUFDRCxNQUFJLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLE1BQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFakMsTUFBSSxDQUFDLEtBQUssRUFBRSxDQUNYLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FDWCxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ2QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUUsRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQUMsRUFBRTtXQUFLLENBQUMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDO0lBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FDMUosRUFBRSxDQUFDLFlBQVksRUFBQyxVQUFTLENBQUMsRUFBQztBQUMzQixnQkFBYSxHQUFHLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxDQUFDO0dBQzVDLENBQUMsQ0FDRCxFQUFFLENBQUMsWUFBWSxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQzNCLE9BQUcsYUFBYSxDQUFDLElBQUksRUFBQztBQUNyQixRQUFHLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLFVBQVUsSUFBSSxhQUFhLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBQztBQUNuRSxrQkFBYSxHQUFHLElBQUksQ0FBQztLQUNyQjtJQUNEO0dBQ0QsQ0FBQyxDQUFDO0FBQ0gsTUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ3JCLENBQUM7OztBQUFDLEFBR0gsR0FBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRTs7O0FBQUMsQUFHbkIsS0FBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FDbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFNUMsR0FBRSxDQUFDLEtBQUssRUFBRSxDQUNULE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFaEIsR0FBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUNwQixNQUFJLElBQUksR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLE1BQUksRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsRUFBRTs7O0FBQUMsQUFHaEIsTUFBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBQztBQUNmLE9BQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLFlBQVksS0FBSyxDQUFDLFNBQVMsRUFBQztBQUMxQyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzVELE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDNUQsTUFBTTtBQUNOLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUMzQyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUMxRjtHQUNELE1BQU07QUFDTixLQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDM0MsS0FBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFB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QUc7QUFDVCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDOUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUNsRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUN0RSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxLQUMvRTs7QUFFRCxTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2xELFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztBQUVELGFBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtBQUNMLFFBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7QUFFTixTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQixVQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBGLGNBQVEsR0FBRztBQUNULGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDMUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDOUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQ2xFO0FBQ0UsY0FBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMs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QU8sRUFBQyxLQUFLO0FBQ2IsWUFBUSxFQUFDLEtBQUs7QUFDZCxVQUFNLEVBQUMsS0FBSztBQUNaLFdBQU8sRUFBQyxLQUFLO0FBQ2IsZ0JBQVksRUFBQyxZQUFZLENBQUMsS0FBSztHQUNoQyxDQUFDO0FBQ0YsSUFBRSxFQUFDLENBQUM7QUFDRixXQUFPLEVBQUMsRUFBRTtBQUNWLFdBQU8sRUFBQyxLQUFLO0FBQ2IsWUFBUSxFQUFDLEtBQUs7QUFDZCxVQUFNLEVBQUMsS0FBSztBQUNaLFdBQU8sRUFBQyxLQUFLO0FBQ2IsZ0JBQVksRUFBQyxZQUFZLENBQUMsS0FBSztHQUNoQyxDQUFDO0FBQ0YsSUFBRSxFQUFDLENBQUM7QUFDRixXQUFPLEVBQUMsRUFBRTtBQUNWLFdBQU8sRUFBQyxLQUFLO0FBQ2IsWUFBUSxFQUFDLEtBQUs7QUFDZCxVQUFNLEVBQUMsS0FBSztBQUNaLFdBQU8sRUFBQyxLQUFLO0FBQ2IsZ0JBQVksRUFBQyxZQUFZLENBQUMsSUFBSTtHQUMvQixDQUFDO0FBQ0YsSUFBRSxFQUFDLENBQUM7QUFDRixXQUFPLEVBQUMsRUFBRTtBQUNWLFdBQU8sRUFBQyxLQUFLO0FBQ2IsWUFBUSxFQUFDLEtBQUs7QUFDZCxVQUFNLEVBQUMsS0FBSztBQUNaLFdBQU8sRUFBQyxLQUFLO0FBQ2IsZ0JBQVksRUFBQyxZQUFZLENBQUMsRUFBRTtHQUMzQixDQUFDO0FBQ0osSUFBRSxFQUFDLENBQUM7QUFDRixXQUFPLEVBQUMsRUFBRTtBQUNWLFdBQU8sRUFBQyxLQUFLO0FBQ2IsWUFBUSxFQUFDLEtBQUs7QUFDZCxVQUFNLEVBQUMsS0FBSztBQUNaLFdBQU8sRUFBQyxLQUFLO0FBQ2IsZ0JBQVksRUFBQyxZQUFZLENBQUMsSUFBSTtHQUM3QixDQUFDO0FBQ0osS0FBRyxFQUFDLENBQUM7QUFDSCxXQUFPLEVBQUMsR0FBRztBQUNYLFdBQU8sRUFBQyxLQUFLO0FBQ2IsWUFBUSxFQUFDLEtBQUs7QUFDZCxVQUFNLEVBQUMsS0FBSztBQUNaLFdBQU8sRUFBQyxLQUFLO0FBQ2IsZ0JBQVksRUFBQyxZ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RUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBQyxFQUFFLENBQUUsQ0FBQztBQUMxRSxZQUFNLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztLQUNqQixNQUFNO0FBQ04sWUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQSxBQUFDLENBQUMsQ0FBQztLQUMvRjtBQUNELFFBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDL0IsUUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBLEFBQUMsQ0FBQyxDQUFDO0FBQ2pHLFFBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0IsUUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBLEFBQUMsQ0FBQyxDQUFDO0FBQ2pHLFFBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0IsUUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFBLEFBQUMsQ0FBQyxDQUFDO0FBQ2pHLFFBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUE7QUFDekIsUUFBSSxHQUFHLHNFQUFzRSxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFakcsTUFBRSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7QUFDakIsTUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDZixNQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNmLE1BQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ2IsTUFBRSxDQUFDLE9BQU8sR0FBRyxHQUFHOzs7QUFBQyxBQUdqQixTQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsQ0FBQztBQUNwRCxRQUFHLElBQUksRUFBQztBQUNOLFVBQUksUUFBUSxJQUFLLE9BQU8sR0FBRyxDQUFDLEFBQUMsRUFBRTtBQUM3QixVQUFFLGlCQUFpQixDQUFDO09BQ3JCLE1BQU07QUFDTCxVQUFFLFFBQVEsQ0FBQztPQUNaO0tBQ0Y7O0FBQUEsQUFFRCxhQUFTLEVBQUUsQ0FBQztBQUNaLGNBQVUsRUFBRSxDQUFDO0dBQ2Q7O0FBRUQsV0FBUyxFQUFFLENBQUM7QUFDWixTQUFPLElBQUksRUFBRTtBQUNYLFdBQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZELFFBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLFFBQVEsR0FBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUMsRUFBRSxFQUNyRTtBQUNELFdBQU8sRUFDUCxPQUFPLElBQUksRUFBRTtBQUNYLFVBQUksS0FBSyxHQUFHLE1BQU0sV0FBVyxDQUFDO0FBQzlCLGNBQVEsS0FBSyxDQUFDLFlBQVk7QUFDeEIsYUFBSyxZQUFZLENBQUMsS0FBSzs7QUFDckIsaUJBQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDOztBQUFDLEFBRXJCLGNBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN0RSxjQUFJLElBQUksRUFBRTtBQUNSLHVCQUFXLEVBQUUsQ0FBQztXQUNmLE1BQU07O0FBRUwsdUJBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztXQUN2QjtBQUNELHFCQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ25CLGdCQUFNO0FBQUEsQUFDUixhQUFLLFlBQVksQ0FBQyxLQUFLOztBQUNyQjtBQUNFLHFCQUFTLEVBQUUsQ0FBQztBQUNaLGdCQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2xDLGdCQUFJLFNBQVMsR0FBSSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUMsRUFBRTtBQUNuRCx1QkFBUyxHQUFHLENBQUMsQ0FBQztBQUNkLGtCQUFJLFFBQVEsR0FBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQ2xDLG9CQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFDO0FBQzlDLDZCQUFXLEVBQUUsQ0FBQztpQkFDZixNQUFNO0FBQ0wsb0JBQUUsUUFBUSxDQUFDO2lCQUNaO2VBQ0YsTUFBTTtBQUNMLDJCQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ25CLHNCQUFNO2VBQ1A7YUFDRjtBQUNELHNCQUFVLEVBQUUsQ0FBQztBQUNiLHVCQUFXLEdBQUcsSUFBSSxDQUFDO1dBQ3BCO0FBQ0QsZ0JBQU07QUFBQSxBQUNSLGFBQUssWUFBWSxDQUFDLE1BQU07QUFDdEI7QUFDRSxnQkFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QyxnQkFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN4QyxnQkFBRyxPQUFPLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDOztBQUV0Qyx5QkFBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3RCLHVCQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ2Qsa0JBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNELGtCQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDOUIsa0JBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNoQyxpQkFBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDOztBQUFDLEFBRXJCLHlCQUFXLEdBQUcsSUFBSSxDQUFDO2FBQ3BCLE1BQU07QUFDTCx5QkFBVyxHQUFHLEtBQUssQ0FBQzthQUNyQjtXQUNGO0FBQ0QsZ0JBQU07QUFBQSxBQUNSLGFBQUssWUFBWSxDQUFDLElBQUk7QUFDcEI7QUFDRSxnQkFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QyxnQkFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN4QyxnQkFBRyxPQUFPLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDOztBQUV0Qyx5QkFBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3RCLGtCQUFJLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzRCxrQkFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQzVCLGtCQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDaEMsaUJBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQzs7QUFBQyxBQUVyQix5QkFBVyxHQUFHLElBQUksQ0FBQzthQUNwQixNQUFNO0FBQ0wseUJBQVcsR0FBRyxLQUFLLENBQUM7YUFDckI7V0FDRjtBQUNELGdCQUFNO0FBQUEsQUFDUixhQUFLLFlBQVksQ0FBQyxJQUFJOztBQUNwQjtBQUNFLGdCQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2xDLGNBQUUsU0FBUyxDQUFDO0FBQ1osZ0JBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtBQUNqQixrQkFBSSxRQUFRLElBQUksQ0FBQyxFQUFFLEVBRWxCLE1BQU07QUFDSCxvQkFBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBQztBQUM5Qyw2QkFBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNwQjtBQUNILGtCQUFFLFFBQVEsQ0FBQztBQUNYLHlCQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztlQUM3RDthQUNGO0FBQ0Qsc0JBQVUsRUFBRSxDQUFDO0FBQ2IsdUJBQVcsR0FBRyxJQUFJLENBQUM7V0FDcEI7QUFDRCxnQkFBTTtBQUFBLEFBQ1IsYUFBSyxZQUFZLENBQUMsRUFBRTs7QUFDbEI7QUFDRSxnQkFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQztBQUNsQyxnQkFBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBQztBQUM5Qyx5QkFBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BCO0FBQ0QsZ0JBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtBQUNoQixnQkFBRSxRQUFRLENBQUM7QUFDWCx3QkFBVSxFQUFFLENBQUM7YUFDZCxNQUFNO0FBQ0wsa0JBQUksaUJBQWlCLEdBQUcsQ0FBQyxFQUFFO0FBQ3pCLGtCQUFFLGlCQUFpQixDQUFDO0FBQ3BCLHlCQUFTLEVBQUUsQ0FBQztBQUNaLHdCQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2IsMEJBQVUsRUFBRSxDQUFDO2VBQ2Q7YUFDRjtBQUNELHVCQUFXLEdBQUcsSUFBSSxDQUFDO1dBQ3BCO0FBQ0QsZ0JBQU07QUFBQSxBQUNSLGFBQUssWUFBWSxDQUFDLElBQUk7O0FBQ3BCO0FBQ0UsZ0JBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUM7QUFDbEMsZ0JBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUM7QUFDOUMseUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNwQjtBQUNELGdCQUFJLFFBQVEsSUFBSyxPQUFPLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFDN0Isa0JBQUksQUFBQyxpQkFBaUIsR0FBRyxPQUFPLElBQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFDOUQsa0JBQUUsaUJBQWlCLENBQUM7QUFDcEIseUJBQVMsRUFBRSxDQUFDO0FBQ1osMEJBQVUsRUFBRSxDQUFDO2VBQ2Q7YUFDRixNQUFNO0FBQ0wsZ0JBQUUsUUFBUSxDQUFDO0FBQ1gsd0JBQVUsRUFBRSxDQUFDO2FBQ2Q7QUFDRCx1QkFBVyxHQUFHLElBQUksQ0FBQztXQUNwQjtBQUNELGdCQUFNO0FBQUEsQUFDUixhQUFLLFlBQVksQ0FBQyxRQUFROztBQUN4QjtBQUNFLGdCQUFHLGlCQUFpQixHQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQ2hELCtCQUFpQixJQUFJLE9BQU8sQ0FBQztBQUM3QixrQkFBRyxpQkFBaUIsR0FBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUMsRUFBRTtBQUNoRCxpQ0FBaUIsSUFBSSxPQUFPLENBQUM7ZUFDOUIsTUFBTTtBQUNMLHlCQUFTLEVBQUUsQ0FBQztlQUNiO0FBQ0Qsd0JBQVUsRUFBRSxDQUFDO2FBQ2Q7QUFDRCx1QkFBVyxHQUFHLElBQUksQ0FBQztXQUNwQjtBQUNELGdCQUFNO0FBQUEsQUFDUixhQUFLLFlBQVksQ0FBQyxNQUFNOztBQUN0QjtBQUNFLGdCQUFHLGlCQUFpQixHQUFHLENBQUMsRUFBQztBQUN2QiwrQkFBaUIsSUFBSSxPQUFPLENBQUM7QUFDN0Isa0JBQUcsaUJBQWlCLEdBQUcsQ0FBQyxFQUFDO0FBQ3ZCLGlDQUFpQixHQUFHLENBQUMsQ0FBQztlQUN2QjtBQUNELHVCQUFTLEVBQUUsQ0FBQztBQUNaLHdCQUFVLEVBQUUsQ0FBQzthQUNkO0FBQ0QsdUJBQVcsR0FBRyxJQUFJLENBQUM7V0FDcEI7QUFDRCxnQkFBTTs7QUFBQSxBQUVSLGFBQUssWUFBWSxDQUFDLFFBQVE7QUFDeEI7QUFDRSxnQkFBRyxpQkFBaUIsR0FBRyxDQUFDLEVBQUM7QUFDdkIsZ0JBQUUsaUJBQWlCLENBQUM7QUFDcEIsdUJBQVMsRUFBRSxDQUFDO0FBQ1osd0JBQVUsRUFBRSxDQUFDO2FBQ2Q7V0FDRjtBQUNELGdCQUFNOztBQUFBLEFBRVIsYUFBSyxZQUFZLENBQUMsVUFBVTtBQUMxQjtBQUNFLGdCQUFHLEFBQUMsaUJBQWlCLEdBQUcsT0FBTyxJQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFDO0FBQzVELGdCQUFFLGlCQUFpQixDQUFDO0FBQ3BCLHVCQUFTLEVBQUUsQ0FBQztBQUNaLHdCQUFVLEVBQUUsQ0FBQzthQUNkO1dBQ0Y7QUFDRCxnQkFBTTs7QUFBQSxBQUVSLGFBQUssWUFBWSxDQUFDLElBQUk7QUFDcEIsY0FBRyxpQkFBaUIsR0FBRyxDQUFDLEVBQUM7QUFDdkIsb0JBQVEsR0FBRyxDQUFDLENBQUM7QUFDYiw2QkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDdEIscUJBQVMsRUFBRSxDQUFDO0FBQ1osc0JBQVUsRUFBRSxDQUFDO1dBQ2Q7QUFDRCxxQkFBVyxHQUFHLElBQUksQ0FBQztBQUNuQixnQkFBTTs7QUFBQSxBQUVSLGFBQUssWUFBWSxDQUFDLEdBQUc7QUFDbkIsY0FBRyxpQkFBaUIsSUFBSyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUMsRUFDakQ7QUFDRSxvQkFBUSxHQUFHLENBQUMsQ0FBQztBQUNiLDZCQUFpQixHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUM1QyxxQkFBUyxFQUFFLENBQUM7QUFDWixzQkFBVSxFQUFFLENBQUM7V0FDZDtBQUNELHFCQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ25CLGdCQUFNOztBQUFBLEFBRVIsYUFBSyxZQUFZLENBQUMsTUFBTTtBQUN0QjtBQUNFLHFCQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FDeEI7QUFDRSxrQkFBSSxHQUFFO0FBQ0osb0JBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLG9CQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7QUFDM0Msb0JBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMsb0JBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BFLHdCQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QyxvQkFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDN0IsMEJBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3hCLHFCQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUQseUJBQVMsRUFBRSxDQUFDO0FBQ1osMEJBQVUsRUFBRSxDQUFDO2VBQ2Q7QUFDRCxrQkFBSSxHQUFFO0FBQ0osb0JBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzdCLDBCQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN4Qix3QkFBUSxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekMscUJBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxRCx5QkFBUyxFQUFFLENBQUM7QUFDWiwwQkFBVSxFQUFFLENBQUM7ZUFDZDtBQUNELGtCQUFJLEdBQUU7QUFDSiwwQkFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDN0IscUJBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JFLHlCQUFTLEVBQUUsQ0FBQztBQUNaLDBCQUFVLEVBQUUsQ0FBQztlQUNkO2FBQ0YsQ0FDRixDQUFDO1dBQ0g7QUFDSCxnQkFBTTs7QUFBQSxBQUVOLGFBQUssWUFBWSxDQUFDLElBQUk7QUFDcEIsbUJBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0IscUJBQVcsR0FBRyxJQUFJLENBQUM7QUFDbkIsZ0JBQU07O0FBQUEsQUFFUixhQUFLLFlBQVksQ0FBQyxJQUFJO0FBQ3BCLG1CQUFTLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzdCLHFCQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ25CLGdCQUFNOztBQUFBLEFBRVIsYUFBSyxZQUFZLENBQUMsYUFBYTs7QUFDN0IscUJBQVcsR0FBRyxJQUFJLENBQUM7QUFDbkIsZ0JBQU07O0FBQUEsQUFFUjtBQUNFLHFCQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLGlCQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZCLGdCQUFNO0FBQUEsT0FDVDtLQUNGO0dBQ0Y7Q0FDRjs7QUFJTSxTQUFTLGtCQUFrQixDQUFDLENBQUMsRUFBRTtBQUNwQyxJQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDN0IsSUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUMxQixJQUFFLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDN0IsTUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU87QUFDdEMsR0FBQyxDQUFDLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMxQzs7O0FDNy9CRCxZQUFZLENBQUM7Ozs7Ozs7O1FBZ0JHLGNBQWMsR0FBZCxjQUFjO1FBS2QsdUJBQXVCLEdBQXZCLHVCQUF1QjtRQUl2Qiw0QkFBNEIsR0FBNUIsNEJBQTRCOzs7O0lBeEJoQyxLQUFLOzs7Ozs7OztJQUVMLElBQUk7Ozs7Ozs7Ozs7OztJQUlILFNBQVMsV0FBVCxTQUFTLEdBQ3JCLFNBRFksU0FBUyxHQUNVO0tBQW5CLElBQUkseURBQUcsQ0FBQztLQUFDLElBQUkseURBQUcsRUFBRTs7dUJBRGxCLFNBQVM7O0FBRXBCLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLEtBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLEtBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLEtBQUksQ0FBQyxJQUFJLEdBQUksSUFBSSxDQUFDO0NBQ2xCOztBQUdLLFNBQVMsY0FBYyxDQUFDLFVBQVUsRUFBQyxLQUFLLEVBQUMsSUFBSSxFQUNwRDtBQUNDLFdBQVUsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RDOztBQUVNLFNBQVMsdUJBQXVCLENBQUMsVUFBVSxFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUM7QUFDN0QsV0FBVSxDQUFDLHVCQUF1QixDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsQ0FBQztDQUMvQzs7QUFFTSxTQUFTLDRCQUE0QixDQUFDLFVBQVUsRUFBQyxLQUFLLEVBQUMsSUFBSSxFQUFDO0FBQ2xFLFdBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUMsSUFBSSxDQUFDLENBQUM7Q0FDL0M7O0lBR1ksT0FBTyxXQUFQLE9BQU8sR0FDbkIsU0FEWSxPQUFPLEdBRW5CO0tBRFksWUFBWSx5REFBRyxjQUFjO0tBQUMsZUFBZSx5REFBRyxjQUFjOzt1QkFEOUQsT0FBTzs7QUFHbEIsS0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVDLEtBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNsRDs7QUFHSyxNQUFNLFNBQVMsV0FBVCxTQUFTLEdBQUk7QUFDekIsS0FBSSxFQUFDLE1BQU0sRUFBRTtBQUNiLFFBQU8sRUFBQyxNQUFNLEVBQUU7QUFDaEIsU0FBUSxFQUFDLE1BQU0sRUFBRTtDQUNqQjs7O0FBQUE7SUFHWSxPQUFPLFdBQVAsT0FBTztXQUFQLE9BQU87O0FBQ25CLFVBRFksT0FBTyxHQUNOO3dCQURELE9BQU87O3FFQUFQLE9BQU8sYUFFWixDQUFDOztBQUNQLFFBQUssSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUM7QUFDNUIsUUFBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDOztFQUNyQjs7Y0FMVyxPQUFPOzs0QkFNVCxFQUVSOzs7UUFSVSxPQUFPO0dBQVMsU0FBUzs7OztJQVl6QixRQUFRLFdBQVIsUUFBUTtXQUFSLFFBQVE7O0FBQ3BCLFVBRFksUUFBUSxHQUNQO3dCQURELFFBQVE7O3NFQUFSLFFBQVEsYUFFYixDQUFDOztBQUNQLFNBQUssSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7O0VBQy9COztjQUpXLFFBQVE7OzRCQUtWLEVBRVI7OztRQVBVLFFBQVE7R0FBUyxTQUFTOztBQVd2QyxJQUFJLEtBQUssR0FBRyxDQUNYLElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLEVBQ0osSUFBSSxDQUNKLENBQUM7O0lBRVcsU0FBUyxXQUFULFNBQVM7V0FBVCxTQUFTOztBQUNyQixVQURZLFNBQVMsR0FDb0Q7TUFBN0QsSUFBSSx5REFBRyxDQUFDO01BQUMsSUFBSSx5REFBRyxDQUFDO01BQUMsSUFBSSx5REFBRyxDQUFDO01BQUMsR0FBRyx5REFBRyxHQUFHO01BQUMsT0FBTyx5REFBRyxJQUFJLE9BQU8sRUFBRTs7d0JBRDVELFNBQVM7O3NFQUFULFNBQVMsYUFFZCxJQUFJOztBQUNWLFNBQUssVUFBVSxHQUFHLEdBQUcsQ0FBQztBQUN0QixTQUFLLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsU0FBSyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFNBQUssR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUNmLFNBQUssT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUN2QixTQUFLLE9BQU8sQ0FBQyxLQUFLLFNBQU8sQ0FBQztBQUMxQixTQUFLLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO0FBQzNCLFNBQUssV0FBVyxFQUFFLENBQUM7O0VBQ25COztjQVhXLFNBQVM7O2dDQWFSO0FBQ1gsT0FBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLE9BQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0dBQ3pDOzs7b0NBRWlCLFFBQVEsRUFDMUI7OztPQUQyQixlQUFlLHlEQUFHLEVBQUU7O0FBRTVDLE9BQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQztBQUN4RixPQUFHLE9BQU8sRUFDVjtBQUNJLFFBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuQixRQUFJLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUM7O0FBQUMsQUFFM0MsYUFBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QixRQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQ2xCLFFBQUcsQ0FBQyxDQUFDLEVBQUM7QUFDSixBQUFDLFNBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNuRCxNQUFDLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUNkLFNBQUcsQ0FBQyxDQUFDLEVBQUM7QUFDSixhQUFPLEtBQUssQ0FBQztNQUNkO0tBQ0Y7QUFDRCxRQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUM7O0FBRTVCLFFBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBQyxDQUFDLEVBQUc7QUFDakIsU0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFDO0FBQ1QsYUFBSyxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDL0MsYUFBTyxJQUFJLENBQUM7TUFDYjtLQUNELENBQUMsRUFDTDtBQUNFLFlBQU8sSUFBSSxDQUFDO0tBQ2IsTUFBTTtBQUNMLFNBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixZQUFPLEtBQUssQ0FBQztLQUNkO0lBQ0osTUFBTTtBQUNILFFBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQixXQUFPLEtBQUssQ0FBQztJQUNkO0dBQ0g7Ozs4QkFtQlU7QUFDVixPQUFJLENBQUMsS0FBSyxHQUFHLEFBQUMsS0FBSyxHQUFHLElBQUksR0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUEsR0FBSSxFQUFFLENBQUUsQUFBQyxDQUFDO0dBQ3ZGOzs7MEJBRU8sSUFBSSxFQUFDLEtBQUssRUFBQztBQUNqQixPQUFHLElBQUksQ0FBQyxJQUFJLEVBQUM7QUFDWixRQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDakMsU0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBRyxFQUFFLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDbEQsVUFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBQyxJQUFJLENBQUMsS0FBSyxFQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3ZEOztBQUVELFNBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUcsRUFBRSxFQUFDLEVBQUUsQ0FBQyxFQUFDOztBQUVyRCxVQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFDLElBQUksQ0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDOztBQUFDLEFBRXhELFVBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFFLENBQUM7S0FDMUY7SUFDRDtHQUNGOzs7bUJBbkNVO0FBQ1QsVUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQ25CO2lCQUVRLENBQUMsRUFBQztBQUNULE9BQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsT0FBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2pCLE9BQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztHQUNwQjs7O2lCQUVhLENBQUMsRUFBQztBQUNmLE9BQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUM7QUFDdkIsUUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsUUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pCO0dBQ0Q7OztRQXRFVyxTQUFTO0dBQVMsU0FBUzs7SUErRjNCLEtBQUssV0FBTCxLQUFLO1dBQUwsS0FBSzs7QUFDakIsVUFEWSxLQUFLLENBQ0wsU0FBUyxFQUFDO3dCQURWLEtBQUs7O3NFQUFMLEtBQUs7O0FBR2hCLFNBQUssTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNqQixTQUFLLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsU0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNqQyxNQUFJLENBQUMsYUFBYSxTQUFNLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLE1BQUksQ0FBQyxhQUFhLFNBQU0sS0FBSyxDQUFDLENBQUM7QUFDL0IsTUFBSSxDQUFDLGFBQWEsU0FBTSxNQUFNLENBQUMsQ0FBQztBQUNoQyxNQUFJLENBQUMsYUFBYSxTQUFNLFdBQVcsQ0FBQyxDQUFDOztBQUVyQyxTQUFLLElBQUksR0FBRyxDQUFDLENBQUM7QUFDZCxTQUFLLEdBQUcsR0FBRyxLQUFLLENBQUM7QUFDakIsU0FBSyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFNBQUssVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixTQUFLLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsU0FBSyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2YsU0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDOztFQUNuQjs7Y0FsQlcsS0FBSzs7MkJBb0JSLEVBQUUsRUFBQztBQUNYLE9BQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUN6QjtBQUNDLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQsWUFBTyxNQUFNLENBQUMsSUFBSTtBQUNqQixVQUFLLFNBQVMsQ0FBQyxJQUFJO0FBQ2xCLFFBQUUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDOUIsUUFBRSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQzVCLFlBQU07QUFBQSxBQUNQLFVBQUssU0FBUyxDQUFDLE9BQU87QUFDckIsUUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDZCxRQUFFLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLFlBQU07QUFBQSxLQUNQO0lBQ0QsTUFBTTtBQUNOLE1BQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBRSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDZjtBQUNELE9BQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUMsT0FBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQ3BEOzs7OEJBRVcsRUFBRSxFQUFDLEtBQUssRUFBQztBQUNwQixPQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFDO0FBQ3ZDLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLFlBQU8sTUFBTSxDQUFDLElBQUk7QUFDakIsVUFBSyxTQUFTLENBQUMsSUFBSTtBQUNsQixRQUFFLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLFFBQUUsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUM3QixZQUFNO0FBQUEsQUFDTixVQUFLLFNBQVMsQ0FBQyxPQUFPO0FBQ3JCLFFBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsUUFBRSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQyxZQUFNO0FBQUEsS0FDTjtJQUNELE1BQU07QUFDTixNQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNkLE1BQUUsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2I7QUFDSCxPQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQy9CLE9BQUcsRUFBRSxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFDO0FBQy9CLFFBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxNQUFNO0FBQ04sUUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQjtBQUNELE9BQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNuQzs7OzZCQUVVLEtBQUssRUFBQztBQUNoQixRQUFJLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEVBQ3BEO0FBQ0MsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixZQUFPLE1BQU0sQ0FBQyxJQUFJO0FBQ2pCLFVBQUssU0FBUyxDQUFDLElBQUk7QUFDbEIsYUFBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNuQyxhQUFPLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDNUIsWUFBTTtBQUFBLEFBQ1osVUFBSyxTQUFTLENBQUMsT0FBTztBQUNoQixZQUFNO0FBQ1osWUFBTTtBQUFBLEtBQ047SUFDRDtHQUNEOzs7dUNBRW9CLEtBQUssRUFBQztBQUMxQixRQUFJLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEVBQ3BEO0FBQ0MsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsUUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixZQUFPLE1BQU0sQ0FBQyxJQUFJO0FBQ2pCLFVBQUssU0FBUyxDQUFDLElBQUk7QUFDbEIsYUFBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNuQyxhQUFPLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDbEMsWUFBTTtBQUFBLEFBQ04sVUFBSyxTQUFTLENBQUMsT0FBTztBQUNyQixhQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNuQixhQUFPLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLFlBQU07QUFBQSxLQUNOO0lBQ0Q7R0FDRDs7O3VDQUVxQixLQUFLLEVBQUM7QUFDekIsT0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN6QixPQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbEIsT0FBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFCLE9BQUcsS0FBSyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFDO0FBQ2pDLE1BQUUsS0FBSyxDQUFDO0FBQ1IsV0FBTSxLQUFLLElBQUksQ0FBQyxFQUFDO0FBQ2YsU0FBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3ZCLFNBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsT0FBTyxFQUMvQjtBQUNFLFlBQU07TUFDUCxNQUFNO0FBQ0wsZUFBUyxJQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUM7TUFDdkI7QUFDRCxPQUFFLEtBQUssQ0FBQztLQUNUO0FBQ0QsU0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDNUIsYUFBUyxHQUFHLENBQUMsQ0FBQztBQUNkLFdBQU0sS0FBSyxHQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUM7QUFDaEMsT0FBRSxLQUFLLENBQUM7QUFDUixTQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkIsU0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUM7QUFDOUIsUUFBRSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDekIsWUFBTTtNQUNQLE1BQU07QUFDTCxlQUFTLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQztNQUN0QjtLQUNGO0FBQ0QsV0FBTztJQUNSLE1BQU07O0FBRUwsUUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFFBQUcsS0FBSyxJQUFJLENBQUMsRUFBQztBQUNaLGVBQVUsR0FBRyxDQUFDLENBQUM7S0FDaEIsTUFBTTtBQUNMLGVBQVUsR0FBRyxLQUFLLENBQUM7QUFDbkIsWUFBTSxVQUFVLEdBQUcsQ0FBQyxFQUFDO0FBQ25CLFFBQUUsVUFBVSxDQUFDO0FBQ2IsVUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsT0FBTyxFQUNwRDtBQUNFLFNBQUUsVUFBVSxDQUFDO0FBQ2IsYUFBTTtPQUNQO01BQ0Y7S0FDRjtBQUNELGFBQVMsR0FBRyxDQUFDLENBQUM7QUFDZCxXQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxJQUFJLEVBQ3BEO0FBQ0UsY0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzFDLE9BQUUsVUFBVSxDQUFDO0tBQ2Q7QUFDRCxRQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUM7QUFDbkQsU0FBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0tBQy9DO0lBQ0Y7R0FDRjs7Ozs7OzhCQUdXLEtBQUssRUFBQztBQUNoQixPQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVCLE9BQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixPQUFHLEtBQUssSUFBSSxDQUFDLEVBQUM7QUFDWixRQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDM0IsUUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLFFBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO0FBQ3hCLGFBQU8sRUFBRSxDQUFDLElBQUk7QUFDWixXQUFLLFNBQVMsQ0FBQyxJQUFJO0FBQ2pCLFdBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkIsYUFBTTtBQUFBLEFBQ1IsV0FBSyxTQUFTLENBQUMsT0FBTztBQUNwQixXQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsYUFBTTtBQUFBLE1BQ1Q7S0FDRjtJQUNGLE1BQU0sSUFBRyxLQUFLLElBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQzNDO0FBQ0ksWUFBTyxFQUFFLENBQUMsSUFBSTtBQUNaLFVBQUssU0FBUyxDQUFDLElBQUk7QUFDakIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0IsWUFBTTtBQUFBLEFBQ1IsVUFBSyxTQUFTLENBQUMsT0FBTztBQUNwQixVQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLFlBQU07QUFBQSxLQUNUO0lBQ0o7QUFDRCxPQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDbEM7OztRQTdMVSxLQUFLOzs7QUFnTVgsTUFBTSxVQUFVLFdBQVYsVUFBVSxHQUFHO0FBQ3pCLFFBQU8sRUFBQyxDQUFDO0FBQ1QsUUFBTyxFQUFDLENBQUM7QUFDVCxPQUFNLEVBQUMsQ0FBQztDQUNSLENBQUU7O0FBRUksTUFBTSxhQUFhLFdBQWIsYUFBYSxHQUFHLENBQUMsQ0FBQzs7SUFFbEIsU0FBUyxXQUFULFNBQVM7V0FBVCxTQUFTOztBQUNyQixVQURZLFNBQVMsR0FDUjt3QkFERCxTQUFTOztzRUFBVCxTQUFTOztBQUlwQixNQUFJLENBQUMsYUFBYSxTQUFNLEtBQUssQ0FBQyxDQUFDO0FBQy9CLE1BQUksQ0FBQyxhQUFhLFNBQU0sS0FBSyxDQUFDLENBQUM7QUFDL0IsTUFBSSxDQUFDLGFBQWEsU0FBTSxNQUFNLENBQUMsQ0FBQztBQUNoQyxNQUFJLENBQUMsYUFBYSxTQUFNLEtBQUssQ0FBQyxDQUFDO0FBQy9CLE1BQUksQ0FBQyxhQUFhLFNBQU0sUUFBUSxDQUFDLENBQUM7O0FBRWxDLFNBQUssR0FBRyxHQUFHLEtBQUs7QUFBQyxBQUNqQixTQUFLLEdBQUcsR0FBRyxJQUFJO0FBQUMsQUFDaEIsU0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsU0FBSyxHQUFHLEdBQUcsQ0FBQztBQUFDLEFBQ2IsU0FBSyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFNBQUssY0FBYyxHQUFHLENBQUMsQ0FBQztBQUN4QixTQUFLLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDekIsU0FBSyxJQUFJLEdBQUcsV0FBVyxDQUFDO0FBQ3hCLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxhQUFhLEVBQUMsRUFBRSxDQUFDLEVBQ3BDO0FBQ0MsVUFBSyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxRQUFNLENBQUMsQ0FBQztBQUNsQyxVQUFLLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQztBQUN2RSxVQUFLLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLE9BQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFVBQUssS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDOztBQUVwQyxVQUFLLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQztBQUN2RSxVQUFLLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLE9BQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFVBQUssS0FBSyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO0dBQ3JDO0FBQ0QsU0FBSyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLFNBQUssWUFBWSxHQUFHLENBQUMsQ0FBQztBQUN0QixTQUFLLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDekIsU0FBSyxZQUFZLEVBQUUsQ0FBQztBQUNwQixTQUFLLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsU0FBSyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU87OztBQUFDLEFBR2xDLFNBQUssRUFBRSxDQUFDLGNBQWMsRUFBQyxZQUFJO0FBQUMsVUFBSyxZQUFZLEVBQUUsQ0FBQztHQUFDLENBQUMsQ0FBQztBQUNuRCxTQUFLLEVBQUUsQ0FBQyxjQUFjLEVBQUMsWUFBSTtBQUFDLFVBQUssWUFBWSxFQUFFLENBQUM7R0FBQyxDQUFDLENBQUM7O0FBRW5ELFdBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxRQUFNLENBQUM7QUFDaEMsTUFBRyxTQUFTLENBQUMsS0FBSyxFQUFDO0FBQ2xCLFlBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNsQjs7RUFDRDs7Y0E1Q1csU0FBUzs7NEJBK0NaO0FBQ1IsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFDLEVBQUUsQ0FBQyxFQUNqRDtBQUNDLFFBQUcsSUFBSSxLQUFLLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFDbEMsY0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLFdBQU07S0FDUDtJQUNEOztBQUVELE9BQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUNuQztBQUNDLFFBQUcsU0FBUyxDQUFDLEtBQUssRUFBQztBQUNsQixjQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDbEI7SUFDRDtHQUNEOzs7aUNBRWE7QUFDYixPQUFJLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUEsQUFBQyxDQUFDO0dBQy9DOzs7d0JBRUssSUFBSSxFQUFDO0FBQ1YsT0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFO0FBQzNFLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDcEQsUUFBSSxDQUFDLFVBQVUsR0FBSSxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztJQUNsQztHQUNEOzs7eUJBRUs7QUFDTCxPQUFHLElBQUksQ0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQzFFO0FBQ0MsUUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLEVBQUc7QUFDeEIsTUFBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLEVBQUc7QUFDdEIsT0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO01BQ1QsQ0FBQyxDQUFDO0FBQ0gsTUFBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLEVBQUc7QUFDekIsT0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO01BQ1QsQ0FBQyxDQUFDO0tBQ0gsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztBQUNsQyxRQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDYjtHQUNEOzs7MEJBRU07QUFDTixPQUFHLElBQUksQ0FBQyxPQUFPLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBQztBQUNyQyxRQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDakM7R0FDRDs7OzBCQUVNO0FBQ04sT0FBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsT0FBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDdEIsT0FBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUc7QUFDNUIsU0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2pDLFNBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsU0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQyxDQUFDO0FBQ0gsT0FBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0dBQ3BCOzs7OzswQkFFUSxJQUFJLEVBQ2I7QUFDQyxPQUFJLENBQUMsWUFBWSxHQUFHLElBQUksSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3BELE9BQUksV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBSSxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQSxHQUFJLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDaEYsT0FBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFFBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQzlDLFFBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0IsUUFBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUM7QUFDYixZQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksV0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtBQUM5QyxVQUFHLEtBQUssQ0FBQyxPQUFPLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7QUFDeEMsWUFBSyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFDakIsYUFBTTtPQUNOLE1BQU07QUFDTixXQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLFdBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0FBQzdELFlBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlCLFlBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUk7O0FBQUMsT0FFekI7TUFDRDtLQUNELE1BQU07QUFDTixRQUFFLFFBQVEsQ0FBQztNQUNYO0lBQ0Q7QUFDRCxPQUFHLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBQztBQUNqQyxRQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDWjtHQUNEOzs7Ozs7MEJBR08sQ0FBQyxFQUFDO0FBQ1QsT0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLE9BQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBQztBQUNoQyxTQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsTUFBTTtBQUNOLFNBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRDtHQUNEOzs7Ozs7NkJBR1UsQ0FBQyxFQUFDO0FBQ1osT0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLFFBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBQyxFQUFFLENBQUMsRUFBQztBQUMxQyxRQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUM7QUFDckYsVUFBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsV0FBTTtLQUNOO0lBQ0Q7O0FBRUQsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQzdDLFFBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBQztBQUMzRixVQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixXQUFNO0tBQ047SUFDRDtHQUNEOzs7OEJBRWtCLENBQUMsRUFBQztBQUNwQixPQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxZQUFZLEtBQUssQ0FBQyxTQUFTLEVBQUM7QUFDeEMsV0FBUTtBQUNQLE9BQUUsRUFBQyxDQUFDLENBQUMsRUFBRTtBQUNQLFlBQU8sRUFBRSxVQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFHO0FBQ25CLE9BQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO01BQzFDO0FBQ0QsU0FBSSxFQUFDLFlBQVU7QUFDZCxPQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztNQUMvQjtLQUNELENBQUM7SUFDRjtBQUNELE9BQUksT0FBTyxDQUFDO0FBQ1osT0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFDO0FBQzlCLFdBQU8sR0FBRyxVQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFLO0FBQ3RCLFFBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztLQUM1QyxDQUFDO0lBQ0YsTUFBTTtBQUNOLFdBQU8sR0FBRyxVQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFHO0FBQ3BCLFFBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztLQUMvQyxDQUFDO0lBQ0Y7QUFDRCxVQUFPO0FBQ04sTUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ1AsV0FBTyxFQUFDLE9BQU87QUFDZixRQUFJLEVBQUMsWUFBVTtBQUNkLE1BQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMvQztJQUNELENBQUM7R0FDRjs7O3lCQUdEO0FBQ0MsT0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFDO0FBQ3BELFVBQU0sQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsUUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFNBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQ3ZELFNBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsU0FBRyxHQUFHLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUM7QUFDcEMsU0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO01BQ25DLE1BQU0sSUFBRyxHQUFHLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxPQUFPLEVBQUM7QUFDM0MsUUFBRSxRQUFRLENBQUM7TUFDWDtLQUNEO0FBQ0QsUUFBRyxRQUFRLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQzFDO0FBQ0MsY0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQzFCLFNBQUcsU0FBUyxDQUFDLE9BQU8sRUFBQztBQUNwQixlQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7TUFDcEI7S0FDRDtJQUNEO0dBQ0Q7Ozs7OztpQ0FHcUIsSUFBSSxFQUFDO0FBQzFCLE9BQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksVUFBVSxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxFQUN4RztBQUNDLGFBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQyxFQUFHO0FBQ2pDLE1BQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDZCxDQUFDLENBQUM7QUFDSCxhQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO0FBQ2pELGFBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqQjtHQUNEOzs7OztrQ0FFcUI7QUFDckIsT0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7QUFDekcsYUFBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLEVBQUc7QUFDakMsTUFBQyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ1QsQ0FBQyxDQUFDO0FBQ0gsYUFBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztJQUNqRDtHQUNEOzs7Ozs7bUNBR3NCO0FBQ3RCLE9BQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBQztBQUNwRCxhQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLENBQUMsRUFBRztBQUNqQyxNQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDVixDQUFDLENBQUM7QUFDSCxhQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQ2hEO0dBQ0Q7OztRQTFQVyxTQUFTOzs7QUE2UHRCLFNBQVMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQzFCLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7OztBQ3huQmpELFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUdOLE1BQU0sVUFBVSxXQUFWLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsTUFBTSxTQUFTLFdBQVQsU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUN0QixNQUFNLFNBQVMsV0FBVCxTQUFTLEdBQUcsRUFBRTs7O0FBQUM7SUFHZixLQUFLLFdBQUwsS0FBSztXQUFMLEtBQUs7O0FBQ2pCLFVBRFksS0FBSyxDQUNMLEdBQUcsRUFBQyxJQUFJLEVBQUM7d0JBRFQsS0FBSzs7cUVBQUwsS0FBSzs7QUFHaEIsTUFBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUM7QUFDcEIsT0FBSSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssR0FBRyxlQUFLLFFBQVEsRUFBRSxFQUFDLElBQUksQ0FBQSxHQUFHLEVBQUUsRUFBRSxFQUFDLEtBQUssR0FBRyxlQUFLLFFBQVEsRUFBRSxFQUFDLENBQUM7R0FDdEY7QUFDRCxRQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2xCLEtBQUcsR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNuQyxRQUFLLFNBQVMsR0FDZCxHQUFHLENBQ0YsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDVixJQUFJLENBQUMsT0FBTyxFQUFDLE9BQU8sQ0FBQyxDQUNyQixLQUFLLE9BQU07Ozs7QUFBQyxBQUliLFFBQUssTUFBTSxHQUFHLE1BQUssU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBSyxJQUFJLENBQUMsQ0FBQztBQUM5RCxRQUFLLE9BQU8sR0FBRyxNQUFLLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEQsUUFBSyxNQUFNLEdBQUcsTUFBSyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlDLFFBQUssU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FDM0IsT0FBTyxDQUFDLGFBQWEsRUFBQyxJQUFJLENBQUMsQ0FDM0IsRUFBRSxDQUFDLE9BQU8sRUFBQyxZQUFJO0FBQ2YsU0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckIsU0FBSyxPQUFPLEVBQUUsQ0FBQztHQUNmLENBQUMsQ0FBQzs7O0VBRUg7O2NBM0JXLEtBQUs7OzRCQXlEUjtBQUNSLE9BQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEIsT0FBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7R0FDdEI7Ozt5QkFFSztBQUNMLE9BQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBQyxTQUFTLENBQUMsQ0FBQztBQUM3QyxPQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ2xCOzs7eUJBRUs7QUFDTCxPQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUMsT0FBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNsQjs7O21CQXpDVTtBQUNWLFVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUM3Qjs7O21CQUNPO0FBQ1AsVUFBTyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztHQUNoRDtpQkFDTSxDQUFDLEVBQUM7QUFDUixPQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0dBQ3RDOzs7bUJBQ087QUFDUCxVQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0dBQy9DO2lCQUNNLENBQUMsRUFBQztBQUNSLE9BQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7R0FDckM7OzttQkFDVTtBQUNWLFVBQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7R0FDakQ7aUJBQ1MsQ0FBQyxFQUFDO0FBQ1gsT0FBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztHQUN4Qzs7O21CQUNXO0FBQ1gsVUFBTyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztHQUNsRDtpQkFDVSxDQUFDLEVBQUM7QUFDWixPQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0dBQ3hDOzs7bUJBaUJXO0FBQ1gsVUFBTyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQVMsQ0FBQztHQUMxRTs7O1FBMUVXLEtBQUs7OztBQTZFbEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FDdEMsRUFBRSxDQUFDLFdBQVcsRUFBQyxVQUFTLENBQUMsRUFBQztBQUMxQixRQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLEtBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFaEMsR0FBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUNiLElBQUksQ0FBQyxFQUFDLEVBQUUsRUFBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsU0FBTyxFQUFDLG1CQUFtQixFQUFDLENBQUMsQ0FDN0IsS0FBSyxDQUFDO0FBQ04sTUFBSSxFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ3RCLEtBQUcsRUFBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUNwQixPQUFLLEVBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFDeEIsUUFBTSxFQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0VBQzFCLENBQUMsQ0FBQztDQUNILENBQUMsQ0FDRCxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQ3hCLEtBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFOUMsS0FBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUN0RCxLQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDOztBQUVyRCxNQUFLLENBQUMsS0FBSyxDQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsR0FBRyxJQUFJLEVBQUMsS0FBSyxFQUFDLENBQUMsR0FBRyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0NBQzlDLENBQUMsQ0FDRCxFQUFFLENBQUMsU0FBUyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQ3hCLEtBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoQyxLQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUMsSUFBRyxDQUFDLEtBQUssQ0FDUixFQUFDLE1BQU0sRUFBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQ3JELENBQUM7QUFDRixFQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xCLE1BQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztDQUNmLENBQUMsQ0FBQzs7O0FDckhKLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBR0EsV0FBVyxXQUFYLFdBQVc7WUFBWCxXQUFXOztBQUN2QixXQURZLFdBQVcsR0FDVjswQkFERCxXQUFXOzt1RUFBWCxXQUFXOztBQUd0QixVQUFLLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsVUFBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0dBQ2hCOztlQUxXLFdBQVc7OzRCQU9oQjtBQUNKLFVBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN2QixVQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hCLFVBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDdkI7Ozt5QkFFSSxPQUFPLEVBQUM7QUFDVixhQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDZixVQUFJLEFBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQ3pDO0FBQ0UsWUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7T0FDckM7QUFDRCxVQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQixRQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDYixVQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQ3hCOzs7MkJBRUs7QUFDSCxVQUFJLEFBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEFBQUMsRUFDM0M7QUFDRSxVQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDYixZQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0QyxlQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDZixZQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLFlBQUksQUFBQyxJQUFJLENBQUMsS0FBSyxHQUFJLENBQUMsSUFBSyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFDM0M7QUFDRSxjQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3hCO09BQ0Y7S0FDSDs7OzJCQUVBO0FBQ0UsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQzdDO0FBQ0UsWUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEMsZUFBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2YsVUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ2IsWUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuQixZQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUNsQjtBQUNFLGNBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEIsY0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN4QjtPQUNGO0tBQ0Y7OztTQW5EVSxXQUFXOzs7QUF1RHhCLElBQUksV0FBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7a0JBQ3JCLFdBQVc7Ozs7Ozs7O2tCQ3ZERixJQUFJOzs7OztBQUFiLFNBQVMsSUFBSSxHQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBQyxZQUFVO0FBQUMsTUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUk7TUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQTtDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsRUFBRSxJQUFFLENBQUMsR0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFFLENBQUMsSUFBRSxDQUFDLENBQUEsQUFBQyxHQUFDLEVBQUUsSUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQSxHQUFFLFVBQVUsSUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFFLENBQUMsSUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFBLEFBQUMsQ0FBQSxBQUFDLEdBQUMsR0FBRyxDQUFBO0NBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLE9BQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFDLEdBQUcsRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsTUFBSSxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL1xuLy8gV2Ugc3RvcmUgb3VyIEVFIG9iamVjdHMgaW4gYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3Jcbi8vIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxuLy9cbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICAgLCBqO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIGxpc3RlbmVycyBtYXRjaGluZyB0aGlzIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGV2ZW50cyA9IFtdO1xuXG4gIGlmIChmbikge1xuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICAgIGlmIChcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXG4gICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVycy5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgKSB7XG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXG4gICAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICAgICkge1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gIC8vXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcblxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XG4gIGVsc2UgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuZXhwb3J0ICogZnJvbSAnLi9hdWRpb05vZGVWaWV3JztcclxuZXhwb3J0ICogZnJvbSAnLi9lZyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vc2VxdWVuY2VyJztcclxuZXhwb3J0IGZ1bmN0aW9uIGR1bW15KCl7fTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHVpIGZyb20gJy4vdWknO1xyXG5cclxudmFyIGNvdW50ZXIgPSAwO1xyXG5leHBvcnQgdmFyIGN0eDtcclxuZXhwb3J0IGZ1bmN0aW9uIHNldEN0eChjKXtjdHggPSBjO31cclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHggPSAwLCB5ID0gMCx3aWR0aCA9IHVpLm5vZGVXaWR0aCxoZWlnaHQgPSB1aS5ub2RlSGVpZ2h0LG5hbWUgPSAnJykge1xyXG5cdFx0dGhpcy54ID0geCA7XHJcblx0XHR0aGlzLnkgPSB5IDtcclxuXHRcdHRoaXMud2lkdGggPSB3aWR0aCA7XHJcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodCA7XHJcblx0XHR0aGlzLm5hbWUgPSBuYW1lO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFNUQVRVU19QTEFZX05PVF9QTEFZRUQgPSAwO1xyXG5leHBvcnQgY29uc3QgU1RBVFVTX1BMQVlfUExBWUlORyA9IDE7XHJcbmV4cG9ydCBjb25zdCBTVEFUVVNfUExBWV9QTEFZRUQgPSAyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZklzTm90QVBJT2JqKHRoaXNfLHYpe1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzXywnaXNOb3RBUElPYmonLHtcclxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRcdHdyaXRhYmxlOmZhbHNlLFxyXG5cdFx0XHR2YWx1ZTogdlxyXG5cdFx0fSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBdWRpb1BhcmFtVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoQXVkaW9Ob2RlVmlldyxuYW1lLCBwYXJhbSkge1xyXG5cdFx0c3VwZXIoMCwwLHVpLnBvaW50U2l6ZSx1aS5wb2ludFNpemUsbmFtZSk7XHJcblx0XHR0aGlzLmlkID0gY291bnRlcisrO1xyXG5cdFx0dGhpcy5hdWRpb1BhcmFtID0gcGFyYW07XHJcblx0XHR0aGlzLkF1ZGlvTm9kZVZpZXcgPSBBdWRpb05vZGVWaWV3O1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBhcmFtVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoQXVkaW9Ob2RlVmlldyxuYW1lLGlzb3V0cHV0KSB7XHJcblx0XHRzdXBlcigwLDAsdWkucG9pbnRTaXplLHVpLnBvaW50U2l6ZSxuYW1lKTtcclxuXHRcdHRoaXMuaWQgPSBjb3VudGVyKys7XHJcblx0XHR0aGlzLkF1ZGlvTm9kZVZpZXcgPSBBdWRpb05vZGVWaWV3O1xyXG5cdFx0dGhpcy5pc091dHB1dCA9IGlzb3V0cHV0IHx8IGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEF1ZGlvTm9kZVZpZXcgZXh0ZW5kcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKGF1ZGlvTm9kZSxlZGl0b3IpXHJcblx0e1xyXG5cdFx0Ly8gYXVkaW9Ob2RlIOOBr+ODmeODvOOCueOBqOOBquOCi+ODjuODvOODiVxyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuaWQgPSBjb3VudGVyKys7XHJcblx0XHR0aGlzLmF1ZGlvTm9kZSA9IGF1ZGlvTm9kZTtcclxuXHRcdHRoaXMubmFtZSA9IGF1ZGlvTm9kZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9mdW5jdGlvblxccyguKilcXCgvKVsxXTtcclxuXHRcdHRoaXMuaW5wdXRQYXJhbXMgPSBbXTtcclxuXHRcdHRoaXMub3V0cHV0UGFyYW1zID0gW107XHJcblx0XHR0aGlzLnBhcmFtcyA9IFtdO1xyXG5cdFx0bGV0IGlucHV0Q3kgPSAxLG91dHB1dEN5ID0gMTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZW1vdmFibGUgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHQvLyDjg5fjg63jg5Hjg4bjgqPjg7vjg6Hjgr3jg4Pjg4njga7opIfoo71cclxuXHRcdGZvciAodmFyIGkgaW4gYXVkaW9Ob2RlKSB7XHJcblx0XHRcdGlmICh0eXBlb2YgYXVkaW9Ob2RlW2ldID09PSAnZnVuY3Rpb24nKSB7XHJcbi8vXHRcdFx0XHR0aGlzW2ldID0gYXVkaW9Ob2RlW2ldLmJpbmQoYXVkaW9Ob2RlKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAodHlwZW9mIGF1ZGlvTm9kZVtpXSA9PT0gJ29iamVjdCcpIHtcclxuXHRcdFx0XHRcdGlmIChhdWRpb05vZGVbaV0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtKSB7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0gPSBuZXcgQXVkaW9QYXJhbVZpZXcodGhpcyxpLCBhdWRpb05vZGVbaV0pO1xyXG5cdFx0XHRcdFx0XHR0aGlzLmlucHV0UGFyYW1zLnB1c2godGhpc1tpXSk7XHJcblx0XHRcdFx0XHRcdHRoaXMucGFyYW1zLnB1c2goKChwKT0+e1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRcdFx0XHRuYW1lOmksXHJcblx0XHRcdFx0XHRcdFx0XHQnZ2V0JzooKSA9PiBwLmF1ZGlvUGFyYW0udmFsdWUsXHJcblx0XHRcdFx0XHRcdFx0XHQnc2V0JzoodikgPT57cC5hdWRpb1BhcmFtLnZhbHVlID0gdjt9LFxyXG5cdFx0XHRcdFx0XHRcdFx0cGFyYW06cCxcclxuXHRcdFx0XHRcdFx0XHRcdG5vZGU6dGhpc1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSkodGhpc1tpXSkpO1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldLnkgPSAoMjAgKiBpbnB1dEN5KyspO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmKGF1ZGlvTm9kZVtpXSBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0XHRcdGF1ZGlvTm9kZVtpXS5BdWRpb05vZGVWaWV3ID0gdGhpcztcclxuXHRcdFx0XHRcdFx0dGhpc1tpXSA9IGF1ZGlvTm9kZVtpXTtcclxuXHRcdFx0XHRcdFx0aWYodGhpc1tpXS5pc091dHB1dCl7XHJcblx0XHRcdFx0XHRcdFx0dGhpc1tpXS55ID0gKDIwICogb3V0cHV0Q3krKyk7XHJcblx0XHRcdFx0XHRcdFx0dGhpc1tpXS54ID0gdGhpcy53aWR0aDtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm91dHB1dFBhcmFtcy5wdXNoKHRoaXNbaV0pO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0ueSA9ICgyMCAqIGlucHV0Q3krKyk7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5pbnB1dFBhcmFtcy5wdXNoKHRoaXNbaV0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldID0gYXVkaW9Ob2RlW2ldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoQXVkaW9Ob2RlLnByb3RvdHlwZSwgaSk7XHRcclxuXHRcdFx0XHRcdGlmKCFkZXNjKXtcclxuXHRcdFx0XHRcdFx0ZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGhpcy5hdWRpb05vZGUuX19wcm90b19fLCBpKTtcdFxyXG5cdFx0XHRcdFx0fSBcclxuXHRcdFx0XHRcdGlmKCFkZXNjKXtcclxuXHRcdFx0XHRcdFx0ZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGhpcy5hdWRpb05vZGUsaSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR2YXIgcHJvcHMgPSB7fTtcclxuXHJcbi8vXHRcdFx0XHRcdGlmKGRlc2MuZ2V0KXtcclxuXHRcdFx0XHRcdFx0XHRwcm9wcy5nZXQgPSAoKGkpID0+IHRoaXMuYXVkaW9Ob2RlW2ldKS5iaW5kKG51bGwsIGkpO1xyXG4vL1x0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKGRlc2Mud3JpdGFibGUgfHwgZGVzYy5zZXQpe1xyXG5cdFx0XHRcdFx0XHRwcm9wcy5zZXQgPSAoKGksIHYpID0+IHsgdGhpcy5hdWRpb05vZGVbaV0gPSB2OyB9KS5iaW5kKG51bGwsIGkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRwcm9wcy5lbnVtZXJhYmxlID0gZGVzYy5lbnVtZXJhYmxlO1xyXG5cdFx0XHRcdFx0cHJvcHMuY29uZmlndXJhYmxlID0gZGVzYy5jb25maWd1cmFibGU7XHJcblx0XHRcdFx0XHQvL3Byb3BzLndyaXRhYmxlID0gZmFsc2U7XHJcblx0XHRcdFx0XHQvL3Byb3BzLndyaXRhYmxlID0gZGVzYy53cml0YWJsZTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGkscHJvcHMpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRwcm9wcy5uYW1lID0gaTtcclxuXHRcdFx0XHRcdHByb3BzLm5vZGUgPSB0aGlzO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZihkZXNjLmVudW1lcmFibGUgJiYgIWkubWF0Y2goLyguKl8kKXwobmFtZSl8KF5udW1iZXJPZi4qJCkvaSkgJiYgKHR5cGVvZiBhdWRpb05vZGVbaV0pICE9PSAnQXJyYXknKXtcclxuXHRcdFx0XHRcdFx0dGhpcy5wYXJhbXMucHVzaChwcm9wcyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5pbnB1dFN0YXJ0WSA9IGlucHV0Q3kgKiAyMDtcclxuXHRcdHZhciBpbnB1dEhlaWdodCA9IChpbnB1dEN5ICsgdGhpcy5udW1iZXJPZklucHV0cykgKiAyMCA7XHJcblx0XHR2YXIgb3V0cHV0SGVpZ2h0ID0gKG91dHB1dEN5ICsgdGhpcy5udW1iZXJPZk91dHB1dHMpICogMjA7XHJcblx0XHR0aGlzLm91dHB1dFN0YXJ0WSA9IG91dHB1dEN5ICogMjA7XHJcblx0XHR0aGlzLmhlaWdodCA9IE1hdGgubWF4KHRoaXMuaGVpZ2h0LGlucHV0SGVpZ2h0LG91dHB1dEhlaWdodCk7XHJcblx0XHR0aGlzLnRlbXAgPSB7fTtcclxuXHRcdHRoaXMuc3RhdHVzUGxheSA9IFNUQVRVU19QTEFZX05PVF9QTEFZRUQ7Ly8gbm90IHBsYXllZC5cclxuXHRcdHRoaXMucGFuZWwgPSBudWxsO1xyXG5cdFx0dGhpcy5lZGl0b3IgPSBlZGl0b3IuYmluZCh0aGlzLHRoaXMpO1xyXG5cdH1cclxuXHRcclxuXHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRzdGF0aWMgcmVtb3ZlKG5vZGUpIHtcclxuXHRcdFx0aWYoIW5vZGUucmVtb3ZhYmxlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCfliYrpmaTjgafjgY3jgarjgYTjg47jg7zjg4njgafjgZnjgIInKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRpZiAoQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzW2ldID09PSBub2RlKSB7XHJcblx0XHRcdFx0XHRpZihub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKXtcclxuXHRcdFx0XHRcdFx0bm9kZS5hdWRpb05vZGUuZGlzcG9zZSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLnNwbGljZShpLS0sIDEpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0XHRpZiAobi5mcm9tLm5vZGUgPT09IG5vZGUgfHwgbi50by5ub2RlID09PSBub2RlKSB7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3RfKG4pO1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG5cclxuICAvLyBcclxuXHRzdGF0aWMgZGlzY29ubmVjdF8oY29uKSB7XHJcblx0XHRpZiAoY29uLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpIHtcclxuXHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24pO1xyXG5cdFx0fSBlbHNlIGlmIChjb24udG8ucGFyYW0pIHtcclxuXHRcdFx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0aWYgKGNvbi50by5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KSB7XHJcblx0XHRcdFx0Ly8gQVVkaW9QYXJhbVxyXG5cdFx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSkge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ucGFyYW0uYXVkaW9QYXJhbSwgY29uLmZyb20ucGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5wYXJhbS5hdWRpb1BhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gY29uLnRvLnBhcmFt44GM5pWw5a2XXHJcblx0XHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtKSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0XHRpZiAoY29uLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpIHtcclxuXHRcdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSwgY29uLmZyb20ucGFyYW0sIGNvbi50by5wYXJhbSk7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSwgMCwgY29uLnRvLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHRvIOODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRpZiAoY29uLmZyb20ucGFyYW0pIHtcclxuXHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsIGNvbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOOCs+ODjeOCr+OCt+ODp+ODs+OBruaOpee2muOCkuino+mZpOOBmeOCi1xyXG5cdHN0YXRpYyBkaXNjb25uZWN0KGZyb21fLHRvXykge1xyXG5cdFx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV99O1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIFBhcmFtVmlldyApe1xyXG5cdFx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8uQXVkaW9Ob2RlVmlldyxwYXJhbTpmcm9tX307XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdHRvXyA9IHtub2RlOnRvX307XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY29uID0geydmcm9tJzpmcm9tXywndG8nOnRvX307XHJcblx0XHRcdFxyXG5cdFx0XHQvLyDjgrPjg43jgq/jgrfjg6fjg7Pjga7liYrpmaRcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0XHRpZihjb24uZnJvbS5ub2RlID09PSBuLmZyb20ubm9kZSAmJiBjb24uZnJvbS5wYXJhbSA9PT0gbi5mcm9tLnBhcmFtIFxyXG5cdFx0XHRcdFx0JiYgY29uLnRvLm5vZGUgPT09IG4udG8ubm9kZSAmJiBjb24udG8ucGFyYW0gPT09IG4udG8ucGFyYW0pe1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3RfKGNvbik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBjcmVhdGUoYXVkaW9ub2RlLGVkaXRvciA9ICgpPT57fSkge1xyXG5cdFx0dmFyIG9iaiA9IG5ldyBBdWRpb05vZGVWaWV3KGF1ZGlvbm9kZSxlZGl0b3IpO1xyXG5cdFx0QXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLnB1c2gob2JqKTtcclxuXHRcdHJldHVybiBvYmo7XHJcblx0fVxyXG5cdFxyXG4gIC8vIOODjuODvOODiemWk+OBruaOpee2mlxyXG5cdHN0YXRpYyBjb25uZWN0KGZyb21fLCB0b18pIHtcclxuXHRcdGlmKGZyb21fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyApe1xyXG5cdFx0XHRmcm9tXyA9IHtub2RlOmZyb21fLHBhcmFtOjB9O1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGZyb21fIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tXy5BdWRpb05vZGVWaWV3LHBhcmFtOmZyb21ffTtcclxuXHRcdH1cclxuXHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHR0b18gPSB7bm9kZTp0b18scGFyYW06MH07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYodG9fIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffTtcclxuXHRcdH1cclxuXHRcdC8vIOWtmOWcqOODgeOCp+ODg+OCr1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcblx0XHRcdHZhciBjID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRpZiAoYy5mcm9tLm5vZGUgPT09IGZyb21fLm5vZGUgXHJcblx0XHRcdFx0JiYgYy5mcm9tLnBhcmFtID09PSBmcm9tXy5wYXJhbVxyXG5cdFx0XHRcdCYmIGMudG8ubm9kZSA9PT0gdG9fLm5vZGVcclxuXHRcdFx0XHQmJiBjLnRvLnBhcmFtID09PSB0b18ucGFyYW1cclxuXHRcdFx0XHQpIFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuLy9cdFx0XHRcdHRocm93IChuZXcgRXJyb3IoJ+aOpee2muOBjOmHjeikh+OBl+OBpuOBhOOBvuOBmeOAgicpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyDmjqXntprlhYjjgYxQYXJhbVZpZXfjga7loLTlkIjjga/mjqXntprlhYPjga9QYXJhbVZpZXfjga7jgb9cclxuXHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyAmJiAhKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KSl7XHJcblx0XHQgIHJldHVybiA7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFBhcmFtVmlld+OBjOaOpee2muWPr+iDveOBquOBruOBr0F1ZGlvUGFyYW3jgYvjgolQYXJhbVZpZXfjga7jgb9cclxuXHRcdGlmKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0aWYoISh0b18ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcgfHwgdG9fLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpKXtcclxuXHRcdFx0XHRyZXR1cm47XHRcclxuXHRcdFx0fVxyXG5cdFx0fSBcclxuXHRcdFxyXG5cdFx0aWYgKGZyb21fLnBhcmFtKSB7XHJcblx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdCAgaWYoZnJvbV8ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdCAgZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh7J2Zyb20nOmZyb21fLCd0byc6dG9ffSk7XHJcbi8vXHRcdFx0XHRmcm9tXy5ub2RlLmNvbm5lY3RQYXJhbShmcm9tXy5wYXJhbSx0b18pO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHRvXy5wYXJhbSkgXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdC8vIEF1ZGlvUGFyYW3jga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLnBhcmFtLmF1ZGlvUGFyYW0sZnJvbV8ucGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyDmlbDlrZfjga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLCBmcm9tXy5wYXJhbSx0b18ucGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLGZyb21fLnBhcmFtKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRpZiAodG9fLnBhcmFtKSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRpZih0b18ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0XHQvLyBBdWRpb1BhcmFt44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5wYXJhbS5hdWRpb1BhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2V7XHJcblx0XHRcdFx0XHQvLyDmlbDlrZfjga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLDAsdG9fLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly90aHJvdyBuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gRXJyb3InKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnB1c2hcclxuXHRcdCh7XHJcblx0XHRcdCdmcm9tJzogZnJvbV8sXHJcblx0XHRcdCd0byc6IHRvX1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzID0gW107XHJcbkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucyA9IFtdO1xyXG5cclxuXHJcbiIsImltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpLmpzJztcclxuaW1wb3J0IHtzaG93U2VxdWVuY2VFZGl0b3J9IGZyb20gJy4vc2VxdWVuY2VFZGl0b3InO1xyXG5cclxuZXhwb3J0IHZhciBzdmc7XHJcbi8vYWFcclxudmFyIG5vZGVHcm91cCwgbGluZUdyb3VwO1xyXG52YXIgZHJhZztcclxudmFyIGRyYWdPdXQ7XHJcbnZhciBkcmFnUGFyYW07XHJcbnZhciBkcmFnUGFuZWw7XHJcblxyXG52YXIgbW91c2VDbGlja05vZGU7XHJcbnZhciBtb3VzZU92ZXJOb2RlO1xyXG52YXIgbGluZTtcclxudmFyIGF1ZGlvTm9kZUNyZWF0b3JzID0gW107XHJcblxyXG4vLyBEcmF344Gu5Yid5pyf5YyWXHJcbmV4cG9ydCBmdW5jdGlvbiBpbml0VUkoKXtcclxuXHQvLyDlh7rlipvjg47jg7zjg4njga7kvZzmiJDvvIjliYrpmaTkuI3lj6/vvIlcclxuXHR2YXIgb3V0ID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmRlc3RpbmF0aW9uLHNob3dQYW5lbCk7XHJcblx0b3V0LnggPSB3aW5kb3cuaW5uZXJXaWR0aCAvIDI7XHJcblx0b3V0LnkgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xyXG5cdG91dC5yZW1vdmFibGUgPSBmYWxzZTtcclxuXHRcclxuXHQvLyDjg5fjg6zjgqTjg6Tjg7xcclxuXHRhdWRpby5TZXF1ZW5jZXIuYWRkZWQgPSAoKT0+XHJcblx0e1xyXG5cdFx0aWYoYXVkaW8uU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoID09IDEgJiYgYXVkaW8uU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09PSBhdWRpby5TRVFfU1RBVFVTLlNUT1BQRUQpe1xyXG5cdFx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdFx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YXVkaW8uU2VxdWVuY2VyLmVtcHR5ID0gKCk9PntcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5zdG9wU2VxdWVuY2VzKCk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdH0gXHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjcGxheScpXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5zdGFydFNlcXVlbmNlcyhhdWRpby5jdHguY3VycmVudFRpbWUpO1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9KTtcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNwYXVzZScpLm9uKCdjbGljaycsZnVuY3Rpb24oKXtcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5wYXVzZVNlcXVlbmNlcygpO1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3N0b3AnKS5vbignY2xpY2snLGZ1bmN0aW9uKCl7XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIuc3RvcFNlcXVlbmNlcygpO1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9KTtcclxuXHRcclxuXHRhdWRpby5TZXF1ZW5jZXIuc3RvcHBlZCA9ICgpPT57XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHQvLyBBdWRpb05vZGXjg4njg6njg4PjgrDnlKhcclxuXHRkcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcblx0Lm9yaWdpbihmdW5jdGlvbiAoZCkgeyByZXR1cm4gZDsgfSlcclxuXHQub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oZCl7XHJcblx0XHRpZihkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5IHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnbW91c2V1cCcpKTtcdFx0XHRcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0ZC50ZW1wLnggPSBkLng7XHJcblx0XHRkLnRlbXAueSA9IGQueTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKHtpZDonZHJhZycsd2lkdGg6ZC53aWR0aCxoZWlnaHQ6ZC5oZWlnaHQseDowLHk6MCwnY2xhc3MnOidhdWRpb05vZGVEcmFnJ30gKTtcclxuXHR9KVxyXG5cdC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdGlmKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRkLnRlbXAueCArPSBkMy5ldmVudC5keDtcclxuXHRcdGQudGVtcC55ICs9IGQzLmV2ZW50LmR5O1xyXG5cdFx0Ly9kMy5zZWxlY3QodGhpcykuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgKGQueCAtIGQud2lkdGggLyAyKSArICcsJyArIChkLnkgLSBkLmhlaWdodCAvIDIpICsgJyknKTtcclxuXHRcdC8vZHJhdygpO1xyXG5cdFx0dmFyIGRyYWdDdXJzb2wgPSBkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKVxyXG5cdFx0LnNlbGVjdCgncmVjdCNkcmFnJyk7XHJcblx0XHR2YXIgeCA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd4JykpICsgZDMuZXZlbnQuZHg7XHJcblx0XHR2YXIgeSA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd5JykpICsgZDMuZXZlbnQuZHk7XHJcblx0XHRkcmFnQ3Vyc29sLmF0dHIoe3g6eCx5Onl9KTtcdFx0XHJcblx0fSlcclxuXHQub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0aWYoZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5zaGlmdEtleSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHZhciBkcmFnQ3Vyc29sID0gZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSlcclxuXHRcdC5zZWxlY3QoJ3JlY3QjZHJhZycpO1xyXG5cdFx0dmFyIHggPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneCcpKTtcclxuXHRcdHZhciB5ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3knKSk7XHJcblx0XHRkLnggPSBkLnRlbXAueDtcclxuXHRcdGQueSA9IGQudGVtcC55O1xyXG5cdFx0ZHJhZ0N1cnNvbC5yZW1vdmUoKTtcdFx0XHJcblx0XHRkcmF3KCk7XHJcblx0fSk7XHJcblx0XHJcblx0Ly8g44OO44O844OJ6ZaT5o6l57aa55SoIGRyYWcgXHJcblx0ZHJhZ091dCA9IGQzLmJlaGF2aW9yLmRyYWcoKVxyXG5cdC5vcmlnaW4oZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQ7IH0pXHJcblx0Lm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0bGV0IHgxLHkxO1xyXG5cdFx0aWYoZC5pbmRleCl7XHJcblx0XHRcdGlmKGQuaW5kZXggaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHgxID0gZC5ub2RlLnggLSBkLm5vZGUud2lkdGggLyAyICsgZC5pbmRleC54O1xyXG5cdFx0XHRcdHkxID0gZC5ub2RlLnkgLSBkLm5vZGUuaGVpZ2h0IC8yICsgZC5pbmRleC55O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHgxID0gZC5ub2RlLnggKyBkLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHRcdHkxID0gZC5ub2RlLnkgLSBkLm5vZGUuaGVpZ2h0IC8yICsgZC5ub2RlLm91dHB1dFN0YXJ0WSArIGQuaW5kZXggKiAyMDsgXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHgxID0gZC5ub2RlLnggKyBkLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHR5MSA9IGQubm9kZS55IC0gZC5ub2RlLmhlaWdodCAvMiArIGQubm9kZS5vdXRwdXRTdGFydFk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZC54MSA9IHgxLGQueTEgPSB5MTtcdFx0XHRcdFxyXG5cdFx0ZC54MiA9IHgxLGQueTIgPSB5MTtcclxuXHJcblx0XHR2YXIgcG9zID0gbWFrZVBvcyh4MSx5MSxkLngyLGQueTIpO1xyXG5cdFx0ZC5saW5lID0gc3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuZGF0dW0oZClcclxuXHRcdC5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0LmF0dHIoeydkJzpsaW5lKHBvcyksJ2NsYXNzJzonbGluZS1kcmFnJ30pO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0ZC54MiArPSBkMy5ldmVudC5keDtcclxuXHRcdGQueTIgKz0gZDMuZXZlbnQuZHk7XHJcblx0XHRkLmxpbmUuYXR0cignZCcsbGluZShtYWtlUG9zKGQueDEsZC55MSxkLngyLGQueTIpKSk7XHRcdFx0XHRcdFxyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ2VuZFwiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0bGV0IHRhcmdldFggPSBkLngyO1xyXG5cdFx0bGV0IHRhcmdldFkgPSBkLnkyO1xyXG5cdFx0Ly8gaW5wdXTjgoLjgZfjgY/jga9wYXJhbeOBq+WIsOmBlOOBl+OBpuOBhOOCi+OBi1xyXG5cdFx0Ly8gaW5wdXRcdFx0XHJcblx0XHRsZXQgY29ubmVjdGVkID0gZmFsc2U7XHJcblx0XHRsZXQgaW5wdXRzID0gZDMuc2VsZWN0QWxsKCcuaW5wdXQnKVswXTtcclxuXHRcdGZvcih2YXIgaSA9IDAsbCA9IGlucHV0cy5sZW5ndGg7aSA8IGw7KytpKXtcclxuXHRcdFx0bGV0IGVsbSA9IGlucHV0c1tpXTtcclxuXHRcdFx0bGV0IGJib3ggPSBlbG0uZ2V0QkJveCgpO1xyXG5cdFx0XHRsZXQgbm9kZSA9IGVsbS5fX2RhdGFfXy5ub2RlO1xyXG5cdFx0XHRsZXQgbGVmdCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54LFxyXG5cdFx0XHRcdHRvcCA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueSxcclxuXHRcdFx0XHRyaWdodCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54ICsgYmJveC53aWR0aCxcclxuXHRcdFx0XHRib3R0b20gPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94LnkgKyBiYm94LmhlaWdodDtcclxuXHRcdFx0aWYodGFyZ2V0WCA+PSBsZWZ0ICYmIHRhcmdldFggPD0gcmlnaHQgJiYgdGFyZ2V0WSA+PSB0b3AgJiYgdGFyZ2V0WSA8PSBib3R0b20pXHJcblx0XHRcdHtcclxuLy9cdFx0XHRcdGNvbnNvbGUubG9nKCdoaXQnLGVsbSk7XHJcblx0XHRcdFx0bGV0IGZyb21fID0ge25vZGU6ZC5ub2RlLHBhcmFtOmQuaW5kZXh9O1xyXG5cdFx0XHRcdGxldCB0b18gPSB7bm9kZTpub2RlLHBhcmFtOmVsbS5fX2RhdGFfXy5pbmRleH07XHJcblx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KGZyb21fLHRvXyk7XHJcblx0XHRcdFx0Ly9BdWRpb05vZGVWaWV3LmNvbm5lY3QoKTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdFx0Y29ubmVjdGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZighY29ubmVjdGVkKXtcclxuXHRcdFx0Ly8gQXVkaW9QYXJhbVxyXG5cdFx0XHR2YXIgcGFyYW1zID0gZDMuc2VsZWN0QWxsKCcucGFyYW0sLmF1ZGlvLXBhcmFtJylbMF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDAsbCA9IHBhcmFtcy5sZW5ndGg7aSA8IGw7KytpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IGVsbSA9IHBhcmFtc1tpXTtcclxuXHRcdFx0XHRsZXQgYmJveCA9IGVsbS5nZXRCQm94KCk7XHJcblx0XHRcdFx0bGV0IHBhcmFtID0gZWxtLl9fZGF0YV9fO1xyXG5cdFx0XHRcdGxldCBub2RlID0gcGFyYW0ubm9kZTtcclxuXHRcdFx0XHRsZXQgbGVmdCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54O1xyXG5cdFx0XHRcdGxldFx0dG9wXyA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueTtcclxuXHRcdFx0XHRsZXRcdHJpZ2h0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LnggKyBiYm94LndpZHRoO1xyXG5cdFx0XHRcdGxldFx0Ym90dG9tID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55ICsgYmJveC5oZWlnaHQ7XHJcblx0XHRcdFx0aWYodGFyZ2V0WCA+PSBsZWZ0ICYmIHRhcmdldFggPD0gcmlnaHQgJiYgdGFyZ2V0WSA+PSB0b3BfICYmIHRhcmdldFkgPD0gYm90dG9tKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdoaXQnLGVsbSk7XHJcblx0XHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6ZC5ub2RlLHBhcmFtOmQuaW5kZXh9LHtub2RlOm5vZGUscGFyYW06cGFyYW0uaW5kZXh9KTtcclxuXHRcdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gbGluZeODl+ODrOODk+ODpeODvOOBruWJiumZpFxyXG5cdFx0ZC5saW5lLnJlbW92ZSgpO1xyXG5cdFx0ZGVsZXRlIGQubGluZTtcclxuXHR9KTtcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNwYW5lbC1jbG9zZScpXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oKXtkMy5zZWxlY3QoJyNwcm9wLXBhbmVsJykuc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO2QzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7fSk7XHJcblxyXG5cdC8vIG5vZGXplpPmjqXntppsaW5l5o+P55S76Zai5pWwXHJcblx0bGluZSA9IGQzLnN2Zy5saW5lKClcclxuXHQueChmdW5jdGlvbihkKXtyZXR1cm4gZC54fSlcclxuXHQueShmdW5jdGlvbihkKXtyZXR1cm4gZC55fSlcclxuXHQuaW50ZXJwb2xhdGUoJ2Jhc2lzJyk7XHJcblxyXG5cdC8vIERPTeOBq3N2Z+OCqOODrOODoeODs+ODiOOCkuaMv+WFpVx0XHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjY29udGVudCcpXHJcblx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0LmF0dHIoeyAnd2lkdGgnOiB3aW5kb3cuaW5uZXJXaWR0aCwgJ2hlaWdodCc6IHdpbmRvdy5pbm5lckhlaWdodCB9KTtcclxuXHJcblx0Ly8g44OO44O844OJ44GM5YWl44KL44Kw44Or44O844OXXHJcblx0bm9kZUdyb3VwID0gc3ZnLmFwcGVuZCgnZycpO1xyXG5cdC8vIOODqeOCpOODs+OBjOWFpeOCi+OCsOODq+ODvOODl1xyXG5cdGxpbmVHcm91cCA9IHN2Zy5hcHBlbmQoJ2cnKTtcclxuXHRcclxuXHQvLyBib2R55bGe5oCn44Gr5oy/5YWlXHJcblx0YXVkaW9Ob2RlQ3JlYXRvcnMgPSBcclxuXHRbXHJcblx0XHR7bmFtZTonR2FpbicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVHYWluLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonRGVsYXknLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlRGVsYXkuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidBdWRpb0J1ZmZlclNvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidNZWRpYUVsZW1lbnRBdWRpb1NvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidQYW5uZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlUGFubmVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ29udm9sdmVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNvbnZvbHZlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0FuYWx5c2VyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUFuYWx5c2VyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ2hhbm5lbFNwbGl0dGVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxTcGxpdHRlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0NoYW5uZWxNZXJnZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQ2hhbm5lbE1lcmdlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0R5bmFtaWNzQ29tcHJlc3NvcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidCaXF1YWRGaWx0ZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQmlxdWFkRmlsdGVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonT3NjaWxsYXRvcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVPc2NpbGxhdG9yLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonTWVkaWFTdHJlYW1BdWRpb1NvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J1dhdmVTaGFwZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlV2F2ZVNoYXBlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0VHJyxjcmVhdGU6KCk9Pm5ldyBhdWRpby5FRygpfSxcclxuXHRcdHtuYW1lOidTZXF1ZW5jZXInLGNyZWF0ZTooKT0+bmV3IGF1ZGlvLlNlcXVlbmNlcigpLGVkaXRvcjpzaG93U2VxdWVuY2VFZGl0b3J9XHJcblx0XTtcclxuXHRcclxuXHRpZihhdWRpby5jdHguY3JlYXRlTWVkaWFTdHJlYW1EZXN0aW5hdGlvbil7XHJcblx0XHRhdWRpb05vZGVDcmVhdG9ycy5wdXNoKHtuYW1lOidNZWRpYVN0cmVhbUF1ZGlvRGVzdGluYXRpb24nLFxyXG5cdFx0XHRjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtRGVzdGluYXRpb24uYmluZChhdWRpby5jdHgpXHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjY29udGVudCcpXHJcblx0LmRhdHVtKHt9KVxyXG5cdC5vbignY29udGV4dG1lbnUnLGZ1bmN0aW9uKCl7XHJcblx0XHRzaG93QXVkaW9Ob2RlUGFuZWwodGhpcyk7XHJcblx0fSk7XHJcbn1cclxuXHJcbi8vIOaPj+eUu1xyXG5leHBvcnQgZnVuY3Rpb24gZHJhdygpIHtcclxuXHQvLyBBdWRpb05vZGXjga7mj4/nlLtcclxuXHR2YXIgZ2QgPSBub2RlR3JvdXAuc2VsZWN0QWxsKCdnJykuXHJcblx0ZGF0YShhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMsZnVuY3Rpb24oZCl7cmV0dXJuIGQuaWQ7fSk7XHJcblxyXG5cdC8vIOefqeW9ouOBruabtOaWsFxyXG5cdGdkLnNlbGVjdCgncmVjdCcpXHJcblx0LmF0dHIoeyAnd2lkdGgnOiAoZCk9PiBkLndpZHRoLCAnaGVpZ2h0JzogKGQpPT4gZC5oZWlnaHQgfSk7XHJcblx0XHJcblx0Ly8gQXVkaW9Ob2Rl55+p5b2i44Kw44Or44O844OXXHJcblx0dmFyIGcgPSBnZC5lbnRlcigpXHJcblx0LmFwcGVuZCgnZycpO1xyXG5cdC8vIEF1ZGlvTm9kZeefqeW9ouOCsOODq+ODvOODl+OBruW6p+aomeS9jee9ruOCu+ODg+ODiFxyXG5cdGdkLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiAndHJhbnNsYXRlKCcgKyAoZC54IC0gZC53aWR0aCAvIDIpICsgJywnICsgKGQueSAtIGQuaGVpZ2h0IC8gMikgKyAnKScgfSk7XHRcclxuXHJcblx0Ly8gQXVkaW9Ob2Rl55+p5b2iXHJcblx0Zy5hcHBlbmQoJ3JlY3QnKVxyXG5cdC5jYWxsKGRyYWcpXHJcblx0LmF0dHIoeyAnd2lkdGgnOiAoZCk9PiBkLndpZHRoLCAnaGVpZ2h0JzogKGQpPT4gZC5oZWlnaHQsICdjbGFzcyc6ICdhdWRpb05vZGUnIH0pXHJcblx0LmNsYXNzZWQoJ3BsYXknLGZ1bmN0aW9uKGQpe1xyXG5cdFx0cmV0dXJuIGQuc3RhdHVzUGxheSA9PT0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUlORztcclxuXHR9KVxyXG5cdC5vbignY29udGV4dG1lbnUnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g44OR44Op44Oh44O844K/57eo6ZuG55S76Z2i44Gu6KGo56S6XHJcblx0XHRkLmVkaXRvcigpO1xyXG5cdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0fSlcclxuXHQub24oJ2NsaWNrLnJlbW92ZScsZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRcdGlmKGQzLmV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0ZC5wYW5lbCAmJiBkLnBhbmVsLmlzU2hvdyAmJiBkLnBhbmVsLmRpc3Bvc2UoKTtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShkKTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdH0gY2F0Y2goZSkge1xyXG4vL1x0XHRcdFx0ZGlhbG9nLnRleHQoZS5tZXNzYWdlKS5ub2RlKCkuc2hvdyh3aW5kb3cuaW5uZXJXaWR0aC8yLHdpbmRvdy5pbm5lckhlaWdodC8yKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0fSlcclxuXHQuZmlsdGVyKGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g6Z+z5rqQ44Gu44G/44Gr44OV44Kj44Or44K/XHJcblx0XHRyZXR1cm4gZC5hdWRpb05vZGUgaW5zdGFuY2VvZiBPc2NpbGxhdG9yTm9kZSB8fCBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyU291cmNlTm9kZSB8fCBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIE1lZGlhRWxlbWVudEF1ZGlvU291cmNlTm9kZTsgXHJcblx0fSlcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOWGjeeUn+ODu+WBnOatolxyXG5cdFx0Y29uc29sZS5sb2coZDMuZXZlbnQpO1xyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdFx0aWYoIWQzLmV2ZW50LmN0cmxLZXkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRsZXQgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0aWYoZC5zdGF0dXNQbGF5ID09PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HKXtcclxuXHRcdFx0ZC5zdGF0dXNQbGF5ID0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUVEO1xyXG5cdFx0XHRzZWwuY2xhc3NlZCgncGxheScsZmFsc2UpO1xyXG5cdFx0XHRkLmF1ZGlvTm9kZS5zdG9wKDApO1xyXG5cdFx0fSBlbHNlIGlmKGQuc3RhdHVzUGxheSAhPT0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUVEKXtcclxuXHRcdFx0ZC5hdWRpb05vZGUuc3RhcnQoMCk7XHJcblx0XHRcdGQuc3RhdHVzUGxheSA9IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlJTkc7XHJcblx0XHRcdHNlbC5jbGFzc2VkKCdwbGF5Jyx0cnVlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFsZXJ0KCfkuIDluqblgZzmraLjgZnjgovjgajlho3nlJ/jgafjgY3jgb7jgZvjgpPjgIInKTtcclxuXHRcdH1cclxuXHR9KVxyXG5cdC5jYWxsKHRvb2x0aXAoJ0N0cmwgKyBDbGljayDjgaflho3nlJ/jg7vlgZzmraInKSk7XHJcblx0O1xyXG5cdFxyXG5cdC8vIEF1ZGlvTm9kZeOBruODqeODmeODq1xyXG5cdGcuYXBwZW5kKCd0ZXh0JylcclxuXHQuYXR0cih7IHg6IDAsIHk6IC0xMCwgJ2NsYXNzJzogJ2xhYmVsJyB9KVxyXG5cdC50ZXh0KGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLm5hbWU7IH0pO1xyXG5cclxuXHQvLyDlhaXliptBdWRpb1BhcmFt44Gu6KGo56S6XHRcclxuXHRnZC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0dmFyIGdwID0gc2VsLmFwcGVuZCgnZycpO1xyXG5cdFx0dmFyIGdwZCA9IGdwLnNlbGVjdEFsbCgnZycpXHJcblx0XHQuZGF0YShkLmlucHV0UGFyYW1zLm1hcCgoZCk9PntcclxuXHRcdFx0cmV0dXJuIHtub2RlOmQuQXVkaW9Ob2RlVmlldyxpbmRleDpkfTtcclxuXHRcdH0pLGZ1bmN0aW9uKGQpe3JldHVybiBkLmluZGV4LmlkO30pO1x0XHRcclxuXHJcblx0XHR2YXIgZ3BkZyA9IGdwZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJyk7XHJcblx0XHRcclxuXHRcdGdwZGcuYXBwZW5kKCdjaXJjbGUnKVxyXG5cdFx0LmF0dHIoeydyJzogKGQpPT5kLmluZGV4LndpZHRoLzIsIFxyXG5cdFx0Y3g6IDAsIGN5OiAoZCwgaSk9PiB7IHJldHVybiBkLmluZGV4Lnk7IH0sXHJcblx0XHQnY2xhc3MnOiBmdW5jdGlvbihkKSB7XHJcblx0XHRcdGlmKGQuaW5kZXggaW5zdGFuY2VvZiBhdWRpby5BdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0cmV0dXJuICdhdWRpby1wYXJhbSc7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuICdwYXJhbSc7XHJcblx0XHR9fSk7XHJcblx0XHRcclxuXHRcdGdwZGcuYXBwZW5kKCd0ZXh0JylcclxuXHRcdC5hdHRyKHt4OiAoZCk9PiAoZC5pbmRleC54ICsgZC5pbmRleC53aWR0aCAvIDIgKyA1KSx5OihkKT0+ZC5pbmRleC55LCdjbGFzcyc6J2xhYmVsJyB9KVxyXG5cdFx0LnRleHQoKGQpPT5kLmluZGV4Lm5hbWUpO1xyXG5cclxuXHRcdGdwZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHR9KTtcclxuXHJcblx0Ly8g5Ye65YqbUGFyYW3jga7ooajnpLpcdFxyXG5cdGdkLmVhY2goZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHR2YXIgZ3AgPSBzZWwuYXBwZW5kKCdnJyk7XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0XHJcblx0XHR2YXIgZ3BkID0gZ3Auc2VsZWN0QWxsKCdnJylcclxuXHRcdC5kYXRhKGQub3V0cHV0UGFyYW1zLm1hcCgoZCk9PntcclxuXHRcdFx0cmV0dXJuIHtub2RlOmQuQXVkaW9Ob2RlVmlldyxpbmRleDpkfTtcclxuXHRcdH0pLGZ1bmN0aW9uKGQpe3JldHVybiBkLmluZGV4LmlkO30pO1xyXG5cdFx0XHJcblx0XHR2YXIgZ3BkZyA9IGdwZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJyk7XHJcblxyXG5cdFx0Z3BkZy5hcHBlbmQoJ2NpcmNsZScpXHJcblx0XHQuYXR0cih7J3InOiAoZCk9PmQuaW5kZXgud2lkdGgvMiwgXHJcblx0XHRjeDogZC53aWR0aCwgY3k6IChkLCBpKT0+IHsgcmV0dXJuIGQuaW5kZXgueTsgfSxcclxuXHRcdCdjbGFzcyc6ICdwYXJhbSd9KVxyXG5cdFx0LmNhbGwoZHJhZ091dCk7XHJcblx0XHRcclxuXHRcdGdwZGcuYXBwZW5kKCd0ZXh0JylcclxuXHRcdC5hdHRyKHt4OiAoZCk9PiAoZC5pbmRleC54ICsgZC5pbmRleC53aWR0aCAvIDIgKyA1KSx5OihkKT0+ZC5pbmRleC55LCdjbGFzcyc6J2xhYmVsJyB9KVxyXG5cdFx0LnRleHQoKGQpPT5kLmluZGV4Lm5hbWUpO1xyXG5cclxuXHRcdGdwZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHR9KTtcclxuXHJcblx0Ly8g5Ye65Yqb6KGo56S6XHJcblx0Z2QuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XHJcblx0XHRyZXR1cm4gZC5udW1iZXJPZk91dHB1dHMgPiAwO1xyXG5cdH0pXHJcblx0LmVhY2goZnVuY3Rpb24oZCl7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgnZycpO1xyXG5cdFx0aWYoIWQudGVtcC5vdXRzIHx8IChkLnRlbXAub3V0cyAmJiAoZC50ZW1wLm91dHMubGVuZ3RoIDwgZC5udW1iZXJPZk91dHB1dHMpKSlcclxuXHRcdHtcclxuXHRcdFx0ZC50ZW1wLm91dHMgPSBbXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDtpIDwgZC5udW1iZXJPZk91dHB1dHM7KytpKXtcclxuXHRcdFx0XHRkLnRlbXAub3V0cy5wdXNoKHtub2RlOmQsaW5kZXg6aX0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR2YXIgc2VsMSA9IHNlbC5zZWxlY3RBbGwoJ2cnKTtcclxuXHRcdHZhciBzZWxkID0gc2VsMS5kYXRhKGQudGVtcC5vdXRzKTtcclxuXHJcblx0XHRzZWxkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cih7IHg6IGQud2lkdGggLSB1aS5wb2ludFNpemUgLyAyLCB5OiAoZDEpPT4gKGQub3V0cHV0U3RhcnRZICsgZDEuaW5kZXggKiAyMCAtIHVpLnBvaW50U2l6ZSAvIDIpLCB3aWR0aDogdWkucG9pbnRTaXplLCBoZWlnaHQ6IHVpLnBvaW50U2l6ZSwgJ2NsYXNzJzogJ291dHB1dCcgfSlcclxuXHRcdC5jYWxsKGRyYWdPdXQpO1xyXG5cdFx0c2VsZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0fSk7XHJcblxyXG5cdC8vIOWFpeWKm+ihqOekulxyXG5cdGdkXHJcblx0LmZpbHRlcihmdW5jdGlvbiAoZCkge1x0cmV0dXJuIGQubnVtYmVyT2ZJbnB1dHMgPiAwOyB9KVxyXG5cdC5lYWNoKGZ1bmN0aW9uKGQpe1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ2cnKTtcclxuXHRcdGlmKCFkLnRlbXAuaW5zIHx8IChkLnRlbXAuaW5zICYmIChkLnRlbXAuaW5zLmxlbmd0aCA8IGQubnVtYmVyT2ZJbnB1dHMpKSlcclxuXHRcdHtcclxuXHRcdFx0ZC50ZW1wLmlucyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwO2kgPCBkLm51bWJlck9mSW5wdXRzOysraSl7XHJcblx0XHRcdFx0ZC50ZW1wLmlucy5wdXNoKHtub2RlOmQsaW5kZXg6aX0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR2YXIgc2VsMSA9IHNlbC5zZWxlY3RBbGwoJ2cnKTtcclxuXHRcdHZhciBzZWxkID0gc2VsMS5kYXRhKGQudGVtcC5pbnMpO1xyXG5cclxuXHRcdHNlbGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKHsgeDogLSB1aS5wb2ludFNpemUgLyAyLCB5OiAoZDEpPT4gKGQuaW5wdXRTdGFydFkgKyBkMS5pbmRleCAqIDIwIC0gdWkucG9pbnRTaXplIC8gMiksIHdpZHRoOiB1aS5wb2ludFNpemUsIGhlaWdodDogdWkucG9pbnRTaXplLCAnY2xhc3MnOiAnaW5wdXQnIH0pXHJcblx0XHQub24oJ21vdXNlZW50ZXInLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRtb3VzZU92ZXJOb2RlID0ge25vZGU6ZC5hdWRpb05vZGVfLHBhcmFtOmR9O1xyXG5cdFx0fSlcclxuXHRcdC5vbignbW91c2VsZWF2ZScsZnVuY3Rpb24oZCl7XHJcblx0XHRcdGlmKG1vdXNlT3Zlck5vZGUubm9kZSl7XHJcblx0XHRcdFx0aWYobW91c2VPdmVyTm9kZS5ub2RlID09PSBkLmF1ZGlvTm9kZV8gJiYgbW91c2VPdmVyTm9kZS5wYXJhbSA9PT0gZCl7XHJcblx0XHRcdFx0XHRtb3VzZU92ZXJOb2RlID0gbnVsbDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0c2VsZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0fSk7XHJcblx0XHJcblx0Ly8g5LiN6KaB44Gq44OO44O844OJ44Gu5YmK6ZmkXHJcblx0Z2QuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0Ly8gbGluZSDmj4/nlLtcclxuXHR2YXIgbGQgPSBsaW5lR3JvdXAuc2VsZWN0QWxsKCdwYXRoJylcclxuXHQuZGF0YShhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMpO1xyXG5cclxuXHRsZC5lbnRlcigpXHJcblx0LmFwcGVuZCgncGF0aCcpO1xyXG5cclxuXHRsZC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgcGF0aCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdHZhciB4MSx5MSx4Mix5MjtcclxuXHJcblx0XHQvLyB4MSx5MVxyXG5cdFx0aWYoZC5mcm9tLnBhcmFtKXtcclxuXHRcdFx0aWYoZC5mcm9tLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR4MSA9IGQuZnJvbS5ub2RlLnggLSBkLmZyb20ubm9kZS53aWR0aCAvIDIgKyBkLmZyb20ucGFyYW0ueDtcclxuXHRcdFx0XHR5MSA9IGQuZnJvbS5ub2RlLnkgLSBkLmZyb20ubm9kZS5oZWlnaHQgLzIgKyBkLmZyb20ucGFyYW0ueTsgXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eDEgPSBkLmZyb20ubm9kZS54ICsgZC5mcm9tLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHRcdHkxID0gZC5mcm9tLm5vZGUueSAtIGQuZnJvbS5ub2RlLmhlaWdodCAvMiArIGQuZnJvbS5ub2RlLm91dHB1dFN0YXJ0WSArIGQuZnJvbS5wYXJhbSAqIDIwOyBcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0eDEgPSBkLmZyb20ubm9kZS54ICsgZC5mcm9tLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHR5MSA9IGQuZnJvbS5ub2RlLnkgLSBkLmZyb20ubm9kZS5oZWlnaHQgLzIgKyBkLmZyb20ubm9kZS5vdXRwdXRTdGFydFk7XHJcblx0XHR9XHJcblxyXG5cdFx0eDIgPSBkLnRvLm5vZGUueCAtIGQudG8ubm9kZS53aWR0aCAvIDI7XHJcblx0XHR5MiA9IGQudG8ubm9kZS55IC0gZC50by5ub2RlLmhlaWdodCAvIDI7XHJcblx0XHRcclxuXHRcdGlmKGQudG8ucGFyYW0pe1xyXG5cdFx0XHRpZihkLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcgfHwgZC50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDIgKz0gZC50by5wYXJhbS54O1xyXG5cdFx0XHRcdHkyICs9IGQudG8ucGFyYW0ueTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR5MiArPSAgZC50by5ub2RlLmlucHV0U3RhcnRZICArICBkLnRvLnBhcmFtICogMjA7XHRcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0eTIgKz0gZC50by5ub2RlLmlucHV0U3RhcnRZO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgcG9zID0gbWFrZVBvcyh4MSx5MSx4Mix5Mik7XHJcblx0XHRcclxuXHRcdHBhdGguYXR0cih7J2QnOmxpbmUocG9zKSwnY2xhc3MnOidsaW5lJ30pO1xyXG5cdFx0cGF0aC5vbignY2xpY2snLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRpZihkMy5ldmVudC5zaGlmdEtleSl7XHJcblx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KGQuZnJvbSxkLnRvKTtcclxuXHRcdFx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0fSBcclxuXHRcdH0pLmNhbGwodG9vbHRpcCgnU2hpZnQgKyBjbGlja+OBp+WJiumZpCcpKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cdGxkLmV4aXQoKS5yZW1vdmUoKTtcclxufVxyXG5cclxuLy8g57Ch5piTdG9vbHRpcOihqOekulxyXG5mdW5jdGlvbiB0b29sdGlwKG1lcylcclxue1xyXG5cdHJldHVybiBmdW5jdGlvbihkKXtcclxuXHRcdHRoaXNcclxuXHRcdC5vbignbW91c2VlbnRlcicsZnVuY3Rpb24oKXtcclxuXHRcdFx0c3ZnLmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdC5hdHRyKHsnY2xhc3MnOid0aXAnLHg6ZDMuZXZlbnQueCArIDIwICx5OmQzLmV2ZW50LnkgLSAyMH0pXHJcblx0XHRcdC50ZXh0KG1lcyk7XHJcblx0XHR9KVxyXG5cdFx0Lm9uKCdtb3VzZWxlYXZlJyxmdW5jdGlvbigpe1xyXG5cdFx0XHRzdmcuc2VsZWN0QWxsKCcudGlwJykucmVtb3ZlKCk7XHJcblx0XHR9KVxyXG5cdH07XHJcbn1cclxuXHJcbi8vIOaOpee2mue3muOBruW6p+aomeeUn+aIkFxyXG5mdW5jdGlvbiBtYWtlUG9zKHgxLHkxLHgyLHkyKXtcclxuXHRyZXR1cm4gW1xyXG5cdFx0XHR7eDp4MSx5OnkxfSxcclxuXHRcdFx0e3g6eDEgKyAoeDIgLSB4MSkvNCx5OnkxfSxcclxuXHRcdFx0e3g6eDEgKyAoeDIgLSB4MSkvMix5OnkxICsgKHkyIC0geTEpLzJ9LFxyXG5cdFx0XHR7eDp4MSArICh4MiAtIHgxKSozLzQseTp5Mn0sXHJcblx0XHRcdHt4OngyLCB5OnkyfVxyXG5cdFx0XTtcclxufVxyXG5cclxuLy8g44OX44Ot44OR44OG44Kj44OR44ON44Or44Gu6KGo56S6XHJcbmZ1bmN0aW9uIHNob3dQYW5lbChkKXtcclxuXHJcblx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdGlmKGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cpIHJldHVybiA7XHJcblxyXG5cdGQucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuXHRkLnBhbmVsLnggPSBkLng7XHJcblx0ZC5wYW5lbC55ID0gZC55O1xyXG5cdGQucGFuZWwuaGVhZGVyLnRleHQoZC5uYW1lKTtcclxuXHRcclxuXHR2YXIgdGFibGUgPSBkLnBhbmVsLmFydGljbGUuYXBwZW5kKCd0YWJsZScpO1xyXG5cdHZhciB0Ym9keSA9IHRhYmxlLmFwcGVuZCgndGJvZHknKS5zZWxlY3RBbGwoJ3RyJykuZGF0YShkLnBhcmFtcyk7XHJcblx0dmFyIHRyID0gdGJvZHkuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3RyJyk7XHJcblx0dHIuYXBwZW5kKCd0ZCcpXHJcblx0LnRleHQoKGQpPT5kLm5hbWUpO1xyXG5cdHRyLmFwcGVuZCgndGQnKVxyXG5cdC5hcHBlbmQoJ2lucHV0JylcclxuXHQuYXR0cih7dHlwZTpcInRleHRcIix2YWx1ZTooZCk9PmQuZ2V0KCkscmVhZG9ubHk6KGQpPT5kLnNldD9udWxsOidyZWFkb25seSd9KVxyXG5cdC5vbignY2hhbmdlJyxmdW5jdGlvbihkKXtcclxuXHRcdGxldCB2YWx1ZSA9IHRoaXMudmFsdWU7XHJcblx0XHRsZXQgdm4gPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuXHRcdGlmKGlzTmFOKHZuKSl7XHJcblx0XHRcdGQuc2V0KHZhbHVlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGQuc2V0KHZuKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRkLnBhbmVsLnNob3coKTtcclxuXHJcbn1cclxuXHJcbi8vIOODjuODvOODieaMv+WFpeODkeODjeODq+OBruihqOekulxyXG5mdW5jdGlvbiBzaG93QXVkaW9Ob2RlUGFuZWwoZCl7XHJcblx0IGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0IGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdGlmKGQucGFuZWwpe1xyXG5cdFx0aWYoZC5wYW5lbC5pc1Nob3cpXHJcblx0XHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0ZC5wYW5lbCA9IG5ldyB1aS5QYW5lbCgpO1xyXG5cdGQucGFuZWwueCA9IGQzLmV2ZW50Lm9mZnNldFg7XHJcblx0ZC5wYW5lbC55ID0gZDMuZXZlbnQub2Zmc2V0WTtcclxuXHRkLnBhbmVsLmhlYWRlci50ZXh0KCdBdWRpb05vZGXjga7mjL/lhaUnKTtcclxuXHJcblx0dmFyIHRhYmxlID0gZC5wYW5lbC5hcnRpY2xlLmFwcGVuZCgndGFibGUnKTtcclxuXHR2YXIgdGJvZHkgPSB0YWJsZS5hcHBlbmQoJ3Rib2R5Jykuc2VsZWN0QWxsKCd0cicpLmRhdGEoYXVkaW9Ob2RlQ3JlYXRvcnMpO1xyXG5cdHRib2R5LmVudGVyKClcclxuXHQuYXBwZW5kKCd0cicpXHJcblx0LmFwcGVuZCgndGQnKVxyXG5cdC50ZXh0KChkKT0+ZC5uYW1lKVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKGR0KXtcclxuXHRcdGNvbnNvbGUubG9nKCfmjL/lhaUnLGR0KTtcclxuXHRcdFxyXG5cdFx0dmFyIGVkaXRvciA9IGR0LmVkaXRvciB8fCBzaG93UGFuZWw7XHJcblx0XHRcclxuXHRcdHZhciBub2RlID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoZHQuY3JlYXRlKCksZWRpdG9yKTtcclxuXHRcdG5vZGUueCA9IGQzLmV2ZW50LmNsaWVudFg7XHJcblx0XHRub2RlLnkgPSBkMy5ldmVudC5jbGllbnRZO1xyXG5cdFx0ZHJhdygpO1xyXG5cdFx0Ly8gZDMuc2VsZWN0KCcjcHJvcC1wYW5lbCcpLnN0eWxlKCd2aXNpYmlsaXR5JywnaGlkZGVuJyk7XHJcblx0XHQvLyBkLnBhbmVsLmRpc3Bvc2UoKTtcclxuXHR9KTtcclxuXHRkLnBhbmVsLnNob3coKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF1ZGlvTm9kZVZpZXcobmFtZSl7XHJcblx0dmFyIG9iaiA9IGF1ZGlvTm9kZUNyZWF0b3JzLmZpbmQoKGQpPT57XHJcblx0XHRpZihkLm5hbWUgPT09IG5hbWUpIHJldHVybiB0cnVlO1xyXG5cdH0pO1xyXG5cdGlmKG9iail7XHJcblx0XHRyZXR1cm4gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUob2JqLmNyZWF0ZSgpLG9iai5lZGl0b3IgfHwgc2hvd1BhbmVsKTtcdFx0XHRcclxuXHR9XHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVHIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0dGhpcy5nYXRlID0gbmV3IGF1ZGlvLlBhcmFtVmlldyh0aGlzLCdnYXRlJyxmYWxzZSk7XHJcblx0XHR0aGlzLm91dHB1dCA9IG5ldyBhdWRpby5QYXJhbVZpZXcodGhpcywnb3V0cHV0Jyx0cnVlKTtcclxuXHRcdHRoaXMubnVtYmVyT2ZJbnB1dHMgPSAwO1xyXG5cdFx0dGhpcy5udW1iZXJPZk91dHB1dHMgPSAwO1xyXG5cdFx0dGhpcy5hdHRhY2sgPSAwLjAwMTtcclxuXHRcdHRoaXMuZGVjYXkgPSAwLjA1O1xyXG5cdFx0dGhpcy5yZWxlYXNlID0gMC4wNTtcclxuXHRcdHRoaXMuc3VzdGFpbiA9IDAuMjtcclxuXHRcdHRoaXMuZ2FpbiA9IDEuMDtcclxuXHRcdHRoaXMubmFtZSA9ICdFRyc7XHJcblx0XHRhdWRpby5kZWZJc05vdEFQSU9iaih0aGlzLGZhbHNlKTtcclxuXHRcdHRoaXMub3V0cHV0cyA9IFtdO1xyXG5cdH1cclxuXHRcclxuXHRjb25uZWN0KGMpXHJcblx0e1xyXG5cdFx0aWYoISAoYy50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLkF1ZGlvUGFyYW1WaWV3KSl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignQXVkaW9QYXJhbeS7peWkluOBqOOBr+aOpee2muOBp+OBjeOBvuOBm+OCk+OAgicpO1xyXG5cdFx0fVxyXG5cdFx0Yy50by5wYXJhbS5hdWRpb1BhcmFtLnZhbHVlID0gMDtcclxuXHRcdHRoaXMub3V0cHV0cy5wdXNoKGMudG8pO1xyXG5cdH1cclxuXHRcclxuXHRkaXNjb25uZWN0KGMpe1xyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdGhpcy5vdXRwdXRzLmxlbmd0aDsrK2kpe1xyXG5cdFx0XHRpZihjLnRvLm5vZGUgPT09IHRoaXMub3V0cHV0c1tpXS5ub2RlICYmIGMudG8ucGFyYW0gPT09IHRoaXMub3V0cHV0c1tpXS5wYXJhbSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHRoaXMub3V0cHV0cy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFx0XHJcblx0cHJvY2Vzcyh0byxjb20sdix0KVxyXG5cdHtcclxuXHRcdGlmKHYgPiAwKSB7XHJcblx0XHRcdC8vIGtleW9uXHJcblx0XHRcdC8vIEFEU+OBvuOBp+OCguOBo+OBpuOBhOOBj1xyXG5cdFx0XHR0aGlzLm91dHB1dHMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRjb25zb2xlLmxvZygna2V5b24nLGNvbSx2LHQpO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5zZXRWYWx1ZUF0VGltZSgwLHQpO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2ICogdGhpcy5nYWluICx0ICsgdGhpcy5hdHRhY2spO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW4gKiB2ICogdGhpcy5nYWluICx0ICsgdGhpcy5hdHRhY2sgKyB0aGlzLmRlY2F5ICk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8ga2V5b2ZmXHJcblx0XHRcdC8vIOODquODquODvOOCuVxyXG5cdFx0XHR0aGlzLm91dHB1dHMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRjb25zb2xlLmxvZygna2V5b2ZmJyxjb20sdix0KTtcclxuXHRcdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCx0ICsgdGhpcy5yZWxlYXNlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHN0b3AoKXtcclxuXHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRjb25zb2xlLmxvZygnc3RvcCcpO1xyXG5cdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG5cdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0uc2V0VmFsdWVBdFRpbWUoMCwwKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRwYXVzZSgpe1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG59XHJcblxyXG4vLyAvLy8g44Ko44Oz44OZ44Ot44O844OX44K444Kn44ON44Os44O844K/44O8XHJcbi8vIGZ1bmN0aW9uIEVudmVsb3BlR2VuZXJhdG9yKHZvaWNlLCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKSB7XHJcbi8vICAgdGhpcy52b2ljZSA9IHZvaWNlO1xyXG4vLyAgIC8vdGhpcy5rZXlvbiA9IGZhbHNlO1xyXG4vLyAgIHRoaXMuYXR0YWNrID0gYXR0YWNrIHx8IDAuMDAwNTtcclxuLy8gICB0aGlzLmRlY2F5ID0gZGVjYXkgfHwgMC4wNTtcclxuLy8gICB0aGlzLnN1c3RhaW4gPSBzdXN0YWluIHx8IDAuNTtcclxuLy8gICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlIHx8IDAuNTtcclxuLy8gfTtcclxuLy8gXHJcbi8vIEVudmVsb3BlR2VuZXJhdG9yLnByb3RvdHlwZSA9XHJcbi8vIHtcclxuLy8gICBrZXlvbjogZnVuY3Rpb24gKHQsdmVsKSB7XHJcbi8vICAgICB0aGlzLnYgPSB2ZWwgfHwgMS4wO1xyXG4vLyAgICAgdmFyIHYgPSB0aGlzLnY7XHJcbi8vICAgICB2YXIgdDAgPSB0IHx8IHRoaXMudm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbi8vICAgICB2YXIgdDEgPSB0MCArIHRoaXMuYXR0YWNrICogdjtcclxuLy8gICAgIHZhciBnYWluID0gdGhpcy52b2ljZS5nYWluLmdhaW47XHJcbi8vICAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbi8vICAgICBnYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwKTtcclxuLy8gICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodiwgdDEpO1xyXG4vLyAgICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MCArIHRoaXMuZGVjYXkgLyB2KTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDEsIHQxICsgdGhpcy5kZWNheSAvIHYpO1xyXG4vLyAgIH0sXHJcbi8vICAga2V5b2ZmOiBmdW5jdGlvbiAodCkge1xyXG4vLyAgICAgdmFyIHZvaWNlID0gdGhpcy52b2ljZTtcclxuLy8gICAgIHZhciBnYWluID0gdm9pY2UuZ2Fpbi5nYWluO1xyXG4vLyAgICAgdmFyIHQwID0gdCB8fCB2b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuLy8gICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbi8vICAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKDAsIHQwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbi8vICAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICB9XHJcbi8vIH07IiwiJ3VzZSBzdHJpY3QnO1xuXG4vL1xuLy8gV2Ugc3RvcmUgb3VyIEVFIG9iamVjdHMgaW4gYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3Jcbi8vIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxuLy9cbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICAgLCBqO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIGxpc3RlbmVycyBtYXRjaGluZyB0aGlzIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGV2ZW50cyA9IFtdO1xuXG4gIGlmIChmbikge1xuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICAgIGlmIChcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXG4gICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVycy5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgKSB7XG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXG4gICAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICAgICkge1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gIC8vXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcblxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XG4gIGVsc2UgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVmT2JzZXJ2YWJsZSh0YXJnZXQscHJvcE5hbWUsb3B0ID0ge30pXHJcbntcclxuXHQoKCk9PntcclxuXHRcdHZhciB2XztcclxuXHRcdG9wdC5lbnVtZXJhYmxlID0gb3B0LmVudW1lcmFibGUgfHwgdHJ1ZTtcclxuXHRcdG9wdC5jb25maWd1cmFibGUgPSBvcHQuY29uZmlndXJhYmxlIHx8IGZhbHNlO1xyXG5cdFx0b3B0LmdldCA9IG9wdC5nZXQgfHwgKCgpID0+IHZfKTtcclxuXHRcdG9wdC5zZXQgPSBvcHQuc2V0IHx8ICgodik9PntcclxuXHRcdFx0aWYodl8gIT0gdil7XHJcblx0XHRcdFx0dGFyZ2V0LmVtaXQocHJvcE5hbWUgKyAnX2NoYW5nZWQnLHYpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZfID0gdjtcclxuXHRcdH0pO1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCxwcm9wTmFtZSxvcHQpO1xyXG5cdH0pKCk7XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8uanMnO1xyXG5pbXBvcnQge2luaXRVSSxkcmF3LHN2ZyB9IGZyb20gJy4vZHJhdyc7XHJcblxyXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xyXG5cdGF1ZGlvLnNldEN0eChuZXcgQXVkaW9Db250ZXh0KCkpO1xyXG5cdGQzLnNlbGVjdCh3aW5kb3cpXHJcblx0Lm9uKCdyZXNpemUnLGZ1bmN0aW9uKCl7XHJcblx0XHRpZihzdmcpe1xyXG5cdFx0XHRzdmcuYXR0cih7XHJcblx0XHRcdFx0d2lkdGg6d2luZG93LmlubmVyV2lkdGgsXHJcblx0XHRcdFx0aGVpZ2h0OndpbmRvdy5pbm5lckhlaWdodFxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHRpbml0VUkoKTtcclxuXHRkcmF3KCk7XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aSc7XHJcbmltcG9ydCB7VW5kb01hbmFnZXJ9IGZyb20gJy4vdW5kbyc7XHJcblxyXG5cclxuY29uc3QgSW5wdXRUeXBlID0ge1xyXG4gIGtleWJvcmQ6MCxcclxuICBtaWRpOjFcclxufVxyXG5cclxuY29uc3QgSW5wdXRDb21tYW5kID0gXHJcbntcclxuICBlbnRlcjoxLFxyXG4gIGVzYzoyLFxyXG4gIHJpZ2h0OjMsXHJcbiAgbGVmdDo0LFxyXG4gIHVwOjUsXHJcbiAgZG93bjo2LFxyXG4gIGluc2VydE1lYXN1cmU6NyxcclxuICB1bmRvOjgsXHJcbiAgcmVkbzo5LFxyXG4gIHBhZ2VVcDoxMCxcclxuICBwYWdlRG93bjoxMSxcclxuICBob21lOjEyLFxyXG4gIGVuZDoxMyxcclxuICBudW1iZXI6MTQsXHJcbiAgbm90ZToxNSxcclxuICBzY3JvbGxVcDoxNixcclxuICBzY3JvbGxEb3duOjE3LFxyXG4gIGRlbGV0ZToxOCxcclxuICBsaW5lUGFzdGU6MTlcclxufVxyXG5cclxuLy9cclxuY29uc3QgS2V5QmluZCA9IFxyXG57XHJcbiAgMTM6W3tcclxuICAgICAga2V5Q29kZToxMyxcclxuICAgICAgY3RybEtleTpmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICAgIGFsdEtleTpmYWxzZSxcclxuICAgICAgbWV0YUtleTpmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5lbnRlclxyXG4gICAgfV0sXHJcbiAgMjc6W3tcclxuICAgIGtleUNvZGU6MjcsXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5lc2NcclxuICB9XSxcclxuICAzMjpbe1xyXG4gICAga2V5Q29kZTozMixcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTpmYWxzZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLnJpZ2h0XHJcbiAgfV0sXHJcbiAgMzk6W3tcclxuICAgIGtleUNvZGU6MzksXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5yaWdodFxyXG4gIH1dLFxyXG4gIDM3Olt7XHJcbiAgICBrZXlDb2RlOjM3LFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubGVmdFxyXG4gIH1dLFxyXG4gIDM4Olt7XHJcbiAgICBrZXlDb2RlOjM4LFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQudXBcclxuICAgIH1dLFxyXG4gIDQwOlt7XHJcbiAgICBrZXlDb2RlOjQwLFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQuZG93blxyXG4gICAgfV0sXHJcbiAgMTA2Olt7XHJcbiAgICBrZXlDb2RlOjEwNixcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTpmYWxzZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLmluc2VydE1lYXN1cmVcclxuICAgIH1dLFxyXG4gIDkwOlt7XHJcbiAgICBrZXlDb2RlOjkwLFxyXG4gICAgY3RybEtleTp0cnVlLFxyXG4gICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC51bmRvXHJcbiAgICB9XSxcclxuICA4OTpbe1xyXG4gICAga2V5Q29kZTo4OSxcclxuICAgIGN0cmxLZXk6dHJ1ZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQucmVkb1xyXG4gICAgfV0sXHJcbiAgMzM6W3tcclxuICAgIGtleUNvZGU6MzMsXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5wYWdlVXBcclxuICAgIH0se1xyXG4gICAga2V5Q29kZTozMyxcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTp0cnVlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQuc2Nyb2xsVXBcclxuICAgIH1dLFxyXG4gIDgyOlt7XHJcbiAgICBrZXlDb2RlOjgyLFxyXG4gICAgY3RybEtleTp0cnVlLFxyXG4gICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5wYWdlVXBcclxuICAgIH1dLFxyXG4gIDM0Olt7XHJcbiAgICBrZXlDb2RlOjM0LFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQucGFnZURvd25cclxuICAgIH0se1xyXG4gICAga2V5Q29kZTozNCxcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTp0cnVlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQuc2Nyb2xsRG93blxyXG4gICAgfV0sXHJcbiAgNjc6W3tcclxuICAgIGtleUNvZGU6NjcsXHJcbiAgICBjdHJsS2V5OnRydWUsXHJcbiAgICBzaGlmdEtleTpmYWxzZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLnBhZ2VEb3duXHJcbiAgICB9LHtcclxuICAgIGtleUNvZGU6NjcsXHJcbiAgICBub3RlOidDJyxcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTpmYWxzZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0se1xyXG4gICAga2V5Q29kZTo2NyxcclxuICAgIG5vdGU6J0MnLFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OnRydWUsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9XSxcclxuICAzNjpbe1xyXG4gICAga2V5Q29kZTozNixcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTpmYWxzZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLmhvbWVcclxuICAgIH1dLFxyXG4gIDM1Olt7XHJcbiAgICBrZXlDb2RlOjM1LFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQuZW5kXHJcbiAgICB9XSxcclxuICA5Njpbe1xyXG4gICAga2V5Q29kZTo5NixcclxuICAgIG51bWJlcjowLFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICA5Nzpbe1xyXG4gICAga2V5Q29kZTo5NyxcclxuICAgIG51bWJlcjoxLFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICA5ODpbe1xyXG4gICAga2V5Q29kZTo5OCxcclxuICAgIG51bWJlcjoyLFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICA5OTpbe1xyXG4gICAga2V5Q29kZTo5OSxcclxuICAgIG51bWJlcjozLFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAxMDA6W3tcclxuICAgIGtleUNvZGU6MTAwLFxyXG4gICAgbnVtYmVyOjQsXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gIDEwMTpbe1xyXG4gICAga2V5Q29kZToxMDEsXHJcbiAgICBudW1iZXI6NSxcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTpmYWxzZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgMTAyOlt7XHJcbiAgICBrZXlDb2RlOjEwMixcclxuICAgIG51bWJlcjo2LFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAxMDM6W3tcclxuICAgIGtleUNvZGU6MTAzLFxyXG4gICAgbnVtYmVyOjcsXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gIDEwNDpbe1xyXG4gICAga2V5Q29kZToxMDQsXHJcbiAgICBudW1iZXI6OCxcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTpmYWxzZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgMTA1Olt7XHJcbiAgICBrZXlDb2RlOjEwNSxcclxuICAgIG51bWJlcjo5LFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICA2NTpbe1xyXG4gICAga2V5Q29kZTo2NSxcclxuICAgIG5vdGU6J0EnLFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSx7XHJcbiAgICBrZXlDb2RlOjY1LFxyXG4gICAgbm90ZTonQScsXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6dHJ1ZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH1dLCAgICBcclxuICA2Njpbe1xyXG4gICAga2V5Q29kZTo2NixcclxuICAgIG5vdGU6J0InLFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSx7XHJcbiAgICBrZXlDb2RlOjY2LFxyXG4gICAgbm90ZTonQicsXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6dHJ1ZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH1dLFxyXG4gIDY4Olt7XHJcbiAgICBrZXlDb2RlOjY4LFxyXG4gICAgbm90ZTonRCcsXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LHtcclxuICAgIGtleUNvZGU6NjgsXHJcbiAgICBub3RlOidEJyxcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTp0cnVlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfV0sXHJcbiAgNjk6W3tcclxuICAgIGtleUNvZGU6NjksXHJcbiAgICBub3RlOidFJyxcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTpmYWxzZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0se1xyXG4gICAga2V5Q29kZTo2OSxcclxuICAgIG5vdGU6J0UnLFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OnRydWUsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9XSxcclxuICA3MDpbe1xyXG4gICAga2V5Q29kZTo3MCxcclxuICAgIG5vdGU6J0YnLFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSx7XHJcbiAgICBrZXlDb2RlOjcwLFxyXG4gICAgbm90ZTonRicsXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6dHJ1ZSxcclxuICAgIGFsdEtleTpmYWxzZSxcclxuICAgIG1ldGFLZXk6ZmFsc2UsXHJcbiAgICBpbnB1dENvbW1hbmQ6SW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH1dLFxyXG4gIDcxOlt7XHJcbiAgICBrZXlDb2RlOjcxLFxyXG4gICAgbm90ZTonRycsXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LHtcclxuICAgIGtleUNvZGU6NzEsXHJcbiAgICBub3RlOidHJyxcclxuICAgIGN0cmxLZXk6ZmFsc2UsXHJcbiAgICBzaGlmdEtleTp0cnVlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfV0sXHJcbiAgNDY6W3tcclxuICAgIGtleUNvZGU6NDYsXHJcbiAgICBjdHJsS2V5OmZhbHNlLFxyXG4gICAgc2hpZnRLZXk6ZmFsc2UsXHJcbiAgICBhbHRLZXk6ZmFsc2UsXHJcbiAgICBtZXRhS2V5OmZhbHNlLFxyXG4gICAgaW5wdXRDb21tYW5kOklucHV0Q29tbWFuZC5kZWxldGVcclxuICAgIH1dLFxyXG4gIDc2Olt7XHJcbiAgICBrZXlDb2RlOjc2LFxyXG4gICAgY3RybEtleTpmYWxzZSxcclxuICAgIHNoaWZ0S2V5OmZhbHNlLFxyXG4gICAgYWx0S2V5OmZhbHNlLFxyXG4gICAgbWV0YUtleTpmYWxzZSxcclxuICAgIGlucHV0Q29tbWFuZDpJbnB1dENvbW1hbmQubGluZVBhc3RlXHJcbiAgICB9XVxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIFNlcXVlbmNlRWRpdG9yIHtcclxuICBjb25zdHJ1Y3RvcihzZXF1ZW5jZXIpIHtcclxuICAgIHZhciBzZWxmXyA9IHRoaXM7XHJcbiAgICB0aGlzLnVuZG9NYW5hZ2VyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XHJcbiAgICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICAgIHNlcXVlbmNlci5wYW5lbCA9IG5ldyB1aS5QYW5lbCgpO1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLnggPSBzZXF1ZW5jZXIueDtcclxuICAgIHNlcXVlbmNlci5wYW5lbC55ID0gc2VxdWVuY2VyLnk7XHJcbiAgICBzZXF1ZW5jZXIucGFuZWwud2lkdGggPSAxMDI0O1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLmhlaWdodCA9IDc2ODtcclxuICAgIHNlcXVlbmNlci5wYW5lbC5oZWFkZXIudGV4dCgnU2VxdWVuY2UgRWRpdG9yJyk7XHJcbiAgICB2YXIgZWRpdG9yID0gc2VxdWVuY2VyLnBhbmVsLmFydGljbGUuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdzZXEtZWRpdG9yJywgdHJ1ZSk7XHJcbiAgICB2YXIgZGl2ID0gZWRpdG9yLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnaGVhZGVyJywgdHJ1ZSk7XHJcblx0IFxyXG4gICAgLy8g44K/44Kk44Og44OZ44O844K5XHJcbiAgICBkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnVGltZSBCYXNlOicpO1xyXG4gICAgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG4gICAgICAuZGF0dW0oc2VxdWVuY2VyLmF1ZGlvTm9kZS50cGIpXHJcbiAgICAgIC5hdHRyKHsgJ3R5cGUnOiAndGV4dCcsICdzaXplJzogJzMnLCAnaWQnOiAndGltZS1iYXNlJyB9KVxyXG4gICAgICAuYXR0cigndmFsdWUnLCAodikgPT4gdilcclxuICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS50cGIgPSBkMy5zZWxlY3QodGhpcykuYXR0cigndmFsdWUnKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhbGwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUub24oJ3RwYl9jaGFuZ2VkJywgKHYpID0+IHtcclxuICAgICAgICAgIHRoaXMuYXR0cigndmFsdWUnLCB2KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG5cclxuICAgIC8vIOODhuODs+ODnVxyXG4gICAgZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJ1RlbXBvOicpO1xyXG4gICAgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG4gICAgICAuZGF0dW0oc2VxdWVuY2VyKVxyXG4gICAgICAuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJyB9KVxyXG4gICAgICAuYXR0cigndmFsdWUnLCAoZCkgPT4gc2VxdWVuY2VyLmF1ZGlvTm9kZS5icG0pXHJcbiAgICAgIC5vbignY2hhbmdlJywgKCkgPT4ge1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUuYnBtID0gcGFyc2VGbG9hdChkMy5zZWxlY3QodGhpcykuYXR0cigndmFsdWUnKSwgMTApO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2FsbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS5vbignYnBtX2NoYW5nZWQnLCAodikgPT4ge1xyXG4gICAgICAgICAgdGhpcy5hdHRyKCd2YWx1ZScsIHYpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICBkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnQmVhdDonKTtcclxuICAgIGRpdi5hcHBlbmQoJ2lucHV0JylcclxuICAgICAgLmRhdHVtKHNlcXVlbmNlcilcclxuICAgICAgLmF0dHIoeyAndHlwZSc6ICd0ZXh0JywgJ3NpemUnOiAnMycsICd2YWx1ZSc6IChkKSA9PiBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJlYXQgfSlcclxuICAgICAgLm9uKCdjaGFuZ2UnLCAoZCkgPT4ge1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUuYmVhdCA9IHBhcnNlRmxvYXQoZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJyksIDEwKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJyAvICcpO1xyXG4gICAgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG4gICAgICAuZGF0dW0oc2VxdWVuY2VyKVxyXG4gICAgICAuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJywgJ3ZhbHVlJzogKGQpID0+IHNlcXVlbmNlci5hdWRpb05vZGUuYmFyIH0pXHJcbiAgICAgIC5vbignY2hhbmdlJywgKGQpID0+IHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJhciA9IHBhcnNlRmxvYXQoZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJyksIDEwKTtcclxuICAgICAgfSk7XHJcblxyXG5cclxuICAgIC8vIOODiOODqeODg+OCr+OCqOODh+OCo+OCv1xyXG4gICAgbGV0IHRyYWNrRWRpdCA9IGVkaXRvci5zZWxlY3RBbGwoJ2Rpdi50cmFjaycpXHJcbiAgICAgIC5kYXRhKHNlcXVlbmNlci5hdWRpb05vZGUudHJhY2tzKVxyXG4gICAgICAuZW50ZXIoKVxyXG4gICAgICAuYXBwZW5kKCdkaXYnKVxyXG4gICAgICAuY2xhc3NlZCgndHJhY2snLCB0cnVlKVxyXG4gICAgICAuYXR0cih7ICdpZCc6IChkLCBpKSA9PiAndHJhY2stJyArIChpICsgMSksICd0YWJpbmRleCc6ICcwJyB9KTtcclxuXHJcbiAgICBsZXQgdHJhY2tIZWFkZXIgPSB0cmFja0VkaXQuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCd0cmFjay1oZWFkZXInLCB0cnVlKTtcclxuICAgIHRyYWNrSGVhZGVyLmFwcGVuZCgnc3BhbicpLnRleHQoKGQsIGkpID0+ICdUUjonICsgKGkgKyAxKSk7XHJcbiAgICB0cmFja0hlYWRlci5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdNRUFTOicpO1xyXG4gICAgbGV0IHRyYWNrQm9keSA9IHRyYWNrRWRpdC5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ3RyYWNrLWJvZHknLCB0cnVlKTtcclxuICAgIGxldCBldmVudEVkaXQgPSB0cmFja0JvZHkuYXBwZW5kKCd0YWJsZScpO1xyXG4gICAgbGV0IGhlYWRyb3cgPSBldmVudEVkaXQuYXBwZW5kKCd0aGVhZCcpLmFwcGVuZCgndHInKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ00jJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdTIycpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnTlQnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ04jJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdTVCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnR1QnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1ZFJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdDTycpO1xyXG4gICAgbGV0IGV2ZW50Qm9keSA9IGV2ZW50RWRpdC5hcHBlbmQoJ3Rib2R5JykuYXR0cignaWQnLCAoZCwgaSkgPT4gJ3RyYWNrLScgKyAoaSArIDEpICsgJy1ldmVudHMnKTtcclxuICAgIC8vdGhpcy5kcmF3RXZlbnRzKGV2ZW50Qm9keSk7XHJcblxyXG5cdFx0Ly8g44OG44K544OI44OH44O844K/XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEyNzsgaSArPSA4KSB7XHJcbiAgICAgIGZvciAodmFyIGogPSBpOyBqIDwgKGkgKyA4KTsgKytqKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS50cmFja3NbMF0uYWRkRXZlbnQobmV3IGF1ZGlvLk5vdGVFdmVudCg0OCwgaiwgNikpO1xyXG4gICAgICB9XHJcbiAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUudHJhY2tzWzBdLmFkZEV2ZW50KG5ldyBhdWRpby5NZWFzdXJlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIOODiOODqeODg+OCr+OCqOODh+OCo+OCv+ODoeOCpOODs1xyXG5cclxuICAgIHRyYWNrRWRpdC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgIGlmICghdGhpcy5lZGl0b3IpIHtcclxuICAgICAgICB0aGlzLmVkaXRvciA9IGRvRWRpdG9yKGQzLnNlbGVjdCh0aGlzKSxzZWxmXyk7XHJcbiAgICAgICAgdGhpcy5lZGl0b3IubmV4dCgpO1xyXG4gICAgICAgIHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyDjgq3jg7zlhaXlipvjg4/jg7Pjg4njg6lcclxuICAgIHRyYWNrRWRpdC5vbigna2V5ZG93bicsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgIGxldCBlID0gZDMuZXZlbnQ7XHJcbiAgICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XHJcbiAgICAgIGxldCBrZXkgPSBLZXlCaW5kW2Uua2V5Q29kZV07XHJcbiAgICAgIGxldCByZXQgPSB7fTtcclxuICAgICAgaWYoa2V5KXtcclxuICAgICAgICBrZXkuc29tZSgoZCk9PntcclxuICAgICAgICAgIGlmKGQuY3RybEtleSA9PSBlLmN0cmxLZXlcclxuICAgICAgICAgICAgJiYgZC5zaGlmdEtleSA9PSBlLnNoaWZ0S2V5XHJcbiAgICAgICAgICAgICYmIGQuYWx0S2V5ID09IGUuYWx0S2V5XHJcbiAgICAgICAgICAgICYmIGQubWV0YUtleSA9PSBlLm1ldGFLZXlcclxuICAgICAgICAgICl7XHJcbiAgICAgICAgICAgIHJldCA9IHRoaXMuZWRpdG9yLm5leHQoZCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChyZXQudmFsdWUpIHtcclxuICAgICAgICAgIGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgc2VxdWVuY2VyLnBhbmVsLm9uKCdzaG93JywgKCkgPT4ge1xyXG4gICAgICBkMy5zZWxlY3QoJyN0aW1lLWJhc2UnKS5ub2RlKCkuZm9jdXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHNlcXVlbmNlci5wYW5lbC5vbignZGlzcG9zZScsICgpID0+IHtcclxuICAgICAgZGVsZXRlIHNlcXVlbmNlci5lZGl0b3JJbnN0YW5jZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHNlcXVlbmNlci5wYW5lbC5zaG93KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDjgqjjg4fjgqPjgr/mnKzkvZNcclxuZnVuY3Rpb24qIGRvRWRpdG9yKHRyYWNrRWRpdCxzZXFFZGl0b3IpIHtcclxuICBsZXQga2V5Y29kZSA9IDA7Ly8g5YWl5Yqb44GV44KM44Gf44Kt44O844Kz44O844OJ44KS5L+d5oyB44GZ44KL5aSJ5pWwXHJcbiAgbGV0IHRyYWNrID0gdHJhY2tFZGl0LmRhdHVtKCk7Ly8g54++5Zyo57eo6ZuG5Lit44Gu44OI44Op44OD44KvXHJcbiAgbGV0IGVkaXRWaWV3ID0gZDMuc2VsZWN0KCcjJyArIHRyYWNrRWRpdC5hdHRyKCdpZCcpICsgJy1ldmVudHMnKTsvL+e3qOmbhueUu+mdouOBruOCu+ODrOOCr+OCt+ODp+ODs1xyXG4gIGxldCBtZWFzdXJlID0gMTsvLyDlsI/nr4BcclxuICBsZXQgc3RlcCA9IDE7Ly8g44K544OG44OD44OXTm9cclxuICBsZXQgcm93SW5kZXggPSAwOy8vIOe3qOmbhueUu+mdouOBruePvuWcqOihjFxyXG4gIGxldCBjdXJyZW50RXZlbnRJbmRleCA9IDA7Ly8g44Kk44OZ44Oz44OI6YWN5YiX44Gu57eo6ZuG6ZaL5aeL6KGMXHJcbiAgbGV0IGNlbGxJbmRleCA9IDI7Ly8g5YiX44Kk44Oz44OH44OD44Kv44K5XHJcbiAgbGV0IGNhbmNlbEV2ZW50ID0gZmFsc2U7Ly8g44Kk44OZ44Oz44OI44KS44Kt44Oj44Oz44K744Or44GZ44KL44GL44Gp44GG44GLXHJcbiAgbGV0IGxpbmVCdWZmZXIgPSBbXTsvL+ihjOODkOODg+ODleOCoVxyXG4gIGNvbnN0IE5VTV9ST1cgPSA0NzsvLyDvvJHnlLvpnaLjga7ooYzmlbBcclxuXHRcclxuICBmdW5jdGlvbiBzZXRJbnB1dCgpIHtcclxuICAgIHRoaXMuYXR0cignY29udGVudEVkaXRhYmxlJywgJ3RydWUnKTtcclxuICAgIHRoaXMub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxKTtcclxuICAgICAgcm93SW5kZXggPSB0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxO1xyXG4gICAgICBjZWxsSW5kZXggPSB0aGlzLmNlbGxJbmRleDtcclxuICAgIH0pXHJcbiAgfVxyXG4gIFxyXG4gIC8vIOaXouWtmOOCpOODmeODs+ODiOOBruihqOekulxyXG4gIGZ1bmN0aW9uIGRyYXdFdmVudCgpIHtcclxuICAgIGxldCBldmZsYWdtZW50ID0gdHJhY2suZXZlbnRzLnNsaWNlKGN1cnJlbnRFdmVudEluZGV4LCBjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cpO1xyXG4gICAgZWRpdFZpZXcuc2VsZWN0QWxsKCd0cicpLnJlbW92ZSgpO1xyXG4gICAgbGV0IHNlbGVjdCA9IGVkaXRWaWV3LnNlbGVjdEFsbCgndHInKS5kYXRhKGV2ZmxhZ21lbnQpO1xyXG4gICAgbGV0IGVudGVyID0gc2VsZWN0LmVudGVyKCk7XHJcbiAgICBsZXQgcm93cyA9IGVudGVyLmFwcGVuZCgndHInKS5hdHRyKCdkYXRhLWluZGV4JywgKGQsIGkpID0+IGkpO1xyXG4gICAgcm93cy5lYWNoKGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgIGxldCByb3cgPSBkMy5zZWxlY3QodGhpcyk7XHJcbiAgICAgIC8vcm93SW5kZXggPSBpO1xyXG4gICAgICBzd2l0Y2ggKGQudHlwZSkge1xyXG4gICAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLk5vdGU6XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5tZWFzdXJlKTsvLyBNZWFzZXVyZSAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5zdGVwTm8pOy8vIFN0ZXAgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQubmFtZSkuY2FsbChzZXRJbnB1dCkvLyBOb3RlXHJcbiAgICAgICAgICAub24oJ2JsdXInLGZ1bmN0aW9uKGQpe1xyXG4gICAgICAgICAgICBkLnNldE5vdGVOYW1lVG9Ob3RlKHRoaXMuaW5uZXJUZXh0KTtcclxuICAgICAgICAgICAgdGhpcy5pbm5lclRleHQgPSBkLm5hbWU7XHJcbiAgICAgICAgICAgIC8vIE5vdGVOb+ihqOekuuOCguabtOaWsFxyXG4gICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUuY2VsbHNbM10uaW5uZXJUZXh0ID0gZC5ub3RlO1xyXG4gICAgICAgICAgfSk7Ly8gTm90ZVxyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQubm90ZSkuY2FsbChzZXRJbnB1dCkvLyBOb3RlICNcclxuICAgICAgICAgIC5vbignYmx1cicsZnVuY3Rpb24oZCl7XHJcbiAgICAgICAgICAgIGQubm90ZSA9IHBhcnNlRmxvYXQodGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUuY2VsbHNbMl0uaW5uZXJUZXh0ID0gZC5uYW1lO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5zdGVwKS5jYWxsKHNldElucHV0KS8vIFN0ZXBcclxuICAgICAgICAgIC5vbignYmx1cicsZnVuY3Rpb24oZCl7XHJcbiAgICAgICAgICAgIGQuc3RlcCA9IHBhcnNlSW50KHRoaXMuaW5uZXJUZXh0KTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5nYXRlKS5jYWxsKHNldElucHV0KTsvLyBHYXRlXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC52ZWwpLmNhbGwoc2V0SW5wdXQpOy8vIFZlbG9jaXR5XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5jb20pLmNhbGwoc2V0SW5wdXQpOy8vIENvbW1hbmRcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLk1lYXN1cmU6XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoJycpOy8vIE1lYXNldXJlICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dCgnJyk7Ly8gU3RlcCAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpXHJcbiAgICAgICAgICAuYXR0cih7ICdjb2xzcGFuJzogNiwgJ3RhYmluZGV4JzogMCB9KVxyXG4gICAgICAgICAgLnRleHQoJyAtLS0gKCcgKyBkLnN0ZXBUb3RhbCArICcpIC0tLSAnKVxyXG4gICAgICAgICAgLm9uKCdmb2N1cycsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgcm93SW5kZXggPSB0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5UcmFja0VuZDpcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dCgnJyk7Ly8gTWVhc2V1cmUgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KCcnKTsvLyBTdGVwICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJylcclxuICAgICAgICAgIC5hdHRyKHsgJ2NvbHNwYW4nOiA2LCAndGFiaW5kZXgnOiAwIH0pXHJcbiAgICAgICAgICAudGV4dCgnIC0tLSBUcmFjayBFbmQgLS0tICcpXHJcbiAgICAgICAgICAub24oJ2ZvY3VzJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICByb3dJbmRleCA9IHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDE7XHJcbiAgICAgICAgICB9KTtcclxuO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICBpZihyb3dJbmRleCA+IChldmZsYWdtZW50Lmxlbmd0aCAtIDEpKXtcclxuICAgICAgcm93SW5kZXggPSBldmZsYWdtZW50Lmxlbmd0aCAtIDE7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHRcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jg5Xjgqnjg7zjgqvjgrlcclxuICBmdW5jdGlvbiBmb2N1c0V2ZW50KCkge1xyXG4gICAgbGV0IGV2cm93ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XSk7XHJcbiAgICBsZXQgZXYgPSBldnJvdy5kYXR1bSgpO1xyXG4gICAgc3dpdGNoIChldi50eXBlKSB7XHJcbiAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLk5vdGU6XHJcbiAgICAgICAgZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF0uZm9jdXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuTWVhc3VyZTpcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbMl0uZm9jdXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuVHJhY2tFbmQ6XHJcbiAgICAgICAgZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzWzJdLmZvY3VzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cdFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruaMv+WFpVxyXG4gIGZ1bmN0aW9uIGluc2VydEV2ZW50KHJvd0luZGV4KSB7XHJcbiAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIuZXhlYyh7XHJcbiAgICAgIGV4ZWMoKXtcclxuICAgICAgICB0aGlzLnJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XTtcclxuICAgICAgICB0aGlzLmNlbGxJbmRleCA9IGNlbGxJbmRleDtcclxuICAgICAgICB0aGlzLnJvd0luZGV4ID0gcm93SW5kZXg7XHJcbiAgICAgICAgdGhpcy5leGVjXygpO1xyXG4gICAgICB9LFxyXG4gICAgICBleGVjXygpe1xyXG4gICAgICAgIHZhciByb3cgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLmluc2VydFJvdyh0aGlzLnJvd0luZGV4KSlcclxuICAgICAgICAuZGF0dW0obmV3IGF1ZGlvLk5vdGVFdmVudCgpKTtcclxuICAgICAgICBjZWxsSW5kZXggPSAyO1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJyk7Ly8gTWVhc2V1cmUgI1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJyk7Ly8gU3RlcCAjXHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KVxyXG4gICAgICAgIC5vbignYmx1cicsZnVuY3Rpb24oZCl7XHJcbiAgICAgICAgICBpZih0aGlzLmlubmVyVGV4dCAhPSAnJyAmJiBkLnNldE5vdGVOYW1lVG9Ob3RlKHRoaXMuaW5uZXJUZXh0KSl7XHJcbiAgICAgICAgICAgIHRoaXMuaW5uZXJUZXh0ID0gZC5uYW1lO1xyXG4gICAgICAgICAgICAvLyBOb3RlTm/ooajnpLrjgoLmm7TmlrBcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLmNlbGxzWzNdLmlubmVyVGV4dCA9IGQubm90ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTsvLyBOb3RlXHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KTsvLyBOb3RlICNcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpOy8vIFN0ZXBcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpOy8vIEdhdGVcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpOy8vIFZlbG9jaXR5XHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KTsvLyBDb21tYW5kXHJcbiAgICAgICAgcm93Lm5vZGUoKS5jZWxsc1t0aGlzLmNlbGxJbmRleF0uZm9jdXMoKTtcclxuICAgICAgICByb3cuYXR0cignZGF0YS1uZXcnLCB0cnVlKTtcclxuICAgICAgfSxcclxuICAgICAgcmVkbygpe1xyXG4gICAgICAgIHRoaXMuZXhlY18oKTsgICAgICAgXHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKXtcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgIHRoaXMucm93LmNlbGxzW3RoaXMuY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgLy8g5paw6KaP5YWl5Yqb6KGM44Gu56K65a6aXHJcbiAgZnVuY3Rpb24gZW5kTmV3SW5wdXQoZG93biA9IHRydWUpIHtcclxuICAgIGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JywgbnVsbCk7XHJcbiAgICAvLyAx44Gk5YmN44Gu44OO44O844OI44OH44O844K/44KS5qSc57Si44GZ44KLXHJcbiAgICBsZXQgYmVmb3JlQ2VsbHMgPSBbXTtcclxuICAgIGxldCBzciA9IHJvd0luZGV4IC0gMTtcclxuICAgIHdoaWxlIChzciA+PSAwKSB7XHJcbiAgICAgIHZhciB0YXJnZXQgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbc3JdKTtcclxuICAgICAgaWYgKHRhcmdldC5kYXR1bSgpLnR5cGUgPT09IGF1ZGlvLkV2ZW50VHlwZS5Ob3RlKSB7XHJcbiAgICAgICAgYmVmb3JlQ2VsbHMgPSB0YXJnZXQubm9kZSgpLmNlbGxzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIC0tc3I7XHJcbiAgICB9XHJcbiAgICAvLyDnj77lnKjjga7nt6jpm4booYxcclxuICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHM7XHJcbiAgICBsZXQgZXYgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5kYXR1bSgpO1xyXG4gICAgLy8g44Ko44OZ44Oz44OI44KS55Sf5oiQ44GZ44KLXHJcbiAgICAvLyDjg4fjg7zjgr/jgYzkvZXjgoLlhaXlipvjgZXjgozjgabjgYTjgarjgYTjgajjgY3jga/jgIEx44Gk5YmN44Gu44OO44O844OI44OH44O844K/44KS6KSH6KO944GZ44KL44CCXHJcbiAgICAvLyAx44Gk5YmN44Gu44OO44O844OI44OH44O844K/44GM44Gq44GE44Go44GN44KE5LiN5q2j44OH44O844K/44Gu5aC05ZCI44Gv44CB44OH44OV44Kp44Or44OI5YCk44KS5Luj5YWl44GZ44KL44CCXHJcbiAgICBsZXQgbm90ZU5vID0gMDtcclxuICAgIGlmKGNlbGxJbmRleCA9PSAyKSB7XHJcbiAgICAgbGV0IG5vdGUgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XS5pbm5lclRleHQ7XHJcbiAgICAgZXYuc2V0Tm90ZU5hbWVUb05vdGUobm90ZSwoYmVmb3JlQ2VsbHNbMl0gPyBiZWZvcmVDZWxsc1syXS5pbm5lclRleHQ6JycpKTsgXHJcbiAgICAgbm90ZU5vID0gZXYubm90ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgbm90ZU5vID0gcGFyc2VGbG9hdChjdXJSb3dbM10uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1szXSA/IGJlZm9yZUNlbGxzWzNdLmlubmVyVGV4dCA6ICc2MCcpKTtcclxuICAgIH1cclxuICAgIGlmIChpc05hTihub3RlTm8pKSBub3RlTm8gPSA2MDtcclxuICAgIGxldCBzdGVwID0gcGFyc2VGbG9hdChjdXJSb3dbNF0uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1s0XSA/IGJlZm9yZUNlbGxzWzRdLmlubmVyVGV4dCA6ICc5NicpKTtcclxuICAgIGlmIChpc05hTihzdGVwKSkgc3RlcCA9IDk2O1xyXG4gICAgbGV0IGdhdGUgPSBwYXJzZUZsb2F0KGN1clJvd1s1XS5pbm5lclRleHQgfHwgKGJlZm9yZUNlbGxzWzVdID8gYmVmb3JlQ2VsbHNbNV0uaW5uZXJUZXh0IDogJzI0JykpO1xyXG4gICAgaWYgKGlzTmFOKGdhdGUpKSBnYXRlID0gMjQ7XHJcbiAgICBsZXQgdmVsID0gcGFyc2VGbG9hdChjdXJSb3dbNl0uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1s2XSA/IGJlZm9yZUNlbGxzWzZdLmlubmVyVGV4dCA6ICcxLjAnKSk7XHJcbiAgICBpZiAoaXNOYU4odmVsKSkgdmVsID0gMS4wXHJcbiAgICBsZXQgY29tID0gLypjdXJSb3dbN10uaW5uZXJUZXh0IHx8IGJlZm9yZUNlbGxzWzddP2JlZm9yZUNlbGxzWzddLmlubmVyVGV4dDoqL25ldyBhdWRpby5Db21tYW5kKCk7XHJcblxyXG4gICAgZXYubm90ZSA9IG5vdGVObztcclxuICAgIGV2LnN0ZXAgPSBzdGVwO1xyXG4gICAgZXYuZ2F0ZSA9IGdhdGU7XHJcbiAgICBldi52ZWwgPSB2ZWw7XHJcbiAgICBldi5jb21tYW5kID0gY29tO1xyXG4gICAgLy8gICAgICAgICAgICB2YXIgZXYgPSBuZXcgYXVkaW8uTm90ZUV2ZW50KHN0ZXAsIG5vdGVObywgZ2F0ZSwgdmVsLCBjb20pO1xyXG4gICAgLy8g44OI44Op44OD44Kv44Gr44OH44O844K/44KS44K744OD44OIXHJcbiAgICB0cmFjay5pbnNlcnRFdmVudChldiwgcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleCk7XHJcbiAgICBpZihkb3duKXtcclxuICAgICAgaWYgKHJvd0luZGV4ID09IChOVU1fUk9XIC0gMSkpIHtcclxuICAgICAgICArK2N1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICsrcm93SW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIOaMv+WFpeW+jOOAgeWGjeaPj+eUu1xyXG4gICAgZHJhd0V2ZW50KCk7XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgfVxyXG5cclxuICBkcmF3RXZlbnQoKTtcclxuICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgY29uc29sZS5sb2coJ25ldyBsaW5lJywgcm93SW5kZXgsIHRyYWNrLmV2ZW50cy5sZW5ndGgpO1xyXG4gICAgaWYgKHRyYWNrLmV2ZW50cy5sZW5ndGggPT0gMCB8fCByb3dJbmRleCA+ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgIH1cclxuICAgIGtleWxvb3A6XHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICBsZXQgaW5wdXQgPSB5aWVsZCBjYW5jZWxFdmVudDtcclxuICAgICAgc3dpdGNoIChpbnB1dC5pbnB1dENvbW1hbmQpIHtcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5lbnRlcjovL0VudGVyXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnQ1IvTEYnKTtcclxuICAgICAgICAgIC8vIOePvuWcqOOBruihjOOBjOaWsOimj+OBi+e3qOmbhuS4reOBi1xyXG4gICAgICAgICAgbGV0IGZsYWcgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpO1xyXG4gICAgICAgICAgaWYgKGZsYWcpIHtcclxuICAgICAgICAgICAgZW5kTmV3SW5wdXQoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8v5paw6KaP57eo6ZuG5Lit44Gu6KGM44Gn44Gq44GR44KM44Gw44CB5paw6KaP5YWl5Yqb55So6KGM44KS5oy/5YWlXHJcbiAgICAgICAgICAgIGluc2VydEV2ZW50KHJvd0luZGV4KTtcclxuICAgICAgICAgIH0gXHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5yaWdodDovLyByaWdodCBDdXJzb3JcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2VsbEluZGV4Kys7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgICAgICAgICAgaWYgKGNlbGxJbmRleCA+IChjdXJSb3dbcm93SW5kZXhdLmNlbGxzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgY2VsbEluZGV4ID0gMjtcclxuICAgICAgICAgICAgICBpZiAocm93SW5kZXggPCAoY3VyUm93Lmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBpZihkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSl7XHJcbiAgICAgICAgICAgICAgICAgIGVuZE5ld0lucHV0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICArK3Jvd0luZGV4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5udW1iZXI6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgICAgIGxldCBjdXJEYXRhID0gZDMuc2VsZWN0KGN1clJvdykuZGF0dW0oKTtcclxuICAgICAgICAgICAgaWYoY3VyRGF0YS50eXBlICE9IGF1ZGlvLkV2ZW50VHlwZS5Ob3RlKXtcclxuICAgICAgICAgICAgICAvL+aWsOimj+e3qOmbhuS4reOBruihjOOBp+OBquOBkeOCjOOBsOOAgeaWsOimj+WFpeWKm+eUqOihjOOCkuaMv+WFpVxyXG4gICAgICAgICAgICAgIGluc2VydEV2ZW50KHJvd0luZGV4KTtcclxuICAgICAgICAgICAgICBjZWxsSW5kZXggPSAzO1xyXG4gICAgICAgICAgICAgIGxldCBjZWxsID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF07XHJcbiAgICAgICAgICAgICAgY2VsbC5pbm5lclRleHQgPSBpbnB1dC5udW1iZXI7XHJcbiAgICAgICAgICAgICAgbGV0IHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgICAgICAgICBzZWwuY29sbGFwc2UoY2VsbCwxKTtcclxuICAgICAgICAgICAgICAvLyBzZWwuc2VsZWN0KCk7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLm5vdGU6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgICAgIGxldCBjdXJEYXRhID0gZDMuc2VsZWN0KGN1clJvdykuZGF0dW0oKTtcclxuICAgICAgICAgICAgaWYoY3VyRGF0YS50eXBlICE9IGF1ZGlvLkV2ZW50VHlwZS5Ob3RlKXtcclxuICAgICAgICAgICAgICAvL+aWsOimj+e3qOmbhuS4reOBruihjOOBp+OBquOBkeOCjOOBsOOAgeaWsOimj+WFpeWKm+eUqOihjOOCkuaMv+WFpVxyXG4gICAgICAgICAgICAgIGluc2VydEV2ZW50KHJvd0luZGV4KTtcclxuICAgICAgICAgICAgICBsZXQgY2VsbCA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdO1xyXG4gICAgICAgICAgICAgIGNlbGwuaW5uZXJUZXh0ID0gaW5wdXQubm90ZTtcclxuICAgICAgICAgICAgICBsZXQgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICAgIHNlbC5jb2xsYXBzZShjZWxsLDEpO1xyXG4gICAgICAgICAgICAgIC8vIHNlbC5zZWxlY3QoKTtcclxuICAgICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQubGVmdDovLyBsZWZ0IEN1cnNvclxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIC0tY2VsbEluZGV4O1xyXG4gICAgICAgICAgICBpZiAoY2VsbEluZGV4IDwgMikge1xyXG4gICAgICAgICAgICAgIGlmIChyb3dJbmRleCA9PSAwKSB7XHJcbiAgXHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgaWYoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3Jykpe1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgICAgIC0tcm93SW5kZXg7XHJcbiAgICAgICAgICAgICAgICBjZWxsSW5kZXggPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC51cDovLyBVcCBDdXJzb3JcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgICAgICAgICBpZihkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSl7XHJcbiAgICAgICAgICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBpZiAocm93SW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgLS1yb3dJbmRleDtcclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgLS1jdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5kb3duOi8vIERvd24gQ3Vyc29yXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgICAgICAgICAgaWYoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3Jykpe1xyXG4gICAgICAgICAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgICAgICAgICAgfSBcclxuICAgICAgICAgICAgaWYgKHJvd0luZGV4ID09IChOVU1fUk9XIC0gMSkpIHtcclxuICAgICAgICAgICAgICBpZiAoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVykgPD0gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgKytjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICArK3Jvd0luZGV4O1xyXG4gICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5wYWdlRG93bjovLyBQYWdlIERvd24g44Kt44O8XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmKGN1cnJlbnRFdmVudEluZGV4IDwgKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSApe1xyXG4gICAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ICs9IE5VTV9ST1c7XHJcbiAgICAgICAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPiAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpICl7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCAtPSBOVU1fUk9XO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnBhZ2VVcDovLyBQYWdlIFVwIOOCreODvFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZihjdXJyZW50RXZlbnRJbmRleCA+IDApe1xyXG4gICAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4IC09IE5VTV9ST1c7XHJcbiAgICAgICAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPCAwKXtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOOCueOCr+ODreODvOODq+OCouODg+ODl1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnNjcm9sbFVwOiBcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPiAwKXtcclxuICAgICAgICAgICAgICAtLWN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g44K544Kv44Ot44O844Or44OA44Km44OzXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuc2Nyb2xsRG93bjogXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cpIDw9ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpe1xyXG4gICAgICAgICAgICAgICsrY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDlhYjpoK3ooYzjgavnp7vli5VcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5ob21lOlxyXG4gICAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPiAwKXtcclxuICAgICAgICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDmnIDntYLooYzjgavnp7vli5VcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5lbmQ6XHJcbiAgICAgICAgICBpZihjdXJyZW50RXZlbnRJbmRleCAhPSAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICByb3dJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gdHJhY2suZXZlbnRzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDooYzliYrpmaRcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5kZWxldGU6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGV4ZWMoKXtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5yb3dJbmRleCA9IHJvd0luZGV4O1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRFdmVudEluZGV4ID0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnQgPSB0cmFjay5ldmVudHNbdGhpcy5yb3dJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucm93RGF0YSA9IHRyYWNrLmV2ZW50c1t0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGxpbmVCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgIGxpbmVCdWZmZXIgPSB0aGlzLmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICB0cmFjay5kZWxldGVFdmVudCh0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcmVkbygpe1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBsaW5lQnVmZmVyO1xyXG4gICAgICAgICAgICAgICAgICBsaW5lQnVmZmVyID0gdGhpcy5ldmVudDtcclxuICAgICAgICAgICAgICAgICAgZWRpdFZpZXcubm9kZSgpLmRlbGV0ZVJvdyh0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgdHJhY2suZGVsZXRlRXZlbnQodGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHVuZG8oKXtcclxuICAgICAgICAgICAgICAgICAgbGluZUJ1ZmZlciA9IHRoaXMubGluZUJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgICAgdHJhY2suaW5zZXJ0RXZlbnQodGhpcy5ldmVudCx0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIHJlZG8gICBcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5yZWRvOlxyXG4gICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLnJlZG8oKTtcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIHVuZG8gIFxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnVuZG86XHJcbiAgICAgICAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIudW5kbygpO1xyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5bCP56+A57ea5oy/5YWlXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuaW5zZXJ0TWVhc3VyZTovLyAqXHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDjg4fjg5Xjgqnjg6vjg4hcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdkZWZhdWx0Jyk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1NlcXVlbmNlRWRpdG9yKGQpIHtcclxuXHQgZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHQgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHQgZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHQgaWYgKGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cpIHJldHVybjtcclxuXHQgZC5lZGl0b3JJbnN0YW5jZSA9IG5ldyBTZXF1ZW5jZUVkaXRvcihkKTtcclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vZXZlbnRFbWl0dGVyMyc7XHJcbmltcG9ydCAqIGFzIHByb3AgZnJvbSAnLi9wcm9wJztcclxuXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEV2ZW50QmFzZSB7XHJcblx0Y29uc3RydWN0b3Ioc3RlcCA9IDAsbmFtZSA9IFwiXCIpe1xyXG5cdFx0dGhpcy5zdGVwID0gc3RlcDtcclxuXHRcdHRoaXMuc3RlcE5vID0gMDtcclxuXHRcdHRoaXMubWVhc3VyZSA9IDA7XHJcblx0XHR0aGlzLm5hbWUgPSAgbmFtZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRWYWx1ZUF0VGltZShhdWRpb1BhcmFtLHZhbHVlLHRpbWUpXHJcbntcclxuXHRhdWRpb1BhcmFtLnNldFZhbHVlQXRUaW1lKHZhbHVlLHRpbWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoYXVkaW9QYXJhbSx2YWx1ZSx0aW1lKXtcclxuXHRhdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHZhbHVlLHRpbWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZShhdWRpb1BhcmFtLHZhbHVlLHRpbWUpe1xyXG5cdGF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQ29tbWFuZCB7XHJcblx0Y29uc3RydWN0b3IocGl0Y2hDb21tYW5kID0gc2V0VmFsdWVBdFRpbWUsdmVsb2NpdHlDb21tYW5kID0gc2V0VmFsdWVBdFRpbWUpXHJcblx0e1xyXG5cdFx0dGhpcy5wcm9jZXNzUGl0Y2ggPSBwaXRjaENvbW1hbmQuYmluZCh0aGlzKTtcclxuXHRcdHRoaXMucHJvY2Vzc1ZlbG9jaXR5ID0gdmVsb2NpdHlDb21tYW5kLmJpbmQodGhpcyk7XHJcblx0fVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgRXZlbnRUeXBlICA9IHtcclxuXHROb3RlOlN5bWJvbCgpLFxyXG5cdE1lYXN1cmU6U3ltYm9sKCksXHJcblx0VHJhY2tFbmQ6U3ltYm9sKClcclxufVxyXG5cclxuLy8g5bCP56+A57eaXHJcbmV4cG9ydCBjbGFzcyBNZWFzdXJlIGV4dGVuZHMgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoMCk7XHJcblx0XHR0aGlzLnR5cGUgPSBFdmVudFR5cGUuTWVhc3VyZTtcclxuICAgIHRoaXMuc3RlcFRvdGFsID0gMDtcclxuXHR9XHJcbiAgcHJvY2Vzcygpe1xyXG4gICAgXHJcbiAgfVxyXG59XHJcblxyXG4vLyBUcmFjayBFbmRcclxuZXhwb3J0IGNsYXNzIFRyYWNrRW5kIGV4dGVuZHMgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoMCk7XHJcblx0XHR0aGlzLnR5cGUgPSBFdmVudFR5cGUuVHJhY2tFbmQ7XHJcblx0fVxyXG4gIHByb2Nlc3MoKXtcclxuICAgIFxyXG4gIH1cclxuXHRcclxufVxyXG5cclxudmFyIE5vdGVzID0gW1xyXG5cdCdDICcsXHJcblx0J0MjJyxcclxuXHQnRCAnLFxyXG5cdCdEIycsXHJcblx0J0UgJyxcclxuXHQnRiAnLFxyXG5cdCdGIycsXHJcblx0J0cgJyxcclxuXHQnRyMnLFxyXG5cdCdBICcsXHJcblx0J0EjJyxcclxuXHQnQiAnLFxyXG5dO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5vdGVFdmVudCBleHRlbmRzIEV2ZW50QmFzZSB7XHJcblx0Y29uc3RydWN0b3Ioc3RlcCA9IDAsbm90ZSA9IDAsZ2F0ZSA9IDAsdmVsID0gMC41LGNvbW1hbmQgPSBuZXcgQ29tbWFuZCgpKXtcclxuXHRcdHN1cGVyKHN0ZXApO1xyXG5cdFx0dGhpcy50cmFuc3Bvc2VfID0gMC4wO1xyXG5cdFx0dGhpcy5ub3RlID0gbm90ZTtcclxuXHRcdHRoaXMuZ2F0ZSA9IGdhdGU7XHJcblx0XHR0aGlzLnZlbCA9IHZlbDtcclxuXHRcdHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XHJcblx0XHR0aGlzLmNvbW1hbmQuZXZlbnQgPSB0aGlzO1xyXG5cdFx0dGhpcy50eXBlID0gRXZlbnRUeXBlLk5vdGU7XHJcblx0XHR0aGlzLnNldE5vdGVOYW1lKCk7XHJcblx0fVxyXG5cdFxyXG5cdHNldE5vdGVOYW1lKCl7XHJcblx0XHRcdGxldCBvY3QgPSB0aGlzLm5vdGUgLyAxMiB8IDA7XHJcblx0XHRcdHRoaXMubmFtZSA9IE5vdGVzW3RoaXMubm90ZSAlIDEyXSArIG9jdDtcclxuXHR9XHJcblxyXG5cdHNldE5vdGVOYW1lVG9Ob3RlKG5vdGVOYW1lLGRlZmF1bHROb3RlTmFtZSA9IFwiXCIpXHJcblx0e1xyXG4gICAgdmFyIG1hdGNoZXMgPSBub3RlTmFtZS5tYXRjaCgvKEMjKXwoQyl8KEQjKXwoRCl8KEUpfChGIyl8KEYpfChHIyl8KEcpfChBIyl8KEEpfChCKS9pKTtcclxuXHRcdGlmKG1hdGNoZXMpXHJcblx0XHR7XHJcbiAgICAgIHZhciBuID0gbWF0Y2hlc1swXTtcclxuICAgICAgdmFyIGdldE51bWJlciA9IG5ldyBSZWdFeHAoJyhbMC05XXsxLDJ9KScpO1xyXG4vLyAgICAgIGdldE51bWJlci5jb21waWxlKCk7XHJcbiAgICAgIGdldE51bWJlci5leGVjKG5vdGVOYW1lKTtcclxuICAgICAgdmFyIG8gPSBSZWdFeHAuJDE7XHJcbiAgICAgIGlmKCFvKXtcclxuICAgICAgICAobmV3IFJlZ0V4cCgnKFswLTldezEsMn0pJykpLmV4ZWMoZGVmYXVsdE5vdGVOYW1lKTsgICAgICAgIFxyXG4gICAgICAgIG8gPSBSZWdFeHAuJDE7XHJcbiAgICAgICAgaWYoIW8pe1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZihuLmxlbmd0aCA9PT0gMSkgbiArPSAnICc7XHJcbiAgICAgIFxyXG4gICAgICBpZihOb3Rlcy5zb21lKChkLGkpPT57XHJcbiAgICAgICAgICBpZihkID09PSBuKXtcclxuICAgICAgICAgICAgdGhpcy5ub3RlID0gcGFyc2VGbG9hdChpKSArIHBhcnNlRmxvYXQobykgKiAxMjtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHRcdFx0XHRcclxuICAgICAgICAgfSkpXHJcbiAgICAgIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNldE5vdGVOYW1lKCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblx0XHR9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNldE5vdGVOYW1lKCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTsgXHJcbiAgICB9XHJcblx0fVxyXG5cdFxyXG5cdGdldCBub3RlICgpe1xyXG5cdFx0IHJldHVybiB0aGlzLm5vdGVfO1xyXG5cdH1cclxuXHRcclxuXHRzZXQgbm90ZSh2KXtcclxuXHRcdCB0aGlzLm5vdGVfID0gdjtcclxuXHRcdCB0aGlzLmNhbGNQaXRjaCgpO1xyXG5cdFx0IHRoaXMuc2V0Tm90ZU5hbWUoKTtcclxuXHR9XHJcblx0XHJcblx0c2V0IHRyYW5zcG9zZSh2KXtcclxuXHRcdGlmKHYgIT0gdGhpcy50cmFuc3Bvc2VfKXtcclxuXHRcdFx0dGhpcy50cmFuc3Bvc2VfID0gdjtcclxuXHRcdFx0dGhpcy5jYWxjUGl0Y2goKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Y2FsY1BpdGNoKCl7XHJcblx0XHR0aGlzLnBpdGNoID0gKDQ0MC4wIC8gMzIuMCkgKiAoTWF0aC5wb3coMi4wLCgodGhpcy5ub3RlICsgdGhpcy50cmFuc3Bvc2VfIC0gOSkgLyAxMikpKTtcclxuXHR9XHJcblx0XHJcblx0cHJvY2Vzcyh0aW1lLHRyYWNrKXtcclxuXHRcdFx0aWYodGhpcy5ub3RlKXtcclxuXHRcdFx0XHR0aGlzLnRyYW5zb3BzZSA9IHRyYWNrLnRyYW5zcG9zZTtcclxuXHRcdFx0XHRmb3IobGV0IGogPSAwLGplID0gdHJhY2sucGl0Y2hlcy5sZW5ndGg7aiA8IGplOysrail7XHJcblx0XHRcdFx0XHR0cmFjay5waXRjaGVzW2pdLnByb2Nlc3ModGhpcy5jb21tYW5kLHRoaXMucGl0Y2gsdGltZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGZvcihsZXQgaiA9IDAsamUgPSB0cmFjay52ZWxvY2l0aWVzLmxlbmd0aDtqIDwgamU7KytqKXtcclxuXHRcdFx0XHRcdC8vIGtleW9uXHJcblx0XHRcdFx0XHR0cmFjay52ZWxvY2l0aWVzW2pdLnByb2Nlc3ModGhpcy5jb21tYW5kLHRoaXMudmVsLHRpbWUpO1xyXG5cdFx0XHRcdFx0Ly8ga2V5b2ZmXHJcblx0XHRcdFx0XHR0cmFjay52ZWxvY2l0aWVzW2pdLnByb2Nlc3ModGhpcy5jb21tYW5kLDAsdGltZSArIHRoaXMuZ2F0ZSAqIHRyYWNrLnNlcXVlbmNlci5zdGVwVGltZV8gKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcbn1cclxuXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFRyYWNrIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb25zdHJ1Y3RvcihzZXF1ZW5jZXIpe1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuZXZlbnRzID0gW107XHJcblx0XHR0aGlzLnBvaW50ZXIgPSAwO1xyXG5cdFx0dGhpcy5ldmVudHMucHVzaChuZXcgVHJhY2tFbmQoKSk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnc3RlcCcpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2VuZCcpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ25hbWUnKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCd0cmFuc3Bvc2UnKTtcclxuXHRcdFxyXG5cdFx0dGhpcy5zdGVwID0gMDtcclxuXHRcdHRoaXMuZW5kID0gZmFsc2U7XHJcblx0XHR0aGlzLnBpdGNoZXMgPSBbXTtcclxuXHRcdHRoaXMudmVsb2NpdGllcyA9IFtdO1xyXG5cdFx0dGhpcy5zZXF1ZW5jZXIgPSBzZXF1ZW5jZXI7XHJcblx0XHR0aGlzLm5hbWUgPSAnJztcclxuXHRcdHRoaXMudHJhbnNwb3NlID0gMDtcclxuXHR9XHJcblx0XHJcblx0YWRkRXZlbnQoZXYpe1xyXG5cdFx0aWYodGhpcy5ldmVudHMubGVuZ3RoID4gMSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIGJlZm9yZSA9IHRoaXMuZXZlbnRzW3RoaXMuZXZlbnRzLmxlbmd0aCAtIDJdO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGV2Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk1lYXN1cmU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlICsgMTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRldi5zdGVwTm8gPSAxO1xyXG5cdFx0XHRldi5tZWFzdXJlID0gMTtcclxuXHRcdH1cclxuXHRcdHRoaXMuZXZlbnRzLnNwbGljZSh0aGlzLmV2ZW50cy5sZW5ndGggLSAxLDAsZXYpO1xyXG4gICAgdGhpcy5jYWxjTWVhc3VyZVN0ZXBUb3RhbCh0aGlzLmV2ZW50cy5sZW5ndGggLSAyKTtcclxuXHR9XHJcblx0XHJcblx0aW5zZXJ0RXZlbnQoZXYsaW5kZXgpe1xyXG5cdFx0aWYodGhpcy5ldmVudHMubGVuZ3RoID4gMSAmJiBpbmRleCAhPSAwKXtcclxuXHRcdFx0dmFyIGJlZm9yZSA9IHRoaXMuZXZlbnRzW2luZGV4LTFdO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGV2Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG5cdFx0XHRcdFx0ZXYuc3RlcE5vID0gMTtcclxuXHRcdFx0XHRcdGV2Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZSArIDE7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGV2LnN0ZXBObyA9IDE7XHJcblx0XHRcdGV2Lm1lYXN1cmUgPSAxO1xyXG4gICAgfVxyXG5cdFx0dGhpcy5ldmVudHMuc3BsaWNlKGluZGV4LDAsZXYpO1xyXG5cdFx0aWYoZXYudHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSl7XHJcblx0XHRcdHRoaXMudXBkYXRlU3RlcEFuZE1lYXN1cmUoaW5kZXgpO1x0XHRcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMudXBkYXRlU3RlcChpbmRleCk7XHRcdFxyXG4gICAgfVxyXG4gICAgdGhpcy5jYWxjTWVhc3VyZVN0ZXBUb3RhbChpbmRleCk7XHJcblx0fVxyXG4gICAgXHJcblx0dXBkYXRlU3RlcChpbmRleCl7XHJcblx0XHRmb3IobGV0IGkgPSBpbmRleCArIDEsZSA9IHRoaXMuZXZlbnRzLmxlbmd0aDtpPGU7KytpKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgYmVmb3JlID0gdGhpcy5ldmVudHNbaS0xXTtcclxuXHRcdFx0bGV0IGN1cnJlbnQgPSB0aGlzLmV2ZW50c1tpXTtcclxuXHRcdFx0c3dpdGNoKGJlZm9yZS50eXBlKXtcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5Ob3RlOlxyXG5cdFx0XHRcdFx0Y3VycmVudC5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGN1cnJlbnQubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTWVhc3VyZTpcclxuICAgICAgICAgIGJyZWFrO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHRcdFx0XHJcblx0XHR9XHJcblx0fVx0XHJcbiAgXHJcblx0dXBkYXRlU3RlcEFuZE1lYXN1cmUoaW5kZXgpe1xyXG5cdFx0Zm9yKGxldCBpID0gaW5kZXggKyAxLGUgPSB0aGlzLmV2ZW50cy5sZW5ndGg7aTxlOysraSlcclxuXHRcdHtcclxuXHRcdFx0bGV0IGJlZm9yZSA9IHRoaXMuZXZlbnRzW2ktMV07XHJcblx0XHRcdGxldCBjdXJyZW50ID0gdGhpcy5ldmVudHNbaV07XHJcblx0XHRcdHN3aXRjaChiZWZvcmUudHlwZSl7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTm90ZTpcclxuXHRcdFx0XHRcdGN1cnJlbnQuc3RlcE5vID0gYmVmb3JlLnN0ZXBObyArIDE7XHJcblx0XHRcdFx0XHRjdXJyZW50Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG5cdFx0XHRcdFx0Y3VycmVudC5zdGVwTm8gPSAxO1xyXG5cdFx0XHRcdFx0Y3VycmVudC5tZWFzdXJlID0gYmVmb3JlLm1lYXN1cmUgKyAxO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHRcdFx0XHJcblx0XHR9XHJcblx0fVxyXG4gIFxyXG4gIGNhbGNNZWFzdXJlU3RlcFRvdGFsKGluZGV4KXtcclxuICAgIGxldCBldmVudHMgPSB0aGlzLmV2ZW50cztcclxuICAgIGxldCBzdGVwVG90YWwgPSAwO1xyXG4gICAgbGV0IGV2ZW50ID0gZXZlbnRzW2luZGV4XTtcclxuICAgIGlmKGV2ZW50LnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpe1xyXG4gICAgICAtLWluZGV4O1xyXG4gICAgICB3aGlsZShpbmRleCA+PSAwKXtcclxuICAgICAgICBsZXQgZXYgPSBldmVudHNbaW5kZXhdO1xyXG4gICAgICAgIGlmKGV2LnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0ZXBUb3RhbCArPSAgZXYuc3RlcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLS1pbmRleDtcclxuICAgICAgfVxyXG4gICAgICBldmVudC5zdGVwVG90YWwgPSBzdGVwVG90YWw7XHJcbiAgICAgIHN0ZXBUb3RhbCA9IDA7XHJcbiAgICAgIHdoaWxlKGluZGV4IDwgKGV2ZW50cy5sZW5ndGggLSAxKSl7XHJcbiAgICAgICAgKytpbmRleDtcclxuICAgICAgICBsZXQgZXYgPSBldmVudHNbaW5kZXhdO1xyXG4gICAgICAgIGlmKGV2LnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpe1xyXG4gICAgICAgICAgZXYuc3RlcFRvdGFsID0gc3RlcFRvdGFsO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0ZXBUb3RhbCArPSBldi5zdGVwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm47XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyDkuIDjgaTliY3jga7jg6Hjgrjjg6Pjg7zjgpLmjqLjgZlcclxuICAgICAgbGV0IHN0YXJ0SW5kZXggPSAwO1xyXG4gICAgICBpZihpbmRleCA9PSAwKXtcclxuICAgICAgICBzdGFydEluZGV4ID0gMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzdGFydEluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgd2hpbGUoc3RhcnRJbmRleCA+IDApe1xyXG4gICAgICAgICAgLS1zdGFydEluZGV4O1xyXG4gICAgICAgICAgaWYodGhpcy5ldmVudHNbc3RhcnRJbmRleF0udHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSlcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgKytzdGFydEluZGV4O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc3RlcFRvdGFsID0gMDtcclxuICAgICAgd2hpbGUodGhpcy5ldmVudHNbc3RhcnRJbmRleF0udHlwZSA9PSBFdmVudFR5cGUuTm90ZSlcclxuICAgICAge1xyXG4gICAgICAgIHN0ZXBUb3RhbCArPSB0aGlzLmV2ZW50c1tzdGFydEluZGV4XS5zdGVwOyAgICAgICAgXHJcbiAgICAgICAgKytzdGFydEluZGV4O1xyXG4gICAgICB9ICBcclxuICAgICAgaWYodGhpcy5ldmVudHNbc3RhcnRJbmRleF0udHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSl7XHJcbiAgICAgICAgdGhpcy5ldmVudHNbc3RhcnRJbmRleF0uc3RlcFRvdGFsID0gc3RlcFRvdGFsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyDjgqTjg5njg7Pjg4jjga7liYrpmaQgIFxyXG4gIGRlbGV0ZUV2ZW50KGluZGV4KXtcclxuICAgIHZhciBldiA9IHRoaXMuZXZlbnRzW2luZGV4XTtcclxuICAgIHRoaXMuZXZlbnRzLnNwbGljZShpbmRleCwxKTtcclxuICAgIGlmKGluZGV4ID09IDApe1xyXG4gICAgICB0aGlzLmV2ZW50c1swXS5tZWFzdXJlID0gMTtcclxuICAgICAgdGhpcy5ldmVudHNbMF0uc3RlcE5vID0gMTtcclxuICAgICAgaWYodGhpcy5ldmVudHMubGVuZ3RoID4gMSl7XHJcbiAgICAgICAgc3dpdGNoKGV2LnR5cGUpe1xyXG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUubm90ZTpcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGVwKDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLk1lYXN1cmU6XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RlcEFuZE1lYXN1cmUoMSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmKGluZGV4IDw9ICh0aGlzLmV2ZW50cy5sZW5ndGggLSAxKSlcclxuICAgIHtcclxuICAgICAgICBzd2l0Y2goZXYudHlwZSl7XHJcbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5ub3RlOlxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0ZXAoaW5kZXggLSAxKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0ZXBBbmRNZWFzdXJlKGluZGV4IC0gMSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuY2FsY01lYXN1cmVTdGVwVG90YWwoaW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFNFUV9TVEFUVVMgPSB7XHJcblx0U1RPUFBFRDowLFxyXG5cdFBMQVlJTkc6MSxcclxuXHRQQVVTRUQ6MlxyXG59IDtcclxuXHJcbmV4cG9ydCBjb25zdCBOVU1fT0ZfVFJBQ0tTID0gNDtcclxuXHJcbmV4cG9ydCBjbGFzcyBTZXF1ZW5jZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnYnBtJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywndHBiJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnYmVhdCcpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JhcicpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3JlcGVhdCcpO1xyXG5cclxuXHRcdHRoaXMuYnBtID0gMTIwLjA7IC8vIHRlbXBvXHJcblx0XHR0aGlzLnRwYiA9IDk2LjA7IC8vIOWbm+WIhumfs+espuOBruino+WDj+W6plxyXG5cdFx0dGhpcy5iZWF0ID0gNDtcclxuXHRcdHRoaXMuYmFyID0gNDsgLy8gXHJcblx0XHR0aGlzLnRyYWNrcyA9IFtdO1xyXG5cdFx0dGhpcy5udW1iZXJPZklucHV0cyA9IDA7XHJcblx0XHR0aGlzLm51bWJlck9mT3V0cHV0cyA9IDA7XHJcblx0XHR0aGlzLm5hbWUgPSAnU2VxdWVuY2VyJztcclxuXHRcdGZvciAodmFyIGkgPSAwO2kgPCBOVU1fT0ZfVFJBQ0tTOysraSlcclxuXHRcdHtcclxuXHRcdFx0dGhpcy50cmFja3MucHVzaChuZXcgVHJhY2sodGhpcykpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdnJ10gPSBuZXcgYXVkaW8uUGFyYW1WaWV3KG51bGwsJ3RyaycgKyBpICsgJ2cnLHRydWUpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdnJ10udHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddLnR5cGUgPSAnZ2F0ZSc7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdwJ10gPSBuZXcgYXVkaW8uUGFyYW1WaWV3KG51bGwsJ3RyaycgKyBpICsgJ3AnLHRydWUpO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdwJ10udHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddLnR5cGUgPSAncGl0Y2gnO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5zdGFydFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY3VycmVudFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY3VycmVudE1lYXN1cmVfID0gMDtcclxuXHRcdHRoaXMuY2FsY1N0ZXBUaW1lKCk7XHJcblx0XHR0aGlzLnJlcGVhdCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cclxuXHRcdC8vXHJcblx0XHR0aGlzLm9uKCdicG1fY2hhbmVnZWQnLCgpPT57dGhpcy5jYWxjU3RlcFRpbWUoKTt9KTtcclxuXHRcdHRoaXMub24oJ3RwYl9jaGFuZWdlZCcsKCk9Pnt0aGlzLmNhbGNTdGVwVGltZSgpO30pO1xyXG5cclxuXHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnB1c2godGhpcyk7XHJcblx0XHRpZihTZXF1ZW5jZXIuYWRkZWQpe1xyXG5cdFx0XHRTZXF1ZW5jZXIuYWRkZWQoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblxyXG5cdGRpc3Bvc2UoKXtcclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aDsrK2kpXHJcblx0XHR7XHJcblx0XHRcdGlmKHRoaXMgPT09IFNlcXVlbmNlci5zZXF1ZW5jZXJzW2ldKXtcclxuXHRcdFx0XHQgU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3BsaWNlKGksMSk7XHJcblx0XHRcdFx0IGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aCA9PSAwKVxyXG5cdFx0e1xyXG5cdFx0XHRpZihTZXF1ZW5jZXIuZW1wdHkpe1xyXG5cdFx0XHRcdFNlcXVlbmNlci5lbXB0eSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGNhbGNTdGVwVGltZSgpe1xyXG5cdFx0dGhpcy5zdGVwVGltZV8gPSA2MC4wIC8gKCB0aGlzLmJwbSAqIHRoaXMudHBiKTsgXHJcblx0fVxyXG5cdFxyXG5cdHN0YXJ0KHRpbWUpe1xyXG5cdFx0aWYodGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuU1RPUFBFRCB8fCB0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QQVVTRUQgKXtcclxuXHRcdFx0dGhpcy5jdXJyZW50VGltZV8gPSB0aW1lIHx8IGF1ZGlvLmN0eC5jdXJyZW50VGltZSgpO1xyXG5cdFx0XHR0aGlzLnN0YXJ0VGltZV8gID0gdGhpcy5jdXJyZW50VGltZV87XHJcblx0XHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuUExBWUlORztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0c3RvcCgpe1xyXG5cdFx0aWYodGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUExBWUlORyB8fCB0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QQVVTRUQpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMudHJhY2tzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5waXRjaGVzLmZvckVhY2goKHApPT57XHJcblx0XHRcdFx0XHRwLnN0b3AoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRkLnZlbG9jaXRpZXMuZm9yRWFjaCgodik9PntcclxuXHRcdFx0XHRcdHYuc3RvcCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuU1RPUFBFRDtcclxuXHRcdFx0dGhpcy5yZXNldCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cGF1c2UoKXtcclxuXHRcdGlmKHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHR0aGlzLnN0YXR1c18gPSBTRVFfU1RBVFVTLlBBVVNFRDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmVzZXQoKXtcclxuXHRcdHRoaXMuc3RhcnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLnRyYWNrcy5mb3JFYWNoKCh0cmFjayk9PntcclxuXHRcdFx0dHJhY2suZW5kID0gIXRyYWNrLmV2ZW50cy5sZW5ndGg7XHJcblx0XHRcdHRyYWNrLnN0ZXAgPSAwO1xyXG5cdFx0XHR0cmFjay5wb2ludGVyID0gMDtcclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5jYWxjU3RlcFRpbWUoKTtcclxuXHR9XHJcbiAgLy8g44K344O844Kx44Oz44K144O844Gu5Yem55CGXHJcblx0cHJvY2VzcyAodGltZSlcclxuXHR7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IHRpbWUgfHwgYXVkaW8uY3R4LmN1cnJlbnRUaW1lKCk7XHJcblx0XHR2YXIgY3VycmVudFN0ZXAgPSAodGhpcy5jdXJyZW50VGltZV8gIC0gdGhpcy5zdGFydFRpbWVfICsgMC4xKSAvIHRoaXMuc3RlcFRpbWVfO1xyXG5cdFx0bGV0IGVuZGNvdW50ID0gMDtcclxuXHRcdGZvcih2YXIgaSA9IDAsbCA9IHRoaXMudHJhY2tzLmxlbmd0aDtpIDwgbDsrK2kpe1xyXG5cdFx0XHR2YXIgdHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0aWYoIXRyYWNrLmVuZCl7XHJcblx0XHRcdFx0d2hpbGUodHJhY2suc3RlcCA8PSBjdXJyZW50U3RlcCAmJiAhdHJhY2suZW5kICl7XHJcblx0XHRcdFx0XHRpZih0cmFjay5wb2ludGVyID49IHRyYWNrLmV2ZW50cy5sZW5ndGggKXtcclxuXHRcdFx0XHRcdFx0dHJhY2suZW5kID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR2YXIgZXZlbnQgPSB0cmFjay5ldmVudHNbdHJhY2sucG9pbnRlcisrXTtcclxuXHRcdFx0XHRcdFx0dmFyIHBsYXlUaW1lID0gdHJhY2suc3RlcCAqIHRoaXMuc3RlcFRpbWVfICsgdGhpcy5zdGFydFRpbWVfO1xyXG5cdFx0XHRcdFx0XHRldmVudC5wcm9jZXNzKHBsYXlUaW1lLHRyYWNrKTtcclxuXHRcdFx0XHRcdFx0dHJhY2suc3RlcCArPSBldmVudC5zdGVwO1xyXG4vL1x0XHRcdFx0XHRjb25zb2xlLmxvZyh0cmFjay5wb2ludGVyLHRyYWNrLmV2ZW50cy5sZW5ndGgsdHJhY2suZXZlbnRzW3RyYWNrLnBvaW50ZXJdLHRyYWNrLnN0ZXAsY3VycmVudFN0ZXAsdGhpcy5jdXJyZW50VGltZV8scGxheVRpbWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQrK2VuZGNvdW50O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihlbmRjb3VudCA9PSB0aGlzLnRyYWNrcy5sZW5ndGgpe1xyXG5cdFx0XHR0aGlzLnN0b3AoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g5o6l57aaXHJcblx0Y29ubmVjdChjKXtcclxuXHRcdHZhciB0cmFjayA9IGMuZnJvbS5wYXJhbS50cmFjaztcclxuXHRcdGlmKGMuZnJvbS5wYXJhbS50eXBlID09PSAncGl0Y2gnKXtcclxuXHRcdFx0dHJhY2sucGl0Y2hlcy5wdXNoKFNlcXVlbmNlci5tYWtlUHJvY2VzcyhjKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0cmFjay52ZWxvY2l0aWVzLnB1c2goU2VxdWVuY2VyLm1ha2VQcm9jZXNzKGMpKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g5YmK6ZmkXHJcblx0ZGlzY29ubmVjdChjKXtcclxuXHRcdHZhciB0cmFjayA9IGMuZnJvbS5wYXJhbS50cmFjaztcclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRyYWNrLnBpdGNoZXMubGVuZ3RoOysraSl7XHJcblx0XHRcdGlmKGMudG8ubm9kZSA9PT0gdHJhY2sucGl0Y2hlc1tpXS50by5ub2RlICYmIGMudG8ucGFyYW0gPT09IHRyYWNrLnBpdGNoZXNbaV0udG8ucGFyYW0pe1xyXG5cdFx0XHRcdHRyYWNrLnBpdGNoZXMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRyYWNrLnZlbG9jaXRpZXMubGVuZ3RoOysraSl7XHJcblx0XHRcdGlmKGMudG8ubm9kZSA9PT0gdHJhY2sudmVsb2NpdGllc1tpXS50by5ub2RlICYmIGMudG8ucGFyYW0gPT09IHRyYWNrLnZlbG9jaXRpZXNbaV0udG8ucGFyYW0pe1xyXG5cdFx0XHRcdHRyYWNrLnBpdGNoZXMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0c3RhdGljIG1ha2VQcm9jZXNzKGMpe1xyXG5cdFx0aWYoYy50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdHJldHVybiAge1xyXG5cdFx0XHRcdHRvOmMudG8sXHJcblx0XHRcdFx0cHJvY2VzczogKGNvbSx2LHQpPT57XHJcblx0XHRcdFx0XHRjLnRvLm5vZGUuYXVkaW9Ob2RlLnByb2Nlc3MoYy50byxjb20sdix0KTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHN0b3A6ZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdGMudG8ubm9kZS5hdWRpb05vZGUuc3RvcChjLnRvKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHR9IFxyXG5cdFx0dmFyIHByb2Nlc3M7XHJcblx0XHRpZihjLnRvLnBhcmFtLnR5cGUgPT09ICdwaXRjaCcpe1xyXG5cdFx0XHRwcm9jZXNzID0gKGNvbSx2LHQpID0+IHtcclxuXHRcdFx0XHRjb20ucHJvY2Vzc1BpdGNoKGMudG8ucGFyYW0uYXVkaW9QYXJhbSx2LHQpO1xyXG5cdFx0XHR9O1x0XHRcdFx0XHRcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHByb2Nlc3MgPVx0KGNvbSx2LHQpPT57XHJcblx0XHRcdFx0Y29tLnByb2Nlc3NWZWxvY2l0eShjLnRvLnBhcmFtLmF1ZGlvUGFyYW0sdix0KTtcclxuXHRcdFx0fTtcdFx0XHRcdFx0XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR0bzpjLnRvLFxyXG5cdFx0XHRwcm9jZXNzOnByb2Nlc3MsXHJcblx0XHRcdHN0b3A6ZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRjLnRvLnBhcmFtLmF1ZGlvUGFyYW0uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGV4ZWMoKVxyXG5cdHtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKFNlcXVlbmNlci5leGVjKTtcclxuXHRcdFx0bGV0IGVuZGNvdW50ID0gMDtcclxuXHRcdFx0Zm9yKHZhciBpID0gMCxlID0gU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoO2kgPCBlOysraSl7XHJcblx0XHRcdFx0dmFyIHNlcSA9IFNlcXVlbmNlci5zZXF1ZW5jZXJzW2ldO1xyXG5cdFx0XHRcdGlmKHNlcS5zdGF0dXNfID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdFx0XHRzZXEucHJvY2VzcyhhdWRpby5jdHguY3VycmVudFRpbWUpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihzZXEuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlNUT1BQRUQpe1xyXG5cdFx0XHRcdFx0KytlbmRjb3VudDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoZW5kY291bnQgPT0gU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0U2VxdWVuY2VyLnN0b3BTZXF1ZW5jZXMoKTtcclxuXHRcdFx0XHRpZihTZXF1ZW5jZXIuc3RvcHBlZCl7XHJcblx0XHRcdFx0XHRTZXF1ZW5jZXIuc3RvcHBlZCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDjgrfjg7zjgrHjg7PjgrnlhajkvZPjga7jgrnjgr/jg7zjg4hcclxuXHRzdGF0aWMgc3RhcnRTZXF1ZW5jZXModGltZSl7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5TVE9QUEVEIHx8IFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBBVVNFRCApXHJcblx0XHR7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5zdGFydCh0aW1lKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuUExBWUlORztcclxuXHRcdFx0U2VxdWVuY2VyLmV4ZWMoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0Ly8g44K344O844Kx44Oz44K55YWo5L2T44Gu5YGc5q2iXHJcblx0c3RhdGljIHN0b3BTZXF1ZW5jZXMoKXtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcgfHwgU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUEFVU0VEICl7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5zdG9wKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlNUT1BQRUQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyDjgrfjg7zjgrHjg7PjgrnlhajkvZPjga7jg53jg7zjgrpcdFxyXG5cdHN0YXRpYyBwYXVzZVNlcXVlbmNlcygpe1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5wYXVzZSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5QQVVTRUQ7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5TZXF1ZW5jZXIuc2VxdWVuY2VycyA9IFtdO1xyXG5TZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlNUT1BQRUQ7IFxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCBVVUlEIGZyb20gJy4vdXVpZC5jb3JlJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL0V2ZW50RW1pdHRlcjMnO1xyXG5leHBvcnQgY29uc3Qgbm9kZUhlaWdodCA9IDUwO1xyXG5leHBvcnQgY29uc3Qgbm9kZVdpZHRoID0gMTAwO1xyXG5leHBvcnQgY29uc3QgcG9pbnRTaXplID0gMTY7XHJcblxyXG4vLyBwYW5lbCB3aW5kb3dcclxuZXhwb3J0IGNsYXNzIFBhbmVsICBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3Ioc2VsLHByb3Ape1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdGlmKCFwcm9wIHx8ICFwcm9wLmlkKXtcclxuXHRcdFx0cHJvcCA9IHByb3AgPyAocHJvcC5pZCA9ICdpZC0nICsgVVVJRC5nZW5lcmF0ZSgpLHByb3ApIDp7IGlkOidpZC0nICsgVVVJRC5nZW5lcmF0ZSgpfTtcclxuXHRcdH1cclxuXHRcdHRoaXMuaWQgPSBwcm9wLmlkO1xyXG5cdFx0c2VsID0gc2VsIHx8IGQzLnNlbGVjdCgnI2NvbnRlbnQnKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uID0gXHJcblx0XHRzZWxcclxuXHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHQuYXR0cihwcm9wKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywncGFuZWwnKVxyXG5cdFx0LmRhdHVtKHRoaXMpO1xyXG5cclxuXHRcdC8vIOODkeODjeODq+eUqERyYWfjgZ3jga7ku5ZcclxuXHJcblx0XHR0aGlzLmhlYWRlciA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnaGVhZGVyJykuY2FsbCh0aGlzLmRyYWcpO1xyXG5cdFx0dGhpcy5hcnRpY2xlID0gdGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdhcnRpY2xlJyk7XHJcblx0XHR0aGlzLmZvb3RlciA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnZm9vdGVyJyk7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2RpdicpXHJcblx0XHQuY2xhc3NlZCgncGFuZWwtY2xvc2UnLHRydWUpXHJcblx0XHQub24oJ2NsaWNrJywoKT0+e1xyXG5cdFx0XHR0aGlzLmVtaXQoJ2Rpc3Bvc2UnKTtcclxuXHRcdFx0dGhpcy5kaXNwb3NlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0fVx0XHJcblxyXG5cdGdldCBub2RlKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc2VsZWN0aW9uLm5vZGUoKTtcclxuXHR9XHJcblx0Z2V0IHggKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnbGVmdCcpKTtcclxuXHR9XHJcblx0c2V0IHggKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2xlZnQnLHYgKyAncHgnKTtcclxuXHR9XHJcblx0Z2V0IHkgKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgndG9wJykpO1xyXG5cdH1cclxuXHRzZXQgeSAodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndG9wJyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCB3aWR0aCgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3dpZHRoJykpO1xyXG5cdH1cclxuXHRzZXQgd2lkdGgodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnd2lkdGgnLCB2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCBoZWlnaHQoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdoZWlnaHQnKSk7XHJcblx0fVxyXG5cdHNldCBoZWlnaHQodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnaGVpZ2h0Jyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdFxyXG5cdGRpc3Bvc2UoKXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlbW92ZSgpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRzaG93KCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScsJ3Zpc2libGUnKTtcclxuXHRcdHRoaXMuZW1pdCgnc2hvdycpO1xyXG5cdH1cclxuXHJcblx0aGlkZSgpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtcclxuXHRcdHRoaXMuZW1pdCgnaGlkZScpO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgaXNTaG93KCl7XHJcblx0XHRyZXR1cm4gdGhpcy5zZWxlY3Rpb24gJiYgdGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknKSA9PT0gJ3Zpc2libGUnO1xyXG5cdH1cclxufVxyXG5cclxuUGFuZWwucHJvdG90eXBlLmRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHRcdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdFx0Y29uc29sZS5sb2coZCk7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KCcjJyArIGQuaWQpO1xyXG5cdFx0XHJcblx0XHRkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHQuYXR0cih7aWQ6J3BhbmVsLWR1bW15LScgKyBkLmlkLFxyXG5cdFx0XHQnY2xhc3MnOidwYW5lbCBwYW5lbC1kdW1teSd9KVxyXG5cdFx0LnN0eWxlKHtcclxuXHRcdFx0bGVmdDpzZWwuc3R5bGUoJ2xlZnQnKSxcclxuXHRcdFx0dG9wOnNlbC5zdHlsZSgndG9wJyksXHJcblx0XHRcdHdpZHRoOnNlbC5zdHlsZSgnd2lkdGgnKSxcclxuXHRcdFx0aGVpZ2h0OnNlbC5zdHlsZSgnaGVpZ2h0JylcclxuXHRcdH0pO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIGR1bW15ID0gZDMuc2VsZWN0KCcjcGFuZWwtZHVtbXktJyArIGQuaWQpO1xyXG5cclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkdW1teS5zdHlsZSgnbGVmdCcpKSArIGQzLmV2ZW50LmR4O1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGR1bW15LnN0eWxlKCd0b3AnKSkgKyBkMy5ldmVudC5keTtcclxuXHRcdFxyXG5cdFx0ZHVtbXkuc3R5bGUoeydsZWZ0Jzp4ICsgJ3B4JywndG9wJzp5ICsgJ3B4J30pO1xyXG5cdH0pXHJcblx0Lm9uKCdkcmFnZW5kJyxmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QoJyMnICsgZC5pZCk7XHJcblx0XHR2YXIgZHVtbXkgPSBkMy5zZWxlY3QoJyNwYW5lbC1kdW1teS0nICsgZC5pZCk7XHJcblx0XHRzZWwuc3R5bGUoXHJcblx0XHRcdHsnbGVmdCc6ZHVtbXkuc3R5bGUoJ2xlZnQnKSwndG9wJzpkdW1teS5zdHlsZSgndG9wJyl9XHJcblx0XHQpO1xyXG5cdFx0ZC5lbWl0KCdkcmFnZW5kJyk7XHJcblx0XHRkdW1teS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHRcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vRXZlbnRFbWl0dGVyMyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVW5kb01hbmFnZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5idWZmZXIgPSBbXTtcclxuXHRcdHRoaXMuaW5kZXggPSAtMTtcclxuXHR9XHJcblx0XHJcblx0Y2xlYXIoKXtcclxuICAgIHRoaXMuYnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLmluZGV4ID0gLTE7XHJcbiAgICB0aGlzLmVtaXQoJ2NsZWFyZWQnKTtcclxuXHR9XHJcblx0XHJcblx0ZXhlYyhjb21tYW5kKXtcclxuICAgIGNvbW1hbmQuZXhlYygpO1xyXG4gICAgaWYgKCh0aGlzLmluZGV4ICsgMSkgPCB0aGlzLmJ1ZmZlci5sZW5ndGgpXHJcbiAgICB7XHJcbiAgICAgIHRoaXMuYnVmZmVyLmxlbmd0aCA9IHRoaXMuaW5kZXggKyAxO1xyXG4gICAgfVxyXG4gICAgdGhpcy5idWZmZXIucHVzaChjb21tYW5kKTtcclxuICAgICsrdGhpcy5pbmRleDtcclxuICAgIHRoaXMuZW1pdCgnZXhlY3V0ZWQnKTtcclxuXHR9XHJcblx0XHJcblx0cmVkbygpe1xyXG4gICAgaWYgKCh0aGlzLmluZGV4ICsgMSkgPCAodGhpcy5idWZmZXIubGVuZ3RoKSlcclxuICAgIHtcclxuICAgICAgKyt0aGlzLmluZGV4O1xyXG4gICAgICB2YXIgY29tbWFuZCA9IHRoaXMuYnVmZmVyW3RoaXMuaW5kZXhdO1xyXG4gICAgICBjb21tYW5kLnJlZG8oKTtcclxuICAgICAgdGhpcy5lbWl0KCdyZWRpZCcpO1xyXG4gICAgICBpZiAoKHRoaXMuaW5kZXggICsgMSkgPT0gdGhpcy5idWZmZXIubGVuZ3RoKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5lbWl0KCdyZWRvRW1wdHknKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cdH1cclxuICB1bmRvKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5idWZmZXIubGVuZ3RoID4gMCAmJiB0aGlzLmluZGV4ID49IDApXHJcbiAgICB7XHJcbiAgICAgIHZhciBjb21tYW5kID0gdGhpcy5idWZmZXJbdGhpcy5pbmRleF07XHJcbiAgICAgIGNvbW1hbmQudW5kbygpO1xyXG4gICAgICAtLXRoaXMuaW5kZXg7XHJcbiAgICAgIHRoaXMuZW1pdCgndW5kaWQnKTtcclxuICAgICAgaWYgKHRoaXMuaW5kZXggPCAwKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIHRoaXMuZW1pdCgndW5kb0VtcHR5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblx0XHJcbn1cclxuXHJcbnZhciB1bmRvTWFuYWdlciA9IG5ldyBVbmRvTWFuYWdlcigpO1xyXG5leHBvcnQgZGVmYXVsdCB1bmRvTWFuYWdlcjsiLCIvKlxuIFZlcnNpb246IGNvcmUtMS4wXG4gVGhlIE1JVCBMaWNlbnNlOiBDb3B5cmlnaHQgKGMpIDIwMTIgTGlvc0suXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVVVJRCgpe31VVUlELmdlbmVyYXRlPWZ1bmN0aW9uKCl7dmFyIGE9VVVJRC5fZ3JpLGI9VVVJRC5faGE7cmV0dXJuIGIoYSgzMiksOCkrXCItXCIrYihhKDE2KSw0KStcIi1cIitiKDE2Mzg0fGEoMTIpLDQpK1wiLVwiK2IoMzI3Njh8YSgxNCksNCkrXCItXCIrYihhKDQ4KSwxMil9O1VVSUQuX2dyaT1mdW5jdGlvbihhKXtyZXR1cm4gMD5hP05hTjozMD49YT8wfE1hdGgucmFuZG9tKCkqKDE8PGEpOjUzPj1hPygwfDEwNzM3NDE4MjQqTWF0aC5yYW5kb20oKSkrMTA3Mzc0MTgyNCooMHxNYXRoLnJhbmRvbSgpKigxPDxhLTMwKSk6TmFOfTtVVUlELl9oYT1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1hLnRvU3RyaW5nKDE2KSxkPWItYy5sZW5ndGgsZT1cIjBcIjswPGQ7ZD4+Pj0xLGUrPWUpZCYxJiYoYz1lK2MpO3JldHVybiBjfTtcbiJdfQ==
