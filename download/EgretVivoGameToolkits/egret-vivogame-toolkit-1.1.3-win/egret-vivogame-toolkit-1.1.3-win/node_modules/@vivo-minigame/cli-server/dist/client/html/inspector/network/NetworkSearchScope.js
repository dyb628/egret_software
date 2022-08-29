import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as Search from'../search/search.js';export class NetworkSearchScope{performIndexing(progress){setImmediate(progress.done.bind(progress));}
async performSearch(searchConfig,progress,searchResultCallback,searchFinishedCallback){const promises=[];const requests=self.SDK.networkLog.requests().filter(request=>searchConfig.filePathMatchesFileQuery(request.url()));progress.setTotalWork(requests.length);for(const request of requests){const promise=this._searchRequest(searchConfig,request,progress);promises.push(promise);}
const results=await Promise.all(promises);if(progress.isCanceled()){searchFinishedCallback(false);return;}
for(const result of results.sort((r1,r2)=>r1.label().localeCompare(r2.label()))){if(result.matchesCount()>0){searchResultCallback(result);}}
progress.done();searchFinishedCallback(true);}
async _searchRequest(searchConfig,request,progress){let bodyMatches=[];if(request.contentType().isTextType()){bodyMatches=await request.searchInContent(searchConfig.query(),!searchConfig.ignoreCase(),searchConfig.isRegex());}
if(progress.isCanceled()){return null;}
const locations=[];if(stringMatchesQuery(request.url())){locations.push(UIRequestLocation.urlMatch(request));}
for(const header of request.requestHeaders()){if(headerMatchesQuery(header)){locations.push(UIRequestLocation.requestHeaderMatch(request,header));}}
for(const header of request.responseHeaders){if(headerMatchesQuery(header)){locations.push(UIRequestLocation.responseHeaderMatch(request,header));}}
for(const match of bodyMatches){locations.push(UIRequestLocation.bodyMatch(request,match));}
progress.worked();return new NetworkSearchResult(request,locations);function headerMatchesQuery(header){return stringMatchesQuery(`${header.name}: ${header.value}`);}
function stringMatchesQuery(string){const flags=searchConfig.ignoreCase()?'i':'';const regExps=searchConfig.queries().map(query=>new RegExp(query,flags));let pos=0;for(const regExp of regExps){const match=string.substr(pos).match(regExp);if(!match){return false;}
pos+=match.index+match[0].length;}
return true;}}
stopSearch(){}}
export class UIRequestLocation{constructor(request,requestHeader,responseHeader,searchMatch,urlMatch){this.request=request;this.requestHeader=requestHeader;this.responseHeader=responseHeader;this.searchMatch=searchMatch;this.isUrlMatch=urlMatch;}
static requestHeaderMatch(request,header){return new UIRequestLocation(request,header,null,null,false);}
static responseHeaderMatch(request,header){return new UIRequestLocation(request,null,header,null,false);}
static bodyMatch(request,searchMatch){return new UIRequestLocation(request,null,null,searchMatch,false);}
static urlMatch(request){return new UIRequestLocation(request,null,null,null,true);}}
export class NetworkSearchResult{constructor(request,locations){this._request=request;this._locations=locations;}
matchesCount(){return this._locations.length;}
label(){return this._request.displayName;}
description(){const parsedUrl=this._request.parsedURL;if(!parsedUrl){return this._request.url();}
return parsedUrl.urlWithoutScheme();}
matchLineContent(index){const location=this._locations[index];if(location.isUrlMatch){return this._request.url();}
const header=location.requestHeader||location.responseHeader;if(header){return header.value;}
return location.searchMatch.lineContent;}
matchRevealable(index){return this._locations[index];}
matchLabel(index){const location=this._locations[index];if(location.isUrlMatch){return Common.UIString.UIString('URL');}
const header=location.requestHeader||location.responseHeader;if(header){return`${header.name}:`;}
return location.searchMatch.lineNumber+1;}}