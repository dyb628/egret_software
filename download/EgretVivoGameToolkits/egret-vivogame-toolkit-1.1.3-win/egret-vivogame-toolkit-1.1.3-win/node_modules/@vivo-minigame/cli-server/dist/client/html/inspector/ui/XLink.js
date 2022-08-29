import*as Host from'../host/host.js';import*as ARIAUtils from'./ARIAUtils.js';import{ContextMenu,Provider}from'./ContextMenu.js';import{html}from'./Fragment.js';import{copyLinkAddressLabel,MaxLengthForDisplayedURLs,openLinkExternallyLabel}from'./UIUtils.js';import{XElement}from'./XElement.js';export class XLink extends XElement{static create(url,linkText,className,preventClick){if(!linkText){linkText=url;}
className=className||'';return html`
        <x-link href='${url}' class='${className} devtools-link' ${preventClick ? 'no-click' : ''}
        >${linkText.trimMiddle(MaxLengthForDisplayedURLs)}</x-link>`;}
constructor(){super();this.style.setProperty('display','inline');ARIAUtils.markAsLink(this);this.tabIndex=0;this.target='_blank';this.rel='noopener';this._href=null;this._clickable=true;this._onClick=event=>{event.consume(true);Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab((this._href));};this._onKeyDown=event=>{if(isEnterOrSpaceKey(event)){event.consume(true);Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab((this._href));}};}
static get observedAttributes(){return XElement.observedAttributes.concat(['href','no-click']);}
attributeChangedCallback(attr,oldValue,newValue){if(attr==='no-click'){this._clickable=!newValue;this._updateClick();return;}
if(attr==='href'){if(!newValue){newValue='';}
let href=null;let url=null;try{url=new URL(newValue);href=url.toString();}catch(error){}
if(url&&url.protocol==='javascript:'){href=null;}
this._href=href;this.title=newValue;this._updateClick();return;}
super.attributeChangedCallback(attr,oldValue,newValue);}
_updateClick(){if(this._href!==null&&this._clickable){this.addEventListener('click',this._onClick,false);this.addEventListener('keydown',this._onKeyDown,false);this.style.setProperty('cursor','pointer');}else{this.removeEventListener('click',this._onClick,false);this.removeEventListener('keydown',this._onKeyDown,false);this.style.removeProperty('cursor');}}}
export class ContextMenuProvider{appendApplicableItems(event,contextMenu,target){let targetNode=(target);while(targetNode&&!(targetNode instanceof XLink)){targetNode=targetNode.parentNodeOrShadowHost();}
if(!targetNode||!targetNode._href){return;}
contextMenu.revealSection().appendItem(openLinkExternallyLabel(),()=>Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(targetNode._href));contextMenu.revealSection().appendItem(copyLinkAddressLabel(),()=>Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(targetNode._href));}}
self.customElements.define('x-link',XLink);