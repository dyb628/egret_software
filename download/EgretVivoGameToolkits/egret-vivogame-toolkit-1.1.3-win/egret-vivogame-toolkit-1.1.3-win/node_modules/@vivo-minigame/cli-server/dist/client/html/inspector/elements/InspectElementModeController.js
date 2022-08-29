import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{ElementsPanel}from'./ElementsPanel.js';export class InspectElementModeController{constructor(){this._toggleSearchAction=self.UI.actionRegistry.action('elements.toggle-element-search');this._mode=Protocol.Overlay.InspectMode.None;self.SDK.targetManager.addEventListener(SDK.SDKModel.Events.SuspendStateChanged,this._suspendStateChanged,this);self.SDK.targetManager.addModelListener(SDK.OverlayModel.OverlayModel,SDK.OverlayModel.Events.ExitedInspectMode,()=>this._setMode(Protocol.Overlay.InspectMode.None));SDK.OverlayModel.OverlayModel.setInspectNodeHandler(this._inspectNode.bind(this));self.SDK.targetManager.observeModels(SDK.OverlayModel.OverlayModel,this);this._showDetailedInspectTooltipSetting=self.Common.settings.moduleSetting('showDetailedInspectTooltip');this._showDetailedInspectTooltipSetting.addChangeListener(this._showDetailedInspectTooltipChanged.bind(this));document.addEventListener('keydown',event=>{if(event.keyCode!==UI.KeyboardShortcut.Keys.Esc.code){return;}
if(!this._isInInspectElementMode()){return;}
this._setMode(Protocol.Overlay.InspectMode.None);event.consume(true);},true);}
modelAdded(overlayModel){if(this._mode===Protocol.Overlay.InspectMode.None){return;}
overlayModel.setInspectMode(this._mode,this._showDetailedInspectTooltipSetting.get());}
modelRemoved(overlayModel){}
_isInInspectElementMode(){return this._mode!==Protocol.Overlay.InspectMode.None;}
_toggleInspectMode(){let mode;if(this._isInInspectElementMode()){mode=Protocol.Overlay.InspectMode.None;}else{mode=self.Common.settings.moduleSetting('showUAShadowDOM').get()?Protocol.Overlay.InspectMode.SearchForUAShadowDOM:Protocol.Overlay.InspectMode.SearchForNode;}
this._setMode(mode);}
_captureScreenshotMode(){this._setMode(Protocol.Overlay.InspectMode.CaptureAreaScreenshot);}
_setMode(mode){if(self.SDK.targetManager.allTargetsSuspended()){return;}
this._mode=mode;for(const overlayModel of self.SDK.targetManager.models(SDK.OverlayModel.OverlayModel)){overlayModel.setInspectMode(mode,this._showDetailedInspectTooltipSetting.get());}
this._toggleSearchAction.setToggled(this._isInInspectElementMode());}
_suspendStateChanged(){if(!self.SDK.targetManager.allTargetsSuspended()){return;}
this._mode=Protocol.Overlay.InspectMode.None;this._toggleSearchAction.setToggled(false);}
async _inspectNode(node){ElementsPanel.instance().revealAndSelectNode(node,true,true);}
_showDetailedInspectTooltipChanged(){this._setMode(this._mode);}}
export class ToggleSearchActionDelegate{handleAction(context,actionId){if(!inspectElementModeController){return false;}
if(actionId==='elements.toggle-element-search'){inspectElementModeController._toggleInspectMode();}else if(actionId==='elements.capture-area-screenshot'){inspectElementModeController._captureScreenshotMode();}
return true;}}
export const inspectElementModeController=Root.Runtime.queryParam('isSharedWorker')?null:new InspectElementModeController();