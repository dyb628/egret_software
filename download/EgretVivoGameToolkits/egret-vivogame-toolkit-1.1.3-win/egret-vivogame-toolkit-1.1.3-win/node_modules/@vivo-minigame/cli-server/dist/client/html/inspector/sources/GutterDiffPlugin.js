import*as Common from'../common/common.js';import*as SourceFrame from'../source_frame/source_frame.js';import*as TextEditor from'../text_editor/text_editor.js';import*as UI from'../ui/ui.js';import*as Workspace from'../workspace/workspace.js';import*as WorkspaceDiff from'../workspace_diff/workspace_diff.js';import{Plugin}from'./Plugin.js';export class GutterDiffPlugin extends Plugin{constructor(textEditor,uiSourceCode){super();this._textEditor=textEditor;this._uiSourceCode=uiSourceCode;this._decorations=[];this._textEditor.installGutter(DiffGutterType,true);this._workspaceDiff=WorkspaceDiff.WorkspaceDiff.workspaceDiff();this._workspaceDiff.subscribeToDiffChange(this._uiSourceCode,this._update,this);this._update();}
static accepts(uiSourceCode){return uiSourceCode.project().type()===Workspace.Workspace.projectTypes.Network;}
_updateDecorations(removed,added){this._textEditor.operation(operation);function operation(){for(const decoration of removed){decoration.remove();}
for(const decoration of added){decoration.install();}}}
_update(){if(this._uiSourceCode){this._workspaceDiff.requestDiff(this._uiSourceCode).then(this._innerUpdate.bind(this));}else{this._innerUpdate(null);}}
_innerUpdate(lineDiff){if(!lineDiff){this._updateDecorations(this._decorations,[]);this._decorations=[];return;}
const diff=SourceFrame.SourceCodeDiff.SourceCodeDiff.computeDiff(lineDiff);const newDecorations=new Map();for(let i=0;i<diff.length;++i){const diffEntry=diff[i];for(let lineNumber=diffEntry.from;lineNumber<diffEntry.to;++lineNumber){newDecorations.set(lineNumber,{lineNumber:lineNumber,type:diffEntry.type});}}
const decorationDiff=this._calculateDecorationsDiff(newDecorations);const addedDecorations=decorationDiff.added.map(entry=>new GutterDecoration(this._textEditor,entry.lineNumber,entry.type));this._decorations=decorationDiff.equal.concat(addedDecorations);this._updateDecorations(decorationDiff.removed,addedDecorations);this._decorationsSetForTest(newDecorations);}
_decorationsByLine(){const decorations=new Map();for(const decoration of this._decorations){const lineNumber=decoration.lineNumber();if(lineNumber!==-1){decorations.set(lineNumber,decoration);}}
return decorations;}
_calculateDecorationsDiff(decorations){const oldDecorations=this._decorationsByLine();const leftKeys=[...oldDecorations.keys()];const rightKeys=[...decorations.keys()];leftKeys.sort((a,b)=>a-b);rightKeys.sort((a,b)=>a-b);const removed=[];const added=[];const equal=[];let leftIndex=0;let rightIndex=0;while(leftIndex<leftKeys.length&&rightIndex<rightKeys.length){const leftKey=leftKeys[leftIndex];const rightKey=rightKeys[rightIndex];const left=oldDecorations.get(leftKey);const right=decorations.get(rightKey);if(leftKey===rightKey&&left.type===right.type){equal.push(left);++leftIndex;++rightIndex;}else if(leftKey<=rightKey){removed.push(left);++leftIndex;}else{added.push(right);++rightIndex;}}
while(leftIndex<leftKeys.length){const leftKey=leftKeys[leftIndex++];removed.push(oldDecorations.get(leftKey));}
while(rightIndex<rightKeys.length){const rightKey=rightKeys[rightIndex++];added.push(decorations.get(rightKey));}
return{added:added,removed:removed,equal:equal};}
_decorationsSetForTest(decorations){}
async populateLineGutterContextMenu(contextMenu,lineNumber){GutterDiffPlugin._appendRevealDiffContextMenu(contextMenu,this._uiSourceCode);}
async populateTextAreaContextMenu(contextMenu,lineNumber,columnNumber){GutterDiffPlugin._appendRevealDiffContextMenu(contextMenu,this._uiSourceCode);}
static _appendRevealDiffContextMenu(contextMenu,uiSourceCode){if(!WorkspaceDiff.WorkspaceDiff.workspaceDiff().isUISourceCodeModified(uiSourceCode)){return;}
contextMenu.revealSection().appendItem(ls`Local Modifications...`,()=>{Common.Revealer.reveal(new WorkspaceDiff.WorkspaceDiff.DiffUILocation(uiSourceCode));});}
dispose(){for(const decoration of this._decorations){decoration.remove();}
WorkspaceDiff.WorkspaceDiff.workspaceDiff().unsubscribeFromDiffChange(this._uiSourceCode,this._update,this);}}
export class GutterDecoration{constructor(textEditor,lineNumber,type){this._textEditor=textEditor;this._position=this._textEditor.textEditorPositionHandle(lineNumber,0);this._className='';if(type===SourceFrame.SourceCodeDiff.EditType.Insert){this._className='diff-entry-insert';}else if(type===SourceFrame.SourceCodeDiff.EditType.Delete){this._className='diff-entry-delete';}else if(type===SourceFrame.SourceCodeDiff.EditType.Modify){this._className='diff-entry-modify';}
this.type=type;}
lineNumber(){const location=this._position.resolve();if(!location){return-1;}
return location.lineNumber;}
install(){const location=this._position.resolve();if(!location){return;}
const element=createElementWithClass('div','diff-marker');element.textContent='\xA0';this._textEditor.setGutterDecoration(location.lineNumber,DiffGutterType,element);this._textEditor.toggleLineClass(location.lineNumber,this._className,true);}
remove(){const location=this._position.resolve();if(!location){return;}
this._textEditor.setGutterDecoration(location.lineNumber,DiffGutterType,null);this._textEditor.toggleLineClass(location.lineNumber,this._className,false);}}
export const DiffGutterType='CodeMirror-gutter-diff';export class ContextMenuProvider{appendApplicableItems(event,contextMenu,target){let uiSourceCode=(target);const binding=self.Persistence.persistence.binding(uiSourceCode);if(binding){uiSourceCode=binding.network;}
GutterDiffPlugin._appendRevealDiffContextMenu(contextMenu,uiSourceCode);}}