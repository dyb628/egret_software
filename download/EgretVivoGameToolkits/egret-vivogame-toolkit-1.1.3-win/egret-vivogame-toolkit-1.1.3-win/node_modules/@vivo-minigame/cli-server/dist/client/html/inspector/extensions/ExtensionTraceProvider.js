export class ExtensionTraceProvider{constructor(extensionOrigin,id,categoryName,categoryTooltip){this._extensionOrigin=extensionOrigin;this._id=id;this._categoryName=categoryName;this._categoryTooltip=categoryTooltip;}
start(session){const sessionId=String(++_lastSessionId);self.Extensions.extensionServer.startTraceRecording(this._id,sessionId,session);}
stop(){self.Extensions.extensionServer.stopTraceRecording(this._id);}
shortDisplayName(){return this._categoryName;}
longDisplayName(){return this._categoryTooltip;}
persistentIdentifier(){return`${this._extensionOrigin}/${this._categoryName}`;}}
let _lastSessionId=0;export class TracingSession{complete(url,timeOffsetMicroseconds){}}