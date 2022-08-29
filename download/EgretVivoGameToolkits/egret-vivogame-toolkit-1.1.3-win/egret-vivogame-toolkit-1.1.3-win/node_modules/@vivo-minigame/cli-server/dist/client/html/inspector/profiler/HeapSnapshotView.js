import*as Bindings from'../bindings/bindings.js';import*as Common from'../common/common.js';import*as Components from'../components/components.js';import*as DataGrid from'../data_grid/data_grid.js';import*as HeapSnapshotModel from'../heap_snapshot_model/heap_snapshot_model.js';import*as Host from'../host/host.js';import*as ObjectUI from'../object_ui/object_ui.js';import*as PerfUI from'../perf_ui/perf_ui.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{AllocationDataGrid,HeapSnapshotConstructorsDataGrid,HeapSnapshotContainmentDataGrid,HeapSnapshotDiffDataGrid,HeapSnapshotRetainmentDataGrid,HeapSnapshotSortableDataGrid,}from'./HeapSnapshotDataGrids.js';import{HeapSnapshotGenericObjectNode,HeapSnapshotGridNode}from'./HeapSnapshotGridNodes.js';import{HeapSnapshotProxy,HeapSnapshotWorkerProxy}from'./HeapSnapshotProxy.js';import{HeapTimelineOverview,IdsRangeChanged,Samples}from'./HeapTimelineOverview.js';import{DataDisplayDelegate,Events as ProfileHeaderEvents,ProfileEvents as ProfileTypeEvents,ProfileHeader,ProfileType}from'./ProfileHeader.js';import{ProfileSidebarTreeElement}from'./ProfileSidebarTreeElement.js';import{instance}from'./ProfileTypeRegistry.js';export class HeapSnapshotView extends UI.View.SimpleView{constructor(dataDisplayDelegate,profile){super(Common.UIString.UIString('Heap Snapshot'));this.element.classList.add('heap-snapshot-view');this._profile=profile;this._linkifier=new Components.Linkifier.Linkifier();const profileType=profile.profileType();profileType.addEventListener(HeapSnapshotProfileType.SnapshotReceived,this._onReceiveSnapshot,this);profileType.addEventListener(ProfileTypeEvents.RemoveProfileHeader,this._onProfileHeaderRemoved,this);const isHeapTimeline=profileType.id===TrackingHeapSnapshotProfileType.TypeId;if(isHeapTimeline){this._createOverview();}
this._parentDataDisplayDelegate=dataDisplayDelegate;this._searchableView=new UI.SearchableView.SearchableView(this);this._searchableView.show(this.element);this._splitWidget=new UI.SplitWidget.SplitWidget(false,true,'heapSnapshotSplitViewState',200,200);this._splitWidget.show(this._searchableView.element);const heapProfilerModel=profile.heapProfilerModel();this._containmentDataGrid=new HeapSnapshotContainmentDataGrid(heapProfilerModel,this,ls`Containment`);this._containmentDataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode,this._selectionChanged,this);this._containmentWidget=this._containmentDataGrid.asWidget();this._containmentWidget.setMinimumSize(50,25);this._statisticsView=new HeapSnapshotStatisticsView();this._constructorsDataGrid=new HeapSnapshotConstructorsDataGrid(heapProfilerModel,this);this._constructorsDataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode,this._selectionChanged,this);this._constructorsWidget=this._constructorsDataGrid.asWidget();this._constructorsWidget.setMinimumSize(50,25);this._diffDataGrid=new HeapSnapshotDiffDataGrid(heapProfilerModel,this);this._diffDataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode,this._selectionChanged,this);this._diffWidget=this._diffDataGrid.asWidget();this._diffWidget.setMinimumSize(50,25);if(isHeapTimeline){this._allocationDataGrid=new AllocationDataGrid(heapProfilerModel,this);this._allocationDataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode,this._onSelectAllocationNode,this);this._allocationWidget=this._allocationDataGrid.asWidget();this._allocationWidget.setMinimumSize(50,25);this._allocationStackView=new HeapAllocationStackView(heapProfilerModel);this._allocationStackView.setMinimumSize(50,25);this._tabbedPane=new UI.TabbedPane.TabbedPane();}
this._retainmentDataGrid=new HeapSnapshotRetainmentDataGrid(heapProfilerModel,this);this._retainmentWidget=this._retainmentDataGrid.asWidget();this._retainmentWidget.setMinimumSize(50,21);this._retainmentWidget.element.classList.add('retaining-paths-view');let splitWidgetResizer;if(this._allocationStackView){this._tabbedPane=new UI.TabbedPane.TabbedPane();this._tabbedPane.appendTab('retainers',Common.UIString.UIString('Retainers'),this._retainmentWidget);this._tabbedPane.appendTab('allocation-stack',Common.UIString.UIString('Allocation stack'),this._allocationStackView);splitWidgetResizer=this._tabbedPane.headerElement();this._objectDetailsView=this._tabbedPane;}else{const retainmentViewHeader=createElementWithClass('div','heap-snapshot-view-resizer');const retainingPathsTitleDiv=retainmentViewHeader.createChild('div','title');const retainingPathsTitle=retainingPathsTitleDiv.createChild('span');retainingPathsTitle.textContent=Common.UIString.UIString('Retainers');splitWidgetResizer=retainmentViewHeader;this._objectDetailsView=new UI.Widget.VBox();this._objectDetailsView.element.appendChild(retainmentViewHeader);this._retainmentWidget.show(this._objectDetailsView.element);}
this._splitWidget.hideDefaultResizer();this._splitWidget.installResizer(splitWidgetResizer);this._retainmentDataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode,this._inspectedObjectChanged,this);this._retainmentDataGrid.reset();this._perspectives=[];this._comparisonPerspective=new ComparisonPerspective();this._perspectives.push(new SummaryPerspective());if(profile.profileType()!==instance.trackingHeapSnapshotProfileType){this._perspectives.push(this._comparisonPerspective);}
this._perspectives.push(new ContainmentPerspective());if(this._allocationWidget){this._perspectives.push(new AllocationPerspective());}
this._perspectives.push(new StatisticsPerspective());this._perspectiveSelect=new UI.Toolbar.ToolbarComboBox(this._onSelectedPerspectiveChanged.bind(this),ls`Perspective`);this._updatePerspectiveOptions();this._baseSelect=new UI.Toolbar.ToolbarComboBox(this._changeBase.bind(this),ls`Base snapshot`);this._baseSelect.setVisible(false);this._updateBaseOptions();this._filterSelect=new UI.Toolbar.ToolbarComboBox(this._changeFilter.bind(this),ls`Filter`);this._filterSelect.setVisible(false);this._updateFilterOptions();this._classNameFilter=new UI.Toolbar.ToolbarInput(ls`Class filter`);this._classNameFilter.setVisible(false);this._constructorsDataGrid.setNameFilter(this._classNameFilter);this._diffDataGrid.setNameFilter(this._classNameFilter);this._selectedSizeText=new UI.Toolbar.ToolbarText();this._popoverHelper=new UI.PopoverHelper.PopoverHelper(this.element,this._getPopoverRequest.bind(this));this._popoverHelper.setDisableOnClick(true);this._popoverHelper.setHasPadding(true);this.element.addEventListener('scroll',this._popoverHelper.hidePopover.bind(this._popoverHelper),true);this._currentPerspectiveIndex=0;this._currentPerspective=this._perspectives[0];this._currentPerspective.activate(this);this._dataGrid=this._currentPerspective.masterGrid(this);this._populate();this._searchThrottler=new Common.Throttler.Throttler(0);for(const existingProfile of this._profiles()){existingProfile.addEventListener(ProfileHeaderEvents.ProfileTitleChanged,this._updateControls,this);}}
_createOverview(){const profileType=this._profile.profileType();this._trackingOverviewGrid=new HeapTimelineOverview();this._trackingOverviewGrid.addEventListener(IdsRangeChanged,this._onIdsRangeChanged.bind(this));if(!this._profile.fromFile()&&profileType.profileBeingRecorded()===this._profile){profileType.addEventListener(TrackingHeapSnapshotProfileType.HeapStatsUpdate,this._onHeapStatsUpdate,this);profileType.addEventListener(TrackingHeapSnapshotProfileType.TrackingStopped,this._onStopTracking,this);this._trackingOverviewGrid.start();}}
_onStopTracking(){this._profile.profileType().removeEventListener(TrackingHeapSnapshotProfileType.HeapStatsUpdate,this._onHeapStatsUpdate,this);this._profile.profileType().removeEventListener(TrackingHeapSnapshotProfileType.TrackingStopped,this._onStopTracking,this);if(this._trackingOverviewGrid){this._trackingOverviewGrid.stop();}}
_onHeapStatsUpdate(event){const samples=event.data;if(samples){this._trackingOverviewGrid.setSamples(event.data);}}
searchableView(){return this._searchableView;}
showProfile(profile){return this._parentDataDisplayDelegate.showProfile(profile);}
showObject(snapshotObjectId,perspectiveName){if(snapshotObjectId<=this._profile.maxJSObjectId){this.selectLiveObject(perspectiveName,snapshotObjectId);}else{this._parentDataDisplayDelegate.showObject(snapshotObjectId,perspectiveName);}}
async linkifyObject(nodeIndex){const heapProfilerModel=this._profile.heapProfilerModel();if(!heapProfilerModel){return null;}
const location=await this._profile.getLocation(nodeIndex);if(!location){return null;}
const debuggerModel=heapProfilerModel.runtimeModel().debuggerModel();const rawLocation=debuggerModel.createRawLocationByScriptId(String(location.scriptId),location.lineNumber,location.columnNumber);if(!rawLocation){return null;}
const sourceURL=rawLocation.script()&&rawLocation.script().sourceURL;return sourceURL&&this._linkifier?this._linkifier.linkifyRawLocation(rawLocation,sourceURL):null;}
async _populate(){const heapSnapshotProxy=await this._profile._loadPromise;this._retrieveStatistics(heapSnapshotProxy);this._dataGrid.setDataSource(heapSnapshotProxy);if(this._profile.profileType().id===TrackingHeapSnapshotProfileType.TypeId&&this._profile.fromFile()){const samples=await heapSnapshotProxy.getSamples();if(samples){console.assert(samples.timestamps.length);const profileSamples=new Samples();profileSamples.sizes=samples.sizes;profileSamples.ids=samples.lastAssignedIds;profileSamples.timestamps=samples.timestamps;profileSamples.max=samples.sizes;profileSamples.totalTime=Math.max(samples.timestamps.peekLast(),10000);this._trackingOverviewGrid.setSamples(profileSamples);}}
const list=this._profiles();const profileIndex=list.indexOf(this._profile);this._baseSelect.setSelectedIndex(Math.max(0,profileIndex-1));if(this._trackingOverviewGrid){this._trackingOverviewGrid.updateGrid();}}
async _retrieveStatistics(heapSnapshotProxy){const statistics=await heapSnapshotProxy.getStatistics();this._statisticsView.setTotal(statistics.total);this._statisticsView.addRecord(statistics.code,Common.UIString.UIString('Code'),'#f77');this._statisticsView.addRecord(statistics.strings,Common.UIString.UIString('Strings'),'#5e5');this._statisticsView.addRecord(statistics.jsArrays,Common.UIString.UIString('JS Arrays'),'#7af');this._statisticsView.addRecord(statistics.native,Common.UIString.UIString('Typed Arrays'),'#fc5');this._statisticsView.addRecord(statistics.system,Common.UIString.UIString('System Objects'),'#98f');return statistics;}
_onIdsRangeChanged(event){const minId=event.data.minId;const maxId=event.data.maxId;this._selectedSizeText.setText(Common.UIString.UIString('Selected size: %s',Number.bytesToString(event.data.size)));if(this._constructorsDataGrid.snapshot){this._constructorsDataGrid.setSelectionRange(minId,maxId);}}
async toolbarItems(){const result=[this._perspectiveSelect,this._classNameFilter];if(this._profile.profileType()!==instance.trackingHeapSnapshotProfileType){result.push(this._baseSelect,this._filterSelect);}
result.push(this._selectedSizeText);return result;}
willHide(){this._currentSearchResultIndex=-1;this._popoverHelper.hidePopover();}
supportsCaseSensitiveSearch(){return true;}
supportsRegexSearch(){return false;}
searchCanceled(){this._currentSearchResultIndex=-1;this._searchResults=[];}
_selectRevealedNode(node){if(node){node.select();}}
performSearch(searchConfig,shouldJump,jumpBackwards){const nextQuery=new HeapSnapshotModel.HeapSnapshotModel.SearchConfig(searchConfig.query.trim(),searchConfig.caseSensitive,searchConfig.isRegex,shouldJump,jumpBackwards||false);this._searchThrottler.schedule(this._performSearch.bind(this,nextQuery));}
async _performSearch(nextQuery){this.searchCanceled();if(!this._currentPerspective.supportsSearch()){return;}
this.currentQuery=nextQuery;const query=nextQuery.query.trim();if(!query){return;}
if(query.charAt(0)==='@'){const snapshotNodeId=parseInt(query.substring(1),10);if(isNaN(snapshotNodeId)){return;}
const node=await this._dataGrid.revealObjectByHeapSnapshotId(String(snapshotNodeId));this._selectRevealedNode(node);return;}
this._searchResults=await this._profile._snapshotProxy.search(this.currentQuery,this._dataGrid.nodeFilter());this._searchableView.updateSearchMatchesCount(this._searchResults.length);if(this._searchResults.length){this._currentSearchResultIndex=nextQuery.jumpBackwards?this._searchResults.length-1:0;}
await this._jumpToSearchResult(this._currentSearchResultIndex);}
jumpToNextSearchResult(){if(!this._searchResults.length){return;}
this._currentSearchResultIndex=(this._currentSearchResultIndex+1)%this._searchResults.length;this._searchThrottler.schedule(this._jumpToSearchResult.bind(this,this._currentSearchResultIndex));}
jumpToPreviousSearchResult(){if(!this._searchResults.length){return;}
this._currentSearchResultIndex=(this._currentSearchResultIndex+this._searchResults.length-1)%this._searchResults.length;this._searchThrottler.schedule(this._jumpToSearchResult.bind(this,this._currentSearchResultIndex));}
async _jumpToSearchResult(searchResultIndex){this._searchableView.updateCurrentMatchIndex(searchResultIndex);if(searchResultIndex===-1){return;}
const node=await this._dataGrid.revealObjectByHeapSnapshotId(String(this._searchResults[searchResultIndex]));this._selectRevealedNode(node);}
refreshVisibleData(){if(!this._dataGrid){return;}
let child=this._dataGrid.rootNode().children[0];while(child){child.refresh();child=child.traverseNextNode(false,null,true);}}
_changeBase(){if(this._baseProfile===this._profiles()[this._baseSelect.selectedIndex()]){return;}
this._baseProfile=this._profiles()[this._baseSelect.selectedIndex()];const dataGrid=(this._dataGrid);if(dataGrid.snapshot){this._baseProfile._loadPromise.then(dataGrid.setBaseDataSource.bind(dataGrid));}
if(!this.currentQuery||!this._searchResults){return;}
this.performSearch(this.currentQuery,false);}
_changeFilter(){const profileIndex=this._filterSelect.selectedIndex()-1;this._dataGrid.filterSelectIndexChanged(this._profiles(),profileIndex);if(!this.currentQuery||!this._searchResults){return;}
this.performSearch(this.currentQuery,false);}
_profiles(){return this._profile.profileType().getProfiles();}
_selectionChanged(event){const selectedNode=(event.data);this._setSelectedNodeForDetailsView(selectedNode);this._inspectedObjectChanged(event);}
_onSelectAllocationNode(event){const selectedNode=(event.data);this._constructorsDataGrid.setAllocationNodeId(selectedNode.allocationNodeId());this._setSelectedNodeForDetailsView(null);}
_inspectedObjectChanged(event){const selectedNode=(event.data);const heapProfilerModel=this._profile.heapProfilerModel();if(heapProfilerModel&&selectedNode instanceof HeapSnapshotGenericObjectNode){heapProfilerModel.addInspectedHeapObject(String(selectedNode.snapshotNodeId));}}
_setSelectedNodeForDetailsView(nodeItem){const dataSource=nodeItem&&nodeItem.retainersDataSource();if(dataSource){this._retainmentDataGrid.setDataSource(dataSource.snapshot,dataSource.snapshotNodeIndex);if(this._allocationStackView){this._allocationStackView.setAllocatedObject(dataSource.snapshot,dataSource.snapshotNodeIndex);}}else{if(this._allocationStackView){this._allocationStackView.clear();}
this._retainmentDataGrid.reset();}}
_changePerspectiveAndWait(perspectiveTitle){const perspectiveIndex=this._perspectives.findIndex(perspective=>perspective.title()===perspectiveTitle);if(perspectiveIndex===-1||this._currentPerspectiveIndex===perspectiveIndex){return Promise.resolve();}
const promise=this._perspectives[perspectiveIndex].masterGrid(this).once(HeapSnapshotSortableDataGrid.Events.ContentShown);const option=this._perspectiveSelect.options().find(option=>option.value===String(perspectiveIndex));this._perspectiveSelect.select((option));this._changePerspective(perspectiveIndex);return promise;}
async _updateDataSourceAndView(){const dataGrid=this._dataGrid;if(!dataGrid||dataGrid.snapshot){return;}
const snapshotProxy=await this._profile._loadPromise;if(this._dataGrid!==dataGrid){return;}
if(dataGrid.snapshot!==snapshotProxy){dataGrid.setDataSource(snapshotProxy);}
if(dataGrid!==this._diffDataGrid){return;}
if(!this._baseProfile){this._baseProfile=this._profiles()[this._baseSelect.selectedIndex()];}
const baseSnapshotProxy=await this._baseProfile._loadPromise;if(this._diffDataGrid.baseSnapshot!==baseSnapshotProxy){this._diffDataGrid.setBaseDataSource(baseSnapshotProxy);}}
_onSelectedPerspectiveChanged(event){this._changePerspective(event.target.selectedOptions[0].value);}
_changePerspective(selectedIndex){if(selectedIndex===this._currentPerspectiveIndex){return;}
this._currentPerspectiveIndex=selectedIndex;this._currentPerspective.deactivate(this);const perspective=this._perspectives[selectedIndex];this._currentPerspective=perspective;this._dataGrid=perspective.masterGrid(this);perspective.activate(this);this.refreshVisibleData();if(this._dataGrid){this._dataGrid.updateWidths();}
this._updateDataSourceAndView();if(!this.currentQuery||!this._searchResults){return;}
this.performSearch(this.currentQuery,false);}
async selectLiveObject(perspectiveName,snapshotObjectId){await this._changePerspectiveAndWait(perspectiveName);const node=await this._dataGrid.revealObjectByHeapSnapshotId(snapshotObjectId);if(node){node.select();}else{self.Common.console.error('Cannot find corresponding heap snapshot node');}}
_getPopoverRequest(event){const span=event.target.enclosingNodeOrSelfWithNodeName('span');const row=event.target.enclosingNodeOrSelfWithNodeName('tr');const heapProfilerModel=this._profile.heapProfilerModel();if(!row||!span||!heapProfilerModel){return null;}
const node=row._dataGridNode;let objectPopoverHelper;return{box:span.boxInWindow(),show:async popover=>{const remoteObject=await node.queryObjectContent(heapProfilerModel,'popover');if(!remoteObject){return false;}
objectPopoverHelper=await ObjectUI.ObjectPopoverHelper.ObjectPopoverHelper.buildObjectPopover(remoteObject,popover);if(!objectPopoverHelper){heapProfilerModel.runtimeModel().releaseObjectGroup('popover');return false;}
return true;},hide:()=>{heapProfilerModel.runtimeModel().releaseObjectGroup('popover');objectPopoverHelper.dispose();}};}
_updatePerspectiveOptions(){const multipleSnapshots=this._profiles().length>1;this._perspectiveSelect.removeOptions();this._perspectives.forEach((perspective,index)=>{if(multipleSnapshots||perspective!==this._comparisonPerspective){this._perspectiveSelect.createOption(perspective.title(),String(index));}});}
_updateBaseOptions(){const list=this._profiles();const selectedIndex=this._baseSelect.selectedIndex();this._baseSelect.removeOptions();for(const item of list){this._baseSelect.createOption(item.title);}
if(selectedIndex>-1){this._baseSelect.setSelectedIndex(selectedIndex);}}
_updateFilterOptions(){const list=this._profiles();const selectedIndex=this._filterSelect.selectedIndex();this._filterSelect.removeOptions();this._filterSelect.createOption(Common.UIString.UIString('All objects'));for(let i=0;i<list.length;++i){let title;if(!i){title=Common.UIString.UIString('Objects allocated before %s',list[i].title);}else{title=Common.UIString.UIString('Objects allocated between %s and %s',list[i-1].title,list[i].title);}
this._filterSelect.createOption(title);}
if(selectedIndex>-1){this._filterSelect.setSelectedIndex(selectedIndex);}}
_updateControls(){this._updatePerspectiveOptions();this._updateBaseOptions();this._updateFilterOptions();}
_onReceiveSnapshot(event){this._updateControls();const profile=event.data;profile.addEventListener(ProfileHeaderEvents.ProfileTitleChanged,this._updateControls,this);}
_onProfileHeaderRemoved(event){const profile=event.data;profile.removeEventListener(ProfileHeaderEvents.ProfileTitleChanged,this._updateControls,this);if(this._profile===profile){this.detach();this._profile.profileType().removeEventListener(HeapSnapshotProfileType.SnapshotReceived,this._onReceiveSnapshot,this);this._profile.profileType().removeEventListener(ProfileTypeEvents.RemoveProfileHeader,this._onProfileHeaderRemoved,this);this.dispose();}else{this._updateControls();}}
dispose(){this._linkifier.dispose();this._popoverHelper.dispose();if(this._allocationStackView){this._allocationStackView.clear();this._allocationDataGrid.dispose();}
this._onStopTracking();if(this._trackingOverviewGrid){this._trackingOverviewGrid.removeEventListener(IdsRangeChanged,this._onIdsRangeChanged.bind(this));}}}
export class Perspective{constructor(title){this._title=title;}
activate(heapSnapshotView){}
deactivate(heapSnapshotView){heapSnapshotView._baseSelect.setVisible(false);heapSnapshotView._filterSelect.setVisible(false);heapSnapshotView._classNameFilter.setVisible(false);if(heapSnapshotView._trackingOverviewGrid){heapSnapshotView._trackingOverviewGrid.detach();}
if(heapSnapshotView._allocationWidget){heapSnapshotView._allocationWidget.detach();}
if(heapSnapshotView._statisticsView){heapSnapshotView._statisticsView.detach();}
heapSnapshotView._splitWidget.detach();heapSnapshotView._splitWidget.detachChildWidgets();}
masterGrid(heapSnapshotView){return null;}
title(){return this._title;}
supportsSearch(){return false;}}
export class SummaryPerspective extends Perspective{constructor(){super(Common.UIString.UIString('Summary'));}
activate(heapSnapshotView){heapSnapshotView._splitWidget.setMainWidget(heapSnapshotView._constructorsWidget);heapSnapshotView._splitWidget.setSidebarWidget(heapSnapshotView._objectDetailsView);heapSnapshotView._splitWidget.show(heapSnapshotView._searchableView.element);heapSnapshotView._filterSelect.setVisible(true);heapSnapshotView._classNameFilter.setVisible(true);if(!heapSnapshotView._trackingOverviewGrid){return;}
heapSnapshotView._trackingOverviewGrid.show(heapSnapshotView._searchableView.element,heapSnapshotView._splitWidget.element);heapSnapshotView._trackingOverviewGrid.update();heapSnapshotView._trackingOverviewGrid.updateGrid();}
masterGrid(heapSnapshotView){return heapSnapshotView._constructorsDataGrid;}
supportsSearch(){return true;}}
export class ComparisonPerspective extends Perspective{constructor(){super(Common.UIString.UIString('Comparison'));}
activate(heapSnapshotView){heapSnapshotView._splitWidget.setMainWidget(heapSnapshotView._diffWidget);heapSnapshotView._splitWidget.setSidebarWidget(heapSnapshotView._objectDetailsView);heapSnapshotView._splitWidget.show(heapSnapshotView._searchableView.element);heapSnapshotView._baseSelect.setVisible(true);heapSnapshotView._classNameFilter.setVisible(true);}
masterGrid(heapSnapshotView){return heapSnapshotView._diffDataGrid;}
supportsSearch(){return true;}}
export class ContainmentPerspective extends Perspective{constructor(){super(Common.UIString.UIString('Containment'));}
activate(heapSnapshotView){heapSnapshotView._splitWidget.setMainWidget(heapSnapshotView._containmentWidget);heapSnapshotView._splitWidget.setSidebarWidget(heapSnapshotView._objectDetailsView);heapSnapshotView._splitWidget.show(heapSnapshotView._searchableView.element);}
masterGrid(heapSnapshotView){return heapSnapshotView._containmentDataGrid;}}
export class AllocationPerspective extends Perspective{constructor(){super(Common.UIString.UIString('Allocation'));this._allocationSplitWidget=new UI.SplitWidget.SplitWidget(false,true,'heapSnapshotAllocationSplitViewState',200,200);this._allocationSplitWidget.setSidebarWidget(new UI.Widget.VBox());}
activate(heapSnapshotView){this._allocationSplitWidget.setMainWidget(heapSnapshotView._allocationWidget);heapSnapshotView._splitWidget.setMainWidget(heapSnapshotView._constructorsWidget);heapSnapshotView._splitWidget.setSidebarWidget(heapSnapshotView._objectDetailsView);const allocatedObjectsView=new UI.Widget.VBox();const resizer=createElementWithClass('div','heap-snapshot-view-resizer');const title=resizer.createChild('div','title').createChild('span');title.textContent=Common.UIString.UIString('Live objects');this._allocationSplitWidget.hideDefaultResizer();this._allocationSplitWidget.installResizer(resizer);allocatedObjectsView.element.appendChild(resizer);heapSnapshotView._splitWidget.show(allocatedObjectsView.element);this._allocationSplitWidget.setSidebarWidget(allocatedObjectsView);this._allocationSplitWidget.show(heapSnapshotView._searchableView.element);heapSnapshotView._constructorsDataGrid.clear();const selectedNode=heapSnapshotView._allocationDataGrid.selectedNode;if(selectedNode){heapSnapshotView._constructorsDataGrid.setAllocationNodeId(selectedNode.allocationNodeId());}}
deactivate(heapSnapshotView){this._allocationSplitWidget.detach();super.deactivate(heapSnapshotView);}
masterGrid(heapSnapshotView){return heapSnapshotView._allocationDataGrid;}}
export class StatisticsPerspective extends Perspective{constructor(){super(Common.UIString.UIString('Statistics'));}
activate(heapSnapshotView){heapSnapshotView._statisticsView.show(heapSnapshotView._searchableView.element);}
masterGrid(heapSnapshotView){return null;}}
export class HeapSnapshotProfileType extends ProfileType{constructor(id,title){super(id||HeapSnapshotProfileType.TypeId,title||ls`Heap snapshot`);self.SDK.targetManager.observeModels(SDK.HeapProfilerModel.HeapProfilerModel,this);self.SDK.targetManager.addModelListener(SDK.HeapProfilerModel.HeapProfilerModel,SDK.HeapProfilerModel.Events.ResetProfiles,this._resetProfiles,this);self.SDK.targetManager.addModelListener(SDK.HeapProfilerModel.HeapProfilerModel,SDK.HeapProfilerModel.Events.AddHeapSnapshotChunk,this._addHeapSnapshotChunk,this);self.SDK.targetManager.addModelListener(SDK.HeapProfilerModel.HeapProfilerModel,SDK.HeapProfilerModel.Events.ReportHeapSnapshotProgress,this._reportHeapSnapshotProgress,this);this._treatGlobalObjectsAsRoots=self.Common.settings.createSetting('treatGlobalObjectsAsRoots',true);this._customContent=null;}
modelAdded(heapProfilerModel){heapProfilerModel.enable();}
modelRemoved(heapProfilerModel){}
getProfiles(){return(super.getProfiles());}
fileExtension(){return'.heapsnapshot';}
get buttonTooltip(){return Common.UIString.UIString('Take heap snapshot');}
isInstantProfile(){return true;}
buttonClicked(){this._takeHeapSnapshot();Host.userMetrics.actionTaken(Host.UserMetrics.Action.ProfilesHeapProfileTaken);return false;}
get treeItemTitle(){return Common.UIString.UIString('HEAP SNAPSHOTS');}
get description(){return Common.UIString.UIString('Heap snapshot profiles show memory distribution among your page\'s JavaScript objects and related DOM nodes.');}
customContent(){const checkboxSetting=UI.SettingsUI.createSettingCheckbox(ls`Treat global objects as roots (recommended, unchecking this exposes internal nodes and introduces excessive detail, but might help debugging cycles in retaining paths)`,this._treatGlobalObjectsAsRoots,true);this._customContent=(checkboxSetting);const showOptionToNotTreatGlobalObjectsAsRoots=Root.Runtime.experiments.isEnabled('showOptionToNotTreatGlobalObjectsAsRoots');return showOptionToNotTreatGlobalObjectsAsRoots?checkboxSetting:null;}
setCustomContentEnabled(enable){this._customContent.checkboxElement.disabled=!enable;}
createProfileLoadedFromFile(title){return new HeapProfileHeader(null,this,title);}
async _takeHeapSnapshot(){if(this.profileBeingRecorded()){return;}
const heapProfilerModel=self.UI.context.flavor(SDK.HeapProfilerModel.HeapProfilerModel);if(!heapProfilerModel){return;}
let profile=new HeapProfileHeader(heapProfilerModel,this);this.setProfileBeingRecorded(profile);this.addProfile(profile);profile.updateStatus(Common.UIString.UIString('Snapshotting…'));await heapProfilerModel.takeHeapSnapshot(true,this._treatGlobalObjectsAsRoots.get());profile=this.profileBeingRecorded();profile.title=Common.UIString.UIString('Snapshot %d',profile.uid);profile._finishLoad();this.setProfileBeingRecorded(null);this.dispatchEventToListeners(ProfileTypeEvents.ProfileComplete,profile);}
_addHeapSnapshotChunk(event){if(!this.profileBeingRecorded()){return;}
const chunk=(event.data);this.profileBeingRecorded().transferChunk(chunk);}
_reportHeapSnapshotProgress(event){const profile=this.profileBeingRecorded();if(!profile){return;}
const data=(event.data);profile.updateStatus(Common.UIString.UIString('%.0f%%',(data.done/data.total)*100),true);if(data.finished){profile._prepareToLoad();}}
_resetProfiles(event){const heapProfilerModel=(event.data);for(const profile of this.getProfiles()){if(profile.heapProfilerModel()===heapProfilerModel){this.removeProfile(profile);}}}
_snapshotReceived(profile){if(this.profileBeingRecorded()===profile){this.setProfileBeingRecorded(null);}
this.dispatchEventToListeners(HeapSnapshotProfileType.SnapshotReceived,profile);}}
HeapSnapshotProfileType.TypeId='HEAP';HeapSnapshotProfileType.SnapshotReceived='SnapshotReceived';export class TrackingHeapSnapshotProfileType extends HeapSnapshotProfileType{constructor(){super(TrackingHeapSnapshotProfileType.TypeId,ls`Allocation instrumentation on timeline`);this._recordAllocationStacksSetting=self.Common.settings.createSetting('recordAllocationStacks',false);this._customContent=null;}
modelAdded(heapProfilerModel){super.modelAdded(heapProfilerModel);heapProfilerModel.addEventListener(SDK.HeapProfilerModel.Events.HeapStatsUpdate,this._heapStatsUpdate,this);heapProfilerModel.addEventListener(SDK.HeapProfilerModel.Events.LastSeenObjectId,this._lastSeenObjectId,this);}
modelRemoved(heapProfilerModel){super.modelRemoved(heapProfilerModel);heapProfilerModel.removeEventListener(SDK.HeapProfilerModel.Events.HeapStatsUpdate,this._heapStatsUpdate,this);heapProfilerModel.removeEventListener(SDK.HeapProfilerModel.Events.LastSeenObjectId,this._lastSeenObjectId,this);}
_heapStatsUpdate(event){if(!this._profileSamples){return;}
const samples=(event.data);let index;for(let i=0;i<samples.length;i+=3){index=samples[i];const size=samples[i+2];this._profileSamples.sizes[index]=size;if(!this._profileSamples.max[index]){this._profileSamples.max[index]=size;}}}
_lastSeenObjectId(event){const profileSamples=this._profileSamples;if(!profileSamples){return;}
const data=(event.data);const currentIndex=Math.max(profileSamples.ids.length,profileSamples.max.length-1);profileSamples.ids[currentIndex]=data.lastSeenObjectId;if(!profileSamples.max[currentIndex]){profileSamples.max[currentIndex]=0;profileSamples.sizes[currentIndex]=0;}
profileSamples.timestamps[currentIndex]=data.timestamp;if(profileSamples.totalTime<data.timestamp-profileSamples.timestamps[0]){profileSamples.totalTime*=2;}
this.dispatchEventToListeners(TrackingHeapSnapshotProfileType.HeapStatsUpdate,this._profileSamples);this.profileBeingRecorded().updateStatus(null,true);}
hasTemporaryView(){return true;}
get buttonTooltip(){return this._recording?ls`Stop recording heap profile`:ls`Start recording heap profile`;}
isInstantProfile(){return false;}
buttonClicked(){return this._toggleRecording();}
_startRecordingProfile(){if(this.profileBeingRecorded()){return;}
const heapProfilerModel=this._addNewProfile();if(!heapProfilerModel){return;}
heapProfilerModel.startTrackingHeapObjects(this._recordAllocationStacksSetting.get());}
customContent(){const checkboxSetting=UI.SettingsUI.createSettingCheckbox(ls`Record allocation stacks (extra performance overhead)`,this._recordAllocationStacksSetting,true);this._customContent=(checkboxSetting);return checkboxSetting;}
setCustomContentEnabled(enable){this._customContent.checkboxElement.disabled=!enable;}
_addNewProfile(){const heapProfilerModel=self.UI.context.flavor(SDK.HeapProfilerModel.HeapProfilerModel);if(!heapProfilerModel){return null;}
this.setProfileBeingRecorded(new HeapProfileHeader(heapProfilerModel,this,undefined));this._profileSamples=new Samples();this.profileBeingRecorded()._profileSamples=this._profileSamples;this._recording=true;this.addProfile((this.profileBeingRecorded()));this.profileBeingRecorded().updateStatus(Common.UIString.UIString('Recording…'));this.dispatchEventToListeners(TrackingHeapSnapshotProfileType.TrackingStarted);return heapProfilerModel;}
async _stopRecordingProfile(){this.profileBeingRecorded().updateStatus(Common.UIString.UIString('Snapshotting…'));const stopPromise=this.profileBeingRecorded().heapProfilerModel().stopTrackingHeapObjects(true);this._recording=false;this.dispatchEventToListeners(TrackingHeapSnapshotProfileType.TrackingStopped);await stopPromise;const profile=this.profileBeingRecorded();if(!profile){return;}
profile._finishLoad();this._profileSamples=null;this.setProfileBeingRecorded(null);this.dispatchEventToListeners(ProfileTypeEvents.ProfileComplete,profile);}
_toggleRecording(){if(this._recording){this._stopRecordingProfile();}else{this._startRecordingProfile();}
return this._recording;}
fileExtension(){return'.heaptimeline';}
get treeItemTitle(){return ls`ALLOCATION TIMELINES`;}
get description(){return ls`
        Allocation timelines show instrumented JavaScript memory allocations over time.
        Once profile is recorded you can select a time interval to see objects that
        were allocated within it and still alive by the end of recording.
        Use this profile type to isolate memory leaks.`;}
_resetProfiles(event){const wasRecording=this._recording;this.setProfileBeingRecorded(null);super._resetProfiles(event);this._profileSamples=null;if(wasRecording){this._addNewProfile();}}
profileBeingRecordedRemoved(){this._stopRecordingProfile();this._profileSamples=null;}}
TrackingHeapSnapshotProfileType.TypeId='HEAP-RECORD';TrackingHeapSnapshotProfileType.HeapStatsUpdate='HeapStatsUpdate';TrackingHeapSnapshotProfileType.TrackingStarted='TrackingStarted';TrackingHeapSnapshotProfileType.TrackingStopped='TrackingStopped';export class HeapProfileHeader extends ProfileHeader{constructor(heapProfilerModel,type,title){super(type,title||Common.UIString.UIString('Snapshot %d',type.nextProfileUid()));this._heapProfilerModel=heapProfilerModel;this.maxJSObjectId=-1;this._workerProxy=null;this._receiver=null;this._snapshotProxy=null;this._loadPromise=new Promise(resolve=>this._fulfillLoad=resolve);this._totalNumberOfChunks=0;this._bufferedWriter=null;this._tempFile=null;}
heapProfilerModel(){return this._heapProfilerModel;}
getLocation(nodeIndex){return this._snapshotProxy.getLocation(nodeIndex);}
createSidebarTreeElement(dataDisplayDelegate){return new ProfileSidebarTreeElement(dataDisplayDelegate,this,'heap-snapshot-sidebar-tree-item');}
createView(dataDisplayDelegate){return new HeapSnapshotView(dataDisplayDelegate,this);}
_prepareToLoad(){console.assert(!this._receiver,'Already loading');this._setupWorker();this.updateStatus(Common.UIString.UIString('Loading…'),true);}
_finishLoad(){if(!this._wasDisposed){this._receiver.close();}
if(!this._bufferedWriter){return;}
this._didWriteToTempFile(this._bufferedWriter);}
_didWriteToTempFile(tempFile){if(this._wasDisposed){if(tempFile){tempFile.remove();}
return;}
this._tempFile=tempFile;if(!tempFile){this._failedToCreateTempFile=true;}
if(this._onTempFileReady){this._onTempFileReady();this._onTempFileReady=null;}}
_setupWorker(){function setProfileWait(event){this.updateStatus(null,event.data);}
console.assert(!this._workerProxy,'HeapSnapshotWorkerProxy already exists');this._workerProxy=new HeapSnapshotWorkerProxy(this._handleWorkerEvent.bind(this));this._workerProxy.addEventListener(HeapSnapshotWorkerProxy.Events.Wait,setProfileWait,this);this._receiver=this._workerProxy.createLoader(this.uid,this._snapshotReceived.bind(this));}
_handleWorkerEvent(eventName,data){if(HeapSnapshotModel.HeapSnapshotModel.HeapSnapshotProgressEvent.BrokenSnapshot===eventName){const error=(data);self.Common.console.error(error);return;}
if(HeapSnapshotModel.HeapSnapshotModel.HeapSnapshotProgressEvent.Update!==eventName){return;}
const serializedMessage=(data);const messageObject=Common.UIString.deserializeUIString(serializedMessage);this.updateStatus(ls(messageObject.messageParts,messageObject.values));}
dispose(){if(this._workerProxy){this._workerProxy.dispose();}
this.removeTempFile();this._wasDisposed=true;}
_didCompleteSnapshotTransfer(){if(!this._snapshotProxy){return;}
this.updateStatus(Number.bytesToString(this._snapshotProxy.totalSize),false);}
transferChunk(chunk){if(!this._bufferedWriter){this._bufferedWriter=new Bindings.TempFile.TempFile();}
this._bufferedWriter.write([chunk]);++this._totalNumberOfChunks;this._receiver.write(chunk);}
_snapshotReceived(snapshotProxy){if(this._wasDisposed){return;}
this._receiver=null;this._snapshotProxy=snapshotProxy;this.maxJSObjectId=snapshotProxy.maxJSObjectId();this._didCompleteSnapshotTransfer();this._workerProxy.startCheckingForLongRunningCalls();this.notifySnapshotReceived();}
notifySnapshotReceived(){this._fulfillLoad(this._snapshotProxy);this.profileType()._snapshotReceived(this);if(this.canSaveToFile()){this.dispatchEventToListeners(ProfileHeaderEvents.ProfileReceived);}}
canSaveToFile(){return!this.fromFile()&&!!this._snapshotProxy;}
saveToFile(){const fileOutputStream=new Bindings.FileUtils.FileOutputStream();this._fileName=this._fileName||'Heap-'+new Date().toISO8601Compact()+this.profileType().fileExtension();fileOutputStream.open(this._fileName).then(onOpen.bind(this));async function onOpen(accepted){if(!accepted){return;}
if(this._failedToCreateTempFile){self.Common.console.error('Failed to open temp file with heap snapshot');fileOutputStream.close();return;}
if(this._tempFile){const error=await this._tempFile.copyToOutputStream(fileOutputStream,this._onChunkTransferred.bind(this));if(error){self.Common.console.error('Failed to read heap snapshot from temp file: '+error.message);}
this._didCompleteSnapshotTransfer();return;}
this._onTempFileReady=onOpen.bind(this,accepted);this._updateSaveProgress(0,1);}}
_onChunkTransferred(reader){this._updateSaveProgress(reader.loadedSize(),reader.fileSize());}
_updateSaveProgress(value,total){const percentValue=((total&&value/total)*100).toFixed(0);this.updateStatus(Common.UIString.UIString('Saving… %d%%',percentValue));}
async loadFromFile(file){this.updateStatus(Common.UIString.UIString('Loading…'),true);this._setupWorker();const reader=new Bindings.FileUtils.ChunkedFileReader(file,10000000);const success=await reader.read((this._receiver));if(!success){this.updateStatus(reader.error().message);}
return success?null:reader.error();}}
export class HeapSnapshotStatisticsView extends UI.Widget.VBox{constructor(){super();this.element.classList.add('heap-snapshot-statistics-view');this._pieChart=new PerfUI.PieChart.PieChart({chartName:ls`Heap memory usage`,size:150,formatter:HeapSnapshotStatisticsView._valueFormatter,showLegend:true});this._pieChart.element.classList.add('heap-snapshot-stats-pie-chart');this.element.appendChild(this._pieChart.element);}
static _valueFormatter(value){return Common.UIString.UIString('%s KB',Number.withThousandsSeparator(Math.round(value/1024)));}
setTotal(value){this._pieChart.setTotal(value);}
addRecord(value,name,color){this._pieChart.addSlice(value,color,name);}}
export class HeapAllocationStackView extends UI.Widget.Widget{constructor(heapProfilerModel){super();this._heapProfilerModel=heapProfilerModel;this._linkifier=new Components.Linkifier.Linkifier();this._frameElements=[];}
_onContextMenu(link,event){const contextMenu=new UI.ContextMenu.ContextMenu(event);if(!contextMenu.containsTarget(link)){contextMenu.appendApplicableItems(link);}
contextMenu.show();event.consume(true);}
_onStackViewKeydown(event){const target=(event.target);if(!target){return;}
if(isEnterKey(event)){const link=target._linkElement;if(!link){return;}
if(Components.Linkifier.Linkifier.invokeFirstAction(link)){event.consume(true);}
return;}
let navDown;if(event.key==='ArrowUp'){navDown=false;}else if(event.key==='ArrowDown'){navDown=true;}else{return;}
const index=this._frameElements.indexOf(target);if(index===-1){return;}
const nextIndex=navDown?index+1:index-1;if(nextIndex<0||nextIndex>=this._frameElements.length){return;}
const nextFrame=this._frameElements[nextIndex];nextFrame.tabIndex=0;target.tabIndex=-1;nextFrame.focus();event.consume(true);}
async setAllocatedObject(snapshot,snapshotNodeIndex){this.clear();const frames=await snapshot.allocationStack(snapshotNodeIndex);if(!frames){const stackDiv=this.element.createChild('div','no-heap-allocation-stack');stackDiv.createTextChild(Common.UIString.UIString('Stack was not recorded for this object because it had been allocated before this profile recording started.'));return;}
const stackDiv=this.element.createChild('div','heap-allocation-stack');stackDiv.addEventListener('keydown',this._onStackViewKeydown.bind(this),false);for(const frame of frames){const frameDiv=stackDiv.createChild('div','stack-frame');this._frameElements.push(frameDiv);frameDiv.tabIndex=-1;const name=frameDiv.createChild('div');name.textContent=UI.UIUtils.beautifyFunctionName(frame.functionName);if(!frame.scriptId){continue;}
const target=this._heapProfilerModel?this._heapProfilerModel.target():null;const options={columnNumber:frame.column-1};const urlElement=this._linkifier.linkifyScriptLocation(target,String(frame.scriptId),frame.scriptName,frame.line-1,options);frameDiv.appendChild(urlElement);frameDiv._linkElement=urlElement;frameDiv.addEventListener('contextmenu',this._onContextMenu.bind(this,urlElement));}
this._frameElements[0].tabIndex=0;}
clear(){this.element.removeChildren();this._frameElements=[];this._linkifier.reset();}}