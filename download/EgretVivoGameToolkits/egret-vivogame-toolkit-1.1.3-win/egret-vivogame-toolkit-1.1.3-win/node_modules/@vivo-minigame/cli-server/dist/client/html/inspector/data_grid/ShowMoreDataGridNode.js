import*as Common from'../common/common.js';import{DataGridNode}from'./DataGrid.js';export class ShowMoreDataGridNode extends DataGridNode{constructor(callback,startPosition,endPosition,chunkSize){super({summaryRow:true},false);this._callback=callback;this._startPosition=startPosition;this._endPosition=endPosition;this._chunkSize=chunkSize;this.showNext=createElement('button');this.showNext.setAttribute('type','button');this.showNext.addEventListener('click',this._showNextChunk.bind(this),false);this.showNext.textContent=Common.UIString.UIString('Show %d before',this._chunkSize);this.showAll=createElement('button');this.showAll.setAttribute('type','button');this.showAll.addEventListener('click',this._showAll.bind(this),false);this.showLast=createElement('button');this.showLast.setAttribute('type','button');this.showLast.addEventListener('click',this._showLastChunk.bind(this),false);this.showLast.textContent=Common.UIString.UIString('Show %d after',this._chunkSize);this._updateLabels();this.selectable=false;}
_showNextChunk(){this._callback(this._startPosition,this._startPosition+this._chunkSize);}
_showAll(){this._callback(this._startPosition,this._endPosition);}
_showLastChunk(){this._callback(this._endPosition-this._chunkSize,this._endPosition);}
_updateLabels(){const totalSize=this._endPosition-this._startPosition;if(totalSize>this._chunkSize){this.showNext.classList.remove('hidden');this.showLast.classList.remove('hidden');}else{this.showNext.classList.add('hidden');this.showLast.classList.add('hidden');}
this.showAll.textContent=Common.UIString.UIString('Show all %d',totalSize);}
createCells(element){this._hasCells=false;super.createCells(element);}
createCell(columnIdentifier){const cell=this.createTD(columnIdentifier);cell.classList.add('show-more');if(!this._hasCells){this._hasCells=true;if(this.depth){cell.style.setProperty('padding-left',(this.depth*this.dataGrid.indentWidth)+'px');}
cell.appendChild(this.showNext);cell.appendChild(this.showAll);cell.appendChild(this.showLast);}
return cell;}
setStartPosition(from){this._startPosition=from;this._updateLabels();}
setEndPosition(to){this._endPosition=to;this._updateLabels();}
nodeSelfHeight(){return 40;}
dispose(){}}