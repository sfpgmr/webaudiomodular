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
      case 'noteName':
        return function () {
          this.on('blur', function (d) {
            d.setNoteNameToNote(this.innerText);
            this.innerText = d.name;
            // NoteNo表示も更新
            this.parentNode.cells[3].innerText = d.note;
          }); // Note
        };
        break;
      case 'note':
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
    ev.playOneshot(track);
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

  function playOneshot() {
    let ev = track.events[rowIndex + currentEventIndex];
    if (ev.type === audio.EventType.Note) {
      ev.playOneshot(track);
    }
  }

  function addRow(delta) {
    playOneshot();
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
		key: 'playOneshot',
		value: function playOneshot(track) {
			if (this.note) {
				this.transopse = track.transpose;
				for (let j = 0, je = track.pitches.length; j < je; ++j) {
					track.pitches[j].process(new Command(), this.pitch, audio.ctx.currentTime);
				}

				for (let j = 0, je = track.velocities.length; j < je; ++j) {
					// keyon
					track.velocities[j].process(new Command(), this.vel, audio.ctx.currentTime);
					// keyoff
					track.velocities[j].process(new Command(), 0, audio.ctx.currentTime + 0.25);
				}
			}
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
			ret.repeat = o.repeat;
			//ret.tracks.length = 0;
			o.tracks.forEach(function (d, i) {
				ret.tracks[i] = Track.fromJSON(d, ret);
				ret['trk' + i + 'g'].track = ret.tracks[i];
				ret['trk' + i + 'p'].track = ret.tracks[i];
			});
			ret.calcStepTime();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXEV2ZW50RW1pdHRlcjMuanMiLCJzcmNcXGF1ZGlvLmpzIiwic3JjXFxhdWRpb05vZGVWaWV3LmpzIiwic3JjXFxkcmF3LmpzIiwic3JjXFxlZy5qcyIsInNyY1xcZXZlbnRFbWl0dGVyMy5qcyIsInNyY1xccHJvcC5qcyIsInNyY1xcc2VxdWVuY2VFZGl0b3IuanMiLCJzcmNcXHNlcXVlbmNlci5qcyIsInNyY1xcdWkuanMiLCJzcmNcXHVuZG8uanMiLCJzcmNcXHV1aWQuY29yZS5qcyIsInRlc3RcXGF1ZGlvTm9kZVRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7OztBQUFZLENBQUM7Ozs7a0JBaUNXLFlBQVk7QUF2QnBDLElBQUksTUFBTSxHQUFHLE9BQU8sTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVLEdBQUcsR0FBRyxHQUFHLEtBQUs7Ozs7Ozs7Ozs7QUFBQyxBQVUvRCxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtBQUM3QixNQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNiLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQztDQUMzQjs7Ozs7Ozs7O0FBQUEsQUFTYyxTQUFTLFlBQVksR0FBRzs7Ozs7Ozs7QUFBd0IsQUFRL0QsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUzs7Ozs7Ozs7OztBQUFDLEFBVTNDLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDbkUsTUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSztNQUNyQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVsRCxNQUFJLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDL0IsTUFBSSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUMxQixNQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFeEMsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkUsTUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDekI7O0FBRUQsU0FBTyxFQUFFLENBQUM7Q0FDWDs7Ozs7Ozs7O0FBQUMsQUFTRixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtBQUNyRSxNQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRTFDLE1BQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEtBQUssQ0FBQzs7QUFFdEQsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7TUFDN0IsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNO01BQ3RCLElBQUk7TUFDSixDQUFDLENBQUM7O0FBRU4sTUFBSSxVQUFVLEtBQUssT0FBTyxTQUFTLENBQUMsRUFBRSxFQUFFO0FBQ3RDLFFBQUksU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFOUUsWUFBUSxHQUFHO0FBQ1QsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDMUQsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzlELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDbEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsQUFDdEUsV0FBSyxDQUFDO0FBQUUsZUFBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQUEsS0FDL0U7O0FBRUQsU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxVQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7QUFFRCxhQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07QUFDTCxRQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0FBRU4sU0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsVUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVwRixjQUFRLEdBQUc7QUFDVCxhQUFLLENBQUM7QUFBRSxtQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzFELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQUMsTUFBTTtBQUFBLEFBQzlELGFBQUssQ0FBQztBQUFFLG1CQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUFDLE1BQU07QUFBQSxBQUNsRTtBQUNFLGNBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcs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QUN0RCxJQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pDLElBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztFQUMxQyxDQUFDLENBQUM7O0FBRUgsR0FBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFDLFlBQVU7QUFDeEMsT0FBSyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUNqQyxJQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pDLElBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsQ0FBQztFQUN6QyxDQUFDLENBQUM7O0FBRUgsR0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFDLFlBQVU7QUFDdkMsT0FBSyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUNoQyxJQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUM7QUFDNUMsSUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hELElBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxD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QUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3QyxNQUFNO0FBQ04sTUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNqQyxNQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ3RFO0dBQ0QsTUFBTTtBQUNOLEtBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDakMsS0FBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztHQUN2RDs7QUFFRCxHQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNwQixHQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsTUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkMsR0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUN2QixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQ1IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUNkLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsT0FBTyxFQUFDLFdBQVcs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QVEsR0FBRztBQUNULFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQzFELFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUM5RCxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ2xFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEFBQ3RFLFdBQUssQ0FBQztBQUFFLGVBQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7QUFBQSxBQUMxRSxXQUFLLENBQUM7QUFBRSxlQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUFBLEtBQy9FOztBQUVELFNBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxHQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbEQsVUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFT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LE1BQU0sT0FBTyxHQUNYO0FBQ0UsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsS0FBSztHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsR0FBRztHQUMvQixDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsS0FBSztHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsS0FBSztHQUNqQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFFLEtBQUs7QUFDZixVQUFNLEVBQUUsS0FBSztBQUNiLFdBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVksRUFBRSxZQUFZLENBQUMsSUFBSTtHQUNoQyxDQUFDO0FBQ0YsSUFBRSxFQUFFLENBQUM7QUFDSCxXQUFPLEVBQUUsRUFBRTtBQUNYLFdBQU8sRUFBRSxLQUFLO0FBQ2QsWUFBUSxFQUFF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QyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEUsTUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMxQyxNQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyRCxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxTQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyxNQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQztXQUFLLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxTQUFTO0dBQUEsQ0FBQzs7Ozs7Ozs7Ozs7OztBQUFDLEFBYS9GLFdBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFD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Q0QsUUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUMvQixRQUFJLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUEsQUFBQyxDQUFDLENBQUM7QUFDakcsUUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMzQixRQUFJLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUEsQUFBQyxDQUFDLENBQUM7QUFDakcsUUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMzQixRQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUEsQUFBQyxDQUFDLENBQUM7QUFDakcsUUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQTtBQUN6QixRQUFJLEdBQUcsc0VBQXNFLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVqRyxNQUFFLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztBQUNqQixNQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNmLE1BQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2YsTUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDYixNQUFFLENBQUMsT0FBTyxHQUFHLEdBQUc7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QyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLE9BQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBQztBQUNoQyxTQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsTUFBTTtBQUNOLFNBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRDtHQUNEOzs7Ozs7NkJBR1UsQ0FBQyxFQUFDO0FBQ1osT0FBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQy9CLFFBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBQyxFQUFFLENBQUMsRUFBQztBQUMxQyxRQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUM7QUFDckYsVUFBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsV0FBTTtLQUNOO0lBQ0Q7O0FBRUQsUUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQzdDLFFBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENB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RUFBQyxDQUFDLENBQUMsR0FBQyxHQUFHLEdBQUMsQ0FBQyxDQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFBO0NBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsU0FBTyxDQUFDLEdBQUMsQ0FBQyxHQUFDLEdBQUcsR0FBQyxFQUFFLElBQUUsQ0FBQyxHQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQSxBQUFDLEdBQUMsRUFBRSxJQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBQyxVQUFVLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBLEdBQUUsVUFBVSxJQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUUsQ0FBQyxJQUFFLENBQUMsR0FBQyxFQUFFLENBQUEsQUFBQyxDQUFBLEFBQUMsR0FBQyxHQUFHLENBQUE7Q0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUMsVUFBUyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsT0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUMsR0FBRyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFJLENBQUMsRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0NBQUMsQ0FBQzs7O0FDSjNhLFlB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R0FBRSxDQUFDLGVBQWUsRUFBRSxZQUFNOztBQUV6QixPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDekMsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFdEQsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzFDLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN2QyxPQUFLLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekMsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEYsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEYsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEYsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFF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LEVBQUMsQ0FBQyxFQUFDLEVBQUMsRUFBQyxJQUFJLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0FBQ3RFLE9BQUssQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUMsSUFBSSxFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxFQUFDLEVBQUMsSUFBSSxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7QUFDdkYsT0FBSyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxDQUFDLEVBQUMsRUFBQyxFQUFDLElBQUksRUFBQyxHQUFHLEVBQUMsS0FBSyxFQUFDLENBQUMsRUFBQyxDQUFDOzs7QUFBQyxBQUlyRSxLQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDeEIsS0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0RSxPQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBQyxDQUFDLEdBQUUsR0FBRyxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQ3pCLE1BQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDckU7O0FBRUQsS0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0RSxPQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBQyxDQUFDLEdBQUUsR0FBRyxFQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQ3pCLE1BQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDckU7QUFDRCxZQTlMYSxJQUFJLEdBOExYLENBQUM7QUFDUCxRQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ3hCLENBQUMsQ0FBQztDQUtILENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbi8vXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXG4vL1xudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xuICB0aGlzLmZuID0gZm47XG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XG59XG5cbi8qKlxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cblxuLyoqXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgICAsIGo7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG5cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5leHBvcnQgKiBmcm9tICcuL2F1ZGlvTm9kZVZpZXcnO1xyXG5leHBvcnQgKiBmcm9tICcuL2VnJztcclxuZXhwb3J0ICogZnJvbSAnLi9zZXF1ZW5jZXInO1xyXG5leHBvcnQgZnVuY3Rpb24gZHVtbXkoKXt9O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IFVVSUQgZnJvbSAnLi91dWlkLmNvcmUnO1xyXG5pbXBvcnQgKiBhcyB1aSBmcm9tICcuL3VpJztcclxuXHJcbnZhciBjb3VudGVyID0gMDtcclxuZXhwb3J0IHZhciBjdHg7XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRDdHgoYyl7Y3R4ID0gYzt9XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0T2JqZWN0Q291bnRlcigpe1xyXG4gIHJldHVybiBjb3VudGVyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlQ291bnRlcih2KVxyXG57XHJcbiAgaWYodiA+IGNvdW50ZXIpe1xyXG4gICAgY291bnRlciA9IHY7XHJcbiAgICArK2NvdW50ZXI7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTm9kZVZpZXdCYXNlIHtcclxuXHRjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IDAsd2lkdGggPSB1aS5ub2RlV2lkdGgsaGVpZ2h0ID0gdWkubm9kZUhlaWdodCxuYW1lID0gJycpIHtcclxuXHRcdHRoaXMueCA9IHggO1xyXG5cdFx0dGhpcy55ID0geSA7XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGggO1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHQgO1xyXG5cdFx0dGhpcy5uYW1lID0gbmFtZTtcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBTVEFUVVNfUExBWV9OT1RfUExBWUVEID0gMDtcclxuZXhwb3J0IGNvbnN0IFNUQVRVU19QTEFZX1BMQVlJTkcgPSAxO1xyXG5leHBvcnQgY29uc3QgU1RBVFVTX1BMQVlfUExBWUVEID0gMjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZJc05vdEFQSU9iaih0aGlzXyx2KXtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpc18sJ2lzTm90QVBJT2JqJyx7XHJcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlLFxyXG5cdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxyXG5cdFx0XHR3cml0YWJsZTpmYWxzZSxcclxuXHRcdFx0dmFsdWU6IHZcclxuXHRcdH0pO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQXVkaW9QYXJhbVZpZXcgZXh0ZW5kcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKEF1ZGlvTm9kZVZpZXcsbmFtZSwgcGFyYW0pIHtcclxuXHRcdHN1cGVyKDAsMCx1aS5wb2ludFNpemUsdWkucG9pbnRTaXplLG5hbWUpO1xyXG5cdFx0dGhpcy5pZCA9IFVVSUQuZ2VuZXJhdGUoKTtcclxuXHRcdHRoaXMuYXVkaW9QYXJhbSA9IHBhcmFtO1xyXG5cdFx0dGhpcy5BdWRpb05vZGVWaWV3ID0gQXVkaW9Ob2RlVmlldztcclxuXHR9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBQYXJhbVZpZXcgZXh0ZW5kcyBOb2RlVmlld0Jhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKEF1ZGlvTm9kZVZpZXcsbmFtZSxpc291dHB1dCkge1xyXG5cdFx0c3VwZXIoMCwwLHVpLnBvaW50U2l6ZSx1aS5wb2ludFNpemUsbmFtZSk7XHJcblx0XHR0aGlzLmlkID0gVVVJRC5nZW5lcmF0ZSgpO1xyXG5cdFx0dGhpcy5BdWRpb05vZGVWaWV3ID0gQXVkaW9Ob2RlVmlldztcclxuXHRcdHRoaXMuaXNPdXRwdXQgPSBpc291dHB1dCB8fCBmYWxzZTtcclxuXHR9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQXVkaW9Ob2RlVmlldyBleHRlbmRzIE5vZGVWaWV3QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoYXVkaW9Ob2RlLGVkaXRvcilcclxuXHR7XHJcblx0XHQvLyBhdWRpb05vZGUg44Gv44OZ44O844K544Go44Gq44KL44OO44O844OJXHJcblx0XHRzdXBlcigpO1xyXG5cdFx0dGhpcy5pZCA9IFVVSUQuZ2VuZXJhdGUoKTtcclxuXHRcdHRoaXMuYXVkaW9Ob2RlID0gYXVkaW9Ob2RlO1xyXG5cdFx0dGhpcy5uYW1lID0gYXVkaW9Ob2RlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL2Z1bmN0aW9uXFxzKC4qKVxcKC8pWzFdO1xyXG5cdFx0dGhpcy5pbnB1dFBhcmFtcyA9IFtdO1xyXG5cdFx0dGhpcy5vdXRwdXRQYXJhbXMgPSBbXTtcclxuXHRcdHRoaXMucGFyYW1zID0gW107XHJcblx0XHRsZXQgaW5wdXRDeSA9IDEsb3V0cHV0Q3kgPSAxO1xyXG5cdFx0XHJcblx0XHR0aGlzLnJlbW92YWJsZSA9IHRydWU7XHJcblx0XHRcclxuXHRcdC8vIOODl+ODreODkeODhuOCo+ODu+ODoeOCveODg+ODieOBruikh+ijvVxyXG5cdFx0Zm9yICh2YXIgaSBpbiBhdWRpb05vZGUpIHtcclxuXHRcdFx0aWYgKHR5cGVvZiBhdWRpb05vZGVbaV0gPT09ICdmdW5jdGlvbicpIHtcclxuLy9cdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV0uYmluZChhdWRpb05vZGUpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlmICh0eXBlb2YgYXVkaW9Ob2RlW2ldID09PSAnb2JqZWN0Jykge1xyXG5cdFx0XHRcdFx0aWYgKGF1ZGlvTm9kZVtpXSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW0pIHtcclxuXHRcdFx0XHRcdFx0dGhpc1tpXSA9IG5ldyBBdWRpb1BhcmFtVmlldyh0aGlzLGksIGF1ZGlvTm9kZVtpXSk7XHJcblx0XHRcdFx0XHRcdHRoaXMuaW5wdXRQYXJhbXMucHVzaCh0aGlzW2ldKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5wYXJhbXMucHVzaCgoKHApPT57XHJcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0XHRcdG5hbWU6aSxcclxuXHRcdFx0XHRcdFx0XHRcdCdnZXQnOigpID0+IHAuYXVkaW9QYXJhbS52YWx1ZSxcclxuXHRcdFx0XHRcdFx0XHRcdCdzZXQnOih2KSA9PntwLmF1ZGlvUGFyYW0udmFsdWUgPSB2O30sXHJcblx0XHRcdFx0XHRcdFx0XHRwYXJhbTpwLFxyXG5cdFx0XHRcdFx0XHRcdFx0bm9kZTp0aGlzXHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9KSh0aGlzW2ldKSk7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0ueSA9ICgyMCAqIGlucHV0Q3krKyk7XHJcblx0XHRcdFx0XHR9IGVsc2UgaWYoYXVkaW9Ob2RlW2ldIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRcdFx0YXVkaW9Ob2RlW2ldLkF1ZGlvTm9kZVZpZXcgPSB0aGlzO1xyXG5cdFx0XHRcdFx0XHR0aGlzW2ldID0gYXVkaW9Ob2RlW2ldO1xyXG5cdFx0XHRcdFx0XHRpZih0aGlzW2ldLmlzT3V0cHV0KXtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnkgPSAoMjAgKiBvdXRwdXRDeSsrKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzW2ldLnggPSB0aGlzLndpZHRoO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMub3V0cHV0UGFyYW1zLnB1c2godGhpc1tpXSk7XHJcblx0XHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpc1tpXS55ID0gKDIwICogaW5wdXRDeSsrKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLmlucHV0UGFyYW1zLnB1c2godGhpc1tpXSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRoaXNbaV0gPSBhdWRpb05vZGVbaV07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihBdWRpb05vZGUucHJvdG90eXBlLCBpKTtcdFxyXG5cdFx0XHRcdFx0aWYoIWRlc2Mpe1xyXG5cdFx0XHRcdFx0XHRkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLmF1ZGlvTm9kZS5fX3Byb3RvX18sIGkpO1x0XHJcblx0XHRcdFx0XHR9IFxyXG5cdFx0XHRcdFx0aWYoIWRlc2Mpe1xyXG5cdFx0XHRcdFx0XHRkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLmF1ZGlvTm9kZSxpKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHZhciBwcm9wcyA9IHt9O1xyXG5cclxuLy9cdFx0XHRcdFx0aWYoZGVzYy5nZXQpe1xyXG5cdFx0XHRcdFx0XHRcdHByb3BzLmdldCA9ICgoaSkgPT4gdGhpcy5hdWRpb05vZGVbaV0pLmJpbmQobnVsbCwgaSk7XHJcbi8vXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0aWYoZGVzYy53cml0YWJsZSB8fCBkZXNjLnNldCl7XHJcblx0XHRcdFx0XHRcdHByb3BzLnNldCA9ICgoaSwgdikgPT4geyB0aGlzLmF1ZGlvTm9kZVtpXSA9IHY7IH0pLmJpbmQobnVsbCwgaSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHByb3BzLmVudW1lcmFibGUgPSBkZXNjLmVudW1lcmFibGU7XHJcblx0XHRcdFx0XHRwcm9wcy5jb25maWd1cmFibGUgPSBkZXNjLmNvbmZpZ3VyYWJsZTtcclxuXHRcdFx0XHRcdC8vcHJvcHMud3JpdGFibGUgPSBmYWxzZTtcclxuXHRcdFx0XHRcdC8vcHJvcHMud3JpdGFibGUgPSBkZXNjLndyaXRhYmxlO1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgaSxwcm9wcyk7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdHByb3BzLm5hbWUgPSBpO1xyXG5cdFx0XHRcdFx0cHJvcHMubm9kZSA9IHRoaXM7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGlmKGRlc2MuZW51bWVyYWJsZSAmJiAhaS5tYXRjaCgvKC4qXyQpfChuYW1lKXwoXm51bWJlck9mLiokKS9pKSAmJiAodHlwZW9mIGF1ZGlvTm9kZVtpXSkgIT09ICdBcnJheScpe1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBhcmFtcy5wdXNoKHByb3BzKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmlucHV0U3RhcnRZID0gaW5wdXRDeSAqIDIwO1xyXG5cdFx0dmFyIGlucHV0SGVpZ2h0ID0gKGlucHV0Q3kgKyB0aGlzLm51bWJlck9mSW5wdXRzKSAqIDIwIDtcclxuXHRcdHZhciBvdXRwdXRIZWlnaHQgPSAob3V0cHV0Q3kgKyB0aGlzLm51bWJlck9mT3V0cHV0cykgKiAyMDtcclxuXHRcdHRoaXMub3V0cHV0U3RhcnRZID0gb3V0cHV0Q3kgKiAyMDtcclxuXHRcdHRoaXMuaGVpZ2h0ID0gTWF0aC5tYXgodGhpcy5oZWlnaHQsaW5wdXRIZWlnaHQsb3V0cHV0SGVpZ2h0KTtcclxuXHRcdHRoaXMudGVtcCA9IHt9O1xyXG5cdFx0dGhpcy5zdGF0dXNQbGF5ID0gU1RBVFVTX1BMQVlfTk9UX1BMQVlFRDsvLyBub3QgcGxheWVkLlxyXG5cdFx0dGhpcy5wYW5lbCA9IG51bGw7XHJcblx0XHR0aGlzLmVkaXRvciA9IGVkaXRvci5iaW5kKHRoaXMsdGhpcyk7XHJcblx0fVxyXG4gIFxyXG4gIHRvSlNPTigpe1xyXG4gICAgbGV0IHJldCA9IHt9O1xyXG4gICAgcmV0LmlkID0gdGhpcy5pZDtcclxuICAgIHJldC54ID0gdGhpcy54O1xyXG5cdFx0cmV0LnkgPSB0aGlzLnk7XHJcblx0XHRyZXQubmFtZSA9IHRoaXMubmFtZTtcclxuICAgIHJldC5yZW1vdmFibGUgPSB0aGlzLnJlbW92YWJsZTtcclxuICAgIGlmKHRoaXMuYXVkaW9Ob2RlLnRvSlNPTil7XHJcbiAgICAgIHJldC5hdWRpb05vZGUgPSB0aGlzLmF1ZGlvTm9kZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldC5wYXJhbXMgPSB7fTtcclxuICAgICAgdGhpcy5wYXJhbXMuZm9yRWFjaCgoZCk9PntcclxuICAgICAgICBpZihkLnNldCl7XHJcbiAgICAgICAgICByZXQucGFyYW1zW2QubmFtZV0gPSBkLmdldCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuXHRcclxuXHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRzdGF0aWMgcmVtb3ZlKG5vZGUpIHtcclxuXHRcdFx0aWYoIW5vZGUucmVtb3ZhYmxlKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCfliYrpmaTjgafjgY3jgarjgYTjg47jg7zjg4njgafjgZnjgIInKTtcclxuXHRcdFx0fVxyXG5cdFx0XHQvLyDjg47jg7zjg4njga7liYrpmaRcclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRpZiAoQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzW2ldID09PSBub2RlKSB7XHJcblx0XHRcdFx0XHRpZihub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKXtcclxuXHRcdFx0XHRcdFx0bm9kZS5hdWRpb05vZGUuZGlzcG9zZSgpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLnNwbGljZShpLS0sIDEpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuXHRcdFx0XHRsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0XHRpZiAobi5mcm9tLm5vZGUgPT09IG5vZGUgfHwgbi50by5ub2RlID09PSBub2RlKSB7XHJcblx0XHRcdFx0XHRBdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3RfKG4pO1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG4gIFxyXG4gIC8vIFxyXG4gIHN0YXRpYyByZW1vdmVBbGxOb2RlVmlld3MoKXtcclxuICAgIEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5mb3JFYWNoKChub2RlKT0+e1xyXG4gICAgICBpZihub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKXtcclxuICAgICAgICBub2RlLmF1ZGlvTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIH1cclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICBsZXQgbiA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuICAgICAgICBpZiAobi5mcm9tLm5vZGUgPT09IG5vZGUgfHwgbi50by5ub2RlID09PSBub2RlKSB7XHJcbiAgICAgICAgICBBdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3RfKG4pO1xyXG4gICAgICAgICAgQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLnNwbGljZShpLS0sMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGggPSAwO1xyXG4gIH1cclxuXHJcbiAgLy8gXHJcblx0c3RhdGljIGRpc2Nvbm5lY3RfKGNvbikge1xyXG5cdFx0aWYgKGNvbi5mcm9tLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KSB7XHJcblx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uKTtcclxuXHRcdH0gZWxzZSBpZiAoY29uLnRvLnBhcmFtKSB7XHJcblx0XHRcdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdGlmIChjb24udG8ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldykge1xyXG5cdFx0XHRcdC8vIEFVZGlvUGFyYW1cclxuXHRcdFx0XHRpZiAoY29uLmZyb20ucGFyYW0pIHtcclxuXHRcdFx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLnBhcmFtLmF1ZGlvUGFyYW0sIGNvbi5mcm9tLnBhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ucGFyYW0uYXVkaW9QYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIGNvbi50by5wYXJhbeOBjOaVsOWtl1xyXG5cdFx0XHRcdGlmIChjb24uZnJvbS5wYXJhbSkge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KSB7XHJcblx0XHRcdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uKTtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHRyeSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsIGNvbi5mcm9tLnBhcmFtLCBjb24udG8ucGFyYW0pO1xyXG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZSk7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdFx0Y29uLmZyb20ubm9kZS5hdWRpb05vZGUuZGlzY29ubmVjdChjb24udG8ubm9kZS5hdWRpb05vZGUsIDAsIGNvbi50by5wYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyB0byDjg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0aWYgKGNvbi5mcm9tLnBhcmFtKSB7XHJcblx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBguOCilxyXG5cdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlLCBjb24uZnJvbS5wYXJhbSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gZnJvbeODkeODqeODoeODvOOCv+OBquOBl1xyXG5cdFx0XHRcdGNvbi5mcm9tLm5vZGUuYXVkaW9Ob2RlLmRpc2Nvbm5lY3QoY29uLnRvLm5vZGUuYXVkaW9Ob2RlKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDjgrPjg43jgq/jgrfjg6fjg7Pjga7mjqXntprjgpLop6PpmaTjgZnjgotcclxuXHRzdGF0aWMgZGlzY29ubmVjdChmcm9tXyx0b18pIHtcclxuXHRcdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3KXtcclxuXHRcdFx0XHRmcm9tXyA9IHtub2RlOmZyb21ffTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0aWYoZnJvbV8gaW5zdGFuY2VvZiBQYXJhbVZpZXcgKXtcclxuXHRcdFx0XHRmcm9tXyA9IHtub2RlOmZyb21fLkF1ZGlvTm9kZVZpZXcscGFyYW06ZnJvbV99O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3KXtcclxuXHRcdFx0XHR0b18gPSB7bm9kZTp0b199O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0dG9fID0ge25vZGU6dG9fLkF1ZGlvTm9kZVZpZXcscGFyYW06dG9ffVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRpZih0b18gaW5zdGFuY2VvZiBQYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX31cclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGNvbiA9IHsnZnJvbSc6ZnJvbV8sJ3RvJzp0b199O1xyXG5cdFx0XHRcclxuXHRcdFx0Ly8g44Kz44ON44Kv44K344On44Oz44Gu5YmK6ZmkXHJcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aDsgKytpKSB7XHJcblx0XHRcdFx0bGV0IG4gPSBBdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnNbaV07XHJcblx0XHRcdFx0aWYoY29uLmZyb20ubm9kZSA9PT0gbi5mcm9tLm5vZGUgJiYgY29uLmZyb20ucGFyYW0gPT09IG4uZnJvbS5wYXJhbSBcclxuXHRcdFx0XHRcdCYmIGNvbi50by5ub2RlID09PSBuLnRvLm5vZGUgJiYgY29uLnRvLnBhcmFtID09PSBuLnRvLnBhcmFtKXtcclxuXHRcdFx0XHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdFx0QXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0Xyhjb24pO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgY3JlYXRlKGF1ZGlvbm9kZSxlZGl0b3IgPSAoKT0+e30pIHtcclxuXHRcdHZhciBvYmogPSBuZXcgQXVkaW9Ob2RlVmlldyhhdWRpb25vZGUsZWRpdG9yKTtcclxuXHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5wdXNoKG9iaik7XHJcblx0XHRyZXR1cm4gb2JqO1xyXG5cdH1cclxuICBcclxuICAvLyDjg47jg7zjg4nplpPjga7mjqXntppcclxuXHRzdGF0aWMgY29ubmVjdChmcm9tXywgdG9fKSB7XHJcblx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIEF1ZGlvTm9kZVZpZXcgKXtcclxuXHRcdFx0ZnJvbV8gPSB7bm9kZTpmcm9tXyxwYXJhbTowfTtcclxuXHRcdH1cclxuXHJcblx0XHRpZihmcm9tXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdGZyb21fID0ge25vZGU6ZnJvbV8uQXVkaW9Ob2RlVmlldyxwYXJhbTpmcm9tX307XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb05vZGVWaWV3KXtcclxuXHRcdFx0dG9fID0ge25vZGU6dG9fLHBhcmFtOjB9O1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRpZih0b18gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX307XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKHRvXyBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdHRvXyA9IHtub2RlOnRvXy5BdWRpb05vZGVWaWV3LHBhcmFtOnRvX307XHJcblx0XHR9XHJcblx0XHQvLyDlrZjlnKjjg4Hjgqfjg4Pjgq9cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aDsgaSA8IGw7ICsraSkge1xyXG5cdFx0XHR2YXIgYyA9IEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9uc1tpXTtcclxuXHRcdFx0aWYgKGMuZnJvbS5ub2RlID09PSBmcm9tXy5ub2RlIFxyXG5cdFx0XHRcdCYmIGMuZnJvbS5wYXJhbSA9PT0gZnJvbV8ucGFyYW1cclxuXHRcdFx0XHQmJiBjLnRvLm5vZGUgPT09IHRvXy5ub2RlXHJcblx0XHRcdFx0JiYgYy50by5wYXJhbSA9PT0gdG9fLnBhcmFtXHJcblx0XHRcdFx0KSBcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRyZXR1cm47XHJcbi8vXHRcdFx0XHR0aHJvdyAobmV3IEVycm9yKCfmjqXntprjgYzph43opIfjgZfjgabjgYTjgb7jgZnjgIInKSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8g5o6l57aa5YWI44GMUGFyYW1WaWV344Gu5aC05ZCI44Gv5o6l57aa5YWD44GvUGFyYW1WaWV344Gu44G/XHJcblx0XHRpZih0b18ucGFyYW0gaW5zdGFuY2VvZiBQYXJhbVZpZXcgJiYgIShmcm9tXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldykpe1xyXG5cdFx0ICByZXR1cm4gO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBQYXJhbVZpZXfjgYzmjqXntprlj6/og73jgarjga7jga9BdWRpb1BhcmFt44GL44KJUGFyYW1WaWV344Gu44G/XHJcblx0XHRpZihmcm9tXy5wYXJhbSBpbnN0YW5jZW9mIFBhcmFtVmlldyl7XHJcblx0XHRcdGlmKCEodG9fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3IHx8IHRvXy5wYXJhbSBpbnN0YW5jZW9mIEF1ZGlvUGFyYW1WaWV3KSl7XHJcblx0XHRcdFx0cmV0dXJuO1x0XHJcblx0XHRcdH1cclxuXHRcdH0gXHJcblx0XHRcclxuXHRcdGlmIChmcm9tXy5wYXJhbSkge1xyXG5cdFx0XHQvLyBmcm9t44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHQgIGlmKGZyb21fLnBhcmFtIGluc3RhbmNlb2YgUGFyYW1WaWV3KXtcclxuXHRcdFx0XHQgIGZyb21fLm5vZGUuYXVkaW9Ob2RlLmNvbm5lY3Qoeydmcm9tJzpmcm9tXywndG8nOnRvX30pO1xyXG4vL1x0XHRcdFx0ZnJvbV8ubm9kZS5jb25uZWN0UGFyYW0oZnJvbV8ucGFyYW0sdG9fKTtcclxuXHRcdFx0fSBlbHNlIGlmICh0b18ucGFyYW0pIFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgYLjgopcclxuXHRcdFx0XHRpZih0b18ucGFyYW0gaW5zdGFuY2VvZiBBdWRpb1BhcmFtVmlldyl7XHJcblx0XHRcdFx0XHQvLyBBdWRpb1BhcmFt44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5wYXJhbS5hdWRpb1BhcmFtLGZyb21fLnBhcmFtKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0Ly8g5pWw5a2X44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSwgZnJvbV8ucGFyYW0sdG9fLnBhcmFtKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Ly8gdG/jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSxmcm9tXy5wYXJhbSk7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdC8vIGZyb23jg5Hjg6njg6Hjg7zjgr/jgarjgZdcclxuXHRcdFx0aWYgKHRvXy5wYXJhbSkge1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44GC44KKXHJcblx0XHRcdFx0aWYodG9fLnBhcmFtIGluc3RhbmNlb2YgQXVkaW9QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdFx0Ly8gQXVkaW9QYXJhbeOBruWgtOWQiFxyXG5cdFx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ucGFyYW0uYXVkaW9QYXJhbSk7XHJcblx0XHRcdFx0fSBlbHNle1xyXG5cdFx0XHRcdFx0Ly8g5pWw5a2X44Gu5aC05ZCIXHJcblx0XHRcdFx0XHRmcm9tXy5ub2RlLmF1ZGlvTm9kZS5jb25uZWN0KHRvXy5ub2RlLmF1ZGlvTm9kZSwwLHRvXy5wYXJhbSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdC8vIHRv44OR44Op44Oh44O844K/44Gq44GXXHJcblx0XHRcdFx0ZnJvbV8ubm9kZS5hdWRpb05vZGUuY29ubmVjdCh0b18ubm9kZS5hdWRpb05vZGUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdC8vdGhyb3cgbmV3IEVycm9yKCdDb25uZWN0aW9uIEVycm9yJyk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdEF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5wdXNoXHJcblx0XHQoe1xyXG5cdFx0XHQnZnJvbSc6IGZyb21fLFxyXG5cdFx0XHQndG8nOiB0b19cclxuXHRcdH0pO1xyXG5cdH1cclxuICBcclxufVxyXG5cclxuXHJcblxyXG5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMgPSBbXTtcclxuQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zID0gW107XHJcblxyXG5cclxuIiwiaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcbmltcG9ydCAqIGFzIHVpIGZyb20gJy4vdWkuanMnO1xyXG5pbXBvcnQge3Nob3dTZXF1ZW5jZUVkaXRvcn0gZnJvbSAnLi9zZXF1ZW5jZUVkaXRvcic7XHJcblxyXG5leHBvcnQgdmFyIHN2ZztcclxuLy9hYVxyXG52YXIgbm9kZUdyb3VwLCBsaW5lR3JvdXA7XHJcbnZhciBkcmFnO1xyXG52YXIgZHJhZ091dDtcclxudmFyIGRyYWdQYXJhbTtcclxudmFyIGRyYWdQYW5lbDtcclxuXHJcbnZhciBtb3VzZUNsaWNrTm9kZTtcclxudmFyIG1vdXNlT3Zlck5vZGU7XHJcbnZhciBsaW5lO1xyXG52YXIgYXVkaW9Ob2RlQ3JlYXRvcnMgPSBbXTtcclxuXHJcbi8vIERyYXfjga7liJ3mnJ/ljJZcclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRVSSgpe1xyXG5cdFxyXG5cdC8vIOODl+ODrOOCpOODpOODvFxyXG5cdGF1ZGlvLlNlcXVlbmNlci5hZGRlZCA9ICgpPT5cclxuXHR7XHJcblx0XHRpZihhdWRpby5TZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGggPT0gMSAmJiBhdWRpby5TZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT09IGF1ZGlvLlNFUV9TVEFUVVMuU1RPUFBFRCl7XHJcblx0XHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0XHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhdWRpby5TZXF1ZW5jZXIuZW1wdHkgPSAoKT0+e1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnN0b3BTZXF1ZW5jZXMoKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNzdG9wJykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0fSBcclxuXHRcclxuXHRkMy5zZWxlY3QoJyNwbGF5JylcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbigpXHJcblx0e1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnN0YXJ0U2VxdWVuY2VzKGF1ZGlvLmN0eC5jdXJyZW50VGltZSk7XHJcblx0XHRkMy5zZWxlY3QodGhpcykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BhdXNlJykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3BhdXNlJykub24oJ2NsaWNrJyxmdW5jdGlvbigpe1xyXG5cdFx0YXVkaW8uU2VxdWVuY2VyLnBhdXNlU2VxdWVuY2VzKCk7XHJcblx0XHRkMy5zZWxlY3QodGhpcykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjc3RvcCcpLmF0dHIoJ2Rpc2FibGVkJyxudWxsKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fSk7XHJcblx0XHJcblx0ZDMuc2VsZWN0KCcjc3RvcCcpLm9uKCdjbGljaycsZnVuY3Rpb24oKXtcclxuXHRcdGF1ZGlvLlNlcXVlbmNlci5zdG9wU2VxdWVuY2VzKCk7XHJcblx0XHRkMy5zZWxlY3QodGhpcykuYXR0cignZGlzYWJsZWQnLCdkaXNhYmxlZCcpO1xyXG5cdFx0ZDMuc2VsZWN0KCcjcGF1c2UnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwbGF5JykuYXR0cignZGlzYWJsZWQnLG51bGwpO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGF1ZGlvLlNlcXVlbmNlci5zdG9wcGVkID0gKCk9PntcclxuXHRcdGQzLnNlbGVjdCgnI3N0b3AnKS5hdHRyKCdkaXNhYmxlZCcsJ2Rpc2FibGVkJyk7XHJcblx0XHRkMy5zZWxlY3QoJyNwYXVzZScpLmF0dHIoJ2Rpc2FibGVkJywnZGlzYWJsZWQnKTtcclxuXHRcdGQzLnNlbGVjdCgnI3BsYXknKS5hdHRyKCdkaXNhYmxlZCcsbnVsbCk7XHJcblx0fVxyXG5cdFxyXG5cdFxyXG5cdC8vIEF1ZGlvTm9kZeODieODqeODg+OCsOeUqFxyXG5cdGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHQub3JpZ2luKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkOyB9KVxyXG5cdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdGlmKGQzLmV2ZW50LnNvdXJjZUV2ZW50LmN0cmxLZXkgfHwgZDMuZXZlbnQuc291cmNlRXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHR0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdtb3VzZXVwJykpO1x0XHRcdFxyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRkLnRlbXAueCA9IGQueDtcclxuXHRcdGQudGVtcC55ID0gZC55O1xyXG5cdFx0ZDMuc2VsZWN0KHRoaXMucGFyZW50Tm9kZSlcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoe2lkOidkcmFnJyx3aWR0aDpkLndpZHRoLGhlaWdodDpkLmhlaWdodCx4OjAseTowLCdjbGFzcyc6J2F1ZGlvTm9kZURyYWcnfSApO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0aWYoZDMuZXZlbnQuc291cmNlRXZlbnQuY3RybEtleSB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5zaGlmdEtleSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGQudGVtcC54ICs9IGQzLmV2ZW50LmR4O1xyXG5cdFx0ZC50ZW1wLnkgKz0gZDMuZXZlbnQuZHk7XHJcblx0XHQvL2QzLnNlbGVjdCh0aGlzKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyAoZC54IC0gZC53aWR0aCAvIDIpICsgJywnICsgKGQueSAtIGQuaGVpZ2h0IC8gMikgKyAnKScpO1xyXG5cdFx0Ly9kcmF3KCk7XHJcblx0XHR2YXIgZHJhZ0N1cnNvbCA9IGQzLnNlbGVjdCh0aGlzLnBhcmVudE5vZGUpXHJcblx0XHQuc2VsZWN0KCdyZWN0I2RyYWcnKTtcclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3gnKSkgKyBkMy5ldmVudC5keDtcclxuXHRcdHZhciB5ID0gcGFyc2VGbG9hdChkcmFnQ3Vyc29sLmF0dHIoJ3knKSkgKyBkMy5ldmVudC5keTtcclxuXHRcdGRyYWdDdXJzb2wuYXR0cih7eDp4LHk6eX0pO1x0XHRcclxuXHR9KVxyXG5cdC5vbignZHJhZ2VuZCcsZnVuY3Rpb24oZCl7XHJcblx0XHRpZihkMy5ldmVudC5zb3VyY2VFdmVudC5jdHJsS2V5IHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0dmFyIGRyYWdDdXJzb2wgPSBkMy5zZWxlY3QodGhpcy5wYXJlbnROb2RlKVxyXG5cdFx0LnNlbGVjdCgncmVjdCNkcmFnJyk7XHJcblx0XHR2YXIgeCA9IHBhcnNlRmxvYXQoZHJhZ0N1cnNvbC5hdHRyKCd4JykpO1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGRyYWdDdXJzb2wuYXR0cigneScpKTtcclxuXHRcdGQueCA9IGQudGVtcC54O1xyXG5cdFx0ZC55ID0gZC50ZW1wLnk7XHJcblx0XHRkcmFnQ3Vyc29sLnJlbW92ZSgpO1x0XHRcclxuXHRcdGRyYXcoKTtcclxuXHR9KTtcclxuXHRcclxuXHQvLyDjg47jg7zjg4nplpPmjqXntprnlKggZHJhZyBcclxuXHRkcmFnT3V0ID0gZDMuYmVoYXZpb3IuZHJhZygpXHJcblx0Lm9yaWdpbihmdW5jdGlvbiAoZCkgeyByZXR1cm4gZDsgfSlcclxuXHQub24oJ2RyYWdzdGFydCcsZnVuY3Rpb24oZCl7XHJcblx0XHRsZXQgeDEseTE7XHJcblx0XHRpZihkLmluZGV4KXtcclxuXHRcdFx0aWYoZC5pbmRleCBpbnN0YW5jZW9mIGF1ZGlvLlBhcmFtVmlldyl7XHJcblx0XHRcdFx0eDEgPSBkLm5vZGUueCAtIGQubm9kZS53aWR0aCAvIDIgKyBkLmluZGV4Lng7XHJcblx0XHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLmluZGV4Lnk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0eDEgPSBkLm5vZGUueCArIGQubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdFx0eTEgPSBkLm5vZGUueSAtIGQubm9kZS5oZWlnaHQgLzIgKyBkLm5vZGUub3V0cHV0U3RhcnRZICsgZC5pbmRleCAqIDIwOyBcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0eDEgPSBkLm5vZGUueCArIGQubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdHkxID0gZC5ub2RlLnkgLSBkLm5vZGUuaGVpZ2h0IC8yICsgZC5ub2RlLm91dHB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHJcblx0XHRkLngxID0geDEsZC55MSA9IHkxO1x0XHRcdFx0XHJcblx0XHRkLngyID0geDEsZC55MiA9IHkxO1xyXG5cclxuXHRcdHZhciBwb3MgPSBtYWtlUG9zKHgxLHkxLGQueDIsZC55Mik7XHJcblx0XHRkLmxpbmUgPSBzdmcuYXBwZW5kKCdnJylcclxuXHRcdC5kYXR1bShkKVxyXG5cdFx0LmFwcGVuZCgncGF0aCcpXHJcblx0XHQuYXR0cih7J2QnOmxpbmUocG9zKSwnY2xhc3MnOidsaW5lLWRyYWcnfSk7XHJcblx0fSlcclxuXHQub24oXCJkcmFnXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRkLngyICs9IGQzLmV2ZW50LmR4O1xyXG5cdFx0ZC55MiArPSBkMy5ldmVudC5keTtcclxuXHRcdGQubGluZS5hdHRyKCdkJyxsaW5lKG1ha2VQb3MoZC54MSxkLnkxLGQueDIsZC55MikpKTtcdFx0XHRcdFx0XHJcblx0fSlcclxuXHQub24oXCJkcmFnZW5kXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHRsZXQgdGFyZ2V0WCA9IGQueDI7XHJcblx0XHRsZXQgdGFyZ2V0WSA9IGQueTI7XHJcblx0XHQvLyBpbnB1dOOCguOBl+OBj+OBr3BhcmFt44Gr5Yiw6YGU44GX44Gm44GE44KL44GLXHJcblx0XHQvLyBpbnB1dFx0XHRcclxuXHRcdGxldCBjb25uZWN0ZWQgPSBmYWxzZTtcclxuXHRcdGxldCBpbnB1dHMgPSBkMy5zZWxlY3RBbGwoJy5pbnB1dCcpWzBdO1xyXG5cdFx0Zm9yKHZhciBpID0gMCxsID0gaW5wdXRzLmxlbmd0aDtpIDwgbDsrK2kpe1xyXG5cdFx0XHRsZXQgZWxtID0gaW5wdXRzW2ldO1xyXG5cdFx0XHRsZXQgYmJveCA9IGVsbS5nZXRCQm94KCk7XHJcblx0XHRcdGxldCBub2RlID0gZWxtLl9fZGF0YV9fLm5vZGU7XHJcblx0XHRcdGxldCBsZWZ0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LngsXHJcblx0XHRcdFx0dG9wID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55LFxyXG5cdFx0XHRcdHJpZ2h0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94LnggKyBiYm94LndpZHRoLFxyXG5cdFx0XHRcdGJvdHRvbSA9IG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIGJib3gueSArIGJib3guaGVpZ2h0O1xyXG5cdFx0XHRpZih0YXJnZXRYID49IGxlZnQgJiYgdGFyZ2V0WCA8PSByaWdodCAmJiB0YXJnZXRZID49IHRvcCAmJiB0YXJnZXRZIDw9IGJvdHRvbSlcclxuXHRcdFx0e1xyXG4vL1x0XHRcdFx0Y29uc29sZS5sb2coJ2hpdCcsZWxtKTtcclxuXHRcdFx0XHRsZXQgZnJvbV8gPSB7bm9kZTpkLm5vZGUscGFyYW06ZC5pbmRleH07XHJcblx0XHRcdFx0bGV0IHRvXyA9IHtub2RlOm5vZGUscGFyYW06ZWxtLl9fZGF0YV9fLmluZGV4fTtcclxuXHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoZnJvbV8sdG9fKTtcclxuXHRcdFx0XHQvL0F1ZGlvTm9kZVZpZXcuY29ubmVjdCgpO1xyXG5cdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0XHRjb25uZWN0ZWQgPSB0cnVlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGlmKCFjb25uZWN0ZWQpe1xyXG5cdFx0XHQvLyBBdWRpb1BhcmFtXHJcblx0XHRcdHZhciBwYXJhbXMgPSBkMy5zZWxlY3RBbGwoJy5wYXJhbSwuYXVkaW8tcGFyYW0nKVswXTtcclxuXHRcdFx0Zm9yKHZhciBpID0gMCxsID0gcGFyYW1zLmxlbmd0aDtpIDwgbDsrK2kpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRsZXQgZWxtID0gcGFyYW1zW2ldO1xyXG5cdFx0XHRcdGxldCBiYm94ID0gZWxtLmdldEJCb3goKTtcclxuXHRcdFx0XHRsZXQgcGFyYW0gPSBlbG0uX19kYXRhX187XHJcblx0XHRcdFx0bGV0IG5vZGUgPSBwYXJhbS5ub2RlO1xyXG5cdFx0XHRcdGxldCBsZWZ0ID0gbm9kZS54IC0gbm9kZS53aWR0aCAvIDIgKyBiYm94Lng7XHJcblx0XHRcdFx0bGV0XHR0b3BfID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyICsgYmJveC55O1xyXG5cdFx0XHRcdGxldFx0cmlnaHQgPSBub2RlLnggLSBub2RlLndpZHRoIC8gMiArIGJib3gueCArIGJib3gud2lkdGg7XHJcblx0XHRcdFx0bGV0XHRib3R0b20gPSBub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBiYm94LnkgKyBiYm94LmhlaWdodDtcclxuXHRcdFx0XHRpZih0YXJnZXRYID49IGxlZnQgJiYgdGFyZ2V0WCA8PSByaWdodCAmJiB0YXJnZXRZID49IHRvcF8gJiYgdGFyZ2V0WSA8PSBib3R0b20pXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ2hpdCcsZWxtKTtcclxuXHRcdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpkLm5vZGUscGFyYW06ZC5pbmRleH0se25vZGU6bm9kZSxwYXJhbTpwYXJhbS5pbmRleH0pO1xyXG5cdFx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQvLyBsaW5l44OX44Os44OT44Ol44O844Gu5YmK6ZmkXHJcblx0XHRkLmxpbmUucmVtb3ZlKCk7XHJcblx0XHRkZWxldGUgZC5saW5lO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGQzLnNlbGVjdCgnI3BhbmVsLWNsb3NlJylcclxuXHQub24oJ2NsaWNrJyxmdW5jdGlvbigpe2QzLnNlbGVjdCgnI3Byb3AtcGFuZWwnKS5zdHlsZSgndmlzaWJpbGl0eScsJ2hpZGRlbicpO2QzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTt9KTtcclxuXHJcblx0Ly8gbm9kZemWk+aOpee2mmxpbmXmj4/nlLvplqLmlbBcclxuXHRsaW5lID0gZDMuc3ZnLmxpbmUoKVxyXG5cdC54KGZ1bmN0aW9uKGQpe3JldHVybiBkLnh9KVxyXG5cdC55KGZ1bmN0aW9uKGQpe3JldHVybiBkLnl9KVxyXG5cdC5pbnRlcnBvbGF0ZSgnYmFzaXMnKTtcclxuXHJcblx0Ly8gRE9N44Grc3Zn44Ko44Os44Oh44Oz44OI44KS5oy/5YWlXHRcclxuXHRzdmcgPSBkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHRcdC5hcHBlbmQoJ3N2ZycpXHJcblx0XHQuYXR0cih7ICd3aWR0aCc6IHdpbmRvdy5pbm5lcldpZHRoLCAnaGVpZ2h0Jzogd2luZG93LmlubmVySGVpZ2h0IH0pO1xyXG5cclxuXHQvLyDjg47jg7zjg4njgYzlhaXjgovjgrDjg6vjg7zjg5dcclxuXHRub2RlR3JvdXAgPSBzdmcuYXBwZW5kKCdnJyk7XHJcblx0Ly8g44Op44Kk44Oz44GM5YWl44KL44Kw44Or44O844OXXHJcblx0bGluZUdyb3VwID0gc3ZnLmFwcGVuZCgnZycpO1xyXG5cdFxyXG5cdC8vIGJvZHnlsZ7mgKfjgavmjL/lhaVcclxuXHRhdWRpb05vZGVDcmVhdG9ycyA9IFxyXG5cdFtcclxuXHRcdHtuYW1lOidHYWluJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUdhaW4uYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidEZWxheScsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVEZWxheS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0F1ZGlvQnVmZmVyU291cmNlJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J01lZGlhRWxlbWVudEF1ZGlvU291cmNlJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhRWxlbWVudFNvdXJjZS5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J1Bhbm5lcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVQYW5uZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidDb252b2x2ZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQ29udm9sdmVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQW5hbHlzZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQW5hbHlzZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidDaGFubmVsU3BsaXR0ZXInLGNyZWF0ZTphdWRpby5jdHguY3JlYXRlQ2hhbm5lbFNwbGl0dGVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonQ2hhbm5lbE1lcmdlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVDaGFubmVsTWVyZ2VyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonRHluYW1pY3NDb21wcmVzc29yJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3Nvci5iaW5kKGF1ZGlvLmN0eCl9LFxyXG5cdFx0e25hbWU6J0JpcXVhZEZpbHRlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVCaXF1YWRGaWx0ZXIuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidPc2NpbGxhdG9yJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU9zY2lsbGF0b3IuYmluZChhdWRpby5jdHgpfSxcclxuXHRcdHtuYW1lOidNZWRpYVN0cmVhbUF1ZGlvU291cmNlJyxjcmVhdGU6YXVkaW8uY3R4LmNyZWF0ZU1lZGlhU3RyZWFtU291cmNlLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonV2F2ZVNoYXBlcicsY3JlYXRlOmF1ZGlvLmN0eC5jcmVhdGVXYXZlU2hhcGVyLmJpbmQoYXVkaW8uY3R4KX0sXHJcblx0XHR7bmFtZTonRUcnLGNyZWF0ZTooKT0+bmV3IGF1ZGlvLkVHKCl9LFxyXG5cdFx0e25hbWU6J1NlcXVlbmNlcicsY3JlYXRlOigpPT5uZXcgYXVkaW8uU2VxdWVuY2VyKCksZWRpdG9yOnNob3dTZXF1ZW5jZUVkaXRvcn1cclxuXHRdO1xyXG5cdFxyXG5cdGlmKGF1ZGlvLmN0eC5jcmVhdGVNZWRpYVN0cmVhbURlc3RpbmF0aW9uKXtcclxuXHRcdGF1ZGlvTm9kZUNyZWF0b3JzLnB1c2goe25hbWU6J01lZGlhU3RyZWFtQXVkaW9EZXN0aW5hdGlvbicsXHJcblx0XHRcdGNyZWF0ZTphdWRpby5jdHguY3JlYXRlTWVkaWFTdHJlYW1EZXN0aW5hdGlvbi5iaW5kKGF1ZGlvLmN0eClcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHQuZGF0dW0oe30pXHJcblx0Lm9uKCdjb250ZXh0bWVudScsZnVuY3Rpb24oKXtcclxuXHRcdHNob3dBdWRpb05vZGVQYW5lbCh0aGlzKTtcclxuXHR9KTtcclxufVxyXG5cclxuLy8g5o+P55S7XHJcbmV4cG9ydCBmdW5jdGlvbiBkcmF3KCkge1xyXG5cdC8vIEF1ZGlvTm9kZeOBruaPj+eUu1xyXG5cdHZhciBnZCA9IG5vZGVHcm91cC5zZWxlY3RBbGwoJ2cnKS5cclxuXHRkYXRhKGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2RlcyxmdW5jdGlvbihkKXtyZXR1cm4gZC5pZDt9KTtcclxuXHJcblx0Ly8g55+p5b2i44Gu5pu05pawXHJcblx0Z2Quc2VsZWN0KCdyZWN0JylcclxuXHQuYXR0cih7ICd3aWR0aCc6IChkKT0+IGQud2lkdGgsICdoZWlnaHQnOiAoZCk9PiBkLmhlaWdodCB9KTtcclxuXHRcclxuXHQvLyBBdWRpb05vZGXnn6nlvaLjgrDjg6vjg7zjg5dcclxuXHR2YXIgZyA9IGdkLmVudGVyKClcclxuXHQuYXBwZW5kKCdnJyk7XHJcblx0Ly8gQXVkaW9Ob2Rl55+p5b2i44Kw44Or44O844OX44Gu5bqn5qiZ5L2N572u44K744OD44OIXHJcblx0Z2QuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24gKGQpIHsgcmV0dXJuICd0cmFuc2xhdGUoJyArIChkLnggLSBkLndpZHRoIC8gMikgKyAnLCcgKyAoZC55IC0gZC5oZWlnaHQgLyAyKSArICcpJyB9KTtcdFxyXG5cclxuXHQvLyBBdWRpb05vZGXnn6nlvaJcclxuXHRnLmFwcGVuZCgncmVjdCcpXHJcblx0LmNhbGwoZHJhZylcclxuXHQuYXR0cih7ICd3aWR0aCc6IChkKT0+IGQud2lkdGgsICdoZWlnaHQnOiAoZCk9PiBkLmhlaWdodCwgJ2NsYXNzJzogJ2F1ZGlvTm9kZScgfSlcclxuXHQuY2xhc3NlZCgncGxheScsZnVuY3Rpb24oZCl7XHJcblx0XHRyZXR1cm4gZC5zdGF0dXNQbGF5ID09PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZSU5HO1xyXG5cdH0pXHJcblx0Lm9uKCdjb250ZXh0bWVudScsZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDjg5Hjg6njg6Hjg7zjgr/nt6jpm4bnlLvpnaLjga7ooajnpLpcclxuXHRcdGQuZWRpdG9yKCk7XHJcblx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHR9KVxyXG5cdC5vbignY2xpY2sucmVtb3ZlJyxmdW5jdGlvbihkKXtcclxuXHRcdC8vIOODjuODvOODieOBruWJiumZpFxyXG5cdFx0aWYoZDMuZXZlbnQuc2hpZnRLZXkpe1xyXG5cdFx0XHRkLnBhbmVsICYmIGQucGFuZWwuaXNTaG93ICYmIGQucGFuZWwuZGlzcG9zZSgpO1xyXG5cdFx0XHR0cnkge1xyXG5cdFx0XHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKGQpO1xyXG5cdFx0XHRcdGRyYXcoKTtcclxuXHRcdFx0fSBjYXRjaChlKSB7XHJcbi8vXHRcdFx0XHRkaWFsb2cudGV4dChlLm1lc3NhZ2UpLm5vZGUoKS5zaG93KHdpbmRvdy5pbm5lcldpZHRoLzIsd2luZG93LmlubmVySGVpZ2h0LzIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHR9KVxyXG5cdC5maWx0ZXIoZnVuY3Rpb24oZCl7XHJcblx0XHQvLyDpn7PmupDjga7jgb/jgavjg5XjgqPjg6vjgr9cclxuXHRcdHJldHVybiBkLmF1ZGlvTm9kZSBpbnN0YW5jZW9mIE9zY2lsbGF0b3JOb2RlIHx8IGQuYXVkaW9Ob2RlIGluc3RhbmNlb2YgQXVkaW9CdWZmZXJTb3VyY2VOb2RlIHx8IGQuYXVkaW9Ob2RlIGluc3RhbmNlb2YgTWVkaWFFbGVtZW50QXVkaW9Tb3VyY2VOb2RlOyBcclxuXHR9KVxyXG5cdC5vbignY2xpY2snLGZ1bmN0aW9uKGQpe1xyXG5cdFx0Ly8g5YaN55Sf44O75YGc5q2iXHJcblx0XHRjb25zb2xlLmxvZyhkMy5ldmVudCk7XHJcblx0XHRkMy5ldmVudC5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG5cdFx0ZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0XHRpZighZDMuZXZlbnQuY3RybEtleSl7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGxldCBzZWwgPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHRpZihkLnN0YXR1c1BsYXkgPT09IGF1ZGlvLlNUQVRVU19QTEFZX1BMQVlJTkcpe1xyXG5cdFx0XHRkLnN0YXR1c1BsYXkgPSBhdWRpby5TVEFUVVNfUExBWV9QTEFZRUQ7XHJcblx0XHRcdHNlbC5jbGFzc2VkKCdwbGF5JyxmYWxzZSk7XHJcblx0XHRcdGQuYXVkaW9Ob2RlLnN0b3AoMCk7XHJcblx0XHR9IGVsc2UgaWYoZC5zdGF0dXNQbGF5ICE9PSBhdWRpby5TVEFUVVNfUExBWV9QTEFZRUQpe1xyXG5cdFx0XHRkLmF1ZGlvTm9kZS5zdGFydCgwKTtcclxuXHRcdFx0ZC5zdGF0dXNQbGF5ID0gYXVkaW8uU1RBVFVTX1BMQVlfUExBWUlORztcclxuXHRcdFx0c2VsLmNsYXNzZWQoJ3BsYXknLHRydWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0YWxlcnQoJ+S4gOW6puWBnOatouOBmeOCi+OBqOWGjeeUn+OBp+OBjeOBvuOBm+OCk+OAgicpO1xyXG5cdFx0fVxyXG5cdH0pXHJcblx0LmNhbGwodG9vbHRpcCgnQ3RybCArIENsaWNrIOOBp+WGjeeUn+ODu+WBnOatoicpKTtcclxuXHQ7XHJcblx0XHJcblx0Ly8gQXVkaW9Ob2Rl44Gu44Op44OZ44OrXHJcblx0Zy5hcHBlbmQoJ3RleHQnKVxyXG5cdC5hdHRyKHsgeDogMCwgeTogLTEwLCAnY2xhc3MnOiAnbGFiZWwnIH0pXHJcblx0LnRleHQoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQubmFtZTsgfSk7XHJcblxyXG5cdC8vIOWFpeWKm0F1ZGlvUGFyYW3jga7ooajnpLpcdFxyXG5cdGdkLmVhY2goZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcyk7XHJcblx0XHR2YXIgZ3AgPSBzZWwuYXBwZW5kKCdnJyk7XHJcblx0XHR2YXIgZ3BkID0gZ3Auc2VsZWN0QWxsKCdnJylcclxuXHRcdC5kYXRhKGQuaW5wdXRQYXJhbXMubWFwKChkKT0+e1xyXG5cdFx0XHRyZXR1cm4ge25vZGU6ZC5BdWRpb05vZGVWaWV3LGluZGV4OmR9O1xyXG5cdFx0fSksZnVuY3Rpb24oZCl7cmV0dXJuIGQuaW5kZXguaWQ7fSk7XHRcdFxyXG5cclxuXHRcdHZhciBncGRnID0gZ3BkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKTtcclxuXHRcdFxyXG5cdFx0Z3BkZy5hcHBlbmQoJ2NpcmNsZScpXHJcblx0XHQuYXR0cih7J3InOiAoZCk9PmQuaW5kZXgud2lkdGgvMiwgXHJcblx0XHRjeDogMCwgY3k6IChkLCBpKT0+IHsgcmV0dXJuIGQuaW5kZXgueTsgfSxcclxuXHRcdCdjbGFzcyc6IGZ1bmN0aW9uKGQpIHtcclxuXHRcdFx0aWYoZC5pbmRleCBpbnN0YW5jZW9mIGF1ZGlvLkF1ZGlvUGFyYW1WaWV3KXtcclxuXHRcdFx0XHRyZXR1cm4gJ2F1ZGlvLXBhcmFtJztcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gJ3BhcmFtJztcclxuXHRcdH19KTtcclxuXHRcdFxyXG5cdFx0Z3BkZy5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0LmF0dHIoe3g6IChkKT0+IChkLmluZGV4LnggKyBkLmluZGV4LndpZHRoIC8gMiArIDUpLHk6KGQpPT5kLmluZGV4LnksJ2NsYXNzJzonbGFiZWwnIH0pXHJcblx0XHQudGV4dCgoZCk9PmQuaW5kZXgubmFtZSk7XHJcblxyXG5cdFx0Z3BkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cclxuXHQvLyDlh7rliptQYXJhbeOBruihqOekulx0XHJcblx0Z2QuZWFjaChmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCh0aGlzKTtcclxuXHRcdHZhciBncCA9IHNlbC5hcHBlbmQoJ2cnKTtcclxuXHRcdFxyXG5cdFx0XHJcblx0XHRcclxuXHRcdHZhciBncGQgPSBncC5zZWxlY3RBbGwoJ2cnKVxyXG5cdFx0LmRhdGEoZC5vdXRwdXRQYXJhbXMubWFwKChkKT0+e1xyXG5cdFx0XHRyZXR1cm4ge25vZGU6ZC5BdWRpb05vZGVWaWV3LGluZGV4OmR9O1xyXG5cdFx0fSksZnVuY3Rpb24oZCl7cmV0dXJuIGQuaW5kZXguaWQ7fSk7XHJcblx0XHRcclxuXHRcdHZhciBncGRnID0gZ3BkLmVudGVyKClcclxuXHRcdC5hcHBlbmQoJ2cnKTtcclxuXHJcblx0XHRncGRnLmFwcGVuZCgnY2lyY2xlJylcclxuXHRcdC5hdHRyKHsncic6IChkKT0+ZC5pbmRleC53aWR0aC8yLCBcclxuXHRcdGN4OiBkLndpZHRoLCBjeTogKGQsIGkpPT4geyByZXR1cm4gZC5pbmRleC55OyB9LFxyXG5cdFx0J2NsYXNzJzogJ3BhcmFtJ30pXHJcblx0XHQuY2FsbChkcmFnT3V0KTtcclxuXHRcdFxyXG5cdFx0Z3BkZy5hcHBlbmQoJ3RleHQnKVxyXG5cdFx0LmF0dHIoe3g6IChkKT0+IChkLmluZGV4LnggKyBkLmluZGV4LndpZHRoIC8gMiArIDUpLHk6KGQpPT5kLmluZGV4LnksJ2NsYXNzJzonbGFiZWwnIH0pXHJcblx0XHQudGV4dCgoZCk9PmQuaW5kZXgubmFtZSk7XHJcblxyXG5cdFx0Z3BkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHRcdFxyXG5cdH0pO1xyXG5cclxuXHQvLyDlh7rlipvooajnpLpcclxuXHRnZC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcclxuXHRcdHJldHVybiBkLm51bWJlck9mT3V0cHV0cyA+IDA7XHJcblx0fSlcclxuXHQuZWFjaChmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QodGhpcykuYXBwZW5kKCdnJyk7XHJcblx0XHRpZighZC50ZW1wLm91dHMgfHwgKGQudGVtcC5vdXRzICYmIChkLnRlbXAub3V0cy5sZW5ndGggPCBkLm51bWJlck9mT3V0cHV0cykpKVxyXG5cdFx0e1xyXG5cdFx0XHRkLnRlbXAub3V0cyA9IFtdO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwO2kgPCBkLm51bWJlck9mT3V0cHV0czsrK2kpe1xyXG5cdFx0XHRcdGQudGVtcC5vdXRzLnB1c2goe25vZGU6ZCxpbmRleDppfSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHZhciBzZWwxID0gc2VsLnNlbGVjdEFsbCgnZycpO1xyXG5cdFx0dmFyIHNlbGQgPSBzZWwxLmRhdGEoZC50ZW1wLm91dHMpO1xyXG5cclxuXHRcdHNlbGQuZW50ZXIoKVxyXG5cdFx0LmFwcGVuZCgnZycpXHJcblx0XHQuYXBwZW5kKCdyZWN0JylcclxuXHRcdC5hdHRyKHsgeDogZC53aWR0aCAtIHVpLnBvaW50U2l6ZSAvIDIsIHk6IChkMSk9PiAoZC5vdXRwdXRTdGFydFkgKyBkMS5pbmRleCAqIDIwIC0gdWkucG9pbnRTaXplIC8gMiksIHdpZHRoOiB1aS5wb2ludFNpemUsIGhlaWdodDogdWkucG9pbnRTaXplLCAnY2xhc3MnOiAnb3V0cHV0JyB9KVxyXG5cdFx0LmNhbGwoZHJhZ091dCk7XHJcblx0XHRzZWxkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHJcblx0Ly8g5YWl5Yqb6KGo56S6XHJcblx0Z2RcclxuXHQuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XHRyZXR1cm4gZC5udW1iZXJPZklucHV0cyA+IDA7IH0pXHJcblx0LmVhY2goZnVuY3Rpb24oZCl7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KHRoaXMpLmFwcGVuZCgnZycpO1xyXG5cdFx0aWYoIWQudGVtcC5pbnMgfHwgKGQudGVtcC5pbnMgJiYgKGQudGVtcC5pbnMubGVuZ3RoIDwgZC5udW1iZXJPZklucHV0cykpKVxyXG5cdFx0e1xyXG5cdFx0XHRkLnRlbXAuaW5zID0gW107XHJcblx0XHRcdGZvcih2YXIgaSA9IDA7aSA8IGQubnVtYmVyT2ZJbnB1dHM7KytpKXtcclxuXHRcdFx0XHRkLnRlbXAuaW5zLnB1c2goe25vZGU6ZCxpbmRleDppfSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHZhciBzZWwxID0gc2VsLnNlbGVjdEFsbCgnZycpO1xyXG5cdFx0dmFyIHNlbGQgPSBzZWwxLmRhdGEoZC50ZW1wLmlucyk7XHJcblxyXG5cdFx0c2VsZC5lbnRlcigpXHJcblx0XHQuYXBwZW5kKCdnJylcclxuXHRcdC5hcHBlbmQoJ3JlY3QnKVxyXG5cdFx0LmF0dHIoeyB4OiAtIHVpLnBvaW50U2l6ZSAvIDIsIHk6IChkMSk9PiAoZC5pbnB1dFN0YXJ0WSArIGQxLmluZGV4ICogMjAgLSB1aS5wb2ludFNpemUgLyAyKSwgd2lkdGg6IHVpLnBvaW50U2l6ZSwgaGVpZ2h0OiB1aS5wb2ludFNpemUsICdjbGFzcyc6ICdpbnB1dCcgfSlcclxuXHRcdC5vbignbW91c2VlbnRlcicsZnVuY3Rpb24oZCl7XHJcblx0XHRcdG1vdXNlT3Zlck5vZGUgPSB7bm9kZTpkLmF1ZGlvTm9kZV8scGFyYW06ZH07XHJcblx0XHR9KVxyXG5cdFx0Lm9uKCdtb3VzZWxlYXZlJyxmdW5jdGlvbihkKXtcclxuXHRcdFx0aWYobW91c2VPdmVyTm9kZS5ub2RlKXtcclxuXHRcdFx0XHRpZihtb3VzZU92ZXJOb2RlLm5vZGUgPT09IGQuYXVkaW9Ob2RlXyAmJiBtb3VzZU92ZXJOb2RlLnBhcmFtID09PSBkKXtcclxuXHRcdFx0XHRcdG1vdXNlT3Zlck5vZGUgPSBudWxsO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRzZWxkLmV4aXQoKS5yZW1vdmUoKTtcclxuXHR9KTtcclxuXHRcclxuXHQvLyDkuI3opoHjgarjg47jg7zjg4njga7liYrpmaRcclxuXHRnZC5leGl0KCkucmVtb3ZlKCk7XHJcblx0XHRcclxuXHQvLyBsaW5lIOaPj+eUu1xyXG5cdHZhciBsZCA9IGxpbmVHcm91cC5zZWxlY3RBbGwoJ3BhdGgnKVxyXG5cdC5kYXRhKGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucyk7XHJcblxyXG5cdGxkLmVudGVyKClcclxuXHQuYXBwZW5kKCdwYXRoJyk7XHJcblxyXG5cdGxkLmVhY2goZnVuY3Rpb24gKGQpIHtcclxuXHRcdHZhciBwYXRoID0gZDMuc2VsZWN0KHRoaXMpO1xyXG5cdFx0dmFyIHgxLHkxLHgyLHkyO1xyXG5cclxuXHRcdC8vIHgxLHkxXHJcblx0XHRpZihkLmZyb20ucGFyYW0pe1xyXG5cdFx0XHRpZihkLmZyb20ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5QYXJhbVZpZXcpe1xyXG5cdFx0XHRcdHgxID0gZC5mcm9tLm5vZGUueCAtIGQuZnJvbS5ub2RlLndpZHRoIC8gMiArIGQuZnJvbS5wYXJhbS54O1xyXG5cdFx0XHRcdHkxID0gZC5mcm9tLm5vZGUueSAtIGQuZnJvbS5ub2RlLmhlaWdodCAvMiArIGQuZnJvbS5wYXJhbS55OyBcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR4MSA9IGQuZnJvbS5ub2RlLnggKyBkLmZyb20ubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdFx0eTEgPSBkLmZyb20ubm9kZS55IC0gZC5mcm9tLm5vZGUuaGVpZ2h0IC8yICsgZC5mcm9tLm5vZGUub3V0cHV0U3RhcnRZICsgZC5mcm9tLnBhcmFtICogMjA7IFxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR4MSA9IGQuZnJvbS5ub2RlLnggKyBkLmZyb20ubm9kZS53aWR0aCAvIDI7XHJcblx0XHRcdHkxID0gZC5mcm9tLm5vZGUueSAtIGQuZnJvbS5ub2RlLmhlaWdodCAvMiArIGQuZnJvbS5ub2RlLm91dHB1dFN0YXJ0WTtcclxuXHRcdH1cclxuXHJcblx0XHR4MiA9IGQudG8ubm9kZS54IC0gZC50by5ub2RlLndpZHRoIC8gMjtcclxuXHRcdHkyID0gZC50by5ub2RlLnkgLSBkLnRvLm5vZGUuaGVpZ2h0IC8gMjtcclxuXHRcdFxyXG5cdFx0aWYoZC50by5wYXJhbSl7XHJcblx0XHRcdGlmKGQudG8ucGFyYW0gaW5zdGFuY2VvZiBhdWRpby5BdWRpb1BhcmFtVmlldyB8fCBkLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0XHR4MiArPSBkLnRvLnBhcmFtLng7XHJcblx0XHRcdFx0eTIgKz0gZC50by5wYXJhbS55O1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHkyICs9ICBkLnRvLm5vZGUuaW5wdXRTdGFydFkgICsgIGQudG8ucGFyYW0gKiAyMDtcdFxyXG5cdFx0XHR9XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR5MiArPSBkLnRvLm5vZGUuaW5wdXRTdGFydFk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHZhciBwb3MgPSBtYWtlUG9zKHgxLHkxLHgyLHkyKTtcclxuXHRcdFxyXG5cdFx0cGF0aC5hdHRyKHsnZCc6bGluZShwb3MpLCdjbGFzcyc6J2xpbmUnfSk7XHJcblx0XHRwYXRoLm9uKCdjbGljaycsZnVuY3Rpb24oZCl7XHJcblx0XHRcdGlmKGQzLmV2ZW50LnNoaWZ0S2V5KXtcclxuXHRcdFx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoZC5mcm9tLGQudG8pO1xyXG5cdFx0XHRcdGQzLmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XHJcblx0XHRcdFx0ZHJhdygpO1xyXG5cdFx0XHR9IFxyXG5cdFx0fSkuY2FsbCh0b29sdGlwKCdTaGlmdCArIGNsaWNr44Gn5YmK6ZmkJykpO1xyXG5cdFx0XHJcblx0fSk7XHJcblx0bGQuZXhpdCgpLnJlbW92ZSgpO1xyXG59XHJcblxyXG4vLyDnsKHmmJN0b29sdGlw6KGo56S6XHJcbmZ1bmN0aW9uIHRvb2x0aXAobWVzKVxyXG57XHJcblx0cmV0dXJuIGZ1bmN0aW9uKGQpe1xyXG5cdFx0dGhpc1xyXG5cdFx0Lm9uKCdtb3VzZWVudGVyJyxmdW5jdGlvbigpe1xyXG5cdFx0XHRzdmcuYXBwZW5kKCd0ZXh0JylcclxuXHRcdFx0LmF0dHIoeydjbGFzcyc6J3RpcCcseDpkMy5ldmVudC54ICsgMjAgLHk6ZDMuZXZlbnQueSAtIDIwfSlcclxuXHRcdFx0LnRleHQobWVzKTtcclxuXHRcdH0pXHJcblx0XHQub24oJ21vdXNlbGVhdmUnLGZ1bmN0aW9uKCl7XHJcblx0XHRcdHN2Zy5zZWxlY3RBbGwoJy50aXAnKS5yZW1vdmUoKTtcclxuXHRcdH0pXHJcblx0fTtcclxufVxyXG5cclxuLy8g5o6l57aa57ea44Gu5bqn5qiZ55Sf5oiQXHJcbmZ1bmN0aW9uIG1ha2VQb3MoeDEseTEseDIseTIpe1xyXG5cdHJldHVybiBbXHJcblx0XHRcdHt4OngxLHk6eTF9LFxyXG5cdFx0XHR7eDp4MSArICh4MiAtIHgxKS80LHk6eTF9LFxyXG5cdFx0XHR7eDp4MSArICh4MiAtIHgxKS8yLHk6eTEgKyAoeTIgLSB5MSkvMn0sXHJcblx0XHRcdHt4OngxICsgKHgyIC0geDEpKjMvNCx5OnkyfSxcclxuXHRcdFx0e3g6eDIsIHk6eTJ9XHJcblx0XHRdO1xyXG59XHJcblxyXG4vLyDjg5fjg63jg5Hjg4bjgqPjg5Hjg43jg6vjga7ooajnpLpcclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dQYW5lbChkKXtcclxuXHJcblx0ZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHRkMy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cdGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG5cdGlmKGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cpIHJldHVybiA7XHJcblxyXG5cdGQucGFuZWwgPSBuZXcgdWkuUGFuZWwoKTtcclxuXHRkLnBhbmVsLnggPSBkLng7XHJcblx0ZC5wYW5lbC55ID0gZC55O1xyXG5cdGQucGFuZWwuaGVhZGVyLnRleHQoZC5uYW1lKTtcclxuXHRcclxuXHR2YXIgdGFibGUgPSBkLnBhbmVsLmFydGljbGUuYXBwZW5kKCd0YWJsZScpO1xyXG5cdHZhciB0Ym9keSA9IHRhYmxlLmFwcGVuZCgndGJvZHknKS5zZWxlY3RBbGwoJ3RyJykuZGF0YShkLnBhcmFtcyk7XHJcblx0dmFyIHRyID0gdGJvZHkuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3RyJyk7XHJcblx0dHIuYXBwZW5kKCd0ZCcpXHJcblx0LnRleHQoKGQpPT5kLm5hbWUpO1xyXG5cdHRyLmFwcGVuZCgndGQnKVxyXG5cdC5hcHBlbmQoJ2lucHV0JylcclxuXHQuYXR0cih7dHlwZTpcInRleHRcIix2YWx1ZTooZCk9PmQuZ2V0KCkscmVhZG9ubHk6KGQpPT5kLnNldD9udWxsOidyZWFkb25seSd9KVxyXG5cdC5vbignY2hhbmdlJyxmdW5jdGlvbihkKXtcclxuXHRcdGxldCB2YWx1ZSA9IGQzLmV2ZW50LnRhcmdldC52YWx1ZTtcclxuXHRcdGxldCB2biA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG5cdFx0aWYoaXNOYU4odm4pKXtcclxuXHRcdFx0ZC5zZXQodmFsdWUpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZC5zZXQodm4pO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cdGQucGFuZWwuc2hvdygpO1xyXG5cclxufVxyXG5cclxuLy8g44OO44O844OJ5oy/5YWl44OR44ON44Or44Gu6KGo56S6XHJcbmZ1bmN0aW9uIHNob3dBdWRpb05vZGVQYW5lbChkKXtcclxuXHQgZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHQgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcblx0aWYoZC5wYW5lbCl7XHJcblx0XHRpZihkLnBhbmVsLmlzU2hvdylcclxuXHRcdFx0cmV0dXJuO1xyXG5cdH1cclxuXHRcclxuXHRkLnBhbmVsID0gbmV3IHVpLlBhbmVsKCk7XHJcblx0ZC5wYW5lbC54ID0gZDMuZXZlbnQub2Zmc2V0WDtcclxuXHRkLnBhbmVsLnkgPSBkMy5ldmVudC5vZmZzZXRZO1xyXG5cdGQucGFuZWwuaGVhZGVyLnRleHQoJ0F1ZGlvTm9kZeOBruaMv+WFpScpO1xyXG5cclxuXHR2YXIgdGFibGUgPSBkLnBhbmVsLmFydGljbGUuYXBwZW5kKCd0YWJsZScpO1xyXG5cdHZhciB0Ym9keSA9IHRhYmxlLmFwcGVuZCgndGJvZHknKS5zZWxlY3RBbGwoJ3RyJykuZGF0YShhdWRpb05vZGVDcmVhdG9ycyk7XHJcblx0dGJvZHkuZW50ZXIoKVxyXG5cdC5hcHBlbmQoJ3RyJylcclxuXHQuYXBwZW5kKCd0ZCcpXHJcblx0LnRleHQoKGQpPT5kLm5hbWUpXHJcblx0Lm9uKCdjbGljaycsZnVuY3Rpb24oZHQpe1xyXG5cdFx0Y29uc29sZS5sb2coJ+aMv+WFpScsZHQpO1xyXG5cdFx0XHJcblx0XHR2YXIgZWRpdG9yID0gZHQuZWRpdG9yIHx8IHNob3dQYW5lbDtcclxuXHRcdFxyXG5cdFx0dmFyIG5vZGUgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShkdC5jcmVhdGUoKSxlZGl0b3IpO1xyXG5cdFx0bm9kZS54ID0gZDMuZXZlbnQuY2xpZW50WDtcclxuXHRcdG5vZGUueSA9IGQzLmV2ZW50LmNsaWVudFk7XHJcblx0XHRkcmF3KCk7XHJcblx0XHQvLyBkMy5zZWxlY3QoJyNwcm9wLXBhbmVsJykuc3R5bGUoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKTtcclxuXHRcdC8vIGQucGFuZWwuZGlzcG9zZSgpO1xyXG5cdH0pO1xyXG5cdGQucGFuZWwuc2hvdygpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXVkaW9Ob2RlVmlldyhuYW1lKXtcclxuXHR2YXIgb2JqID0gYXVkaW9Ob2RlQ3JlYXRvcnMuZmluZCgoZCk9PntcclxuXHRcdGlmKGQubmFtZSA9PT0gbmFtZSkgcmV0dXJuIHRydWU7XHJcblx0fSk7XHJcblx0aWYob2JqKXtcclxuXHRcdHJldHVybiBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShvYmouY3JlYXRlKCksb2JqLmVkaXRvciB8fCBzaG93UGFuZWwpO1x0XHRcdFxyXG5cdH1cclxufVxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnLi9hdWRpbyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRUcge1xyXG5cdGNvbnN0cnVjdG9yKCl7XHJcblx0XHR0aGlzLmdhdGUgPSBuZXcgYXVkaW8uUGFyYW1WaWV3KHRoaXMsJ2dhdGUnLGZhbHNlKTtcclxuXHRcdHRoaXMub3V0cHV0ID0gbmV3IGF1ZGlvLlBhcmFtVmlldyh0aGlzLCdvdXRwdXQnLHRydWUpO1xyXG5cdFx0dGhpcy5udW1iZXJPZklucHV0cyA9IDA7XHJcblx0XHR0aGlzLm51bWJlck9mT3V0cHV0cyA9IDA7XHJcblx0XHR0aGlzLmF0dGFjayA9IDAuMDAxO1xyXG5cdFx0dGhpcy5kZWNheSA9IDAuMDU7XHJcblx0XHR0aGlzLnJlbGVhc2UgPSAwLjA1O1xyXG5cdFx0dGhpcy5zdXN0YWluID0gMC4yO1xyXG5cdFx0dGhpcy5nYWluID0gMS4wO1xyXG5cdFx0dGhpcy5uYW1lID0gJ0VHJztcclxuXHRcdGF1ZGlvLmRlZklzTm90QVBJT2JqKHRoaXMsZmFsc2UpO1xyXG5cdFx0dGhpcy5vdXRwdXRzID0gW107XHJcblx0fVxyXG5cdFxyXG4gIHRvSlNPTigpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTp0aGlzLm5hbWUsXHJcbiAgICAgIGF0dGFjazp0aGlzLmF0dGFjayxcclxuICAgICAgZGVjYXk6dGhpcy5kZWNheSxcclxuICAgICAgcmVsZWFzZTp0aGlzLnJlbGVhc2UsXHJcbiAgICAgIHN1c3RhaW46dGhpcy5zdXN0YWluLFxyXG4gICAgICBnYWluOnRoaXMuZ2FpblxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBmcm9tSlNPTihvKXtcclxuICAgIGxldCByZXQgPSBuZXcgRUcoKTtcclxuICAgIHJldC5uYW1lID0gby5uYW1lO1xyXG4gICAgcmV0LmF0dGFjayA9IG8uYXR0YWNrO1xyXG4gICAgcmV0LmRlY2F5ID0gby5kZWNheTtcclxuICAgIHJldC5yZWxlYXNlID0gby5yZWxlYXNlO1xyXG4gICAgcmV0LnN1c3RhaW4gPSBvLnN1c3RhaW47XHJcbiAgICByZXQuZ2FpbiA9IG8uZ2FpbjtcclxuICAgIHJldHVybiByZXQ7XHJcbiAgfVxyXG4gIFxyXG5cdGNvbm5lY3QoYylcclxuXHR7XHJcblx0XHRpZighIChjLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uQXVkaW9QYXJhbVZpZXcpKXtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdBdWRpb1BhcmFt5Lul5aSW44Go44Gv5o6l57aa44Gn44GN44G+44Gb44KT44CCJyk7XHJcblx0XHR9XHJcblx0XHRjLnRvLnBhcmFtLmF1ZGlvUGFyYW0udmFsdWUgPSAwO1xyXG5cdFx0dGhpcy5vdXRwdXRzLnB1c2goYy50byk7XHJcblx0fVxyXG5cdFxyXG5cdGRpc2Nvbm5lY3QoYyl7XHJcblx0XHRmb3IodmFyIGkgPSAwO2kgPCB0aGlzLm91dHB1dHMubGVuZ3RoOysraSl7XHJcblx0XHRcdGlmKGMudG8ubm9kZSA9PT0gdGhpcy5vdXRwdXRzW2ldLm5vZGUgJiYgYy50by5wYXJhbSA9PT0gdGhpcy5vdXRwdXRzW2ldLnBhcmFtKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dGhpcy5vdXRwdXRzLnNwbGljZShpLS0sMSk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHRcclxuXHRwcm9jZXNzKHRvLGNvbSx2LHQpXHJcblx0e1xyXG5cdFx0aWYodiA+IDApIHtcclxuXHRcdFx0Ly8ga2V5b25cclxuXHRcdFx0Ly8gQURT44G+44Gn44KC44Gj44Gm44GE44GPXHJcblx0XHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdrZXlvbicsY29tLHYsdCk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLnNldFZhbHVlQXRUaW1lKDAsdCk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHYgKiB0aGlzLmdhaW4gLHQgKyB0aGlzLmF0dGFjayk7XHJcblx0XHRcdFx0ZC5wYXJhbS5hdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYgKiB0aGlzLmdhaW4gLHQgKyB0aGlzLmF0dGFjayArIHRoaXMuZGVjYXkgKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvLyBrZXlvZmZcclxuXHRcdFx0Ly8g44Oq44Oq44O844K5XHJcblx0XHRcdHRoaXMub3V0cHV0cy5mb3JFYWNoKChkKT0+e1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCdrZXlvZmYnLGNvbSx2LHQpO1xyXG5cdFx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLHQgKyB0aGlzLnJlbGVhc2UpO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0c3RvcCgpe1xyXG5cdFx0dGhpcy5vdXRwdXRzLmZvckVhY2goKGQpPT57XHJcblx0XHRcdGNvbnNvbGUubG9nKCdzdG9wJyk7XHJcblx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcblx0XHRcdGQucGFyYW0uYXVkaW9QYXJhbS5zZXRWYWx1ZUF0VGltZSgwLDApO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cdFxyXG5cdHBhdXNlKCl7XHJcblx0XHRcclxuXHR9XHJcblx0XHJcbn1cclxuXHJcbi8vIC8vLyDjgqjjg7Pjg5njg63jg7zjg5fjgrjjgqfjg43jg6zjg7zjgr/jg7xcclxuLy8gZnVuY3Rpb24gRW52ZWxvcGVHZW5lcmF0b3Iodm9pY2UsIGF0dGFjaywgZGVjYXksIHN1c3RhaW4sIHJlbGVhc2UpIHtcclxuLy8gICB0aGlzLnZvaWNlID0gdm9pY2U7XHJcbi8vICAgLy90aGlzLmtleW9uID0gZmFsc2U7XHJcbi8vICAgdGhpcy5hdHRhY2sgPSBhdHRhY2sgfHwgMC4wMDA1O1xyXG4vLyAgIHRoaXMuZGVjYXkgPSBkZWNheSB8fCAwLjA1O1xyXG4vLyAgIHRoaXMuc3VzdGFpbiA9IHN1c3RhaW4gfHwgMC41O1xyXG4vLyAgIHRoaXMucmVsZWFzZSA9IHJlbGVhc2UgfHwgMC41O1xyXG4vLyB9O1xyXG4vLyBcclxuLy8gRW52ZWxvcGVHZW5lcmF0b3IucHJvdG90eXBlID1cclxuLy8ge1xyXG4vLyAgIGtleW9uOiBmdW5jdGlvbiAodCx2ZWwpIHtcclxuLy8gICAgIHRoaXMudiA9IHZlbCB8fCAxLjA7XHJcbi8vICAgICB2YXIgdiA9IHRoaXMudjtcclxuLy8gICAgIHZhciB0MCA9IHQgfHwgdGhpcy52b2ljZS5hdWRpb2N0eC5jdXJyZW50VGltZTtcclxuLy8gICAgIHZhciB0MSA9IHQwICsgdGhpcy5hdHRhY2sgKiB2O1xyXG4vLyAgICAgdmFyIGdhaW4gPSB0aGlzLnZvaWNlLmdhaW4uZ2FpbjtcclxuLy8gICAgIGdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHQwKTtcclxuLy8gICAgIGdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdDApO1xyXG4vLyAgICAgZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2LCB0MSk7XHJcbi8vICAgICBnYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuc3VzdGFpbiAqIHYsIHQwICsgdGhpcy5kZWNheSAvIHYpO1xyXG4vLyAgICAgLy9nYWluLnNldFRhcmdldEF0VGltZSh0aGlzLnN1c3RhaW4gKiB2LCB0MSwgdDEgKyB0aGlzLmRlY2F5IC8gdik7XHJcbi8vICAgfSxcclxuLy8gICBrZXlvZmY6IGZ1bmN0aW9uICh0KSB7XHJcbi8vICAgICB2YXIgdm9pY2UgPSB0aGlzLnZvaWNlO1xyXG4vLyAgICAgdmFyIGdhaW4gPSB2b2ljZS5nYWluLmdhaW47XHJcbi8vICAgICB2YXIgdDAgPSB0IHx8IHZvaWNlLmF1ZGlvY3R4LmN1cnJlbnRUaW1lO1xyXG4vLyAgICAgZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModDApO1xyXG4vLyAgICAgLy9nYWluLnNldFZhbHVlQXRUaW1lKDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICAgIC8vZ2Fpbi5zZXRUYXJnZXRBdFRpbWUoMCwgdDAsIHQwICsgdGhpcy5yZWxlYXNlIC8gdGhpcy52KTtcclxuLy8gICAgIGdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdDAgKyB0aGlzLnJlbGVhc2UgLyB0aGlzLnYpO1xyXG4vLyAgIH1cclxuLy8gfTsiLCIndXNlIHN0cmljdCc7XG5cbi8vXG4vLyBXZSBzdG9yZSBvdXIgRUUgb2JqZWN0cyBpbiBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBgfmAgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Qgb3ZlcnJpZGRlbiBvclxuLy8gdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy8gV2UgYWxzbyBhc3N1bWUgdGhhdCBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgYXZhaWxhYmxlIHdoZW4gdGhlIGV2ZW50IG5hbWVcbi8vIGlzIGFuIEVTNiBTeW1ib2wuXG4vL1xudmFyIHByZWZpeCA9IHR5cGVvZiBPYmplY3QuY3JlYXRlICE9PSAnZnVuY3Rpb24nID8gJ34nIDogZmFsc2U7XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgRXZlbnRFbWl0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBDb250ZXh0IGZvciBmdW5jdGlvbiBleGVjdXRpb24uXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSBlbWl0IG9uY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xuICB0aGlzLmZuID0gZm47XG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XG59XG5cbi8qKlxuICogTWluaW1hbCBFdmVudEVtaXR0ZXIgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7IC8qIE5vdGhpbmcgdG8gc2V0ICovIH1cblxuLyoqXG4gKiBIb2xkcyB0aGUgYXNzaWduZWQgRXZlbnRFbWl0dGVycyBieSBuYW1lLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKiBAcHJpdmF0ZVxuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJuIGEgbGlzdCBvZiBhc3NpZ25lZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudHMgdGhhdCBzaG91bGQgYmUgbGlzdGVkLlxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgV2Ugb25seSBuZWVkIHRvIGtub3cgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgbGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgICAsIGo7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0gcHJlZml4ID8ge30gOiBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYW4gRXZlbnRMaXN0ZW5lciB0aGF0J3Mgb25seSBjYWxsZWQgb25jZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBDYWxsYmFjayBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGZ1bmN0aW9uLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXI7XG4gIGVsc2Uge1xuICAgIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbXG4gICAgICB0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBldmVudCB3ZSB3YW50IHRvIHJlbW92ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciB0aGF0IHdlIG5lZWQgdG8gZmluZC5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgbGlzdGVuZXJzIG1hdGNoaW5nIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmNlIGxpc3RlbmVycy5cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnMuZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnMub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxuICAgICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICAgKSB7XG4gICAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgLy9cbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzIG9yIG9ubHkgdGhlIGxpc3RlbmVycyBmb3IgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50IHdhbnQgdG8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuXG4gIGlmIChldmVudCkgZGVsZXRlIHRoaXMuX2V2ZW50c1twcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XTtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSBwcmVmaXggPyB7fSA6IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG5cbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWZPYnNlcnZhYmxlKHRhcmdldCxwcm9wTmFtZSxvcHQgPSB7fSlcclxue1xyXG5cdCgoKT0+e1xyXG5cdFx0dmFyIHZfO1xyXG5cdFx0b3B0LmVudW1lcmFibGUgPSBvcHQuZW51bWVyYWJsZSB8fCB0cnVlO1xyXG5cdFx0b3B0LmNvbmZpZ3VyYWJsZSA9IG9wdC5jb25maWd1cmFibGUgfHwgZmFsc2U7XHJcblx0XHRvcHQuZ2V0ID0gb3B0LmdldCB8fCAoKCkgPT4gdl8pO1xyXG5cdFx0b3B0LnNldCA9IG9wdC5zZXQgfHwgKCh2KT0+e1xyXG5cdFx0XHRpZih2XyAhPSB2KXtcclxuICBcdFx0XHR2XyA9IHY7XHJcbiAgXHRcdFx0dGFyZ2V0LmVtaXQocHJvcE5hbWUgKyAnX2NoYW5nZWQnLHYpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQscHJvcE5hbWUsb3B0KTtcclxuXHR9KSgpO1xyXG59IiwiJ3VzZSBzdHJpY3QnO1xyXG5pbXBvcnQgKiBhcyBhdWRpbyBmcm9tICcuL2F1ZGlvJztcclxuaW1wb3J0ICogYXMgdWkgZnJvbSAnLi91aSc7XHJcbmltcG9ydCB7VW5kb01hbmFnZXJ9IGZyb20gJy4vdW5kbyc7XHJcblxyXG5jb25zdCBJbnB1dFR5cGUgPSB7XHJcbiAga2V5Ym9yZDogMCxcclxuICBtaWRpOiAxXHJcbn1cclxuXHJcbmNvbnN0IElucHV0Q29tbWFuZCA9XHJcbiAge1xyXG4gICAgZW50ZXI6IHsgaWQ6IDEsIG5hbWU6ICfjg47jg7zjg4jjg4fjg7zjgr/mjL/lhaUnIH0sXHJcbiAgICBlc2M6IHsgaWQ6IDIsIG5hbWU6ICfjgq3jg6Pjg7Pjgrvjg6snIH0sXHJcbiAgICByaWdodDogeyBpZDogMywgbmFtZTogJ+OCq+ODvOOCveODq+enu+WLle+8iOWPs++8iScgfSxcclxuICAgIGxlZnQ6IHsgaWQ6IDQsIG5hbWU6ICfjgqvjg7zjgr3jg6vnp7vli5XvvIjlt6bvvIknIH0sXHJcbiAgICB1cDogeyBpZDogNSwgbmFtZTogJ+OCq+ODvOOCveODq+enu+WLle+8iOS4iu+8iScgfSxcclxuICAgIGRvd246IHsgaWQ6IDYsIG5hbWU6ICfjgqvjg7zjgr3jg6vnp7vli5XvvIjkuIvvvIknIH0sXHJcbiAgICBpbnNlcnRNZWFzdXJlOiB7IGlkOiA3LCBuYW1lOiAn5bCP56+A57ea5oy/5YWlJyB9LFxyXG4gICAgdW5kbzogeyBpZDogOCwgbmFtZTogJ+OCouODs+ODieOCpScgfSxcclxuICAgIHJlZG86IHsgaWQ6IDksIG5hbWU6ICfjg6rjg4njgqUnIH0sXHJcbiAgICBwYWdlVXA6IHsgaWQ6IDEwLCBuYW1lOiAn44Oa44O844K444Ki44OD44OXJyB9LFxyXG4gICAgcGFnZURvd246IHsgaWQ6IDExLCBuYW1lOiAn44Oa44O844K444OA44Km44OzJyB9LFxyXG4gICAgaG9tZTogeyBpZDogMTIsIG5hbWU6ICflhYjpoK3ooYzjgavnp7vli5UnIH0sXHJcbiAgICBlbmQ6IHsgaWQ6IDEzLCBuYW1lOiAn57WC56uv6KGM44Gr56e75YuVJyB9LFxyXG4gICAgbnVtYmVyOiB7IGlkOiAxNCwgbmFtZTogJ+aVsOWtl+WFpeWKmycgfSxcclxuICAgIG5vdGU6IHsgaWQ6IDE1LCBuYW1lOiAn44OO44O844OI5YWl5YqbJyB9LFxyXG4gICAgc2Nyb2xsVXA6IHsgaWQ6IDE2LCBuYW1lOiAn6auY6YCf44K544Kv44Ot44O844Or44Ki44OD44OXJyB9LFxyXG4gICAgc2Nyb2xsRG93bjogeyBpZDogMTcsIG5hbWU6ICfpq5jpgJ/jgrnjgq/jg63jg7zjg6vjg4Djgqbjg7MnIH0sXHJcbiAgICBkZWxldGU6IHsgaWQ6IDE4LCBuYW1lOiAn6KGM5YmK6ZmkJyB9LFxyXG4gICAgbGluZVBhc3RlOiB7IGlkOiAxOSwgbmFtZTogJ+ihjOODmuODvOOCueODiCcgfVxyXG4gIH1cclxuXHJcbi8vXHJcbmNvbnN0IEtleUJpbmQgPVxyXG4gIHtcclxuICAgIDEzOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmVudGVyXHJcbiAgICB9XSxcclxuICAgIDI3OiBbe1xyXG4gICAgICBrZXlDb2RlOiAyNyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmVzY1xyXG4gICAgfV0sXHJcbiAgICAzMjogW3tcclxuICAgICAga2V5Q29kZTogMzIsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5yaWdodFxyXG4gICAgfV0sXHJcbiAgICAzOTogW3tcclxuICAgICAga2V5Q29kZTogMzksXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5yaWdodFxyXG4gICAgfV0sXHJcbiAgICAzNzogW3tcclxuICAgICAga2V5Q29kZTogMzcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5sZWZ0XHJcbiAgICB9XSxcclxuICAgIDM4OiBbe1xyXG4gICAgICBrZXlDb2RlOiAzOCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnVwXHJcbiAgICB9XSxcclxuICAgIDQwOiBbe1xyXG4gICAgICBrZXlDb2RlOiA0MCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmRvd25cclxuICAgIH1dLFxyXG4gICAgMTA2OiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDYsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5pbnNlcnRNZWFzdXJlXHJcbiAgICB9XSxcclxuICAgIDkwOiBbe1xyXG4gICAgICBrZXlDb2RlOiA5MCxcclxuICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQudW5kb1xyXG4gICAgfV0sXHJcbiAgICAzMzogW3tcclxuICAgICAga2V5Q29kZTogMzMsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5wYWdlVXBcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiAzMyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnNjcm9sbFVwXHJcbiAgICAgIH1dLFxyXG4gICAgODI6IFt7XHJcbiAgICAgIGtleUNvZGU6IDgyLFxyXG4gICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5wYWdlVXBcclxuICAgIH1dLFxyXG4gICAgMzQ6IFt7XHJcbiAgICAgIGtleUNvZGU6IDM0LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQucGFnZURvd25cclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiAzNCxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnNjcm9sbERvd25cclxuICAgICAgfV0sXHJcbiAgICA2NzogW3tcclxuICAgICAga2V5Q29kZTogNjcsXHJcbiAgICAgIGN0cmxLZXk6IHRydWUsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnBhZ2VEb3duXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNjcsXHJcbiAgICAgICAgbm90ZTogJ0MnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY3LFxyXG4gICAgICAgIG5vdGU6ICdDJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfV0sXHJcbiAgICAzNjogW3tcclxuICAgICAga2V5Q29kZTogMzYsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ob21lXHJcbiAgICB9XSxcclxuICAgIDM1OiBbe1xyXG4gICAgICBrZXlDb2RlOiAzNSxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLmVuZFxyXG4gICAgfV0sXHJcbiAgICA5NjogW3tcclxuICAgICAga2V5Q29kZTogOTYsXHJcbiAgICAgIG51bWJlcjogMCxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICA5NzogW3tcclxuICAgICAga2V5Q29kZTogOTcsXHJcbiAgICAgIG51bWJlcjogMSxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICA5ODogW3tcclxuICAgICAga2V5Q29kZTogOTgsXHJcbiAgICAgIG51bWJlcjogMixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICA5OTogW3tcclxuICAgICAga2V5Q29kZTogOTksXHJcbiAgICAgIG51bWJlcjogMyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICAxMDA6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwMCxcclxuICAgICAgbnVtYmVyOiA0LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDEwMTogW3tcclxuICAgICAga2V5Q29kZTogMTAxLFxyXG4gICAgICBudW1iZXI6IDUsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgMTAyOiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDIsXHJcbiAgICAgIG51bWJlcjogNixcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICAxMDM6IFt7XHJcbiAgICAgIGtleUNvZGU6IDEwMyxcclxuICAgICAgbnVtYmVyOiA3LFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubnVtYmVyXHJcbiAgICB9XSxcclxuICAgIDEwNDogW3tcclxuICAgICAga2V5Q29kZTogMTA0LFxyXG4gICAgICBudW1iZXI6IDgsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5udW1iZXJcclxuICAgIH1dLFxyXG4gICAgMTA1OiBbe1xyXG4gICAgICBrZXlDb2RlOiAxMDUsXHJcbiAgICAgIG51bWJlcjogOSxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm51bWJlclxyXG4gICAgfV0sXHJcbiAgICA2NTogW3tcclxuICAgICAga2V5Q29kZTogNjUsXHJcbiAgICAgIG5vdGU6ICdBJyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA2NSxcclxuICAgICAgICBub3RlOiAnQScsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBrZXlDb2RlOiA2NSxcclxuICAgICAgICBjdHJsS2V5OiB0cnVlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLnJlZG9cclxuICAgICAgfV0sXHJcbiAgICA2NjogW3tcclxuICAgICAga2V5Q29kZTogNjYsXHJcbiAgICAgIG5vdGU6ICdCJyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA2NixcclxuICAgICAgICBub3RlOiAnQicsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH1dLFxyXG4gICAgNjg6IFt7XHJcbiAgICAgIGtleUNvZGU6IDY4LFxyXG4gICAgICBub3RlOiAnRCcsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNjgsXHJcbiAgICAgICAgbm90ZTogJ0QnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9XSxcclxuICAgIDY5OiBbe1xyXG4gICAgICBrZXlDb2RlOiA2OSxcclxuICAgICAgbm90ZTogJ0UnLFxyXG4gICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgfSwge1xyXG4gICAgICAgIGtleUNvZGU6IDY5LFxyXG4gICAgICAgIG5vdGU6ICdFJyxcclxuICAgICAgICBjdHJsS2V5OiBmYWxzZSxcclxuICAgICAgICBzaGlmdEtleTogdHJ1ZSxcclxuICAgICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgICAgfV0sXHJcbiAgICA3MDogW3tcclxuICAgICAga2V5Q29kZTogNzAsXHJcbiAgICAgIG5vdGU6ICdGJyxcclxuICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgIHNoaWZ0S2V5OiBmYWxzZSxcclxuICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgIGlucHV0Q29tbWFuZDogSW5wdXRDb21tYW5kLm5vdGVcclxuICAgIH0sIHtcclxuICAgICAgICBrZXlDb2RlOiA3MCxcclxuICAgICAgICBub3RlOiAnRicsXHJcbiAgICAgICAgY3RybEtleTogZmFsc2UsXHJcbiAgICAgICAgc2hpZnRLZXk6IHRydWUsXHJcbiAgICAgICAgYWx0S2V5OiBmYWxzZSxcclxuICAgICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICAgIH1dLFxyXG4gICAgNzE6IFt7XHJcbiAgICAgIGtleUNvZGU6IDcxLFxyXG4gICAgICBub3RlOiAnRycsXHJcbiAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICBzaGlmdEtleTogZmFsc2UsXHJcbiAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgIG1ldGFLZXk6IGZhbHNlLFxyXG4gICAgICBpbnB1dENvbW1hbmQ6IElucHV0Q29tbWFuZC5ub3RlXHJcbiAgICB9LCB7XHJcbiAgICAgICAga2V5Q29kZTogNzEsXHJcbiAgICAgICAgbm90ZTogJ0cnLFxyXG4gICAgICAgIGN0cmxLZXk6IGZhbHNlLFxyXG4gICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxyXG4gICAgICAgIGFsdEtleTogZmFsc2UsXHJcbiAgICAgICAgbWV0YUtleTogZmFsc2UsXHJcbiAgICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubm90ZVxyXG4gICAgICB9XSxcclxuICAgIDg5OiBbe1xyXG4gICAgICBrZXlDb2RlOiA4OSxcclxuICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQuZGVsZXRlXHJcbiAgICB9XSxcclxuICAgIDc2OiBbe1xyXG4gICAgICBrZXlDb2RlOiA3NixcclxuICAgICAgY3RybEtleTogdHJ1ZSxcclxuICAgICAgc2hpZnRLZXk6IGZhbHNlLFxyXG4gICAgICBhbHRLZXk6IGZhbHNlLFxyXG4gICAgICBtZXRhS2V5OiBmYWxzZSxcclxuICAgICAgaW5wdXRDb21tYW5kOiBJbnB1dENvbW1hbmQubGluZVBhc3RlXHJcbiAgICB9XVxyXG4gIH07XHJcblxyXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VFZGl0b3Ige1xyXG4gIGNvbnN0cnVjdG9yKHNlcXVlbmNlcikge1xyXG4gICAgdmFyIHNlbGZfID0gdGhpcztcclxuICAgIHRoaXMudW5kb01hbmFnZXIgPSBuZXcgVW5kb01hbmFnZXIoKTtcclxuICAgIHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsID0gbmV3IHVpLlBhbmVsKCk7XHJcbiAgICBzZXF1ZW5jZXIucGFuZWwueCA9IHNlcXVlbmNlci54O1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLnkgPSBzZXF1ZW5jZXIueTtcclxuICAgIHNlcXVlbmNlci5wYW5lbC53aWR0aCA9IDEwMjQ7XHJcbiAgICBzZXF1ZW5jZXIucGFuZWwuaGVpZ2h0ID0gNzY4O1xyXG4gICAgc2VxdWVuY2VyLnBhbmVsLmhlYWRlci50ZXh0KCdTZXF1ZW5jZSBFZGl0b3InKTtcclxuICAgIHZhciBlZGl0b3IgPSBzZXF1ZW5jZXIucGFuZWwuYXJ0aWNsZS5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ3NlcS1lZGl0b3InLCB0cnVlKTtcclxuICAgIHZhciBkaXYgPSBlZGl0b3IuYXBwZW5kKCdkaXYnKS5jbGFzc2VkKCdoZWFkZXInLCB0cnVlKTtcclxuXHQgXHJcbiAgICAvLyDjgr/jgqTjg6Djg5njg7zjgrlcclxuICAgIGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCdUaW1lIEJhc2U6Jyk7XHJcbiAgICBkaXYuYXBwZW5kKCdpbnB1dCcpXHJcbiAgICAgIC5kYXR1bShzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRwYilcclxuICAgICAgLmF0dHIoeyAndHlwZSc6ICd0ZXh0JywgJ3NpemUnOiAnMycsICdpZCc6ICd0aW1lLWJhc2UnIH0pXHJcbiAgICAgIC5hdHRyKCd2YWx1ZScsICh2KSA9PiB2KVxyXG4gICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRwYiA9IHBhcnNlRmxvYXQoZDMuZXZlbnQudGFyZ2V0LnZhbHVlKSB8fCBkMy5zZWxlY3QodGhpcykuYXR0cigndmFsdWUnKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhbGwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUub24oJ3RwYl9jaGFuZ2VkJywgKHYpID0+IHtcclxuICAgICAgICAgIHRoaXMuYXR0cigndmFsdWUnLCB2KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG5cclxuICAgIC8vIOODhuODs+ODnVxyXG4gICAgZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJ1RlbXBvOicpO1xyXG4gICAgZGl2LmFwcGVuZCgnaW5wdXQnKVxyXG4vLyAgICAgIC5kYXR1bShzZXF1ZW5jZXIpXHJcbiAgICAgIC5hdHRyKHsgJ3R5cGUnOiAndGV4dCcsICdzaXplJzogJzMnIH0pXHJcbiAgICAgIC5hdHRyKCd2YWx1ZScsIChkKSA9PiBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJwbSlcclxuICAgICAgLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJwbSA9IHBhcnNlRmxvYXQoZDMuZXZlbnQudGFyZ2V0LnZhbHVlKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhbGwoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHNlcXVlbmNlci5hdWRpb05vZGUub24oJ2JwbV9jaGFuZ2VkJywgKHYpID0+IHtcclxuICAgICAgICAgIHRoaXMuYXR0cigndmFsdWUnLCB2KTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgZGl2LmFwcGVuZCgnc3BhbicpLnRleHQoJ0JlYXQ6Jyk7XHJcbiAgICBkaXYuYXBwZW5kKCdpbnB1dCcpXHJcbiAgICAgIC5kYXR1bShzZXF1ZW5jZXIpXHJcbiAgICAgIC5hdHRyKHsgJ3R5cGUnOiAndGV4dCcsICdzaXplJzogJzMnLCAndmFsdWUnOiAoZCkgPT4gc2VxdWVuY2VyLmF1ZGlvTm9kZS5iZWF0IH0pXHJcbiAgICAgIC5vbignY2hhbmdlJywgZnVuY3Rpb24oZCl7XHJcbiAgICAgICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS5iZWF0ID0gcGFyc2VGbG9hdChkMy5zZWxlY3QodGhpcykuYXR0cigndmFsdWUnKSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIGRpdi5hcHBlbmQoJ3NwYW4nKS50ZXh0KCcgLyAnKTtcclxuICAgIGRpdi5hcHBlbmQoJ2lucHV0JylcclxuICAgICAgLmRhdHVtKHNlcXVlbmNlcilcclxuICAgICAgLmF0dHIoeyAndHlwZSc6ICd0ZXh0JywgJ3NpemUnOiAnMycsICd2YWx1ZSc6IChkKSA9PiBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJhciB9KVxyXG4gICAgICAub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLmJhciA9IHBhcnNlRmxvYXQoZDMuc2VsZWN0KHRoaXMpLmF0dHIoJ3ZhbHVlJykpO1xyXG4gICAgICB9KTtcclxuXHJcblxyXG4gICAgLy8g44OI44Op44OD44Kv44Ko44OH44Kj44K/XHJcbiAgICBsZXQgdHJhY2tFZGl0ID0gZWRpdG9yLnNlbGVjdEFsbCgnZGl2LnRyYWNrJylcclxuICAgICAgLmRhdGEoc2VxdWVuY2VyLmF1ZGlvTm9kZS50cmFja3MpXHJcbiAgICAgIC5lbnRlcigpXHJcbiAgICAgIC5hcHBlbmQoJ2RpdicpXHJcbiAgICAgIC5jbGFzc2VkKCd0cmFjaycsIHRydWUpXHJcbiAgICAgIC5hdHRyKHsgJ2lkJzogKGQsIGkpID0+ICd0cmFjay0nICsgKGkgKyAxKSwgJ3RhYmluZGV4JzogJzAnIH0pO1xyXG5cclxuICAgIGxldCB0cmFja0hlYWRlciA9IHRyYWNrRWRpdC5hcHBlbmQoJ2RpdicpLmNsYXNzZWQoJ3RyYWNrLWhlYWRlcicsIHRydWUpO1xyXG4gICAgdHJhY2tIZWFkZXIuYXBwZW5kKCdzcGFuJykudGV4dCgoZCwgaSkgPT4gJ1RSOicgKyAoaSArIDEpKTtcclxuICAgIHRyYWNrSGVhZGVyLmFwcGVuZCgnc3BhbicpLnRleHQoJ01FQVM6Jyk7XHJcbiAgICBsZXQgdHJhY2tCb2R5ID0gdHJhY2tFZGl0LmFwcGVuZCgnZGl2JykuY2xhc3NlZCgndHJhY2stYm9keScsIHRydWUpO1xyXG4gICAgbGV0IGV2ZW50RWRpdCA9IHRyYWNrQm9keS5hcHBlbmQoJ3RhYmxlJyk7XHJcbiAgICBsZXQgaGVhZHJvdyA9IGV2ZW50RWRpdC5hcHBlbmQoJ3RoZWFkJykuYXBwZW5kKCd0cicpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnTSMnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1MjJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdOVCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnTiMnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ1NUJyk7XHJcbiAgICBoZWFkcm93LmFwcGVuZCgndGgnKS50ZXh0KCdHVCcpO1xyXG4gICAgaGVhZHJvdy5hcHBlbmQoJ3RoJykudGV4dCgnVkUnKTtcclxuICAgIGhlYWRyb3cuYXBwZW5kKCd0aCcpLnRleHQoJ0NPJyk7XHJcbiAgICBsZXQgZXZlbnRCb2R5ID0gZXZlbnRFZGl0LmFwcGVuZCgndGJvZHknKS5hdHRyKCdpZCcsIChkLCBpKSA9PiAndHJhY2stJyArIChpICsgMSkgKyAnLWV2ZW50cycpO1xyXG4gICAgLy90aGlzLmRyYXdFdmVudHMoZXZlbnRCb2R5KTtcclxuXHJcbiAgICAvLyDjg4bjgrnjg4jjg4fjg7zjgr9cclxuICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgMTI3OyBpICs9IDgpIHtcclxuICAgIC8vICAgZm9yICh2YXIgaiA9IGk7IGogPCAoaSArIDgpOyArK2opIHtcclxuICAgIC8vICAgICBzZXF1ZW5jZXIuYXVkaW9Ob2RlLnRyYWNrc1swXS5hZGRFdmVudChuZXcgYXVkaW8uTm90ZUV2ZW50KDQ4LCBqLCA2KSk7XHJcbiAgICAvLyAgIH1cclxuICAgIC8vICAgc2VxdWVuY2VyLmF1ZGlvTm9kZS50cmFja3NbMF0uYWRkRXZlbnQobmV3IGF1ZGlvLk1lYXN1cmUoKSk7XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8g44OI44Op44OD44Kv44Ko44OH44Kj44K/44Oh44Kk44OzXHJcblxyXG4gICAgdHJhY2tFZGl0LmVhY2goZnVuY3Rpb24gKGQpIHtcclxuICAgICAgaWYgKCF0aGlzLmVkaXRvcikge1xyXG4gICAgICAgIHRoaXMuZWRpdG9yID0gZG9FZGl0b3IoZDMuc2VsZWN0KHRoaXMpLCBzZWxmXyk7XHJcbiAgICAgICAgdGhpcy5lZGl0b3IubmV4dCgpO1xyXG4gICAgICAgIHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyDjgq3jg7zlhaXlipvjg4/jg7Pjg4njg6lcclxuICAgIHRyYWNrRWRpdC5vbigna2V5ZG93bicsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgIGxldCBlID0gZDMuZXZlbnQ7XHJcbiAgICAgIGNvbnNvbGUubG9nKGUua2V5Q29kZSk7XHJcbiAgICAgIGxldCBrZXkgPSBLZXlCaW5kW2Uua2V5Q29kZV07XHJcbiAgICAgIGxldCByZXQgPSB7fTtcclxuICAgICAgaWYgKGtleSkge1xyXG4gICAgICAgIGtleS5zb21lKChkKSA9PiB7XHJcbiAgICAgICAgICBpZiAoZC5jdHJsS2V5ID09IGUuY3RybEtleVxyXG4gICAgICAgICAgICAmJiBkLnNoaWZ0S2V5ID09IGUuc2hpZnRLZXlcclxuICAgICAgICAgICAgJiYgZC5hbHRLZXkgPT0gZS5hbHRLZXlcclxuICAgICAgICAgICAgJiYgZC5tZXRhS2V5ID09IGUubWV0YUtleVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0ID0gdGhpcy5lZGl0b3IubmV4dChkKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKHJldC52YWx1ZSkge1xyXG4gICAgICAgICAgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgIGQzLmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZXF1ZW5jZXIucGFuZWwub24oJ3Nob3cnLCAoKSA9PiB7XHJcbiAgICAgIGQzLnNlbGVjdCgnI3RpbWUtYmFzZScpLm5vZGUoKS5mb2N1cygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgc2VxdWVuY2VyLnBhbmVsLm9uKCdkaXNwb3NlJywgKCkgPT4ge1xyXG4gICAgICBkZWxldGUgc2VxdWVuY2VyLmVkaXRvckluc3RhbmNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgc2VxdWVuY2VyLnBhbmVsLnNob3coKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIOOCqOODh+OCo+OCv+acrOS9k1xyXG5mdW5jdGlvbiogZG9FZGl0b3IodHJhY2tFZGl0LCBzZXFFZGl0b3IpIHtcclxuICBsZXQga2V5Y29kZSA9IDA7Ly8g5YWl5Yqb44GV44KM44Gf44Kt44O844Kz44O844OJ44KS5L+d5oyB44GZ44KL5aSJ5pWwXHJcbiAgbGV0IHRyYWNrID0gdHJhY2tFZGl0LmRhdHVtKCk7Ly8g54++5Zyo57eo6ZuG5Lit44Gu44OI44Op44OD44KvXHJcbiAgbGV0IGVkaXRWaWV3ID0gZDMuc2VsZWN0KCcjJyArIHRyYWNrRWRpdC5hdHRyKCdpZCcpICsgJy1ldmVudHMnKTsvL+e3qOmbhueUu+mdouOBruOCu+ODrOOCr+OCt+ODp+ODs1xyXG4gIGxldCBtZWFzdXJlID0gMTsvLyDlsI/nr4BcclxuICBsZXQgc3RlcCA9IDE7Ly8g44K544OG44OD44OXTm9cclxuICBsZXQgcm93SW5kZXggPSAwOy8vIOe3qOmbhueUu+mdouOBruePvuWcqOihjFxyXG4gIGxldCBjdXJyZW50RXZlbnRJbmRleCA9IDA7Ly8g44Kk44OZ44Oz44OI6YWN5YiX44Gu57eo6ZuG6ZaL5aeL6KGMXHJcbiAgbGV0IGNlbGxJbmRleCA9IDI7Ly8g5YiX44Kk44Oz44OH44OD44Kv44K5XHJcbiAgbGV0IGNhbmNlbEV2ZW50ID0gZmFsc2U7Ly8g44Kk44OZ44Oz44OI44KS44Kt44Oj44Oz44K744Or44GZ44KL44GL44Gp44GG44GLXHJcbiAgbGV0IGxpbmVCdWZmZXIgPSBudWxsOy8v6KGM44OQ44OD44OV44KhXHJcbiAgY29uc3QgTlVNX1JPVyA9IDQ3Oy8vIO+8keeUu+mdouOBruihjOaVsFxyXG5cdFxyXG4gIGZ1bmN0aW9uIHNldElucHV0KCkge1xyXG4gICAgdGhpcy5hdHRyKCdjb250ZW50RWRpdGFibGUnLCAndHJ1ZScpO1xyXG4gICAgdGhpcy5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDEpO1xyXG4gICAgICByb3dJbmRleCA9IHRoaXMucGFyZW50Tm9kZS5yb3dJbmRleCAtIDE7XHJcbiAgICAgIGNlbGxJbmRleCA9IHRoaXMuY2VsbEluZGV4O1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIGZ1bmN0aW9uIHNldEJsdXIoZGVzdCl7XHJcbiAgICBzd2l0Y2goZGVzdCl7XHJcbiAgICAgICBjYXNlICdub3RlTmFtZSc6XHJcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5vbignYmx1cicsIGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgICAgICAgICAgZC5zZXROb3RlTmFtZVRvTm90ZSh0aGlzLmlubmVyVGV4dCk7XHJcbiAgICAgICAgICAgICAgdGhpcy5pbm5lclRleHQgPSBkLm5hbWU7XHJcbiAgICAgICAgICAgICAgLy8gTm90ZU5v6KGo56S644KC5pu05pawXHJcbiAgICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLmNlbGxzWzNdLmlubmVyVGV4dCA9IGQubm90ZTtcclxuICAgICAgICAgICAgfSk7Ly8gTm90ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgYnJlYWs7XHJcbiAgICAgICBjYXNlICdub3RlJzpcclxuICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB0aGlzLm9uKCdibHVyJywgZnVuY3Rpb24gKGQpIHtcclxuICAgICAgICAgICAgICBsZXQgdiA9IHBhcnNlRmxvYXQodGhpcy5pbm5lclRleHQpO1xyXG4gICAgICAgICAgICAgIGlmKCFpc05hTih2KSl7XHJcbiAgICAgICAgICAgICAgICBkLm5vdGUgPSBwYXJzZUZsb2F0KHRoaXMuaW5uZXJUZXh0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5jZWxsc1syXS5pbm5lclRleHQgPSBkLm5hbWU7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XHJcbiAgICAgdGhpcy5vbignYmx1cicsZnVuY3Rpb24oZClcclxuICAgICAge1xyXG4gICAgICAgIGxldCB2ID0gcGFyc2VGbG9hdCh0aGlzLmlubmVyVGV4dCk7XHJcbiAgICAgICAgaWYoIWlzTmFOKHYpKXtcclxuICAgICAgICAgIGRbZGVzdF0gPSB2O1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gIH1cclxuICBcclxuICBcclxuICAvLyDml6LlrZjjgqTjg5njg7Pjg4jjga7ooajnpLpcclxuICBmdW5jdGlvbiBkcmF3RXZlbnQoKSB7XHJcbiAgICBsZXQgZXZmbGFnbWVudCA9IHRyYWNrLmV2ZW50cy5zbGljZShjdXJyZW50RXZlbnRJbmRleCwgY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XKTtcclxuICAgIGVkaXRWaWV3LnNlbGVjdEFsbCgndHInKS5yZW1vdmUoKTtcclxuICAgIGxldCBzZWxlY3QgPSBlZGl0Vmlldy5zZWxlY3RBbGwoJ3RyJykuZGF0YShldmZsYWdtZW50KTtcclxuICAgIGxldCBlbnRlciA9IHNlbGVjdC5lbnRlcigpO1xyXG4gICAgbGV0IHJvd3MgPSBlbnRlci5hcHBlbmQoJ3RyJykuYXR0cignZGF0YS1pbmRleCcsIChkLCBpKSA9PiBpKTtcclxuICAgIHJvd3MuZWFjaChmdW5jdGlvbiAoZCwgaSkge1xyXG4gICAgICBsZXQgcm93ID0gZDMuc2VsZWN0KHRoaXMpO1xyXG4gICAgICAvL3Jvd0luZGV4ID0gaTtcclxuICAgICAgc3dpdGNoIChkLnR5cGUpIHtcclxuICAgICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5Ob3RlOlxyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQubWVhc3VyZSk7Ly8gTWVhc2V1cmUgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQuc3RlcE5vKTsvLyBTdGVwICNcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLm5hbWUpLmNhbGwoc2V0SW5wdXQpLy8gTm90ZVxyXG4gICAgICAgICAgLmNhbGwoc2V0Qmx1cignbm90ZU5hbWUnKSk7XHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoZC5ub3RlKS5jYWxsKHNldElucHV0KS8vIE5vdGUgI1xyXG4gICAgICAgICAgLmNhbGwoc2V0Qmx1cignbm90ZScpKTtcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLnN0ZXApLmNhbGwoc2V0SW5wdXQpLy8gU3RlcFxyXG4gICAgICAgICAgLmNhbGwoc2V0Qmx1cignc3RlcCcpKTtcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLmdhdGUpLmNhbGwoc2V0SW5wdXQpLy8gR2F0ZVxyXG4gICAgICAgICAgLmNhbGwoc2V0Qmx1cignZ2F0ZScpKTtcclxuICAgICAgICAgIHJvdy5hcHBlbmQoJ3RkJykudGV4dChkLnZlbCkuY2FsbChzZXRJbnB1dCkvLyBWZWxvY2l0eVxyXG4gICAgICAgICAgLmNhbGwoc2V0Qmx1cigndmVsJykpO1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KGQuY29tKS5jYWxsKHNldElucHV0KTsvLyBDb21tYW5kXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KCcnKTsvLyBNZWFzZXVyZSAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoJycpOy8vIFN0ZXAgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKVxyXG4gICAgICAgICAgICAuYXR0cih7ICdjb2xzcGFuJzogNiwgJ3RhYmluZGV4JzogMCB9KVxyXG4gICAgICAgICAgICAudGV4dCgnIC0tLSAoJyArIGQuc3RlcFRvdGFsICsgJykgLS0tICcpXHJcbiAgICAgICAgICAgIC5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgcm93SW5kZXggPSB0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgYXVkaW8uRXZlbnRUeXBlLlRyYWNrRW5kOlxyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKS50ZXh0KCcnKTsvLyBNZWFzZXVyZSAjXHJcbiAgICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLnRleHQoJycpOy8vIFN0ZXAgI1xyXG4gICAgICAgICAgcm93LmFwcGVuZCgndGQnKVxyXG4gICAgICAgICAgICAuYXR0cih7ICdjb2xzcGFuJzogNiwgJ3RhYmluZGV4JzogMCB9KVxyXG4gICAgICAgICAgICAudGV4dCgnIC0tLSBUcmFjayBFbmQgLS0tICcpXHJcbiAgICAgICAgICAgIC5vbignZm9jdXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgcm93SW5kZXggPSB0aGlzLnBhcmVudE5vZGUucm93SW5kZXggLSAxO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIDtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocm93SW5kZXggPiAoZXZmbGFnbWVudC5sZW5ndGggLSAxKSkge1xyXG4gICAgICByb3dJbmRleCA9IGV2ZmxhZ21lbnQubGVuZ3RoIC0gMTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cdFxyXG4gIC8vIOOCpOODmeODs+ODiOOBruODleOCqeODvOOCq+OCuVxyXG4gIGZ1bmN0aW9uIGZvY3VzRXZlbnQoKSB7XHJcbiAgICBsZXQgZXZyb3cgPSBkMy5zZWxlY3QoZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdKTtcclxuICAgIGxldCBldiA9IGV2cm93LmRhdHVtKCk7XHJcbiAgICBzd2l0Y2ggKGV2LnR5cGUpIHtcclxuICAgICAgY2FzZSBhdWRpby5FdmVudFR5cGUuTm90ZTpcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XS5mb2N1cygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1syXS5mb2N1cygpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIGF1ZGlvLkV2ZW50VHlwZS5UcmFja0VuZDpcclxuICAgICAgICBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbMl0uZm9jdXMoKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblx0XHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu5oy/5YWlXHJcbiAgZnVuY3Rpb24gaW5zZXJ0RXZlbnQocm93SW5kZXgpIHtcclxuICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci5leGVjKHtcclxuICAgICAgZXhlYygpIHtcclxuICAgICAgICB0aGlzLnJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XTtcclxuICAgICAgICB0aGlzLmNlbGxJbmRleCA9IGNlbGxJbmRleDtcclxuICAgICAgICB0aGlzLnJvd0luZGV4ID0gcm93SW5kZXg7XHJcbiAgICAgICAgdGhpcy5leGVjXygpO1xyXG4gICAgICB9LFxyXG4gICAgICBleGVjXygpIHtcclxuICAgICAgICB2YXIgcm93ID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5pbnNlcnRSb3codGhpcy5yb3dJbmRleCkpXHJcbiAgICAgICAgICAuZGF0dW0obmV3IGF1ZGlvLk5vdGVFdmVudCgpKTtcclxuICAgICAgICBjZWxsSW5kZXggPSAyO1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJyk7Ly8gTWVhc2V1cmUgI1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJyk7Ly8gU3RlcCAjXHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KVxyXG4gICAgICAgIC5jYWxsKHNldEJsdXIoJ25vdGVOYW1lJykpO1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dCkvLyBOb3RlICNcclxuICAgICAgICAuY2FsbChzZXRCbHVyKCdub3RlJykpO1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dCkvLyBTdGVwXHJcbiAgICAgICAgLmNhbGwoc2V0Qmx1cignc3RlcCcpKTtcclxuICAgICAgICByb3cuYXBwZW5kKCd0ZCcpLmNhbGwoc2V0SW5wdXQpLy8gR2F0ZVxyXG4gICAgICAgIC5jYWxsKHNldEJsdXIoJ2dhdGUnKSk7XHJcbiAgICAgICAgcm93LmFwcGVuZCgndGQnKS5jYWxsKHNldElucHV0KS8vIFZlbG9jaXR5XHJcbiAgICAgICAgLmNhbGwoc2V0Qmx1cigndmVsJykpO1xyXG4gICAgICAgIHJvdy5hcHBlbmQoJ3RkJykuY2FsbChzZXRJbnB1dCk7Ly8gQ29tbWFuZFxyXG4gICAgICAgIHJvdy5ub2RlKCkuY2VsbHNbdGhpcy5jZWxsSW5kZXhdLmZvY3VzKCk7XHJcbiAgICAgICAgcm93LmF0dHIoJ2RhdGEtbmV3JywgdHJ1ZSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJlZG8oKSB7XHJcbiAgICAgICAgdGhpcy5leGVjXygpO1xyXG4gICAgICB9LFxyXG4gICAgICB1bmRvKCkge1xyXG4gICAgICAgIGVkaXRWaWV3Lm5vZGUoKS5kZWxldGVSb3codGhpcy5yb3dJbmRleCk7XHJcbiAgICAgICAgdGhpcy5yb3cuY2VsbHNbdGhpcy5jZWxsSW5kZXhdLmZvY3VzKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBcclxuICAvLyDmlrDopo/lhaXlipvooYzjga7norrlrppcclxuICBmdW5jdGlvbiBlbmROZXdJbnB1dChkb3duID0gdHJ1ZSkge1xyXG4gICAgZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnLCBudWxsKTtcclxuICAgIC8vIDHjgaTliY3jga7jg47jg7zjg4jjg4fjg7zjgr/jgpLmpJzntKLjgZnjgotcclxuICAgIGxldCBiZWZvcmVDZWxscyA9IFtdO1xyXG4gICAgbGV0IHNyID0gcm93SW5kZXggLSAxO1xyXG4gICAgd2hpbGUgKHNyID49IDApIHtcclxuICAgICAgdmFyIHRhcmdldCA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tzcl0pO1xyXG4gICAgICBpZiAodGFyZ2V0LmRhdHVtKCkudHlwZSA9PT0gYXVkaW8uRXZlbnRUeXBlLk5vdGUpIHtcclxuICAgICAgICBiZWZvcmVDZWxscyA9IHRhcmdldC5ub2RlKCkuY2VsbHM7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgLS1zcjtcclxuICAgIH1cclxuICAgIC8vIOePvuWcqOOBrue3qOmbhuihjFxyXG4gICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxscztcclxuICAgIGxldCBldiA9IGQzLnNlbGVjdChlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0pLmRhdHVtKCk7XHJcbiAgICAvLyDjgqjjg5njg7Pjg4jjgpLnlJ/miJDjgZnjgotcclxuICAgIC8vIOODh+ODvOOCv+OBjOS9leOCguWFpeWKm+OBleOCjOOBpuOBhOOBquOBhOOBqOOBjeOBr+OAgTHjgaTliY3jga7jg47jg7zjg4jjg4fjg7zjgr/jgpLopIfoo73jgZnjgovjgIJcclxuICAgIC8vIDHjgaTliY3jga7jg47jg7zjg4jjg4fjg7zjgr/jgYzjgarjgYTjgajjgY3jgoTkuI3mraPjg4fjg7zjgr/jga7loLTlkIjjga/jgIHjg4fjg5Xjgqnjg6vjg4jlgKTjgpLku6PlhaXjgZnjgovjgIJcclxuICAgIGxldCBub3RlTm8gPSAwO1xyXG4gICAgaWYgKGNlbGxJbmRleCA9PSAyKSB7XHJcbiAgICAgIGxldCBub3RlID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzW2NlbGxJbmRleF0uaW5uZXJUZXh0XHJcbiAgICAgICB8fCAoYmVmb3JlQ2VsbHNbMl0gPyBiZWZvcmVDZWxsc1syXS5pbm5lclRleHQgOiAnQyAwJyk7XHJcbiAgICAgIGV2LnNldE5vdGVOYW1lVG9Ob3RlKG5vdGUsIGJlZm9yZUNlbGxzWzJdID8gYmVmb3JlQ2VsbHNbMl0uaW5uZXJUZXh0IDogJycpO1xyXG4gICAgICBub3RlTm8gPSBldi5ub3RlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbm90ZU5vID0gcGFyc2VGbG9hdChjdXJSb3dbM10uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1szXSA/IGJlZm9yZUNlbGxzWzNdLmlubmVyVGV4dCA6ICc2MCcpKTtcclxuICAgIH1cclxuICAgIGlmIChpc05hTihub3RlTm8pKSBub3RlTm8gPSA2MDtcclxuICAgIGxldCBzdGVwID0gcGFyc2VGbG9hdChjdXJSb3dbNF0uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1s0XSA/IGJlZm9yZUNlbGxzWzRdLmlubmVyVGV4dCA6ICc5NicpKTtcclxuICAgIGlmIChpc05hTihzdGVwKSkgc3RlcCA9IDk2O1xyXG4gICAgbGV0IGdhdGUgPSBwYXJzZUZsb2F0KGN1clJvd1s1XS5pbm5lclRleHQgfHwgKGJlZm9yZUNlbGxzWzVdID8gYmVmb3JlQ2VsbHNbNV0uaW5uZXJUZXh0IDogJzI0JykpO1xyXG4gICAgaWYgKGlzTmFOKGdhdGUpKSBnYXRlID0gMjQ7XHJcbiAgICBsZXQgdmVsID0gcGFyc2VGbG9hdChjdXJSb3dbNl0uaW5uZXJUZXh0IHx8IChiZWZvcmVDZWxsc1s2XSA/IGJlZm9yZUNlbGxzWzZdLmlubmVyVGV4dCA6ICcxLjAnKSk7XHJcbiAgICBpZiAoaXNOYU4odmVsKSkgdmVsID0gMS4wXHJcbiAgICBsZXQgY29tID0gLypjdXJSb3dbN10uaW5uZXJUZXh0IHx8IGJlZm9yZUNlbGxzWzddP2JlZm9yZUNlbGxzWzddLmlubmVyVGV4dDoqL25ldyBhdWRpby5Db21tYW5kKCk7XHJcblxyXG4gICAgZXYubm90ZSA9IG5vdGVObztcclxuICAgIGV2LnN0ZXAgPSBzdGVwO1xyXG4gICAgZXYuZ2F0ZSA9IGdhdGU7XHJcbiAgICBldi52ZWwgPSB2ZWw7XHJcbiAgICBldi5jb21tYW5kID0gY29tO1xyXG4gICAgLy8gICAgICAgICAgICB2YXIgZXYgPSBuZXcgYXVkaW8uTm90ZUV2ZW50KHN0ZXAsIG5vdGVObywgZ2F0ZSwgdmVsLCBjb20pO1xyXG4gICAgLy8g44OI44Op44OD44Kv44Gr44OH44O844K/44KS44K744OD44OIXHJcbiAgICB0cmFjay5pbnNlcnRFdmVudChldiwgcm93SW5kZXggKyBjdXJyZW50RXZlbnRJbmRleCk7XHJcbiAgICBldi5wbGF5T25lc2hvdCh0cmFjayk7XHJcbiAgICBpZiAoZG93bikge1xyXG4gICAgICBpZiAocm93SW5kZXggPT0gKE5VTV9ST1cgLSAxKSkge1xyXG4gICAgICAgICsrY3VycmVudEV2ZW50SW5kZXg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgKytyb3dJbmRleDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8g5oy/5YWl5b6M44CB5YaN5o+P55S7XHJcbiAgICBkcmF3RXZlbnQoKTtcclxuICAgIGZvY3VzRXZlbnQoKTtcclxuICB9XHJcbiAgXHJcbiAgZnVuY3Rpb24gcGxheU9uZXNob3QoKXtcclxuICAgIGxldCBldiA9IHRyYWNrLmV2ZW50c1tyb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4XTtcclxuICAgIGlmKGV2LnR5cGUgPT09IGF1ZGlvLkV2ZW50VHlwZS5Ob3RlKXtcclxuICAgICAgZXYucGxheU9uZXNob3QodHJhY2spO1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBmdW5jdGlvbiBhZGRSb3coZGVsdGEpXHJcbiAge1xyXG4gICAgcGxheU9uZXNob3QoKTtcclxuICAgIHJvd0luZGV4ICs9IGRlbHRhO1xyXG4gICAgbGV0IHJvd0xlbmd0aCA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzLmxlbmd0aDtcclxuICAgIGlmKHJvd0luZGV4ID49IHJvd0xlbmd0aCl7XHJcbiAgICAgIGxldCBkID0gcm93SW5kZXggLSByb3dMZW5ndGggKyAxO1xyXG4gICAgICByb3dJbmRleCA9IHJvd0xlbmd0aCAtIDE7XHJcbiAgICAgIGlmKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cgLTEpIDwgKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSl7XHJcbiAgICAgICAgY3VycmVudEV2ZW50SW5kZXggKz0gZDtcclxuICAgICAgICBpZigoY3VycmVudEV2ZW50SW5kZXggKyBOVU1fUk9XIC0xKSA+ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpe1xyXG4gICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAodHJhY2suZXZlbnRzLmxlbmd0aCAtIE5VTV9ST1cgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICB9XHJcbiAgICBpZihyb3dJbmRleCA8IDApe1xyXG4gICAgICBsZXQgZCA9IHJvd0luZGV4O1xyXG4gICAgICByb3dJbmRleCA9IDA7XHJcbiAgICAgIGlmKGN1cnJlbnRFdmVudEluZGV4ICE9IDApe1xyXG4gICAgICAgIGN1cnJlbnRFdmVudEluZGV4ICs9IGQ7XHJcbiAgICAgICAgaWYoY3VycmVudEV2ZW50SW5kZXggPCAwKXtcclxuICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgIH0gXHJcbiAgICB9XHJcbiAgICBmb2N1c0V2ZW50KCk7XHJcbiAgfVxyXG4gICAgXHJcbiAgZHJhd0V2ZW50KCk7XHJcbiAgd2hpbGUgKHRydWUpIHtcclxuICAgIGNvbnNvbGUubG9nKCduZXcgbGluZScsIHJvd0luZGV4LCB0cmFjay5ldmVudHMubGVuZ3RoKTtcclxuICAgIGlmICh0cmFjay5ldmVudHMubGVuZ3RoID09IDAgfHwgcm93SW5kZXggPiAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICB9XHJcbiAgICBrZXlsb29wOlxyXG4gICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgbGV0IGlucHV0ID0geWllbGQgY2FuY2VsRXZlbnQ7XHJcbiAgICAgIHN3aXRjaCAoaW5wdXQuaW5wdXRDb21tYW5kLmlkKSB7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuZW50ZXIuaWQ6Ly9FbnRlclxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0NSL0xGJyk7XHJcbiAgICAgICAgICAvLyDnj77lnKjjga7ooYzjgYzmlrDopo/jgYvnt6jpm4bkuK3jgYtcclxuICAgICAgICAgIGxldCBmbGFnID0gZDMuc2VsZWN0KGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKTtcclxuICAgICAgICAgIGlmIChmbGFnKSB7XHJcbiAgICAgICAgICAgIGVuZE5ld0lucHV0KCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvL+aWsOimj+e3qOmbhuS4reOBruihjOOBp+OBquOBkeOCjOOBsOOAgeaWsOimj+WFpeWKm+eUqOihjOOCkuaMv+WFpVxyXG4gICAgICAgICAgICBpbnNlcnRFdmVudChyb3dJbmRleCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5yaWdodC5pZDovLyByaWdodCBDdXJzb3JcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgY2VsbEluZGV4Kys7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgICAgICAgICAgaWYgKGNlbGxJbmRleCA+IChjdXJSb3dbcm93SW5kZXhdLmNlbGxzLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgY2VsbEluZGV4ID0gMjtcclxuICAgICAgICAgICAgICBpZiAocm93SW5kZXggPCAoY3VyUm93Lmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZDMuc2VsZWN0KGN1clJvd1tyb3dJbmRleF0pLmF0dHIoJ2RhdGEtbmV3JykpIHtcclxuICAgICAgICAgICAgICAgICAgZW5kTmV3SW5wdXQoKTtcclxuICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBhZGRSb3coMSk7XHJcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLm51bWJlci5pZDpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XTtcclxuICAgICAgICAgICAgbGV0IGN1ckRhdGEgPSBkMy5zZWxlY3QoY3VyUm93KS5kYXR1bSgpO1xyXG4gICAgICAgICAgICBpZiAoY3VyRGF0YS50eXBlICE9IGF1ZGlvLkV2ZW50VHlwZS5Ob3RlKSB7XHJcbiAgICAgICAgICAgICAgLy/mlrDopo/nt6jpm4bkuK3jga7ooYzjgafjgarjgZHjgozjgbDjgIHmlrDopo/lhaXlipvnlKjooYzjgpLmjL/lhaVcclxuICAgICAgICAgICAgICBpbnNlcnRFdmVudChyb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgY2VsbEluZGV4ID0gMztcclxuICAgICAgICAgICAgICBsZXQgY2VsbCA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XS5jZWxsc1tjZWxsSW5kZXhdO1xyXG4gICAgICAgICAgICAgIGNlbGwuaW5uZXJUZXh0ID0gaW5wdXQubnVtYmVyO1xyXG4gICAgICAgICAgICAgIGxldCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XHJcbiAgICAgICAgICAgICAgc2VsLmNvbGxhcHNlKGNlbGwsIDEpO1xyXG4gICAgICAgICAgICAgIC8vIHNlbC5zZWxlY3QoKTtcclxuICAgICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQubm90ZS5pZDpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGN1clJvdyA9IGVkaXRWaWV3Lm5vZGUoKS5yb3dzW3Jvd0luZGV4XTtcclxuICAgICAgICAgICAgbGV0IGN1ckRhdGEgPSBkMy5zZWxlY3QoY3VyUm93KS5kYXR1bSgpO1xyXG4gICAgICAgICAgICBpZiAoY3VyRGF0YS50eXBlICE9IGF1ZGlvLkV2ZW50VHlwZS5Ob3RlKSB7XHJcbiAgICAgICAgICAgICAgLy/mlrDopo/nt6jpm4bkuK3jga7ooYzjgafjgarjgZHjgozjgbDjgIHmlrDopo/lhaXlipvnlKjooYzjgpLmjL/lhaVcclxuICAgICAgICAgICAgICBpbnNlcnRFdmVudChyb3dJbmRleCk7XHJcbiAgICAgICAgICAgICAgbGV0IGNlbGwgPSBlZGl0Vmlldy5ub2RlKCkucm93c1tyb3dJbmRleF0uY2VsbHNbY2VsbEluZGV4XTtcclxuICAgICAgICAgICAgICBjZWxsLmlubmVyVGV4dCA9IGlucHV0Lm5vdGU7XHJcbiAgICAgICAgICAgICAgbGV0IHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcclxuICAgICAgICAgICAgICBzZWwuY29sbGFwc2UoY2VsbCwgMSk7XHJcbiAgICAgICAgICAgICAgLy8gc2VsLnNlbGVjdCgpO1xyXG4gICAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBjYW5jZWxFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5sZWZ0LmlkOi8vIGxlZnQgQ3Vyc29yXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgICAgICAgICAgLS1jZWxsSW5kZXg7XHJcbiAgICAgICAgICAgIGlmIChjZWxsSW5kZXggPCAyKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHJvd0luZGV4ICE9IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICAgICAgICAgICAgICBlbmROZXdJbnB1dChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2VsbEluZGV4ID0gZWRpdFZpZXcubm9kZSgpLnJvd3Nbcm93SW5kZXhdLmNlbGxzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICBhZGRSb3coLTEpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQudXAuaWQ6Ly8gVXAgQ3Vyc29yXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBjdXJSb3cgPSBlZGl0Vmlldy5ub2RlKCkucm93cztcclxuICAgICAgICAgICAgaWYgKGQzLnNlbGVjdChjdXJSb3dbcm93SW5kZXhdKS5hdHRyKCdkYXRhLW5ldycpKSB7XHJcbiAgICAgICAgICAgICAgZW5kTmV3SW5wdXQoZmFsc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIGFkZFJvdygtMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuZG93bi5pZDovLyBEb3duIEN1cnNvclxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgY3VyUm93ID0gZWRpdFZpZXcubm9kZSgpLnJvd3M7XHJcbiAgICAgICAgICAgIGlmIChkMy5zZWxlY3QoY3VyUm93W3Jvd0luZGV4XSkuYXR0cignZGF0YS1uZXcnKSkge1xyXG4gICAgICAgICAgICAgIGVuZE5ld0lucHV0KGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhZGRSb3coMSk7XHJcbiAgICAgICAgICAgIGNhbmNlbEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnBhZ2VEb3duLmlkOi8vIFBhZ2UgRG93biDjgq3jg7xcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4IDwgKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ICs9IE5VTV9ST1c7XHJcbiAgICAgICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggLT0gTlVNX1JPVztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5wYWdlVXAuaWQ6Ly8gUGFnZSBVcCDjgq3jg7xcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4IC09IE5VTV9ST1c7XHJcbiAgICAgICAgICAgICAgaWYgKGN1cnJlbnRFdmVudEluZGV4IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEV2ZW50SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g44K544Kv44Ot44O844Or44Ki44OD44OXXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuc2Nyb2xsVXAuaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IDApIHtcclxuICAgICAgICAgICAgICAtLWN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g44K544Kv44Ot44O844Or44OA44Km44OzXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuc2Nyb2xsRG93bi5pZDpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKChjdXJyZW50RXZlbnRJbmRleCArIE5VTV9ST1cpIDw9ICh0cmFjay5ldmVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICArK2N1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8g5YWI6aCt6KGM44Gr56e75YuVXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQuaG9tZS5pZDpcclxuICAgICAgICAgIGlmIChjdXJyZW50RXZlbnRJbmRleCA+IDApIHtcclxuICAgICAgICAgICAgcm93SW5kZXggPSAwO1xyXG4gICAgICAgICAgICBjdXJyZW50RXZlbnRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDmnIDntYLooYzjgavnp7vli5VcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5lbmQuaWQ6XHJcbiAgICAgICAgICBpZiAoY3VycmVudEV2ZW50SW5kZXggIT0gKHRyYWNrLmV2ZW50cy5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICByb3dJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFdmVudEluZGV4ID0gdHJhY2suZXZlbnRzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDooYzliYrpmaRcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5kZWxldGUuaWQ6XHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmKChyb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4KSA9PSAodHJhY2suZXZlbnRzLmxlbmd0aCAtIDEpKXtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIuZXhlYyhcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBleGVjKCkge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLnJvd0luZGV4ID0gcm93SW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEV2ZW50SW5kZXggPSBjdXJyZW50RXZlbnRJbmRleDtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5ldmVudCA9IHRyYWNrLmV2ZW50c1t0aGlzLnJvd0luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5yb3dEYXRhID0gdHJhY2suZXZlbnRzW3RoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4XTtcclxuICAgICAgICAgICAgICAgICAgZWRpdFZpZXcubm9kZSgpLmRlbGV0ZVJvdyh0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5saW5lQnVmZmVyID0gbGluZUJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgICAgbGluZUJ1ZmZlciA9IHRoaXMuZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICAgIHRyYWNrLmRlbGV0ZUV2ZW50KHRoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICByZWRvKCkge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmxpbmVCdWZmZXIgPSBsaW5lQnVmZmVyO1xyXG4gICAgICAgICAgICAgICAgICBsaW5lQnVmZmVyID0gdGhpcy5ldmVudDtcclxuICAgICAgICAgICAgICAgICAgZWRpdFZpZXcubm9kZSgpLmRlbGV0ZVJvdyh0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgdHJhY2suZGVsZXRlRXZlbnQodGhpcy5jdXJyZW50RXZlbnRJbmRleCArIHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHVuZG8oKSB7XHJcbiAgICAgICAgICAgICAgICAgIGxpbmVCdWZmZXIgPSB0aGlzLmxpbmVCdWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgIHRyYWNrLmluc2VydEV2ZW50KHRoaXMuZXZlbnQsIHRoaXMuY3VycmVudEV2ZW50SW5kZXggKyB0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIC8vIOODqeOCpOODs+ODkOODg+ODleOCoeOBruWGheWuueOCkuODmuODvOOCueODiOOBmeOCi1xyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLmxpbmVQYXN0ZS5pZDpcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGxpbmVCdWZmZXIpIHtcclxuICAgICAgICAgICAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIuZXhlYyhcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgZXhlYygpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvd0luZGV4ID0gcm93SW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5lQnVmZmVyID0gbGluZUJ1ZmZlcjtcclxuICAgICAgICAgICAgICAgICAgICB0cmFjay5pbnNlcnRFdmVudChsaW5lQnVmZmVyLmNsb25lKCksIHJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgIHJlZG8oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJhY2suaW5zZXJ0RXZlbnQodGhpcy5saW5lQnVmZmVyLmNsb25lKCksIHRoaXMucm93SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgdW5kbygpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cmFjay5kZWxldGVFdmVudCh0aGlzLnJvd0luZGV4KTtcclxuICAgICAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8gcmVkbyAgIFxyXG4gICAgICAgIGNhc2UgSW5wdXRDb21tYW5kLnJlZG8uaWQ6XHJcbiAgICAgICAgICBzZXFFZGl0b3IudW5kb01hbmFnZXIucmVkbygpO1xyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgLy8gdW5kbyAgXHJcbiAgICAgICAgY2FzZSBJbnB1dENvbW1hbmQudW5kby5pZDpcclxuICAgICAgICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci51bmRvKCk7XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDlsI/nr4Dnt5rmjL/lhaVcclxuICAgICAgICBjYXNlIElucHV0Q29tbWFuZC5pbnNlcnRNZWFzdXJlLmlkOi8vICpcclxuICAgICAgICAgIHNlcUVkaXRvci51bmRvTWFuYWdlci5leGVjKFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgZXhlYygpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXggPSByb3dJbmRleCArIGN1cnJlbnRFdmVudEluZGV4O1xyXG4gICAgICAgICAgICAgICAgdHJhY2suaW5zZXJ0RXZlbnQobmV3IGF1ZGlvLk1lYXN1cmUoKSwgdGhpcy5pbmRleCk7XHJcbiAgICAgICAgICAgICAgICBkcmF3RXZlbnQoKTtcclxuICAgICAgICAgICAgICAgIGZvY3VzRXZlbnQoKTtcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHJlZG8oKSB7XHJcbiAgICAgICAgICAgICAgICB0cmFjay5pbnNlcnRFdmVudChuZXcgYXVkaW8uTWVhc3VyZSgpLCB0aGlzLmluZGV4KTtcclxuICAgICAgICAgICAgICAgIGRyYXdFdmVudCgpO1xyXG4gICAgICAgICAgICAgICAgZm9jdXNFdmVudCgpO1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgdW5kbygpIHtcclxuICAgICAgICAgICAgICAgIHRyYWNrLmRlbGV0ZUV2ZW50KHRoaXMuaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgZHJhd0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgICBmb2N1c0V2ZW50KCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICBjYW5jZWxFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICAvLyDjg4fjg5Xjgqnjg6vjg4hcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgY2FuY2VsRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdkZWZhdWx0Jyk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1NlcXVlbmNlRWRpdG9yKGQpIHtcclxuXHQgZDMuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcclxuXHQgZDMuZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHQgZDMuZXZlbnQuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHQgaWYgKGQucGFuZWwgJiYgZC5wYW5lbC5pc1Nob3cpIHJldHVybjtcclxuXHQgZC5lZGl0b3JJbnN0YW5jZSA9IG5ldyBTZXF1ZW5jZUVkaXRvcihkKTtcclxufVxyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4vYXVkaW8nO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vZXZlbnRFbWl0dGVyMyc7XHJcbmltcG9ydCAqIGFzIHByb3AgZnJvbSAnLi9wcm9wJztcclxuXHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEV2ZW50QmFzZSB7XHJcblx0Y29uc3RydWN0b3Ioc3RlcCA9IDAsbmFtZSA9IFwiXCIpe1xyXG5cdFx0dGhpcy5zdGVwID0gc3RlcDtcclxuXHRcdHRoaXMuc3RlcE5vID0gMDtcclxuXHRcdHRoaXMubWVhc3VyZSA9IDA7XHJcblx0XHR0aGlzLm5hbWUgPSAgbmFtZTtcclxuXHR9XHJcbn1cclxuXHJcbmNvbnN0IENvbW1hbmRUeXBlID0ge1xyXG4gIHNldFZhbHVlQXRUaW1lOjAsXHJcbiAgbGluZWFyUmFtcFRvVmFsdWVBdFRpbWU6MSxcclxuICBleHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lOjIgIFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0VmFsdWVBdFRpbWUoYXVkaW9QYXJhbSx2YWx1ZSx0aW1lKVxyXG57XHJcblx0YXVkaW9QYXJhbS5zZXRWYWx1ZUF0VGltZSh2YWx1ZSx0aW1lKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKGF1ZGlvUGFyYW0sdmFsdWUsdGltZSl7XHJcblx0YXVkaW9QYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh2YWx1ZSx0aW1lKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUoYXVkaW9QYXJhbSx2YWx1ZSx0aW1lKXtcclxuXHRhdWRpb1BhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHZhbHVlLHRpbWUpO1xyXG59XHJcblxyXG5jb25zdCBjb21tYW5kRnVuY3MgPVtcclxuICBzZXRWYWx1ZUF0VGltZSxcclxuICBsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSxcclxuICBleHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lXHJcbl07XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIENvbW1hbmQge1xyXG5cdGNvbnN0cnVjdG9yKHBpdGNoQ29tbWFuZCA9IENvbW1hbmRUeXBlLnNldFZhbHVlQXRUaW1lLHZlbG9jaXR5Q29tbWFuZCA9IENvbW1hbmRUeXBlLnNldFZhbHVlQXRUaW1lKVxyXG5cdHtcclxuICAgIHRoaXMucGl0Y2hDb21tYW5kID0gcGl0Y2hDb21tYW5kO1xyXG4gICAgdGhpcy52ZWxvY2l0eUNvbW1hbmQgPSB2ZWxvY2l0eUNvbW1hbmQ7XHJcblx0XHR0aGlzLnByb2Nlc3NQaXRjaCA9IGNvbW1hbmRGdW5jc1twaXRjaENvbW1hbmRdLmJpbmQodGhpcyk7XHJcblx0XHR0aGlzLnByb2Nlc3NWZWxvY2l0eSA9IGNvbW1hbmRGdW5jc1t2ZWxvY2l0eUNvbW1hbmRdLmJpbmQodGhpcyk7XHJcblx0fVxyXG4gIFxyXG4gIHRvSlNPTigpXHJcbiAge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcGl0Y2hDb21tYW5kOnRoaXMucGl0Y2hDb21tYW5kLFxyXG4gICAgICB2ZWxvY2l0eUNvbW1hbmQ6dGhpcy52ZWxvY2l0eUNvbW1hbmRcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tSlNPTihvKXtcclxuICAgIHJldHVybiBuZXcgQ29tbWFuZChvLnBpdGNoQ29tbWFuZCxvLnZlbG9jaXR5Q29tbWFuZCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgRXZlbnRUeXBlICA9IHtcclxuXHROb3RlOjAsXHJcblx0TWVhc3VyZToxLFxyXG5cdFRyYWNrRW5kOjJcclxufVxyXG5cclxuLy8g5bCP56+A57eaXHJcbmV4cG9ydCBjbGFzcyBNZWFzdXJlIGV4dGVuZHMgRXZlbnRCYXNlIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoMCk7XHJcblx0XHR0aGlzLnR5cGUgPSBFdmVudFR5cGUuTWVhc3VyZTtcclxuICAgIHRoaXMuc3RlcFRvdGFsID0gMDtcclxuICAgIHRoaXMuc3RhcnRJbmRleCA9IDA7XHJcbiAgICB0aGlzLmVuZEluZGV4ID0gMDtcclxuXHR9XHJcbiAgXHJcbiAgdG9KU09OKCl7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuYW1lOidNZWFzdXJlJyxcclxuICAgICAgbWVhc3VyZTp0aGlzLm1lYXN1cmUsXHJcbiAgICAgIHN0ZXBObzp0aGlzLnN0ZXBObyxcclxuICAgICAgc3RlcDp0aGlzLnN0ZXAsXHJcbiAgICAgIHR5cGU6dGhpcy50eXBlLFxyXG4gICAgICBzdGVwVG90YWw6dGhpcy5zdGVwVG90YWwsXHJcbiAgICAgIHN0YXJ0SW5kZXg6dGhpcy5zdGFydEluZGV4LFxyXG4gICAgICBlbmRJbmRleDp0aGlzLmVuZEluZGV4XHJcbiAgICB9O1xyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUpTT04obyl7XHJcbiAgICBsZXQgcmV0ID0gbmV3IE1lYXN1cmUoKTtcclxuICAgIHJldC5tZWFzdXJlID0gby5tZWFzdXJlO1xyXG4gICAgcmV0LnN0ZXBObyA9IG8uc3RlcE5vO1xyXG4gICAgcmV0LnN0ZXAgPSBvLnN0ZXA7XHJcbiAgICByZXQuc3RlcFRvdGFsID0gby5zdGVwVG90YWw7XHJcbiAgICByZXQuc3RhcnRJbmRleCA9IG8uc3RhcnRJbmRleDtcclxuICAgIHJldC5lbmRJbmRleCA9IG8uZW5kSW5kZXg7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuICBjbG9uZSgpe1xyXG4gICAgcmV0dXJuIG5ldyBNZWFzdXJlKCk7XHJcbiAgfVxyXG4gIFxyXG4gIHByb2Nlc3MoKXtcclxuICAgIFxyXG4gIH1cclxufVxyXG5cclxuLy8gVHJhY2sgRW5kXHJcbmV4cG9ydCBjbGFzcyBUcmFja0VuZCBleHRlbmRzIEV2ZW50QmFzZSB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHN1cGVyKDApO1xyXG5cdFx0dGhpcy50eXBlID0gRXZlbnRUeXBlLlRyYWNrRW5kO1xyXG5cdH1cclxuICBwcm9jZXNzKCl7XHJcbiAgICBcclxuICB9XHJcblx0XHJcbn1cclxuXHJcbnZhciBOb3RlcyA9IFtcclxuXHQnQyAnLFxyXG5cdCdDIycsXHJcblx0J0QgJyxcclxuXHQnRCMnLFxyXG5cdCdFICcsXHJcblx0J0YgJyxcclxuXHQnRiMnLFxyXG5cdCdHICcsXHJcblx0J0cjJyxcclxuXHQnQSAnLFxyXG5cdCdBIycsXHJcblx0J0IgJyxcclxuXTtcclxuXHJcbmV4cG9ydCBjbGFzcyBOb3RlRXZlbnQgZXh0ZW5kcyBFdmVudEJhc2Uge1xyXG5cdGNvbnN0cnVjdG9yKHN0ZXAgPSAwLG5vdGUgPSAwLGdhdGUgPSAwLHZlbCA9IDAuNSxjb21tYW5kID0gbmV3IENvbW1hbmQoKSl7XHJcblx0XHRzdXBlcihzdGVwKTtcclxuXHRcdHRoaXMudHJhbnNwb3NlXyA9IDAuMDtcclxuXHRcdHRoaXMubm90ZSA9IG5vdGU7XHJcblx0XHR0aGlzLmdhdGUgPSBnYXRlO1xyXG5cdFx0dGhpcy52ZWwgPSB2ZWw7XHJcblx0XHR0aGlzLmNvbW1hbmQgPSBjb21tYW5kO1xyXG5cdFx0dGhpcy5jb21tYW5kLmV2ZW50ID0gdGhpcztcclxuXHRcdHRoaXMudHlwZSA9IEV2ZW50VHlwZS5Ob3RlO1xyXG5cdFx0dGhpcy5zZXROb3RlTmFtZSgpO1xyXG5cdH1cclxuXHRcclxuICAgdG9KU09OKCl7XHJcbiAgICAgcmV0dXJuIHtcclxuICAgICAgIG5hbWU6J05vdGVFdmVudCcsXHJcbiAgICAgICBtZWFzdXJlOnRoaXMubWVhc3VyZSxcclxuICAgICAgIHN0ZXBObzp0aGlzLnN0ZXBObyxcclxuICAgICAgIHN0ZXA6dGhpcy5zdGVwLFxyXG4gICAgICAgbm90ZTp0aGlzLm5vdGUsXHJcbiAgICAgICBnYXRlOnRoaXMuZ2F0ZSxcclxuICAgICAgIHZlbDp0aGlzLnZlbCxcclxuICAgICAgIGNvbW1hbmQ6dGhpcy5jb21tYW5kLFxyXG4gICAgICAgdHlwZTp0aGlzLnR5cGVcclxuICAgICB9XHJcbiAgIH1cclxuICAgXHJcbiAgIHN0YXRpYyBmcm9tSlNPTihvKXtcclxuICAgICBsZXQgcmV0ID0gbmV3IE5vdGVFdmVudChvLnN0ZXAsby5ub3RlLG8uZ2F0ZSxvLnZlbCxDb21tYW5kLmZyb21KU09OKG8uY29tbWFuZCkpO1xyXG4gICAgIHJldC5tZWFzdXJlID0gby5tZWFzdXJlO1xyXG4gICAgIHJldC5zdGVwTm8gPSBvLnN0ZXBObztcclxuICAgICByZXR1cm4gcmV0O1xyXG4gICB9XHJcbiAgXHJcbiAgY2xvbmUoKXtcclxuICAgIHJldHVybiBuZXcgTm90ZUV2ZW50KHRoaXMuc3RlcCx0aGlzLm5vdGUsdGhpcy5nYXRlLHRoaXMudmVsLHRoaXMuY29tbWFuZCk7XHJcbiAgfVxyXG4gIFxyXG5cdHNldE5vdGVOYW1lKCl7XHJcblx0XHRcdGxldCBvY3QgPSB0aGlzLm5vdGUgLyAxMiB8IDA7XHJcblx0XHRcdHRoaXMubmFtZSA9IE5vdGVzW3RoaXMubm90ZSAlIDEyXSArIG9jdDtcclxuXHR9XHJcblxyXG5cdHNldE5vdGVOYW1lVG9Ob3RlKG5vdGVOYW1lLGRlZmF1bHROb3RlTmFtZSA9IFwiXCIpXHJcblx0e1xyXG4gICAgdmFyIG1hdGNoZXMgPSBub3RlTmFtZS5tYXRjaCgvKEMjKXwoQyl8KEQjKXwoRCl8KEUpfChGIyl8KEYpfChHIyl8KEcpfChBIyl8KEEpfChCKS9pKTtcclxuXHRcdGlmKG1hdGNoZXMpXHJcblx0XHR7XHJcbiAgICAgIHZhciBuID0gbWF0Y2hlc1swXTtcclxuICAgICAgdmFyIGdldE51bWJlciA9IG5ldyBSZWdFeHAoJyhbMC05XXsxLDJ9KScpO1xyXG4vLyAgICAgIGdldE51bWJlci5jb21waWxlKCk7XHJcbiAgICAgIGdldE51bWJlci5leGVjKG5vdGVOYW1lKTtcclxuICAgICAgdmFyIG8gPSBSZWdFeHAuJDE7XHJcbiAgICAgIGlmKCFvKXtcclxuICAgICAgICAobmV3IFJlZ0V4cCgnKFswLTldezEsMn0pJykpLmV4ZWMoZGVmYXVsdE5vdGVOYW1lKTsgICAgICAgIFxyXG4gICAgICAgIG8gPSBSZWdFeHAuJDE7XHJcbiAgICAgICAgaWYoIW8pe1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZihuLmxlbmd0aCA9PT0gMSkgbiArPSAnICc7XHJcbiAgICAgIFxyXG4gICAgICBpZihOb3Rlcy5zb21lKChkLGkpPT57XHJcbiAgICAgICAgICBpZihkID09PSBuKXtcclxuICAgICAgICAgICAgdGhpcy5ub3RlID0gcGFyc2VGbG9hdChpKSArIHBhcnNlRmxvYXQobykgKiAxMjtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHRcdFx0XHRcclxuICAgICAgICAgfSkpXHJcbiAgICAgIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNldE5vdGVOYW1lKCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblx0XHR9IGVsc2Uge1xyXG4gICAgICB0aGlzLnNldE5vdGVOYW1lKCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTsgXHJcbiAgICB9XHJcblx0fVxyXG5cdFxyXG5cdGdldCBub3RlICgpe1xyXG5cdFx0IHJldHVybiB0aGlzLm5vdGVfO1xyXG5cdH1cclxuXHRcclxuXHRzZXQgbm90ZSh2KXtcclxuXHRcdCB0aGlzLm5vdGVfID0gdjtcclxuXHRcdCB0aGlzLmNhbGNQaXRjaCgpO1xyXG5cdFx0IHRoaXMuc2V0Tm90ZU5hbWUoKTtcclxuXHR9XHJcblx0XHJcblx0c2V0IHRyYW5zcG9zZSh2KXtcclxuXHRcdGlmKHYgIT0gdGhpcy50cmFuc3Bvc2VfKXtcclxuXHRcdFx0dGhpcy50cmFuc3Bvc2VfID0gdjtcclxuXHRcdFx0dGhpcy5jYWxjUGl0Y2goKTtcclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Y2FsY1BpdGNoKCl7XHJcblx0XHR0aGlzLnBpdGNoID0gKDQ0MC4wIC8gMzIuMCkgKiAoTWF0aC5wb3coMi4wLCgodGhpcy5ub3RlICsgdGhpcy50cmFuc3Bvc2VfIC0gOSkgLyAxMikpKTtcclxuXHR9XHJcbiAgXHJcbiAgcGxheU9uZXNob3QodHJhY2spe1xyXG4gICAgaWYodGhpcy5ub3RlKXtcclxuXHRcdFx0XHR0aGlzLnRyYW5zb3BzZSA9IHRyYWNrLnRyYW5zcG9zZTtcclxuXHRcdFx0XHRmb3IobGV0IGogPSAwLGplID0gdHJhY2sucGl0Y2hlcy5sZW5ndGg7aiA8IGplOysrail7XHJcblx0XHRcdFx0XHR0cmFjay5waXRjaGVzW2pdLnByb2Nlc3MobmV3IENvbW1hbmQoKSx0aGlzLnBpdGNoLGF1ZGlvLmN0eC5jdXJyZW50VGltZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGZvcihsZXQgaiA9IDAsamUgPSB0cmFjay52ZWxvY2l0aWVzLmxlbmd0aDtqIDwgamU7KytqKXtcclxuXHRcdFx0XHRcdC8vIGtleW9uXHJcblx0XHRcdFx0XHR0cmFjay52ZWxvY2l0aWVzW2pdLnByb2Nlc3MobmV3IENvbW1hbmQoKSx0aGlzLnZlbCxhdWRpby5jdHguY3VycmVudFRpbWUpO1xyXG5cdFx0XHRcdFx0Ly8ga2V5b2ZmXHJcblx0XHRcdFx0XHR0cmFjay52ZWxvY2l0aWVzW2pdLnByb2Nlc3MobmV3IENvbW1hbmQoKSwwLGF1ZGlvLmN0eC5jdXJyZW50VGltZSswLjI1KTtcclxuXHRcdFx0XHR9XHJcbiAgICB9XHJcbiAgfVxyXG5cdFxyXG5cdHByb2Nlc3ModGltZSx0cmFjayl7XHJcblx0XHRcdGlmKHRoaXMubm90ZSl7XHJcblx0XHRcdFx0dGhpcy50cmFuc29wc2UgPSB0cmFjay50cmFuc3Bvc2U7XHJcblx0XHRcdFx0Zm9yKGxldCBqID0gMCxqZSA9IHRyYWNrLnBpdGNoZXMubGVuZ3RoO2ogPCBqZTsrK2ope1xyXG5cdFx0XHRcdFx0dHJhY2sucGl0Y2hlc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCx0aGlzLnBpdGNoLHRpbWUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRmb3IobGV0IGogPSAwLGplID0gdHJhY2sudmVsb2NpdGllcy5sZW5ndGg7aiA8IGplOysrail7XHJcblx0XHRcdFx0XHQvLyBrZXlvblxyXG5cdFx0XHRcdFx0dHJhY2sudmVsb2NpdGllc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCx0aGlzLnZlbCx0aW1lKTtcclxuXHRcdFx0XHRcdC8vIGtleW9mZlxyXG5cdFx0XHRcdFx0dHJhY2sudmVsb2NpdGllc1tqXS5wcm9jZXNzKHRoaXMuY29tbWFuZCwwLHRpbWUgKyB0aGlzLmdhdGUgKiB0cmFjay5zZXF1ZW5jZXIuc3RlcFRpbWVfICk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBUcmFjayBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3Ioc2VxdWVuY2VyKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmV2ZW50cyA9IFtdO1xyXG5cdFx0dGhpcy5wb2ludGVyID0gMDtcclxuXHRcdHRoaXMuZXZlbnRzLnB1c2gobmV3IFRyYWNrRW5kKCkpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3N0ZXAnKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdlbmQnKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCduYW1lJyk7XHJcblx0XHRwcm9wLmRlZk9ic2VydmFibGUodGhpcywndHJhbnNwb3NlJyk7XHJcblx0XHRcclxuXHRcdHRoaXMuc3RlcCA9IDA7XHJcblx0XHR0aGlzLmVuZCA9IGZhbHNlO1xyXG5cdFx0dGhpcy5waXRjaGVzID0gW107XHJcblx0XHR0aGlzLnZlbG9jaXRpZXMgPSBbXTtcclxuXHRcdHRoaXMuc2VxdWVuY2VyID0gc2VxdWVuY2VyO1xyXG5cdFx0dGhpcy5uYW1lID0gJyc7XHJcblx0XHR0aGlzLnRyYW5zcG9zZSA9IDA7XHJcblx0fVxyXG5cdFxyXG4gIHRvSlNPTigpXHJcbiAge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbmFtZTonVHJhY2snLFxyXG4gICAgICBldmVudHM6dGhpcy5ldmVudHMsXHJcbiAgICAgIHN0ZXA6dGhpcy5zdGVwLFxyXG4gICAgICB0cmFja05hbWU6dGhpcy5uYW1lLFxyXG4gICAgICB0cmFuc3Bvc2U6dGhpcy50cmFuc3Bvc2VcclxuICAgIH07XHJcbiAgfVxyXG4gIFxyXG4gIHN0YXRpYyBmcm9tSlNPTihvLHNlcXVlbmNlcilcclxuICB7XHJcbiAgICBsZXQgcmV0ID0gbmV3IFRyYWNrKHNlcXVlbmNlcik7XHJcbiAgICByZXQuc3RlcCA9IG8uc3RlcDtcclxuICAgIHJldC5uYW1lID0gby50cmFja05hbWU7XHJcbiAgICByZXQudHJhbnNwb3NlID0gby50cmFuc3Bvc2U7XHJcbiAgICBvLmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGQpe1xyXG4gICAgICBzd2l0Y2goZC50eXBlKXtcclxuICAgICAgICBjYXNlIEV2ZW50VHlwZS5Ob3RlOlxyXG4gICAgICAgICAgcmV0LmFkZEV2ZW50KE5vdGVFdmVudC5mcm9tSlNPTihkKSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgcmV0LmFkZEV2ZW50KE1lYXN1cmUuZnJvbUpTT04oZCkpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBFdmVudFR5cGUuVHJhY2tFbmQ6XHJcbiAgICAgICAgLy/kvZXjgoLjgZfjgarjgYRcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuICBcclxuXHRhZGRFdmVudChldil7XHJcblx0XHRpZih0aGlzLmV2ZW50cy5sZW5ndGggPiAxKVxyXG5cdFx0e1xyXG5cdFx0XHR2YXIgYmVmb3JlID0gdGhpcy5ldmVudHNbdGhpcy5ldmVudHMubGVuZ3RoIC0gMl07XHJcblx0XHRcdHN3aXRjaChiZWZvcmUudHlwZSl7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTm90ZTpcclxuXHRcdFx0XHRcdGV2LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTWVhc3VyZTpcclxuXHRcdFx0XHRcdGV2LnN0ZXBObyA9IDE7XHJcblx0XHRcdFx0XHRldi5tZWFzdXJlID0gYmVmb3JlLm1lYXN1cmUgKyAxO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGV2LnN0ZXBObyA9IDE7XHJcblx0XHRcdGV2Lm1lYXN1cmUgPSAxO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5ldmVudHMuc3BsaWNlKHRoaXMuZXZlbnRzLmxlbmd0aCAtIDEsMCxldik7XHJcbiAgICB0aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKHRoaXMuZXZlbnRzLmxlbmd0aCAtIDIpO1xyXG5cdH1cclxuXHRcclxuXHRpbnNlcnRFdmVudChldixpbmRleCl7XHJcblx0XHRpZih0aGlzLmV2ZW50cy5sZW5ndGggPiAxICYmIGluZGV4ICE9IDApe1xyXG5cdFx0XHR2YXIgYmVmb3JlID0gdGhpcy5ldmVudHNbaW5kZXgtMV07XHJcblx0XHRcdHN3aXRjaChiZWZvcmUudHlwZSl7XHJcblx0XHRcdFx0Y2FzZSBFdmVudFR5cGUuTm90ZTpcclxuXHRcdFx0XHRcdGV2LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk1lYXN1cmU6XHJcblx0XHRcdFx0XHRldi5zdGVwTm8gPSAxO1xyXG5cdFx0XHRcdFx0ZXYubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlICsgMTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0ZXYuc3RlcE5vID0gMTtcclxuXHRcdFx0ZXYubWVhc3VyZSA9IDE7XHJcbiAgICB9XHJcblx0XHR0aGlzLmV2ZW50cy5zcGxpY2UoaW5kZXgsMCxldik7XHJcblx0XHRpZihldi50eXBlID09IEV2ZW50VHlwZS5NZWFzdXJlKXtcclxuXHRcdFx0dGhpcy51cGRhdGVTdGVwQW5kTWVhc3VyZShpbmRleCk7XHRcdFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dGhpcy51cGRhdGVTdGVwKGluZGV4KTtcdFx0XHJcbiAgICB9XHJcbiAgICB0aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKGluZGV4KTtcclxuXHR9XHJcbiAgICBcclxuXHR1cGRhdGVTdGVwKGluZGV4KXtcclxuXHRcdGZvcihsZXQgaSA9IGluZGV4ICsgMSxlID0gdGhpcy5ldmVudHMubGVuZ3RoO2k8ZTsrK2kpXHJcblx0XHR7XHJcblx0XHRcdGxldCBiZWZvcmUgPSB0aGlzLmV2ZW50c1tpLTFdO1xyXG5cdFx0XHRsZXQgY3VycmVudCA9IHRoaXMuZXZlbnRzW2ldO1xyXG5cdFx0XHRzd2l0Y2goYmVmb3JlLnR5cGUpe1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk5vdGU6XHJcblx0XHRcdFx0XHRjdXJyZW50LnN0ZXBObyA9IGJlZm9yZS5zdGVwTm8gKyAxO1xyXG5cdFx0XHRcdFx0Y3VycmVudC5tZWFzdXJlID0gYmVmb3JlLm1lYXN1cmU7XHJcbiAgICAgICAgICBicmVhaztcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgYnJlYWs7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cdFx0XHRcclxuXHRcdH1cclxuXHR9XHRcclxuICBcclxuXHR1cGRhdGVTdGVwQW5kTWVhc3VyZShpbmRleCl7XHJcblx0XHRmb3IobGV0IGkgPSBpbmRleCArIDEsZSA9IHRoaXMuZXZlbnRzLmxlbmd0aDtpPGU7KytpKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgYmVmb3JlID0gdGhpcy5ldmVudHNbaS0xXTtcclxuXHRcdFx0bGV0IGN1cnJlbnQgPSB0aGlzLmV2ZW50c1tpXTtcclxuXHRcdFx0c3dpdGNoKGJlZm9yZS50eXBlKXtcclxuXHRcdFx0XHRjYXNlIEV2ZW50VHlwZS5Ob3RlOlxyXG5cdFx0XHRcdFx0Y3VycmVudC5zdGVwTm8gPSBiZWZvcmUuc3RlcE5vICsgMTtcclxuXHRcdFx0XHRcdGN1cnJlbnQubWVhc3VyZSA9IGJlZm9yZS5tZWFzdXJlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGNhc2UgRXZlbnRUeXBlLk1lYXN1cmU6XHJcblx0XHRcdFx0XHRjdXJyZW50LnN0ZXBObyA9IDE7XHJcblx0XHRcdFx0XHRjdXJyZW50Lm1lYXN1cmUgPSBiZWZvcmUubWVhc3VyZSArIDE7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cdFx0XHRcclxuXHRcdH1cclxuXHR9XHJcbiAgXHJcbiAgY2FsY01lYXN1cmVTdGVwVG90YWwoaW5kZXgpe1xyXG4gICAgbGV0IGluZGV4QWZ0ZXIgPSBpbmRleCArMTtcclxuICAgIGxldCBldmVudHMgPSB0aGlzLmV2ZW50cztcclxuICAgIGxldCBzdGVwVG90YWwgPSAwO1xyXG4gICAgbGV0IGV2ZW50ID0gZXZlbnRzW2luZGV4XTtcclxuICAgIC8vIOaMv+WFpeOBl+OBn+ODoeOCuOODo+ODvOOBrnN0ZXBUb3RhbOOCkuijnOato1xyXG4gICAgaWYoZXZlbnQudHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSl7XHJcbiAgICAgIC0taW5kZXg7XHJcbiAgICAgIHdoaWxlKGluZGV4ID49IDApe1xyXG4gICAgICAgIGxldCBldiA9IGV2ZW50c1tpbmRleF07XHJcbiAgICAgICAgaWYoZXYudHlwZSA9PSBFdmVudFR5cGUuTWVhc3VyZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RlcFRvdGFsICs9ICBldi5zdGVwO1xyXG4gICAgICAgIH1cclxuICAgICAgICAtLWluZGV4O1xyXG4gICAgICB9XHJcbiAgICAgIGV2ZW50LnN0ZXBUb3RhbCA9IHN0ZXBUb3RhbDtcclxuICAgICAgLy8g5b6M57aa44Gu44Oh44K444Oj44O844Guc3RlcFRvdGFs44KS6KOc5q2jXHJcbiAgICAgIHN0ZXBUb3RhbCA9IDA7XHJcbiAgICAgIGlmKGluZGV4QWZ0ZXIgPj0gKGV2ZW50cy5sZW5ndGggLTEpKVxyXG4gICAgICB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKGV2ZW50c1tpbmRleEFmdGVyXS50eXBlID09IEV2ZW50VHlwZS5NZWFzdXJlKXtcclxuICAgICAgICBldmVudHNbaW5kZXhBZnRlcl0uc3RlcFRvdGFsID0gMDtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUoaW5kZXhBZnRlciA8IChldmVudHMubGVuZ3RoIC0gMSkgKVxyXG4gICAgICB7XHJcbiAgICAgICAgaWYoZXZlbnRzW2luZGV4QWZ0ZXJdLnR5cGUgIT0gRXZlbnRUeXBlLk1lYXN1cmUpe1xyXG4gICAgICAgICAgc3RlcFRvdGFsICs9IGV2ZW50c1tpbmRleEFmdGVyKytdLnN0ZXA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGV2ZW50c1tpbmRleEFmdGVyXS5zdGVwVG90YWwgPSBzdGVwVG90YWw7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8g5LiA44Gk5YmN44Gu44Oh44K444Oj44O844KS5o6i44GZXHJcbiAgICAgIGxldCBzdGFydEluZGV4ID0gMDtcclxuICAgICAgaWYoaW5kZXggPT0gMCl7XHJcbiAgICAgICAgc3RhcnRJbmRleCA9IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3RhcnRJbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHdoaWxlKHN0YXJ0SW5kZXggPiAwKXtcclxuICAgICAgICAgIC0tc3RhcnRJbmRleDtcclxuICAgICAgICAgIGlmKHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgICsrc3RhcnRJbmRleDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHN0ZXBUb3RhbCA9IDA7XHJcbiAgICAgIHdoaWxlKHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnR5cGUgPT0gRXZlbnRUeXBlLk5vdGUpXHJcbiAgICAgIHtcclxuICAgICAgICBzdGVwVG90YWwgKz0gdGhpcy5ldmVudHNbc3RhcnRJbmRleF0uc3RlcDsgICAgICAgIFxyXG4gICAgICAgICsrc3RhcnRJbmRleDtcclxuICAgICAgfSAgXHJcbiAgICAgIGlmKHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnR5cGUgPT0gRXZlbnRUeXBlLk1lYXN1cmUpe1xyXG4gICAgICAgIHRoaXMuZXZlbnRzW3N0YXJ0SW5kZXhdLnN0ZXBUb3RhbCA9IHN0ZXBUb3RhbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8g44Kk44OZ44Oz44OI44Gu5YmK6ZmkICBcclxuICBkZWxldGVFdmVudChpbmRleCl7XHJcbiAgICB2YXIgZXYgPSB0aGlzLmV2ZW50c1tpbmRleF07XHJcbiAgICB0aGlzLmV2ZW50cy5zcGxpY2UoaW5kZXgsMSk7XHJcbiAgICBpZihpbmRleCA9PSAwKXtcclxuICAgICAgdGhpcy5ldmVudHNbMF0ubWVhc3VyZSA9IDE7XHJcbiAgICAgIHRoaXMuZXZlbnRzWzBdLnN0ZXBObyA9IDE7XHJcbiAgICAgIGlmKHRoaXMuZXZlbnRzLmxlbmd0aCA+IDEpe1xyXG4gICAgICAgIHN3aXRjaChldi50eXBlKXtcclxuICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLm5vdGU6XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RlcCgxKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5NZWFzdXJlOlxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0ZXBBbmRNZWFzdXJlKDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZihpbmRleCA8PSAodGhpcy5ldmVudHMubGVuZ3RoIC0gMSkpXHJcbiAgICB7XHJcbiAgICAgICAgc3dpdGNoKGV2LnR5cGUpe1xyXG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuTm90ZTpcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGVwKGluZGV4IC0gMSk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSBFdmVudFR5cGUuTWVhc3VyZTpcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTdGVwQW5kTWVhc3VyZShpbmRleCAtIDEpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmNhbGNNZWFzdXJlU3RlcFRvdGFsKGluZGV4KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBTRVFfU1RBVFVTID0ge1xyXG5cdFNUT1BQRUQ6MCxcclxuXHRQTEFZSU5HOjEsXHJcblx0UEFVU0VEOjJcclxufSA7XHJcblxyXG5leHBvcnQgY29uc3QgTlVNX09GX1RSQUNLUyA9IDQ7XHJcblxyXG5leHBvcnQgY2xhc3MgU2VxdWVuY2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdFxyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JwbScpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ3RwYicpO1xyXG5cdFx0cHJvcC5kZWZPYnNlcnZhYmxlKHRoaXMsJ2JlYXQnKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdiYXInKTtcclxuXHRcdHByb3AuZGVmT2JzZXJ2YWJsZSh0aGlzLCdyZXBlYXQnKTtcclxuXHJcblx0XHR0aGlzLmJwbSA9IDEyMC4wOyAvLyB0ZW1wb1xyXG4gICAgXHJcblx0XHR0aGlzLnRwYiA9IDk2LjA7IC8vIOWbm+WIhumfs+espuOBruino+WDj+W6plxyXG5cdFx0dGhpcy5iZWF0ID0gNDtcclxuXHRcdHRoaXMuYmFyID0gNDsgLy8gXHJcblx0XHR0aGlzLnJlcGVhdCA9IGZhbHNlO1xyXG5cdFx0dGhpcy50cmFja3MgPSBbXTtcclxuXHRcdHRoaXMubnVtYmVyT2ZJbnB1dHMgPSAwO1xyXG5cdFx0dGhpcy5udW1iZXJPZk91dHB1dHMgPSAwO1xyXG5cdFx0dGhpcy5uYW1lID0gJ1NlcXVlbmNlcic7XHJcblx0XHRmb3IgKHZhciBpID0gMDtpIDwgTlVNX09GX1RSQUNLUzsrK2kpXHJcblx0XHR7XHJcblx0XHRcdHRoaXMudHJhY2tzLnB1c2gobmV3IFRyYWNrKHRoaXMpKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddID0gbmV3IGF1ZGlvLlBhcmFtVmlldyhudWxsLCd0cmsnICsgaSArICdnJyx0cnVlKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAnZyddLnRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ2cnXS50eXBlID0gJ2dhdGUnO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddID0gbmV3IGF1ZGlvLlBhcmFtVmlldyhudWxsLCd0cmsnICsgaSArICdwJyx0cnVlKTtcclxuXHRcdFx0dGhpc1sndHJrJyArIGkgKyAncCddLnRyYWNrID0gdGhpcy50cmFja3NbaV07XHJcblx0XHRcdHRoaXNbJ3RyaycgKyBpICsgJ3AnXS50eXBlID0gJ3BpdGNoJztcclxuXHRcdH1cclxuXHRcdHRoaXMuc3RhcnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IDA7XHJcblx0XHR0aGlzLmN1cnJlbnRNZWFzdXJlXyA9IDA7XHJcblx0XHR0aGlzLmNhbGNTdGVwVGltZSgpO1xyXG5cdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cclxuXHRcdC8vXHJcblx0XHR0aGlzLm9uKCdicG1fY2hhbmdlZCcsKCk9Pnt0aGlzLmNhbGNTdGVwVGltZSgpO30pO1xyXG5cdFx0dGhpcy5vbigndHBiX2NoYW5nZWQnLCgpPT57dGhpcy5jYWxjU3RlcFRpbWUoKTt9KTtcclxuXHJcblx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5wdXNoKHRoaXMpO1xyXG5cdFx0aWYoU2VxdWVuY2VyLmFkZGVkKXtcclxuXHRcdFx0U2VxdWVuY2VyLmFkZGVkKCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuICB0b0pTT04oKXtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG5hbWU6J1NlcXVlbmNlcicsXHJcbiAgICAgIGJwbTp0aGlzLmJwbSxcclxuICAgICAgdHBiOnRoaXMudHBiLFxyXG4gICAgICBiZWF0OnRoaXMuYmVhdCxcclxuICAgICAgYmFyOnRoaXMuYmFyLFxyXG4gICAgICB0cmFja3M6dGhpcy50cmFja3MsXHJcbiAgICAgIHJlcGVhdDp0aGlzLnJlcGVhdFxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBzdGF0aWMgZnJvbUpTT04obylcclxuICB7XHJcbiAgICBsZXQgcmV0ID0gbmV3IFNlcXVlbmNlcigpO1xyXG4gICAgcmV0LmJwbSA9IG8uYnBtO1xyXG4gICAgcmV0LnRwYiA9IG8udHBiO1xyXG4gICAgcmV0LmJlYXQgPSBvLmJlYXQ7XHJcbiAgICByZXQuYmFyID0gby5iYXI7XHJcbiAgICByZXQucmVwZWF0ID0gby5yZXBlYXQ7XHJcbiAgICAvL3JldC50cmFja3MubGVuZ3RoID0gMDtcclxuICAgIG8udHJhY2tzLmZvckVhY2goZnVuY3Rpb24oZCxpKXtcclxuICAgICAgcmV0LnRyYWNrc1tpXSA9IFRyYWNrLmZyb21KU09OKGQscmV0KTtcclxuXHRcdFx0cmV0Wyd0cmsnICsgaSArICdnJ10udHJhY2sgPSByZXQudHJhY2tzW2ldO1xyXG5cdFx0XHRyZXRbJ3RyaycgKyBpICsgJ3AnXS50cmFjayA9IHJldC50cmFja3NbaV07XHJcblxyXG4gICAgfSk7XHJcbiAgICByZXQuY2FsY1N0ZXBUaW1lKCk7XHJcbiAgICByZXR1cm4gcmV0O1xyXG4gIH1cclxuXHJcblx0ZGlzcG9zZSgpe1xyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoOysraSlcclxuXHRcdHtcclxuXHRcdFx0aWYodGhpcyA9PT0gU2VxdWVuY2VyLnNlcXVlbmNlcnNbaV0pe1xyXG5cdFx0XHRcdCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zcGxpY2UoaSwxKTtcclxuXHRcdFx0XHQgYnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMubGVuZ3RoID09IDApXHJcblx0XHR7XHJcblx0XHRcdGlmKFNlcXVlbmNlci5lbXB0eSl7XHJcblx0XHRcdFx0U2VxdWVuY2VyLmVtcHR5KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblx0XHJcblx0Y2FsY1N0ZXBUaW1lKCl7XHJcblx0XHR0aGlzLnN0ZXBUaW1lXyA9IDYwLjAgLyAoIHRoaXMuYnBtICogdGhpcy50cGIpOyBcclxuXHR9XHJcblx0XHJcblx0c3RhcnQodGltZSl7XHJcblx0XHRpZih0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5TVE9QUEVEIHx8IHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBBVVNFRCApe1xyXG5cdFx0XHR0aGlzLmN1cnJlbnRUaW1lXyA9IHRpbWUgfHwgYXVkaW8uY3R4LmN1cnJlbnRUaW1lKCk7XHJcblx0XHRcdHRoaXMuc3RhcnRUaW1lXyAgPSB0aGlzLmN1cnJlbnRUaW1lXztcclxuXHRcdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5QTEFZSU5HO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRzdG9wKCl7XHJcblx0XHRpZih0aGlzLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QTEFZSU5HIHx8IHRoaXMuc3RhdHVzXyA9PSBTRVFfU1RBVFVTLlBBVVNFRClcclxuXHRcdHtcclxuXHRcdFx0dGhpcy50cmFja3MuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnBpdGNoZXMuZm9yRWFjaCgocCk9PntcclxuXHRcdFx0XHRcdHAuc3RvcCgpO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdGQudmVsb2NpdGllcy5mb3JFYWNoKCh2KT0+e1xyXG5cdFx0XHRcdFx0di5zdG9wKCk7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRcclxuXHRcdFx0dGhpcy5zdGF0dXNfID0gU0VRX1NUQVRVUy5TVE9QUEVEO1xyXG5cdFx0XHR0aGlzLnJlc2V0KCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRwYXVzZSgpe1xyXG5cdFx0aWYodGhpcy5zdGF0dXNfID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdHRoaXMuc3RhdHVzXyA9IFNFUV9TVEFUVVMuUEFVU0VEO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRyZXNldCgpe1xyXG5cdFx0dGhpcy5zdGFydFRpbWVfID0gMDtcclxuXHRcdHRoaXMuY3VycmVudFRpbWVfID0gMDtcclxuXHRcdHRoaXMudHJhY2tzLmZvckVhY2goKHRyYWNrKT0+e1xyXG5cdFx0XHR0cmFjay5lbmQgPSAhdHJhY2suZXZlbnRzLmxlbmd0aDtcclxuXHRcdFx0dHJhY2suc3RlcCA9IDA7XHJcblx0XHRcdHRyYWNrLnBvaW50ZXIgPSAwO1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLmNhbGNTdGVwVGltZSgpO1xyXG5cdH1cclxuICAvLyDjgrfjg7zjgrHjg7PjgrXjg7zjga7lh6bnkIZcclxuXHRwcm9jZXNzICh0aW1lKVxyXG5cdHtcclxuXHRcdHRoaXMuY3VycmVudFRpbWVfID0gdGltZSB8fCBhdWRpby5jdHguY3VycmVudFRpbWUoKTtcclxuXHRcdHZhciBjdXJyZW50U3RlcCA9ICh0aGlzLmN1cnJlbnRUaW1lXyAgLSB0aGlzLnN0YXJ0VGltZV8gKyAwLjEpIC8gdGhpcy5zdGVwVGltZV87XHJcblx0XHRsZXQgZW5kY291bnQgPSAwO1xyXG5cdFx0Zm9yKHZhciBpID0gMCxsID0gdGhpcy50cmFja3MubGVuZ3RoO2kgPCBsOysraSl7XHJcblx0XHRcdHZhciB0cmFjayA9IHRoaXMudHJhY2tzW2ldO1xyXG5cdFx0XHRpZighdHJhY2suZW5kKXtcclxuXHRcdFx0XHR3aGlsZSh0cmFjay5zdGVwIDw9IGN1cnJlbnRTdGVwICYmICF0cmFjay5lbmQgKXtcclxuXHRcdFx0XHRcdGlmKHRyYWNrLnBvaW50ZXIgPj0gdHJhY2suZXZlbnRzLmxlbmd0aCApe1xyXG5cdFx0XHRcdFx0XHR0cmFjay5lbmQgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHZhciBldmVudCA9IHRyYWNrLmV2ZW50c1t0cmFjay5wb2ludGVyKytdO1xyXG5cdFx0XHRcdFx0XHR2YXIgcGxheVRpbWUgPSB0cmFjay5zdGVwICogdGhpcy5zdGVwVGltZV8gKyB0aGlzLnN0YXJ0VGltZV87XHJcblx0XHRcdFx0XHRcdGV2ZW50LnByb2Nlc3MocGxheVRpbWUsdHJhY2spO1xyXG5cdFx0XHRcdFx0XHR0cmFjay5zdGVwICs9IGV2ZW50LnN0ZXA7XHJcbi8vXHRcdFx0XHRcdGNvbnNvbGUubG9nKHRyYWNrLnBvaW50ZXIsdHJhY2suZXZlbnRzLmxlbmd0aCx0cmFjay5ldmVudHNbdHJhY2sucG9pbnRlcl0sdHJhY2suc3RlcCxjdXJyZW50U3RlcCx0aGlzLmN1cnJlbnRUaW1lXyxwbGF5VGltZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdCsrZW5kY291bnQ7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGlmKGVuZGNvdW50ID09IHRoaXMudHJhY2tzLmxlbmd0aCl7XHJcblx0XHRcdHRoaXMuc3RvcCgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDmjqXntppcclxuXHRjb25uZWN0KGMpe1xyXG5cdFx0dmFyIHRyYWNrID0gYy5mcm9tLnBhcmFtLnRyYWNrO1xyXG5cdFx0aWYoYy5mcm9tLnBhcmFtLnR5cGUgPT09ICdwaXRjaCcpe1xyXG5cdFx0XHR0cmFjay5waXRjaGVzLnB1c2goU2VxdWVuY2VyLm1ha2VQcm9jZXNzKGMpKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRyYWNrLnZlbG9jaXRpZXMucHVzaChTZXF1ZW5jZXIubWFrZVByb2Nlc3MoYykpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHQvLyDliYrpmaRcclxuXHRkaXNjb25uZWN0KGMpe1xyXG5cdFx0dmFyIHRyYWNrID0gYy5mcm9tLnBhcmFtLnRyYWNrO1xyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdHJhY2sucGl0Y2hlcy5sZW5ndGg7KytpKXtcclxuXHRcdFx0aWYoYy50by5ub2RlID09PSB0cmFjay5waXRjaGVzW2ldLnRvLm5vZGUgJiYgYy50by5wYXJhbSA9PT0gdHJhY2sucGl0Y2hlc1tpXS50by5wYXJhbSl7XHJcblx0XHRcdFx0dHJhY2sucGl0Y2hlcy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Zm9yKHZhciBpID0gMDtpIDwgdHJhY2sudmVsb2NpdGllcy5sZW5ndGg7KytpKXtcclxuXHRcdFx0aWYoYy50by5ub2RlID09PSB0cmFjay52ZWxvY2l0aWVzW2ldLnRvLm5vZGUgJiYgYy50by5wYXJhbSA9PT0gdHJhY2sudmVsb2NpdGllc1tpXS50by5wYXJhbSl7XHJcblx0XHRcdFx0dHJhY2sucGl0Y2hlcy5zcGxpY2UoaS0tLDEpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgbWFrZVByb2Nlc3MoYyl7XHJcblx0XHRpZihjLnRvLnBhcmFtIGluc3RhbmNlb2YgYXVkaW8uUGFyYW1WaWV3KXtcclxuXHRcdFx0cmV0dXJuICB7XHJcblx0XHRcdFx0dG86Yy50byxcclxuXHRcdFx0XHRwcm9jZXNzOiAoY29tLHYsdCk9PntcclxuXHRcdFx0XHRcdGMudG8ubm9kZS5hdWRpb05vZGUucHJvY2VzcyhjLnRvLGNvbSx2LHQpO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0c3RvcDpmdW5jdGlvbigpe1xyXG5cdFx0XHRcdFx0Yy50by5ub2RlLmF1ZGlvTm9kZS5zdG9wKGMudG8pO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fTtcclxuXHRcdH0gXHJcblx0XHR2YXIgcHJvY2VzcztcclxuXHRcdGlmKGMudG8ucGFyYW0udHlwZSA9PT0gJ3BpdGNoJyl7XHJcblx0XHRcdHByb2Nlc3MgPSAoY29tLHYsdCkgPT4ge1xyXG5cdFx0XHRcdGNvbS5wcm9jZXNzUGl0Y2goYy50by5wYXJhbS5hdWRpb1BhcmFtLHYsdCk7XHJcblx0XHRcdH07XHRcdFx0XHRcdFxyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cHJvY2VzcyA9XHQoY29tLHYsdCk9PntcclxuXHRcdFx0XHRjb20ucHJvY2Vzc1ZlbG9jaXR5KGMudG8ucGFyYW0uYXVkaW9QYXJhbSx2LHQpO1xyXG5cdFx0XHR9O1x0XHRcdFx0XHRcclxuXHRcdH1cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHRvOmMudG8sXHJcblx0XHRcdHByb2Nlc3M6cHJvY2VzcyxcclxuXHRcdFx0c3RvcDpmdW5jdGlvbigpe1xyXG5cdFx0XHRcdGMudG8ucGFyYW0uYXVkaW9QYXJhbS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoMCk7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblx0fVxyXG5cclxuXHRzdGF0aWMgZXhlYygpXHJcblx0e1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUExBWUlORyl7XHJcblx0XHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoU2VxdWVuY2VyLmV4ZWMpO1xyXG5cdFx0XHRsZXQgZW5kY291bnQgPSAwO1xyXG5cdFx0XHRmb3IodmFyIGkgPSAwLGUgPSBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGg7aSA8IGU7KytpKXtcclxuXHRcdFx0XHR2YXIgc2VxID0gU2VxdWVuY2VyLnNlcXVlbmNlcnNbaV07XHJcblx0XHRcdFx0aWYoc2VxLnN0YXR1c18gPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0XHRcdHNlcS5wcm9jZXNzKGF1ZGlvLmN0eC5jdXJyZW50VGltZSk7XHJcblx0XHRcdFx0fSBlbHNlIGlmKHNlcS5zdGF0dXNfID09IFNFUV9TVEFUVVMuU1RPUFBFRCl7XHJcblx0XHRcdFx0XHQrK2VuZGNvdW50O1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRpZihlbmRjb3VudCA9PSBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGgpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRTZXF1ZW5jZXIuc3RvcFNlcXVlbmNlcygpO1xyXG5cdFx0XHRcdGlmKFNlcXVlbmNlci5zdG9wcGVkKXtcclxuXHRcdFx0XHRcdFNlcXVlbmNlci5zdG9wcGVkKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdC8vIOOCt+ODvOOCseODs+OCueWFqOS9k+OBruOCueOCv+ODvOODiFxyXG5cdHN0YXRpYyBzdGFydFNlcXVlbmNlcyh0aW1lKXtcclxuXHRcdGlmKFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9PSBTRVFfU1RBVFVTLlNUT1BQRUQgfHwgU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUEFVU0VEIClcclxuXHRcdHtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnN0YXJ0KHRpbWUpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID0gU0VRX1NUQVRVUy5QTEFZSU5HO1xyXG5cdFx0XHRTZXF1ZW5jZXIuZXhlYygpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHQvLyDjgrfjg7zjgrHjg7PjgrnlhajkvZPjga7lgZzmraJcclxuXHRzdGF0aWMgc3RvcFNlcXVlbmNlcygpe1xyXG5cdFx0aWYoU2VxdWVuY2VyLnNlcXVlbmNlcnMuc3RhdHVzID09IFNFUV9TVEFUVVMuUExBWUlORyB8fCBTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QQVVTRUQgKXtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnN0b3AoKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdFNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuU1RPUFBFRDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8vIOOCt+ODvOOCseODs+OCueWFqOS9k+OBruODneODvOOCulx0XHJcblx0c3RhdGljIHBhdXNlU2VxdWVuY2VzKCl7XHJcblx0XHRpZihTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPT0gU0VRX1NUQVRVUy5QTEFZSU5HKXtcclxuXHRcdFx0U2VxdWVuY2VyLnNlcXVlbmNlcnMuZm9yRWFjaCgoZCk9PntcclxuXHRcdFx0XHRkLnBhdXNlKCk7XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRTZXF1ZW5jZXIuc2VxdWVuY2Vycy5zdGF0dXMgPSBTRVFfU1RBVFVTLlBBVVNFRDtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcblNlcXVlbmNlci5zZXF1ZW5jZXJzID0gW107XHJcblNlcXVlbmNlci5zZXF1ZW5jZXJzLnN0YXR1cyA9IFNFUV9TVEFUVVMuU1RPUFBFRDsgXHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuaW1wb3J0IFVVSUQgZnJvbSAnLi91dWlkLmNvcmUnO1xyXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJy4vRXZlbnRFbWl0dGVyMyc7XHJcbmV4cG9ydCBjb25zdCBub2RlSGVpZ2h0ID0gNTA7XHJcbmV4cG9ydCBjb25zdCBub2RlV2lkdGggPSAxMDA7XHJcbmV4cG9ydCBjb25zdCBwb2ludFNpemUgPSAxNjtcclxuXHJcbi8vIHBhbmVsIHdpbmRvd1xyXG5leHBvcnQgY2xhc3MgUGFuZWwgIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcclxuXHRjb25zdHJ1Y3RvcihzZWwscHJvcCl7XHJcblx0XHRzdXBlcigpO1xyXG5cdFx0aWYoIXByb3AgfHwgIXByb3AuaWQpe1xyXG5cdFx0XHRwcm9wID0gcHJvcCA/IChwcm9wLmlkID0gJ2lkLScgKyBVVUlELmdlbmVyYXRlKCkscHJvcCkgOnsgaWQ6J2lkLScgKyBVVUlELmdlbmVyYXRlKCl9O1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5pZCA9IHByb3AuaWQ7XHJcblx0XHRzZWwgPSBzZWwgfHwgZDMuc2VsZWN0KCcjY29udGVudCcpO1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24gPSBcclxuXHRcdHNlbFxyXG5cdFx0LmFwcGVuZCgnZGl2JylcclxuXHRcdC5hdHRyKHByb3ApXHJcblx0XHQuYXR0cignY2xhc3MnLCdwYW5lbCcpXHJcblx0XHQuZGF0dW0odGhpcyk7XHJcblxyXG5cdFx0Ly8g44OR44ON44Or55SoRHJhZ+OBneOBruS7llxyXG5cclxuXHRcdHRoaXMuaGVhZGVyID0gdGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdoZWFkZXInKS5jYWxsKHRoaXMuZHJhZyk7XHJcblx0XHR0aGlzLmFydGljbGUgPSB0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2FydGljbGUnKTtcclxuXHRcdHRoaXMuZm9vdGVyID0gdGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdmb290ZXInKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnZGl2JylcclxuXHRcdC5jbGFzc2VkKCdwYW5lbC1jbG9zZScsdHJ1ZSlcclxuXHRcdC5vbignY2xpY2snLCgpPT57XHJcblx0XHRcdHRoaXMuZW1pdCgnZGlzcG9zZScpO1xyXG5cdFx0XHR0aGlzLmRpc3Bvc2UoKTtcclxuXHRcdH0pO1xyXG5cclxuXHR9XHRcclxuXHJcblx0Z2V0IG5vZGUoKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5zZWxlY3Rpb24ubm9kZSgpO1xyXG5cdH1cclxuXHRnZXQgeCAoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdsZWZ0JykpO1xyXG5cdH1cclxuXHRzZXQgeCAodil7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgnbGVmdCcsdiArICdweCcpO1xyXG5cdH1cclxuXHRnZXQgeSAoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd0b3AnKSk7XHJcblx0fVxyXG5cdHNldCB5ICh2KXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd0b3AnLHYgKyAncHgnKTtcclxuXHR9XHJcblx0Z2V0IHdpZHRoKCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnd2lkdGgnKSk7XHJcblx0fVxyXG5cdHNldCB3aWR0aCh2KXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd3aWR0aCcsIHYgKyAncHgnKTtcclxuXHR9XHJcblx0Z2V0IGhlaWdodCgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2hlaWdodCcpKTtcclxuXHR9XHJcblx0c2V0IGhlaWdodCh2KXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdoZWlnaHQnLHYgKyAncHgnKTtcclxuXHR9XHJcblx0XHJcblx0ZGlzcG9zZSgpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24ucmVtb3ZlKCk7XHJcblx0XHR0aGlzLnNlbGVjdGlvbiA9IG51bGw7XHJcblx0fVxyXG5cdFxyXG5cdHNob3coKXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd2aXNpYmlsaXR5JywndmlzaWJsZScpO1xyXG5cdFx0dGhpcy5lbWl0KCdzaG93Jyk7XHJcblx0fVxyXG5cclxuXHRoaWRlKCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScsJ2hpZGRlbicpO1xyXG5cdFx0dGhpcy5lbWl0KCdoaWRlJyk7XHJcblx0fVxyXG5cdFxyXG5cdGdldCBpc1Nob3coKXtcclxuXHRcdHJldHVybiB0aGlzLnNlbGVjdGlvbiAmJiB0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScpID09PSAndmlzaWJsZSc7XHJcblx0fVxyXG59XHJcblxyXG5QYW5lbC5wcm90b3R5cGUuZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKVxyXG5cdFx0Lm9uKCdkcmFnc3RhcnQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0XHRjb25zb2xlLmxvZyhkKTtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QoJyMnICsgZC5pZCk7XHJcblx0XHRcclxuXHRcdGQzLnNlbGVjdCgnI2NvbnRlbnQnKVxyXG5cdFx0LmFwcGVuZCgnZGl2JylcclxuXHRcdC5hdHRyKHtpZDoncGFuZWwtZHVtbXktJyArIGQuaWQsXHJcblx0XHRcdCdjbGFzcyc6J3BhbmVsIHBhbmVsLWR1bW15J30pXHJcblx0XHQuc3R5bGUoe1xyXG5cdFx0XHRsZWZ0OnNlbC5zdHlsZSgnbGVmdCcpLFxyXG5cdFx0XHR0b3A6c2VsLnN0eWxlKCd0b3AnKSxcclxuXHRcdFx0d2lkdGg6c2VsLnN0eWxlKCd3aWR0aCcpLFxyXG5cdFx0XHRoZWlnaHQ6c2VsLnN0eWxlKCdoZWlnaHQnKVxyXG5cdFx0fSk7XHJcblx0fSlcclxuXHQub24oXCJkcmFnXCIsIGZ1bmN0aW9uIChkKSB7XHJcblx0XHR2YXIgZHVtbXkgPSBkMy5zZWxlY3QoJyNwYW5lbC1kdW1teS0nICsgZC5pZCk7XHJcblxyXG5cdFx0dmFyIHggPSBwYXJzZUZsb2F0KGR1bW15LnN0eWxlKCdsZWZ0JykpICsgZDMuZXZlbnQuZHg7XHJcblx0XHR2YXIgeSA9IHBhcnNlRmxvYXQoZHVtbXkuc3R5bGUoJ3RvcCcpKSArIGQzLmV2ZW50LmR5O1xyXG5cdFx0XHJcblx0XHRkdW1teS5zdHlsZSh7J2xlZnQnOnggKyAncHgnLCd0b3AnOnkgKyAncHgnfSk7XHJcblx0fSlcclxuXHQub24oJ2RyYWdlbmQnLGZ1bmN0aW9uKGQpe1xyXG5cdFx0dmFyIHNlbCA9IGQzLnNlbGVjdCgnIycgKyBkLmlkKTtcclxuXHRcdHZhciBkdW1teSA9IGQzLnNlbGVjdCgnI3BhbmVsLWR1bW15LScgKyBkLmlkKTtcclxuXHRcdHNlbC5zdHlsZShcclxuXHRcdFx0eydsZWZ0JzpkdW1teS5zdHlsZSgnbGVmdCcpLCd0b3AnOmR1bW15LnN0eWxlKCd0b3AnKX1cclxuXHRcdCk7XHJcblx0XHRkLmVtaXQoJ2RyYWdlbmQnKTtcclxuXHRcdGR1bW15LnJlbW92ZSgpO1xyXG5cdH0pO1xyXG5cdFxyXG4iLCIndXNlIHN0cmljdCc7XHJcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9FdmVudEVtaXR0ZXIzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBVbmRvTWFuYWdlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XHJcblx0Y29uc3RydWN0b3IoKXtcclxuXHRcdHN1cGVyKCk7XHJcblx0XHR0aGlzLmJ1ZmZlciA9IFtdO1xyXG5cdFx0dGhpcy5pbmRleCA9IC0xO1xyXG5cdH1cclxuXHRcclxuXHRjbGVhcigpe1xyXG4gICAgdGhpcy5idWZmZXIubGVuZ3RoID0gMDtcclxuICAgIHRoaXMuaW5kZXggPSAtMTtcclxuICAgIHRoaXMuZW1pdCgnY2xlYXJlZCcpO1xyXG5cdH1cclxuXHRcclxuXHRleGVjKGNvbW1hbmQpe1xyXG4gICAgY29tbWFuZC5leGVjKCk7XHJcbiAgICBpZiAoKHRoaXMuaW5kZXggKyAxKSA8IHRoaXMuYnVmZmVyLmxlbmd0aClcclxuICAgIHtcclxuICAgICAgdGhpcy5idWZmZXIubGVuZ3RoID0gdGhpcy5pbmRleCArIDE7XHJcbiAgICB9XHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoKGNvbW1hbmQpO1xyXG4gICAgKyt0aGlzLmluZGV4O1xyXG4gICAgdGhpcy5lbWl0KCdleGVjdXRlZCcpO1xyXG5cdH1cclxuXHRcclxuXHRyZWRvKCl7XHJcbiAgICBpZiAoKHRoaXMuaW5kZXggKyAxKSA8ICh0aGlzLmJ1ZmZlci5sZW5ndGgpKVxyXG4gICAge1xyXG4gICAgICArK3RoaXMuaW5kZXg7XHJcbiAgICAgIHZhciBjb21tYW5kID0gdGhpcy5idWZmZXJbdGhpcy5pbmRleF07XHJcbiAgICAgIGNvbW1hbmQucmVkbygpO1xyXG4gICAgICB0aGlzLmVtaXQoJ3JlZGlkJyk7XHJcbiAgICAgIGlmICgodGhpcy5pbmRleCAgKyAxKSA9PSB0aGlzLmJ1ZmZlci5sZW5ndGgpXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmVtaXQoJ3JlZG9FbXB0eScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblx0fVxyXG4gIHVuZG8oKVxyXG4gIHtcclxuICAgIGlmICh0aGlzLmJ1ZmZlci5sZW5ndGggPiAwICYmIHRoaXMuaW5kZXggPj0gMClcclxuICAgIHtcclxuICAgICAgdmFyIGNvbW1hbmQgPSB0aGlzLmJ1ZmZlclt0aGlzLmluZGV4XTtcclxuICAgICAgY29tbWFuZC51bmRvKCk7XHJcbiAgICAgIC0tdGhpcy5pbmRleDtcclxuICAgICAgdGhpcy5lbWl0KCd1bmRpZCcpO1xyXG4gICAgICBpZiAodGhpcy5pbmRleCA8IDApXHJcbiAgICAgIHtcclxuICAgICAgICB0aGlzLmluZGV4ID0gLTE7XHJcbiAgICAgICAgdGhpcy5lbWl0KCd1bmRvRW1wdHknKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHRcclxufVxyXG5cclxudmFyIHVuZG9NYW5hZ2VyID0gbmV3IFVuZG9NYW5hZ2VyKCk7XHJcbmV4cG9ydCBkZWZhdWx0IHVuZG9NYW5hZ2VyOyIsIi8qXG4gVmVyc2lvbjogY29yZS0xLjBcbiBUaGUgTUlUIExpY2Vuc2U6IENvcHlyaWdodCAoYykgMjAxMiBMaW9zSy5cbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBVVUlEKCl7fVVVSUQuZ2VuZXJhdGU9ZnVuY3Rpb24oKXt2YXIgYT1VVUlELl9ncmksYj1VVUlELl9oYTtyZXR1cm4gYihhKDMyKSw4KStcIi1cIitiKGEoMTYpLDQpK1wiLVwiK2IoMTYzODR8YSgxMiksNCkrXCItXCIrYigzMjc2OHxhKDE0KSw0KStcIi1cIitiKGEoNDgpLDEyKX07VVVJRC5fZ3JpPWZ1bmN0aW9uKGEpe3JldHVybiAwPmE/TmFOOjMwPj1hPzB8TWF0aC5yYW5kb20oKSooMTw8YSk6NTM+PWE/KDB8MTA3Mzc0MTgyNCpNYXRoLnJhbmRvbSgpKSsxMDczNzQxODI0KigwfE1hdGgucmFuZG9tKCkqKDE8PGEtMzApKTpOYU59O1VVSUQuX2hhPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPWEudG9TdHJpbmcoMTYpLGQ9Yi1jLmxlbmd0aCxlPVwiMFwiOzA8ZDtkPj4+PTEsZSs9ZSlkJjEmJihjPWUrYyk7cmV0dXJuIGN9O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJy4uL3NyYy9hdWRpbyc7XHJcbmltcG9ydCB7aW5pdFVJLGRyYXcsc3ZnLGNyZWF0ZUF1ZGlvTm9kZVZpZXcgfSBmcm9tICcuLi9zcmMvZHJhdyc7XHJcblxyXG5cclxuZGVzY3JpYmUoJ0F1ZGlvTm9kZVRlc3QnLCAoKSA9PiB7XHJcbiAgXHJcbiAgYXVkaW8uc2V0Q3R4KG5ldyBBdWRpb0NvbnRleHQoKSk7XHJcblx0dmFyIG9zYywgZ2FpbiwgZmlsdGVyLCBvdXQsIG9zYzIsIHNwbGl0dGVyLCBtZXJnZXIsZWcsc2VxO1xyXG5cclxuXHRiZWZvcmVFYWNoKCgpID0+IHtcclxuXHJcblx0fSk7XHJcblxyXG5cdGl0KFwiYXVkaW8uQXVkaW9Ob2RlVmlld+i/veWKoFwiLCAoKSA9PiB7XHJcblxyXG5cdFx0b3NjID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZU9zY2lsbGF0b3IoKSk7XHJcblx0XHRvc2MueCA9IDEwMDtcclxuXHRcdG9zYy55ID0gMjAwO1xyXG5cclxuXHRcdGdhaW4gPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguY3JlYXRlR2FpbigpKTtcclxuXHJcblx0XHRnYWluLnggPSA0MDA7XHJcblx0XHRnYWluLnkgPSAyMDA7XHJcblxyXG5cdFx0ZmlsdGVyID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmNyZWF0ZUJpcXVhZEZpbHRlcigpKTtcclxuXHRcdGZpbHRlci54ID0gMjUwO1xyXG5cdFx0ZmlsdGVyLnkgPSAzMzA7XHJcblxyXG5cdFx0b3V0ID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUoYXVkaW8uY3R4LmRlc3RpbmF0aW9uKTtcclxuXHRcdG91dC54ID0gNzUwO1xyXG5cdFx0b3V0LnkgPSAzMDA7XHJcblxyXG5cclxuXHRcdG9zYzIgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguY3JlYXRlT3NjaWxsYXRvcigpKTtcclxuXHRcdG9zYzIueCA9IDEwMDtcclxuXHRcdG9zYzIueSA9IDYwMDtcclxuXHJcblx0XHRzcGxpdHRlciA9IGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY3JlYXRlKGF1ZGlvLmN0eC5jcmVhdGVDaGFubmVsU3BsaXR0ZXIoKSk7XHJcblx0XHRzcGxpdHRlci54ID0gMjUwO1xyXG5cdFx0c3BsaXR0ZXIueSA9IDYwMDtcclxuXHJcblx0XHRtZXJnZXIgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShhdWRpby5jdHguY3JlYXRlQ2hhbm5lbE1lcmdlcigpKTtcclxuXHRcdG1lcmdlci54ID0gNTAwO1xyXG5cdFx0bWVyZ2VyLnkgPSA2MDA7XHJcblx0XHRcclxuXHRcdGVnID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5jcmVhdGUobmV3IGF1ZGlvLkVHKCkpO1xyXG5cdFx0ZWcueCA9IDEwMDtcclxuXHRcdGVnLnkgPSA0MDA7XHJcblx0XHRzZXEgPSBhdWRpby5BdWRpb05vZGVWaWV3LmNyZWF0ZShuZXcgYXVkaW8uU2VxdWVuY2VyKCkpO1xyXG5cdFx0c2VxLnggPSAyMDA7XHJcblx0XHRzZXEueSA9IDQwMDtcclxuXHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aCkudG9FcXVhbCg5KTtcclxuXHR9KTtcclxuXHJcblx0aXQoJ+OCs+ODjeOCr+OCt+ODp+ODs+i/veWKoOW+jOODgeOCp+ODg+OCrycsICgpID0+IHtcclxuXHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qob3NjLCBmaWx0ZXIpO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KG9zYywgZ2Fpbi5pbnB1dFBhcmFtc1swXSk7XHJcblx0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdChmaWx0ZXIsIGdhaW4pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KGdhaW4sIG91dCk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QobWVyZ2VyLCBvdXQpO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAwIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMCB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMSB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDEgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDIgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAzIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAzIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMiB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogNSB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDUgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDQgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiA0IH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KG9zYzIsIHNwbGl0dGVyKTtcclxuXHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOmVnLHBhcmFtOmVnLm91dHB1dH0se25vZGU6Z2FpbixwYXJhbTpnYWluLmlucHV0UGFyYW1zWzBdfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6c2VxLHBhcmFtOnNlcS50cmswZ30se25vZGU6ZWcscGFyYW06ZWcuZ2F0ZX0pO1xyXG5cclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoKS50b0VxdWFsKDE0KTtcclxuXHR9KTtcclxuXHRcdFxyXG5cclxuXHRpdCgn44OO44O844OJ5YmK6ZmkJywgKCkgPT4ge1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUob3NjKTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKHNlcSk7XHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzLmxlbmd0aCkudG9FcXVhbCg3KTtcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvQ29ubmVjdGlvbnMubGVuZ3RoKS50b0VxdWFsKDExKTtcclxuXHRcdGV4cGVjdChhdWRpby5TZXF1ZW5jZXIuc2VxdWVuY2Vycy5sZW5ndGgpLnRvRXF1YWwoMCk7IFxyXG5cdH0pO1xyXG5cdFxyXG5cdGl0KCfjgrPjg43jgq/jgrfjg6fjg7PliYrpmaQnLCgpPT57XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3Qoe25vZGU6ZWcscGFyYW06ZWcub3V0cHV0fSx7bm9kZTpnYWluLHBhcmFtOmdhaW4uaW5wdXRQYXJhbXNbMF19KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMCB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDAgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDEgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiAxIH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiAyIH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogMyB9KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuZGlzY29ubmVjdCh7IG5vZGU6IHNwbGl0dGVyLCBwYXJhbTogMyB9LCB7IG5vZGU6IG1lcmdlciwgcGFyYW06IDIgfSk7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmRpc2Nvbm5lY3QoeyBub2RlOiBzcGxpdHRlciwgcGFyYW06IDUgfSwgeyBub2RlOiBtZXJnZXIsIHBhcmFtOiA1IH0pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5kaXNjb25uZWN0KHsgbm9kZTogc3BsaXR0ZXIsIHBhcmFtOiA0IH0sIHsgbm9kZTogbWVyZ2VyLCBwYXJhbTogNCB9KTtcclxuXHRcdFxyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Db25uZWN0aW9ucy5sZW5ndGgpLnRvRXF1YWwoNCk7XHJcblx0fSk7XHJcblxyXG5cdGl0KCfjg5XjgqPjg6vjgr/jg7zliYrpmaTlvozjg4Hjgqfjg4Pjgq8nLCAoKSA9PiB7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShmaWx0ZXIpO1xyXG5cdFx0ZXhwZWN0KGF1ZGlvLkF1ZGlvTm9kZVZpZXcuYXVkaW9Ob2Rlcy5sZW5ndGgpLnRvRXF1YWwoNik7XHJcblx0XHRleHBlY3QoYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmxlbmd0aCkudG9FcXVhbCgzKTtcclxuXHRcdGV4cGVjdCgoKCkgPT4ge1xyXG5cdFx0XHR2YXIgcmV0ID0gMDtcclxuXHRcdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb0Nvbm5lY3Rpb25zLmZvckVhY2goKGQpID0+IHtcclxuXHRcdFx0XHRpZiAoZC5mcm9tLm5vZGUgPT09IGZpbHRlciB8fCBkLnRvLm5vZGUgPT09IGZpbHRlcikge1xyXG5cdFx0XHRcdFx0KytyZXQ7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0cmV0dXJuIHJldDtcclxuXHRcdH0pKCkpLnRvRXF1YWwoMCk7XHJcblx0fSk7XHJcblx0XHJcblx0aXQoJ+ODjuODvOODieWFqOWJiumZpCcsKCk9PntcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKGVnKTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKGdhaW4pO1xyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5yZW1vdmUob3V0KTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKHNwbGl0dGVyKTtcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcucmVtb3ZlKG1lcmdlcik7XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LnJlbW92ZShvc2MyKTtcclxuXHRcdGV4cGVjdChhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXMubGVuZ3RoKS50b0VxdWFsKDApO1xyXG5cdH0pO1xyXG5cdFxyXG5cdGl0KCfmj4/nlLvjgZfjgabjgb/jgosnLCgpPT57XHJcblx0XHQvL1x0b3NjLmF1ZGlvTm9kZS50eXBlID0gJ3Nhd3Rvb3RoJztcclxuXHRcdFxyXG5cdFx0dmFyIGNvbnRlbnQgPSBkMy5zZWxlY3QoJ2JvZHknKS5hcHBlbmQoJ2RpdicpLmF0dHIoJ2lkJywnY29udGVudCcpLmNsYXNzZWQoJ2NvbnRlbnQnLHRydWUpO1xyXG5cdFx0dmFyIHBsYXllciA9IGNvbnRlbnQuYXBwZW5kKCdkaXYnKS5hdHRyKHtpZDoncGxheWVyJyxjbGFzczoncGxheWVyJ30pO1xyXG5cdFx0cGxheWVyLmFwcGVuZCgnYnV0dG9uJykuYXR0cih7aWQ6J3BsYXknLGNsYXNzOidwbGF5J30pLnRleHQoJ+KWvCcpO1xyXG5cdFx0cGxheWVyLmFwcGVuZCgnYnV0dG9uJykuYXR0cih7aWQ6J3N0b3AnLGNsYXNzOidzdG9wJ30pLnRleHQoJ+KWoCcpO1xyXG5cdFx0cGxheWVyLmFwcGVuZCgnYnV0dG9uJykuYXR0cih7aWQ6J3BhdXNlJyxjbGFzczoncGF1c2UnfSkudGV4dCgn77ydJyk7XHJcblxyXG5cdFx0aW5pdFVJKCk7XHJcblx0XHRcclxuXHRcdC8vIOOCs+ODjeOCr+OCt+ODp+ODs1xyXG5cdFx0XHJcblx0XHRsZXQgb3V0ID0gYXVkaW8uQXVkaW9Ob2RlVmlldy5hdWRpb05vZGVzWzBdO1xyXG5cdFx0bGV0IG9zYyA9IGNyZWF0ZUF1ZGlvTm9kZVZpZXcoJ09zY2lsbGF0b3InKTtcclxuXHRcdG9zYy54ID0gNDAwO1xyXG5cdFx0b3NjLnkgPSAzMDA7XHJcblx0XHRsZXQgZ2FpbiA9IGNyZWF0ZUF1ZGlvTm9kZVZpZXcoJ0dhaW4nKTtcclxuXHRcdGdhaW4ueCA9IDU1MDtcclxuXHRcdGdhaW4ueSA9IDIwMDtcclxuXHRcdGxldCBzZXEgPSBjcmVhdGVBdWRpb05vZGVWaWV3KCdTZXF1ZW5jZXInKTtcclxuXHRcdHNlcS54ID0gNTA7XHJcblx0XHRzZXEueSA9IDMwMDtcclxuXHRcdGxldCBlZyA9IGNyZWF0ZUF1ZGlvTm9kZVZpZXcoJ0VHJyk7XHJcblx0XHRlZy54ID0gMjAwO1xyXG5cdFx0ZWcueSA9IDIwMDtcclxuXHRcdFxyXG5cdFx0Ly8g5o6l57aaXHJcblx0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpzZXEscGFyYW06c2VxLnRyazBnfSx7bm9kZTplZyxwYXJhbTplZy5nYXRlfSk7XHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOnNlcSxwYXJhbTpzZXEudHJrMHB9LHtub2RlOm9zYyxwYXJhbTpvc2MuZnJlcXVlbmN5fSk7XHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOm9zYyxwYXJhbTowfSx7bm9kZTpnYWluLHBhcmFtOjB9KTtcdFx0XHJcblx0XHRhdWRpby5BdWRpb05vZGVWaWV3LmNvbm5lY3Qoe25vZGU6ZWcscGFyYW06ZWcub3V0cHV0fSx7bm9kZTpnYWluLHBhcmFtOmdhaW4uZ2Fpbn0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpnYWluLHBhcmFtOjB9LHtub2RlOm91dCxwYXJhbTowfSk7XHRcclxuXHJcblx0XHQvLyDjgrPjg43jgq/jgrfjg6fjg7NcclxuXHRcdFxyXG5cdFx0bGV0IG91dDEgPSBhdWRpby5BdWRpb05vZGVWaWV3LmF1ZGlvTm9kZXNbMF07XHJcblx0XHRsZXQgb3NjMSA9IGNyZWF0ZUF1ZGlvTm9kZVZpZXcoJ09zY2lsbGF0b3InKTtcclxuXHRcdG9zYzEueCA9IDQwMDtcclxuXHRcdG9zYzEueSA9IDUwMDtcclxuXHRcdGxldCBnYWluMSA9IGNyZWF0ZUF1ZGlvTm9kZVZpZXcoJ0dhaW4nKTtcclxuXHRcdGdhaW4xLnggPSA1NTA7XHJcblx0XHRnYWluMS55ID0gNDAwO1xyXG5cdFx0bGV0IGVnMSA9IGNyZWF0ZUF1ZGlvTm9kZVZpZXcoJ0VHJyk7XHJcblx0XHRlZzEueCA9IDIwMDtcclxuXHRcdGVnMS55ID0gNDAwO1xyXG5cdFx0XHJcblx0XHQvLyDmjqXntppcclxuXHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOnNlcSxwYXJhbTpzZXEudHJrMWd9LHtub2RlOmVnMSxwYXJhbTplZzEuZ2F0ZX0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpzZXEscGFyYW06c2VxLnRyazFwfSx7bm9kZTpvc2MxLHBhcmFtOm9zYzEuZnJlcXVlbmN5fSk7XHRcdFxyXG5cdFx0YXVkaW8uQXVkaW9Ob2RlVmlldy5jb25uZWN0KHtub2RlOm9zYzEscGFyYW06MH0se25vZGU6Z2FpbjEscGFyYW06MH0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTplZzEscGFyYW06ZWcxLm91dHB1dH0se25vZGU6Z2FpbjEscGFyYW06Z2FpbjEuZ2Fpbn0pO1x0XHRcclxuXHRcdGF1ZGlvLkF1ZGlvTm9kZVZpZXcuY29ubmVjdCh7bm9kZTpnYWluMSxwYXJhbTowfSx7bm9kZTpvdXQscGFyYW06MH0pO1x0XHJcblxyXG5cdFx0XHJcblx0XHQvLyDjgrfjg7zjgrHjg7Pjgrnjg4fjg7zjgr/jga7mjL/lhaVcclxuXHRcdHNlcS5hdWRpb05vZGUuYnBtID0gMTIwO1xyXG5cdFx0c2VxLmF1ZGlvTm9kZS50cmFja3NbMF0uZXZlbnRzLnB1c2gobmV3IGF1ZGlvLk5vdGVFdmVudCg0OCw0Nyw2LDEuMCkpO1xyXG5cdFx0Zm9yKHZhciBpID0gNDg7aTwgMTEwOysraSl7XHJcblx0XHRcdHNlcS5hdWRpb05vZGUudHJhY2tzWzBdLmV2ZW50cy5wdXNoKG5ldyBhdWRpby5Ob3RlRXZlbnQoNDgsaSw2LDEuMCkpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRzZXEuYXVkaW9Ob2RlLnRyYWNrc1sxXS5ldmVudHMucHVzaChuZXcgYXVkaW8uTm90ZUV2ZW50KDE5MiwwLDYsMS4wKSk7XHJcblx0XHRmb3IodmFyIGkgPSA0NztpPCAxMTA7KytpKXtcclxuXHRcdFx0c2VxLmF1ZGlvTm9kZS50cmFja3NbMV0uZXZlbnRzLnB1c2gobmV3IGF1ZGlvLk5vdGVFdmVudCg0OCxpLDYsMS4wKSk7XHJcblx0XHR9XHJcblx0XHRkcmF3KCk7XHJcblx0XHRleHBlY3QodHJ1ZSkudG9CZSh0cnVlKTtcclxuXHR9KTtcclxuXHRcclxuXHRcclxuXHRcclxuXHRcclxufSk7Il19
