'use strict';
import * as audio from './audio';
import * as ui from './ui';

export class SequenceEditor {
	constructor(sequencer) {
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
		div.append('input')
			.datum(sequencer.audioNode.tpb)
			.attr({ 'type': 'text', 'size': '3', 'id': 'time-base' })
			.attr('value', (v) => v)
			.on('change', function () {
				sequencer.audioNode.tpb = d3.select(this).attr('value');
			})
			.call(function () {
				sequencer.audioNode.on('tpb_changed', (v) => {
					this.attr('value', v);
				});
			});


		div.append('span').text('Tempo:');
		div.append('input')
			.datum(sequencer)
			.attr({ 'type': 'text', 'size': '3' })
			.attr('value', (d) => sequencer.audioNode.bpm)
			.on('change', () => {
				sequencer.audioNode.bpm = parseFloat(d3.select(this).attr('value'), 10);
			})
			.call(function () {
				sequencer.audioNode.on('bpm_changed', (v) => {
					this.attr('value', v);
				});
			});

		div.append('span').text('Beat:');
		div.append('input')
			.datum(sequencer)
			.attr({ 'type': 'text', 'size': '3', 'value': (d) => sequencer.audioNode.beat })
			.on('change', (d) => {
				sequencer.audioNode.beat = parseFloat(d3.select(this).attr('value'), 10);
			});

		div.append('span').text(' / ');
		div.append('input')
			.datum(sequencer)
			.attr({ 'type': 'text', 'size': '3', 'value': (d) => sequencer.audioNode.bar })
			.on('change', (d) => {
				sequencer.audioNode.bar = parseFloat(d3.select(this).attr('value'), 10);
			});


		// トラックエディタ
		let trackEdit = editor.selectAll('div.track')
			.data(sequencer.audioNode.tracks)
			.enter()
			.append('div')
			.classed('track', true)
			.attr({ 'id': (d, i) => 'track-' + (i + 1), 'tabindex': '0' });

		let trackHeader = trackEdit.append('div').classed('track-header', true);
		trackHeader.append('span').text((d, i) => 'TR:' + (i + 1));
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
		let eventBody = eventEdit.append('tbody').attr('id', (d, i) => 'track-' + (i + 1) + '-events');
		//this.drawEvents(eventBody);
		
		sequencer.audioNode.tracks[0].events.push(new audio.NoteEvent(48,47,6));
		for(var i = 48;i< 58;++i){
			sequencer.audioNode.tracks[0].events.push(new audio.NoteEvent(48,i,6));
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
			if(ret.value){
				d3.event.preventDefault();
				d3.event.cancelBubble = true;
				return false;
			}
		});

		sequencer.panel.on('show', () => {
			d3.select('#time-base').node().focus();
		});

		sequencer.panel.on('dispose', () => {
			delete sequencer.editorInstance;
		});

		sequencer.panel.show();
	}

	drawEvents(eventBody) {
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

}


var Notes = [
	'C ',
	'C#',
	'D ',
	'D#',
	'E ',
	'F ',
	'F#',
	'G ',
	'G#',
	'A ',
	'A#',
	'B ',
];


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
		this.on('focus',function(){
			console.log(this.parentNode.rowIndex - 1);
			rowIndex = this.parentNode.rowIndex - 1;
		})
	}
	// 既存イベントの表示
	{
		let evflagment = track.events.slice();
		let select = editView.selectAll('tr').data(track.events);
		let enter = select.enter();
		let rows = enter.append('tr').attr('data-index',(d,i)=>i);
		 rows.each(function (d, i) {
			 let row = d3.select(this);
			 rowIndex = i; 
				switch (d.type) {
					case audio.EventType.Note:
						row.append('td').text(measure);// Measeure #
						row.append('td').text(step++);// Step #
						let oct = d.note / 12 | 0;
						let noteName = Notes[d.note % 12] + oct;
						row.append('td').text(noteName).call(setInput);// Note
						row.append('td').text(d.note).call(setInput);// Note #
						row.append('td').text(d.step).call(setInput);// Step
						row.append('td').text(d.gate).call(setInput);// Gate
						row.append('td').text(d.vel).call(setInput);// Velocity
						row.append('td').text(d.com).call(setInput);// Command
						break;
					case audio.EventType.Measure:
						break;
				}
		});
	}

	do {
			console.log('new line',rowIndex,track.events.length);
		if (track.events.length == 0 || rowIndex > (track.events.length - 1)) {
			var row = editView.append('tr');
			cellIndex = 2;
			row.append('td').text(measure);// Measeure #
			row.append('td').text(step++);// Step #
			row.append('td').call(setInput);// Note
			row.append('td').call(setInput);// Note #
			row.append('td').call(setInput);// Step
			row.append('td').call(setInput);// Gate
			row.append('td').call(setInput);// Velocity
			row.append('td').call(setInput);// Command
			row.node().cells[cellIndex].focus();
		}
		keycode = yield false;
		var end = false;
		while (!end) {
			switch (keycode) {
				case 13://Enter
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
				case 39:// right Cursor
					cellIndex++;
					if (cellIndex > 7) {
						cellIndex = 2;
						if(rowIndex < (editView.node().rows.length - 1)){
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
				case 37:// left Cursor
					--cellIndex;
					if(cellIndex <= 2){
						if(rowIndex == 0){
							
						} else {
							--rowIndex;
							cellIndex = 7;
						}
					}
					editView.node().rows[rowIndex].cells[cellIndex].focus();
					keycode = yield true;
					break;
				case 106:// *
					keycode = yield false;
					break;
				default:
					keycode = yield false;
					break;
			}
		}
	} while (loop);
}



export function showSequenceEditor(d) {
	 d3.event.returnValue = false;
	 d3.event.preventDefault();
	 d3.event.cancelBubble = true;
	 if (d.panel && d.panel.isShow) return;
	 d.editorInstance = new SequenceEditor(d);
}

