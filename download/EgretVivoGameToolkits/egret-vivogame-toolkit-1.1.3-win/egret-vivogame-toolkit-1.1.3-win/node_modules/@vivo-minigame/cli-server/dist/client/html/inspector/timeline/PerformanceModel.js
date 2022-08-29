import*as Bindings from'../bindings/bindings.js';import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as TimelineModel from'../timeline_model/timeline_model.js';import{TimelineUIUtils}from'./TimelineUIUtils.js';export class PerformanceModel extends Common.ObjectWrapper.ObjectWrapper{constructor(){super();this._mainTarget=null;this._tracingModel=null;this._filters=[];this._timelineModel=new TimelineModel.TimelineModel.TimelineModelImpl();this._frameModel=new TimelineModel.TimelineFrameModel.TimelineFrameModel(event=>TimelineUIUtils.eventStyle(event).category.name);this._filmStripModel=null;this._irModel=new TimelineModel.TimelineIRModel.TimelineIRModel();this._window={left:0,right:Infinity};this._extensionTracingModels=[];this._recordStartTime=undefined;}
setMainTarget(target){this._mainTarget=target;}
mainTarget(){return this._mainTarget;}
setRecordStartTime(time){this._recordStartTime=time;}
recordStartTime(){return this._recordStartTime;}
setFilters(filters){this._filters=filters;}
filters(){return this._filters;}
isVisible(event){return this._filters.every(f=>f.accept(event));}
setTracingModel(model){this._tracingModel=model;this._timelineModel.setEvents(model);let inputEvents=null;let animationEvents=null;for(const track of this._timelineModel.tracks()){if(track.type===TimelineModel.TimelineModel.TrackType.Input){inputEvents=track.asyncEvents;}
if(track.type===TimelineModel.TimelineModel.TrackType.Animation){animationEvents=track.asyncEvents;}}
if(inputEvents||animationEvents){this._irModel.populate(inputEvents||[],animationEvents||[]);}
const mainTracks=this._timelineModel.tracks().filter(track=>track.type===TimelineModel.TimelineModel.TrackType.MainThread&&track.forMainFrame&&track.events.length);const threadData=mainTracks.map(track=>{const event=track.events[0];return{thread:event.thread,time:event.startTime};});this._frameModel.addTraceEvents(this._mainTarget,this._timelineModel.inspectedTargetEvents(),threadData);for(const entry of this._extensionTracingModels){entry.model.adjustTime(this._tracingModel.minimumRecordTime()+(entry.timeOffset/1000)-this._recordStartTime);}
this._autoWindowTimes();}
addExtensionEvents(title,model,timeOffset){this._extensionTracingModels.push({model:model,title:title,timeOffset:timeOffset});if(!this._tracingModel){return;}
model.adjustTime(this._tracingModel.minimumRecordTime()+(timeOffset/1000)-this._recordStartTime);this.dispatchEventToListeners(Events.ExtensionDataAdded);}
tracingModel(){if(!this._tracingModel){throw'call setTracingModel before accessing PerformanceModel';}
return this._tracingModel;}
timelineModel(){return this._timelineModel;}
filmStripModel(){if(this._filmStripModel){return this._filmStripModel;}
if(!this._tracingModel){throw'call setTracingModel before accessing PerformanceModel';}
this._filmStripModel=new SDK.FilmStripModel.FilmStripModel(this._tracingModel);return this._filmStripModel;}
frames(){return this._frameModel.frames();}
frameModel(){return this._frameModel;}
interactionRecords(){return this._irModel.interactionRecords();}
extensionInfo(){return this._extensionTracingModels;}
dispose(){if(this._tracingModel){this._tracingModel.dispose();}
for(const extensionEntry of this._extensionTracingModels){extensionEntry.model.dispose();}}
filmStripModelFrame(frame){const screenshotTime=frame.idle?frame.startTime:frame.endTime;const filmStripFrame=this._filmStripModel.frameByTimestamp(screenshotTime);return filmStripFrame&&filmStripFrame.timestamp-frame.endTime<10?filmStripFrame:null;}
save(stream){const backingStorage=(this._tracingModel.backingStorage());return backingStorage.writeToStream(stream);}
setWindow(window,animate){this._window=window;this.dispatchEventToListeners(Events.WindowChanged,{window,animate});}
window(){return this._window;}
_autoWindowTimes(){const timelineModel=this._timelineModel;let tasks=[];for(const track of timelineModel.tracks()){if(track.type===TimelineModel.TimelineModel.TrackType.MainThread&&track.forMainFrame){tasks=track.tasks;}}
if(!tasks.length){this.setWindow({left:timelineModel.minimumRecordTime(),right:timelineModel.maximumRecordTime()});return;}
function findLowUtilizationRegion(startIndex,stopIndex){const threshold=0.1;let cutIndex=startIndex;let cutTime=(tasks[cutIndex].startTime+tasks[cutIndex].endTime)/2;let usedTime=0;const step=Math.sign(stopIndex-startIndex);for(let i=startIndex;i!==stopIndex;i+=step){const task=tasks[i];const taskTime=(task.startTime+task.endTime)/2;const interval=Math.abs(cutTime-taskTime);if(usedTime<threshold*interval){cutIndex=i;cutTime=taskTime;usedTime=0;}
usedTime+=task.duration;}
return cutIndex;}
const rightIndex=findLowUtilizationRegion(tasks.length-1,0);const leftIndex=findLowUtilizationRegion(0,rightIndex);let leftTime=tasks[leftIndex].startTime;let rightTime=tasks[rightIndex].endTime;const span=rightTime-leftTime;const totalSpan=timelineModel.maximumRecordTime()-timelineModel.minimumRecordTime();if(span<totalSpan*0.1){leftTime=timelineModel.minimumRecordTime();rightTime=timelineModel.maximumRecordTime();}else{leftTime=Math.max(leftTime-0.05*span,timelineModel.minimumRecordTime());rightTime=Math.min(rightTime+0.05*span,timelineModel.maximumRecordTime());}
this.setWindow({left:leftTime,right:rightTime});}}
export const Events={ExtensionDataAdded:Symbol('ExtensionDataAdded'),WindowChanged:Symbol('WindowChanged')};export let Window;