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
		
		for(var i = 0;i< 256;i += 8){
			for(var j = i;j < (i+8);++j){
				sequencer.audioNode.tracks[0].addEvent(new audio.NoteEvent(48,j,6));
			}
			sequencer.audioNode.tracks[0].addEvent(new audio.Measure());
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
}

// エディタ本体
function* doEditor(trackEdit) {
	let keycode = 0;// 入力されたキーコードを保持する変数
	let track = trackEdit.datum();// 現在編集中のトラック
	let editView = d3.select('#' + trackEdit.attr('id') + '-events');//編集画面のセレクション
	let measure = 1;// 小節
	let step = 1;// ステップNo
	let rowIndex = 0;// 編集画面の現在行
	let currentEventIndex = 0;// イベント配列の編集開始行
	let cellIndex = 2;// 列インデックス
	let cancelEvent = false;// イベントをキャンセルするかどうか
	const NUM_ROW = 47;// １画面の行数
	
	function setInput() {
		this.attr('contentEditable', 'true');
		this.on('focus',function(){
			console.log(this.parentNode.rowIndex - 1);
			rowIndex = this.parentNode.rowIndex - 1;
			cellIndex = this.cellIndex;
		})
	}
	// 既存イベントの表示
	function drawEvent()
	{
		let evflagment = track.events.slice(currentEventIndex,currentEventIndex + NUM_ROW);
		editView.selectAll('tr').remove();
		let select = editView.selectAll('tr').data(evflagment);
		let enter = select.enter();
		let rows = enter.append('tr').attr('data-index',(d,i)=>i);
		 rows.each(function (d, i) {
			 let row = d3.select(this);
			 rowIndex = i; 
				switch (d.type) {
					case audio.EventType.Note:
						row.append('td').text(d.measure);// Measeure #
						row.append('td').text(d.stepNo);// Step #
						row.append('td').text(d.name).call(setInput);// Note
						row.append('td').text(d.note).call(setInput);// Note #
						row.append('td').text(d.step).call(setInput);// Step
						row.append('td').text(d.gate).call(setInput);// Gate
						row.append('td').text(d.vel).call(setInput);// Velocity
						row.append('td').text(d.com).call(setInput);// Command
						break;
					case audio.EventType.Measure:
						row.append('td').text('');// Measeure #
						row.append('td').text('');// Step #
						row.append('td').attr({'colspan':6,'tabindex':0}).text(' --- Measure End --- ');
						break;
					case audio.EventType.TrackEnd:
						row.append('td').text('');// Measeure #
						row.append('td').text('');// Step #
						row.append('td').attr({'colspan':6,'tabindex':0}).text(' --- Track End --- ');
						break;
				}
		});

	}
	
	// イベントのフォーカス
	function focusEvent(sel)
	{
		let evrow = d3.select(editView.node().rows[rowIndex]);
		let ev = evrow.datum();
		switch(ev.type){
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
	function insertEvent(){
			var row = d3.select(editView.node().insertRow(rowIndex));
			cellIndex = 2;
			row.append('td')// Measeure #
			row.append('td')// Step #
			row.append('td').call(setInput);// Note
			row.append('td').call(setInput);// Note #
			row.append('td').call(setInput);// Step
			row.append('td').call(setInput);// Gate
			row.append('td').call(setInput);// Velocity
			row.append('td').call(setInput);// Command
			row.node().cells[cellIndex].focus();
			row.attr('data-new',true); 
	}

	drawEvent();

	while(true) 
	{
		console.log('new line',rowIndex,track.events.length);
		if (track.events.length == 0 || rowIndex > (track.events.length - 1)) {
		}
		keyloop:
		while (true) {
			keycode = yield cancelEvent;
			switch (keycode) {
				case 13://Enter
					console.log('CR/LF');
					// 現在の行が新規か編集中か
					let flag = d3.select(editView.node().rows[rowIndex]).attr('data-new');
					if(flag){
						d3.select(editView.node().rows[rowIndex]).attr('data-new',null);
						// 1つ前のノートデータを検索する
						let beforeCells = [];
						let sr = rowIndex -1;
						while(sr >= 0){
							var target = d3.select(editView.node().rows[sr]);
							if(target.datum().type === audio.EventType.Note){
								beforeCells = target.node().cells;
								break;
							} 
							--sr;
						}
						// 現在の編集行
						let curRow = editView.node().rows[rowIndex].cells;
						// エベントを生成する
						// データが何も入力されていないときは、1つ前のノートデータを複製する。
						// 1つ前のノートデータがないときや不正データの場合は、デフォルト値を代入する。
						let noteNo = parseFloat(curRow[3].innerText || beforeCells[3]?beforeCells[3].innerText:'60');
						if(isNaN(noteNo)) noteNo = 60;
						let step = parseFloat(curRow[4].innerText || beforeCells[4]?beforeCells[4].innerText:'96');
						if(isNaN(step)) noteNo = 96;
						let gate = parseFloat(curRow[5].innerText || beforeCells[5]?beforeCells[5].innerText:'24');
						if(isNaN(gate)) gate = 24;
						let vel = parseFloat(curRow[6].innerText || beforeCells[6]?beforeCells[6].innerText:'1.0');
						if(isNaN(vel)) gate = 1.0
						let com = /*curRow[7].innerText || beforeCells[7]?beforeCells[7].innerText:*/new audio.Command();
						var ev = new audio.NoteEvent(step,noteNo,gate,vel,com);
						// トラックにデータをセット
						track.insertEvent(ev,rowIndex + currentEventIndex);
						if(rowIndex == NUM_ROW){
							++currentEventIndex;
						} else {
							++rowIndex;
						}
						// 挿入後、再描画
						drawEvent();
						editView.node().rows[rowIndex].cells[cellIndex].focus();
					} else {
						//新規編集中の行でなければ、新規入力用行を挿入
						insertEvent();
					}
//					loop = ;
					// デフォルト値の代入
					var ev = d3.select(editView.node().rows[rowIndex].cells[2]);
					// if(editView.node().rows[rowIndex].cells[2].textNode.match(/(C )|(C#)|(D )|(D#)|(E )|(F )|(F#)|(G )|(G#)|(A )|(A#)|(B )[0-9]/))
					// {
					// 	
					// 	
					// } 
					//rowIndex++;
					cancelEvent = true;
					break;
				case 39:// right Cursor
					cellIndex++;
					if (cellIndex > (editView.node().rows[rowIndex].cells.length - 1))
					{
						cellIndex = 2;
						if(rowIndex < (editView.node().rows.length - 1)){
							++rowIndex;
						} else {
							++rowIndex;
							cancelEvent = true;
							break;
						}
					}
					focusEvent();
					cancelEvent = true;
					break;
				case 37:// left Cursor
					--cellIndex;
					if(cellIndex < 2){
						if(rowIndex == 0){
							
						} else {
							--rowIndex;
							cellIndex = editView.node().rows[rowIndex].cells.length - 1;
						}
					}
					focusEvent();
					cancelEvent = true;
					break;
			  case 38:// Up Cursor
					if(rowIndex > 0){
						--rowIndex;
						focusEvent();
					} else {
						if(currentEventIndex > 0){
							--currentEventIndex;
							drawEvent();
							rowIndex = 0;
							focusEvent();
						} 
					}
					cancelEvent = true;
					break; 
				case 40:// Down Cursor
					if(rowIndex == (NUM_ROW - 1))
					{
						if((currentEventIndex + NUM_ROW) < (track.events.length - 1)){
							++currentEventIndex;
							drawEvent();
							focusEvent();
						}
					} else {
						++rowIndex;
						focusEvent();
					}
				
					cancelEvent = true;
					break;
				case 106:// *
					cancelEvent = true;
					break;
				default:
					cancelEvent = false;
					console.log('default');
					break;
			}
		}
	}
}



export function showSequenceEditor(d) {
	 d3.event.returnValue = false;
	 d3.event.preventDefault();
	 d3.event.cancelBubble = true;
	 if (d.panel && d.panel.isShow) return;
	 d.editorInstance = new SequenceEditor(d);
}

