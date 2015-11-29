'use strict';
import * as audio from './audio';
import * as ui from './ui';
import {UndoManager} from './undo';


const InputType = {
  keybord:0,
  midi:1
}

const InputCommand = 
{
  enter:1,
  esc:2,
  right:3,
  left:4,
  up:5,
  down:6,
  insertMeasure:7,
  undo:8,
  redo:9,
  pageUp:10,
  pageDown:11,
  home:12,
  end:13,
  number:14,
  note:15,
  scrollUp:16,
  scrollDown:17
}

//
const KeyBind = 
{
  13:[{
      keyCode:13,
      ctrlKey:false,
      shiftKey:false,
      altKey:false,
      metaKey:false,
      inputCommand:InputCommand.enter
    }],
  27:[{
    keyCode:27,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.esc
  }],
  32:[{
    keyCode:32,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.right
  }],
  39:[{
    keyCode:39,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.right
  }],
  37:[{
    keyCode:37,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.left
  }],
  38:[{
    keyCode:38,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.up
    }],
  40:[{
    keyCode:40,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.down
    }],
  106:[{
    keyCode:106,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.insertMeasure
    }],
  90:[{
    keyCode:90,
    ctrlKey:true,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.undo
    }],
  89:[{
    keyCode:89,
    ctrlKey:true,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.redo
    }],
  33:[{
    keyCode:33,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.pageUp
    },{
    keyCode:33,
    ctrlKey:false,
    shiftKey:true,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.scrollUp
    }],
  82:[{
    keyCode:82,
    ctrlKey:true,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.pageUp
    }],
  34:[{
    keyCode:34,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.pageDown
    },{
    keyCode:34,
    ctrlKey:false,
    shiftKey:true,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.scrollDown
    }],
  67:[{
    keyCode:67,
    ctrlKey:true,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.pageDown
    },{
    keyCode:67,
    note:'C',
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    },{
    keyCode:67,
    note:'C',
    ctrlKey:false,
    shiftKey:true,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    }],
  36:[{
    keyCode:36,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.home
    }],
  35:[{
    keyCode:35,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.end
    }],
  96:[{
    keyCode:96,
    number:0,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.number
    }],
  97:[{
    keyCode:97,
    number:1,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.number
    }],
  98:[{
    keyCode:98,
    number:2,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.number
    }],
  99:[{
    keyCode:99,
    number:3,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.number
    }],
  100:[{
    keyCode:100,
    number:4,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.number
    }],
  101:[{
    keyCode:101,
    number:5,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.number
    }],
  102:[{
    keyCode:102,
    number:6,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.number
    }],
  103:[{
    keyCode:103,
    number:7,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.number
    }],
  104:[{
    keyCode:104,
    number:8,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.number
    }],
  105:[{
    keyCode:105,
    number:9,
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.number
    }],
  65:[{
    keyCode:65,
    note:'A',
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    },{
    keyCode:65,
    note:'A',
    ctrlKey:false,
    shiftKey:true,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    }],    
  66:[{
    keyCode:66,
    note:'B',
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    },{
    keyCode:66,
    note:'B',
    ctrlKey:false,
    shiftKey:true,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    }],
  68:[{
    keyCode:68,
    note:'D',
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    },{
    keyCode:68,
    note:'D',
    ctrlKey:false,
    shiftKey:true,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    }],
  69:[{
    keyCode:69,
    note:'E',
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    },{
    keyCode:69,
    note:'E',
    ctrlKey:false,
    shiftKey:true,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    }],
  70:[{
    keyCode:70,
    note:'F',
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    },{
    keyCode:70,
    note:'F',
    ctrlKey:false,
    shiftKey:true,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    }],
  71:[{
    keyCode:71,
    note:'G',
    ctrlKey:false,
    shiftKey:false,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
    },{
    keyCode:71,
    note:'G',
    ctrlKey:false,
    shiftKey:true,
    altKey:false,
    metaKey:false,
    inputCommand:InputCommand.note
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
        sequencer.audioNode.tpb = d3.select(this).attr('value');
      })
      .call(function () {
        sequencer.audioNode.on('tpb_changed', (v) => {
          this.attr('value', v);
        });
      });


    // テンポ
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

		// テストデータ
    for (var i = 0; i < 127; i += 8) {
      for (var j = i; j < (i + 8); ++j) {
        sequencer.audioNode.tracks[0].addEvent(new audio.NoteEvent(48, j, 6));
      }
      sequencer.audioNode.tracks[0].addEvent(new audio.Measure());
    }

    // トラックエディタメイン

    trackEdit.each(function (d) {
      if (!this.editor) {
        this.editor = doEditor(d3.select(this),self_);
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
      if(key){
        key.some((d)=>{
          if(d.ctrlKey == e.ctrlKey
            && d.shiftKey == e.shiftKey
            && d.altKey == e.altKey
            && d.metaKey == e.metaKey
          ){
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
function* doEditor(trackEdit,seqEditor) {
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
    this.on('focus', function () {
      console.log(this.parentNode.rowIndex - 1);
      rowIndex = this.parentNode.rowIndex - 1;
      cellIndex = this.cellIndex;
    })
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
          .on('blur',function(d){
            d.setNoteNameToNote(this.innerText);
            this.innerText = d.name;
            // NoteNo表示も更新
            this.parentNode.cells[3].innerText = d.note;
          });// Note
          row.append('td').text(d.note).call(setInput)// Note #
          .on('blur',function(d){
            d.note = parseFloat(this.innerText);
            this.parentNode.cells[2].innerText = d.name;
          });
          row.append('td').text(d.step).call(setInput)// Step
          .on('blur',function(d){
            d.step = parseInt(this.innerText);
          })
          row.append('td').text(d.gate).call(setInput);// Gate
          row.append('td').text(d.vel).call(setInput);// Velocity
          row.append('td').text(d.com).call(setInput);// Command
          break;
        case audio.EventType.Measure:
          row.append('td').text('');// Measeure #
          row.append('td').text('');// Step #
          row.append('td')
          .attr({ 'colspan': 6, 'tabindex': 0 })
          .text(' --- (' + d.stepTotal + ') --- ')
          .on('focus',function(){
            rowIndex = this.parentNode.rowIndex - 1;
          });
          break;
        case audio.EventType.TrackEnd:
          row.append('td').text('');// Measeure #
          row.append('td').text('');// Step #
          row.append('td')
          .attr({ 'colspan': 6, 'tabindex': 0 })
          .text(' --- Track End --- ')
          .on('focus',function(){
            rowIndex = this.parentNode.rowIndex - 1;
          });
;
          break;
      }
    });
    
    if(rowIndex > (evflagment.length - 1)){
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
      exec(){
        this.row = editView.node().rows[rowIndex];
        this.cellIndex = cellIndex;
        this.rowIndex = rowIndex;
        var row = d3.select(editView.node().insertRow(rowIndex))
        .datum(new audio.NoteEvent());
        cellIndex = 2;
        row.append('td');// Measeure #
        row.append('td');// Step #
        row.append('td').call(setInput)
        .on('blur',function(d){
          if(this.innerText != '' && d.setNoteNameToNote(this.innerText)){
            this.innerText = d.name;
            // NoteNo表示も更新
            this.parentNode.cells[3].innerText = d.note;
          }
        });// Note
        row.append('td').call(setInput);// Note #
        row.append('td').call(setInput);// Step
        row.append('td').call(setInput);// Gate
        row.append('td').call(setInput);// Velocity
        row.append('td').call(setInput);// Command
        row.node().cells[cellIndex].focus();
        row.attr('data-new', true);
      },
      redo(){
        this.exec();       
      },
      undo(){
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
    if(cellIndex == 2) {
     let note = editView.node().rows[rowIndex].cells[cellIndex].innerText;
     ev.setNoteNameToNote(note,(beforeCells[2] ? beforeCells[2].innerText:'')); 
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
    if(down){
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

  drawEvent();
  while (true) {
    console.log('new line', rowIndex, track.events.length);
    if (track.events.length == 0 || rowIndex > (track.events.length - 1)) {
    }
    keyloop:
    while (true) {
      let input = yield cancelEvent;
      switch (input.inputCommand) {
        case InputCommand.enter://Enter
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
        case InputCommand.right:// right Cursor
          {
            cellIndex++;
            let curRow = editView.node().rows;
            if (cellIndex > (curRow[rowIndex].cells.length - 1)) {
              cellIndex = 2;
              if (rowIndex < (curRow.length - 1)) {
                if(d3.select(curRow[rowIndex]).attr('data-new')){
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
        case InputCommand.number:
          {
            let curRow = editView.node().rows[rowIndex];
            let curData = d3.select(curRow).datum();
            if(curData.type != audio.EventType.Note){
              //新規編集中の行でなければ、新規入力用行を挿入
              insertEvent(rowIndex);
              cellIndex = 3;
              let cell = editView.node().rows[rowIndex].cells[cellIndex];
              cell.innerText = input.number;
              let sel = window.getSelection();
              sel.collapse(cell,1);
              // sel.select();
              cancelEvent = true;
            } else {
              cancelEvent = false;
            }
          }
          break;
        case InputCommand.note:
          {
            let curRow = editView.node().rows[rowIndex];
            let curData = d3.select(curRow).datum();
            if(curData.type != audio.EventType.Note){
              //新規編集中の行でなければ、新規入力用行を挿入
              insertEvent(rowIndex);
              let cell = editView.node().rows[rowIndex].cells[cellIndex];
              cell.innerText = input.note;
              let sel = window.getSelection();
              sel.collapse(cell,1);
              // sel.select();
              cancelEvent = true;
            } else {
              cancelEvent = false;
            }
          }
          break;
        case InputCommand.left:// left Cursor
          {
            let curRow = editView.node().rows;
            --cellIndex;
            if (cellIndex < 2) {
              if (rowIndex == 0) {
  
              } else {
                  if(d3.select(curRow[rowIndex]).attr('data-new')){
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
        case InputCommand.up:// Up Cursor
          {
            let curRow = editView.node().rows;
            if(d3.select(curRow[rowIndex]).attr('data-new')){
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
        case InputCommand.down:// Down Cursor
          {
            let curRow = editView.node().rows;
            if(d3.select(curRow[rowIndex]).attr('data-new')){
              endNewInput(false);
            } 
            if (rowIndex == (NUM_ROW - 1)) {
              if ((currentEventIndex + NUM_ROW) <= (track.events.length - 1)) {
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
        case InputCommand.pageDown:// Page Down キー
          {
            if(currentEventIndex < (track.events.length - 1) ){
              currentEventIndex += NUM_ROW;
              if(currentEventIndex > (track.events.length - 1) ){
                currentEventIndex -= NUM_ROW;
              } else {
                drawEvent();
              }
              focusEvent();
            }
            cancelEvent = true;
          }
          break;
        case InputCommand.pageUp:// Page Up キー
          {
            if(currentEventIndex > 0){
              currentEventIndex -= NUM_ROW;
              if(currentEventIndex < 0){
                currentEventIndex = 0;
              }
              drawEvent();
              focusEvent();
            }
            cancelEvent = true;
          }
          break;
        // スクロールアップ
        case InputCommand.scrollUp: 
          {
            if(currentEventIndex > 0){
              --currentEventIndex;
              drawEvent();
              focusEvent();
            }
          }
          break;
        // スクロールダウン
        case InputCommand.scrollDown: 
          {
            if((currentEventIndex + NUM_ROW) <= (track.events.length - 1)){
              ++currentEventIndex;
              drawEvent();
              focusEvent();
            }
          }
          break;
        // 先頭行に移動
        case InputCommand.home:
          if(currentEventIndex > 0){
            rowIndex = 0;
            currentEventIndex = 0;
            drawEvent();
            focusEvent();
          }
          cancelEvent = true;
          break;
        // 最終行に移動
        case InputCommand.end:
          if(currentEventIndex != (track.events.length - 1))
          {
            rowIndex = 0;
            currentEventIndex = track.events.length - 1;
            drawEvent();
            focusEvent();
          }
          cancelEvent = true;
          break;
        // redo   
        case InputCommand.redo:
          seqEditor.undoManager.redo();
          cancelEvent = true;
          break;
        // undo  
        case InputCommand.undo:
          seqEditor.undoManager.undo();
          cancelEvent = true;
          break;
        // 小節線挿入
        case InputCommand.insertMeasure:// *
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

