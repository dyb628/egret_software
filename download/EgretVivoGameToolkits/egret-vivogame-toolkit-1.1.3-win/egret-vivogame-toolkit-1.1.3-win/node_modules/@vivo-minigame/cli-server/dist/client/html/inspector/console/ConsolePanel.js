import*as Common from'../common/common.js';import*as UI from'../ui/ui.js';import{ConsoleView}from'./ConsoleView.js';export class ConsolePanel extends UI.Panel.Panel{constructor(){super('console');this._view=ConsoleView.instance();}
static instance(){return(self.runtime.sharedInstance(ConsolePanel));}
static _updateContextFlavor(){const consoleView=ConsolePanel.instance()._view;self.UI.context.setFlavor(ConsoleView,consoleView.isShowing()?consoleView:null);}
wasShown(){super.wasShown();const wrapper=WrapperView._instance;if(wrapper&&wrapper.isShowing()){self.UI.inspectorView.setDrawerMinimized(true);}
this._view.show(this.element);ConsolePanel._updateContextFlavor();}
willHide(){super.willHide();self.UI.inspectorView.setDrawerMinimized(false);if(WrapperView._instance){WrapperView._instance._showViewInWrapper();}
ConsolePanel._updateContextFlavor();}
searchableView(){return ConsoleView.instance().searchableView();}}
export class WrapperView extends UI.Widget.VBox{constructor(){super();this.element.classList.add('console-view-wrapper');WrapperView._instance=this;this._view=ConsoleView.instance();}
wasShown(){if(!ConsolePanel.instance().isShowing()){this._showViewInWrapper();}else{self.UI.inspectorView.setDrawerMinimized(true);}
ConsolePanel._updateContextFlavor();}
willHide(){self.UI.inspectorView.setDrawerMinimized(false);ConsolePanel._updateContextFlavor();}
_showViewInWrapper(){this._view.show(this.element);}}
export class ConsoleRevealer{reveal(object){const consoleView=ConsoleView.instance();if(consoleView.isShowing()){consoleView.focus();return Promise.resolve();}
self.UI.viewManager.showView('console-view');return Promise.resolve();}}