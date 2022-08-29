import*as Common from'../common/common.js';import*as DataGrid from'../data_grid/data_grid.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{SamplingHeapProfileNode}from'./HeapProfileView.js';export class LiveHeapProfileView extends UI.Widget.VBox{constructor(){super(true);this._gridNodeByUrl=new Map();this.registerRequiredCSS('profiler/liveHeapProfile.css');this._setting=self.Common.settings.moduleSetting('memoryLiveHeapProfile');const toolbar=new UI.Toolbar.Toolbar('live-heap-profile-toolbar',this.contentElement);this._toggleRecordAction=(self.UI.actionRegistry.action('live-heap-profile.toggle-recording'));this._toggleRecordButton=UI.Toolbar.Toolbar.createActionButton(this._toggleRecordAction);this._toggleRecordButton.setToggled(this._setting.get());toolbar.appendToolbarItem(this._toggleRecordButton);const mainTarget=self.SDK.targetManager.mainTarget();if(mainTarget&&mainTarget.model(SDK.ResourceTreeModel.ResourceTreeModel)){const startWithReloadAction=(self.UI.actionRegistry.action('live-heap-profile.start-with-reload'));this._startWithReloadButton=UI.Toolbar.Toolbar.createActionButton(startWithReloadAction);toolbar.appendToolbarItem(this._startWithReloadButton);}
this._dataGrid=this._createDataGrid();this._dataGrid.asWidget().show(this.contentElement);this._currentPollId=0;}
_createDataGrid(){const columns=[{id:'size',title:ls`JS Heap`,width:'72px',fixedWidth:true,sortable:true,align:DataGrid.DataGrid.Align.Right,sort:DataGrid.DataGrid.Order.Descending,tooltip:ls`Allocated JS heap size currently in use`,},{id:'isolates',title:ls`VMs`,width:'40px',fixedWidth:true,align:DataGrid.DataGrid.Align.Right,tooltip:ls`Number of VMs sharing the same script source`},{id:'url',title:ls`Script URL`,fixedWidth:false,sortable:true,tooltip:ls`URL of the script source`}];const dataGrid=new DataGrid.SortableDataGrid.SortableDataGrid({displayName:ls`Heap Profile`,columns});dataGrid.setResizeMethod(DataGrid.DataGrid.ResizeMethod.Last);dataGrid.element.classList.add('flex-auto');dataGrid.element.addEventListener('keydown',this._onKeyDown.bind(this),false);dataGrid.addEventListener(DataGrid.DataGrid.Events.OpenedNode,this._revealSourceForSelectedNode,this);dataGrid.addEventListener(DataGrid.DataGrid.Events.SortingChanged,this._sortingChanged,this);for(const info of columns){const headerCell=dataGrid.headerTableHeader(info.id);if(headerCell){headerCell.setAttribute('title',info.tooltip);}}
return dataGrid;}
wasShown(){this._poll();this._setting.addChangeListener(this._settingChanged,this);}
willHide(){++this._currentPollId;this._setting.removeChangeListener(this._settingChanged,this);}
_settingChanged(value){this._toggleRecordButton.setToggled((value.data));}
async _poll(){const pollId=this._currentPollId;do{const isolates=Array.from(self.SDK.isolateManager.isolates());const profiles=await Promise.all(isolates.map(isolate=>isolate.heapProfilerModel()&&isolate.heapProfilerModel().getSamplingProfile()));if(this._currentPollId!==pollId){return;}
this._update(isolates,profiles);await new Promise(r=>setTimeout(r,3000));}while(this._currentPollId===pollId);}
_update(isolates,profiles){const dataByUrl=new Map();profiles.forEach((profile,index)=>{if(profile){processNodeTree(isolates[index],'',profile.head);}});const rootNode=this._dataGrid.rootNode();const exisitingNodes=new Set();for(const pair of dataByUrl){const url=(pair[0]);const size=(pair[1].size);const isolateCount=(pair[1].isolates.size);if(!url){console.info(`Node with empty URL: ${size} bytes`);continue;}
let node=this._gridNodeByUrl.get(url);if(node){node.updateNode(size,isolateCount);}else{node=new GridNode(url,size,isolateCount);this._gridNodeByUrl.set(url,node);rootNode.appendChild(node);}
exisitingNodes.add(node);}
for(const node of rootNode.children.slice()){if(!exisitingNodes.has(node)){node.remove();}
this._gridNodeByUrl.delete(node);}
this._sortingChanged();function processNodeTree(isolate,parentUrl,node){const url=node.callFrame.url||parentUrl||systemNodeName(node)||anonymousScriptName(node);node.children.forEach(processNodeTree.bind(null,isolate,url));if(!node.selfSize){return;}
let data=dataByUrl.get(url);if(!data){data={size:0,isolates:new Set()};dataByUrl.set(url,data);}
data.size+=node.selfSize;data.isolates.add(isolate);}
function systemNodeName(node){const name=node.callFrame.functionName;return name.startsWith('(')&&name!=='(root)'?name:'';}
function anonymousScriptName(node){return Number(node.callFrame.scriptId)?Common.UIString.UIString('(Anonymous Script %s)',node.callFrame.scriptId):'';}}
_onKeyDown(event){if(!isEnterKey(event)){return;}
event.consume(true);this._revealSourceForSelectedNode();}
_revealSourceForSelectedNode(){const node=this._dataGrid.selectedNode;if(!node||!node._url){return;}
const sourceCode=self.Workspace.workspace.uiSourceCodeForURL(node._url);if(sourceCode){Common.Revealer.reveal(sourceCode);}}
_sortingChanged(){const columnId=this._dataGrid.sortColumnId();if(!columnId){return;}
const sortByUrl=(a,b)=>b._url.localeCompare(a._url);const sortBySize=(a,b)=>b._size-a._size;const sortFunction=columnId==='url'?sortByUrl:sortBySize;this._dataGrid.sortNodes(sortFunction,this._dataGrid.isSortOrderAscending());}
_toggleRecording(){const enable=!this._setting.get();if(enable){this._startRecording(false);}else{this._stopRecording();}}
_startRecording(reload){this._setting.set(true);if(!reload){return;}
const mainTarget=self.SDK.targetManager.mainTarget();if(!mainTarget){return;}
const resourceTreeModel=(mainTarget.model(SDK.ResourceTreeModel.ResourceTreeModel));if(resourceTreeModel){resourceTreeModel.reloadPage();}}
async _stopRecording(){this._setting.set(false);}}
export class GridNode extends DataGrid.SortableDataGrid.SortableDataGridNode{constructor(url,size,isolateCount){super();this._url=url;this._size=size;this._isolateCount=isolateCount;}
updateNode(size,isolateCount){if(this._size===size&&this._isolateCount===isolateCount){return;}
this._size=size;this._isolateCount=isolateCount;this.refresh();}
createCell(columnId){const cell=this.createTD(columnId);switch(columnId){case'url':cell.textContent=this._url;break;case'size':cell.textContent=Number.withThousandsSeparator(Math.round(this._size/1e3));cell.createChild('span','size-units').textContent=ls`KB`;break;case'isolates':cell.textContent=this._isolateCount;break;}
return cell;}}
export class ActionDelegate{handleAction(context,actionId){(async()=>{const profileViewId='live_heap_profile';await self.UI.viewManager.showView(profileViewId);const widget=await self.UI.viewManager.view(profileViewId).widget();this._innerHandleAction((widget),actionId);})();return true;}
_innerHandleAction(profilerView,actionId){switch(actionId){case'live-heap-profile.toggle-recording':profilerView._toggleRecording();break;case'live-heap-profile.start-with-reload':profilerView._startRecording(true);break;default:console.assert(false,`Unknown action: ${actionId}`);}}}