import*as Common from'../common/common.js';import*as UI from'../ui/ui.js';import*as MediaModel from'./MediaModel.js';import*as PlayerListView from'./PlayerListView.js';import*as PlayerDetailView from'./PlayerDetailView.js';export class MainView extends UI.Panel.PanelWithSidebar{constructor(){super('Media');this.registerRequiredCSS('media/mediaView.css');this._detailPanels=new Map();this._deletedPlayers=new Set();this._sidebar=new PlayerListView.PlayerListView(this);this._sidebar.show(this.panelSidebarElement());self.SDK.targetManager.observeModels(MediaModel.MediaModel,this);}
renderChanges(playerID,changes,changeType){if(this._deletedPlayers.has(playerID)){return;}
if(!this._detailPanels.has(playerID)){return;}
this._sidebar.renderChanges(playerID,changes,changeType);this._detailPanels.get(playerID).renderChanges(playerID,changes,changeType);}
renderMainPanel(playerID){if(!this._detailPanels.has(playerID)){return;}
this.splitWidget().mainWidget().detachChildWidgets();this._detailPanels.get(playerID).show(this.mainElement());}
_onPlayerCreated(playerID){this._sidebar.addMediaElementItem(playerID);this._detailPanels.set(playerID,new PlayerDetailView.PlayerDetailView());}
wasShown(){super.wasShown();for(const model of self.SDK.targetManager.models(MediaModel.MediaModel)){this._addEventListeners(model);}}
willHide(){for(const model of self.SDK.targetManager.models(MediaModel.MediaModel)){this._removeEventListeners(model);}}
modelAdded(mediaModel){if(this.isShowing()){this._addEventListeners(mediaModel);}}
modelRemoved(mediaModel){this._removeEventListeners(mediaModel);}
_addEventListeners(mediaModel){mediaModel.ensureEnabled();mediaModel.addEventListener(MediaModel.Events.PlayerPropertiesChanged,this._propertiesChanged,this);mediaModel.addEventListener(MediaModel.Events.PlayerEventsAdded,this._eventsAdded,this);mediaModel.addEventListener(MediaModel.Events.PlayersCreated,this._playersCreated,this);}
_removeEventListeners(mediaModel){mediaModel.removeEventListener(MediaModel.Events.PlayerPropertiesChanged,this._propertiesChanged,this);mediaModel.removeEventListener(MediaModel.Events.PlayerEventsAdded,this._eventsAdded,this);mediaModel.removeEventListener(MediaModel.Events.PlayersCreated,this._playersCreated,this);}
_propertiesChanged(event){this.renderChanges(event.data.playerId,event.data.properties,MediaModel.MediaChangeTypeKeys.Property);}
_eventsAdded(event){this.renderChanges(event.data.playerId,event.data.events,MediaModel.MediaChangeTypeKeys.Event);}
_playersCreated(event){const playerlist=(event.data);for(const playerID of playerlist){this._onPlayerCreated(playerID);}}}