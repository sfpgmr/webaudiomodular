"use strict";

// panel window

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Panel = (function () {
	function Panel(sel, prop) {
		var _this = this;

		_classCallCheck(this, Panel);

		if (!prop || !prop.id) {
			prop = prop ? (prop.id = 'id-' + UUID.generate(), prop) : { id: 'id-' + UUID.generate() };
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
		}).append('span').text('x');
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
//# sourceMappingURL=data:application/json;base64,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XCI7XHJcblxyXG4vLyBwYW5lbCB3aW5kb3dcclxuY2xhc3MgUGFuZWwge1xyXG5cdGNvbnN0cnVjdG9yKHNlbCxwcm9wKXtcclxuXHRcdGlmKCFwcm9wIHx8ICFwcm9wLmlkKXtcclxuXHRcdFx0cHJvcCA9IHByb3AgPyAocHJvcC5pZCA9ICdpZC0nICsgVVVJRC5nZW5lcmF0ZSgpLHByb3ApIDp7IGlkOidpZC0nICsgVVVJRC5nZW5lcmF0ZSgpfTtcclxuXHRcdH1cclxuXHRcdHRoaXMuaWQgPSBwcm9wLmlkO1xyXG5cdFx0c2VsID0gc2VsIHx8IGQzLnNlbGVjdCgnI2NvbnRlbnQnKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uID0gXHJcblx0XHRzZWxcclxuXHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHQuYXR0cihwcm9wKVxyXG5cdFx0LmF0dHIoJ2NsYXNzJywncGFuZWwnKVxyXG5cdFx0LmRhdHVtKHRoaXMpO1xyXG5cclxuXHRcdC8vIOODkeODjeODq+eUqERyYWfjgZ3jga7ku5ZcclxuXHJcblx0XHR0aGlzLmhlYWRlciA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnaGVhZGVyJykuY2FsbCh0aGlzLmRyYWcpO1xyXG5cdFx0dGhpcy5hcnRpY2xlID0gdGhpcy5zZWxlY3Rpb24uYXBwZW5kKCdhcnRpY2xlJyk7XHJcblx0XHR0aGlzLmZvb3RlciA9IHRoaXMuc2VsZWN0aW9uLmFwcGVuZCgnZm9vdGVyJyk7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5hcHBlbmQoJ2RpdicpXHJcblx0XHQuY2xhc3NlZCgncGFuZWwtY2xvc2UnLHRydWUpXHJcblx0XHQub24oJ2NsaWNrJywoKT0+e1xyXG5cdFx0XHR0aGlzLmRpc3Bvc2UoKTtcclxuXHRcdH0pXHJcblx0XHQuYXBwZW5kKCdzcGFuJylcclxuXHRcdC50ZXh0KCd4Jyk7XHJcblxyXG5cdH1cdFxyXG5cclxuXHRnZXQgbm9kZSgpIHtcclxuXHRcdHJldHVybiB0aGlzLnNlbGVjdGlvbi5ub2RlKCk7XHJcblx0fVxyXG5cdGdldCB4ICgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2xlZnQnKSk7XHJcblx0fVxyXG5cdHNldCB4ICh2KXtcclxuXHRcdHRoaXMuc2VsZWN0aW9uLnN0eWxlKCdsZWZ0Jyx2ICsgJ3B4Jyk7XHJcblx0fVxyXG5cdGdldCB5ICgpe1xyXG5cdFx0cmV0dXJuIHBhcnNlRmxvYXQodGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3RvcCcpKTtcclxuXHR9XHJcblx0c2V0IHkgKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3RvcCcsdiArICdweCcpO1xyXG5cdH1cclxuXHRnZXQgd2lkdGgoKXtcclxuXHRcdHJldHVybiBwYXJzZUZsb2F0KHRoaXMuc2VsZWN0aW9uLnN0eWxlKCd3aWR0aCcpKTtcclxuXHR9XHJcblx0c2V0IHdpZHRoKHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3dpZHRoJywgdiArICdweCcpO1xyXG5cdH1cclxuXHRnZXQgaGVpZ2h0KCl7XHJcblx0XHRyZXR1cm4gcGFyc2VGbG9hdCh0aGlzLnNlbGVjdGlvbi5zdHlsZSgnaGVpZ2h0JykpO1xyXG5cdH1cclxuXHRzZXQgaGVpZ2h0KHYpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ2hlaWdodCcsdiArICdweCcpO1xyXG5cdH1cclxuXHRcclxuXHRkaXNwb3NlKCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5yZW1vdmUoKTtcclxuXHRcdHRoaXMuc2VsZWN0aW9uID0gbnVsbDtcclxuXHR9XHJcblx0XHJcblx0c2hvdygpe1xyXG5cdFx0dGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknLCd2aXNpYmxlJyk7XHJcblx0fVxyXG5cclxuXHRoaWRlKCl7XHJcblx0XHR0aGlzLnNlbGVjdGlvbi5zdHlsZSgndmlzaWJpbGl0eScsJ2hpZGRlbicpO1xyXG5cdH1cclxuXHRcclxuXHRnZXQgaXNTaG93KCl7XHJcblx0XHRyZXR1cm4gdGhpcy5zZWxlY3Rpb24gJiYgdGhpcy5zZWxlY3Rpb24uc3R5bGUoJ3Zpc2liaWxpdHknKSA9PT0gJ3Zpc2libGUnO1xyXG5cdH1cclxufVxyXG5cclxuUGFuZWwucHJvdG90eXBlLmRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcclxuXHRcdC5vbignZHJhZ3N0YXJ0JyxmdW5jdGlvbihkKXtcclxuXHRcdFx0Y29uc29sZS5sb2coZCk7XHJcblx0XHR2YXIgc2VsID0gZDMuc2VsZWN0KCcjJyArIGQuaWQpO1xyXG5cdFx0XHJcblx0XHRkMy5zZWxlY3QoJyNjb250ZW50JylcclxuXHRcdC5hcHBlbmQoJ2RpdicpXHJcblx0XHQuYXR0cih7aWQ6J3BhbmVsLWR1bW15LScgKyBkLmlkLFxyXG5cdFx0XHQnY2xhc3MnOidwYW5lbCBwYW5lbC1kdW1teSd9KVxyXG5cdFx0LnN0eWxlKHtcclxuXHRcdFx0bGVmdDpzZWwuc3R5bGUoJ2xlZnQnKSxcclxuXHRcdFx0dG9wOnNlbC5zdHlsZSgndG9wJylcclxuXHRcdH0pO1xyXG5cdH0pXHJcblx0Lm9uKFwiZHJhZ1wiLCBmdW5jdGlvbiAoZCkge1xyXG5cdFx0dmFyIGR1bW15ID0gZDMuc2VsZWN0KCcjcGFuZWwtZHVtbXktJyArIGQuaWQpO1xyXG5cclxuXHRcdHZhciB4ID0gcGFyc2VGbG9hdChkdW1teS5zdHlsZSgnbGVmdCcpKSArIGQzLmV2ZW50LmR4O1xyXG5cdFx0dmFyIHkgPSBwYXJzZUZsb2F0KGR1bW15LnN0eWxlKCd0b3AnKSkgKyBkMy5ldmVudC5keTtcclxuXHRcdFxyXG5cdFx0ZHVtbXkuc3R5bGUoeydsZWZ0Jzp4ICsgJ3B4JywndG9wJzp5ICsgJ3B4J30pO1xyXG5cdH0pXHJcblx0Lm9uKCdkcmFnZW5kJyxmdW5jdGlvbihkKXtcclxuXHRcdHZhciBzZWwgPSBkMy5zZWxlY3QoJyMnICsgZC5pZCk7XHJcblx0XHR2YXIgZHVtbXkgPSBkMy5zZWxlY3QoJyNwYW5lbC1kdW1teS0nICsgZC5pZCk7XHJcblx0XHRzZWwuc3R5bGUoXHJcblx0XHRcdHsnbGVmdCc6ZHVtbXkuc3R5bGUoJ2xlZnQnKSwndG9wJzpkdW1teS5zdHlsZSgndG9wJyl9XHJcblx0XHQpO1xyXG5cdFx0ZHVtbXkucmVtb3ZlKCk7XHJcblx0fSk7XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
