import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{NetworkGroupNode}from'./NetworkDataGridNode.js';import{GroupLookupInterface,NetworkLogView}from'./NetworkLogView.js';export class NetworkFrameGrouper{constructor(parentView){this._parentView=parentView;this._activeGroups=new Map();}
groupNodeForRequest(request){const frame=SDK.ResourceTreeModel.ResourceTreeModel.frameForRequest(request);if(!frame||frame.isTopFrame()){return null;}
let groupNode=this._activeGroups.get(frame);if(groupNode){return groupNode;}
groupNode=new FrameGroupNode(this._parentView,frame);this._activeGroups.set(frame,groupNode);return groupNode;}
reset(){this._activeGroups.clear();}}
export class FrameGroupNode extends NetworkGroupNode{constructor(parentView,frame){super(parentView);this._frame=frame;}
displayName(){return new Common.ParsedURL.ParsedURL(this._frame.url).domain()||this._frame.name||'<iframe>';}
renderCell(cell,columnId){super.renderCell(cell,columnId);const columnIndex=this.dataGrid.indexOfVisibleColumn(columnId);if(columnIndex===0){const name=this.displayName();cell.appendChild(UI.Icon.Icon.create('largeicon-navigator-frame','network-frame-group-icon'));cell.createTextChild(name);cell.title=name;this.setCellAccessibleName(cell.textContent,cell,columnId);}}}