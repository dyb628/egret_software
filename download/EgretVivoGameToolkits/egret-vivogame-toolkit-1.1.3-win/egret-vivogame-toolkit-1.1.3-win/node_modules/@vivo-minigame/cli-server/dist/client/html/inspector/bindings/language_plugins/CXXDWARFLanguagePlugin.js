import{DebuggerLanguagePlugin,DebuggerLanguagePluginError,RawLocation,RawModule,SourceLocation,Variable}from'../DebuggerLanguagePlugins.js';let AddRawModuleResponse;let SourceLocationToRawLocationResponse;let RawLocationToSourceLocationResponse;let ListVariablesInScopeResponse;let EvaluateVariableResponse;function _sendJsonRPC(method,params){const request=new XMLHttpRequest();request.open('POST','http://localhost:8888',false);request.setRequestHeader('Content-Type','application/json;charset=UTF-8');const payload=JSON.stringify({jsonrpc:'2.0',method:method,params,id:0});request.send(payload);if(request.status!==200){throw new DebuggerLanguagePluginError(request.status.toString(),'JSON-RPC request failed');}
const response=JSON.parse(request.responseText).result;if(response.error){throw new DebuggerLanguagePluginError(response.error.code,response.error.message);}
return response;}
export class CXXDWARFLanguagePlugin{handleScript(script){return script.sourceMapURL.startsWith('wasm://');}
async addRawModule(rawModuleId,symbols,rawModule){return _sendJsonRPC('addRawModule',{rawModuleId:rawModuleId,symbols:symbols,rawModule:getProtocolModule(rawModule)}).sources;function getProtocolModule(rawModule){if(!rawModule.code){return{url:rawModule.url};}
const moduleBytes=new Uint8Array(rawModule.code);let binary='';const len=moduleBytes.byteLength;for(let i=0;i<len;i++){binary+=String.fromCharCode(moduleBytes[i]);}
return{code:btoa(binary)};}}
sourceLocationToRawLocation(sourceLocation){return _sendJsonRPC('sourceLocationToRawLocation',sourceLocation).rawLocation;}
rawLocationToSourceLocation(rawLocation){return _sendJsonRPC('rawLocationToSourceLocation',rawLocation).sourceLocation;}
async listVariablesInScope(rawLocation){return _sendJsonRPC('listVariablesInScope',rawLocation).variable;}
async evaluateVariable(name,location){return null;}
dispose(){}}