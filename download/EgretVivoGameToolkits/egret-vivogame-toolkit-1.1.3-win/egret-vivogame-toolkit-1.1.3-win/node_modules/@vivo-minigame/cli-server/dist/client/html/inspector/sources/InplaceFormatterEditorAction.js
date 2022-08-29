import*as Common from'../common/common.js';import*as Formatter from'../formatter/formatter.js';import*as UI from'../ui/ui.js';import*as Workspace from'../workspace/workspace.js';import{EditorAction,Events,SourcesView}from'./SourcesView.js';export class InplaceFormatterEditorAction{_editorSelected(event){const uiSourceCode=(event.data);this._updateButton(uiSourceCode);}
_editorClosed(event){const wasSelected=(event.data.wasSelected);if(wasSelected){this._updateButton(null);}}
_updateButton(uiSourceCode){const isFormattable=this._isFormattable(uiSourceCode);this._button.element.classList.toggle('hidden',!isFormattable);if(isFormattable){this._button.setTitle(Common.UIString.UIString(`Format ${uiSourceCode.name()}`));}}
button(sourcesView){if(this._button){return this._button;}
this._sourcesView=sourcesView;this._sourcesView.addEventListener(Events.EditorSelected,this._editorSelected.bind(this));this._sourcesView.addEventListener(Events.EditorClosed,this._editorClosed.bind(this));this._button=new UI.Toolbar.ToolbarButton(Common.UIString.UIString('Format'),'largeicon-pretty-print');this._button.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._formatSourceInPlace,this);this._updateButton(sourcesView.currentUISourceCode());return this._button;}
_isFormattable(uiSourceCode){if(!uiSourceCode){return false;}
if(uiSourceCode.project().canSetFileContent()){return true;}
if(self.Persistence.persistence.binding(uiSourceCode)){return true;}
return uiSourceCode.contentType().isStyleSheet();}
_formatSourceInPlace(event){const uiSourceCode=this._sourcesView.currentUISourceCode();if(!this._isFormattable(uiSourceCode)){return;}
if(uiSourceCode.isDirty()){this._contentLoaded(uiSourceCode,uiSourceCode.workingCopy());}else{uiSourceCode.requestContent().then(deferredContent=>{this._contentLoaded(uiSourceCode,deferredContent.content);});}}
_contentLoaded(uiSourceCode,content){const highlighterType=uiSourceCode.mimeType();Formatter.ScriptFormatter.FormatterInterface.format(uiSourceCode.contentType(),highlighterType,content,(formattedContent,formatterMapping)=>{this._formattingComplete(uiSourceCode,formattedContent,formatterMapping);});}
_formattingComplete(uiSourceCode,formattedContent,formatterMapping){if(uiSourceCode.workingCopy()===formattedContent){return;}
const sourceFrame=this._sourcesView.viewForFile(uiSourceCode);let start=[0,0];if(sourceFrame){const selection=sourceFrame.selection();start=formatterMapping.originalToFormatted(selection.startLine,selection.startColumn);}
uiSourceCode.setWorkingCopy(formattedContent);this._sourcesView.showSourceLocation(uiSourceCode,start[0],start[1]);}}