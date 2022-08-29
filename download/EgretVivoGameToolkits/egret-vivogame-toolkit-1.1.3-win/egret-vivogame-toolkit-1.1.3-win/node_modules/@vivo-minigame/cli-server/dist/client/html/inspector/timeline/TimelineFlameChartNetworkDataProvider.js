import*as Common from'../common/common.js';import*as Host from'../host/host.js';import*as PerfUI from'../perf_ui/perf_ui.js';import*as TimelineModel from'../timeline_model/timeline_model.js';import*as UI from'../ui/ui.js';import{PerformanceModel}from'./PerformanceModel.js';import{FlameChartStyle,Selection}from'./TimelineFlameChartView.js';import{TimelineSelection}from'./TimelinePanel.js';import{TimelineUIUtils}from'./TimelineUIUtils.js';export class TimelineFlameChartNetworkDataProvider{constructor(){this._font='11px '+Host.Platform.fontFamily();this.setModel(null);this._style={padding:4,height:17,collapsible:true,color:self.UI.themeSupport.patchColorText('#222',UI.UIUtils.ThemeSupport.ColorUsage.Foreground),font:this._font,backgroundColor:self.UI.themeSupport.patchColorText('white',UI.UIUtils.ThemeSupport.ColorUsage.Background),nestingLevel:0,useFirstLineForOverview:false,useDecoratorsForOverview:true,shareHeaderLine:false};this._group={startLevel:0,name:Common.UIString.UIString('Network'),expanded:false,style:this._style};this._minimumBoundary=0;this._maximumBoundary=0;this._timeSpan=0;}
setModel(performanceModel){this._model=performanceModel&&performanceModel.timelineModel();this._maxLevel=0;this._timelineData=null;this._requests=[];}
isEmpty(){this.timelineData();return!this._requests.length;}
maxStackDepth(){return this._maxLevel;}
timelineData(){if(this._timelineData){return this._timelineData;}
this._requests=[];this._timelineData=new PerfUI.FlameChart.TimelineData([],[],[],[]);if(this._model){this._appendTimelineData();}
return this._timelineData;}
minimumBoundary(){return this._minimumBoundary;}
totalTime(){return this._timeSpan;}
setWindowTimes(startTime,endTime){this._startTime=startTime;this._endTime=endTime;this._updateTimelineData();}
createSelection(index){if(index===-1){return null;}
const request=this._requests[index];this._lastSelection=new Selection(TimelineSelection.fromNetworkRequest(request),index);return this._lastSelection.timelineSelection;}
entryIndexForSelection(selection){if(!selection){return-1;}
if(this._lastSelection&&this._lastSelection.timelineSelection.object()===selection.object()){return this._lastSelection.entryIndex;}
if(selection.type()!==TimelineSelection.Type.NetworkRequest){return-1;}
const request=(selection.object());const index=this._requests.indexOf(request);if(index!==-1){this._lastSelection=new Selection(TimelineSelection.fromNetworkRequest(request),index);}
return index;}
entryColor(index){const request=(this._requests[index]);const category=TimelineUIUtils.networkRequestCategory(request);return TimelineUIUtils.networkCategoryColor(category);}
textColor(index){return FlameChartStyle.textColor;}
entryTitle(index){const request=(this._requests[index]);const parsedURL=new Common.ParsedURL.ParsedURL(request.url||'');return parsedURL.isValid?`${parsedURL.displayName} (${parsedURL.host})`:request.url||null;}
entryFont(index){return this._font;}
decorateEntry(index,context,text,barX,barY,barWidth,barHeight,unclippedBarX,timeToPixelRatio){const request=(this._requests[index]);if(!request.timing){return false;}
const beginTime=request.beginTime();const timeToPixel=time=>Math.floor(unclippedBarX+(time-beginTime)*timeToPixelRatio);const minBarWidthPx=2;const startTime=request.getStartTime();const endTime=request.endTime;const{sendStartTime,headersEndTime}=request.getSendReceiveTiming();const sendStart=Math.max(timeToPixel(sendStartTime),unclippedBarX);const headersEnd=Math.max(timeToPixel(headersEndTime),sendStart);const finish=Math.max(timeToPixel(request.finishTime||endTime),headersEnd+minBarWidthPx);const start=timeToPixel(startTime);const end=Math.max(timeToPixel(endTime),finish);context.fillStyle='hsla(0, 100%, 100%, 0.8)';context.fillRect(sendStart+0.5,barY+0.5,headersEnd-sendStart-0.5,barHeight-2);context.fillStyle=self.UI.themeSupport.patchColorText('white',UI.UIUtils.ThemeSupport.ColorUsage.Background);context.fillRect(barX,barY-0.5,sendStart-barX,barHeight);context.fillRect(finish,barY-0.5,barX+barWidth-finish,barHeight);if(!request.cached()&&request.timing.pushStart){const pushStart=timeToPixel(request.timing.pushStart*1000);const pushEnd=request.timing.pushEnd?timeToPixel(request.timing.pushEnd*1000):start;const dentSize=Number.constrain(pushEnd-pushStart-2,0,4);const padding=1;context.save();context.beginPath();context.moveTo(pushStart+dentSize,barY+barHeight/2);context.lineTo(pushStart,barY+padding);context.lineTo(pushEnd-dentSize,barY+padding);context.lineTo(pushEnd,barY+barHeight/2);context.lineTo(pushEnd-dentSize,barY+barHeight-padding);context.lineTo(pushStart,barY+barHeight-padding);context.closePath();if(request.timing.pushEnd){context.fillStyle=this.entryColor(index);}else{const gradient=context.createLinearGradient(pushStart,0,pushEnd,0);gradient.addColorStop(0,this.entryColor(index));gradient.addColorStop(1,'white');context.fillStyle=gradient;}
context.globalAlpha=0.3;context.fill();context.restore();}
function drawTick(begin,end,y){const tickHeightPx=6;context.moveTo(begin,y-tickHeightPx/2);context.lineTo(begin,y+tickHeightPx/2);context.moveTo(begin,y);context.lineTo(end,y);}
context.beginPath();context.lineWidth=1;context.strokeStyle='#ccc';const lineY=Math.floor(barY+barHeight/2)+0.5;const leftTick=start+0.5;const rightTick=end-0.5;drawTick(leftTick,sendStart,lineY);drawTick(rightTick,finish,lineY);context.stroke();if(typeof request.priority==='string'){const color=this._colorForPriority(request.priority);if(color){context.fillStyle=color;context.fillRect(sendStart+0.5,barY+0.5,3.5,3.5);}}
const textStart=Math.max(sendStart,0);const textWidth=finish-textStart;const minTextWidthPx=20;if(textWidth>=minTextWidthPx){text=this.entryTitle(index)||'';if(request.fromServiceWorker){text='⚙ '+text;}
if(text){const textPadding=4;const textBaseline=5;const textBaseHeight=barHeight-textBaseline;const trimmedText=UI.UIUtils.trimTextEnd(context,text,textWidth-2*textPadding);context.fillStyle='#333';context.fillText(trimmedText,textStart+textPadding,barY+textBaseHeight);}}
return true;}
forceDecoration(index){return true;}
prepareHighlightedEntryInfo(index){const maxURLChars=80;const request=(this._requests[index]);if(!request.url){return null;}
const element=createElement('div');const root=UI.Utils.createShadowRootWithCoreStyles(element,'timeline/timelineFlamechartPopover.css');const contents=root.createChild('div','timeline-flamechart-popover');const startTime=request.getStartTime();const duration=request.endTime-startTime;if(startTime&&isFinite(duration)){contents.createChild('span','timeline-info-network-time').textContent=Number.millisToString(duration,true);}
if(typeof request.priority==='string'){const div=contents.createChild('span');div.textContent=PerfUI.NetworkPriorities.uiLabelForNetworkPriority((request.priority));div.style.color=this._colorForPriority(request.priority)||'black';}
contents.createChild('span').textContent=request.url.trimMiddle(maxURLChars);return element;}
_colorForPriority(priority){if(!this._priorityToValue){const priorities=Protocol.Network.ResourcePriority;this._priorityToValue=new Map([[priorities.VeryLow,1],[priorities.Low,2],[priorities.Medium,3],[priorities.High,4],[priorities.VeryHigh,5]]);}
const value=this._priorityToValue.get(priority);return value?`hsla(214, 80%, 50%, ${value / 5})`:null;}
_appendTimelineData(){this._minimumBoundary=this._model.minimumRecordTime();this._maximumBoundary=this._model.maximumRecordTime();this._timeSpan=this._model.isEmpty()?1000:this._maximumBoundary-this._minimumBoundary;this._model.networkRequests().forEach(this._appendEntry.bind(this));this._updateTimelineData();}
_updateTimelineData(){if(!this._timelineData){return;}
const lastTimeByLevel=[];let maxLevel=0;for(let i=0;i<this._requests.length;++i){const r=this._requests[i];const beginTime=r.beginTime();const visible=beginTime<this._endTime&&r.endTime>this._startTime;if(!visible){this._timelineData.entryLevels[i]=-1;continue;}
while(lastTimeByLevel.length&&lastTimeByLevel.peekLast()<=beginTime){lastTimeByLevel.pop();}
this._timelineData.entryLevels[i]=lastTimeByLevel.length;lastTimeByLevel.push(r.endTime);maxLevel=Math.max(maxLevel,lastTimeByLevel.length);}
for(let i=0;i<this._requests.length;++i){if(this._timelineData.entryLevels[i]===-1){this._timelineData.entryLevels[i]=maxLevel;}}
this._timelineData=new PerfUI.FlameChart.TimelineData(this._timelineData.entryLevels,this._timelineData.entryTotalTimes,this._timelineData.entryStartTimes,[this._group]);this._maxLevel=maxLevel;}
_appendEntry(request){this._requests.push(request);this._timelineData.entryStartTimes.push(request.beginTime());this._timelineData.entryTotalTimes.push(request.endTime-request.beginTime());this._timelineData.entryLevels.push(this._requests.length-1);}
preferredHeight(){return this._style.height*(this._group.expanded?Number.constrain(this._maxLevel+1,4,8.5):1);}
isExpanded(){return this._group.expanded;}
formatValue(value,precision){return Number.preciseMillisToString(value,precision);}
canJumpToEntry(entryIndex){return false;}}