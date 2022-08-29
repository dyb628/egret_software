export class HistoryEntry{valid(){}
reveal(){}}
export class SimpleHistoryManager{constructor(historyDepth){this._entries=[];this._activeEntryIndex=-1;this._coalescingReadonly=0;this._historyDepth=historyDepth;}
readOnlyLock(){++this._coalescingReadonly;}
releaseReadOnlyLock(){--this._coalescingReadonly;}
readOnly(){return!!this._coalescingReadonly;}
filterOut(filterOutCallback){if(this.readOnly()){return;}
const filteredEntries=[];let removedBeforeActiveEntry=0;for(let i=0;i<this._entries.length;++i){if(!filterOutCallback(this._entries[i])){filteredEntries.push(this._entries[i]);}else if(i<=this._activeEntryIndex){++removedBeforeActiveEntry;}}
this._entries=filteredEntries;this._activeEntryIndex=Math.max(0,this._activeEntryIndex-removedBeforeActiveEntry);}
empty(){return!this._entries.length;}
active(){return this.empty()?null:this._entries[this._activeEntryIndex];}
push(entry){if(this.readOnly()){return;}
if(!this.empty()){this._entries.splice(this._activeEntryIndex+1);}
this._entries.push(entry);if(this._entries.length>this._historyDepth){this._entries.shift();}
this._activeEntryIndex=this._entries.length-1;}
rollback(){if(this.empty()){return false;}
let revealIndex=this._activeEntryIndex-1;while(revealIndex>=0&&!this._entries[revealIndex].valid()){--revealIndex;}
if(revealIndex<0){return false;}
this.readOnlyLock();this._entries[revealIndex].reveal();this.releaseReadOnlyLock();this._activeEntryIndex=revealIndex;return true;}
rollover(){let revealIndex=this._activeEntryIndex+1;while(revealIndex<this._entries.length&&!this._entries[revealIndex].valid()){++revealIndex;}
if(revealIndex>=this._entries.length){return false;}
this.readOnlyLock();this._entries[revealIndex].reveal();this.releaseReadOnlyLock();this._activeEntryIndex=revealIndex;return true;}}