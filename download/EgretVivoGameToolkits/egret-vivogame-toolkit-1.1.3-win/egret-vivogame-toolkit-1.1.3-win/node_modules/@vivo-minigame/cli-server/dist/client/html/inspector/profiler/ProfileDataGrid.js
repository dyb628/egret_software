import*as Common from'../common/common.js';import*as DataGrid from'../data_grid/data_grid.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';export class ProfileDataGridNode extends DataGrid.DataGrid.DataGridNode{constructor(profileNode,owningTree,hasChildren){super(null,hasChildren);this._searchMatchedSelfColumn=false;this._searchMatchedTotalColumn=false;this._searchMatchedFunctionColumn=false;this.profileNode=profileNode;this.tree=owningTree;this.childrenByCallUID=new Map();this.lastComparator=null;this.callUID=profileNode.callUID;this.self=profileNode.self;this.total=profileNode.total;this.functionName=UI.UIUtils.beautifyFunctionName(profileNode.functionName);this._deoptReason=profileNode.deoptReason||'';this.url=profileNode.url;this.linkElement=null;}
static sort(gridNodeGroups,comparator,force){for(let gridNodeGroupIndex=0;gridNodeGroupIndex<gridNodeGroups.length;++gridNodeGroupIndex){const gridNodes=gridNodeGroups[gridNodeGroupIndex];const count=gridNodes.length;for(let index=0;index<count;++index){const gridNode=gridNodes[index];if(!force&&(!gridNode.expanded||gridNode.lastComparator===comparator)){if(gridNode.children.length){gridNode.shouldRefreshChildren=true;}
continue;}
gridNode.lastComparator=comparator;const children=gridNode.children;const childCount=children.length;if(childCount){children.sort(comparator);for(let childIndex=0;childIndex<childCount;++childIndex){children[childIndex].recalculateSiblings(childIndex);}
gridNodeGroups.push(children);}}}}
static merge(container,child,shouldAbsorb){container.self+=child.self;if(!shouldAbsorb){container.total+=child.total;}
let children=container.children.slice();container.removeChildren();let count=children.length;for(let index=0;index<count;++index){if(!shouldAbsorb||children[index]!==child){container.appendChild(children[index]);}}
children=child.children.slice();count=children.length;for(let index=0;index<count;++index){const orphanedChild=children[index];const existingChild=container.childrenByCallUID.get(orphanedChild.callUID);if(existingChild){existingChild.merge((orphanedChild),false);}else{container.appendChild(orphanedChild);}}}
static populate(container){if(container._populated){return;}
container._populated=true;container.populateChildren();const currentComparator=container.tree.lastComparator;if(currentComparator){container.sort(currentComparator,true);}}
createCell(columnId){let cell;switch(columnId){case'self':cell=this._createValueCell(this.self,this.selfPercent,columnId);cell.classList.toggle('highlight',this._searchMatchedSelfColumn);break;case'total':cell=this._createValueCell(this.total,this.totalPercent,columnId);cell.classList.toggle('highlight',this._searchMatchedTotalColumn);break;case'function':cell=this.createTD(columnId);cell.classList.toggle('highlight',this._searchMatchedFunctionColumn);if(this._deoptReason){cell.classList.add('not-optimized');const warningIcon=UI.Icon.Icon.create('smallicon-warning','profile-warn-marker');warningIcon.title=Common.UIString.UIString('Not optimized: %s',this._deoptReason);cell.appendChild(warningIcon);}
cell.createTextChild(this.functionName);if(this.profileNode.scriptId==='0'){break;}
const urlElement=this.tree._formatter.linkifyNode(this);if(!urlElement){break;}
urlElement.style.maxWidth='75%';cell.appendChild(urlElement);this.linkElement=urlElement;break;default:cell=super.createCell(columnId);break;}
return cell;}
_createValueCell(value,percent,columnId){const cell=createElementWithClass('td','numeric-column');const div=cell.createChild('div','profile-multiple-values');const valueSpan=div.createChild('span');const valueText=this.tree._formatter.formatValue(value,this);valueSpan.textContent=valueText;const percentSpan=div.createChild('span','percent-column');const percentText=this.tree._formatter.formatPercent(percent,this);percentSpan.textContent=percentText;const valueAccessibleText=this.tree._formatter.formatValueAccessibleText(value,this);this.setCellAccessibleName(ls`${valueAccessibleText}, ${percentText}`,cell,columnId);return cell;}
sort(comparator,force){return ProfileDataGridNode.sort([[this]],comparator,force);}
insertChild(profileDataGridNode,index){super.insertChild(profileDataGridNode,index);this.childrenByCallUID.set(profileDataGridNode.callUID,(profileDataGridNode));}
removeChild(profileDataGridNode){super.removeChild(profileDataGridNode);this.childrenByCallUID.delete(((profileDataGridNode)).callUID);}
removeChildren(){super.removeChildren();this.childrenByCallUID.clear();}
findChild(node){if(!node){return null;}
return this.childrenByCallUID.get(node.callUID);}
get selfPercent(){return this.self/this.tree.total*100.0;}
get totalPercent(){return this.total/this.tree.total*100.0;}
populate(){ProfileDataGridNode.populate(this);}
populateChildren(){}
save(){if(this._savedChildren){return;}
this._savedSelf=this.self;this._savedTotal=this.total;this._savedChildren=this.children.slice();}
restore(){if(!this._savedChildren){return;}
this.self=this._savedSelf;this.total=this._savedTotal;this.removeChildren();const children=this._savedChildren;const count=children.length;for(let index=0;index<count;++index){children[index].restore();this.appendChild(children[index]);}}
merge(child,shouldAbsorb){ProfileDataGridNode.merge(this,child,shouldAbsorb);}}
export class ProfileDataGridTree{constructor(formatter,searchableView,total){this.tree=this;this.children=[];this._formatter=formatter;this._searchableView=searchableView;this.total=total;this.lastComparator=null;this.childrenByCallUID=new Map();this.deepSearch=true;}
static propertyComparator(property,isAscending){let comparator=ProfileDataGridTree.propertyComparators[(isAscending?1:0)][property];if(!comparator){if(isAscending){comparator=function(lhs,rhs){if(lhs[property]<rhs[property]){return-1;}
if(lhs[property]>rhs[property]){return 1;}
return 0;};}else{comparator=function(lhs,rhs){if(lhs[property]>rhs[property]){return-1;}
if(lhs[property]<rhs[property]){return 1;}
return 0;};}
ProfileDataGridTree.propertyComparators[(isAscending?1:0)][property]=comparator;}
return comparator;}
get expanded(){return true;}
appendChild(child){this.insertChild(child,this.children.length);}
insertChild(child,index){this.children.splice(index,0,child);this.childrenByCallUID.set(child.callUID,child);}
removeChildren(){this.children=[];this.childrenByCallUID.clear();}
populateChildren(){}
findChild(node){if(!node){return null;}
return this.childrenByCallUID.get(node.callUID);}
sort(comparator,force){return ProfileDataGridNode.sort([[this]],comparator,force);}
save(){if(this._savedChildren){return;}
this._savedTotal=this.total;this._savedChildren=this.children.slice();}
restore(){if(!this._savedChildren){return;}
this.children=this._savedChildren;this.total=this._savedTotal;const children=this.children;const count=children.length;for(let index=0;index<count;++index){children[index].restore();}
this._savedChildren=null;}
_matchFunction(searchConfig){const query=searchConfig.query.trim();if(!query.length){return null;}
const greaterThan=(query.startsWith('>'));const lessThan=(query.startsWith('<'));let equalTo=(query.startsWith('=')||((greaterThan||lessThan)&&query.indexOf('=')===1));const percentUnits=(query.endsWith('%'));const millisecondsUnits=(query.length>2&&query.endsWith('ms'));const secondsUnits=(!millisecondsUnits&&query.endsWith('s'));let queryNumber=parseFloat(query);if(greaterThan||lessThan||equalTo){if(equalTo&&(greaterThan||lessThan)){queryNumber=parseFloat(query.substring(2));}else{queryNumber=parseFloat(query.substring(1));}}
const queryNumberMilliseconds=(secondsUnits?(queryNumber*1000):queryNumber);if(!isNaN(queryNumber)&&!(greaterThan||lessThan)){equalTo=true;}
const matcher=createPlainTextSearchRegex(query,'i');function matchesQuery(profileDataGridNode){profileDataGridNode._searchMatchedSelfColumn=false;profileDataGridNode._searchMatchedTotalColumn=false;profileDataGridNode._searchMatchedFunctionColumn=false;if(percentUnits){if(lessThan){if(profileDataGridNode.selfPercent<queryNumber){profileDataGridNode._searchMatchedSelfColumn=true;}
if(profileDataGridNode.totalPercent<queryNumber){profileDataGridNode._searchMatchedTotalColumn=true;}}else if(greaterThan){if(profileDataGridNode.selfPercent>queryNumber){profileDataGridNode._searchMatchedSelfColumn=true;}
if(profileDataGridNode.totalPercent>queryNumber){profileDataGridNode._searchMatchedTotalColumn=true;}}
if(equalTo){if(profileDataGridNode.selfPercent===queryNumber){profileDataGridNode._searchMatchedSelfColumn=true;}
if(profileDataGridNode.totalPercent===queryNumber){profileDataGridNode._searchMatchedTotalColumn=true;}}}else if(millisecondsUnits||secondsUnits){if(lessThan){if(profileDataGridNode.self<queryNumberMilliseconds){profileDataGridNode._searchMatchedSelfColumn=true;}
if(profileDataGridNode.total<queryNumberMilliseconds){profileDataGridNode._searchMatchedTotalColumn=true;}}else if(greaterThan){if(profileDataGridNode.self>queryNumberMilliseconds){profileDataGridNode._searchMatchedSelfColumn=true;}
if(profileDataGridNode.total>queryNumberMilliseconds){profileDataGridNode._searchMatchedTotalColumn=true;}}
if(equalTo){if(profileDataGridNode.self===queryNumberMilliseconds){profileDataGridNode._searchMatchedSelfColumn=true;}
if(profileDataGridNode.total===queryNumberMilliseconds){profileDataGridNode._searchMatchedTotalColumn=true;}}}
if(profileDataGridNode.functionName.match(matcher)||(profileDataGridNode.url&&profileDataGridNode.url.match(matcher))){profileDataGridNode._searchMatchedFunctionColumn=true;}
if(profileDataGridNode._searchMatchedSelfColumn||profileDataGridNode._searchMatchedTotalColumn||profileDataGridNode._searchMatchedFunctionColumn){profileDataGridNode.refresh();return true;}
return false;}
return matchesQuery;}
performSearch(searchConfig,shouldJump,jumpBackwards){this.searchCanceled();const matchesQuery=this._matchFunction(searchConfig);if(!matchesQuery){return;}
this._searchResults=[];const deepSearch=this.deepSearch;for(let current=this.children[0];current;current=current.traverseNextNode(!deepSearch,null,!deepSearch)){if(matchesQuery(current)){this._searchResults.push({profileNode:current});}}
this._searchResultIndex=jumpBackwards?0:this._searchResults.length-1;this._searchableView.updateSearchMatchesCount(this._searchResults.length);this._searchableView.updateCurrentMatchIndex(this._searchResultIndex);}
searchCanceled(){if(this._searchResults){for(let i=0;i<this._searchResults.length;++i){const profileNode=this._searchResults[i].profileNode;profileNode._searchMatchedSelfColumn=false;profileNode._searchMatchedTotalColumn=false;profileNode._searchMatchedFunctionColumn=false;profileNode.refresh();}}
this._searchResults=[];this._searchResultIndex=-1;}
jumpToNextSearchResult(){if(!this._searchResults||!this._searchResults.length){return;}
this._searchResultIndex=(this._searchResultIndex+1)%this._searchResults.length;this._jumpToSearchResult(this._searchResultIndex);}
jumpToPreviousSearchResult(){if(!this._searchResults||!this._searchResults.length){return;}
this._searchResultIndex=(this._searchResultIndex-1+this._searchResults.length)%this._searchResults.length;this._jumpToSearchResult(this._searchResultIndex);}
supportsCaseSensitiveSearch(){return true;}
supportsRegexSearch(){return false;}
_jumpToSearchResult(index){const searchResult=this._searchResults[index];if(!searchResult){return;}
const profileNode=searchResult.profileNode;profileNode.revealAndSelect();this._searchableView.updateCurrentMatchIndex(index);}}
ProfileDataGridTree.propertyComparators=[{},{}];export class Formatter{formatValue(value,node){}
formatValueAccessibleText(value){}
formatPercent(value,node){}
linkifyNode(node){}}