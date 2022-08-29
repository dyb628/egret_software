import*as Bindings from'../bindings/bindings.js';import*as Common from'../common/common.js';import*as Search from'../search/search.js';import*as Workspace from'../workspace/workspace.js';export class SourcesSearchScope{constructor(){this._searchId=0;this._searchResultCandidates=[];this._searchResultCallback=null;this._searchFinishedCallback=null;this._searchConfig=null;}
static _filesComparator(uiSourceCode1,uiSourceCode2){if(uiSourceCode1.isDirty()&&!uiSourceCode2.isDirty()){return-1;}
if(!uiSourceCode1.isDirty()&&uiSourceCode2.isDirty()){return 1;}
const isFileSystem1=uiSourceCode1.project().type()===Workspace.Workspace.projectTypes.FileSystem&&!self.Persistence.persistence.binding(uiSourceCode1);const isFileSystem2=uiSourceCode2.project().type()===Workspace.Workspace.projectTypes.FileSystem&&!self.Persistence.persistence.binding(uiSourceCode2);if(isFileSystem1!==isFileSystem2){return isFileSystem1?1:-1;}
const url1=uiSourceCode1.url();const url2=uiSourceCode2.url();if(url1&&!url2){return-1;}
if(!url1&&url2){return 1;}
return String.naturalOrderComparator(uiSourceCode1.fullDisplayName(),uiSourceCode2.fullDisplayName());}
performIndexing(progress){this.stopSearch();const projects=this._projects();const compositeProgress=new Common.Progress.CompositeProgress(progress);for(let i=0;i<projects.length;++i){const project=projects[i];const projectProgress=compositeProgress.createSubProgress(project.uiSourceCodes().length);project.indexContent(projectProgress);}}
_projects(){const searchInAnonymousAndContentScripts=self.Common.settings.moduleSetting('searchInAnonymousAndContentScripts').get();return self.Workspace.workspace.projects().filter(project=>{if(project.type()===Workspace.Workspace.projectTypes.Service){return false;}
if(!searchInAnonymousAndContentScripts&&project.isServiceProject()){return false;}
if(!searchInAnonymousAndContentScripts&&project.type()===Workspace.Workspace.projectTypes.ContentScripts){return false;}
return true;});}
performSearch(searchConfig,progress,searchResultCallback,searchFinishedCallback){this.stopSearch();this._searchResultCandidates=[];this._searchResultCallback=searchResultCallback;this._searchFinishedCallback=searchFinishedCallback;this._searchConfig=searchConfig;const promises=[];const compositeProgress=new Common.Progress.CompositeProgress(progress);const searchContentProgress=compositeProgress.createSubProgress();const findMatchingFilesProgress=new Common.Progress.CompositeProgress(compositeProgress.createSubProgress());for(const project of this._projects()){const weight=project.uiSourceCodes().length;const findMatchingFilesInProjectProgress=findMatchingFilesProgress.createSubProgress(weight);const filesMathingFileQuery=this._projectFilesMatchingFileQuery(project,searchConfig);const promise=project.findFilesMatchingSearchRequest(searchConfig,filesMathingFileQuery,findMatchingFilesInProjectProgress).then(this._processMatchingFilesForProject.bind(this,this._searchId,project,searchConfig,filesMathingFileQuery));promises.push(promise);}
Promise.all(promises).then(this._processMatchingFiles.bind(this,this._searchId,searchContentProgress,this._searchFinishedCallback.bind(this,true)));}
_projectFilesMatchingFileQuery(project,searchConfig,dirtyOnly){const result=[];const uiSourceCodes=project.uiSourceCodes();for(let i=0;i<uiSourceCodes.length;++i){const uiSourceCode=uiSourceCodes[i];if(!uiSourceCode.contentType().isTextType()){continue;}
const binding=self.Persistence.persistence.binding(uiSourceCode);if(binding&&binding.network===uiSourceCode){continue;}
if(dirtyOnly&&!uiSourceCode.isDirty()){continue;}
if(searchConfig.filePathMatchesFileQuery(uiSourceCode.fullDisplayName())){result.push(uiSourceCode.url());}}
result.sort(String.naturalOrderComparator);return result;}
_processMatchingFilesForProject(searchId,project,searchConfig,filesMathingFileQuery,files){if(searchId!==this._searchId){this._searchFinishedCallback(false);return;}
files.sort(String.naturalOrderComparator);files=files.intersectOrdered(filesMathingFileQuery,String.naturalOrderComparator);const dirtyFiles=this._projectFilesMatchingFileQuery(project,searchConfig,true);files=files.mergeOrdered(dirtyFiles,String.naturalOrderComparator);const uiSourceCodes=[];for(const file of files){const uiSourceCode=project.uiSourceCodeForURL(file);if(!uiSourceCode){continue;}
const script=Bindings.DefaultScriptMapping.DefaultScriptMapping.scriptForUISourceCode(uiSourceCode);if(script&&!script.isAnonymousScript()){continue;}
uiSourceCodes.push(uiSourceCode);}
uiSourceCodes.sort(SourcesSearchScope._filesComparator);this._searchResultCandidates=this._searchResultCandidates.mergeOrdered(uiSourceCodes,SourcesSearchScope._filesComparator);}
_processMatchingFiles(searchId,progress,callback){if(searchId!==this._searchId){this._searchFinishedCallback(false);return;}
const files=this._searchResultCandidates;if(!files.length){progress.done();callback();return;}
progress.setTotalWork(files.length);let fileIndex=0;const maxFileContentRequests=20;let callbacksLeft=0;for(let i=0;i<maxFileContentRequests&&i<files.length;++i){scheduleSearchInNextFileOrFinish.call(this);}
function searchInNextFile(uiSourceCode){if(uiSourceCode.isDirty()){contentLoaded.call(this,uiSourceCode,uiSourceCode.workingCopy());}else{uiSourceCode.requestContent().then(deferredContent=>{contentLoaded.call(this,uiSourceCode,deferredContent.content||'');});}}
function scheduleSearchInNextFileOrFinish(){if(fileIndex>=files.length){if(!callbacksLeft){progress.done();callback();return;}
return;}
++callbacksLeft;const uiSourceCode=files[fileIndex++];setTimeout(searchInNextFile.bind(this,uiSourceCode),0);}
function contentLoaded(uiSourceCode,content){function matchesComparator(a,b){return a.lineNumber-b.lineNumber;}
progress.worked(1);let matches=[];const queries=this._searchConfig.queries();if(content!==null){for(let i=0;i<queries.length;++i){const nextMatches=Common.ContentProvider.performSearchInContent(content,queries[i],!this._searchConfig.ignoreCase(),this._searchConfig.isRegex());matches=matches.mergeOrdered(nextMatches,matchesComparator);}}
if(matches){const searchResult=new FileBasedSearchResult(uiSourceCode,matches);this._searchResultCallback(searchResult);}
--callbacksLeft;scheduleSearchInNextFileOrFinish.call(this);}}
stopSearch(){++this._searchId;}}
export class FileBasedSearchResult{constructor(uiSourceCode,searchMatches){this._uiSourceCode=uiSourceCode;this._searchMatches=searchMatches;}
label(){return this._uiSourceCode.displayName();}
description(){return this._uiSourceCode.fullDisplayName();}
matchesCount(){return this._searchMatches.length;}
matchLineContent(index){return this._searchMatches[index].lineContent;}
matchRevealable(index){const match=this._searchMatches[index];return this._uiSourceCode.uiLocation(match.lineNumber,undefined);}
matchLabel(index){return this._searchMatches[index].lineNumber+1;}}