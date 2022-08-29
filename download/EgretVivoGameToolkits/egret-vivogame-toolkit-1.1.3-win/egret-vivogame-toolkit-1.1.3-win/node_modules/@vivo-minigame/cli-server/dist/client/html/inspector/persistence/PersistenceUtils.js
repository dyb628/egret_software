import*as Common from'../common/common.js';import*as Components from'../components/components.js';import*as UI from'../ui/ui.js';import*as Workspace from'../workspace/workspace.js';import{FileSystemWorkspaceBinding}from'./FileSystemWorkspaceBinding.js';import{Events,PersistenceBinding,PersistenceImpl}from'./PersistenceImpl.js';export class PersistenceUtils{static tooltipForUISourceCode(uiSourceCode){const binding=self.Persistence.persistence.binding(uiSourceCode);if(!binding){return'';}
if(uiSourceCode===binding.network){return FileSystemWorkspaceBinding.tooltipForUISourceCode(binding.fileSystem);}
if(binding.network.contentType().isFromSourceMap()){return Common.UIString.UIString('Linked to source map: %s',binding.network.url().trimMiddle(150));}
return Common.UIString.UIString('Linked to %s',binding.network.url().trimMiddle(150));}
static iconForUISourceCode(uiSourceCode){const binding=self.Persistence.persistence.binding(uiSourceCode);if(binding){if(!binding.fileSystem.url().startsWith('file://')){return null;}
const icon=UI.Icon.Icon.create('mediumicon-file-sync');icon.title=PersistenceUtils.tooltipForUISourceCode(binding.network);if(self.Persistence.networkPersistenceManager.project()===binding.fileSystem.project()){icon.style.filter='hue-rotate(160deg)';}
return icon;}
if(uiSourceCode.project().type()!==Workspace.Workspace.projectTypes.FileSystem||!uiSourceCode.url().startsWith('file://')){return null;}
const icon=UI.Icon.Icon.create('mediumicon-file');icon.title=PersistenceUtils.tooltipForUISourceCode(uiSourceCode);return icon;}}
export class LinkDecorator extends Common.ObjectWrapper.ObjectWrapper{constructor(persistence){super();persistence.addEventListener(Events.BindingCreated,this._bindingChanged,this);persistence.addEventListener(Events.BindingRemoved,this._bindingChanged,this);}
_bindingChanged(event){const binding=(event.data);this.dispatchEventToListeners(Components.Linkifier.LinkDecorator.Events.LinkIconChanged,binding.network);}
linkIcon(uiSourceCode){return PersistenceUtils.iconForUISourceCode(uiSourceCode);}}