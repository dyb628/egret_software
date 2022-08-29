import{TabbedPane}from'./TabbedPane.js';import{ItemsProvider,Toolbar,ToolbarItem,ToolbarMenuButton}from'./Toolbar.js';import{VBox,Widget}from'./Widget.js';export class View{viewId(){}
title(){}
isCloseable(){}
isTransient(){}
toolbarItems(){}
widget(){}
disposeView(){}}
export const _symbol=Symbol('view');export const _widgetSymbol=Symbol('widget');export const widgetSymbol=_widgetSymbol;export class SimpleView extends VBox{constructor(title,isWebComponent){super(isWebComponent);this._title=title;this[_symbol]=this;}
viewId(){return this._title;}
title(){return this._title;}
isCloseable(){return false;}
isTransient(){return false;}
toolbarItems(){return Promise.resolve([]);}
widget(){return((Promise.resolve(this)));}
revealView(){return self.UI.viewManager.revealView(this);}
disposeView(){}}
export class ProvidedView{constructor(extension){this._extension=extension;}
viewId(){return this._extension.descriptor()['id'];}
title(){return this._extension.title();}
isCloseable(){return this._extension.descriptor()['persistence']==='closeable';}
isTransient(){return this._extension.descriptor()['persistence']==='transient';}
toolbarItems(){const actionIds=this._extension.descriptor()['actionIds'];if(actionIds){const result=actionIds.split(',').map(id=>Toolbar.createActionButtonForId(id.trim()));return Promise.resolve(result);}
if(this._extension.descriptor()['hasToolbar']){return this.widget().then(widget=>(widget).toolbarItems());}
return Promise.resolve([]);}
async widget(){this._widgetRequested=true;const widget=await this._extension.instance();if(!(widget instanceof Widget)){throw new Error('view className should point to a UI.Widget');}
widget[_symbol]=this;return((widget));}
async disposeView(){if(!this._widgetRequested){return;}
const widget=await this.widget();widget.ownerViewDisposed();}}
export class ViewLocation{appendApplicableItems(locationName){}
appendView(view,insertBefore){}
showView(view,insertBefore,userGesture){}
removeView(view){}
widget(){}}
export class TabbedViewLocation extends ViewLocation{tabbedPane(){}
enableMoreTabsButton(){}}
export class ViewLocationResolver{resolveLocation(location){}}