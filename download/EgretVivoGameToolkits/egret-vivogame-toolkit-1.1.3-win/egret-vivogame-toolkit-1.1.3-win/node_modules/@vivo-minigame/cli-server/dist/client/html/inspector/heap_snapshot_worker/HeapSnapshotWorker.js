import{HeapSnapshotWorkerDispatcher}from'./HeapSnapshotWorkerDispatcher.js';function postMessageWrapper(message){postMessage(message);}
const dispatcher=new HeapSnapshotWorkerDispatcher(self,postMessageWrapper);function installMessageEventListener(listener){self.addEventListener('message',listener,false);}
installMessageEventListener(dispatcher.dispatchMessage.bind(dispatcher));