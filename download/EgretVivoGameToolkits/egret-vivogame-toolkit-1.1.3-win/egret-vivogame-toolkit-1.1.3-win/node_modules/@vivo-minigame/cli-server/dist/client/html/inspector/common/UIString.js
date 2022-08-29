import*as Platform from'../platform/platform.js';export function UIString(string,vararg){return Platform.StringUtilities.vsprintf(localize(string),Array.prototype.slice.call(arguments,1));}
export function serializeUIString(string,values=[]){const messageParts=[string];const serializedMessage={messageParts,values};return JSON.stringify(serializedMessage);}
export function deserializeUIString(serializedMessage){if(!serializedMessage){return{};}
return JSON.parse(serializedMessage);}
export function localize(string){return string;}
export class UIStringFormat{constructor(format){this._localizedFormat=localize(format);this._tokenizedFormat=Platform.StringUtilities.tokenizeFormatString(this._localizedFormat,Platform.StringUtilities.standardFormatters);}
static _append(a,b){return a+b;}
format(vararg){return Platform.StringUtilities.format(this._localizedFormat,arguments,Platform.StringUtilities.standardFormatters,'',UIStringFormat._append,this._tokenizedFormat).formattedResult;}}
const _substitutionStrings=new WeakMap();export function ls(strings,vararg){if(typeof strings==='string'){return strings;}
let substitutionString=_substitutionStrings.get(strings);if(!substitutionString){substitutionString=strings.join('%s');_substitutionStrings.set(strings,substitutionString);}
return UIString(substitutionString,...Array.prototype.slice.call(arguments,1));}