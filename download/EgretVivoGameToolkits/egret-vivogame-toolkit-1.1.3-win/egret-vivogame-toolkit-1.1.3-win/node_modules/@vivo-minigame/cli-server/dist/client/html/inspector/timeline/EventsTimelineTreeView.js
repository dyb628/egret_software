import*as Common from'../common/common.js';import*as DataGrid from'../data_grid/data_grid.js';import*as SDK from'../sdk/sdk.js';import*as TimelineModel from'../timeline_model/timeline_model.js';import*as UI from'../ui/ui.js';import{Category,IsLong}from'./TimelineFilters.js';import{TimelineModeViewDelegate,TimelineSelection}from'./TimelinePanel.js';import{TimelineTreeView}from'./TimelineTreeView.js';import{TimelineUIUtils}from'./TimelineUIUtils.js';export class EventsTimelineTreeView extends TimelineTreeView{constructor(delegate){super();this._filtersControl=new Filters();this._filtersControl.addEventListener(Filters.Events.FilterChanged,this._onFilterChanged,this);this.init();this._delegate=delegate;this._dataGrid.markColumnAsSortedBy('startTime',DataGrid.DataGrid.Order.Ascending);this._splitWidget.showBoth();}
filters(){return[...super.filters(),...this._filtersControl.filters()];}
updateContents(selection){super.updateContents(selection);if(selection.type()===TimelineSelection.Type.TraceEvent){const event=(selection.object());this._selectEvent(event,true);}}
getToolbarInputAccessiblePlaceHolder(){return ls`Filter event log`;}
_buildTree(){this._currentTree=this.buildTopDownTree(true,null);return this._currentTree;}
_onFilterChanged(){const selectedEvent=this.lastSelectedNode()&&this.lastSelectedNode().event;this.refreshTree();if(selectedEvent){this._selectEvent(selectedEvent,false);}}
_findNodeWithEvent(event){const iterators=[this._currentTree.children().values()];while(iterators.length){const iterator=iterators.peekLast().next();if(iterator.done){iterators.pop();continue;}
const child=(iterator.value);if(child.event===event){return child;}
iterators.push(child.children().values());}
return null;}
_selectEvent(event,expand){const node=this._findNodeWithEvent(event);if(!node){return;}
this.selectProfileNode(node,false);if(expand){this.dataGridNodeForTreeNode(node).expand();}}
populateColumns(columns){columns.push({id:'startTime',title:Common.UIString.UIString('Start Time'),width:'80px',fixedWidth:true,sortable:true});super.populateColumns(columns);columns.filter(c=>c.fixedWidth).forEach(c=>c.width='80px');}
populateToolbar(toolbar){super.populateToolbar(toolbar);this._filtersControl.populateToolbar(toolbar);}
_showDetailsForNode(node){const traceEvent=node.event;if(!traceEvent){return false;}
TimelineUIUtils.buildTraceEventDetails(traceEvent,this.model().timelineModel(),this._linkifier,false).then(fragment=>this._detailsView.element.appendChild(fragment));return true;}
_onHover(node){this._delegate.highlightEvent(node&&node.event);}}
export class Filters extends Common.ObjectWrapper.ObjectWrapper{constructor(){super();this._categoryFilter=new Category();this._durationFilter=new IsLong();this._filters=[this._categoryFilter,this._durationFilter];}
filters(){return this._filters;}
populateToolbar(toolbar){const durationFilterUI=new UI.Toolbar.ToolbarComboBox(durationFilterChanged.bind(this),ls`Duration filter`);for(const durationMs of Filters._durationFilterPresetsMs){durationFilterUI.addOption(durationFilterUI.createOption(durationMs?Common.UIString.UIString('\u2265 %d\xa0ms',durationMs):Common.UIString.UIString('All'),String(durationMs)));}
toolbar.appendToolbarItem(durationFilterUI);const categoryFiltersUI={};const categories=TimelineUIUtils.categories();for(const categoryName in categories){const category=categories[categoryName];if(!category.visible){continue;}
const checkbox=new UI.Toolbar.ToolbarCheckbox(category.title,undefined,categoriesFilterChanged.bind(this,categoryName));checkbox.setChecked(true);checkbox.inputElement.style.backgroundColor=category.color;categoryFiltersUI[category.name]=checkbox;toolbar.appendToolbarItem(checkbox);}
function durationFilterChanged(){const duration=durationFilterUI.selectedOption().value;const minimumRecordDuration=parseInt(duration,10);this._durationFilter.setMinimumRecordDuration(minimumRecordDuration);this._notifyFiltersChanged();}
function categoriesFilterChanged(name){const categories=TimelineUIUtils.categories();categories[name].hidden=!categoryFiltersUI[name].checked();this._notifyFiltersChanged();}}
_notifyFiltersChanged(){this.dispatchEventToListeners(Filters.Events.FilterChanged);}}
Filters._durationFilterPresetsMs=[0,1,15];Filters.Events={FilterChanged:Symbol('FilterChanged')};