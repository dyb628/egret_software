import*as SDK from'../sdk/sdk.js';export class BackgroundServiceModel extends SDK.SDKModel.SDKModel{constructor(target){super(target);this._backgroundServiceAgent=target.backgroundServiceAgent();target.registerBackgroundServiceDispatcher(this);this._events=new Map();}
enable(serviceName){this._events.set(serviceName,[]);this._backgroundServiceAgent.startObserving(serviceName);}
setRecording(shouldRecord,serviceName){this._backgroundServiceAgent.setRecording(shouldRecord,serviceName);}
clearEvents(serviceName){this._events.set(serviceName,[]);this._backgroundServiceAgent.clearEvents(serviceName);}
getEvents(serviceName){return this._events.get(serviceName)||[];}
recordingStateChanged(isRecording,serviceName){this.dispatchEventToListeners(Events.RecordingStateChanged,{isRecording,serviceName});}
backgroundServiceEventReceived(backgroundServiceEvent){this._events.get(backgroundServiceEvent.service).push(backgroundServiceEvent);this.dispatchEventToListeners(Events.BackgroundServiceEventReceived,backgroundServiceEvent);}}
SDK.SDKModel.SDKModel.register(BackgroundServiceModel,SDK.SDKModel.Capability.Browser,false);export const Events={RecordingStateChanged:Symbol('RecordingStateChanged'),BackgroundServiceEventReceived:Symbol('BackgroundServiceEventReceived'),};