import*as Common from'../common/common.js';import*as ProtocolModule from'../protocol/protocol.js';import*as SDK from'../sdk/sdk.js';export class IndexedDBModel extends SDK.SDKModel.SDKModel{constructor(target){super(target);target.registerStorageDispatcher(this);this._securityOriginManager=target.model(SDK.SecurityOriginManager.SecurityOriginManager);this._indexedDBAgent=target.indexedDBAgent();this._storageAgent=target.storageAgent();this._databases=new Map();this._databaseNamesBySecurityOrigin={};this._originsUpdated=new Set();this._throttler=new Common.Throttler.Throttler(1000);}
static keyFromIDBKey(idbKey){if(typeof(idbKey)==='undefined'||idbKey===null){return undefined;}
let type;const key={};switch(typeof(idbKey)){case'number':key.number=idbKey;type=KeyTypes.NumberType;break;case'string':key.string=idbKey;type=KeyTypes.StringType;break;case'object':if(idbKey instanceof Date){key.date=idbKey.getTime();type=KeyTypes.DateType;}else if(Array.isArray(idbKey)){key.array=[];for(let i=0;i<idbKey.length;++i){key.array.push(IndexedDBModel.keyFromIDBKey(idbKey[i]));}
type=KeyTypes.ArrayType;}
break;default:return undefined;}
key.type=(type);return key;}
static _keyRangeFromIDBKeyRange(idbKeyRange){const keyRange={};keyRange.lower=IndexedDBModel.keyFromIDBKey(idbKeyRange.lower);keyRange.upper=IndexedDBModel.keyFromIDBKey(idbKeyRange.upper);keyRange.lowerOpen=!!idbKeyRange.lowerOpen;keyRange.upperOpen=!!idbKeyRange.upperOpen;return keyRange;}
static idbKeyPathFromKeyPath(keyPath){let idbKeyPath;switch(keyPath.type){case KeyPathTypes.NullType:idbKeyPath=null;break;case KeyPathTypes.StringType:idbKeyPath=keyPath.string;break;case KeyPathTypes.ArrayType:idbKeyPath=keyPath.array;break;}
return idbKeyPath;}
static keyPathStringFromIDBKeyPath(idbKeyPath){if(typeof idbKeyPath==='string'){return'"'+idbKeyPath+'"';}
if(idbKeyPath instanceof Array){return'["'+idbKeyPath.join('", "')+'"]';}
return null;}
enable(){if(this._enabled){return;}
this._indexedDBAgent.enable();this._securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.SecurityOriginAdded,this._securityOriginAdded,this);this._securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.SecurityOriginRemoved,this._securityOriginRemoved,this);for(const securityOrigin of this._securityOriginManager.securityOrigins()){this._addOrigin(securityOrigin);}
this._enabled=true;}
clearForOrigin(origin){if(!this._enabled||!this._databaseNamesBySecurityOrigin[origin]){return;}
this._removeOrigin(origin);this._addOrigin(origin);}
async deleteDatabase(databaseId){if(!this._enabled){return;}
await this._indexedDBAgent.deleteDatabase(databaseId.securityOrigin,databaseId.name);this._loadDatabaseNames(databaseId.securityOrigin);}
async refreshDatabaseNames(){for(const securityOrigin in this._databaseNamesBySecurityOrigin){await this._loadDatabaseNames(securityOrigin);}
this.dispatchEventToListeners(Events.DatabaseNamesRefreshed);}
refreshDatabase(databaseId){this._loadDatabase(databaseId,true);}
clearObjectStore(databaseId,objectStoreName){return this._indexedDBAgent.clearObjectStore(databaseId.securityOrigin,databaseId.name,objectStoreName);}
deleteEntries(databaseId,objectStoreName,idbKeyRange){const keyRange=IndexedDBModel._keyRangeFromIDBKeyRange(idbKeyRange);return this._indexedDBAgent.deleteObjectStoreEntries(databaseId.securityOrigin,databaseId.name,objectStoreName,keyRange);}
_securityOriginAdded(event){const securityOrigin=(event.data);this._addOrigin(securityOrigin);}
_securityOriginRemoved(event){const securityOrigin=(event.data);this._removeOrigin(securityOrigin);}
_addOrigin(securityOrigin){console.assert(!this._databaseNamesBySecurityOrigin[securityOrigin]);this._databaseNamesBySecurityOrigin[securityOrigin]=[];this._loadDatabaseNames(securityOrigin);if(this._isValidSecurityOrigin(securityOrigin)){this._storageAgent.trackIndexedDBForOrigin(securityOrigin);}}
_removeOrigin(securityOrigin){console.assert(this._databaseNamesBySecurityOrigin[securityOrigin]);for(let i=0;i<this._databaseNamesBySecurityOrigin[securityOrigin].length;++i){this._databaseRemoved(securityOrigin,this._databaseNamesBySecurityOrigin[securityOrigin][i]);}
delete this._databaseNamesBySecurityOrigin[securityOrigin];if(this._isValidSecurityOrigin(securityOrigin)){this._storageAgent.untrackIndexedDBForOrigin(securityOrigin);}}
_isValidSecurityOrigin(securityOrigin){const parsedURL=Common.ParsedURL.ParsedURL.fromString(securityOrigin);return!!parsedURL&&parsedURL.scheme.startsWith('http');}
_updateOriginDatabaseNames(securityOrigin,databaseNames){const newDatabaseNames=new Set(databaseNames);const oldDatabaseNames=new Set(this._databaseNamesBySecurityOrigin[securityOrigin]);this._databaseNamesBySecurityOrigin[securityOrigin]=databaseNames;for(const databaseName of oldDatabaseNames){if(!newDatabaseNames.has(databaseName)){this._databaseRemoved(securityOrigin,databaseName);}}
for(const databaseName of newDatabaseNames){if(!oldDatabaseNames.has(databaseName)){this._databaseAdded(securityOrigin,databaseName);}}}
databases(){const result=[];for(const securityOrigin in this._databaseNamesBySecurityOrigin){const databaseNames=this._databaseNamesBySecurityOrigin[securityOrigin];for(let i=0;i<databaseNames.length;++i){result.push(new DatabaseId(securityOrigin,databaseNames[i]));}}
return result;}
_databaseAdded(securityOrigin,databaseName){const databaseId=new DatabaseId(securityOrigin,databaseName);this.dispatchEventToListeners(Events.DatabaseAdded,{model:this,databaseId:databaseId});}
_databaseRemoved(securityOrigin,databaseName){const databaseId=new DatabaseId(securityOrigin,databaseName);this.dispatchEventToListeners(Events.DatabaseRemoved,{model:this,databaseId:databaseId});}
async _loadDatabaseNames(securityOrigin){const databaseNames=await this._indexedDBAgent.requestDatabaseNames(securityOrigin);if(!databaseNames){return[];}
if(!this._databaseNamesBySecurityOrigin[securityOrigin]){return[];}
this._updateOriginDatabaseNames(securityOrigin,databaseNames);return databaseNames;}
async _loadDatabase(databaseId,entriesUpdated){const databaseWithObjectStores=await this._indexedDBAgent.requestDatabase(databaseId.securityOrigin,databaseId.name);if(!databaseWithObjectStores){return;}
if(!this._databaseNamesBySecurityOrigin[databaseId.securityOrigin]){return;}
const databaseModel=new Database(databaseId,databaseWithObjectStores.version);this._databases.set(databaseId,databaseModel);for(const objectStore of databaseWithObjectStores.objectStores){const objectStoreIDBKeyPath=IndexedDBModel.idbKeyPathFromKeyPath(objectStore.keyPath);const objectStoreModel=new ObjectStore(objectStore.name,objectStoreIDBKeyPath,objectStore.autoIncrement);for(let j=0;j<objectStore.indexes.length;++j){const index=objectStore.indexes[j];const indexIDBKeyPath=IndexedDBModel.idbKeyPathFromKeyPath(index.keyPath);const indexModel=new Index(index.name,indexIDBKeyPath,index.unique,index.multiEntry);objectStoreModel.indexes[indexModel.name]=indexModel;}
databaseModel.objectStores[objectStoreModel.name]=objectStoreModel;}
this.dispatchEventToListeners(Events.DatabaseLoaded,{model:this,database:databaseModel,entriesUpdated:entriesUpdated});}
loadObjectStoreData(databaseId,objectStoreName,idbKeyRange,skipCount,pageSize,callback){this._requestData(databaseId,databaseId.name,objectStoreName,'',idbKeyRange,skipCount,pageSize,callback);}
loadIndexData(databaseId,objectStoreName,indexName,idbKeyRange,skipCount,pageSize,callback){this._requestData(databaseId,databaseId.name,objectStoreName,indexName,idbKeyRange,skipCount,pageSize,callback);}
async _requestData(databaseId,databaseName,objectStoreName,indexName,idbKeyRange,skipCount,pageSize,callback){const keyRange=idbKeyRange?IndexedDBModel._keyRangeFromIDBKeyRange(idbKeyRange):undefined;const response=await this._indexedDBAgent.invoke_requestData({securityOrigin:databaseId.securityOrigin,databaseName,objectStoreName,indexName,skipCount,pageSize,keyRange});if(response[ProtocolModule.InspectorBackend.ProtocolError]){console.error('IndexedDBAgent error: '+response[ProtocolModule.InspectorBackend.ProtocolError]);return;}
const runtimeModel=this.target().model(SDK.RuntimeModel.RuntimeModel);if(!runtimeModel||!this._databaseNamesBySecurityOrigin[databaseId.securityOrigin]){return;}
const dataEntries=response.objectStoreDataEntries;const entries=[];for(const dataEntry of dataEntries){const key=runtimeModel.createRemoteObject(dataEntry.key);const primaryKey=runtimeModel.createRemoteObject(dataEntry.primaryKey);const value=runtimeModel.createRemoteObject(dataEntry.value);entries.push(new Entry(key,primaryKey,value));}
callback(entries,response.hasMore);}
async getMetadata(databaseId,objectStore){const databaseOrigin=databaseId.securityOrigin;const databaseName=databaseId.name;const objectStoreName=objectStore.name;const response=await this._indexedDBAgent.invoke_getMetadata({securityOrigin:databaseOrigin,databaseName,objectStoreName});if(response[ProtocolModule.InspectorBackend.ProtocolError]){console.error('IndexedDBAgent error: '+response[ProtocolModule.InspectorBackend.ProtocolError]);return null;}
return{entriesCount:response.entriesCount,keyGeneratorValue:response.keyGeneratorValue};}
async _refreshDatabaseList(securityOrigin){const databaseNames=await this._loadDatabaseNames(securityOrigin);for(const databaseName of databaseNames){this._loadDatabase(new DatabaseId(securityOrigin,databaseName),false);}}
indexedDBListUpdated(securityOrigin){this._originsUpdated.add(securityOrigin);this._throttler.schedule(()=>{const promises=Array.from(this._originsUpdated,securityOrigin=>{this._refreshDatabaseList(securityOrigin);});this._originsUpdated.clear();return Promise.all(promises);});}
indexedDBContentUpdated(securityOrigin,databaseName,objectStoreName){const databaseId=new DatabaseId(securityOrigin,databaseName);this.dispatchEventToListeners(Events.IndexedDBContentUpdated,{databaseId:databaseId,objectStoreName:objectStoreName,model:this});}
cacheStorageListUpdated(securityOrigin){}
cacheStorageContentUpdated(securityOrigin){}}
SDK.SDKModel.SDKModel.register(IndexedDBModel,SDK.SDKModel.Capability.Storage,false);export const KeyTypes={NumberType:'number',StringType:'string',DateType:'date',ArrayType:'array'};export const KeyPathTypes={NullType:'null',StringType:'string',ArrayType:'array'};export const Events={DatabaseAdded:Symbol('DatabaseAdded'),DatabaseRemoved:Symbol('DatabaseRemoved'),DatabaseLoaded:Symbol('DatabaseLoaded'),DatabaseNamesRefreshed:Symbol('DatabaseNamesRefreshed'),IndexedDBContentUpdated:Symbol('IndexedDBContentUpdated')};export class Entry{constructor(key,primaryKey,value){this.key=key;this.primaryKey=primaryKey;this.value=value;}}
export class DatabaseId{constructor(securityOrigin,name){this.securityOrigin=securityOrigin;this.name=name;}
equals(databaseId){return this.name===databaseId.name&&this.securityOrigin===databaseId.securityOrigin;}}
export class Database{constructor(databaseId,version){this.databaseId=databaseId;this.version=version;this.objectStores={};}}
export class ObjectStore{constructor(name,keyPath,autoIncrement){this.name=name;this.keyPath=keyPath;this.autoIncrement=autoIncrement;this.indexes={};}
get keyPathString(){return(IndexedDBModel.keyPathStringFromIDBKeyPath((this.keyPath)));}}
export class Index{constructor(name,keyPath,unique,multiEntry){this.name=name;this.keyPath=keyPath;this.unique=unique;this.multiEntry=multiEntry;}
get keyPathString(){return(IndexedDBModel.keyPathStringFromIDBKeyPath((this.keyPath)));}}
export let ObjectStoreMetadata;