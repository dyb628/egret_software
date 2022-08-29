import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{Formatter,ProfileDataGridNode,ProfileDataGridTree}from'./ProfileDataGrid.js';import{TopDownProfileDataGridTree}from'./TopDownProfileDataGrid.js';export class BottomUpProfileDataGridNode extends ProfileDataGridNode{constructor(profileNode,owningTree){super(profileNode,owningTree,!!profileNode.parent&&!!profileNode.parent.parent);this._remainingNodeInfos=[];}
static _sharedPopulate(container){const remainingNodeInfos=container._remainingNodeInfos;const count=remainingNodeInfos.length;for(let index=0;index<count;++index){const nodeInfo=remainingNodeInfos[index];const ancestor=nodeInfo.ancestor;const focusNode=nodeInfo.focusNode;let child=container.findChild(ancestor);if(child){const totalAccountedFor=nodeInfo.totalAccountedFor;child.self+=focusNode.self;if(!totalAccountedFor){child.total+=focusNode.total;}}else{child=new BottomUpProfileDataGridNode(ancestor,(container.tree));if(ancestor!==focusNode){child.self=focusNode.self;child.total=focusNode.total;}
container.appendChild(child);}
const parent=ancestor.parent;if(parent&&parent.parent){nodeInfo.ancestor=parent;child._remainingNodeInfos.push(nodeInfo);}}
delete container._remainingNodeInfos;}
_takePropertiesFromProfileDataGridNode(profileDataGridNode){this.save();this.self=profileDataGridNode.self;this.total=profileDataGridNode.total;}
_keepOnlyChild(child){this.save();this.removeChildren();this.appendChild(child);}
_exclude(aCallUID){if(this._remainingNodeInfos){this.populate();}
this.save();const children=this.children;let index=this.children.length;while(index--){children[index]._exclude(aCallUID);}
const child=this.childrenByCallUID.get(aCallUID);if(child){this.merge(child,true);}}
restore(){super.restore();if(!this.children.length){this.setHasChildren(this._willHaveChildren(this.profileNode));}}
merge(child,shouldAbsorb){this.self-=child.self;super.merge(child,shouldAbsorb);}
populateChildren(){BottomUpProfileDataGridNode._sharedPopulate(this);}
_willHaveChildren(profileNode){return!!(profileNode.parent&&profileNode.parent.parent);}}
export class BottomUpProfileDataGridTree extends ProfileDataGridTree{constructor(formatter,searchableView,rootProfileNode,total){super(formatter,searchableView,total);this.deepSearch=false;let profileNodeUIDs=0;const profileNodeGroups=[[],[rootProfileNode]];const visitedProfileNodesForCallUID=new Map();this._remainingNodeInfos=[];for(let profileNodeGroupIndex=0;profileNodeGroupIndex<profileNodeGroups.length;++profileNodeGroupIndex){const parentProfileNodes=profileNodeGroups[profileNodeGroupIndex];const profileNodes=profileNodeGroups[++profileNodeGroupIndex];const count=profileNodes.length;for(let index=0;index<count;++index){const profileNode=profileNodes[index];if(!profileNode.UID){profileNode.UID=++profileNodeUIDs;}
if(profileNode.parent){let visitedNodes=visitedProfileNodesForCallUID.get(profileNode.callUID);let totalAccountedFor=false;if(!visitedNodes){visitedNodes=new Set();visitedProfileNodesForCallUID.set(profileNode.callUID,visitedNodes);}else{const parentCount=parentProfileNodes.length;for(let parentIndex=0;parentIndex<parentCount;++parentIndex){if(visitedNodes.has(parentProfileNodes[parentIndex].UID)){totalAccountedFor=true;break;}}}
visitedNodes.add(profileNode.UID);this._remainingNodeInfos.push({ancestor:profileNode,focusNode:profileNode,totalAccountedFor:totalAccountedFor});}
const children=profileNode.children;if(children.length){profileNodeGroups.push(parentProfileNodes.concat([profileNode]));profileNodeGroups.push(children);}}}
ProfileDataGridNode.populate(this);return this;}
focus(profileDataGridNode){if(!profileDataGridNode){return;}
this.save();let currentNode=profileDataGridNode;let focusNode=profileDataGridNode;while(currentNode.parent&&(currentNode instanceof ProfileDataGridNode)){currentNode._takePropertiesFromProfileDataGridNode(profileDataGridNode);focusNode=currentNode;currentNode=currentNode.parent;if(currentNode instanceof ProfileDataGridNode){currentNode._keepOnlyChild(focusNode);}}
this.children=[focusNode];this.total=profileDataGridNode.total;}
exclude(profileDataGridNode){if(!profileDataGridNode){return;}
this.save();const excludedCallUID=profileDataGridNode.callUID;const excludedTopLevelChild=this.childrenByCallUID.get(excludedCallUID);if(excludedTopLevelChild){this.children.remove(excludedTopLevelChild);}
const children=this.children;const count=children.length;for(let index=0;index<count;++index){children[index]._exclude(excludedCallUID);}
if(this.lastComparator){this.sort(this.lastComparator,true);}}
populateChildren(){BottomUpProfileDataGridNode._sharedPopulate(this);}}