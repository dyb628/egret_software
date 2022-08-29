import*as Bindings from'../bindings/bindings.js';import*as Common from'../common/common.js';import*as Extensions from'../extensions/extensions.js';import*as ProtocolModule from'../protocol/protocol.js';import*as SDK from'../sdk/sdk.js';import*as TimelineModel from'../timeline_model/timeline_model.js';import{ExtensionTracingSession}from'./ExtensionTracingSession.js';import{PerformanceModel}from'./PerformanceModel.js';import{Client as TimelineLoaderClient}from'./TimelineLoader.js';export class TimelineController{constructor(target,client){this._target=target;this._tracingManager=target.model(SDK.TracingManager.TracingManager);this._performanceModel=new PerformanceModel();this._performanceModel.setMainTarget(target);this._client=client;const backingStorage=new Bindings.TempFile.TempFileBackingStorage();this._tracingModel=new SDK.TracingModel.TracingModel(backingStorage);this._extensionSessions=[];self.SDK.targetManager.observeModels(SDK.CPUProfilerModel.CPUProfilerModel,this);}
dispose(){self.SDK.targetManager.unobserveModels(SDK.CPUProfilerModel.CPUProfilerModel,this);}
mainTarget(){return this._target;}
async startRecording(options,providers){this._extensionTraceProviders=self.Extensions.extensionServer.traceProviders().slice();function disabledByDefault(category){return'disabled-by-default-'+category;}
const categoriesArray=['-*','devtools.timeline',disabledByDefault('devtools.timeline'),disabledByDefault('devtools.timeline.frame'),'v8.execute',TimelineModel.TimelineModel.TimelineModelImpl.Category.Console,TimelineModel.TimelineModel.TimelineModelImpl.Category.UserTiming];categoriesArray.push(TimelineModel.TimelineModel.TimelineModelImpl.Category.LatencyInfo);if(Root.Runtime.experiments.isEnabled('timelineFlowEvents')){categoriesArray.push('devtools.timeline.async');}
if(Root.Runtime.experiments.isEnabled('timelineV8RuntimeCallStats')&&options.enableJSSampling){categoriesArray.push(disabledByDefault('v8.runtime_stats_sampling'));}
if(!Root.Runtime.queryParam('timelineTracingJSProfileDisabled')&&options.enableJSSampling){categoriesArray.push(disabledByDefault('v8.cpu_profiler'));if(self.Common.settings.moduleSetting('highResolutionCpuProfiling').get()){categoriesArray.push(disabledByDefault('v8.cpu_profiler.hires'));}}
categoriesArray.push(disabledByDefault('devtools.timeline.stack'));if(Root.Runtime.experiments.isEnabled('timelineInvalidationTracking')){categoriesArray.push(disabledByDefault('devtools.timeline.invalidationTracking'));}
if(options.capturePictures){categoriesArray.push(disabledByDefault('devtools.timeline.layers'),disabledByDefault('devtools.timeline.picture'),disabledByDefault('blink.graphics_context_annotations'));}
if(options.captureFilmStrip){categoriesArray.push(disabledByDefault('devtools.screenshot'));}
this._extensionSessions=providers.map(provider=>new ExtensionTracingSession(provider,this._performanceModel));this._extensionSessions.forEach(session=>session.start());this._performanceModel.setRecordStartTime(Date.now());const response=await this._startRecordingWithCategories(categoriesArray.join(','),options.enableJSSampling);if(response[ProtocolModule.InspectorBackend.ProtocolError]){await this._waitForTracingToStop(false);}
return response;}
async stopRecording(){if(this._tracingManager){this._tracingManager.stop();}
this._client.loadingStarted();await this._waitForTracingToStop(true);this._allSourcesFinished();return this._performanceModel;}
_waitForTracingToStop(awaitTracingCompleteCallback){const tracingStoppedPromises=[];if(this._tracingManager&&awaitTracingCompleteCallback){tracingStoppedPromises.push(new Promise(resolve=>this._tracingCompleteCallback=resolve));}
tracingStoppedPromises.push(this._stopProfilingOnAllModels());const extensionCompletionPromises=this._extensionSessions.map(session=>session.stop());if(extensionCompletionPromises.length){tracingStoppedPromises.push(Promise.race([Promise.all(extensionCompletionPromises),new Promise(r=>setTimeout(r,5000))]));}
return Promise.all(tracingStoppedPromises);}
modelAdded(cpuProfilerModel){if(this._profiling){cpuProfilerModel.startRecording();}}
modelRemoved(cpuProfilerModel){}
_startProfilingOnAllModels(){this._profiling=true;const models=self.SDK.targetManager.models(SDK.CPUProfilerModel.CPUProfilerModel);return Promise.all(models.map(model=>model.startRecording()));}
_addCpuProfile(targetId,cpuProfile){if(!cpuProfile){self.Common.console.warn(Common.UIString.UIString('CPU profile for a target is not available.'));return;}
if(!this._cpuProfiles){this._cpuProfiles=new Map();}
this._cpuProfiles.set(targetId,cpuProfile);}
_stopProfilingOnAllModels(){const models=this._profiling?self.SDK.targetManager.models(SDK.CPUProfilerModel.CPUProfilerModel):[];this._profiling=false;const promises=[];for(const model of models){const targetId=model.target().id();const modelPromise=model.stopRecording().then(this._addCpuProfile.bind(this,targetId));promises.push(modelPromise);}
return Promise.all(promises);}
async _startRecordingWithCategories(categories,enableJSSampling){await self.SDK.targetManager.suspendAllTargets('performance-timeline');if(enableJSSampling&&Root.Runtime.queryParam('timelineTracingJSProfileDisabled')){await this._startProfilingOnAllModels();}
if(!this._tracingManager){return;}
const samplingFrequencyHz=self.Common.settings.moduleSetting('highResolutionCpuProfiling').get()?10000:1000;const options='sampling-frequency='+samplingFrequencyHz;return this._tracingManager.start(this,categories,options);}
traceEventsCollected(events){this._tracingModel.addEvents(events);}
tracingComplete(){this._tracingCompleteCallback();this._tracingCompleteCallback=null;}
_allSourcesFinished(){this._client.processingStarted();setTimeout(()=>this._finalizeTrace(),0);}
async _finalizeTrace(){this._injectCpuProfileEvents();await self.SDK.targetManager.resumeAllTargets();this._tracingModel.tracingComplete();this._client.loadingComplete(this._tracingModel);}
_injectCpuProfileEvent(pid,tid,cpuProfile){if(!cpuProfile){return;}
const cpuProfileEvent=({cat:SDK.TracingModel.DevToolsMetadataEventCategory,ph:SDK.TracingModel.Phase.Instant,ts:this._tracingModel.maximumRecordTime()*1000,pid:pid,tid:tid,name:TimelineModel.TimelineModel.RecordType.CpuProfile,args:{data:{cpuProfile:cpuProfile}}});this._tracingModel.addEvents([cpuProfileEvent]);}
_buildTargetToProcessIdMap(){const metadataEventTypes=TimelineModel.TimelineModel.TimelineModelImpl.DevToolsMetadataEvent;const metadataEvents=this._tracingModel.devToolsMetadataEvents();const browserMetaEvent=metadataEvents.find(e=>e.name===metadataEventTypes.TracingStartedInBrowser);if(!browserMetaEvent){return null;}
const pseudoPidToFrames=new Platform.Multimap();const targetIdToPid=new Map();const frames=browserMetaEvent.args.data['frames'];for(const frameInfo of frames){targetIdToPid.set(frameInfo.frame,frameInfo.processId);}
for(const event of metadataEvents){const data=event.args.data;switch(event.name){case metadataEventTypes.FrameCommittedInBrowser:if(data.processId){targetIdToPid.set(data.frame,data.processId);}else{pseudoPidToFrames.set(data.processPseudoId,data.frame);}
break;case metadataEventTypes.ProcessReadyInBrowser:for(const frame of pseudoPidToFrames.get(data.processPseudoId)||[]){targetIdToPid.set(frame,data.processId);}
break;}}
const mainFrame=frames.find(frame=>!frame.parent);const mainRendererProcessId=mainFrame.processId;const mainProcess=this._tracingModel.processById(mainRendererProcessId);if(mainProcess){targetIdToPid.set(self.SDK.targetManager.mainTarget().id(),mainProcess.id());}
return targetIdToPid;}
_injectCpuProfileEvents(){if(!this._cpuProfiles){return;}
const metadataEventTypes=TimelineModel.TimelineModel.TimelineModelImpl.DevToolsMetadataEvent;const metadataEvents=this._tracingModel.devToolsMetadataEvents();const targetIdToPid=this._buildTargetToProcessIdMap();if(targetIdToPid){for(const[id,profile]of this._cpuProfiles){const pid=targetIdToPid.get(id);if(!pid){continue;}
const process=this._tracingModel.processById(pid);const thread=process&&process.threadByName(TimelineModel.TimelineModel.TimelineModelImpl.RendererMainThreadName);if(thread){this._injectCpuProfileEvent(pid,thread.id(),profile);}}}else{const mainMetaEvent=metadataEvents.filter(event=>event.name===metadataEventTypes.TracingStartedInPage).peekLast();if(mainMetaEvent){const pid=mainMetaEvent.thread.process().id();const mainCpuProfile=this._cpuProfiles.get(this._tracingManager.target().id());this._injectCpuProfileEvent(pid,mainMetaEvent.thread.id(),mainCpuProfile);}else{let tid=0;for(const pair of this._cpuProfiles){const target=self.SDK.targetManager.targetById(pair[0]);const name=target&&target.name();this._tracingModel.addEvents(TimelineModel.TimelineJSProfile.TimelineJSProfileProcessor.buildTraceProfileFromCpuProfile(pair[1],++tid,tid===1,name));}}}
const workerMetaEvents=metadataEvents.filter(event=>event.name===metadataEventTypes.TracingSessionIdForWorker);for(const metaEvent of workerMetaEvents){const workerId=metaEvent.args['data']['workerId'];const cpuProfile=this._cpuProfiles.get(workerId);this._injectCpuProfileEvent(metaEvent.thread.process().id(),metaEvent.args['data']['workerThreadId'],cpuProfile);}
this._cpuProfiles=null;}
tracingBufferUsage(usage){this._client.recordingProgress(usage);}
eventsRetrievalProgress(progress){this._client.loadingProgress(progress);}}
export class Client{recordingProgress(usage){}}
export let RecordingOptions;