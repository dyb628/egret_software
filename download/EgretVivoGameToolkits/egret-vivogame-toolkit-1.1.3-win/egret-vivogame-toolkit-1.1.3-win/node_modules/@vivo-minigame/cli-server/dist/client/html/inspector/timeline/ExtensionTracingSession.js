import*as Extensions from'../extensions/extensions.js';import*as SDK from'../sdk/sdk.js';import{PerformanceModel}from'./PerformanceModel.js';import{Client,TimelineLoader}from'./TimelineLoader.js';export class ExtensionTracingSession{constructor(provider,performanceModel){this._provider=provider;this._performanceModel=performanceModel;this._completionCallback;this._completionPromise=new Promise(fulfill=>{this._completionCallback=fulfill;});this._timeOffset=0;}
loadingStarted(){}
processingStarted(){}
loadingProgress(progress){}
loadingComplete(tracingModel){if(!tracingModel){return;}
this._performanceModel.addExtensionEvents(this._provider.longDisplayName(),tracingModel,this._timeOffset);this._completionCallback();}
complete(url,timeOffsetMicroseconds){if(!url){this._completionCallback();return;}
this._timeOffset=timeOffsetMicroseconds;TimelineLoader.loadFromURL(url,this);}
start(){this._provider.start(this);}
stop(){this._provider.stop();return this._completionPromise;}}