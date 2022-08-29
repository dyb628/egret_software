import*as Common from'../../common/common.js';import{Events as ViewEvents,GraphView}from'./GraphView.js';export class GraphManager extends Common.ObjectWrapper.ObjectWrapper{constructor(){super();this._graphMapByContextId=new Map();}
createContext(contextId){const graph=new GraphView(contextId);graph.addEventListener(ViewEvents.ShouldRedraw,this._notifyShouldRedraw,this);this._graphMapByContextId.set(contextId,graph);}
destroyContext(contextId){if(!this._graphMapByContextId.has(contextId)){return;}
const graph=this._graphMapByContextId.get(contextId);graph.removeEventListener(ViewEvents.ShouldRedraw,this._notifyShouldRedraw,this);this._graphMapByContextId.delete(contextId);}
hasContext(contextId){return this._graphMapByContextId.has(contextId);}
clearGraphs(){this._graphMapByContextId.clear();}
getGraph(contextId){return this._graphMapByContextId.get(contextId);}
_notifyShouldRedraw(event){const graph=(event.data);this.dispatchEventToListeners(ViewEvents.ShouldRedraw,graph);}}