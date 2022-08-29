import*as Common from'../common/common.js';export class CompilerSourceMappingContentProvider{constructor(sourceURL,contentType){this._sourceURL=sourceURL;this._contentType=contentType;}
contentURL(){return this._sourceURL;}
contentType(){return this._contentType;}
contentEncoded(){return Promise.resolve(false);}
requestContent(){return new Promise(resolve=>{self.SDK.multitargetNetworkManager.loadResource(this._sourceURL,(success,_headers,content,errorDescription)=>{if(!success){const error=ls`Could not load content for ${this._sourceURL} (${errorDescription.message})`;console.error(error);resolve({error,isEncoded:false});}else{resolve({content,isEncoded:false});}});});}
async searchInContent(query,caseSensitive,isRegex){const{content}=await this.requestContent();if(typeof content!=='string'){return[];}
return Common.ContentProvider.performSearchInContent(content,query,caseSensitive,isRegex);}}