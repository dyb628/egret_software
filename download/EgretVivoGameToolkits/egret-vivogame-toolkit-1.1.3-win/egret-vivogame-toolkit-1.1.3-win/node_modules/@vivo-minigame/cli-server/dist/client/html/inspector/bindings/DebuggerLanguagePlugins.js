import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as Workspace from'../workspace/workspace.js';class SourceScopeRemoteObject extends SDK.RemoteObject.RemoteObjectImpl{constructor(runtimeModel,type){super(runtimeModel,undefined,'object',undefined,null);this.variables=[];}
async doGetProperties(ownProperties,accessorPropertiesOnly,generatePreview){if(accessorPropertiesOnly){return({properties:[],internalProperties:[]});}
const variableObjects=this.variables.map(v=>new SDK.RemoteObject.RemoteObjectProperty(v.name,new SDK.RemoteObject.LocalJSONObject('(type: '+v.type+')'),false,false,true,false));return({properties:variableObjects,internalProperties:[]});}}
class SourceScope{constructor(callFrame,type){this._callFrame=callFrame;this._type=type;this._object=new SourceScopeRemoteObject(callFrame.debuggerModel.runtimeModel(),type);this._name=type;this._startLocation=null;this._endLocation=null;}
callFrame(){return this._callFrame;}
type(){return this._type;}
typeName(){return this.type();}
name(){return this._name;}
startLocation(){return this._startLocation;}
endLocation(){return this._endLocation;}
object(){return this._object;}
description(){return this.type();}}
export class DebuggerLanguagePluginManager{constructor(debuggerModel,workspace,debuggerWorkspaceBinding){this._sourceMapManager=debuggerModel.sourceMapManager();this._debuggerModel=debuggerModel;this._debuggerWorkspaceBinding=debuggerWorkspaceBinding;this._plugins=[];this._uiSourceCodes=new Map();this._pluginForScriptId=new Map();const target=this._debuggerModel.target();this._project=new Bindings.ContentProviderBasedProject(workspace,'language_plugins::'+target.id(),Workspace.Workspace.projectTypes.Network,'',false);Bindings.NetworkProject.setTargetForProject(this._project,target);const runtimeModel=debuggerModel.runtimeModel();this._eventHandlers=[this._debuggerModel.addEventListener(SDK.DebuggerModel.Events.ParsedScriptSource,this._newScriptSourceListener,this),runtimeModel.addEventListener(SDK.RuntimeModel.Events.ExecutionContextDestroyed,this._executionContextDestroyed,this)];}
addPlugin(plugin){this._plugins.push(plugin);}
rawLocationToUILocation(rawLocation){const script=rawLocation.script();if(!script){return null;}
const plugin=this._pluginForScriptId.get(script.scriptId);if(!plugin){return null;}
const pluginLocation={rawModuleId:script.scriptId,codeOffset:rawLocation.columnNumber-script.columnOffset};const sourceLocations=plugin.rawLocationToSourceLocation(pluginLocation);if(!sourceLocations||sourceLocations.length===0){return null;}
const sourceLocation=sourceLocations[0];const sourceFileURL=DebuggerLanguagePluginManager._makeUISourceFileURL(sourceLocation.sourceFile,new URL(script.sourceURL).origin);if(sourceFileURL===null){return null;}
const uiSourceCode=this._project.uiSourceCodeForURL(sourceFileURL.toString());if(!uiSourceCode){return null;}
return uiSourceCode.uiLocation(sourceLocation.lineNumber,sourceLocation.columnNumber);}
async uiLocationToRawLocations(uiSourceCode,lineNumber,columnNumber){const locations=[];for(const[sourceFile,script]of this._uiSourceCodes.get(uiSourceCode)||[]){const plugin=this._pluginForScriptId.get(script.scriptId);if(!plugin){continue;}
locations.push(...getLocations(this._debuggerModel,plugin,sourceFile,script));}
return locations;function getLocations(debuggerModel,plugin,sourceFile,script){const pluginLocation={rawModuleId:script.scriptId,sourceFile:sourceFile,lineNumber:lineNumber,columnNumber:columnNumber};const rawLocations=plugin.sourceLocationToRawLocation(pluginLocation);if(!rawLocations||rawLocations.length===0){return[];}
return rawLocations.map(m=>new SDK.DebuggerModel.Location(debuggerModel,script.scriptId,0,Number(m.codeOffset)+script.columnOffset));}}
async _getRawModule(script){if(!script.sourceURL.startsWith('wasm://')){return{url:script.sourceURL};}
return{code:await script.getWasmBytecode()};}
async _getSourceFiles(script){if(!script.sourceMapURL){return null;}
for(const plugin of this._plugins){if(plugin.handleScript(script)){const rawModule=await this._getRawModule(script);const sourceFiles=await plugin.addRawModule(script.scriptId,script.sourceMapURL,rawModule);if(!sourceFiles){continue;}
this._pluginForScriptId.set(script.scriptId,plugin);return sourceFiles;}}
return null;}
static _makeUISourceFileURL(filename,baseURL){function makeUrl(filename){try{const url=new URL(filename);if(url.protocol!=='file:'||!url.hostname){return url;}}catch(error){if(!(error instanceof TypeError)){throw error;}}
return null;}
return makeUrl(filename)||makeUrl('file://'+filename)||new URL(filename,baseURL);}
_getOrCreateUISourceCode(sourceFile,script,sourceFileURL){let uiSourceCode=this._project.uiSourceCodeForURL(sourceFileURL);if(uiSourceCode){return uiSourceCode;}
uiSourceCode=this._project.createUISourceCode(sourceFileURL,Common.ResourceType.resourceTypes.SourceMapScript);Bindings.NetworkProject.setInitialFrameAttribution(uiSourceCode,script.frameId);const contentProvider=new SDK.CompilerSourceMappingContentProvider.CompilerSourceMappingContentProvider(sourceFileURL,Common.ResourceType.resourceTypes.SourceMapScript);this._bindUISourceCode(uiSourceCode,script,sourceFile);this._project.addUISourceCodeWithProvider(uiSourceCode,contentProvider,null,'text/javascript');return uiSourceCode;}
_bindUISourceCode(uiSourceCode,script,sourceFile){const entry=this._uiSourceCodes.get(uiSourceCode);if(entry){entry.push([sourceFile,script]);}else{this._uiSourceCodes.set(uiSourceCode,[[sourceFile,script]]);}}
_unbindUISourceCode(uiSourceCode,scripts){const filter=([sourceFile,script])=>!scripts.has(script);this._uiSourceCodes.set(uiSourceCode,this._uiSourceCodes.get(uiSourceCode).filter(filter));if(this._uiSourceCodes.get(uiSourceCode).length===0){this._project.removeFile(uiSourceCode.url());this._uiSourceCodes.delete(uiSourceCode);}}
_newScriptSourceListener(event){const script=(event.data);this._newScriptSource(script);}
async _newScriptSource(script){const sourceFiles=await this._getSourceFiles(script);if(!sourceFiles){return;}
for(const sourceFile of sourceFiles){const sourceFileURL=DebuggerLanguagePluginManager._makeUISourceFileURL(sourceFile,new URL(script.sourceURL).origin);if(sourceFileURL===null){return;}
this._getOrCreateUISourceCode(sourceFile,script,sourceFileURL.toString());}
this._debuggerWorkspaceBinding.updateLocations(script);}
_executionContextDestroyed(event){const executionContext=(event.data);const scripts=new Set(this._debuggerModel.scriptsForExecutionContext(executionContext));for(const uiSourceCode of this._uiSourceCodes.keys()){this._unbindUISourceCode(uiSourceCode,scripts);}
for(const script of scripts){this._pluginForScriptId.delete(script.scriptId);}}
dispose(){this._project.dispose();for(const plugin of this._plugins){if(plugin.dispose){plugin.dispose();}}
this._pluginForScriptId.clear();this._uiSourceCodes.clear();}
async resolveScopeChain(callFrame){const script=callFrame.script;const plugin=this._pluginForScriptId.get(script.scriptId);if(!plugin){return null;}
const scopes=new Map();const variables=await plugin.listVariablesInScope({'rawModuleId':script.scriptId,'codeOffset':callFrame.location().columnNumber-script.columnOffset});if(variables){for(const variable of variables){if(!scopes.has(variable.scope)){scopes.set(variable.scope,new SourceScope(callFrame,variable.scope));}
scopes.get(variable.scope).object().variables.push(variable);}}
return Array.from(scopes.values());}}
export class DebuggerLanguagePluginError extends Error{constructor(code,message){super(message);this.code=code;this.name='DebuggerLanguagePluginError';}}
export let RawModule;export let RawLocation;export let SourceLocation;export let Variable;export class DebuggerLanguagePlugin{handleScript(script){}
dispose(){}
async addRawModule(rawModuleId,symbolsURL,rawModule){}
sourceLocationToRawLocation(sourceLocation){}
rawLocationToSourceLocation(rawLocation){}
async listVariablesInScope(rawLocation){}
async evaluateVariable(name,location){}}