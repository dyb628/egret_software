import*as SDK from'../sdk/sdk.js';import{RecordType,TimelineModelImpl}from'./TimelineModel.js';export class TimelineModelFilter{accept(event){return true;}}
export class TimelineVisibleEventsFilter extends TimelineModelFilter{constructor(visibleTypes){super();this._visibleTypes=new Set(visibleTypes);}
accept(event){return this._visibleTypes.has(TimelineVisibleEventsFilter._eventType(event));}
static _eventType(event){if(event.hasCategory(TimelineModelImpl.Category.Console)){return RecordType.ConsoleTime;}
if(event.hasCategory(TimelineModelImpl.Category.UserTiming)){return RecordType.UserTiming;}
if(event.hasCategory(TimelineModelImpl.Category.LatencyInfo)){return RecordType.LatencyInfo;}
return(event.name);}}
export class TimelineInvisibleEventsFilter extends TimelineModelFilter{constructor(invisibleTypes){super();this._invisibleTypes=new Set(invisibleTypes);}
accept(event){return!this._invisibleTypes.has(TimelineVisibleEventsFilter._eventType(event));}}
export class ExclusiveNameFilter extends TimelineModelFilter{constructor(excludeNames){super();this._excludeNames=new Set(excludeNames);}
accept(event){return!this._excludeNames.has(event.name);}}