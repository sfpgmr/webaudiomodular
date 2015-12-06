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

},{"./ui":10,"./uuid.core":12}],4:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXEV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGF1ZGlvLmpzIiwic3JjXFxhdWRpb05vZGVWaWV3LmpzIiwic3JjXFxkcmF3LmpzIiwic3JjXFxlZy5qcyIsInNyY1xcZXZlbnRFbWl0dGVyMy5qcyIsInNyY1xccHJvcC5qcyIsInNyY1xcc2VxdWVuY2VFZGl0b3IuanMiLCJzcmNcXHNlcXVlbmNlci5qcyIsInNyY1xcdWkuanMiLCJzcmNcXHVuZG8uanMiLCJzcmNcXHV1aWQuY29yZS5qcyIsInRlc3RcXGF1ZGlvTm9kZVRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7OztBQUFZLENBQUM7Ozs7a0JBaUNXLFlBQVk7QUF2QnBDLElBQUksTUFBTSxHQUFHLE9BQU8sTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVLEdBQUcsR0FBRyxHQUFHLEtBQUs7Ozs7Ozs7Ozs7QUFBQyxBQVUvRCxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtBQUM3QixNQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNiLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQztDQUMzQjs7Ozs7Ozs7O0FBQUEsQUFTYyxTQUFTLFlBQVksR0FBRzs7Ozs7Ozs7QUFBd0IsQUFRL0QsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUzs7Ozs7Ozs7OztBQUFDLEFBVTNDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDbkUsTUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSztNQUNyQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVsRCxNQUFJLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDL0IsTUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUMxQixNQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFeEMsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkUsTUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDekI7O0FBRUQsU0FBTyxFQUFFLENBQUM7Q0FDWDs7Ozs7Ozs7O0FBQUMsQUFTRixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtBQUNyRSxNQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEtBQUssQ0FBQzs7QUFFdEQsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7TUFDN0IsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNO01BQ3RCLElBQUk7TUFDSixDQUFDLENBQUM7O0FBRU4sTUFBSSxVQUFVLEtBQUssT0FBTyxTQUFTLENBQUMsRUFBRSxFQUFFO0FBQ3RDLFFBQUksU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFOUUsWUFBUSxHQUFHO0FBQ1QsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzlELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDbEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDdEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsS0FDL0U7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7QUFFRCxhQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07QUFDTCxRQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0FBRU4sU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsVUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVwRixjQUFRLEdBQUc7QUFDVCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzFELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzlELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUNsRTtBQUNFLGNBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcs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QUN0RCxJQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pDLElBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztFQUMxQyxDQUFDLENBQUM7O0FBRUgsR0FBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFDLFlBQVU7QUFDeEMsT0FBSyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNqQyxJQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pDLElBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztFQUN6QyxDQUFDLENBQUM7O0FBRUgsR0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFDLFlBQVU7QUFDdkMsT0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUNoQyxJQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hELElBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxD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QUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3QyxNQUFNO0FBQ04sTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNqQyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ3RFO0dBQ0QsTUFBTTtBQUNOLEtBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDakMsS0FBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztHQUN2RDs7QUFFRCxHQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNwQixHQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsTUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkMsR0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUN2QixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQ1IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNkLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsT0FBTyxFQUFDLFdBQVcs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QVEsR0FBRztBQUNULFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUM5RCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ2xFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ3RFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEtBQy9FOztBQUVELFNBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbEQsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFT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LE1BQU0sT0FBTyxHQUNYO0FBQ0UsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsS0FBSztHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsR0FBRztHQUMvQixDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsS0FBSztHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsS0FBSztHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFF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QyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEUsTUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxNQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyRCxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxNQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQztXQUFLLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxTQUFTO0dBQUEsQ0FBQzs7Ozs7Ozs7Ozs7OztBQUFDLEFBYS9GLFdBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFD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Q0QsUUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUMvQixRQUFJLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUEsQUFBQyxDQUFDLENBQUM7QUFDakcsUUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMzQixRQUFJLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUEsQUFBQyxDQUFDLENBQUM7QUFDakcsUUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMzQixRQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUEsQUFBQyxDQUFDLENBQUM7QUFDakcsUUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQTtBQUN6QixRQUFJLEdBQUcsc0VBQXNFLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVqRyxNQUFFLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztBQUNqQixNQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNmLE1BQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2YsTUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDYixNQUFFLENBQUMsT0FBTyxHQUFHLEdBQUc7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QztBQUNoQyxTQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsTUFBTTtBQUNOLFNBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRDtHQUNEOzs7Ozs7NkJBR1UsQ0FBQyxFQUFDO0FBQ1osT0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLFFBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBQyxFQUFFLENBQUMsRUFBQztBQUMxQyxRQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUM7QUFDckYsVUFBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsV0FBTTtLQUNOO0lBQ0Q7O0FBRUQsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQzdDLFFBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBQztBQUMzRixVQUFLLENB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TyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN6QyxPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0RixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7O0FBRTVDLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLE1BQU0sRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDN0YsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUMsR0FBRyxFQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsS0FBSyxFQUFDLEVBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFDLEtBQUssRUFBQyxFQUFFLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQzs7QUFFaEYsUUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ2hFLENBQUMsQ0FBQzs7QUFHSCxHQUFFLENBQUMsT0FBTyxFQUFFLFlBQU07QUFDakIsT0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsT0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsUUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RCxRQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEUsUUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNyRCxDQUFDLENBQUM7O0FBRUgsR0FBRSxDQUFDLFVBQVUsRUFBQyxZQUFJO0FBQ2pCLE9BQUssQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLE1BQU0sRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDaEcsT0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekYsT0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekYsT0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekYsT0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDekYsT0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENB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QUMsSUFBSSxFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUMsQ0FBQyxFQUFDLENBQUM7OztBQUFDLEFBSXJFLEtBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUN4QixLQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLE9BQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFDLENBQUMsR0FBRSxHQUFHLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDekIsTUFBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNyRTs7QUFFRCxLQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RFLE9BQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFDLENBQUMsR0FBRSxHQUFHLEVBQUMsRUFBRSxDQUFDLEVBQUM7QUFDekIsTUFBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNyRTtBQUNELFlBOUxhLElBQUksR0E4TFgsQ0FBQztBQUNQLFFBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDeEIsQ0FBQyxDQUFDO0NBS0gsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuLy9cbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcbi8vIGB+YCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBvdmVycmlkZGVuIG9yXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxuLy8gaXMgYW4gRVM2IFN5bWJvbC5cbi8vXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBXZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGFyZ3NcbiAgICAsIGk7XG5cbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgICBpZiAoXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVycy5vbmNlKVxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXG4gICAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgICApIHtcbiAgICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAvL1xuICBpZiAoZXZlbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW3ByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRdO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxuLy9cbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmV4cG9ydCAqIGZyb20gJy4vYXVkaW9Ob2RlVmlldyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZWcnO1xyXG5leHBvcnQgKiBmcm9tICcuL3NlcXVlbmNlcic7XHJcbmV4cG9ydCBmdW5jdGlvbiBkdW1teSgpe307XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgVVVJRCBmcm9tICcuL3V1aWQuY29yZSc7XHJcbmltcG9ydCAqIGFzIHVpIGZyb20gJy4vdWknO1xyXG5cclxudmFyIGNvdW50ZXIgPSAwO1xyXG5leHBvcnQgdmFyIGN0eDtcclxuZXhwb3J0IGZ1bmN0aW9uIHNldEN0eChjKXtjdHggPSBjO31cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRPYmplY3RDb3VudGVyKCl7XHJcbiAgcmV0dXJuIGNvdW50ZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVDb3VudGVyKHYpXHJcbntcclxuICBpZih2ID4gY291bnRlcil7XHJcbiAgICBjb3VudGVyID0gdjtcclxuICAgICsrY291bnRlcjtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHggPSAwLCB5ID0gMCx3aWR0aCA9IHVpLm5vZGVXaWR0aCxoZWlnaHQgPSB1aS5ub2RlSGVpZ2h0LG5hbWUgPSAnJykge1xyXG5cdFx0dGhpcy54ID0geCA7XHJcblx0XHR0aGlzLnkgPSB5IDtcclxuXHRcdHRoaXMud2lkdGggPSB3aWR0aCA7XHJcblx0XHR0aGlzLmhlaWdodCA9IGhlaWdodCA7XHJcblx0XHR0aGlzLm5hbWUgPSBuYW1lO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFNUQVRVU19QTEFZX05PVF9QTEFZRUQgPSAwO1xyXG5leHBvcnQgY29uc3QgU1RBVFVTX1BMQVlfUExBWUlORyA9IDE7XHJcbmV4cG9ydCBjb25zdCBTVEFUVVNfUExBWV9QTEFZRUQgPSAyO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZklzTm90QVBJT2JqKHRoaXNfLHYpe1xyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzXywnaXNOb3RBUElPYmonLHtcclxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXHJcblx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXHJcblx0XHRcdHdyaXRhYmxlOmZhbHNlLFxyXG5cdFx0XHR2YWx1ZTogdlxyXG5cdFx0fSk7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBdWRpb1BhcmFtVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoQXVkaW9Ob2RlVmlldyxuYW1lLCBwYXJhbSkge1xyXG5cdFx0c3VwZXIoMCwwLHVpLnBvaW50U2l6ZSx1aS5wb2ludFNpemUsbmFtZSk7XHJcblx0XHR0aGlzLmlkID0gVVVJRC5nZW5lcmF0ZSgpO1xyXG5cdFx0dGhpcy5hdWRpb1BhcmFtID0gcGFyYW07XHJcblx0XHR0aGlzLkF1ZGlvTm9kZVZpZXcgPSBBdWRpb05vZGVWaWV3O1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFBhcmFtVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoQXVkaW9Ob2RlVmlldyxuYW1lLGlzb3V0cHV0KSB7XHJcblx0XHRzdXBlcigwLDAsdWkucG9pbnRTaXplLHVpLnBvaW50U2l6ZSxuYW1lKTtcclxuXHRcdHRoaXMuaWQgPSBVVUlELmdlbmVyYXRlKCk7XHJcblx0XHR0aGlzLkF1ZGlvTm9kZVZpZXcgPSBBdWRpb05vZGVWaWV3O1xyXG5cdFx0dGhpcy5pc091dHB1dCA9IGlzb3V0cHV0IHx8IGZhbHNlO1xyXG5cdH1cclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBBdWRpb05vZGVWaWV3IGV4dGVuZHMgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihhdWRpb05vZGUsZWRpdG9yKVxyXG5cdHtcclxuXHRcdC8vIGF1ZGlvTm9kZSDjga/jg5njg7zjgrnjgajjgarjgovjg47jg7zjg4lcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmlkID0gVVVJRC5nZW5lcmF0ZSgpO1xyXG5cdFx0dGhpcy5hdWRpb05vZGUgPSBhdWRpb05vZGU7XHJcblx0XHR0aGlzLm5hbWUgPSBhdWRpb05vZGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvZnVuY3Rpb25cXHMoLiopXFwoLylbMV07XHJcblx0XHR0aGlzLmlucHV0UGFyYW1zID0gW107XHJcblx0XHR0aGlzLm91dHB1dFBhcmFtcyA9IFtdO1xyXG5cdFx0dGhpcy5wYXJhbXMgPSBbXTtcclxuXHRcdGxldCBpbnB1dEN5ID0gMSxvdXRwdXRDeSA9IDE7XHJcblx0XHRcclxuXHRcdHRoaXMucmVtb3ZhYmxlID0gdHJ1ZTtcclxuXHRcdFxyXG5cdFx0Ly8g44OX44Ot44OR44OG44Kj44O744Oh44K944OD44OJ44Gu6KSH6KO9XHJcblx0XHRmb3IgKHZhciBpIGluIGF1ZGlvTm9kZSkge1xyXG5cdFx0XHRpZiAodHlwZW9mIGF1ZGlvTm9kZVtpXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4vL1x0XHRcdFx0dGhpc1tpXSA9IGF1ZGlvTm9kZVtpXS5iaW5kKGF1ZGlvTm9kZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0aWYgKHR5cGVvZiBhdWRpb05vZGVbaV0gPT09ICdvYmplY3QnKSB7XHJcblx0XHRcdFx0XHRpZiAoYXVkaW9Ob2RlW2ldIGluc3RhbmNlb2YgQXVkaW9QYXJhbSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldID0gbmV3IEF1ZGlvUGFyYW1WaWV3KHRoaXMsaSwgYXVkaW9Ob2RlW2ldKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5pbnB1dFBhcmFtcy5wdXNoKHRoaXNbaV0pO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBhcmFtcy5wdXNoKCgocCk9PntcclxuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xyXG5cdFx0XHRcdFx0XHRcdFx0bmFtZTppLFxyXG5cdFx0XHRcdFx0XHRcdFx0J2dldCc6KCkgPT4gcC5hdWRpb1BhcmFtLnZhbHVlLFxyXG5cdFx0XHRcdFx0XHRcdFx0J3NldCc6KHYpID0+e3AuYXVkaW9QYXJhbS52YWx1ZSA9IHY7fSxcclxuXHRcdFx0XHRcdFx0XHRcdHBhcmFtOnAsXHJcblx0XHRcdFx0XHRcdFx0XHRub2RlOnRoaXNcclxuXHRcdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0pKHRoaXNbaV0pKTtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXS55ID0gKDIwICogaW5wdXRDeSsrKTtcclxuXHRcdFx0XHRcdH0gZWxzZSBpZihhdWRpb05vZGVbaV0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0XHRhdWRpb05vZGVbaV0uQXVkaW9Ob2RlVmlldyA9IHRoaXM7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV07XHJcblx0XHRcdFx0XHRcdGlmKHRoaXNbaV0uaXNPdXRwdXQpe1xyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0ueSA9ICgyMCAqIG91dHB1dEN5KyspO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXNbaV0ueCA9IHRoaXMud2lkdGg7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5vdXRwdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnkgPSAoMjAgKiBpbnB1dEN5KyspO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuaW5wdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXSA9IGF1ZGlvTm9kZVtpXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEF1ZGlvTm9kZS5wcm90b3R5cGUsIGkpO1x0XHJcblx0XHRcdFx0XHRpZighZGVzYyl7XHJcblx0XHRcdFx0XHRcdGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRoaXMuYXVkaW9Ob2RlLl9fcHJvdG9fXywgaSk7XHRcclxuXHRcdFx0XHRcdH0gXHJcblx0XHRcdFx0XHRpZighZGVzYyl7XHJcblx0XHRcdFx0XHRcdGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRoaXMuYXVkaW9Ob2RlLGkpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0dmFyIHByb3BzID0ge307XHJcblxyXG4vL1x0XHRcdFx0XHRpZihkZXNjLmdldCl7XHJcblx0XHRcdFx0XHRcdFx0cHJvcHMuZ2V0ID0gKChpKSA9PiB0aGlzLmF1ZGlvTm9kZVtpXSkuYmluZChudWxsLCBpKTtcclxuLy9cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRpZihkZXNjLndyaXRhYmxlIHx8IGRlc2Muc2V0KXtcclxuXHRcdFx0XHRcdFx0cHJvcHMuc2V0ID0gKChpLCB2KSA9PiB7IHRoaXMuYXVkaW9Ob2RlW2ldID0gdjsgfSkuYmluZChudWxsLCBpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cHJvcHMuZW51bWVyYWJsZSA9IGRlc2MuZW51bWVyYWJsZTtcclxuXHRcdFx0XHRcdHByb3BzLmNvbmZpZ3VyYWJsZSA9IGRlc2MuY29uZmlndXJhYmxlO1xyXG5cdFx0XHRcdFx0Ly9wcm9wcy53cml0YWJsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0Ly9wcm9wcy53cml0YWJsZSA9IGRlc2Mud3JpdGFibGU7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBpLHByb3BzKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cHJvcHMubmFtZSA9IGk7XHJcblx0XHRcdFx0XHRwcm9wcy5ub2RlID0gdGhpcztcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoZGVzYy5lbnVtZXJhYmxlICYmICFpLm1hdGNoKC8oLipfJCl8KG5hbWUpfChebnVtYmVyT2YuKiQpL2kpICYmICh0eXBlb2YgYXVkaW9Ob2RlW2ldKSAhPT0gJ0FycmF5Jyl7XHJcblx0XHRcdFx0XHRcdHRoaXMucGFyYW1zLnB1c2gocHJvcHMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuaW5wdXRTdGFydFkgPSBpbnB1dEN5ICogMjA7XHJcblx0XHR2YXIgaW5wdXRIZWlnaHQgPSAoaW5wdXRDeSArIHRoaXMubnVtYmVyT2ZJbnB1dHMpICogMjAgO1xyXG5cdFx0dmFyIG91dHB1dEhlaWdodCA9IChvdXRwdXRDeSArIHRoaXMubnVtYmVyT2ZPdXRwdXRzKSAqIDIwO1xyXG5cdFx0dGhpcy5vdXRwdXRTdGFydFkgPSBvdXRwdXRDeSAqIDIwO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBNYXRoLm1heCh0aGlzLmhlaWdodCxpbnB1dEhlaWdodCxvdXRwdXRIZWlnaHQpO1xyXG5cdFx0dGhpcy50ZW1wID0ge307XHJcblx0XHR0aGlzLnN0YXR1c1BsYXkgPSBTVEFUVVNfUExBWV9OT1RfUExBWUVEOy8vIG5vdCBwbGF5ZWQuXHJcblx0XHR0aGlzLnBhbmVsID0gbnVsbDtcclxuXHRcdHRoaXMuZWRpdG9yID0gZWRpdG9yLmJpbmQodGhpcyx0aGlzKTtcclxuXHR9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICBsZXQgcmV0ID0ge307XHJcbiAgICByZXQuaWQgPSB0aGlzLmlkO1xyXG4gICAgcmV0LnggPSB0aGlzLng7XHJcblx0XHRyZXQueSA9IHRoaXMueTtcclxuXHRcdHJldC5uYW1lID0gdGhpcy5uYW1lO1xyXG4gICAgcmV0LnJlbW92YWJsZSA9IHRoaXMucmVtb3ZhYmxlO1xyXG4gICAgaWYodGhpcy5hdWRpb05vZGUudG9KU09OKXtcclxuICAgICAgcmV0LmF1ZGlvTm9kZSA9IHRoaXMuYXVkaW9Ob2RlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0LnBhcmFtcyA9IHt9O1xyXG4gICAgICB0aGlzLnBhcmFtcy5mb3JFYWNoKChkKT0+e1xyXG4gICAgICAgIGlmKGQuc2V0KXtcclxuICAgICAgICAgIHJldC5wYXJhbXNbZC5uYW1lXSA9IGQuZ2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG5cdFxyXG5cdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdHN0YXRpYyByZW1vdmUobm9kZSkge1xyXG5cdFx0XHRpZighbm9kZS5yZW1vdmFibGUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ+WJiumZpOOBp+OBjeOBquOBhOODjuODvOODieOBp+OBmeOAgicpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGlmIChBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXNbaV0gPT09IG5vZGUpIHtcclxuXHRcdFx0XHRcdGlmKG5vZGUuYXVkaW9Ob2RlLmRpc3Bvc2Upe1xyXG5cdFx0XHRcdFx0XHRub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMuc3BsaWNlKGktLSwgMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7ICsraSkge1xyXG5cdFx0XHRcdGxldCBuID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRcdGlmIChuLmZyb20ubm9kZSA9PT0gbm9kZSB8fCBuLnRvLm5vZGUgPT09IG5vZGUpIHtcclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdF8obik7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcbiAgXHJcbiAgLy8gXHJcbiAgc3RhdGljIHJlbW92ZUFsbE5vZGVWaWV3cygpe1xyXG4gICAgQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmZvckVhY2goKG5vZGUpPT57XHJcbiAgICAgIGlmKG5vZGUuYXVkaW9Ob2RlLmRpc3Bvc2Upe1xyXG4gICAgICAgIG5vZGUuYXVkaW9Ob2RlLmRpc3Bvc2UoKTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIGxldCBuID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG4gICAgICAgIGlmIChuLmZyb20ubm9kZSA9PT0gbm9kZSB8fCBuLnRvLm5vZGUgPT09IG5vZGUpIHtcclxuICAgICAgICAgIEF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdF8obik7XHJcbiAgICAgICAgICBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMuc3BsaWNlKGktLSwxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aCA9IDA7XHJcbiAgfVxyXG5cclxuICAvLyBcclxuXHRzdGF0aWMgZGlzY29ubmVjdF8oY29uKSB7XHJcblx0XHRpZiAoY29uLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpIHtcclxuXHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24pO1xyXG5cdFx0fSBlbHNlIGlmIChjb24udG8ucGFyYW0pIHtcclxuXHRcdFx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0aWYgKGNvbi50by5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KSB7XHJcblx0XHRcdFx0Ly8gQVVkaW9QYXJhbVxyXG5cdFx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSkge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ucGFyYW0uYXVkaW9QYXJhbSwgY29uLmZyb20ucGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5wYXJhbS5hdWRpb1BhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gY29uLnRvLnBhcmFt44GM5pWw5a2XXHJcblx0XHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtKSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0XHRpZiAoY29uLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpIHtcclxuXHRcdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24pO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dHJ5IHtcclxuXHRcdFx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSwgY29uLmZyb20ucGFyYW0sIGNvbi50by5wYXJhbSk7XHJcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0XHRjb24uZnJvbS5ub2RlLmF1ZGlvTm9kZS5kaXNjb25uZWN0KGNvbi50by5ub2RlLmF1ZGlvTm9kZSwgMCwgY29uLnRvLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIHRvIOODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRpZiAoY29uLmZyb20ucGFyYW0pIHtcclxuXHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsIGNvbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOOCs+ODjeOCr+OCt+ODp+ODs+OBruaOpee2muOCkuino+mZpOOBmeOCi1xyXG5cdHN0YXRpYyBkaXNjb25uZWN0KGZyb21fLHRvXykge1xyXG5cdFx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV99O1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIFBhcmFtVmlldyApe1xyXG5cdFx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8uQXVkaW9Ob2RlVmlldyxwYXJhbTpmcm9tX307XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHRcdHRvXyA9IHtub2RlOnRvX307XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR0b18gPSB7bm9kZTp0b18uQXVkaW9Ob2RlVmlldyxwYXJhbTp0b199XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmKHRvXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffVxyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR2YXIgY29uID0geydmcm9tJzpmcm9tXywndG8nOnRvX307XHJcblx0XHRcdFxyXG5cdFx0XHQvLyDjgrPjg43jgq/jgrfjg6fjg7Pjga7liYrpmaRcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0XHRpZihjb24uZnJvbS5ub2RlID09PSBuLmZyb20ubm9kZSAmJiBjb24uZnJvbS5wYXJhbSA9PT0gbi5mcm9tLnBhcmFtIFxyXG5cdFx0XHRcdFx0JiYgY29uLnRvLm5vZGUgPT09IG4udG8ubm9kZSAmJiBjb24udG8ucGFyYW0gPT09IG4udG8ucGFyYW0pe1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3RfKGNvbik7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHR9XHJcblxyXG5cdHN0YXRpYyBjcmVhdGUoYXVkaW9ub2RlLGVkaXRvciA9ICgpPT57fSkge1xyXG5cdFx0dmFyIG9iaiA9IG5ldyBBdWRpb05vZGVWaWV3KGF1ZGlvbm9kZSxlZGl0b3IpO1xyXG5cdFx0QXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLnB1c2gob2JqKTtcclxuXHRcdHJldHVybiBvYmo7XHJcblx0fVxyXG4gIFxyXG4gIC8vIOODjuODvOODiemWk+OBruaOpee2mlxyXG5cdHN0YXRpYyBjb25uZWN0KGZyb21fLCB0b18pIHtcclxuXHRcdGlmKGZyb21fIGluc3RhbmNlb2YgQXVkaW9Ob2RlVmlldyApe1xyXG5cdFx0XHRmcm9tXyA9IHtub2RlOmZyb21fLHBhcmFtOjB9O1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGZyb21fIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tXy5BdWRpb05vZGVWaWV3LHBhcmFtOmZyb21ffTtcclxuXHRcdH1cclxuXHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcpe1xyXG5cdFx0XHR0b18gPSB7bm9kZTp0b18scGFyYW06MH07XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYodG9fIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffTtcclxuXHRcdH1cclxuXHRcdC8vIOWtmOWcqOODgeOCp+ODg+OCr1xyXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XHJcblx0XHRcdHZhciBjID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zW2ldO1xyXG5cdFx0XHRpZiAoYy5mcm9tLm5vZGUgPT09IGZyb21fLm5vZGUgXHJcblx0XHRcdFx0JiYgYy5mcm9tLnBhcmFtID09PSBmcm9tXy5wYXJhbVxyXG5cdFx0XHRcdCYmIGMudG8ubm9kZSA9PT0gdG9fLm5vZGVcclxuXHRcdFx0XHQmJiBjLnRvLnBhcmFtID09PSB0b18ucGFyYW1cclxuXHRcdFx0XHQpIFxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHJldHVybjtcclxuLy9cdFx0XHRcdHRocm93IChuZXcgRXJyb3IoJ+aOpee2muOBjOmHjeikh+OBl+OBpuOBhOOBvuOBmeOAgicpKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyDmjqXntprlhYjjgYxQYXJhbVZpZXfjga7loLTlkIjjga/mjqXntprlhYPjga9QYXJhbVZpZXfjga7jgb9cclxuXHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyAmJiAhKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KSl7XHJcblx0XHQgIHJldHVybiA7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdC8vIFBhcmFtVmlld+OBjOaOpee2muWPr+iDveOBquOBruOBr0F1ZGlvUGFyYW3jgYvjgolQYXJhbVZpZXfjga7jgb9cclxuXHRcdGlmKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0aWYoISh0b18ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcgfHwgdG9fLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpKXtcclxuXHRcdFx0XHRyZXR1cm47XHRcclxuXHRcdFx0fVxyXG5cdFx0fSBcclxuXHRcdFxyXG5cdFx0aWYgKGZyb21fLnBhcmFtKSB7XHJcblx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdCAgaWYoZnJvbV8ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdCAgZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh7J2Zyb20nOmZyb21fLCd0byc6dG9ffSk7XHJcbi8vXHRcdFx0XHRmcm9tXy5ub2RlLmNvbm5lY3RQYXJhbShmcm9tXy5wYXJhbSx0b18pO1xyXG5cdFx0XHR9IGVsc2UgaWYgKHRvXy5wYXJhbSkgXHJcblx0XHRcdHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdGlmKHRvXy5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdC8vIEF1ZGlvUGFyYW3jga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLnBhcmFtLmF1ZGlvUGFyYW0sZnJvbV8ucGFyYW0pO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQvLyDmlbDlrZfjga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLCBmcm9tXy5wYXJhbSx0b18ucGFyYW0pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQvLyB0b+ODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLGZyb21fLnBhcmFtKTtcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRpZiAodG9fLnBhcmFtKSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRpZih0b18ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0XHQvLyBBdWRpb1BhcmFt44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5wYXJhbS5hdWRpb1BhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2V7XHJcblx0XHRcdFx0XHQvLyDmlbDlrZfjga7loLTlkIhcclxuXHRcdFx0XHRcdGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3QodG9fLm5vZGUuYXVkaW9Ob2RlLDAsdG9fLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0Ly90aHJvdyBuZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gRXJyb3InKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnB1c2hcclxuXHRcdCh7XHJcblx0XHRcdCdmcm9tJzogZnJvbV8sXHJcblx0XHRcdCd0byc6IHRvX1xyXG5cdFx0fSk7XHJcblx0fVxyXG4gIFxyXG59XHJcblxyXG5cclxuXHJcbkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2RlcyA9IFtdO1xyXG5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMgPSBbXTtcclxuXHJcblxyXG4iLCJpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aS5qcyc7XHJcbmltcG9ydCB7c2hvd1NlcXVlbmNlRWRpdG9yfSBmcm9tICcuL3NlcXVlbmNlRWRpdG9yJztcclxuXHJcbmV4cG9ydCB2YXIgc3ZnO1xyXG4vL2FhXHJcbnZhciBub2RlR3JvdXAsIGxpbmVHcm91cDtcclxudmFyIGRyYWc7XHJcbnZhciBkcmFnT3V0O1xyXG52YXIgZHJhZ1BhcmFtO1xyXG52YXIgZHJhZ1BhbmVsO1xyXG5cclxudmFyIG1vdXNlQ2xpY2tOb2RlO1xyXG52YXIgbW91c2VPdmVyTm9kZTtcclxudmFyIGxpbmU7XHJcbnZhciBhdWRpb05vZGVDcmVhdG9ycyA9IFtdO1xyXG5cclxuLy8gRHJhd+OBruWIneacn+WMllxyXG5leHBvcnQgZnVuY3Rpb24gaW5pdFVJKCl7XHJcblx0XHJcblx0Ly8g44OX44Os44Kk44Ok44O8XHJcblx0YXVkaW8uU2VxdWVuY2VyLmFkZGVkID0gKCk9PlxyXG5cdHtcclxuXHRcdGlmKGF1ZGlvLlNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aCA9PSAxICYmIGF1ZGlvLlNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PT0gYXVkaW8uU0VRX1NUQVRVUy5TVE9QUEVEKXtcclxuXHRcdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHRcdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGF1ZGlvLlNlcXVlbmNlci5lbXB0eSA9ICgpPT57XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIuc3RvcFNlcXVlbmNlcygpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHR9IFxyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3BsYXknKVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKClcclxuXHR7XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIuc3RhcnRTZXF1ZW5jZXMoYXVkaW8uY3R4LmN1cnJlbnRUaW1lKTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fSk7XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5vbignY2xpY2snLGZ1bmN0aW9uKCl7XHJcblx0XHRhdWRpby5TZXF1ZW5jZXIucGF1c2VTZXF1ZW5jZXMoKTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9KTtcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNzdG9wJykub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnN0b3BTZXF1ZW5jZXMoKTtcclxuXHRcdGQzLnNlbGVjdCh0aGlzKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fSk7XHJcblx0XHJcblx0YXVkaW8uU2VxdWVuY2VyLnN0b3BwZWQgPSAoKT0+e1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGxheScpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHR9XHJcblx0XHJcblx0XHJcblx0Ly8gQXVkaW9Ob2Rl44OJ44Op44OD44Kw55SoXHJcblx0ZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKVxyXG5cdC5vcmlnaW4oZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQ7IH0pXHJcblx0Lm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0aWYoZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5zaGlmdEtleSl7XHJcblx0XHRcdHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ21vdXNldXAnKSk7XHRcdFx0XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHRcdGQudGVtcC54ID0gZC54O1xyXG5cdFx0ZC50ZW1wLnkgPSBkLnk7XHJcblx0XHRkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cih7aWQ6J2RyYWcnLHdpZHRoOmQud2lkdGgsaGVpZ2h0OmQuaGVpZ2h0LHg6MCx5OjAsJ2NsYXNzJzonYXVkaW9Ob2RlRHJhZyd9ICk7XHJcblx0fSlcclxuXHQub24oXCJkcmFnXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRpZihkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5IHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0ZC50ZW1wLnggKz0gZDMuZXZlbnQuZHg7XHJcblx0XHRkLnRlbXAueSArPSBkMy5ldmVudC5keTtcclxuXHRcdC8vZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIChkLnggLSBkLndpZHRoIC8gMikgKyAnLCcgKyAoZC55IC0gZC5oZWlnaHQgLyAyKSArICcpJyk7XHJcblx0XHQvL2RyYXcoKTtcclxuXHRcdHZhciBkcmFnQ3Vyc29sID0gZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSlcclxuXHRcdC5zZWxlY3QoJ3JlY3QjZHJhZycpO1xyXG5cdFx0dmFyIHggPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneCcpKSArIGQzLmV2ZW50LmR4O1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneScpKSArIGQzLmV2ZW50LmR5O1xyXG5cdFx0ZHJhZ0N1cnNvbC5hdHRyKHt4OngseTp5fSk7XHRcdFxyXG5cdH0pXHJcblx0Lm9uKCdkcmFnZW5kJyxmdW5jdGlvbihkKXtcclxuXHRcdGlmKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR2YXIgZHJhZ0N1cnNvbCA9IGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpXHJcblx0XHQuc2VsZWN0KCdyZWN0I2RyYWcnKTtcclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3gnKSk7XHJcblx0XHR2YXIgeSA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd5JykpO1xyXG5cdFx0ZC54ID0gZC50ZW1wLng7XHJcblx0XHRkLnkgPSBkLnRlbXAueTtcclxuXHRcdGRyYWdDdXJzb2wucmVtb3ZlKCk7XHRcdFxyXG5cdFx0ZHJhdygpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdC8vIOODjuODvOODiemWk+aOpee2mueUqCBkcmFnIFxyXG5cdGRyYWdPdXQgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHQub3JpZ2luKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkOyB9KVxyXG5cdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdGxldCB4MSx5MTtcclxuXHRcdGlmKGQuaW5kZXgpe1xyXG5cdFx0XHRpZihkLmluZGV4IGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR4MSA9IGQubm9kZS54IC0gZC5ub2RlLndpZHRoIC8gMiArIGQuaW5kZXgueDtcclxuXHRcdFx0XHR5MSA9IGQubm9kZS55IC0gZC5ub2RlLmhlaWdodCAvMiArIGQuaW5kZXgueTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR4MSA9IGQubm9kZS54ICsgZC5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0XHR5MSA9IGQubm9kZS55IC0gZC5ub2RlLmhlaWdodCAvMiArIGQubm9kZS5vdXRwdXRTdGFydFkgKyBkLmluZGV4ICogMjA7IFxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR4MSA9IGQubm9kZS54ICsgZC5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLm5vZGUub3V0cHV0U3RhcnRZO1xyXG5cdFx0fVxyXG5cclxuXHRcdGQueDEgPSB4MSxkLnkxID0geTE7XHRcdFx0XHRcclxuXHRcdGQueDIgPSB4MSxkLnkyID0geTE7XHJcblxyXG5cdFx0dmFyIHBvcyA9IG1ha2VQb3MoeDEseTEsZC54MixkLnkyKTtcclxuXHRcdGQubGluZSA9IHN2Zy5hcHBlbmQoJ2cnKVxyXG5cdFx0LmRhdHVtKGQpXHJcblx0XHQuYXBwZW5kKCdwYXRoJylcclxuXHRcdC5hdHRyKHsnZCc6bGluZShwb3MpLCdjbGFzcyc6J2xpbmUtZHJhZyd9KTtcclxuXHR9KVxyXG5cdC5vbihcImRyYWdcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdGQueDIgKz0gZDMuZXZlbnQuZHg7XHJcblx0XHRkLnkyICs9IGQzLmV2ZW50LmR5O1xyXG5cdFx0ZC5saW5lLmF0dHIoJ2QnLGxpbmUobWFrZVBvcyhkLngxLGQueTEsZC54MixkLnkyKSkpO1x0XHRcdFx0XHRcclxuXHR9KVxyXG5cdC5vbihcImRyYWdlbmRcIiwgZnVuY3Rpb24gKGQpIHtcclxuXHRcdGxldCB0YXJnZXRYID0gZC54MjtcclxuXHRcdGxldCB0YXJnZXRZID0gZC55MjtcclxuXHRcdC8vIGlucHV044KC44GX44GP44GvcGFyYW3jgavliLDpgZTjgZfjgabjgYTjgovjgYtcclxuXHRcdC8vIGlucHV0XHRcdFxyXG5cdFx0bGV0IGNvbm5lY3RlZCA9IGZhbHNlO1xyXG5cdFx0bGV0IGlucHV0cyA9IGQzLnNlbGVjdEFsbCgnLmlucHV0JylbMF07XHJcblx0XHRmb3IodmFyIGkgPSAwLGwgPSBpbnB1dHMubGVuZ3RoO2kgPCBsOysraSl7XHJcblx0XHRcdGxldCBlbG0gPSBpbnB1dHNbaV07XHJcblx0XHRcdGxldCBiYm94ID0gZWxtLmdldEJCb3goKTtcclxuXHRcdFx0bGV0IG5vZGUgPSBlbG0uX19kYXRhX18ubm9kZTtcclxuXHRcdFx0bGV0IGxlZnQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueCxcclxuXHRcdFx0XHR0b3AgPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94LnksXHJcblx0XHRcdFx0cmlnaHQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueCArIGJib3gud2lkdGgsXHJcblx0XHRcdFx0Ym90dG9tID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55ICsgYmJveC5oZWlnaHQ7XHJcblx0XHRcdGlmKHRhcmdldFggPj0gbGVmdCAmJiB0YXJnZXRYIDw9IHJpZ2h0ICYmIHRhcmdldFkgPj0gdG9wICYmIHRhcmdldFkgPD0gYm90dG9tKVxyXG5cdFx0XHR7XHJcbi8vXHRcdFx0XHRjb25zb2xlLmxvZygnaGl0JyxlbG0pO1xyXG5cdFx0XHRcdGxldCBmcm9tXyA9IHtub2RlOmQubm9kZSxwYXJhbTpkLmluZGV4fTtcclxuXHRcdFx0XHRsZXQgdG9fID0ge25vZGU6bm9kZSxwYXJhbTplbG0uX19kYXRhX18uaW5kZXh9O1xyXG5cdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChmcm9tXyx0b18pO1xyXG5cdFx0XHRcdC8vQXVkaW9Ob2RlVmlldy5jb25uZWN0KCk7XHJcblx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHRcdGNvbm5lY3RlZCA9IHRydWU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoIWNvbm5lY3RlZCl7XHJcblx0XHRcdC8vIEF1ZGlvUGFyYW1cclxuXHRcdFx0dmFyIHBhcmFtcyA9IGQzLnNlbGVjdEFsbCgnLnBhcmFtLC5hdWRpby1wYXJhbScpWzBdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwLGwgPSBwYXJhbXMubGVuZ3RoO2kgPCBsOysraSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGxldCBlbG0gPSBwYXJhbXNbaV07XHJcblx0XHRcdFx0bGV0IGJib3ggPSBlbG0uZ2V0QkJveCgpO1xyXG5cdFx0XHRcdGxldCBwYXJhbSA9IGVsbS5fX2RhdGFfXztcclxuXHRcdFx0XHRsZXQgbm9kZSA9IHBhcmFtLm5vZGU7XHJcblx0XHRcdFx0bGV0IGxlZnQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueDtcclxuXHRcdFx0XHRsZXRcdHRvcF8gPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94Lnk7XHJcblx0XHRcdFx0bGV0XHRyaWdodCA9IG5vZGUueCAtIG5vZGUud2lkdGggLyAyICsgYmJveC54ICsgYmJveC53aWR0aDtcclxuXHRcdFx0XHRsZXRcdGJvdHRvbSA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueSArIGJib3guaGVpZ2h0O1xyXG5cdFx0XHRcdGlmKHRhcmdldFggPj0gbGVmdCAmJiB0YXJnZXRYIDw9IHJpZ2h0ICYmIHRhcmdldFkgPj0gdG9wXyAmJiB0YXJnZXRZIDw9IGJvdHRvbSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnaGl0JyxlbG0pO1xyXG5cdFx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOmQubm9kZSxwYXJhbTpkLmluZGV4fSx7bm9kZTpub2RlLHBhcmFtOnBhcmFtLmluZGV4fSk7XHJcblx0XHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdC8vIGxpbmXjg5fjg6zjg5Pjg6Xjg7zjga7liYrpmaRcclxuXHRcdGQubGluZS5yZW1vdmUoKTtcclxuXHRcdGRlbGV0ZSBkLmxpbmU7XHJcblx0fSk7XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjcGFuZWwtY2xvc2UnKVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKCl7ZDMuc2VsZWN0KCcjcHJvcC1wYW5lbCcpLnN0eWxlKCd2aXNpYmlsaXR5JywnaGlkZGVuJyk7ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO30pO1xyXG5cclxuXHQvLyBub2Rl6ZaT5o6l57aabGluZeaPj+eUu+mWouaVsFxyXG5cdGxpbmUgPSBkMy5zdmcubGluZSgpXHJcblx0LngoZnVuY3Rpb24oZCl7cmV0dXJuIGQueH0pXHJcblx0LnkoZnVuY3Rpb24oZCl7cmV0dXJuIGQueX0pXHJcblx0LmludGVycG9sYXRlKCdiYXNpcycpO1xyXG5cclxuXHQvLyBET03jgatzdmfjgqjjg6zjg6Hjg7Pjg4jjgpLmjL/lhaVcdFxyXG5cdHN2ZyA9IGQzLnNlbGVjdCgnI2NvbnRlbnQnKVxyXG5cdFx0LmFwcGVuZCgnc3ZnJylcclxuXHRcdC5hdHRyKHsgJ3dpZHRoJzogd2luZG93LmlubmVyV2lkdGgsICdoZWlnaHQnOiB3aW5kb3cuaW5uZXJIZWlnaHQgfSk7XHJcblxyXG5cdC8vIOODjuODvOODieOBjOWFpeOCi+OCsOODq+ODvOODl1xyXG5cdG5vZGVHcm91cCA9IHN2Zy5hcHBlbmQoJ2cnKTtcclxuXHQvLyDjg6njgqTjg7PjgYzlhaXjgovjgrDjg6vjg7zjg5dcclxuXHRsaW5lR3JvdXAgPSBzdmcuYXBwZW5kKCdnJyk7XHJcblx0XHJcblx0Ly8gYm9keeWxnuaAp+OBq+aMv+WFpVxyXG5cdGF1ZGlvTm9kZUNyZWF0b3JzID0gXHJcblx0W1xyXG5cdFx0e25hbWU6J0dhaW4nLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlR2Fpbi5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0RlbGF5JyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZURlbGF5LmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQXVkaW9CdWZmZXJTb3VyY2UnLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQnVmZmVyU291cmNlLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonTWVkaWFFbGVtZW50QXVkaW9Tb3VyY2UnLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFFbGVtZW50U291cmNlLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonUGFubmVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZVBhbm5lci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0NvbnZvbHZlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVDb252b2x2ZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidBbmFseXNlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVBbmFseXNlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0NoYW5uZWxTcGxpdHRlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVDaGFubmVsU3BsaXR0ZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidDaGFubmVsTWVyZ2VyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxNZXJnZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidEeW5hbWljc0NvbXByZXNzb3InLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlRHluYW1pY3NDb21wcmVzc29yLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQmlxdWFkRmlsdGVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUJpcXVhZEZpbHRlci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J09zY2lsbGF0b3InLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlT3NjaWxsYXRvci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J01lZGlhU3RyZWFtQXVkaW9Tb3VyY2UnLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2UuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidXYXZlU2hhcGVyJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZVdhdmVTaGFwZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidFRycsY3JlYXRlOigpPT5uZXcgYXVkaW8uRUcoKX0sXHJcblx0XHR7bmFtZTonU2VxdWVuY2VyJyxjcmVhdGU6KCk9Pm5ldyBhdWRpby5TZXF1ZW5jZXIoKSxlZGl0b3I6c2hvd1NlcXVlbmNlRWRpdG9yfVxyXG5cdF07XHJcblx0XHJcblx0aWYoYXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtRGVzdGluYXRpb24pe1xyXG5cdFx0YXVkaW9Ob2RlQ3JlYXRvcnMucHVzaCh7bmFtZTonTWVkaWFTdHJlYW1BdWRpb0Rlc3RpbmF0aW9uJyxcclxuXHRcdFx0Y3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbURlc3RpbmF0aW9uLmJpbmQoYXVkaW8uY3R4KVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI2NvbnRlbnQnKVxyXG5cdC5kYXR1bSh7fSlcclxuXHQub24oJ2NvbnRleHRtZW51JyxmdW5jdGlvbigpe1xyXG5cdFx0c2hvd0F1ZGlvTm9kZVBhbmVsKHRoaXMpO1xyXG5cdH0pO1xyXG59XHJcblxyXG4vLyDmj4/nlLtcclxuZXhwb3J0IGZ1bmN0aW9uIGRyYXcoKSB7XHJcblx0Ly8gQXVkaW9Ob2Rl44Gu5o+P55S7XHJcblx0dmFyIGdkID0gbm9kZUdyb3VwLnNlbGVjdEFsbCgnZycpLlxyXG5cdGRhdGEoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLGZ1bmN0aW9uKGQpe3JldHVybiBkLmlkO30pO1xyXG5cclxuXHQvLyDnn6nlvaLjga7mm7TmlrBcclxuXHRnZC5zZWxlY3QoJ3JlY3QnKVxyXG5cdC5hdHRyKHsgJ3dpZHRoJzogKGQpPT4gZC53aWR0aCwgJ2hlaWdodCc6IChkKT0+IGQuaGVpZ2h0IH0pO1xyXG5cdFxyXG5cdC8vIEF1ZGlvTm9kZeefqeW9ouOCsOODq+ODvOODl1xyXG5cdHZhciBnID0gZ2QuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ2cnKTtcclxuXHQvLyBBdWRpb05vZGXnn6nlvaLjgrDjg6vjg7zjg5fjga7luqfmqJnkvY3nva7jgrvjg4Pjg4hcclxuXHRnZC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgKGQueCAtIGQud2lkdGggLyAyKSArICcsJyArIChkLnkgLSBkLmhlaWdodCAvIDIpICsgJyknIH0pO1x0XHJcblxyXG5cdC8vIEF1ZGlvTm9kZeefqeW9olxyXG5cdGcuYXBwZW5kKCdyZWN0JylcclxuXHQuY2FsbChkcmFnKVxyXG5cdC5hdHRyKHsgJ3dpZHRoJzogKGQpPT4gZC53aWR0aCwgJ2hlaWdodCc6IChkKT0+IGQuaGVpZ2h0LCAnY2xhc3MnOiAnYXVkaW9Ob2RlJyB9KVxyXG5cdC5jbGFzc2VkKCdwbGF5JyxmdW5jdGlvbihkKXtcclxuXHRcdHJldHVybiBkLnN0YXR1c1BsYXkgPT09IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlJTkc7XHJcblx0fSlcclxuXHQub24oJ2NvbnRleHRtZW51JyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOODkeODqeODoeODvOOCv+e3qOmbhueUu+mdouOBruihqOekulxyXG5cdFx0ZC5lZGl0b3IoKTtcclxuXHRcdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdH0pXHJcblx0Lm9uKCdjbGljay5yZW1vdmUnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g44OO44O844OJ44Gu5YmK6ZmkXHJcblx0XHRpZihkMy5ldmVudC5zaGlmdEtleSl7XHJcblx0XHRcdGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cgJiYgZC5wYW5lbC5kaXNwb3NlKCk7XHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUoZCk7XHJcblx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHR9IGNhdGNoKGUpIHtcclxuLy9cdFx0XHRcdGRpYWxvZy50ZXh0KGUubWVzc2FnZSkubm9kZSgpLnNob3cod2luZG93LmlubmVyV2lkdGgvMix3aW5kb3cuaW5uZXJIZWlnaHQvMik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdH0pXHJcblx0LmZpbHRlcihmdW5jdGlvbihkKXtcclxuXHRcdC8vIOmfs+a6kOOBruOBv+OBq+ODleOCo+ODq+OCv1xyXG5cdFx0cmV0dXJuIGQuYXVkaW9Ob2RlIGluc3RhbmNlb2YgT3NjaWxsYXRvck5vZGUgfHwgZC5hdWRpb05vZGUgaW5zdGFuY2VvZiBBdWRpb0J1ZmZlclNvdXJjZU5vZGUgfHwgZC5hdWRpb05vZGUgaW5zdGFuY2VvZiBNZWRpYUVsZW1lbnRBdWRpb1NvdXJjZU5vZGU7IFxyXG5cdH0pXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDlho3nlJ/jg7vlgZzmraJcclxuXHRcdGNvbnNvbGUubG9nKGQzLmV2ZW50KTtcclxuXHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRcdGlmKCFkMy5ldmVudC5jdHJsS2V5KXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0bGV0IHNlbCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdGlmKGQuc3RhdHVzUGxheSA9PT0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUlORyl7XHJcblx0XHRcdGQuc3RhdHVzUGxheSA9IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlFRDtcclxuXHRcdFx0c2VsLmNsYXNzZWQoJ3BsYXknLGZhbHNlKTtcclxuXHRcdFx0ZC5hdWRpb05vZGUuc3RvcCgwKTtcclxuXHRcdH0gZWxzZSBpZihkLnN0YXR1c1BsYXkgIT09IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlFRCl7XHJcblx0XHRcdGQuYXVkaW9Ob2RlLnN0YXJ0KDApO1xyXG5cdFx0XHRkLnN0YXR1c1BsYXkgPSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HO1xyXG5cdFx0XHRzZWwuY2xhc3NlZCgncGxheScsdHJ1ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRhbGVydCgn5LiA5bqm5YGc5q2i44GZ44KL44Go5YaN55Sf44Gn44GN44G+44Gb44KT44CCJyk7XHJcblx0XHR9XHJcblx0fSlcclxuXHQuY2FsbCh0b29sdGlwKCdDdHJsICsgQ2xpY2sg44Gn5YaN55Sf44O75YGc5q2iJykpO1xyXG5cdDtcclxuXHRcclxuXHQvLyBBdWRpb05vZGXjga7jg6njg5njg6tcclxuXHRnLmFwcGVuZCgndGV4dCcpXHJcblx0LmF0dHIoeyB4OiAwLCB5OiAtMTAsICdjbGFzcyc6ICdsYWJlbCcgfSlcclxuXHQudGV4dChmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5uYW1lOyB9KTtcclxuXHJcblx0Ly8g5YWl5YqbQXVkaW9QYXJhbeOBruihqOekulx0XHJcblx0Z2QuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdHZhciBncCA9IHNlbC5hcHBlbmQoJ2cnKTtcclxuXHRcdHZhciBncGQgPSBncC5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZC5pbnB1dFBhcmFtcy5tYXAoKGQpPT57XHJcblx0XHRcdHJldHVybiB7bm9kZTpkLkF1ZGlvTm9kZVZpZXcsaW5kZXg6ZH07XHJcblx0XHR9KSxmdW5jdGlvbihkKXtyZXR1cm4gZC5pbmRleC5pZDt9KTtcdFx0XHJcblxyXG5cdFx0dmFyIGdwZGcgPSBncGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdC5hdHRyKHsncic6IChkKT0+ZC5pbmRleC53aWR0aC8yLCBcclxuXHRcdGN4OiAwLCBjeTogKGQsIGkpPT4geyByZXR1cm4gZC5pbmRleC55OyB9LFxyXG5cdFx0J2NsYXNzJzogZnVuY3Rpb24oZCkge1xyXG5cdFx0XHRpZihkLmluZGV4IGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHJldHVybiAnYXVkaW8tcGFyYW0nO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiAncGFyYW0nO1xyXG5cdFx0fX0pO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgndGV4dCcpXHJcblx0XHQuYXR0cih7eDogKGQpPT4gKGQuaW5kZXgueCArIGQuaW5kZXgud2lkdGggLyAyICsgNSkseTooZCk9PmQuaW5kZXgueSwnY2xhc3MnOidsYWJlbCcgfSlcclxuXHRcdC50ZXh0KChkKT0+ZC5pbmRleC5uYW1lKTtcclxuXHJcblx0XHRncGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0fSk7XHJcblxyXG5cdC8vIOWHuuWKm1BhcmFt44Gu6KGo56S6XHRcclxuXHRnZC5lYWNoKGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0dmFyIGdwID0gc2VsLmFwcGVuZCgnZycpO1xyXG5cdFx0XHJcblx0XHRcclxuXHRcdFxyXG5cdFx0dmFyIGdwZCA9IGdwLnNlbGVjdEFsbCgnZycpXHJcblx0XHQuZGF0YShkLm91dHB1dFBhcmFtcy5tYXAoKGQpPT57XHJcblx0XHRcdHJldHVybiB7bm9kZTpkLkF1ZGlvTm9kZVZpZXcsaW5kZXg6ZH07XHJcblx0XHR9KSxmdW5jdGlvbihkKXtyZXR1cm4gZC5pbmRleC5pZDt9KTtcclxuXHRcdFxyXG5cdFx0dmFyIGdwZGcgPSBncGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpO1xyXG5cclxuXHRcdGdwZGcuYXBwZW5kKCdjaXJjbGUnKVxyXG5cdFx0LmF0dHIoeydyJzogKGQpPT5kLmluZGV4LndpZHRoLzIsIFxyXG5cdFx0Y3g6IGQud2lkdGgsIGN5OiAoZCwgaSk9PiB7IHJldHVybiBkLmluZGV4Lnk7IH0sXHJcblx0XHQnY2xhc3MnOiAncGFyYW0nfSlcclxuXHRcdC5jYWxsKGRyYWdPdXQpO1xyXG5cdFx0XHJcblx0XHRncGRnLmFwcGVuZCgndGV4dCcpXHJcblx0XHQuYXR0cih7eDogKGQpPT4gKGQuaW5kZXgueCArIGQuaW5kZXgud2lkdGggLyAyICsgNSkseTooZCk9PmQuaW5kZXgueSwnY2xhc3MnOidsYWJlbCcgfSlcclxuXHRcdC50ZXh0KChkKT0+ZC5pbmRleC5uYW1lKTtcclxuXHJcblx0XHRncGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdFx0XHJcblx0fSk7XHJcblxyXG5cdC8vIOWHuuWKm+ihqOekulxyXG5cdGdkLmZpbHRlcihmdW5jdGlvbiAoZCkge1xyXG5cdFx0cmV0dXJuIGQubnVtYmVyT2ZPdXRwdXRzID4gMDtcclxuXHR9KVxyXG5cdC5lYWNoKGZ1bmN0aW9uKGQpe1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKS5hcHBlbmQoJ2cnKTtcclxuXHRcdGlmKCFkLnRlbXAub3V0cyB8fCAoZC50ZW1wLm91dHMgJiYgKGQudGVtcC5vdXRzLmxlbmd0aCA8IGQubnVtYmVyT2ZPdXRwdXRzKSkpXHJcblx0XHR7XHJcblx0XHRcdGQudGVtcC5vdXRzID0gW107XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7aSA8IGQubnVtYmVyT2ZPdXRwdXRzOysraSl7XHJcblx0XHRcdFx0ZC50ZW1wLm91dHMucHVzaCh7bm9kZTpkLGluZGV4Oml9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIHNlbDEgPSBzZWwuc2VsZWN0QWxsKCdnJyk7XHJcblx0XHR2YXIgc2VsZCA9IHNlbDEuZGF0YShkLnRlbXAub3V0cyk7XHJcblxyXG5cdFx0c2VsZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoeyB4OiBkLndpZHRoIC0gdWkucG9pbnRTaXplIC8gMiwgeTogKGQxKT0+IChkLm91dHB1dFN0YXJ0WSArIGQxLmluZGV4ICogMjAgLSB1aS5wb2ludFNpemUgLyAyKSwgd2lkdGg6IHVpLnBvaW50U2l6ZSwgaGVpZ2h0OiB1aS5wb2ludFNpemUsICdjbGFzcyc6ICdvdXRwdXQnIH0pXHJcblx0XHQuY2FsbChkcmFnT3V0KTtcclxuXHRcdHNlbGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH0pO1xyXG5cclxuXHQvLyDlhaXlipvooajnpLpcclxuXHRnZFxyXG5cdC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcdHJldHVybiBkLm51bWJlck9mSW5wdXRzID4gMDsgfSlcclxuXHQuZWFjaChmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCdnJyk7XHJcblx0XHRpZighZC50ZW1wLmlucyB8fCAoZC50ZW1wLmlucyAmJiAoZC50ZW1wLmlucy5sZW5ndGggPCBkLm51bWJlck9mSW5wdXRzKSkpXHJcblx0XHR7XHJcblx0XHRcdGQudGVtcC5pbnMgPSBbXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMDtpIDwgZC5udW1iZXJPZklucHV0czsrK2kpe1xyXG5cdFx0XHRcdGQudGVtcC5pbnMucHVzaCh7bm9kZTpkLGluZGV4Oml9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0dmFyIHNlbDEgPSBzZWwuc2VsZWN0QWxsKCdnJyk7XHJcblx0XHR2YXIgc2VsZCA9IHNlbDEuZGF0YShkLnRlbXAuaW5zKTtcclxuXHJcblx0XHRzZWxkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKVxyXG5cdFx0LmFwcGVuZCgncmVjdCcpXHJcblx0XHQuYXR0cih7IHg6IC0gdWkucG9pbnRTaXplIC8gMiwgeTogKGQxKT0+IChkLmlucHV0U3RhcnRZICsgZDEuaW5kZXggKiAyMCAtIHVpLnBvaW50U2l6ZSAvIDIpLCB3aWR0aDogdWkucG9pbnRTaXplLCBoZWlnaHQ6IHVpLnBvaW50U2l6ZSwgJ2NsYXNzJzogJ2lucHV0JyB9KVxyXG5cdFx0Lm9uKCdtb3VzZWVudGVyJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0bW91c2VPdmVyTm9kZSA9IHtub2RlOmQuYXVkaW9Ob2RlXyxwYXJhbTpkfTtcclxuXHRcdH0pXHJcblx0XHQub24oJ21vdXNlbGVhdmUnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRpZihtb3VzZU92ZXJOb2RlLm5vZGUpe1xyXG5cdFx0XHRcdGlmKG1vdXNlT3Zlck5vZGUubm9kZSA9PT0gZC5hdWRpb05vZGVfICYmIG1vdXNlT3Zlck5vZGUucGFyYW0gPT09IGQpe1xyXG5cdFx0XHRcdFx0bW91c2VPdmVyTm9kZSA9IG51bGw7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdHNlbGQuZXhpdCgpLnJlbW92ZSgpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdC8vIOS4jeimgeOBquODjuODvOODieOBruWJiumZpFxyXG5cdGdkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdC8vIGxpbmUg5o+P55S7XHJcblx0dmFyIGxkID0gbGluZUdyb3VwLnNlbGVjdEFsbCgncGF0aCcpXHJcblx0LmRhdGEoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zKTtcclxuXHJcblx0bGQuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3BhdGgnKTtcclxuXHJcblx0bGQuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHBhdGggPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHR2YXIgeDEseTEseDIseTI7XHJcblxyXG5cdFx0Ly8geDEseTFcclxuXHRcdGlmKGQuZnJvbS5wYXJhbSl7XHJcblx0XHRcdGlmKGQuZnJvbS5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDEgPSBkLmZyb20ubm9kZS54IC0gZC5mcm9tLm5vZGUud2lkdGggLyAyICsgZC5mcm9tLnBhcmFtLng7XHJcblx0XHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLnBhcmFtLnk7IFxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCArIGQuZnJvbS5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0XHR5MSA9IGQuZnJvbS5ub2RlLnkgLSBkLmZyb20ubm9kZS5oZWlnaHQgLzIgKyBkLmZyb20ubm9kZS5vdXRwdXRTdGFydFkgKyBkLmZyb20ucGFyYW0gKiAyMDsgXHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCArIGQuZnJvbS5ub2RlLndpZHRoIC8gMjtcclxuXHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLm5vZGUub3V0cHV0U3RhcnRZO1xyXG5cdFx0fVxyXG5cclxuXHRcdHgyID0gZC50by5ub2RlLnggLSBkLnRvLm5vZGUud2lkdGggLyAyO1xyXG5cdFx0eTIgPSBkLnRvLm5vZGUueSAtIGQudG8ubm9kZS5oZWlnaHQgLyAyO1xyXG5cdFx0XHJcblx0XHRpZihkLnRvLnBhcmFtKXtcclxuXHRcdFx0aWYoZC50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLkF1ZGlvUGFyYW1WaWV3IHx8IGQudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHgyICs9IGQudG8ucGFyYW0ueDtcclxuXHRcdFx0XHR5MiArPSBkLnRvLnBhcmFtLnk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eTIgKz0gIGQudG8ubm9kZS5pbnB1dFN0YXJ0WSAgKyAgZC50by5wYXJhbSAqIDIwO1x0XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHkyICs9IGQudG8ubm9kZS5pbnB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0dmFyIHBvcyA9IG1ha2VQb3MoeDEseTEseDIseTIpO1xyXG5cdFx0XHJcblx0XHRwYXRoLmF0dHIoeydkJzpsaW5lKHBvcyksJ2NsYXNzJzonbGluZSd9KTtcclxuXHRcdHBhdGgub24oJ2NsaWNrJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0aWYoZDMuZXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdChkLmZyb20sZC50byk7XHJcblx0XHRcdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRcdFx0XHRkcmF3KCk7XHJcblx0XHRcdH0gXHJcblx0XHR9KS5jYWxsKHRvb2x0aXAoJ1NoaWZ0ICsgY2xpY2vjgafliYrpmaQnKSk7XHJcblx0XHRcclxuXHR9KTtcclxuXHRsZC5leGl0KCkucmVtb3ZlKCk7XHJcbn1cclxuXHJcbi8vIOewoeaYk3Rvb2x0aXDooajnpLpcclxuZnVuY3Rpb24gdG9vbHRpcChtZXMpXHJcbntcclxuXHRyZXR1cm4gZnVuY3Rpb24oZCl7XHJcblx0XHR0aGlzXHJcblx0XHQub24oJ21vdXNlZW50ZXInLGZ1bmN0aW9uKCl7XHJcblx0XHRcdHN2Zy5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0XHQuYXR0cih7J2NsYXNzJzondGlwJyx4OmQzLmV2ZW50LnggKyAyMCAseTpkMy5ldmVudC55IC0gMjB9KVxyXG5cdFx0XHQudGV4dChtZXMpO1xyXG5cdFx0fSlcclxuXHRcdC5vbignbW91c2VsZWF2ZScsZnVuY3Rpb24oKXtcclxuXHRcdFx0c3ZnLnNlbGVjdEFsbCgnLnRpcCcpLnJlbW92ZSgpO1xyXG5cdFx0fSlcclxuXHR9O1xyXG59XHJcblxyXG4vLyDmjqXntprnt5rjga7luqfmqJnnlJ/miJBcclxuZnVuY3Rpb24gbWFrZVBvcyh4MSx5MSx4Mix5Mil7XHJcblx0cmV0dXJuIFtcclxuXHRcdFx0e3g6eDEseTp5MX0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpLzQseTp5MX0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpLzIseTp5MSArICh5MiAtIHkxKS8yfSxcclxuXHRcdFx0e3g6eDEgKyAoeDIgLSB4MSkqMy80LHk6eTJ9LFxyXG5cdFx0XHR7eDp4MiwgeTp5Mn1cclxuXHRcdF07XHJcbn1cclxuXHJcbi8vIOODl+ODreODkeODhuOCo+ODkeODjeODq+OBruihqOekulxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1BhbmVsKGQpe1xyXG5cclxuXHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcblx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0aWYoZC5wYW5lbCAmJiBkLnBhbmVsLmlzU2hvdykgcmV0dXJuIDtcclxuXHJcblx0ZC5wYW5lbCA9IG5ldyB1aS5QYW5lbCgpO1xyXG5cdGQucGFuZWwueCA9IGQueDtcclxuXHRkLnBhbmVsLnkgPSBkLnk7XHJcblx0ZC5wYW5lbC5oZWFkZXIudGV4dChkLm5hbWUpO1xyXG5cdFxyXG5cdHZhciB0YWJsZSA9IGQucGFuZWwuYXJ0aWNsZS5hcHBlbmQoJ3RhYmxlJyk7XHJcblx0dmFyIHRib2R5ID0gdGFibGUuYXBwZW5kKCd0Ym9keScpLnNlbGVjdEFsbCgndHInKS5kYXRhKGQucGFyYW1zKTtcclxuXHR2YXIgdHIgPSB0Ym9keS5lbnRlcigpXHJcblx0LmFwcGVuZCgndHInKTtcclxuXHR0ci5hcHBlbmQoJ3RkJylcclxuXHQudGV4dCgoZCk9PmQubmFtZSk7XHJcblx0dHIuYXBwZW5kKCd0ZCcpXHJcblx0LmFwcGVuZCgnaW5wdXQnKVxyXG5cdC5hdHRyKHt0eXBlOlwidGV4dFwiLHZhbHVlOihkKT0+ZC5nZXQoKSxyZWFkb25seTooZCk9PmQuc2V0P251bGw6J3JlYWRvbmx5J30pXHJcblx0Lm9uKCdjaGFuZ2UnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0bGV0IHZhbHVlID0gZDMuZXZlbnQudGFyZ2V0LnZhbHVlO1xyXG5cdFx0bGV0IHZuID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcblx0XHRpZihpc05hTih2bikpe1xyXG5cdFx0XHRkLnNldCh2YWx1ZSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRkLnNldCh2bik7XHJcblx0XHR9XHJcblx0fSk7XHJcblx0ZC5wYW5lbC5zaG93KCk7XHJcblxyXG59XHJcblxyXG4vLyDjg47jg7zjg4nmjL/lhaXjg5Hjg43jg6vjga7ooajnpLpcclxuZnVuY3Rpb24gc2hvd0F1ZGlvTm9kZVBhbmVsKGQpe1xyXG5cdCBkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdCBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuXHRpZihkLnBhbmVsKXtcclxuXHRcdGlmKGQucGFuZWwuaXNTaG93KVxyXG5cdFx0XHRyZXR1cm47XHJcblx0fVxyXG5cdFxyXG5cdGQucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuXHRkLnBhbmVsLnggPSBkMy5ldmVudC5vZmZzZXRYO1xyXG5cdGQucGFuZWwueSA9IGQzLmV2ZW50Lm9mZnNldFk7XHJcblx0ZC5wYW5lbC5oZWFkZXIudGV4dCgnQXVkaW9Ob2Rl44Gu5oy/5YWlJyk7XHJcblxyXG5cdHZhciB0YWJsZSA9IGQucGFuZWwuYXJ0aWNsZS5hcHBlbmQoJ3RhYmxlJyk7XHJcblx0dmFyIHRib2R5ID0gdGFibGUuYXBwZW5kKCd0Ym9keScpLnNlbGVjdEFsbCgndHInKS5kYXRhKGF1ZGlvTm9kZUNyZWF0b3JzKTtcclxuXHR0Ym9keS5lbnRlcigpXHJcblx0LmFwcGVuZCgndHInKVxyXG5cdC5hcHBlbmQoJ3RkJylcclxuXHQudGV4dCgoZCk9PmQubmFtZSlcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbihkdCl7XHJcblx0XHRjb25zb2xlLmxvZygn5oy/5YWlJyxkdCk7XHJcblx0XHRcclxuXHRcdHZhciBlZGl0b3IgPSBkdC5lZGl0b3IgfHwgc2hvd1BhbmVsO1xyXG5cdFx0XHJcblx0XHR2YXIgbm9kZSA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGR0LmNyZWF0ZSgpLGVkaXRvcik7XHJcblx0XHRub2RlLnggPSBkMy5ldmVudC5jbGllbnRYO1xyXG5cdFx0bm9kZS55ID0gZDMuZXZlbnQuY2xpZW50WTtcclxuXHRcdGRyYXcoKTtcclxuXHRcdC8vIGQzLnNlbGVjdCgnI3Byb3AtcGFuZWwnKS5zdHlsZSgndmlzaWJpbGl0eScsJ2hpZGRlbicpO1xyXG5cdFx0Ly8gZC5wYW5lbC5kaXNwb3NlKCk7XHJcblx0fSk7XHJcblx0ZC5wYW5lbC5zaG93KCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBdWRpb05vZGVWaWV3KG5hbWUpe1xyXG5cdHZhciBvYmogPSBhdWRpb05vZGVDcmVhdG9ycy5maW5kKChkKT0+e1xyXG5cdFx0aWYoZC5uYW1lID09PSBuYW1lKSByZXR1cm4gdHJ1ZTtcclxuXHR9KTtcclxuXHRpZihvYmope1xyXG5cdFx0cmV0dXJuIGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKG9iai5jcmVhdGUoKSxvYmouZWRpdG9yIHx8IHNob3dQYW5lbCk7XHRcdFx0XHJcblx0fVxyXG59XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBFRyB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHRoaXMuZ2F0ZSA9IG5ldyBhdWRpby5QYXJhbVZpZXcodGhpcywnZ2F0ZScsZmFsc2UpO1xyXG5cdFx0dGhpcy5vdXRwdXQgPSBuZXcgYXVkaW8uUGFyYW1WaWV3KHRoaXMsJ291dHB1dCcsdHJ1ZSk7XHJcblx0XHR0aGlzLm51bWJlck9mSW5wdXRzID0gMDtcclxuXHRcdHRoaXMubnVtYmVyT2ZPdXRwdXRzID0gMDtcclxuXHRcdHRoaXMuYXR0YWNrID0gMC4wMDE7XHJcblx0XHR0aGlzLmRlY2F5ID0gMC4wNTtcclxuXHRcdHRoaXMucmVsZWFzZSA9IDAuMDU7XHJcblx0XHR0aGlzLnN1c3RhaW4gPSAwLjI7XHJcblx0XHR0aGlzLmdhaW4gPSAxLjA7XHJcblx0XHR0aGlzLm5hbWUgPSAnRUcnO1xyXG5cdFx0YXVkaW8uZGVmSXNOb3RBUElPYmoodGhpcyxmYWxzZSk7XHJcblx0XHR0aGlzLm91dHB1dHMgPSBbXTtcclxuXHR9XHJcblx0XHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOnRoaXMubmFtZSxcclxuICAgICAgYXR0YWNrOnRoaXMuYXR0YWNrLFxyXG4gICAgICBkZWNheTp0aGlzLmRlY2F5LFxyXG4gICAgICByZWxlYXNlOnRoaXMucmVsZWFzZSxcclxuICAgICAgc3VzdGFpbjp0aGlzLnN1c3RhaW4sXHJcbiAgICAgIGdhaW46dGhpcy5nYWluXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGZyb21KU09OKG8pe1xyXG4gICAgbGV0IHJldCA9IG5ldyBFRygpO1xyXG4gICAgcmV0Lm5hbWUgPSBvLm5hbWU7XHJcbiAgICByZXQuYXR0YWNrID0gby5hdHRhY2s7XHJcbiAgICByZXQuZGVjYXkgPSBvLmRlY2F5O1xyXG4gICAgcmV0LnJlbGVhc2UgPSBvLnJlbGVhc2U7XHJcbiAgICByZXQuc3VzdGFpbiA9IG8uc3VzdGFpbjtcclxuICAgIHJldC5nYWluID0gby5nYWluO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcblx0Y29ubmVjdChjKVxyXG5cdHtcclxuXHRcdGlmKCEgKGMudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5BdWRpb1BhcmFtVmlldykpe1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0F1ZGlvUGFyYW3ku6XlpJbjgajjga/mjqXntprjgafjgY3jgb7jgZvjgpPjgIInKTtcclxuXHRcdH1cclxuXHRcdGMudG8ucGFyYW0uYXVkaW9QYXJhbS52YWx1ZSA9IDA7XHJcblx0XHR0aGlzLm91dHB1dHMucHVzaChjLnRvKTtcclxuXHR9XHJcblx0XHJcblx0ZGlzY29ubmVjdChjKXtcclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRoaXMub3V0cHV0cy5sZW5ndGg7KytpKXtcclxuXHRcdFx0aWYoYy50by5ub2RlID09PSB0aGlzLm91dHB1dHNbaV0ubm9kZSAmJiBjLnRvLnBhcmFtID09PSB0aGlzLm91dHB1dHNbaV0ucGFyYW0pXHJcblx0XHRcdHtcclxuXHRcdFx0XHR0aGlzLm91dHB1dHMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcdFxyXG5cdHByb2Nlc3ModG8sY29tLHYsdClcclxuXHR7XHJcblx0XHRpZih2ID4gMCkge1xyXG5cdFx0XHQvLyBrZXlvblxyXG5cdFx0XHQvLyBBRFPjgb7jgafjgoLjgaPjgabjgYTjgY9cclxuXHRcdFx0dGhpcy5vdXRwdXRzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ2tleW9uJyxjb20sdix0KTtcclxuXHRcdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0uc2V0VmFsdWVBdFRpbWUoMCx0KTtcclxuXHRcdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodiAqIHRoaXMuZ2FpbiAsdCArIHRoaXMuYXR0YWNrKTtcclxuXHRcdFx0XHRkLnBhcmFtLmF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluICogdiAqIHRoaXMuZ2FpbiAsdCArIHRoaXMuYXR0YWNrICsgdGhpcy5kZWNheSApO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIGtleW9mZlxyXG5cdFx0XHQvLyDjg6rjg6rjg7zjgrlcclxuXHRcdFx0dGhpcy5vdXRwdXRzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0Y29uc29sZS5sb2coJ2tleW9mZicsY29tLHYsdCk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsdCArIHRoaXMucmVsZWFzZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRzdG9wKCl7XHJcblx0XHR0aGlzLm91dHB1dHMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0Y29uc29sZS5sb2coJ3N0b3AnKTtcclxuXHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmNhbmNlbFNjaGVkdWxlZFZhbHVlcygwKTtcclxuXHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLnNldFZhbHVlQXRUaW1lKDAsMCk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0XHJcblx0cGF1c2UoKXtcclxuXHRcdFxyXG5cdH1cclxuXHRcclxufVxyXG5cclxuLy8gLy8vIOOCqOODs+ODmeODreODvOODl+OCuOOCp+ODjeODrOODvOOCv+ODvFxyXG4vLyBmdW5jdGlvbiBFbnZlbG9wZUdlbmVyYXRvcih2b2ljZSwgYXR0YWNrLCBkZWNheSwgc3VzdGFpbiwgcmVsZWFzZSkge1xyXG4vLyAgIHRoaXMudm9pY2UgPSB2b2ljZTtcclxuLy8gICAvL3RoaXMua2V5b24gPSBmYWxzZTtcclxuLy8gICB0aGlzLmF0dGFjayA9IGF0dGFjayB8fCAwLjAwMDU7XHJcbi8vICAgdGhpcy5kZWNheSA9IGRlY2F5IHx8IDAuMDU7XHJcbi8vICAgdGhpcy5zdXN0YWluID0gc3VzdGFpbiB8fCAwLjU7XHJcbi8vICAgdGhpcy5yZWxlYXNlID0gcmVsZWFzZSB8fCAwLjU7XHJcbi8vIH07XHJcbi8vIFxyXG4vLyBFbnZlbG9wZUdlbmVyYXRvci5wcm90b3R5cGUgPVxyXG4vLyB7XHJcbi8vICAga2V5b246IGZ1bmN0aW9uICh0LHZlbCkge1xyXG4vLyAgICAgdGhpcy52ID0gdmVsIHx8IDEuMDtcclxuLy8gICAgIHZhciB2ID0gdGhpcy52O1xyXG4vLyAgICAgdmFyIHQwID0gdCB8fCB0aGlzLnZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4vLyAgICAgdmFyIHQxID0gdDAgKyB0aGlzLmF0dGFjayAqIHY7XHJcbi8vICAgICB2YXIgZ2FpbiA9IHRoaXMudm9pY2UuZ2Fpbi5nYWluO1xyXG4vLyAgICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4vLyAgICAgZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0MCk7XHJcbi8vICAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYsIHQxKTtcclxuLy8gICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5zdXN0YWluICogdiwgdDAgKyB0aGlzLmRlY2F5IC8gdik7XHJcbi8vICAgICAvL2dhaW4uc2V0VGFyZ2V0QXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQxLCB0MSArIHRoaXMuZGVjYXkgLyB2KTtcclxuLy8gICB9LFxyXG4vLyAgIGtleW9mZjogZnVuY3Rpb24gKHQpIHtcclxuLy8gICAgIHZhciB2b2ljZSA9IHRoaXMudm9pY2U7XHJcbi8vICAgICB2YXIgZ2FpbiA9IHZvaWNlLmdhaW4uZ2FpbjtcclxuLy8gICAgIHZhciB0MCA9IHQgfHwgdm9pY2UuYXVkaW9jdHguY3VycmVudFRpbWU7XHJcbi8vICAgICBnYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0MCk7XHJcbi8vICAgICAvL2dhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4vLyAgICAgLy9nYWluLnNldFRhcmdldEF0VGltZSgwLCB0MCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4vLyAgICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0MCArIHRoaXMucmVsZWFzZSAvIHRoaXMudik7XHJcbi8vICAgfVxyXG4vLyB9OyIsIid1c2Ugc3RyaWN0JztcblxuLy9cbi8vIFdlIHN0b3JlIG91ciBFRSBvYmplY3RzIGluIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcbi8vIGB+YCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBvdmVycmlkZGVuIG9yXG4vLyB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXG4vLyBXZSBhbHNvIGFzc3VtZSB0aGF0IGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBhdmFpbGFibGUgd2hlbiB0aGUgZXZlbnQgbmFtZVxuLy8gaXMgYW4gRVM2IFN5bWJvbC5cbi8vXG52YXIgcHJlZml4ID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgIT09ICdmdW5jdGlvbicgPyAnficgOiBmYWxzZTtcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBXZSBvbmx5IG5lZWQgdG8ga25vdyBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBFbWl0IGFuIGV2ZW50IHRvIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIG5hbWUgb2YgdGhlIGV2ZW50LlxuICogQHJldHVybnMge0Jvb2xlYW59IEluZGljYXRpb24gaWYgd2UndmUgZW1pdHRlZCBhbiBldmVudC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGFyZ3NcbiAgICAsIGk7XG5cbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgRXZlbnRMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rvbn0gZm4gQ2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lclxuICAgIF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdlIHdhbnQgdG8gcmVtb3ZlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIHRoYXQgd2UgbmVlZCB0byBmaW5kLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSBsaXN0ZW5lcnMgbWF0Y2hpbmcgdGhpcyBjb250ZXh0LlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uY2UgbGlzdGVuZXJzLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBldmVudHMgPSBbXTtcblxuICBpZiAoZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgICBpZiAoXG4gICAgICAgICAgIGxpc3RlbmVycy5mbiAhPT0gZm5cbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVycy5vbmNlKVxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnMuY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXG4gICAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxuICAgICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgICApIHtcbiAgICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy9cbiAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAvL1xuICBpZiAoZXZlbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW3ByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRdO1xuICBlbHNlIHRoaXMuX2V2ZW50cyA9IHByZWZpeCA/IHt9IDogT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxuLy9cbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRlZk9ic2VydmFibGUodGFyZ2V0LHByb3BOYW1lLG9wdCA9IHt9KVxyXG57XHJcblx0KCgpPT57XHJcblx0XHR2YXIgdl87XHJcblx0XHRvcHQuZW51bWVyYWJsZSA9IG9wdC5lbnVtZXJhYmxlIHx8IHRydWU7XHJcblx0XHRvcHQuY29uZmlndXJhYmxlID0gb3B0LmNvbmZpZ3VyYWJsZSB8fCBmYWxzZTtcclxuXHRcdG9wdC5nZXQgPSBvcHQuZ2V0IHx8ICgoKSA9PiB2Xyk7XHJcblx0XHRvcHQuc2V0ID0gb3B0LnNldCB8fCAoKHYpPT57XHJcblx0XHRcdGlmKHZfICE9IHYpe1xyXG4gIFx0XHRcdHZfID0gdjtcclxuICBcdFx0XHR0YXJnZXQuZW1pdChwcm9wTmFtZSArICdfY2hhbmdlZCcsdik7XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCxwcm9wTmFtZSxvcHQpO1xyXG5cdH0pKCk7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpJztcclxuaW1wb3J0IHtVbmRvTWFuYWdlcn0gZnJvbSAnLi91bmRvJztcclxuXHJcbmNvbnN0IElucHV0VHlwZSA9IHtcclxuICBrZXlib3JkOiAwLFxyXG4gIG1pZGk6IDFcclxufVxyXG5cclxuY29uc3QgSW5wdXRDb21tYW5kID1cclxuICB7XHJcbiAgICBlbnRlcjogeyBpZDogMSwgbmFtZTogJ+ODjuODvOODiOODh+ODvOOCv+aMv+WFpScgfSxcclxuICAgIGVzYzogeyBpZDogMiwgbmFtZTogJ+OCreODo+ODs+OCu+ODqycgfSxcclxuICAgIHJpZ2h0OiB7IGlkOiAzLCBuYW1lOiAn44Kr44O844K944Or56e75YuV77yI5Y+z77yJJyB9LFxyXG4gICAgbGVmdDogeyBpZDogNCwgbmFtZTogJ+OCq+ODvOOCveODq+enu+WLle+8iOW3pu+8iScgfSxcclxuICAgIHVwOiB7IGlkOiA1LCBuYW1lOiAn44Kr44O844K944Or56e75YuV77yI5LiK77yJJyB9LFxyXG4gICAgZG93bjogeyBpZDogNiwgbmFtZTogJ+OCq+ODvOOCveODq+enu+WLle+8iOS4i++8iScgfSxcclxuICAgIGluc2VydE1lYXN1cmU6IHsgaWQ6IDcsIG5hbWU6ICflsI/nr4Dnt5rmjL/lhaUnIH0sXHJcbiAgICB1bmRvOiB7IGlkOiA4LCBuYW1lOiAn44Ki44Oz44OJ44KlJyB9LFxyXG4gICAgcmVkbzogeyBpZDogOSwgbmFtZTogJ+ODquODieOCpScgfSxcclxuICAgIHBhZ2VVcDogeyBpZDogMTAsIG5hbWU6ICfjg5rjg7zjgrjjgqLjg4Pjg5cnIH0sXHJcbiAgICBwYWdlRG93bjogeyBpZDogMTEsIG5hbWU6ICfjg5rjg7zjgrjjg4Djgqbjg7MnIH0sXHJcbiAgICBob21lOiB7IGlkOiAxMiwgbmFtZTogJ+WFiOmgreihjOOBq+enu+WLlScgfSxcclxuICAgIGVuZDogeyBpZDogMTMsIG5hbWU6ICfntYLnq6/ooYzjgavnp7vli5UnIH0sXHJcbiAgICBudW1iZXI6IHsgaWQ6IDE0LCBuYW1lOiAn5pWw5a2X5YWl5YqbJyB9LFxyXG4gICAgbm90ZTogeyBpZDogMTUsIG5hbWU6ICfjg47jg7zjg4jlhaXlipsnIH0sXHJcbiAgICBzY3JvbGxVcDogeyBpZDogMTYsIG5hbWU6ICfpq5jpgJ/jgrnjgq/jg63jg7zjg6vjgqLjg4Pjg5cnIH0sXHJcbiAgICBzY3JvbGxEb3duOiB7IGlkOiAxNywgbmFtZTogJ+mrmOmAn+OCueOCr+ODreODvOODq+ODgOOCpuODsycgfSxcclxuICAgIGRlbGV0ZTogeyBpZDogMTgsIG5hbWU6ICfooYzliYrpmaQnIH0sXHJcbiAgICBsaW5lUGFzdGU6IHsgaWQ6IDE5LCBuYW1lOiAn6KGM44Oa44O844K544OIJyB9XHJcbiAgfVxyXG5cclxuLy9cclxuY29uc3QgS2V5QmluZCA9XHJcbiAge1xyXG4gICAgMTM6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEzLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuZW50ZXJcclxuICAgIH1dLFxyXG4gICAgMjc6IFt7XHJcbiAgICAgIGtleUNvZGU6IDI3LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuZXNjXHJcbiAgICB9XSxcclxuICAgIDMyOiBbe1xyXG4gICAgICBrZXlDb2RlOiAzMixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnJpZ2h0XHJcbiAgICB9XSxcclxuICAgIDM5OiBbe1xyXG4gICAgICBrZXlDb2RlOiAzOSxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnJpZ2h0XHJcbiAgICB9XSxcclxuICAgIDM3OiBbe1xyXG4gICAgICBrZXlDb2RlOiAzNyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmxlZnRcclxuICAgIH1dLFxyXG4gICAgMzg6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM4LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQudXBcclxuICAgIH1dLFxyXG4gICAgNDA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDQwLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuZG93blxyXG4gICAgfV0sXHJcbiAgICAxMDY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwNixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmluc2VydE1lYXN1cmVcclxuICAgIH1dLFxyXG4gICAgOTA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDkwLFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC51bmRvXHJcbiAgICB9XSxcclxuICAgIDMzOiBbe1xyXG4gICAgICBrZXlDb2RlOiAzMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnBhZ2VVcFxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDMzLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuc2Nyb2xsVXBcclxuICAgICAgfV0sXHJcbiAgICA4MjogW3tcclxuICAgICAga2V5Q29kZTogODIsXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnBhZ2VVcFxyXG4gICAgfV0sXHJcbiAgICAzNDogW3tcclxuICAgICAga2V5Q29kZTogMzQsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5wYWdlRG93blxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDM0LFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuc2Nyb2xsRG93blxyXG4gICAgICB9XSxcclxuICAgIDY3OiBbe1xyXG4gICAgICBrZXlDb2RlOiA2NyxcclxuICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucGFnZURvd25cclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA2NyxcclxuICAgICAgICBub3RlOiAnQycsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNjcsXHJcbiAgICAgICAgbm90ZTogJ0MnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9XSxcclxuICAgIDM2OiBbe1xyXG4gICAgICBrZXlDb2RlOiAzNixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmhvbWVcclxuICAgIH1dLFxyXG4gICAgMzU6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM1LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuZW5kXHJcbiAgICB9XSxcclxuICAgIDk2OiBbe1xyXG4gICAgICBrZXlDb2RlOiA5NixcclxuICAgICAgbnVtYmVyOiAwLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDk3OiBbe1xyXG4gICAgICBrZXlDb2RlOiA5NyxcclxuICAgICAgbnVtYmVyOiAxLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDk4OiBbe1xyXG4gICAgICBrZXlDb2RlOiA5OCxcclxuICAgICAgbnVtYmVyOiAyLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDk5OiBbe1xyXG4gICAgICBrZXlDb2RlOiA5OSxcclxuICAgICAgbnVtYmVyOiAzLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDEwMDogW3tcclxuICAgICAga2V5Q29kZTogMTAwLFxyXG4gICAgICBudW1iZXI6IDQsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgMTAxOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDEsXHJcbiAgICAgIG51bWJlcjogNSxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICAxMDI6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwMixcclxuICAgICAgbnVtYmVyOiA2LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDEwMzogW3tcclxuICAgICAga2V5Q29kZTogMTAzLFxyXG4gICAgICBudW1iZXI6IDcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgMTA0OiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDQsXHJcbiAgICAgIG51bWJlcjogOCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICAxMDU6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwNSxcclxuICAgICAgbnVtYmVyOiA5LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDY1OiBbe1xyXG4gICAgICBrZXlDb2RlOiA2NSxcclxuICAgICAgbm90ZTogJ0EnLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY1LFxyXG4gICAgICAgIG5vdGU6ICdBJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGtleUNvZGU6IDY1LFxyXG4gICAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucmVkb1xyXG4gICAgICB9XSxcclxuICAgIDY2OiBbe1xyXG4gICAgICBrZXlDb2RlOiA2NixcclxuICAgICAgbm90ZTogJ0InLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY2LFxyXG4gICAgICAgIG5vdGU6ICdCJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfV0sXHJcbiAgICA2ODogW3tcclxuICAgICAga2V5Q29kZTogNjgsXHJcbiAgICAgIG5vdGU6ICdEJyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA2OCxcclxuICAgICAgICBub3RlOiAnRCcsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH1dLFxyXG4gICAgNjk6IFt7XHJcbiAgICAgIGtleUNvZGU6IDY5LFxyXG4gICAgICBub3RlOiAnRScsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNjksXHJcbiAgICAgICAgbm90ZTogJ0UnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9XSxcclxuICAgIDcwOiBbe1xyXG4gICAgICBrZXlDb2RlOiA3MCxcclxuICAgICAgbm90ZTogJ0YnLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDcwLFxyXG4gICAgICAgIG5vdGU6ICdGJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfV0sXHJcbiAgICA3MTogW3tcclxuICAgICAga2V5Q29kZTogNzEsXHJcbiAgICAgIG5vdGU6ICdHJyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA3MSxcclxuICAgICAgICBub3RlOiAnRycsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH1dLFxyXG4gICAgODk6IFt7XHJcbiAgICAgIGtleUNvZGU6IDg5LFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5kZWxldGVcclxuICAgIH1dLFxyXG4gICAgNzY6IFt7XHJcbiAgICAgIGtleUNvZGU6IDc2LFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5saW5lUGFzdGVcclxuICAgIH1dXHJcbiAgfTtcclxuXHJcbmV4cG9ydCBjbGFzcyBTZXF1ZW5jZUVkaXRvciB7XHJcbiAgY29uc3RydWN0b3Ioc2VxdWVuY2VyKSB7XHJcbiAgICB2YXIgc2VsZl8gPSB0aGlzO1xyXG4gICAgdGhpcy51bmRvTWFuYWdlciA9IG5ldyBVbmRvTWFuYWdlcigpO1xyXG4gICAgdGhpcy5zZXF1ZW5jZXIgPSBzZXF1ZW5jZXI7XHJcbiAgICBzZXF1ZW5jZXIucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuICAgIHNlcXVlbmNlci5wYW5lbC54ID0gc2VxdWVuY2VyLng7XHJcbiAgICBzZXF1ZW5jZXIucGFuZWwueSA9IHNlcXVlbmNlci55O1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLndpZHRoID0gMTAyNDtcclxuICAgIHNlcXVlbmNlci5wYW5lbC5oZWlnaHQgPSA3Njg7XHJcbiAgICBzZXF1ZW5jZXIucGFuZWwuaGVhZGVyLnRleHQoJ1NlcXVlbmNlIEVkaXRvcicpO1xyXG4gICAgdmFyIGVkaXRvciA9IHNlcXVlbmNlci5wYW5lbC5hcnRpY2xlLmFwcGVuZCgnZGl2JykuY2xhc3NlZCgnc2VxLWVkaXRvcicsIHRydWUpO1xyXG4gICAgdmFyIGRpdiA9IGVkaXRvci5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ2hlYWRlcicsIHRydWUpO1xyXG5cdCBcclxuICAgIC8vIOOCv+OCpOODoOODmeODvOOCuVxyXG4gICAgZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJ1RpbWUgQmFzZTonKTtcclxuICAgIGRpdi5hcHBlbmQoJ2lucHV0JylcclxuICAgICAgLmRhdHVtKHNlcXVlbmNlci5hdWRpb05vZGUudHBiKVxyXG4gICAgICAuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJywgJ2lkJzogJ3RpbWUtYmFzZScgfSlcclxuICAgICAgLmF0dHIoJ3ZhbHVlJywgKHYpID0+IHYpXHJcbiAgICAgIC5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUudHBiID0gcGFyc2VGbG9hdChkMy5ldmVudC50YXJnZXQudmFsdWUpIHx8IGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2FsbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS5vbigndHBiX2NoYW5nZWQnLCAodikgPT4ge1xyXG4gICAgICAgICAgdGhpcy5hdHRyKCd2YWx1ZScsIHYpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcblxyXG4gICAgLy8g44OG44Oz44OdXHJcbiAgICBkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnVGVtcG86Jyk7XHJcbiAgICBkaXYuYXBwZW5kKCdpbnB1dCcpXHJcbi8vICAgICAgLmRhdHVtKHNlcXVlbmNlcilcclxuICAgICAgLmF0dHIoeyAndHlwZSc6ICd0ZXh0JywgJ3NpemUnOiAnMycgfSlcclxuICAgICAgLmF0dHIoJ3ZhbHVlJywgKGQpID0+IHNlcXVlbmNlci5hdWRpb05vZGUuYnBtKVxyXG4gICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUuYnBtID0gcGFyc2VGbG9hdChkMy5ldmVudC50YXJnZXQudmFsdWUpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2FsbChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS5vbignYnBtX2NoYW5nZWQnLCAodikgPT4ge1xyXG4gICAgICAgICAgdGhpcy5hdHRyKCd2YWx1ZScsIHYpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICBkaXYuYXBwZW5kKCdzcGFuJykudGV4dCgnQmVhdDonKTtcclxuICAgIGRpdi5hcHBlbmQoJ2lucHV0JylcclxuICAgICAgLmRhdHVtKHNlcXVlbmNlcilcclxuICAgICAgLmF0dHIoeyAndHlwZSc6ICd0ZXh0JywgJ3NpemUnOiAnMycsICd2YWx1ZSc6IChkKSA9PiBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJlYXQgfSlcclxuICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihkKXtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJlYXQgPSBwYXJzZUZsb2F0KGQzLnNlbGVjdCh0aGlzKS5hdHRyKCd2YWx1ZScpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJyAvICcpO1xyXG4gICAgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG4gICAgICAuZGF0dW0oc2VxdWVuY2VyKVxyXG4gICAgICAuYXR0cih7ICd0eXBlJzogJ3RleHQnLCAnc2l6ZSc6ICczJywgJ3ZhbHVlJzogKGQpID0+IHNlcXVlbmNlci5hdWRpb05vZGUuYmFyIH0pXHJcbiAgICAgIC5vbignY2hhbmdlJywgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUuYmFyID0gcGFyc2VGbG9hdChkMy5zZWxlY3QodGhpcykuYXR0cigndmFsdWUnKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAvLyDjg4jjg6njg4Pjgq/jgqjjg4fjgqPjgr9cclxuICAgIGxldCB0cmFja0VkaXQgPSBlZGl0b3Iuc2VsZWN0QWxsKCdkaXYudHJhY2snKVxyXG4gICAgICAuZGF0YShzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRyYWNrcylcclxuICAgICAgLmVudGVyKClcclxuICAgICAgLmFwcGVuZCgnZGl2JylcclxuICAgICAgLmNsYXNzZWQoJ3RyYWNrJywgdHJ1ZSlcclxuICAgICAgLmF0dHIoeyAnaWQnOiAoZCwgaSkgPT4gJ3RyYWNrLScgKyAoaSArIDEpLCAndGFiaW5kZXgnOiAnMCcgfSk7XHJcblxyXG4gICAgbGV0IHRyYWNrSGVhZGVyID0gdHJhY2tFZGl0LmFwcGVuZCgnZGl2JykuY2xhc3NlZCgndHJhY2staGVhZGVyJywgdHJ1ZSk7XHJcbiAgICB0cmFja0hlYWRlci5hcHBlbmQoJ3NwYW4nKS50ZXh0KChkLCBpKSA9PiAnVFI6JyArIChpICsgMSkpO1xyXG4gICAgdHJhY2tIZWFkZXIuYXBwZW5kKCdzcGFuJykudGV4dCgnTUVBUzonKTtcclxuICAgIGxldCB0cmFja0JvZHkgPSB0cmFja0VkaXQuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCd0cmFjay1ib2R5JywgdHJ1ZSk7XHJcbiAgICBsZXQgZXZlbnRFZGl0ID0gdHJhY2tCb2R5LmFwcGVuZCgndGFibGUnKTtcclxuICAgIGxldCBoZWFkcm93ID0gZXZlbnRFZGl0LmFwcGVuZCgndGhlYWQnKS5hcHBlbmQoJ3RyJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdNIycpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnUyMnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ05UJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdOIycpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnU1QnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ0dUJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdWRScpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnQ08nKTtcclxuICAgIGxldCBldmVudEJvZHkgPSBldmVudEVkaXQuYXBwZW5kKCd0Ym9keScpLmF0dHIoJ2lkJywgKGQsIGkpID0+ICd0cmFjay0nICsgKGkgKyAxKSArICctZXZlbnRzJyk7XHJcbiAgICAvL3RoaXMuZHJhd0V2ZW50cyhldmVudEJvZHkpO1xyXG5cclxuICAgIC8vIOODhuOCueODiOODh+ODvOOCv1xyXG4gICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCAxMjc7IGkgKz0gOCkge1xyXG4gICAgLy8gICBmb3IgKHZhciBqID0gaTsgaiA8IChpICsgOCk7ICsraikge1xyXG4gICAgLy8gICAgIHNlcXVlbmNlci5hdWRpb05vZGUudHJhY2tzWzBdLmFkZEV2ZW50KG5ldyBhdWRpby5Ob3RlRXZlbnQoNDgsIGosIDYpKTtcclxuICAgIC8vICAgfVxyXG4gICAgLy8gICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRyYWNrc1swXS5hZGRFdmVudChuZXcgYXVkaW8uTWVhc3VyZSgpKTtcclxuICAgIC8vIH1cclxuXHJcbiAgICAvLyDjg4jjg6njg4Pjgq/jgqjjg4fjgqPjgr/jg6HjgqTjg7NcclxuXHJcbiAgICB0cmFja0VkaXQuZWFjaChmdW5jdGlvbiAoZCkge1xyXG4gICAgICBpZiAoIXRoaXMuZWRpdG9yKSB7XHJcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBkb0VkaXRvcihkMy5zZWxlY3QodGhpcyksIHNlbGZfKTtcclxuICAgICAgICB0aGlzLmVkaXRvci5uZXh0KCk7XHJcbiAgICAgICAgdGhpcy5zZXF1ZW5jZXIgPSBzZXF1ZW5jZXI7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIOOCreODvOWFpeWKm+ODj+ODs+ODieODqVxyXG4gICAgdHJhY2tFZGl0Lm9uKCdrZXlkb3duJywgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgbGV0IGUgPSBkMy5ldmVudDtcclxuICAgICAgY29uc29sZS5sb2coZS5rZXlDb2RlKTtcclxuICAgICAgbGV0IGtleSA9IEtleUJpbmRbZS5rZXlDb2RlXTtcclxuICAgICAgbGV0IHJldCA9IHt9O1xyXG4gICAgICBpZiAoa2V5KSB7XHJcbiAgICAgICAga2V5LnNvbWUoKGQpID0+IHtcclxuICAgICAgICAgIGlmIChkLmN0cmxLZXkgPT0gZS5jdHJsS2V5XHJcbiAgICAgICAgICAgICYmIGQuc2hpZnRLZXkgPT0gZS5zaGlmdEtleVxyXG4gICAgICAgICAgICAmJiBkLmFsdEtleSA9PSBlLmFsdEtleVxyXG4gICAgICAgICAgICAmJiBkLm1ldGFLZXkgPT0gZS5tZXRhS2V5XHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICByZXQgPSB0aGlzLmVkaXRvci5uZXh0KGQpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAocmV0LnZhbHVlKSB7XHJcbiAgICAgICAgICBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHNlcXVlbmNlci5wYW5lbC5vbignc2hvdycsICgpID0+IHtcclxuICAgICAgZDMuc2VsZWN0KCcjdGltZS1iYXNlJykubm9kZSgpLmZvY3VzKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZXF1ZW5jZXIucGFuZWwub24oJ2Rpc3Bvc2UnLCAoKSA9PiB7XHJcbiAgICAgIGRlbGV0ZSBzZXF1ZW5jZXIuZWRpdG9ySW5zdGFuY2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZXF1ZW5jZXIucGFuZWwuc2hvdygpO1xyXG4gIH1cclxufVxyXG5cclxuLy8g44Ko44OH44Kj44K/5pys5L2TXHJcbmZ1bmN0aW9uKiBkb0VkaXRvcih0cmFja0VkaXQsIHNlcUVkaXRvcikge1xyXG4gIGxldCBrZXljb2RlID0gMDsvLyDlhaXlipvjgZXjgozjgZ/jgq3jg7zjgrPjg7zjg4njgpLkv53mjIHjgZnjgovlpInmlbBcclxuICBsZXQgdHJhY2sgPSB0cmFja0VkaXQuZGF0dW0oKTsvLyDnj77lnKjnt6jpm4bkuK3jga7jg4jjg6njg4Pjgq9cclxuICBsZXQgZWRpdFZpZXcgPSBkMy5zZWxlY3QoJyMnICsgdHJhY2tFZGl0LmF0dHIoJ2lkJykgKyAnLWV2ZW50cycpOy8v57eo6ZuG55S76Z2i44Gu44K744Os44Kv44K344On44OzXHJcbiAgbGV0IG1lYXN1cmUgPSAxOy8vIOWwj+evgFxyXG4gIGxldCBzdGVwID0gMTsvLyDjgrnjg4bjg4Pjg5dOb1xyXG4gIGxldCByb3dJbmRleCA9IDA7Ly8g57eo6ZuG55S76Z2i44Gu54++5Zyo6KGMXHJcbiAgbGV0IGN1cnJlbnRFdmVudEluZGV4ID0gMDsvLyDjgqTjg5njg7Pjg4jphY3liJfjga7nt6jpm4bplovlp4vooYxcclxuICBsZXQgY2VsbEluZGV4ID0gMjsvLyDliJfjgqTjg7Pjg4fjg4Pjgq/jgrlcclxuICBsZXQgY2FuY2VsRXZlbnQgPSBmYWxzZTsvLyDjgqTjg5njg7Pjg4jjgpLjgq3jg6Pjg7Pjgrvjg6vjgZnjgovjgYvjganjgYbjgYtcclxuICBsZXQgbGluZUJ1ZmZlciA9IG51bGw7Ly/ooYzjg5Djg4Pjg5XjgqFcclxuICBjb25zdCBOVU1fUk9XID0gNDc7Ly8g77yR55S76Z2i44Gu6KGM5pWwXHJcblx0XHJcbiAgZnVuY3Rpb24gc2V0SW5wdXQoKSB7XHJcbiAgICB0aGlzLmF0dHIoJ2NvbnRlbnRFZGl0YWJsZScsICd0cnVlJyk7XHJcbiAgICB0aGlzLm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgY29uc29sZS5sb2codGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMSk7XHJcbiAgICAgIHJvd0luZGV4ID0gdGhpcy5wYXJlbnROb2RlLnJvd0luZGV4IC0gMTtcclxuICAgICAgY2VsbEluZGV4ID0gdGhpcy5jZWxsSW5kZXg7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gc2V0Qmx1cihkZXN0KXtcclxuICAgIHN3aXRjaChkZXN0KXtcclxuICAgICAgIGNhc2UgJ25vdGUnOlxyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMub24oJ2JsdXInLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgIGQuc2V0Tm90ZU5hbWVUb05vdGUodGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICAgIHRoaXMuaW5uZXJUZXh0ID0gZC5uYW1lO1xyXG4gICAgICAgICAgICAgIC8vIE5vdGVOb+ihqOekuuOCguabtOaWsFxyXG4gICAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5jZWxsc1szXS5pbm5lclRleHQgPSBkLm5vdGU7XHJcbiAgICAgICAgICAgIH0pOy8vIE5vdGVcclxuICAgICAgICAgIH1cclxuICAgICAgIGJyZWFrO1xyXG4gICAgICAgY2FzZSAnbm90ZU5hbWUnOlxyXG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHRoaXMub24oJ2JsdXInLCBmdW5jdGlvbiAoZCkge1xyXG4gICAgICAgICAgICAgIGxldCB2ID0gcGFyc2VGbG9hdCh0aGlzLmlubmVyVGV4dCk7XHJcbiAgICAgICAgICAgICAgaWYoIWlzTmFOKHYpKXtcclxuICAgICAgICAgICAgICAgIGQubm90ZSA9IHBhcnNlRmxvYXQodGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLmNlbGxzWzJdLmlubmVyVGV4dCA9IGQubmFtZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICB0aGlzLm9uKCdibHVyJyxmdW5jdGlvbihkKVxyXG4gICAgICB7XHJcbiAgICAgICAgbGV0IHYgPSBwYXJzZUZsb2F0KHRoaXMuaW5uZXJUZXh0KTtcclxuICAgICAgICBpZighaXNOYU4odikpe1xyXG4gICAgICAgICAgZFtkZXN0XSA9IHY7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG4gIFxyXG4gIFxyXG4gIC8vIOaXouWtmOOCpOODmeODs+ODiOOBruihqOekulxyXG4gIGZ1bmN0aW9uIGRyYXdFdmVudCgpIHtcclxuICAgIGxldCBldmZsYWdtZW50ID0gdHJhY2suZXZlbnRzLnNsaWNlKGN1cnJlbnRFdmVudEluZGV4LCBjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cpO1xyXG4gICAgZWRpdFZpZXcuc2VsZWN0QWxsKCd0cicpLnJlbW92ZSgpO1xyXG4gICAgbGV0IHNlbGVjdCA9IGVkaXRWaWV3LnNlbGVjdEFsbCgndHInKS5kYXRhKGV2ZmxhZ21lbnQpO1xyXG4gICAgbGV0IGVudGVyID0gc2VsZWN0LmVudGVyKCk7XHJcbiAgICBsZXQgcm93cyA9IGVudGVyLmFwcGVuZCgndHInKS5hdHRyKCdkYXRhLWluZGV4JywgKGQsIGkpID0+IGkpO1xyXG4gICAgcm93cy5lYWNoKGZ1bmN0aW9uIChkLCBpKSB7XHJcbiAgICAgIGxldCByb3cgPSBkMy5zZWxlY3QodGhpcyk7XHJcbiAgICAgIC8vcm93SW5kZXggPSBpO1xyXG4gICAgICBzd2l0Y2ggKGQudHlwZSkge1xyXG4gICAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLk5vdGU6XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5tZWFzdXJlKTsvLyBNZWFzZXVyZSAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5zdGVwTm8pOy8vIFN0ZXAgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQubmFtZSkuY2FsbChzZXRJbnB1dCkvLyBOb3RlXHJcbiAgICAgICAgICAuY2FsbChzZXRCbHVyKCdub3RlTmFtZScpKTtcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLm5vdGUpLmNhbGwoc2V0SW5wdXQpLy8gTm90ZSAjXHJcbiAgICAgICAgICAuY2FsbChzZXRCbHVyKCdub3RlJykpO1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQuc3RlcCkuY2FsbChzZXRJbnB1dCkvLyBTdGVwXHJcbiAgICAgICAgICAuY2FsbChzZXRCbHVyKCdzdGVwJykpO1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQuZ2F0ZSkuY2FsbChzZXRJbnB1dCkvLyBHYXRlXHJcbiAgICAgICAgICAuY2FsbChzZXRCbHVyKCdnYXRlJykpO1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQudmVsKS5jYWxsKHNldElucHV0KS8vIFZlbG9jaXR5XHJcbiAgICAgICAgICAuY2FsbChzZXRCbHVyKCd2ZWwnKSk7XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5jb20pLmNhbGwoc2V0SW5wdXQpOy8vIENvbW1hbmRcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLk1lYXN1cmU6XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoJycpOy8vIE1lYXNldXJlICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dCgnJyk7Ly8gU3RlcCAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpXHJcbiAgICAgICAgICAgIC5hdHRyKHsgJ2NvbHNwYW4nOiA2LCAndGFiaW5kZXgnOiAwIH0pXHJcbiAgICAgICAgICAgIC50ZXh0KCcgLS0tICgnICsgZC5zdGVwVG90YWwgKyAnKSAtLS0gJylcclxuICAgICAgICAgICAgLm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICByb3dJbmRleCA9IHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDE7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuVHJhY2tFbmQ6XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoJycpOy8vIE1lYXNldXJlICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dCgnJyk7Ly8gU3RlcCAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpXHJcbiAgICAgICAgICAgIC5hdHRyKHsgJ2NvbHNwYW4nOiA2LCAndGFiaW5kZXgnOiAwIH0pXHJcbiAgICAgICAgICAgIC50ZXh0KCcgLS0tIFRyYWNrIEVuZCAtLS0gJylcclxuICAgICAgICAgICAgLm9uKCdmb2N1cycsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICByb3dJbmRleCA9IHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDE7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChyb3dJbmRleCA+IChldmZsYWdtZW50Lmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgIHJvd0luZGV4ID0gZXZmbGFnbWVudC5sZW5ndGggLSAxO1xyXG4gICAgfVxyXG5cclxuICB9XHJcblx0XHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu44OV44Kp44O844Kr44K5XHJcbiAgZnVuY3Rpb24gZm9jdXNFdmVudCgpIHtcclxuICAgIGxldCBldnJvdyA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pO1xyXG4gICAgbGV0IGV2ID0gZXZyb3cuZGF0dW0oKTtcclxuICAgIHN3aXRjaCAoZXYudHlwZSkge1xyXG4gICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5Ob3RlOlxyXG4gICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdLmZvY3VzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLk1lYXN1cmU6XHJcbiAgICAgICAgZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzWzJdLmZvY3VzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLlRyYWNrRW5kOlxyXG4gICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1syXS5mb2N1cygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHRcclxuICAvLyDjgqTjg5njg7Pjg4jjga7mjL/lhaVcclxuICBmdW5jdGlvbiBpbnNlcnRFdmVudChyb3dJbmRleCkge1xyXG4gICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoe1xyXG4gICAgICBleGVjKCkge1xyXG4gICAgICAgIHRoaXMucm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdO1xyXG4gICAgICAgIHRoaXMuY2VsbEluZGV4ID0gY2VsbEluZGV4O1xyXG4gICAgICAgIHRoaXMucm93SW5kZXggPSByb3dJbmRleDtcclxuICAgICAgICB0aGlzLmV4ZWNfKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGV4ZWNfKCkge1xyXG4gICAgICAgIHZhciByb3cgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLmluc2VydFJvdyh0aGlzLnJvd0luZGV4KSlcclxuICAgICAgICAgIC5kYXR1bShuZXcgYXVkaW8uTm90ZUV2ZW50KCkpO1xyXG4gICAgICAgIGNlbGxJbmRleCA9IDI7XHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKTsvLyBNZWFzZXVyZSAjXHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKTsvLyBTdGVwICNcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpXHJcbiAgICAgICAgLmNhbGwoc2V0Qmx1cignbm90ZU5hbWUnKSk7XHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KS8vIE5vdGUgI1xyXG4gICAgICAgIC5jYWxsKHNldEJsdXIoJ25vdGUnKSk7XHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KS8vIFN0ZXBcclxuICAgICAgICAuY2FsbChzZXRCbHVyKCdzdGVwJykpO1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dCkvLyBHYXRlXHJcbiAgICAgICAgLmNhbGwoc2V0Qmx1cignZ2F0ZScpKTtcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpLy8gVmVsb2NpdHlcclxuICAgICAgICAuY2FsbChzZXRCbHVyKCd2ZWwnKSk7XHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KTsvLyBDb21tYW5kXHJcbiAgICAgICAgcm93Lm5vZGUoKS5jZWxsc1t0aGlzLmNlbGxJbmRleF0uZm9jdXMoKTtcclxuICAgICAgICByb3cuYXR0cignZGF0YS1uZXcnLCB0cnVlKTtcclxuICAgICAgfSxcclxuICAgICAgcmVkbygpIHtcclxuICAgICAgICB0aGlzLmV4ZWNfKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVuZG8oKSB7XHJcbiAgICAgICAgZWRpdFZpZXcubm9kZSgpLmRlbGV0ZVJvdyh0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICB0aGlzLnJvdy5jZWxsc1t0aGlzLmNlbGxJbmRleF0uZm9jdXMoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIC8vIOaWsOimj+WFpeWKm+ihjOOBrueiuuWumlxyXG4gIGZ1bmN0aW9uIGVuZE5ld0lucHV0KGRvd24gPSB0cnVlKSB7XHJcbiAgICBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycsIG51bGwpO1xyXG4gICAgLy8gMeOBpOWJjeOBruODjuODvOODiOODh+ODvOOCv+OCkuaknOe0ouOBmeOCi1xyXG4gICAgbGV0IGJlZm9yZUNlbGxzID0gW107XHJcbiAgICBsZXQgc3IgPSByb3dJbmRleCAtIDE7XHJcbiAgICB3aGlsZSAoc3IgPj0gMCkge1xyXG4gICAgICB2YXIgdGFyZ2V0ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3NyXSk7XHJcbiAgICAgIGlmICh0YXJnZXQuZGF0dW0oKS50eXBlID09PSBhdWRpby5FdmVudFR5cGUuTm90ZSkge1xyXG4gICAgICAgIGJlZm9yZUNlbGxzID0gdGFyZ2V0Lm5vZGUoKS5jZWxscztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICAtLXNyO1xyXG4gICAgfVxyXG4gICAgLy8g54++5Zyo44Gu57eo6ZuG6KGMXHJcbiAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzO1xyXG4gICAgbGV0IGV2ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XSkuZGF0dW0oKTtcclxuICAgIC8vIOOCqOODmeODs+ODiOOCkueUn+aIkOOBmeOCi1xyXG4gICAgLy8g44OH44O844K/44GM5L2V44KC5YWl5Yqb44GV44KM44Gm44GE44Gq44GE44Go44GN44Gv44CBMeOBpOWJjeOBruODjuODvOODiOODh+ODvOOCv+OCkuikh+ijveOBmeOCi+OAglxyXG4gICAgLy8gMeOBpOWJjeOBruODjuODvOODiOODh+ODvOOCv+OBjOOBquOBhOOBqOOBjeOChOS4jeato+ODh+ODvOOCv+OBruWgtOWQiOOBr+OAgeODh+ODleOCqeODq+ODiOWApOOCkuS7o+WFpeOBmeOCi+OAglxyXG4gICAgbGV0IG5vdGVObyA9IDA7XHJcbiAgICBpZiAoY2VsbEluZGV4ID09IDIpIHtcclxuICAgICAgbGV0IG5vdGUgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XS5pbm5lclRleHRcclxuICAgICAgIHx8IChiZWZvcmVDZWxsc1syXSA/IGJlZm9yZUNlbGxzWzJdLmlubmVyVGV4dCA6ICdDIDAnKTtcclxuICAgICAgZXYuc2V0Tm90ZU5hbWVUb05vdGUobm90ZSwgYmVmb3JlQ2VsbHNbMl0gPyBiZWZvcmVDZWxsc1syXS5pbm5lclRleHQgOiAnJyk7XHJcbiAgICAgIG5vdGVObyA9IGV2Lm5vdGU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBub3RlTm8gPSBwYXJzZUZsb2F0KGN1clJvd1szXS5pbm5lclRleHQgfHwgKGJlZm9yZUNlbGxzWzNdID8gYmVmb3JlQ2VsbHNbM10uaW5uZXJUZXh0IDogJzYwJykpO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzTmFOKG5vdGVObykpIG5vdGVObyA9IDYwO1xyXG4gICAgbGV0IHN0ZXAgPSBwYXJzZUZsb2F0KGN1clJvd1s0XS5pbm5lclRleHQgfHwgKGJlZm9yZUNlbGxzWzRdID8gYmVmb3JlQ2VsbHNbNF0uaW5uZXJUZXh0IDogJzk2JykpO1xyXG4gICAgaWYgKGlzTmFOKHN0ZXApKSBzdGVwID0gOTY7XHJcbiAgICBsZXQgZ2F0ZSA9IHBhcnNlRmxvYXQoY3VyUm93WzVdLmlubmVyVGV4dCB8fCAoYmVmb3JlQ2VsbHNbNV0gPyBiZWZvcmVDZWxsc1s1XS5pbm5lclRleHQgOiAnMjQnKSk7XHJcbiAgICBpZiAoaXNOYU4oZ2F0ZSkpIGdhdGUgPSAyNDtcclxuICAgIGxldCB2ZWwgPSBwYXJzZUZsb2F0KGN1clJvd1s2XS5pbm5lclRleHQgfHwgKGJlZm9yZUNlbGxzWzZdID8gYmVmb3JlQ2VsbHNbNl0uaW5uZXJUZXh0IDogJzEuMCcpKTtcclxuICAgIGlmIChpc05hTih2ZWwpKSB2ZWwgPSAxLjBcclxuICAgIGxldCBjb20gPSAvKmN1clJvd1s3XS5pbm5lclRleHQgfHwgYmVmb3JlQ2VsbHNbN10/YmVmb3JlQ2VsbHNbN10uaW5uZXJUZXh0OiovbmV3IGF1ZGlvLkNvbW1hbmQoKTtcclxuXHJcbiAgICBldi5ub3RlID0gbm90ZU5vO1xyXG4gICAgZXYuc3RlcCA9IHN0ZXA7XHJcbiAgICBldi5nYXRlID0gZ2F0ZTtcclxuICAgIGV2LnZlbCA9IHZlbDtcclxuICAgIGV2LmNvbW1hbmQgPSBjb207XHJcbiAgICAvLyAgICAgICAgICAgIHZhciBldiA9IG5ldyBhdWRpby5Ob3RlRXZlbnQoc3RlcCwgbm90ZU5vLCBnYXRlLCB2ZWwsIGNvbSk7XHJcbiAgICAvLyDjg4jjg6njg4Pjgq/jgavjg4fjg7zjgr/jgpLjgrvjg4Pjg4hcclxuICAgIHRyYWNrLmluc2VydEV2ZW50KGV2LCByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4KTtcclxuICAgIGlmIChkb3duKSB7XHJcbiAgICAgIGlmIChyb3dJbmRleCA9PSAoTlVNX1JPVyAtIDEpKSB7XHJcbiAgICAgICAgKytjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICArK3Jvd0luZGV4O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyDmjL/lhaXlvozjgIHlho3mj4/nlLtcclxuICAgIGRyYXdFdmVudCgpO1xyXG4gICAgZm9jdXNFdmVudCgpO1xyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBhZGRSb3coZGVsdGEpXHJcbiAge1xyXG4gICAgcm93SW5kZXggKz0gZGVsdGE7XHJcbiAgICBsZXQgcm93TGVuZ3RoID0gZWRpdFZpZXcubm9kZSgpLnJvd3MubGVuZ3RoO1xyXG4gICAgaWYocm93SW5kZXggPj0gcm93TGVuZ3RoKXtcclxuICAgICAgbGV0IGQgPSByb3dJbmRleCAtIHJvd0xlbmd0aCArIDE7XHJcbiAgICAgIHJvd0luZGV4ID0gcm93TGVuZ3RoIC0gMTtcclxuICAgICAgaWYoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVyAtMSkgPCAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKXtcclxuICAgICAgICBjdXJyZW50RXZlbnRJbmRleCArPSBkO1xyXG4gICAgICAgIGlmKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cgLTEpID4gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSl7XHJcbiAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gTlVNX1JPVyArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBkcmF3RXZlbnQoKTtcclxuICAgIH1cclxuICAgIGlmKHJvd0luZGV4IDwgMCl7XHJcbiAgICAgIGxldCBkID0gcm93SW5kZXg7XHJcbiAgICAgIHJvd0luZGV4ID0gMDtcclxuICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggIT0gMCl7XHJcbiAgICAgICAgY3VycmVudEV2ZW50SW5kZXggKz0gZDtcclxuICAgICAgICBpZihjdXJyZW50RXZlbnRJbmRleCA8IDApe1xyXG4gICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgfSBcclxuICAgIH1cclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICB9XHJcbiAgICBcclxuICBkcmF3RXZlbnQoKTtcclxuICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgY29uc29sZS5sb2coJ25ldyBsaW5lJywgcm93SW5kZXgsIHRyYWNrLmV2ZW50cy5sZW5ndGgpO1xyXG4gICAgaWYgKHRyYWNrLmV2ZW50cy5sZW5ndGggPT0gMCB8fCByb3dJbmRleCA+ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgIH1cclxuICAgIGtleWxvb3A6XHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICBsZXQgaW5wdXQgPSB5aWVsZCBjYW5jZWxFdmVudDtcclxuICAgICAgc3dpdGNoIChpbnB1dC5pbnB1dENvbW1hbmQuaWQpIHtcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5lbnRlci5pZDovL0VudGVyXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnQ1IvTEYnKTtcclxuICAgICAgICAgIC8vIOePvuWcqOOBruihjOOBjOaWsOimj+OBi+e3qOmbhuS4reOBi1xyXG4gICAgICAgICAgbGV0IGZsYWcgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpO1xyXG4gICAgICAgICAgaWYgKGZsYWcpIHtcclxuICAgICAgICAgICAgZW5kTmV3SW5wdXQoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8v5paw6KaP57eo6ZuG5Lit44Gu6KGM44Gn44Gq44GR44KM44Gw44CB5paw6KaP5YWl5Yqb55So6KGM44KS5oy/5YWlXHJcbiAgICAgICAgICAgIGluc2VydEV2ZW50KHJvd0luZGV4KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnJpZ2h0LmlkOi8vIHJpZ2h0IEN1cnNvclxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBjZWxsSW5kZXgrKztcclxuICAgICAgICAgICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgICAgICAgICBpZiAoY2VsbEluZGV4ID4gKGN1clJvd1tyb3dJbmRleF0uY2VsbHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICBjZWxsSW5kZXggPSAyO1xyXG4gICAgICAgICAgICAgIGlmIChyb3dJbmRleCA8IChjdXJSb3cubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICAgICAgICAgICAgICBlbmROZXdJbnB1dCgpO1xyXG4gICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGFkZFJvdygxKTtcclxuICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQubnVtYmVyLmlkOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdO1xyXG4gICAgICAgICAgICBsZXQgY3VyRGF0YSA9IGQzLnNlbGVjdChjdXJSb3cpLmRhdHVtKCk7XHJcbiAgICAgICAgICAgIGlmIChjdXJEYXRhLnR5cGUgIT0gYXVkaW8uRXZlbnRUeXBlLk5vdGUpIHtcclxuICAgICAgICAgICAgICAvL+aWsOimj+e3qOmbhuS4reOBruihjOOBp+OBquOBkeOCjOOBsOOAgeaWsOimj+WFpeWKm+eUqOihjOOCkuaMv+WFpVxyXG4gICAgICAgICAgICAgIGluc2VydEV2ZW50KHJvd0luZGV4KTtcclxuICAgICAgICAgICAgICBjZWxsSW5kZXggPSAzO1xyXG4gICAgICAgICAgICAgIGxldCBjZWxsID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF07XHJcbiAgICAgICAgICAgICAgY2VsbC5pbm5lclRleHQgPSBpbnB1dC5udW1iZXI7XHJcbiAgICAgICAgICAgICAgbGV0IHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgICAgICAgICBzZWwuY29sbGFwc2UoY2VsbCwgMSk7XHJcbiAgICAgICAgICAgICAgLy8gc2VsLnNlbGVjdCgpO1xyXG4gICAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBjYW5jZWxFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5ub3RlLmlkOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdO1xyXG4gICAgICAgICAgICBsZXQgY3VyRGF0YSA9IGQzLnNlbGVjdChjdXJSb3cpLmRhdHVtKCk7XHJcbiAgICAgICAgICAgIGlmIChjdXJEYXRhLnR5cGUgIT0gYXVkaW8uRXZlbnRUeXBlLk5vdGUpIHtcclxuICAgICAgICAgICAgICAvL+aWsOimj+e3qOmbhuS4reOBruihjOOBp+OBquOBkeOCjOOBsOOAgeaWsOimj+WFpeWKm+eUqOihjOOCkuaMv+WFpVxyXG4gICAgICAgICAgICAgIGluc2VydEV2ZW50KHJvd0luZGV4KTtcclxuICAgICAgICAgICAgICBsZXQgY2VsbCA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdO1xyXG4gICAgICAgICAgICAgIGNlbGwuaW5uZXJUZXh0ID0gaW5wdXQubm90ZTtcclxuICAgICAgICAgICAgICBsZXQgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xyXG4gICAgICAgICAgICAgIHNlbC5jb2xsYXBzZShjZWxsLCAxKTtcclxuICAgICAgICAgICAgICAvLyBzZWwuc2VsZWN0KCk7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmxlZnQuaWQ6Ly8gbGVmdCBDdXJzb3JcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgICAgICAgICAtLWNlbGxJbmRleDtcclxuICAgICAgICAgICAgaWYgKGNlbGxJbmRleCA8IDIpIHtcclxuICAgICAgICAgICAgICBpZiAocm93SW5kZXggIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjZWxsSW5kZXggPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgICAgIGFkZFJvdygtMSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC51cC5pZDovLyBVcCBDdXJzb3JcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzO1xyXG4gICAgICAgICAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgICAgICAgICBlbmROZXdJbnB1dChmYWxzZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgYWRkUm93KC0xKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5kb3duLmlkOi8vIERvd24gQ3Vyc29yXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgICAgICAgICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgICAgICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFkZFJvdygxKTtcclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQucGFnZURvd24uaWQ6Ly8gUGFnZSBEb3duIOOCreODvFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPCAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggKz0gTlVNX1JPVztcclxuICAgICAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCAtPSBOVU1fUk9XO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnBhZ2VVcC5pZDovLyBQYWdlIFVwIOOCreODvFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggLT0gTlVNX1JPVztcclxuICAgICAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6vjgqLjg4Pjg5dcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5zY3JvbGxVcC5pZDpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICAgIC0tY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDjgrnjgq/jg63jg7zjg6vjg4Djgqbjg7NcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5zY3JvbGxEb3duLmlkOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoKGN1cnJlbnRFdmVudEluZGV4ICsgTlVNX1JPVykgPD0gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICsrY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDlhYjpoK3ooYzjgavnp7vli5VcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5ob21lLmlkOlxyXG4gICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICByb3dJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOacgOe1guihjOOBq+enu+WLlVxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmVuZC5pZDpcclxuICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCAhPSAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgIHJvd0luZGV4ID0gMDtcclxuICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSB0cmFjay5ldmVudHMubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOihjOWJiumZpFxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmRlbGV0ZS5pZDpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWYoKHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXgpID09ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpe1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGV4ZWMoKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucm93SW5kZXggPSByb3dJbmRleDtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RXZlbnRJbmRleCA9IGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmV2ZW50ID0gdHJhY2suZXZlbnRzW3RoaXMucm93SW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnJvd0RhdGEgPSB0cmFjay5ldmVudHNbdGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBsaW5lQnVmZmVyO1xyXG4gICAgICAgICAgICAgICAgICBsaW5lQnVmZmVyID0gdGhpcy5ldmVudDtcclxuICAgICAgICAgICAgICAgICAgdHJhY2suZGVsZXRlRXZlbnQodGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHJlZG8oKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMubGluZUJ1ZmZlciA9IGxpbmVCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgIGxpbmVCdWZmZXIgPSB0aGlzLmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgICBlZGl0Vmlldy5ub2RlKCkuZGVsZXRlUm93KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICB0cmFjay5kZWxldGVFdmVudCh0aGlzLmN1cnJlbnRFdmVudEluZGV4ICsgdGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdW5kbygpIHtcclxuICAgICAgICAgICAgICAgICAgbGluZUJ1ZmZlciA9IHRoaXMubGluZUJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgICAgdHJhY2suaW5zZXJ0RXZlbnQodGhpcy5ldmVudCwgdGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g44Op44Kk44Oz44OQ44OD44OV44Kh44Gu5YaF5a6544KS44Oa44O844K544OI44GZ44KLXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQubGluZVBhc3RlLmlkOlxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobGluZUJ1ZmZlcikge1xyXG4gICAgICAgICAgICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICBleGVjKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm93SW5kZXggPSByb3dJbmRleDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBsaW5lQnVmZmVyO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYWNrLmluc2VydEV2ZW50KGxpbmVCdWZmZXIuY2xvbmUoKSwgcm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgcmVkbygpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFjay5pbnNlcnRFdmVudCh0aGlzLmxpbmVCdWZmZXIuY2xvbmUoKSwgdGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICB1bmRvKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYWNrLmRlbGV0ZUV2ZW50KHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyByZWRvICAgXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQucmVkby5pZDpcclxuICAgICAgICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci5yZWRvKCk7XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyB1bmRvICBcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC51bmRvLmlkOlxyXG4gICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLnVuZG8oKTtcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOWwj+evgOe3muaMv+WFpVxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmluc2VydE1lYXN1cmUuaWQ6Ly8gKlxyXG4gICAgICAgICAgc2VxRWRpdG9yLnVuZG9NYW5hZ2VyLmV4ZWMoXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBleGVjKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleCA9IHJvd0luZGV4ICsgY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgICAgICAgICAgICB0cmFjay5pbnNlcnRFdmVudChuZXcgYXVkaW8uTWVhc3VyZSgpLCB0aGlzLmluZGV4KTtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgcmVkbygpIHtcclxuICAgICAgICAgICAgICAgIHRyYWNrLmluc2VydEV2ZW50KG5ldyBhdWRpby5NZWFzdXJlKCksIHRoaXMuaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB1bmRvKCkge1xyXG4gICAgICAgICAgICAgICAgdHJhY2suZGVsZXRlRXZlbnQodGhpcy5pbmRleCk7XHJcbiAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOODh+ODleOCqeODq+ODiFxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ2RlZmF1bHQnKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93U2VxdWVuY2VFZGl0b3IoZCkge1xyXG5cdCBkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdCBkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdCBkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdCBpZiAoZC5wYW5lbCAmJiBkLnBhbmVsLmlzU2hvdykgcmV0dXJuO1xyXG5cdCBkLmVkaXRvckluc3RhbmNlID0gbmV3IFNlcXVlbmNlRWRpdG9yKGQpO1xyXG59XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9ldmVudEVtaXR0ZXIzJztcclxuaW1wb3J0ICogYXMgcHJvcCBmcm9tICcuL3Byb3AnO1xyXG5cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3RvcihzdGVwID0gMCxuYW1lID0gXCJcIil7XHJcblx0XHR0aGlzLnN0ZXAgPSBzdGVwO1xyXG5cdFx0dGhpcy5zdGVwTm8gPSAwO1xyXG5cdFx0dGhpcy5tZWFzdXJlID0gMDtcclxuXHRcdHRoaXMubmFtZSA9ICBuYW1lO1xyXG5cdH1cclxufVxyXG5cclxuY29uc3QgQ29tbWFuZFR5cGUgPSB7XHJcbiAgc2V0VmFsdWVBdFRpbWU6MCxcclxuICBsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZToxLFxyXG4gIGV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWU6MiAgXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRWYWx1ZUF0VGltZShhdWRpb1BhcmFtLHZhbHVlLHRpbWUpXHJcbntcclxuXHRhdWRpb1BhcmFtLnNldFZhbHVlQXRUaW1lKHZhbHVlLHRpbWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoYXVkaW9QYXJhbSx2YWx1ZSx0aW1lKXtcclxuXHRhdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHZhbHVlLHRpbWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZShhdWRpb1BhcmFtLHZhbHVlLHRpbWUpe1xyXG5cdGF1ZGlvUGFyYW0ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodmFsdWUsdGltZSk7XHJcbn1cclxuXHJcbmNvbnN0IGNvbW1hbmRGdW5jcyA9W1xyXG4gIHNldFZhbHVlQXRUaW1lLFxyXG4gIGxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lLFxyXG4gIGV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWVcclxuXTtcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQ29tbWFuZCB7XHJcblx0Y29uc3RydWN0b3IocGl0Y2hDb21tYW5kID0gQ29tbWFuZFR5cGUuc2V0VmFsdWVBdFRpbWUsdmVsb2NpdHlDb21tYW5kID0gQ29tbWFuZFR5cGUuc2V0VmFsdWVBdFRpbWUpXHJcblx0e1xyXG4gICAgdGhpcy5waXRjaENvbW1hbmQgPSBwaXRjaENvbW1hbmQ7XHJcbiAgICB0aGlzLnZlbG9jaXR5Q29tbWFuZCA9IHZlbG9jaXR5Q29tbWFuZDtcclxuXHRcdHRoaXMucHJvY2Vzc1BpdGNoID0gY29tbWFuZEZ1bmNzW3BpdGNoQ29tbWFuZF0uYmluZCh0aGlzKTtcclxuXHRcdHRoaXMucHJvY2Vzc1ZlbG9jaXR5ID0gY29tbWFuZEZ1bmNzW3ZlbG9jaXR5Q29tbWFuZF0uYmluZCh0aGlzKTtcclxuXHR9XHJcbiAgXHJcbiAgdG9KU09OKClcclxuICB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBwaXRjaENvbW1hbmQ6dGhpcy5waXRjaENvbW1hbmQsXHJcbiAgICAgIHZlbG9jaXR5Q29tbWFuZDp0aGlzLnZlbG9jaXR5Q29tbWFuZFxyXG4gICAgfTtcclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21KU09OKG8pe1xyXG4gICAgcmV0dXJuIG5ldyBDb21tYW5kKG8ucGl0Y2hDb21tYW5kLG8udmVsb2NpdHlDb21tYW5kKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBFdmVudFR5cGUgID0ge1xyXG5cdE5vdGU6MCxcclxuXHRNZWFzdXJlOjEsXHJcblx0VHJhY2tFbmQ6MlxyXG59XHJcblxyXG4vLyDlsI/nr4Dnt5pcclxuZXhwb3J0IGNsYXNzIE1lYXN1cmUgZXh0ZW5kcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigwKTtcclxuXHRcdHRoaXMudHlwZSA9IEV2ZW50VHlwZS5NZWFzdXJlO1xyXG4gICAgdGhpcy5zdGVwVG90YWwgPSAwO1xyXG4gICAgdGhpcy5zdGFydEluZGV4ID0gMDtcclxuICAgIHRoaXMuZW5kSW5kZXggPSAwO1xyXG5cdH1cclxuICBcclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6J01lYXN1cmUnLFxyXG4gICAgICBtZWFzdXJlOnRoaXMubWVhc3VyZSxcclxuICAgICAgc3RlcE5vOnRoaXMuc3RlcE5vLFxyXG4gICAgICBzdGVwOnRoaXMuc3RlcCxcclxuICAgICAgdHlwZTp0aGlzLnR5cGUsXHJcbiAgICAgIHN0ZXBUb3RhbDp0aGlzLnN0ZXBUb3RhbCxcclxuICAgICAgc3RhcnRJbmRleDp0aGlzLnN0YXJ0SW5kZXgsXHJcbiAgICAgIGVuZEluZGV4OnRoaXMuZW5kSW5kZXhcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tSlNPTihvKXtcclxuICAgIGxldCByZXQgPSBuZXcgTWVhc3VyZSgpO1xyXG4gICAgcmV0Lm1lYXN1cmUgPSBvLm1lYXN1cmU7XHJcbiAgICByZXQuc3RlcE5vID0gby5zdGVwTm87XHJcbiAgICByZXQuc3RlcCA9IG8uc3RlcDtcclxuICAgIHJldC5zdGVwVG90YWwgPSBvLnN0ZXBUb3RhbDtcclxuICAgIHJldC5zdGFydEluZGV4ID0gby5zdGFydEluZGV4O1xyXG4gICAgcmV0LmVuZEluZGV4ID0gby5lbmRJbmRleDtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG4gIGNsb25lKCl7XHJcbiAgICByZXR1cm4gbmV3IE1lYXN1cmUoKTtcclxuICB9XHJcbiAgXHJcbiAgcHJvY2Vzcygpe1xyXG4gICAgXHJcbiAgfVxyXG59XHJcblxyXG4vLyBUcmFjayBFbmRcclxuZXhwb3J0IGNsYXNzIFRyYWNrRW5kIGV4dGVuZHMgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoMCk7XHJcblx0XHR0aGlzLnR5cGUgPSBFdmVudFR5cGUuVHJhY2tFbmQ7XHJcblx0fVxyXG4gIHByb2Nlc3MoKXtcclxuICAgIFxyXG4gIH1cclxuXHRcclxufVxyXG5cclxudmFyIE5vdGVzID0gW1xyXG5cdCdDICcsXHJcblx0J0MjJyxcclxuXHQnRCAnLFxyXG5cdCdEIycsXHJcblx0J0UgJyxcclxuXHQnRiAnLFxyXG5cdCdGIycsXHJcblx0J0cgJyxcclxuXHQnRyMnLFxyXG5cdCdBICcsXHJcblx0J0EjJyxcclxuXHQnQiAnLFxyXG5dO1xyXG5cclxuZXhwb3J0IGNsYXNzIE5vdGVFdmVudCBleHRlbmRzIEV2ZW50QmFzZSB7XHJcblx0Y29uc3RydWN0b3Ioc3RlcCA9IDAsbm90ZSA9IDAsZ2F0ZSA9IDAsdmVsID0gMC41LGNvbW1hbmQgPSBuZXcgQ29tbWFuZCgpKXtcclxuXHRcdHN1cGVyKHN0ZXApO1xyXG5cdFx0dGhpcy50cmFuc3Bvc2VfID0gMC4wO1xyXG5cdFx0dGhpcy5ub3RlID0gbm90ZTtcclxuXHRcdHRoaXMuZ2F0ZSA9IGdhdGU7XHJcblx0XHR0aGlzLnZlbCA9IHZlbDtcclxuXHRcdHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XHJcblx0XHR0aGlzLmNvbW1hbmQuZXZlbnQgPSB0aGlzO1xyXG5cdFx0dGhpcy50eXBlID0gRXZlbnRUeXBlLk5vdGU7XHJcblx0XHR0aGlzLnNldE5vdGVOYW1lKCk7XHJcblx0fVxyXG5cdFxyXG4gICB0b0pTT04oKXtcclxuICAgICByZXR1cm4ge1xyXG4gICAgICAgbmFtZTonTm90ZUV2ZW50JyxcclxuICAgICAgIG1lYXN1cmU6dGhpcy5tZWFzdXJlLFxyXG4gICAgICAgc3RlcE5vOnRoaXMuc3RlcE5vLFxyXG4gICAgICAgc3RlcDp0aGlzLnN0ZXAsXHJcbiAgICAgICBub3RlOnRoaXMubm90ZSxcclxuICAgICAgIGdhdGU6dGhpcy5nYXRlLFxyXG4gICAgICAgdmVsOnRoaXMudmVsLFxyXG4gICAgICAgY29tbWFuZDp0aGlzLmNvbW1hbmQsXHJcbiAgICAgICB0eXBlOnRoaXMudHlwZVxyXG4gICAgIH1cclxuICAgfVxyXG4gICBcclxuICAgc3RhdGljIGZyb21KU09OKG8pe1xyXG4gICAgIGxldCByZXQgPSBuZXcgTm90ZUV2ZW50KG8uc3RlcCxvLm5vdGUsby5nYXRlLG8udmVsLENvbW1hbmQuZnJvbUpTT04oby5jb21tYW5kKSk7XHJcbiAgICAgcmV0Lm1lYXN1cmUgPSBvLm1lYXN1cmU7XHJcbiAgICAgcmV0LnN0ZXBObyA9IG8uc3RlcE5vO1xyXG4gICAgIHJldHVybiByZXQ7XHJcbiAgIH1cclxuICBcclxuICBjbG9uZSgpe1xyXG4gICAgcmV0dXJuIG5ldyBOb3RlRXZlbnQodGhpcy5zdGVwLHRoaXMubm90ZSx0aGlzLmdhdGUsdGhpcy52ZWwsdGhpcy5jb21tYW5kKTtcclxuICB9XHJcbiAgXHJcblx0c2V0Tm90ZU5hbWUoKXtcclxuXHRcdFx0bGV0IG9jdCA9IHRoaXMubm90ZSAvIDEyIHwgMDtcclxuXHRcdFx0dGhpcy5uYW1lID0gTm90ZXNbdGhpcy5ub3RlICUgMTJdICsgb2N0O1xyXG5cdH1cclxuXHJcblx0c2V0Tm90ZU5hbWVUb05vdGUobm90ZU5hbWUsZGVmYXVsdE5vdGVOYW1lID0gXCJcIilcclxuXHR7XHJcbiAgICB2YXIgbWF0Y2hlcyA9IG5vdGVOYW1lLm1hdGNoKC8oQyMpfChDKXwoRCMpfChEKXwoRSl8KEYjKXwoRil8KEcjKXwoRyl8KEEjKXwoQSl8KEIpL2kpO1xyXG5cdFx0aWYobWF0Y2hlcylcclxuXHRcdHtcclxuICAgICAgdmFyIG4gPSBtYXRjaGVzWzBdO1xyXG4gICAgICB2YXIgZ2V0TnVtYmVyID0gbmV3IFJlZ0V4cCgnKFswLTldezEsMn0pJyk7XHJcbi8vICAgICAgZ2V0TnVtYmVyLmNvbXBpbGUoKTtcclxuICAgICAgZ2V0TnVtYmVyLmV4ZWMobm90ZU5hbWUpO1xyXG4gICAgICB2YXIgbyA9IFJlZ0V4cC4kMTtcclxuICAgICAgaWYoIW8pe1xyXG4gICAgICAgIChuZXcgUmVnRXhwKCcoWzAtOV17MSwyfSknKSkuZXhlYyhkZWZhdWx0Tm90ZU5hbWUpOyAgICAgICAgXHJcbiAgICAgICAgbyA9IFJlZ0V4cC4kMTtcclxuICAgICAgICBpZighbyl7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmKG4ubGVuZ3RoID09PSAxKSBuICs9ICcgJztcclxuICAgICAgXHJcbiAgICAgIGlmKE5vdGVzLnNvbWUoKGQsaSk9PntcclxuICAgICAgICAgIGlmKGQgPT09IG4pe1xyXG4gICAgICAgICAgICB0aGlzLm5vdGUgPSBwYXJzZUZsb2F0KGkpICsgcGFyc2VGbG9hdChvKSAqIDEyO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cdFx0XHRcdFxyXG4gICAgICAgICB9KSlcclxuICAgICAge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc2V0Tm90ZU5hbWUoKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHRcdH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc2V0Tm90ZU5hbWUoKTtcclxuICAgICAgcmV0dXJuIGZhbHNlOyBcclxuICAgIH1cclxuXHR9XHJcblx0XHJcblx0Z2V0IG5vdGUgKCl7XHJcblx0XHQgcmV0dXJuIHRoaXMubm90ZV87XHJcblx0fVxyXG5cdFxyXG5cdHNldCBub3RlKHYpe1xyXG5cdFx0IHRoaXMubm90ZV8gPSB2O1xyXG5cdFx0IHRoaXMuY2FsY1BpdGNoKCk7XHJcblx0XHQgdGhpcy5zZXROb3RlTmFtZSgpO1xyXG5cdH1cclxuXHRcclxuXHRzZXQgdHJhbnNwb3NlKHYpe1xyXG5cdFx0aWYodiAhPSB0aGlzLnRyYW5zcG9zZV8pe1xyXG5cdFx0XHR0aGlzLnRyYW5zcG9zZV8gPSB2O1xyXG5cdFx0XHR0aGlzLmNhbGNQaXRjaCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRjYWxjUGl0Y2goKXtcclxuXHRcdHRoaXMucGl0Y2ggPSAoNDQwLjAgLyAzMi4wKSAqIChNYXRoLnBvdygyLjAsKCh0aGlzLm5vdGUgKyB0aGlzLnRyYW5zcG9zZV8gLSA5KSAvIDEyKSkpO1xyXG5cdH1cclxuXHRcclxuXHRwcm9jZXNzKHRpbWUsdHJhY2spe1xyXG5cdFx0XHRpZih0aGlzLm5vdGUpe1xyXG5cdFx0XHRcdHRoaXMudHJhbnNvcHNlID0gdHJhY2sudHJhbnNwb3NlO1xyXG5cdFx0XHRcdGZvcihsZXQgaiA9IDAsamUgPSB0cmFjay5waXRjaGVzLmxlbmd0aDtqIDwgamU7KytqKXtcclxuXHRcdFx0XHRcdHRyYWNrLnBpdGNoZXNbal0ucHJvY2Vzcyh0aGlzLmNvbW1hbmQsdGhpcy5waXRjaCx0aW1lKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0Zm9yKGxldCBqID0gMCxqZSA9IHRyYWNrLnZlbG9jaXRpZXMubGVuZ3RoO2ogPCBqZTsrK2ope1xyXG5cdFx0XHRcdFx0Ly8ga2V5b25cclxuXHRcdFx0XHRcdHRyYWNrLnZlbG9jaXRpZXNbal0ucHJvY2Vzcyh0aGlzLmNvbW1hbmQsdGhpcy52ZWwsdGltZSk7XHJcblx0XHRcdFx0XHQvLyBrZXlvZmZcclxuXHRcdFx0XHRcdHRyYWNrLnZlbG9jaXRpZXNbal0ucHJvY2Vzcyh0aGlzLmNvbW1hbmQsMCx0aW1lICsgdGhpcy5nYXRlICogdHJhY2suc2VxdWVuY2VyLnN0ZXBUaW1lXyApO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdH1cclxufVxyXG5cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgVHJhY2sgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKHNlcXVlbmNlcil7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5ldmVudHMgPSBbXTtcclxuXHRcdHRoaXMucG9pbnRlciA9IDA7XHJcblx0XHR0aGlzLmV2ZW50cy5wdXNoKG5ldyBUcmFja0VuZCgpKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdzdGVwJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnZW5kJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnbmFtZScpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3RyYW5zcG9zZScpO1xyXG5cdFx0XHJcblx0XHR0aGlzLnN0ZXAgPSAwO1xyXG5cdFx0dGhpcy5lbmQgPSBmYWxzZTtcclxuXHRcdHRoaXMucGl0Y2hlcyA9IFtdO1xyXG5cdFx0dGhpcy52ZWxvY2l0aWVzID0gW107XHJcblx0XHR0aGlzLnNlcXVlbmNlciA9IHNlcXVlbmNlcjtcclxuXHRcdHRoaXMubmFtZSA9ICcnO1xyXG5cdFx0dGhpcy50cmFuc3Bvc2UgPSAwO1xyXG5cdH1cclxuXHRcclxuICB0b0pTT04oKVxyXG4gIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6J1RyYWNrJyxcclxuICAgICAgZXZlbnRzOnRoaXMuZXZlbnRzLFxyXG4gICAgICBzdGVwOnRoaXMuc3RlcCxcclxuICAgICAgdHJhY2tOYW1lOnRoaXMubmFtZSxcclxuICAgICAgdHJhbnNwb3NlOnRoaXMudHJhbnNwb3NlXHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUpTT04obyxzZXF1ZW5jZXIpXHJcbiAge1xyXG4gICAgbGV0IHJldCA9IG5ldyBUcmFjayhzZXF1ZW5jZXIpO1xyXG4gICAgcmV0LnN0ZXAgPSBvLnN0ZXA7XHJcbiAgICByZXQubmFtZSA9IG8udHJhY2tOYW1lO1xyXG4gICAgcmV0LnRyYW5zcG9zZSA9IG8udHJhbnNwb3NlO1xyXG4gICAgby5ldmVudHMuZm9yRWFjaChmdW5jdGlvbihkKXtcclxuICAgICAgc3dpdGNoKGQudHlwZSl7XHJcbiAgICAgICAgY2FzZSBFdmVudFR5cGUuTm90ZTpcclxuICAgICAgICAgIHJldC5hZGRFdmVudChOb3RlRXZlbnQuZnJvbUpTT04oZCkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBFdmVudFR5cGUuTWVhc3VyZTpcclxuICAgICAgICAgIHJldC5hZGRFdmVudChNZWFzdXJlLmZyb21KU09OKGQpKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgRXZlbnRUeXBlLlRyYWNrRW5kOlxyXG4gICAgICAgIC8v5L2V44KC44GX44Gq44GEXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcbiAgXHJcblx0YWRkRXZlbnQoZXYpe1xyXG5cdFx0aWYodGhpcy5ldmVudHMubGVuZ3RoID4gMSlcclxuXHRcdHtcclxuXHRcdFx0dmFyIGJlZm9yZSA9IHRoaXMuZXZlbnRzW3RoaXMuZXZlbnRzLmxlbmd0aCAtIDJdO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGV2Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk1lYXN1cmU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlICsgMTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRldi5zdGVwTm8gPSAxO1xyXG5cdFx0XHRldi5tZWFzdXJlID0gMTtcclxuXHRcdH1cclxuXHRcdHRoaXMuZXZlbnRzLnNwbGljZSh0aGlzLmV2ZW50cy5sZW5ndGggLSAxLDAsZXYpO1xyXG4gICAgdGhpcy5jYWxjTWVhc3VyZVN0ZXBUb3RhbCh0aGlzLmV2ZW50cy5sZW5ndGggLSAyKTtcclxuXHR9XHJcblx0XHJcblx0aW5zZXJ0RXZlbnQoZXYsaW5kZXgpe1xyXG5cdFx0aWYodGhpcy5ldmVudHMubGVuZ3RoID4gMSAmJiBpbmRleCAhPSAwKXtcclxuXHRcdFx0dmFyIGJlZm9yZSA9IHRoaXMuZXZlbnRzW2luZGV4LTFdO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGV2Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG5cdFx0XHRcdFx0ZXYuc3RlcE5vID0gMTtcclxuXHRcdFx0XHRcdGV2Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZSArIDE7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGV2LnN0ZXBObyA9IDE7XHJcblx0XHRcdGV2Lm1lYXN1cmUgPSAxO1xyXG4gICAgfVxyXG5cdFx0dGhpcy5ldmVudHMuc3BsaWNlKGluZGV4LDAsZXYpO1xyXG5cdFx0aWYoZXYudHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSl7XHJcblx0XHRcdHRoaXMudXBkYXRlU3RlcEFuZE1lYXN1cmUoaW5kZXgpO1x0XHRcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMudXBkYXRlU3RlcChpbmRleCk7XHRcdFxyXG4gICAgfVxyXG4gICAgdGhpcy5jYWxjTWVhc3VyZVN0ZXBUb3RhbChpbmRleCk7XHJcblx0fVxyXG4gICAgXHJcblx0dXBkYXRlU3RlcChpbmRleCl7XHJcblx0XHRmb3IobGV0IGkgPSBpbmRleCArIDEsZSA9IHRoaXMuZXZlbnRzLmxlbmd0aDtpPGU7KytpKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgYmVmb3JlID0gdGhpcy5ldmVudHNbaS0xXTtcclxuXHRcdFx0bGV0IGN1cnJlbnQgPSB0aGlzLmV2ZW50c1tpXTtcclxuXHRcdFx0c3dpdGNoKGJlZm9yZS50eXBlKXtcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5Ob3RlOlxyXG5cdFx0XHRcdFx0Y3VycmVudC5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGN1cnJlbnQubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTWVhc3VyZTpcclxuICAgICAgICAgIGJyZWFrO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHRcdFx0XHJcblx0XHR9XHJcblx0fVx0XHJcbiAgXHJcblx0dXBkYXRlU3RlcEFuZE1lYXN1cmUoaW5kZXgpe1xyXG5cdFx0Zm9yKGxldCBpID0gaW5kZXggKyAxLGUgPSB0aGlzLmV2ZW50cy5sZW5ndGg7aTxlOysraSlcclxuXHRcdHtcclxuXHRcdFx0bGV0IGJlZm9yZSA9IHRoaXMuZXZlbnRzW2ktMV07XHJcblx0XHRcdGxldCBjdXJyZW50ID0gdGhpcy5ldmVudHNbaV07XHJcblx0XHRcdHN3aXRjaChiZWZvcmUudHlwZSl7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTm90ZTpcclxuXHRcdFx0XHRcdGN1cnJlbnQuc3RlcE5vID0gYmVmb3JlLnN0ZXBObyArIDE7XHJcblx0XHRcdFx0XHRjdXJyZW50Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG5cdFx0XHRcdFx0Y3VycmVudC5zdGVwTm8gPSAxO1xyXG5cdFx0XHRcdFx0Y3VycmVudC5tZWFzdXJlID0gYmVmb3JlLm1lYXN1cmUgKyAxO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHRcdFx0XHJcblx0XHR9XHJcblx0fVxyXG4gIFxyXG4gIGNhbGNNZWFzdXJlU3RlcFRvdGFsKGluZGV4KXtcclxuICAgIGxldCBpbmRleEFmdGVyID0gaW5kZXggKzE7XHJcbiAgICBsZXQgZXZlbnRzID0gdGhpcy5ldmVudHM7XHJcbiAgICBsZXQgc3RlcFRvdGFsID0gMDtcclxuICAgIGxldCBldmVudCA9IGV2ZW50c1tpbmRleF07XHJcbiAgICAvLyDmjL/lhaXjgZfjgZ/jg6Hjgrjjg6Pjg7zjga5zdGVwVG90YWzjgpLoo5zmraNcclxuICAgIGlmKGV2ZW50LnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpe1xyXG4gICAgICAtLWluZGV4O1xyXG4gICAgICB3aGlsZShpbmRleCA+PSAwKXtcclxuICAgICAgICBsZXQgZXYgPSBldmVudHNbaW5kZXhdO1xyXG4gICAgICAgIGlmKGV2LnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHN0ZXBUb3RhbCArPSAgZXYuc3RlcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLS1pbmRleDtcclxuICAgICAgfVxyXG4gICAgICBldmVudC5zdGVwVG90YWwgPSBzdGVwVG90YWw7XHJcbiAgICAgIC8vIOW+jOe2muOBruODoeOCuOODo+ODvOOBrnN0ZXBUb3RhbOOCkuijnOato1xyXG4gICAgICBzdGVwVG90YWwgPSAwO1xyXG4gICAgICBpZihpbmRleEFmdGVyID49IChldmVudHMubGVuZ3RoIC0xKSlcclxuICAgICAge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBpZihldmVudHNbaW5kZXhBZnRlcl0udHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSl7XHJcbiAgICAgICAgZXZlbnRzW2luZGV4QWZ0ZXJdLnN0ZXBUb3RhbCA9IDA7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlKGluZGV4QWZ0ZXIgPCAoZXZlbnRzLmxlbmd0aCAtIDEpIClcclxuICAgICAge1xyXG4gICAgICAgIGlmKGV2ZW50c1tpbmRleEFmdGVyXS50eXBlICE9IEV2ZW50VHlwZS5NZWFzdXJlKXtcclxuICAgICAgICAgIHN0ZXBUb3RhbCArPSBldmVudHNbaW5kZXhBZnRlcisrXS5zdGVwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBldmVudHNbaW5kZXhBZnRlcl0uc3RlcFRvdGFsID0gc3RlcFRvdGFsO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIOS4gOOBpOWJjeOBruODoeOCuOODo+ODvOOCkuaOouOBmVxyXG4gICAgICBsZXQgc3RhcnRJbmRleCA9IDA7XHJcbiAgICAgIGlmKGluZGV4ID09IDApe1xyXG4gICAgICAgIHN0YXJ0SW5kZXggPSAwO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHN0YXJ0SW5kZXggPSBpbmRleDtcclxuICAgICAgICB3aGlsZShzdGFydEluZGV4ID4gMCl7XHJcbiAgICAgICAgICAtLXN0YXJ0SW5kZXg7XHJcbiAgICAgICAgICBpZih0aGlzLmV2ZW50c1tzdGFydEluZGV4XS50eXBlID09IEV2ZW50VHlwZS5NZWFzdXJlKVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICArK3N0YXJ0SW5kZXg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzdGVwVG90YWwgPSAwO1xyXG4gICAgICB3aGlsZSh0aGlzLmV2ZW50c1tzdGFydEluZGV4XS50eXBlID09IEV2ZW50VHlwZS5Ob3RlKVxyXG4gICAgICB7XHJcbiAgICAgICAgc3RlcFRvdGFsICs9IHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnN0ZXA7ICAgICAgICBcclxuICAgICAgICArK3N0YXJ0SW5kZXg7XHJcbiAgICAgIH0gIFxyXG4gICAgICBpZih0aGlzLmV2ZW50c1tzdGFydEluZGV4XS50eXBlID09IEV2ZW50VHlwZS5NZWFzdXJlKXtcclxuICAgICAgICB0aGlzLmV2ZW50c1tzdGFydEluZGV4XS5zdGVwVG90YWwgPSBzdGVwVG90YWw7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIOOCpOODmeODs+ODiOOBruWJiumZpCAgXHJcbiAgZGVsZXRlRXZlbnQoaW5kZXgpe1xyXG4gICAgdmFyIGV2ID0gdGhpcy5ldmVudHNbaW5kZXhdO1xyXG4gICAgdGhpcy5ldmVudHMuc3BsaWNlKGluZGV4LDEpO1xyXG4gICAgaWYoaW5kZXggPT0gMCl7XHJcbiAgICAgIHRoaXMuZXZlbnRzWzBdLm1lYXN1cmUgPSAxO1xyXG4gICAgICB0aGlzLmV2ZW50c1swXS5zdGVwTm8gPSAxO1xyXG4gICAgICBpZih0aGlzLmV2ZW50cy5sZW5ndGggPiAxKXtcclxuICAgICAgICBzd2l0Y2goZXYudHlwZSl7XHJcbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5ub3RlOlxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0ZXAoMSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuTWVhc3VyZTpcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGVwQW5kTWVhc3VyZSgxKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYoaW5kZXggPD0gKHRoaXMuZXZlbnRzLmxlbmd0aCAtIDEpKVxyXG4gICAge1xyXG4gICAgICAgIHN3aXRjaChldi50eXBlKXtcclxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RlcChpbmRleCAtIDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLk1lYXN1cmU6XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RlcEFuZE1lYXN1cmUoaW5kZXggLSAxKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5jYWxjTWVhc3VyZVN0ZXBUb3RhbChpbmRleCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgU0VRX1NUQVRVUyA9IHtcclxuXHRTVE9QUEVEOjAsXHJcblx0UExBWUlORzoxLFxyXG5cdFBBVVNFRDoyXHJcbn0gO1xyXG5cclxuZXhwb3J0IGNvbnN0IE5VTV9PRl9UUkFDS1MgPSA0O1xyXG5cclxuZXhwb3J0IGNsYXNzIFNlcXVlbmNlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHRcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdicG0nKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCd0cGInKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdiZWF0Jyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywnYmFyJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywncmVwZWF0Jyk7XHJcblxyXG5cdFx0dGhpcy5icG0gPSAxMjAuMDsgLy8gdGVtcG9cclxuICAgIFxyXG5cdFx0dGhpcy50cGIgPSA5Ni4wOyAvLyDlm5vliIbpn7PnrKbjga7op6Plg4/luqZcclxuXHRcdHRoaXMuYmVhdCA9IDQ7XHJcblx0XHR0aGlzLmJhciA9IDQ7IC8vIFxyXG5cdFx0dGhpcy5yZXBlYXQgPSBmYWxzZTtcclxuXHRcdHRoaXMudHJhY2tzID0gW107XHJcblx0XHR0aGlzLm51bWJlck9mSW5wdXRzID0gMDtcclxuXHRcdHRoaXMubnVtYmVyT2ZPdXRwdXRzID0gMDtcclxuXHRcdHRoaXMubmFtZSA9ICdTZXF1ZW5jZXInO1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7aSA8IE5VTV9PRl9UUkFDS1M7KytpKVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzLnRyYWNrcy5wdXNoKG5ldyBUcmFjayh0aGlzKSk7XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ2cnXSA9IG5ldyBhdWRpby5QYXJhbVZpZXcobnVsbCwndHJrJyArIGkgKyAnZycsdHJ1ZSk7XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ2cnXS50cmFjayA9IHRoaXMudHJhY2tzW2ldO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdnJ10udHlwZSA9ICdnYXRlJztcclxuXHRcdFx0XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ3AnXSA9IG5ldyBhdWRpby5QYXJhbVZpZXcobnVsbCwndHJrJyArIGkgKyAncCcsdHJ1ZSk7XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ3AnXS50cmFjayA9IHRoaXMudHJhY2tzW2ldO1xyXG5cdFx0XHR0aGlzWyd0cmsnICsgaSArICdwJ10udHlwZSA9ICdwaXRjaCc7XHJcblx0XHR9XHJcblx0XHR0aGlzLnN0YXJ0VGltZV8gPSAwO1xyXG5cdFx0dGhpcy5jdXJyZW50VGltZV8gPSAwO1xyXG5cdFx0dGhpcy5jdXJyZW50TWVhc3VyZV8gPSAwO1xyXG5cdFx0dGhpcy5jYWxjU3RlcFRpbWUoKTtcclxuXHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuU1RPUFBFRDtcclxuXHJcblx0XHQvL1xyXG5cdFx0dGhpcy5vbignYnBtX2NoYW5nZWQnLCgpPT57dGhpcy5jYWxjU3RlcFRpbWUoKTt9KTtcclxuXHRcdHRoaXMub24oJ3RwYl9jaGFuZ2VkJywoKT0+e3RoaXMuY2FsY1N0ZXBUaW1lKCk7fSk7XHJcblxyXG5cdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMucHVzaCh0aGlzKTtcclxuXHRcdGlmKFNlcXVlbmNlci5hZGRlZCl7XHJcblx0XHRcdFNlcXVlbmNlci5hZGRlZCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOidTZXF1ZW5jZXInLFxyXG4gICAgICBicG06dGhpcy5icG0sXHJcbiAgICAgIHRwYjp0aGlzLnRwYixcclxuICAgICAgYmVhdDp0aGlzLmJlYXQsXHJcbiAgICAgIGJhcjp0aGlzLmJhcixcclxuICAgICAgdHJhY2tzOnRoaXMudHJhY2tzLFxyXG4gICAgICByZXBlYXQ6dGhpcy5yZXBlYXRcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgc3RhdGljIGZyb21KU09OKG8pXHJcbiAge1xyXG4gICAgbGV0IHJldCA9IG5ldyBTZXF1ZW5jZXIoKTtcclxuICAgIHJldC5icG0gPSBvLmJwbTtcclxuICAgIHJldC50cGIgPSBvLnRwYjtcclxuICAgIHJldC5iZWF0ID0gby5iZWF0O1xyXG4gICAgcmV0LmJhciA9IG8uYmFyO1xyXG4gICAgcmV0LnRyYWNrcy5sZW5ndGggPSAwO1xyXG4gICAgby50cmFja3MuZm9yRWFjaChmdW5jdGlvbihkKXtcclxuICAgICAgcmV0LnRyYWNrcy5wdXNoKFRyYWNrLmZyb21KU09OKGQpKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHJldDtcclxuICB9XHJcblxyXG5cdGRpc3Bvc2UoKXtcclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aDsrK2kpXHJcblx0XHR7XHJcblx0XHRcdGlmKHRoaXMgPT09IFNlcXVlbmNlci5zZXF1ZW5jZXJzW2ldKXtcclxuXHRcdFx0XHQgU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3BsaWNlKGksMSk7XHJcblx0XHRcdFx0IGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLmxlbmd0aCA9PSAwKVxyXG5cdFx0e1xyXG5cdFx0XHRpZihTZXF1ZW5jZXIuZW1wdHkpe1xyXG5cdFx0XHRcdFNlcXVlbmNlci5lbXB0eSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGNhbGNTdGVwVGltZSgpe1xyXG5cdFx0dGhpcy5zdGVwVGltZV8gPSA2MC4wIC8gKCB0aGlzLmJwbSAqIHRoaXMudHBiKTsgXHJcblx0fVxyXG5cdFxyXG5cdHN0YXJ0KHRpbWUpe1xyXG5cdFx0aWYodGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuU1RPUFBFRCB8fCB0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QQVVTRUQgKXtcclxuXHRcdFx0dGhpcy5jdXJyZW50VGltZV8gPSB0aW1lIHx8IGF1ZGlvLmN0eC5jdXJyZW50VGltZSgpO1xyXG5cdFx0XHR0aGlzLnN0YXJ0VGltZV8gID0gdGhpcy5jdXJyZW50VGltZV87XHJcblx0XHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuUExBWUlORztcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0c3RvcCgpe1xyXG5cdFx0aWYodGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUExBWUlORyB8fCB0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QQVVTRUQpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMudHJhY2tzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5waXRjaGVzLmZvckVhY2goKHApPT57XHJcblx0XHRcdFx0XHRwLnN0b3AoKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRkLnZlbG9jaXRpZXMuZm9yRWFjaCgodik9PntcclxuXHRcdFx0XHRcdHYuc3RvcCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0XHJcblx0XHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuU1RPUFBFRDtcclxuXHRcdFx0dGhpcy5yZXNldCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cGF1c2UoKXtcclxuXHRcdGlmKHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHR0aGlzLnN0YXR1c18gPSBTRVFfU1RBVFVTLlBBVVNFRDtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0cmVzZXQoKXtcclxuXHRcdHRoaXMuc3RhcnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLnRyYWNrcy5mb3JFYWNoKCh0cmFjayk9PntcclxuXHRcdFx0dHJhY2suZW5kID0gIXRyYWNrLmV2ZW50cy5sZW5ndGg7XHJcblx0XHRcdHRyYWNrLnN0ZXAgPSAwO1xyXG5cdFx0XHR0cmFjay5wb2ludGVyID0gMDtcclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5jYWxjU3RlcFRpbWUoKTtcclxuXHR9XHJcbiAgLy8g44K344O844Kx44Oz44K144O844Gu5Yem55CGXHJcblx0cHJvY2VzcyAodGltZSlcclxuXHR7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IHRpbWUgfHwgYXVkaW8uY3R4LmN1cnJlbnRUaW1lKCk7XHJcblx0XHR2YXIgY3VycmVudFN0ZXAgPSAodGhpcy5jdXJyZW50VGltZV8gIC0gdGhpcy5zdGFydFRpbWVfICsgMC4xKSAvIHRoaXMuc3RlcFRpbWVfO1xyXG5cdFx0bGV0IGVuZGNvdW50ID0gMDtcclxuXHRcdGZvcih2YXIgaSA9IDAsbCA9IHRoaXMudHJhY2tzLmxlbmd0aDtpIDwgbDsrK2kpe1xyXG5cdFx0XHR2YXIgdHJhY2sgPSB0aGlzLnRyYWNrc1tpXTtcclxuXHRcdFx0aWYoIXRyYWNrLmVuZCl7XHJcblx0XHRcdFx0d2hpbGUodHJhY2suc3RlcCA8PSBjdXJyZW50U3RlcCAmJiAhdHJhY2suZW5kICl7XHJcblx0XHRcdFx0XHRpZih0cmFjay5wb2ludGVyID49IHRyYWNrLmV2ZW50cy5sZW5ndGggKXtcclxuXHRcdFx0XHRcdFx0dHJhY2suZW5kID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR2YXIgZXZlbnQgPSB0cmFjay5ldmVudHNbdHJhY2sucG9pbnRlcisrXTtcclxuXHRcdFx0XHRcdFx0dmFyIHBsYXlUaW1lID0gdHJhY2suc3RlcCAqIHRoaXMuc3RlcFRpbWVfICsgdGhpcy5zdGFydFRpbWVfO1xyXG5cdFx0XHRcdFx0XHRldmVudC5wcm9jZXNzKHBsYXlUaW1lLHRyYWNrKTtcclxuXHRcdFx0XHRcdFx0dHJhY2suc3RlcCArPSBldmVudC5zdGVwO1xyXG4vL1x0XHRcdFx0XHRjb25zb2xlLmxvZyh0cmFjay5wb2ludGVyLHRyYWNrLmV2ZW50cy5sZW5ndGgsdHJhY2suZXZlbnRzW3RyYWNrLnBvaW50ZXJdLHRyYWNrLnN0ZXAsY3VycmVudFN0ZXAsdGhpcy5jdXJyZW50VGltZV8scGxheVRpbWUpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHQrK2VuZGNvdW50O1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihlbmRjb3VudCA9PSB0aGlzLnRyYWNrcy5sZW5ndGgpe1xyXG5cdFx0XHR0aGlzLnN0b3AoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g5o6l57aaXHJcblx0Y29ubmVjdChjKXtcclxuXHRcdHZhciB0cmFjayA9IGMuZnJvbS5wYXJhbS50cmFjaztcclxuXHRcdGlmKGMuZnJvbS5wYXJhbS50eXBlID09PSAncGl0Y2gnKXtcclxuXHRcdFx0dHJhY2sucGl0Y2hlcy5wdXNoKFNlcXVlbmNlci5tYWtlUHJvY2VzcyhjKSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0cmFjay52ZWxvY2l0aWVzLnB1c2goU2VxdWVuY2VyLm1ha2VQcm9jZXNzKGMpKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Ly8g5YmK6ZmkXHJcblx0ZGlzY29ubmVjdChjKXtcclxuXHRcdHZhciB0cmFjayA9IGMuZnJvbS5wYXJhbS50cmFjaztcclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRyYWNrLnBpdGNoZXMubGVuZ3RoOysraSl7XHJcblx0XHRcdGlmKGMudG8ubm9kZSA9PT0gdHJhY2sucGl0Y2hlc1tpXS50by5ub2RlICYmIGMudG8ucGFyYW0gPT09IHRyYWNrLnBpdGNoZXNbaV0udG8ucGFyYW0pe1xyXG5cdFx0XHRcdHRyYWNrLnBpdGNoZXMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZvcih2YXIgaSA9IDA7aSA8IHRyYWNrLnZlbG9jaXRpZXMubGVuZ3RoOysraSl7XHJcblx0XHRcdGlmKGMudG8ubm9kZSA9PT0gdHJhY2sudmVsb2NpdGllc1tpXS50by5ub2RlICYmIGMudG8ucGFyYW0gPT09IHRyYWNrLnZlbG9jaXRpZXNbaV0udG8ucGFyYW0pe1xyXG5cdFx0XHRcdHRyYWNrLnBpdGNoZXMuc3BsaWNlKGktLSwxKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0c3RhdGljIG1ha2VQcm9jZXNzKGMpe1xyXG5cdFx0aWYoYy50by5wYXJhbSBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdHJldHVybiAge1xyXG5cdFx0XHRcdHRvOmMudG8sXHJcblx0XHRcdFx0cHJvY2VzczogKGNvbSx2LHQpPT57XHJcblx0XHRcdFx0XHRjLnRvLm5vZGUuYXVkaW9Ob2RlLnByb2Nlc3MoYy50byxjb20sdix0KTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdHN0b3A6ZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRcdGMudG8ubm9kZS5hdWRpb05vZGUuc3RvcChjLnRvKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH07XHJcblx0XHR9IFxyXG5cdFx0dmFyIHByb2Nlc3M7XHJcblx0XHRpZihjLnRvLnBhcmFtLnR5cGUgPT09ICdwaXRjaCcpe1xyXG5cdFx0XHRwcm9jZXNzID0gKGNvbSx2LHQpID0+IHtcclxuXHRcdFx0XHRjb20ucHJvY2Vzc1BpdGNoKGMudG8ucGFyYW0uYXVkaW9QYXJhbSx2LHQpO1xyXG5cdFx0XHR9O1x0XHRcdFx0XHRcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHByb2Nlc3MgPVx0KGNvbSx2LHQpPT57XHJcblx0XHRcdFx0Y29tLnByb2Nlc3NWZWxvY2l0eShjLnRvLnBhcmFtLmF1ZGlvUGFyYW0sdix0KTtcclxuXHRcdFx0fTtcdFx0XHRcdFx0XHJcblx0XHR9XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHR0bzpjLnRvLFxyXG5cdFx0XHRwcm9jZXNzOnByb2Nlc3MsXHJcblx0XHRcdHN0b3A6ZnVuY3Rpb24oKXtcclxuXHRcdFx0XHRjLnRvLnBhcmFtLmF1ZGlvUGFyYW0uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKDApO1xyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGV4ZWMoKVxyXG5cdHtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcpe1xyXG5cdFx0XHR3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKFNlcXVlbmNlci5leGVjKTtcclxuXHRcdFx0bGV0IGVuZGNvdW50ID0gMDtcclxuXHRcdFx0Zm9yKHZhciBpID0gMCxlID0gU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoO2kgPCBlOysraSl7XHJcblx0XHRcdFx0dmFyIHNlcSA9IFNlcXVlbmNlci5zZXF1ZW5jZXJzW2ldO1xyXG5cdFx0XHRcdGlmKHNlcS5zdGF0dXNfID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdFx0XHRzZXEucHJvY2VzcyhhdWRpby5jdHguY3VycmVudFRpbWUpO1xyXG5cdFx0XHRcdH0gZWxzZSBpZihzZXEuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlNUT1BQRUQpe1xyXG5cdFx0XHRcdFx0KytlbmRjb3VudDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0aWYoZW5kY291bnQgPT0gU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0U2VxdWVuY2VyLnN0b3BTZXF1ZW5jZXMoKTtcclxuXHRcdFx0XHRpZihTZXF1ZW5jZXIuc3RvcHBlZCl7XHJcblx0XHRcdFx0XHRTZXF1ZW5jZXIuc3RvcHBlZCgpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDjgrfjg7zjgrHjg7PjgrnlhajkvZPjga7jgrnjgr/jg7zjg4hcclxuXHRzdGF0aWMgc3RhcnRTZXF1ZW5jZXModGltZSl7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5TVE9QUEVEIHx8IFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBBVVNFRCApXHJcblx0XHR7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5zdGFydCh0aW1lKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuUExBWUlORztcclxuXHRcdFx0U2VxdWVuY2VyLmV4ZWMoKTtcclxuXHRcdH1cclxuXHR9XHJcblx0Ly8g44K344O844Kx44Oz44K55YWo5L2T44Gu5YGc5q2iXHJcblx0c3RhdGljIHN0b3BTZXF1ZW5jZXMoKXtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlBMQVlJTkcgfHwgU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUEFVU0VEICl7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5zdG9wKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlNUT1BQRUQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHQvLyDjgrfjg7zjgrHjg7PjgrnlhajkvZPjga7jg53jg7zjgrpcdFxyXG5cdHN0YXRpYyBwYXVzZVNlcXVlbmNlcygpe1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdFx0ZC5wYXVzZSgpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5QQVVTRUQ7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5TZXF1ZW5jZXIuc2VxdWVuY2VycyA9IFtdO1xyXG5TZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlNUT1BQRUQ7IFxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCBVVUlEIGZyb20gJy4vdXVpZC5jb3JlJztcclxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL0V2ZW50RW1pdHRlcjMnO1xyXG5leHBvcnQgY29uc3Qgbm9kZUhlaWdodCA9IDUwO1xyXG5leHBvcnQgY29uc3Qgbm9kZVdpZHRoID0gMTAwO1xyXG5leHBvcnQgY29uc3QgcG9pbnRTaXplID0gMTY7XHJcblxyXG4vLyBwYW5lbCB3aW5kb3dcclxuZXhwb3J0IGNsYXNzIFBhbmVsICBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3Ioc2VsLHByb3Ape1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdGlmKCFwcm9wIHx8ICFwcm9wLmlkKXtcclxuXHRcdFx0cHJvcCA9IHByb3AgPyAocHJvcC5pZCA9ICdpZC0nICsgVVVJRC5nZW5lcmF0ZSgpLHByb3ApIDp7IGlkOidpZC0nICsgVVVJRC5nZW5lcmF0ZSgpfTtcclxuXHRcdH1cclxuXHRcdHRoaXMuaWQgPSBwcm9wLmlkO1xyXG5cdFx0c2VsID0gc2VsIHx8IGQzLnNlbGVjdCgnI2NvbnRlbnQnKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uID0gXHJcblx0XHRzZWxcclxuXHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHQuYXR0cihwcm9wKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywncGFuZWwnKVxyXG5cdFx0LmRhdHVtKHRoaXMpO1xyXG5cclxuXHRcdC8vIOODkeODjeODq+eUqERyYWfjgZ3jga7ku5ZcclxuXHJcblx0XHR0aGlzLmhlYWRlciA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnaGVhZGVyJykuY2FsbCh0aGlzLmRyYWcpO1xyXG5cdFx0dGhpcy5hcnRpY2xlID0gdGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdhcnRpY2xlJyk7XHJcblx0XHR0aGlzLmZvb3RlciA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnZm9vdGVyJyk7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2RpdicpXHJcblx0XHQuY2xhc3NlZCgncGFuZWwtY2xvc2UnLHRydWUpXHJcblx0XHQub24oJ2NsaWNrJywoKT0+e1xyXG5cdFx0XHR0aGlzLmVtaXQoJ2Rpc3Bvc2UnKTtcclxuXHRcdFx0dGhpcy5kaXNwb3NlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0fVx0XHJcblxyXG5cdGdldCBub2RlKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuc2VsZWN0aW9uLm5vZGUoKTtcclxuXHR9XHJcblx0Z2V0IHggKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnbGVmdCcpKTtcclxuXHR9XHJcblx0c2V0IHggKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2xlZnQnLHYgKyAncHgnKTtcclxuXHR9XHJcblx0Z2V0IHkgKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgndG9wJykpO1xyXG5cdH1cclxuXHRzZXQgeSAodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndG9wJyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCB3aWR0aCgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3dpZHRoJykpO1xyXG5cdH1cclxuXHRzZXQgd2lkdGgodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnd2lkdGgnLCB2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCBoZWlnaHQoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdoZWlnaHQnKSk7XHJcblx0fVxyXG5cdHNldCBoZWlnaHQodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnaGVpZ2h0Jyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdFxyXG5cdGRpc3Bvc2UoKXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnJlbW92ZSgpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBudWxsO1xyXG5cdH1cclxuXHRcclxuXHRzaG93KCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScsJ3Zpc2libGUnKTtcclxuXHRcdHRoaXMuZW1pdCgnc2hvdycpO1xyXG5cdH1cclxuXHJcblx0aGlkZSgpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtcclxuXHRcdHRoaXMuZW1pdCgnaGlkZScpO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgaXNTaG93KCl7XHJcblx0XHRyZXR1cm4gdGhpcy5zZWxlY3Rpb24gJiYgdGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknKSA9PT0gJ3Zpc2libGUnO1xyXG5cdH1cclxufVxyXG5cclxuUGFuZWwucHJvdG90eXBlLmRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHRcdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdFx0Y29uc29sZS5sb2coZCk7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KCcjJyArIGQuaWQpO1xyXG5cdFx0XHJcblx0XHRkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHQuYXR0cih7aWQ6J3BhbmVsLWR1bW15LScgKyBkLmlkLFxyXG5cdFx0XHQnY2xhc3MnOidwYW5lbCBwYW5lbC1kdW1teSd9KVxyXG5cdFx0LnN0eWxlKHtcclxuXHRcdFx0bGVmdDpzZWwuc3R5bGUoJ2xlZnQnKSxcclxuXHRcdFx0dG9wOnNlbC5zdHlsZSgndG9wJyksXHJcblx0XHRcdHdpZHRoOnNlbC5zdHlsZSgnd2lkdGgnKSxcclxuXHRcdFx0aGVpZ2h0OnNlbC5zdHlsZSgnaGVpZ2h0JylcclxuXHRcdH0pO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIGR1bW15ID0gZDMuc2VsZWN0KCcjcGFuZWwtZHVtbXktJyArIGQuaWQpO1xyXG5cclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkdW1teS5zdHlsZSgnbGVmdCcpKSArIGQzLmV2ZW50LmR4O1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGR1bW15LnN0eWxlKCd0b3AnKSkgKyBkMy5ldmVudC5keTtcclxuXHRcdFxyXG5cdFx0ZHVtbXkuc3R5bGUoeydsZWZ0Jzp4ICsgJ3B4JywndG9wJzp5ICsgJ3B4J30pO1xyXG5cdH0pXHJcblx0Lm9uKCdkcmFnZW5kJyxmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QoJyMnICsgZC5pZCk7XHJcblx0XHR2YXIgZHVtbXkgPSBkMy5zZWxlY3QoJyNwYW5lbC1kdW1teS0nICsgZC5pZCk7XHJcblx0XHRzZWwuc3R5bGUoXHJcblx0XHRcdHsnbGVmdCc6ZHVtbXkuc3R5bGUoJ2xlZnQnKSwndG9wJzpkdW1teS5zdHlsZSgndG9wJyl9XHJcblx0XHQpO1xyXG5cdFx0ZC5lbWl0KCdkcmFnZW5kJyk7XHJcblx0XHRkdW1teS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHRcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vRXZlbnRFbWl0dGVyMyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVW5kb01hbmFnZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5idWZmZXIgPSBbXTtcclxuXHRcdHRoaXMuaW5kZXggPSAtMTtcclxuXHR9XHJcblx0XHJcblx0Y2xlYXIoKXtcclxuICAgIHRoaXMuYnVmZmVyLmxlbmd0aCA9IDA7XHJcbiAgICB0aGlzLmluZGV4ID0gLTE7XHJcbiAgICB0aGlzLmVtaXQoJ2NsZWFyZWQnKTtcclxuXHR9XHJcblx0XHJcblx0ZXhlYyhjb21tYW5kKXtcclxuICAgIGNvbW1hbmQuZXhlYygpO1xyXG4gICAgaWYgKCh0aGlzLmluZGV4ICsgMSkgPCB0aGlzLmJ1ZmZlci5sZW5ndGgpXHJcbiAgICB7XHJcbiAgICAgIHRoaXMuYnVmZmVyLmxlbmd0aCA9IHRoaXMuaW5kZXggKyAxO1xyXG4gICAgfVxyXG4gICAgdGhpcy5idWZmZXIucHVzaChjb21tYW5kKTtcclxuICAgICsrdGhpcy5pbmRleDtcclxuICAgIHRoaXMuZW1pdCgnZXhlY3V0ZWQnKTtcclxuXHR9XHJcblx0XHJcblx0cmVkbygpe1xyXG4gICAgaWYgKCh0aGlzLmluZGV4ICsgMSkgPCAodGhpcy5idWZmZXIubGVuZ3RoKSlcclxuICAgIHtcclxuICAgICAgKyt0aGlzLmluZGV4O1xyXG4gICAgICB2YXIgY29tbWFuZCA9IHRoaXMuYnVmZmVyW3RoaXMuaW5kZXhdO1xyXG4gICAgICBjb21tYW5kLnJlZG8oKTtcclxuICAgICAgdGhpcy5lbWl0KCdyZWRpZCcpO1xyXG4gICAgICBpZiAoKHRoaXMuaW5kZXggICsgMSkgPT0gdGhpcy5idWZmZXIubGVuZ3RoKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5lbWl0KCdyZWRvRW1wdHknKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cdH1cclxuICB1bmRvKClcclxuICB7XHJcbiAgICBpZiAodGhpcy5idWZmZXIubGVuZ3RoID4gMCAmJiB0aGlzLmluZGV4ID49IDApXHJcbiAgICB7XHJcbiAgICAgIHZhciBjb21tYW5kID0gdGhpcy5idWZmZXJbdGhpcy5pbmRleF07XHJcbiAgICAgIGNvbW1hbmQudW5kbygpO1xyXG4gICAgICAtLXRoaXMuaW5kZXg7XHJcbiAgICAgIHRoaXMuZW1pdCgndW5kaWQnKTtcclxuICAgICAgaWYgKHRoaXMuaW5kZXggPCAwKVxyXG4gICAgICB7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IC0xO1xyXG4gICAgICAgIHRoaXMuZW1pdCgndW5kb0VtcHR5Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblx0XHJcbn1cclxuXHJcbnZhciB1bmRvTWFuYWdlciA9IG5ldyBVbmRvTWFuYWdlcigpO1xyXG5leHBvcnQgZGVmYXVsdCB1bmRvTWFuYWdlcjsiLCIvKlxuIFZlcnNpb246IGNvcmUtMS4wXG4gVGhlIE1JVCBMaWNlbnNlOiBDb3B5cmlnaHQgKGMpIDIwMTIgTGlvc0suXG4qL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVVVJRCgpe31VVUlELmdlbmVyYXRlPWZ1bmN0aW9uKCl7dmFyIGE9VVVJRC5fZ3JpLGI9VVVJRC5faGE7cmV0dXJuIGIoYSgzMiksOCkrXCItXCIrYihhKDE2KSw0KStcIi1cIitiKDE2Mzg0fGEoMTIpLDQpK1wiLVwiK2IoMzI3Njh8YSgxNCksNCkrXCItXCIrYihhKDQ4KSwxMil9O1VVSUQuX2dyaT1mdW5jdGlvbihhKXtyZXR1cm4gMD5hP05hTjozMD49YT8wfE1hdGgucmFuZG9tKCkqKDE8PGEpOjUzPj1hPygwfDEwNzM3NDE4MjQqTWF0aC5yYW5kb20oKSkrMTA3Mzc0MTgyNCooMHxNYXRoLnJhbmRvbSgpKigxPDxhLTMwKSk6TmFOfTtVVUlELl9oYT1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1hLnRvU3RyaW5nKDE2KSxkPWItYy5sZW5ndGgsZT1cIjBcIjswPGQ7ZD4+Pj0xLGUrPWUpZCYxJiYoYz1lK2MpO3JldHVybiBjfTtcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuLi9zcmMvYXVkaW8nO1xyXG5pbXBvcnQge2luaXRVSSxkcmF3LHN2ZyxjcmVhdGVBdWRpb05vZGVWaWV3IH0gZnJvbSAnLi4vc3JjL2RyYXcnO1xyXG5cclxuXHJcbmRlc2NyaWJlKCdBdWRpb05vZGVUZXN0JywgKCkgPT4ge1xyXG4gIFxyXG4gIGF1ZGlvLnNldEN0eChuZXcgQXVkaW9Db250ZXh0KCkpO1xyXG5cdHZhciBvc2MsIGdhaW4sIGZpbHRlciwgb3V0LCBvc2MyLCBzcGxpdHRlciwgbWVyZ2VyLGVnLHNlcTtcclxuXHJcblx0YmVmb3JlRWFjaCgoKSA9PiB7XHJcblxyXG5cdH0pO1xyXG5cclxuXHRpdChcImF1ZGlvLkF1ZGlvTm9kZVZpZXfov73liqBcIiwgKCkgPT4ge1xyXG5cclxuXHRcdG9zYyA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5jcmVhdGVPc2NpbGxhdG9yKCkpO1xyXG5cdFx0b3NjLnggPSAxMDA7XHJcblx0XHRvc2MueSA9IDIwMDtcclxuXHJcblx0XHRnYWluID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZUdhaW4oKSk7XHJcblxyXG5cdFx0Z2Fpbi54ID0gNDAwO1xyXG5cdFx0Z2Fpbi55ID0gMjAwO1xyXG5cclxuXHRcdGZpbHRlciA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5jcmVhdGVCaXF1YWRGaWx0ZXIoKSk7XHJcblx0XHRmaWx0ZXIueCA9IDI1MDtcclxuXHRcdGZpbHRlci55ID0gMzMwO1xyXG5cclxuXHRcdG91dCA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5kZXN0aW5hdGlvbik7XHJcblx0XHRvdXQueCA9IDc1MDtcclxuXHRcdG91dC55ID0gMzAwO1xyXG5cclxuXHJcblx0XHRvc2MyID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZU9zY2lsbGF0b3IoKSk7XHJcblx0XHRvc2MyLnggPSAxMDA7XHJcblx0XHRvc2MyLnkgPSA2MDA7XHJcblxyXG5cdFx0c3BsaXR0ZXIgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguY3JlYXRlQ2hhbm5lbFNwbGl0dGVyKCkpO1xyXG5cdFx0c3BsaXR0ZXIueCA9IDI1MDtcclxuXHRcdHNwbGl0dGVyLnkgPSA2MDA7XHJcblxyXG5cdFx0bWVyZ2VyID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZUNoYW5uZWxNZXJnZXIoKSk7XHJcblx0XHRtZXJnZXIueCA9IDUwMDtcclxuXHRcdG1lcmdlci55ID0gNjAwO1xyXG5cdFx0XHJcblx0XHRlZyA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKG5ldyBhdWRpby5FRygpKTtcclxuXHRcdGVnLnggPSAxMDA7XHJcblx0XHRlZy55ID0gNDAwO1xyXG5cdFx0c2VxID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUobmV3IGF1ZGlvLlNlcXVlbmNlcigpKTtcclxuXHRcdHNlcS54ID0gMjAwO1xyXG5cdFx0c2VxLnkgPSA0MDA7XHJcblxyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGgpLnRvRXF1YWwoOSk7XHJcblx0fSk7XHJcblxyXG5cdGl0KCfjgrPjg43jgq/jgrfjg6fjg7Pov73liqDlvozjg4Hjgqfjg4Pjgq8nLCAoKSA9PiB7XHJcblxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KG9zYywgZmlsdGVyKTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChvc2MsIGdhaW4uaW5wdXRQYXJhbXNbMF0pO1xyXG5cdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoZmlsdGVyLCBnYWluKTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChnYWluLCBvdXQpO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KG1lcmdlciwgb3V0KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMCB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDAgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDEgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAxIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAyIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMyB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMyB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDIgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDUgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiA1IH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiA0IH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogNCB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChvc2MyLCBzcGxpdHRlcik7XHJcblx0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTplZyxwYXJhbTplZy5vdXRwdXR9LHtub2RlOmdhaW4scGFyYW06Z2Fpbi5pbnB1dFBhcmFtc1swXX0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOnNlcSxwYXJhbTpzZXEudHJrMGd9LHtub2RlOmVnLHBhcmFtOmVnLmdhdGV9KTtcclxuXHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aCkudG9FcXVhbCgxNCk7XHJcblx0fSk7XHJcblx0XHRcclxuXHJcblx0aXQoJ+ODjuODvOODieWJiumZpCcsICgpID0+IHtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKG9zYyk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShzZXEpO1xyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGgpLnRvRXF1YWwoNyk7XHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aCkudG9FcXVhbCgxMSk7XHJcblx0XHRleHBlY3QoYXVkaW8uU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoKS50b0VxdWFsKDApOyBcclxuXHR9KTtcclxuXHRcclxuXHRpdCgn44Kz44ON44Kv44K344On44Oz5YmK6ZmkJywoKT0+e1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KHtub2RlOmVnLHBhcmFtOmVnLm91dHB1dH0se25vZGU6Z2FpbixwYXJhbTpnYWluLmlucHV0UGFyYW1zWzBdfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDAgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAwIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAxIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMSB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMiB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDMgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDMgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAyIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiA1IH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogNSB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogNCB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDQgfSk7XHJcblx0XHRcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoKS50b0VxdWFsKDQpO1xyXG5cdH0pO1xyXG5cclxuXHRpdCgn44OV44Kj44Or44K/44O85YmK6Zmk5b6M44OB44Kn44OD44KvJywgKCkgPT4ge1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUoZmlsdGVyKTtcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoKS50b0VxdWFsKDYpO1xyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGgpLnRvRXF1YWwoMyk7XHJcblx0XHRleHBlY3QoKCgpID0+IHtcclxuXHRcdFx0dmFyIHJldCA9IDA7XHJcblx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5mb3JFYWNoKChkKSA9PiB7XHJcblx0XHRcdFx0aWYgKGQuZnJvbS5ub2RlID09PSBmaWx0ZXIgfHwgZC50by5ub2RlID09PSBmaWx0ZXIpIHtcclxuXHRcdFx0XHRcdCsrcmV0O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSk7XHJcblx0XHRcdHJldHVybiByZXQ7XHJcblx0XHR9KSgpKS50b0VxdWFsKDApO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGl0KCfjg47jg7zjg4nlhajliYrpmaQnLCgpPT57XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShlZyk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShnYWluKTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKG91dCk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShzcGxpdHRlcik7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShtZXJnZXIpO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUob3NjMik7XHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aCkudG9FcXVhbCgwKTtcclxuXHR9KTtcclxuXHRcclxuXHRpdCgn5o+P55S744GX44Gm44G/44KLJywoKT0+e1xyXG5cdFx0Ly9cdG9zYy5hdWRpb05vZGUudHlwZSA9ICdzYXd0b290aCc7XHJcblx0XHRcclxuXHRcdHZhciBjb250ZW50ID0gZDMuc2VsZWN0KCdib2R5JykuYXBwZW5kKCdkaXYnKS5hdHRyKCdpZCcsJ2NvbnRlbnQnKS5jbGFzc2VkKCdjb250ZW50Jyx0cnVlKTtcclxuXHRcdHZhciBwbGF5ZXIgPSBjb250ZW50LmFwcGVuZCgnZGl2JykuYXR0cih7aWQ6J3BsYXllcicsY2xhc3M6J3BsYXllcid9KTtcclxuXHRcdHBsYXllci5hcHBlbmQoJ2J1dHRvbicpLmF0dHIoe2lkOidwbGF5JyxjbGFzczoncGxheSd9KS50ZXh0KCfilrwnKTtcclxuXHRcdHBsYXllci5hcHBlbmQoJ2J1dHRvbicpLmF0dHIoe2lkOidzdG9wJyxjbGFzczonc3RvcCd9KS50ZXh0KCfilqAnKTtcclxuXHRcdHBsYXllci5hcHBlbmQoJ2J1dHRvbicpLmF0dHIoe2lkOidwYXVzZScsY2xhc3M6J3BhdXNlJ30pLnRleHQoJ++8nScpO1xyXG5cclxuXHRcdGluaXRVSSgpO1xyXG5cdFx0XHJcblx0XHQvLyDjgrPjg43jgq/jgrfjg6fjg7NcclxuXHRcdFxyXG5cdFx0bGV0IG91dCA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlc1swXTtcclxuXHRcdGxldCBvc2MgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdPc2NpbGxhdG9yJyk7XHJcblx0XHRvc2MueCA9IDQwMDtcclxuXHRcdG9zYy55ID0gMzAwO1xyXG5cdFx0bGV0IGdhaW4gPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdHYWluJyk7XHJcblx0XHRnYWluLnggPSA1NTA7XHJcblx0XHRnYWluLnkgPSAyMDA7XHJcblx0XHRsZXQgc2VxID0gY3JlYXRlQXVkaW9Ob2RlVmlldygnU2VxdWVuY2VyJyk7XHJcblx0XHRzZXEueCA9IDUwO1xyXG5cdFx0c2VxLnkgPSAzMDA7XHJcblx0XHRsZXQgZWcgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdFRycpO1xyXG5cdFx0ZWcueCA9IDIwMDtcclxuXHRcdGVnLnkgPSAyMDA7XHJcblx0XHRcclxuXHRcdC8vIOaOpee2mlxyXG5cdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6c2VxLHBhcmFtOnNlcS50cmswZ30se25vZGU6ZWcscGFyYW06ZWcuZ2F0ZX0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpzZXEscGFyYW06c2VxLnRyazBwfSx7bm9kZTpvc2MscGFyYW06b3NjLmZyZXF1ZW5jeX0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpvc2MscGFyYW06MH0se25vZGU6Z2FpbixwYXJhbTowfSk7XHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOmVnLHBhcmFtOmVnLm91dHB1dH0se25vZGU6Z2FpbixwYXJhbTpnYWluLmdhaW59KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6Z2FpbixwYXJhbTowfSx7bm9kZTpvdXQscGFyYW06MH0pO1x0XHJcblxyXG5cdFx0Ly8g44Kz44ON44Kv44K344On44OzXHJcblx0XHRcclxuXHRcdGxldCBvdXQxID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzWzBdO1xyXG5cdFx0bGV0IG9zYzEgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdPc2NpbGxhdG9yJyk7XHJcblx0XHRvc2MxLnggPSA0MDA7XHJcblx0XHRvc2MxLnkgPSA1MDA7XHJcblx0XHRsZXQgZ2FpbjEgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdHYWluJyk7XHJcblx0XHRnYWluMS54ID0gNTUwO1xyXG5cdFx0Z2FpbjEueSA9IDQwMDtcclxuXHRcdGxldCBlZzEgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdFRycpO1xyXG5cdFx0ZWcxLnggPSAyMDA7XHJcblx0XHRlZzEueSA9IDQwMDtcclxuXHRcdFxyXG5cdFx0Ly8g5o6l57aaXHJcblx0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpzZXEscGFyYW06c2VxLnRyazFnfSx7bm9kZTplZzEscGFyYW06ZWcxLmdhdGV9KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6c2VxLHBhcmFtOnNlcS50cmsxcH0se25vZGU6b3NjMSxwYXJhbTpvc2MxLmZyZXF1ZW5jeX0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpvc2MxLHBhcmFtOjB9LHtub2RlOmdhaW4xLHBhcmFtOjB9KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6ZWcxLHBhcmFtOmVnMS5vdXRwdXR9LHtub2RlOmdhaW4xLHBhcmFtOmdhaW4xLmdhaW59KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6Z2FpbjEscGFyYW06MH0se25vZGU6b3V0LHBhcmFtOjB9KTtcdFxyXG5cclxuXHRcdFxyXG5cdFx0Ly8g44K344O844Kx44Oz44K544OH44O844K/44Gu5oy/5YWlXHJcblx0XHRzZXEuYXVkaW9Ob2RlLmJwbSA9IDEyMDtcclxuXHRcdHNlcS5hdWRpb05vZGUudHJhY2tzWzBdLmV2ZW50cy5wdXNoKG5ldyBhdWRpby5Ob3RlRXZlbnQoNDgsNDcsNiwxLjApKTtcclxuXHRcdGZvcih2YXIgaSA9IDQ4O2k8IDExMDsrK2kpe1xyXG5cdFx0XHRzZXEuYXVkaW9Ob2RlLnRyYWNrc1swXS5ldmVudHMucHVzaChuZXcgYXVkaW8uTm90ZUV2ZW50KDQ4LGksNiwxLjApKTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0c2VxLmF1ZGlvTm9kZS50cmFja3NbMV0uZXZlbnRzLnB1c2gobmV3IGF1ZGlvLk5vdGVFdmVudCgxOTIsMCw2LDEuMCkpO1xyXG5cdFx0Zm9yKHZhciBpID0gNDc7aTwgMTEwOysraSl7XHJcblx0XHRcdHNlcS5hdWRpb05vZGUudHJhY2tzWzFdLmV2ZW50cy5wdXNoKG5ldyBhdWRpby5Ob3RlRXZlbnQoNDgsaSw2LDEuMCkpO1xyXG5cdFx0fVxyXG5cdFx0ZHJhdygpO1xyXG5cdFx0ZXhwZWN0KHRydWUpLnRvQmUodHJ1ZSk7XHJcblx0fSk7XHJcblx0XHJcblx0XHJcblx0XHJcblx0XHJcbn0pOyJdfQ==
