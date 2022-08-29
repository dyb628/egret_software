import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';export class MarkerDecorator{decorate(node){}}
export class GenericDecorator{constructor(extension){this._title=Common.UIString.UIString(extension.title());this._color=extension.descriptor()['color'];}
decorate(node){return{title:this._title,color:this._color};}}