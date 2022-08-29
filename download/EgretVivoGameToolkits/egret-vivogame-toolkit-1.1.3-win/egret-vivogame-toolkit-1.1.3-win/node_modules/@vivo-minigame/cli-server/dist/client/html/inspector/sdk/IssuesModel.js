import*as Common from'../common/common.js';import{CookieModel}from'./CookieModel.js';import{Issue}from'./Issue.js';import{Events as NetworkManagerEvents,NetworkManager}from'./NetworkManager.js';import{NetworkRequest,setCookieBlockedReasonToAttribute,setCookieBlockedReasonToUiString,}from'./NetworkRequest.js';import{Events as ResourceTreeModelEvents,ResourceTreeModel}from'./ResourceTreeModel.js';import{Capability,SDKModel,Target}from'./SDKModel.js';const connectedIssuesSymbol=Symbol('issues');export class IssuesModel extends SDKModel{constructor(target){super(target);this._enabled=false;this._issues=[];this._browserIssues=[];this._browserIssuesByCode=new Map();this._cookiesModel=target.model(CookieModel);const networkManager=target.model(NetworkManager);if(networkManager){networkManager.addEventListener(NetworkManagerEvents.RequestFinished,this._handleRequestFinished,this);}
const resourceTreeModel=(target.model(ResourceTreeModel));if(resourceTreeModel){resourceTreeModel.addEventListener(ResourceTreeModelEvents.MainFrameNavigated,this._onMainFrameNavigated,this);}}
_onMainFrameNavigated(){this._clearIssues();}
_clearIssues(){this._issues=[];this._browserIssues=[];this._browserIssuesByCode=new Map();this.dispatchEventToListeners(Events.AllIssuesCleared);}
ensureEnabled(){if(this._enabled){return;}
this._enabled=true;this.target().registerAuditsDispatcher(this);this._auditsAgent=this.target().auditsAgent();this._auditsAgent.enable();}
issueAdded(payload){if(!this._browserIssuesByCode.has(payload.code)){const issue=new Issue(payload.code);this._browserIssuesByCode.set(payload.code,issue);this.dispatchEventToListeners(Events.IssueAdded,issue);}else{const issue=this._browserIssuesByCode.get(payload.code);this.dispatchEventToListeners(Events.IssueUpdated,issue);}}
issues(){return this._browserIssuesByCode.values();}
size(){return this._browserIssuesByCode.size;}
static connectWithIssue(obj,issue){if(!obj){return;}
if(!obj[connectedIssuesSymbol]){obj[connectedIssuesSymbol]=[];}
obj[connectedIssuesSymbol].push(issue);}
static hasIssues(obj){if(!obj){return false;}
return obj[connectedIssuesSymbol]&&obj[connectedIssuesSymbol].length;}
_handleRequestFinished(event){const request=(event.data);const blockedResponseCookies=request.blockedResponseCookies();for(const blockedCookie of blockedResponseCookies){const cookie=blockedCookie.cookie;if(!cookie){continue;}
const issue=new Issue('SameSiteCookies::SameSiteNoneMissingForThirdParty');IssuesModel.connectWithIssue(request,issue);IssuesModel.connectWithIssue(cookie,issue);this._cookiesModel.addBlockedCookie(cookie,blockedCookie.blockedReasons.map(blockedReason=>({attribute:setCookieBlockedReasonToAttribute(blockedReason),uiString:setCookieBlockedReasonToUiString(blockedReason)})));}}}
export const Events={Updated:Symbol('Updated'),IssueAdded:Symbol('IssueAdded'),IssueUpdated:Symbol('IssueUpdated'),AllIssuesCleared:Symbol('AllIssuesCleared'),};SDKModel.register(IssuesModel,Capability.None,true);