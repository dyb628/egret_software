import*as Common from'../common/common.js';import*as PerfUI from'../perf_ui/perf_ui.js';import*as SDK from'../sdk/sdk.js';export class NetworkTimeBoundary{constructor(minimum,maximum){this.minimum=minimum;this.maximum=maximum;}
equals(other){return(this.minimum===other.minimum)&&(this.maximum===other.maximum);}}
export class NetworkTimeCalculator extends Common.ObjectWrapper.ObjectWrapper{constructor(startAtZero){super();this.startAtZero=startAtZero;this._minimumBoundary=-1;this._maximumBoundary=-1;this._boundryChangedEventThrottler=new Common.Throttler.Throttler(0);this._window=null;}
setWindow(window){this._window=window;this._boundaryChanged();}
setInitialUserFriendlyBoundaries(){this._minimumBoundary=0;this._maximumBoundary=1;}
computePosition(time){return(time-this.minimumBoundary())/this.boundarySpan()*this._workingArea;}
formatValue(value,precision){return Number.secondsToString(value,!!precision);}
minimumBoundary(){return this._window?this._window.minimum:this._minimumBoundary;}
zeroTime(){return this._minimumBoundary;}
maximumBoundary(){return this._window?this._window.maximum:this._maximumBoundary;}
boundary(){return new NetworkTimeBoundary(this.minimumBoundary(),this.maximumBoundary());}
boundarySpan(){return this.maximumBoundary()-this.minimumBoundary();}
reset(){this._minimumBoundary=-1;this._maximumBoundary=-1;this._boundaryChanged();}
_value(item){return 0;}
setDisplayWidth(clientWidth){this._workingArea=clientWidth;}
computeBarGraphPercentages(request){let start;let middle;let end;if(request.startTime!==-1){start=((request.startTime-this.minimumBoundary())/this.boundarySpan())*100;}else{start=0;}
if(request.responseReceivedTime!==-1){middle=((request.responseReceivedTime-this.minimumBoundary())/this.boundarySpan())*100;}else{middle=(this.startAtZero?start:100);}
if(request.endTime!==-1){end=((request.endTime-this.minimumBoundary())/this.boundarySpan())*100;}else{end=(this.startAtZero?middle:100);}
if(this.startAtZero){end-=start;middle-=start;start=0;}
return{start:start,middle:middle,end:end};}
computePercentageFromEventTime(eventTime){if(eventTime!==-1&&!this.startAtZero){return((eventTime-this.minimumBoundary())/this.boundarySpan())*100;}
return 0;}
percentageToTime(percentage){return percentage*this.boundarySpan()/100+this.minimumBoundary();}
_boundaryChanged(){this._boundryChangedEventThrottler.schedule(dispatchEvent.bind(this));function dispatchEvent(){this.dispatchEventToListeners(Events.BoundariesChanged);return Promise.resolve();}}
updateBoundariesForEventTime(eventTime){if(eventTime===-1||this.startAtZero){return;}
if(this._maximumBoundary===undefined||eventTime>this._maximumBoundary){this._maximumBoundary=eventTime;this._boundaryChanged();}}
computeBarGraphLabels(request){let rightLabel='';if(request.responseReceivedTime!==-1&&request.endTime!==-1){rightLabel=Number.secondsToString(request.endTime-request.responseReceivedTime);}
const hasLatency=request.latency>0;const leftLabel=hasLatency?Number.secondsToString(request.latency):rightLabel;if(request.timing){return{left:leftLabel,right:rightLabel};}
let tooltip;if(hasLatency&&rightLabel){const total=Number.secondsToString(request.duration);tooltip=_latencyDownloadTotalFormat.format(leftLabel,rightLabel,total);}else if(hasLatency){tooltip=_latencyFormat.format(leftLabel);}else if(rightLabel){tooltip=_downloadFormat.format(rightLabel);}
if(request.fetchedViaServiceWorker){tooltip=_fromServiceWorkerFormat.format(tooltip);}else if(request.cached()){tooltip=_fromCacheFormat.format(tooltip);}
return{left:leftLabel,right:rightLabel,tooltip:tooltip};}
updateBoundaries(request){const lowerBound=this._lowerBound(request);const upperBound=this._upperBound(request);let changed=false;if(lowerBound!==-1||this.startAtZero){changed=this._extendBoundariesToIncludeTimestamp(this.startAtZero?0:lowerBound);}
if(upperBound!==-1){changed=this._extendBoundariesToIncludeTimestamp(upperBound)||changed;}
if(changed){this._boundaryChanged();}}
_extendBoundariesToIncludeTimestamp(timestamp){const previousMinimumBoundary=this._minimumBoundary;const previousMaximumBoundary=this._maximumBoundary;const minOffset=_minimumSpread;if(this._minimumBoundary===-1||this._maximumBoundary===-1){this._minimumBoundary=timestamp;this._maximumBoundary=timestamp+minOffset;}else{this._minimumBoundary=Math.min(timestamp,this._minimumBoundary);this._maximumBoundary=Math.max(timestamp,this._minimumBoundary+minOffset,this._maximumBoundary);}
return previousMinimumBoundary!==this._minimumBoundary||previousMaximumBoundary!==this._maximumBoundary;}
_lowerBound(request){return 0;}
_upperBound(request){return 0;}}
export const _minimumSpread=0.1;export const Events={BoundariesChanged:Symbol('BoundariesChanged')};export const _latencyDownloadTotalFormat=new Common.UIString.UIStringFormat('%s latency, %s download (%s total)');export const _latencyFormat=new Common.UIString.UIStringFormat('%s latency');export const _downloadFormat=new Common.UIString.UIStringFormat('%s download');export const _fromServiceWorkerFormat=new Common.UIString.UIStringFormat('%s (from ServiceWorker)');export const _fromCacheFormat=new Common.UIString.UIStringFormat('%s (from cache)');export class NetworkTransferTimeCalculator extends NetworkTimeCalculator{constructor(){super(false);}
formatValue(value,precision){return Number.secondsToString(value-this.zeroTime(),!!precision);}
_lowerBound(request){return request.issueTime();}
_upperBound(request){return request.endTime;}}
export class NetworkTransferDurationCalculator extends NetworkTimeCalculator{constructor(){super(true);}
formatValue(value,precision){return Number.secondsToString(value,!!precision);}
_upperBound(request){return request.duration;}}