'use strict';
import * as audio from './audio';
import * as ui from './ui';
import {UndoManager} from './undo';

const InputType = {
  keybord: 0,
  midi: 1
}

const InputCommand =
  {
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
  }

//
const KeyBind =
  {
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
      },
      {
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

export class SequenceEditor {
  constructor(sequencer) {
    var self_ = this;
    this.undoManager = new UndoManager();
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
    div.append('input')
      .datum(sequencer.audioNode.tpb)
      .attr({ 'type': 'text', 'size': '3', 'id': 'time-base' })
      .attr('value', (v) => v)
      .on('change', function () {
        sequencer.audioNode.tpb = parseFloat(d3.event.target.value) || d3.select(this).attr('value');
      })
      .call(function () {
        sequencer.audioNode.on('tpb_changed', (v) => {
          this.attr('value', v);
        });
      });


    // テンポ
    div.append('span').text('Tempo:');
    div.append('input')
//      .datum(sequencer)
      .attr({ 'type': 'text', 'size': '3' })
      .attr('value', (d) => sequencer.audioNode.bpm)
      .on('change', function() {
        sequencer.audioNode.bpm = parseFloat(d3.event.target.value);
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
      .on('change', function(d){
        sequencer.audioNode.beat = parseFloat(d3.select(this).attr('value'));
      });

    div.append('span').text(' / ');
    div.append('input')
      .datum(sequencer)
      .attr({ 'type': 'text', 'size': '3', 'value': (d) => sequencer.audioNode.bar })
      .on('change', function(d) {
        sequencer.audioNode.bar = parseFloat(d3.select(this).attr('value'));
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
      let e = d3.event;
      console.log(e.keyCode);
      let key = KeyBind[e.keyCode];
      let ret = {};
      if (key) {
        key.some((d) => {
          if (d.ctrlKey == e.ctrlKey
            && d.shiftKey == e.shiftKey
            && d.altKey == e.altKey
            && d.metaKey == e.metaKey
            ) {
            ret = this.editor.next(d);
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
function* doEditor(trackEdit, seqEditor) {
  let keycode = 0;// 入力されたキーコードを保持する変数
  let track = trackEdit.datum();// 現在編集中のトラック
  let editView = d3.select('#' + trackEdit.attr('id') + '-events');//編集画面のセレクション
  let measure = 1;// 小節
  let step = 1;// ステップNo
  let rowIndex = 0;// 編集画面の現在行
  let currentEventIndex = 0;// イベント配列の編集開始行
  let cellIndex = 2;// 列インデックス
  let cancelEvent = false;// イベントをキャンセルするかどうか
  let lineBuffer = null;//行バッファ
  const NUM_ROW = 47;// １画面の行数
	
  function setInput() {
    this.attr('contentEditable', 'true');
    this.on('focus', function () {
      console.log(this.parentNode.rowIndex - 1);
      rowIndex = this.parentNode.rowIndex - 1;
      cellIndex = this.cellIndex;
    });
  }
  
  function setBlur(dest){
    switch(dest){
       case 'noteName':
          return function(){
            this.on('blur', function (d) {
              d.setNoteNameToNote(this.innerText);
              this.innerText = d.name;
              // NoteNo表示も更新
              this.parentNode.cells[3].innerText = d.note;
            });// Note
          }
       break;
       case 'note':
          return function(){
            this.on('blur', function (d) {
              let v = parseFloat(this.innerText);
              if(!isNaN(v)){
                d.note = parseFloat(this.innerText);
                this.parentNode.cells[2].innerText = d.name;
              }
            });
          }
       break;
    }
    return function(){
     this.on('blur',function(d)
      {
        let v = parseFloat(this.innerText);
        if(!isNaN(v)){
          d[dest] = v;
        }
      });
    }

  }
  
  
  // 既存イベントの表示
  function drawEvent() {
    let evflagment = track.events.slice(currentEventIndex, currentEventIndex + NUM_ROW);
    editView.selectAll('tr').remove();
    let select = editView.selectAll('tr').data(evflagment);
    let enter = select.enter();
    let rows = enter.append('tr').attr('data-index', (d, i) => i);
    rows.each(function (d, i) {
      let row = d3.select(this);
      //rowIndex = i;
      switch (d.type) {
        case audio.EventType.Note:
          row.append('td').text(d.measure);// Measeure #
          row.append('td').text(d.stepNo);// Step #
          row.append('td').text(d.name).call(setInput)// Note
          .call(setBlur('noteName'));
          row.append('td').text(d.note).call(setInput)// Note #
          .call(setBlur('note'));
          row.append('td').text(d.step).call(setInput)// Step
          .call(setBlur('step'));
          row.append('td').text(d.gate).call(setInput)// Gate
          .call(setBlur('gate'));
          row.append('td').text(d.vel).call(setInput)// Velocity
          .call(setBlur('vel'));
          row.append('td').text(d.com).call(setInput);// Command
          break;
        case audio.EventType.Measure:
          row.append('td').text('');// Measeure #
          row.append('td').text('');// Step #
          row.append('td')
            .attr({ 'colspan': 6, 'tabindex': 0 })
            .text(' --- (' + d.stepTotal + ') --- ')
            .on('focus', function () {
              rowIndex = this.parentNode.rowIndex - 1;
            });
          break;
        case audio.EventType.TrackEnd:
          row.append('td').text('');// Measeure #
          row.append('td').text('');// Step #
          row.append('td')
            .attr({ 'colspan': 6, 'tabindex': 0 })
            .text(' --- Track End --- ')
            .on('focus', function () {
              rowIndex = this.parentNode.rowIndex - 1;
            });
          ;
          break;
      }
    });

    if (rowIndex > (evflagment.length - 1)) {
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
        var row = d3.select(editView.node().insertRow(this.rowIndex))
          .datum(new audio.NoteEvent());
        cellIndex = 2;
        row.append('td');// Measeure #
        row.append('td');// Step #
        row.append('td').call(setInput)
        .call(setBlur('noteName'));
        row.append('td').call(setInput)// Note #
        .call(setBlur('note'));
        row.append('td').call(setInput)// Step
        .call(setBlur('step'));
        row.append('td').call(setInput)// Gate
        .call(setBlur('gate'));
        row.append('td').call(setInput)// Velocity
        .call(setBlur('vel'));
        row.append('td').call(setInput);// Command
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
  function endNewInput(down = true) {
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
      let note = editView.node().rows[rowIndex].cells[cellIndex].innerText
       || (beforeCells[2] ? beforeCells[2].innerText : 'C 0');
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
    if (isNaN(vel)) vel = 1.0
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
      if (rowIndex == (NUM_ROW - 1)) {
        ++currentEventIndex;
      } else {
        ++rowIndex;
      }
    }
    // 挿入後、再描画
    drawEvent();
    focusEvent();
  }
  
  function playOneshot(){
    let ev = track.events[rowIndex + currentEventIndex];
    if(ev.type === audio.EventType.Note){
      ev.playOneshot(track);
    }
  }
  
  function addRow(delta)
  {
    playOneshot();
    rowIndex += delta;
    let rowLength = editView.node().rows.length;
    if(rowIndex >= rowLength){
      let d = rowIndex - rowLength + 1;
      rowIndex = rowLength - 1;
      if((currentEventIndex + NUM_ROW -1) < (track.events.length - 1)){
        currentEventIndex += d;
        if((currentEventIndex + NUM_ROW -1) > (track.events.length - 1)){
          currentEventIndex = (track.events.length - NUM_ROW + 1);
        }
      }
      drawEvent();
    }
    if(rowIndex < 0){
      let d = rowIndex;
      rowIndex = 0;
      if(currentEventIndex != 0){
        currentEventIndex += d;
        if(currentEventIndex < 0){
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
    if (track.events.length == 0 || rowIndex > (track.events.length - 1)) {
    }
    keyloop:
    while (true) {
      let input = yield cancelEvent;
      switch (input.inputCommand.id) {
        case InputCommand.enter.id://Enter
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
        case InputCommand.right.id:// right Cursor
          {
            cellIndex++;
            let curRow = editView.node().rows;
            if (cellIndex > (curRow[rowIndex].cells.length - 1)) {
              cellIndex = 2;
              if (rowIndex < (curRow.length - 1)) {
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
        case InputCommand.left.id:// left Cursor
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
        case InputCommand.up.id:// Up Cursor
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
        case InputCommand.down.id:// Down Cursor
          {
            let curRow = editView.node().rows;
            if (d3.select(curRow[rowIndex]).attr('data-new')) {
              endNewInput(false);
            }
            addRow(1);
            cancelEvent = true;
          }
          break;
        case InputCommand.pageDown.id:// Page Down キー
          {
            if (currentEventIndex < (track.events.length - 1)) {
              currentEventIndex += NUM_ROW;
              if (currentEventIndex > (track.events.length - 1)) {
                currentEventIndex -= NUM_ROW;
              } else {
                drawEvent();
              }
              focusEvent();
            }
            cancelEvent = true;
          }
          break;
        case InputCommand.pageUp.id:// Page Up キー
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
            if ((currentEventIndex + NUM_ROW) <= (track.events.length - 1)) {
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
          if (currentEventIndex != (track.events.length - 1)) {
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
            if((rowIndex + currentEventIndex) == (track.events.length - 1)){
              break;
            }
            seqEditor.undoManager.exec(
              {
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
              }
              );
          }
          break;
        // ラインバッファの内容をペーストする
        case InputCommand.linePaste.id:
          {
            if (lineBuffer) {
              seqEditor.undoManager.exec(
                {
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
                }
                );
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
        case InputCommand.insertMeasure.id:// *
          seqEditor.undoManager.exec(
            {
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
            }
            );
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



export function showSequenceEditor(d) {
	 d3.event.returnValue = false;
	 d3.event.preventDefault();
	 d3.event.cancelBubble = true;
	 if (d.panel && d.panel.isShow) return;
	 d.editorInstance = new SequenceEditor(d);
}

