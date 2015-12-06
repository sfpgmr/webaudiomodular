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

},{"./audioNodeView":3,"./eg":5,"./sequencer":11}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.AudioNodeView = exports.ParamView = exports.AudioParamView = exports.STATUS_PLAY_PLAYED = exports.STATUS_PLAY_PLAYING = exports.STATUS_PLAY_NOT_PLAYED = exports.NodeViewBase = exports.ctx = undefined;
exports.setCtx = setCtx;
exports.getObjectCounter = getObjectCounter;
exports.updateCounter = updateCounter;
exports.defIsNotAPIObj = defIsNotAPIObj;

var _uuid = require('./uuid.core');

var _uuid2 = _interopRequireDefault(_uuid);

var _ui = require('./ui');

var ui = _interopRequireWildcard(_ui);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var counter = 0;
var ctx = exports.ctx = undefined;
function setCtx(c) {
	exports.ctx = ctx = c;
}

function getObjectCounter() {
	return counter;
}

function updateCounter(v) {
	if (v > counter) {
		counter = v;
		++counter;
	}
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

		_this.id = _uuid2.default.generate();
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

		_this2.id = _uuid2.default.generate();
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

		_this3.id = _uuid2.default.generate();
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

	_createClass(AudioNodeView, [{
		key: 'toJSON',
		value: function toJSON() {
			let ret = {};
			ret.id = this.id;
			ret.x = this.x;
			ret.y = this.y;
			ret.name = this.name;
			ret.removable = this.removable;
			if (this.audioNode.toJSON) {
				ret.audioNode = this.audioNode;
			} else {
				ret.params = {};
				this.params.forEach(function (d) {
					if (d.set) {
						ret.params[d.name] = d.get();
					}
				});
			}
			return ret;
		}

		// ノードの削除

	}], [{
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
		key: 'removeAllNodeViews',
		value: function removeAllNodeViews() {
			AudioNodeView.audioNodes.forEach(function (node) {
				if (node.audioNode.dispose) {
					node.audioNode.dispose();
				}
				for (var i = 0; i < AudioNodeView.audioConnections.length; ++i) {
					let n = AudioNodeView.audioConnections[i];
					if (n.from.node === node || n.to.node === node) {
						AudioNodeView.disconnect_(n);
						AudioNodeView.audioConnections.splice(i--, 1);
					}
				}
			});
			AudioNodeView.audioNodes.length = 0;
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

},{"./ui":12,"./uuid.core":14}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.svg = undefined;
exports.initUI = initUI;
exports.draw = draw;
exports.showPanel = showPanel;
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
		let value = d3.event.target.value;
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

},{"./audio":2,"./sequenceEditor":10,"./ui.js":12}],5:[function(require,module,exports){
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
		key: 'toJSON',
		value: function toJSON() {
			return {
				name: this.name,
				attack: this.attack,
				decay: this.decay,
				release: this.release,
				sustain: this.sustain,
				gain: this.gain
			};
		}
	}, {
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
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o) {
			let ret = new EG();
			ret.name = o.name;
			ret.attack = o.attack;
			ret.decay = o.decay;
			ret.release = o.release;
			ret.sustain = o.sustain;
			ret.gain = o.gain;
			return ret;
		}
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
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setAudioNodeCreators = setAudioNodeCreators;
exports.createAudioNodeViewfromJSON = createAudioNodeViewfromJSON;
exports.load = load;
exports.save = save;

var _audio = require('./audio.js');

var audio = _interopRequireWildcard(_audio);

var _ui = require('./ui.js');

var ui = _interopRequireWildcard(_ui);

var _draw = require('./draw');

var _sequenceEditor = require('./sequenceEditor');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var audioNodeCreators = {};
function setAudioNodeCreators(v) {
  audioNodeCreators = v;
}

function createAudioNodeViewfromJSON(o) {
  let audioNode;
  if (o.audioNode) {
    audioNode = audioNodeCreators[o.name].create(o.audioNode);
  } else {
    audioNode = audioNodeCreators[o.name].create();
  }
  let ret = audio.AudioNodeView.create(audioNode, audioNodeCreators[o.name].editor);
  if (o.params) {
    for (let i in o.params) {
      ret[i] = o.params[i];
    }
  }
  ret.id = o.id;
  ret.x = o.x;
  ret.y = o.y;
  ret.name = o.name;
  ret.removable = o.removable;
  return ret;
}

function load(data) {
  if (data) {
    data = JSON.parse(data);
    var audioNodeViews = {};
    if (data.audioNodes && data.audioConnections) {
      audio.AudioNodeView.removeAllNodeViews();
      data.audioNodes.forEach(function (d) {
        let nodeView = createAudioNodeViewfromJSON(d);
        audioNodeViews[nodeView.id] = nodeView;
      });
      // Connectionの作成
      data.audioConnections.forEach(function (d) {
        let fromNode = audioNodeViews[d.from.node.id];
        let fromParam = d.from.param.name ? fromNode.outputParams.find(function (e) {
          return e.name === d.from.param.name;
        }) : d.from.param;

        let toNode = audioNodeViews[d.to.node.id];
        let toParam = d.to.param.name ? toNode.inputParams.find(function (e) {
          return e.name === d.to.param.name;
        }) : d.to.param;

        audio.AudioNodeView.connect({ node: fromNode, param: fromParam }, { node: toNode, param: toParam });
      });
    }
  }
}

function save() {
  let saveData = {
    audioNodes: audio.AudioNodeView.audioNodes,
    audioConnections: [],
    objCounter: audio.getObjectCounter()
  };

  audio.AudioNodeView.audioConnections.forEach(function (d) {
    let dest = {
      from: {
        node: {
          id: d.from.node.id,
          name: d.from.node.name
        },
        param: d.from.param.name ? {
          name: d.from.param.name
        } : d.from.param
      },
      to: {
        node: {
          id: d.to.node.id,
          name: d.to.node.name
        },
        param: d.to.param.name ? {
          name: d.to.param.name
        } : d.to.param
      }
    };
    saveData.audioConnections.push(dest);
  });

  localStorage.setItem('data', JSON.stringify(saveData));
}

},{"./audio.js":2,"./draw":4,"./sequenceEditor":10,"./ui.js":12}],8:[function(require,module,exports){
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
				v_ = v;
				target.emit(propName + '_changed', v);
			}
		};
		Object.defineProperty(target, propName, opt);
	})();
}

},{}],9:[function(require,module,exports){
"use strict";

var _audio = require('./audio.js');

var audio = _interopRequireWildcard(_audio);

var _draw = require('./draw');

var _sequenceEditor = require('./sequenceEditor');

var _loaderSaver = require('./loaderSaver');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

window.onload = function () {
  audio.setCtx(new AudioContext());
  (0, _draw.initUI)();

  (0, _loaderSaver.setAudioNodeCreators)({
    'AudioDestinationNode': { create: function () {
        return audio.ctx.destination;
      }, editor: _draw.showPanel },
    'GainNode': { create: audio.ctx.createGain.bind(audio.ctx), editor: _draw.showPanel },
    'DelayNode': { create: audio.ctx.createDelay.bind(audio.ctx), editor: _draw.showPanel },
    'AudioBufferSourceNode': { create: audio.ctx.createBufferSource.bind(audio.ctx), editor: _draw.showPanel },
    'MediaElementAudioSourceNode': { create: audio.ctx.createMediaElementSource.bind(audio.ctx), editor: _draw.showPanel },
    'PannerNode': { create: audio.ctx.createPanner.bind(audio.ctx), editor: _draw.showPanel },
    'ConvolverNode': { create: audio.ctx.createConvolver.bind(audio.ctx), editor: _draw.showPanel },
    'AnalyserNode': { create: audio.ctx.createAnalyser.bind(audio.ctx), editor: _draw.showPanel },
    'ChannelSplitterNode': { create: audio.ctx.createChannelSplitter.bind(audio.ctx), editor: _draw.showPanel },
    'ChannelMergerNode': { create: audio.ctx.createChannelMerger.bind(audio.ctx), editor: _draw.showPanel },
    'DynamicsCompressorNode': { create: audio.ctx.createDynamicsCompressor.bind(audio.ctx), editor: _draw.showPanel },
    'BiquadFilterNode': { create: audio.ctx.createBiquadFilter.bind(audio.ctx), editor: _draw.showPanel },
    'OscillatorNode': { create: audio.ctx.createOscillator.bind(audio.ctx), editor: _draw.showPanel },
    'MediaStreamAudioSourceNode': { create: audio.ctx.createMediaStreamSource.bind(audio.ctx), editor: _draw.showPanel },
    'WaveShaperNode': { create: audio.ctx.createWaveShaper.bind(audio.ctx), editor: _draw.showPanel },
    'EG': { create: audio.EG.fromJSON, editor: _draw.showPanel },
    'Sequencer': { create: audio.Sequencer.fromJSON, editor: _sequenceEditor.showSequenceEditor }
  });

  // 出力ノードの作成（削除不可）
  let data = localStorage.getItem('data');
  if (false /*!data*/) {
      let out = audio.AudioNodeView.create(audio.ctx.destination, _draw.showPanel);
      out.x = window.innerWidth / 2;
      out.y = window.innerHeight / 2;
      out.removable = false;
    } else {
    (0, _loaderSaver.load)(data);
    if (audio.AudioNodeView.audioNodes.length == 0) {
      let out = audio.AudioNodeView.create(audio.ctx.destination, _draw.showPanel);
      out.x = window.innerWidth / 2;
      out.y = window.innerHeight / 2;
      out.removable = false;
    }
  }

  d3.select(window).on('resize', function () {
    if (_draw.svg) {
      _draw.svg.attr({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  });

  (0, _draw.draw)();
};

window.onbeforeunload = function () {
  (0, _loaderSaver.save)();
};

},{"./audio.js":2,"./draw":4,"./loaderSaver":7,"./sequenceEditor":10}],10:[function(require,module,exports){
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
    sequencer.audioNode.tpb = parseFloat(d3.event.target.value) || d3.select(this).attr('value');
  }).call(function () {
    var _this = this;

    sequencer.audioNode.on('tpb_changed', function (v) {
      _this.attr('value', v);
    });
  });

  // テンポ
  div.append('span').text('Tempo:');
  div.append('input')
  //      .datum(sequencer)
  .attr({ 'type': 'text', 'size': '3' }).attr('value', function (d) {
    return sequencer.audioNode.bpm;
  }).on('change', function () {
    sequencer.audioNode.bpm = parseFloat(d3.event.target.value);
  }).call(function () {
    var _this2 = this;

    sequencer.audioNode.on('bpm_changed', function (v) {
      _this2.attr('value', v);
    });
  });

  div.append('span').text('Beat:');
  div.append('input').datum(sequencer).attr({ 'type': 'text', 'size': '3', 'value': function (d) {
      return sequencer.audioNode.beat;
    } }).on('change', function (d) {
    sequencer.audioNode.beat = parseFloat(d3.select(this).attr('value'));
  });

  div.append('span').text(' / ');
  div.append('input').datum(sequencer).attr({ 'type': 'text', 'size': '3', 'value': function (d) {
      return sequencer.audioNode.bar;
    } }).on('change', function (d) {
    sequencer.audioNode.bar = parseFloat(d3.select(this).attr('value'));
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
  // for (var i = 0; i < 127; i += 8) {
  //   for (var j = i; j < (i + 8); ++j) {
  //     sequencer.audioNode.tracks[0].addEvent(new audio.NoteEvent(48, j, 6));
  //   }
  //   sequencer.audioNode.tracks[0].addEvent(new audio.Measure());
  // }

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
    var _this3 = this;

    let e = d3.event;
    console.log(e.keyCode);
    let key = KeyBind[e.keyCode];
    let ret = {};
    if (key) {
      key.some(function (d) {
        if (d.ctrlKey == e.ctrlKey && d.shiftKey == e.shiftKey && d.altKey == e.altKey && d.metaKey == e.metaKey) {
          ret = _this3.editor.next(d);
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

  function setBlur(dest) {
    switch (dest) {
      case 'note':
        return function () {
          this.on('blur', function (d) {
            d.setNoteNameToNote(this.innerText);
            this.innerText = d.name;
            // NoteNo表示も更新
            this.parentNode.cells[3].innerText = d.note;
          }); // Note
        };
        break;
      case 'noteName':
        return function () {
          this.on('blur', function (d) {
            let v = parseFloat(this.innerText);
            if (!isNaN(v)) {
              d.note = parseFloat(this.innerText);
              this.parentNode.cells[2].innerText = d.name;
            }
          });
        };
        break;
    }
    return function () {
      this.on('blur', function (d) {
        let v = parseFloat(this.innerText);
        if (!isNaN(v)) {
          d[dest] = v;
        }
      });
    };
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
          .call(setBlur('noteName'));
          row.append('td').text(d.note).call(setInput) // Note #
          .call(setBlur('note'));
          row.append('td').text(d.step).call(setInput) // Step
          .call(setBlur('step'));
          row.append('td').text(d.gate).call(setInput) // Gate
          .call(setBlur('gate'));
          row.append('td').text(d.vel).call(setInput) // Velocity
          .call(setBlur('vel'));
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
        row.append('td').call(setInput).call(setBlur('noteName'));
        row.append('td').call(setInput) // Note #
        .call(setBlur('note'));
        row.append('td').call(setInput) // Step
        .call(setBlur('step'));
        row.append('td').call(setInput) // Gate
        .call(setBlur('gate'));
        row.append('td').call(setInput) // Velocity
        .call(setBlur('vel'));
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
      let note = editView.node().rows[rowIndex].cells[cellIndex].innerText || (beforeCells[2] ? beforeCells[2].innerText : 'C 0');
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

  function addRow(delta) {
    rowIndex += delta;
    let rowLength = editView.node().rows.length;
    if (rowIndex >= rowLength) {
      let d = rowIndex - rowLength + 1;
      rowIndex = rowLength - 1;
      if (currentEventIndex + NUM_ROW - 1 < track.events.length - 1) {
        currentEventIndex += d;
        if (currentEventIndex + NUM_ROW - 1 > track.events.length - 1) {
          currentEventIndex = track.events.length - NUM_ROW + 1;
        }
      }
      drawEvent();
    }
    if (rowIndex < 0) {
      let d = rowIndex;
      rowIndex = 0;
      if (currentEventIndex != 0) {
        currentEventIndex += d;
        if (currentEventIndex < 0) {
          currentEventIndex = 0;
        }
        drawEvent();
      }
    }
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
                  break;
                } else {
                  addRow(1);
                  break;
                }
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
              if (rowIndex != 0) {
                if (d3.select(curRow[rowIndex]).attr('data-new')) {
                  endNewInput(false);
                  break;
                }
                cellIndex = editView.node().rows[rowIndex].cells.length - 1;
                addRow(-1);
                break;
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
            } else {
              addRow(-1);
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
            addRow(1);
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

},{"./audio":2,"./ui":12,"./undo":13}],11:[function(require,module,exports){
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

const CommandType = {
	setValueAtTime: 0,
	linearRampToValueAtTime: 1,
	exponentialRampToValueAtTime: 2
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

const commandFuncs = [setValueAtTime, linearRampToValueAtTime, exponentialRampToValueAtTime];

let Command = exports.Command = (function () {
	function Command() {
		let pitchCommand = arguments.length <= 0 || arguments[0] === undefined ? CommandType.setValueAtTime : arguments[0];
		let velocityCommand = arguments.length <= 1 || arguments[1] === undefined ? CommandType.setValueAtTime : arguments[1];

		_classCallCheck(this, Command);

		this.pitchCommand = pitchCommand;
		this.velocityCommand = velocityCommand;
		this.processPitch = commandFuncs[pitchCommand].bind(this);
		this.processVelocity = commandFuncs[velocityCommand].bind(this);
	}

	_createClass(Command, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				pitchCommand: this.pitchCommand,
				velocityCommand: this.velocityCommand
			};
		}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o) {
			return new Command(o.pitchCommand, o.velocityCommand);
		}
	}]);

	return Command;
})();

const EventType = exports.EventType = {
	Note: 0,
	Measure: 1,
	TrackEnd: 2
};

// 小節線

let Measure = exports.Measure = (function (_EventBase) {
	_inherits(Measure, _EventBase);

	function Measure() {
		_classCallCheck(this, Measure);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Measure).call(this, 0));

		_this.type = EventType.Measure;
		_this.stepTotal = 0;
		_this.startIndex = 0;
		_this.endIndex = 0;
		return _this;
	}

	_createClass(Measure, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				name: 'Measure',
				measure: this.measure,
				stepNo: this.stepNo,
				step: this.step,
				type: this.type,
				stepTotal: this.stepTotal,
				startIndex: this.startIndex,
				endIndex: this.endIndex
			};
		}
	}, {
		key: 'clone',
		value: function clone() {
			return new Measure();
		}
	}, {
		key: 'process',
		value: function process() {}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o) {
			let ret = new Measure();
			ret.measure = o.measure;
			ret.stepNo = o.stepNo;
			ret.step = o.step;
			ret.stepTotal = o.stepTotal;
			ret.startIndex = o.startIndex;
			ret.endIndex = o.endIndex;
			return ret;
		}
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
		key: 'toJSON',
		value: function toJSON() {
			return {
				name: 'NoteEvent',
				measure: this.measure,
				stepNo: this.stepNo,
				step: this.step,
				note: this.note,
				gate: this.gate,
				vel: this.vel,
				command: this.command,
				type: this.type
			};
		}
	}, {
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
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o) {
			let ret = new NoteEvent(o.step, o.note, o.gate, o.vel, Command.fromJSON(o.command));
			ret.measure = o.measure;
			ret.stepNo = o.stepNo;
			return ret;
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
		key: 'toJSON',
		value: function toJSON() {
			return {
				name: 'Track',
				events: this.events,
				step: this.step,
				trackName: this.name,
				transpose: this.transpose
			};
		}
	}, {
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
					case EventType.Note:
						this.updateStep(index - 1);
						break;
					case EventType.Measure:
						this.updateStepAndMeasure(index - 1);
						break;
				}
			}
			this.calcMeasureStepTotal(index);
		}
	}], [{
		key: 'fromJSON',
		value: function fromJSON(o, sequencer) {
			let ret = new Track(sequencer);
			ret.step = o.step;
			ret.name = o.trackName;
			ret.transpose = o.transpose;
			o.events.forEach(function (d) {
				switch (d.type) {
					case EventType.Note:
						ret.addEvent(NoteEvent.fromJSON(d));
						break;
					case EventType.Measure:
						ret.addEvent(Measure.fromJSON(d));
						break;
					case EventType.TrackEnd:
						//何もしない
						break;
				}
			});
			return ret;
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
		_this6.repeat = false;
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
		_this6.status_ = SEQ_STATUS.STOPPED;

		//
		_this6.on('bpm_changed', function () {
			_this6.calcStepTime();
		});
		_this6.on('tpb_changed', function () {
			_this6.calcStepTime();
		});

		Sequencer.sequencers.push(_this6);
		if (Sequencer.added) {
			Sequencer.added();
		}
		return _this6;
	}

	_createClass(Sequencer, [{
		key: 'toJSON',
		value: function toJSON() {
			return {
				name: 'Sequencer',
				bpm: this.bpm,
				tpb: this.tpb,
				beat: this.beat,
				bar: this.bar,
				tracks: this.tracks,
				repeat: this.repeat
			};
		}
	}, {
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
		key: 'fromJSON',
		value: function fromJSON(o) {
			let ret = new Sequencer();
			ret.bpm = o.bpm;
			ret.tpb = o.tpb;
			ret.beat = o.beat;
			ret.bar = o.bar;
			ret.tracks.length = 0;
			o.tracks.forEach(function (d) {
				ret.tracks.push(Track.fromJSON(d));
			});
			return ret;
		}
	}, {
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

},{"./audio":2,"./eventEmitter3":6,"./prop":8}],12:[function(require,module,exports){
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

},{"./EventEmitter3":1,"./uuid.core":14}],13:[function(require,module,exports){
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

},{"./EventEmitter3":1}],14:[function(require,module,exports){
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

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXEV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGF1ZGlvLmpzIiwic3JjXFxhdWRpb05vZGVWaWV3LmpzIiwic3JjXFxkcmF3LmpzIiwic3JjXFxlZy5qcyIsInNyY1xcZXZlbnRFbWl0dGVyMy5qcyIsInNyY1xcbG9hZGVyU2F2ZXIuanMiLCJzcmNcXHByb3AuanMiLCJzcmNcXHNjcmlwdC5qcyIsInNyY1xcc2VxdWVuY2VFZGl0b3IuanMiLCJzcmNcXHNlcXVlbmNlci5qcyIsInNyY1xcdWkuanMiLCJzcmNcXHVuZG8uanMiLCJzcmNcXHV1aWQuY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7Ozs7Ozs7O0FBQVksQ0FBQzs7OztrQkFpQ1csWUFBWTtBQXZCcEMsSUFBSSxNQUFNLEdBQUcsT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLFVBQVUsR0FBRyxHQUFHLEdBQUcsS0FBSzs7Ozs7Ozs7OztBQUFDLEFBVS9ELFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFO0FBQzdCLE1BQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ2IsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsTUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksS0FBSyxDQUFDO0NBQzNCOzs7Ozs7Ozs7QUFBQSxBQVNjLFNBQVMsWUFBWSxHQUFHOzs7Ozs7OztBQUF3QixBQVEvRCxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTOzs7Ozs7Ozs7O0FBQUMsQUFVM0MsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUNuRSxNQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLO01BQ3JDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRWxELE1BQUksTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUMvQixNQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDO0FBQzFCLE1BQUksU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUV4QyxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNuRSxNQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUN6Qjs7QUFFRCxTQUFPLEVBQUUsQ0FBQztDQUNYOzs7Ozs7Ozs7QUFBQyxBQVNGLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQ3JFLE1BQUksR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7QUFFMUMsTUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sS0FBSyxDQUFDOztBQUV0RCxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztNQUM3QixHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU07TUFDdEIsSUFBSTtNQUNKLENBQUMsQ0FBQzs7QUFFTixNQUFJLFVBQVUsS0FBSyxPQUFPLFNBQVMsQ0FBQyxFQUFFLEVBQUU7QUFDdEMsUUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUU5RSxZQUFRLEdBQUc7QUFDVCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDOUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUNsRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUN0RSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxLQUMvRTs7QUFFRCxTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2xELFVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztBQUVELGFBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtBQUNMLFFBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7QUFFTixTQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQixVQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBGLGNBQVEsR0FBRztBQUNULGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDMUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFBQyxNQUFNO0FBQUEsQUFDOUQsYUFBSyxDQUFDO0FBQUUsbUJBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQ2xFO0FBQ0UsY0FBSSxDQUFDLElBQUksRUFBRSxL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R0gsR0FBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtBQUN0QixTQUFPLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0VBQzdCLENBQUMsQ0FDRCxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFDaEIsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsTUFBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsZUFBZSxBQUFDLEFBQUMsRUFDNUU7QUFDQyxJQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDakIsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDdkMsS0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUNuQztHQUNEO0FBQ0QsTUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixNQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWxDLE1BQUksQ0FBQyxLQUFLLEVBQUUsQ0FDWCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQ1gsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNkLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFDLEVBQUU7V0FBSyxDQUFDLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQztJQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQ3BLLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNmLE1BQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUNyQixDQUFDOzs7QUFBQyxBQUdILEdBQUUsQ0FDRCxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFBRSxTQUFPLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0VBQUUsQ0FBQyxDQUNyRCxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUM7QUFDaEIsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEMsTUFBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsY0FBYyxBQUFDLEFBQUMsRUFDeEU7QUFDQyxJQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDaEIsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDdEMsS0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUNsQztHQUNEO0FBQ0QsTUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMs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Q0FBQzs7QUFFOUUsWUFBUSxHQUFHO0FBQ1QsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzlELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDbEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDdEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsS0FDL0U7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7QUFFRCxhQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07QUFDTCxRQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0FBRU4sU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsVUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVwRixjQUFRLEdBQUc7QUFDVCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzFELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzlELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUNsRTtBQUNFLGNBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxH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QUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsRUFBRTtHQUM5QixDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxDQUFDO0FBQ0YsS0FBRyxFQUFFLENBQUM7QUFDSixXQUFPLEVBQUUsR0FBRztBQUNaLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsYUFBYTtHQUN6QyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxJQUFJO0FBQ2IsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsTUFBTTtHQUNsQyxFQUFFO0FBQ0MsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxJQUFJO0FBQ2QsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsWUFBWSxDQUFDLFFBQVE7R0FDcEMsQ0FBQztBQUNKLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsSUFBSTtBQUNiLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsWUFBWSxDQUFDLE1BQU07R0FDbEMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsWUFBWSxDQUFDLFFBQVE7R0FDcEMsRUFBRTtBQUNDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsSUFBSTtBQUNkLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxVQUFVO0dBQ3RDLENBQUM7QUFDSixJQUFFLEVBQUUsQ0FBQztBQUNILFdBQU8sRUFBRSxFQUFFO0FBQ1gsV0FBTyxFQUFFLElBQUk7QUFDYixZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxRQUFRO0dBQ3BDLEVBQUU7QUFDQyxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxHQUFHO0FBQ1QsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxJQUFJO0dBQ2hDLEVBQUU7QUFDRCxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxHQUFHO0FBQ1QsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsSUFBSTtBQUNkLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxJQUFJO0dBQ2hDLENBQUM7QUFDSixJQUFFLEVBQUUsQ0FBQztBQUNILFdBQU8sRUFBRSxFQUFFO0FBQ1gsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxJQUFJO0dBQ2hDLENBQUM7QUFDRixJQUFFLEVBQUUsQ0FBQztBQUNILFdBQU8sRUFBRSxFQUFFO0FBQ1gsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxHQUFHO0dBQy9CLENBQUM7QUFDRixJQUFFLEVBQUUsQ0FBQztBQUNILFdBQU8sRUFBRSxFQUFFO0FBQ1gsVUFBTSxFQUFFLENBQUM7QUFDVCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsWUFBWSxDQUFDLE1BQU07R0FDbEMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxVQUFNLEVBQUUsQ0FBQztBQUNULFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsTUFBTTtHQUNsQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFVBQU0sRUFBRSxDQUFDO0FBQ1QsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxNQUFNO0dBQ2xDLENBQUM7QUFDRixJQUFFLEVBQUUsQ0FBQztBQUNILFdBQU8sRUFBRSxFQUFFO0FBQ1gsVUFBTSxFQUFFLENBQUM7QUFDVCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsWUFBWSxDQUFDLE1BQU07R0FDbEMsQ0FBQztBQUNGLEtBQUcsRUFBRSxDQUFDO0FBQ0osV0FBTyxFQUFFLEdBQUc7QUFDWixVQUFNLEVBQUUsQ0FBQztBQUNULFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsTUFBTTtHQUNsQyxDQUFDO0FBQ0YsS0FBRyxFQUFFLENBQUM7QUFDSixXQUFPLEVBQUUsR0FBRztBQUNaLFVBQU0sRUFBRSxDQUFDO0FBQ1QsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxNQUFNO0dBQ2xDLENBQUM7QUFDRixLQUFHLEVBQUUsQ0FBQztBQUNKLFdBQU8sRUFBRSxHQUFHO0FBQ1osVUFBTSxFQUFFLENBQUM7QUFDVCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsWUFBWSxDQUFDLE1BQU07R0FDbEMsQ0FBQztBQUNGLEtBQUcsRUFBRSxDQUFDO0FBQ0osV0FBTyxFQUFFLEdBQUc7QUFDWixVQUFNLEVBQUUsQ0FBQztBQUNULFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsTUFBTTtHQUNsQyxDQUFDO0FBQ0YsS0FBRyxFQUFFLENBQUM7QUFDSixXQUFPLEVBQUUsR0FBRztBQUNaLFVBQU0sRUFBRSxDQUFDO0FBQ1QsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxNQUFNO0dBQ2xDLENBQUM7QUFDRixLQUFHLEVBQUUsQ0FBQztBQUNKLFdBQU8sRUFBRSxHQUFHO0FBQ1osVUFBTSxFQUFFLENBQUM7QUFDVCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsWUFBWSxDQUFDLE1BQU07R0FDbEMsQ0FBQztBQUNGLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsR0FBRztBQUNULFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxFQUFFO0FBQ0MsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsR0FBRztBQUNULFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLElBQUk7QUFDZCxVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxFQUNEO0FBQ0UsV0FBTyxFQUFFLEVBQUU7QUFDWCxXQUFPLEVBQUUsSUFBSTtBQUNiLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsWUFBWSxDQUFDLElBQUk7R0FDaEMsQ0FBQztBQUNKLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsR0FBRztBQUNULFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxFQUFFO0FBQ0MsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsR0FBRztBQUNULFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLElBQUk7QUFDZCxVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxDQUFDO0FBQ0osSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxHQUFHO0FBQ1QsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxJQUFJO0dBQ2hDLEVBQUU7QUFDQyxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxHQUFHO0FBQ1QsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsSUFBSTtBQUNkLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxJQUFJO0dBQ2hDLENBQUM7QUFDSixJQUFFLEVBQUUsQ0FBQztBQUNILFdBQU8sRUFBRSxFQUFFO0FBQ1gsUUFBSSxFQUFFLEdBQUc7QUFDVCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxLQUFLO0FBQ2YsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsWUFBWSxDQUFDLElBQUk7R0FDaEMsRUFBRTtBQUNDLFdBQU8sRUFBRSxFQUFFO0FBQ1gsUUFBSSxFQUFFLEdBQUc7QUFDVCxXQUFPLEVBQUUsS0FBSztBQUNkLFlBQVEsRUFBRSxJQUFJO0FBQ2QsVUFBTSxFQUFFLEtBQUs7QUFDYixXQUFPLEVBQUUsS0FBSztBQUNkLGdCQUFZLEVBQUUsWUFBWSxDQUFDLElBQUk7R0FDaEMsQ0FBQztBQUNKLElBQUUsRUFBRSxDQUFDO0FBQ0gsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsR0FBRztBQUNULFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxFQUFFO0FBQ0MsV0FBTyxFQUFFLEVBQUU7QUFDWCxRQUFJLEVBQUUsR0FBRztBQUNULFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLElBQUk7QUFDZCxVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxDQUFDO0FBQ0osSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxHQUFHO0FBQ1QsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxJQUFJO0dBQ2hDLEVBQUU7QUFDQyxXQUFPLEVBQUUsRUFBRTtBQUNYLFFBQUksRUFBRSxHQUFHO0FBQ1QsV0FBTyxFQUFFLEtBQUs7QUFDZCxZQUFRLEVBQUUsSUFBSTtBQUNkLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxJQUFJO0dBQ2hDLENBQUM7QUFDSixJQUFFLEVBQUUsQ0FBQztBQUNILFdBQU8sRUFBRSxFQUFFO0FBQ1gsV0FBTyxFQUFFLElBQUk7QUFDYixZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxNQUFNO0dBQ2xDLENBQUM7QUFDRixJQUFFLEVBQUUsQ0FBQztBQUNILFdBQU8sRUFBRSxFQUFFO0FBQ1gsV0FBTyxFQUFFLElBQUk7QUFDYixZQUFRLEVBQUUsS0FBSztBQUNmLFVBQU0sRUFBRSxLQUFLO0FBQ2IsV0FBTyxFQUFFLEtBQUs7QUFDZCxnQkFBWSxFQUFFLFlBQVksQ0FBQyxTQUFTO0dBQ3JDLENBQUM7Q0FDSCxDQUFDOztJQUVTLGNBQWMsV0FBZCxjQUFjLEdBQ3pCLFNBRFcsY0FBYyxDQUNiLFNBQVMsRUFBRTt3QkFEWixjQUFjOztBQUV2QixNQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDakIsTUFBSSxDQUFDLFdBQVcsR0FBRyxVQXBaZixXQUFXLEVBb1pxQixDQUFDO0FBQ3JDLE1BQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQzNCLFdBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDakMsV0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNoQyxXQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLFdBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUM3QixXQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7QUFDN0IsV0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDL0MsTUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0UsTUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQzs7O0FBQUMsQUFHdkQsS0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdEMsS0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FDaEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQzlCLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FDeEQsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUM7V0FBSyxDQUFDO0dBQUEsQ0FBQyxDQUN2QixFQUFFLENBQUMsUUFBUSxFQUFFLFlBQVk7QUFDeEIsYUFBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQzlGLENBQUMsQ0FDRCxJQUFJLENBQUMsWUFBWTs7O0FBQ2hCLGFBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxVQUFDLENBQUMsRUFBSztBQUMzQyxZQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDdkIsQ0FBQyxDQUFDO0dBQ0osQ0FBQzs7O0FBQUMsQUFJTCxLQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsQyxLQUFHLENBQUMsTUFBTSxDQUFDLE9BQU87O0FBQUMsR0FFaEIsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FDckMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUM7V0FBSyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUc7R0FBQSxDQUFDLENBQzdDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBVztBQUN2QixhQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDN0QsQ0FBQyxDQUNELElBQUksQ0FBQyxZQUFZOzs7QUFDaEIsYUFBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQzNDLGFBQUssSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN2QixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7O0FBRUwsS0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDakMsS0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FDaEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUNoQixJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFVBQUMsQ0FBQzthQUFLLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSTtLQUFBLEVBQUUsQ0FBQyxDQUMvRSxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVMsQ0FBQyxFQUFDO0FBQ3ZCLGFBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0dBQ3RFLENBQUMsQ0FBQzs7QUFFTCxLQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvQixLQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUNoQixLQUFLLENBQUMsU0FBUyxDQUFDLENBQ2hCLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsVUFBQyxDQUFDO2FBQUssU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHO0tBQUEsRUFBRSxDQUFDLENBQzlFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBUyxDQUFDLEVBQUU7QUFDeEIsYUFBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7R0FDckUsQ0FBQzs7O0FBQUMsQUFJTCxNQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FDaEMsS0FBSyxFQUFFLENBQ1AsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUNiLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQ3RCLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDO2FBQUssUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUEsQUFBQztLQUFBLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7O0FBRWpFLE1BQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4RSxhQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO1dBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUEsQUFBQztHQUFBLENBQUMsQ0FBQztBQUMzRCxhQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QyxNQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEUsTUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxNQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyRCxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FB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QyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUTtBQUFDLFdBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUN0QixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUFDLEFBQzVDLGdCQUFNO0FBQUEsQUFDUixhQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTztBQUMxQixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7QUFBQyxBQUMxQixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7QUFBQyxBQUMxQixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUNiLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FDdkMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFZO0FBQ3ZCLG9CQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1dBQ3pDLENBQUMsQ0FBQztBQUNMLGdCQUFNO0FBQUEsQUFDUixhQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUTtBQUMzQixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7QUFBQyxBQUMxQixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7QUFBQyxBQUMxQixhQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUNiLElB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Q0FBQyxDQUFDO0FBQzNFLFlBQU0sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0tBQ2xCLE1BQU07QUFDTCxZQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBLEFBQUMsQ0FBQyxDQUFDO0tBQ2hHO0FBQ0QsUUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUMvQixRQUFJLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUEsQUFBQyxDQUFDLENBQUM7QUFDakcsUUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMzQixRQUFJLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUEsQUFBQyxDQUFDLENBQUM7QUFDakcsUUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMzQixRQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUEsQUFBQyxDQUFDLENBQUM7QUFDakcsUUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQTtBQUN6QixRQUFJLEdBQUcs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QUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBQztBQUNqQyxRQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDWjtHQUNEOzs7Ozs7MEJBR08sQ0FBQyxFQUFDO0FBQ1QsT0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLE9BQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBQztBQUNoQyxTQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsTUFBTTtBQUNOLFNBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRDtHQUNEOzs7Ozs7NkJBR1UsQ0FBQyxFQUFDO0FBQ1osT0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLFFBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBQyxFQUFFLENBQUMsRUFBQztBQUMxQyxRQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUM7QUFDckYsVUFBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsV0FBTTtLQUNOO0lBQ0Q7O0FBRUQsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFD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R0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUE7Q0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxTQUFPLENBQUMsR0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLEVBQUUsSUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBRSxDQUFDLElBQUUsQ0FBQyxDQUFBLEFBQUMsR0FBQyxFQUFFLElBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVUsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUEsR0FBRSxVQUFVLElBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBRSxDQUFDLElBQUUsQ0FBQyxHQUFDLEVBQUUsQ0FBQSxBQUFDLENBQUEsQUFBQyxHQUFDLEdBQUcsQ0FBQTtDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxPQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLE1BQUksQ0FBQyxFQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQSxBQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7Q0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuLy9cbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcbi8vIGB+YCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBvdmVycmlkZGVuIG9yXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxuLy8gaXMgYW4gRVM2IFN5bWJvbC5cbi8vXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBXZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGFyZ3NcbiAgICAsIGk7XG5cbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgICBpZiAoXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVycy5vbmNlKVxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXG4gICAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgICApIHtcbiAgICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAvL1xuICBpZiAoZXZlbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW3ByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRdO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxuLy9cbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmV4cG9ydCAqIGZyb20gJy4vYXVkaW9Ob2RlVmlldyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZWcnO1xyXG5leHBvcnQgKiBmcm9tICcuL3NlcXVlbmNlcic7XHJcbmV4cG9ydCBmdW5jdGlvbiBkdW1teSgpe307XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgVVVJRCBmcm9tICcuL3V1aWQuY29yZSc7XHJcbmltcG9ydCAqIGFzIHVpIGZyb20gJy4vdWknO1xyXG5cclxudmFyIGNvdW50ZXIgPSAwO1xyXG5leHBvcnQgdmFyIGN0eDtcclxuZXhwb3J0IGZ1bmN0aW9uIHNldEN0eChjKXtjdHggPSBjO31cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRPYmplY3RDb3VudGVyKCl7XHJcbiAgcmV0dXJuIGNvdW50ZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVDb3VudGVyKHYpXHJcbntcclxuICBpZih2ID4gY291bnRlcil7XHJcbiAgICBjb3VudGVyID0gdjtcclxuICAgICsrY291bnRlcjtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHggPSAwLCB5ID0gMCx3aWR0aCA9IHVpLm5vZGVXaWR0aCxoZWlnaHQgPSB1aS5ub2RlSGVpZ2h0LG5hbWUgPSAnJykge1xyXG5cdFx0dGhpcy54ID0geCA7XHJcblx0XHR0aGlzLnkgPSB5IDtcclxuXHRcdHRoaXMud2lkdGggPSB3aWR0aCA7XHJcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodCA7XHJcblx0XHR0aGlzLm5hbWUgPSBuYW1lO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFNUQVRVU19QTEFZX05PVF9QTEFZRUQgPSAwO1xyXG5leHBvcnQgY29uc3QgU1RBVFVTX1BMQVlfUExBWUlORyA9IDE7XHJcbmV4cG9ydCBjb25zdCBTVEFUVVNfUExBWV9QTEFZRUQgPSAyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZklzTm90QVBJT2JqKHRoaXNfLHYpe1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzXywnaXNOb3RBUElPYmonLHtcclxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRcdHdyaXRhYmxlOmZhbHNlLFxyXG5cdFx0XHR2YWx1ZTogdlxyXG5cdFx0fSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBdWRpb1BhcmFtVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoQXVkaW9Ob2RlVmlldyxuYW1lLCBwYXJhbSkge1xyXG5cdFx0c3VwZXIoMCwwLHVpLnBvaW50U2l6ZSx1aS5wb2ludFNpemUsbmFtZSk7XHJcblx0XHR0aGlzLmlkID0gVVVJRC5nZW5lcmF0ZSgpO1xyXG5cdFx0dGhpcy5hdWRpb1BhcmFtID0gcGFyYW07XHJcblx0XHR0aGlzLkF1ZGlvTm9kZVZpZXcgPSBBdWRpb05vZGVWaWV3O1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBhcmFtVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoQXVkaW9Ob2RlVmlldyxuYW1lLGlzb3V0cHV0KSB7XHJcblx0XHRzdXBlcigwLDAsdWkucG9pbnRTaXplLHVpLnBvaW50U2l6ZSxuYW1lKTtcclxuXHRcdHRoaXMuaWQgPSBVVUlELmdlbmVyYXRlKCk7XHJcblx0XHR0aGlzLkF1ZGlvTm9kZVZpZXcgPSBBdWRpb05vZGVWaWV3O1xyXG5cdFx0dGhpcy5pc091dHB1dCA9IGlzb3V0cHV0IHx8IGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBBdWRpb05vZGVWaWV3IGV4dGVuZHMgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihhdWRpb05vZGUsZWRpdG9yKVxyXG5cdHtcclxuXHRcdC8vIGF1ZGlvTm9kZSDjga/jg5njg7zjgrnjgajjgarjgovjg47jg7zjg4lcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmlkID0gVVVJRC5nZW5lcmF0ZSgpO1xyXG5cdFx0dGhpcy5hdWRpb05vZGUgPSBhdWRpb05vZGU7XHJcblx0XHR0aGlzLm5hbWUgPSBhdWRpb05vZGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvZnVuY3Rpb25cXHMoLiopXFwoLylbMV07XHJcblx0XHR0aGlzLmlucHV0UGFyYW1zID0gW107XHJcblx0XHR0aGlzLm91dHB1dFBhcmFtcyA9IFtdO1xyXG5cdFx0dGhpcy5wYXJhbXMgPSBbXTtcclxuXHRcdGxldCBpbnB1dEN5ID0gMSxvdXRwdXRDeSA9IDE7XHJcblx0XHRcclxuXHRcdHRoaXMucmVtb3ZhYmxlID0gdHJ1ZTtcclxuXHRcdFxyXG5cdFx0Ly8g44OX44Ot44OR44OG44Kj44O744Oh44K944OD44OJ44Gu6KSH6KO9XHJcblx0XHRmb3IgKHZhciBpIGluIGF1ZGlvTm9kZSkge1xyXG5cdFx0XHRpZiAodHlwZW9mIGF1ZGlvTm9kZVtpXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4vL1x0XHRcdFx0dGhpc1tpXSA9IGF1ZGlvTm9kZVtpXS5iaW5kKGF1ZGlvTm9kZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBhdWRpb05vZGVbaV0gPT09ICdvYmplY3QnKSB7XHJcblx0XHRcdFx0XHRpZiAoYXVkaW9Ob2RlW2ldIGluc3RhbmNlb2YgQXVkaW9QYXJhbSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldID0gbmV3IEF1ZGlvUGFyYW1WaWV3KHRoaXMsaSwgYXVkaW9Ob2RlW2ldKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5pbnB1dFBhcmFtcy5wdXNoKHRoaXNbaV0pO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBhcmFtcy5wdXNoKCgocCk9PntcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0bmFtZTppLFxyXG5cdFx0XHRcdFx0XHRcdFx0J2dldCc6KCkgPT4gcC5hdWRpb1BhcmFtLnZhbHVlLFxyXG5cdFx0XHRcdFx0XHRcdFx0J3NldCc6KHYpID0+e3AuYXVkaW9QYXJhbS52YWx1ZSA9IHY7fSxcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmFtOnAsXHJcblx0XHRcdFx0XHRcdFx0XHRub2RlOnRoaXNcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pKHRoaXNbaV0pKTtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXS55ID0gKDIwICogaW5wdXRDeSsrKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZihhdWRpb05vZGVbaV0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0XHRhdWRpb05vZGVbaV0uQXVkaW9Ob2RlVmlldyA9IHRoaXM7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV07XHJcblx0XHRcdFx0XHRcdGlmKHRoaXNbaV0uaXNPdXRwdXQpe1xyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0ueSA9ICgyMCAqIG91dHB1dEN5KyspO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0ueCA9IHRoaXMud2lkdGg7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5vdXRwdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnkgPSAoMjAgKiBpbnB1dEN5KyspO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuaW5wdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXSA9IGF1ZGlvTm9kZVtpXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEF1ZGlvTm9kZS5wcm90b3R5cGUsIGkpO1x0XHJcblx0XHRcdFx0XHRpZighZGVzYyl7XHJcblx0XHRcdFx0XHRcdGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRoaXMuYXVkaW9Ob2RlLl9fcHJvdG9fXywgaSk7XHRcclxuXHRcdFx0XHRcdH0gXHJcblx0XHRcdFx0XHRpZighZGVzYyl7XHJcblx0XHRcdFx0XHRcdGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRoaXMuYXVkaW9Ob2RlLGkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dmFyIHByb3BzID0ge307XHJcblxyXG4vL1x0XHRcdFx0XHRpZihkZXNjLmdldCl7XHJcblx0XHRcdFx0XHRcdFx0cHJvcHMuZ2V0ID0gKChpKSA9PiB0aGlzLmF1ZGlvTm9kZVtpXSkuYmluZChudWxsLCBpKTtcclxuLy9cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZihkZXNjLndyaXRhYmxlIHx8IGRlc2Muc2V0KXtcclxuXHRcdFx0XHRcdFx0cHJvcHMuc2V0ID0gKChpLCB2KSA9PiB7IHRoaXMuYXVkaW9Ob2RlW2ldID0gdjsgfSkuYmluZChudWxsLCBpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cHJvcHMuZW51bWVyYWJsZSA9IGRlc2MuZW51bWVyYWJsZTtcclxuXHRcdFx0XHRcdHByb3BzLmNvbmZpZ3VyYWJsZSA9IGRlc2MuY29uZmlndXJhYmxlO1xyXG5cdFx0XHRcdFx0Ly9wcm9wcy53cml0YWJsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0Ly9wcm9wcy53cml0YWJsZSA9IGRlc2Mud3JpdGFibGU7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpLHByb3BzKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cHJvcHMubmFtZSA9IGk7XHJcblx0XHRcdFx0XHRwcm9wcy5ub2RlID0gdGhpcztcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoZGVzYy5lbnVtZXJhYmxlICYmICFpLm1hdGNoKC8oLipfJCl8KG5hbWUpfChebnVtYmVyT2YuKiQpL2kpICYmICh0eXBlb2YgYXVkaW9Ob2RlW2ldKSAhPT0gJ0FycmF5Jyl7XHJcblx0XHRcdFx0XHRcdHRoaXMucGFyYW1zLnB1c2gocHJvcHMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuaW5wdXRTdGFydFkgPSBpbnB1dEN5ICogMjA7XHJcblx0XHR2YXIgaW5wdXRIZWlnaHQgPSAoaW5wdXRDeSArIHRoaXMubnVtYmVyT2ZJbnB1dHMpICogMjAgO1xyXG5cdFx0dmFyIG91dHB1dEhlaWdodCA9IChvdXRwdXRDeSArIHRoaXMubnVtYmVyT2ZPdXRwdXRzKSAqIDIwO1xyXG5cdFx0dGhpcy5vdXRwdXRTdGFydFkgPSBvdXRwdXRDeSAqIDIwO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBNYXRoLm1heCh0aGlzLmhlaWdodCxpbnB1dEhlaWdodCxvdXRwdXRIZWlnaHQpO1xyXG5cdFx0dGhpcy50ZW1wID0ge307XHJcblx0XHR0aGlzLnN0YXR1c1BsYXkgPSBTVEFUVVNfUExBWV9OT1RfUExBWUVEOy8vIG5vdCBwbGF5ZWQuXHJcblx0XHR0aGlzLnBhbmVsID0gbnVsbDtcclxuXHRcdHRoaXMuZWRpdG9yID0gZWRpdG9yLmJpbmQodGhpcyx0aGlzKTtcclxuXHR9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICBsZXQgcmV0ID0ge307XHJcbiAgICByZXQuaWQgPSB0aGlzLmlkO1xyXG4gICAgcmV0LnggPSB0aGlzLng7XHJcblx0XHRyZXQueSA9IHRoaXMueTtcclxuXHRcdHJldC5uYW1lID0gdGhpcy5uYW1lO1xyXG4gICAgcmV0LnJlbW92YWJsZSA9IHRoaXMucmVtb3ZhYmxlO1xyXG4gICAgaWYodGhpcy5hdWRpb05vZGUudG9KU09OKXtcclxuICAgICAgcmV0LmF1ZGlvTm9kZSA9IHRoaXMuYXVkaW9Ob2RlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0LnBhcmFtcyA9IHt9O1xyXG4gICAgICB0aGlzLnBhcmFtcy5mb3JFYWNoKChkKT0+e1xyXG4gICAgICAgIGlmKGQuc2V0KXtcclxuICAgICAgICAgIHJldC5wYXJhbXNbZC5uYW1lXSA9IGQuZ2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG5cdFxyXG5cdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdHN0YXRpYyByZW1vdmUobm9kZSkge1xyXG5cdFx0XHRpZighbm9kZS5yZW1vdmFibGUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ+WJiumZpOOBp+OBjeOBquOBhOODjuODvOODieOBp+OBmeOAgicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGlmIChBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXNbaV0gPT09IG5vZGUpIHtcclxuXHRcdFx0XHRcdGlmKG5vZGUuYXVkaW9Ob2RlLmRpc3Bvc2Upe1xyXG5cdFx0XHRcdFx0XHRub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMuc3BsaWNlKGktLSwgMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGxldCBuID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRcdGlmIChuLmZyb20ubm9kZSA9PT0gbm9kZSB8fCBuLnRvLm5vZGUgPT09IG5vZGUpIHtcclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdF8obik7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcbiAgXHJcbiAgLy8gXHJcbiAgc3RhdGljIHJlbW92ZUFsbE5vZGVWaWV3cygpe1xyXG4gICAgQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgIGlmKG5vZGUuYXVkaW9Ob2RlLmRpc3Bvc2Upe1xyXG4gICAgICAgIG5vZGUuYXVkaW9Ob2RlLmRpc3Bvc2UoKTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGxldCBuID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG4gICAgICAgIGlmIChuLmZyb20ubm9kZSA9PT0gbm9kZSB8fCBuLnRvLm5vZGUgPT09IG5vZGUpIHtcclxuICAgICAgICAgIEF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdF8obik7XHJcbiAgICAgICAgICBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuc3BsaWNlKGktLSwxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICAvLyBcclxuXHRzdGF0aWMgZGlzY29ubmVjdF8oY29uKSB7XHJcblx0XHRpZiAoY29uLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpIHtcclxuXHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24pO1xyXG5cdFx0fSBlbHNlIGlmIChjb24udG8ucGFyYW0pIHtcclxuXHRcdFx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0aWYgKGNvbi50by5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KSB7XHJcblx0XHRcdFx0Ly8gQVVkaW9QYXJhbVxyXG5cdFx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSkge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ucGFyYW0uYXVkaW9QYXJhbSwgY29uLmZyb20ucGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5wYXJhbS5hdWRpb1BhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gY29uLnRvLnBhcmFt44GM5pWw5a2XXHJcblx0XHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtKSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0XHRpZiAoY29uLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpIHtcclxuXHRcdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSwgY29uLmZyb20ucGFyYW0sIGNvbi50by5wYXJhbSk7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSwgMCwgY29uLnRvLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHRvIOODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRpZiAoY29uLmZyb20ucGFyYW0pIHtcclxuXHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsIGNvbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOOCs+ODjeOCr+OCt+ODp+ODs+OBruaOpee2muOCkuino+mZpOOBmeOCi1xyXG5cdHN0YXRpYyBkaXNjb25uZWN0KGZyb21fLHRvXykge1xyXG5cdFx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV99O1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIFBhcmFtVmlldyApe1xyXG5cdFx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8uQXVkaW9Ob2RlVmlldyxwYXJhbTpmcm9tX307XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdHRvXyA9IHtub2RlOnRvX307XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY29uID0geydmcm9tJzpmcm9tXywndG8nOnRvX307XHJcblx0XHRcdFxyXG5cdFx0XHQvLyDjgrPjg43jgq/jgrfjg6fjg7Pjga7liYrpmaRcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0XHRpZihjb24uZnJvbS5ub2RlID09PSBuLmZyb20ubm9kZSAmJiBjb24uZnJvbS5wYXJhbSA9PT0gbi5mcm9tLnBhcmFtIFxyXG5cdFx0XHRcdFx0JiYgY29uLnRvLm5vZGUgPT09IG4udG8ubm9kZSAmJiBjb24udG8ucGFyYW0gPT09IG4udG8ucGFyYW0pe1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3RfKGNvbik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBjcmVhdGUoYXVkaW9ub2RlLGVkaXRvciA9ICgpPT57fSkge1xyXG5cdFx0dmFyIG9iaiA9IG5ldyBBdWRpb05vZGVWaWV3KGF1ZGlvbm9kZSxlZGl0b3IpO1xyXG5cdFx0QXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLnB1c2gob2JqKTtcclxuXHRcdHJldHVybiBvYmo7XHJcblx0fVxyXG4gIFxyXG4gIC8vIOODjuODvOODiemWk+OBruaOpee2mlxyXG5cdHN0YXRpYyBjb25uZWN0KGZyb21fLCB0b18pIHtcclxuXHRcdGlmKGZyb21fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyApe1xyXG5cdFx0XHRmcm9tXyA9IHtub2RlOmZyb21fLHBhcmFtOjB9O1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGZyb21fIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tXy5BdWRpb05vZGVWaWV3LHBhcmFtOmZyb21ffTtcclxuXHRcdH1cclxuXHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHR0b18gPSB7bm9kZTp0b18scGFyYW06MH07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYodG9fIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffTtcclxuXHRcdH1cclxuXHRcdC8vIOWtmOWcqOODgeOCp+ODg+OCr1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcblx0XHRcdHZhciBjID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRpZiAoYy5mcm9tLm5vZGUgPT09IGZyb21fLm5vZGUgXHJcblx0XHRcdFx0JiYgYy5mcm9tLnBhcmFtID09PSBmcm9tXy5wYXJhbVxyXG5cdFx0XHRcdCYmIGMudG8ubm9kZSA9PT0gdG9fLm5vZGVcclxuXHRcdFx0XHQmJiBjLnRvLnBhcmFtID09PSB0b18ucGFyYW1cclxuXHRcdFx0XHQpIFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuLy9cdFx0XHRcdHRocm93IChuZXcgRXJyb3IoJ+aOpee2muOBjOmHjeikh+OBl+OBpuOBhOOBvuOBmeOAgicpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyDmjqXntprlhYjjgYxQYXJhbVZpZXfjga7loLTlkIjjga/mjqXntprlhYPjga9QYXJhbVZpZXfjga7jgb9cclxuXHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyAmJiAhKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KSl7XHJcblx0XHQgIHJldHVybiA7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFBhcmFtVmlld+OBjOaOpee2muWPr+iDveOBquOBruOBr0F1ZGlvUGFyYW3jgYvjgolQYXJhbVZpZXfjga7jgb9cclxuXHRcdGlmKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0aWYoISh0b18ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcgfHwgdG9fLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpKXtcclxuXHRcdFx0XHRyZXR1cm47XHRcclxuXHRcdFx0fVxyXG5cdFx0fSBcclxuXHRcdFxyXG5cdFx0aWYgKGZyb21fLnBhcmFtKSB7XHJcblx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdCAgaWYoZnJvbV8ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdCAgZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh7J2Zyb20nOmZyb21fLCd0byc6dG9ffSk7XHJcbi8vXHRcdFx0XHRmcm9tXy5ub2RlLmNvbm5lY3RQYXJhbShmcm9tXy5wYXJhbSx0b18pO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHRvXy5wYXJhbSkgXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdC8vIEF1ZGlvUGFyYW3jga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLnBhcmFtLmF1ZGlvUGFyYW0sZnJvbV8ucGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyDmlbDlrZfjga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLCBmcm9tXy5wYXJhbSx0b18ucGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLGZyb21fLnBhcmFtKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRpZiAodG9fLnBhcmFtKSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRpZih0b18ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0XHQvLyBBdWRpb1BhcmFt44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5wYXJhbS5hdWRpb1BhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2V7XHJcblx0XHRcdFx0XHQvLyDmlbDlrZfjga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLDAsdG9fLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly90aHJvdyBuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gRXJyb3InKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnB1c2hcclxuXHRcdCh7XHJcblx0XHRcdCdmcm9tJzogZnJvbV8sXHJcblx0XHRcdCd0byc6IHRvX1xyXG5cdFx0fSk7XHJcblx0fVxyXG4gIFxyXG59XHJcblxyXG5cclxuXHJcbkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2RlcyA9IFtdO1xyXG5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMgPSBbXTtcclxuXHJcblxyXG4iLCJpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aS5qcyc7XHJcbmltcG9ydCB7c2hvd1NlcXVlbmNlRWRpdG9yfSBmcm9tICcuL3NlcXVlbmNlRWRpdG9yJztcclxuXHJcbmV4cG9ydCB2YXIgc3ZnO1xyXG4vL2FhXHJcbnZhciBub2RlR3JvdXAsIGxpbmVHcm91cDtcclxudmFyIGRyYWc7XHJcbnZhciBkcmFnT3V0O1xyXG52YXIgZHJhZ1BhcmFtO1xyXG52YXIgZHJhZ1BhbmVsO1xyXG5cclxudmFyIG1vdXNlQ2xpY2tOb2RlO1xyXG52YXIgbW91c2VPdmVyTm9kZTtcclxudmFyIGxpbmU7XHJcbnZhciBhdWRpb05vZGVDcmVhdG9ycyA9IFtdO1xyXG5cclxuLy8gRHJhd+OBruWIneacn+WMllxyXG5leHBvcnQgZnVuY3Rpb24gaW5pdFVJKCl7XHJcblx0XHJcblx0Ly8g44OX44Os44Kk44Ok44O8XHJcblx0YXVkaW8uU2VxdWVuY2VyLmFkZGVkID0gKCk9PlxyXG5cdHtcclxuXHRcdGlmKGF1ZGlvLlNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aCA9PSAxICYmIGF1ZGlvLlNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PT0gYXVkaW8uU0VRX1NUQVRVUy5TVE9QUEVEKXtcclxuXHRcdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHRcdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGF1ZGlvLlNlcXVlbmNlci5lbXB0eSA9ICgpPT57XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIuc3RvcFNlcXVlbmNlcygpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHR9IFxyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3BsYXknKVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIuc3RhcnRTZXF1ZW5jZXMoYXVkaW8uY3R4LmN1cnJlbnRUaW1lKTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fSk7XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5vbignY2xpY2snLGZ1bmN0aW9uKCl7XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIucGF1c2VTZXF1ZW5jZXMoKTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9KTtcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNzdG9wJykub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnN0b3BTZXF1ZW5jZXMoKTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fSk7XHJcblx0XHJcblx0YXVkaW8uU2VxdWVuY2VyLnN0b3BwZWQgPSAoKT0+e1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0Ly8gQXVkaW9Ob2Rl44OJ44Op44OD44Kw55SoXHJcblx0ZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKVxyXG5cdC5vcmlnaW4oZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQ7IH0pXHJcblx0Lm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0aWYoZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5zaGlmdEtleSl7XHJcblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ21vdXNldXAnKSk7XHRcdFx0XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGQudGVtcC54ID0gZC54O1xyXG5cdFx0ZC50ZW1wLnkgPSBkLnk7XHJcblx0XHRkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cih7aWQ6J2RyYWcnLHdpZHRoOmQud2lkdGgsaGVpZ2h0OmQuaGVpZ2h0LHg6MCx5OjAsJ2NsYXNzJzonYXVkaW9Ob2RlRHJhZyd9ICk7XHJcblx0fSlcclxuXHQub24oXCJkcmFnXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRpZihkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5IHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0ZC50ZW1wLnggKz0gZDMuZXZlbnQuZHg7XHJcblx0XHRkLnRlbXAueSArPSBkMy5ldmVudC5keTtcclxuXHRcdC8vZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIChkLnggLSBkLndpZHRoIC8gMikgKyAnLCcgKyAoZC55IC0gZC5oZWlnaHQgLyAyKSArICcpJyk7XHJcblx0XHQvL2RyYXcoKTtcclxuXHRcdHZhciBkcmFnQ3Vyc29sID0gZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSlcclxuXHRcdC5zZWxlY3QoJ3JlY3QjZHJhZycpO1xyXG5cdFx0dmFyIHggPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneCcpKSArIGQzLmV2ZW50LmR4O1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneScpKSArIGQzLmV2ZW50LmR5O1xyXG5cdFx0ZHJhZ0N1cnNvbC5hdHRyKHt4OngseTp5fSk7XHRcdFxyXG5cdH0pXHJcblx0Lm9uKCdkcmFnZW5kJyxmdW5jdGlvbihkKXtcclxuXHRcdGlmKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgZHJhZ0N1cnNvbCA9IGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpXHJcblx0XHQuc2VsZWN0KCdyZWN0I2RyYWcnKTtcclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3gnKSk7XHJcblx0XHR2YXIgeSA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd5JykpO1xyXG5cdFx0ZC54ID0gZC50ZW1wLng7XHJcblx0XHRkLnkgPSBkLnRlbXAueTtcclxuXHRcdGRyYWdDdXJzb2wucmVtb3ZlKCk7XHRcdFxyXG5cdFx0ZHJhdygpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdC8vIOODjuODvOODiemWk+aOpee2mueUqCBkcmFnIFxyXG5cdGRyYWdPdXQgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHQub3JpZ2luKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkOyB9KVxyXG5cdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdGxldCB4MSx5MTtcclxuXHRcdGlmKGQuaW5kZXgpe1xyXG5cdFx0XHRpZihkLmluZGV4IGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR4MSA9IGQubm9kZS54IC0gZC5ub2RlLndpZHRoIC8gMiArIGQuaW5kZXgueDtcclxuXHRcdFx0XHR5MSA9IGQubm9kZS55IC0gZC5ub2RlLmhlaWdodCAvMiArIGQuaW5kZXgueTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR4MSA9IGQubm9kZS54ICsgZC5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0XHR5MSA9IGQubm9kZS55IC0gZC5ub2RlLmhlaWdodCAvMiArIGQubm9kZS5vdXRwdXRTdGFydFkgKyBkLmluZGV4ICogMjA7IFxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR4MSA9IGQubm9kZS54ICsgZC5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLm5vZGUub3V0cHV0U3RhcnRZO1xyXG5cdFx0fVxyXG5cclxuXHRcdGQueDEgPSB4MSxkLnkxID0geTE7XHRcdFx0XHRcclxuXHRcdGQueDIgPSB4MSxkLnkyID0geTE7XHJcblxyXG5cdFx0dmFyIHBvcyA9IG1ha2VQb3MoeDEseTEsZC54MixkLnkyKTtcclxuXHRcdGQubGluZSA9IHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmRhdHVtKGQpXHJcblx0XHQuYXBwZW5kKCdwYXRoJylcclxuXHRcdC5hdHRyKHsnZCc6bGluZShwb3MpLCdjbGFzcyc6J2xpbmUtZHJhZyd9KTtcclxuXHR9KVxyXG5cdC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdGQueDIgKz0gZDMuZXZlbnQuZHg7XHJcblx0XHRkLnkyICs9IGQzLmV2ZW50LmR5O1xyXG5cdFx0ZC5saW5lLmF0dHIoJ2QnLGxpbmUobWFrZVBvcyhkLngxLGQueTEsZC54MixkLnkyKSkpO1x0XHRcdFx0XHRcclxuXHR9KVxyXG5cdC5vbihcImRyYWdlbmRcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdGxldCB0YXJnZXRYID0gZC54MjtcclxuXHRcdGxldCB0YXJnZXRZID0gZC55MjtcclxuXHRcdC8vIGlucHV044KC44GX44GP44GvcGFyYW3jgavliLDpgZTjgZfjgabjgYTjgovjgYtcclxuXHRcdC8vIGlucHV0XHRcdFxyXG5cdFx0bGV0IGNvbm5lY3RlZCA9IGZhbHNlO1xyXG5cdFx0bGV0IGlucHV0cyA9IGQzLnNlbGVjdEFsbCgnLmlucHV0JylbMF07XHJcblx0XHRmb3IodmFyIGkgPSAwLGwgPSBpbnB1dHMubGVuZ3RoO2kgPCBsOysraSl7XHJcblx0XHRcdGxldCBlbG0gPSBpbnB1dHNbaV07XHJcblx0XHRcdGxldCBiYm94ID0gZWxtLmdldEJCb3goKTtcclxuXHRcdFx0bGV0IG5vZGUgPSBlbG0uX19kYXRhX18ubm9kZTtcclxuXHRcdFx0bGV0IGxlZnQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueCxcclxuXHRcdFx0XHR0b3AgPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94LnksXHJcblx0XHRcdFx0cmlnaHQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueCArIGJib3gud2lkdGgsXHJcblx0XHRcdFx0Ym90dG9tID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55ICsgYmJveC5oZWlnaHQ7XHJcblx0XHRcdGlmKHRhcmdldFggPj0gbGVmdCAmJiB0YXJnZXRYIDw9IHJpZ2h0ICYmIHRhcmdldFkgPj0gdG9wICYmIHRhcmdldFkgPD0gYm90dG9tKVxyXG5cdFx0XHR7XHJcbi8vXHRcdFx0XHRjb25zb2xlLmxvZygnaGl0JyxlbG0pO1xyXG5cdFx0XHRcdGxldCBmcm9tXyA9IHtub2RlOmQubm9kZSxwYXJhbTpkLmluZGV4fTtcclxuXHRcdFx0XHRsZXQgdG9fID0ge25vZGU6bm9kZSxwYXJhbTplbG0uX19kYXRhX18uaW5kZXh9O1xyXG5cdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChmcm9tXyx0b18pO1xyXG5cdFx0XHRcdC8vQXVkaW9Ob2RlVmlldy5jb25uZWN0KCk7XHJcblx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHRcdGNvbm5lY3RlZCA9IHRydWU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoIWNvbm5lY3RlZCl7XHJcblx0XHRcdC8vIEF1ZGlvUGFyYW1cclxuXHRcdFx0dmFyIHBhcmFtcyA9IGQzLnNlbGVjdEFsbCgnLnBhcmFtLC5hdWRpby1wYXJhbScpWzBdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwLGwgPSBwYXJhbXMubGVuZ3RoO2kgPCBsOysraSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGxldCBlbG0gPSBwYXJhbXNbaV07XHJcblx0XHRcdFx0bGV0IGJib3ggPSBlbG0uZ2V0QkJveCgpO1xyXG5cdFx0XHRcdGxldCBwYXJhbSA9IGVsbS5fX2RhdGFfXztcclxuXHRcdFx0XHRsZXQgbm9kZSA9IHBhcmFtLm5vZGU7XHJcblx0XHRcdFx0bGV0IGxlZnQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueDtcclxuXHRcdFx0XHRsZXRcdHRvcF8gPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94Lnk7XHJcblx0XHRcdFx0bGV0XHRyaWdodCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54ICsgYmJveC53aWR0aDtcclxuXHRcdFx0XHRsZXRcdGJvdHRvbSA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueSArIGJib3guaGVpZ2h0O1xyXG5cdFx0XHRcdGlmKHRhcmdldFggPj0gbGVmdCAmJiB0YXJnZXRYIDw9IHJpZ2h0ICYmIHRhcmdldFkgPj0gdG9wXyAmJiB0YXJnZXRZIDw9IGJvdHRvbSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnaGl0JyxlbG0pO1xyXG5cdFx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOmQubm9kZSxwYXJhbTpkLmluZGV4fSx7bm9kZTpub2RlLHBhcmFtOnBhcmFtLmluZGV4fSk7XHJcblx0XHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIGxpbmXjg5fjg6zjg5Pjg6Xjg7zjga7liYrpmaRcclxuXHRcdGQubGluZS5yZW1vdmUoKTtcclxuXHRcdGRlbGV0ZSBkLmxpbmU7XHJcblx0fSk7XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjcGFuZWwtY2xvc2UnKVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKCl7ZDMuc2VsZWN0KCcjcHJvcC1wYW5lbCcpLnN0eWxlKCd2aXNpYmlsaXR5JywnaGlkZGVuJyk7ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO30pO1xyXG5cclxuXHQvLyBub2Rl6ZaT5o6l57aabGluZeaPj+eUu+mWouaVsFxyXG5cdGxpbmUgPSBkMy5zdmcubGluZSgpXHJcblx0LngoZnVuY3Rpb24oZCl7cmV0dXJuIGQueH0pXHJcblx0LnkoZnVuY3Rpb24oZCl7cmV0dXJuIGQueX0pXHJcblx0LmludGVycG9sYXRlKCdiYXNpcycpO1xyXG5cclxuXHQvLyBET03jgatzdmfjgqjjg6zjg6Hjg7Pjg4jjgpLmjL/lhaVcdFxyXG5cdHN2ZyA9IGQzLnNlbGVjdCgnI2NvbnRlbnQnKVxyXG5cdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdC5hdHRyKHsgJ3dpZHRoJzogd2luZG93LmlubmVyV2lkdGgsICdoZWlnaHQnOiB3aW5kb3cuaW5uZXJIZWlnaHQgfSk7XHJcblxyXG5cdC8vIOODjuODvOODieOBjOWFpeOCi+OCsOODq+ODvOODl1xyXG5cdG5vZGVHcm91cCA9IHN2Zy5hcHBlbmQoJ2cnKTtcclxuXHQvLyDjg6njgqTjg7PjgYzlhaXjgovjgrDjg6vjg7zjg5dcclxuXHRsaW5lR3JvdXAgPSBzdmcuYXBwZW5kKCdnJyk7XHJcblx0XHJcblx0Ly8gYm9keeWxnuaAp+OBq+aMv+WFpVxyXG5cdGF1ZGlvTm9kZUNyZWF0b3JzID0gXHJcblx0W1xyXG5cdFx0e25hbWU6J0dhaW4nLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlR2Fpbi5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0RlbGF5JyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZURlbGF5LmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQXVkaW9CdWZmZXJTb3VyY2UnLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQnVmZmVyU291cmNlLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonTWVkaWFFbGVtZW50QXVkaW9Tb3VyY2UnLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonUGFubmVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZVBhbm5lci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0NvbnZvbHZlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVDb252b2x2ZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidBbmFseXNlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVBbmFseXNlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0NoYW5uZWxTcGxpdHRlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVDaGFubmVsU3BsaXR0ZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidDaGFubmVsTWVyZ2VyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxNZXJnZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidEeW5hbWljc0NvbXByZXNzb3InLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlRHluYW1pY3NDb21wcmVzc29yLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQmlxdWFkRmlsdGVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUJpcXVhZEZpbHRlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J09zY2lsbGF0b3InLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlT3NjaWxsYXRvci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J01lZGlhU3RyZWFtQXVkaW9Tb3VyY2UnLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidXYXZlU2hhcGVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZVdhdmVTaGFwZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidFRycsY3JlYXRlOigpPT5uZXcgYXVkaW8uRUcoKX0sXHJcblx0XHR7bmFtZTonU2VxdWVuY2VyJyxjcmVhdGU6KCk9Pm5ldyBhdWRpby5TZXF1ZW5jZXIoKSxlZGl0b3I6c2hvd1NlcXVlbmNlRWRpdG9yfVxyXG5cdF07XHJcblx0XHJcblx0aWYoYXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtRGVzdGluYXRpb24pe1xyXG5cdFx0YXVkaW9Ob2RlQ3JlYXRvcnMucHVzaCh7bmFtZTonTWVkaWFTdHJlYW1BdWRpb0Rlc3RpbmF0aW9uJyxcclxuXHRcdFx0Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbURlc3RpbmF0aW9uLmJpbmQoYXVkaW8uY3R4KVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI2NvbnRlbnQnKVxyXG5cdC5kYXR1bSh7fSlcclxuXHQub24oJ2NvbnRleHRtZW51JyxmdW5jdGlvbigpe1xyXG5cdFx0c2hvd0F1ZGlvTm9kZVBhbmVsKHRoaXMpO1xyXG5cdH0pO1xyXG59XHJcblxyXG4vLyDmj4/nlLtcclxuZXhwb3J0IGZ1bmN0aW9uIGRyYXcoKSB7XHJcblx0Ly8gQXVkaW9Ob2Rl44Gu5o+P55S7XHJcblx0dmFyIGdkID0gbm9kZUdyb3VwLnNlbGVjdEFsbCgnZycpLlxyXG5cdGRhdGEoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLGZ1bmN0aW9uKGQpe3JldHVybiBkLmlkO30pO1xyXG5cclxuXHQvLyDnn6nlvaLjga7mm7TmlrBcclxuXHRnZC5zZWxlY3QoJ3JlY3QnKVxyXG5cdC5hdHRyKHsgJ3dpZHRoJzogKGQpPT4gZC53aWR0aCwgJ2hlaWdodCc6IChkKT0+IGQuaGVpZ2h0IH0pO1xyXG5cdFxyXG5cdC8vIEF1ZGlvTm9kZeefqeW9ouOCsOODq+ODvOODl1xyXG5cdHZhciBnID0gZ2QuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ2cnKTtcclxuXHQvLyBBdWRpb05vZGXnn6nlvaLjgrDjg6vjg7zjg5fjga7luqfmqJnkvY3nva7jgrvjg4Pjg4hcclxuXHRnZC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgKGQueCAtIGQud2lkdGggLyAyKSArICcsJyArIChkLnkgLSBkLmhlaWdodCAvIDIpICsgJyknIH0pO1x0XHJcblxyXG5cdC8vIEF1ZGlvTm9kZeefqeW9olxyXG5cdGcuYXBwZW5kKCdyZWN0JylcclxuXHQuY2FsbChkcmFnKVxyXG5cdC5hdHRyKHsgJ3dpZHRoJzogKGQpPT4gZC53aWR0aCwgJ2hlaWdodCc6IChkKT0+IGQuaGVpZ2h0LCAnY2xhc3MnOiAnYXVkaW9Ob2RlJyB9KVxyXG5cdC5jbGFzc2VkKCdwbGF5JyxmdW5jdGlvbihkKXtcclxuXHRcdHJldHVybiBkLnN0YXR1c1BsYXkgPT09IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlJTkc7XHJcblx0fSlcclxuXHQub24oJ2NvbnRleHRtZW51JyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOODkeODqeODoeODvOOCv+e3qOmbhueUu+mdouOBruihqOekulxyXG5cdFx0ZC5lZGl0b3IoKTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdH0pXHJcblx0Lm9uKCdjbGljay5yZW1vdmUnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g44OO44O844OJ44Gu5YmK6ZmkXHJcblx0XHRpZihkMy5ldmVudC5zaGlmdEtleSl7XHJcblx0XHRcdGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cgJiYgZC5wYW5lbC5kaXNwb3NlKCk7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUoZCk7XHJcblx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHR9IGNhdGNoKGUpIHtcclxuLy9cdFx0XHRcdGRpYWxvZy50ZXh0KGUubWVzc2FnZSkubm9kZSgpLnNob3cod2luZG93LmlubmVyV2lkdGgvMix3aW5kb3cuaW5uZXJIZWlnaHQvMik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdH0pXHJcblx0LmZpbHRlcihmdW5jdGlvbihkKXtcclxuXHRcdC8vIOmfs+a6kOOBruOBv+OBq+ODleOCo+ODq+OCv1xyXG5cdFx0cmV0dXJuIGQuYXVkaW9Ob2RlIGluc3RhbmNlb2YgT3NjaWxsYXRvck5vZGUgfHwgZC5hdWRpb05vZGUgaW5zdGFuY2VvZiBBdWRpb0J1ZmZlclNvdXJjZU5vZGUgfHwgZC5hdWRpb05vZGUgaW5zdGFuY2VvZiBNZWRpYUVsZW1lbnRBdWRpb1NvdXJjZU5vZGU7IFxyXG5cdH0pXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDlho3nlJ/jg7vlgZzmraJcclxuXHRcdGNvbnNvbGUubG9nKGQzLmV2ZW50KTtcclxuXHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRcdGlmKCFkMy5ldmVudC5jdHJsS2V5KXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0bGV0IHNlbCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdGlmKGQuc3RhdHVzUGxheSA9PT0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUlORyl7XHJcblx0XHRcdGQuc3RhdHVzUGxheSA9IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlFRDtcclxuXHRcdFx0c2VsLmNsYXNzZWQoJ3BsYXknLGZhbHNlKTtcclxuXHRcdFx0ZC5hdWRpb05vZGUuc3RvcCgwKTtcclxuXHRcdH0gZWxzZSBpZihkLnN0YXR1c1BsYXkgIT09IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlFRCl7XHJcblx0XHRcdGQuYXVkaW9Ob2RlLnN0YXJ0KDApO1xyXG5cdFx0XHRkLnN0YXR1c1BsYXkgPSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HO1xyXG5cdFx0XHRzZWwuY2xhc3NlZCgncGxheScsdHJ1ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhbGVydCgn5LiA5bqm5YGc5q2i44GZ44KL44Go5YaN55Sf44Gn44GN44G+44Gb44KT44CCJyk7XHJcblx0XHR9XHJcblx0fSlcclxuXHQuY2FsbCh0b29sdGlwKCdDdHJsICsgQ2xpY2sg44Gn5YaN55Sf44O75YGc5q2iJykpO1xyXG5cdDtcclxuXHRcclxuXHQvLyBBdWRpb05vZGXjga7jg6njg5njg6tcclxuXHRnLmFwcGVuZCgndGV4dCcpXHJcblx0LmF0dHIoeyB4OiAwLCB5OiAtMTAsICdjbGFzcyc6ICdsYWJlbCcgfSlcclxuXHQudGV4dChmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5uYW1lOyB9KTtcclxuXHJcblx0Ly8g5YWl5YqbQXVkaW9QYXJhbeOBruihqOekulx0XHJcblx0Z2QuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdHZhciBncCA9IHNlbC5hcHBlbmQoJ2cnKTtcclxuXHRcdHZhciBncGQgPSBncC5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZC5pbnB1dFBhcmFtcy5tYXAoKGQpPT57XHJcblx0XHRcdHJldHVybiB7bm9kZTpkLkF1ZGlvTm9kZVZpZXcsaW5kZXg6ZH07XHJcblx0XHR9KSxmdW5jdGlvbihkKXtyZXR1cm4gZC5pbmRleC5pZDt9KTtcdFx0XHJcblxyXG5cdFx0dmFyIGdwZGcgPSBncGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdC5hdHRyKHsncic6IChkKT0+ZC5pbmRleC53aWR0aC8yLCBcclxuXHRcdGN4OiAwLCBjeTogKGQsIGkpPT4geyByZXR1cm4gZC5pbmRleC55OyB9LFxyXG5cdFx0J2NsYXNzJzogZnVuY3Rpb24oZCkge1xyXG5cdFx0XHRpZihkLmluZGV4IGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHJldHVybiAnYXVkaW8tcGFyYW0nO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiAncGFyYW0nO1xyXG5cdFx0fX0pO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgndGV4dCcpXHJcblx0XHQuYXR0cih7eDogKGQpPT4gKGQuaW5kZXgueCArIGQuaW5kZXgud2lkdGggLyAyICsgNSkseTooZCk9PmQuaW5kZXgueSwnY2xhc3MnOidsYWJlbCcgfSlcclxuXHRcdC50ZXh0KChkKT0+ZC5pbmRleC5uYW1lKTtcclxuXHJcblx0XHRncGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0fSk7XHJcblxyXG5cdC8vIOWHuuWKm1BhcmFt44Gu6KGo56S6XHRcclxuXHRnZC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0dmFyIGdwID0gc2VsLmFwcGVuZCgnZycpO1xyXG5cdFx0XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0dmFyIGdwZCA9IGdwLnNlbGVjdEFsbCgnZycpXHJcblx0XHQuZGF0YShkLm91dHB1dFBhcmFtcy5tYXAoKGQpPT57XHJcblx0XHRcdHJldHVybiB7bm9kZTpkLkF1ZGlvTm9kZVZpZXcsaW5kZXg6ZH07XHJcblx0XHR9KSxmdW5jdGlvbihkKXtyZXR1cm4gZC5pbmRleC5pZDt9KTtcclxuXHRcdFxyXG5cdFx0dmFyIGdwZGcgPSBncGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpO1xyXG5cclxuXHRcdGdwZGcuYXBwZW5kKCdjaXJjbGUnKVxyXG5cdFx0LmF0dHIoeydyJzogKGQpPT5kLmluZGV4LndpZHRoLzIsIFxyXG5cdFx0Y3g6IGQud2lkdGgsIGN5OiAoZCwgaSk9PiB7IHJldHVybiBkLmluZGV4Lnk7IH0sXHJcblx0XHQnY2xhc3MnOiAncGFyYW0nfSlcclxuXHRcdC5jYWxsKGRyYWdPdXQpO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgndGV4dCcpXHJcblx0XHQuYXR0cih7eDogKGQpPT4gKGQuaW5kZXgueCArIGQuaW5kZXgud2lkdGggLyAyICsgNSkseTooZCk9PmQuaW5kZXgueSwnY2xhc3MnOidsYWJlbCcgfSlcclxuXHRcdC50ZXh0KChkKT0+ZC5pbmRleC5uYW1lKTtcclxuXHJcblx0XHRncGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0fSk7XHJcblxyXG5cdC8vIOWHuuWKm+ihqOekulxyXG5cdGdkLmZpbHRlcihmdW5jdGlvbiAoZCkge1xyXG5cdFx0cmV0dXJuIGQubnVtYmVyT2ZPdXRwdXRzID4gMDtcclxuXHR9KVxyXG5cdC5lYWNoKGZ1bmN0aW9uKGQpe1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ2cnKTtcclxuXHRcdGlmKCFkLnRlbXAub3V0cyB8fCAoZC50ZW1wLm91dHMgJiYgKGQudGVtcC5vdXRzLmxlbmd0aCA8IGQubnVtYmVyT2ZPdXRwdXRzKSkpXHJcblx0XHR7XHJcblx0XHRcdGQudGVtcC5vdXRzID0gW107XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7aSA8IGQubnVtYmVyT2ZPdXRwdXRzOysraSl7XHJcblx0XHRcdFx0ZC50ZW1wLm91dHMucHVzaCh7bm9kZTpkLGluZGV4Oml9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIHNlbDEgPSBzZWwuc2VsZWN0QWxsKCdnJyk7XHJcblx0XHR2YXIgc2VsZCA9IHNlbDEuZGF0YShkLnRlbXAub3V0cyk7XHJcblxyXG5cdFx0c2VsZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoeyB4OiBkLndpZHRoIC0gdWkucG9pbnRTaXplIC8gMiwgeTogKGQxKT0+IChkLm91dHB1dFN0YXJ0WSArIGQxLmluZGV4ICogMjAgLSB1aS5wb2ludFNpemUgLyAyKSwgd2lkdGg6IHVpLnBvaW50U2l6ZSwgaGVpZ2h0OiB1aS5wb2ludFNpemUsICdjbGFzcyc6ICdvdXRwdXQnIH0pXHJcblx0XHQuY2FsbChkcmFnT3V0KTtcclxuXHRcdHNlbGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH0pO1xyXG5cclxuXHQvLyDlhaXlipvooajnpLpcclxuXHRnZFxyXG5cdC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcdHJldHVybiBkLm51bWJlck9mSW5wdXRzID4gMDsgfSlcclxuXHQuZWFjaChmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCdnJyk7XHJcblx0XHRpZighZC50ZW1wLmlucyB8fCAoZC50ZW1wLmlucyAmJiAoZC50ZW1wLmlucy5sZW5ndGggPCBkLm51bWJlck9mSW5wdXRzKSkpXHJcblx0XHR7XHJcblx0XHRcdGQudGVtcC5pbnMgPSBbXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDtpIDwgZC5udW1iZXJPZklucHV0czsrK2kpe1xyXG5cdFx0XHRcdGQudGVtcC5pbnMucHVzaCh7bm9kZTpkLGluZGV4Oml9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIHNlbDEgPSBzZWwuc2VsZWN0QWxsKCdnJyk7XHJcblx0XHR2YXIgc2VsZCA9IHNlbDEuZGF0YShkLnRlbXAuaW5zKTtcclxuXHJcblx0XHRzZWxkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cih7IHg6IC0gdWkucG9pbnRTaXplIC8gMiwgeTogKGQxKT0+IChkLmlucHV0U3RhcnRZICsgZDEuaW5kZXggKiAyMCAtIHVpLnBvaW50U2l6ZSAvIDIpLCB3aWR0aDogdWkucG9pbnRTaXplLCBoZWlnaHQ6IHVpLnBvaW50U2l6ZSwgJ2NsYXNzJzogJ2lucHV0JyB9KVxyXG5cdFx0Lm9uKCdtb3VzZWVudGVyJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0bW91c2VPdmVyTm9kZSA9IHtub2RlOmQuYXVkaW9Ob2RlXyxwYXJhbTpkfTtcclxuXHRcdH0pXHJcblx0XHQub24oJ21vdXNlbGVhdmUnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRpZihtb3VzZU92ZXJOb2RlLm5vZGUpe1xyXG5cdFx0XHRcdGlmKG1vdXNlT3Zlck5vZGUubm9kZSA9PT0gZC5hdWRpb05vZGVfICYmIG1vdXNlT3Zlck5vZGUucGFyYW0gPT09IGQpe1xyXG5cdFx0XHRcdFx0bW91c2VPdmVyTm9kZSA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHNlbGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdC8vIOS4jeimgeOBquODjuODvOODieOBruWJiumZpFxyXG5cdGdkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdC8vIGxpbmUg5o+P55S7XHJcblx0dmFyIGxkID0gbGluZUdyb3VwLnNlbGVjdEFsbCgncGF0aCcpXHJcblx0LmRhdGEoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zKTtcclxuXHJcblx0bGQuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3BhdGgnKTtcclxuXHJcblx0bGQuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHBhdGggPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHR2YXIgeDEseTEseDIseTI7XHJcblxyXG5cdFx0Ly8geDEseTFcclxuXHRcdGlmKGQuZnJvbS5wYXJhbSl7XHJcblx0XHRcdGlmKGQuZnJvbS5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDEgPSBkLmZyb20ubm9kZS54IC0gZC5mcm9tLm5vZGUud2lkdGggLyAyICsgZC5mcm9tLnBhcmFtLng7XHJcblx0XHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLnBhcmFtLnk7IFxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCArIGQuZnJvbS5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0XHR5MSA9IGQuZnJvbS5ub2RlLnkgLSBkLmZyb20ubm9kZS5oZWlnaHQgLzIgKyBkLmZyb20ubm9kZS5vdXRwdXRTdGFydFkgKyBkLmZyb20ucGFyYW0gKiAyMDsgXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCArIGQuZnJvbS5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLm5vZGUub3V0cHV0U3RhcnRZO1xyXG5cdFx0fVxyXG5cclxuXHRcdHgyID0gZC50by5ub2RlLnggLSBkLnRvLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0eTIgPSBkLnRvLm5vZGUueSAtIGQudG8ubm9kZS5oZWlnaHQgLyAyO1xyXG5cdFx0XHJcblx0XHRpZihkLnRvLnBhcmFtKXtcclxuXHRcdFx0aWYoZC50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLkF1ZGlvUGFyYW1WaWV3IHx8IGQudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHgyICs9IGQudG8ucGFyYW0ueDtcclxuXHRcdFx0XHR5MiArPSBkLnRvLnBhcmFtLnk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eTIgKz0gIGQudG8ubm9kZS5pbnB1dFN0YXJ0WSAgKyAgZC50by5wYXJhbSAqIDIwO1x0XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHkyICs9IGQudG8ubm9kZS5pbnB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHBvcyA9IG1ha2VQb3MoeDEseTEseDIseTIpO1xyXG5cdFx0XHJcblx0XHRwYXRoLmF0dHIoeydkJzpsaW5lKHBvcyksJ2NsYXNzJzonbGluZSd9KTtcclxuXHRcdHBhdGgub24oJ2NsaWNrJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0aWYoZDMuZXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdChkLmZyb20sZC50byk7XHJcblx0XHRcdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdH0gXHJcblx0XHR9KS5jYWxsKHRvb2x0aXAoJ1NoaWZ0ICsgY2xpY2vjgafliYrpmaQnKSk7XHJcblx0XHRcclxuXHR9KTtcclxuXHRsZC5leGl0KCkucmVtb3ZlKCk7XHJcbn1cclxuXHJcbi8vIOewoeaYk3Rvb2x0aXDooajnpLpcclxuZnVuY3Rpb24gdG9vbHRpcChtZXMpXHJcbntcclxuXHRyZXR1cm4gZnVuY3Rpb24oZCl7XHJcblx0XHR0aGlzXHJcblx0XHQub24oJ21vdXNlZW50ZXInLGZ1bmN0aW9uKCl7XHJcblx0XHRcdHN2Zy5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHQuYXR0cih7J2NsYXNzJzondGlwJyx4OmQzLmV2ZW50LnggKyAyMCAseTpkMy5ldmVudC55IC0gMjB9KVxyXG5cdFx0XHQudGV4dChtZXMpO1xyXG5cdFx0fSlcclxuXHRcdC5vbignbW91c2VsZWF2ZScsZnVuY3Rpb24oKXtcclxuXHRcdFx0c3ZnLnNlbGVjdEFsbCgnLnRpcCcpLnJlbW92ZSgpO1xyXG5cdFx0fSlcclxuXHR9O1xyXG59XHJcblxyXG4vLyDmjqXntprnt5rjga7luqfmqJnnlJ/miJBcclxuZnVuY3Rpb24gbWFrZVBvcyh4MSx5MSx4Mix5Mil7XHJcblx0cmV0dXJuIFtcclxuXHRcdFx0e3g6eDEseTp5MX0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpLzQseTp5MX0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpLzIseTp5MSArICh5MiAtIHkxKS8yfSxcclxuXHRcdFx0e3g6eDEgKyAoeDIgLSB4MSkqMy80LHk6eTJ9LFxyXG5cdFx0XHR7eDp4MiwgeTp5Mn1cclxuXHRcdF07XHJcbn1cclxuXHJcbi8vIOODl+ODreODkeODhuOCo+ODkeODjeODq+OBruihqOekulxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1BhbmVsKGQpe1xyXG5cclxuXHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0aWYoZC5wYW5lbCAmJiBkLnBhbmVsLmlzU2hvdykgcmV0dXJuIDtcclxuXHJcblx0ZC5wYW5lbCA9IG5ldyB1aS5QYW5lbCgpO1xyXG5cdGQucGFuZWwueCA9IGQueDtcclxuXHRkLnBhbmVsLnkgPSBkLnk7XHJcblx0ZC5wYW5lbC5oZWFkZXIudGV4dChkLm5hbWUpO1xyXG5cdFxyXG5cdHZhciB0YWJsZSA9IGQucGFuZWwuYXJ0aWNsZS5hcHBlbmQoJ3RhYmxlJyk7XHJcblx0dmFyIHRib2R5ID0gdGFibGUuYXBwZW5kKCd0Ym9keScpLnNlbGVjdEFsbCgndHInKS5kYXRhKGQucGFyYW1zKTtcclxuXHR2YXIgdHIgPSB0Ym9keS5lbnRlcigpXHJcblx0LmFwcGVuZCgndHInKTtcclxuXHR0ci5hcHBlbmQoJ3RkJylcclxuXHQudGV4dCgoZCk9PmQubmFtZSk7XHJcblx0dHIuYXBwZW5kKCd0ZCcpXHJcblx0LmFwcGVuZCgnaW5wdXQnKVxyXG5cdC5hdHRyKHt0eXBlOlwidGV4dFwiLHZhbHVlOihkKT0+ZC5nZXQoKSxyZWFkb25seTooZCk9PmQuc2V0P251bGw6J3JlYWRvbmx5J30pXHJcblx0Lm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0bGV0IHZhbHVlID0gZDMuZXZlbnQudGFyZ2V0LnZhbHVlO1xyXG5cdFx0bGV0IHZuID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcblx0XHRpZihpc05hTih2bikpe1xyXG5cdFx0XHRkLnNldCh2YWx1ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRkLnNldCh2bik7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0ZC5wYW5lbC5zaG93KCk7XHJcblxyXG59XHJcblxyXG4vLyDjg47jg7zjg4nmjL/lhaXjg5Hjg43jg6vjga7ooajnpLpcclxuZnVuY3Rpb24gc2hvd0F1ZGlvTm9kZVBhbmVsKGQpe1xyXG5cdCBkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdCBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRpZihkLnBhbmVsKXtcclxuXHRcdGlmKGQucGFuZWwuaXNTaG93KVxyXG5cdFx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGQucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuXHRkLnBhbmVsLnggPSBkMy5ldmVudC5vZmZzZXRYO1xyXG5cdGQucGFuZWwueSA9IGQzLmV2ZW50Lm9mZnNldFk7XHJcblx0ZC5wYW5lbC5oZWFkZXIudGV4dCgnQXVkaW9Ob2Rl44Gu5oy/5YWlJyk7XHJcblxyXG5cdHZhciB0YWJsZSA9IGQucGFuZWwuYXJ0aWNsZS5hcHBlbmQoJ3RhYmxlJyk7XHJcblx0dmFyIHRib2R5ID0gdGFibGUuYXBwZW5kKCd0Ym9keScpLnNlbGVjdEFsbCgndHInKS5kYXRhKGF1ZGlvTm9kZUNyZWF0b3JzKTtcclxuXHR0Ym9keS5lbnRlcigpXHJcblx0LmFwcGVuZCgndHInKVxyXG5cdC5hcHBlbmQoJ3RkJylcclxuXHQudGV4dCgoZCk9PmQubmFtZSlcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbihkdCl7XHJcblx0XHRjb25zb2xlLmxvZygn5oy/5YWlJyxkdCk7XHJcblx0XHRcclxuXHRcdHZhciBlZGl0b3IgPSBkdC5lZGl0b3IgfHwgc2hvd1BhbmVsO1xyXG5cdFx0XHJcblx0XHR2YXIgbm9kZSA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGR0LmNyZWF0ZSgpLGVkaXRvcik7XHJcblx0XHRub2RlLnggPSBkMy5ldmVudC5jbGllbnRYO1xyXG5cdFx0bm9kZS55ID0gZDMuZXZlbnQuY2xpZW50WTtcclxuXHRcdGRyYXcoKTtcclxuXHRcdC8vIGQzLnNlbGVjdCgnI3Byb3AtcGFuZWwnKS5zdHlsZSgndmlzaWJpbGl0eScsJ2hpZGRlbicpO1xyXG5cdFx0Ly8gZC5wYW5lbC5kaXNwb3NlKCk7XHJcblx0fSk7XHJcblx0ZC5wYW5lbC5zaG93KCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdWRpb05vZGVWaWV3KG5hbWUpe1xyXG5cdHZhciBvYmogPSBhdWRpb05vZGVDcmVhdG9ycy5maW5kKChkKT0+e1xyXG5cdFx0aWYoZC5uYW1lID09PSBuYW1lKSByZXR1cm4gdHJ1ZTtcclxuXHR9KTtcclxuXHRpZihvYmope1xyXG5cdFx0cmV0dXJuIGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKG9iai5jcmVhdGUoKSxvYmouZWRpdG9yIHx8IHNob3dQYW5lbCk7XHRcdFx0XHJcblx0fVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBFRyB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHRoaXMuZ2F0ZSA9IG5ldyBhdWRpby5QYXJhbVZpZXcodGhpcywnZ2F0ZScsZmFsc2UpO1xyXG5cdFx0dGhpcy5vdXRwdXQgPSBuZXcgYXVkaW8uUGFyYW1WaWV3KHRoaXMsJ291dHB1dCcsdHJ1ZSk7XHJcblx0XHR0aGlzLm51bWJlck9mSW5wdXRzID0gMDtcclxuXHRcdHRoaXMubnVtYmVyT2ZPdXRwdXRzID0gMDtcclxuXHRcdHRoaXMuYXR0YWNrID0gMC4wMDE7XHJcblx0XHR0aGlzLmRlY2F5ID0gMC4wNTtcclxuXHRcdHRoaXMucmVsZWFzZSA9IDAuMDU7XHJcblx0XHR0aGlzLnN1c3RhaW4gPSAwLjI7XHJcblx0XHR0aGlzLmdhaW4gPSAxLjA7XHJcblx0XHR0aGlzLm5hbWUgPSAnRUcnO1xyXG5cdFx0YXVkaW8uZGVmSXNOb3RBUElPYmoodGhpcyxmYWxzZSk7XHJcblx0XHR0aGlzLm91dHB1dHMgPSBbXTtcclxuXHR9XHJcblx0XHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOnRoaXMubmFtZSxcclxuICAgICAgYXR0YWNrOnRoaXMuYXR0YWNrLFxyXG4gICAgICBkZWNheTp0aGlzLmRlY2F5LFxyXG4gICAgICByZWxlYXNlOnRoaXMucmVsZWFzZSxcclxuICAgICAgc3VzdGFpbjp0aGlzLnN1c3RhaW4sXHJcbiAgICAgIGdhaW46dGhpcy5nYWluXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGZyb21KU09OKG8pe1xyXG4gICAgbGV0IHJldCA9IG5ldyBFRygpO1xyXG4gICAgcmV0Lm5hbWUgPSBvLm5hbWU7XHJcbiAgICByZXQuYXR0YWNrID0gby5hdHRhY2s7XHJcbiAgICByZXQuZGVjYXkgPSBvLmRlY2F5O1xyXG4gICAgcmV0LnJlbGVhc2UgPSBvLnJlbGVhc2U7XHJcbiAgICByZXQuc3VzdGFpbiA9IG8uc3VzdGFpbjtcclxuICAgIHJldC5nYWluID0gby5nYWluO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcblx0Y29ubmVjdChjKVxyXG5cdHtcclxuXHRcdGlmKCEgKGMudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5BdWRpb1BhcmFtVmlldykpe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0F1ZGlvUGFyYW3ku6XlpJbjgajjga/mjqXntprjgafjgY3jgb7jgZvjgpPjgIInKTtcclxuXHRcdH1cclxuXHRcdGMudG8ucGFyYW0uYXVkaW9QYXJhbS52YWx1ZSA9IDA7XHJcblx0XHR0aGlzLm91dHB1dHMucHVzaChjLnRvKTtcclxuXHR9XHJcblx0XHJcblx0ZGlzY29ubmVjdChjKXtcclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRoaXMub3V0cHV0cy5sZW5ndGg7KytpKXtcclxuXHRcdFx0aWYoYy50by5ub2RlID09PSB0aGlzLm91dHB1dHNbaV0ubm9kZSAmJiBjLnRvLnBhcmFtID09PSB0aGlzLm91dHB1dHNbaV0ucGFyYW0pXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aGlzLm91dHB1dHMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcdFxyXG5cdHByb2Nlc3ModG8sY29tLHYsdClcclxuXHR7XHJcblx0XHRpZih2ID4gMCkge1xyXG5cdFx0XHQvLyBrZXlvblxyXG5cdFx0XHQvLyBBRFPjgb7jgafjgoLjgaPjgabjgYTjgY9cclxuXHRcdFx0dGhpcy5vdXRwdXRzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ2tleW9uJyxjb20sdix0KTtcclxuXHRcdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0uc2V0VmFsdWVBdFRpbWUoMCx0KTtcclxuXHRcdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodiAqIHRoaXMuZ2FpbiAsdCArIHRoaXMuYXR0YWNrKTtcclxuXHRcdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluICogdiAqIHRoaXMuZ2FpbiAsdCArIHRoaXMuYXR0YWNrICsgdGhpcy5kZWNheSApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIGtleW9mZlxyXG5cdFx0XHQvLyDjg6rjg6rjg7zjgrlcclxuXHRcdFx0dGhpcy5vdXRwdXRzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ2tleW9mZicsY29tLHYsdCk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsdCArIHRoaXMucmVsZWFzZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRzdG9wKCl7XHJcblx0XHR0aGlzLm91dHB1dHMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0Y29uc29sZS5sb2coJ3N0b3AnKTtcclxuXHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuXHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLnNldFZhbHVlQXRUaW1lKDAsMCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0cGF1c2UoKXtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxufVxyXG5cclxuLy8gLy8vIOOCqOODs+ODmeODreODvOODl+OCuOOCp+ODjeODrOODvOOCv+ODvFxyXG4vLyBmdW5jdGlvbiBFbnZlbG9wZUdlbmVyYXRvcih2b2ljZSwgYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSkge1xyXG4vLyAgIHRoaXMudm9pY2UgPSB2b2ljZTtcclxuLy8gICAvL3RoaXMua2V5b24gPSBmYWxzZTtcclxuLy8gICB0aGlzLmF0dGFjayA9IGF0dGFjayB8fCAwLjAwMDU7XHJcbi8vICAgdGhpcy5kZWNheSA9IGRlY2F5IHx8IDAuMDU7XHJcbi8vICAgdGhpcy5zdXN0YWluID0gc3VzdGFpbiB8fCAwLjU7XHJcbi8vICAgdGhpcy5yZWxlYXNlID0gcmVsZWFzZSB8fCAwLjU7XHJcbi8vIH07XHJcbi8vIFxyXG4vLyBFbnZlbG9wZUdlbmVyYXRvci5wcm90b3R5cGUgPVxyXG4vLyB7XHJcbi8vICAga2V5b246IGZ1bmN0aW9uICh0LHZlbCkge1xyXG4vLyAgICAgdGhpcy52ID0gdmVsIHx8IDEuMDtcclxuLy8gICAgIHZhciB2ID0gdGhpcy52O1xyXG4vLyAgICAgdmFyIHQwID0gdCB8fCB0aGlzLnZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4vLyAgICAgdmFyIHQxID0gdDAgKyB0aGlzLmF0dGFjayAqIHY7XHJcbi8vICAgICB2YXIgZ2FpbiA9IHRoaXMudm9pY2UuZ2Fpbi5nYWluO1xyXG4vLyAgICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4vLyAgICAgZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCk7XHJcbi8vICAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYsIHQxKTtcclxuLy8gICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDAgKyB0aGlzLmRlY2F5IC8gdik7XHJcbi8vICAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQxLCB0MSArIHRoaXMuZGVjYXkgLyB2KTtcclxuLy8gICB9LFxyXG4vLyAgIGtleW9mZjogZnVuY3Rpb24gKHQpIHtcclxuLy8gICAgIHZhciB2b2ljZSA9IHRoaXMudm9pY2U7XHJcbi8vICAgICB2YXIgZ2FpbiA9IHZvaWNlLmdhaW4uZ2FpbjtcclxuLy8gICAgIHZhciB0MCA9IHQgfHwgdm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbi8vICAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbi8vICAgICAvL2dhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4vLyAgICAgLy9nYWluLnNldFRhcmdldEF0VGltZSgwLCB0MCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4vLyAgICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbi8vICAgfVxyXG4vLyB9OyIsIid1c2Ugc3RyaWN0JztcblxuLy9cbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcbi8vIGB+YCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBvdmVycmlkZGVuIG9yXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxuLy8gaXMgYW4gRVM2IFN5bWJvbC5cbi8vXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBXZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGFyZ3NcbiAgICAsIGk7XG5cbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgICBpZiAoXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVycy5vbmNlKVxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXG4gICAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgICApIHtcbiAgICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAvL1xuICBpZiAoZXZlbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW3ByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRdO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxuLy9cbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8uanMnO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpLmpzJztcclxuaW1wb3J0IHtzaG93UGFuZWx9IGZyb20gJy4vZHJhdyc7XHJcbmltcG9ydCB7c2hvd1NlcXVlbmNlRWRpdG9yfSBmcm9tICcuL3NlcXVlbmNlRWRpdG9yJztcclxuXHJcblxyXG5cclxudmFyIGF1ZGlvTm9kZUNyZWF0b3JzID0ge307XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRBdWRpb05vZGVDcmVhdG9ycyh2KXtcclxuICBhdWRpb05vZGVDcmVhdG9ycyA9IHY7XHJcbn1cdFxyXG4gIFxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXVkaW9Ob2RlVmlld2Zyb21KU09OKG8pe1xyXG4gIGxldCBhdWRpb05vZGU7XHJcbiAgaWYoby5hdWRpb05vZGUpe1xyXG4gICAgYXVkaW9Ob2RlID0gYXVkaW9Ob2RlQ3JlYXRvcnNbby5uYW1lXS5jcmVhdGUoby5hdWRpb05vZGUpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBhdWRpb05vZGUgPSBhdWRpb05vZGVDcmVhdG9yc1tvLm5hbWVdLmNyZWF0ZSgpO1xyXG4gIH1cclxuICBsZXQgcmV0ID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW9Ob2RlLGF1ZGlvTm9kZUNyZWF0b3JzW28ubmFtZV0uZWRpdG9yKTtcclxuICBpZihvLnBhcmFtcyl7XHJcbiAgICBmb3IobGV0IGkgaW4gby5wYXJhbXMpe1xyXG4gICAgICByZXRbaV0gPSBvLnBhcmFtc1tpXTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0LmlkID0gby5pZDtcclxuICByZXQueCA9IG8ueDtcclxuICByZXQueSA9IG8ueTtcclxuICByZXQubmFtZSA9IG8ubmFtZTtcclxuICByZXQucmVtb3ZhYmxlID0gby5yZW1vdmFibGU7XHJcbiAgcmV0dXJuIHJldDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxvYWQoZGF0YSlcclxue1xyXG4gIGlmKGRhdGEpe1xyXG4gICAgZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgICB2YXIgYXVkaW9Ob2RlVmlld3MgPSB7fTtcclxuICAgIGlmKGRhdGEuYXVkaW9Ob2RlcyAmJiBkYXRhLmF1ZGlvQ29ubmVjdGlvbnMpe1xyXG4gICAgICBhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZUFsbE5vZGVWaWV3cygpO1xyXG4gICAgICBkYXRhLmF1ZGlvTm9kZXMuZm9yRWFjaCgoZCk9PntcclxuICAgICAgICBsZXQgbm9kZVZpZXcgPSBjcmVhdGVBdWRpb05vZGVWaWV3ZnJvbUpTT04oZCk7XHJcbiAgICAgICAgYXVkaW9Ob2RlVmlld3Nbbm9kZVZpZXcuaWRdID0gbm9kZVZpZXc7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvLyBDb25uZWN0aW9u44Gu5L2c5oiQXHJcbiAgICAgIGRhdGEuYXVkaW9Db25uZWN0aW9ucy5mb3JFYWNoKChkKT0+e1xyXG4gICAgICAgIGxldCBmcm9tTm9kZSA9IGF1ZGlvTm9kZVZpZXdzW2QuZnJvbS5ub2RlLmlkXTtcclxuICAgICAgICBsZXQgZnJvbVBhcmFtID0gZC5mcm9tLnBhcmFtLm5hbWU/ZnJvbU5vZGUub3V0cHV0UGFyYW1zLmZpbmQoKGUpPT57XHJcbiAgICAgICAgICByZXR1cm4gZS5uYW1lID09PSBkLmZyb20ucGFyYW0ubmFtZTtcclxuICAgICAgICB9KTpkLmZyb20ucGFyYW07XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHRvTm9kZSA9IGF1ZGlvTm9kZVZpZXdzW2QudG8ubm9kZS5pZF07XHJcbiAgICAgICAgbGV0IHRvUGFyYW0gPSBkLnRvLnBhcmFtLm5hbWU/dG9Ob2RlLmlucHV0UGFyYW1zLmZpbmQoKGUpPT57XHJcbiAgICAgICAgICByZXR1cm4gZS5uYW1lID09PSBkLnRvLnBhcmFtLm5hbWU7XHJcbiAgICAgICAgfSk6ZC50by5wYXJhbTtcclxuICAgICAgICBcclxuICAgICAgICBhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoXHJcbiAgICAgICAgIHtub2RlOmZyb21Ob2RlLHBhcmFtOmZyb21QYXJhbX1cclxuICAgICAgICAse25vZGU6dG9Ob2RlLHBhcmFtOnRvUGFyYW19XHJcbiAgICAgICAgKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2F2ZSgpXHJcbntcclxuICBsZXQgc2F2ZURhdGEgPSBcclxuICB7XHJcbiAgICBhdWRpb05vZGVzOmF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2RlcyxcclxuICAgIGF1ZGlvQ29ubmVjdGlvbnM6W10sXHJcbiAgICBvYmpDb3VudGVyOmF1ZGlvLmdldE9iamVjdENvdW50ZXIoKVxyXG4gIH07XHJcbiAgXHJcbiAgYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmZvckVhY2goKGQpPT57XHJcbiAgICBsZXQgZGVzdCA9e1xyXG4gICAgICBmcm9tOntcclxuICAgICAgICBub2RlOntcclxuICAgICAgICAgICBpZDpkLmZyb20ubm9kZS5pZCxcclxuICAgICAgICAgICBuYW1lOmQuZnJvbS5ub2RlLm5hbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhcmFtOihkLmZyb20ucGFyYW0ubmFtZT97XHJcbiAgICAgICAgICBuYW1lOmQuZnJvbS5wYXJhbS5uYW1lXHJcbiAgICAgICAgfTpkLmZyb20ucGFyYW0pXHJcbiAgICAgIH0sXHJcbiAgICAgIHRvOntcclxuICAgICAgICBub2RlOntcclxuICAgICAgICAgIGlkOmQudG8ubm9kZS5pZCxcclxuICAgICAgICAgIG5hbWU6ZC50by5ub2RlLm5hbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBhcmFtOihkLnRvLnBhcmFtLm5hbWU/e1xyXG4gICAgICAgICAgbmFtZTpkLnRvLnBhcmFtLm5hbWVcclxuICAgICAgICB9OmQudG8ucGFyYW0pXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBzYXZlRGF0YS5hdWRpb0Nvbm5lY3Rpb25zLnB1c2goZGVzdCk7XHJcbiAgfSk7XHJcblxyXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdkYXRhJyxKU09OLnN0cmluZ2lmeShzYXZlRGF0YSkpOyAgXHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZk9ic2VydmFibGUodGFyZ2V0LHByb3BOYW1lLG9wdCA9IHt9KVxyXG57XHJcblx0KCgpPT57XHJcblx0XHR2YXIgdl87XHJcblx0XHRvcHQuZW51bWVyYWJsZSA9IG9wdC5lbnVtZXJhYmxlIHx8IHRydWU7XHJcblx0XHRvcHQuY29uZmlndXJhYmxlID0gb3B0LmNvbmZpZ3VyYWJsZSB8fCBmYWxzZTtcclxuXHRcdG9wdC5nZXQgPSBvcHQuZ2V0IHx8ICgoKSA9PiB2Xyk7XHJcblx0XHRvcHQuc2V0ID0gb3B0LnNldCB8fCAoKHYpPT57XHJcblx0XHRcdGlmKHZfICE9IHYpe1xyXG4gIFx0XHRcdHZfID0gdjtcclxuICBcdFx0XHR0YXJnZXQuZW1pdChwcm9wTmFtZSArICdfY2hhbmdlZCcsdik7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCxwcm9wTmFtZSxvcHQpO1xyXG5cdH0pKCk7XHJcbn0iLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8uanMnO1xyXG5pbXBvcnQge2luaXRVSSxkcmF3LHN2ZyxzaG93UGFuZWwgfSBmcm9tICcuL2RyYXcnO1xyXG5pbXBvcnQge3Nob3dTZXF1ZW5jZUVkaXRvcn0gZnJvbSAnLi9zZXF1ZW5jZUVkaXRvcic7XHJcbmltcG9ydCB7bG9hZCxzYXZlLHNldEF1ZGlvTm9kZUNyZWF0b3JzfSBmcm9tICcuL2xvYWRlclNhdmVyJztcclxuXHJcbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XHJcblx0YXVkaW8uc2V0Q3R4KG5ldyBBdWRpb0NvbnRleHQoKSk7XHJcbiAgaW5pdFVJKCk7XHJcblxyXG4gIHNldEF1ZGlvTm9kZUNyZWF0b3JzKCBcclxuXHR7XHJcbiAgICAnQXVkaW9EZXN0aW5hdGlvbk5vZGUnOntjcmVhdGU6KCk9PmF1ZGlvLmN0eC5kZXN0aW5hdGlvbixlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdHYWluTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlR2Fpbi5iaW5kKGF1ZGlvLmN0eCksZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnRGVsYXlOb2RlJzp7Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVEZWxheS5iaW5kKGF1ZGlvLmN0eCksZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnQXVkaW9CdWZmZXJTb3VyY2VOb2RlJzp7Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UuYmluZChhdWRpby5jdHgpLGVkaXRvcjpzaG93UGFuZWx9LFxyXG4gICAgJ01lZGlhRWxlbWVudEF1ZGlvU291cmNlTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlLmJpbmQoYXVkaW8uY3R4KSxlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdQYW5uZXJOb2RlJzp7Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVQYW5uZXIuYmluZChhdWRpby5jdHgpLGVkaXRvcjpzaG93UGFuZWx9LFxyXG4gICAgJ0NvbnZvbHZlck5vZGUnOntjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNvbnZvbHZlci5iaW5kKGF1ZGlvLmN0eCksZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnQW5hbHlzZXJOb2RlJzp7Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVBbmFseXNlci5iaW5kKGF1ZGlvLmN0eCksZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnQ2hhbm5lbFNwbGl0dGVyTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlQ2hhbm5lbFNwbGl0dGVyLmJpbmQoYXVkaW8uY3R4KSxlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdDaGFubmVsTWVyZ2VyTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlQ2hhbm5lbE1lcmdlci5iaW5kKGF1ZGlvLmN0eCksZWRpdG9yOnNob3dQYW5lbH0sXHJcbiAgICAnRHluYW1pY3NDb21wcmVzc29yTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlRHluYW1pY3NDb21wcmVzc29yLmJpbmQoYXVkaW8uY3R4KSxlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdCaXF1YWRGaWx0ZXJOb2RlJzp7Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVCaXF1YWRGaWx0ZXIuYmluZChhdWRpby5jdHgpLGVkaXRvcjpzaG93UGFuZWx9LFxyXG4gICAgJ09zY2lsbGF0b3JOb2RlJzp7Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVPc2NpbGxhdG9yLmJpbmQoYXVkaW8uY3R4KSxlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdNZWRpYVN0cmVhbUF1ZGlvU291cmNlTm9kZSc6e2NyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2UuYmluZChhdWRpby5jdHgpLGVkaXRvcjpzaG93UGFuZWx9LFxyXG4gICAgJ1dhdmVTaGFwZXJOb2RlJzp7Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVXYXZlU2hhcGVyLmJpbmQoYXVkaW8uY3R4KSxlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdFRyc6e2NyZWF0ZTphdWRpby5FRy5mcm9tSlNPTixlZGl0b3I6c2hvd1BhbmVsfSxcclxuICAgICdTZXF1ZW5jZXInOntjcmVhdGU6YXVkaW8uU2VxdWVuY2VyLmZyb21KU09OLGVkaXRvcjpzaG93U2VxdWVuY2VFZGl0b3J9XHJcbiAgfSk7XHJcbiAgXHJcbiAgLy8g5Ye65Yqb44OO44O844OJ44Gu5L2c5oiQ77yI5YmK6Zmk5LiN5Y+v77yJXHJcbiAgbGV0IGRhdGEgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZGF0YScpO1xyXG4gIGlmKGZhbHNlLyohZGF0YSovKXtcclxuICAgIGxldCBvdXQgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguZGVzdGluYXRpb24sc2hvd1BhbmVsKTtcclxuICAgIG91dC54ID0gd2luZG93LmlubmVyV2lkdGggLyAyO1xyXG4gICAgb3V0LnkgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyO1xyXG4gICAgb3V0LnJlbW92YWJsZSA9IGZhbHNlO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBsb2FkKGRhdGEpO1xyXG4gICAgaWYoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aCA9PSAwICl7XHJcbiAgICAgIGxldCBvdXQgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguZGVzdGluYXRpb24sc2hvd1BhbmVsKTtcclxuICAgICAgb3V0LnggPSB3aW5kb3cuaW5uZXJXaWR0aCAvIDI7XHJcbiAgICAgIG91dC55ID0gd2luZG93LmlubmVySGVpZ2h0IC8gMjtcclxuICAgICAgb3V0LnJlbW92YWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuXHRkMy5zZWxlY3Qod2luZG93KVxyXG5cdC5vbigncmVzaXplJyxmdW5jdGlvbigpe1xyXG5cdFx0aWYoc3ZnKXtcclxuXHRcdFx0c3ZnLmF0dHIoe1xyXG5cdFx0XHRcdHdpZHRoOndpbmRvdy5pbm5lcldpZHRoLFxyXG5cdFx0XHRcdGhlaWdodDp3aW5kb3cuaW5uZXJIZWlnaHRcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0ZHJhdygpO1xyXG59O1xyXG5cclxud2luZG93Lm9uYmVmb3JldW5sb2FkID0gKCk9PntcclxuICBzYXZlKCk7XHJcbn1cclxuXHJcbiIsIid1c2Ugc3RyaWN0JztcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbmltcG9ydCAqIGFzIHVpIGZyb20gJy4vdWknO1xyXG5pbXBvcnQge1VuZG9NYW5hZ2VyfSBmcm9tICcuL3VuZG8nO1xyXG5cclxuY29uc3QgSW5wdXRUeXBlID0ge1xyXG4gIGtleWJvcmQ6IDAsXHJcbiAgbWlkaTogMVxyXG59XHJcblxyXG5jb25zdCBJbnB1dENvbW1hbmQgPVxyXG4gIHtcclxuICAgIGVudGVyOiB7IGlkOiAxLCBuYW1lOiAn44OO44O844OI44OH44O844K/5oy/5YWlJyB9LFxyXG4gICAgZXNjOiB7IGlkOiAyLCBuYW1lOiAn44Kt44Oj44Oz44K744OrJyB9LFxyXG4gICAgcmlnaHQ6IHsgaWQ6IDMsIG5hbWU6ICfjgqvjg7zjgr3jg6vnp7vli5XvvIjlj7PvvIknIH0sXHJcbiAgICBsZWZ0OiB7IGlkOiA0LCBuYW1lOiAn44Kr44O844K944Or56e75YuV77yI5bem77yJJyB9LFxyXG4gICAgdXA6IHsgaWQ6IDUsIG5hbWU6ICfjgqvjg7zjgr3jg6vnp7vli5XvvIjkuIrvvIknIH0sXHJcbiAgICBkb3duOiB7IGlkOiA2LCBuYW1lOiAn44Kr44O844K944Or56e75YuV77yI5LiL77yJJyB9LFxyXG4gICAgaW5zZXJ0TWVhc3VyZTogeyBpZDogNywgbmFtZTogJ+Wwj+evgOe3muaMv+WFpScgfSxcclxuICAgIHVuZG86IHsgaWQ6IDgsIG5hbWU6ICfjgqLjg7Pjg4njgqUnIH0sXHJcbiAgICByZWRvOiB7IGlkOiA5LCBuYW1lOiAn44Oq44OJ44KlJyB9LFxyXG4gICAgcGFnZVVwOiB7IGlkOiAxMCwgbmFtZTogJ+ODmuODvOOCuOOCouODg+ODlycgfSxcclxuICAgIHBhZ2VEb3duOiB7IGlkOiAxMSwgbmFtZTogJ+ODmuODvOOCuOODgOOCpuODsycgfSxcclxuICAgIGhvbWU6IHsgaWQ6IDEyLCBuYW1lOiAn5YWI6aCt6KGM44Gr56e75YuVJyB9LFxyXG4gICAgZW5kOiB7IGlkOiAxMywgbmFtZTogJ+e1guerr+ihjOOBq+enu+WLlScgfSxcclxuICAgIG51bWJlcjogeyBpZDogMTQsIG5hbWU6ICfmlbDlrZflhaXlipsnIH0sXHJcbiAgICBub3RlOiB7IGlkOiAxNSwgbmFtZTogJ+ODjuODvOODiOWFpeWKmycgfSxcclxuICAgIHNjcm9sbFVwOiB7IGlkOiAxNiwgbmFtZTogJ+mrmOmAn+OCueOCr+ODreODvOODq+OCouODg+ODlycgfSxcclxuICAgIHNjcm9sbERvd246IHsgaWQ6IDE3LCBuYW1lOiAn6auY6YCf44K544Kv44Ot44O844Or44OA44Km44OzJyB9LFxyXG4gICAgZGVsZXRlOiB7IGlkOiAxOCwgbmFtZTogJ+ihjOWJiumZpCcgfSxcclxuICAgIGxpbmVQYXN0ZTogeyBpZDogMTksIG5hbWU6ICfooYzjg5rjg7zjgrnjg4gnIH1cclxuICB9XHJcblxyXG4vL1xyXG5jb25zdCBLZXlCaW5kID1cclxuICB7XHJcbiAgICAxMzogW3tcclxuICAgICAga2V5Q29kZTogMTMsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5lbnRlclxyXG4gICAgfV0sXHJcbiAgICAyNzogW3tcclxuICAgICAga2V5Q29kZTogMjcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5lc2NcclxuICAgIH1dLFxyXG4gICAgMzI6IFt7XHJcbiAgICAgIGtleUNvZGU6IDMyLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucmlnaHRcclxuICAgIH1dLFxyXG4gICAgMzk6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM5LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucmlnaHRcclxuICAgIH1dLFxyXG4gICAgMzc6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM3LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubGVmdFxyXG4gICAgfV0sXHJcbiAgICAzODogW3tcclxuICAgICAga2V5Q29kZTogMzgsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC51cFxyXG4gICAgfV0sXHJcbiAgICA0MDogW3tcclxuICAgICAga2V5Q29kZTogNDAsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5kb3duXHJcbiAgICB9XSxcclxuICAgIDEwNjogW3tcclxuICAgICAga2V5Q29kZTogMTA2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuaW5zZXJ0TWVhc3VyZVxyXG4gICAgfV0sXHJcbiAgICA5MDogW3tcclxuICAgICAga2V5Q29kZTogOTAsXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnVuZG9cclxuICAgIH1dLFxyXG4gICAgMzM6IFt7XHJcbiAgICAgIGtleUNvZGU6IDMzLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucGFnZVVwXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogMzMsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5zY3JvbGxVcFxyXG4gICAgICB9XSxcclxuICAgIDgyOiBbe1xyXG4gICAgICBrZXlDb2RlOiA4MixcclxuICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucGFnZVVwXHJcbiAgICB9XSxcclxuICAgIDM0OiBbe1xyXG4gICAgICBrZXlDb2RlOiAzNCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnBhZ2VEb3duXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogMzQsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5zY3JvbGxEb3duXHJcbiAgICAgIH1dLFxyXG4gICAgNjc6IFt7XHJcbiAgICAgIGtleUNvZGU6IDY3LFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5wYWdlRG93blxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY3LFxyXG4gICAgICAgIG5vdGU6ICdDJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA2NyxcclxuICAgICAgICBub3RlOiAnQycsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH1dLFxyXG4gICAgMzY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuaG9tZVxyXG4gICAgfV0sXHJcbiAgICAzNTogW3tcclxuICAgICAga2V5Q29kZTogMzUsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5lbmRcclxuICAgIH1dLFxyXG4gICAgOTY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDk2LFxyXG4gICAgICBudW1iZXI6IDAsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgOTc6IFt7XHJcbiAgICAgIGtleUNvZGU6IDk3LFxyXG4gICAgICBudW1iZXI6IDEsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgOTg6IFt7XHJcbiAgICAgIGtleUNvZGU6IDk4LFxyXG4gICAgICBudW1iZXI6IDIsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgOTk6IFt7XHJcbiAgICAgIGtleUNvZGU6IDk5LFxyXG4gICAgICBudW1iZXI6IDMsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgMTAwOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDAsXHJcbiAgICAgIG51bWJlcjogNCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICAxMDE6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwMSxcclxuICAgICAgbnVtYmVyOiA1LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDEwMjogW3tcclxuICAgICAga2V5Q29kZTogMTAyLFxyXG4gICAgICBudW1iZXI6IDYsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgMTAzOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDMsXHJcbiAgICAgIG51bWJlcjogNyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICAxMDQ6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwNCxcclxuICAgICAgbnVtYmVyOiA4LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDEwNTogW3tcclxuICAgICAga2V5Q29kZTogMTA1LFxyXG4gICAgICBudW1iZXI6IDksXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgNjU6IFt7XHJcbiAgICAgIGtleUNvZGU6IDY1LFxyXG4gICAgICBub3RlOiAnQScsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNjUsXHJcbiAgICAgICAgbm90ZTogJ0EnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAga2V5Q29kZTogNjUsXHJcbiAgICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5yZWRvXHJcbiAgICAgIH1dLFxyXG4gICAgNjY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDY2LFxyXG4gICAgICBub3RlOiAnQicsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNjYsXHJcbiAgICAgICAgbm90ZTogJ0InLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9XSxcclxuICAgIDY4OiBbe1xyXG4gICAgICBrZXlDb2RlOiA2OCxcclxuICAgICAgbm90ZTogJ0QnLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY4LFxyXG4gICAgICAgIG5vdGU6ICdEJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfV0sXHJcbiAgICA2OTogW3tcclxuICAgICAga2V5Q29kZTogNjksXHJcbiAgICAgIG5vdGU6ICdFJyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA2OSxcclxuICAgICAgICBub3RlOiAnRScsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH1dLFxyXG4gICAgNzA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDcwLFxyXG4gICAgICBub3RlOiAnRicsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNzAsXHJcbiAgICAgICAgbm90ZTogJ0YnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9XSxcclxuICAgIDcxOiBbe1xyXG4gICAgICBrZXlDb2RlOiA3MSxcclxuICAgICAgbm90ZTogJ0cnLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDcxLFxyXG4gICAgICAgIG5vdGU6ICdHJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfV0sXHJcbiAgICA4OTogW3tcclxuICAgICAga2V5Q29kZTogODksXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmRlbGV0ZVxyXG4gICAgfV0sXHJcbiAgICA3NjogW3tcclxuICAgICAga2V5Q29kZTogNzYsXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmxpbmVQYXN0ZVxyXG4gICAgfV1cclxuICB9O1xyXG5cclxuZXhwb3J0IGNsYXNzIFNlcXVlbmNlRWRpdG9yIHtcclxuICBjb25zdHJ1Y3RvcihzZXF1ZW5jZXIpIHtcclxuICAgIHZhciBzZWxmXyA9IHRoaXM7XHJcbiAgICB0aGlzLnVuZG9NYW5hZ2VyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XHJcbiAgICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICAgIHNlcXVlbmNlci5wYW5lbCA9IG5ldyB1aS5QYW5lbCgpO1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLnggPSBzZXF1ZW5jZXIueDtcclxuICAgIHNlcXVlbmNlci5wYW5lbC55ID0gc2VxdWVuY2VyLnk7XHJcbiAgICBzZXF1ZW5jZXIucGFuZWwud2lkdGggPSAxMDI0O1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLmhlaWdodCA9IDc2ODtcclxuICAgIHNlcXVlbmNlci5wYW5lbC5oZWFkZXIudGV4dCgnU2VxdWVuY2UgRWRpdG9yJyk7XHJcbiAgICB2YXIgZWRpdG9yID0gc2VxdWVuY2VyLnBhbmVsLmFydGljbGUuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdzZXEtZWRpdG9yJywgdHJ1ZSk7XHJcbiAgICB2YXIgZGl2ID0gZWRpdG9yLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnaGVhZGVyJywgdHJ1ZSk7XHJcblx0IFxyXG4gICAgLy8g44K/44Kk44Og44OZ44O844K5XHJcbiAgICBkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnVGltZSBCYXNlOicpO1xyXG4gICAgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG4gICAgICAuZGF0dW0oc2VxdWVuY2VyLmF1ZGlvTm9kZS50cGIpXHJcbiAgICAgIC5hdHRyKHsgJ3R5cGUnOiAndGV4dCcsICdzaXplJzogJzMnLCAnaWQnOiAndGltZS1iYXNlJyB9KVxyXG4gICAgICAuYXR0cigndmFsdWUnLCAodikgPT4gdilcclxuICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS50cGIgPSBwYXJzZUZsb2F0KGQzLmV2ZW50LnRhcmdldC52YWx1ZSkgfHwgZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJyk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLm9uKCd0cGJfY2hhbmdlZCcsICh2KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmF0dHIoJ3ZhbHVlJywgdik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAvLyDjg4bjg7Pjg51cclxuICAgIGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdUZW1wbzonKTtcclxuICAgIGRpdi5hcHBlbmQoJ2lucHV0JylcclxuLy8gICAgICAuZGF0dW0oc2VxdWVuY2VyKVxyXG4gICAgICAuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJyB9KVxyXG4gICAgICAuYXR0cigndmFsdWUnLCAoZCkgPT4gc2VxdWVuY2VyLmF1ZGlvTm9kZS5icG0pXHJcbiAgICAgIC5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS5icG0gPSBwYXJzZUZsb2F0KGQzLmV2ZW50LnRhcmdldC52YWx1ZSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYWxsKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLm9uKCdicG1fY2hhbmdlZCcsICh2KSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmF0dHIoJ3ZhbHVlJywgdik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdCZWF0OicpO1xyXG4gICAgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG4gICAgICAuZGF0dW0oc2VxdWVuY2VyKVxyXG4gICAgICAuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJywgJ3ZhbHVlJzogKGQpID0+IHNlcXVlbmNlci5hdWRpb05vZGUuYmVhdCB9KVxyXG4gICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGQpe1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUuYmVhdCA9IHBhcnNlRmxvYXQoZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJykpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICBkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnIC8gJyk7XHJcbiAgICBkaXYuYXBwZW5kKCdpbnB1dCcpXHJcbiAgICAgIC5kYXR1bShzZXF1ZW5jZXIpXHJcbiAgICAgIC5hdHRyKHsgJ3R5cGUnOiAndGV4dCcsICdzaXplJzogJzMnLCAndmFsdWUnOiAoZCkgPT4gc2VxdWVuY2VyLmF1ZGlvTm9kZS5iYXIgfSlcclxuICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS5iYXIgPSBwYXJzZUZsb2F0KGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpKTtcclxuICAgICAgfSk7XHJcblxyXG5cclxuICAgIC8vIOODiOODqeODg+OCr+OCqOODh+OCo+OCv1xyXG4gICAgbGV0IHRyYWNrRWRpdCA9IGVkaXRvci5zZWxlY3RBbGwoJ2Rpdi50cmFjaycpXHJcbiAgICAgIC5kYXRhKHNlcXVlbmNlci5hdWRpb05vZGUudHJhY2tzKVxyXG4gICAgICAuZW50ZXIoKVxyXG4gICAgICAuYXBwZW5kKCdkaXYnKVxyXG4gICAgICAuY2xhc3NlZCgndHJhY2snLCB0cnVlKVxyXG4gICAgICAuYXR0cih7ICdpZCc6IChkLCBpKSA9PiAndHJhY2stJyArIChpICsgMSksICd0YWJpbmRleCc6ICcwJyB9KTtcclxuXHJcbiAgICBsZXQgdHJhY2tIZWFkZXIgPSB0cmFja0VkaXQuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCd0cmFjay1oZWFkZXInLCB0cnVlKTtcclxuICAgIHRyYWNrSGVhZGVyLmFwcGVuZCgnc3BhbicpLnRleHQoKGQsIGkpID0+ICdUUjonICsgKGkgKyAxKSk7XHJcbiAgICB0cmFja0hlYWRlci5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdNRUFTOicpO1xyXG4gICAgbGV0IHRyYWNrQm9keSA9IHRyYWNrRWRpdC5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ3RyYWNrLWJvZHknLCB0cnVlKTtcclxuICAgIGxldCBldmVudEVkaXQgPSB0cmFja0JvZHkuYXBwZW5kKCd0YWJsZScpO1xyXG4gICAgbGV0IGhlYWRyb3cgPSBldmVudEVkaXQuYXBwZW5kKCd0aGVhZCcpLmFwcGVuZCgndHInKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ00jJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdTIycpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnTlQnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ04jJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdTVCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnR1QnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1ZFJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdDTycpO1xyXG4gICAgbGV0IGV2ZW50Qm9keSA9IGV2ZW50RWRpdC5hcHBlbmQoJ3Rib2R5JykuYXR0cignaWQnLCAoZCwgaSkgPT4gJ3RyYWNrLScgKyAoaSArIDEpICsgJy1ldmVudHMnKTtcclxuICAgIC8vdGhpcy5kcmF3RXZlbnRzKGV2ZW50Qm9keSk7XHJcblxyXG4gICAgLy8g44OG44K544OI44OH44O844K/XHJcbiAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IDEyNzsgaSArPSA4KSB7XHJcbiAgICAvLyAgIGZvciAodmFyIGogPSBpOyBqIDwgKGkgKyA4KTsgKytqKSB7XHJcbiAgICAvLyAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS50cmFja3NbMF0uYWRkRXZlbnQobmV3IGF1ZGlvLk5vdGVFdmVudCg0OCwgaiwgNikpO1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyAgIHNlcXVlbmNlci5hdWRpb05vZGUudHJhY2tzWzBdLmFkZEV2ZW50KG5ldyBhdWRpby5NZWFzdXJlKCkpO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIOODiOODqeODg+OCr+OCqOODh+OCo+OCv+ODoeOCpOODs1xyXG5cclxuICAgIHRyYWNrRWRpdC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgIGlmICghdGhpcy5lZGl0b3IpIHtcclxuICAgICAgICB0aGlzLmVkaXRvciA9IGRvRWRpdG9yKGQzLnNlbGVjdCh0aGlzKSwgc2VsZl8pO1xyXG4gICAgICAgIHRoaXMuZWRpdG9yLm5leHQoKTtcclxuICAgICAgICB0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8g44Kt44O85YWl5Yqb44OP44Oz44OJ44OpXHJcbiAgICB0cmFja0VkaXQub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICBsZXQgZSA9IGQzLmV2ZW50O1xyXG4gICAgICBjb25zb2xlLmxvZyhlLmtleUNvZGUpO1xyXG4gICAgICBsZXQga2V5ID0gS2V5QmluZFtlLmtleUNvZGVdO1xyXG4gICAgICBsZXQgcmV0ID0ge307XHJcbiAgICAgIGlmIChrZXkpIHtcclxuICAgICAgICBrZXkuc29tZSgoZCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGQuY3RybEtleSA9PSBlLmN0cmxLZXlcclxuICAgICAgICAgICAgJiYgZC5zaGlmdEtleSA9PSBlLnNoaWZ0S2V5XHJcbiAgICAgICAgICAgICYmIGQuYWx0S2V5ID09IGUuYWx0S2V5XHJcbiAgICAgICAgICAgICYmIGQubWV0YUtleSA9PSBlLm1ldGFLZXlcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldCA9IHRoaXMuZWRpdG9yLm5leHQoZCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChyZXQudmFsdWUpIHtcclxuICAgICAgICAgIGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICBkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgc2VxdWVuY2VyLnBhbmVsLm9uKCdzaG93JywgKCkgPT4ge1xyXG4gICAgICBkMy5zZWxlY3QoJyN0aW1lLWJhc2UnKS5ub2RlKCkuZm9jdXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHNlcXVlbmNlci5wYW5lbC5vbignZGlzcG9zZScsICgpID0+IHtcclxuICAgICAgZGVsZXRlIHNlcXVlbmNlci5lZGl0b3JJbnN0YW5jZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHNlcXVlbmNlci5wYW5lbC5zaG93KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyDjgqjjg4fjgqPjgr/mnKzkvZNcclxuZnVuY3Rpb24qIGRvRWRpdG9yKHRyYWNrRWRpdCwgc2VxRWRpdG9yKSB7XHJcbiAgbGV0IGtleWNvZGUgPSAwOy8vIOWFpeWKm+OBleOCjOOBn+OCreODvOOCs+ODvOODieOCkuS/neaMgeOBmeOCi+WkieaVsFxyXG4gIGxldCB0cmFjayA9IHRyYWNrRWRpdC5kYXR1bSgpOy8vIOePvuWcqOe3qOmbhuS4reOBruODiOODqeODg+OCr1xyXG4gIGxldCBlZGl0VmlldyA9IGQzLnNlbGVjdCgnIycgKyB0cmFja0VkaXQuYXR0cignaWQnKSArICctZXZlbnRzJyk7Ly/nt6jpm4bnlLvpnaLjga7jgrvjg6zjgq/jgrfjg6fjg7NcclxuICBsZXQgbWVhc3VyZSA9IDE7Ly8g5bCP56+AXHJcbiAgbGV0IHN0ZXAgPSAxOy8vIOOCueODhuODg+ODl05vXHJcbiAgbGV0IHJvd0luZGV4ID0gMDsvLyDnt6jpm4bnlLvpnaLjga7nj77lnKjooYxcclxuICBsZXQgY3VycmVudEV2ZW50SW5kZXggPSAwOy8vIOOCpOODmeODs+ODiOmFjeWIl+OBrue3qOmbhumWi+Wni+ihjFxyXG4gIGxldCBjZWxsSW5kZXggPSAyOy8vIOWIl+OCpOODs+ODh+ODg+OCr+OCuVxyXG4gIGxldCBjYW5jZWxFdmVudCA9IGZhbHNlOy8vIOOCpOODmeODs+ODiOOCkuOCreODo+ODs+OCu+ODq+OBmeOCi+OBi+OBqeOBhuOBi1xyXG4gIGxldCBsaW5lQnVmZmVyID0gbnVsbDsvL+ihjOODkOODg+ODleOCoVxyXG4gIGNvbnN0IE5VTV9ST1cgPSA0NzsvLyDvvJHnlLvpnaLjga7ooYzmlbBcclxuXHRcclxuICBmdW5jdGlvbiBzZXRJbnB1dCgpIHtcclxuICAgIHRoaXMuYXR0cignY29udGVudEVkaXRhYmxlJywgJ3RydWUnKTtcclxuICAgIHRoaXMub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxKTtcclxuICAgICAgcm93SW5kZXggPSB0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxO1xyXG4gICAgICBjZWxsSW5kZXggPSB0aGlzLmNlbGxJbmRleDtcclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBzZXRCbHVyKGRlc3Qpe1xyXG4gICAgc3dpdGNoKGRlc3Qpe1xyXG4gICAgICAgY2FzZSAnbm90ZSc6XHJcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5vbignYmx1cicsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgZC5zZXROb3RlTmFtZVRvTm90ZSh0aGlzLmlubmVyVGV4dCk7XHJcbiAgICAgICAgICAgICAgdGhpcy5pbm5lclRleHQgPSBkLm5hbWU7XHJcbiAgICAgICAgICAgICAgLy8gTm90ZU5v6KGo56S644KC5pu05pawXHJcbiAgICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLmNlbGxzWzNdLmlubmVyVGV4dCA9IGQubm90ZTtcclxuICAgICAgICAgICAgfSk7Ly8gTm90ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgYnJlYWs7XHJcbiAgICAgICBjYXNlICdub3RlTmFtZSc6XHJcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5vbignYmx1cicsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgbGV0IHYgPSBwYXJzZUZsb2F0KHRoaXMuaW5uZXJUZXh0KTtcclxuICAgICAgICAgICAgICBpZighaXNOYU4odikpe1xyXG4gICAgICAgICAgICAgICAgZC5ub3RlID0gcGFyc2VGbG9hdCh0aGlzLmlubmVyVGV4dCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUuY2VsbHNbMl0uaW5uZXJUZXh0ID0gZC5uYW1lO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBmdW5jdGlvbigpe1xyXG4gICAgIHRoaXMub24oJ2JsdXInLGZ1bmN0aW9uKGQpXHJcbiAgICAgIHtcclxuICAgICAgICBsZXQgdiA9IHBhcnNlRmxvYXQodGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgIGlmKCFpc05hTih2KSl7XHJcbiAgICAgICAgICBkW2Rlc3RdID0gdjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICB9XHJcbiAgXHJcbiAgXHJcbiAgLy8g5pei5a2Y44Kk44OZ44Oz44OI44Gu6KGo56S6XHJcbiAgZnVuY3Rpb24gZHJhd0V2ZW50KCkge1xyXG4gICAgbGV0IGV2ZmxhZ21lbnQgPSB0cmFjay5ldmVudHMuc2xpY2UoY3VycmVudEV2ZW50SW5kZXgsIGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyk7XHJcbiAgICBlZGl0Vmlldy5zZWxlY3RBbGwoJ3RyJykucmVtb3ZlKCk7XHJcbiAgICBsZXQgc2VsZWN0ID0gZWRpdFZpZXcuc2VsZWN0QWxsKCd0cicpLmRhdGEoZXZmbGFnbWVudCk7XHJcbiAgICBsZXQgZW50ZXIgPSBzZWxlY3QuZW50ZXIoKTtcclxuICAgIGxldCByb3dzID0gZW50ZXIuYXBwZW5kKCd0cicpLmF0dHIoJ2RhdGEtaW5kZXgnLCAoZCwgaSkgPT4gaSk7XHJcbiAgICByb3dzLmVhY2goZnVuY3Rpb24gKGQsIGkpIHtcclxuICAgICAgbGV0IHJvdyA9IGQzLnNlbGVjdCh0aGlzKTtcclxuICAgICAgLy9yb3dJbmRleCA9IGk7XHJcbiAgICAgIHN3aXRjaCAoZC50eXBlKSB7XHJcbiAgICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuTm90ZTpcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLm1lYXN1cmUpOy8vIE1lYXNldXJlICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLnN0ZXBObyk7Ly8gU3RlcCAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5uYW1lKS5jYWxsKHNldElucHV0KS8vIE5vdGVcclxuICAgICAgICAgIC5jYWxsKHNldEJsdXIoJ25vdGVOYW1lJykpO1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQubm90ZSkuY2FsbChzZXRJbnB1dCkvLyBOb3RlICNcclxuICAgICAgICAgIC5jYWxsKHNldEJsdXIoJ25vdGUnKSk7XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5zdGVwKS5jYWxsKHNldElucHV0KS8vIFN0ZXBcclxuICAgICAgICAgIC5jYWxsKHNldEJsdXIoJ3N0ZXAnKSk7XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5nYXRlKS5jYWxsKHNldElucHV0KS8vIEdhdGVcclxuICAgICAgICAgIC5jYWxsKHNldEJsdXIoJ2dhdGUnKSk7XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC52ZWwpLmNhbGwoc2V0SW5wdXQpLy8gVmVsb2NpdHlcclxuICAgICAgICAgIC5jYWxsKHNldEJsdXIoJ3ZlbCcpKTtcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLmNvbSkuY2FsbChzZXRJbnB1dCk7Ly8gQ29tbWFuZFxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuTWVhc3VyZTpcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dCgnJyk7Ly8gTWVhc2V1cmUgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KCcnKTsvLyBTdGVwICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJylcclxuICAgICAgICAgICAgLmF0dHIoeyAnY29sc3Bhbic6IDYsICd0YWJpbmRleCc6IDAgfSlcclxuICAgICAgICAgICAgLnRleHQoJyAtLS0gKCcgKyBkLnN0ZXBUb3RhbCArICcpIC0tLSAnKVxyXG4gICAgICAgICAgICAub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHJvd0luZGV4ID0gdGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5UcmFja0VuZDpcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dCgnJyk7Ly8gTWVhc2V1cmUgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KCcnKTsvLyBTdGVwICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJylcclxuICAgICAgICAgICAgLmF0dHIoeyAnY29sc3Bhbic6IDYsICd0YWJpbmRleCc6IDAgfSlcclxuICAgICAgICAgICAgLnRleHQoJyAtLS0gVHJhY2sgRW5kIC0tLSAnKVxyXG4gICAgICAgICAgICAub24oJ2ZvY3VzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHJvd0luZGV4ID0gdGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICA7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKHJvd0luZGV4ID4gKGV2ZmxhZ21lbnQubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgcm93SW5kZXggPSBldmZsYWdtZW50Lmxlbmd0aCAtIDE7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHRcclxuICAvLyDjgqTjg5njg7Pjg4jjga7jg5Xjgqnjg7zjgqvjgrlcclxuICBmdW5jdGlvbiBmb2N1c0V2ZW50KCkge1xyXG4gICAgbGV0IGV2cm93ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XSk7XHJcbiAgICBsZXQgZXYgPSBldnJvdy5kYXR1bSgpO1xyXG4gICAgc3dpdGNoIChldi50eXBlKSB7XHJcbiAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLk5vdGU6XHJcbiAgICAgICAgZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF0uZm9jdXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuTWVhc3VyZTpcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbMl0uZm9jdXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuVHJhY2tFbmQ6XHJcbiAgICAgICAgZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzWzJdLmZvY3VzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG5cdFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruaMv+WFpVxyXG4gIGZ1bmN0aW9uIGluc2VydEV2ZW50KHJvd0luZGV4KSB7XHJcbiAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIuZXhlYyh7XHJcbiAgICAgIGV4ZWMoKSB7XHJcbiAgICAgICAgdGhpcy5yb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgdGhpcy5jZWxsSW5kZXggPSBjZWxsSW5kZXg7XHJcbiAgICAgICAgdGhpcy5yb3dJbmRleCA9IHJvd0luZGV4O1xyXG4gICAgICAgIHRoaXMuZXhlY18oKTtcclxuICAgICAgfSxcclxuICAgICAgZXhlY18oKSB7XHJcbiAgICAgICAgdmFyIHJvdyA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkuaW5zZXJ0Um93KHRoaXMucm93SW5kZXgpKVxyXG4gICAgICAgICAgLmRhdHVtKG5ldyBhdWRpby5Ob3RlRXZlbnQoKSk7XHJcbiAgICAgICAgY2VsbEluZGV4ID0gMjtcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpOy8vIE1lYXNldXJlICNcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpOy8vIFN0ZXAgI1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dClcclxuICAgICAgICAuY2FsbChzZXRCbHVyKCdub3RlTmFtZScpKTtcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpLy8gTm90ZSAjXHJcbiAgICAgICAgLmNhbGwoc2V0Qmx1cignbm90ZScpKTtcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpLy8gU3RlcFxyXG4gICAgICAgIC5jYWxsKHNldEJsdXIoJ3N0ZXAnKSk7XHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KS8vIEdhdGVcclxuICAgICAgICAuY2FsbChzZXRCbHVyKCdnYXRlJykpO1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dCkvLyBWZWxvY2l0eVxyXG4gICAgICAgIC5jYWxsKHNldEJsdXIoJ3ZlbCcpKTtcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpOy8vIENvbW1hbmRcclxuICAgICAgICByb3cubm9kZSgpLmNlbGxzW3RoaXMuY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICAgIHJvdy5hdHRyKCdkYXRhLW5ldycsIHRydWUpO1xyXG4gICAgICB9LFxyXG4gICAgICByZWRvKCkge1xyXG4gICAgICAgIHRoaXMuZXhlY18oKTtcclxuICAgICAgfSxcclxuICAgICAgdW5kbygpIHtcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgIHRoaXMucm93LmNlbGxzW3RoaXMuY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgLy8g5paw6KaP5YWl5Yqb6KGM44Gu56K65a6aXHJcbiAgZnVuY3Rpb24gZW5kTmV3SW5wdXQoZG93biA9IHRydWUpIHtcclxuICAgIGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JywgbnVsbCk7XHJcbiAgICAvLyAx44Gk5YmN44Gu44OO44O844OI44OH44O844K/44KS5qSc57Si44GZ44KLXHJcbiAgICBsZXQgYmVmb3JlQ2VsbHMgPSBbXTtcclxuICAgIGxldCBzciA9IHJvd0luZGV4IC0gMTtcclxuICAgIHdoaWxlIChzciA+PSAwKSB7XHJcbiAgICAgIHZhciB0YXJnZXQgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbc3JdKTtcclxuICAgICAgaWYgKHRhcmdldC5kYXR1bSgpLnR5cGUgPT09IGF1ZGlvLkV2ZW50VHlwZS5Ob3RlKSB7XHJcbiAgICAgICAgYmVmb3JlQ2VsbHMgPSB0YXJnZXQubm9kZSgpLmNlbGxzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIC0tc3I7XHJcbiAgICB9XHJcbiAgICAvLyDnj77lnKjjga7nt6jpm4booYxcclxuICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHM7XHJcbiAgICBsZXQgZXYgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5kYXR1bSgpO1xyXG4gICAgLy8g44Ko44OZ44Oz44OI44KS55Sf5oiQ44GZ44KLXHJcbiAgICAvLyDjg4fjg7zjgr/jgYzkvZXjgoLlhaXlipvjgZXjgozjgabjgYTjgarjgYTjgajjgY3jga/jgIEx44Gk5YmN44Gu44OO44O844OI44OH44O844K/44KS6KSH6KO944GZ44KL44CCXHJcbiAgICAvLyAx44Gk5YmN44Gu44OO44O844OI44OH44O844K/44GM44Gq44GE44Go44GN44KE5LiN5q2j44OH44O844K/44Gu5aC05ZCI44Gv44CB44OH44OV44Kp44Or44OI5YCk44KS5Luj5YWl44GZ44KL44CCXHJcbiAgICBsZXQgbm90ZU5vID0gMDtcclxuICAgIGlmIChjZWxsSW5kZXggPT0gMikge1xyXG4gICAgICBsZXQgbm90ZSA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdLmlubmVyVGV4dFxyXG4gICAgICAgfHwgKGJlZm9yZUNlbGxzWzJdID8gYmVmb3JlQ2VsbHNbMl0uaW5uZXJUZXh0IDogJ0MgMCcpO1xyXG4gICAgICBldi5zZXROb3RlTmFtZVRvTm90ZShub3RlLCBiZWZvcmVDZWxsc1syXSA/IGJlZm9yZUNlbGxzWzJdLmlubmVyVGV4dCA6ICcnKTtcclxuICAgICAgbm90ZU5vID0gZXYubm90ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5vdGVObyA9IHBhcnNlRmxvYXQoY3VyUm93WzNdLmlubmVyVGV4dCB8fCAoYmVmb3JlQ2VsbHNbM10gPyBiZWZvcmVDZWxsc1szXS5pbm5lclRleHQgOiAnNjAnKSk7XHJcbiAgICB9XHJcbiAgICBpZiAoaXNOYU4obm90ZU5vKSkgbm90ZU5vID0gNjA7XHJcbiAgICBsZXQgc3RlcCA9IHBhcnNlRmxvYXQoY3VyUm93WzRdLmlubmVyVGV4dCB8fCAoYmVmb3JlQ2VsbHNbNF0gPyBiZWZvcmVDZWxsc1s0XS5pbm5lclRleHQgOiAnOTYnKSk7XHJcbiAgICBpZiAoaXNOYU4oc3RlcCkpIHN0ZXAgPSA5NjtcclxuICAgIGxldCBnYXRlID0gcGFyc2VGbG9hdChjdXJSb3dbNV0uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1s1XSA/IGJlZm9yZUNlbGxzWzVdLmlubmVyVGV4dCA6ICcyNCcpKTtcclxuICAgIGlmIChpc05hTihnYXRlKSkgZ2F0ZSA9IDI0O1xyXG4gICAgbGV0IHZlbCA9IHBhcnNlRmxvYXQoY3VyUm93WzZdLmlubmVyVGV4dCB8fCAoYmVmb3JlQ2VsbHNbNl0gPyBiZWZvcmVDZWxsc1s2XS5pbm5lclRleHQgOiAnMS4wJykpO1xyXG4gICAgaWYgKGlzTmFOKHZlbCkpIHZlbCA9IDEuMFxyXG4gICAgbGV0IGNvbSA9IC8qY3VyUm93WzddLmlubmVyVGV4dCB8fCBiZWZvcmVDZWxsc1s3XT9iZWZvcmVDZWxsc1s3XS5pbm5lclRleHQ6Ki9uZXcgYXVkaW8uQ29tbWFuZCgpO1xyXG5cclxuICAgIGV2Lm5vdGUgPSBub3RlTm87XHJcbiAgICBldi5zdGVwID0gc3RlcDtcclxuICAgIGV2LmdhdGUgPSBnYXRlO1xyXG4gICAgZXYudmVsID0gdmVsO1xyXG4gICAgZXYuY29tbWFuZCA9IGNvbTtcclxuICAgIC8vICAgICAgICAgICAgdmFyIGV2ID0gbmV3IGF1ZGlvLk5vdGVFdmVudChzdGVwLCBub3RlTm8sIGdhdGUsIHZlbCwgY29tKTtcclxuICAgIC8vIOODiOODqeODg+OCr+OBq+ODh+ODvOOCv+OCkuOCu+ODg+ODiFxyXG4gICAgdHJhY2suaW5zZXJ0RXZlbnQoZXYsIHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXgpO1xyXG4gICAgaWYgKGRvd24pIHtcclxuICAgICAgaWYgKHJvd0luZGV4ID09IChOVU1fUk9XIC0gMSkpIHtcclxuICAgICAgICArK2N1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICsrcm93SW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIC8vIOaMv+WFpeW+jOOAgeWGjeaPj+eUu1xyXG4gICAgZHJhd0V2ZW50KCk7XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIGFkZFJvdyhkZWx0YSlcclxuICB7XHJcbiAgICByb3dJbmRleCArPSBkZWx0YTtcclxuICAgIGxldCByb3dMZW5ndGggPSBlZGl0Vmlldy5ub2RlKCkucm93cy5sZW5ndGg7XHJcbiAgICBpZihyb3dJbmRleCA+PSByb3dMZW5ndGgpe1xyXG4gICAgICBsZXQgZCA9IHJvd0luZGV4IC0gcm93TGVuZ3RoICsgMTtcclxuICAgICAgcm93SW5kZXggPSByb3dMZW5ndGggLSAxO1xyXG4gICAgICBpZigoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XIC0xKSA8ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpe1xyXG4gICAgICAgIGN1cnJlbnRFdmVudEluZGV4ICs9IGQ7XHJcbiAgICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyAtMSkgPiAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKXtcclxuICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSBOVU1fUk9XICsgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgfVxyXG4gICAgaWYocm93SW5kZXggPCAwKXtcclxuICAgICAgbGV0IGQgPSByb3dJbmRleDtcclxuICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICBpZihjdXJyZW50RXZlbnRJbmRleCAhPSAwKXtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBkO1xyXG4gICAgICAgIGlmKGN1cnJlbnRFdmVudEluZGV4IDwgMCl7XHJcbiAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICB9IFxyXG4gICAgfVxyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gIH1cclxuICAgIFxyXG4gIGRyYXdFdmVudCgpO1xyXG4gIHdoaWxlICh0cnVlKSB7XHJcbiAgICBjb25zb2xlLmxvZygnbmV3IGxpbmUnLCByb3dJbmRleCwgdHJhY2suZXZlbnRzLmxlbmd0aCk7XHJcbiAgICBpZiAodHJhY2suZXZlbnRzLmxlbmd0aCA9PSAwIHx8IHJvd0luZGV4ID4gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgfVxyXG4gICAga2V5bG9vcDpcclxuICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgIGxldCBpbnB1dCA9IHlpZWxkIGNhbmNlbEV2ZW50O1xyXG4gICAgICBzd2l0Y2ggKGlucHV0LmlucHV0Q29tbWFuZC5pZCkge1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmVudGVyLmlkOi8vRW50ZXJcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdDUi9MRicpO1xyXG4gICAgICAgICAgLy8g54++5Zyo44Gu6KGM44GM5paw6KaP44GL57eo6ZuG5Lit44GLXHJcbiAgICAgICAgICBsZXQgZmxhZyA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3Jyk7XHJcbiAgICAgICAgICBpZiAoZmxhZykge1xyXG4gICAgICAgICAgICBlbmROZXdJbnB1dCgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy/mlrDopo/nt6jpm4bkuK3jga7ooYzjgafjgarjgZHjgozjgbDjgIHmlrDopo/lhaXlipvnlKjooYzjgpLmjL/lhaVcclxuICAgICAgICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQucmlnaHQuaWQ6Ly8gcmlnaHQgQ3Vyc29yXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGNlbGxJbmRleCsrO1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIGlmIChjZWxsSW5kZXggPiAoY3VyUm93W3Jvd0luZGV4XS5jZWxscy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgIGNlbGxJbmRleCA9IDI7XHJcbiAgICAgICAgICAgICAgaWYgKHJvd0luZGV4IDwgKGN1clJvdy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGVuZE5ld0lucHV0KCk7XHJcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgYWRkUm93KDEpO1xyXG4gICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5udW1iZXIuaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgICAgIGxldCBjdXJEYXRhID0gZDMuc2VsZWN0KGN1clJvdykuZGF0dW0oKTtcclxuICAgICAgICAgICAgaWYgKGN1ckRhdGEudHlwZSAhPSBhdWRpby5FdmVudFR5cGUuTm90ZSkge1xyXG4gICAgICAgICAgICAgIC8v5paw6KaP57eo6ZuG5Lit44Gu6KGM44Gn44Gq44GR44KM44Gw44CB5paw6KaP5YWl5Yqb55So6KGM44KS5oy/5YWlXHJcbiAgICAgICAgICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgIGNlbGxJbmRleCA9IDM7XHJcbiAgICAgICAgICAgICAgbGV0IGNlbGwgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XTtcclxuICAgICAgICAgICAgICBjZWxsLmlubmVyVGV4dCA9IGlucHV0Lm51bWJlcjtcclxuICAgICAgICAgICAgICBsZXQgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICAgIHNlbC5jb2xsYXBzZShjZWxsLCAxKTtcclxuICAgICAgICAgICAgICAvLyBzZWwuc2VsZWN0KCk7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLm5vdGUuaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF07XHJcbiAgICAgICAgICAgIGxldCBjdXJEYXRhID0gZDMuc2VsZWN0KGN1clJvdykuZGF0dW0oKTtcclxuICAgICAgICAgICAgaWYgKGN1ckRhdGEudHlwZSAhPSBhdWRpby5FdmVudFR5cGUuTm90ZSkge1xyXG4gICAgICAgICAgICAgIC8v5paw6KaP57eo6ZuG5Lit44Gu6KGM44Gn44Gq44GR44KM44Gw44CB5paw6KaP5YWl5Yqb55So6KGM44KS5oy/5YWlXHJcbiAgICAgICAgICAgICAgaW5zZXJ0RXZlbnQocm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgIGxldCBjZWxsID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF07XHJcbiAgICAgICAgICAgICAgY2VsbC5pbm5lclRleHQgPSBpbnB1dC5ub3RlO1xyXG4gICAgICAgICAgICAgIGxldCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICAgICAgc2VsLmNvbGxhcHNlKGNlbGwsIDEpO1xyXG4gICAgICAgICAgICAgIC8vIHNlbC5zZWxlY3QoKTtcclxuICAgICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQubGVmdC5pZDovLyBsZWZ0IEN1cnNvclxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIC0tY2VsbEluZGV4O1xyXG4gICAgICAgICAgICBpZiAoY2VsbEluZGV4IDwgMikge1xyXG4gICAgICAgICAgICAgIGlmIChyb3dJbmRleCAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgICAgICAgICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNlbGxJbmRleCA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxscy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICAgICAgYWRkUm93KC0xKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnVwLmlkOi8vIFVwIEN1cnNvclxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICAgICAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhZGRSb3coLTEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmRvd24uaWQ6Ly8gRG93biBDdXJzb3JcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgICAgICAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgICAgICAgICBlbmROZXdJbnB1dChmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYWRkUm93KDEpO1xyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5wYWdlRG93bi5pZDovLyBQYWdlIERvd24g44Kt44O8XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA8ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBOVU1fUk9XO1xyXG4gICAgICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4IC09IE5VTV9ST1c7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQucGFnZVVwLmlkOi8vIFBhZ2UgVXAg44Kt44O8XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IDApIHtcclxuICAgICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCAtPSBOVU1fUk9XO1xyXG4gICAgICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOOCueOCr+ODreODvOODq+OCouODg+ODl1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnNjcm9sbFVwLmlkOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgLS1jdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOOCueOCr+ODreODvOODq+ODgOOCpuODs1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnNjcm9sbERvd24uaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICgoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XKSA8PSAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgKytjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOWFiOmgreihjOOBq+enu+WLlVxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmhvbWUuaWQ6XHJcbiAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgIHJvd0luZGV4ID0gMDtcclxuICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAwO1xyXG4gICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5pyA57WC6KGM44Gr56e75YuVXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuZW5kLmlkOlxyXG4gICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ICE9ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g6KGM5YmK6ZmkXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuZGVsZXRlLmlkOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZigocm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleCkgPT0gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSl7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZXhlYygpIHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5yb3dJbmRleCA9IHJvd0luZGV4O1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRFdmVudEluZGV4ID0gY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuZXZlbnQgPSB0cmFjay5ldmVudHNbdGhpcy5yb3dJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucm93RGF0YSA9IHRyYWNrLmV2ZW50c1t0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGxpbmVCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgIGxpbmVCdWZmZXIgPSB0aGlzLmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICB0cmFjay5kZWxldGVFdmVudCh0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcmVkbygpIHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5saW5lQnVmZmVyID0gbGluZUJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgICAgbGluZUJ1ZmZlciA9IHRoaXMuZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIHRyYWNrLmRlbGV0ZUV2ZW50KHRoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB1bmRvKCkge1xyXG4gICAgICAgICAgICAgICAgICBsaW5lQnVmZmVyID0gdGhpcy5saW5lQnVmZmVyO1xyXG4gICAgICAgICAgICAgICAgICB0cmFjay5pbnNlcnRFdmVudCh0aGlzLmV2ZW50LCB0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDjg6njgqTjg7Pjg5Djg4Pjg5XjgqHjga7lhoXlrrnjgpLjg5rjg7zjgrnjg4jjgZnjgotcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5saW5lUGFzdGUuaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChsaW5lQnVmZmVyKSB7XHJcbiAgICAgICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIGV4ZWMoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb3dJbmRleCA9IHJvd0luZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGxpbmVCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhY2suaW5zZXJ0RXZlbnQobGluZUJ1ZmZlci5jbG9uZSgpLCByb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICByZWRvKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYWNrLmluc2VydEV2ZW50KHRoaXMubGluZUJ1ZmZlci5jbG9uZSgpLCB0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgIHVuZG8oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhY2suZGVsZXRlRXZlbnQodGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIHJlZG8gICBcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5yZWRvLmlkOlxyXG4gICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLnJlZG8oKTtcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIHVuZG8gIFxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnVuZG8uaWQ6XHJcbiAgICAgICAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIudW5kbygpO1xyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5bCP56+A57ea5oy/5YWlXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuaW5zZXJ0TWVhc3VyZS5pZDovLyAqXHJcbiAgICAgICAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIuZXhlYyhcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIGV4ZWMoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4ID0gcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICAgIHRyYWNrLmluc2VydEV2ZW50KG5ldyBhdWRpby5NZWFzdXJlKCksIHRoaXMuaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICByZWRvKCkge1xyXG4gICAgICAgICAgICAgICAgdHJhY2suaW5zZXJ0RXZlbnQobmV3IGF1ZGlvLk1lYXN1cmUoKSwgdGhpcy5pbmRleCk7XHJcbiAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHVuZG8oKSB7XHJcbiAgICAgICAgICAgICAgICB0cmFjay5kZWxldGVFdmVudCh0aGlzLmluZGV4KTtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g44OH44OV44Kp44Or44OIXHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnZGVmYXVsdCcpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTZXF1ZW5jZUVkaXRvcihkKSB7XHJcblx0IGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0IGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0IGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0IGlmIChkLnBhbmVsICYmIGQucGFuZWwuaXNTaG93KSByZXR1cm47XHJcblx0IGQuZWRpdG9ySW5zdGFuY2UgPSBuZXcgU2VxdWVuY2VFZGl0b3IoZCk7XHJcbn1cclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2V2ZW50RW1pdHRlcjMnO1xyXG5pbXBvcnQgKiBhcyBwcm9wIGZyb20gJy4vcHJvcCc7XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHN0ZXAgPSAwLG5hbWUgPSBcIlwiKXtcclxuXHRcdHRoaXMuc3RlcCA9IHN0ZXA7XHJcblx0XHR0aGlzLnN0ZXBObyA9IDA7XHJcblx0XHR0aGlzLm1lYXN1cmUgPSAwO1xyXG5cdFx0dGhpcy5uYW1lID0gIG5hbWU7XHJcblx0fVxyXG59XHJcblxyXG5jb25zdCBDb21tYW5kVHlwZSA9IHtcclxuICBzZXRWYWx1ZUF0VGltZTowLFxyXG4gIGxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lOjEsXHJcbiAgZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZToyICBcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldFZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSlcclxue1xyXG5cdGF1ZGlvUGFyYW0uc2V0VmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZShhdWRpb1BhcmFtLHZhbHVlLHRpbWUpe1xyXG5cdGF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSl7XHJcblx0YXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2YWx1ZSx0aW1lKTtcclxufVxyXG5cclxuY29uc3QgY29tbWFuZEZ1bmNzID1bXHJcbiAgc2V0VmFsdWVBdFRpbWUsXHJcbiAgbGluZWFyUmFtcFRvVmFsdWVBdFRpbWUsXHJcbiAgZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZVxyXG5dO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBDb21tYW5kIHtcclxuXHRjb25zdHJ1Y3RvcihwaXRjaENvbW1hbmQgPSBDb21tYW5kVHlwZS5zZXRWYWx1ZUF0VGltZSx2ZWxvY2l0eUNvbW1hbmQgPSBDb21tYW5kVHlwZS5zZXRWYWx1ZUF0VGltZSlcclxuXHR7XHJcbiAgICB0aGlzLnBpdGNoQ29tbWFuZCA9IHBpdGNoQ29tbWFuZDtcclxuICAgIHRoaXMudmVsb2NpdHlDb21tYW5kID0gdmVsb2NpdHlDb21tYW5kO1xyXG5cdFx0dGhpcy5wcm9jZXNzUGl0Y2ggPSBjb21tYW5kRnVuY3NbcGl0Y2hDb21tYW5kXS5iaW5kKHRoaXMpO1xyXG5cdFx0dGhpcy5wcm9jZXNzVmVsb2NpdHkgPSBjb21tYW5kRnVuY3NbdmVsb2NpdHlDb21tYW5kXS5iaW5kKHRoaXMpO1xyXG5cdH1cclxuICBcclxuICB0b0pTT04oKVxyXG4gIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHBpdGNoQ29tbWFuZDp0aGlzLnBpdGNoQ29tbWFuZCxcclxuICAgICAgdmVsb2NpdHlDb21tYW5kOnRoaXMudmVsb2NpdHlDb21tYW5kXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUpTT04obyl7XHJcbiAgICByZXR1cm4gbmV3IENvbW1hbmQoby5waXRjaENvbW1hbmQsby52ZWxvY2l0eUNvbW1hbmQpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IEV2ZW50VHlwZSAgPSB7XHJcblx0Tm90ZTowLFxyXG5cdE1lYXN1cmU6MSxcclxuXHRUcmFja0VuZDoyXHJcbn1cclxuXHJcbi8vIOWwj+evgOe3mlxyXG5leHBvcnQgY2xhc3MgTWVhc3VyZSBleHRlbmRzIEV2ZW50QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHN1cGVyKDApO1xyXG5cdFx0dGhpcy50eXBlID0gRXZlbnRUeXBlLk1lYXN1cmU7XHJcbiAgICB0aGlzLnN0ZXBUb3RhbCA9IDA7XHJcbiAgICB0aGlzLnN0YXJ0SW5kZXggPSAwO1xyXG4gICAgdGhpcy5lbmRJbmRleCA9IDA7XHJcblx0fVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTonTWVhc3VyZScsXHJcbiAgICAgIG1lYXN1cmU6dGhpcy5tZWFzdXJlLFxyXG4gICAgICBzdGVwTm86dGhpcy5zdGVwTm8sXHJcbiAgICAgIHN0ZXA6dGhpcy5zdGVwLFxyXG4gICAgICB0eXBlOnRoaXMudHlwZSxcclxuICAgICAgc3RlcFRvdGFsOnRoaXMuc3RlcFRvdGFsLFxyXG4gICAgICBzdGFydEluZGV4OnRoaXMuc3RhcnRJbmRleCxcclxuICAgICAgZW5kSW5kZXg6dGhpcy5lbmRJbmRleFxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21KU09OKG8pe1xyXG4gICAgbGV0IHJldCA9IG5ldyBNZWFzdXJlKCk7XHJcbiAgICByZXQubWVhc3VyZSA9IG8ubWVhc3VyZTtcclxuICAgIHJldC5zdGVwTm8gPSBvLnN0ZXBObztcclxuICAgIHJldC5zdGVwID0gby5zdGVwO1xyXG4gICAgcmV0LnN0ZXBUb3RhbCA9IG8uc3RlcFRvdGFsO1xyXG4gICAgcmV0LnN0YXJ0SW5kZXggPSBvLnN0YXJ0SW5kZXg7XHJcbiAgICByZXQuZW5kSW5kZXggPSBvLmVuZEluZGV4O1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcbiAgY2xvbmUoKXtcclxuICAgIHJldHVybiBuZXcgTWVhc3VyZSgpO1xyXG4gIH1cclxuICBcclxuICBwcm9jZXNzKCl7XHJcbiAgICBcclxuICB9XHJcbn1cclxuXHJcbi8vIFRyYWNrIEVuZFxyXG5leHBvcnQgY2xhc3MgVHJhY2tFbmQgZXh0ZW5kcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigwKTtcclxuXHRcdHRoaXMudHlwZSA9IEV2ZW50VHlwZS5UcmFja0VuZDtcclxuXHR9XHJcbiAgcHJvY2Vzcygpe1xyXG4gICAgXHJcbiAgfVxyXG5cdFxyXG59XHJcblxyXG52YXIgTm90ZXMgPSBbXHJcblx0J0MgJyxcclxuXHQnQyMnLFxyXG5cdCdEICcsXHJcblx0J0QjJyxcclxuXHQnRSAnLFxyXG5cdCdGICcsXHJcblx0J0YjJyxcclxuXHQnRyAnLFxyXG5cdCdHIycsXHJcblx0J0EgJyxcclxuXHQnQSMnLFxyXG5cdCdCICcsXHJcbl07XHJcblxyXG5leHBvcnQgY2xhc3MgTm90ZUV2ZW50IGV4dGVuZHMgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihzdGVwID0gMCxub3RlID0gMCxnYXRlID0gMCx2ZWwgPSAwLjUsY29tbWFuZCA9IG5ldyBDb21tYW5kKCkpe1xyXG5cdFx0c3VwZXIoc3RlcCk7XHJcblx0XHR0aGlzLnRyYW5zcG9zZV8gPSAwLjA7XHJcblx0XHR0aGlzLm5vdGUgPSBub3RlO1xyXG5cdFx0dGhpcy5nYXRlID0gZ2F0ZTtcclxuXHRcdHRoaXMudmVsID0gdmVsO1xyXG5cdFx0dGhpcy5jb21tYW5kID0gY29tbWFuZDtcclxuXHRcdHRoaXMuY29tbWFuZC5ldmVudCA9IHRoaXM7XHJcblx0XHR0aGlzLnR5cGUgPSBFdmVudFR5cGUuTm90ZTtcclxuXHRcdHRoaXMuc2V0Tm90ZU5hbWUoKTtcclxuXHR9XHJcblx0XHJcbiAgIHRvSlNPTigpe1xyXG4gICAgIHJldHVybiB7XHJcbiAgICAgICBuYW1lOidOb3RlRXZlbnQnLFxyXG4gICAgICAgbWVhc3VyZTp0aGlzLm1lYXN1cmUsXHJcbiAgICAgICBzdGVwTm86dGhpcy5zdGVwTm8sXHJcbiAgICAgICBzdGVwOnRoaXMuc3RlcCxcclxuICAgICAgIG5vdGU6dGhpcy5ub3RlLFxyXG4gICAgICAgZ2F0ZTp0aGlzLmdhdGUsXHJcbiAgICAgICB2ZWw6dGhpcy52ZWwsXHJcbiAgICAgICBjb21tYW5kOnRoaXMuY29tbWFuZCxcclxuICAgICAgIHR5cGU6dGhpcy50eXBlXHJcbiAgICAgfVxyXG4gICB9XHJcbiAgIFxyXG4gICBzdGF0aWMgZnJvbUpTT04obyl7XHJcbiAgICAgbGV0IHJldCA9IG5ldyBOb3RlRXZlbnQoby5zdGVwLG8ubm90ZSxvLmdhdGUsby52ZWwsQ29tbWFuZC5mcm9tSlNPTihvLmNvbW1hbmQpKTtcclxuICAgICByZXQubWVhc3VyZSA9IG8ubWVhc3VyZTtcclxuICAgICByZXQuc3RlcE5vID0gby5zdGVwTm87XHJcbiAgICAgcmV0dXJuIHJldDtcclxuICAgfVxyXG4gIFxyXG4gIGNsb25lKCl7XHJcbiAgICByZXR1cm4gbmV3IE5vdGVFdmVudCh0aGlzLnN0ZXAsdGhpcy5ub3RlLHRoaXMuZ2F0ZSx0aGlzLnZlbCx0aGlzLmNvbW1hbmQpO1xyXG4gIH1cclxuICBcclxuXHRzZXROb3RlTmFtZSgpe1xyXG5cdFx0XHRsZXQgb2N0ID0gdGhpcy5ub3RlIC8gMTIgfCAwO1xyXG5cdFx0XHR0aGlzLm5hbWUgPSBOb3Rlc1t0aGlzLm5vdGUgJSAxMl0gKyBvY3Q7XHJcblx0fVxyXG5cclxuXHRzZXROb3RlTmFtZVRvTm90ZShub3RlTmFtZSxkZWZhdWx0Tm90ZU5hbWUgPSBcIlwiKVxyXG5cdHtcclxuICAgIHZhciBtYXRjaGVzID0gbm90ZU5hbWUubWF0Y2goLyhDIyl8KEMpfChEIyl8KEQpfChFKXwoRiMpfChGKXwoRyMpfChHKXwoQSMpfChBKXwoQikvaSk7XHJcblx0XHRpZihtYXRjaGVzKVxyXG5cdFx0e1xyXG4gICAgICB2YXIgbiA9IG1hdGNoZXNbMF07XHJcbiAgICAgIHZhciBnZXROdW1iZXIgPSBuZXcgUmVnRXhwKCcoWzAtOV17MSwyfSknKTtcclxuLy8gICAgICBnZXROdW1iZXIuY29tcGlsZSgpO1xyXG4gICAgICBnZXROdW1iZXIuZXhlYyhub3RlTmFtZSk7XHJcbiAgICAgIHZhciBvID0gUmVnRXhwLiQxO1xyXG4gICAgICBpZighbyl7XHJcbiAgICAgICAgKG5ldyBSZWdFeHAoJyhbMC05XXsxLDJ9KScpKS5leGVjKGRlZmF1bHROb3RlTmFtZSk7ICAgICAgICBcclxuICAgICAgICBvID0gUmVnRXhwLiQxO1xyXG4gICAgICAgIGlmKCFvKXtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYobi5sZW5ndGggPT09IDEpIG4gKz0gJyAnO1xyXG4gICAgICBcclxuICAgICAgaWYoTm90ZXMuc29tZSgoZCxpKT0+e1xyXG4gICAgICAgICAgaWYoZCA9PT0gbil7XHJcbiAgICAgICAgICAgIHRoaXMubm90ZSA9IHBhcnNlRmxvYXQoaSkgKyBwYXJzZUZsb2F0KG8pICogMTI7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVx0XHRcdFx0XHJcbiAgICAgICAgIH0pKVxyXG4gICAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zZXROb3RlTmFtZSgpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cdFx0fSBlbHNlIHtcclxuICAgICAgdGhpcy5zZXROb3RlTmFtZSgpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7IFxyXG4gICAgfVxyXG5cdH1cclxuXHRcclxuXHRnZXQgbm90ZSAoKXtcclxuXHRcdCByZXR1cm4gdGhpcy5ub3RlXztcclxuXHR9XHJcblx0XHJcblx0c2V0IG5vdGUodil7XHJcblx0XHQgdGhpcy5ub3RlXyA9IHY7XHJcblx0XHQgdGhpcy5jYWxjUGl0Y2goKTtcclxuXHRcdCB0aGlzLnNldE5vdGVOYW1lKCk7XHJcblx0fVxyXG5cdFxyXG5cdHNldCB0cmFuc3Bvc2Uodil7XHJcblx0XHRpZih2ICE9IHRoaXMudHJhbnNwb3NlXyl7XHJcblx0XHRcdHRoaXMudHJhbnNwb3NlXyA9IHY7XHJcblx0XHRcdHRoaXMuY2FsY1BpdGNoKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGNhbGNQaXRjaCgpe1xyXG5cdFx0dGhpcy5waXRjaCA9ICg0NDAuMCAvIDMyLjApICogKE1hdGgucG93KDIuMCwoKHRoaXMubm90ZSArIHRoaXMudHJhbnNwb3NlXyAtIDkpIC8gMTIpKSk7XHJcblx0fVxyXG5cdFxyXG5cdHByb2Nlc3ModGltZSx0cmFjayl7XHJcblx0XHRcdGlmKHRoaXMubm90ZSl7XHJcblx0XHRcdFx0dGhpcy50cmFuc29wc2UgPSB0cmFjay50cmFuc3Bvc2U7XHJcblx0XHRcdFx0Zm9yKGxldCBqID0gMCxqZSA9IHRyYWNrLnBpdGNoZXMubGVuZ3RoO2ogPCBqZTsrK2ope1xyXG5cdFx0XHRcdFx0dHJhY2sucGl0Y2hlc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCx0aGlzLnBpdGNoLHRpbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IobGV0IGogPSAwLGplID0gdHJhY2sudmVsb2NpdGllcy5sZW5ndGg7aiA8IGplOysrail7XHJcblx0XHRcdFx0XHQvLyBrZXlvblxyXG5cdFx0XHRcdFx0dHJhY2sudmVsb2NpdGllc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCx0aGlzLnZlbCx0aW1lKTtcclxuXHRcdFx0XHRcdC8vIGtleW9mZlxyXG5cdFx0XHRcdFx0dHJhY2sudmVsb2NpdGllc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCwwLHRpbWUgKyB0aGlzLmdhdGUgKiB0cmFjay5zZXF1ZW5jZXIuc3RlcFRpbWVfICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBUcmFjayBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3Ioc2VxdWVuY2VyKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmV2ZW50cyA9IFtdO1xyXG5cdFx0dGhpcy5wb2ludGVyID0gMDtcclxuXHRcdHRoaXMuZXZlbnRzLnB1c2gobmV3IFRyYWNrRW5kKCkpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3N0ZXAnKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdlbmQnKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCduYW1lJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywndHJhbnNwb3NlJyk7XHJcblx0XHRcclxuXHRcdHRoaXMuc3RlcCA9IDA7XHJcblx0XHR0aGlzLmVuZCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5waXRjaGVzID0gW107XHJcblx0XHR0aGlzLnZlbG9jaXRpZXMgPSBbXTtcclxuXHRcdHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG5cdFx0dGhpcy5uYW1lID0gJyc7XHJcblx0XHR0aGlzLnRyYW5zcG9zZSA9IDA7XHJcblx0fVxyXG5cdFxyXG4gIHRvSlNPTigpXHJcbiAge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTonVHJhY2snLFxyXG4gICAgICBldmVudHM6dGhpcy5ldmVudHMsXHJcbiAgICAgIHN0ZXA6dGhpcy5zdGVwLFxyXG4gICAgICB0cmFja05hbWU6dGhpcy5uYW1lLFxyXG4gICAgICB0cmFuc3Bvc2U6dGhpcy50cmFuc3Bvc2VcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tSlNPTihvLHNlcXVlbmNlcilcclxuICB7XHJcbiAgICBsZXQgcmV0ID0gbmV3IFRyYWNrKHNlcXVlbmNlcik7XHJcbiAgICByZXQuc3RlcCA9IG8uc3RlcDtcclxuICAgIHJldC5uYW1lID0gby50cmFja05hbWU7XHJcbiAgICByZXQudHJhbnNwb3NlID0gby50cmFuc3Bvc2U7XHJcbiAgICBvLmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGQpe1xyXG4gICAgICBzd2l0Y2goZC50eXBlKXtcclxuICAgICAgICBjYXNlIEV2ZW50VHlwZS5Ob3RlOlxyXG4gICAgICAgICAgcmV0LmFkZEV2ZW50KE5vdGVFdmVudC5mcm9tSlNPTihkKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgcmV0LmFkZEV2ZW50KE1lYXN1cmUuZnJvbUpTT04oZCkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBFdmVudFR5cGUuVHJhY2tFbmQ6XHJcbiAgICAgICAgLy/kvZXjgoLjgZfjgarjgYRcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuXHRhZGRFdmVudChldil7XHJcblx0XHRpZih0aGlzLmV2ZW50cy5sZW5ndGggPiAxKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgYmVmb3JlID0gdGhpcy5ldmVudHNbdGhpcy5ldmVudHMubGVuZ3RoIC0gMl07XHJcblx0XHRcdHN3aXRjaChiZWZvcmUudHlwZSl7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTm90ZTpcclxuXHRcdFx0XHRcdGV2LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTWVhc3VyZTpcclxuXHRcdFx0XHRcdGV2LnN0ZXBObyA9IDE7XHJcblx0XHRcdFx0XHRldi5tZWFzdXJlID0gYmVmb3JlLm1lYXN1cmUgKyAxO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGV2LnN0ZXBObyA9IDE7XHJcblx0XHRcdGV2Lm1lYXN1cmUgPSAxO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5ldmVudHMuc3BsaWNlKHRoaXMuZXZlbnRzLmxlbmd0aCAtIDEsMCxldik7XHJcbiAgICB0aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKHRoaXMuZXZlbnRzLmxlbmd0aCAtIDIpO1xyXG5cdH1cclxuXHRcclxuXHRpbnNlcnRFdmVudChldixpbmRleCl7XHJcblx0XHRpZih0aGlzLmV2ZW50cy5sZW5ndGggPiAxICYmIGluZGV4ICE9IDApe1xyXG5cdFx0XHR2YXIgYmVmb3JlID0gdGhpcy5ldmVudHNbaW5kZXgtMV07XHJcblx0XHRcdHN3aXRjaChiZWZvcmUudHlwZSl7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTm90ZTpcclxuXHRcdFx0XHRcdGV2LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk1lYXN1cmU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlICsgMTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZXYuc3RlcE5vID0gMTtcclxuXHRcdFx0ZXYubWVhc3VyZSA9IDE7XHJcbiAgICB9XHJcblx0XHR0aGlzLmV2ZW50cy5zcGxpY2UoaW5kZXgsMCxldik7XHJcblx0XHRpZihldi50eXBlID09IEV2ZW50VHlwZS5NZWFzdXJlKXtcclxuXHRcdFx0dGhpcy51cGRhdGVTdGVwQW5kTWVhc3VyZShpbmRleCk7XHRcdFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy51cGRhdGVTdGVwKGluZGV4KTtcdFx0XHJcbiAgICB9XHJcbiAgICB0aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKGluZGV4KTtcclxuXHR9XHJcbiAgICBcclxuXHR1cGRhdGVTdGVwKGluZGV4KXtcclxuXHRcdGZvcihsZXQgaSA9IGluZGV4ICsgMSxlID0gdGhpcy5ldmVudHMubGVuZ3RoO2k8ZTsrK2kpXHJcblx0XHR7XHJcblx0XHRcdGxldCBiZWZvcmUgPSB0aGlzLmV2ZW50c1tpLTFdO1xyXG5cdFx0XHRsZXQgY3VycmVudCA9IHRoaXMuZXZlbnRzW2ldO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRjdXJyZW50LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0Y3VycmVudC5tZWFzdXJlID0gYmVmb3JlLm1lYXN1cmU7XHJcbiAgICAgICAgICBicmVhaztcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgYnJlYWs7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cdFx0XHRcclxuXHRcdH1cclxuXHR9XHRcclxuICBcclxuXHR1cGRhdGVTdGVwQW5kTWVhc3VyZShpbmRleCl7XHJcblx0XHRmb3IobGV0IGkgPSBpbmRleCArIDEsZSA9IHRoaXMuZXZlbnRzLmxlbmd0aDtpPGU7KytpKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgYmVmb3JlID0gdGhpcy5ldmVudHNbaS0xXTtcclxuXHRcdFx0bGV0IGN1cnJlbnQgPSB0aGlzLmV2ZW50c1tpXTtcclxuXHRcdFx0c3dpdGNoKGJlZm9yZS50eXBlKXtcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5Ob3RlOlxyXG5cdFx0XHRcdFx0Y3VycmVudC5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGN1cnJlbnQubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk1lYXN1cmU6XHJcblx0XHRcdFx0XHRjdXJyZW50LnN0ZXBObyA9IDE7XHJcblx0XHRcdFx0XHRjdXJyZW50Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZSArIDE7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcbiAgXHJcbiAgY2FsY01lYXN1cmVTdGVwVG90YWwoaW5kZXgpe1xyXG4gICAgbGV0IGluZGV4QWZ0ZXIgPSBpbmRleCArMTtcclxuICAgIGxldCBldmVudHMgPSB0aGlzLmV2ZW50cztcclxuICAgIGxldCBzdGVwVG90YWwgPSAwO1xyXG4gICAgbGV0IGV2ZW50ID0gZXZlbnRzW2luZGV4XTtcclxuICAgIC8vIOaMv+WFpeOBl+OBn+ODoeOCuOODo+ODvOOBrnN0ZXBUb3RhbOOCkuijnOato1xyXG4gICAgaWYoZXZlbnQudHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSl7XHJcbiAgICAgIC0taW5kZXg7XHJcbiAgICAgIHdoaWxlKGluZGV4ID49IDApe1xyXG4gICAgICAgIGxldCBldiA9IGV2ZW50c1tpbmRleF07XHJcbiAgICAgICAgaWYoZXYudHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RlcFRvdGFsICs9ICBldi5zdGVwO1xyXG4gICAgICAgIH1cclxuICAgICAgICAtLWluZGV4O1xyXG4gICAgICB9XHJcbiAgICAgIGV2ZW50LnN0ZXBUb3RhbCA9IHN0ZXBUb3RhbDtcclxuICAgICAgLy8g5b6M57aa44Gu44Oh44K444Oj44O844Guc3RlcFRvdGFs44KS6KOc5q2jXHJcbiAgICAgIHN0ZXBUb3RhbCA9IDA7XHJcbiAgICAgIGlmKGluZGV4QWZ0ZXIgPj0gKGV2ZW50cy5sZW5ndGggLTEpKVxyXG4gICAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKGV2ZW50c1tpbmRleEFmdGVyXS50eXBlID09IEV2ZW50VHlwZS5NZWFzdXJlKXtcclxuICAgICAgICBldmVudHNbaW5kZXhBZnRlcl0uc3RlcFRvdGFsID0gMDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUoaW5kZXhBZnRlciA8IChldmVudHMubGVuZ3RoIC0gMSkgKVxyXG4gICAgICB7XHJcbiAgICAgICAgaWYoZXZlbnRzW2luZGV4QWZ0ZXJdLnR5cGUgIT0gRXZlbnRUeXBlLk1lYXN1cmUpe1xyXG4gICAgICAgICAgc3RlcFRvdGFsICs9IGV2ZW50c1tpbmRleEFmdGVyKytdLnN0ZXA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGV2ZW50c1tpbmRleEFmdGVyXS5zdGVwVG90YWwgPSBzdGVwVG90YWw7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g5LiA44Gk5YmN44Gu44Oh44K444Oj44O844KS5o6i44GZXHJcbiAgICAgIGxldCBzdGFydEluZGV4ID0gMDtcclxuICAgICAgaWYoaW5kZXggPT0gMCl7XHJcbiAgICAgICAgc3RhcnRJbmRleCA9IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3RhcnRJbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHdoaWxlKHN0YXJ0SW5kZXggPiAwKXtcclxuICAgICAgICAgIC0tc3RhcnRJbmRleDtcclxuICAgICAgICAgIGlmKHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICsrc3RhcnRJbmRleDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHN0ZXBUb3RhbCA9IDA7XHJcbiAgICAgIHdoaWxlKHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnR5cGUgPT0gRXZlbnRUeXBlLk5vdGUpXHJcbiAgICAgIHtcclxuICAgICAgICBzdGVwVG90YWwgKz0gdGhpcy5ldmVudHNbc3RhcnRJbmRleF0uc3RlcDsgICAgICAgIFxyXG4gICAgICAgICsrc3RhcnRJbmRleDtcclxuICAgICAgfSAgXHJcbiAgICAgIGlmKHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpe1xyXG4gICAgICAgIHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnN0ZXBUb3RhbCA9IHN0ZXBUb3RhbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu5YmK6ZmkICBcclxuICBkZWxldGVFdmVudChpbmRleCl7XHJcbiAgICB2YXIgZXYgPSB0aGlzLmV2ZW50c1tpbmRleF07XHJcbiAgICB0aGlzLmV2ZW50cy5zcGxpY2UoaW5kZXgsMSk7XHJcbiAgICBpZihpbmRleCA9PSAwKXtcclxuICAgICAgdGhpcy5ldmVudHNbMF0ubWVhc3VyZSA9IDE7XHJcbiAgICAgIHRoaXMuZXZlbnRzWzBdLnN0ZXBObyA9IDE7XHJcbiAgICAgIGlmKHRoaXMuZXZlbnRzLmxlbmd0aCA+IDEpe1xyXG4gICAgICAgIHN3aXRjaChldi50eXBlKXtcclxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLm5vdGU6XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RlcCgxKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0ZXBBbmRNZWFzdXJlKDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZihpbmRleCA8PSAodGhpcy5ldmVudHMubGVuZ3RoIC0gMSkpXHJcbiAgICB7XHJcbiAgICAgICAgc3dpdGNoKGV2LnR5cGUpe1xyXG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuTm90ZTpcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGVwKGluZGV4IC0gMSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuTWVhc3VyZTpcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGVwQW5kTWVhc3VyZShpbmRleCAtIDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKGluZGV4KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBTRVFfU1RBVFVTID0ge1xyXG5cdFNUT1BQRUQ6MCxcclxuXHRQTEFZSU5HOjEsXHJcblx0UEFVU0VEOjJcclxufSA7XHJcblxyXG5leHBvcnQgY29uc3QgTlVNX09GX1RSQUNLUyA9IDQ7XHJcblxyXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdFxyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JwbScpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3RwYicpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JlYXQnKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdiYXInKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdyZXBlYXQnKTtcclxuXHJcblx0XHR0aGlzLmJwbSA9IDEyMC4wOyAvLyB0ZW1wb1xyXG4gICAgXHJcblx0XHR0aGlzLnRwYiA9IDk2LjA7IC8vIOWbm+WIhumfs+espuOBruino+WDj+W6plxyXG5cdFx0dGhpcy5iZWF0ID0gNDtcclxuXHRcdHRoaXMuYmFyID0gNDsgLy8gXHJcblx0XHR0aGlzLnJlcGVhdCA9IGZhbHNlO1xyXG5cdFx0dGhpcy50cmFja3MgPSBbXTtcclxuXHRcdHRoaXMubnVtYmVyT2ZJbnB1dHMgPSAwO1xyXG5cdFx0dGhpcy5udW1iZXJPZk91dHB1dHMgPSAwO1xyXG5cdFx0dGhpcy5uYW1lID0gJ1NlcXVlbmNlcic7XHJcblx0XHRmb3IgKHZhciBpID0gMDtpIDwgTlVNX09GX1RSQUNLUzsrK2kpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMudHJhY2tzLnB1c2gobmV3IFRyYWNrKHRoaXMpKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddID0gbmV3IGF1ZGlvLlBhcmFtVmlldyhudWxsLCd0cmsnICsgaSArICdnJyx0cnVlKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddLnRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ2cnXS50eXBlID0gJ2dhdGUnO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddID0gbmV3IGF1ZGlvLlBhcmFtVmlldyhudWxsLCd0cmsnICsgaSArICdwJyx0cnVlKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddLnRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ3AnXS50eXBlID0gJ3BpdGNoJztcclxuXHRcdH1cclxuXHRcdHRoaXMuc3RhcnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRNZWFzdXJlXyA9IDA7XHJcblx0XHR0aGlzLmNhbGNTdGVwVGltZSgpO1xyXG5cdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cclxuXHRcdC8vXHJcblx0XHR0aGlzLm9uKCdicG1fY2hhbmdlZCcsKCk9Pnt0aGlzLmNhbGNTdGVwVGltZSgpO30pO1xyXG5cdFx0dGhpcy5vbigndHBiX2NoYW5nZWQnLCgpPT57dGhpcy5jYWxjU3RlcFRpbWUoKTt9KTtcclxuXHJcblx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5wdXNoKHRoaXMpO1xyXG5cdFx0aWYoU2VxdWVuY2VyLmFkZGVkKXtcclxuXHRcdFx0U2VxdWVuY2VyLmFkZGVkKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6J1NlcXVlbmNlcicsXHJcbiAgICAgIGJwbTp0aGlzLmJwbSxcclxuICAgICAgdHBiOnRoaXMudHBiLFxyXG4gICAgICBiZWF0OnRoaXMuYmVhdCxcclxuICAgICAgYmFyOnRoaXMuYmFyLFxyXG4gICAgICB0cmFja3M6dGhpcy50cmFja3MsXHJcbiAgICAgIHJlcGVhdDp0aGlzLnJlcGVhdFxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUpTT04obylcclxuICB7XHJcbiAgICBsZXQgcmV0ID0gbmV3IFNlcXVlbmNlcigpO1xyXG4gICAgcmV0LmJwbSA9IG8uYnBtO1xyXG4gICAgcmV0LnRwYiA9IG8udHBiO1xyXG4gICAgcmV0LmJlYXQgPSBvLmJlYXQ7XHJcbiAgICByZXQuYmFyID0gby5iYXI7XHJcbiAgICByZXQudHJhY2tzLmxlbmd0aCA9IDA7XHJcbiAgICBvLnRyYWNrcy5mb3JFYWNoKGZ1bmN0aW9uKGQpe1xyXG4gICAgICByZXQudHJhY2tzLnB1c2goVHJhY2suZnJvbUpTT04oZCkpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuXHJcblx0ZGlzcG9zZSgpe1xyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoOysraSlcclxuXHRcdHtcclxuXHRcdFx0aWYodGhpcyA9PT0gU2VxdWVuY2VyLnNlcXVlbmNlcnNbaV0pe1xyXG5cdFx0XHRcdCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zcGxpY2UoaSwxKTtcclxuXHRcdFx0XHQgYnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoID09IDApXHJcblx0XHR7XHJcblx0XHRcdGlmKFNlcXVlbmNlci5lbXB0eSl7XHJcblx0XHRcdFx0U2VxdWVuY2VyLmVtcHR5KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Y2FsY1N0ZXBUaW1lKCl7XHJcblx0XHR0aGlzLnN0ZXBUaW1lXyA9IDYwLjAgLyAoIHRoaXMuYnBtICogdGhpcy50cGIpOyBcclxuXHR9XHJcblx0XHJcblx0c3RhcnQodGltZSl7XHJcblx0XHRpZih0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5TVE9QUEVEIHx8IHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBBVVNFRCApe1xyXG5cdFx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IHRpbWUgfHwgYXVkaW8uY3R4LmN1cnJlbnRUaW1lKCk7XHJcblx0XHRcdHRoaXMuc3RhcnRUaW1lXyAgPSB0aGlzLmN1cnJlbnRUaW1lXztcclxuXHRcdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5QTEFZSU5HO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRzdG9wKCl7XHJcblx0XHRpZih0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QTEFZSU5HIHx8IHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBBVVNFRClcclxuXHRcdHtcclxuXHRcdFx0dGhpcy50cmFja3MuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnBpdGNoZXMuZm9yRWFjaCgocCk9PntcclxuXHRcdFx0XHRcdHAuc3RvcCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdGQudmVsb2NpdGllcy5mb3JFYWNoKCh2KT0+e1xyXG5cdFx0XHRcdFx0di5zdG9wKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cdFx0XHR0aGlzLnJlc2V0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwYXVzZSgpe1xyXG5cdFx0aWYodGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuUEFVU0VEO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXNldCgpe1xyXG5cdFx0dGhpcy5zdGFydFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY3VycmVudFRpbWVfID0gMDtcclxuXHRcdHRoaXMudHJhY2tzLmZvckVhY2goKHRyYWNrKT0+e1xyXG5cdFx0XHR0cmFjay5lbmQgPSAhdHJhY2suZXZlbnRzLmxlbmd0aDtcclxuXHRcdFx0dHJhY2suc3RlcCA9IDA7XHJcblx0XHRcdHRyYWNrLnBvaW50ZXIgPSAwO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLmNhbGNTdGVwVGltZSgpO1xyXG5cdH1cclxuICAvLyDjgrfjg7zjgrHjg7PjgrXjg7zjga7lh6bnkIZcclxuXHRwcm9jZXNzICh0aW1lKVxyXG5cdHtcclxuXHRcdHRoaXMuY3VycmVudFRpbWVfID0gdGltZSB8fCBhdWRpby5jdHguY3VycmVudFRpbWUoKTtcclxuXHRcdHZhciBjdXJyZW50U3RlcCA9ICh0aGlzLmN1cnJlbnRUaW1lXyAgLSB0aGlzLnN0YXJ0VGltZV8gKyAwLjEpIC8gdGhpcy5zdGVwVGltZV87XHJcblx0XHRsZXQgZW5kY291bnQgPSAwO1xyXG5cdFx0Zm9yKHZhciBpID0gMCxsID0gdGhpcy50cmFja3MubGVuZ3RoO2kgPCBsOysraSl7XHJcblx0XHRcdHZhciB0cmFjayA9IHRoaXMudHJhY2tzW2ldO1xyXG5cdFx0XHRpZighdHJhY2suZW5kKXtcclxuXHRcdFx0XHR3aGlsZSh0cmFjay5zdGVwIDw9IGN1cnJlbnRTdGVwICYmICF0cmFjay5lbmQgKXtcclxuXHRcdFx0XHRcdGlmKHRyYWNrLnBvaW50ZXIgPj0gdHJhY2suZXZlbnRzLmxlbmd0aCApe1xyXG5cdFx0XHRcdFx0XHR0cmFjay5lbmQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHZhciBldmVudCA9IHRyYWNrLmV2ZW50c1t0cmFjay5wb2ludGVyKytdO1xyXG5cdFx0XHRcdFx0XHR2YXIgcGxheVRpbWUgPSB0cmFjay5zdGVwICogdGhpcy5zdGVwVGltZV8gKyB0aGlzLnN0YXJ0VGltZV87XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByb2Nlc3MocGxheVRpbWUsdHJhY2spO1xyXG5cdFx0XHRcdFx0XHR0cmFjay5zdGVwICs9IGV2ZW50LnN0ZXA7XHJcbi8vXHRcdFx0XHRcdGNvbnNvbGUubG9nKHRyYWNrLnBvaW50ZXIsdHJhY2suZXZlbnRzLmxlbmd0aCx0cmFjay5ldmVudHNbdHJhY2sucG9pbnRlcl0sdHJhY2suc3RlcCxjdXJyZW50U3RlcCx0aGlzLmN1cnJlbnRUaW1lXyxwbGF5VGltZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCsrZW5kY291bnQ7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGVuZGNvdW50ID09IHRoaXMudHJhY2tzLmxlbmd0aCl7XHJcblx0XHRcdHRoaXMuc3RvcCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDmjqXntppcclxuXHRjb25uZWN0KGMpe1xyXG5cdFx0dmFyIHRyYWNrID0gYy5mcm9tLnBhcmFtLnRyYWNrO1xyXG5cdFx0aWYoYy5mcm9tLnBhcmFtLnR5cGUgPT09ICdwaXRjaCcpe1xyXG5cdFx0XHR0cmFjay5waXRjaGVzLnB1c2goU2VxdWVuY2VyLm1ha2VQcm9jZXNzKGMpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRyYWNrLnZlbG9jaXRpZXMucHVzaChTZXF1ZW5jZXIubWFrZVByb2Nlc3MoYykpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDliYrpmaRcclxuXHRkaXNjb25uZWN0KGMpe1xyXG5cdFx0dmFyIHRyYWNrID0gYy5mcm9tLnBhcmFtLnRyYWNrO1xyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdHJhY2sucGl0Y2hlcy5sZW5ndGg7KytpKXtcclxuXHRcdFx0aWYoYy50by5ub2RlID09PSB0cmFjay5waXRjaGVzW2ldLnRvLm5vZGUgJiYgYy50by5wYXJhbSA9PT0gdHJhY2sucGl0Y2hlc1tpXS50by5wYXJhbSl7XHJcblx0XHRcdFx0dHJhY2sucGl0Y2hlcy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdHJhY2sudmVsb2NpdGllcy5sZW5ndGg7KytpKXtcclxuXHRcdFx0aWYoYy50by5ub2RlID09PSB0cmFjay52ZWxvY2l0aWVzW2ldLnRvLm5vZGUgJiYgYy50by5wYXJhbSA9PT0gdHJhY2sudmVsb2NpdGllc1tpXS50by5wYXJhbSl7XHJcblx0XHRcdFx0dHJhY2sucGl0Y2hlcy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgbWFrZVByb2Nlc3MoYyl7XHJcblx0XHRpZihjLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0cmV0dXJuICB7XHJcblx0XHRcdFx0dG86Yy50byxcclxuXHRcdFx0XHRwcm9jZXNzOiAoY29tLHYsdCk9PntcclxuXHRcdFx0XHRcdGMudG8ubm9kZS5hdWRpb05vZGUucHJvY2VzcyhjLnRvLGNvbSx2LHQpO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c3RvcDpmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0Yy50by5ub2RlLmF1ZGlvTm9kZS5zdG9wKGMudG8pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdH0gXHJcblx0XHR2YXIgcHJvY2VzcztcclxuXHRcdGlmKGMudG8ucGFyYW0udHlwZSA9PT0gJ3BpdGNoJyl7XHJcblx0XHRcdHByb2Nlc3MgPSAoY29tLHYsdCkgPT4ge1xyXG5cdFx0XHRcdGNvbS5wcm9jZXNzUGl0Y2goYy50by5wYXJhbS5hdWRpb1BhcmFtLHYsdCk7XHJcblx0XHRcdH07XHRcdFx0XHRcdFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cHJvY2VzcyA9XHQoY29tLHYsdCk9PntcclxuXHRcdFx0XHRjb20ucHJvY2Vzc1ZlbG9jaXR5KGMudG8ucGFyYW0uYXVkaW9QYXJhbSx2LHQpO1xyXG5cdFx0XHR9O1x0XHRcdFx0XHRcclxuXHRcdH1cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHRvOmMudG8sXHJcblx0XHRcdHByb2Nlc3M6cHJvY2VzcyxcclxuXHRcdFx0c3RvcDpmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGMudG8ucGFyYW0uYXVkaW9QYXJhbS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgZXhlYygpXHJcblx0e1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoU2VxdWVuY2VyLmV4ZWMpO1xyXG5cdFx0XHRsZXQgZW5kY291bnQgPSAwO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwLGUgPSBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGg7aSA8IGU7KytpKXtcclxuXHRcdFx0XHR2YXIgc2VxID0gU2VxdWVuY2VyLnNlcXVlbmNlcnNbaV07XHJcblx0XHRcdFx0aWYoc2VxLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0XHRcdHNlcS5wcm9jZXNzKGF1ZGlvLmN0eC5jdXJyZW50VGltZSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHNlcS5zdGF0dXNfID09IFNFUV9TVEFUVVMuU1RPUFBFRCl7XHJcblx0XHRcdFx0XHQrK2VuZGNvdW50O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZihlbmRjb3VudCA9PSBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRTZXF1ZW5jZXIuc3RvcFNlcXVlbmNlcygpO1xyXG5cdFx0XHRcdGlmKFNlcXVlbmNlci5zdG9wcGVkKXtcclxuXHRcdFx0XHRcdFNlcXVlbmNlci5zdG9wcGVkKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOOCt+ODvOOCseODs+OCueWFqOS9k+OBruOCueOCv+ODvOODiFxyXG5cdHN0YXRpYyBzdGFydFNlcXVlbmNlcyh0aW1lKXtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlNUT1BQRUQgfHwgU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUEFVU0VEIClcclxuXHRcdHtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnN0YXJ0KHRpbWUpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5QTEFZSU5HO1xyXG5cdFx0XHRTZXF1ZW5jZXIuZXhlYygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvLyDjgrfjg7zjgrHjg7PjgrnlhajkvZPjga7lgZzmraJcclxuXHRzdGF0aWMgc3RvcFNlcXVlbmNlcygpe1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUExBWUlORyB8fCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QQVVTRUQgKXtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnN0b3AoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuU1RPUFBFRDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIOOCt+ODvOOCseODs+OCueWFqOS9k+OBruODneODvOOCulx0XHJcblx0c3RhdGljIHBhdXNlU2VxdWVuY2VzKCl7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnBhdXNlKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlBBVVNFRDtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcblNlcXVlbmNlci5zZXF1ZW5jZXJzID0gW107XHJcblNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuU1RPUFBFRDsgXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IFVVSUQgZnJvbSAnLi91dWlkLmNvcmUnO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vRXZlbnRFbWl0dGVyMyc7XHJcbmV4cG9ydCBjb25zdCBub2RlSGVpZ2h0ID0gNTA7XHJcbmV4cG9ydCBjb25zdCBub2RlV2lkdGggPSAxMDA7XHJcbmV4cG9ydCBjb25zdCBwb2ludFNpemUgPSAxNjtcclxuXHJcbi8vIHBhbmVsIHdpbmRvd1xyXG5leHBvcnQgY2xhc3MgUGFuZWwgIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb25zdHJ1Y3RvcihzZWwscHJvcCl7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0aWYoIXByb3AgfHwgIXByb3AuaWQpe1xyXG5cdFx0XHRwcm9wID0gcHJvcCA/IChwcm9wLmlkID0gJ2lkLScgKyBVVUlELmdlbmVyYXRlKCkscHJvcCkgOnsgaWQ6J2lkLScgKyBVVUlELmdlbmVyYXRlKCl9O1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5pZCA9IHByb3AuaWQ7XHJcblx0XHRzZWwgPSBzZWwgfHwgZDMuc2VsZWN0KCcjY29udGVudCcpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBcclxuXHRcdHNlbFxyXG5cdFx0LmFwcGVuZCgnZGl2JylcclxuXHRcdC5hdHRyKHByb3ApXHJcblx0XHQuYXR0cignY2xhc3MnLCdwYW5lbCcpXHJcblx0XHQuZGF0dW0odGhpcyk7XHJcblxyXG5cdFx0Ly8g44OR44ON44Or55SoRHJhZ+OBneOBruS7llxyXG5cclxuXHRcdHRoaXMuaGVhZGVyID0gdGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdoZWFkZXInKS5jYWxsKHRoaXMuZHJhZyk7XHJcblx0XHR0aGlzLmFydGljbGUgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2FydGljbGUnKTtcclxuXHRcdHRoaXMuZm9vdGVyID0gdGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdmb290ZXInKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnZGl2JylcclxuXHRcdC5jbGFzc2VkKCdwYW5lbC1jbG9zZScsdHJ1ZSlcclxuXHRcdC5vbignY2xpY2snLCgpPT57XHJcblx0XHRcdHRoaXMuZW1pdCgnZGlzcG9zZScpO1xyXG5cdFx0XHR0aGlzLmRpc3Bvc2UoKTtcclxuXHRcdH0pO1xyXG5cclxuXHR9XHRcclxuXHJcblx0Z2V0IG5vZGUoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5zZWxlY3Rpb24ubm9kZSgpO1xyXG5cdH1cclxuXHRnZXQgeCAoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdsZWZ0JykpO1xyXG5cdH1cclxuXHRzZXQgeCAodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnbGVmdCcsdiArICdweCcpO1xyXG5cdH1cclxuXHRnZXQgeSAoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd0b3AnKSk7XHJcblx0fVxyXG5cdHNldCB5ICh2KXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd0b3AnLHYgKyAncHgnKTtcclxuXHR9XHJcblx0Z2V0IHdpZHRoKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnd2lkdGgnKSk7XHJcblx0fVxyXG5cdHNldCB3aWR0aCh2KXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd3aWR0aCcsIHYgKyAncHgnKTtcclxuXHR9XHJcblx0Z2V0IGhlaWdodCgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2hlaWdodCcpKTtcclxuXHR9XHJcblx0c2V0IGhlaWdodCh2KXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdoZWlnaHQnLHYgKyAncHgnKTtcclxuXHR9XHJcblx0XHJcblx0ZGlzcG9zZSgpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24ucmVtb3ZlKCk7XHJcblx0XHR0aGlzLnNlbGVjdGlvbiA9IG51bGw7XHJcblx0fVxyXG5cdFxyXG5cdHNob3coKXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd2aXNpYmlsaXR5JywndmlzaWJsZScpO1xyXG5cdFx0dGhpcy5lbWl0KCdzaG93Jyk7XHJcblx0fVxyXG5cclxuXHRoaWRlKCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScsJ2hpZGRlbicpO1xyXG5cdFx0dGhpcy5lbWl0KCdoaWRlJyk7XHJcblx0fVxyXG5cdFxyXG5cdGdldCBpc1Nob3coKXtcclxuXHRcdHJldHVybiB0aGlzLnNlbGVjdGlvbiAmJiB0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScpID09PSAndmlzaWJsZSc7XHJcblx0fVxyXG59XHJcblxyXG5QYW5lbC5wcm90b3R5cGUuZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKVxyXG5cdFx0Lm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyhkKTtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QoJyMnICsgZC5pZCk7XHJcblx0XHRcclxuXHRcdGQzLnNlbGVjdCgnI2NvbnRlbnQnKVxyXG5cdFx0LmFwcGVuZCgnZGl2JylcclxuXHRcdC5hdHRyKHtpZDoncGFuZWwtZHVtbXktJyArIGQuaWQsXHJcblx0XHRcdCdjbGFzcyc6J3BhbmVsIHBhbmVsLWR1bW15J30pXHJcblx0XHQuc3R5bGUoe1xyXG5cdFx0XHRsZWZ0OnNlbC5zdHlsZSgnbGVmdCcpLFxyXG5cdFx0XHR0b3A6c2VsLnN0eWxlKCd0b3AnKSxcclxuXHRcdFx0d2lkdGg6c2VsLnN0eWxlKCd3aWR0aCcpLFxyXG5cdFx0XHRoZWlnaHQ6c2VsLnN0eWxlKCdoZWlnaHQnKVxyXG5cdFx0fSk7XHJcblx0fSlcclxuXHQub24oXCJkcmFnXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgZHVtbXkgPSBkMy5zZWxlY3QoJyNwYW5lbC1kdW1teS0nICsgZC5pZCk7XHJcblxyXG5cdFx0dmFyIHggPSBwYXJzZUZsb2F0KGR1bW15LnN0eWxlKCdsZWZ0JykpICsgZDMuZXZlbnQuZHg7XHJcblx0XHR2YXIgeSA9IHBhcnNlRmxvYXQoZHVtbXkuc3R5bGUoJ3RvcCcpKSArIGQzLmV2ZW50LmR5O1xyXG5cdFx0XHJcblx0XHRkdW1teS5zdHlsZSh7J2xlZnQnOnggKyAncHgnLCd0b3AnOnkgKyAncHgnfSk7XHJcblx0fSlcclxuXHQub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCgnIycgKyBkLmlkKTtcclxuXHRcdHZhciBkdW1teSA9IGQzLnNlbGVjdCgnI3BhbmVsLWR1bW15LScgKyBkLmlkKTtcclxuXHRcdHNlbC5zdHlsZShcclxuXHRcdFx0eydsZWZ0JzpkdW1teS5zdHlsZSgnbGVmdCcpLCd0b3AnOmR1bW15LnN0eWxlKCd0b3AnKX1cclxuXHRcdCk7XHJcblx0XHRkLmVtaXQoJ2RyYWdlbmQnKTtcclxuXHRcdGR1bW15LnJlbW92ZSgpO1xyXG5cdH0pO1xyXG5cdFxyXG4iLCIndXNlIHN0cmljdCc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9FdmVudEVtaXR0ZXIzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBVbmRvTWFuYWdlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmJ1ZmZlciA9IFtdO1xyXG5cdFx0dGhpcy5pbmRleCA9IC0xO1xyXG5cdH1cclxuXHRcclxuXHRjbGVhcigpe1xyXG4gICAgdGhpcy5idWZmZXIubGVuZ3RoID0gMDtcclxuICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgIHRoaXMuZW1pdCgnY2xlYXJlZCcpO1xyXG5cdH1cclxuXHRcclxuXHRleGVjKGNvbW1hbmQpe1xyXG4gICAgY29tbWFuZC5leGVjKCk7XHJcbiAgICBpZiAoKHRoaXMuaW5kZXggKyAxKSA8IHRoaXMuYnVmZmVyLmxlbmd0aClcclxuICAgIHtcclxuICAgICAgdGhpcy5idWZmZXIubGVuZ3RoID0gdGhpcy5pbmRleCArIDE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoKGNvbW1hbmQpO1xyXG4gICAgKyt0aGlzLmluZGV4O1xyXG4gICAgdGhpcy5lbWl0KCdleGVjdXRlZCcpO1xyXG5cdH1cclxuXHRcclxuXHRyZWRvKCl7XHJcbiAgICBpZiAoKHRoaXMuaW5kZXggKyAxKSA8ICh0aGlzLmJ1ZmZlci5sZW5ndGgpKVxyXG4gICAge1xyXG4gICAgICArK3RoaXMuaW5kZXg7XHJcbiAgICAgIHZhciBjb21tYW5kID0gdGhpcy5idWZmZXJbdGhpcy5pbmRleF07XHJcbiAgICAgIGNvbW1hbmQucmVkbygpO1xyXG4gICAgICB0aGlzLmVtaXQoJ3JlZGlkJyk7XHJcbiAgICAgIGlmICgodGhpcy5pbmRleCAgKyAxKSA9PSB0aGlzLmJ1ZmZlci5sZW5ndGgpXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmVtaXQoJ3JlZG9FbXB0eScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblx0fVxyXG4gIHVuZG8oKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPiAwICYmIHRoaXMuaW5kZXggPj0gMClcclxuICAgIHtcclxuICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLmJ1ZmZlclt0aGlzLmluZGV4XTtcclxuICAgICAgY29tbWFuZC51bmRvKCk7XHJcbiAgICAgIC0tdGhpcy5pbmRleDtcclxuICAgICAgdGhpcy5lbWl0KCd1bmRpZCcpO1xyXG4gICAgICBpZiAodGhpcy5pbmRleCA8IDApXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmluZGV4ID0gLTE7XHJcbiAgICAgICAgdGhpcy5lbWl0KCd1bmRvRW1wdHknKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHRcclxufVxyXG5cclxudmFyIHVuZG9NYW5hZ2VyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XHJcbmV4cG9ydCBkZWZhdWx0IHVuZG9NYW5hZ2VyOyIsIi8qXG4gVmVyc2lvbjogY29yZS0xLjBcbiBUaGUgTUlUIExpY2Vuc2U6IENvcHlyaWdodCAoYykgMjAxMiBMaW9zSy5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBVVUlEKCl7fVVVSUQuZ2VuZXJhdGU9ZnVuY3Rpb24oKXt2YXIgYT1VVUlELl9ncmksYj1VVUlELl9oYTtyZXR1cm4gYihhKDMyKSw4KStcIi1cIitiKGEoMTYpLDQpK1wiLVwiK2IoMTYzODR8YSgxMiksNCkrXCItXCIrYigzMjc2OHxhKDE0KSw0KStcIi1cIitiKGEoNDgpLDEyKX07VVVJRC5fZ3JpPWZ1bmN0aW9uKGEpe3JldHVybiAwPmE/TmFOOjMwPj1hPzB8TWF0aC5yYW5kb20oKSooMTw8YSk6NTM+PWE/KDB8MTA3Mzc0MTgyNCpNYXRoLnJhbmRvbSgpKSsxMDczNzQxODI0KigwfE1hdGgucmFuZG9tKCkqKDE8PGEtMzApKTpOYU59O1VVSUQuX2hhPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPWEudG9TdHJpbmcoMTYpLGQ9Yi1jLmxlbmd0aCxlPVwiMFwiOzA8ZDtkPj4+PTEsZSs9ZSlkJjEmJihjPWUrYyk7cmV0dXJuIGN9O1xuIl19
