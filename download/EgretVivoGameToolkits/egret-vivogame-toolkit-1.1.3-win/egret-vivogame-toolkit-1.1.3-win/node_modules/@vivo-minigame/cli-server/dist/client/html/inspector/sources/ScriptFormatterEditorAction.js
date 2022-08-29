import*as Common from'../common/common.js';import*as FormatterModule from'../formatter/formatter.js';import*as UI from'../ui/ui.js';import*as Workspace from'../workspace/workspace.js';import{EditorAction,Events,SourcesView}from'./SourcesView.js';export class ScriptFormatterEditorAction{constructor(){this._pathsToFormatOnLoad=new Set();}
_editorSelected(event){const uiSourceCode=(event.data);this._updateButton(uiSourceCode);if(this._isFormatableScript(uiSourceCode)&&this._pathsToFormatOnLoad.has(uiSourceCode.url())&&!FormatterModule.sourceFormatter.hasFormatted(uiSourceCode)){this._showFormatted(uiSourceCode);}}
async _editorClosed(event){const uiSourceCode=(event.data.uiSourceCode);const wasSelected=(event.data.wasSelected);if(wasSelected){this._updateButton(null);}
const original=await FormatterModule.sourceFormatter.discardFormattedUISourceCode(uiSourceCode);if(original){this._pathsToFormatOnLoad.delete(original.url());}}
_updateButton(uiSourceCode){const isFormattable=this._isFormatableScript(uiSourceCode);this._button.element.classList.toggle('hidden',!isFormattable);if(isFormattable){this._button.setTitle(Common.UIString.UIString(`Pretty print ${uiSourceCode.name()}`));}}
button(sourcesView){if(this._button){return this._button;}
this._sourcesView=sourcesView;this._sourcesView.addEventListener(Events.EditorSelected,event=>{this._editorSelected(event);});this._sourcesView.addEventListener(Events.EditorClosed,event=>{this._editorClosed(event);});this._button=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('Pretty print'),'largeicon-pretty-print');this._button.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._toggleFormatScriptSource,this);this._updateButton(sourcesView.currentUISourceCode());return this._button;}
_isFormatableScript(uiSourceCode){if(!uiSourceCode){return false;}
if(uiSourceCode.project().canSetFileContent()){return false;}
if(uiSourceCode.project().type()===Workspace.Workspace.projectTypes.Formatter){return false;}
if(self.Persistence.persistence.binding(uiSourceCode)){return false;}
return uiSourceCode.contentType().hasScripts();}
_toggleFormatScriptSource(event){const uiSourceCode=this._sourcesView.currentUISourceCode();if(!this._isFormatableScript(uiSourceCode)){return;}
this._pathsToFormatOnLoad.add(uiSourceCode.url());this._showFormatted(uiSourceCode);}
async _showFormatted(uiSourceCode){const formatData=await FormatterModule.sourceFormatter.format(uiSourceCode);if(uiSourceCode!==this._sourcesView.currentUISourceCode()){return;}
const sourceFrame=this._sourcesView.viewForFile(uiSourceCode);let start=[0,0];if(sourceFrame){const selection=sourceFrame.selection();start=formatData.mapping.originalToFormatted(selection.startLine,selection.startColumn);}
this._sourcesView.showSourceLocation(formatData.formattedSourceCode,start[0],start[1]);}}