import*as Common from'../common/common.js';import*as DataGrid from'../data_grid/data_grid.js';import*as HeapSnapshotModel from'../heap_snapshot_model/heap_snapshot_model.js';import*as Platform from'../platform/platform.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{ChildrenProvider}from'./ChildrenProvider.js';import{AllocationDataGrid,HeapSnapshotConstructorsDataGrid,HeapSnapshotDiffDataGrid,HeapSnapshotRetainmentDataGrid,HeapSnapshotSortableDataGrid,}from'./HeapSnapshotDataGrids.js';import{HeapSnapshotProviderProxy,HeapSnapshotProxy}from'./HeapSnapshotProxy.js';import{DataDisplayDelegate}from'./ProfileHeader.js';export class HeapSnapshotGridNode extends DataGrid.DataGrid.DataGridNode{constructor(tree,hasChildren){super(null,hasChildren);this._dataGrid=tree;this._instanceCount=0;this._savedChildren=null;this._retrievedChildrenRanges=[];this._providerObject=null;this._reachableFromWindow=false;}
static createComparator(fieldNames){return({fieldName1:fieldNames[0],ascending1:fieldNames[1],fieldName2:fieldNames[2],ascending2:fieldNames[3]});}
heapSnapshotDataGrid(){return this._dataGrid;}
createProvider(){throw new Error('Not implemented.');}
retainersDataSource(){return null;}
_provider(){if(!this._providerObject){this._providerObject=this.createProvider();}
return this._providerObject;}
createCell(columnId){const cell=super.createCell(columnId);if(this._searchMatched){cell.classList.add('highlight');}
return cell;}
collapse(){super.collapse();this._dataGrid.updateVisibleNodes(true);}
expand(){super.expand();this._dataGrid.updateVisibleNodes(true);}
dispose(){if(this._providerObject){this._providerObject.dispose();}
for(let node=this.children[0];node;node=node.traverseNextNode(true,this,true)){if(node.dispose){node.dispose();}}}
queryObjectContent(heapProfilerModel,objectGroupName){}
tryQueryObjectContent(heapProfilerModel,objectGroupName){}
populateContextMenu(contextMenu,dataDisplayDelegate,heapProfilerModel){}
_toPercentString(num){return num.toFixed(0)+'\xa0%';}
_toUIDistance(distance){const baseSystemDistance=HeapSnapshotModel.HeapSnapshotModel.baseSystemDistance;return distance>=0&&distance<baseSystemDistance?Common.UIString.UIString('%d',distance):Common.UIString.UIString('\u2212');}
allChildren(){return this._dataGrid.allChildren(this);}
removeChildByIndex(index){this._dataGrid.removeChildByIndex(this,index);}
childForPosition(nodePosition){let indexOfFirstChildInRange=0;for(let i=0;i<this._retrievedChildrenRanges.length;i++){const range=this._retrievedChildrenRanges[i];if(range.from<=nodePosition&&nodePosition<range.to){const childIndex=indexOfFirstChildInRange+nodePosition-range.from;return this.allChildren()[childIndex];}
indexOfFirstChildInRange+=range.to-range.from+1;}
return null;}
_createValueCell(columnId){const cell=UI.Fragment.html`<td class="numeric-column" />`;if(this.dataGrid.snapshot.totalSize!==0){const div=createElement('div');const valueSpan=UI.Fragment.html`<span>${this.data[columnId]}</span>`;div.appendChild(valueSpan);const percentColumn=columnId+'-percent';if(percentColumn in this.data){const percentSpan=UI.Fragment.html`<span class="percent-column">${this.data[percentColumn]}</span>`;div.appendChild(percentSpan);div.classList.add('profile-multiple-values');UI.ARIAUtils.markAsHidden(valueSpan);UI.ARIAUtils.markAsHidden(percentSpan);this.setCellAccessibleName(ls`${this.data[columnId]}, ${this.data[percentColumn]}`,cell,columnId);}
cell.appendChild(div);}
return cell;}
populate(){if(this._populated){return;}
this._populated=true;this._provider().sortAndRewind(this.comparator()).then(()=>this._populateChildren());}
expandWithoutPopulate(){this._populated=true;this.expand();return this._provider().sortAndRewind(this.comparator());}
_populateChildren(fromPosition,toPosition){let afterPopulate;const promise=new Promise(resolve=>afterPopulate=resolve);fromPosition=fromPosition||0;toPosition=toPosition||fromPosition+this._dataGrid.defaultPopulateCount();let firstNotSerializedPosition=fromPosition;serializeNextChunk.call(this);return promise;function serializeNextChunk(){if(firstNotSerializedPosition>=toPosition){return;}
const end=Math.min(firstNotSerializedPosition+this._dataGrid.defaultPopulateCount(),toPosition);this._provider().serializeItemsRange(firstNotSerializedPosition,end).then(childrenRetrieved.bind(this));firstNotSerializedPosition=end;}
function insertRetrievedChild(item,insertionIndex){if(this._savedChildren){const hash=this._childHashForEntity(item);if(hash in this._savedChildren){this._dataGrid.insertChild(this,this._savedChildren[hash],insertionIndex);return;}}
this._dataGrid.insertChild(this,this._createChildNode(item),insertionIndex);}
function insertShowMoreButton(from,to,insertionIndex){const button=new DataGrid.ShowMoreDataGridNode.ShowMoreDataGridNode(this._populateChildren.bind(this),from,to,this._dataGrid.defaultPopulateCount());this._dataGrid.insertChild(this,button,insertionIndex);}
function childrenRetrieved(itemsRange){let itemIndex=0;let itemPosition=itemsRange.startPosition;const items=itemsRange.items;let insertionIndex=0;if(!this._retrievedChildrenRanges.length){if(itemsRange.startPosition>0){this._retrievedChildrenRanges.push({from:0,to:0});insertShowMoreButton.call(this,0,itemsRange.startPosition,insertionIndex++);}
this._retrievedChildrenRanges.push({from:itemsRange.startPosition,to:itemsRange.endPosition});for(let i=0,l=items.length;i<l;++i){insertRetrievedChild.call(this,items[i],insertionIndex++);}
if(itemsRange.endPosition<itemsRange.totalLength){insertShowMoreButton.call(this,itemsRange.endPosition,itemsRange.totalLength,insertionIndex++);}}else{let rangeIndex=0;let found=false;let range;while(rangeIndex<this._retrievedChildrenRanges.length){range=this._retrievedChildrenRanges[rangeIndex];if(range.to>=itemPosition){found=true;break;}
insertionIndex+=range.to-range.from;if(range.to<itemsRange.totalLength){insertionIndex+=1;}
++rangeIndex;}
if(!found||itemsRange.startPosition<range.from){this.allChildren()[insertionIndex-1].setEndPosition(itemsRange.startPosition);insertShowMoreButton.call(this,itemsRange.startPosition,found?range.from:itemsRange.totalLength,insertionIndex);range={from:itemsRange.startPosition,to:itemsRange.startPosition};if(!found){rangeIndex=this._retrievedChildrenRanges.length;}
this._retrievedChildrenRanges.splice(rangeIndex,0,range);}else{insertionIndex+=itemPosition-range.from;}
while(range.to<itemsRange.endPosition){const skipCount=range.to-itemPosition;insertionIndex+=skipCount;itemIndex+=skipCount;itemPosition=range.to;const nextRange=this._retrievedChildrenRanges[rangeIndex+1];let newEndOfRange=nextRange?nextRange.from:itemsRange.totalLength;if(newEndOfRange>itemsRange.endPosition){newEndOfRange=itemsRange.endPosition;}
while(itemPosition<newEndOfRange){insertRetrievedChild.call(this,items[itemIndex++],insertionIndex++);++itemPosition;}
if(nextRange&&newEndOfRange===nextRange.from){range.to=nextRange.to;this.removeChildByIndex(insertionIndex);this._retrievedChildrenRanges.splice(rangeIndex+1,1);}else{range.to=newEndOfRange;if(newEndOfRange===itemsRange.totalLength){this.removeChildByIndex(insertionIndex);}else{this.allChildren()[insertionIndex].setStartPosition(itemsRange.endPosition);}}}}
this._instanceCount+=items.length;if(firstNotSerializedPosition<toPosition){serializeNextChunk.call(this);return;}
if(this.expanded){this._dataGrid.updateVisibleNodes(true);}
afterPopulate();this.dispatchEventToListeners(HeapSnapshotGridNode.Events.PopulateComplete);}}
_saveChildren(){this._savedChildren=null;const children=this.allChildren();for(let i=0,l=children.length;i<l;++i){const child=children[i];if(!child.expanded){continue;}
if(!this._savedChildren){this._savedChildren={};}
this._savedChildren[this._childHashForNode(child)]=child;}}
async sort(){this._dataGrid.recursiveSortingEnter();await this._provider().sortAndRewind(this.comparator());this._saveChildren();this._dataGrid.removeAllChildren(this);this._retrievedChildrenRanges=[];const instanceCount=this._instanceCount;this._instanceCount=0;await this._populateChildren(0,instanceCount);for(const child of this.allChildren()){if(child.expanded){child.sort();}}
this._dataGrid.recursiveSortingLeave();}}
HeapSnapshotGridNode.Events={PopulateComplete:Symbol('PopulateComplete')};export class HeapSnapshotGenericObjectNode extends HeapSnapshotGridNode{constructor(dataGrid,node){super(dataGrid,false);if(!node){return;}
this._name=node.name;this._type=node.type;this._distance=node.distance;this._shallowSize=node.selfSize;this._retainedSize=node.retainedSize;this.snapshotNodeId=node.id;this.snapshotNodeIndex=node.nodeIndex;if(this._type==='string'){this._reachableFromWindow=true;}else if(this._type==='object'&&this._name.startsWith('Window')){this._name=this.shortenWindowURL(this._name,false);this._reachableFromWindow=true;}else if(node.canBeQueried){this._reachableFromWindow=true;}
if(node.detachedDOMTreeNode){this.detachedDOMTreeNode=true;}
const snapshot=dataGrid.snapshot;const shallowSizePercent=this._shallowSize/snapshot.totalSize*100.0;const retainedSizePercent=this._retainedSize/snapshot.totalSize*100.0;this.data={'distance':this._toUIDistance(this._distance),'shallowSize':Number.withThousandsSeparator(this._shallowSize),'retainedSize':Number.withThousandsSeparator(this._retainedSize),'shallowSize-percent':this._toPercentString(shallowSizePercent),'retainedSize-percent':this._toPercentString(retainedSizePercent)};}
retainersDataSource(){return{snapshot:this._dataGrid.snapshot,snapshotNodeIndex:this.snapshotNodeIndex};}
createCell(columnId){const cell=columnId!=='object'?this._createValueCell(columnId):this._createObjectCell();if(this._searchMatched){cell.classList.add('highlight');}
return cell;}
_createObjectCell(){let value=this._name;let valueStyle='object';switch(this._type){case'concatenated string':case'string':value=`"${value}"`;valueStyle='string';break;case'regexp':value=`/${value}/`;valueStyle='string';break;case'closure':value=`${value}()`;valueStyle='function';break;case'bigint':valueStyle='bigint';break;case'number':valueStyle='number';break;case'hidden':valueStyle='null';break;case'array':value=value?`${value}[]`:ls`(internal array)[]`;break;}
return this._createObjectCellWithValue(valueStyle,value);}
_createObjectCellWithValue(valueStyle,value){const fragment=UI.Fragment.Fragment.build`
        <td class="object-column disclosure">
          <div class="source-code event-properties" style="overflow: visible" $="container">
            <span class="value object-value-${valueStyle}">${value}</span>
            <span class="object-value-id">@${this.snapshotNodeId}</span>
          </div>
        </td>`;const div=fragment.$('container');this._prefixObjectCell(div);if(this._reachableFromWindow){div.appendChild(UI.Fragment.html`<span class="heap-object-tag" title="${ls`User object reachable from window`}">🗖</span>`);}
if(this.detachedDOMTreeNode){div.appendChild(UI.Fragment.html`<span class="heap-object-tag" title="${ls`Detached from DOM tree`}">✀</span>`);}
this._appendSourceLocation(div);const cell=fragment.element();if(this.depth){cell.style.setProperty('padding-left',(this.depth*this.dataGrid.indentWidth)+'px');}
cell.heapSnapshotNode=this;return cell;}
_prefixObjectCell(div){}
async _appendSourceLocation(div){const linkContainer=UI.Fragment.html`<span class="heap-object-source-link" />`;div.appendChild(linkContainer);const link=await this._dataGrid.dataDisplayDelegate().linkifyObject(this.snapshotNodeIndex);if(link){linkContainer.appendChild(link);this.linkElement=link;}else{linkContainer.remove();}}
async queryObjectContent(heapProfilerModel,objectGroupName){const remoteObject=await this.tryQueryObjectContent(heapProfilerModel,objectGroupName);return remoteObject||heapProfilerModel.runtimeModel().createRemoteObjectFromPrimitiveValue(ls`Preview is not available`);}
async tryQueryObjectContent(heapProfilerModel,objectGroupName){if(this._type==='string'){return heapProfilerModel.runtimeModel().createRemoteObjectFromPrimitiveValue(this._name);}
return await heapProfilerModel.objectForSnapshotObjectId(String(this.snapshotNodeId),objectGroupName);}
async updateHasChildren(){const isEmpty=await this._provider().isEmpty();this.setHasChildren(!isEmpty);}
shortenWindowURL(fullName,hasObjectId){const startPos=fullName.indexOf('/');const endPos=hasObjectId?fullName.indexOf('@'):fullName.length;if(startPos===-1||endPos===-1){return fullName;}
const fullURL=fullName.substring(startPos+1,endPos).trimLeft();let url=Platform.StringUtilities.trimURL(fullURL);if(url.length>40){url=url.trimMiddle(40);}
return fullName.substr(0,startPos+2)+url+fullName.substr(endPos);}
populateContextMenu(contextMenu,dataDisplayDelegate,heapProfilerModel){contextMenu.revealSection().appendItem(ls`Reveal in Summary view`,()=>{dataDisplayDelegate.showObject(String(this.snapshotNodeId),ls`Summary`);});if(this._referenceName){for(const match of this._referenceName.matchAll(/\((?<objectName>[^@)]*) @(?<snapshotNodeId>\d+)\)/g)){const{objectName,snapshotNodeId}=(match.groups);contextMenu.revealSection().appendItem(ls`Reveal object '${objectName}' with id @${snapshotNodeId} in Summary view`,()=>{dataDisplayDelegate.showObject(snapshotNodeId,ls`Summary`);});}}
if(heapProfilerModel){contextMenu.revealSection().appendItem(ls`Store as global variable`,async()=>{const remoteObject=await this.tryQueryObjectContent((heapProfilerModel),'');if(!remoteObject){self.Common.console.error(ls`Preview is not available`);}else{await self.SDK.consoleModel.saveToTempVariable(self.UI.context.flavor(SDK.RuntimeModel.ExecutionContext),remoteObject);}});}}}
export class HeapSnapshotObjectNode extends HeapSnapshotGenericObjectNode{constructor(dataGrid,snapshot,edge,parentObjectNode){super(dataGrid,edge.node);this._referenceName=edge.name;this._referenceType=edge.type;this._edgeIndex=edge.edgeIndex;this._snapshot=snapshot;this._parentObjectNode=parentObjectNode;this._cycledWithAncestorGridNode=this._findAncestorWithSameSnapshotNodeId();if(!this._cycledWithAncestorGridNode){this.updateHasChildren();}
const data=this.data;data['count']='';data['addedCount']='';data['removedCount']='';data['countDelta']='';data['addedSize']='';data['removedSize']='';data['sizeDelta']='';}
retainersDataSource(){return{snapshot:this._snapshot,snapshotNodeIndex:this.snapshotNodeIndex};}
createProvider(){return this._snapshot.createEdgesProvider(this.snapshotNodeIndex);}
_findAncestorWithSameSnapshotNodeId(){let ancestor=this._parentObjectNode;while(ancestor){if(ancestor.snapshotNodeId===this.snapshotNodeId){return ancestor;}
ancestor=ancestor._parentObjectNode;}
return null;}
_createChildNode(item){return new HeapSnapshotObjectNode(this._dataGrid,this._snapshot,item,this);}
_childHashForEntity(edge){return edge.edgeIndex;}
_childHashForNode(childNode){return childNode._edgeIndex;}
comparator(){const sortAscending=this._dataGrid.isSortOrderAscending();const sortColumnId=this._dataGrid.sortColumnId();const sortFields={object:['!edgeName',sortAscending,'retainedSize',false],count:['!edgeName',true,'retainedSize',false],shallowSize:['selfSize',sortAscending,'!edgeName',true],retainedSize:['retainedSize',sortAscending,'!edgeName',true],distance:['distance',sortAscending,'_name',true]}[sortColumnId]||['!edgeName',true,'retainedSize',false];return HeapSnapshotGridNode.createComparator(sortFields);}
_prefixObjectCell(div){let name=this._referenceName||'(empty)';let nameClass='name';switch(this._referenceType){case'context':nameClass='object-value-number';break;case'internal':case'hidden':case'weak':nameClass='object-value-null';break;case'element':name=`[${name}]`;break;}
if(this._cycledWithAncestorGridNode){div.classList.add('cycled-ancessor-node');}
div.prepend(UI.Fragment.html`<span class="${nameClass}">${name}</span>
                        <span class="grayed">${this._edgeNodeSeparator()}</span>`);}
_edgeNodeSeparator(){return'::';}}
export class HeapSnapshotRetainingObjectNode extends HeapSnapshotObjectNode{constructor(dataGrid,snapshot,edge,parentRetainingObjectNode){super(dataGrid,snapshot,edge,parentRetainingObjectNode);}
createProvider(){return this._snapshot.createRetainingEdgesProvider(this.snapshotNodeIndex);}
_createChildNode(item){return new HeapSnapshotRetainingObjectNode(this._dataGrid,this._snapshot,item,this);}
_edgeNodeSeparator(){return ls`in`;}
expand(){this._expandRetainersChain(20);}
_expandRetainersChain(maxExpandLevels){if(!this._populated){this.once(HeapSnapshotGridNode.Events.PopulateComplete).then(()=>this._expandRetainersChain(maxExpandLevels));this.populate();return;}
super.expand();if(--maxExpandLevels>0&&this.children.length>0){const retainer=this.children[0];if(retainer._distance>1){retainer._expandRetainersChain(maxExpandLevels);return;}}
this._dataGrid.dispatchEventToListeners(HeapSnapshotRetainmentDataGrid.Events.ExpandRetainersComplete);}}
export class HeapSnapshotInstanceNode extends HeapSnapshotGenericObjectNode{constructor(dataGrid,snapshot,node,isDeletedNode){super(dataGrid,node);this._baseSnapshotOrSnapshot=snapshot;this._isDeletedNode=isDeletedNode;this.updateHasChildren();const data=this.data;data['count']='';data['countDelta']='';data['sizeDelta']='';if(this._isDeletedNode){data['addedCount']='';data['addedSize']='';data['removedCount']='\u2022';data['removedSize']=Number.withThousandsSeparator(this._shallowSize);}else{data['addedCount']='\u2022';data['addedSize']=Number.withThousandsSeparator(this._shallowSize);data['removedCount']='';data['removedSize']='';}}
retainersDataSource(){return{snapshot:this._baseSnapshotOrSnapshot,snapshotNodeIndex:this.snapshotNodeIndex};}
createProvider(){return this._baseSnapshotOrSnapshot.createEdgesProvider(this.snapshotNodeIndex);}
_createChildNode(item){return new HeapSnapshotObjectNode(this._dataGrid,this._baseSnapshotOrSnapshot,item,null);}
_childHashForEntity(edge){return edge.edgeIndex;}
_childHashForNode(childNode){return childNode._edgeIndex;}
comparator(){const sortAscending=this._dataGrid.isSortOrderAscending();const sortColumnId=this._dataGrid.sortColumnId();const sortFields={object:['!edgeName',sortAscending,'retainedSize',false],distance:['distance',sortAscending,'retainedSize',false],count:['!edgeName',true,'retainedSize',false],addedSize:['selfSize',sortAscending,'!edgeName',true],removedSize:['selfSize',sortAscending,'!edgeName',true],shallowSize:['selfSize',sortAscending,'!edgeName',true],retainedSize:['retainedSize',sortAscending,'!edgeName',true]}[sortColumnId]||['!edgeName',true,'retainedSize',false];return HeapSnapshotGridNode.createComparator(sortFields);}}
export class HeapSnapshotConstructorNode extends HeapSnapshotGridNode{constructor(dataGrid,className,aggregate,nodeFilter){super(dataGrid,aggregate.count>0);this._name=className;this._nodeFilter=nodeFilter;this._distance=aggregate.distance;this._count=aggregate.count;this._shallowSize=aggregate.self;this._retainedSize=aggregate.maxRet;const snapshot=dataGrid.snapshot;const retainedSizePercent=this._retainedSize/snapshot.totalSize*100.0;const shallowSizePercent=this._shallowSize/snapshot.totalSize*100.0;this.data={'object':className,'count':Number.withThousandsSeparator(this._count),'distance':this._toUIDistance(this._distance),'shallowSize':Number.withThousandsSeparator(this._shallowSize),'retainedSize':Number.withThousandsSeparator(this._retainedSize),'shallowSize-percent':this._toPercentString(shallowSizePercent),'retainedSize-percent':this._toPercentString(retainedSizePercent)};}
createProvider(){return this._dataGrid.snapshot.createNodesProviderForClass(this._name,this._nodeFilter);}
async populateNodeBySnapshotObjectId(snapshotObjectId){this._dataGrid.resetNameFilter();await this.expandWithoutPopulate();const nodePosition=await this._provider().nodePosition(snapshotObjectId);if(nodePosition===-1){this.collapse();return[];}
await this._populateChildren(nodePosition,null);const node=(this.childForPosition(nodePosition));return node?[this,node]:[];}
filteredOut(filterValue){return this._name.toLowerCase().indexOf(filterValue)===-1;}
createCell(columnId){const cell=columnId==='object'?super.createCell(columnId):this._createValueCell(columnId);if(columnId==='object'&&this._count>1){cell.appendChild(UI.Fragment.html`<span class="objects-count">×${this._count}</span>`);}
if(this._searchMatched){cell.classList.add('highlight');}
return cell;}
_createChildNode(item){return new HeapSnapshotInstanceNode(this._dataGrid,this._dataGrid.snapshot,item,false);}
comparator(){const sortAscending=this._dataGrid.isSortOrderAscending();const sortColumnId=this._dataGrid.sortColumnId();const sortFields={object:['name',sortAscending,'id',true],distance:['distance',sortAscending,'retainedSize',false],shallowSize:['selfSize',sortAscending,'id',true],retainedSize:['retainedSize',sortAscending,'id',true]}[sortColumnId];return HeapSnapshotGridNode.createComparator(sortFields);}
_childHashForEntity(node){return node.id;}
_childHashForNode(childNode){return childNode.snapshotNodeId;}}
export class HeapSnapshotDiffNodesProvider{constructor(addedNodesProvider,deletedNodesProvider,addedCount,removedCount){this._addedNodesProvider=addedNodesProvider;this._deletedNodesProvider=deletedNodesProvider;this._addedCount=addedCount;this._removedCount=removedCount;}
dispose(){this._addedNodesProvider.dispose();this._deletedNodesProvider.dispose();}
nodePosition(snapshotObjectId){throw new Error('Unreachable');}
isEmpty(){return Promise.resolve(false);}
async serializeItemsRange(beginPosition,endPosition){let itemsRange;let addedItems;if(beginPosition<this._addedCount){itemsRange=await this._addedNodesProvider.serializeItemsRange(beginPosition,endPosition);for(const item of itemsRange.items){item.isAddedNotRemoved=true;}
if(itemsRange.endPosition>=endPosition){itemsRange.totalLength=this._addedCount+this._removedCount;return itemsRange;}
addedItems=itemsRange;itemsRange=await this._deletedNodesProvider.serializeItemsRange(0,endPosition-itemsRange.endPosition);}else{addedItems=new HeapSnapshotModel.HeapSnapshotModel.ItemsRange(0,0,0,[]);itemsRange=await this._deletedNodesProvider.serializeItemsRange(beginPosition-this._addedCount,endPosition-this._addedCount);}
if(!addedItems.items.length){addedItems.startPosition=this._addedCount+itemsRange.startPosition;}
for(const item of itemsRange.items){item.isAddedNotRemoved=false;}
addedItems.items.push(...itemsRange.items);addedItems.endPosition=this._addedCount+itemsRange.endPosition;addedItems.totalLength=this._addedCount+this._removedCount;return addedItems;}
async sortAndRewind(comparator){await this._addedNodesProvider.sortAndRewind(comparator);await this._deletedNodesProvider.sortAndRewind(comparator);}}
export class HeapSnapshotDiffNode extends HeapSnapshotGridNode{constructor(dataGrid,className,diffForClass){super(dataGrid,true);this._name=className;this._addedCount=diffForClass.addedCount;this._removedCount=diffForClass.removedCount;this._countDelta=diffForClass.countDelta;this._addedSize=diffForClass.addedSize;this._removedSize=diffForClass.removedSize;this._sizeDelta=diffForClass.sizeDelta;this._deletedIndexes=diffForClass.deletedIndexes;this.data={'object':className,'addedCount':Number.withThousandsSeparator(this._addedCount),'removedCount':Number.withThousandsSeparator(this._removedCount),'countDelta':this._signForDelta(this._countDelta)+Number.withThousandsSeparator(Math.abs(this._countDelta)),'addedSize':Number.withThousandsSeparator(this._addedSize),'removedSize':Number.withThousandsSeparator(this._removedSize),'sizeDelta':this._signForDelta(this._sizeDelta)+Number.withThousandsSeparator(Math.abs(this._sizeDelta))};}
createProvider(){const tree=this._dataGrid;return new HeapSnapshotDiffNodesProvider(tree.snapshot.createAddedNodesProvider(tree.baseSnapshot.uid,this._name),tree.baseSnapshot.createDeletedNodesProvider(this._deletedIndexes),this._addedCount,this._removedCount);}
createCell(columnId){const cell=super.createCell(columnId);if(columnId!=='object'){cell.classList.add('numeric-column');}
return cell;}
_createChildNode(item){if(item.isAddedNotRemoved){return new HeapSnapshotInstanceNode(this._dataGrid,this._dataGrid.snapshot,item,false);}
return new HeapSnapshotInstanceNode(this._dataGrid,this._dataGrid.baseSnapshot,item,true);}
_childHashForEntity(node){return node.id;}
_childHashForNode(childNode){return childNode.snapshotNodeId;}
comparator(){const sortAscending=this._dataGrid.isSortOrderAscending();const sortColumnId=this._dataGrid.sortColumnId();const sortFields={object:['name',sortAscending,'id',true],addedCount:['name',true,'id',true],removedCount:['name',true,'id',true],countDelta:['name',true,'id',true],addedSize:['selfSize',sortAscending,'id',true],removedSize:['selfSize',sortAscending,'id',true],sizeDelta:['selfSize',sortAscending,'id',true]}[sortColumnId];return HeapSnapshotGridNode.createComparator(sortFields);}
filteredOut(filterValue){return this._name.toLowerCase().indexOf(filterValue)===-1;}
_signForDelta(delta){if(delta===0){return'';}
if(delta>0){return'+';}
return'\u2212';}}
export class AllocationGridNode extends HeapSnapshotGridNode{constructor(dataGrid,data){super(dataGrid,data.hasChildren);this._populated=false;this._allocationNode=data;this.data={'liveCount':Number.withThousandsSeparator(data.liveCount),'count':Number.withThousandsSeparator(data.count),'liveSize':Number.withThousandsSeparator(data.liveSize),'size':Number.withThousandsSeparator(data.size),'name':data.name};}
populate(){if(this._populated){return;}
this._doPopulate();}
async _doPopulate(){this._populated=true;const callers=await this._dataGrid.snapshot.allocationNodeCallers(this._allocationNode.id);const callersChain=callers.nodesWithSingleCaller;let parentNode=this;const dataGrid=(this._dataGrid);for(const caller of callersChain){const child=new AllocationGridNode(dataGrid,caller);dataGrid.appendNode(parentNode,child);parentNode=child;parentNode._populated=true;if(this.expanded){parentNode.expand();}}
const callersBranch=callers.branchingCallers;callersBranch.sort(this._dataGrid._createComparator());for(const caller of callersBranch){dataGrid.appendNode(parentNode,new AllocationGridNode(dataGrid,caller));}
dataGrid.updateVisibleNodes(true);}
expand(){super.expand();if(this.children.length===1){this.children[0].expand();}}
createCell(columnId){if(columnId!=='name'){return this._createValueCell(columnId);}
const cell=super.createCell(columnId);const allocationNode=this._allocationNode;const heapProfilerModel=this._dataGrid.heapProfilerModel();if(allocationNode.scriptId){const linkifier=this._dataGrid._linkifier;const urlElement=linkifier.linkifyScriptLocation(heapProfilerModel?heapProfilerModel.target():null,String(allocationNode.scriptId),allocationNode.scriptName,allocationNode.line-1,allocationNode.column-1,'profile-node-file');urlElement.style.maxWidth='75%';cell.insertBefore(urlElement,cell.firstChild);}
return cell;}
allocationNodeId(){return this._allocationNode.id;}}