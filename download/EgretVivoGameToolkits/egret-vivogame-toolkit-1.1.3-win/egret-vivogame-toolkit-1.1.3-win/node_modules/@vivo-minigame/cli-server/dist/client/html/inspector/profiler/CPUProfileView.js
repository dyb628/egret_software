import*as Common from'../common/common.js';import*as Components from'../components/components.js';import*as Host from'../host/host.js';import*as PerfUI from'../perf_ui/perf_ui.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{ProfileFlameChartDataProvider}from'./CPUProfileFlameChart.js';import{Formatter,ProfileDataGridNode}from'./ProfileDataGrid.js';import{ProfileEvents,ProfileHeader,ProfileType}from'./ProfileHeader.js';import{ProfileView,WritableProfileHeader}from'./ProfileView.js';export class CPUProfileView extends ProfileView{constructor(profileHeader){super();this._profileHeader=profileHeader;this.initialize(new NodeFormatter(this));const profile=profileHeader.profileModel();this.adjustedTotal=profile.profileHead.total;this.adjustedTotal-=profile.idleNode?profile.idleNode.total:0;this.setProfile(profile);}
wasShown(){super.wasShown();const lineLevelProfile=self.runtime.sharedInstance(PerfUI.LineLevelProfile.Performance);lineLevelProfile.reset();lineLevelProfile.appendCPUProfile(this._profileHeader.profileModel());}
columnHeader(columnId){switch(columnId){case'self':return Common.UIString.UIString('Self Time');case'total':return Common.UIString.UIString('Total Time');}
return'';}
createFlameChartDataProvider(){return new CPUFlameChartDataProvider(this._profileHeader.profileModel(),this._profileHeader._cpuProfilerModel);}}
export class CPUProfileType extends ProfileType{constructor(){super(CPUProfileType.TypeId,Common.UIString.UIString('Record JavaScript CPU Profile'));this._recording=false;CPUProfileType.instance=this;self.SDK.targetManager.addModelListener(SDK.CPUProfilerModel.CPUProfilerModel,SDK.CPUProfilerModel.Events.ConsoleProfileFinished,this._consoleProfileFinished,this);}
profileBeingRecorded(){return(super.profileBeingRecorded());}
typeName(){return'CPU';}
fileExtension(){return'.cpuprofile';}
get buttonTooltip(){return this._recording?Common.UIString.UIString('Stop CPU profiling'):Common.UIString.UIString('Start CPU profiling');}
buttonClicked(){if(this._recording){this._stopRecordingProfile();return false;}
this._startRecordingProfile();return true;}
get treeItemTitle(){return Common.UIString.UIString('CPU PROFILES');}
get description(){return Common.UIString.UIString('CPU profiles show where the execution time is spent in your page\'s JavaScript functions.');}
_consoleProfileFinished(event){const data=(event.data);const cpuProfile=(data.cpuProfile);const profile=new CPUProfileHeader(data.cpuProfilerModel,this,data.title);profile.setProtocolProfile(cpuProfile);this.addProfile(profile);}
_startRecordingProfile(){const cpuProfilerModel=self.UI.context.flavor(SDK.CPUProfilerModel.CPUProfilerModel);if(this.profileBeingRecorded()||!cpuProfilerModel){return;}
const profile=new CPUProfileHeader(cpuProfilerModel,this);this.setProfileBeingRecorded(profile);self.SDK.targetManager.suspendAllTargets();this.addProfile(profile);profile.updateStatus(Common.UIString.UIString('Recording…'));this._recording=true;cpuProfilerModel.startRecording();Host.userMetrics.actionTaken(Host.UserMetrics.Action.ProfilesCPUProfileTaken);}
async _stopRecordingProfile(){this._recording=false;if(!this.profileBeingRecorded()||!this.profileBeingRecorded()._cpuProfilerModel){return;}
const profile=await this.profileBeingRecorded()._cpuProfilerModel.stopRecording();const recordedProfile=this.profileBeingRecorded();if(recordedProfile){console.assert(profile);recordedProfile.setProtocolProfile(profile);recordedProfile.updateStatus('');this.setProfileBeingRecorded(null);}
await self.SDK.targetManager.resumeAllTargets();this.dispatchEventToListeners(ProfileEvents.ProfileComplete,recordedProfile);}
createProfileLoadedFromFile(title){return new CPUProfileHeader(null,this,title);}
profileBeingRecordedRemoved(){this._stopRecordingProfile();}}
CPUProfileType.TypeId='CPU';export class CPUProfileHeader extends WritableProfileHeader{constructor(cpuProfilerModel,type,title){super(cpuProfilerModel&&cpuProfilerModel.debuggerModel(),type,title);this._cpuProfilerModel=cpuProfilerModel;}
createView(){return new CPUProfileView(this);}
protocolProfile(){return this._protocolProfile;}
profileModel(){return this._profileModel;}
setProfile(profile){const target=this._cpuProfilerModel&&this._cpuProfilerModel.target()||null;this._profileModel=new SDK.CPUProfileDataModel.CPUProfileDataModel(profile,target);}}
export class NodeFormatter{constructor(profileView){this._profileView=profileView;}
formatValue(value){return Common.UIString.UIString('%.1f\xa0ms',value);}
formatValueAccessibleText(value){return this.formatValue(value);}
formatPercent(value,node){return node.profileNode===this._profileView.profile().idleNode?'':Common.UIString.UIString('%.2f\xa0%%',value);}
linkifyNode(node){const cpuProfilerModel=this._profileView._profileHeader._cpuProfilerModel;const target=cpuProfilerModel?cpuProfilerModel.target():null;const options={className:'profile-node-file'};return this._profileView.linkifier().maybeLinkifyConsoleCallFrame(target,node.profileNode.callFrame,options);}}
export class CPUFlameChartDataProvider extends ProfileFlameChartDataProvider{constructor(cpuProfile,cpuProfilerModel){super();this._cpuProfile=cpuProfile;this._cpuProfilerModel=cpuProfilerModel;}
_calculateTimelineData(){const entries=[];const stack=[];let maxDepth=5;function onOpenFrame(){stack.push(entries.length);entries.push(null);}
function onCloseFrame(depth,node,startTime,totalTime,selfTime){const index=stack.pop();entries[index]=new CPUFlameChartDataProvider.ChartEntry(depth,totalTime,startTime,selfTime,node);maxDepth=Math.max(maxDepth,depth);}
this._cpuProfile.forEachFrame(onOpenFrame,onCloseFrame);const entryNodes=new Array(entries.length);const entryLevels=new Uint16Array(entries.length);const entryTotalTimes=new Float32Array(entries.length);const entrySelfTimes=new Float32Array(entries.length);const entryStartTimes=new Float64Array(entries.length);for(let i=0;i<entries.length;++i){const entry=entries[i];entryNodes[i]=entry.node;entryLevels[i]=entry.depth;entryTotalTimes[i]=entry.duration;entryStartTimes[i]=entry.startTime;entrySelfTimes[i]=entry.selfTime;}
this._maxStackDepth=maxDepth+1;this._timelineData=new PerfUI.FlameChart.TimelineData(entryLevels,entryTotalTimes,entryStartTimes,null);this._entryNodes=entryNodes;this._entrySelfTimes=entrySelfTimes;return this._timelineData;}
prepareHighlightedEntryInfo(entryIndex){const timelineData=this._timelineData;const node=this._entryNodes[entryIndex];if(!node){return null;}
const entryInfo=[];function pushEntryInfoRow(title,value){entryInfo.push({title:title,value:value});}
function millisecondsToString(ms){if(ms===0){return'0';}
if(ms<1000){return Common.UIString.UIString('%.1f\xa0ms',ms);}
return Number.secondsToString(ms/1000,true);}
const name=UI.UIUtils.beautifyFunctionName(node.functionName);pushEntryInfoRow(ls`Name`,name);const selfTime=millisecondsToString(this._entrySelfTimes[entryIndex]);const totalTime=millisecondsToString(timelineData.entryTotalTimes[entryIndex]);pushEntryInfoRow(ls`Self time`,selfTime);pushEntryInfoRow(ls`Total time`,totalTime);const linkifier=new Components.Linkifier.Linkifier();const link=linkifier.maybeLinkifyConsoleCallFrame(this._cpuProfilerModel&&this._cpuProfilerModel.target(),node.callFrame);if(link){pushEntryInfoRow(ls`URL`,link.textContent);}
linkifier.dispose();pushEntryInfoRow(ls`Aggregated self time`,Number.secondsToString(node.self/1000,true));pushEntryInfoRow(ls`Aggregated total time`,Number.secondsToString(node.total/1000,true));if(node.deoptReason){pushEntryInfoRow(ls`Not optimized`,node.deoptReason);}
return ProfileView.buildPopoverTable(entryInfo);}}
CPUFlameChartDataProvider.ChartEntry=class{constructor(depth,duration,startTime,selfTime,node){this.depth=depth;this.duration=duration;this.startTime=startTime;this.selfTime=selfTime;this.node=node;}};