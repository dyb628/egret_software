import*as Common from'../common/common.js';import*as QuickOpen from'../quick_open/quick_open.js';import*as Workspace from'../workspace/workspace.js';import{evaluateScriptSnippet}from'./ScriptSnippetFileSystem.js';export default class SnippetsQuickOpen extends QuickOpen.FilteredListWidget.Provider{constructor(){super();this._snippets=[];}
selectItem(itemIndex,promptValue){if(itemIndex===null){return;}
evaluateScriptSnippet(this._snippets[itemIndex]);}
notFoundText(query){return Common.UIString.UIString('No snippets found.');}
attach(){this._snippets=Snippets.project.uiSourceCodes();}
detach(){this._snippets=[];}
itemCount(){return this._snippets.length;}
itemKeyAt(itemIndex){return this._snippets[itemIndex].name();}
renderItem(itemIndex,query,titleElement,subtitleElement){titleElement.textContent=unescape(this._snippets[itemIndex].name());titleElement.classList.add('monospace');QuickOpen.FilteredListWidget.FilteredListWidget.highlightRanges(titleElement,query,true);}}