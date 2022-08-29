import*as Common from'../common/common.js';import*as SourceFrame from'../source_frame/source_frame.js';import*as TextUtils from'../text_utils/text_utils.js';import*as Workspace from'../workspace/workspace.js';import{HistoryEntry,SimpleHistoryManager}from'./SimpleHistoryManager.js';import{SourcesView}from'./SourcesView.js';import{UISourceCodeFrame}from'./UISourceCodeFrame.js';export class EditingLocationHistoryManager{constructor(sourcesView,currentSourceFrameCallback){this._sourcesView=sourcesView;this._historyManager=new SimpleHistoryManager(HistoryDepth);this._currentSourceFrameCallback=currentSourceFrameCallback;}
trackSourceFrameCursorJumps(sourceFrame){sourceFrame.textEditor.addEventListener(SourceFrame.SourcesTextEditor.Events.JumpHappened,this._onJumpHappened.bind(this));}
_onJumpHappened(event){if(event.data.from){this._updateActiveState(event.data.from);}
if(event.data.to){this._pushActiveState(event.data.to);}}
rollback(){this._historyManager.rollback();}
rollover(){this._historyManager.rollover();}
updateCurrentState(){const sourceFrame=this._currentSourceFrameCallback();if(!sourceFrame){return;}
this._updateActiveState(sourceFrame.textEditor.selection());}
pushNewState(){const sourceFrame=this._currentSourceFrameCallback();if(!sourceFrame){return;}
this._pushActiveState(sourceFrame.textEditor.selection());}
_updateActiveState(selection){const active=(this._historyManager.active());if(!active){return;}
const sourceFrame=this._currentSourceFrameCallback();if(!sourceFrame){return;}
const entry=new EditingLocationHistoryEntry(this._sourcesView,this,sourceFrame,selection);active.merge(entry);}
_pushActiveState(selection){const sourceFrame=this._currentSourceFrameCallback();if(!sourceFrame){return;}
const entry=new EditingLocationHistoryEntry(this._sourcesView,this,sourceFrame,selection);this._historyManager.push(entry);}
removeHistoryForSourceCode(uiSourceCode){function filterOut(entry){return entry._projectId===uiSourceCode.project().id()&&entry._url===uiSourceCode.url();}
this._historyManager.filterOut(filterOut);}}
export const HistoryDepth=20;export class EditingLocationHistoryEntry{constructor(sourcesView,editingLocationManager,sourceFrame,selection){this._sourcesView=sourcesView;this._editingLocationManager=editingLocationManager;const uiSourceCode=sourceFrame.uiSourceCode();this._projectId=uiSourceCode.project().id();this._url=uiSourceCode.url();const position=this._positionFromSelection(selection);this._positionHandle=sourceFrame.textEditor.textEditorPositionHandle(position.lineNumber,position.columnNumber);}
merge(entry){if(this._projectId!==entry._projectId||this._url!==entry._url){return;}
this._positionHandle=entry._positionHandle;}
_positionFromSelection(selection){return{lineNumber:selection.endLine,columnNumber:selection.endColumn};}
valid(){const position=this._positionHandle.resolve();const uiSourceCode=self.Workspace.workspace.uiSourceCode(this._projectId,this._url);return!!(position&&uiSourceCode);}
reveal(){const position=this._positionHandle.resolve();const uiSourceCode=self.Workspace.workspace.uiSourceCode(this._projectId,this._url);if(!position||!uiSourceCode){return;}
this._editingLocationManager.updateCurrentState();this._sourcesView.showSourceLocation(uiSourceCode,position.lineNumber,position.columnNumber);}}