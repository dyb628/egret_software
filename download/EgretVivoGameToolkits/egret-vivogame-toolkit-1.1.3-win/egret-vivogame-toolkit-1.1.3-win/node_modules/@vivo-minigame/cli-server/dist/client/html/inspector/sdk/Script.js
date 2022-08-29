import*as Common from'../common/common.js';import*as ProtocolModule from'../protocol/protocol.js';import{DebuggerModel,Location}from'./DebuggerModel.js';import{ResourceTreeModel}from'./ResourceTreeModel.js';import{ExecutionContext}from'./RuntimeModel.js';export class Script{constructor(debuggerModel,scriptId,sourceURL,startLine,startColumn,endLine,endColumn,executionContextId,hash,isContentScript,isLiveEdit,sourceMapURL,hasSourceURL,length,originStackTrace){this.debuggerModel=debuggerModel;this.scriptId=scriptId;this.sourceURL=sourceURL;this.lineOffset=startLine;this.columnOffset=startColumn;this.endLine=endLine;this.endColumn=endColumn;this.executionContextId=executionContextId;this.hash=hash;this._isContentScript=isContentScript;this._isLiveEdit=isLiveEdit;this.sourceMapURL=sourceMapURL;this.hasSourceURL=hasSourceURL;this.contentLength=length;this._originalContentProvider=null;this._originalSource=null;this.originStackTrace=originStackTrace;this._lineMap=null;}
static _trimSourceURLComment(source){let sourceURLIndex=source.lastIndexOf('//# sourceURL=');if(sourceURLIndex===-1){sourceURLIndex=source.lastIndexOf('//@ sourceURL=');if(sourceURLIndex===-1){return source;}}
const sourceURLLineIndex=source.lastIndexOf('\n',sourceURLIndex);if(sourceURLLineIndex===-1){return source;}
const sourceURLLine=source.substr(sourceURLLineIndex+1);if(!sourceURLLine.match(sourceURLRegex)){return source;}
return source.substr(0,sourceURLLineIndex);}
isContentScript(){return this._isContentScript;}
isWasmDisassembly(){return!!this._lineMap&&!this.sourceMapURL;}
executionContext(){return this.debuggerModel.runtimeModel().executionContext(this.executionContextId);}
isLiveEdit(){return this._isLiveEdit;}
contentURL(){return this.sourceURL;}
contentType(){return Common.ResourceType.resourceTypes.Script;}
contentEncoded(){return Promise.resolve(false);}
async requestContent(){if(this._source){return{content:this._source,isEncoded:false};}
if(!this.scriptId){return{error:ls`Script removed or deleted.`,isEncoded:false};}
try{const sourceOrBytecode=await this.debuggerModel.target().debuggerAgent().invoke_getScriptSource({scriptId:this.scriptId});const source=sourceOrBytecode.scriptSource;if(source){if(this.hasSourceURL){this._source=Script._trimSourceURLComment(source);}else{this._source=source;}}else{this._source='';if(sourceOrBytecode.bytecode){const worker=new Common.Worker.WorkerWrapper('wasmparser_worker_entrypoint');const promise=new Promise(function(resolve,reject){worker.onmessage=resolve;worker.onerror=reject;});worker.postMessage({method:'disassemble',params:{content:sourceOrBytecode.bytecode}});const result=await promise;this._source=result.data.source;this._lineMap=result.data.offsets;this.endLine=this._lineMap.length;}}
if(this._originalSource===null){this._originalSource=this._source;}
return{content:this._source,isEncoded:false};}catch(err){return{error:ls`Unable to fetch script source.`,isEncoded:false};}}
async getWasmBytecode(){const base64=await this.debuggerModel.target().debuggerAgent().getWasmBytecode(this.scriptId);const response=await fetch(`data:application/wasm;base64,${base64}`);return response.arrayBuffer();}
originalContentProvider(){if(!this._originalContentProvider){const lazyContent=()=>this.requestContent().then(()=>{return{content:this._originalSource,isEncoded:false,};});this._originalContentProvider=new Common.StaticContentProvider.StaticContentProvider(this.contentURL(),this.contentType(),lazyContent);}
return this._originalContentProvider;}
async searchInContent(query,caseSensitive,isRegex){if(!this.scriptId){return[];}
const matches=await this.debuggerModel.target().debuggerAgent().searchInContent(this.scriptId,query,caseSensitive,isRegex);return(matches||[]).map(match=>new Common.ContentProvider.SearchMatch(match.lineNumber,match.lineContent));}
_appendSourceURLCommentIfNeeded(source){if(!this.hasSourceURL){return source;}
return source+'\n //# sourceURL='+this.sourceURL;}
async editSource(newSource,callback){newSource=Script._trimSourceURLComment(newSource);newSource=this._appendSourceURLCommentIfNeeded(newSource);if(!this.scriptId){callback('Script failed to parse');return;}
await this.requestContent();if(this._source===newSource){callback(null);return;}
const response=await this.debuggerModel.target().debuggerAgent().invoke_setScriptSource({scriptId:this.scriptId,scriptSource:newSource});if(!response[ProtocolModule.InspectorBackend.ProtocolError]&&!response.exceptionDetails){this._source=newSource;}
const needsStepIn=!!response.stackChanged;callback(response[ProtocolModule.InspectorBackend.ProtocolError],response.exceptionDetails,response.callFrames,response.asyncStackTrace,response.asyncStackTraceId,needsStepIn);}
rawLocation(lineNumber,columnNumber){if(this.containsLocation(lineNumber,columnNumber)){return new Location(this.debuggerModel,this.scriptId,lineNumber,columnNumber);}
return null;}
wasmByteLocation(lineNumber){if(lineNumber<this._lineMap.length){return new Location(this.debuggerModel,this.scriptId,0,this._lineMap[lineNumber]);}
return null;}
wasmDisassemblyLine(byteOffset){let line=0;while(line<this._lineMap.length&&byteOffset>this._lineMap[line]){line++;}
return line;}
toRelativeLocation(location){console.assert(location.scriptId===this.scriptId,'`toRelativeLocation` must be used with location of the same script');const relativeLineNumber=location.lineNumber-this.lineOffset;const relativeColumnNumber=(location.columnNumber||0)-(relativeLineNumber===0?this.columnOffset:0);return[relativeLineNumber,relativeColumnNumber];}
isInlineScript(){const startsAtZero=!this.lineOffset&&!this.columnOffset;return!!this.sourceURL&&!startsAtZero;}
isAnonymousScript(){return!this.sourceURL;}
isInlineScriptWithSourceURL(){return!!this.hasSourceURL&&this.isInlineScript();}
async setBlackboxedRanges(positions){const response=await this.debuggerModel.target().debuggerAgent().invoke_setBlackboxedRanges({scriptId:this.scriptId,positions});return!response[ProtocolModule.InspectorBackend.ProtocolError];}
containsLocation(lineNumber,columnNumber){const afterStart=(lineNumber===this.lineOffset&&columnNumber>=this.columnOffset)||lineNumber>this.lineOffset;const beforeEnd=lineNumber<this.endLine||(lineNumber===this.endLine&&columnNumber<=this.endColumn);return afterStart&&beforeEnd;}
get frameId(){if(typeof this[frameIdSymbol]!=='string'){this[frameIdSymbol]=frameIdForScript(this);}
return this[frameIdSymbol];}}
const frameIdSymbol=Symbol('frameid');function frameIdForScript(script){const executionContext=script.executionContext();if(executionContext){return executionContext.frameId||'';}
const resourceTreeModel=script.debuggerModel.target().model(ResourceTreeModel);if(!resourceTreeModel||!resourceTreeModel.mainFrame){return'';}
return resourceTreeModel.mainFrame.id;}
export const sourceURLRegex=/^[\040\t]*\/\/[@#] sourceURL=\s*(\S*?)\s*$/;