import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{ComputedStyleModel,Events}from'./ComputedStyleModel.js';export class ElementsSidebarPane extends UI.Widget.VBox{constructor(delegatesFocus){super(true,delegatesFocus);this.element.classList.add('flex-none');this._computedStyleModel=new ComputedStyleModel();this._computedStyleModel.addEventListener(Events.ComputedStyleChanged,this.onCSSModelChanged,this);this._updateThrottler=new Common.Throttler.Throttler(100);this._updateWhenVisible=false;}
node(){return this._computedStyleModel.node();}
cssModel(){return this._computedStyleModel.cssModel();}
doUpdate(){return Promise.resolve();}
update(){this._updateWhenVisible=!this.isShowing();if(this._updateWhenVisible){return;}
this._updateThrottler.schedule(innerUpdate.bind(this));function innerUpdate(){return this.isShowing()?this.doUpdate():Promise.resolve();}}
wasShown(){super.wasShown();if(this._updateWhenVisible){this.update();}}
onCSSModelChanged(event){}}