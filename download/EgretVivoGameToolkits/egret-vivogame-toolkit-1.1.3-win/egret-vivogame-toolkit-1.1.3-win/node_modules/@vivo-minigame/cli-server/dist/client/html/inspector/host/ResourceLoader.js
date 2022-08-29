import*as Common from'../common/common.js';import{InspectorFrontendHostInstance}from'./InspectorFrontendHost.js';export const ResourceLoader={};let _lastStreamId=0;const _boundStreams={};const _bindOutputStream=function(stream){_boundStreams[++_lastStreamId]=stream;return _lastStreamId;};const _discardOutputStream=function(id){_boundStreams[id].close();delete _boundStreams[id];};export const streamWrite=function(id,chunk){_boundStreams[id].write(chunk);};export let LoadErrorDescription;export let load=function(url,headers,callback){const stream=new Common.StringOutputStream.StringOutputStream();loadAsStream(url,headers,stream,mycallback);function mycallback(success,headers,errorDescription){callback(success,headers,stream.data(),errorDescription);}};export function setLoadForTest(newLoad){load=newLoad;}
function getNetErrorCategory(netError){if(netError>-100){return ls`System error`;}
if(netError>-200){return ls`Connection error`;}
if(netError>-300){return ls`Certificate error`;}
if(netError>-400){return ls`HTTP error`;}
if(netError>-500){return ls`Cache error`;}
if(netError>-600){return ls`Signed Exchange error`;}
if(netError>-700){return ls`FTP error`;}
if(netError>-800){return ls`Certificate manager error`;}
if(netError>-900){return ls`DNS resolver error`;}
return ls`Unknown error`;}
function isHTTPError(netError){return netError<=-300&&netError>-400;}
function createErrorMessageFromResponse(response){const{statusCode,netError,netErrorName,urlValid,messageOverride}=response;let message='';const success=statusCode>=200&&statusCode<300;if(typeof messageOverride==='string'){message=messageOverride;}else if(!success){if(typeof netError==='undefined'){if(urlValid===false){message=ls`Invalid URL`;}else{message=ls`Unknown error`;}}else{if(netError!==0){if(isHTTPError(netError)){message+=ls`HTTP error: status code ${statusCode}, ${netErrorName}`;}else{const errorCategory=getNetErrorCategory(netError);message=`${errorCategory}: ${netErrorName}`;}}}}
console.assert(success===(message.length===0));return{success,description:{statusCode,netError,netErrorName,urlValid,message}};}
export const loadAsStream=function(url,headers,stream,callback){const streamId=_bindOutputStream(stream);const parsedURL=new Common.ParsedURL.ParsedURL(url);if(parsedURL.isDataURL()){loadXHR(url).then(dataURLDecodeSuccessful).catch(dataURLDecodeFailed);return;}
const rawHeaders=[];if(headers){for(const key in headers){rawHeaders.push(key+': '+headers[key]);}}
InspectorFrontendHostInstance.loadNetworkResource(url,rawHeaders.join('\r\n'),streamId,finishedCallback);function finishedCallback(response){if(callback){const{success,description}=createErrorMessageFromResponse(response);callback(success,response.headers||{},description);}
_discardOutputStream(streamId);}
function dataURLDecodeSuccessful(text){streamWrite(streamId,text);finishedCallback(({statusCode:200}));}
function dataURLDecodeFailed(xhrStatus){const messageOverride=ls`Decoding Data URL failed`;finishedCallback(({statusCode:404,messageOverride}));}};