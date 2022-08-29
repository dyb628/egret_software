import*as Bindings from'../bindings/bindings.js';import*as Common from'../common/common.js';import*as Host from'../host/host.js';import*as UI from'../ui/ui.js';export class Linkifier{constructor(maxLengthForDisplayedURLs,useLinkDecorator){this._maxLength=maxLengthForDisplayedURLs||UI.UIUtils.MaxLengthForDisplayedURLs;this._anchorsByTarget=new Map();this._locationPoolByTarget=new Map();this._useLinkDecorator=!!useLinkDecorator;_instances.add(this);self.SDK.targetManager.observeTargets(this);}
static setLinkDecorator(decorator){console.assert(!_decorator,'Cannot re-register link decorator.');_decorator=decorator;decorator.addEventListener(LinkDecorator.Events.LinkIconChanged,onLinkIconChanged);for(const linkifier of _instances){linkifier._updateAllAnchorDecorations();}
function onLinkIconChanged(event){const uiSourceCode=(event.data);const links=uiSourceCode[_sourceCodeAnchors]||[];for(const link of links){Linkifier._updateLinkDecorations(link);}}}
_updateAllAnchorDecorations(){for(const anchors of this._anchorsByTarget.values()){for(const anchor of anchors){Linkifier._updateLinkDecorations(anchor);}}}
static _bindUILocation(anchor,uiLocation){Linkifier._linkInfo(anchor).uiLocation=uiLocation;if(!uiLocation){return;}
const uiSourceCode=uiLocation.uiSourceCode;let sourceCodeAnchors=uiSourceCode[_sourceCodeAnchors];if(!sourceCodeAnchors){sourceCodeAnchors=new Set();uiSourceCode[_sourceCodeAnchors]=sourceCodeAnchors;}
sourceCodeAnchors.add(anchor);}
static _unbindUILocation(anchor){const info=Linkifier._linkInfo(anchor);if(!info.uiLocation){return;}
const uiSourceCode=info.uiLocation.uiSourceCode;info.uiLocation=null;const sourceCodeAnchors=uiSourceCode[_sourceCodeAnchors];if(sourceCodeAnchors){sourceCodeAnchors.delete(anchor);}}
targetAdded(target){this._anchorsByTarget.set(target,[]);this._locationPoolByTarget.set(target,new Bindings.LiveLocation.LiveLocationPool());}
targetRemoved(target){const locationPool=(this._locationPoolByTarget.remove(target));locationPool.disposeAll();const anchors=this._anchorsByTarget.remove(target);for(const anchor of anchors){const info=Linkifier._linkInfo(anchor);info.liveLocation=null;Linkifier._unbindUILocation(anchor);if(info.fallback){anchor.href=info.fallback.href;anchor.title=info.fallback.title;anchor.className=info.fallback.className;anchor.textContent=info.fallback.textContent;anchor[_infoSymbol]=info.fallback[_infoSymbol];}}}
maybeLinkifyScriptLocation(target,scriptId,sourceURL,lineNumber,options){const parsedOptions={className:'',columnNumber:0,...options};const{columnNumber,className}=parsedOptions;let fallbackAnchor=null;if(sourceURL){fallbackAnchor=Linkifier.linkifyURL(sourceURL,{lineNumber,maxLength:this._maxLength,...options});}
if(!target||target.isDisposed()){return fallbackAnchor;}
const debuggerModel=target.model(SDK.DebuggerModel);if(!debuggerModel){return fallbackAnchor;}
let rawLocation;if(scriptId){rawLocation=debuggerModel.createRawLocationByScriptId(scriptId,lineNumber,columnNumber);}else{rawLocation=debuggerModel.createRawLocationByURL(sourceURL,lineNumber,columnNumber);}
if(!rawLocation){return fallbackAnchor;}
const anchor=Linkifier._createLink('',className,options);const info=Linkifier._linkInfo(anchor);info.enableDecorator=this._useLinkDecorator;info.fallback=fallbackAnchor;info.liveLocation=self.Bindings.debuggerWorkspaceBinding.createLiveLocation(rawLocation,this._updateAnchor.bind(this,anchor),(this._locationPoolByTarget.get(rawLocation.debuggerModel.target())));const anchors=(this._anchorsByTarget.get(rawLocation.debuggerModel.target()));anchors.push(anchor);return anchor;}
linkifyScriptLocation(target,scriptId,sourceURL,lineNumber,options){const scriptLink=this.maybeLinkifyScriptLocation(target,scriptId,sourceURL,lineNumber,options);return scriptLink||Linkifier.linkifyURL(sourceURL,{lineNumber,maxLength:this._maxLength,...options});}
linkifyRawLocation(rawLocation,fallbackUrl,className){return this.linkifyScriptLocation(rawLocation.debuggerModel.target(),rawLocation.scriptId,fallbackUrl,rawLocation.lineNumber,{columnNumber:rawLocation.columnNumber,className});}
maybeLinkifyConsoleCallFrame(target,callFrame,options){return this.maybeLinkifyScriptLocation(target,callFrame.scriptId,callFrame.url,callFrame.lineNumber,options);}
linkifyStackTraceTopFrame(target,stackTrace,classes){console.assert(stackTrace.callFrames&&stackTrace.callFrames.length);const topFrame=stackTrace.callFrames[0];const fallbackAnchor=Linkifier.linkifyURL(topFrame.url,{className:classes,lineNumber:topFrame.lineNumber,columnNumber:topFrame.columnNumber,maxLength:this._maxLength});if(target.isDisposed()){return fallbackAnchor;}
const debuggerModel=target.model(SDK.DebuggerModel);const rawLocations=debuggerModel.createRawLocationsByStackTrace(stackTrace);if(rawLocations.length===0){return fallbackAnchor;}
const anchor=Linkifier._createLink('',classes||'');const info=Linkifier._linkInfo(anchor);info.enableDecorator=this._useLinkDecorator;info.fallback=fallbackAnchor;info.liveLocation=self.Bindings.debuggerWorkspaceBinding.createStackTraceTopFrameLiveLocation(rawLocations,this._updateAnchor.bind(this,anchor),(this._locationPoolByTarget.get(target)));const anchors=(this._anchorsByTarget.get(target));anchors.push(anchor);return anchor;}
linkifyCSSLocation(rawLocation,classes){const anchor=Linkifier._createLink('',classes||'');const info=Linkifier._linkInfo(anchor);info.enableDecorator=this._useLinkDecorator;info.liveLocation=self.Bindings.cssWorkspaceBinding.createLiveLocation(rawLocation,this._updateAnchor.bind(this,anchor),(this._locationPoolByTarget.get(rawLocation.cssModel().target())));const anchors=(this._anchorsByTarget.get(rawLocation.cssModel().target()));anchors.push(anchor);return anchor;}
reset(){for(const target of[...this._anchorsByTarget.keys()]){this.targetRemoved(target);this.targetAdded(target);}}
dispose(){for(const target of[...this._anchorsByTarget.keys()]){this.targetRemoved(target);}
self.SDK.targetManager.unobserveTargets(this);_instances.delete(this);}
_updateAnchor(anchor,liveLocation){Linkifier._unbindUILocation(anchor);const uiLocation=liveLocation.uiLocation();if(!uiLocation){return;}
Linkifier._bindUILocation(anchor,uiLocation);const text=uiLocation.linkText(true);Linkifier._setTrimmedText(anchor,text,this._maxLength);let titleText=uiLocation.uiSourceCode.url();if(typeof uiLocation.lineNumber==='number'){titleText+=':'+(uiLocation.lineNumber+1);}
anchor.title=titleText;anchor.classList.toggle('webkit-html-blackbox-link',liveLocation.isBlackboxed());Linkifier._updateLinkDecorations(anchor);}
static _updateLinkDecorations(anchor){const info=Linkifier._linkInfo(anchor);if(!info||!info.enableDecorator){return;}
if(!_decorator||!info.uiLocation){return;}
if(info.icon&&info.icon.parentElement){anchor.removeChild(info.icon);}
const icon=_decorator.linkIcon(info.uiLocation.uiSourceCode);if(icon){icon.style.setProperty('margin-right','2px');anchor.insertBefore(icon,anchor.firstChild);}
info.icon=icon;}
static linkifyURL(url,options){options=options||{};const text=options.text;const className=options.className||'';const lineNumber=options.lineNumber;const columnNumber=options.columnNumber;const preventClick=options.preventClick;const maxLength=options.maxLength||UI.UIUtils.MaxLengthForDisplayedURLs;const bypassURLTrimming=options.bypassURLTrimming;if(!url||url.trim().toLowerCase().startsWith('javascript:')){const element=createElementWithClass('span',className);element.textContent=text||url||Common.UIString.UIString('(unknown)');return element;}
let linkText=text||Bindings.ResourceUtils.displayNameForURL(url);if(typeof lineNumber==='number'&&!text){linkText+=':'+(lineNumber+1);}
const title=linkText!==url?url:'';const linkOptions={maxLength,title,href:url,preventClick,tabStop:options.tabStop,bypassURLTrimming};const link=Linkifier._createLink(linkText,className,linkOptions);const info=Linkifier._linkInfo(link);if(typeof lineNumber==='number'){info.lineNumber=lineNumber;}
if(typeof columnNumber==='number'){info.columnNumber=columnNumber;}
return link;}
static linkifyRevealable(revealable,text,fallbackHref){const link=Linkifier._createLink(text,'',{maxLength:UI.UIUtils.MaxLengthForDisplayedURLs,href:fallbackHref});Linkifier._linkInfo(link).revealable=revealable;return link;}
static _createLink(text,className,options){options=options||{};const{maxLength,title,href,preventClick,tabStop,bypassURLTrimming}=options;const link=createElementWithClass('span',className);link.classList.add('devtools-link');if(title){link.title=title;}
if(href){link.href=href;}
if(bypassURLTrimming){link.classList.add('devtools-link-styled-trim');Linkifier._appendTextWithoutHashes(link,text);}else{Linkifier._setTrimmedText(link,text,maxLength);}
link[_infoSymbol]={icon:null,enableDecorator:false,uiLocation:null,liveLocation:null,url:href||null,lineNumber:null,columnNumber:null,revealable:null,fallback:null};if(!preventClick){link.addEventListener('click',event=>{if(Linkifier._handleClick(event)){event.consume(true);}},false);link.addEventListener('keydown',event=>{if(isEnterKey(event)&&Linkifier._handleClick(event)){event.consume(true);}},false);}else{link.classList.add('devtools-link-prevent-click');}
UI.ARIAUtils.markAsLink(link);link.tabIndex=tabStop?0:-1;return link;}
static _setTrimmedText(link,text,maxLength){link.removeChildren();if(maxLength&&text.length>maxLength){const middleSplit=splitMiddle(text,maxLength);Linkifier._appendTextWithoutHashes(link,middleSplit[0]);Linkifier._appendHiddenText(link,middleSplit[1]);Linkifier._appendTextWithoutHashes(link,middleSplit[2]);}else{Linkifier._appendTextWithoutHashes(link,text);}
function splitMiddle(string,maxLength){let leftIndex=Math.floor(maxLength/2);let rightIndex=string.length-Math.ceil(maxLength/2)+1;if(string.codePointAt(rightIndex-1)>=0x10000){rightIndex++;leftIndex++;}
if(leftIndex>0&&string.codePointAt(leftIndex-1)>=0x10000){leftIndex--;}
return[string.substring(0,leftIndex),string.substring(leftIndex,rightIndex),string.substring(rightIndex)];}}
static _appendTextWithoutHashes(link,string){const hashSplit=TextUtils.TextUtils.splitStringByRegexes(string,[/[a-f0-9]{20,}/g]);for(const match of hashSplit){if(match.regexIndex===-1){link.createTextChild(match.value);}else{link.createTextChild(match.value.substring(0,7));Linkifier._appendHiddenText(link,match.value.substring(7));}}}
static _appendHiddenText(link,string){const ellipsisNode=link.createChild('span','devtools-link-ellipsis').createTextChild('…');ellipsisNode[_untruncatedNodeTextSymbol]=string;}
static untruncatedNodeText(node){return node[_untruncatedNodeTextSymbol]||node.textContent;}
static _linkInfo(link){return(link?link[_infoSymbol]||null:null);}
static _handleClick(event){const link=(event.currentTarget);if(UI.UIUtils.isBeingEdited((event.target))||link.hasSelection()){return false;}
return Linkifier.invokeFirstAction(link);}
static invokeFirstAction(link){const actions=Linkifier._linkActions(link);if(actions.length){actions[0].handler.call(null);return true;}
return false;}
static _linkHandlerSetting(){if(!Linkifier._linkHandlerSettingInstance){Linkifier._linkHandlerSettingInstance=self.Common.settings.createSetting('openLinkHandler',ls`auto`);}
return Linkifier._linkHandlerSettingInstance;}
static registerLinkHandler(title,handler){_linkHandlers.set(title,handler);self.runtime.sharedInstance(LinkHandlerSettingUI)._update();}
static unregisterLinkHandler(title){_linkHandlers.delete(title);self.runtime.sharedInstance(LinkHandlerSettingUI)._update();}
static uiLocation(link){const info=Linkifier._linkInfo(link);return info?info.uiLocation:null;}
static _linkActions(link){const info=Linkifier._linkInfo(link);const result=[];if(!info){return result;}
let url='';let uiLocation=null;if(info.uiLocation){uiLocation=info.uiLocation;url=uiLocation.uiSourceCode.contentURL();}else if(info.url){url=info.url;const uiSourceCode=self.Workspace.workspace.uiSourceCodeForURL(url)||self.Workspace.workspace.uiSourceCodeForURL(Common.ParsedURL.ParsedURL.urlWithoutHash(url));uiLocation=uiSourceCode?uiSourceCode.uiLocation(info.lineNumber||0,info.columnNumber||0):null;}
const resource=url?Bindings.ResourceUtils.resourceForURL(url):null;const contentProvider=uiLocation?uiLocation.uiSourceCode:resource;const revealable=info.revealable||uiLocation||resource;if(revealable){const destination=Common.Revealer.revealDestination(revealable);result.push({section:'reveal',title:destination?ls`Reveal in ${destination}`:ls`Reveal`,handler:()=>Common.Revealer.reveal(revealable)});}
if(contentProvider){const lineNumber=uiLocation?uiLocation.lineNumber:info.lineNumber||0;for(const title of _linkHandlers.keys()){const handler=_linkHandlers.get(title);const action={section:'reveal',title:Common.UIString.UIString('Open using %s',title),handler:handler.bind(null,contentProvider,lineNumber)};if(title===Linkifier._linkHandlerSetting().get()){result.unshift(action);}else{result.push(action);}}}
if(resource||info.url){result.push({section:'reveal',title:UI.UIUtils.openLinkExternallyLabel(),handler:()=>Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(url)});result.push({section:'clipboard',title:UI.UIUtils.copyLinkAddressLabel(),handler:()=>Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(url)});}
return result;}}
const _instances=new Set();let _decorator=null;const _sourceCodeAnchors=Symbol('Linkifier.anchors');const _infoSymbol=Symbol('Linkifier.info');const _untruncatedNodeTextSymbol=Symbol('Linkifier.untruncatedNodeText');const _linkHandlers=new Map();export class LinkDecorator{linkIcon(uiSourceCode){}}
LinkDecorator.Events={LinkIconChanged:Symbol('LinkIconChanged')};export class LinkContextMenuProvider{appendApplicableItems(event,contextMenu,target){let targetNode=(target);while(targetNode&&!targetNode[_infoSymbol]){targetNode=targetNode.parentNodeOrShadowHost();}
const link=(targetNode);const actions=Linkifier._linkActions(link);for(const action of actions){contextMenu.section(action.section).appendItem(action.title,action.handler);}}}
export class LinkHandlerSettingUI{constructor(){this._element=createElementWithClass('select','chrome-select');this._element.addEventListener('change',this._onChange.bind(this),false);this._update();}
_update(){this._element.removeChildren();const names=[..._linkHandlers.keys()];names.unshift(Common.UIString.UIString('auto'));for(const name of names){const option=createElement('option');option.textContent=name;option.selected=name===Linkifier._linkHandlerSetting().get();this._element.appendChild(option);}
this._element.disabled=names.length<=1;}
_onChange(event){const value=event.target.value;Linkifier._linkHandlerSetting().set(value);}
settingElement(){return UI.SettingsUI.createCustomSetting(Common.UIString.UIString('Link handling:'),this._element);}}
export class ContentProviderContextMenuProvider{appendApplicableItems(event,contextMenu,target){const contentProvider=(target);if(!contentProvider.contentURL()){return;}
contextMenu.revealSection().appendItem(UI.UIUtils.openLinkExternallyLabel(),()=>Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(contentProvider.contentURL()));for(const title of _linkHandlers.keys()){const handler=_linkHandlers.get(title);contextMenu.revealSection().appendItem(Common.UIString.UIString('Open using %s',title),handler.bind(null,contentProvider,0));}
if(contentProvider instanceof SDK.NetworkRequest){return;}
contextMenu.clipboardSection().appendItem(UI.UIUtils.copyLinkAddressLabel(),()=>Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(contentProvider.contentURL()));}}