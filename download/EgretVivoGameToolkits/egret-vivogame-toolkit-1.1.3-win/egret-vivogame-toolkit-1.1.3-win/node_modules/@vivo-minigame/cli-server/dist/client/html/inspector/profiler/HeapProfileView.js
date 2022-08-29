import*as Common from'../common/common.js';import*as Components from'../components/components.js';import*as PerfUI from'../perf_ui/perf_ui.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{ProfileFlameChartDataProvider}from'./CPUProfileFlameChart.js';import{HeapTimelineOverview,IdsRangeChanged,Samples}from'./HeapTimelineOverview.js';import{Formatter,ProfileDataGridNode}from'./ProfileDataGrid.js';import{ProfileEvents,ProfileHeader,ProfileType}from'./ProfileHeader.js';import{ProfileView,ViewTypes,WritableProfileHeader}from'./ProfileView.js';export class HeapProfileView extends ProfileView{constructor(profileHeader){super();this._profileHeader=profileHeader;this._profileType=profileHeader.profileType();const views=[ViewTypes.Flame,ViewTypes.Heavy,ViewTypes.Tree];const isNativeProfile=this._profileType.id===SamplingNativeHeapProfileType.TypeId||this._profileType.id===SamplingNativeHeapSnapshotType.TypeId;if(isNativeProfile){views.push(ViewTypes.Text);}
this.initialize(new NodeFormatter(this),views);const profile=new SamplingHeapProfileModel(profileHeader._profile||profileHeader.protocolProfile());this.adjustedTotal=profile.total;this.setProfile(profile);this._selectedSizeText=new UI.Toolbar.ToolbarText();if(Root.Runtime.experiments.isEnabled('samplingHeapProfilerTimeline')){this._timelineOverview=new HeapTimelineOverview();this._timelineOverview.addEventListener(IdsRangeChanged,this._onIdsRangeChanged.bind(this));this._timelineOverview.show(this.element,this.element.firstChild);this._timelineOverview.start();this._profileType.addEventListener(SamplingHeapProfileType.Events.StatsUpdate,this._onStatsUpdate,this);this._profileType.once(ProfileEvents.ProfileComplete).then(()=>{this._profileType.removeEventListener(SamplingHeapProfileType.Events.StatsUpdate,this._onStatsUpdate,this);this._timelineOverview.stop();this._timelineOverview.updateGrid();});}}
async toolbarItems(){return[...await super.toolbarItems(),this._selectedSizeText];}
_onIdsRangeChanged(event){const minId=(event.data.minId);const maxId=(event.data.maxId);this._selectedSizeText.setText(ls`Selected size: ${Number.bytesToString(event.data.size)}`);this._setSelectionRange(minId,maxId);}
_setSelectionRange(minId,maxId){const profile=new SamplingHeapProfileModel(this._profileHeader._profile||this._profileHeader.protocolProfile(),minId,maxId);this.adjustedTotal=profile.total;this.setProfile(profile);}
_onStatsUpdate(event){const profile=event.data;if(!this._totalTime){this._timestamps=[];this._sizes=[];this._max=[];this._ordinals=[];this._totalTime=30000;this._lastOrdinal=0;}
this._sizes.fill(0);this._sizes.push(0);this._timestamps.push(Date.now());this._ordinals.push(this._lastOrdinal+1);this._lastOrdinal=profile.samples.reduce((res,sample)=>Math.max(res,sample.ordinal),this._lastOrdinal);for(const sample of profile.samples){const bucket=this._ordinals.upperBound(sample.ordinal)-1;this._sizes[bucket]+=sample.size;}
this._max.push(this._sizes.peekLast());if(this._timestamps.peekLast()-this._timestamps[0]>this._totalTime){this._totalTime*=2;}
const samples=({sizes:this._sizes,max:this._max,ids:this._ordinals,timestamps:this._timestamps,totalTime:this._totalTime});this._timelineOverview.setSamples(samples);}
columnHeader(columnId){switch(columnId){case'self':return Common.UIString.UIString('Self Size (bytes)');case'total':return Common.UIString.UIString('Total Size (bytes)');}
return'';}
createFlameChartDataProvider(){return new HeapFlameChartDataProvider((this.profile()),this._profileHeader.heapProfilerModel());}
populateTextView(view){const guides='+!:|';let text=`Sampling memory profile.\n\nDate/Time:       ${new Date()}\n`+'Report Version:  7\n'+`App Version:     ${/Chrom\S*/.exec(navigator.appVersion)[0] || 'Unknown'}\n`+'Node Weight:     1 KiB\n'+`Total Size:      ${Math.round(this.profile().root.total / 1024)} KiB\n`+'----\n\nCall graph:\n';const sortedChildren=this.profile().root.children.sort((a,b)=>b.total-a.total);const modules=this.profile().modules.map(m=>Object.assign({address:BigInt(m.baseAddress),endAddress:BigInt(m.baseAddress)+BigInt(m.size)},m));modules.sort((m1,m2)=>m1.address>m2.address?1:m1.address<m2.address?-1:0);for(const child of sortedChildren){printTree('    ',child!==sortedChildren.peekLast(),child);}
text+='\nBinary Images:\n';for(const module of modules){const fileName=/[^/\\]*$/.exec(module.name)[0];const version='1.0';const formattedUuid=module.uuid.includes('-')?module.uuid:module.uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12}).*/,'$1-$2-$3-$4-$5');text+=`${('0x' + module.address.toString(16)).padStart(18)} - `;text+=`${('0x' + (module.endAddress - BigInt(1)).toString(16)).padStart(18)}`;text+=`  ${fileName} (${version}) <${formattedUuid}> ${module.name}\n`;}
view.contentElement.createChild('pre','profile-text-view monospace').textContent=text;function printTree(padding,drawGuide,node){const addressText=/0x[0-9a-f]*|[0-9]*/.exec(node.functionName)[0]||'';let module;if(addressText){const address=BigInt(addressText);const pos=modules.upperBound(address,(address,module)=>address-module.address);if(pos>0&&address<modules[pos-1].endAddress){module=modules[pos-1];}}
const functionName=(addressText?node.functionName.substr(addressText.length+1):node.functionName)||'???';text+=`${padding}${Math.round(node.total / 1024)}  ${functionName}  `;if(module){const fileName=/[^/\\]*$/.exec(module.name);if(fileName){text+=`(in ${fileName})  `;}
const offset=BigInt(addressText)-module.address;text+=`load address ${module.baseAddress} + 0x${offset.toString(16)}  `;}
if(addressText){text+=`[${addressText}]`;}
text+='\n';const guideChar=drawGuide?guides[padding.length/2%guides.length]:' ';const nextPadding=padding+guideChar+' ';const sortedChildren=node.children.sort((a,b)=>b.total-a.total);for(const child of sortedChildren){printTree(nextPadding,child!==sortedChildren.peekLast(),child);}}}}
export class SamplingHeapProfileTypeBase extends ProfileType{constructor(typeId,description){super(typeId,description);this._recording=false;}
profileBeingRecorded(){return(super.profileBeingRecorded());}
typeName(){return'Heap';}
fileExtension(){return'.heapprofile';}
get buttonTooltip(){return this._recording?ls`Stop heap profiling`:ls`Start heap profiling`;}
buttonClicked(){if(this._recording){this._stopRecordingProfile();}else{this._startRecordingProfile();}
return this._recording;}
_startRecordingProfile(){const heapProfilerModel=self.UI.context.flavor(SDK.HeapProfilerModel.HeapProfilerModel);if(this.profileBeingRecorded()||!heapProfilerModel){return;}
const profileHeader=new SamplingHeapProfileHeader(heapProfilerModel,this);this.setProfileBeingRecorded(profileHeader);this.addProfile(profileHeader);profileHeader.updateStatus(ls`Recording…`);const icon=UI.Icon.Icon.create('smallicon-warning');icon.title=ls`Heap profiler is recording`;self.UI.inspectorView.setPanelIcon('heap_profiler',icon);this._recording=true;this._startSampling();}
async _stopRecordingProfile(){this._recording=false;if(!this.profileBeingRecorded()||!this.profileBeingRecorded().heapProfilerModel()){return;}
this.profileBeingRecorded().updateStatus(ls`Stopping…`);const profile=await this._stopSampling();const recordedProfile=this.profileBeingRecorded();if(recordedProfile){console.assert(profile);recordedProfile.setProtocolProfile(profile);recordedProfile.updateStatus('');this.setProfileBeingRecorded(null);}
self.UI.inspectorView.setPanelIcon('heap_profiler',null);this.dispatchEventToListeners(ProfileEvents.ProfileComplete,recordedProfile);}
createProfileLoadedFromFile(title){return new SamplingHeapProfileHeader(null,this,title);}
profileBeingRecordedRemoved(){this._stopRecordingProfile();}
_startSampling(){throw'Not implemented';}
_stopSampling(){throw'Not implemented';}}
export class SamplingHeapProfileType extends SamplingHeapProfileTypeBase{constructor(){super(SamplingHeapProfileType.TypeId,ls`Allocation sampling`);SamplingHeapProfileType.instance=this;this._updateTimer=null;this._updateIntervalMs=200;}
get treeItemTitle(){return ls`SAMPLING PROFILES`;}
get description(){return ls`Record memory allocations using sampling method.
              This profile type has minimal performance overhead and can be used for long running operations.
              It provides good approximation of allocations broken down by JavaScript execution stack.`;}
hasTemporaryView(){return Root.Runtime.experiments.isEnabled('samplingHeapProfilerTimeline');}
_startSampling(){this.profileBeingRecorded().heapProfilerModel().startSampling();if(Root.Runtime.experiments.isEnabled('samplingHeapProfilerTimeline')){this._updateTimer=setTimeout(this._updateStats.bind(this),this._updateIntervalMs);}}
_stopSampling(){clearTimeout(this._updateTimer);this._updateTimer=null;this.dispatchEventToListeners(SamplingHeapProfileType.Events.RecordingStopped);return this.profileBeingRecorded().heapProfilerModel().stopSampling();}
async _updateStats(){const profile=await this.profileBeingRecorded().heapProfilerModel().getSamplingProfile();if(!this._updateTimer){return;}
this.dispatchEventToListeners(SamplingHeapProfileType.Events.StatsUpdate,profile);this._updateTimer=setTimeout(this._updateStats.bind(this),this._updateIntervalMs);}}
SamplingHeapProfileType.TypeId='SamplingHeap';SamplingHeapProfileType.Events={RecordingStopped:Symbol('RecordingStopped'),StatsUpdate:Symbol('StatsUpdate')};export class SamplingNativeHeapProfileType extends SamplingHeapProfileTypeBase{constructor(){super(SamplingNativeHeapProfileType.TypeId,ls`Native memory allocation sampling`);SamplingNativeHeapProfileType.instance=this;}
get treeItemTitle(){return ls`NATIVE SAMPLING PROFILES`;}
get description(){return ls`Allocation profiles show sampled native memory allocations from the renderer process.`;}
_startSampling(){this.profileBeingRecorded().heapProfilerModel().startNativeSampling();}
_stopSampling(){return this.profileBeingRecorded().heapProfilerModel().stopNativeSampling();}}
SamplingNativeHeapProfileType.TypeId='SamplingNativeHeapRecording';export class SamplingNativeHeapSnapshotType extends SamplingHeapProfileTypeBase{constructor(processType){super(SamplingNativeHeapSnapshotType.TypeId,ls`Native memory allocation snapshot (${processType})`);}
isInstantProfile(){return true;}
get treeItemTitle(){return ls`NATIVE SNAPSHOTS`;}
get description(){return ls`Native memory snapshots show sampled native allocations in the renderer process since start up.
              Chrome has to be started with --memlog=all flag. Check flags at chrome://flags`;}
buttonClicked(){this._takeSnapshot();return false;}
async _takeSnapshot(){if(this.profileBeingRecorded()){return;}
const heapProfilerModel=self.UI.context.flavor(SDK.HeapProfilerModel.HeapProfilerModel);if(!heapProfilerModel){return;}
const profile=new SamplingHeapProfileHeader(heapProfilerModel,this,ls`Snapshot ${this.nextProfileUid()}`);this.setProfileBeingRecorded(profile);this.addProfile(profile);profile.updateStatus(ls`Snapshotting…`);const protocolProfile=await this._takeNativeSnapshot((heapProfilerModel));const recordedProfile=this.profileBeingRecorded();if(recordedProfile){console.assert(protocolProfile);recordedProfile.setProtocolProfile((protocolProfile));recordedProfile.updateStatus('');this.setProfileBeingRecorded(null);}
this.dispatchEventToListeners(ProfileEvents.ProfileComplete,recordedProfile);}
_takeNativeSnapshot(heapProfilerModel){throw'Not implemented';}}
SamplingNativeHeapSnapshotType.TypeId='SamplingNativeHeapSnapshot';export class SamplingNativeHeapSnapshotBrowserType extends SamplingNativeHeapSnapshotType{constructor(){super(ls`Browser`);SamplingNativeHeapSnapshotBrowserType.instance=this;}
async _takeNativeSnapshot(heapProfilerModel){return await heapProfilerModel.takeNativeBrowserSnapshot();}}
export class SamplingNativeHeapSnapshotRendererType extends SamplingNativeHeapSnapshotType{constructor(){super(ls`Renderer`);SamplingNativeHeapSnapshotRendererType.instance=this;}
async _takeNativeSnapshot(heapProfilerModel){return await heapProfilerModel.takeNativeSnapshot();}}
export class SamplingHeapProfileHeader extends WritableProfileHeader{constructor(heapProfilerModel,type,title){super(heapProfilerModel&&heapProfilerModel.debuggerModel(),type,title||Common.UIString.UIString('Profile %d',type.nextProfileUid()));this._heapProfilerModel=heapProfilerModel;this._protocolProfile=({head:{callFrame:{},children:[]}});}
createView(){return new HeapProfileView(this);}
protocolProfile(){return this._protocolProfile;}
heapProfilerModel(){return this._heapProfilerModel;}}
export class SamplingHeapProfileNode extends SDK.ProfileTreeModel.ProfileNode{constructor(node){const callFrame=node.callFrame||({functionName:node['functionName'],scriptId:node['scriptId'],url:node['url'],lineNumber:node['lineNumber']-1,columnNumber:node['columnNumber']-1});super(callFrame);this.self=node.selfSize;}}
export class SamplingHeapProfileModel extends SDK.ProfileTreeModel.ProfileTreeModel{constructor(profile,minOrdinal,maxOrdinal){super();this.modules=profile.modules||[];let nodeIdToSizeMap=null;if(minOrdinal||maxOrdinal){nodeIdToSizeMap=new Map();minOrdinal=minOrdinal||0;maxOrdinal=maxOrdinal||Infinity;for(const sample of profile.samples){if(sample.ordinal<minOrdinal||sample.ordinal>maxOrdinal){continue;}
const size=nodeIdToSizeMap.get(sample.nodeId)||0;nodeIdToSizeMap.set(sample.nodeId,size+sample.size);}}
this.initialize(translateProfileTree(profile.head));function translateProfileTree(root){const resultRoot=new SamplingHeapProfileNode(root);const sourceNodeStack=[root];const targetNodeStack=[resultRoot];while(sourceNodeStack.length){const sourceNode=sourceNodeStack.pop();const targetNode=targetNodeStack.pop();targetNode.children=sourceNode.children.map(child=>{const targetChild=new SamplingHeapProfileNode(child);if(nodeIdToSizeMap){targetChild.self=nodeIdToSizeMap.get(child.id)||0;}
return targetChild;});sourceNodeStack.push(...sourceNode.children);targetNodeStack.push(...targetNode.children);}
pruneEmptyBranches(resultRoot);return resultRoot;}
function pruneEmptyBranches(node){node.children=node.children.filter(pruneEmptyBranches);return!!(node.children.length||node.self);}}}
export class NodeFormatter{constructor(profileView){this._profileView=profileView;}
formatValue(value){return Number.withThousandsSeparator(value);}
formatValueAccessibleText(value){return ls`${value} bytes`;}
formatPercent(value,node){return Common.UIString.UIString('%.2f\xa0%%',value);}
linkifyNode(node){const heapProfilerModel=this._profileView._profileHeader.heapProfilerModel();const target=heapProfilerModel?heapProfilerModel.target():null;const options={className:'profile-node-file'};return this._profileView.linkifier().maybeLinkifyConsoleCallFrame(target,node.profileNode.callFrame,options);}}
export class HeapFlameChartDataProvider extends ProfileFlameChartDataProvider{constructor(profile,heapProfilerModel){super();this._profile=profile;this._heapProfilerModel=heapProfilerModel;}
minimumBoundary(){return 0;}
totalTime(){return this._profile.root.total;}
formatValue(value,precision){return Common.UIString.UIString('%s\xa0KB',Number.withThousandsSeparator(value/1e3));}
_calculateTimelineData(){function nodesCount(node){return node.children.reduce((count,node)=>count+nodesCount(node),1);}
const count=nodesCount(this._profile.root);const entryNodes=new Array(count);const entryLevels=new Uint16Array(count);const entryTotalTimes=new Float32Array(count);const entryStartTimes=new Float64Array(count);let depth=0;let maxDepth=0;let position=0;let index=0;function addNode(node){const start=position;entryNodes[index]=node;entryLevels[index]=depth;entryTotalTimes[index]=node.total;entryStartTimes[index]=position;++index;++depth;node.children.forEach(addNode);--depth;maxDepth=Math.max(maxDepth,depth);position=start+node.total;}
addNode(this._profile.root);this._maxStackDepth=maxDepth+1;this._entryNodes=entryNodes;this._timelineData=new PerfUI.FlameChart.TimelineData(entryLevels,entryTotalTimes,entryStartTimes,null);return this._timelineData;}
prepareHighlightedEntryInfo(entryIndex){const node=this._entryNodes[entryIndex];if(!node){return null;}
const entryInfo=[];function pushEntryInfoRow(title,value){entryInfo.push({title:title,value:value});}
pushEntryInfoRow(ls`Name`,UI.UIUtils.beautifyFunctionName(node.functionName));pushEntryInfoRow(ls`Self size`,Number.bytesToString(node.self));pushEntryInfoRow(ls`Total size`,Number.bytesToString(node.total));const linkifier=new Components.Linkifier.Linkifier();const link=linkifier.maybeLinkifyConsoleCallFrame(this._heapProfilerModel?this._heapProfilerModel.target():null,node.callFrame);if(link){pushEntryInfoRow(ls`URL`,link.textContent);}
linkifier.dispose();return ProfileView.buildPopoverTable(entryInfo);}}