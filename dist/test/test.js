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
  enter: { id: 1, name: 'ノートデータ挿入' },
  esc: { id: 2, name: 'キャンセル' },
  right: { id: 3, name: 'カーソル移動（右）' },
  left: { id: 4, name: 'カーソル移動（左）' },
  up: { id: 5, name: 'カーソル移動（上）' },
  down: { id: 6, name: 'カーソル移動（下）' },
  insertMeasure: { id: 7, name: '小節線挿入' },
  undo: { id: 8, name: 'アンドゥ' },
  redo: { id: 9, name: 'リドゥ' },
  pageUp: { id: 10, name: 'ページアップ' },
  pageDown: { id: 11, name: 'ページダウン' },
  home: { id: 12, name: '先頭行に移動' },
  end: { id: 13, name: '終端行に移動' },
  number: { id: 14, name: '数字入力' },
  note: { id: 15, name: 'ノート入力' },
  scrollUp: { id: 16, name: '高速スクロールアップ' },
  scrollDown: { id: 17, name: '高速スクロールダウン' },
  delete: { id: 18, name: '行削除' },
  linePaste: { id: 19, name: '行ペースト' }
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
  }, {
    keyCode: 65,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.redo
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
  89: [{
    keyCode: 89,
    ctrlKey: true,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    inputCommand: InputCommand.delete
  }],
  76: [{
    keyCode: 76,
    ctrlKey: true,
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
    sequencer.audioNode.bpm = parseFloat(d3.select(_this2).attr('value'));
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
    sequencer.audioNode.beat = parseFloat(d3.select(_this2).attr('value'));
  });

  div.append('span').text(' / ');
  div.append('input').datum(sequencer).attr({ 'type': 'text', 'size': '3', 'value': function (d) {
      return sequencer.audioNode.bar;
    } }).on('change', function (d) {
    sequencer.audioNode.bar = parseFloat(d3.select(_this2).attr('value'));
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
  let lineBuffer = null; //行バッファ
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
      switch (input.inputCommand.id) {
        case InputCommand.enter.id:
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
        case InputCommand.right.id:
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
        case InputCommand.number.id:
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
        case InputCommand.note.id:
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
        case InputCommand.left.id:
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
        case InputCommand.up.id:
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
        case InputCommand.down.id:
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
        case InputCommand.pageDown.id:
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
        case InputCommand.pageUp.id:
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
        case InputCommand.scrollUp.id:
          {
            if (currentEventIndex > 0) {
              --currentEventIndex;
              drawEvent();
              focusEvent();
            }
          }
          break;
        // スクロールダウン
        case InputCommand.scrollDown.id:
          {
            if (currentEventIndex + NUM_ROW <= track.events.length - 1) {
              ++currentEventIndex;
              drawEvent();
              focusEvent();
            }
          }
          break;
        // 先頭行に移動
        case InputCommand.home.id:
          if (currentEventIndex > 0) {
            rowIndex = 0;
            currentEventIndex = 0;
            drawEvent();
            focusEvent();
          }
          cancelEvent = true;
          break;
        // 最終行に移動
        case InputCommand.end.id:
          if (currentEventIndex != track.events.length - 1) {
            rowIndex = 0;
            currentEventIndex = track.events.length - 1;
            drawEvent();
            focusEvent();
          }
          cancelEvent = true;
          break;
        // 行削除
        case InputCommand.delete.id:
          {
            if (rowIndex + currentEventIndex == track.events.length - 1) {
              break;
            }
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
        // ラインバッファの内容をペーストする
        case InputCommand.linePaste.id:
          {
            if (lineBuffer) {
              seqEditor.undoManager.exec({
                exec() {
                  this.rowIndex = rowIndex;
                  this.lineBuffer = lineBuffer;
                  track.insertEvent(lineBuffer.clone(), rowIndex);
                  drawEvent();
                  focusEvent();
                },
                redo() {
                  track.insertEvent(this.lineBuffer.clone(), this.rowIndex);
                  drawEvent();
                  focusEvent();
                },
                undo() {
                  track.deleteEvent(this.rowIndex);
                  drawEvent();
                  focusEvent();
                }
              });
            }
            cancelEvent = true;
          }
          break;
        // redo  
        case InputCommand.redo.id:
          seqEditor.undoManager.redo();
          cancelEvent = true;
          break;
        // undo 
        case InputCommand.undo.id:
          seqEditor.undoManager.undo();
          cancelEvent = true;
          break;
        // 小節線挿入
        case InputCommand.insertMeasure.id:
          // *
          seqEditor.undoManager.exec({
            exec() {
              this.index = rowIndex + currentEventIndex;
              track.insertEvent(new audio.Measure(), this.index);
              drawEvent();
              focusEvent();
            },
            redo() {
              track.insertEvent(new audio.Measure(), this.index);
              drawEvent();
              focusEvent();
            },
            undo() {
              track.deleteEvent(this.index);
              drawEvent();
              focusEvent();
            }
          });
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

},{"./audio":2,"./ui":10,"./undo":11}],9:[function(require,module,exports){
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
		key: 'clone',
		value: function clone() {
			return new Measure();
		}
	}, {
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
		key: 'clone',
		value: function clone() {
			return new NoteEvent(this.step, this.note, this.gate, this.vel, this.command);
		}
	}, {
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
			let indexAfter = index + 1;
			let events = this.events;
			let stepTotal = 0;
			let event = events[index];
			// 挿入したメジャーのstepTotalを補正
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
				// 後続のメジャーのstepTotalを補正
				stepTotal = 0;
				if (indexAfter >= events.length - 1) {
					return;
				}
				if (events[indexAfter].type == EventType.Measure) {
					events[indexAfter].stepTotal = 0;
					return;
				}
				while (indexAfter < events.length - 1) {
					if (events[indexAfter].type != EventType.Measure) {
						stepTotal += events[indexAfter++].step;
					} else {
						events[indexAfter].stepTotal = stepTotal;
						break;
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

},{"./EventEmitter3":1,"./uuid.core":12}],11:[function(require,module,exports){
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

},{"./EventEmitter3":1}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
"use strict";

var _audio = require('../src/audio');

var audio = _interopRequireWildcard(_audio);

var _draw = require('../src/draw');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('AudioNodeTest', function () {

	audio.setCtx(new AudioContext());
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

		let out = audio.AudioNodeView.audioNodes[0];
		let osc = (0, _draw.createAudioNodeView)('Oscillator');
		osc.x = 400;
		osc.y = 300;
		let gain = (0, _draw.createAudioNodeView)('Gain');
		gain.x = 550;
		gain.y = 200;
		let seq = (0, _draw.createAudioNodeView)('Sequencer');
		seq.x = 50;
		seq.y = 300;
		let eg = (0, _draw.createAudioNodeView)('EG');
		eg.x = 200;
		eg.y = 200;

		// 接続

		audio.AudioNodeView.connect({ node: seq, param: seq.trk0g }, { node: eg, param: eg.gate });
		audio.AudioNodeView.connect({ node: seq, param: seq.trk0p }, { node: osc, param: osc.frequency });
		audio.AudioNodeView.connect({ node: osc, param: 0 }, { node: gain, param: 0 });
		audio.AudioNodeView.connect({ node: eg, param: eg.output }, { node: gain, param: gain.gain });
		audio.AudioNodeView.connect({ node: gain, param: 0 }, { node: out, param: 0 });

		// コネクション

		let out1 = audio.AudioNodeView.audioNodes[0];
		let osc1 = (0, _draw.createAudioNodeView)('Oscillator');
		osc1.x = 400;
		osc1.y = 500;
		let gain1 = (0, _draw.createAudioNodeView)('Gain');
		gain1.x = 550;
		gain1.y = 400;
		let eg1 = (0, _draw.createAudioNodeView)('EG');
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
		seq.audioNode.tracks[0].events.push(new audio.NoteEvent(48, 47, 6, 1.0));
		for (var i = 48; i < 110; ++i) {
			seq.audioNode.tracks[0].events.push(new audio.NoteEvent(48, i, 6, 1.0));
		}

		seq.audioNode.tracks[1].events.push(new audio.NoteEvent(192, 0, 6, 1.0));
		for (var i = 47; i < 110; ++i) {
			seq.audioNode.tracks[1].events.push(new audio.NoteEvent(48, i, 6, 1.0));
		}
		(0, _draw.draw)();
		expect(true).toBe(true);
	});
});

},{"../src/audio":2,"../src/draw":4}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXEV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGF1ZGlvLmpzIiwic3JjXFxhdWRpb05vZGVWaWV3LmpzIiwic3JjXFxkcmF3LmpzIiwic3JjXFxlZy5qcyIsInNyY1xcZXZlbnRFbWl0dGVyMy5qcyIsInNyY1xccHJvcC5qcyIsInNyY1xcc2VxdWVuY2VFZGl0b3IuanMiLCJzcmNcXHNlcXVlbmNlci5qcyIsInNyY1xcdWkuanMiLCJzcmNcXHVuZG8uanMiLCJzcmNcXHV1aWQuY29yZS5qcyIsInRlc3RcXGF1ZGlvTm9kZVRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7OztBQUFZLENBQUM7Ozs7a0JBaUNXLFlBQVk7QUF2QnBDLElBQUksTUFBTSxHQUFHLE9BQU8sTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVLEdBQUcsR0FBRyxHQUFHLEtBQUs7Ozs7Ozs7Ozs7QUFBQyxBQVUvRCxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtBQUM3QixNQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNiLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQztDQUMzQjs7Ozs7Ozs7O0FBQUEsQUFTYyxTQUFTLFlBQVksR0FBRzs7Ozs7Ozs7QUFBd0IsQUFRL0QsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUzs7Ozs7Ozs7OztBQUFDLEFBVTNDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDbkUsTUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSztNQUNyQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVsRCxNQUFJLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDL0IsTUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUMxQixNQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFeEMsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkUsTUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDekI7O0FBRUQsU0FBTyxFQUFFLENBQUM7Q0FDWDs7Ozs7Ozs7O0FBQUMsQUFTRixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtBQUNyRSxNQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEtBQUssQ0FBQzs7QUFFdEQsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7TUFDN0IsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNO01BQ3RCLElBQUk7TUFDSixDQUFDLENBQUM7O0FBRU4sTUFBSSxVQUFVLEtBQUssT0FBTyxTQUFTLENBQUMsRUFBRSxFQUFFO0FBQ3RDLFFBQUksU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFOUUsWUFBUSxHQUFHO0FBQ1QsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzlELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDbEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDdEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsS0FDL0U7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7QUFFRCxhQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07QUFDTCxRQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0FBRU4sU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsVUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVwRixjQUFRLEdBQUc7QUFDVCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzFELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzlELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUNsRTtBQUNFLGNBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcs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R0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDakMsS0FBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztHQUN2RDs7QUFFRCxHQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNwQixHQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsTUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkMsR0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUN2QixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQ1IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNkLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxDQUFDLENBQUM7RUFDM0MsQ0FBQyxDQUNELEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDeEIsR0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUNwQixHQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQ3BCLEdBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDcEQsQ0FBQyxDQUNELEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLEVBQUU7QUFDM0IsTUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNuQixNQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsRUFBRTs7O0FBQUMsQUFHbkIsTUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsT0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxFQUFFLENBQUMsRUFBQztBQUN6QyxPQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsT0FBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3pCLE9BQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQzdCLE9BQUksSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7T0FDMUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7T0FDdkMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSztPQUNyRCxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFD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QUFDO0FBQ2YsT0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssWUFBWSxLQUFLLENBQUMsU0FBUyxFQUFDO0FBQzFDLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDNUQsTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM1RCxNQUFNO0FBQ04sTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLE1BQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQzFGO0dBQ0QsTUFBTTtBQUNOLEtBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUMzQyxLQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUks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LFlBQVEsR0FBRztBQUNULFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUM5RCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ2xFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ3RFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEtBQy9FOztBQUVELFNBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbEQsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUI7O0FBRUQsYUFBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztHQUM3QyxNQUFNO0FBQ0wsUUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU07UUFDekIsQ0FBQyxDQUFDOztBQUVOLFNBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNCLFVBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFcEYsY0FBUSxHQUFHO0FBQ1QsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUMxRCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUM5RCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDbEU7QUFDRSxjQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDN0QsZ0JBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQzVCOztBQUVELG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQUEsT0FDckQ7S0FDRjtHQUNGOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7Ozs7Ozs7QUFBQyxBQVVGLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0FBQzFELE1BQUksUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDO01BQ3RDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BFLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQ2hEO0FBQ0gsUUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLENBQzVCLENBQUM7R0FDSDs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiOzs7Ozs7Ozs7O0FBQUMsQUFVRixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRTtBQUM5RCxNQUFJLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLElBQUksRUFBRSxJQUFJLENBQUM7TUFDNUMsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7QUFFMUMsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEUsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsS0FDaEQ7QUFDSCxRQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FDNUIsQ0FBQztHQUNIOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7Ozs7Ozs7OztBQUFDLEFBWUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsU0FBUyxjQUFjLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO0FBQ3hGLE1BQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7QUFFMUMsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sSUFBSSxDQUFDOztBQUVyRCxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztNQUM3QixNQUFNLEdBQUcsRUFBRSxDQUFDOztBQUVoQixNQUFJLEVBQUUsRUFBRTtBQUNOLFFBQUksU0FBUyxDQUFDLEVBQUUsRUFBRTtBQUNoQixVQUNLLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUNsQixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxBQUFDLElBQ3hCLE9BQU8sSUFBSSxTQUFTLENBQUMsT0FBTyxLQUFLLE9BQU8sQUFBQyxFQUM3QztBQUNBLGNBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDeEI7S0FDRixNQUFNO0FBQ0wsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMxRCxZQUNLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUNyQixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxBQUFDLElBQzNCLE9BQU8sSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLE9BQU8sQUFBQyxFQUNoRDtBQUNBLGdCQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNCO09BQ0Y7S0FDRjtHQUNGOzs7OztBQUFBLEFBS0QsTUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ2pCLFFBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztHQUM5RCxNQUFNO0FBQ0wsV0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQzFCOztBQUVELFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7Ozs7O0FBQUMsQUFRRixZQUFZLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHLFNBQVMsa0JBQWtCLENBQUMsS0FBSyxFQUFFO0FBQzdFLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sSUFBSSxDQUFDOztBQUUvQixNQUFJLEtBQUssRUFBRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsS0FDM0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXRELFNBQU8sSUFBSSxDQUFDO0NBQ2I7Ozs7O0FBQUMsQUFLRixZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztBQUNuRSxZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUU7Ozs7O0FBQUMsQUFLL0QsWUFBWSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsU0FBUyxlQUFlLEdBQUc7QUFDbEUsU0FBTyxJQUFJLENBQUM7Q0FDYjs7Ozs7QUFBQyxBQUtGLFlBQVksQ0FBQyxRQUFRLEdBQUcsTUFBTTs7Ozs7QUFBQyxBQUsvQixJQUFJLFdBQVcsS0FBSyxPQUFPLE1BQU0sRUFBRTtBQUNqQyxRQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztDQUMvQjs7O0FDdFFELFlBQVksQ0FBQzs7Ozs7UUFFRyxhQUFhLEdBQWIsYUFBYTtBQUF0QixTQUFTLGFBQWEsQ0FBQyxNQUFNLEVBQUMsUUFBUSxFQUM3QztLQUQ4QyxHQUFHLHlEQUFHLEVBQUU7O0FBRXJELEVBQUMsWUFBSTtBQUNKLE1BQUksRUFBRSxDQUFDO0FBQ1AsS0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQztBQUN4QyxLQUFHLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxZQUFZLElBQUksS0FBSyxDQUFDO0FBQzdDLEtBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSztVQUFNLEVBQUU7R0FBQSxBQUFDLENBQUM7QUFDaEMsS0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFLLFVBQUMsQ0FBQyxFQUFHO0FBQzFCLE9BQUcsRUFBRSxJQUFJLENBQUMsRUFBQztBQUNWLFVBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsRUFBQyxDQUFDLENBQUMsQ0FBQztJQUNyQztBQUNELEtBQUUsR0FBRyxDQUFDLENBQUM7R0FDUCxBQUFDLENBQUM7QUFDSCxRQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsR0FBRyxDQUFDLENBQUM7RUFDM0MsQ0FBQSxFQUFHLENBQUM7Q0FDTDs7O0FDakJELFlBQVksQ0FBQzs7Ozs7O1FBMGlDRyxrQkFBa0IsR0FBbEIsa0JBQWtCOzs7O0lBemlDdEIsS0FBSzs7OztJQUNMLEVBQUU7Ozs7Ozs7O0FBSWQsTUFBTSxTQUFTLEdBQUc7QUFDaEIsU0FBTyxFQUFFLENBQUM7QUFDVixNQUFJLEVBQUUsQ0FBQztDQUNSLENBQUE7O0FBRUQsTUFBTSxZQUFZLEdBQ2hCO0FBQ0UsT0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO0FBQ2xDLEtBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUM3QixPQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7QUFDbkMsTUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFO0FBQ2xDLElBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRTtBQUNoQyxNQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUU7QUFDbEMsZUFBYSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3ZDLE1BQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUM3QixNQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDNUIsUUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0FBQ2xDLFVBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtBQUNwQyxNQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDaEMsS0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0FBQy9CLFFBQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUNoQyxNQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDL0IsVUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFO0FBQ3hDLFlBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRTtBQUMxQyxRQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDL0IsV0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0NBQ3JDOzs7QUFBQSxBQUdILE1BQU0sT0FBTyxHQUNYO0FBQ0UsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsS0FBSztHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsR0FBRztHQUMvQixDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsS0FBSztHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsS0FBSztHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxF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QUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUMsTUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckQsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsU0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEMsTUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUM7V0FBSyxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQSxBQUFDLEdBQUcsU0FBUztHQUFBLENBQUM7Ozs7QUFBQyxBQUkvRixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFD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QyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLE9BQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBQztBQUNoQyxTQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsTUFBTTtBQUNOLFNBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRDtHQUNEOzs7Ozs7NkJBR1UsQ0FBQyxFQUFDO0FBQ1osT0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLFFBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBQyxFQUFFLENBQUMsRUFBQztBQUMxQyxRQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUM7QUFDckYsVUFBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsV0FBTTtLQUNOO0lBQ0Q7O0FBRUQsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQzdDLFFBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENB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LEVBQUUsSUFBSSxDQUFDLFFBQVEsR0FBQyxZQUFVO0FBQUMsTUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLElBQUk7TUFBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQTtDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQU8sQ0FBQyxHQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsRUFBRSxJQUFFLENBQUMsR0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFFLENBQUMsSUFBRSxDQUFDLENBQUEsQUFBQyxHQUFDLEVBQUUsSUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsVUFBVSxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQSxHQUFFLFVBQVUsSUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFFLENBQUMsSUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFBLEFBQUMsQ0FBQSxBQUFDLEdBQUMsR0FBRyxDQUFBO0NBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLE9BQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxHQUFD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LEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQzs7QUFFNUMsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFDLEtBQUssRUFBQyxFQUFFLENBQUMsTUFBTSxFQUFDLEVBQUMsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUM3RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFDLElBQUksRUFBQyxHQUFHLEVBQUMsS0FBSyxFQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUMsRUFBQyxFQUFDLElBQUksRUFBQyxFQUFFLEVBQUMsS0FBSyxFQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDOztB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LENBQUMsRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsS0FBSyxFQUFDLEVBQUMsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztBQUN6RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztBQUN0RSxPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFDLElBQUksRUFBQyxHQUFHLEVBQUMsS0FBSyxFQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUMsRUFBQyxFQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQ3ZGLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLEVBQUMsRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsQ0FBQzs7O0FBQUMsQUFJckUsS0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLEtBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEUsT0FBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUMsQ0FBQyxHQUFFLEdBQUcsRUFBQyxFQUFFLENBQUMsRUFBQztBQUN6QixNQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQ3JFOztBQUVELEtBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEUsT0FBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUMsQ0FBQyxHQUFFLEdBQUcsRUFBQyxFQUFFLENBQUMsRUFBQztBQUN6QixNQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQ3JFO0FBQ0QsWUE5TGEsSUFBSSxHQThMWCxDQUFDO0FBQ1AsUUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUN4QixDQUFDLENBQUM7Q0FLSCxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vL1xuLy8gV2Ugc3RvcmUgb3VyIEVFIG9iamVjdHMgaW4gYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3Jcbi8vIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxuLy9cbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICAgLCBqO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIGxpc3RlbmVycyBtYXRjaGluZyB0aGlzIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGV2ZW50cyA9IFtdO1xuXG4gIGlmIChmbikge1xuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICAgIGlmIChcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXG4gICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVycy5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgKSB7XG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXG4gICAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICAgICkge1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gIC8vXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcblxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XG4gIGVsc2UgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuZXhwb3J0ICogZnJvbSAnLi9hdWRpb05vZGVWaWV3JztcclxuZXhwb3J0ICogZnJvbSAnLi9lZyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vc2VxdWVuY2VyJztcclxuZXhwb3J0IGZ1bmN0aW9uIGR1bW15KCl7fTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIHVpIGZyb20gJy4vdWknO1xyXG5cclxudmFyIGNvdW50ZXIgPSAwO1xyXG5leHBvcnQgdmFyIGN0eDtcclxuZXhwb3J0IGZ1bmN0aW9uIHNldEN0eChjKXtjdHggPSBjO31cclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHggPSAwLCB5ID0gMCx3aWR0aCA9IHVpLm5vZGVXaWR0aCxoZWlnaHQgPSB1aS5ub2RlSGVpZ2h0LG5hbWUgPSAnJykge1xyXG5cdFx0dGhpcy54ID0geCA7XHJcblx0XHR0aGlzLnkgPSB5IDtcclxuXHRcdHRoaXMud2lkdGggPSB3aWR0aCA7XHJcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodCA7XHJcblx0XHR0aGlzLm5hbWUgPSBuYW1lO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFNUQVRVU19QTEFZX05PVF9QTEFZRUQgPSAwO1xyXG5leHBvcnQgY29uc3QgU1RBVFVTX1BMQVlfUExBWUlORyA9IDE7XHJcbmV4cG9ydCBjb25zdCBTVEFUVVNfUExBWV9QTEFZRUQgPSAyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZklzTm90QVBJT2JqKHRoaXNfLHYpe1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzXywnaXNOb3RBUElPYmonLHtcclxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRcdHdyaXRhYmxlOmZhbHNlLFxyXG5cdFx0XHR2YWx1ZTogdlxyXG5cdFx0fSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBdWRpb1BhcmFtVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoQXVkaW9Ob2RlVmlldyxuYW1lLCBwYXJhbSkge1xyXG5cdFx0c3VwZXIoMCwwLHVpLnBvaW50U2l6ZSx1aS5wb2ludFNpemUsbmFtZSk7XHJcblx0XHR0aGlzLmlkID0gY291bnRlcisrO1xyXG5cdFx0dGhpcy5hdWRpb1BhcmFtID0gcGFyYW07XHJcblx0XHR0aGlzLkF1ZGlvTm9kZVZpZXcgPSBBdWRpb05vZGVWaWV3O1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBhcmFtVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoQXVkaW9Ob2RlVmlldyxuYW1lLGlzb3V0cHV0KSB7XHJcblx0XHRzdXBlcigwLDAsdWkucG9pbnRTaXplLHVpLnBvaW50U2l6ZSxuYW1lKTtcclxuXHRcdHRoaXMuaWQgPSBjb3VudGVyKys7XHJcblx0XHR0aGlzLkF1ZGlvTm9kZVZpZXcgPSBBdWRpb05vZGVWaWV3O1xyXG5cdFx0dGhpcy5pc091dHB1dCA9IGlzb3V0cHV0IHx8IGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEF1ZGlvTm9kZVZpZXcgZXh0ZW5kcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKGF1ZGlvTm9kZSxlZGl0b3IpXHJcblx0e1xyXG5cdFx0Ly8gYXVkaW9Ob2RlIOOBr+ODmeODvOOCueOBqOOBquOCi+ODjuODvOODiVxyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuaWQgPSBjb3VudGVyKys7XHJcblx0XHR0aGlzLmF1ZGlvTm9kZSA9IGF1ZGlvTm9kZTtcclxuXHRcdHRoaXMubmFtZSA9IGF1ZGlvTm9kZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9mdW5jdGlvblxccyguKilcXCgvKVsxXTtcclxuXHRcdHRoaXMuaW5wdXRQYXJhbXMgPSBbXTtcclxuXHRcdHRoaXMub3V0cHV0UGFyYW1zID0gW107XHJcblx0XHR0aGlzLnBhcmFtcyA9IFtdO1xyXG5cdFx0bGV0IGlucHV0Q3kgPSAxLG91dHB1dEN5ID0gMTtcclxuXHRcdFxyXG5cdFx0dGhpcy5yZW1vdmFibGUgPSB0cnVlO1xyXG5cdFx0XHJcblx0XHQvLyDjg5fjg63jg5Hjg4bjgqPjg7vjg6Hjgr3jg4Pjg4njga7opIfoo71cclxuXHRcdGZvciAodmFyIGkgaW4gYXVkaW9Ob2RlKSB7XHJcblx0XHRcdGlmICh0eXBlb2YgYXVkaW9Ob2RlW2ldID09PSAnZnVuY3Rpb24nKSB7XHJcbi8vXHRcdFx0XHR0aGlzW2ldID0gYXVkaW9Ob2RlW2ldLmJpbmQoYXVkaW9Ob2RlKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpZiAodHlwZW9mIGF1ZGlvTm9kZVtpXSA9PT0gJ29iamVjdCcpIHtcclxuXHRcdFx0XHRcdGlmIChhdWRpb05vZGVbaV0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtKSB7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0gPSBuZXcgQXVkaW9QYXJhbVZpZXcodGhpcyxpLCBhdWRpb05vZGVbaV0pO1xyXG5cdFx0XHRcdFx0XHR0aGlzLmlucHV0UGFyYW1zLnB1c2godGhpc1tpXSk7XHJcblx0XHRcdFx0XHRcdHRoaXMucGFyYW1zLnB1c2goKChwKT0+e1xyXG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRcdFx0XHRuYW1lOmksXHJcblx0XHRcdFx0XHRcdFx0XHQnZ2V0JzooKSA9PiBwLmF1ZGlvUGFyYW0udmFsdWUsXHJcblx0XHRcdFx0XHRcdFx0XHQnc2V0JzoodikgPT57cC5hdWRpb1BhcmFtLnZhbHVlID0gdjt9LFxyXG5cdFx0XHRcdFx0XHRcdFx0cGFyYW06cCxcclxuXHRcdFx0XHRcdFx0XHRcdG5vZGU6dGhpc1xyXG5cdFx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0fSkodGhpc1tpXSkpO1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldLnkgPSAoMjAgKiBpbnB1dEN5KyspO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmKGF1ZGlvTm9kZVtpXSBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0XHRcdGF1ZGlvTm9kZVtpXS5BdWRpb05vZGVWaWV3ID0gdGhpcztcclxuXHRcdFx0XHRcdFx0dGhpc1tpXSA9IGF1ZGlvTm9kZVtpXTtcclxuXHRcdFx0XHRcdFx0aWYodGhpc1tpXS5pc091dHB1dCl7XHJcblx0XHRcdFx0XHRcdFx0dGhpc1tpXS55ID0gKDIwICogb3V0cHV0Q3krKyk7XHJcblx0XHRcdFx0XHRcdFx0dGhpc1tpXS54ID0gdGhpcy53aWR0aDtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLm91dHB1dFBhcmFtcy5wdXNoKHRoaXNbaV0pO1xyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0ueSA9ICgyMCAqIGlucHV0Q3krKyk7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5pbnB1dFBhcmFtcy5wdXNoKHRoaXNbaV0pO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldID0gYXVkaW9Ob2RlW2ldO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoQXVkaW9Ob2RlLnByb3RvdHlwZSwgaSk7XHRcclxuXHRcdFx0XHRcdGlmKCFkZXNjKXtcclxuXHRcdFx0XHRcdFx0ZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGhpcy5hdWRpb05vZGUuX19wcm90b19fLCBpKTtcdFxyXG5cdFx0XHRcdFx0fSBcclxuXHRcdFx0XHRcdGlmKCFkZXNjKXtcclxuXHRcdFx0XHRcdFx0ZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGhpcy5hdWRpb05vZGUsaSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR2YXIgcHJvcHMgPSB7fTtcclxuXHJcbi8vXHRcdFx0XHRcdGlmKGRlc2MuZ2V0KXtcclxuXHRcdFx0XHRcdFx0XHRwcm9wcy5nZXQgPSAoKGkpID0+IHRoaXMuYXVkaW9Ob2RlW2ldKS5iaW5kKG51bGwsIGkpO1xyXG4vL1x0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKGRlc2Mud3JpdGFibGUgfHwgZGVzYy5zZXQpe1xyXG5cdFx0XHRcdFx0XHRwcm9wcy5zZXQgPSAoKGksIHYpID0+IHsgdGhpcy5hdWRpb05vZGVbaV0gPSB2OyB9KS5iaW5kKG51bGwsIGkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRwcm9wcy5lbnVtZXJhYmxlID0gZGVzYy5lbnVtZXJhYmxlO1xyXG5cdFx0XHRcdFx0cHJvcHMuY29uZmlndXJhYmxlID0gZGVzYy5jb25maWd1cmFibGU7XHJcblx0XHRcdFx0XHQvL3Byb3BzLndyaXRhYmxlID0gZmFsc2U7XHJcblx0XHRcdFx0XHQvL3Byb3BzLndyaXRhYmxlID0gZGVzYy53cml0YWJsZTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGkscHJvcHMpO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRwcm9wcy5uYW1lID0gaTtcclxuXHRcdFx0XHRcdHByb3BzLm5vZGUgPSB0aGlzO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZihkZXNjLmVudW1lcmFibGUgJiYgIWkubWF0Y2goLyguKl8kKXwobmFtZSl8KF5udW1iZXJPZi4qJCkvaSkgJiYgKHR5cGVvZiBhdWRpb05vZGVbaV0pICE9PSAnQXJyYXknKXtcclxuXHRcdFx0XHRcdFx0dGhpcy5wYXJhbXMucHVzaChwcm9wcyk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5pbnB1dFN0YXJ0WSA9IGlucHV0Q3kgKiAyMDtcclxuXHRcdHZhciBpbnB1dEhlaWdodCA9IChpbnB1dEN5ICsgdGhpcy5udW1iZXJPZklucHV0cykgKiAyMCA7XHJcblx0XHR2YXIgb3V0cHV0SGVpZ2h0ID0gKG91dHB1dEN5ICsgdGhpcy5udW1iZXJPZk91dHB1dHMpICogMjA7XHJcblx0XHR0aGlzLm91dHB1dFN0YXJ0WSA9IG91dHB1dEN5ICogMjA7XHJcblx0XHR0aGlzLmhlaWdodCA9IE1hdGgubWF4KHRoaXMuaGVpZ2h0LGlucHV0SGVpZ2h0LG91dHB1dEhlaWdodCk7XHJcblx0XHR0aGlzLnRlbXAgPSB7fTtcclxuXHRcdHRoaXMuc3RhdHVzUGxheSA9IFNUQVRVU19QTEFZX05PVF9QTEFZRUQ7Ly8gbm90IHBsYXllZC5cclxuXHRcdHRoaXMucGFuZWwgPSBudWxsO1xyXG5cdFx0dGhpcy5lZGl0b3IgPSBlZGl0b3IuYmluZCh0aGlzLHRoaXMpO1xyXG5cdH1cclxuXHRcclxuXHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRzdGF0aWMgcmVtb3ZlKG5vZGUpIHtcclxuXHRcdFx0aWYoIW5vZGUucmVtb3ZhYmxlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCfliYrpmaTjgafjgY3jgarjgYTjg47jg7zjg4njgafjgZnjgIInKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRpZiAoQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzW2ldID09PSBub2RlKSB7XHJcblx0XHRcdFx0XHRpZihub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKXtcclxuXHRcdFx0XHRcdFx0bm9kZS5hdWRpb05vZGUuZGlzcG9zZSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLnNwbGljZShpLS0sIDEpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0XHRpZiAobi5mcm9tLm5vZGUgPT09IG5vZGUgfHwgbi50by5ub2RlID09PSBub2RlKSB7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3RfKG4pO1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG5cclxuICAvLyBcclxuXHRzdGF0aWMgZGlzY29ubmVjdF8oY29uKSB7XHJcblx0XHRpZiAoY29uLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpIHtcclxuXHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24pO1xyXG5cdFx0fSBlbHNlIGlmIChjb24udG8ucGFyYW0pIHtcclxuXHRcdFx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0aWYgKGNvbi50by5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KSB7XHJcblx0XHRcdFx0Ly8gQVVkaW9QYXJhbVxyXG5cdFx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSkge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ucGFyYW0uYXVkaW9QYXJhbSwgY29uLmZyb20ucGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5wYXJhbS5hdWRpb1BhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gY29uLnRvLnBhcmFt44GM5pWw5a2XXHJcblx0XHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtKSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0XHRpZiAoY29uLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpIHtcclxuXHRcdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSwgY29uLmZyb20ucGFyYW0sIGNvbi50by5wYXJhbSk7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSwgMCwgY29uLnRvLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHRvIOODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRpZiAoY29uLmZyb20ucGFyYW0pIHtcclxuXHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsIGNvbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOOCs+ODjeOCr+OCt+ODp+ODs+OBruaOpee2muOCkuino+mZpOOBmeOCi1xyXG5cdHN0YXRpYyBkaXNjb25uZWN0KGZyb21fLHRvXykge1xyXG5cdFx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV99O1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIFBhcmFtVmlldyApe1xyXG5cdFx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8uQXVkaW9Ob2RlVmlldyxwYXJhbTpmcm9tX307XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdHRvXyA9IHtub2RlOnRvX307XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY29uID0geydmcm9tJzpmcm9tXywndG8nOnRvX307XHJcblx0XHRcdFxyXG5cdFx0XHQvLyDjgrPjg43jgq/jgrfjg6fjg7Pjga7liYrpmaRcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0XHRpZihjb24uZnJvbS5ub2RlID09PSBuLmZyb20ubm9kZSAmJiBjb24uZnJvbS5wYXJhbSA9PT0gbi5mcm9tLnBhcmFtIFxyXG5cdFx0XHRcdFx0JiYgY29uLnRvLm5vZGUgPT09IG4udG8ubm9kZSAmJiBjb24udG8ucGFyYW0gPT09IG4udG8ucGFyYW0pe1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3RfKGNvbik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBjcmVhdGUoYXVkaW9ub2RlLGVkaXRvciA9ICgpPT57fSkge1xyXG5cdFx0dmFyIG9iaiA9IG5ldyBBdWRpb05vZGVWaWV3KGF1ZGlvbm9kZSxlZGl0b3IpO1xyXG5cdFx0QXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLnB1c2gob2JqKTtcclxuXHRcdHJldHVybiBvYmo7XHJcblx0fVxyXG5cdFxyXG4gIC8vIOODjuODvOODiemWk+OBruaOpee2mlxyXG5cdHN0YXRpYyBjb25uZWN0KGZyb21fLCB0b18pIHtcclxuXHRcdGlmKGZyb21fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyApe1xyXG5cdFx0XHRmcm9tXyA9IHtub2RlOmZyb21fLHBhcmFtOjB9O1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGZyb21fIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tXy5BdWRpb05vZGVWaWV3LHBhcmFtOmZyb21ffTtcclxuXHRcdH1cclxuXHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHR0b18gPSB7bm9kZTp0b18scGFyYW06MH07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYodG9fIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffTtcclxuXHRcdH1cclxuXHRcdC8vIOWtmOWcqOODgeOCp+ODg+OCr1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcblx0XHRcdHZhciBjID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRpZiAoYy5mcm9tLm5vZGUgPT09IGZyb21fLm5vZGUgXHJcblx0XHRcdFx0JiYgYy5mcm9tLnBhcmFtID09PSBmcm9tXy5wYXJhbVxyXG5cdFx0XHRcdCYmIGMudG8ubm9kZSA9PT0gdG9fLm5vZGVcclxuXHRcdFx0XHQmJiBjLnRvLnBhcmFtID09PSB0b18ucGFyYW1cclxuXHRcdFx0XHQpIFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuLy9cdFx0XHRcdHRocm93IChuZXcgRXJyb3IoJ+aOpee2muOBjOmHjeikh+OBl+OBpuOBhOOBvuOBmeOAgicpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyDmjqXntprlhYjjgYxQYXJhbVZpZXfjga7loLTlkIjjga/mjqXntprlhYPjga9QYXJhbVZpZXfjga7jgb9cclxuXHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyAmJiAhKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KSl7XHJcblx0XHQgIHJldHVybiA7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFBhcmFtVmlld+OBjOaOpee2muWPr+iDveOBquOBruOBr0F1ZGlvUGFyYW3jgYvjgolQYXJhbVZpZXfjga7jgb9cclxuXHRcdGlmKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0aWYoISh0b18ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcgfHwgdG9fLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpKXtcclxuXHRcdFx0XHRyZXR1cm47XHRcclxuXHRcdFx0fVxyXG5cdFx0fSBcclxuXHRcdFxyXG5cdFx0aWYgKGZyb21fLnBhcmFtKSB7XHJcblx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdCAgaWYoZnJvbV8ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdCAgZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh7J2Zyb20nOmZyb21fLCd0byc6dG9ffSk7XHJcbi8vXHRcdFx0XHRmcm9tXy5ub2RlLmNvbm5lY3RQYXJhbShmcm9tXy5wYXJhbSx0b18pO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHRvXy5wYXJhbSkgXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdC8vIEF1ZGlvUGFyYW3jga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLnBhcmFtLmF1ZGlvUGFyYW0sZnJvbV8ucGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyDmlbDlrZfjga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLCBmcm9tXy5wYXJhbSx0b18ucGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLGZyb21fLnBhcmFtKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRpZiAodG9fLnBhcmFtKSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRpZih0b18ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0XHQvLyBBdWRpb1BhcmFt44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5wYXJhbS5hdWRpb1BhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2V7XHJcblx0XHRcdFx0XHQvLyDmlbDlrZfjga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLDAsdG9fLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly90aHJvdyBuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gRXJyb3InKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnB1c2hcclxuXHRcdCh7XHJcblx0XHRcdCdmcm9tJzogZnJvbV8sXHJcblx0XHRcdCd0byc6IHRvX1xyXG5cdFx0fSk7XHJcblx0fVxyXG59XHJcblxyXG5cclxuQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzID0gW107XHJcbkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucyA9IFtdO1xyXG5cclxuXHJcbiIsImltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpLmpzJztcclxuaW1wb3J0IHtzaG93U2VxdWVuY2VFZGl0b3J9IGZyb20gJy4vc2VxdWVuY2VFZGl0b3InO1xyXG5cclxuZXhwb3J0IHZhciBzdmc7XHJcbi8vYWFcclxudmFyIG5vZGVHcm91cCwgbGluZUdyb3VwO1xyXG52YXIgZHJhZztcclxudmFyIGRyYWdPdXQ7XHJcbnZhciBkcmFnUGFyYW07XHJcbnZhciBkcmFnUGFuZWw7XHJcblxyXG52YXIgbW91c2VDbGlja05vZGU7XHJcbnZhciBtb3VzZU92ZXJOb2RlO1xyXG52YXIgbGluZTtcclxudmFyIGF1ZGlvTm9kZUNyZWF0b3JzID0gW107XHJcblxyXG4vLyBEcmF344Gu5Yid5pyf5YyWXHJcbmV4cG9ydCBmdW5jdGlvbiBpbml0VUkoKXtcclxuXHQvLyDlh7rlipvjg47jg7zjg4njga7kvZzmiJDvvIjliYrpmaTkuI3lj6/vvIlcclxuXHR2YXIgb3V0ID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmRlc3RpbmF0aW9uLHNob3dQYW5lbCk7XHJcblx0b3V0LnggPSB3aW5kb3cuaW5uZXJXaWR0aCAvIDI7XHJcblx0b3V0LnkgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xyXG5cdG91dC5yZW1vdmFibGUgPSBmYWxzZTtcclxuXHRcclxuXHQvLyDjg5fjg6zjgqTjg6Tjg7xcclxuXHRhdWRpby5TZXF1ZW5jZXIuYWRkZWQgPSAoKT0+XHJcblx0e1xyXG5cdFx0aWYoYXVkaW8uU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoID09IDEgJiYgYXVkaW8uU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09PSBhdWRpby5TRVFfU1RBVFVTLlNUT1BQRUQpe1xyXG5cdFx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdFx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0YXVkaW8uU2VxdWVuY2VyLmVtcHR5ID0gKCk9PntcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5zdG9wU2VxdWVuY2VzKCk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdH0gXHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjcGxheScpXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oKVxyXG5cdHtcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5zdGFydFNlcXVlbmNlcyhhdWRpby5jdHguY3VycmVudFRpbWUpO1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9KTtcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNwYXVzZScpLm9uKCdjbGljaycsZnVuY3Rpb24oKXtcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5wYXVzZVNlcXVlbmNlcygpO1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3N0b3AnKS5vbignY2xpY2snLGZ1bmN0aW9uKCl7XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIuc3RvcFNlcXVlbmNlcygpO1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9KTtcclxuXHRcclxuXHRhdWRpby5TZXF1ZW5jZXIuc3RvcHBlZCA9ICgpPT57XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH1cclxuXHRcclxuXHRcclxuXHQvLyBBdWRpb05vZGXjg4njg6njg4PjgrDnlKhcclxuXHRkcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcblx0Lm9yaWdpbihmdW5jdGlvbiAoZCkgeyByZXR1cm4gZDsgfSlcclxuXHQub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oZCl7XHJcblx0XHRpZihkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5IHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0dGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnbW91c2V1cCcpKTtcdFx0XHRcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cdFx0ZC50ZW1wLnggPSBkLng7XHJcblx0XHRkLnRlbXAueSA9IGQueTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKHtpZDonZHJhZycsd2lkdGg6ZC53aWR0aCxoZWlnaHQ6ZC5oZWlnaHQseDowLHk6MCwnY2xhc3MnOidhdWRpb05vZGVEcmFnJ30gKTtcclxuXHR9KVxyXG5cdC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdGlmKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRkLnRlbXAueCArPSBkMy5ldmVudC5keDtcclxuXHRcdGQudGVtcC55ICs9IGQzLmV2ZW50LmR5O1xyXG5cdFx0Ly9kMy5zZWxlY3QodGhpcykuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgKGQueCAtIGQud2lkdGggLyAyKSArICcsJyArIChkLnkgLSBkLmhlaWdodCAvIDIpICsgJyknKTtcclxuXHRcdC8vZHJhdygpO1xyXG5cdFx0dmFyIGRyYWdDdXJzb2wgPSBkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKVxyXG5cdFx0LnNlbGVjdCgncmVjdCNkcmFnJyk7XHJcblx0XHR2YXIgeCA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd4JykpICsgZDMuZXZlbnQuZHg7XHJcblx0XHR2YXIgeSA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd5JykpICsgZDMuZXZlbnQuZHk7XHJcblx0XHRkcmFnQ3Vyc29sLmF0dHIoe3g6eCx5Onl9KTtcdFx0XHJcblx0fSlcclxuXHQub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0aWYoZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5zaGlmdEtleSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdHZhciBkcmFnQ3Vyc29sID0gZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSlcclxuXHRcdC5zZWxlY3QoJ3JlY3QjZHJhZycpO1xyXG5cdFx0dmFyIHggPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneCcpKTtcclxuXHRcdHZhciB5ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3knKSk7XHJcblx0XHRkLnggPSBkLnRlbXAueDtcclxuXHRcdGQueSA9IGQudGVtcC55O1xyXG5cdFx0ZHJhZ0N1cnNvbC5yZW1vdmUoKTtcdFx0XHJcblx0XHRkcmF3KCk7XHJcblx0fSk7XHJcblx0XHJcblx0Ly8g44OO44O844OJ6ZaT5o6l57aa55SoIGRyYWcgXHJcblx0ZHJhZ091dCA9IGQzLmJlaGF2aW9yLmRyYWcoKVxyXG5cdC5vcmlnaW4oZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQ7IH0pXHJcblx0Lm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0bGV0IHgxLHkxO1xyXG5cdFx0aWYoZC5pbmRleCl7XHJcblx0XHRcdGlmKGQuaW5kZXggaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHgxID0gZC5ub2RlLnggLSBkLm5vZGUud2lkdGggLyAyICsgZC5pbmRleC54O1xyXG5cdFx0XHRcdHkxID0gZC5ub2RlLnkgLSBkLm5vZGUuaGVpZ2h0IC8yICsgZC5pbmRleC55O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHgxID0gZC5ub2RlLnggKyBkLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHRcdHkxID0gZC5ub2RlLnkgLSBkLm5vZGUuaGVpZ2h0IC8yICsgZC5ub2RlLm91dHB1dFN0YXJ0WSArIGQuaW5kZXggKiAyMDsgXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHgxID0gZC5ub2RlLnggKyBkLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHR5MSA9IGQubm9kZS55IC0gZC5ub2RlLmhlaWdodCAvMiArIGQubm9kZS5vdXRwdXRTdGFydFk7XHJcblx0XHR9XHJcblxyXG5cdFx0ZC54MSA9IHgxLGQueTEgPSB5MTtcdFx0XHRcdFxyXG5cdFx0ZC54MiA9IHgxLGQueTIgPSB5MTtcclxuXHJcblx0XHR2YXIgcG9zID0gbWFrZVBvcyh4MSx5MSxkLngyLGQueTIpO1xyXG5cdFx0ZC5saW5lID0gc3ZnLmFwcGVuZCgnZycpXHJcblx0XHQuZGF0dW0oZClcclxuXHRcdC5hcHBlbmQoJ3BhdGgnKVxyXG5cdFx0LmF0dHIoeydkJzpsaW5lKHBvcyksJ2NsYXNzJzonbGluZS1kcmFnJ30pO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0ZC54MiArPSBkMy5ldmVudC5keDtcclxuXHRcdGQueTIgKz0gZDMuZXZlbnQuZHk7XHJcblx0XHRkLmxpbmUuYXR0cignZCcsbGluZShtYWtlUG9zKGQueDEsZC55MSxkLngyLGQueTIpKSk7XHRcdFx0XHRcdFxyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ2VuZFwiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0bGV0IHRhcmdldFggPSBkLngyO1xyXG5cdFx0bGV0IHRhcmdldFkgPSBkLnkyO1xyXG5cdFx0Ly8gaW5wdXTjgoLjgZfjgY/jga9wYXJhbeOBq+WIsOmBlOOBl+OBpuOBhOOCi+OBi1xyXG5cdFx0Ly8gaW5wdXRcdFx0XHJcblx0XHRsZXQgY29ubmVjdGVkID0gZmFsc2U7XHJcblx0XHRsZXQgaW5wdXRzID0gZDMuc2VsZWN0QWxsKCcuaW5wdXQnKVswXTtcclxuXHRcdGZvcih2YXIgaSA9IDAsbCA9IGlucHV0cy5sZW5ndGg7aSA8IGw7KytpKXtcclxuXHRcdFx0bGV0IGVsbSA9IGlucHV0c1tpXTtcclxuXHRcdFx0bGV0IGJib3ggPSBlbG0uZ2V0QkJveCgpO1xyXG5cdFx0XHRsZXQgbm9kZSA9IGVsbS5fX2RhdGFfXy5ub2RlO1xyXG5cdFx0XHRsZXQgbGVmdCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54LFxyXG5cdFx0XHRcdHRvcCA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueSxcclxuXHRcdFx0XHRyaWdodCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54ICsgYmJveC53aWR0aCxcclxuXHRcdFx0XHRib3R0b20gPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94LnkgKyBiYm94LmhlaWdodDtcclxuXHRcdFx0aWYodGFyZ2V0WCA+PSBsZWZ0ICYmIHRhcmdldFggPD0gcmlnaHQgJiYgdGFyZ2V0WSA+PSB0b3AgJiYgdGFyZ2V0WSA8PSBib3R0b20pXHJcblx0XHRcdHtcclxuLy9cdFx0XHRcdGNvbnNvbGUubG9nKCdoaXQnLGVsbSk7XHJcblx0XHRcdFx0bGV0IGZyb21fID0ge25vZGU6ZC5ub2RlLHBhcmFtOmQuaW5kZXh9O1xyXG5cdFx0XHRcdGxldCB0b18gPSB7bm9kZTpub2RlLHBhcmFtOmVsbS5fX2RhdGFfXy5pbmRleH07XHJcblx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KGZyb21fLHRvXyk7XHJcblx0XHRcdFx0Ly9BdWRpb05vZGVWaWV3LmNvbm5lY3QoKTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdFx0Y29ubmVjdGVkID0gdHJ1ZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZighY29ubmVjdGVkKXtcclxuXHRcdFx0Ly8gQXVkaW9QYXJhbVxyXG5cdFx0XHR2YXIgcGFyYW1zID0gZDMuc2VsZWN0QWxsKCcucGFyYW0sLmF1ZGlvLXBhcmFtJylbMF07XHJcblx0XHRcdGZvcih2YXIgaSA9IDAsbCA9IHBhcmFtcy5sZW5ndGg7aSA8IGw7KytpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IGVsbSA9IHBhcmFtc1tpXTtcclxuXHRcdFx0XHRsZXQgYmJveCA9IGVsbS5nZXRCQm94KCk7XHJcblx0XHRcdFx0bGV0IHBhcmFtID0gZWxtLl9fZGF0YV9fO1xyXG5cdFx0XHRcdGxldCBub2RlID0gcGFyYW0ubm9kZTtcclxuXHRcdFx0XHRsZXQgbGVmdCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54O1xyXG5cdFx0XHRcdGxldFx0dG9wXyA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueTtcclxuXHRcdFx0XHRsZXRcdHJpZ2h0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LnggKyBiYm94LndpZHRoO1xyXG5cdFx0XHRcdGxldFx0Ym90dG9tID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55ICsgYmJveC5oZWlnaHQ7XHJcblx0XHRcdFx0aWYodGFyZ2V0WCA+PSBsZWZ0ICYmIHRhcmdldFggPD0gcmlnaHQgJiYgdGFyZ2V0WSA+PSB0b3BfICYmIHRhcmdldFkgPD0gYm90dG9tKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCdoaXQnLGVsbSk7XHJcblx0XHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6ZC5ub2RlLHBhcmFtOmQuaW5kZXh9LHtub2RlOm5vZGUscGFyYW06cGFyYW0uaW5kZXh9KTtcclxuXHRcdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Ly8gbGluZeODl+ODrOODk+ODpeODvOOBruWJiumZpFxyXG5cdFx0ZC5saW5lLnJlbW92ZSgpO1xyXG5cdFx0ZGVsZXRlIGQubGluZTtcclxuXHR9KTtcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNwYW5lbC1jbG9zZScpXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oKXtkMy5zZWxlY3QoJyNwcm9wLXBhbmVsJykuc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO2QzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7fSk7XHJcblxyXG5cdC8vIG5vZGXplpPmjqXntppsaW5l5o+P55S76Zai5pWwXHJcblx0bGluZSA9IGQzLnN2Zy5saW5lKClcclxuXHQueChmdW5jdGlvbihkKXtyZXR1cm4gZC54fSlcclxuXHQueShmdW5jdGlvbihkKXtyZXR1cm4gZC55fSlcclxuXHQuaW50ZXJwb2xhdGUoJ2Jhc2lzJyk7XHJcblxyXG5cdC8vIERPTeOBq3N2Z+OCqOODrOODoeODs+ODiOOCkuaMv+WFpVx0XHJcblx0c3ZnID0gZDMuc2VsZWN0KCcjY29udGVudCcpXHJcblx0XHQuYXBwZW5kKCdzdmcnKVxyXG5cdFx0LmF0dHIoeyAnd2lkdGgnOiB3aW5kb3cuaW5uZXJXaWR0aCwgJ2hlaWdodCc6IHdpbmRvdy5pbm5lckhlaWdodCB9KTtcclxuXHJcblx0Ly8g44OO44O844OJ44GM5YWl44KL44Kw44Or44O844OXXHJcblx0bm9kZUdyb3VwID0gc3ZnLmFwcGVuZCgnZycpO1xyXG5cdC8vIOODqeOCpOODs+OBjOWFpeOCi+OCsOODq+ODvOODl1xyXG5cdGxpbmVHcm91cCA9IHN2Zy5hcHBlbmQoJ2cnKTtcclxuXHRcclxuXHQvLyBib2R55bGe5oCn44Gr5oy/5YWlXHJcblx0YXVkaW9Ob2RlQ3JlYXRvcnMgPSBcclxuXHRbXHJcblx0XHR7bmFtZTonR2FpbicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVHYWluLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonRGVsYXknLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlRGVsYXkuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidBdWRpb0J1ZmZlclNvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidNZWRpYUVsZW1lbnRBdWRpb1NvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidQYW5uZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlUGFubmVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ29udm9sdmVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNvbnZvbHZlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0FuYWx5c2VyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUFuYWx5c2VyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ2hhbm5lbFNwbGl0dGVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxTcGxpdHRlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0NoYW5uZWxNZXJnZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQ2hhbm5lbE1lcmdlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0R5bmFtaWNzQ29tcHJlc3NvcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVEeW5hbWljc0NvbXByZXNzb3IuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidCaXF1YWRGaWx0ZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQmlxdWFkRmlsdGVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonT3NjaWxsYXRvcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVPc2NpbGxhdG9yLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonTWVkaWFTdHJlYW1BdWRpb1NvdXJjZScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J1dhdmVTaGFwZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlV2F2ZVNoYXBlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0VHJyxjcmVhdGU6KCk9Pm5ldyBhdWRpby5FRygpfSxcclxuXHRcdHtuYW1lOidTZXF1ZW5jZXInLGNyZWF0ZTooKT0+bmV3IGF1ZGlvLlNlcXVlbmNlcigpLGVkaXRvcjpzaG93U2VxdWVuY2VFZGl0b3J9XHJcblx0XTtcclxuXHRcclxuXHRpZihhdWRpby5jdHguY3JlYXRlTWVkaWFTdHJlYW1EZXN0aW5hdGlvbil7XHJcblx0XHRhdWRpb05vZGVDcmVhdG9ycy5wdXNoKHtuYW1lOidNZWRpYVN0cmVhbUF1ZGlvRGVzdGluYXRpb24nLFxyXG5cdFx0XHRjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtRGVzdGluYXRpb24uYmluZChhdWRpby5jdHgpXHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjY29udGVudCcpXHJcblx0LmRhdHVtKHt9KVxyXG5cdC5vbignY29udGV4dG1lbnUnLGZ1bmN0aW9uKCl7XHJcblx0XHRzaG93QXVkaW9Ob2RlUGFuZWwodGhpcyk7XHJcblx0fSk7XHJcbn1cclxuXHJcbi8vIOaPj+eUu1xyXG5leHBvcnQgZnVuY3Rpb24gZHJhdygpIHtcclxuXHQvLyBBdWRpb05vZGXjga7mj4/nlLtcclxuXHR2YXIgZ2QgPSBub2RlR3JvdXAuc2VsZWN0QWxsKCdnJykuXHJcblx0ZGF0YShhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMsZnVuY3Rpb24oZCl7cmV0dXJuIGQuaWQ7fSk7XHJcblxyXG5cdC8vIOefqeW9ouOBruabtOaWsFxyXG5cdGdkLnNlbGVjdCgncmVjdCcpXHJcblx0LmF0dHIoeyAnd2lkdGgnOiAoZCk9PiBkLndpZHRoLCAnaGVpZ2h0JzogKGQpPT4gZC5oZWlnaHQgfSk7XHJcblx0XHJcblx0Ly8gQXVkaW9Ob2Rl55+p5b2i44Kw44Or44O844OXXHJcblx0dmFyIGcgPSBnZC5lbnRlcigpXHJcblx0LmFwcGVuZCgnZycpO1xyXG5cdC8vIEF1ZGlvTm9kZeefqeW9ouOCsOODq+ODvOODl+OBruW6p+aomeS9jee9ruOCu+ODg+ODiFxyXG5cdGdkLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uIChkKSB7IHJldHVybiAndHJhbnNsYXRlKCcgKyAoZC54IC0gZC53aWR0aCAvIDIpICsgJywnICsgKGQueSAtIGQuaGVpZ2h0IC8gMikgKyAnKScgfSk7XHRcclxuXHJcblx0Ly8gQXVkaW9Ob2Rl55+p5b2iXHJcblx0Zy5hcHBlbmQoJ3JlY3QnKVxyXG5cdC5jYWxsKGRyYWcpXHJcblx0LmF0dHIoeyAnd2lkdGgnOiAoZCk9PiBkLndpZHRoLCAnaGVpZ2h0JzogKGQpPT4gZC5oZWlnaHQsICdjbGFzcyc6ICdhdWRpb05vZGUnIH0pXHJcblx0LmNsYXNzZWQoJ3BsYXknLGZ1bmN0aW9uKGQpe1xyXG5cdFx0cmV0dXJuIGQuc3RhdHVzUGxheSA9PT0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUlORztcclxuXHR9KVxyXG5cdC5vbignY29udGV4dG1lbnUnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g44OR44Op44Oh44O844K/57eo6ZuG55S76Z2i44Gu6KGo56S6XHJcblx0XHRkLmVkaXRvcigpO1xyXG5cdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0fSlcclxuXHQub24oJ2NsaWNrLnJlbW92ZScsZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRcdGlmKGQzLmV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0ZC5wYW5lbCAmJiBkLnBhbmVsLmlzU2hvdyAmJiBkLnBhbmVsLmRpc3Bvc2UoKTtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShkKTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdH0gY2F0Y2goZSkge1xyXG4vL1x0XHRcdFx0ZGlhbG9nLnRleHQoZS5tZXNzYWdlKS5ub2RlKCkuc2hvdyh3aW5kb3cuaW5uZXJXaWR0aC8yLHdpbmRvdy5pbm5lckhlaWdodC8yKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0fSlcclxuXHQuZmlsdGVyKGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g6Z+z5rqQ44Gu44G/44Gr44OV44Kj44Or44K/XHJcblx0XHRyZXR1cm4gZC5hdWRpb05vZGUgaW5zdGFuY2VvZiBPc2NpbGxhdG9yTm9kZSB8fCBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyU291cmNlTm9kZSB8fCBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIE1lZGlhRWxlbWVudEF1ZGlvU291cmNlTm9kZTsgXHJcblx0fSlcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOWGjeeUn+ODu+WBnOatolxyXG5cdFx0Y29uc29sZS5sb2coZDMuZXZlbnQpO1xyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdFx0aWYoIWQzLmV2ZW50LmN0cmxLZXkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRsZXQgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0aWYoZC5zdGF0dXNQbGF5ID09PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HKXtcclxuXHRcdFx0ZC5zdGF0dXNQbGF5ID0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUVEO1xyXG5cdFx0XHRzZWwuY2xhc3NlZCgncGxheScsZmFsc2UpO1xyXG5cdFx0XHRkLmF1ZGlvTm9kZS5zdG9wKDApO1xyXG5cdFx0fSBlbHNlIGlmKGQuc3RhdHVzUGxheSAhPT0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUVEKXtcclxuXHRcdFx0ZC5hdWRpb05vZGUuc3RhcnQoMCk7XHJcblx0XHRcdGQuc3RhdHVzUGxheSA9IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlJTkc7XHJcblx0XHRcdHNlbC5jbGFzc2VkKCdwbGF5Jyx0cnVlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGFsZXJ0KCfkuIDluqblgZzmraLjgZnjgovjgajlho3nlJ/jgafjgY3jgb7jgZvjgpPjgIInKTtcclxuXHRcdH1cclxuXHR9KVxyXG5cdC5jYWxsKHRvb2x0aXAoJ0N0cmwgKyBDbGljayDjgaflho3nlJ/jg7vlgZzmraInKSk7XHJcblx0O1xyXG5cdFxyXG5cdC8vIEF1ZGlvTm9kZeOBruODqeODmeODq1xyXG5cdGcuYXBwZW5kKCd0ZXh0JylcclxuXHQuYXR0cih7IHg6IDAsIHk6IC0xMCwgJ2NsYXNzJzogJ2xhYmVsJyB9KVxyXG5cdC50ZXh0KGZ1bmN0aW9uIChkKSB7IHJldHVybiBkLm5hbWU7IH0pO1xyXG5cclxuXHQvLyDlhaXliptBdWRpb1BhcmFt44Gu6KGo56S6XHRcclxuXHRnZC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0dmFyIGdwID0gc2VsLmFwcGVuZCgnZycpO1xyXG5cdFx0dmFyIGdwZCA9IGdwLnNlbGVjdEFsbCgnZycpXHJcblx0XHQuZGF0YShkLmlucHV0UGFyYW1zLm1hcCgoZCk9PntcclxuXHRcdFx0cmV0dXJuIHtub2RlOmQuQXVkaW9Ob2RlVmlldyxpbmRleDpkfTtcclxuXHRcdH0pLGZ1bmN0aW9uKGQpe3JldHVybiBkLmluZGV4LmlkO30pO1x0XHRcclxuXHJcblx0XHR2YXIgZ3BkZyA9IGdwZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJyk7XHJcblx0XHRcclxuXHRcdGdwZGcuYXBwZW5kKCdjaXJjbGUnKVxyXG5cdFx0LmF0dHIoeydyJzogKGQpPT5kLmluZGV4LndpZHRoLzIsIFxyXG5cdFx0Y3g6IDAsIGN5OiAoZCwgaSk9PiB7IHJldHVybiBkLmluZGV4Lnk7IH0sXHJcblx0XHQnY2xhc3MnOiBmdW5jdGlvbihkKSB7XHJcblx0XHRcdGlmKGQuaW5kZXggaW5zdGFuY2VvZiBhdWRpby5BdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0cmV0dXJuICdhdWRpby1wYXJhbSc7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuICdwYXJhbSc7XHJcblx0XHR9fSk7XHJcblx0XHRcclxuXHRcdGdwZGcuYXBwZW5kKCd0ZXh0JylcclxuXHRcdC5hdHRyKHt4OiAoZCk9PiAoZC5pbmRleC54ICsgZC5pbmRleC53aWR0aCAvIDIgKyA1KSx5OihkKT0+ZC5pbmRleC55LCdjbGFzcyc6J2xhYmVsJyB9KVxyXG5cdFx0LnRleHQoKGQpPT5kLmluZGV4Lm5hbWUpO1xyXG5cclxuXHRcdGdwZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHR9KTtcclxuXHJcblx0Ly8g5Ye65YqbUGFyYW3jga7ooajnpLpcdFxyXG5cdGdkLmVhY2goZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHR2YXIgZ3AgPSBzZWwuYXBwZW5kKCdnJyk7XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0XHJcblx0XHR2YXIgZ3BkID0gZ3Auc2VsZWN0QWxsKCdnJylcclxuXHRcdC5kYXRhKGQub3V0cHV0UGFyYW1zLm1hcCgoZCk9PntcclxuXHRcdFx0cmV0dXJuIHtub2RlOmQuQXVkaW9Ob2RlVmlldyxpbmRleDpkfTtcclxuXHRcdH0pLGZ1bmN0aW9uKGQpe3JldHVybiBkLmluZGV4LmlkO30pO1xyXG5cdFx0XHJcblx0XHR2YXIgZ3BkZyA9IGdwZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJyk7XHJcblxyXG5cdFx0Z3BkZy5hcHBlbmQoJ2NpcmNsZScpXHJcblx0XHQuYXR0cih7J3InOiAoZCk9PmQuaW5kZXgud2lkdGgvMiwgXHJcblx0XHRjeDogZC53aWR0aCwgY3k6IChkLCBpKT0+IHsgcmV0dXJuIGQuaW5kZXgueTsgfSxcclxuXHRcdCdjbGFzcyc6ICdwYXJhbSd9KVxyXG5cdFx0LmNhbGwoZHJhZ091dCk7XHJcblx0XHRcclxuXHRcdGdwZGcuYXBwZW5kKCd0ZXh0JylcclxuXHRcdC5hdHRyKHt4OiAoZCk9PiAoZC5pbmRleC54ICsgZC5pbmRleC53aWR0aCAvIDIgKyA1KSx5OihkKT0+ZC5pbmRleC55LCdjbGFzcyc6J2xhYmVsJyB9KVxyXG5cdFx0LnRleHQoKGQpPT5kLmluZGV4Lm5hbWUpO1xyXG5cclxuXHRcdGdwZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHR9KTtcclxuXHJcblx0Ly8g5Ye65Yqb6KGo56S6XHJcblx0Z2QuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XHJcblx0XHRyZXR1cm4gZC5udW1iZXJPZk91dHB1dHMgPiAwO1xyXG5cdH0pXHJcblx0LmVhY2goZnVuY3Rpb24oZCl7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgnZycpO1xyXG5cdFx0aWYoIWQudGVtcC5vdXRzIHx8IChkLnRlbXAub3V0cyAmJiAoZC50ZW1wLm91dHMubGVuZ3RoIDwgZC5udW1iZXJPZk91dHB1dHMpKSlcclxuXHRcdHtcclxuXHRcdFx0ZC50ZW1wLm91dHMgPSBbXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDtpIDwgZC5udW1iZXJPZk91dHB1dHM7KytpKXtcclxuXHRcdFx0XHRkLnRlbXAub3V0cy5wdXNoKHtub2RlOmQsaW5kZXg6aX0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR2YXIgc2VsMSA9IHNlbC5zZWxlY3RBbGwoJ2cnKTtcclxuXHRcdHZhciBzZWxkID0gc2VsMS5kYXRhKGQudGVtcC5vdXRzKTtcclxuXHJcblx0XHRzZWxkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cih7IHg6IGQud2lkdGggLSB1aS5wb2ludFNpemUgLyAyLCB5OiAoZDEpPT4gKGQub3V0cHV0U3RhcnRZICsgZDEuaW5kZXggKiAyMCAtIHVpLnBvaW50U2l6ZSAvIDIpLCB3aWR0aDogdWkucG9pbnRTaXplLCBoZWlnaHQ6IHVpLnBvaW50U2l6ZSwgJ2NsYXNzJzogJ291dHB1dCcgfSlcclxuXHRcdC5jYWxsKGRyYWdPdXQpO1xyXG5cdFx0c2VsZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0fSk7XHJcblxyXG5cdC8vIOWFpeWKm+ihqOekulxyXG5cdGdkXHJcblx0LmZpbHRlcihmdW5jdGlvbiAoZCkge1x0cmV0dXJuIGQubnVtYmVyT2ZJbnB1dHMgPiAwOyB9KVxyXG5cdC5lYWNoKGZ1bmN0aW9uKGQpe1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ2cnKTtcclxuXHRcdGlmKCFkLnRlbXAuaW5zIHx8IChkLnRlbXAuaW5zICYmIChkLnRlbXAuaW5zLmxlbmd0aCA8IGQubnVtYmVyT2ZJbnB1dHMpKSlcclxuXHRcdHtcclxuXHRcdFx0ZC50ZW1wLmlucyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwO2kgPCBkLm51bWJlck9mSW5wdXRzOysraSl7XHJcblx0XHRcdFx0ZC50ZW1wLmlucy5wdXNoKHtub2RlOmQsaW5kZXg6aX0pO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHR2YXIgc2VsMSA9IHNlbC5zZWxlY3RBbGwoJ2cnKTtcclxuXHRcdHZhciBzZWxkID0gc2VsMS5kYXRhKGQudGVtcC5pbnMpO1xyXG5cclxuXHRcdHNlbGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKHsgeDogLSB1aS5wb2ludFNpemUgLyAyLCB5OiAoZDEpPT4gKGQuaW5wdXRTdGFydFkgKyBkMS5pbmRleCAqIDIwIC0gdWkucG9pbnRTaXplIC8gMiksIHdpZHRoOiB1aS5wb2ludFNpemUsIGhlaWdodDogdWkucG9pbnRTaXplLCAnY2xhc3MnOiAnaW5wdXQnIH0pXHJcblx0XHQub24oJ21vdXNlZW50ZXInLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRtb3VzZU92ZXJOb2RlID0ge25vZGU6ZC5hdWRpb05vZGVfLHBhcmFtOmR9O1xyXG5cdFx0fSlcclxuXHRcdC5vbignbW91c2VsZWF2ZScsZnVuY3Rpb24oZCl7XHJcblx0XHRcdGlmKG1vdXNlT3Zlck5vZGUubm9kZSl7XHJcblx0XHRcdFx0aWYobW91c2VPdmVyTm9kZS5ub2RlID09PSBkLmF1ZGlvTm9kZV8gJiYgbW91c2VPdmVyTm9kZS5wYXJhbSA9PT0gZCl7XHJcblx0XHRcdFx0XHRtb3VzZU92ZXJOb2RlID0gbnVsbDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0c2VsZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0fSk7XHJcblx0XHJcblx0Ly8g5LiN6KaB44Gq44OO44O844OJ44Gu5YmK6ZmkXHJcblx0Z2QuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0Ly8gbGluZSDmj4/nlLtcclxuXHR2YXIgbGQgPSBsaW5lR3JvdXAuc2VsZWN0QWxsKCdwYXRoJylcclxuXHQuZGF0YShhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMpO1xyXG5cclxuXHRsZC5lbnRlcigpXHJcblx0LmFwcGVuZCgncGF0aCcpO1xyXG5cclxuXHRsZC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgcGF0aCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdHZhciB4MSx5MSx4Mix5MjtcclxuXHJcblx0XHQvLyB4MSx5MVxyXG5cdFx0aWYoZC5mcm9tLnBhcmFtKXtcclxuXHRcdFx0aWYoZC5mcm9tLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR4MSA9IGQuZnJvbS5ub2RlLnggLSBkLmZyb20ubm9kZS53aWR0aCAvIDIgKyBkLmZyb20ucGFyYW0ueDtcclxuXHRcdFx0XHR5MSA9IGQuZnJvbS5ub2RlLnkgLSBkLmZyb20ubm9kZS5oZWlnaHQgLzIgKyBkLmZyb20ucGFyYW0ueTsgXHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eDEgPSBkLmZyb20ubm9kZS54ICsgZC5mcm9tLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHRcdHkxID0gZC5mcm9tLm5vZGUueSAtIGQuZnJvbS5ub2RlLmhlaWdodCAvMiArIGQuZnJvbS5ub2RlLm91dHB1dFN0YXJ0WSArIGQuZnJvbS5wYXJhbSAqIDIwOyBcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0eDEgPSBkLmZyb20ubm9kZS54ICsgZC5mcm9tLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0XHR5MSA9IGQuZnJvbS5ub2RlLnkgLSBkLmZyb20ubm9kZS5oZWlnaHQgLzIgKyBkLmZyb20ubm9kZS5vdXRwdXRTdGFydFk7XHJcblx0XHR9XHJcblxyXG5cdFx0eDIgPSBkLnRvLm5vZGUueCAtIGQudG8ubm9kZS53aWR0aCAvIDI7XHJcblx0XHR5MiA9IGQudG8ubm9kZS55IC0gZC50by5ub2RlLmhlaWdodCAvIDI7XHJcblx0XHRcclxuXHRcdGlmKGQudG8ucGFyYW0pe1xyXG5cdFx0XHRpZihkLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcgfHwgZC50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDIgKz0gZC50by5wYXJhbS54O1xyXG5cdFx0XHRcdHkyICs9IGQudG8ucGFyYW0ueTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR5MiArPSAgZC50by5ub2RlLmlucHV0U3RhcnRZICArICBkLnRvLnBhcmFtICogMjA7XHRcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0eTIgKz0gZC50by5ub2RlLmlucHV0U3RhcnRZO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHR2YXIgcG9zID0gbWFrZVBvcyh4MSx5MSx4Mix5Mik7XHJcblx0XHRcclxuXHRcdHBhdGguYXR0cih7J2QnOmxpbmUocG9zKSwnY2xhc3MnOidsaW5lJ30pO1xyXG5cdFx0cGF0aC5vbignY2xpY2snLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRpZihkMy5ldmVudC5zaGlmdEtleSl7XHJcblx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KGQuZnJvbSxkLnRvKTtcclxuXHRcdFx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0fSBcclxuXHRcdH0pLmNhbGwodG9vbHRpcCgnU2hpZnQgKyBjbGlja+OBp+WJiumZpCcpKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cdGxkLmV4aXQoKS5yZW1vdmUoKTtcclxufVxyXG5cclxuLy8g57Ch5piTdG9vbHRpcOihqOekulxyXG5mdW5jdGlvbiB0b29sdGlwKG1lcylcclxue1xyXG5cdHJldHVybiBmdW5jdGlvbihkKXtcclxuXHRcdHRoaXNcclxuXHRcdC5vbignbW91c2VlbnRlcicsZnVuY3Rpb24oKXtcclxuXHRcdFx0c3ZnLmFwcGVuZCgndGV4dCcpXHJcblx0XHRcdC5hdHRyKHsnY2xhc3MnOid0aXAnLHg6ZDMuZXZlbnQueCArIDIwICx5OmQzLmV2ZW50LnkgLSAyMH0pXHJcblx0XHRcdC50ZXh0KG1lcyk7XHJcblx0XHR9KVxyXG5cdFx0Lm9uKCdtb3VzZWxlYXZlJyxmdW5jdGlvbigpe1xyXG5cdFx0XHRzdmcuc2VsZWN0QWxsKCcudGlwJykucmVtb3ZlKCk7XHJcblx0XHR9KVxyXG5cdH07XHJcbn1cclxuXHJcbi8vIOaOpee2mue3muOBruW6p+aomeeUn+aIkFxyXG5mdW5jdGlvbiBtYWtlUG9zKHgxLHkxLHgyLHkyKXtcclxuXHRyZXR1cm4gW1xyXG5cdFx0XHR7eDp4MSx5OnkxfSxcclxuXHRcdFx0e3g6eDEgKyAoeDIgLSB4MSkvNCx5OnkxfSxcclxuXHRcdFx0e3g6eDEgKyAoeDIgLSB4MSkvMix5OnkxICsgKHkyIC0geTEpLzJ9LFxyXG5cdFx0XHR7eDp4MSArICh4MiAtIHgxKSozLzQseTp5Mn0sXHJcblx0XHRcdHt4OngyLCB5OnkyfVxyXG5cdFx0XTtcclxufVxyXG5cclxuLy8g44OX44Ot44OR44OG44Kj44OR44ON44Or44Gu6KGo56S6XHJcbmZ1bmN0aW9uIHNob3dQYW5lbChkKXtcclxuXHJcblx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdGlmKGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cpIHJldHVybiA7XHJcblxyXG5cdGQucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuXHRkLnBhbmVsLnggPSBkLng7XHJcblx0ZC5wYW5lbC55ID0gZC55O1xyXG5cdGQucGFuZWwuaGVhZGVyLnRleHQoZC5uYW1lKTtcclxuXHRcclxuXHR2YXIgdGFibGUgPSBkLnBhbmVsLmFydGljbGUuYXBwZW5kKCd0YWJsZScpO1xyXG5cdHZhciB0Ym9keSA9IHRhYmxlLmFwcGVuZCgndGJvZHknKS5zZWxlY3RBbGwoJ3RyJykuZGF0YShkLnBhcmFtcyk7XHJcblx0dmFyIHRyID0gdGJvZHkuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3RyJyk7XHJcblx0dHIuYXBwZW5kKCd0ZCcpXHJcblx0LnRleHQoKGQpPT5kLm5hbWUpO1xyXG5cdHRyLmFwcGVuZCgndGQnKVxyXG5cdC5hcHBlbmQoJ2lucHV0JylcclxuXHQuYXR0cih7dHlwZTpcInRleHRcIix2YWx1ZTooZCk9PmQuZ2V0KCkscmVhZG9ubHk6KGQpPT5kLnNldD9udWxsOidyZWFkb25seSd9KVxyXG5cdC5vbignY2hhbmdlJyxmdW5jdGlvbihkKXtcclxuXHRcdGxldCB2YWx1ZSA9IHRoaXMudmFsdWU7XHJcblx0XHRsZXQgdm4gPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuXHRcdGlmKGlzTmFOKHZuKSl7XHJcblx0XHRcdGQuc2V0KHZhbHVlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGQuc2V0KHZuKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHRkLnBhbmVsLnNob3coKTtcclxuXHJcbn1cclxuXHJcbi8vIOODjuODvOODieaMv+WFpeODkeODjeODq+OBruihqOekulxyXG5mdW5jdGlvbiBzaG93QXVkaW9Ob2RlUGFuZWwoZCl7XHJcblx0IGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0IGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdGlmKGQucGFuZWwpe1xyXG5cdFx0aWYoZC5wYW5lbC5pc1Nob3cpXHJcblx0XHRcdHJldHVybjtcclxuXHR9XHJcblx0XHJcblx0ZC5wYW5lbCA9IG5ldyB1aS5QYW5lbCgpO1xyXG5cdGQucGFuZWwueCA9IGQzLmV2ZW50Lm9mZnNldFg7XHJcblx0ZC5wYW5lbC55ID0gZDMuZXZlbnQub2Zmc2V0WTtcclxuXHRkLnBhbmVsLmhlYWRlci50ZXh0KCdBdWRpb05vZGXjga7mjL/lhaUnKTtcclxuXHJcblx0dmFyIHRhYmxlID0gZC5wYW5lbC5hcnRpY2xlLmFwcGVuZCgndGFibGUnKTtcclxuXHR2YXIgdGJvZHkgPSB0YWJsZS5hcHBlbmQoJ3Rib2R5Jykuc2VsZWN0QWxsKCd0cicpLmRhdGEoYXVkaW9Ob2RlQ3JlYXRvcnMpO1xyXG5cdHRib2R5LmVudGVyKClcclxuXHQuYXBwZW5kKCd0cicpXHJcblx0LmFwcGVuZCgndGQnKVxyXG5cdC50ZXh0KChkKT0+ZC5uYW1lKVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKGR0KXtcclxuXHRcdGNvbnNvbGUubG9nKCfmjL/lhaUnLGR0KTtcclxuXHRcdFxyXG5cdFx0dmFyIGVkaXRvciA9IGR0LmVkaXRvciB8fCBzaG93UGFuZWw7XHJcblx0XHRcclxuXHRcdHZhciBub2RlID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoZHQuY3JlYXRlKCksZWRpdG9yKTtcclxuXHRcdG5vZGUueCA9IGQzLmV2ZW50LmNsaWVudFg7XHJcblx0XHRub2RlLnkgPSBkMy5ldmVudC5jbGllbnRZO1xyXG5cdFx0ZHJhdygpO1xyXG5cdFx0Ly8gZDMuc2VsZWN0KCcjcHJvcC1wYW5lbCcpLnN0eWxlKCd2aXNpYmlsaXR5JywnaGlkZGVuJyk7XHJcblx0XHQvLyBkLnBhbmVsLmRpc3Bvc2UoKTtcclxuXHR9KTtcclxuXHRkLnBhbmVsLnNob3coKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF1ZGlvTm9kZVZpZXcobmFtZSl7XHJcblx0dmFyIG9iaiA9IGF1ZGlvTm9kZUNyZWF0b3JzLmZpbmQoKGQpPT57XHJcblx0XHRpZihkLm5hbWUgPT09IG5hbWUpIHJldHVybiB0cnVlO1xyXG5cdH0pO1xyXG5cdGlmKG9iail7XHJcblx0XHRyZXR1cm4gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUob2JqLmNyZWF0ZSgpLG9iai5lZGl0b3IgfHwgc2hvd1BhbmVsKTtcdFx0XHRcclxuXHR9XHJcbn1cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVHIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0dGhpcy5nYXRlID0gbmV3IGF1ZGlvLlBhcmFtVmlldyh0aGlzLCdnYXRlJyxmYWxzZSk7XHJcblx0XHR0aGlzLm91dHB1dCA9IG5ldyBhdWRpby5QYXJhbVZpZXcodGhpcywnb3V0cHV0Jyx0cnVlKTtcclxuXHRcdHRoaXMubnVtYmVyT2ZJbnB1dHMgPSAwO1xyXG5cdFx0dGhpcy5udW1iZXJPZk91dHB1dHMgPSAwO1xyXG5cdFx0dGhpcy5hdHRhY2sgPSAwLjAwMTtcclxuXHRcdHRoaXMuZGVjYXkgPSAwLjA1O1xyXG5cdFx0dGhpcy5yZWxlYXNlID0gMC4wNTtcclxuXHRcdHRoaXMuc3VzdGFpbiA9IDAuMjtcclxuXHRcdHRoaXMuZ2FpbiA9IDEuMDtcclxuXHRcdHRoaXMubmFtZSA9ICdFRyc7XHJcblx0XHRhdWRpby5kZWZJc05vdEFQSU9iaih0aGlzLGZhbHNlKTtcclxuXHRcdHRoaXMub3V0cHV0cyA9IFtdO1xyXG5cdH1cclxuXHRcclxuXHRjb25uZWN0KGMpXHJcblx0e1xyXG5cdFx0aWYoISAoYy50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLkF1ZGlvUGFyYW1WaWV3KSl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignQXVkaW9QYXJhbeS7peWkluOBqOOBr+aOpee2muOBp+OBjeOBvuOBm+OCk+OAgicpO1xyXG5cdFx0fVxyXG5cdFx0Yy50by5wYXJhbS5hdWRpb1BhcmFtLnZhbHVlID0gMDtcclxuXHRcdHRoaXMub3V0cHV0cy5wdXNoKGMudG8pO1xyXG5cdH1cclxuXHRcclxuXHRkaXNjb25uZWN0KGMpe1xyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdGhpcy5vdXRwdXRzLmxlbmd0aDsrK2kpe1xyXG5cdFx0XHRpZihjLnRvLm5vZGUgPT09IHRoaXMub3V0cHV0c1tpXS5ub2RlICYmIGMudG8ucGFyYW0gPT09IHRoaXMub3V0cHV0c1tpXS5wYXJhbSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHRoaXMub3V0cHV0cy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFx0XHJcblx0cHJvY2Vzcyh0byxjb20sdix0KVxyXG5cdHtcclxuXHRcdGlmKHYgPiAwKSB7XHJcblx0XHRcdC8vIGtleW9uXHJcblx0XHRcdC8vIEFEU+OBvuOBp+OCguOBo+OBpuOBhOOBj1xyXG5cdFx0XHR0aGlzLm91dHB1dHMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRjb25zb2xlLmxvZygna2V5b24nLGNvbSx2LHQpO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5zZXRWYWx1ZUF0VGltZSgwLHQpO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2ICogdGhpcy5nYWluICx0ICsgdGhpcy5hdHRhY2spO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW4gKiB2ICogdGhpcy5nYWluICx0ICsgdGhpcy5hdHRhY2sgKyB0aGlzLmRlY2F5ICk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8ga2V5b2ZmXHJcblx0XHRcdC8vIOODquODquODvOOCuVxyXG5cdFx0XHR0aGlzLm91dHB1dHMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRjb25zb2xlLmxvZygna2V5b2ZmJyxjb20sdix0KTtcclxuXHRcdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCx0ICsgdGhpcy5yZWxlYXNlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHN0b3AoKXtcclxuXHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRjb25zb2xlLmxvZygnc3RvcCcpO1xyXG5cdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG5cdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0uc2V0VmFsdWVBdFRpbWUoMCwwKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRwYXVzZSgpe1xyXG5cdFx0XHJcblx0fVxyXG5cdFxyXG59XHJcblxyXG4vLyAvLy8g44Ko44Oz44OZ44Ot44O844OX44K444Kn44ON44Os44O844K/44O8XHJcbi8vIGZ1bmN0aW9uIEVudmVsb3BlR2VuZXJhdG9yKHZvaWNlLCBhdHRhY2ssIGRlY2F5LCBzdXN0YWluLCByZWxlYXNlKSB7XHJcbi8vICAgdGhpcy52b2ljZSA9IHZvaWNlO1xyXG4vLyAgIC8vdGhpcy5rZXlvbiA9IGZhbHNlO1xyXG4vLyAgIHRoaXMuYXR0YWNrID0gYXR0YWNrIHx8IDAuMDAwNTtcclxuLy8gICB0aGlzLmRlY2F5ID0gZGVjYXkgfHwgMC4wNTtcclxuLy8gICB0aGlzLnN1c3RhaW4gPSBzdXN0YWluIHx8IDAuNTtcclxuLy8gICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlIHx8IDAuNTtcclxuLy8gfTtcclxuLy8gXHJcbi8vIEVudmVsb3BlR2VuZXJhdG9yLnByb3RvdHlwZSA9XHJcbi8vIHtcclxuLy8gICBrZXlvbjogZnVuY3Rpb24gKHQsdmVsKSB7XHJcbi8vICAgICB0aGlzLnYgPSB2ZWwgfHwgMS4wO1xyXG4vLyAgICAgdmFyIHYgPSB0aGlzLnY7XHJcbi8vICAgICB2YXIgdDAgPSB0IHx8IHRoaXMudm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbi8vICAgICB2YXIgdDEgPSB0MCArIHRoaXMuYXR0YWNrICogdjtcclxuLy8gICAgIHZhciBnYWluID0gdGhpcy52b2ljZS5nYWluLmdhaW47XHJcbi8vICAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbi8vICAgICBnYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwKTtcclxuLy8gICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodiwgdDEpO1xyXG4vLyAgICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MCArIHRoaXMuZGVjYXkgLyB2KTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDEsIHQxICsgdGhpcy5kZWNheSAvIHYpO1xyXG4vLyAgIH0sXHJcbi8vICAga2V5b2ZmOiBmdW5jdGlvbiAodCkge1xyXG4vLyAgICAgdmFyIHZvaWNlID0gdGhpcy52b2ljZTtcclxuLy8gICAgIHZhciBnYWluID0gdm9pY2UuZ2Fpbi5nYWluO1xyXG4vLyAgICAgdmFyIHQwID0gdCB8fCB2b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuLy8gICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbi8vICAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKDAsIHQwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbi8vICAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICB9XHJcbi8vIH07IiwiJ3VzZSBzdHJpY3QnO1xuXG4vL1xuLy8gV2Ugc3RvcmUgb3VyIEVFIG9iamVjdHMgaW4gYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxuLy8gYH5gIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IG92ZXJyaWRkZW4gb3Jcbi8vIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cbi8vIFdlIGFsc28gYXNzdW1lIHRoYXQgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIGF2YWlsYWJsZSB3aGVuIHRoZSBldmVudCBuYW1lXG4vLyBpcyBhbiBFUzYgU3ltYm9sLlxuLy9cbnZhciBwcmVmaXggPSB0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gJ2Z1bmN0aW9uJyA/ICd+JyA6IGZhbHNlO1xuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIEV2ZW50RW1pdHRlciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBFdmVudCBoYW5kbGVyIHRvIGJlIGNhbGxlZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgQ29udGV4dCBmb3IgZnVuY3Rpb24gZXhlY3V0aW9uLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgZW1pdCBvbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgRXZlbnRFbWl0dGVyIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkgeyAvKiBOb3RoaW5nIHRvIHNldCAqLyB9XG5cbi8qKlxuICogSG9sZHMgdGhlIGFzc2lnbmVkIEV2ZW50RW1pdHRlcnMgYnkgbmFtZS5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuXG4vKipcbiAqIFJldHVybiBhIGxpc3Qgb2YgYXNzaWduZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIGxpc3RlZC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIFdlIG9ubHkgbmVlZCB0byBrbm93IGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIEVtaXQgYW4gZXZlbnQgdG8gYWxsIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgbmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gSW5kaWNhdGlvbiBpZiB3ZSd2ZSBlbWl0dGVkIGFuIGV2ZW50LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICAgLCBqO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIG5ldyBFdmVudExpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdG9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGFuIEV2ZW50TGlzdGVuZXIgdGhhdCdzIG9ubHkgY2FsbGVkIG9uY2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IE5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIGxpc3RlbmVycyBtYXRjaGluZyB0aGlzIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGV2ZW50cyA9IFtdO1xuXG4gIGlmIChmbikge1xuICAgIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICAgIGlmIChcbiAgICAgICAgICAgbGlzdGVuZXJzLmZuICE9PSBmblxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpXG4gICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVycy5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgKSB7XG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVycyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cbiAgICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXG4gICAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICAgICkge1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gIC8vXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycyBvciBvbmx5IHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3YW50IHRvIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvci5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIGlmICghdGhpcy5fZXZlbnRzKSByZXR1cm4gdGhpcztcblxuICBpZiAoZXZlbnQpIGRlbGV0ZSB0aGlzLl9ldmVudHNbcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudF07XG4gIGVsc2UgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZGVmT2JzZXJ2YWJsZSh0YXJnZXQscHJvcE5hbWUsb3B0ID0ge30pXHJcbntcclxuXHQoKCk9PntcclxuXHRcdHZhciB2XztcclxuXHRcdG9wdC5lbnVtZXJhYmxlID0gb3B0LmVudW1lcmFibGUgfHwgdHJ1ZTtcclxuXHRcdG9wdC5jb25maWd1cmFibGUgPSBvcHQuY29uZmlndXJhYmxlIHx8IGZhbHNlO1xyXG5cdFx0b3B0LmdldCA9IG9wdC5nZXQgfHwgKCgpID0+IHZfKTtcclxuXHRcdG9wdC5zZXQgPSBvcHQuc2V0IHx8ICgodik9PntcclxuXHRcdFx0aWYodl8gIT0gdil7XHJcblx0XHRcdFx0dGFyZ2V0LmVtaXQocHJvcE5hbWUgKyAnX2NoYW5nZWQnLHYpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHZfID0gdjtcclxuXHRcdH0pO1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCxwcm9wTmFtZSxvcHQpO1xyXG5cdH0pKCk7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpJztcclxuaW1wb3J0IHtVbmRvTWFuYWdlcn0gZnJvbSAnLi91bmRvJztcclxuXHJcblxyXG5jb25zdCBJbnB1dFR5cGUgPSB7XHJcbiAga2V5Ym9yZDogMCxcclxuICBtaWRpOiAxXHJcbn1cclxuXHJcbmNvbnN0IElucHV0Q29tbWFuZCA9XHJcbiAge1xyXG4gICAgZW50ZXI6IHsgaWQ6IDEsIG5hbWU6ICfjg47jg7zjg4jjg4fjg7zjgr/mjL/lhaUnIH0sXHJcbiAgICBlc2M6IHsgaWQ6IDIsIG5hbWU6ICfjgq3jg6Pjg7Pjgrvjg6snIH0sXHJcbiAgICByaWdodDogeyBpZDogMywgbmFtZTogJ+OCq+ODvOOCveODq+enu+WLle+8iOWPs++8iScgfSxcclxuICAgIGxlZnQ6IHsgaWQ6IDQsIG5hbWU6ICfjgqvjg7zjgr3jg6vnp7vli5XvvIjlt6bvvIknIH0sXHJcbiAgICB1cDogeyBpZDogNSwgbmFtZTogJ+OCq+ODvOOCveODq+enu+WLle+8iOS4iu+8iScgfSxcclxuICAgIGRvd246IHsgaWQ6IDYsIG5hbWU6ICfjgqvjg7zjgr3jg6vnp7vli5XvvIjkuIvvvIknIH0sXHJcbiAgICBpbnNlcnRNZWFzdXJlOiB7IGlkOiA3LCBuYW1lOiAn5bCP56+A57ea5oy/5YWlJyB9LFxyXG4gICAgdW5kbzogeyBpZDogOCwgbmFtZTogJ+OCouODs+ODieOCpScgfSxcclxuICAgIHJlZG86IHsgaWQ6IDksIG5hbWU6ICfjg6rjg4njgqUnIH0sXHJcbiAgICBwYWdlVXA6IHsgaWQ6IDEwLCBuYW1lOiAn44Oa44O844K444Ki44OD44OXJyB9LFxyXG4gICAgcGFnZURvd246IHsgaWQ6IDExLCBuYW1lOiAn44Oa44O844K444OA44Km44OzJyB9LFxyXG4gICAgaG9tZTogeyBpZDogMTIsIG5hbWU6ICflhYjpoK3ooYzjgavnp7vli5UnIH0sXHJcbiAgICBlbmQ6IHsgaWQ6IDEzLCBuYW1lOiAn57WC56uv6KGM44Gr56e75YuVJyB9LFxyXG4gICAgbnVtYmVyOiB7IGlkOiAxNCwgbmFtZTogJ+aVsOWtl+WFpeWKmycgfSxcclxuICAgIG5vdGU6IHsgaWQ6IDE1LCBuYW1lOiAn44OO44O844OI5YWl5YqbJyB9LFxyXG4gICAgc2Nyb2xsVXA6IHsgaWQ6IDE2LCBuYW1lOiAn6auY6YCf44K544Kv44Ot44O844Or44Ki44OD44OXJyB9LFxyXG4gICAgc2Nyb2xsRG93bjogeyBpZDogMTcsIG5hbWU6ICfpq5jpgJ/jgrnjgq/jg63jg7zjg6vjg4Djgqbjg7MnIH0sXHJcbiAgICBkZWxldGU6IHsgaWQ6IDE4LCBuYW1lOiAn6KGM5YmK6ZmkJyB9LFxyXG4gICAgbGluZVBhc3RlOiB7IGlkOiAxOSwgbmFtZTogJ+ihjOODmuODvOOCueODiCcgfVxyXG4gIH1cclxuXHJcbi8vXHJcbmNvbnN0IEtleUJpbmQgPVxyXG4gIHtcclxuICAgIDEzOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmVudGVyXHJcbiAgICB9XSxcclxuICAgIDI3OiBbe1xyXG4gICAgICBrZXlDb2RlOiAyNyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmVzY1xyXG4gICAgfV0sXHJcbiAgICAzMjogW3tcclxuICAgICAga2V5Q29kZTogMzIsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5yaWdodFxyXG4gICAgfV0sXHJcbiAgICAzOTogW3tcclxuICAgICAga2V5Q29kZTogMzksXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5yaWdodFxyXG4gICAgfV0sXHJcbiAgICAzNzogW3tcclxuICAgICAga2V5Q29kZTogMzcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5sZWZ0XHJcbiAgICB9XSxcclxuICAgIDM4OiBbe1xyXG4gICAgICBrZXlDb2RlOiAzOCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnVwXHJcbiAgICB9XSxcclxuICAgIDQwOiBbe1xyXG4gICAgICBrZXlDb2RlOiA0MCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmRvd25cclxuICAgIH1dLFxyXG4gICAgMTA2OiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDYsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5pbnNlcnRNZWFzdXJlXHJcbiAgICB9XSxcclxuICAgIDkwOiBbe1xyXG4gICAgICBrZXlDb2RlOiA5MCxcclxuICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQudW5kb1xyXG4gICAgfV0sXHJcbiAgICAzMzogW3tcclxuICAgICAga2V5Q29kZTogMzMsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5wYWdlVXBcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiAzMyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnNjcm9sbFVwXHJcbiAgICAgIH1dLFxyXG4gICAgODI6IFt7XHJcbiAgICAgIGtleUNvZGU6IDgyLFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5wYWdlVXBcclxuICAgIH1dLFxyXG4gICAgMzQ6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM0LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucGFnZURvd25cclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiAzNCxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnNjcm9sbERvd25cclxuICAgICAgfV0sXHJcbiAgICA2NzogW3tcclxuICAgICAga2V5Q29kZTogNjcsXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnBhZ2VEb3duXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNjcsXHJcbiAgICAgICAgbm90ZTogJ0MnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY3LFxyXG4gICAgICAgIG5vdGU6ICdDJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfV0sXHJcbiAgICAzNjogW3tcclxuICAgICAga2V5Q29kZTogMzYsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ob21lXHJcbiAgICB9XSxcclxuICAgIDM1OiBbe1xyXG4gICAgICBrZXlDb2RlOiAzNSxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmVuZFxyXG4gICAgfV0sXHJcbiAgICA5NjogW3tcclxuICAgICAga2V5Q29kZTogOTYsXHJcbiAgICAgIG51bWJlcjogMCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICA5NzogW3tcclxuICAgICAga2V5Q29kZTogOTcsXHJcbiAgICAgIG51bWJlcjogMSxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICA5ODogW3tcclxuICAgICAga2V5Q29kZTogOTgsXHJcbiAgICAgIG51bWJlcjogMixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICA5OTogW3tcclxuICAgICAga2V5Q29kZTogOTksXHJcbiAgICAgIG51bWJlcjogMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICAxMDA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwMCxcclxuICAgICAgbnVtYmVyOiA0LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDEwMTogW3tcclxuICAgICAga2V5Q29kZTogMTAxLFxyXG4gICAgICBudW1iZXI6IDUsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgMTAyOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDIsXHJcbiAgICAgIG51bWJlcjogNixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICAxMDM6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwMyxcclxuICAgICAgbnVtYmVyOiA3LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDEwNDogW3tcclxuICAgICAga2V5Q29kZTogMTA0LFxyXG4gICAgICBudW1iZXI6IDgsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgMTA1OiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDUsXHJcbiAgICAgIG51bWJlcjogOSxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICA2NTogW3tcclxuICAgICAga2V5Q29kZTogNjUsXHJcbiAgICAgIG5vdGU6ICdBJyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA2NSxcclxuICAgICAgICBub3RlOiAnQScsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXlDb2RlOiA2NSxcclxuICAgICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnJlZG9cclxuICAgICAgfV0sXHJcbiAgICA2NjogW3tcclxuICAgICAga2V5Q29kZTogNjYsXHJcbiAgICAgIG5vdGU6ICdCJyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA2NixcclxuICAgICAgICBub3RlOiAnQicsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH1dLFxyXG4gICAgNjg6IFt7XHJcbiAgICAgIGtleUNvZGU6IDY4LFxyXG4gICAgICBub3RlOiAnRCcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNjgsXHJcbiAgICAgICAgbm90ZTogJ0QnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9XSxcclxuICAgIDY5OiBbe1xyXG4gICAgICBrZXlDb2RlOiA2OSxcclxuICAgICAgbm90ZTogJ0UnLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY5LFxyXG4gICAgICAgIG5vdGU6ICdFJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfV0sXHJcbiAgICA3MDogW3tcclxuICAgICAga2V5Q29kZTogNzAsXHJcbiAgICAgIG5vdGU6ICdGJyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA3MCxcclxuICAgICAgICBub3RlOiAnRicsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH1dLFxyXG4gICAgNzE6IFt7XHJcbiAgICAgIGtleUNvZGU6IDcxLFxyXG4gICAgICBub3RlOiAnRycsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNzEsXHJcbiAgICAgICAgbm90ZTogJ0cnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9XSxcclxuICAgIDg5OiBbe1xyXG4gICAgICBrZXlDb2RlOiA4OSxcclxuICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuZGVsZXRlXHJcbiAgICB9XSxcclxuICAgIDc2OiBbe1xyXG4gICAgICBrZXlDb2RlOiA3NixcclxuICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubGluZVBhc3RlXHJcbiAgICB9XVxyXG4gIH07XHJcblxyXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VFZGl0b3Ige1xyXG4gIGNvbnN0cnVjdG9yKHNlcXVlbmNlcikge1xyXG4gICAgdmFyIHNlbGZfID0gdGhpcztcclxuICAgIHRoaXMudW5kb01hbmFnZXIgPSBuZXcgVW5kb01hbmFnZXIoKTtcclxuICAgIHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsID0gbmV3IHVpLlBhbmVsKCk7XHJcbiAgICBzZXF1ZW5jZXIucGFuZWwueCA9IHNlcXVlbmNlci54O1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLnkgPSBzZXF1ZW5jZXIueTtcclxuICAgIHNlcXVlbmNlci5wYW5lbC53aWR0aCA9IDEwMjQ7XHJcbiAgICBzZXF1ZW5jZXIucGFuZWwuaGVpZ2h0ID0gNzY4O1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLmhlYWRlci50ZXh0KCdTZXF1ZW5jZSBFZGl0b3InKTtcclxuICAgIHZhciBlZGl0b3IgPSBzZXF1ZW5jZXIucGFuZWwuYXJ0aWNsZS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ3NlcS1lZGl0b3InLCB0cnVlKTtcclxuICAgIHZhciBkaXYgPSBlZGl0b3IuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdoZWFkZXInLCB0cnVlKTtcclxuXHQgXHJcbiAgICAvLyDjgr/jgqTjg6Djg5njg7zjgrlcclxuICAgIGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdUaW1lIEJhc2U6Jyk7XHJcbiAgICBkaXYuYXBwZW5kKCdpbnB1dCcpXHJcbiAgICAgIC5kYXR1bShzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRwYilcclxuICAgICAgLmF0dHIoeyAndHlwZSc6ICd0ZXh0JywgJ3NpemUnOiAnMycsICdpZCc6ICd0aW1lLWJhc2UnIH0pXHJcbiAgICAgIC5hdHRyKCd2YWx1ZScsICh2KSA9PiB2KVxyXG4gICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRwYiA9IGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2FsbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS5vbigndHBiX2NoYW5nZWQnLCAodikgPT4ge1xyXG4gICAgICAgICAgdGhpcy5hdHRyKCd2YWx1ZScsIHYpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcblxyXG4gICAgLy8g44OG44Oz44OdXHJcbiAgICBkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnVGVtcG86Jyk7XHJcbiAgICBkaXYuYXBwZW5kKCdpbnB1dCcpXHJcbiAgICAgIC5kYXR1bShzZXF1ZW5jZXIpXHJcbiAgICAgIC5hdHRyKHsgJ3R5cGUnOiAndGV4dCcsICdzaXplJzogJzMnIH0pXHJcbiAgICAgIC5hdHRyKCd2YWx1ZScsIChkKSA9PiBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJwbSlcclxuICAgICAgLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS5icG0gPSBwYXJzZUZsb2F0KGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhbGwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUub24oJ2JwbV9jaGFuZ2VkJywgKHYpID0+IHtcclxuICAgICAgICAgIHRoaXMuYXR0cigndmFsdWUnLCB2KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJ0JlYXQ6Jyk7XHJcbiAgICBkaXYuYXBwZW5kKCdpbnB1dCcpXHJcbiAgICAgIC5kYXR1bShzZXF1ZW5jZXIpXHJcbiAgICAgIC5hdHRyKHsgJ3R5cGUnOiAndGV4dCcsICdzaXplJzogJzMnLCAndmFsdWUnOiAoZCkgPT4gc2VxdWVuY2VyLmF1ZGlvTm9kZS5iZWF0IH0pXHJcbiAgICAgIC5vbignY2hhbmdlJywgKGQpID0+IHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJlYXQgPSBwYXJzZUZsb2F0KGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJyAvICcpO1xyXG4gICAgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG4gICAgICAuZGF0dW0oc2VxdWVuY2VyKVxyXG4gICAgICAuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJywgJ3ZhbHVlJzogKGQpID0+IHNlcXVlbmNlci5hdWRpb05vZGUuYmFyIH0pXHJcbiAgICAgIC5vbignY2hhbmdlJywgKGQpID0+IHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJhciA9IHBhcnNlRmxvYXQoZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJykpO1xyXG4gICAgICB9KTtcclxuXHJcblxyXG4gICAgLy8g44OI44Op44OD44Kv44Ko44OH44Kj44K/XHJcbiAgICBsZXQgdHJhY2tFZGl0ID0gZWRpdG9yLnNlbGVjdEFsbCgnZGl2LnRyYWNrJylcclxuICAgICAgLmRhdGEoc2VxdWVuY2VyLmF1ZGlvTm9kZS50cmFja3MpXHJcbiAgICAgIC5lbnRlcigpXHJcbiAgICAgIC5hcHBlbmQoJ2RpdicpXHJcbiAgICAgIC5jbGFzc2VkKCd0cmFjaycsIHRydWUpXHJcbiAgICAgIC5hdHRyKHsgJ2lkJzogKGQsIGkpID0+ICd0cmFjay0nICsgKGkgKyAxKSwgJ3RhYmluZGV4JzogJzAnIH0pO1xyXG5cclxuICAgIGxldCB0cmFja0hlYWRlciA9IHRyYWNrRWRpdC5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ3RyYWNrLWhlYWRlcicsIHRydWUpO1xyXG4gICAgdHJhY2tIZWFkZXIuYXBwZW5kKCdzcGFuJykudGV4dCgoZCwgaSkgPT4gJ1RSOicgKyAoaSArIDEpKTtcclxuICAgIHRyYWNrSGVhZGVyLmFwcGVuZCgnc3BhbicpLnRleHQoJ01FQVM6Jyk7XHJcbiAgICBsZXQgdHJhY2tCb2R5ID0gdHJhY2tFZGl0LmFwcGVuZCgnZGl2JykuY2xhc3NlZCgndHJhY2stYm9keScsIHRydWUpO1xyXG4gICAgbGV0IGV2ZW50RWRpdCA9IHRyYWNrQm9keS5hcHBlbmQoJ3RhYmxlJyk7XHJcbiAgICBsZXQgaGVhZHJvdyA9IGV2ZW50RWRpdC5hcHBlbmQoJ3RoZWFkJykuYXBwZW5kKCd0cicpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnTSMnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1MjJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdOVCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnTiMnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1NUJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdHVCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnVkUnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ0NPJyk7XHJcbiAgICBsZXQgZXZlbnRCb2R5ID0gZXZlbnRFZGl0LmFwcGVuZCgndGJvZHknKS5hdHRyKCdpZCcsIChkLCBpKSA9PiAndHJhY2stJyArIChpICsgMSkgKyAnLWV2ZW50cycpO1xyXG4gICAgLy90aGlzLmRyYXdFdmVudHMoZXZlbnRCb2R5KTtcclxuXHJcbiAgICAvLyDjg4bjgrnjg4jjg4fjg7zjgr9cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTI3OyBpICs9IDgpIHtcclxuICAgICAgZm9yICh2YXIgaiA9IGk7IGogPCAoaSArIDgpOyArK2opIHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRyYWNrc1swXS5hZGRFdmVudChuZXcgYXVkaW8uTm90ZUV2ZW50KDQ4LCBqLCA2KSk7XHJcbiAgICAgIH1cclxuICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS50cmFja3NbMF0uYWRkRXZlbnQobmV3IGF1ZGlvLk1lYXN1cmUoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8g44OI44Op44OD44Kv44Ko44OH44Kj44K/44Oh44Kk44OzXHJcblxyXG4gICAgdHJhY2tFZGl0LmVhY2goZnVuY3Rpb24gKGQpIHtcclxuICAgICAgaWYgKCF0aGlzLmVkaXRvcikge1xyXG4gICAgICAgIHRoaXMuZWRpdG9yID0gZG9FZGl0b3IoZDMuc2VsZWN0KHRoaXMpLCBzZWxmXyk7XHJcbiAgICAgICAgdGhpcy5lZGl0b3IubmV4dCgpO1xyXG4gICAgICAgIHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyDjgq3jg7zlhaXlipvjg4/jg7Pjg4njg6lcclxuICAgIHRyYWNrRWRpdC5vbigna2V5ZG93bicsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgIGxldCBlID0gZDMuZXZlbnQ7XHJcbiAgICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XHJcbiAgICAgIGxldCBrZXkgPSBLZXlCaW5kW2Uua2V5Q29kZV07XHJcbiAgICAgIGxldCByZXQgPSB7fTtcclxuICAgICAgaWYgKGtleSkge1xyXG4gICAgICAgIGtleS5zb21lKChkKSA9PiB7XHJcbiAgICAgICAgICBpZiAoZC5jdHJsS2V5ID09IGUuY3RybEtleVxyXG4gICAgICAgICAgICAmJiBkLnNoaWZ0S2V5ID09IGUuc2hpZnRLZXlcclxuICAgICAgICAgICAgJiYgZC5hbHRLZXkgPT0gZS5hbHRLZXlcclxuICAgICAgICAgICAgJiYgZC5tZXRhS2V5ID09IGUubWV0YUtleVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0ID0gdGhpcy5lZGl0b3IubmV4dChkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHJldC52YWx1ZSkge1xyXG4gICAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZXF1ZW5jZXIucGFuZWwub24oJ3Nob3cnLCAoKSA9PiB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI3RpbWUtYmFzZScpLm5vZGUoKS5mb2N1cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgc2VxdWVuY2VyLnBhbmVsLm9uKCdkaXNwb3NlJywgKCkgPT4ge1xyXG4gICAgICBkZWxldGUgc2VxdWVuY2VyLmVkaXRvckluc3RhbmNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgc2VxdWVuY2VyLnBhbmVsLnNob3coKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOOCqOODh+OCo+OCv+acrOS9k1xyXG5mdW5jdGlvbiogZG9FZGl0b3IodHJhY2tFZGl0LCBzZXFFZGl0b3IpIHtcclxuICBsZXQga2V5Y29kZSA9IDA7Ly8g5YWl5Yqb44GV44KM44Gf44Kt44O844Kz44O844OJ44KS5L+d5oyB44GZ44KL5aSJ5pWwXHJcbiAgbGV0IHRyYWNrID0gdHJhY2tFZGl0LmRhdHVtKCk7Ly8g54++5Zyo57eo6ZuG5Lit44Gu44OI44Op44OD44KvXHJcbiAgbGV0IGVkaXRWaWV3ID0gZDMuc2VsZWN0KCcjJyArIHRyYWNrRWRpdC5hdHRyKCdpZCcpICsgJy1ldmVudHMnKTsvL+e3qOmbhueUu+mdouOBruOCu+ODrOOCr+OCt+ODp+ODs1xyXG4gIGxldCBtZWFzdXJlID0gMTsvLyDlsI/nr4BcclxuICBsZXQgc3RlcCA9IDE7Ly8g44K544OG44OD44OXTm9cclxuICBsZXQgcm93SW5kZXggPSAwOy8vIOe3qOmbhueUu+mdouOBruePvuWcqOihjFxyXG4gIGxldCBjdXJyZW50RXZlbnRJbmRleCA9IDA7Ly8g44Kk44OZ44Oz44OI6YWN5YiX44Gu57eo6ZuG6ZaL5aeL6KGMXHJcbiAgbGV0IGNlbGxJbmRleCA9IDI7Ly8g5YiX44Kk44Oz44OH44OD44Kv44K5XHJcbiAgbGV0IGNhbmNlbEV2ZW50ID0gZmFsc2U7Ly8g44Kk44OZ44Oz44OI44KS44Kt44Oj44Oz44K744Or44GZ44KL44GL44Gp44GG44GLXHJcbiAgbGV0IGxpbmVCdWZmZXIgPSBudWxsOy8v6KGM44OQ44OD44OV44KhXHJcbiAgY29uc3QgTlVNX1JPVyA9IDQ3Oy8vIO+8keeUu+mdouOBruihjOaVsFxyXG5cdFxyXG4gIGZ1bmN0aW9uIHNldElucHV0KCkge1xyXG4gICAgdGhpcy5hdHRyKCdjb250ZW50RWRpdGFibGUnLCAndHJ1ZScpO1xyXG4gICAgdGhpcy5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDEpO1xyXG4gICAgICByb3dJbmRleCA9IHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDE7XHJcbiAgICAgIGNlbGxJbmRleCA9IHRoaXMuY2VsbEluZGV4O1xyXG4gICAgfSlcclxuICB9XHJcbiAgXHJcbiAgLy8g5pei5a2Y44Kk44OZ44Oz44OI44Gu6KGo56S6XHJcbiAgZnVuY3Rpb24gZHJhd0V2ZW50KCkge1xyXG4gICAgbGV0IGV2ZmxhZ21lbnQgPSB0cmFjay5ldmVudHMuc2xpY2UoY3VycmVudEV2ZW50SW5kZXgsIGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyk7XHJcbiAgICBlZGl0Vmlldy5zZWxlY3RBbGwoJ3RyJykucmVtb3ZlKCk7XHJcbiAgICBsZXQgc2VsZWN0ID0gZWRpdFZpZXcuc2VsZWN0QWxsKCd0cicpLmRhdGEoZXZmbGFnbWVudCk7XHJcbiAgICBsZXQgZW50ZXIgPSBzZWxlY3QuZW50ZXIoKTtcclxuICAgIGxldCByb3dzID0gZW50ZXIuYXBwZW5kKCd0cicpLmF0dHIoJ2RhdGEtaW5kZXgnLCAoZCwgaSkgPT4gaSk7XHJcbiAgICByb3dzLmVhY2goZnVuY3Rpb24gKGQsIGkpIHtcclxuICAgICAgbGV0IHJvdyA9IGQzLnNlbGVjdCh0aGlzKTtcclxuICAgICAgLy9yb3dJbmRleCA9IGk7XHJcbiAgICAgIHN3aXRjaCAoZC50eXBlKSB7XHJcbiAgICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuTm90ZTpcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLm1lYXN1cmUpOy8vIE1lYXNldXJlICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLnN0ZXBObyk7Ly8gU3RlcCAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5uYW1lKS5jYWxsKHNldElucHV0KS8vIE5vdGVcclxuICAgICAgICAgICAgLm9uKCdibHVyJywgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICBkLnNldE5vdGVOYW1lVG9Ob3RlKHRoaXMuaW5uZXJUZXh0KTtcclxuICAgICAgICAgICAgICB0aGlzLmlubmVyVGV4dCA9IGQubmFtZTtcclxuICAgICAgICAgICAgICAvLyBOb3RlTm/ooajnpLrjgoLmm7TmlrBcclxuICAgICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUuY2VsbHNbM10uaW5uZXJUZXh0ID0gZC5ub3RlO1xyXG4gICAgICAgICAgICB9KTsvLyBOb3RlXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5ub3RlKS5jYWxsKHNldElucHV0KS8vIE5vdGUgI1xyXG4gICAgICAgICAgICAub24oJ2JsdXInLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgIGQubm90ZSA9IHBhcnNlRmxvYXQodGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5jZWxsc1syXS5pbm5lclRleHQgPSBkLm5hbWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQuc3RlcCkuY2FsbChzZXRJbnB1dCkvLyBTdGVwXHJcbiAgICAgICAgICAgIC5vbignYmx1cicsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgZC5zdGVwID0gcGFyc2VJbnQodGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQuZ2F0ZSkuY2FsbChzZXRJbnB1dCk7Ly8gR2F0ZVxyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQudmVsKS5jYWxsKHNldElucHV0KTsvLyBWZWxvY2l0eVxyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQuY29tKS5jYWxsKHNldElucHV0KTsvLyBDb21tYW5kXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KCcnKTsvLyBNZWFzZXVyZSAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoJycpOy8vIFN0ZXAgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKVxyXG4gICAgICAgICAgICAuYXR0cih7ICdjb2xzcGFuJzogNiwgJ3RhYmluZGV4JzogMCB9KVxyXG4gICAgICAgICAgICAudGV4dCgnIC0tLSAoJyArIGQuc3RlcFRvdGFsICsgJykgLS0tICcpXHJcbiAgICAgICAgICAgIC5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgcm93SW5kZXggPSB0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLlRyYWNrRW5kOlxyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KCcnKTsvLyBNZWFzZXVyZSAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoJycpOy8vIFN0ZXAgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKVxyXG4gICAgICAgICAgICAuYXR0cih7ICdjb2xzcGFuJzogNiwgJ3RhYmluZGV4JzogMCB9KVxyXG4gICAgICAgICAgICAudGV4dCgnIC0tLSBUcmFjayBFbmQgLS0tICcpXHJcbiAgICAgICAgICAgIC5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgcm93SW5kZXggPSB0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocm93SW5kZXggPiAoZXZmbGFnbWVudC5sZW5ndGggLSAxKSkge1xyXG4gICAgICByb3dJbmRleCA9IGV2ZmxhZ21lbnQubGVuZ3RoIC0gMTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cdFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruODleOCqeODvOOCq+OCuVxyXG4gIGZ1bmN0aW9uIGZvY3VzRXZlbnQoKSB7XHJcbiAgICBsZXQgZXZyb3cgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKTtcclxuICAgIGxldCBldiA9IGV2cm93LmRhdHVtKCk7XHJcbiAgICBzd2l0Y2ggKGV2LnR5cGUpIHtcclxuICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuTm90ZTpcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1syXS5mb2N1cygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5UcmFja0VuZDpcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbMl0uZm9jdXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblx0XHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu5oy/5YWlXHJcbiAgZnVuY3Rpb24gaW5zZXJ0RXZlbnQocm93SW5kZXgpIHtcclxuICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci5leGVjKHtcclxuICAgICAgZXhlYygpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XTtcclxuICAgICAgICB0aGlzLmNlbGxJbmRleCA9IGNlbGxJbmRleDtcclxuICAgICAgICB0aGlzLnJvd0luZGV4ID0gcm93SW5kZXg7XHJcbiAgICAgICAgdGhpcy5leGVjXygpO1xyXG4gICAgICB9LFxyXG4gICAgICBleGVjXygpIHtcclxuICAgICAgICB2YXIgcm93ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5pbnNlcnRSb3codGhpcy5yb3dJbmRleCkpXHJcbiAgICAgICAgICAuZGF0dW0obmV3IGF1ZGlvLk5vdGVFdmVudCgpKTtcclxuICAgICAgICBjZWxsSW5kZXggPSAyO1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJyk7Ly8gTWVhc2V1cmUgI1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJyk7Ly8gU3RlcCAjXHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KVxyXG4gICAgICAgICAgLm9uKCdibHVyJywgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaW5uZXJUZXh0ICE9ICcnICYmIGQuc2V0Tm90ZU5hbWVUb05vdGUodGhpcy5pbm5lclRleHQpKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5pbm5lclRleHQgPSBkLm5hbWU7XHJcbiAgICAgICAgICAgICAgLy8gTm90ZU5v6KGo56S644KC5pu05pawXHJcbiAgICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLmNlbGxzWzNdLmlubmVyVGV4dCA9IGQubm90ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7Ly8gTm90ZVxyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dCk7Ly8gTm90ZSAjXHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KTsvLyBTdGVwXHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KTsvLyBHYXRlXHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KTsvLyBWZWxvY2l0eVxyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dCk7Ly8gQ29tbWFuZFxyXG4gICAgICAgIHJvdy5ub2RlKCkuY2VsbHNbdGhpcy5jZWxsSW5kZXhdLmZvY3VzKCk7XHJcbiAgICAgICAgcm93LmF0dHIoJ2RhdGEtbmV3JywgdHJ1ZSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZG8oKSB7XHJcbiAgICAgICAgdGhpcy5leGVjXygpO1xyXG4gICAgICB9LFxyXG4gICAgICB1bmRvKCkge1xyXG4gICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgdGhpcy5yb3cuY2VsbHNbdGhpcy5jZWxsSW5kZXhdLmZvY3VzKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICAvLyDmlrDopo/lhaXlipvooYzjga7norrlrppcclxuICBmdW5jdGlvbiBlbmROZXdJbnB1dChkb3duID0gdHJ1ZSkge1xyXG4gICAgZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnLCBudWxsKTtcclxuICAgIC8vIDHjgaTliY3jga7jg47jg7zjg4jjg4fjg7zjgr/jgpLmpJzntKLjgZnjgotcclxuICAgIGxldCBiZWZvcmVDZWxscyA9IFtdO1xyXG4gICAgbGV0IHNyID0gcm93SW5kZXggLSAxO1xyXG4gICAgd2hpbGUgKHNyID49IDApIHtcclxuICAgICAgdmFyIHRhcmdldCA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tzcl0pO1xyXG4gICAgICBpZiAodGFyZ2V0LmRhdHVtKCkudHlwZSA9PT0gYXVkaW8uRXZlbnRUeXBlLk5vdGUpIHtcclxuICAgICAgICBiZWZvcmVDZWxscyA9IHRhcmdldC5ub2RlKCkuY2VsbHM7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgLS1zcjtcclxuICAgIH1cclxuICAgIC8vIOePvuWcqOOBrue3qOmbhuihjFxyXG4gICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxscztcclxuICAgIGxldCBldiA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmRhdHVtKCk7XHJcbiAgICAvLyDjgqjjg5njg7Pjg4jjgpLnlJ/miJDjgZnjgotcclxuICAgIC8vIOODh+ODvOOCv+OBjOS9leOCguWFpeWKm+OBleOCjOOBpuOBhOOBquOBhOOBqOOBjeOBr+OAgTHjgaTliY3jga7jg47jg7zjg4jjg4fjg7zjgr/jgpLopIfoo73jgZnjgovjgIJcclxuICAgIC8vIDHjgaTliY3jga7jg47jg7zjg4jjg4fjg7zjgr/jgYzjgarjgYTjgajjgY3jgoTkuI3mraPjg4fjg7zjgr/jga7loLTlkIjjga/jgIHjg4fjg5Xjgqnjg6vjg4jlgKTjgpLku6PlhaXjgZnjgovjgIJcclxuICAgIGxldCBub3RlTm8gPSAwO1xyXG4gICAgaWYgKGNlbGxJbmRleCA9PSAyKSB7XHJcbiAgICAgIGxldCBub3RlID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF0uaW5uZXJUZXh0O1xyXG4gICAgICBldi5zZXROb3RlTmFtZVRvTm90ZShub3RlLCAoYmVmb3JlQ2VsbHNbMl0gPyBiZWZvcmVDZWxsc1syXS5pbm5lclRleHQgOiAnJykpO1xyXG4gICAgICBub3RlTm8gPSBldi5ub3RlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbm90ZU5vID0gcGFyc2VGbG9hdChjdXJSb3dbM10uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1szXSA/IGJlZm9yZUNlbGxzWzNdLmlubmVyVGV4dCA6ICc2MCcpKTtcclxuICAgIH1cclxuICAgIGlmIChpc05hTihub3RlTm8pKSBub3RlTm8gPSA2MDtcclxuICAgIGxldCBzdGVwID0gcGFyc2VGbG9hdChjdXJSb3dbNF0uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1s0XSA/IGJlZm9yZUNlbGxzWzRdLmlubmVyVGV4dCA6ICc5NicpKTtcclxuICAgIGlmIChpc05hTihzdGVwKSkgc3RlcCA9IDk2O1xyXG4gICAgbGV0IGdhdGUgPSBwYXJzZUZsb2F0KGN1clJvd1s1XS5pbm5lclRleHQgfHwgKGJlZm9yZUNlbGxzWzVdID8gYmVmb3JlQ2VsbHNbNV0uaW5uZXJUZXh0IDogJzI0JykpO1xyXG4gICAgaWYgKGlzTmFOKGdhdGUpKSBnYXRlID0gMjQ7XHJcbiAgICBsZXQgdmVsID0gcGFyc2VGbG9hdChjdXJSb3dbNl0uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1s2XSA/IGJlZm9yZUNlbGxzWzZdLmlubmVyVGV4dCA6ICcxLjAnKSk7XHJcbiAgICBpZiAoaXNOYU4odmVsKSkgdmVsID0gMS4wXHJcbiAgICBsZXQgY29tID0gLypjdXJSb3dbN10uaW5uZXJUZXh0IHx8IGJlZm9yZUNlbGxzWzddP2JlZm9yZUNlbGxzWzddLmlubmVyVGV4dDoqL25ldyBhdWRpby5Db21tYW5kKCk7XHJcblxyXG4gICAgZXYubm90ZSA9IG5vdGVObztcclxuICAgIGV2LnN0ZXAgPSBzdGVwO1xyXG4gICAgZXYuZ2F0ZSA9IGdhdGU7XHJcbiAgICBldi52ZWwgPSB2ZWw7XHJcbiAgICBldi5jb21tYW5kID0gY29tO1xyXG4gICAgLy8gICAgICAgICAgICB2YXIgZXYgPSBuZXcgYXVkaW8uTm90ZUV2ZW50KHN0ZXAsIG5vdGVObywgZ2F0ZSwgdmVsLCBjb20pO1xyXG4gICAgLy8g44OI44Op44OD44Kv44Gr44OH44O844K/44KS44K744OD44OIXHJcbiAgICB0cmFjay5pbnNlcnRFdmVudChldiwgcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleCk7XHJcbiAgICBpZiAoZG93bikge1xyXG4gICAgICBpZiAocm93SW5kZXggPT0gKE5VTV9ST1cgLSAxKSkge1xyXG4gICAgICAgICsrY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgKytyb3dJbmRleDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8g5oy/5YWl5b6M44CB5YaN5o+P55S7XHJcbiAgICBkcmF3RXZlbnQoKTtcclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICB9XHJcblxyXG4gIGRyYXdFdmVudCgpO1xyXG4gIHdoaWxlICh0cnVlKSB7XHJcbiAgICBjb25zb2xlLmxvZygnbmV3IGxpbmUnLCByb3dJbmRleCwgdHJhY2suZXZlbnRzLmxlbmd0aCk7XHJcbiAgICBpZiAodHJhY2suZXZlbnRzLmxlbmd0aCA9PSAwIHx8IHJvd0luZGV4ID4gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgfVxyXG4gICAga2V5bG9vcDpcclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgIGxldCBpbnB1dCA9IHlpZWxkIGNhbmNlbEV2ZW50O1xyXG4gICAgICBzd2l0Y2ggKGlucHV0LmlucHV0Q29tbWFuZC5pZCkge1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmVudGVyLmlkOi8vRW50ZXJcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdDUi9MRicpO1xyXG4gICAgICAgICAgLy8g54++5Zyo44Gu6KGM44GM5paw6KaP44GL57eo6ZuG5Lit44GLXHJcbiAgICAgICAgICBsZXQgZmxhZyA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3Jyk7XHJcbiAgICAgICAgICBpZiAoZmxhZykge1xyXG4gICAgICAgICAgICBlbmROZXdJbnB1dCgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy/mlrDopo/nt6jpm4bkuK3jga7ooYzjgafjgarjgZHjgozjgbDjgIHmlrDopo/lhaXlipvnlKjooYzjgpLmjL/lhaVcclxuICAgICAgICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQucmlnaHQuaWQ6Ly8gcmlnaHQgQ3Vyc29yXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNlbGxJbmRleCsrO1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIGlmIChjZWxsSW5kZXggPiAoY3VyUm93W3Jvd0luZGV4XS5jZWxscy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgIGNlbGxJbmRleCA9IDI7XHJcbiAgICAgICAgICAgICAgaWYgKHJvd0luZGV4IDwgKGN1clJvdy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGVuZE5ld0lucHV0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICArK3Jvd0luZGV4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5udW1iZXIuaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgICAgIGxldCBjdXJEYXRhID0gZDMuc2VsZWN0KGN1clJvdykuZGF0dW0oKTtcclxuICAgICAgICAgICAgaWYgKGN1ckRhdGEudHlwZSAhPSBhdWRpby5FdmVudFR5cGUuTm90ZSkge1xyXG4gICAgICAgICAgICAgIC8v5paw6KaP57eo6ZuG5Lit44Gu6KGM44Gn44Gq44GR44KM44Gw44CB5paw6KaP5YWl5Yqb55So6KGM44KS5oy/5YWlXHJcbiAgICAgICAgICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgIGNlbGxJbmRleCA9IDM7XHJcbiAgICAgICAgICAgICAgbGV0IGNlbGwgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XTtcclxuICAgICAgICAgICAgICBjZWxsLmlubmVyVGV4dCA9IGlucHV0Lm51bWJlcjtcclxuICAgICAgICAgICAgICBsZXQgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICAgIHNlbC5jb2xsYXBzZShjZWxsLCAxKTtcclxuICAgICAgICAgICAgICAvLyBzZWwuc2VsZWN0KCk7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLm5vdGUuaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgICAgIGxldCBjdXJEYXRhID0gZDMuc2VsZWN0KGN1clJvdykuZGF0dW0oKTtcclxuICAgICAgICAgICAgaWYgKGN1ckRhdGEudHlwZSAhPSBhdWRpby5FdmVudFR5cGUuTm90ZSkge1xyXG4gICAgICAgICAgICAgIC8v5paw6KaP57eo6ZuG5Lit44Gu6KGM44Gn44Gq44GR44KM44Gw44CB5paw6KaP5YWl5Yqb55So6KGM44KS5oy/5YWlXHJcbiAgICAgICAgICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgIGxldCBjZWxsID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF07XHJcbiAgICAgICAgICAgICAgY2VsbC5pbm5lclRleHQgPSBpbnB1dC5ub3RlO1xyXG4gICAgICAgICAgICAgIGxldCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICAgICAgc2VsLmNvbGxhcHNlKGNlbGwsIDEpO1xyXG4gICAgICAgICAgICAgIC8vIHNlbC5zZWxlY3QoKTtcclxuICAgICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQubGVmdC5pZDovLyBsZWZ0IEN1cnNvclxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIC0tY2VsbEluZGV4O1xyXG4gICAgICAgICAgICBpZiAoY2VsbEluZGV4IDwgMikge1xyXG4gICAgICAgICAgICAgIGlmIChyb3dJbmRleCA9PSAwKSB7XHJcblxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgICAgICAgICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLS1yb3dJbmRleDtcclxuICAgICAgICAgICAgICAgIGNlbGxJbmRleCA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxscy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnVwLmlkOi8vIFVwIEN1cnNvclxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICAgICAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocm93SW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgLS1yb3dJbmRleDtcclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgLS1jdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5kb3duLmlkOi8vIERvd24gQ3Vyc29yXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgICAgICAgICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgICAgICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyb3dJbmRleCA9PSAoTlVNX1JPVyAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgaWYgKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cpIDw9ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgICsrY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgKytyb3dJbmRleDtcclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQucGFnZURvd24uaWQ6Ly8gUGFnZSBEb3duIOOCreODvFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPCAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggKz0gTlVNX1JPVztcclxuICAgICAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCAtPSBOVU1fUk9XO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnBhZ2VVcC5pZDovLyBQYWdlIFVwIOOCreODvFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggLT0gTlVNX1JPVztcclxuICAgICAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6vjgqLjg4Pjg5dcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5zY3JvbGxVcC5pZDpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICAgIC0tY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6vjg4Djgqbjg7NcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5zY3JvbGxEb3duLmlkOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVykgPD0gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICsrY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDlhYjpoK3ooYzjgavnp7vli5VcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5ob21lLmlkOlxyXG4gICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICByb3dJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOacgOe1guihjOOBq+enu+WLlVxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmVuZC5pZDpcclxuICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCAhPSAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgIHJvd0luZGV4ID0gMDtcclxuICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSB0cmFjay5ldmVudHMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOihjOWJiumZpFxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmRlbGV0ZS5pZDpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWYoKHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXgpID09ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpe1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGV4ZWMoKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucm93SW5kZXggPSByb3dJbmRleDtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RXZlbnRJbmRleCA9IGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmV2ZW50ID0gdHJhY2suZXZlbnRzW3RoaXMucm93SW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnJvd0RhdGEgPSB0cmFjay5ldmVudHNbdGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBsaW5lQnVmZmVyO1xyXG4gICAgICAgICAgICAgICAgICBsaW5lQnVmZmVyID0gdGhpcy5ldmVudDtcclxuICAgICAgICAgICAgICAgICAgdHJhY2suZGVsZXRlRXZlbnQodGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHJlZG8oKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGxpbmVCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgIGxpbmVCdWZmZXIgPSB0aGlzLmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICB0cmFjay5kZWxldGVFdmVudCh0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdW5kbygpIHtcclxuICAgICAgICAgICAgICAgICAgbGluZUJ1ZmZlciA9IHRoaXMubGluZUJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgICAgdHJhY2suaW5zZXJ0RXZlbnQodGhpcy5ldmVudCwgdGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g44Op44Kk44Oz44OQ44OD44OV44Kh44Gu5YaF5a6544KS44Oa44O844K544OI44GZ44KLXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQubGluZVBhc3RlLmlkOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobGluZUJ1ZmZlcikge1xyXG4gICAgICAgICAgICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBleGVjKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm93SW5kZXggPSByb3dJbmRleDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBsaW5lQnVmZmVyO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYWNrLmluc2VydEV2ZW50KGxpbmVCdWZmZXIuY2xvbmUoKSwgcm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgcmVkbygpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFjay5pbnNlcnRFdmVudCh0aGlzLmxpbmVCdWZmZXIuY2xvbmUoKSwgdGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICB1bmRvKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYWNrLmRlbGV0ZUV2ZW50KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyByZWRvICAgXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQucmVkby5pZDpcclxuICAgICAgICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci5yZWRvKCk7XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyB1bmRvICBcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC51bmRvLmlkOlxyXG4gICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLnVuZG8oKTtcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOWwj+evgOe3muaMv+WFpVxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmluc2VydE1lYXN1cmUuaWQ6Ly8gKlxyXG4gICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBleGVjKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgICB0cmFjay5pbnNlcnRFdmVudChuZXcgYXVkaW8uTWVhc3VyZSgpLCB0aGlzLmluZGV4KTtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgcmVkbygpIHtcclxuICAgICAgICAgICAgICAgIHRyYWNrLmluc2VydEV2ZW50KG5ldyBhdWRpby5NZWFzdXJlKCksIHRoaXMuaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB1bmRvKCkge1xyXG4gICAgICAgICAgICAgICAgdHJhY2suZGVsZXRlRXZlbnQodGhpcy5pbmRleCk7XHJcbiAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOODh+ODleOCqeODq+ODiFxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2RlZmF1bHQnKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93U2VxdWVuY2VFZGl0b3IoZCkge1xyXG5cdCBkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdCBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdCBkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdCBpZiAoZC5wYW5lbCAmJiBkLnBhbmVsLmlzU2hvdykgcmV0dXJuO1xyXG5cdCBkLmVkaXRvckluc3RhbmNlID0gbmV3IFNlcXVlbmNlRWRpdG9yKGQpO1xyXG59XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9ldmVudEVtaXR0ZXIzJztcclxuaW1wb3J0ICogYXMgcHJvcCBmcm9tICcuL3Byb3AnO1xyXG5cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihzdGVwID0gMCxuYW1lID0gXCJcIil7XHJcblx0XHR0aGlzLnN0ZXAgPSBzdGVwO1xyXG5cdFx0dGhpcy5zdGVwTm8gPSAwO1xyXG5cdFx0dGhpcy5tZWFzdXJlID0gMDtcclxuXHRcdHRoaXMubmFtZSA9ICBuYW1lO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSlcclxue1xyXG5cdGF1ZGlvUGFyYW0uc2V0VmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZShhdWRpb1BhcmFtLHZhbHVlLHRpbWUpe1xyXG5cdGF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSl7XHJcblx0YXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2YWx1ZSx0aW1lKTtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tYW5kIHtcclxuXHRjb25zdHJ1Y3RvcihwaXRjaENvbW1hbmQgPSBzZXRWYWx1ZUF0VGltZSx2ZWxvY2l0eUNvbW1hbmQgPSBzZXRWYWx1ZUF0VGltZSlcclxuXHR7XHJcblx0XHR0aGlzLnByb2Nlc3NQaXRjaCA9IHBpdGNoQ29tbWFuZC5iaW5kKHRoaXMpO1xyXG5cdFx0dGhpcy5wcm9jZXNzVmVsb2NpdHkgPSB2ZWxvY2l0eUNvbW1hbmQuYmluZCh0aGlzKTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBFdmVudFR5cGUgID0ge1xyXG5cdE5vdGU6U3ltYm9sKCksXHJcblx0TWVhc3VyZTpTeW1ib2woKSxcclxuXHRUcmFja0VuZDpTeW1ib2woKVxyXG59XHJcblxyXG4vLyDlsI/nr4Dnt5pcclxuZXhwb3J0IGNsYXNzIE1lYXN1cmUgZXh0ZW5kcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigwKTtcclxuXHRcdHRoaXMudHlwZSA9IEV2ZW50VHlwZS5NZWFzdXJlO1xyXG4gICAgdGhpcy5zdGVwVG90YWwgPSAwO1xyXG5cdH1cclxuICBjbG9uZSgpe1xyXG4gICAgcmV0dXJuIG5ldyBNZWFzdXJlKCk7XHJcbiAgfVxyXG4gIHByb2Nlc3MoKXtcclxuICAgIFxyXG4gIH1cclxufVxyXG5cclxuLy8gVHJhY2sgRW5kXHJcbmV4cG9ydCBjbGFzcyBUcmFja0VuZCBleHRlbmRzIEV2ZW50QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHN1cGVyKDApO1xyXG5cdFx0dGhpcy50eXBlID0gRXZlbnRUeXBlLlRyYWNrRW5kO1xyXG5cdH1cclxuICBwcm9jZXNzKCl7XHJcbiAgICBcclxuICB9XHJcblx0XHJcbn1cclxuXHJcbnZhciBOb3RlcyA9IFtcclxuXHQnQyAnLFxyXG5cdCdDIycsXHJcblx0J0QgJyxcclxuXHQnRCMnLFxyXG5cdCdFICcsXHJcblx0J0YgJyxcclxuXHQnRiMnLFxyXG5cdCdHICcsXHJcblx0J0cjJyxcclxuXHQnQSAnLFxyXG5cdCdBIycsXHJcblx0J0IgJyxcclxuXTtcclxuXHJcbmV4cG9ydCBjbGFzcyBOb3RlRXZlbnQgZXh0ZW5kcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHN0ZXAgPSAwLG5vdGUgPSAwLGdhdGUgPSAwLHZlbCA9IDAuNSxjb21tYW5kID0gbmV3IENvbW1hbmQoKSl7XHJcblx0XHRzdXBlcihzdGVwKTtcclxuXHRcdHRoaXMudHJhbnNwb3NlXyA9IDAuMDtcclxuXHRcdHRoaXMubm90ZSA9IG5vdGU7XHJcblx0XHR0aGlzLmdhdGUgPSBnYXRlO1xyXG5cdFx0dGhpcy52ZWwgPSB2ZWw7XHJcblx0XHR0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xyXG5cdFx0dGhpcy5jb21tYW5kLmV2ZW50ID0gdGhpcztcclxuXHRcdHRoaXMudHlwZSA9IEV2ZW50VHlwZS5Ob3RlO1xyXG5cdFx0dGhpcy5zZXROb3RlTmFtZSgpO1xyXG5cdH1cclxuXHRcclxuICBjbG9uZSgpe1xyXG4gICAgcmV0dXJuIG5ldyBOb3RlRXZlbnQodGhpcy5zdGVwLHRoaXMubm90ZSx0aGlzLmdhdGUsdGhpcy52ZWwsdGhpcy5jb21tYW5kKTtcclxuICB9XHJcbiAgXHJcblx0c2V0Tm90ZU5hbWUoKXtcclxuXHRcdFx0bGV0IG9jdCA9IHRoaXMubm90ZSAvIDEyIHwgMDtcclxuXHRcdFx0dGhpcy5uYW1lID0gTm90ZXNbdGhpcy5ub3RlICUgMTJdICsgb2N0O1xyXG5cdH1cclxuXHJcblx0c2V0Tm90ZU5hbWVUb05vdGUobm90ZU5hbWUsZGVmYXVsdE5vdGVOYW1lID0gXCJcIilcclxuXHR7XHJcbiAgICB2YXIgbWF0Y2hlcyA9IG5vdGVOYW1lLm1hdGNoKC8oQyMpfChDKXwoRCMpfChEKXwoRSl8KEYjKXwoRil8KEcjKXwoRyl8KEEjKXwoQSl8KEIpL2kpO1xyXG5cdFx0aWYobWF0Y2hlcylcclxuXHRcdHtcclxuICAgICAgdmFyIG4gPSBtYXRjaGVzWzBdO1xyXG4gICAgICB2YXIgZ2V0TnVtYmVyID0gbmV3IFJlZ0V4cCgnKFswLTldezEsMn0pJyk7XHJcbi8vICAgICAgZ2V0TnVtYmVyLmNvbXBpbGUoKTtcclxuICAgICAgZ2V0TnVtYmVyLmV4ZWMobm90ZU5hbWUpO1xyXG4gICAgICB2YXIgbyA9IFJlZ0V4cC4kMTtcclxuICAgICAgaWYoIW8pe1xyXG4gICAgICAgIChuZXcgUmVnRXhwKCcoWzAtOV17MSwyfSknKSkuZXhlYyhkZWZhdWx0Tm90ZU5hbWUpOyAgICAgICAgXHJcbiAgICAgICAgbyA9IFJlZ0V4cC4kMTtcclxuICAgICAgICBpZighbyl7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmKG4ubGVuZ3RoID09PSAxKSBuICs9ICcgJztcclxuICAgICAgXHJcbiAgICAgIGlmKE5vdGVzLnNvbWUoKGQsaSk9PntcclxuICAgICAgICAgIGlmKGQgPT09IG4pe1xyXG4gICAgICAgICAgICB0aGlzLm5vdGUgPSBwYXJzZUZsb2F0KGkpICsgcGFyc2VGbG9hdChvKSAqIDEyO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cdFx0XHRcdFxyXG4gICAgICAgICB9KSlcclxuICAgICAge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2V0Tm90ZU5hbWUoKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHRcdH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc2V0Tm90ZU5hbWUoKTtcclxuICAgICAgcmV0dXJuIGZhbHNlOyBcclxuICAgIH1cclxuXHR9XHJcblx0XHJcblx0Z2V0IG5vdGUgKCl7XHJcblx0XHQgcmV0dXJuIHRoaXMubm90ZV87XHJcblx0fVxyXG5cdFxyXG5cdHNldCBub3RlKHYpe1xyXG5cdFx0IHRoaXMubm90ZV8gPSB2O1xyXG5cdFx0IHRoaXMuY2FsY1BpdGNoKCk7XHJcblx0XHQgdGhpcy5zZXROb3RlTmFtZSgpO1xyXG5cdH1cclxuXHRcclxuXHRzZXQgdHJhbnNwb3NlKHYpe1xyXG5cdFx0aWYodiAhPSB0aGlzLnRyYW5zcG9zZV8pe1xyXG5cdFx0XHR0aGlzLnRyYW5zcG9zZV8gPSB2O1xyXG5cdFx0XHR0aGlzLmNhbGNQaXRjaCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRjYWxjUGl0Y2goKXtcclxuXHRcdHRoaXMucGl0Y2ggPSAoNDQwLjAgLyAzMi4wKSAqIChNYXRoLnBvdygyLjAsKCh0aGlzLm5vdGUgKyB0aGlzLnRyYW5zcG9zZV8gLSA5KSAvIDEyKSkpO1xyXG5cdH1cclxuXHRcclxuXHRwcm9jZXNzKHRpbWUsdHJhY2spe1xyXG5cdFx0XHRpZih0aGlzLm5vdGUpe1xyXG5cdFx0XHRcdHRoaXMudHJhbnNvcHNlID0gdHJhY2sudHJhbnNwb3NlO1xyXG5cdFx0XHRcdGZvcihsZXQgaiA9IDAsamUgPSB0cmFjay5waXRjaGVzLmxlbmd0aDtqIDwgamU7KytqKXtcclxuXHRcdFx0XHRcdHRyYWNrLnBpdGNoZXNbal0ucHJvY2Vzcyh0aGlzLmNvbW1hbmQsdGhpcy5waXRjaCx0aW1lKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Zm9yKGxldCBqID0gMCxqZSA9IHRyYWNrLnZlbG9jaXRpZXMubGVuZ3RoO2ogPCBqZTsrK2ope1xyXG5cdFx0XHRcdFx0Ly8ga2V5b25cclxuXHRcdFx0XHRcdHRyYWNrLnZlbG9jaXRpZXNbal0ucHJvY2Vzcyh0aGlzLmNvbW1hbmQsdGhpcy52ZWwsdGltZSk7XHJcblx0XHRcdFx0XHQvLyBrZXlvZmZcclxuXHRcdFx0XHRcdHRyYWNrLnZlbG9jaXRpZXNbal0ucHJvY2Vzcyh0aGlzLmNvbW1hbmQsMCx0aW1lICsgdGhpcy5nYXRlICogdHJhY2suc2VxdWVuY2VyLnN0ZXBUaW1lXyApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVHJhY2sgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKHNlcXVlbmNlcil7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5ldmVudHMgPSBbXTtcclxuXHRcdHRoaXMucG9pbnRlciA9IDA7XHJcblx0XHR0aGlzLmV2ZW50cy5wdXNoKG5ldyBUcmFja0VuZCgpKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdzdGVwJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnZW5kJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnbmFtZScpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3RyYW5zcG9zZScpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0ZXAgPSAwO1xyXG5cdFx0dGhpcy5lbmQgPSBmYWxzZTtcclxuXHRcdHRoaXMucGl0Y2hlcyA9IFtdO1xyXG5cdFx0dGhpcy52ZWxvY2l0aWVzID0gW107XHJcblx0XHR0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuXHRcdHRoaXMubmFtZSA9ICcnO1xyXG5cdFx0dGhpcy50cmFuc3Bvc2UgPSAwO1xyXG5cdH1cclxuXHRcclxuXHRhZGRFdmVudChldil7XHJcblx0XHRpZih0aGlzLmV2ZW50cy5sZW5ndGggPiAxKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgYmVmb3JlID0gdGhpcy5ldmVudHNbdGhpcy5ldmVudHMubGVuZ3RoIC0gMl07XHJcblx0XHRcdHN3aXRjaChiZWZvcmUudHlwZSl7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTm90ZTpcclxuXHRcdFx0XHRcdGV2LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTWVhc3VyZTpcclxuXHRcdFx0XHRcdGV2LnN0ZXBObyA9IDE7XHJcblx0XHRcdFx0XHRldi5tZWFzdXJlID0gYmVmb3JlLm1lYXN1cmUgKyAxO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGV2LnN0ZXBObyA9IDE7XHJcblx0XHRcdGV2Lm1lYXN1cmUgPSAxO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5ldmVudHMuc3BsaWNlKHRoaXMuZXZlbnRzLmxlbmd0aCAtIDEsMCxldik7XHJcbiAgICB0aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKHRoaXMuZXZlbnRzLmxlbmd0aCAtIDIpO1xyXG5cdH1cclxuXHRcclxuXHRpbnNlcnRFdmVudChldixpbmRleCl7XHJcblx0XHRpZih0aGlzLmV2ZW50cy5sZW5ndGggPiAxICYmIGluZGV4ICE9IDApe1xyXG5cdFx0XHR2YXIgYmVmb3JlID0gdGhpcy5ldmVudHNbaW5kZXgtMV07XHJcblx0XHRcdHN3aXRjaChiZWZvcmUudHlwZSl7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTm90ZTpcclxuXHRcdFx0XHRcdGV2LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk1lYXN1cmU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlICsgMTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZXYuc3RlcE5vID0gMTtcclxuXHRcdFx0ZXYubWVhc3VyZSA9IDE7XHJcbiAgICB9XHJcblx0XHR0aGlzLmV2ZW50cy5zcGxpY2UoaW5kZXgsMCxldik7XHJcblx0XHRpZihldi50eXBlID09IEV2ZW50VHlwZS5NZWFzdXJlKXtcclxuXHRcdFx0dGhpcy51cGRhdGVTdGVwQW5kTWVhc3VyZShpbmRleCk7XHRcdFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy51cGRhdGVTdGVwKGluZGV4KTtcdFx0XHJcbiAgICB9XHJcbiAgICB0aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKGluZGV4KTtcclxuXHR9XHJcbiAgICBcclxuXHR1cGRhdGVTdGVwKGluZGV4KXtcclxuXHRcdGZvcihsZXQgaSA9IGluZGV4ICsgMSxlID0gdGhpcy5ldmVudHMubGVuZ3RoO2k8ZTsrK2kpXHJcblx0XHR7XHJcblx0XHRcdGxldCBiZWZvcmUgPSB0aGlzLmV2ZW50c1tpLTFdO1xyXG5cdFx0XHRsZXQgY3VycmVudCA9IHRoaXMuZXZlbnRzW2ldO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRjdXJyZW50LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0Y3VycmVudC5tZWFzdXJlID0gYmVmb3JlLm1lYXN1cmU7XHJcbiAgICAgICAgICBicmVhaztcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgYnJlYWs7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cdFx0XHRcclxuXHRcdH1cclxuXHR9XHRcclxuICBcclxuXHR1cGRhdGVTdGVwQW5kTWVhc3VyZShpbmRleCl7XHJcblx0XHRmb3IobGV0IGkgPSBpbmRleCArIDEsZSA9IHRoaXMuZXZlbnRzLmxlbmd0aDtpPGU7KytpKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgYmVmb3JlID0gdGhpcy5ldmVudHNbaS0xXTtcclxuXHRcdFx0bGV0IGN1cnJlbnQgPSB0aGlzLmV2ZW50c1tpXTtcclxuXHRcdFx0c3dpdGNoKGJlZm9yZS50eXBlKXtcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5Ob3RlOlxyXG5cdFx0XHRcdFx0Y3VycmVudC5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGN1cnJlbnQubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk1lYXN1cmU6XHJcblx0XHRcdFx0XHRjdXJyZW50LnN0ZXBObyA9IDE7XHJcblx0XHRcdFx0XHRjdXJyZW50Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZSArIDE7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcbiAgXHJcbiAgY2FsY01lYXN1cmVTdGVwVG90YWwoaW5kZXgpe1xyXG4gICAgbGV0IGluZGV4QWZ0ZXIgPSBpbmRleCArMTtcclxuICAgIGxldCBldmVudHMgPSB0aGlzLmV2ZW50cztcclxuICAgIGxldCBzdGVwVG90YWwgPSAwO1xyXG4gICAgbGV0IGV2ZW50ID0gZXZlbnRzW2luZGV4XTtcclxuICAgIC8vIOaMv+WFpeOBl+OBn+ODoeOCuOODo+ODvOOBrnN0ZXBUb3RhbOOCkuijnOato1xyXG4gICAgaWYoZXZlbnQudHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSl7XHJcbiAgICAgIC0taW5kZXg7XHJcbiAgICAgIHdoaWxlKGluZGV4ID49IDApe1xyXG4gICAgICAgIGxldCBldiA9IGV2ZW50c1tpbmRleF07XHJcbiAgICAgICAgaWYoZXYudHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RlcFRvdGFsICs9ICBldi5zdGVwO1xyXG4gICAgICAgIH1cclxuICAgICAgICAtLWluZGV4O1xyXG4gICAgICB9XHJcbiAgICAgIGV2ZW50LnN0ZXBUb3RhbCA9IHN0ZXBUb3RhbDtcclxuICAgICAgLy8g5b6M57aa44Gu44Oh44K444Oj44O844Guc3RlcFRvdGFs44KS6KOc5q2jXHJcbiAgICAgIHN0ZXBUb3RhbCA9IDA7XHJcbiAgICAgIGlmKGluZGV4QWZ0ZXIgPj0gKGV2ZW50cy5sZW5ndGggLTEpKVxyXG4gICAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKGV2ZW50c1tpbmRleEFmdGVyXS50eXBlID09IEV2ZW50VHlwZS5NZWFzdXJlKXtcclxuICAgICAgICBldmVudHNbaW5kZXhBZnRlcl0uc3RlcFRvdGFsID0gMDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUoaW5kZXhBZnRlciA8IChldmVudHMubGVuZ3RoIC0gMSkgKVxyXG4gICAgICB7XHJcbiAgICAgICAgaWYoZXZlbnRzW2luZGV4QWZ0ZXJdLnR5cGUgIT0gRXZlbnRUeXBlLk1lYXN1cmUpe1xyXG4gICAgICAgICAgc3RlcFRvdGFsICs9IGV2ZW50c1tpbmRleEFmdGVyKytdLnN0ZXA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGV2ZW50c1tpbmRleEFmdGVyXS5zdGVwVG90YWwgPSBzdGVwVG90YWw7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g5LiA44Gk5YmN44Gu44Oh44K444Oj44O844KS5o6i44GZXHJcbiAgICAgIGxldCBzdGFydEluZGV4ID0gMDtcclxuICAgICAgaWYoaW5kZXggPT0gMCl7XHJcbiAgICAgICAgc3RhcnRJbmRleCA9IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3RhcnRJbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHdoaWxlKHN0YXJ0SW5kZXggPiAwKXtcclxuICAgICAgICAgIC0tc3RhcnRJbmRleDtcclxuICAgICAgICAgIGlmKHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICsrc3RhcnRJbmRleDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHN0ZXBUb3RhbCA9IDA7XHJcbiAgICAgIHdoaWxlKHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnR5cGUgPT0gRXZlbnRUeXBlLk5vdGUpXHJcbiAgICAgIHtcclxuICAgICAgICBzdGVwVG90YWwgKz0gdGhpcy5ldmVudHNbc3RhcnRJbmRleF0uc3RlcDsgICAgICAgIFxyXG4gICAgICAgICsrc3RhcnRJbmRleDtcclxuICAgICAgfSAgXHJcbiAgICAgIGlmKHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpe1xyXG4gICAgICAgIHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnN0ZXBUb3RhbCA9IHN0ZXBUb3RhbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu5YmK6ZmkICBcclxuICBkZWxldGVFdmVudChpbmRleCl7XHJcbiAgICB2YXIgZXYgPSB0aGlzLmV2ZW50c1tpbmRleF07XHJcbiAgICB0aGlzLmV2ZW50cy5zcGxpY2UoaW5kZXgsMSk7XHJcbiAgICBpZihpbmRleCA9PSAwKXtcclxuICAgICAgdGhpcy5ldmVudHNbMF0ubWVhc3VyZSA9IDE7XHJcbiAgICAgIHRoaXMuZXZlbnRzWzBdLnN0ZXBObyA9IDE7XHJcbiAgICAgIGlmKHRoaXMuZXZlbnRzLmxlbmd0aCA+IDEpe1xyXG4gICAgICAgIHN3aXRjaChldi50eXBlKXtcclxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLm5vdGU6XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RlcCgxKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0ZXBBbmRNZWFzdXJlKDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZihpbmRleCA8PSAodGhpcy5ldmVudHMubGVuZ3RoIC0gMSkpXHJcbiAgICB7XHJcbiAgICAgICAgc3dpdGNoKGV2LnR5cGUpe1xyXG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUubm90ZTpcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGVwKGluZGV4IC0gMSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuTWVhc3VyZTpcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGVwQW5kTWVhc3VyZShpbmRleCAtIDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKGluZGV4KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBTRVFfU1RBVFVTID0ge1xyXG5cdFNUT1BQRUQ6MCxcclxuXHRQTEFZSU5HOjEsXHJcblx0UEFVU0VEOjJcclxufSA7XHJcblxyXG5leHBvcnQgY29uc3QgTlVNX09GX1RSQUNLUyA9IDQ7XHJcblxyXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdFxyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JwbScpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3RwYicpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JlYXQnKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdiYXInKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdyZXBlYXQnKTtcclxuXHJcblx0XHR0aGlzLmJwbSA9IDEyMC4wOyAvLyB0ZW1wb1xyXG5cdFx0dGhpcy50cGIgPSA5Ni4wOyAvLyDlm5vliIbpn7PnrKbjga7op6Plg4/luqZcclxuXHRcdHRoaXMuYmVhdCA9IDQ7XHJcblx0XHR0aGlzLmJhciA9IDQ7IC8vIFxyXG5cdFx0dGhpcy50cmFja3MgPSBbXTtcclxuXHRcdHRoaXMubnVtYmVyT2ZJbnB1dHMgPSAwO1xyXG5cdFx0dGhpcy5udW1iZXJPZk91dHB1dHMgPSAwO1xyXG5cdFx0dGhpcy5uYW1lID0gJ1NlcXVlbmNlcic7XHJcblx0XHRmb3IgKHZhciBpID0gMDtpIDwgTlVNX09GX1RSQUNLUzsrK2kpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMudHJhY2tzLnB1c2gobmV3IFRyYWNrKHRoaXMpKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddID0gbmV3IGF1ZGlvLlBhcmFtVmlldyhudWxsLCd0cmsnICsgaSArICdnJyx0cnVlKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddLnRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ2cnXS50eXBlID0gJ2dhdGUnO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddID0gbmV3IGF1ZGlvLlBhcmFtVmlldyhudWxsLCd0cmsnICsgaSArICdwJyx0cnVlKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddLnRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ3AnXS50eXBlID0gJ3BpdGNoJztcclxuXHRcdH1cclxuXHRcdHRoaXMuc3RhcnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRNZWFzdXJlXyA9IDA7XHJcblx0XHR0aGlzLmNhbGNTdGVwVGltZSgpO1xyXG5cdFx0dGhpcy5yZXBlYXQgPSBmYWxzZTtcclxuXHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuU1RPUFBFRDtcclxuXHJcblx0XHQvL1xyXG5cdFx0dGhpcy5vbignYnBtX2NoYW5lZ2VkJywoKT0+e3RoaXMuY2FsY1N0ZXBUaW1lKCk7fSk7XHJcblx0XHR0aGlzLm9uKCd0cGJfY2hhbmVnZWQnLCgpPT57dGhpcy5jYWxjU3RlcFRpbWUoKTt9KTtcclxuXHJcblx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5wdXNoKHRoaXMpO1xyXG5cdFx0aWYoU2VxdWVuY2VyLmFkZGVkKXtcclxuXHRcdFx0U2VxdWVuY2VyLmFkZGVkKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cclxuXHRkaXNwb3NlKCl7XHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGg7KytpKVxyXG5cdFx0e1xyXG5cdFx0XHRpZih0aGlzID09PSBTZXF1ZW5jZXIuc2VxdWVuY2Vyc1tpXSl7XHJcblx0XHRcdFx0IFNlcXVlbmNlci5zZXF1ZW5jZXJzLnNwbGljZShpLDEpO1xyXG5cdFx0XHRcdCBicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGggPT0gMClcclxuXHRcdHtcclxuXHRcdFx0aWYoU2VxdWVuY2VyLmVtcHR5KXtcclxuXHRcdFx0XHRTZXF1ZW5jZXIuZW1wdHkoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRjYWxjU3RlcFRpbWUoKXtcclxuXHRcdHRoaXMuc3RlcFRpbWVfID0gNjAuMCAvICggdGhpcy5icG0gKiB0aGlzLnRwYik7IFxyXG5cdH1cclxuXHRcclxuXHRzdGFydCh0aW1lKXtcclxuXHRcdGlmKHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlNUT1BQRUQgfHwgdGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUEFVU0VEICl7XHJcblx0XHRcdHRoaXMuY3VycmVudFRpbWVfID0gdGltZSB8fCBhdWRpby5jdHguY3VycmVudFRpbWUoKTtcclxuXHRcdFx0dGhpcy5zdGFydFRpbWVfICA9IHRoaXMuY3VycmVudFRpbWVfO1xyXG5cdFx0XHR0aGlzLnN0YXR1c18gPSBTRVFfU1RBVFVTLlBMQVlJTkc7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHN0b3AoKXtcclxuXHRcdGlmKHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcgfHwgdGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUEFVU0VEKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnRyYWNrcy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQucGl0Y2hlcy5mb3JFYWNoKChwKT0+e1xyXG5cdFx0XHRcdFx0cC5zdG9wKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0ZC52ZWxvY2l0aWVzLmZvckVhY2goKHYpPT57XHJcblx0XHRcdFx0XHR2LnN0b3AoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFxyXG5cdFx0XHR0aGlzLnN0YXR1c18gPSBTRVFfU1RBVFVTLlNUT1BQRUQ7XHJcblx0XHRcdHRoaXMucmVzZXQoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHBhdXNlKCl7XHJcblx0XHRpZih0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5QQVVTRUQ7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdHJlc2V0KCl7XHJcblx0XHR0aGlzLnN0YXJ0VGltZV8gPSAwO1xyXG5cdFx0dGhpcy5jdXJyZW50VGltZV8gPSAwO1xyXG5cdFx0dGhpcy50cmFja3MuZm9yRWFjaCgodHJhY2spPT57XHJcblx0XHRcdHRyYWNrLmVuZCA9ICF0cmFjay5ldmVudHMubGVuZ3RoO1xyXG5cdFx0XHR0cmFjay5zdGVwID0gMDtcclxuXHRcdFx0dHJhY2sucG9pbnRlciA9IDA7XHJcblx0XHR9KTtcclxuXHRcdHRoaXMuY2FsY1N0ZXBUaW1lKCk7XHJcblx0fVxyXG4gIC8vIOOCt+ODvOOCseODs+OCteODvOOBruWHpueQhlxyXG5cdHByb2Nlc3MgKHRpbWUpXHJcblx0e1xyXG5cdFx0dGhpcy5jdXJyZW50VGltZV8gPSB0aW1lIHx8IGF1ZGlvLmN0eC5jdXJyZW50VGltZSgpO1xyXG5cdFx0dmFyIGN1cnJlbnRTdGVwID0gKHRoaXMuY3VycmVudFRpbWVfICAtIHRoaXMuc3RhcnRUaW1lXyArIDAuMSkgLyB0aGlzLnN0ZXBUaW1lXztcclxuXHRcdGxldCBlbmRjb3VudCA9IDA7XHJcblx0XHRmb3IodmFyIGkgPSAwLGwgPSB0aGlzLnRyYWNrcy5sZW5ndGg7aSA8IGw7KytpKXtcclxuXHRcdFx0dmFyIHRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdGlmKCF0cmFjay5lbmQpe1xyXG5cdFx0XHRcdHdoaWxlKHRyYWNrLnN0ZXAgPD0gY3VycmVudFN0ZXAgJiYgIXRyYWNrLmVuZCApe1xyXG5cdFx0XHRcdFx0aWYodHJhY2sucG9pbnRlciA+PSB0cmFjay5ldmVudHMubGVuZ3RoICl7XHJcblx0XHRcdFx0XHRcdHRyYWNrLmVuZCA9IHRydWU7XHJcblx0XHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dmFyIGV2ZW50ID0gdHJhY2suZXZlbnRzW3RyYWNrLnBvaW50ZXIrK107XHJcblx0XHRcdFx0XHRcdHZhciBwbGF5VGltZSA9IHRyYWNrLnN0ZXAgKiB0aGlzLnN0ZXBUaW1lXyArIHRoaXMuc3RhcnRUaW1lXztcclxuXHRcdFx0XHRcdFx0ZXZlbnQucHJvY2VzcyhwbGF5VGltZSx0cmFjayk7XHJcblx0XHRcdFx0XHRcdHRyYWNrLnN0ZXAgKz0gZXZlbnQuc3RlcDtcclxuLy9cdFx0XHRcdFx0Y29uc29sZS5sb2codHJhY2sucG9pbnRlcix0cmFjay5ldmVudHMubGVuZ3RoLHRyYWNrLmV2ZW50c1t0cmFjay5wb2ludGVyXSx0cmFjay5zdGVwLGN1cnJlbnRTdGVwLHRoaXMuY3VycmVudFRpbWVfLHBsYXlUaW1lKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0KytlbmRjb3VudDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0aWYoZW5kY291bnQgPT0gdGhpcy50cmFja3MubGVuZ3RoKXtcclxuXHRcdFx0dGhpcy5zdG9wKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOaOpee2mlxyXG5cdGNvbm5lY3QoYyl7XHJcblx0XHR2YXIgdHJhY2sgPSBjLmZyb20ucGFyYW0udHJhY2s7XHJcblx0XHRpZihjLmZyb20ucGFyYW0udHlwZSA9PT0gJ3BpdGNoJyl7XHJcblx0XHRcdHRyYWNrLnBpdGNoZXMucHVzaChTZXF1ZW5jZXIubWFrZVByb2Nlc3MoYykpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dHJhY2sudmVsb2NpdGllcy5wdXNoKFNlcXVlbmNlci5tYWtlUHJvY2VzcyhjKSk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOWJiumZpFxyXG5cdGRpc2Nvbm5lY3QoYyl7XHJcblx0XHR2YXIgdHJhY2sgPSBjLmZyb20ucGFyYW0udHJhY2s7XHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0cmFjay5waXRjaGVzLmxlbmd0aDsrK2kpe1xyXG5cdFx0XHRpZihjLnRvLm5vZGUgPT09IHRyYWNrLnBpdGNoZXNbaV0udG8ubm9kZSAmJiBjLnRvLnBhcmFtID09PSB0cmFjay5waXRjaGVzW2ldLnRvLnBhcmFtKXtcclxuXHRcdFx0XHR0cmFjay5waXRjaGVzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0cmFjay52ZWxvY2l0aWVzLmxlbmd0aDsrK2kpe1xyXG5cdFx0XHRpZihjLnRvLm5vZGUgPT09IHRyYWNrLnZlbG9jaXRpZXNbaV0udG8ubm9kZSAmJiBjLnRvLnBhcmFtID09PSB0cmFjay52ZWxvY2l0aWVzW2ldLnRvLnBhcmFtKXtcclxuXHRcdFx0XHR0cmFjay5waXRjaGVzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBtYWtlUHJvY2VzcyhjKXtcclxuXHRcdGlmKGMudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRyZXR1cm4gIHtcclxuXHRcdFx0XHR0bzpjLnRvLFxyXG5cdFx0XHRcdHByb2Nlc3M6IChjb20sdix0KT0+e1xyXG5cdFx0XHRcdFx0Yy50by5ub2RlLmF1ZGlvTm9kZS5wcm9jZXNzKGMudG8sY29tLHYsdCk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRzdG9wOmZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0XHRjLnRvLm5vZGUuYXVkaW9Ob2RlLnN0b3AoYy50byk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9O1xyXG5cdFx0fSBcclxuXHRcdHZhciBwcm9jZXNzO1xyXG5cdFx0aWYoYy50by5wYXJhbS50eXBlID09PSAncGl0Y2gnKXtcclxuXHRcdFx0cHJvY2VzcyA9IChjb20sdix0KSA9PiB7XHJcblx0XHRcdFx0Y29tLnByb2Nlc3NQaXRjaChjLnRvLnBhcmFtLmF1ZGlvUGFyYW0sdix0KTtcclxuXHRcdFx0fTtcdFx0XHRcdFx0XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRwcm9jZXNzID1cdChjb20sdix0KT0+e1xyXG5cdFx0XHRcdGNvbS5wcm9jZXNzVmVsb2NpdHkoYy50by5wYXJhbS5hdWRpb1BhcmFtLHYsdCk7XHJcblx0XHRcdH07XHRcdFx0XHRcdFxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0dG86Yy50byxcclxuXHRcdFx0cHJvY2Vzczpwcm9jZXNzLFxyXG5cdFx0XHRzdG9wOmZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0Yy50by5wYXJhbS5hdWRpb1BhcmFtLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHR9XHJcblxyXG5cdHN0YXRpYyBleGVjKClcclxuXHR7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShTZXF1ZW5jZXIuZXhlYyk7XHJcblx0XHRcdGxldCBlbmRjb3VudCA9IDA7XHJcblx0XHRcdGZvcih2YXIgaSA9IDAsZSA9IFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aDtpIDwgZTsrK2kpe1xyXG5cdFx0XHRcdHZhciBzZXEgPSBTZXF1ZW5jZXIuc2VxdWVuY2Vyc1tpXTtcclxuXHRcdFx0XHRpZihzZXEuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHRcdFx0c2VxLnByb2Nlc3MoYXVkaW8uY3R4LmN1cnJlbnRUaW1lKTtcclxuXHRcdFx0XHR9IGVsc2UgaWYoc2VxLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5TVE9QUEVEKXtcclxuXHRcdFx0XHRcdCsrZW5kY291bnQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmKGVuZGNvdW50ID09IFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aClcclxuXHRcdFx0e1xyXG5cdFx0XHRcdFNlcXVlbmNlci5zdG9wU2VxdWVuY2VzKCk7XHJcblx0XHRcdFx0aWYoU2VxdWVuY2VyLnN0b3BwZWQpe1xyXG5cdFx0XHRcdFx0U2VxdWVuY2VyLnN0b3BwZWQoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g44K344O844Kx44Oz44K55YWo5L2T44Gu44K544K/44O844OIXHJcblx0c3RhdGljIHN0YXJ0U2VxdWVuY2VzKHRpbWUpe1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuU1RPUFBFRCB8fCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QQVVTRUQgKVxyXG5cdFx0e1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQuc3RhcnQodGltZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlBMQVlJTkc7XHJcblx0XHRcdFNlcXVlbmNlci5leGVjKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdC8vIOOCt+ODvOOCseODs+OCueWFqOS9k+OBruWBnOatolxyXG5cdHN0YXRpYyBzdG9wU2VxdWVuY2VzKCl7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QTEFZSU5HIHx8IFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBBVVNFRCApe1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQuc3RvcCgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8g44K344O844Kx44Oz44K55YWo5L2T44Gu44Od44O844K6XHRcclxuXHRzdGF0aWMgcGF1c2VTZXF1ZW5jZXMoKXtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGQucGF1c2UoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuUEFVU0VEO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuU2VxdWVuY2VyLnNlcXVlbmNlcnMgPSBbXTtcclxuU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5TVE9QUEVEOyBcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgVVVJRCBmcm9tICcuL3V1aWQuY29yZSc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9FdmVudEVtaXR0ZXIzJztcclxuZXhwb3J0IGNvbnN0IG5vZGVIZWlnaHQgPSA1MDtcclxuZXhwb3J0IGNvbnN0IG5vZGVXaWR0aCA9IDEwMDtcclxuZXhwb3J0IGNvbnN0IHBvaW50U2l6ZSA9IDE2O1xyXG5cclxuLy8gcGFuZWwgd2luZG93XHJcbmV4cG9ydCBjbGFzcyBQYW5lbCAgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKHNlbCxwcm9wKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRpZighcHJvcCB8fCAhcHJvcC5pZCl7XHJcblx0XHRcdHByb3AgPSBwcm9wID8gKHByb3AuaWQgPSAnaWQtJyArIFVVSUQuZ2VuZXJhdGUoKSxwcm9wKSA6eyBpZDonaWQtJyArIFVVSUQuZ2VuZXJhdGUoKX07XHJcblx0XHR9XHJcblx0XHR0aGlzLmlkID0gcHJvcC5pZDtcclxuXHRcdHNlbCA9IHNlbCB8fCBkMy5zZWxlY3QoJyNjb250ZW50Jyk7XHJcblx0XHR0aGlzLnNlbGVjdGlvbiA9IFxyXG5cdFx0c2VsXHJcblx0XHQuYXBwZW5kKCdkaXYnKVxyXG5cdFx0LmF0dHIocHJvcClcclxuXHRcdC5hdHRyKCdjbGFzcycsJ3BhbmVsJylcclxuXHRcdC5kYXR1bSh0aGlzKTtcclxuXHJcblx0XHQvLyDjg5Hjg43jg6vnlKhEcmFn44Gd44Gu5LuWXHJcblxyXG5cdFx0dGhpcy5oZWFkZXIgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2hlYWRlcicpLmNhbGwodGhpcy5kcmFnKTtcclxuXHRcdHRoaXMuYXJ0aWNsZSA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnYXJ0aWNsZScpO1xyXG5cdFx0dGhpcy5mb290ZXIgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2Zvb3RlcicpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdkaXYnKVxyXG5cdFx0LmNsYXNzZWQoJ3BhbmVsLWNsb3NlJyx0cnVlKVxyXG5cdFx0Lm9uKCdjbGljaycsKCk9PntcclxuXHRcdFx0dGhpcy5lbWl0KCdkaXNwb3NlJyk7XHJcblx0XHRcdHRoaXMuZGlzcG9zZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdH1cdFxyXG5cclxuXHRnZXQgbm9kZSgpIHtcclxuXHRcdHJldHVybiB0aGlzLnNlbGVjdGlvbi5ub2RlKCk7XHJcblx0fVxyXG5cdGdldCB4ICgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2xlZnQnKSk7XHJcblx0fVxyXG5cdHNldCB4ICh2KXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdsZWZ0Jyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCB5ICgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3RvcCcpKTtcclxuXHR9XHJcblx0c2V0IHkgKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3RvcCcsdiArICdweCcpO1xyXG5cdH1cclxuXHRnZXQgd2lkdGgoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd3aWR0aCcpKTtcclxuXHR9XHJcblx0c2V0IHdpZHRoKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3dpZHRoJywgdiArICdweCcpO1xyXG5cdH1cclxuXHRnZXQgaGVpZ2h0KCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnaGVpZ2h0JykpO1xyXG5cdH1cclxuXHRzZXQgaGVpZ2h0KHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2hlaWdodCcsdiArICdweCcpO1xyXG5cdH1cclxuXHRcclxuXHRkaXNwb3NlKCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5yZW1vdmUoKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uID0gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0c2hvdygpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknLCd2aXNpYmxlJyk7XHJcblx0XHR0aGlzLmVtaXQoJ3Nob3cnKTtcclxuXHR9XHJcblxyXG5cdGhpZGUoKXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd2aXNpYmlsaXR5JywnaGlkZGVuJyk7XHJcblx0XHR0aGlzLmVtaXQoJ2hpZGUnKTtcclxuXHR9XHJcblx0XHJcblx0Z2V0IGlzU2hvdygpe1xyXG5cdFx0cmV0dXJuIHRoaXMuc2VsZWN0aW9uICYmIHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd2aXNpYmlsaXR5JykgPT09ICd2aXNpYmxlJztcclxuXHR9XHJcbn1cclxuXHJcblBhbmVsLnByb3RvdHlwZS5kcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcblx0XHQub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oZCl7XHJcblx0XHRcdGNvbnNvbGUubG9nKGQpO1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCgnIycgKyBkLmlkKTtcclxuXHRcdFxyXG5cdFx0ZDMuc2VsZWN0KCcjY29udGVudCcpXHJcblx0XHQuYXBwZW5kKCdkaXYnKVxyXG5cdFx0LmF0dHIoe2lkOidwYW5lbC1kdW1teS0nICsgZC5pZCxcclxuXHRcdFx0J2NsYXNzJzoncGFuZWwgcGFuZWwtZHVtbXknfSlcclxuXHRcdC5zdHlsZSh7XHJcblx0XHRcdGxlZnQ6c2VsLnN0eWxlKCdsZWZ0JyksXHJcblx0XHRcdHRvcDpzZWwuc3R5bGUoJ3RvcCcpLFxyXG5cdFx0XHR3aWR0aDpzZWwuc3R5bGUoJ3dpZHRoJyksXHJcblx0XHRcdGhlaWdodDpzZWwuc3R5bGUoJ2hlaWdodCcpXHJcblx0XHR9KTtcclxuXHR9KVxyXG5cdC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBkdW1teSA9IGQzLnNlbGVjdCgnI3BhbmVsLWR1bW15LScgKyBkLmlkKTtcclxuXHJcblx0XHR2YXIgeCA9IHBhcnNlRmxvYXQoZHVtbXkuc3R5bGUoJ2xlZnQnKSkgKyBkMy5ldmVudC5keDtcclxuXHRcdHZhciB5ID0gcGFyc2VGbG9hdChkdW1teS5zdHlsZSgndG9wJykpICsgZDMuZXZlbnQuZHk7XHJcblx0XHRcclxuXHRcdGR1bW15LnN0eWxlKHsnbGVmdCc6eCArICdweCcsJ3RvcCc6eSArICdweCd9KTtcclxuXHR9KVxyXG5cdC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oZCl7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KCcjJyArIGQuaWQpO1xyXG5cdFx0dmFyIGR1bW15ID0gZDMuc2VsZWN0KCcjcGFuZWwtZHVtbXktJyArIGQuaWQpO1xyXG5cdFx0c2VsLnN0eWxlKFxyXG5cdFx0XHR7J2xlZnQnOmR1bW15LnN0eWxlKCdsZWZ0JyksJ3RvcCc6ZHVtbXkuc3R5bGUoJ3RvcCcpfVxyXG5cdFx0KTtcclxuXHRcdGQuZW1pdCgnZHJhZ2VuZCcpO1xyXG5cdFx0ZHVtbXkucmVtb3ZlKCk7XHJcblx0fSk7XHJcblx0XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL0V2ZW50RW1pdHRlcjMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFVuZG9NYW5hZ2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuYnVmZmVyID0gW107XHJcblx0XHR0aGlzLmluZGV4ID0gLTE7XHJcblx0fVxyXG5cdFxyXG5cdGNsZWFyKCl7XHJcbiAgICB0aGlzLmJ1ZmZlci5sZW5ndGggPSAwO1xyXG4gICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgdGhpcy5lbWl0KCdjbGVhcmVkJyk7XHJcblx0fVxyXG5cdFxyXG5cdGV4ZWMoY29tbWFuZCl7XHJcbiAgICBjb21tYW5kLmV4ZWMoKTtcclxuICAgIGlmICgodGhpcy5pbmRleCArIDEpIDwgdGhpcy5idWZmZXIubGVuZ3RoKVxyXG4gICAge1xyXG4gICAgICB0aGlzLmJ1ZmZlci5sZW5ndGggPSB0aGlzLmluZGV4ICsgMTtcclxuICAgIH1cclxuICAgIHRoaXMuYnVmZmVyLnB1c2goY29tbWFuZCk7XHJcbiAgICArK3RoaXMuaW5kZXg7XHJcbiAgICB0aGlzLmVtaXQoJ2V4ZWN1dGVkJyk7XHJcblx0fVxyXG5cdFxyXG5cdHJlZG8oKXtcclxuICAgIGlmICgodGhpcy5pbmRleCArIDEpIDwgKHRoaXMuYnVmZmVyLmxlbmd0aCkpXHJcbiAgICB7XHJcbiAgICAgICsrdGhpcy5pbmRleDtcclxuICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLmJ1ZmZlclt0aGlzLmluZGV4XTtcclxuICAgICAgY29tbWFuZC5yZWRvKCk7XHJcbiAgICAgIHRoaXMuZW1pdCgncmVkaWQnKTtcclxuICAgICAgaWYgKCh0aGlzLmluZGV4ICArIDEpID09IHRoaXMuYnVmZmVyLmxlbmd0aClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuZW1pdCgncmVkb0VtcHR5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHR9XHJcbiAgdW5kbygpXHJcbiAge1xyXG4gICAgaWYgKHRoaXMuYnVmZmVyLmxlbmd0aCA+IDAgJiYgdGhpcy5pbmRleCA+PSAwKVxyXG4gICAge1xyXG4gICAgICB2YXIgY29tbWFuZCA9IHRoaXMuYnVmZmVyW3RoaXMuaW5kZXhdO1xyXG4gICAgICBjb21tYW5kLnVuZG8oKTtcclxuICAgICAgLS10aGlzLmluZGV4O1xyXG4gICAgICB0aGlzLmVtaXQoJ3VuZGlkJyk7XHJcbiAgICAgIGlmICh0aGlzLmluZGV4IDwgMClcclxuICAgICAge1xyXG4gICAgICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgICAgICB0aGlzLmVtaXQoJ3VuZG9FbXB0eScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cdFxyXG59XHJcblxyXG52YXIgdW5kb01hbmFnZXIgPSBuZXcgVW5kb01hbmFnZXIoKTtcclxuZXhwb3J0IGRlZmF1bHQgdW5kb01hbmFnZXI7IiwiLypcbiBWZXJzaW9uOiBjb3JlLTEuMFxuIFRoZSBNSVQgTGljZW5zZTogQ29weXJpZ2h0IChjKSAyMDEyIExpb3NLLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFVVSUQoKXt9VVVJRC5nZW5lcmF0ZT1mdW5jdGlvbigpe3ZhciBhPVVVSUQuX2dyaSxiPVVVSUQuX2hhO3JldHVybiBiKGEoMzIpLDgpK1wiLVwiK2IoYSgxNiksNCkrXCItXCIrYigxNjM4NHxhKDEyKSw0KStcIi1cIitiKDMyNzY4fGEoMTQpLDQpK1wiLVwiK2IoYSg0OCksMTIpfTtVVUlELl9ncmk9ZnVuY3Rpb24oYSl7cmV0dXJuIDA+YT9OYU46MzA+PWE/MHxNYXRoLnJhbmRvbSgpKigxPDxhKTo1Mz49YT8oMHwxMDczNzQxODI0Kk1hdGgucmFuZG9tKCkpKzEwNzM3NDE4MjQqKDB8TWF0aC5yYW5kb20oKSooMTw8YS0zMCkpOk5hTn07VVVJRC5faGE9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9YS50b1N0cmluZygxNiksZD1iLWMubGVuZ3RoLGU9XCIwXCI7MDxkO2Q+Pj49MSxlKz1lKWQmMSYmKGM9ZStjKTtyZXR1cm4gY307XG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi4vc3JjL2F1ZGlvJztcclxuaW1wb3J0IHtpbml0VUksZHJhdyxzdmcsY3JlYXRlQXVkaW9Ob2RlVmlldyB9IGZyb20gJy4uL3NyYy9kcmF3JztcclxuXHJcblxyXG5kZXNjcmliZSgnQXVkaW9Ob2RlVGVzdCcsICgpID0+IHtcclxuICBcclxuICBhdWRpby5zZXRDdHgobmV3IEF1ZGlvQ29udGV4dCgpKTtcclxuXHR2YXIgb3NjLCBnYWluLCBmaWx0ZXIsIG91dCwgb3NjMiwgc3BsaXR0ZXIsIG1lcmdlcixlZyxzZXE7XHJcblxyXG5cdGJlZm9yZUVhY2goKCkgPT4ge1xyXG5cclxuXHR9KTtcclxuXHJcblx0aXQoXCJhdWRpby5BdWRpb05vZGVWaWV36L+95YqgXCIsICgpID0+IHtcclxuXHJcblx0XHRvc2MgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguY3JlYXRlT3NjaWxsYXRvcigpKTtcclxuXHRcdG9zYy54ID0gMTAwO1xyXG5cdFx0b3NjLnkgPSAyMDA7XHJcblxyXG5cdFx0Z2FpbiA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5jcmVhdGVHYWluKCkpO1xyXG5cclxuXHRcdGdhaW4ueCA9IDQwMDtcclxuXHRcdGdhaW4ueSA9IDIwMDtcclxuXHJcblx0XHRmaWx0ZXIgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguY3JlYXRlQmlxdWFkRmlsdGVyKCkpO1xyXG5cdFx0ZmlsdGVyLnggPSAyNTA7XHJcblx0XHRmaWx0ZXIueSA9IDMzMDtcclxuXHJcblx0XHRvdXQgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguZGVzdGluYXRpb24pO1xyXG5cdFx0b3V0LnggPSA3NTA7XHJcblx0XHRvdXQueSA9IDMwMDtcclxuXHJcblxyXG5cdFx0b3NjMiA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5jcmVhdGVPc2NpbGxhdG9yKCkpO1xyXG5cdFx0b3NjMi54ID0gMTAwO1xyXG5cdFx0b3NjMi55ID0gNjAwO1xyXG5cclxuXHRcdHNwbGl0dGVyID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxTcGxpdHRlcigpKTtcclxuXHRcdHNwbGl0dGVyLnggPSAyNTA7XHJcblx0XHRzcGxpdHRlci55ID0gNjAwO1xyXG5cclxuXHRcdG1lcmdlciA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5jcmVhdGVDaGFubmVsTWVyZ2VyKCkpO1xyXG5cdFx0bWVyZ2VyLnggPSA1MDA7XHJcblx0XHRtZXJnZXIueSA9IDYwMDtcclxuXHRcdFxyXG5cdFx0ZWcgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShuZXcgYXVkaW8uRUcoKSk7XHJcblx0XHRlZy54ID0gMTAwO1xyXG5cdFx0ZWcueSA9IDQwMDtcclxuXHRcdHNlcSA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKG5ldyBhdWRpby5TZXF1ZW5jZXIoKSk7XHJcblx0XHRzZXEueCA9IDIwMDtcclxuXHRcdHNlcS55ID0gNDAwO1xyXG5cclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoKS50b0VxdWFsKDkpO1xyXG5cdH0pO1xyXG5cclxuXHRpdCgn44Kz44ON44Kv44K344On44Oz6L+95Yqg5b6M44OB44Kn44OD44KvJywgKCkgPT4ge1xyXG5cclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChvc2MsIGZpbHRlcik7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qob3NjLCBnYWluLmlucHV0UGFyYW1zWzBdKTtcclxuXHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KGZpbHRlciwgZ2Fpbik7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoZ2Fpbiwgb3V0KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChtZXJnZXIsIG91dCk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDAgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAwIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAxIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMSB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMiB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDMgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDMgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAyIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiA1IH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogNSB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogNCB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDQgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qob3NjMiwgc3BsaXR0ZXIpO1xyXG5cdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6ZWcscGFyYW06ZWcub3V0cHV0fSx7bm9kZTpnYWluLHBhcmFtOmdhaW4uaW5wdXRQYXJhbXNbMF19KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpzZXEscGFyYW06c2VxLnRyazBnfSx7bm9kZTplZyxwYXJhbTplZy5nYXRlfSk7XHJcblxyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGgpLnRvRXF1YWwoMTQpO1xyXG5cdH0pO1xyXG5cdFx0XHJcblxyXG5cdGl0KCfjg47jg7zjg4nliYrpmaQnLCAoKSA9PiB7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShvc2MpO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUoc2VxKTtcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoKS50b0VxdWFsKDcpO1xyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGgpLnRvRXF1YWwoMTEpO1xyXG5cdFx0ZXhwZWN0KGF1ZGlvLlNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aCkudG9FcXVhbCgwKTsgXHJcblx0fSk7XHJcblx0XHJcblx0aXQoJ+OCs+ODjeOCr+OCt+ODp+ODs+WJiumZpCcsKCk9PntcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdCh7bm9kZTplZyxwYXJhbTplZy5vdXRwdXR9LHtub2RlOmdhaW4scGFyYW06Z2Fpbi5pbnB1dFBhcmFtc1swXX0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAwIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMCB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMSB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDEgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDIgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAzIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAzIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMiB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogNSB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDUgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDQgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiA0IH0pO1xyXG5cdFx0XHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aCkudG9FcXVhbCg0KTtcclxuXHR9KTtcclxuXHJcblx0aXQoJ+ODleOCo+ODq+OCv+ODvOWJiumZpOW+jOODgeOCp+ODg+OCrycsICgpID0+IHtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKGZpbHRlcik7XHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aCkudG9FcXVhbCg2KTtcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoKS50b0VxdWFsKDMpO1xyXG5cdFx0ZXhwZWN0KCgoKSA9PiB7XHJcblx0XHRcdHZhciByZXQgPSAwO1xyXG5cdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuZm9yRWFjaCgoZCkgPT4ge1xyXG5cdFx0XHRcdGlmIChkLmZyb20ubm9kZSA9PT0gZmlsdGVyIHx8IGQudG8ubm9kZSA9PT0gZmlsdGVyKSB7XHJcblx0XHRcdFx0XHQrK3JldDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gcmV0O1xyXG5cdFx0fSkoKSkudG9FcXVhbCgwKTtcclxuXHR9KTtcclxuXHRcclxuXHRpdCgn44OO44O844OJ5YWo5YmK6ZmkJywoKT0+e1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUoZWcpO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUoZ2Fpbik7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShvdXQpO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUoc3BsaXR0ZXIpO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUobWVyZ2VyKTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKG9zYzIpO1xyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGgpLnRvRXF1YWwoMCk7XHJcblx0fSk7XHJcblx0XHJcblx0aXQoJ+aPj+eUu+OBl+OBpuOBv+OCiycsKCk9PntcclxuXHRcdC8vXHRvc2MuYXVkaW9Ob2RlLnR5cGUgPSAnc2F3dG9vdGgnO1xyXG5cdFx0XHJcblx0XHR2YXIgY29udGVudCA9IGQzLnNlbGVjdCgnYm9keScpLmFwcGVuZCgnZGl2JykuYXR0cignaWQnLCdjb250ZW50JykuY2xhc3NlZCgnY29udGVudCcsdHJ1ZSk7XHJcblx0XHR2YXIgcGxheWVyID0gY29udGVudC5hcHBlbmQoJ2RpdicpLmF0dHIoe2lkOidwbGF5ZXInLGNsYXNzOidwbGF5ZXInfSk7XHJcblx0XHRwbGF5ZXIuYXBwZW5kKCdidXR0b24nKS5hdHRyKHtpZDoncGxheScsY2xhc3M6J3BsYXknfSkudGV4dCgn4pa8Jyk7XHJcblx0XHRwbGF5ZXIuYXBwZW5kKCdidXR0b24nKS5hdHRyKHtpZDonc3RvcCcsY2xhc3M6J3N0b3AnfSkudGV4dCgn4pagJyk7XHJcblx0XHRwbGF5ZXIuYXBwZW5kKCdidXR0b24nKS5hdHRyKHtpZDoncGF1c2UnLGNsYXNzOidwYXVzZSd9KS50ZXh0KCfvvJ0nKTtcclxuXHJcblx0XHRpbml0VUkoKTtcclxuXHRcdFxyXG5cdFx0Ly8g44Kz44ON44Kv44K344On44OzXHJcblx0XHRcclxuXHRcdGxldCBvdXQgPSBhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXNbMF07XHJcblx0XHRsZXQgb3NjID0gY3JlYXRlQXVkaW9Ob2RlVmlldygnT3NjaWxsYXRvcicpO1xyXG5cdFx0b3NjLnggPSA0MDA7XHJcblx0XHRvc2MueSA9IDMwMDtcclxuXHRcdGxldCBnYWluID0gY3JlYXRlQXVkaW9Ob2RlVmlldygnR2FpbicpO1xyXG5cdFx0Z2Fpbi54ID0gNTUwO1xyXG5cdFx0Z2Fpbi55ID0gMjAwO1xyXG5cdFx0bGV0IHNlcSA9IGNyZWF0ZUF1ZGlvTm9kZVZpZXcoJ1NlcXVlbmNlcicpO1xyXG5cdFx0c2VxLnggPSA1MDtcclxuXHRcdHNlcS55ID0gMzAwO1xyXG5cdFx0bGV0IGVnID0gY3JlYXRlQXVkaW9Ob2RlVmlldygnRUcnKTtcclxuXHRcdGVnLnggPSAyMDA7XHJcblx0XHRlZy55ID0gMjAwO1xyXG5cdFx0XHJcblx0XHQvLyDmjqXntppcclxuXHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOnNlcSxwYXJhbTpzZXEudHJrMGd9LHtub2RlOmVnLHBhcmFtOmVnLmdhdGV9KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6c2VxLHBhcmFtOnNlcS50cmswcH0se25vZGU6b3NjLHBhcmFtOm9zYy5mcmVxdWVuY3l9KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6b3NjLHBhcmFtOjB9LHtub2RlOmdhaW4scGFyYW06MH0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTplZyxwYXJhbTplZy5vdXRwdXR9LHtub2RlOmdhaW4scGFyYW06Z2Fpbi5nYWlufSk7XHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOmdhaW4scGFyYW06MH0se25vZGU6b3V0LHBhcmFtOjB9KTtcdFxyXG5cclxuXHRcdC8vIOOCs+ODjeOCr+OCt+ODp+ODs1xyXG5cdFx0XHJcblx0XHRsZXQgb3V0MSA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlc1swXTtcclxuXHRcdGxldCBvc2MxID0gY3JlYXRlQXVkaW9Ob2RlVmlldygnT3NjaWxsYXRvcicpO1xyXG5cdFx0b3NjMS54ID0gNDAwO1xyXG5cdFx0b3NjMS55ID0gNTAwO1xyXG5cdFx0bGV0IGdhaW4xID0gY3JlYXRlQXVkaW9Ob2RlVmlldygnR2FpbicpO1xyXG5cdFx0Z2FpbjEueCA9IDU1MDtcclxuXHRcdGdhaW4xLnkgPSA0MDA7XHJcblx0XHRsZXQgZWcxID0gY3JlYXRlQXVkaW9Ob2RlVmlldygnRUcnKTtcclxuXHRcdGVnMS54ID0gMjAwO1xyXG5cdFx0ZWcxLnkgPSA0MDA7XHJcblx0XHRcclxuXHRcdC8vIOaOpee2mlxyXG5cdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6c2VxLHBhcmFtOnNlcS50cmsxZ30se25vZGU6ZWcxLHBhcmFtOmVnMS5nYXRlfSk7XHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOnNlcSxwYXJhbTpzZXEudHJrMXB9LHtub2RlOm9zYzEscGFyYW06b3NjMS5mcmVxdWVuY3l9KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6b3NjMSxwYXJhbTowfSx7bm9kZTpnYWluMSxwYXJhbTowfSk7XHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOmVnMSxwYXJhbTplZzEub3V0cHV0fSx7bm9kZTpnYWluMSxwYXJhbTpnYWluMS5nYWlufSk7XHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOmdhaW4xLHBhcmFtOjB9LHtub2RlOm91dCxwYXJhbTowfSk7XHRcclxuXHJcblx0XHRcclxuXHRcdC8vIOOCt+ODvOOCseODs+OCueODh+ODvOOCv+OBruaMv+WFpVxyXG5cdFx0c2VxLmF1ZGlvTm9kZS5icG0gPSAxMjA7XHJcblx0XHRzZXEuYXVkaW9Ob2RlLnRyYWNrc1swXS5ldmVudHMucHVzaChuZXcgYXVkaW8uTm90ZUV2ZW50KDQ4LDQ3LDYsMS4wKSk7XHJcblx0XHRmb3IodmFyIGkgPSA0ODtpPCAxMTA7KytpKXtcclxuXHRcdFx0c2VxLmF1ZGlvTm9kZS50cmFja3NbMF0uZXZlbnRzLnB1c2gobmV3IGF1ZGlvLk5vdGVFdmVudCg0OCxpLDYsMS4wKSk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHNlcS5hdWRpb05vZGUudHJhY2tzWzFdLmV2ZW50cy5wdXNoKG5ldyBhdWRpby5Ob3RlRXZlbnQoMTkyLDAsNiwxLjApKTtcclxuXHRcdGZvcih2YXIgaSA9IDQ3O2k8IDExMDsrK2kpe1xyXG5cdFx0XHRzZXEuYXVkaW9Ob2RlLnRyYWNrc1sxXS5ldmVudHMucHVzaChuZXcgYXVkaW8uTm90ZUV2ZW50KDQ4LGksNiwxLjApKTtcclxuXHRcdH1cclxuXHRcdGRyYXcoKTtcclxuXHRcdGV4cGVjdCh0cnVlKS50b0JlKHRydWUpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdFxyXG5cdFxyXG5cdFxyXG59KTsiXX0=
