import*as Common from'../common/common.js';import*as QuickOpen from'../quick_open/quick_open.js';import*as Workspace from'../workspace/workspace.js';import{SourcesView}from'./SourcesView.js';import{UISourceCodeFrame}from'./UISourceCodeFrame.js';export class GoToLineQuickOpen extends QuickOpen.FilteredListWidget.Provider{selectItem(itemIndex,promptValue){const uiSourceCode=this._currentUISourceCode();if(!uiSourceCode){return;}
const position=this._parsePosition(promptValue);if(!position){return;}
Common.Revealer.reveal(uiSourceCode.uiLocation(position.line-1,position.column-1));}
notFoundText(query){if(!this._currentUISourceCode()){return Common.UIString.UIString('No file selected.');}
const position=this._parsePosition(query);if(!position){const sourceFrame=this._currentSourceFrame();if(!sourceFrame){return ls`Type a number to go to that line.`;}
const currentLineNumber=sourceFrame.textEditor.currentLineNumber()+1;const linesCount=sourceFrame.textEditor.linesCount;return ls`Current line: ${currentLineNumber}. Type a line number between 1 and ${linesCount} to navigate to.`;}
if(position.column&&position.column>1){return ls`Go to line ${position.line} and column ${position.column}.`;}
return ls`Go to line ${position.line}.`;}
_parsePosition(query){const parts=query.match(/([0-9]+)(\:[0-9]*)?/);if(!parts||!parts[0]||parts[0].length!==query.length){return null;}
const line=parseInt(parts[1],10);let column;if(parts[2]){column=parseInt(parts[2].substring(1),10);}
return{line:Math.max(line|0,1),column:Math.max(column|0,1)};}
_currentUISourceCode(){const sourcesView=self.UI.context.flavor(SourcesView);if(!sourcesView){return null;}
return sourcesView.currentUISourceCode();}
_currentSourceFrame(){const sourcesView=self.UI.context.flavor(SourcesView);if(!sourcesView){return null;}
return sourcesView.currentSourceFrame();}}