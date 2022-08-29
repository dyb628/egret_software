import*as Common from'../common/common.js';import*as ProtocolModule from'../protocol/protocol.js';import*as SDK from'../sdk/sdk.js';export class Database{constructor(model,id,domain,name,version){this._model=model;this._id=id;this._domain=domain;this._name=name;this._version=version;}
get id(){return this._id;}
get name(){return this._name;}
set name(x){this._name=x;}
get version(){return this._version;}
set version(x){this._version=x;}
get domain(){return this._domain;}
set domain(x){this._domain=x;}
async tableNames(){const names=await this._model._agent.getDatabaseTableNames(this._id)||[];return names.sort();}
async executeSql(query,onSuccess,onError){const response=await this._model._agent.invoke_executeSQL({'databaseId':this._id,'query':query});const error=response[ProtocolModule.InspectorBackend.ProtocolError];if(error){onError(error);return;}
const sqlError=response.sqlError;if(!sqlError){onSuccess(response.columnNames,response.values);return;}
let message;if(sqlError.message){message=sqlError.message;}else if(sqlError.code===2){message=Common.UIString.UIString('Database no longer has expected version.');}else{message=Common.UIString.UIString('An unexpected error %s occurred.',sqlError.code);}
onError(message);}}
export class DatabaseModel extends SDK.SDKModel.SDKModel{constructor(target){super(target);this._databases=[];this._agent=target.databaseAgent();this.target().registerDatabaseDispatcher(new DatabaseDispatcher(this));}
enable(){if(this._enabled){return;}
this._agent.enable();this._enabled=true;}
disable(){if(!this._enabled){return;}
this._enabled=false;this._databases=[];this._agent.disable();this.dispatchEventToListeners(Events.DatabasesRemoved);}
databases(){const result=[];for(const database of this._databases){result.push(database);}
return result;}
_addDatabase(database){this._databases.push(database);this.dispatchEventToListeners(Events.DatabaseAdded,database);}}
SDK.SDKModel.SDKModel.register(DatabaseModel,SDK.SDKModel.Capability.DOM,false);export const Events={DatabaseAdded:Symbol('DatabaseAdded'),DatabasesRemoved:Symbol('DatabasesRemoved'),};export class DatabaseDispatcher{constructor(model){this._model=model;}
addDatabase(payload){this._model._addDatabase(new Database(this._model,payload.id,payload.domain,payload.name,payload.version));}}