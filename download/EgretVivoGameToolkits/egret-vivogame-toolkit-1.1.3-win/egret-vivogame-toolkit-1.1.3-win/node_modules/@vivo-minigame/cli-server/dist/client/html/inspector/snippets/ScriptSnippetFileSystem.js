import*as Common from'../common/common.js';import*as Persistence from'../persistence/persistence.js';import*as SDK from'../sdk/sdk.js';import*as Workspace from'../workspace/workspace.js';class SnippetFileSystem extends Persistence.PlatformFileSystem.PlatformFileSystem{constructor(){super('snippet://','snippets');this._lastSnippetIdentifierSetting=self.Common.settings.createSetting('scriptSnippets_lastIdentifier',0);this._snippetsSetting=self.Common.settings.createSetting('scriptSnippets',[]);}
initialFilePaths(){const savedSnippets=this._snippetsSetting.get();return savedSnippets.map(snippet=>escape(snippet.name));}
async createFile(path,name){const nextId=this._lastSnippetIdentifierSetting.get()+1;this._lastSnippetIdentifierSetting.set(nextId);const snippetName=ls`Script snippet #${nextId}`;const snippets=this._snippetsSetting.get();snippets.push({name:snippetName,content:''});this._snippetsSetting.set(snippets);return escape(snippetName);}
async deleteFile(path){const name=unescape(path.substring(1));const allSnippets=this._snippetsSetting.get();const snippets=allSnippets.filter(snippet=>snippet.name!==name);if(allSnippets.length!==snippets.length){this._snippetsSetting.set(snippets);return true;}
return false;}
async requestFileContent(path){const name=unescape(path.substring(1));const snippet=this._snippetsSetting.get().find(snippet=>snippet.name===name);return{content:snippet?snippet.content:null,isEncoded:false};}
async setFileContent(path,content,isBase64){const name=unescape(path.substring(1));const snippets=this._snippetsSetting.get();const snippet=snippets.find(snippet=>snippet.name===name);if(snippet){snippet.content=content;this._snippetsSetting.set(snippets);return true;}
return false;}
renameFile(path,newName,callback){const name=unescape(path.substring(1));const snippets=this._snippetsSetting.get();const snippet=snippets.find(snippet=>snippet.name===name);newName=newName.trim();if(!snippet||newName.length===0||snippets.find(snippet=>snippet.name===newName)){callback(false);return;}
snippet.name=newName;this._snippetsSetting.set(snippets);callback(true,newName);}
async searchInPath(query,progress){const re=new RegExp(query.escapeForRegExp(),'i');const snippets=this._snippetsSetting.get().filter(snippet=>snippet.content.match(re));return snippets.map(snippet=>escape(snippet.name));}
mimeFromPath(path){return'text/javascript';}
contentType(path){return Common.ResourceType.resourceTypes.Script;}
tooltipForURL(url){return ls`Linked to ${unescape(url.substring(this.path().length))}`;}
supportsAutomapping(){return true;}}
export async function evaluateScriptSnippet(uiSourceCode){if(!uiSourceCode.url().startsWith('snippet://')){return;}
const executionContext=self.UI.context.flavor(SDK.RuntimeModel.ExecutionContext);if(!executionContext){return;}
const runtimeModel=executionContext.runtimeModel;await uiSourceCode.requestContent();uiSourceCode.commitWorkingCopy();const expression=uiSourceCode.workingCopy();self.Common.console.show();const url=uiSourceCode.url();const result=await executionContext.evaluate({expression:`${expression}\n//# sourceURL=${url}`,objectGroup:'console',silent:false,includeCommandLineAPI:true,returnByValue:false,generatePreview:true,replMode:true,},false,true);if(result.exceptionDetails){self.SDK.consoleModel.addMessage(SDK.ConsoleModel.ConsoleMessage.fromException(runtimeModel,result.exceptionDetails,undefined,undefined,url));return;}
if(!result.object){return;}
const scripts=executionContext.debuggerModel.scriptsForSourceURL(url);const scriptId=scripts[scripts.length-1].scriptId;self.SDK.consoleModel.addMessage(new SDK.ConsoleModel.ConsoleMessage(runtimeModel,SDK.ConsoleModel.MessageSource.JS,SDK.ConsoleModel.MessageLevel.Info,'',SDK.ConsoleModel.MessageType.Result,url,undefined,undefined,[result.object],undefined,undefined,executionContext.id,scriptId));}
export function isSnippetsUISourceCode(uiSourceCode){return uiSourceCode.url().startsWith('snippet://');}
export function isSnippetsProject(project){return project.type()===Workspace.Workspace.projectTypes.FileSystem&&Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.fileSystemType(project)==='snippets';}
self.Persistence.isolatedFileSystemManager.addPlatformFileSystem('snippet://',new SnippetFileSystem());