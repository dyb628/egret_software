import*as UI from'../ui/ui.js';export class InspectedPagePlaceholder extends UI.Widget.Widget{constructor(){super(true);this.registerRequiredCSS('emulation/inspectedPagePlaceholder.css');self.UI.zoomManager.addEventListener(UI.ZoomManager.Events.ZoomChanged,this.onResize,this);this.restoreMinimumSize();}
onResize(){if(this._updateId){this.element.window().cancelAnimationFrame(this._updateId);}
this._updateId=this.element.window().requestAnimationFrame(this.update.bind(this,false));}
restoreMinimumSize(){this.setMinimumSize(150,150);}
clearMinimumSize(){this.setMinimumSize(1,1);}
_dipPageRect(){const zoomFactor=self.UI.zoomManager.zoomFactor();const rect=this.element.getBoundingClientRect();const bodyRect=this.element.ownerDocument.body.getBoundingClientRect();const left=Math.max(rect.left*zoomFactor,bodyRect.left*zoomFactor);const top=Math.max(rect.top*zoomFactor,bodyRect.top*zoomFactor);const bottom=Math.min(rect.bottom*zoomFactor,bodyRect.bottom*zoomFactor);const right=Math.min(rect.right*zoomFactor,bodyRect.right*zoomFactor);return{x:left,y:top,width:right-left,height:bottom-top};}
update(force){delete this._updateId;const rect=this._dipPageRect();const bounds={x:Math.round(rect.x),y:Math.round(rect.y),height:Math.max(1,Math.round(rect.height)),width:Math.max(1,Math.round(rect.width)),};if(force){--bounds.height;this.dispatchEventToListeners(Events.Update,bounds);++bounds.height;}
this.dispatchEventToListeners(Events.Update,bounds);}}
export const instance=function(){return self.singleton(InspectedPagePlaceholder);};export const Events={Update:Symbol('Update')};