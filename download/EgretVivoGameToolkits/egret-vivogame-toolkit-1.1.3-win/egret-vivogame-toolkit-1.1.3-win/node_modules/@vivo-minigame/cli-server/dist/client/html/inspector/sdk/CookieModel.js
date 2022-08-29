import*as Common from'../common/common.js';import{Cookie}from'./Cookie.js';import{Resource}from'./Resource.js';import{ResourceTreeModel}from'./ResourceTreeModel.js';import{Capability,SDKModel,Target}from'./SDKModel.js';export class CookieModel extends SDKModel{constructor(target){super(target);this._blockedCookies=new Map();this._cookieToBlockedReasons=new Map();}
addBlockedCookie(cookie,blockedReasons){const key=cookie.key();const previousCookie=this._blockedCookies.get(key);this._blockedCookies.set(key,cookie);this._cookieToBlockedReasons.set(cookie,blockedReasons);if(previousCookie){this._cookieToBlockedReasons.delete(key);}}
getCookieToBlockedReasonsMap(){return this._cookieToBlockedReasons;}
async getCookies(urls){const normalCookies=await this.target().networkAgent().getCookies(urls).then(cookies=>(cookies||[]).map(cookie=>Cookie.fromProtocolCookie(cookie)));return normalCookies.concat(Array.from(this._blockedCookies.values()));}
deleteCookie(cookie,callback){this._deleteAll([cookie],callback);}
clear(domain,callback){this.getCookiesForDomain(domain||null).then(cookies=>this._deleteAll(cookies,callback));}
saveCookie(cookie){let domain=cookie.domain();if(!domain.startsWith('.')){domain='';}
let expires=undefined;if(cookie.expires()){expires=Math.floor(Date.parse(cookie.expires())/1000);}
return this.target().networkAgent().setCookie(cookie.name(),cookie.value(),cookie.url()||undefined,domain,cookie.path(),cookie.secure(),cookie.httpOnly(),cookie.sameSite(),expires,cookie.priority()).then(success=>!!success);}
getCookiesForDomain(domain){const resourceURLs=[];function populateResourceURLs(resource){const documentURL=Common.ParsedURL.ParsedURL.fromString(resource.documentURL);if(documentURL&&(!domain||documentURL.securityOrigin()===domain)){resourceURLs.push(resource.url);}}
const resourceTreeModel=this.target().model(ResourceTreeModel);if(resourceTreeModel){resourceTreeModel.forAllResources(populateResourceURLs);}
return this.getCookies(resourceURLs);}
_deleteAll(cookies,callback){const networkAgent=this.target().networkAgent();this._blockedCookies.clear();this._cookieToBlockedReasons.clear();Promise.all(cookies.map(cookie=>networkAgent.deleteCookies(cookie.name(),undefined,cookie.domain(),cookie.path()))).then(callback||function(){});}}
SDKModel.register(CookieModel,Capability.Network,false);