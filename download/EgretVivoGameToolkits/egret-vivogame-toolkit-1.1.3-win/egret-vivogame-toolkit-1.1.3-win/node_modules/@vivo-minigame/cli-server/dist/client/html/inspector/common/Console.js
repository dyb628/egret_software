import{ObjectWrapper}from'./Object.js';import{reveal}from'./Revealer.js';export class Console extends ObjectWrapper{constructor(){super();this._messages=[];}
addMessage(text,level,show){const message=new Message(text,level||MessageLevel.Info,Date.now(),show||false);this._messages.push(message);this.dispatchEventToListeners(Events.MessageAdded,message);}
log(text){this.addMessage(text,MessageLevel.Info);}
warn(text){this.addMessage(text,MessageLevel.Warning);}
error(text){this.addMessage(text,MessageLevel.Error,true);}
messages(){return this._messages;}
show(){this.showPromise();}
showPromise(){return reveal(this);}}
export const Events={MessageAdded:Symbol('messageAdded')};export const MessageLevel={Info:'info',Warning:'warning',Error:'error'};export class Message{constructor(text,level,timestamp,show){this.text=text;this.level=level;this.timestamp=(typeof timestamp==='number')?timestamp:Date.now();this.show=show;}}