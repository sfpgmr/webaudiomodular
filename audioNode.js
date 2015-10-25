'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var NodeViewData = function NodeViewData() {
	var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	var width = arguments.length <= 2 || arguments[2] === undefined ? nodeWidth : arguments[2];
	var height = arguments.length <= 3 || arguments[3] === undefined ? nodeHeight : arguments[3];

	_classCallCheck(this, NodeViewData);

	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
};

var AudioParam_ = (function (_NodeViewData) {
	_inherits(AudioParam_, _NodeViewData);

	function AudioParam_(audioNode_, name, param) {
		_classCallCheck(this, AudioParam_);

		_get(Object.getPrototypeOf(AudioParam_.prototype), 'constructor', this).call(this, 0, 0, pointSize, pointSize);
		this.id = counter++;
		this.name = name;
		this.audioParam = param;
		this.audioNode_ = audioNode_;
	}

	return AudioParam_;
})(NodeViewData);

var AudioNode_ = (function (_NodeViewData2) {
	_inherits(AudioNode_, _NodeViewData2);

	function AudioNode_(audioNode) {
		var _this = this;

		_classCallCheck(this, AudioNode_);

		_get(Object.getPrototypeOf(AudioNode_.prototype), 'constructor', this).call(this);
		this.id = counter++;
		this.audioNode = audioNode;
		this.name = audioNode.constructor.toString().match(/function\s(.*)\(/)[1];
		this.audioParams = [];
		var cy = 1;
		for (var i in audioNode) {
			if (typeof audioNode[i] === 'function') {
				this[i] = audioNode[i].bind(audioNode);
			} else {
				if (typeof audioNode[i] === 'object') {
					if (audioNode[i] instanceof AudioParam) {
						this[i] = new AudioParam_(this, i, audioNode[i]);
						this.audioParams.push(this[i]);
						this[i].y = 20 * cy++;
					} else {
						this[i] = audioNode[i];
					}
				} else {
					Object.defineProperty(this, i, {
						get: (function (i) {
							return _this.audioNode[i];
						}).bind(null, i),
						set: (function (i, v) {
							_this.audioNode[i] = v;
						}).bind(null, i),
						enumerable: true,
						configurable: false
					});
				}
			}
		}

		this.inputStartY = cy * 20;
		var inputHeight = (cy + this.numberOfInputs) * 20;
		var outputHeight = this.numberOfOutputs * 20 + 20;
		this.outputStartY = 20;
		this.height = Math.max(this.height, inputHeight, outputHeight);
		this.cache = {};
	}

	// 1つだけだとノードの削除で2つの場合はコネクションの削除

	_createClass(AudioNode_, null, [{
		key: 'remove',
		value: function remove(node) {
			// ノードの削除
			for (var i = 0; i < AudioNode_.audioNodes.length; ++i) {
				if (AudioNode_.audioNodes[i] === node) {
					AudioNode_.audioNodes.splice(i--, 1);
				}
			}

			for (var i = 0; i < AudioNode_.audioConnections.length; ++i) {
				var n = AudioNode_.audioConnections[i];
				var disconnected = false;
				if (n.from.node === node) {
					if (n.to.param) {
						// toパラメータあり
						if (n.to.param instanceof AudioParam_) {
							// AUdioParam
							if (n.from.param) {
								// fromパラメータあり
								n.from.node.disconnect(n.to.param.audioParam, n.from.param);
								disconnected = true;
							} else {
								// fromパラメータなし
								n.from.node.disconnect(n.to.param.audioParam);
								disconnected = true;
							}
						} else {
							// n.to.paramが数字
							if (n.from.param) {
								// fromパラメータあり
								n.from.node.disconnect(n.to.node.audioNode, n.from.param, n.to.param);
								disconnected = true;
							} else {
								// fromパラメータなし
								n.from.node.disconnect(n.to.node.audioNode, 0, n.to.param);
								disconnected = true;
							}
						}
					} else {
						// to パラメータなし
						if (n.from.param) {
							// fromパラメータあり
							n.from.node.disconnect(n.to.node.audioNode, n.from.param);
							disconnected = true;
						} else {
							// fromパラメータなし
							n.from.node.disconnect(n.to.node.audioNode);
							disconnected = true;
						}
					}
				}

				if (n.to.node === node) {
					if (n.from.param) {
						// from パラメータあり
						if (n.to.param) {
							// to パラメータあり
							if (n.to.param instanceof AudioParam_) {
								// to パラメータがAudioParam_
								n.from.node.disconnect(n.to.param.audioParam, n.from.param);
								disconnected = true;
							} else {
								// to パラメータが数字
								n.from.node.disconnect(n.to.node.audioNode, n.from.param, n.to.param);
								disconnected = true;
							}
						} else {
							// to パラメータなし
							n.from.node.disconnect(n.to.node.audioNode, n.from.param);
							disconnected = true;
						}
					} else {
						// from パラメータなし
						if (n.to.param) {
							// to パラメータあり
							if (n.to.param instanceof AudioParam_) {
								// to パラメータがAudioParam_
								n.from.node.disconnect(n.to.param.audioParam);
								disconnected = true;
							} else {
								// to パラメータが数字
								n.from.node.disconnect(n.to.node.audioNode, 0, n.to.param);
								disconnected = true;
							}
						} else {
							// to パラメータなし
							n.from.node.disconnect(n.to.node.audioNode);
							disconnected = true;
						}
					}
				}
				if (disconnected) {
					AudioNode_.audioConnections.splice(i--, 1);
				}
			}
		}
	}, {
		key: 'disconnect',
		value: function disconnect(from_, to_) {
			if (from_ instanceof AudioNode_) {
				from_ = { node: from_ };
			}

			if (to_ instanceof AudioNode_) {
				to_ = { node: to_ };
			}

			if (to_ instanceof AudioParam_) {
				to_ = { node: to_.audioNode_, param: to_ };
			}

			var con = { 'from': from_, 'to': to_ };

			// コネクションの削除
			for (var i = 0; i < AudioNode_.audioConnections.length; ++i) {
				var n = AudioNode_.audioConnections[i];
				if (con === n) {
					AudioNode_.audioConnections.splice(i--, 1);
					if (con.from.param) {
						// fromパラメータあり
						if (con.to.param) {
							// to パラメータあり
							if (con.to.param instanceof AudioParam_) {
								// to AudioParam_
								con.from.node.disconnect(con.to.param.audioParam, con.from.param);
							} else {
								// to 数字
								con.from.node.disconnect(con.to.node.audioNode, con.from.param, con.to.param);
							}
						} else {
							// to パラメータなし
							con.from.node.disconnect(con.to.node.audioNode, con.from.param);
						}
					} else {
						// fromパラメータなし
						if (con.to.param) {
							// to パラメータあり
							if (con.to.param instanceof AudioParam_) {
								// to AudioParam_
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
			var obj = new AudioNode_(audionode);
			AudioNode_.audioNodes.push(obj);
			return obj;
		}
	}, {
		key: 'connect',
		value: function connect(from_, to_) {
			if (from_ instanceof AudioNode_) {
				from_ = { node: from_ };
			}

			if (to_ instanceof AudioNode_) {
				to_ = { node: to_ };
			}

			if (to_ instanceof AudioParam_) {
				to_ = { node: to_.audioNode_, param: to_ };
			}
			// 存在チェック
			for (var i = 0, l = AudioNode_.audioConnections.length; i < l; ++i) {
				if (AudioNode_.audioConnections[i].from === from_ && AudioNode_.audioConnections[i].to === to_) {
					throw new Error('接続が重複しています。');
				}
			}

			if (from_.param) {
				// fromパラメータあり
				if (to_.param) {
					// toパラメータあり
					if (to_.param instanceof AudioParam_) {
						// AudioParamの場合
						from_.node.connect(to_.param.audioParam, from_.param);
					} else {
						// 数字の場合
						from_.node.connect(to_.node.audioNode, from_.param, to_.param);
					}
				} else {
					// toパラメータなし
					from_.node.connect(to_.node.audioNode, from_.param);
				}
			} else {
				// fromパラメータなし
				if (to_.param) {
					// toパラメータあり
					if (to_.param instanceof AudioParam_) {
						// AudioParamの場合
						from_.node.connect(to_.param.audioParam);
					} else {
						// 数字の場合
						from_.node.connect(to_.node.audioNode, 0, to_.param);
					}
				} else {
					// toパラメータなし
					from_.node.connect(to_.node.audioNode);
				}
				//throw new Error('Connection Error');
			}

			AudioNode_.audioConnections.push({
				'from': from_,
				'to': to_
			});
		}
	}]);

	return AudioNode_;
})(NodeViewData);

AudioNode_.audioNodes = [];
AudioNode_.audioConnections = [];