import*as Common from'../common/common.js';import*as Formatter from'../formatter/formatter.js';import*as SDK from'../sdk/sdk.js';import*as TextUtils from'../text_utils/text_utils.js';import*as Workspace from'../workspace/workspace.js';export const cachedMapSymbol=Symbol('cache');export const cachedIdentifiersSymbol=Symbol('cachedIdentifiers');export class Identifier{constructor(name,lineNumber,columnNumber){this.name=name;this.lineNumber=lineNumber;this.columnNumber=columnNumber;}}
export const scopeIdentifiers=function(scope){const startLocation=scope.startLocation();const endLocation=scope.endLocation();if(scope.type()===Protocol.Debugger.ScopeType.Global||!startLocation||!endLocation||!startLocation.script()||!startLocation.script().sourceMapURL||(startLocation.script()!==endLocation.script())){return Promise.resolve(([]));}
const script=startLocation.script();return script.requestContent().then(onContent);function onContent(deferredContent){if(!deferredContent.content){return Promise.resolve(([]));}
const content=deferredContent.content;const text=new TextUtils.Text.Text(content);const scopeRange=new TextUtils.TextRange.TextRange(startLocation.lineNumber,startLocation.columnNumber,endLocation.lineNumber,endLocation.columnNumber);const scopeText=text.extract(scopeRange);const scopeStart=text.toSourceRange(scopeRange).offset;const prefix='function fui';return Formatter.FormatterWorkerPool.formatterWorkerPool().javaScriptIdentifiers(prefix+scopeText).then(onIdentifiers.bind(null,text,scopeStart,prefix));}
function onIdentifiers(text,scopeStart,prefix,identifiers){const result=[];const cursor=new TextUtils.TextCursor.TextCursor(text.lineEndings());for(let i=0;i<identifiers.length;++i){const id=identifiers[i];if(id.offset<prefix.length){continue;}
const start=scopeStart+id.offset-prefix.length;cursor.resetTo(start);result.push(new Identifier(id.name,cursor.lineNumber(),cursor.columnNumber()));}
return result;}};export const resolveScope=function(scope){let identifiersPromise=scope[cachedIdentifiersSymbol];if(identifiersPromise){return identifiersPromise;}
const script=scope.callFrame().script;const sourceMap=self.Bindings.debuggerWorkspaceBinding.sourceMapForScript(script);if(!sourceMap){return Promise.resolve(new Map());}
const textCache=new Map();identifiersPromise=scopeIdentifiers(scope).then(onIdentifiers);scope[cachedIdentifiersSymbol]=identifiersPromise;return identifiersPromise;function onIdentifiers(identifiers){const namesMapping=new Map();for(let i=0;i<identifiers.length;++i){const id=identifiers[i];const entry=sourceMap.findEntry(id.lineNumber,id.columnNumber);if(entry&&entry.name){namesMapping.set(id.name,entry.name);}}
const promises=[];for(let i=0;i<identifiers.length;++i){const id=identifiers[i];if(namesMapping.has(id.name)){continue;}
const promise=resolveSourceName(id).then(onSourceNameResolved.bind(null,namesMapping,id));promises.push(promise);}
return Promise.all(promises).then(()=>Sources.SourceMapNamesResolver._scopeResolvedForTest()).then(()=>namesMapping);}
function onSourceNameResolved(namesMapping,id,sourceName){if(!sourceName){return;}
namesMapping.set(id.name,sourceName);}
function resolveSourceName(id){const startEntry=sourceMap.findEntry(id.lineNumber,id.columnNumber);const endEntry=sourceMap.findEntry(id.lineNumber,id.columnNumber+id.name.length);if(!startEntry||!endEntry||!startEntry.sourceURL||startEntry.sourceURL!==endEntry.sourceURL||!startEntry.sourceLineNumber||!startEntry.sourceColumnNumber||!endEntry.sourceLineNumber||!endEntry.sourceColumnNumber){return Promise.resolve((null));}
const sourceTextRange=new TextUtils.TextRange.TextRange(startEntry.sourceLineNumber,startEntry.sourceColumnNumber,endEntry.sourceLineNumber,endEntry.sourceColumnNumber);const uiSourceCode=self.Bindings.debuggerWorkspaceBinding.uiSourceCodeForSourceMapSourceURL(script.debuggerModel,startEntry.sourceURL,script.isContentScript());if(!uiSourceCode){return Promise.resolve((null));}
return uiSourceCode.requestContent().then(deferredContent=>{const content=deferredContent.content;return onSourceContent(sourceTextRange,content);});}
function onSourceContent(sourceTextRange,content){if(!content){return null;}
let text=textCache.get(content);if(!text){text=new TextUtils.Text.Text(content);textCache.set(content,text);}
const originalIdentifier=text.extract(sourceTextRange).trim();return/[a-zA-Z0-9_$]+/.test(originalIdentifier)?originalIdentifier:null;}};export const allVariablesInCallFrame=function(callFrame){const cached=callFrame[cachedMapSymbol];if(cached){return Promise.resolve(cached);}
const promises=[];const scopeChain=callFrame.scopeChain();for(let i=0;i<scopeChain.length;++i){promises.push(resolveScope(scopeChain[i]));}
return Promise.all(promises).then(mergeVariables);function mergeVariables(nameMappings){const reverseMapping=new Map();for(const map of nameMappings){for(const compiledName of map.keys()){const originalName=map.get(compiledName);if(!reverseMapping.has(originalName)){reverseMapping.set(originalName,compiledName);}}}
callFrame[cachedMapSymbol]=reverseMapping;return reverseMapping;}};export const resolveExpression=function(callFrame,originalText,uiSourceCode,lineNumber,startColumnNumber,endColumnNumber){if(!uiSourceCode.contentType().isFromSourceMap()){return Promise.resolve('');}
return allVariablesInCallFrame(callFrame).then(reverseMapping=>findCompiledName(callFrame.debuggerModel,reverseMapping));function findCompiledName(debuggerModel,reverseMapping){if(reverseMapping.has(originalText)){return Promise.resolve(reverseMapping.get(originalText)||'');}
return resolveExpressionAsync(debuggerModel,uiSourceCode,lineNumber,startColumnNumber,endColumnNumber);}};export const resolveExpressionAsync=async function(debuggerModel,uiSourceCode,lineNumber,startColumnNumber,endColumnNumber){const rawLocations=await self.Bindings.debuggerWorkspaceBinding.uiLocationToRawLocations(uiSourceCode,lineNumber,startColumnNumber);const rawLocation=rawLocations.find(location=>location.debuggerModel===debuggerModel);if(!rawLocation){return'';}
const script=rawLocation.script();if(!script){return'';}
const sourceMap=(self.Bindings.debuggerWorkspaceBinding.sourceMapForScript(script));if(!sourceMap){return'';}
return script.requestContent().then(onContent);function onContent(deferredContent){const content=deferredContent.content;if(!content){return Promise.resolve('');}
const text=new TextUtils.Text.Text(content);const textRange=sourceMap.reverseMapTextRange(uiSourceCode.url(),new TextUtils.TextRange.TextRange(lineNumber,startColumnNumber,lineNumber,endColumnNumber));const originalText=text.extract(textRange);if(!originalText){return Promise.resolve('');}
return Formatter.FormatterWorkerPool.formatterWorkerPool().evaluatableJavaScriptSubstring(originalText);}};export const resolveThisObject=function(callFrame){if(!callFrame){return Promise.resolve((null));}
if(!callFrame.scopeChain().length){return Promise.resolve(callFrame.thisObject());}
return resolveScope(callFrame.scopeChain()[0]).then(onScopeResolved);function onScopeResolved(namesMapping){const thisMappings=namesMapping.inverse().get('this');if(!thisMappings||thisMappings.size!==1){return Promise.resolve(callFrame.thisObject());}
const thisMapping=thisMappings.values().next().value;return callFrame.evaluate({expression:thisMapping,objectGroup:'backtrace',includeCommandLineAPI:false,silent:true,returnByValue:false,generatePreview:true}).then(onEvaluated);}
function onEvaluated(result){return!result.exceptionDetails&&result.object?result.object:callFrame.thisObject();}};export const resolveScopeInObject=function(scope){const startLocation=scope.startLocation();const endLocation=scope.endLocation();if(scope.type()===Protocol.Debugger.ScopeType.Global||!startLocation||!endLocation||!startLocation.script()||!startLocation.script().sourceMapURL||startLocation.script()!==endLocation.script()){return scope.object();}
return new RemoteObject(scope);};export class RemoteObject extends SDK.RemoteObject.RemoteObject{constructor(scope){super();this._scope=scope;this._object=scope.object();}
customPreview(){return this._object.customPreview();}
get objectId(){return this._object.objectId;}
get type(){return this._object.type;}
get subtype(){return this._object.subtype;}
get value(){return this._object.value;}
get description(){return this._object.description;}
get hasChildren(){return this._object.hasChildren;}
get preview(){return this._object.preview;}
arrayLength(){return this._object.arrayLength();}
getOwnProperties(generatePreview){return this._object.getOwnProperties(generatePreview);}
async getAllProperties(accessorPropertiesOnly,generatePreview){const allProperties=await this._object.getAllProperties(accessorPropertiesOnly,generatePreview);const namesMapping=await resolveScope(this._scope);const properties=allProperties.properties;const internalProperties=allProperties.internalProperties;const newProperties=[];if(properties){for(let i=0;i<properties.length;++i){const property=properties[i];const name=namesMapping.get(property.name)||properties[i].name;newProperties.push(new SDK.RemoteObject.RemoteObjectProperty(name,property.value,property.enumerable,property.writable,property.isOwn,property.wasThrown,property.symbol,property.synthetic));}}
return{properties:newProperties,internalProperties:internalProperties};}
async setPropertyValue(argumentName,value){const namesMapping=await resolveScope(this._scope);let name;if(typeof argumentName==='string'){name=argumentName;}else{name=(argumentName.value);}
let actualName=name;for(const compiledName of namesMapping.keys()){if(namesMapping.get(compiledName)===name){actualName=compiledName;break;}}
return this._object.setPropertyValue(actualName,value);}
async deleteProperty(name){return this._object.deleteProperty(name);}
callFunction(functionDeclaration,args){return this._object.callFunction(functionDeclaration,args);}
callFunctionJSON(functionDeclaration,args){return this._object.callFunctionJSON(functionDeclaration,args);}
release(){this._object.release();}
debuggerModel(){return this._object.debuggerModel();}
runtimeModel(){return this._object.runtimeModel();}
isNode(){return this._object.isNode();}}