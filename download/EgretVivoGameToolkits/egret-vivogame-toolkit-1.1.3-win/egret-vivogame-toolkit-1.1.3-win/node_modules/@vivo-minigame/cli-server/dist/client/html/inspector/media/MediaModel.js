import*as SDK from'../sdk/sdk.js';export let Event;export class MediaModel extends SDK.SDKModel.SDKModel{constructor(target){super(target);this._enabled=false;this._agent=target.mediaAgent();target.registerMediaDispatcher(this);}
resumeModel(){if(!this._enabled){return Promise.resolve();}
return this._agent.enable();}
ensureEnabled(){this._agent.enable();this._enabled=true;}
playerPropertiesChanged(playerId,properties){this.dispatchEventToListeners(Events.PlayerPropertiesChanged,{playerId:playerId,properties:properties});}
playerEventsAdded(playerId,events){this.dispatchEventToListeners(Events.PlayerEventsAdded,{playerId:playerId,events:events});}
playersCreated(playerIds){this.dispatchEventToListeners(Events.PlayersCreated,playerIds);}}
SDK.SDKModel.SDKModel.register(MediaModel,SDK.SDKModel.Capability.DOM,false);export const Events={PlayerPropertiesChanged:Symbol('PlayerPropertiesChanged'),PlayerEventsAdded:Symbol('PlayerEventsAdded'),PlayersCreated:Symbol('PlayersCreated')};export const MediaChangeTypeKeys={Event:'Events',Property:'Properties'};