export class WorkerWrapper{constructor(appName){let url=appName+'.js';url+=Root.Runtime.queryParamsString();this._workerPromise=new Promise(fulfill=>{const worker=new Worker(url,{type:'module'});worker.onmessage=event=>{console.assert(event.data==='workerReady');worker.onmessage=null;fulfill(worker);};});}
postMessage(message){this._workerPromise.then(worker=>{if(!this._disposed){worker.postMessage(message);}});}
dispose(){this._disposed=true;this._workerPromise.then(worker=>worker.terminate());}
terminate(){this.dispose();}
set onmessage(listener){this._workerPromise.then(worker=>worker.onmessage=listener);}
set onerror(listener){this._workerPromise.then(worker=>worker.onerror=listener);}}