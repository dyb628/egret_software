import*as Common from'../common/common.js';import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{LayerSelection,LayerView,LayerViewHost,Selection}from'./LayerViewHost.js';export const layerSymbol=Symbol('layer');export class LayerTreeOutline extends Common.ObjectWrapper.ObjectWrapper{constructor(layerViewHost){super();this._layerViewHost=layerViewHost;this._layerViewHost.registerView(this);this._treeOutline=new UI.TreeOutline.TreeOutlineInShadow();this._treeOutline.element.classList.add('layer-tree','overflow-auto');this._treeOutline.element.addEventListener('mousemove',this._onMouseMove.bind(this),false);this._treeOutline.element.addEventListener('mouseout',this._onMouseMove.bind(this),false);this._treeOutline.element.addEventListener('contextmenu',this._onContextMenu.bind(this),true);UI.ARIAUtils.setAccessibleName(this._treeOutline.contentElement,ls`Layers Tree Pane`);this._lastHoveredNode=null;this.element=this._treeOutline.element;this._layerViewHost.showInternalLayersSetting().addChangeListener(this._update,this);}
focus(){this._treeOutline.focus();}
selectObject(selection){this.hoverObject(null);const layer=selection&&selection.layer();const node=layer&&layer[layerSymbol];if(node){node.revealAndSelect(true);}else if(this._treeOutline.selectedTreeElement){this._treeOutline.selectedTreeElement.deselect();}}
hoverObject(selection){const layer=selection&&selection.layer();const node=layer&&layer[layerSymbol];if(node===this._lastHoveredNode){return;}
if(this._lastHoveredNode){this._lastHoveredNode.setHovered(false);}
if(node){node.setHovered(true);}
this._lastHoveredNode=node;}
setLayerTree(layerTree){this._layerTree=layerTree;this._update();}
_update(){const showInternalLayers=this._layerViewHost.showInternalLayersSetting().get();const seenLayers=new Map();let root=null;if(this._layerTree){if(!showInternalLayers){root=this._layerTree.contentRoot();}
if(!root){root=this._layerTree.root();}}
function updateLayer(layer){if(!layer.drawsContent()&&!showInternalLayers){return;}
if(seenLayers.get(layer)){console.assert(false,'Duplicate layer: '+layer.id());}
seenLayers.set(layer,true);let node=layer[layerSymbol];let parentLayer=layer.parent();while(parentLayer&&parentLayer!==root&&!parentLayer.drawsContent()&&!showInternalLayers){parentLayer=parentLayer.parent();}
const parent=layer===root?this._treeOutline.rootElement():parentLayer[layerSymbol];if(!parent){console.assert(false,'Parent is not in the tree');return;}
if(!node){node=new LayerTreeElement(this,layer);parent.appendChild(node);if(!layer.drawsContent()){node.expand();}}else{if(node.parent!==parent){const oldSelection=this._treeOutline.selectedTreeElement;if(node.parent){node.parent.removeChild(node);}
parent.appendChild(node);if(oldSelection!==this._treeOutline.selectedTreeElement){oldSelection.select();}}
node._update();}}
if(root){this._layerTree.forEachLayer(updateLayer.bind(this),root);}
const rootElement=this._treeOutline.rootElement();for(let node=rootElement.firstChild();node&&!node.root;){if(seenLayers.get(node._layer)){node=node.traverseNextTreeElement(false);}else{const nextNode=node.nextSibling||node.parent;node.parent.removeChild(node);if(node===this._lastHoveredNode){this._lastHoveredNode=null;}
node=nextNode;}}
if(!this._treeOutline.selectedTreeElement){const elementToSelect=this._layerTree.contentRoot()||this._layerTree.root();if(elementToSelect){elementToSelect[layerSymbol].revealAndSelect(true);}}}
_onMouseMove(event){const node=this._treeOutline.treeElementFromEvent(event);if(node===this._lastHoveredNode){return;}
this._layerViewHost.hoverObject(this._selectionForNode(node));}
_selectedNodeChanged(node){this._layerViewHost.selectObject(this._selectionForNode(node));}
_onContextMenu(event){const selection=this._selectionForNode(this._treeOutline.treeElementFromEvent(event));const contextMenu=new UI.ContextMenu.ContextMenu(event);const layer=selection&&selection.layer();if(layer){this._layerSnapshotMap=this._layerViewHost.getLayerSnapshotMap();if(this._layerSnapshotMap.has(layer)){contextMenu.defaultSection().appendItem(ls`Show Paint Profiler`,this.dispatchEventToListeners.bind(this,Events.PaintProfilerRequested,selection),false);}}
this._layerViewHost.showContextMenu(contextMenu,selection);}
_selectionForNode(node){return node&&node._layer?new LayerSelection(node._layer):null;}}
export const Events={PaintProfilerRequested:Symbol('PaintProfilerRequested')};export class LayerTreeElement extends UI.TreeOutline.TreeElement{constructor(tree,layer){super();this._treeOutline=tree;this._layer=layer;this._layer[layerSymbol]=this;this._update();}
_update(){const node=this._layer.nodeForSelfOrAncestor();const title=createDocumentFragment();title.createTextChild(node?node.simpleSelector():'#'+this._layer.id());const details=title.createChild('span','dimmed');details.textContent=Common.UIString.UIString(' (%d × %d)',this._layer.width(),this._layer.height());this.title=title;}
onselect(){this._treeOutline._selectedNodeChanged(this);return false;}
setHovered(hovered){this.listItemElement.classList.toggle('hovered',hovered);}}