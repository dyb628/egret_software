export class Cookie{constructor(name,value,type,priority){this._name=name;this._value=value;this._type=type;this._attributes={};this._size=0;this._priority=(priority||'Medium');this._cookieLine=null;}
static fromProtocolCookie(protocolCookie){const cookie=new Cookie(protocolCookie.name,protocolCookie.value,null,protocolCookie.priority);cookie.addAttribute('domain',protocolCookie['domain']);cookie.addAttribute('path',protocolCookie['path']);cookie.addAttribute('port',protocolCookie['port']);if(protocolCookie['expires']){cookie.addAttribute('expires',protocolCookie['expires']*1000);}
if(protocolCookie['httpOnly']){cookie.addAttribute('httpOnly');}
if(protocolCookie['secure']){cookie.addAttribute('secure');}
if(protocolCookie['sameSite']){cookie.addAttribute('sameSite',protocolCookie['sameSite']);}
cookie.setSize(protocolCookie['size']);return cookie;}
key(){return(this.domain()||'-')+' '+this.name()+' '+(this.path()||'-');}
name(){return this._name;}
value(){return this._value;}
type(){return this._type;}
httpOnly(){return'httponly'in this._attributes;}
secure(){return'secure'in this._attributes;}
sameSite(){return(this._attributes['samesite']);}
priority(){return this._priority;}
session(){return!('expires'in this._attributes||'max-age'in this._attributes);}
path(){return this._attributes['path'];}
port(){return this._attributes['port'];}
domain(){return this._attributes['domain'];}
expires(){return this._attributes['expires'];}
maxAge(){return this._attributes['max-age'];}
size(){return this._size;}
url(){if(!this.domain()||!this.path()){return null;}
return(this.secure()?'https://':'http://')+this.domain()+this.path();}
setSize(size){this._size=size;}
expiresDate(requestDate){if(this.maxAge()){return new Date(requestDate.getTime()+1000*this.maxAge());}
if(this.expires()){return new Date(this.expires());}
return null;}
addAttribute(key,value){const normalizedKey=key.toLowerCase();switch(normalizedKey){case'priority':this._priority=(value);break;default:this._attributes[normalizedKey]=value;}}
setCookieLine(cookieLine){this._cookieLine=cookieLine;}
getCookieLine(){return this._cookieLine;}}
export const Type={Request:0,Response:1};export const Attributes={Name:'name',Value:'value',Size:'size',Domain:'domain',Path:'path',Expires:'expires',HttpOnly:'httpOnly',Secure:'secure',SameSite:'sameSite',Priority:'priority',};