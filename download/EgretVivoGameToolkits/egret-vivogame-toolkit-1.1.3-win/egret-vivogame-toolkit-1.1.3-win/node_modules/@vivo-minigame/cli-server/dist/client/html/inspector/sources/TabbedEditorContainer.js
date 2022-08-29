import*as Common from'../common/common.js';import*as Persistence from'../persistence/persistence.js';import*as Snippets from'../snippets/snippets.js';import*as SourceFrame from'../source_frame/source_frame.js';import*as TextUtils from'../text_utils/text_utils.js';import*as UI from'../ui/ui.js';import*as Workspace from'../workspace/workspace.js';import{UISourceCodeFrame}from'./UISourceCodeFrame.js';export class TabbedEditorContainerDelegate{viewForFile(uiSourceCode){}
recycleUISourceCodeFrame(sourceFrame,uiSourceCode){}}
export class TabbedEditorContainer extends Common.ObjectWrapper.ObjectWrapper{constructor(delegate,setting,placeholderElement,focusedPlaceholderElement){super();this._delegate=delegate;this._tabbedPane=new UI.TabbedPane.TabbedPane();this._tabbedPane.setPlaceholderElement(placeholderElement,focusedPlaceholderElement);this._tabbedPane.setTabDelegate(new EditorContainerTabDelegate(this));this._tabbedPane.setCloseableTabs(true);this._tabbedPane.setAllowTabReorder(true,true);this._tabbedPane.addEventListener(UI.TabbedPane.Events.TabClosed,this._tabClosed,this);this._tabbedPane.addEventListener(UI.TabbedPane.Events.TabSelected,this._tabSelected,this);self.Persistence.persistence.addEventListener(Persistence.Persistence.Events.BindingCreated,this._onBindingCreated,this);self.Persistence.persistence.addEventListener(Persistence.Persistence.Events.BindingRemoved,this._onBindingRemoved,this);this._tabIds=new Map();this._files={};this._previouslyViewedFilesSetting=setting;this._history=History.fromObject(this._previouslyViewedFilesSetting.get());this._historyUriToUISourceCode=new Map();}
_onBindingCreated(event){const binding=(event.data);this._updateFileTitle(binding.fileSystem);const networkTabId=this._tabIds.get(binding.network);let fileSystemTabId=this._tabIds.get(binding.fileSystem);const wasSelectedInNetwork=this._currentFile===binding.network;const currentSelectionRange=this._history.selectionRange(binding.network.url());const currentScrollLineNumber=this._history.scrollLineNumber(binding.network.url());this._history.remove(binding.network.url());if(!networkTabId){return;}
if(!fileSystemTabId){const networkView=this._tabbedPane.tabView(networkTabId);const tabIndex=this._tabbedPane.tabIndex(networkTabId);if(networkView instanceof UISourceCodeFrame){this._delegate.recycleUISourceCodeFrame(networkView,binding.fileSystem);fileSystemTabId=this._appendFileTab(binding.fileSystem,false,tabIndex,networkView);}else{fileSystemTabId=this._appendFileTab(binding.fileSystem,false,tabIndex);const fileSystemTabView=(this._tabbedPane.tabView(fileSystemTabId));this._restoreEditorProperties(fileSystemTabView,currentSelectionRange,currentScrollLineNumber);}}
this._closeTabs([networkTabId],true);if(wasSelectedInNetwork){this._tabbedPane.selectTab(fileSystemTabId,false);}
this._updateHistory();}
_onBindingRemoved(event){const binding=(event.data);this._updateFileTitle(binding.fileSystem);}
get view(){return this._tabbedPane;}
get visibleView(){return this._tabbedPane.visibleView;}
fileViews(){return(this._tabbedPane.tabViews());}
leftToolbar(){return this._tabbedPane.leftToolbar();}
rightToolbar(){return this._tabbedPane.rightToolbar();}
show(parentElement){this._tabbedPane.show(parentElement);}
showFile(uiSourceCode){this._innerShowFile(uiSourceCode,true);}
closeFile(uiSourceCode){const tabId=this._tabIds.get(uiSourceCode);if(!tabId){return;}
this._closeTabs([tabId]);}
closeAllFiles(){this._closeTabs(this._tabbedPane.tabIds());}
historyUISourceCodes(){const result=[];const uris=this._history._urls();for(const uri of uris){const uiSourceCode=this._historyUriToUISourceCode.get(uri);if(uiSourceCode){result.push(uiSourceCode);}}
return result;}
_addViewListeners(){if(!this._currentView||!this._currentView.textEditor){return;}
this._currentView.textEditor.addEventListener(SourceFrame.SourcesTextEditor.Events.ScrollChanged,this._scrollChanged,this);this._currentView.textEditor.addEventListener(SourceFrame.SourcesTextEditor.Events.SelectionChanged,this._selectionChanged,this);}
_removeViewListeners(){if(!this._currentView||!this._currentView.textEditor){return;}
this._currentView.textEditor.removeEventListener(SourceFrame.SourcesTextEditor.Events.ScrollChanged,this._scrollChanged,this);this._currentView.textEditor.removeEventListener(SourceFrame.SourcesTextEditor.Events.SelectionChanged,this._selectionChanged,this);}
_scrollChanged(event){if(this._scrollTimer){clearTimeout(this._scrollTimer);}
const lineNumber=(event.data);this._scrollTimer=setTimeout(saveHistory.bind(this),100);this._history.updateScrollLineNumber(this._currentFile.url(),lineNumber);function saveHistory(){this._history.save(this._previouslyViewedFilesSetting);}}
_selectionChanged(event){const range=(event.data);this._history.updateSelectionRange(this._currentFile.url(),range);this._history.save(this._previouslyViewedFilesSetting);self.Extensions.extensionServer.sourceSelectionChanged(this._currentFile.url(),range);}
_innerShowFile(uiSourceCode,userGesture){const binding=self.Persistence.persistence.binding(uiSourceCode);uiSourceCode=binding?binding.fileSystem:uiSourceCode;if(this._currentFile===uiSourceCode){return;}
this._removeViewListeners();this._currentFile=uiSourceCode;const tabId=this._tabIds.get(uiSourceCode)||this._appendFileTab(uiSourceCode,userGesture);this._tabbedPane.selectTab(tabId,userGesture);if(userGesture){this._editorSelectedByUserAction();}
const previousView=this._currentView;this._currentView=this.visibleView;this._addViewListeners();const eventData={currentFile:this._currentFile,currentView:this._currentView,previousView:previousView,userGesture:userGesture};this.dispatchEventToListeners(Events.EditorSelected,eventData);}
_titleForFile(uiSourceCode){const maxDisplayNameLength=30;let title=uiSourceCode.displayName(true).trimMiddle(maxDisplayNameLength);if(uiSourceCode.isDirty()){title+='*';}
return title;}
_maybeCloseTab(id,nextTabId){const uiSourceCode=this._files[id];const shouldPrompt=uiSourceCode.isDirty()&&uiSourceCode.project().canSetFileContent();if(!shouldPrompt||confirm(Common.UIString.UIString('Are you sure you want to close unsaved file: %s?',uiSourceCode.name()))){uiSourceCode.resetWorkingCopy();if(nextTabId){this._tabbedPane.selectTab(nextTabId,true);}
this._tabbedPane.closeTab(id,true);return true;}
return false;}
_closeTabs(ids,forceCloseDirtyTabs){const dirtyTabs=[];const cleanTabs=[];for(let i=0;i<ids.length;++i){const id=ids[i];const uiSourceCode=this._files[id];if(!forceCloseDirtyTabs&&uiSourceCode.isDirty()){dirtyTabs.push(id);}else{cleanTabs.push(id);}}
if(dirtyTabs.length){this._tabbedPane.selectTab(dirtyTabs[0],true);}
this._tabbedPane.closeTabs(cleanTabs,true);for(let i=0;i<dirtyTabs.length;++i){const nextTabId=i+1<dirtyTabs.length?dirtyTabs[i+1]:null;if(!this._maybeCloseTab(dirtyTabs[i],nextTabId)){break;}}}
_onContextMenu(tabId,contextMenu){const uiSourceCode=this._files[tabId];if(uiSourceCode){contextMenu.appendApplicableItems(uiSourceCode);}}
addUISourceCode(uiSourceCode){const binding=self.Persistence.persistence.binding(uiSourceCode);uiSourceCode=binding?binding.fileSystem:uiSourceCode;if(this._currentFile===uiSourceCode){return;}
const uri=uiSourceCode.url();const index=this._history.index(uri);if(index===-1){return;}
if(this._historyUriToUISourceCode.has(uiSourceCode.url())){return;}
this._historyUriToUISourceCode.set(uiSourceCode.url(),uiSourceCode);if(!this._tabIds.has(uiSourceCode)){this._appendFileTab(uiSourceCode,false);}
if(!index){this._innerShowFile(uiSourceCode,false);return;}
if(!this._currentFile){return;}
const currentProjectIsSnippets=Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(this._currentFile);const addedProjectIsSnippets=Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(uiSourceCode);if(this._history.index(this._currentFile.url())&&currentProjectIsSnippets&&!addedProjectIsSnippets){this._innerShowFile(uiSourceCode,false);}}
removeUISourceCode(uiSourceCode){this.removeUISourceCodes([uiSourceCode]);}
removeUISourceCodes(uiSourceCodes){const tabIds=[];for(const uiSourceCode of uiSourceCodes){const tabId=this._tabIds.get(uiSourceCode);if(tabId){tabIds.push(tabId);}
if(this._historyUriToUISourceCode.get(uiSourceCode.url())===uiSourceCode){this._historyUriToUISourceCode.delete(uiSourceCode.url());}}
this._tabbedPane.closeTabs(tabIds);}
_editorClosedByUserAction(uiSourceCode){this._history.remove(uiSourceCode.url());this._updateHistory();}
_editorSelectedByUserAction(){this._updateHistory();}
_updateHistory(){const tabIds=this._tabbedPane.lastOpenedTabIds(maximalPreviouslyViewedFilesCount);function tabIdToURI(tabId){return this._files[tabId].url();}
this._history.update(tabIds.map(tabIdToURI.bind(this)));this._history.save(this._previouslyViewedFilesSetting);}
_tooltipForFile(uiSourceCode){uiSourceCode=self.Persistence.persistence.network(uiSourceCode)||uiSourceCode;return uiSourceCode.url();}
_appendFileTab(uiSourceCode,userGesture,index,replaceView){const view=replaceView||this._delegate.viewForFile(uiSourceCode);const title=this._titleForFile(uiSourceCode);const tooltip=this._tooltipForFile(uiSourceCode);const tabId=this._generateTabId();this._tabIds.set(uiSourceCode,tabId);this._files[tabId]=uiSourceCode;if(!replaceView){const savedSelectionRange=this._history.selectionRange(uiSourceCode.url());const savedScrollLineNumber=this._history.scrollLineNumber(uiSourceCode.url());this._restoreEditorProperties(view,savedSelectionRange,savedScrollLineNumber);}
this._tabbedPane.appendTab(tabId,title,view,tooltip,userGesture,undefined,index);this._updateFileTitle(uiSourceCode);this._addUISourceCodeListeners(uiSourceCode);if(uiSourceCode.loadError()){this._addLoadErrorIcon(tabId);}else if(!uiSourceCode.contentLoaded()){uiSourceCode.requestContent().then(content=>{if(uiSourceCode.loadError()){this._addLoadErrorIcon(tabId);}});}
return tabId;}
_addLoadErrorIcon(tabId){const icon=UI.Icon.Icon.create('smallicon-error');icon.title=ls`Unable to load this content.`;if(this._tabbedPane.tabView(tabId)){this._tabbedPane.setTabIcon(tabId,icon);}}
_restoreEditorProperties(editorView,selection,firstLineNumber){const sourceFrame=editorView instanceof SourceFrame.SourceFrame.SourceFrameImpl?(editorView):null;if(!sourceFrame){return;}
if(selection){sourceFrame.setSelection(selection);}
if(typeof firstLineNumber==='number'){sourceFrame.scrollToLine(firstLineNumber);}}
_tabClosed(event){const tabId=(event.data.tabId);const userGesture=(event.data.isUserGesture);const uiSourceCode=this._files[tabId];if(this._currentFile===uiSourceCode){this._removeViewListeners();delete this._currentView;delete this._currentFile;}
this._tabIds.remove(uiSourceCode);delete this._files[tabId];this._removeUISourceCodeListeners(uiSourceCode);this.dispatchEventToListeners(Events.EditorClosed,uiSourceCode);if(userGesture){this._editorClosedByUserAction(uiSourceCode);}}
_tabSelected(event){const tabId=(event.data.tabId);const userGesture=(event.data.isUserGesture);const uiSourceCode=this._files[tabId];this._innerShowFile(uiSourceCode,userGesture);}
_addUISourceCodeListeners(uiSourceCode){uiSourceCode.addEventListener(Workspace.UISourceCode.Events.TitleChanged,this._uiSourceCodeTitleChanged,this);uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged,this._uiSourceCodeWorkingCopyChanged,this);uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted,this._uiSourceCodeWorkingCopyCommitted,this);}
_removeUISourceCodeListeners(uiSourceCode){uiSourceCode.removeEventListener(Workspace.UISourceCode.Events.TitleChanged,this._uiSourceCodeTitleChanged,this);uiSourceCode.removeEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged,this._uiSourceCodeWorkingCopyChanged,this);uiSourceCode.removeEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted,this._uiSourceCodeWorkingCopyCommitted,this);}
_updateFileTitle(uiSourceCode){const tabId=this._tabIds.get(uiSourceCode);if(tabId){const title=this._titleForFile(uiSourceCode);const tooltip=this._tooltipForFile(uiSourceCode);this._tabbedPane.changeTabTitle(tabId,title,tooltip);let icon=null;if(uiSourceCode.loadError()){icon=UI.Icon.Icon.create('smallicon-error');icon.title=ls`Unable to load this content.`;}else if(self.Persistence.persistence.hasUnsavedCommittedChanges(uiSourceCode)){icon=UI.Icon.Icon.create('smallicon-warning');icon.title=Common.UIString.UIString('Changes to this file were not saved to file system.');}else{icon=Persistence.PersistenceUtils.PersistenceUtils.iconForUISourceCode(uiSourceCode);}
this._tabbedPane.setTabIcon(tabId,icon);}}
_uiSourceCodeTitleChanged(event){const uiSourceCode=(event.data);this._updateFileTitle(uiSourceCode);this._updateHistory();}
_uiSourceCodeWorkingCopyChanged(event){const uiSourceCode=(event.data);this._updateFileTitle(uiSourceCode);}
_uiSourceCodeWorkingCopyCommitted(event){const uiSourceCode=(event.data.uiSourceCode);this._updateFileTitle(uiSourceCode);}
_generateTabId(){return'tab_'+(tabId++);}
currentFile(){return this._currentFile||null;}}
export const Events={EditorSelected:Symbol('EditorSelected'),EditorClosed:Symbol('EditorClosed')};export let tabId=0;export const maximalPreviouslyViewedFilesCount=30;export class HistoryItem{constructor(url,selectionRange,scrollLineNumber){this.url=url;this._isSerializable=url.length<HistoryItem.serializableUrlLengthLimit;this.selectionRange=selectionRange;this.scrollLineNumber=scrollLineNumber;}
static fromObject(serializedHistoryItem){const selectionRange=serializedHistoryItem.selectionRange?TextUtils.TextRange.TextRange.fromObject(serializedHistoryItem.selectionRange):undefined;return new HistoryItem(serializedHistoryItem.url,selectionRange,serializedHistoryItem.scrollLineNumber);}
serializeToObject(){if(!this._isSerializable){return null;}
const serializedHistoryItem={};serializedHistoryItem.url=this.url;serializedHistoryItem.selectionRange=this.selectionRange;serializedHistoryItem.scrollLineNumber=this.scrollLineNumber;return serializedHistoryItem;}}
HistoryItem.serializableUrlLengthLimit=4096;export class History{constructor(items){this._items=items;this._rebuildItemIndex();}
static fromObject(serializedHistory){const items=[];for(let i=0;i<serializedHistory.length;++i){items.push(HistoryItem.fromObject(serializedHistory[i]));}
return new History(items);}
index(url){return this._itemsIndex.has(url)?(this._itemsIndex.get(url)):-1;}
_rebuildItemIndex(){this._itemsIndex=new Map();for(let i=0;i<this._items.length;++i){console.assert(!this._itemsIndex.has(this._items[i].url));this._itemsIndex.set(this._items[i].url,i);}}
selectionRange(url){const index=this.index(url);return index!==-1?this._items[index].selectionRange:undefined;}
updateSelectionRange(url,selectionRange){if(!selectionRange){return;}
const index=this.index(url);if(index===-1){return;}
this._items[index].selectionRange=selectionRange;}
scrollLineNumber(url){const index=this.index(url);return index!==-1?this._items[index].scrollLineNumber:undefined;}
updateScrollLineNumber(url,scrollLineNumber){const index=this.index(url);if(index===-1){return;}
this._items[index].scrollLineNumber=scrollLineNumber;}
update(urls){for(let i=urls.length-1;i>=0;--i){const index=this.index(urls[i]);let item;if(index!==-1){item=this._items[index];this._items.splice(index,1);}else{item=new HistoryItem(urls[i]);}
this._items.unshift(item);this._rebuildItemIndex();}}
remove(url){const index=this.index(url);if(index!==-1){this._items.splice(index,1);this._rebuildItemIndex();}}
save(setting){setting.set(this._serializeToObject());}
_serializeToObject(){const serializedHistory=[];for(let i=0;i<this._items.length;++i){const serializedItem=this._items[i].serializeToObject();if(serializedItem){serializedHistory.push(serializedItem);}
if(serializedHistory.length===maximalPreviouslyViewedFilesCount){break;}}
return serializedHistory;}
_urls(){const result=[];for(let i=0;i<this._items.length;++i){result.push(this._items[i].url);}
return result;}}
export class EditorContainerTabDelegate{constructor(editorContainer){this._editorContainer=editorContainer;}
closeTabs(tabbedPane,ids){this._editorContainer._closeTabs(ids);}
onContextMenu(tabId,contextMenu){this._editorContainer._onContextMenu(tabId,contextMenu);}}