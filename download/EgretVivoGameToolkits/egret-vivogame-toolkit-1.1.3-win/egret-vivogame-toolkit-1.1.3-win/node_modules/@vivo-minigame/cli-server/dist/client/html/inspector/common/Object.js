import{EventDescriptor,EventTarget,EventTargetEvent}from'./EventTarget.js';let _listenerCallbackTuple;export class ObjectWrapper{constructor(){this._listeners;}
addEventListener(eventType,listener,thisObject){if(!listener){console.assert(false);}
if(!this._listeners){this._listeners=new Map();}
if(!this._listeners.has(eventType)){this._listeners.set(eventType,[]);}
const listenerForEventType=this._listeners.get(eventType);if(listenerForEventType){listenerForEventType.push({thisObject:thisObject,listener:listener,disposed:undefined});}
return{eventTarget:this,eventType:eventType,thisObject:thisObject,listener:listener};}
once(eventType){return new Promise(resolve=>{const descriptor=this.addEventListener(eventType,event=>{this.removeEventListener(eventType,descriptor.listener);resolve(event.data);});});}
removeEventListener(eventType,listener,thisObject){console.assert(listener);if(!this._listeners||!this._listeners.has(eventType)){return;}
const listeners=this._listeners.get(eventType)||[];for(let i=0;i<listeners.length;++i){if(listeners[i].listener===listener&&listeners[i].thisObject===thisObject){listeners[i].disposed=true;listeners.splice(i--,1);}}
if(!listeners.length){this._listeners.delete(eventType);}}
hasEventListeners(eventType){return!!(this._listeners&&this._listeners.has(eventType));}
dispatchEventToListeners(eventType,eventData){if(!this._listeners||!this._listeners.has(eventType)){return;}
const event=({data:eventData});const listeners=this._listeners.get(eventType).slice(0)||[];for(let i=0;i<listeners.length;++i){if(!listeners[i].disposed){listeners[i].listener.call(listeners[i].thisObject,event);}}}}