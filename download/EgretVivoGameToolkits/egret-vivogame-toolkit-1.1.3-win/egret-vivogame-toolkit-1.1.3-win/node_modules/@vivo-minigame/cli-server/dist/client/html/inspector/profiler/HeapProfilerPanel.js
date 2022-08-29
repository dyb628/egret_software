import*as Common from'../common/common.js';import*as Host from'../host/host.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{ProfilesPanel}from'./ProfilesPanel.js';import{instance}from'./ProfileTypeRegistry.js';export class HeapProfilerPanel extends ProfilesPanel{constructor(){const registry=instance;const profileTypes=[registry.heapSnapshotProfileType,registry.trackingHeapSnapshotProfileType,registry.samplingHeapProfileType];if(Root.Runtime.experiments.isEnabled('nativeHeapProfiler')){profileTypes.push(registry.samplingNativeHeapProfileType);profileTypes.push(registry.samplingNativeHeapSnapshotRendererType);profileTypes.push(registry.samplingNativeHeapSnapshotBrowserType);}
super('heap_profiler',profileTypes,'profiler.heap-toggle-recording');}
appendApplicableItems(event,contextMenu,target){if(!(target instanceof SDK.RemoteObject.RemoteObject)){return;}
if(!this.isShowing()){return;}
const object=(target);if(!object.objectId){return;}
const objectId=(object.objectId);const heapProfiles=instance.heapSnapshotProfileType.getProfiles();if(!heapProfiles.length){return;}
const heapProfilerModel=object.runtimeModel().heapProfilerModel();if(!heapProfilerModel){return;}
function revealInView(viewName){heapProfilerModel.snapshotObjectIdForObjectId(objectId).then(result=>{if(this.isShowing()&&result){this.showObject(result,viewName);}});}
contextMenu.revealSection().appendItem(Common.UIString.UIString('Reveal in Summary view'),revealInView.bind(this,'Summary'));}
handleAction(context,actionId){const panel=self.UI.context.flavor(HeapProfilerPanel);console.assert(panel&&panel instanceof HeapProfilerPanel);panel.toggleRecord();return true;}
wasShown(){self.UI.context.setFlavor(HeapProfilerPanel,this);Host.userMetrics.panelLoaded('heap_profiler','DevTools.Launch.HeapProfiler');}
willHide(){self.UI.context.setFlavor(HeapProfilerPanel,null);}
showObject(snapshotObjectId,perspectiveName){const registry=instance;const heapProfiles=registry.heapSnapshotProfileType.getProfiles();for(let i=0;i<heapProfiles.length;i++){const profile=heapProfiles[i];if(profile.maxJSObjectId>=snapshotObjectId){this.showProfile(profile);const view=this.viewForProfile(profile);view.selectLiveObject(perspectiveName,snapshotObjectId);break;}}}}