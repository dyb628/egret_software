import*as Host from'../host/host.js';import*as UI from'../ui/ui.js';export class TimelineGrid{constructor(){this.element=createElement('div');UI.Utils.appendStyle(this.element,'perf_ui/timelineGrid.css');this._dividersElement=this.element.createChild('div','resources-dividers');this._gridHeaderElement=createElement('div');this._gridHeaderElement.classList.add('timeline-grid-header');this._eventDividersElement=this._gridHeaderElement.createChild('div','resources-event-dividers');this._dividersLabelBarElement=this._gridHeaderElement.createChild('div','resources-dividers-label-bar');this.element.appendChild(this._gridHeaderElement);}
static calculateGridOffsets(calculator,freeZoneAtLeft){const minGridSlicePx=64;const clientWidth=calculator.computePosition(calculator.maximumBoundary());let dividersCount=clientWidth/minGridSlicePx;let gridSliceTime=calculator.boundarySpan()/dividersCount;const pixelsPerTime=clientWidth/calculator.boundarySpan();const logGridSliceTime=Math.ceil(Math.log(gridSliceTime)/Math.LN10);gridSliceTime=Math.pow(10,logGridSliceTime);if(gridSliceTime*pixelsPerTime>=5*minGridSlicePx){gridSliceTime=gridSliceTime/5;}
if(gridSliceTime*pixelsPerTime>=2*minGridSlicePx){gridSliceTime=gridSliceTime/2;}
const firstDividerTime=Math.ceil((calculator.minimumBoundary()-calculator.zeroTime())/gridSliceTime)*gridSliceTime+
calculator.zeroTime();let lastDividerTime=calculator.maximumBoundary();lastDividerTime+=minGridSlicePx/pixelsPerTime;dividersCount=Math.ceil((lastDividerTime-firstDividerTime)/gridSliceTime);if(!gridSliceTime){dividersCount=0;}
const offsets=[];for(let i=0;i<dividersCount;++i){const time=firstDividerTime+gridSliceTime*i;if(calculator.computePosition(time)<freeZoneAtLeft){continue;}
offsets.push({position:Math.floor(calculator.computePosition(time)),time:time});}
return{offsets:offsets,precision:Math.max(0,-Math.floor(Math.log(gridSliceTime*1.01)/Math.LN10))};}
static drawCanvasGrid(context,dividersData){context.save();context.scale(window.devicePixelRatio,window.devicePixelRatio);const height=Math.floor(context.canvas.height/window.devicePixelRatio);context.strokeStyle=self.UI.themeSupport.patchColorText('rgba(0, 0, 0, 0.1)',UI.UIUtils.ThemeSupport.ColorUsage.Foreground);context.lineWidth=1;context.translate(0.5,0.5);context.beginPath();for(const offsetInfo of dividersData.offsets){context.moveTo(offsetInfo.position,0);context.lineTo(offsetInfo.position,height);}
context.stroke();context.restore();}
static drawCanvasHeaders(context,dividersData,formatTimeFunction,paddingTop,headerHeight,freeZoneAtLeft){context.save();context.scale(window.devicePixelRatio,window.devicePixelRatio);const width=Math.ceil(context.canvas.width/window.devicePixelRatio);context.beginPath();context.fillStyle=self.UI.themeSupport.patchColorText('rgba(255, 255, 255, 0.5)',UI.UIUtils.ThemeSupport.ColorUsage.Background);context.fillRect(0,0,width,headerHeight);context.fillStyle=self.UI.themeSupport.patchColorText('#333',UI.UIUtils.ThemeSupport.ColorUsage.Foreground);context.textBaseline='hanging';context.font='11px '+Host.Platform.fontFamily();const paddingRight=4;for(const offsetInfo of dividersData.offsets){const text=formatTimeFunction(offsetInfo.time);const textWidth=context.measureText(text).width;const textPosition=offsetInfo.position-textWidth-paddingRight;if(!freeZoneAtLeft||freeZoneAtLeft<textPosition){context.fillText(text,textPosition,paddingTop);}}
context.restore();}
get dividersElement(){return this._dividersElement;}
get dividersLabelBarElement(){return this._dividersLabelBarElement;}
removeDividers(){this._dividersElement.removeChildren();this._dividersLabelBarElement.removeChildren();}
updateDividers(calculator,freeZoneAtLeft){const dividersData=TimelineGrid.calculateGridOffsets(calculator,freeZoneAtLeft);const dividerOffsets=dividersData.offsets;const precision=dividersData.precision;const dividersElementClientWidth=this._dividersElement.clientWidth;let divider=(this._dividersElement.firstChild);let dividerLabelBar=(this._dividersLabelBarElement.firstChild);for(let i=0;i<dividerOffsets.length;++i){if(!divider){divider=createElement('div');divider.className='resources-divider';this._dividersElement.appendChild(divider);dividerLabelBar=createElement('div');dividerLabelBar.className='resources-divider';const label=createElement('div');label.className='resources-divider-label';dividerLabelBar._labelElement=label;dividerLabelBar.appendChild(label);this._dividersLabelBarElement.appendChild(dividerLabelBar);}
const time=dividerOffsets[i].time;const position=dividerOffsets[i].position;dividerLabelBar._labelElement.textContent=calculator.formatValue(time,precision);const percentLeft=100*position/dividersElementClientWidth;divider.style.left=percentLeft+'%';dividerLabelBar.style.left=percentLeft+'%';divider=(divider.nextSibling);dividerLabelBar=(dividerLabelBar.nextSibling);}
while(divider){const nextDivider=divider.nextSibling;this._dividersElement.removeChild(divider);divider=nextDivider;}
while(dividerLabelBar){const nextDivider=dividerLabelBar.nextSibling;this._dividersLabelBarElement.removeChild(dividerLabelBar);dividerLabelBar=nextDivider;}
return true;}
addEventDivider(divider){this._eventDividersElement.appendChild(divider);}
addEventDividers(dividers){this._gridHeaderElement.removeChild(this._eventDividersElement);for(const divider of dividers){this._eventDividersElement.appendChild(divider);}
this._gridHeaderElement.appendChild(this._eventDividersElement);}
removeEventDividers(){this._eventDividersElement.removeChildren();}
hideEventDividers(){this._eventDividersElement.classList.add('hidden');}
showEventDividers(){this._eventDividersElement.classList.remove('hidden');}
hideDividers(){this._dividersElement.classList.add('hidden');}
showDividers(){this._dividersElement.classList.remove('hidden');}
setScrollTop(scrollTop){this._dividersLabelBarElement.style.top=scrollTop+'px';this._eventDividersElement.style.top=scrollTop+'px';}}
export class Calculator{computePosition(time){}
formatValue(time,precision){}
minimumBoundary(){}
zeroTime(){}
maximumBoundary(){}
boundarySpan(){}}
export let DividersData;