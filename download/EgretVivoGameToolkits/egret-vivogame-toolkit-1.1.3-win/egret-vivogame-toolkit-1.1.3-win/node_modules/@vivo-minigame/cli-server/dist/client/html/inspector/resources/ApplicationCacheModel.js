import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';export class ApplicationCacheModel extends SDK.SDKModel.SDKModel{constructor(target){super(target);target.registerApplicationCacheDispatcher(new ApplicationCacheDispatcher(this));this._agent=target.applicationCacheAgent();this._agent.enable();const resourceTreeModel=target.model(SDK.ResourceTreeModel.ResourceTreeModel);resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.FrameNavigated,event=>{this._frameNavigated(event);},this);resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.FrameDetached,this._frameDetached,this);this._statuses={};this._manifestURLsByFrame={};this._mainFrameNavigated();this._onLine=true;}
async _frameNavigated(event){const frame=(event.data);if(frame.isMainFrame()){this._mainFrameNavigated();return;}
const frameId=frame.id;const manifestURL=await this._agent.getManifestForFrame(frameId);if(manifestURL!==null&&!manifestURL){this._frameManifestRemoved(frameId);}}
_frameDetached(event){const frame=(event.data);this._frameManifestRemoved(frame.id);}
reset(){this._statuses={};this._manifestURLsByFrame={};this.dispatchEventToListeners(Events.FrameManifestsReset);}
async _mainFrameNavigated(){const framesWithManifests=await this._agent.getFramesWithManifests();for(const frame of framesWithManifests||[]){this._frameManifestUpdated(frame.frameId,frame.manifestURL,frame.status);}}
_frameManifestUpdated(frameId,manifestURL,status){if(status===UNCACHED){this._frameManifestRemoved(frameId);return;}
if(!manifestURL){return;}
if(this._manifestURLsByFrame[frameId]&&manifestURL!==this._manifestURLsByFrame[frameId]){this._frameManifestRemoved(frameId);}
const statusChanged=this._statuses[frameId]!==status;this._statuses[frameId]=status;if(!this._manifestURLsByFrame[frameId]){this._manifestURLsByFrame[frameId]=manifestURL;this.dispatchEventToListeners(Events.FrameManifestAdded,frameId);}
if(statusChanged){this.dispatchEventToListeners(Events.FrameManifestStatusUpdated,frameId);}}
_frameManifestRemoved(frameId){if(!this._manifestURLsByFrame[frameId]){return;}
delete this._manifestURLsByFrame[frameId];delete this._statuses[frameId];this.dispatchEventToListeners(Events.FrameManifestRemoved,frameId);}
frameManifestURL(frameId){return this._manifestURLsByFrame[frameId]||'';}
frameManifestStatus(frameId){return this._statuses[frameId]||UNCACHED;}
get onLine(){return this._onLine;}
_statusUpdated(frameId,manifestURL,status){this._frameManifestUpdated(frameId,manifestURL,status);}
requestApplicationCache(frameId){return this._agent.getApplicationCacheForFrame(frameId);}
_networkStateUpdated(isNowOnline){this._onLine=isNowOnline;this.dispatchEventToListeners(Events.NetworkStateChanged,isNowOnline);}}
SDK.SDKModel.SDKModel.register(ApplicationCacheModel,SDK.SDKModel.Capability.DOM,false);export const Events={FrameManifestStatusUpdated:Symbol('FrameManifestStatusUpdated'),FrameManifestAdded:Symbol('FrameManifestAdded'),FrameManifestRemoved:Symbol('FrameManifestRemoved'),FrameManifestsReset:Symbol('FrameManifestsReset'),NetworkStateChanged:Symbol('NetworkStateChanged')};export class ApplicationCacheDispatcher{constructor(applicationCacheModel){this._applicationCacheModel=applicationCacheModel;}
applicationCacheStatusUpdated(frameId,manifestURL,status){this._applicationCacheModel._statusUpdated(frameId,manifestURL,status);}
networkStateUpdated(isNowOnline){this._applicationCacheModel._networkStateUpdated(isNowOnline);}}
export const UNCACHED=0;export const IDLE=1;export const CHECKING=2;export const DOWNLOADING=3;export const UPDATEREADY=4;export const OBSOLETE=5;