import*as Common from'../common/common.js';import*as Components from'../components/components.js';import*as DataGrid from'../data_grid/data_grid.js';import*as SDK from'../sdk/sdk.js';import*as TimelineModel from'../timeline_model/timeline_model.js';import*as UI from'../ui/ui.js';import{PerformanceModel}from'./PerformanceModel.js';import{TimelineRegExp}from'./TimelineFilters.js';import{TimelineSelection}from'./TimelinePanel.js';import{TimelineUIUtils}from'./TimelineUIUtils.js';export class TimelineTreeView extends UI.Widget.VBox{constructor(){super();this._model=null;this._track=null;this._tree=null;this.element.classList.add('timeline-tree-view');}
static eventNameForSorting(event){if(event.name===TimelineModel.TimelineModel.RecordType.JSFrame){const data=event.args['data'];return data['functionName']+'@'+(data['scriptId']||data['url']||'');}
return event.name+':@'+TimelineModel.TimelineProfileTree.eventURL(event);}
setSearchableView(searchableView){this._searchableView=searchableView;}
setModel(model,track){this._model=model;this._track=track;this.refreshTree();}
getToolbarInputAccessiblePlaceHolder(){return'';}
model(){return this._model;}
init(){this._linkifier=new Components.Linkifier.Linkifier();this._taskFilter=new TimelineModel.TimelineModelFilter.ExclusiveNameFilter([TimelineModel.TimelineModel.RecordType.Task]);this._textFilter=new TimelineRegExp();this._currentThreadSetting=self.Common.settings.createSetting('timelineTreeCurrentThread',0);this._currentThreadSetting.addChangeListener(this.refreshTree,this);const columns=([]);this.populateColumns(columns);this._splitWidget=new UI.SplitWidget.SplitWidget(true,true,'timelineTreeViewDetailsSplitWidget');const mainView=new UI.Widget.VBox();const toolbar=new UI.Toolbar.Toolbar('',mainView.element);this.populateToolbar(toolbar);this._dataGrid=new DataGrid.SortableDataGrid.SortableDataGrid({displayName:ls`Performance`,columns});this._dataGrid.addEventListener(DataGrid.DataGrid.Events.SortingChanged,this._sortingChanged,this);this._dataGrid.element.addEventListener('mousemove',this._onMouseMove.bind(this),true);this._dataGrid.setResizeMethod(DataGrid.DataGrid.ResizeMethod.Last);this._dataGrid.setRowContextMenuCallback(this._onContextMenu.bind(this));this._dataGrid.asWidget().show(mainView.element);this._dataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode,this._updateDetailsForSelection,this);this._detailsView=new UI.Widget.VBox();this._detailsView.element.classList.add('timeline-details-view','timeline-details-view-body');this._splitWidget.setMainWidget(mainView);this._splitWidget.setSidebarWidget(this._detailsView);this._splitWidget.hideSidebar();this._splitWidget.show(this.element);this._splitWidget.addEventListener(UI.SplitWidget.Events.ShowModeChanged,this._onShowModeChanged,this);this._lastSelectedNode;}
lastSelectedNode(){return this._lastSelectedNode;}
updateContents(selection){this.setRange(selection.startTime(),selection.endTime());}
setRange(startTime,endTime){this._startTime=startTime;this._endTime=endTime;this.refreshTree();}
filters(){return[this._taskFilter,this._textFilter,...this._model.filters()];}
filtersWithoutTextFilter(){return[this._taskFilter,...this._model.filters()];}
textFilter(){return this._textFilter;}
_exposePercentages(){return false;}
populateToolbar(toolbar){this._textFilterUI=new UI.Toolbar.ToolbarInput(Common.UIString.UIString('Filter'),this.getToolbarInputAccessiblePlaceHolder());this._textFilterUI.addEventListener(UI.Toolbar.ToolbarInput.Event.TextChanged,textFilterChanged,this);toolbar.appendToolbarItem(this._textFilterUI);function textFilterChanged(){const searchQuery=this._textFilterUI.value();this._textFilter.setRegExp(searchQuery?createPlainTextSearchRegex(searchQuery,'i'):null);this.refreshTree();}}
_modelEvents(){return this._track?this._track.syncEvents():[];}
_onHover(node){}
_appendContextMenuItems(contextMenu,node){}
_linkifyLocation(event){const target=this._model.timelineModel().targetByEvent(event);if(!target){return null;}
const frame=TimelineModel.TimelineProfileTree.eventStackFrame(event);if(!frame){return null;}
return this._linkifier.maybeLinkifyConsoleCallFrame(target,frame);}
selectProfileNode(treeNode,suppressSelectedEvent){const pathToRoot=[];for(let node=treeNode;node;node=node.parent){pathToRoot.push(node);}
for(let i=pathToRoot.length-1;i>0;--i){const gridNode=this.dataGridNodeForTreeNode(pathToRoot[i]);if(gridNode&&gridNode.dataGrid){gridNode.expand();}}
const gridNode=this.dataGridNodeForTreeNode(treeNode);if(gridNode.dataGrid){gridNode.reveal();gridNode.select(suppressSelectedEvent);}}
refreshTree(){this._linkifier.reset();this._dataGrid.rootNode().removeChildren();if(!this._model){this._updateDetailsForSelection();return;}
this._root=this._buildTree();const children=this._root.children();let maxSelfTime=0;let maxTotalTime=0;const totalUsedTime=this._root.totalTime-this._root.selfTime;for(const child of children.values()){maxSelfTime=Math.max(maxSelfTime,child.selfTime);maxTotalTime=Math.max(maxTotalTime,child.totalTime);}
for(const child of children.values()){const gridNode=new TreeGridNode(child,totalUsedTime,maxSelfTime,maxTotalTime,this);this._dataGrid.insertChild(gridNode);}
this._sortingChanged();this._updateDetailsForSelection();if(this._searchableView){this._searchableView.refreshSearch();}
const rootNode=this._dataGrid.rootNode();if(rootNode.children.length>0){rootNode.children[0].select();}}
_buildTree(){throw new Error('Not Implemented');}
buildTopDownTree(doNotAggregate,groupIdCallback){return new TimelineModel.TimelineProfileTree.TopDownRootNode(this._modelEvents(),this.filters(),this._startTime,this._endTime,doNotAggregate,groupIdCallback);}
populateColumns(columns){columns.push({id:'self',title:Common.UIString.UIString('Self Time'),width:'120px',fixedWidth:true,sortable:true});columns.push({id:'total',title:Common.UIString.UIString('Total Time'),width:'120px',fixedWidth:true,sortable:true});columns.push({id:'activity',title:Common.UIString.UIString('Activity'),disclosure:true,sortable:true});}
_sortingChanged(){const columnId=this._dataGrid.sortColumnId();if(!columnId){return;}
let sortFunction;switch(columnId){case'startTime':sortFunction=compareStartTime;break;case'self':sortFunction=compareNumericField.bind(null,'selfTime');break;case'total':sortFunction=compareNumericField.bind(null,'totalTime');break;case'activity':sortFunction=compareName;break;default:console.assert(false,'Unknown sort field: '+columnId);return;}
this._dataGrid.sortNodes(sortFunction,!this._dataGrid.isSortOrderAscending());function compareNumericField(field,a,b){const nodeA=(a);const nodeB=(b);return nodeA._profileNode[field]-nodeB._profileNode[field];}
function compareStartTime(a,b){const nodeA=(a);const nodeB=(b);return nodeA._profileNode.event.startTime-nodeB._profileNode.event.startTime;}
function compareName(a,b){const nodeA=(a);const nodeB=(b);const nameA=TimelineTreeView.eventNameForSorting(nodeA._profileNode.event);const nameB=TimelineTreeView.eventNameForSorting(nodeB._profileNode.event);return nameA.localeCompare(nameB);}}
_onShowModeChanged(){if(this._splitWidget.showMode()===UI.SplitWidget.ShowMode.OnlyMain){return;}
this._lastSelectedNode=undefined;this._updateDetailsForSelection();}
_updateDetailsForSelection(){const selectedNode=this._dataGrid.selectedNode?(this._dataGrid.selectedNode)._profileNode:null;if(selectedNode===this._lastSelectedNode){return;}
this._lastSelectedNode=selectedNode;if(this._splitWidget.showMode()===UI.SplitWidget.ShowMode.OnlyMain){return;}
this._detailsView.detachChildWidgets();this._detailsView.element.removeChildren();if(selectedNode&&this._showDetailsForNode(selectedNode)){return;}
const banner=this._detailsView.element.createChild('div','full-widget-dimmed-banner');banner.createTextChild(Common.UIString.UIString('Select item for details.'));}
_showDetailsForNode(node){return false;}
_onMouseMove(event){const gridNode=event.target&&(event.target instanceof Node)?(this._dataGrid.dataGridNodeFromNode((event.target))):null;const profileNode=gridNode&&gridNode._profileNode;if(profileNode===this._lastHoveredProfileNode){return;}
this._lastHoveredProfileNode=profileNode;this._onHover(profileNode);}
_onContextMenu(contextMenu,gridNode){if(gridNode._linkElement&&!contextMenu.containsTarget(gridNode._linkElement)){contextMenu.appendApplicableItems(gridNode._linkElement);}
const profileNode=gridNode._profileNode;if(profileNode){this._appendContextMenuItems(contextMenu,profileNode);}}
dataGridNodeForTreeNode(treeNode){return treeNode[TreeGridNode._gridNodeSymbol]||null;}
searchCanceled(){this._searchResults=[];this._currentResult=0;}
performSearch(searchConfig,shouldJump,jumpBackwards){this._searchResults=[];this._currentResult=0;if(!this._root){return;}
const searchRegex=searchConfig.toSearchRegex();this._searchResults=this._root.searchTree(event=>TimelineUIUtils.testContentMatching(event,searchRegex));this._searchableView.updateSearchMatchesCount(this._searchResults.length);}
jumpToNextSearchResult(){if(!this._searchResults.length){return;}
this.selectProfileNode(this._searchResults[this._currentResult],false);this._currentResult=mod(this._currentResult+1,this._searchResults.length);}
jumpToPreviousSearchResult(){if(!this._searchResults.length){return;}
this.selectProfileNode(this._searchResults[this._currentResult],false);this._currentResult=mod(this._currentResult-1,this._searchResults.length);}
supportsCaseSensitiveSearch(){return true;}
supportsRegexSearch(){return true;}}
export class GridNode extends DataGrid.SortableDataGrid.SortableDataGridNode{constructor(profileNode,grandTotalTime,maxSelfTime,maxTotalTime,treeView){super(null,false);this._populated=false;this._profileNode=profileNode;this._treeView=treeView;this._grandTotalTime=grandTotalTime;this._maxSelfTime=maxSelfTime;this._maxTotalTime=maxTotalTime;this._linkElement=null;}
createCell(columnId){if(columnId==='activity'){return this._createNameCell(columnId);}
return this._createValueCell(columnId)||super.createCell(columnId);}
_createNameCell(columnId){const cell=this.createTD(columnId);const container=cell.createChild('div','name-container');const iconContainer=container.createChild('div','activity-icon-container');const icon=iconContainer.createChild('div','activity-icon');const name=container.createChild('div','activity-name');const event=this._profileNode.event;if(this._profileNode.isGroupNode()){const treeView=(this._treeView);const info=treeView._displayInfoForGroupNode(this._profileNode);name.textContent=info.name;icon.style.backgroundColor=info.color;if(info.icon){iconContainer.insertBefore(info.icon,icon);}}else if(event){const data=event.args['data'];const deoptReason=data&&data['deoptReason'];if(deoptReason){container.createChild('div','activity-warning').title=Common.UIString.UIString('Not optimized: %s',deoptReason);}
name.textContent=TimelineUIUtils.eventTitle(event);this._linkElement=this._treeView._linkifyLocation(event);if(this._linkElement){container.createChild('div','activity-link').appendChild(this._linkElement);}
const eventStyle=TimelineUIUtils.eventStyle(event);const eventCategory=eventStyle.category;UI.ARIAUtils.setAccessibleName(icon,eventCategory.title);icon.style.backgroundColor=eventCategory.color;}
return cell;}
_createValueCell(columnId){if(columnId!=='self'&&columnId!=='total'&&columnId!=='startTime'){return null;}
let showPercents=false;let value;let maxTime;switch(columnId){case'startTime':value=this._profileNode.event.startTime-this._treeView._model.timelineModel().minimumRecordTime();break;case'self':value=this._profileNode.selfTime;maxTime=this._maxSelfTime;showPercents=true;break;case'total':value=this._profileNode.totalTime;maxTime=this._maxTotalTime;showPercents=true;break;default:return null;}
const cell=this.createTD(columnId);cell.className='numeric-column';const textDiv=cell.createChild('div');textDiv.createChild('span').textContent=Common.UIString.UIString('%.1f\xa0ms',value);if(showPercents&&this._treeView._exposePercentages()){textDiv.createChild('span','percent-column').textContent=Common.UIString.UIString('%.1f\xa0%%',value/this._grandTotalTime*100);}
if(maxTime){textDiv.classList.add('background-percent-bar');cell.createChild('div','background-bar-container').createChild('div','background-bar').style.width=(value*100/maxTime).toFixed(1)+'%';}
return cell;}}
export class TreeGridNode extends GridNode{constructor(profileNode,grandTotalTime,maxSelfTime,maxTotalTime,treeView){super(profileNode,grandTotalTime,maxSelfTime,maxTotalTime,treeView);this.setHasChildren(this._profileNode.hasChildren());profileNode[TreeGridNode._gridNodeSymbol]=this;}
populate(){if(this._populated){return;}
this._populated=true;if(!this._profileNode.children){return;}
for(const node of this._profileNode.children().values()){const gridNode=new TreeGridNode(node,this._grandTotalTime,this._maxSelfTime,this._maxTotalTime,this._treeView);this.insertChildOrdered(gridNode);}}}
TreeGridNode._gridNodeSymbol=Symbol('treeGridNode');export class AggregatedTimelineTreeView extends TimelineTreeView{constructor(){super();this._groupBySetting=self.Common.settings.createSetting('timelineTreeGroupBy',AggregatedTimelineTreeView.GroupBy.None);this._groupBySetting.addChangeListener(this.refreshTree.bind(this));this.init();this._stackView=new TimelineStackView(this);this._stackView.addEventListener(TimelineStackView.Events.SelectionChanged,this._onStackViewSelectionChanged,this);this._productByURLCache=new Map();this._colorByURLCache=new Map();}
setModel(model,track){super.setModel(model,track);}
updateContents(selection){this._updateExtensionResolver();super.updateContents(selection);const rootNode=this._dataGrid.rootNode();if(rootNode.children.length){rootNode.children[0].select();}}
_updateExtensionResolver(){this._executionContextNamesByOrigin=new Map();for(const runtimeModel of self.SDK.targetManager.models(SDK.RuntimeModel.RuntimeModel)){for(const context of runtimeModel.executionContexts()){this._executionContextNamesByOrigin.set(context.origin,context.name);}}}
_beautifyDomainName(name){if(AggregatedTimelineTreeView._isExtensionInternalURL(name)){name=Common.UIString.UIString('[Chrome extensions overhead]');}else if(AggregatedTimelineTreeView._isV8NativeURL(name)){name=Common.UIString.UIString('[V8 Runtime]');}else if(name.startsWith('chrome-extension')){name=this._executionContextNamesByOrigin.get(name)||name;}
return name;}
_displayInfoForGroupNode(node){const categories=TimelineUIUtils.categories();const color=node.id?TimelineUIUtils.eventColor((node.event)):categories['other'].color;const unattributed=Common.UIString.UIString('[unattributed]');const id=typeof node.id==='symbol'?undefined:node.id;switch(this._groupBySetting.get()){case AggregatedTimelineTreeView.GroupBy.Category:{const category=id?categories[id]||categories['other']:unattributed;return{name:category.title,color:category.color};}
case AggregatedTimelineTreeView.GroupBy.Domain:case AggregatedTimelineTreeView.GroupBy.Subdomain:{const domainName=id?this._beautifyDomainName(id):undefined;return{name:domainName||unattributed,color:color};}
case AggregatedTimelineTreeView.GroupBy.EventName:{const name=node.event.name===TimelineModel.TimelineModel.RecordType.JSFrame?Common.UIString.UIString('JavaScript'):TimelineUIUtils.eventTitle(node.event);return{name:name,color:node.event.name===TimelineModel.TimelineModel.RecordType.JSFrame?TimelineUIUtils.eventStyle(node.event).category.color:color};}
case AggregatedTimelineTreeView.GroupBy.URL:break;case AggregatedTimelineTreeView.GroupBy.Frame:{const frame=id?this._model.timelineModel().pageFrameById(id):undefined;const frameName=frame?TimelineUIUtils.displayNameForFrame(frame,80):Common.UIString.UIString('Page');return{name:frameName,color:color};}
default:console.assert(false,'Unexpected grouping type');}
return{name:id||unattributed,color:color};}
populateToolbar(toolbar){super.populateToolbar(toolbar);const groupBy=AggregatedTimelineTreeView.GroupBy;const options=[{label:Common.UIString.UIString('No Grouping'),value:groupBy.None},{label:Common.UIString.UIString('Group by Activity'),value:groupBy.EventName},{label:Common.UIString.UIString('Group by Category'),value:groupBy.Category},{label:Common.UIString.UIString('Group by Domain'),value:groupBy.Domain},{label:Common.UIString.UIString('Group by Frame'),value:groupBy.Frame},{label:Common.UIString.UIString('Group by Subdomain'),value:groupBy.Subdomain},{label:Common.UIString.UIString('Group by URL'),value:groupBy.URL},];toolbar.appendToolbarItem(new UI.Toolbar.ToolbarSettingComboBox(options,this._groupBySetting,ls`Group by`));toolbar.appendSpacer();toolbar.appendToolbarItem(this._splitWidget.createShowHideSidebarButton(Common.UIString.UIString('heaviest stack')));}
_buildHeaviestStack(treeNode){console.assert(!!treeNode.parent,'Attempt to build stack for tree root');let result=[];for(let node=treeNode;node&&node.parent;node=node.parent){result.push(node);}
result=result.reverse();for(let node=treeNode;node&&node.children()&&node.children().size;){const children=Array.from(node.children().values());node=children.reduce((a,b)=>a.totalTime>b.totalTime?a:b);result.push(node);}
return result;}
_exposePercentages(){return true;}
_onStackViewSelectionChanged(){const treeNode=this._stackView.selectedTreeNode();if(treeNode){this.selectProfileNode(treeNode,true);}}
_showDetailsForNode(node){const stack=this._buildHeaviestStack(node);this._stackView.setStack(stack,node);this._stackView.show(this._detailsView.element);return true;}
_groupingFunction(groupBy){const GroupBy=AggregatedTimelineTreeView.GroupBy;switch(groupBy){case GroupBy.None:return null;case GroupBy.EventName:return event=>TimelineUIUtils.eventStyle(event).title;case GroupBy.Category:return event=>TimelineUIUtils.eventStyle(event).category.name;case GroupBy.Subdomain:return this._domainByEvent.bind(this,false);case GroupBy.Domain:return this._domainByEvent.bind(this,true);case GroupBy.URL:return event=>TimelineModel.TimelineProfileTree.eventURL(event)||'';case GroupBy.Frame:return event=>TimelineModel.TimelineModel.TimelineData.forEvent(event).frameId;default:console.assert(false,`Unexpected aggregation setting: ${groupBy}`);return null;}}
_domainByEvent(groupSubdomains,event){const url=TimelineModel.TimelineProfileTree.eventURL(event);if(!url){return'';}
if(AggregatedTimelineTreeView._isExtensionInternalURL(url)){return AggregatedTimelineTreeView._extensionInternalPrefix;}
if(AggregatedTimelineTreeView._isV8NativeURL(url)){return AggregatedTimelineTreeView._v8NativePrefix;}
const parsedURL=Common.ParsedURL.ParsedURL.fromString(url);if(!parsedURL){return'';}
if(parsedURL.scheme==='chrome-extension'){return parsedURL.scheme+'://'+parsedURL.host;}
if(!groupSubdomains){return parsedURL.host;}
if(/^[.0-9]+$/.test(parsedURL.host)){return parsedURL.host;}
const domainMatch=/([^.]*\.)?[^.]*$/.exec(parsedURL.host);return domainMatch&&domainMatch[0]||'';}
_appendContextMenuItems(contextMenu,node){if(this._groupBySetting.get()!==AggregatedTimelineTreeView.GroupBy.Frame){return;}
if(!node.isGroupNode()){return;}
const frame=this._model.timelineModel().pageFrameById((node.id));if(!frame||!frame.ownerNode){return;}
contextMenu.appendApplicableItems(frame.ownerNode);}
static _isExtensionInternalURL(url){return url.startsWith(AggregatedTimelineTreeView._extensionInternalPrefix);}
static _isV8NativeURL(url){return url.startsWith(AggregatedTimelineTreeView._v8NativePrefix);}}
AggregatedTimelineTreeView._extensionInternalPrefix='extensions::';AggregatedTimelineTreeView._v8NativePrefix='native ';AggregatedTimelineTreeView.GroupBy={None:'None',EventName:'EventName',Category:'Category',Domain:'Domain',Subdomain:'Subdomain',URL:'URL',Frame:'Frame'};export class CallTreeTimelineTreeView extends AggregatedTimelineTreeView{constructor(){super();this._dataGrid.markColumnAsSortedBy('total',DataGrid.DataGrid.Order.Descending);}
getToolbarInputAccessiblePlaceHolder(){return ls`Filter call tree`;}
_buildTree(){const grouping=this._groupBySetting.get();return this.buildTopDownTree(false,this._groupingFunction(grouping));}}
export class BottomUpTimelineTreeView extends AggregatedTimelineTreeView{constructor(){super();this._dataGrid.markColumnAsSortedBy('self',DataGrid.DataGrid.Order.Descending);}
getToolbarInputAccessiblePlaceHolder(){return ls`Filter bottom-up`;}
_buildTree(){return new TimelineModel.TimelineProfileTree.BottomUpRootNode(this._modelEvents(),this.textFilter(),this.filtersWithoutTextFilter(),this._startTime,this._endTime,this._groupingFunction(this._groupBySetting.get()));}}
export class TimelineStackView extends UI.Widget.VBox{constructor(treeView){super();const header=this.element.createChild('div','timeline-stack-view-header');header.textContent=Common.UIString.UIString('Heaviest stack');this._treeView=treeView;const columns=([{id:'total',title:Common.UIString.UIString('Total Time'),fixedWidth:true,width:'110px'},{id:'activity',title:Common.UIString.UIString('Activity')}]);this._dataGrid=new DataGrid.ViewportDataGrid.ViewportDataGrid({displayName:ls`Timeline Stack`,columns});this._dataGrid.setResizeMethod(DataGrid.DataGrid.ResizeMethod.Last);this._dataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode,this._onSelectionChanged,this);this._dataGrid.asWidget().show(this.element);}
setStack(stack,selectedNode){const rootNode=this._dataGrid.rootNode();rootNode.removeChildren();let nodeToReveal=null;const totalTime=Math.max.apply(Math,stack.map(node=>node.totalTime));for(const node of stack){const gridNode=new GridNode(node,totalTime,totalTime,totalTime,this._treeView);rootNode.appendChild(gridNode);if(node===selectedNode){nodeToReveal=gridNode;}}
nodeToReveal.revealAndSelect();}
selectedTreeNode(){const selectedNode=this._dataGrid.selectedNode;return selectedNode&&(selectedNode)._profileNode;}
_onSelectionChanged(){this.dispatchEventToListeners(TimelineStackView.Events.SelectionChanged);}}
TimelineStackView.Events={SelectionChanged:Symbol('SelectionChanged')};