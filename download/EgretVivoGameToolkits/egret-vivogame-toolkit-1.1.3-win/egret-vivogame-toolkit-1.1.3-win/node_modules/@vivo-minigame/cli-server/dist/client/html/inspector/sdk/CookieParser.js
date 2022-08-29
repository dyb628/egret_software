import{Cookie,Type}from'./Cookie.js';export class CookieParser{constructor(domain){if(domain){this._domain=domain.toLowerCase().replace(/^\./,'');}}
static parseCookie(header){return(new CookieParser()).parseCookie(header);}
static parseSetCookie(header,domain){return(new CookieParser(domain)).parseSetCookie(header);}
cookies(){return this._cookies;}
parseCookie(cookieHeader){if(!this._initialize(cookieHeader)){return null;}
for(let kv=this._extractKeyValue();kv;kv=this._extractKeyValue()){if(kv.key.charAt(0)==='$'&&this._lastCookie){this._lastCookie.addAttribute(kv.key.slice(1),kv.value);}else if(kv.key.toLowerCase()!=='$version'&&typeof kv.value==='string'){this._addCookie(kv,Type.Request);}
this._advanceAndCheckCookieDelimiter();}
this._flushCookie();return this._cookies;}
parseSetCookie(setCookieHeader){if(!this._initialize(setCookieHeader)){return null;}
for(let kv=this._extractKeyValue();kv;kv=this._extractKeyValue()){if(this._lastCookie){this._lastCookie.addAttribute(kv.key,kv.value);}else{this._addCookie(kv,Type.Response);}
if(this._advanceAndCheckCookieDelimiter()){this._flushCookie();}}
this._flushCookie();return this._cookies;}
_initialize(headerValue){this._input=headerValue;if(typeof headerValue!=='string'){return false;}
this._cookies=[];this._lastCookie=null;this._lastCookieLine='';this._originalInputLength=this._input.length;return true;}
_flushCookie(){if(this._lastCookie){this._lastCookie.setSize(this._originalInputLength-this._input.length-this._lastCookiePosition);this._lastCookie.setCookieLine(this._lastCookieLine.replace('\n',''));}
this._lastCookie=null;this._lastCookieLine='';}
_extractKeyValue(){if(!this._input||!this._input.length){return null;}
const keyValueMatch=/^[ \t]*([^\s=;]+)[ \t]*(?:=[ \t]*([^;\n]*))?/.exec(this._input);if(!keyValueMatch){console.error('Failed parsing cookie header before: '+this._input);return null;}
const result=new KeyValue(keyValueMatch[1],keyValueMatch[2]&&keyValueMatch[2].trim(),this._originalInputLength-this._input.length);this._lastCookieLine+=keyValueMatch[0];this._input=this._input.slice(keyValueMatch[0].length);return result;}
_advanceAndCheckCookieDelimiter(){const match=/^\s*[\n;]\s*/.exec(this._input);if(!match){return false;}
this._lastCookieLine+=match[0];this._input=this._input.slice(match[0].length);return match[0].match('\n')!==null;}
_addCookie(keyValue,type){if(this._lastCookie){this._lastCookie.setSize(keyValue.position-this._lastCookiePosition);}
this._lastCookie=typeof keyValue.value==='string'?new Cookie(keyValue.key,keyValue.value,type):new Cookie('',keyValue.key,type);if(this._domain){this._lastCookie.addAttribute('domain',this._domain);}
this._lastCookiePosition=keyValue.position;this._cookies.push(this._lastCookie);}}
class KeyValue{constructor(key,value,position){this.key=key;this.value=value;this.position=position;}}