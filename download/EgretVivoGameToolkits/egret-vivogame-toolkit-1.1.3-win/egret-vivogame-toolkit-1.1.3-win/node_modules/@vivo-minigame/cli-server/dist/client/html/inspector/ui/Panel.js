import{SearchableView}from'./SearchableView.js';import{SplitWidget}from'./SplitWidget.js';import{VBox}from'./Widget.js';export class Panel extends VBox{constructor(name){super();this.element.classList.add('panel');this.element.setAttribute('aria-label',name);this.element.classList.add(name);this._panelName=name;UI.panels[name]=this;}
get name(){return this._panelName;}
searchableView(){return null;}
elementsToRestoreScrollPositionsFor(){return[];}}
export class PanelWithSidebar extends Panel{constructor(name,defaultWidth){super(name);this._panelSplitWidget=new SplitWidget(true,false,this._panelName+'PanelSplitViewState',defaultWidth||200);this._panelSplitWidget.show(this.element);this._mainWidget=new VBox();this._panelSplitWidget.setMainWidget(this._mainWidget);this._sidebarWidget=new VBox();this._sidebarWidget.setMinimumSize(100,25);this._panelSplitWidget.setSidebarWidget(this._sidebarWidget);this._sidebarWidget.element.classList.add('panel-sidebar');}
panelSidebarElement(){return this._sidebarWidget.element;}
mainElement(){return this._mainWidget.element;}
splitWidget(){return this._panelSplitWidget;}}