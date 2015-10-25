"use strict";

// panel window

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var panel = (function () {
	function panel(sel, id, klass) {
		_classCallCheck(this, panel);

		this.selection = sel.append('div').attr({ 'id': id, 'class': klass || 'panel' });
		this.selection.append('div').classed('panel-close', true);
		this.selection.append('header');
		this.selection.append('article');
		this.selection.append('footer');
	}

	_createClass(panel, [{
		key: 'selection',
		get: function get() {
			return this.selection;
		}
	}, {
		key: 'node',
		get: function get() {
			return this.selection.node();
		}
	}]);

	return panel;
})();