import*as Common from'../common/common.js';import*as HeapSnapshotModel from'../heap_snapshot_model/heap_snapshot_model.js';import{ChildrenProvider}from'./ChildrenProvider.js';export class HeapSnapshotWorkerProxy extends Common.ObjectWrapper.ObjectWrapper{constructor(eventHandler){super();this._eventHandler=eventHandler;this._nextObjectId=1;this._nextCallId=1;this._callbacks=new Map();this._previousCallbacks=new Set();this._worker=new Common.Worker.WorkerWrapper('heap_snapshot_worker_entrypoint');this._worker.onmessage=this._messageReceived.bind(this);}
createLoader(profileUid,snapshotReceivedCallback){const objectId=this._nextObjectId++;const proxy=new HeapSnapshotLoaderProxy(this,objectId,profileUid,snapshotReceivedCallback);this._postMessage({callId:this._nextCallId++,disposition:'create',objectId:objectId,methodName:'HeapSnapshotWorker.HeapSnapshotLoader'});return proxy;}
dispose(){this._worker.terminate();if(this._interval){clearInterval(this._interval);}}
disposeObject(objectId){this._postMessage({callId:this._nextCallId++,disposition:'dispose',objectId:objectId});}
evaluateForTest(script,callback){const callId=this._nextCallId++;this._callbacks.set(callId,callback);this._postMessage({callId:callId,disposition:'evaluateForTest',source:script});}
callFactoryMethod(callback,objectId,methodName,proxyConstructor){const callId=this._nextCallId++;const methodArguments=Array.prototype.slice.call(arguments,4);const newObjectId=this._nextObjectId++;function wrapCallback(remoteResult){callback(remoteResult?new proxyConstructor(this,newObjectId):null);}
if(callback){this._callbacks.set(callId,wrapCallback.bind(this));this._postMessage({callId:callId,disposition:'factory',objectId:objectId,methodName:methodName,methodArguments:methodArguments,newObjectId:newObjectId});return null;}
this._postMessage({callId:callId,disposition:'factory',objectId:objectId,methodName:methodName,methodArguments:methodArguments,newObjectId:newObjectId});return new proxyConstructor(this,newObjectId);}
callMethod(callback,objectId,methodName){const callId=this._nextCallId++;const methodArguments=Array.prototype.slice.call(arguments,3);if(callback){this._callbacks.set(callId,callback);}
this._postMessage({callId:callId,disposition:'method',objectId:objectId,methodName:methodName,methodArguments:methodArguments});}
startCheckingForLongRunningCalls(){if(this._interval){return;}
this._checkLongRunningCalls();this._interval=setInterval(this._checkLongRunningCalls.bind(this),300);}
_checkLongRunningCalls(){for(const callId of this._previousCallbacks){if(!this._callbacks.has(callId)){this._previousCallbacks.delete(callId);}}
const hasLongRunningCalls=!!this._previousCallbacks.size;this.dispatchEventToListeners(HeapSnapshotWorkerProxy.Events.Wait,hasLongRunningCalls);for(const callId of this._callbacks.keys()){this._previousCallbacks.add(callId);}}
_messageReceived(event){const data=event.data;if(data.eventName){if(this._eventHandler){this._eventHandler(data.eventName,data.data);}
return;}
if(data.error){if(data.errorMethodName){self.Common.console.error(Common.UIString.UIString('An error occurred when a call to method \'%s\' was requested',data.errorMethodName));}
self.Common.console.error(data['errorCallStack']);this._callbacks.delete(data.callId);return;}
if(!this._callbacks.has(data.callId)){return;}
const callback=this._callbacks.get(data.callId);this._callbacks.delete(data.callId);callback(data.result);}
_postMessage(message){this._worker.postMessage(message);}}
HeapSnapshotWorkerProxy.Events={Wait:Symbol('Wait')};export class HeapSnapshotProxyObject{constructor(worker,objectId){this._worker=worker;this._objectId=objectId;}
_callWorker(workerMethodName,args){args.splice(1,0,this._objectId);return this._worker[workerMethodName].apply(this._worker,args);}
dispose(){this._worker.disposeObject(this._objectId);}
disposeWorker(){this._worker.dispose();}
callFactoryMethod(callback,methodName,proxyConstructor,var_args){return this._callWorker('callFactoryMethod',Array.prototype.slice.call(arguments,0));}
_callMethodPromise(methodName,var_args){const args=Array.prototype.slice.call(arguments);return new Promise(resolve=>this._callWorker('callMethod',[resolve,...args]));}}
export class HeapSnapshotLoaderProxy extends HeapSnapshotProxyObject{constructor(worker,objectId,profileUid,snapshotReceivedCallback){super(worker,objectId);this._profileUid=profileUid;this._snapshotReceivedCallback=snapshotReceivedCallback;}
write(chunk){return this._callMethodPromise('write',chunk);}
async close(){await this._callMethodPromise('close');const snapshotProxy=await new Promise(resolve=>this.callFactoryMethod(resolve,'buildSnapshot',HeapSnapshotProxy));this.dispose();snapshotProxy.setProfileUid(this._profileUid);await snapshotProxy.updateStaticData();this._snapshotReceivedCallback(snapshotProxy);}}
export class HeapSnapshotProxy extends HeapSnapshotProxyObject{constructor(worker,objectId){super(worker,objectId);this._staticData=null;}
search(searchConfig,filter){return this._callMethodPromise('search',searchConfig,filter);}
aggregatesWithFilter(filter){return this._callMethodPromise('aggregatesWithFilter',filter);}
aggregatesForDiff(){return this._callMethodPromise('aggregatesForDiff');}
calculateSnapshotDiff(baseSnapshotId,baseSnapshotAggregates){return this._callMethodPromise('calculateSnapshotDiff',baseSnapshotId,baseSnapshotAggregates);}
nodeClassName(snapshotObjectId){return this._callMethodPromise('nodeClassName',snapshotObjectId);}
createEdgesProvider(nodeIndex){return this.callFactoryMethod(null,'createEdgesProvider',HeapSnapshotProviderProxy,nodeIndex);}
createRetainingEdgesProvider(nodeIndex){return this.callFactoryMethod(null,'createRetainingEdgesProvider',HeapSnapshotProviderProxy,nodeIndex);}
createAddedNodesProvider(baseSnapshotId,className){return this.callFactoryMethod(null,'createAddedNodesProvider',HeapSnapshotProviderProxy,baseSnapshotId,className);}
createDeletedNodesProvider(nodeIndexes){return this.callFactoryMethod(null,'createDeletedNodesProvider',HeapSnapshotProviderProxy,nodeIndexes);}
createNodesProvider(filter){return this.callFactoryMethod(null,'createNodesProvider',HeapSnapshotProviderProxy,filter);}
createNodesProviderForClass(className,nodeFilter){return this.callFactoryMethod(null,'createNodesProviderForClass',HeapSnapshotProviderProxy,className,nodeFilter);}
allocationTracesTops(){return this._callMethodPromise('allocationTracesTops');}
allocationNodeCallers(nodeId){return this._callMethodPromise('allocationNodeCallers',nodeId);}
allocationStack(nodeIndex){return this._callMethodPromise('allocationStack',nodeIndex);}
dispose(){throw new Error('Should never be called');}
get nodeCount(){return this._staticData.nodeCount;}
get rootNodeIndex(){return this._staticData.rootNodeIndex;}
async updateStaticData(){this._staticData=await this._callMethodPromise('updateStaticData');}
getStatistics(){return this._callMethodPromise('getStatistics');}
getLocation(nodeIndex){return this._callMethodPromise('getLocation',nodeIndex);}
getSamples(){return this._callMethodPromise('getSamples');}
get totalSize(){return this._staticData.totalSize;}
get uid(){return this._profileUid;}
setProfileUid(profileUid){this._profileUid=profileUid;}
maxJSObjectId(){return this._staticData.maxJSObjectId;}}
export class HeapSnapshotProviderProxy extends HeapSnapshotProxyObject{constructor(worker,objectId){super(worker,objectId);}
nodePosition(snapshotObjectId){return this._callMethodPromise('nodePosition',snapshotObjectId);}
isEmpty(){return this._callMethodPromise('isEmpty');}
serializeItemsRange(startPosition,endPosition){return this._callMethodPromise('serializeItemsRange',startPosition,endPosition);}
sortAndRewind(comparator){return this._callMethodPromise('sortAndRewind',comparator);}}