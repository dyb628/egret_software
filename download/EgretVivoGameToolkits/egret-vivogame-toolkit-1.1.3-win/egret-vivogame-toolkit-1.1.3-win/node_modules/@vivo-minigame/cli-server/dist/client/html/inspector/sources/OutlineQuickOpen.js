import*as Common from'../common/common.js';import*as Formatter from'../formatter/formatter.js';import*as QuickOpen from'../quick_open/quick_open.js';import*as Workspace from'../workspace/workspace.js';import{SourcesView}from'./SourcesView.js';export class OutlineQuickOpen extends QuickOpen.FilteredListWidget.Provider{constructor(){super();this._items=[];this._active=false;}
attach(){this._items=[];this._active=false;const uiSourceCode=this._currentUISourceCode();if(uiSourceCode){this._active=Formatter.FormatterWorkerPool.formatterWorkerPool().outlineForMimetype(uiSourceCode.workingCopy(),uiSourceCode.contentType().canonicalMimeType(),this._didBuildOutlineChunk.bind(this));}}
_didBuildOutlineChunk(isLastChunk,items){this._items.push(...items);this.refresh();}
itemCount(){return this._items.length;}
itemKeyAt(itemIndex){const item=this._items[itemIndex];return item.title+(item.subtitle?item.subtitle:'');}
itemScoreAt(itemIndex,query){const item=this._items[itemIndex];const methodName=query.split('(')[0];if(methodName.toLowerCase()===item.title.toLowerCase()){return 1/(1+item.line);}
return-item.line-1;}
renderItem(itemIndex,query,titleElement,subtitleElement){const item=this._items[itemIndex];titleElement.textContent=item.title+(item.subtitle?item.subtitle:'');QuickOpen.FilteredListWidget.FilteredListWidget.highlightRanges(titleElement,query);subtitleElement.textContent=':'+(item.line+1);}
selectItem(itemIndex,promptValue){if(itemIndex===null){return;}
const uiSourceCode=this._currentUISourceCode();if(!uiSourceCode){return;}
const lineNumber=this._items[itemIndex].line;if(!isNaN(lineNumber)&&lineNumber>=0){Common.Revealer.reveal(uiSourceCode.uiLocation(lineNumber,this._items[itemIndex].column));}}
_currentUISourceCode(){const sourcesView=self.UI.context.flavor(SourcesView);if(!sourcesView){return null;}
return sourcesView.currentUISourceCode();}
notFoundText(){if(!this._currentUISourceCode()){return Common.UIString.UIString('No file selected.');}
if(!this._active){return Common.UIString.UIString('Open a JavaScript or CSS file to see symbols');}
return Common.UIString.UIString('No results found');}}