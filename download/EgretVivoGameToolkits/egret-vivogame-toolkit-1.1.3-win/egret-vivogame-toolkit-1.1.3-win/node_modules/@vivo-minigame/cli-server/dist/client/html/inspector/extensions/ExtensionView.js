import*as UI from'../ui/ui.js';import{ExtensionServer}from'./ExtensionServer.js';export class ExtensionView extends UI.Widget.Widget{constructor(server,id,src,className){super();this.setHideOnDetach();this.element.className='vbox flex-auto';this.element.tabIndex=-1;this._server=server;this._id=id;this._iframe=createElement('iframe');this._iframe.addEventListener('load',this._onLoad.bind(this),false);this._iframe.src=src;this._iframe.className=className;this.setDefaultFocusedElement(this.element);this.element.appendChild(this._iframe);}
wasShown(){if(typeof this._frameIndex==='number'){this._server.notifyViewShown(this._id,this._frameIndex);}}
willHide(){if(typeof this._frameIndex==='number'){this._server.notifyViewHidden(this._id);}}
_onLoad(){const frames=window.frames;this._frameIndex=Array.prototype.indexOf.call(frames,this._iframe.contentWindow);if(this.isShowing()){this._server.notifyViewShown(this._id,this._frameIndex);}}}
export class ExtensionNotifierView extends UI.Widget.VBox{constructor(server,id){super();this._server=server;this._id=id;}
wasShown(){this._server.notifyViewShown(this._id);}
willHide(){this._server.notifyViewHidden(this._id);}}