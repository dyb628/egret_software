import*as Common from'../common/common.js';import*as UI from'../ui/ui.js';import{DataDisplayDelegate,Events as ProfileHeaderEvents,ProfileHeader}from'./ProfileHeader.js';export class ProfileSidebarTreeElement extends UI.TreeOutline.TreeElement{constructor(dataDisplayDelegate,profile,className){super('',false);this._iconElement=createElementWithClass('div','icon');this._titlesElement=createElementWithClass('div','titles no-subtitle');this._titleContainer=this._titlesElement.createChild('span','title-container');this.titleElement=this._titleContainer.createChild('span','title');this._subtitleElement=this._titlesElement.createChild('span','subtitle');this.titleElement.textContent=profile.title;this._className=className;this._small=false;this._dataDisplayDelegate=dataDisplayDelegate;this.profile=profile;profile.addEventListener(ProfileHeaderEvents.UpdateStatus,this._updateStatus,this);if(profile.canSaveToFile()){this._createSaveLink();}else{profile.addEventListener(ProfileHeaderEvents.ProfileReceived,this._onProfileReceived,this);}}
_createSaveLink(){this._saveLinkElement=this._titleContainer.createChild('span','save-link');this._saveLinkElement.textContent=Common.UIString.UIString('Save');this._saveLinkElement.addEventListener('click',this._saveProfile.bind(this),false);}
_onProfileReceived(event){this._createSaveLink();}
_updateStatus(event){const statusUpdate=event.data;if(statusUpdate.subtitle!==null){this._subtitleElement.textContent=statusUpdate.subtitle||'';this._titlesElement.classList.toggle('no-subtitle',!statusUpdate.subtitle);}
if(typeof statusUpdate.wait==='boolean'&&this.listItemElement){this.listItemElement.classList.toggle('wait',statusUpdate.wait);}}
ondblclick(event){if(!this._editing){this._startEditing((event.target));}
return false;}
_startEditing(eventTarget){const container=eventTarget.enclosingNodeOrSelfWithClass('title');if(!container){return;}
const config=new UI.InplaceEditor.Config(this._editingCommitted.bind(this),this._editingCancelled.bind(this));this._editing=UI.InplaceEditor.InplaceEditor.startEditing(container,config);}
_editingCommitted(container,newTitle){delete this._editing;this.profile.setTitle(newTitle);}
_editingCancelled(){delete this._editing;}
dispose(){this.profile.removeEventListener(ProfileHeaderEvents.UpdateStatus,this._updateStatus,this);this.profile.removeEventListener(ProfileHeaderEvents.ProfileReceived,this._onProfileReceived,this);}
onselect(){this._dataDisplayDelegate.showProfile(this.profile);return true;}
ondelete(){this.profile.profileType().removeProfile(this.profile);return true;}
onattach(){if(this._className){this.listItemElement.classList.add(this._className);}
if(this._small){this.listItemElement.classList.add('small');}
this.listItemElement.appendChildren(this._iconElement,this._titlesElement);this.listItemElement.addEventListener('contextmenu',this._handleContextMenuEvent.bind(this),true);UI.ARIAUtils.setDescription(this.listItemElement,ls`${this.profile.profileType().name}`);}
_handleContextMenuEvent(event){const profile=this.profile;const contextMenu=new UI.ContextMenu.ContextMenu(event);contextMenu.headerSection().appendItem(Common.UIString.UIString('Load…'),self.Profiler.ProfilesPanel._fileSelectorElement.click.bind(self.Profiler.ProfilesPanel._fileSelectorElement));if(profile.canSaveToFile()){contextMenu.saveSection().appendItem(Common.UIString.UIString('Save…'),profile.saveToFile.bind(profile));}
contextMenu.footerSection().appendItem(Common.UIString.UIString('Delete'),this.ondelete.bind(this));contextMenu.show();}
_saveProfile(event){this.profile.saveToFile();}
setSmall(small){this._small=small;if(this.listItemElement){this.listItemElement.classList.toggle('small',this._small);}}
setMainTitle(title){this.titleElement.textContent=title;}}