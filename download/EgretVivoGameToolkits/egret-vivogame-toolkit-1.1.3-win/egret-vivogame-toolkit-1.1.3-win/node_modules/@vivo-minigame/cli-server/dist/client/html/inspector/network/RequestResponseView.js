import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as SourceFrame from'../source_frame/source_frame.js';import*as UI from'../ui/ui.js';export class RequestResponseView extends UI.Widget.VBox{constructor(request){super();this.element.classList.add('request-view');this.request=request;this._contentViewPromise=null;}
static _hasTextContent(request,contentData){const mimeType=request.mimeType||'';let resourceType=Common.ResourceType.ResourceType.fromMimeType(mimeType);if(resourceType===Common.ResourceType.resourceTypes.Other){resourceType=request.contentType();}
if(resourceType===Common.ResourceType.resourceTypes.Image){return mimeType.startsWith('image/svg');}
if(resourceType.isTextType()){return true;}
if(contentData.error){return false;}
if(resourceType===Common.ResourceType.resourceTypes.Other){return!!contentData.content&&!contentData.encoded;}
return false;}
static async sourceViewForRequest(request){let sourceView=request[_sourceViewSymbol];if(sourceView!==undefined){return sourceView;}
const contentData=await request.contentData();if(!RequestResponseView._hasTextContent(request,contentData)){request[_sourceViewSymbol]=null;return null;}
const highlighterType=request.resourceType().canonicalMimeType()||request.mimeType;sourceView=SourceFrame.ResourceSourceFrame.ResourceSourceFrame.createSearchableView(request,highlighterType);request[_sourceViewSymbol]=sourceView;return sourceView;}
wasShown(){this._doShowPreview();}
_doShowPreview(){if(!this._contentViewPromise){this._contentViewPromise=this.showPreview();}
return this._contentViewPromise;}
async showPreview(){const responseView=await this.createPreview();responseView.show(this.element);return responseView;}
async createPreview(){const contentData=await this.request.contentData();const sourceView=await RequestResponseView.sourceViewForRequest(this.request);if((!contentData.content||!sourceView)&&!contentData.error){return new UI.EmptyWidget.EmptyWidget(Common.UIString.UIString('This request has no response data available.'));}
if(contentData.content&&sourceView){return sourceView;}
return new UI.EmptyWidget.EmptyWidget(Common.UIString.UIString('Failed to load response data'));}
async revealLine(line){const view=await this._doShowPreview();if(view instanceof SourceFrame.ResourceSourceFrame.SearchableContainer){view.revealPosition(line);}}}
export const _sourceViewSymbol=Symbol('RequestResponseSourceView');